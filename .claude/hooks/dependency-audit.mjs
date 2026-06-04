#!/usr/bin/env node
// Badi v1.27+ defensive fail-safe (#162): runtime errors -> exit 0; set BADI_HOOK_DEBUG=1 for stderr.
const _badiFailSafe = (e) => {
	if (process.env.BADI_HOOK_DEBUG) {
		try {
			process.stderr.write(`[badi-hook] ${e?.message || e}\n`);
		} catch {}
	}
	process.exit(0);
};
process.on("uncaughtException", _badiFailSafe);
process.on("unhandledRejection", _badiFailSafe);

// Badi - Dependency Audit (SessionStart - New)
// Security scan at session start with a 24-hour cache.

import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	appendLog,
	configDir,
	incidentLine,
	isoTimestamp,
	logPath,
	projectRoot,
	timestamp,
	writeContextInjection,
} from "./_util.mjs";

const root = projectRoot();
// XDG_CONFIG_HOME-aware (finding #10).
const cacheDirPath = configDir("badi");
const cacheFile = join(cacheDirPath, "dep-audit-cache.json");
mkdirSync(cacheDirPath, { recursive: true });

// Detect the package manager
let manager = "";
let lockFile = "";
if (existsSync(join(root, "package-lock.json"))) {
	manager = "npm";
	lockFile = join(root, "package-lock.json");
} else if (existsSync(join(root, "yarn.lock"))) {
	manager = "yarn";
	lockFile = join(root, "yarn.lock");
} else if (existsSync(join(root, "pnpm-lock.yaml"))) {
	manager = "pnpm";
	lockFile = join(root, "pnpm-lock.yaml");
} else {
	process.exit(0);
}

// Lock file hash
let lockHash = "";
try {
	const h = createHash("md5");
	h.update(readFileSync(lockFile));
	lockHash = h.digest("hex");
} catch {
	lockHash = "unknown";
}

// Cache check (24 hours + lock file hash)
// v1.31.0+ D1 hotfix: added lastInjectedAt to the cache — the audit cache is fresh, but
// Do not re-inject if the message is younger than 1 hour (reduce Claude context noise).
let cachedInjectAt = 0;
if (existsSync(cacheFile)) {
	try {
		const cache = JSON.parse(readFileSync(cacheFile, "utf-8"));
		cachedInjectAt = cache.lastInjectedAt || 0;
		if (cache.lastCheck && cache.lockHash === lockHash) {
			const cachedEpoch = new Date(cache.lastCheck).getTime();
			const diff = Date.now() - cachedEpoch;
			if (diff < 86400 * 1000) process.exit(0);
		}
	} catch {
		/* cache corrupt, continue */
	}
}

// Run the audit
let critical = 0;
let high = 0;
try {
	let auditOut;
	if (manager === "npm") {
		auditOut = execSync("npm audit --json", {
			encoding: "utf-8",
			cwd: root,
			stdio: ["ignore", "pipe", "ignore"],
		});
		const parsed = JSON.parse(auditOut || "{}");
		critical = parsed.metadata?.vulnerabilities?.critical || 0;
		high = parsed.metadata?.vulnerabilities?.high || 0;
	} else if (manager === "yarn") {
		auditOut = execSync("yarn audit --json", {
			encoding: "utf-8",
			cwd: root,
			stdio: ["ignore", "pipe", "ignore"],
		});
		const lines = auditOut.split("\n").filter(Boolean);
		const last = JSON.parse(lines[lines.length - 1] || "{}");
		critical = last.data?.vulnerabilities?.critical || 0;
		high = last.data?.vulnerabilities?.high || 0;
	} else if (manager === "pnpm") {
		auditOut = execSync("pnpm audit --json", {
			encoding: "utf-8",
			cwd: root,
			stdio: ["ignore", "pipe", "ignore"],
		});
		const parsed = JSON.parse(auditOut || "{}");
		critical = parsed.metadata?.vulnerabilities?.critical || 0;
		high = parsed.metadata?.vulnerabilities?.high || 0;
	}
} catch {
	/* audit failed, leave the counts at 0 */
}

// D1 hotfix: skip if the inject message is younger than 1 hour to avoid context noise
const shouldInject = Date.now() - cachedInjectAt > 3600 * 1000;
const nowMs = Date.now();

// Save the cache (lastInjectedAt is only updated when we inject)
writeFileSync(
	cacheFile,
	`${JSON.stringify({
		lastCheck: isoTimestamp(),
		lockHash,
		critical,
		high,
		manager,
		lastInjectedAt:
			shouldInject && (critical > 0 || high > 0) ? nowMs : cachedInjectAt,
	})}\n`,
	"utf-8",
);

const ts = timestamp();
appendLog(
	logPath("dependency-audit.md"),
	`- \`${ts}\` | ${manager} | Critical: ${critical} | High: ${high}`,
);

// Inject additionalContext into Claude with the finding counts
// (v1.31.0 fix: Anthropic 2.1.139 hook terminal-isolation compliance —
//  old plain-text stdout never reached context; it went to the terminal).
// D1 hotfix: do not re-inject when a message younger than 1 hour exists.
if (critical > 0) {
	appendLog(
		logPath("incident-log.md"),
		incidentLine(
			"DEPENDENCY-AUDIT",
			"CRITICAL",
			`${critical} critical vulnerabilities`,
		),
	);
	if (shouldInject) {
		writeContextInjection(
			`[badi:dependency-audit] WARNING: ${critical} critical vulnerabilities detected. To fix: \`${manager} audit fix\``,
		);
	}
} else if (high > 0 && shouldInject) {
	writeContextInjection(
		`[badi:dependency-audit] Info: ${high} high-priority vulnerabilities. Details: \`${manager} audit\``,
	);
}

process.exit(0);
