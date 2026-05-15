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

// Badi - Bagimlilik Denetimi (SessionStart - New)
// 24 saat cache ile oturum basinda guvenlik taramasi.

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
} from "./_util.mjs";

const root = projectRoot();
// XDG_CONFIG_HOME-aware (bulgu #10).
const cacheDirPath = configDir("badi");
const cacheFile = join(cacheDirPath, "dep-audit-cache.json");
mkdirSync(cacheDirPath, { recursive: true });

// Paket yoneticisi tespit
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

// Lock dosyasi hash
let lockHash = "";
try {
	const h = createHash("md5");
	h.update(readFileSync(lockFile));
	lockHash = h.digest("hex");
} catch {
	lockHash = "unknown";
}

// Cache kontrolu (24 saat + lock dosyasi hash)
if (existsSync(cacheFile)) {
	try {
		const cache = JSON.parse(readFileSync(cacheFile, "utf-8"));
		if (cache.lastCheck && cache.lockHash === lockHash) {
			const cachedEpoch = new Date(cache.lastCheck).getTime();
			const diff = Date.now() - cachedEpoch;
			if (diff < 86400 * 1000) process.exit(0);
		}
	} catch {
		/* cache bozuk, devam */
	}
}

// Audit calistir
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
	/* audit basarisiz, sayilari 0 birak */
}

// Cache kaydet
writeFileSync(
	cacheFile,
	`${JSON.stringify({
		lastCheck: isoTimestamp(),
		lockHash,
		critical,
		high,
		manager,
	})}\n`,
	"utf-8",
);

const ts = timestamp();
appendLog(
	logPath("dependency-audit.md"),
	`- \`${ts}\` | ${manager} | Kritik: ${critical} | Yuksek: ${high}`,
);

if (critical > 0) {
	process.stdout.write(
		`UYARI: ${critical} kritik guvenlik acigi! Duzelt: ${manager} audit fix\n`,
	);
	appendLog(
		logPath("incident-log.md"),
		incidentLine(
			"DEPENDENCY-AUDIT",
			"CRITICAL",
			`${critical} kritik guvenlik acigi`,
		),
	);
} else if (high > 0) {
	process.stdout.write(
		`Bilgi: ${high} yuksek oncelikli guvenlik acigi. Detay: ${manager} audit\n`,
	);
}

process.exit(0);
