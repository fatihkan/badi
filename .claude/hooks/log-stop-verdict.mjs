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

// Badi - Stop Verdict Log (Stop Hook - Async)
// Records end-of-session decisions and learnings.

import {
	appendFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
	appendLog,
	logPath,
	projectRoot,
	readStdinJson,
	shorten,
	timestamp,
} from "./_util.mjs";

const input = await readStdinJson();
const ts = timestamp();
const root = projectRoot();
const counterFile = join(root, ".claude", "hooks", "__counter");
const qualityGateFile = join(root, ".claude", "hooks", "quality-gate-active");

let blockCount = 0;
if (existsSync(counterFile)) {
	try {
		blockCount =
			Number.parseInt(readFileSync(counterFile, "utf-8").trim(), 10) || 0;
	} catch {
		/* no-op */
	}
}

const decision = input.decision || "unknown";
const reason = input.reason || "";
const learning = input.learning || "";

appendLog(
	logPath("verdicts.jsonl"),
	JSON.stringify({ timestamp: ts, decision, reason, learning }),
);

if (decision === "block") {
	blockCount += 1;
	mkdirSync(join(root, ".claude", "hooks"), { recursive: true });
	writeFileSync(counterFile, String(blockCount), "utf-8");
	appendLog(
		logPath("incident-log.md"),
		`- \`${ts}\` | STOP-VERDICT | BLOCK | ${shorten(reason, 150)}`,
	);
}

if (blockCount >= 2) {
	mkdirSync(join(root, ".claude", "hooks"), { recursive: true });
	writeFileSync(qualityGateFile, "", "utf-8");
	appendLog(
		logPath("incident-log.md"),
		`- \`${ts}\` | QUALITY-GATE | WARN | Quality gate activated (${blockCount} blocks)`,
	);
}

if (learning && learning !== "null") {
	const nominationsFile = join(root, ".claude", "knowledge-nominations.md");
	try {
		mkdirSync(join(root, ".claude"), { recursive: true });
		appendFileSync(nominationsFile, `\n- \`${ts}\` | ${learning}\n`, "utf-8");
	} catch {
		/* no-op */
	}
}

process.exit(0);
