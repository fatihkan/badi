#!/usr/bin/env node
// Badi - Kullanim Takip Hook'u (PostToolUse - Async)
// Her arac kullanimini usage.jsonl'e kaydeder. Cross-platform Node.js.

import {
	appendLog,
	isoTimestamp,
	logPath,
	readStdinJson,
} from "../../lib/hooks/util.js";

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
