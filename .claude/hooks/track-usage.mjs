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

// Badi - Kullanim Takip Hook'u (PostToolUse - Async)
// Her arac kullanimini usage.jsonl'e kaydeder. Cross-platform Node.js.

import { appendLog, isoTimestamp, logPath, readStdinJson } from "./_util.mjs";

const input = await readStdinJson();
const tool = input.tool_name || "unknown";

let command = "";
let subcommand = "";
const fullCmd = input.tool_input?.command || "";
if (fullCmd.includes("badi")) {
	command = "badi";
	const m = fullCmd.match(/badi\s+([a-z-]+)/);
	if (m) subcommand = m[1];
}

const entry = {
	timestamp: isoTimestamp(),
	tool,
	command,
	subcommand,
	exit_code: 0,
};

appendLog(logPath("usage.jsonl"), JSON.stringify(entry));
process.exit(0);
