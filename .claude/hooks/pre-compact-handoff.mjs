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

// Badi - Pre-Compaction State Save (PreCompact)
// Saves state before automatic compaction.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	appendLog,
	incidentLine,
	logPath,
	projectRoot,
	timestamp,
} from "./_util.mjs";

const root = projectRoot();
const claudeDir = join(root, ".claude");
mkdirSync(claudeDir, { recursive: true });

const ts = timestamp();
writeFileSync(join(claudeDir, ".compaction-occurred"), ts, "utf-8");

appendLog(
	logPath("incident-log.md"),
	incidentLine(
		"COMPACTION",
		"INFO",
		"Automatic compaction triggered — state saved",
	),
);
process.exit(0);
