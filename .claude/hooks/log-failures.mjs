#!/usr/bin/env node
// Badi - Hata Kaydi (PostToolUseFailure - Async)
// Arac hatalarini kategorize edip kaydeder.

import {
	appendLog,
	logPath,
	readStdinJson,
	shorten,
	timestamp,
} from "./_util.mjs";

const input = await readStdinJson();
const tool = input.tool_name || "unknown";
const error = input.error || "unknown error";

const ts = timestamp();
const errLower = error.toLowerCase();

let category = "OTHER";
let severity = "WARN";

if (/enoent|not found|no such file/.test(errLower)) {
	category = "FILESYSTEM";
	severity = "WARN";
} else if (/econnrefused|etimedout|network|fetch/.test(errLower)) {
	category = "NETWORK";
	severity = "ERROR";
} else if (/eacces|permission|denied|forbidden/.test(errLower)) {
	category = "PERMISSION";
	severity = "ERROR";
} else if (/build|compile|syntax|parse/.test(errLower)) {
	category = "BUILD";
	severity = "ERROR";
} else if (/api|rate.limit|401|403|429|500/.test(errLower)) {
	category = "API";
	severity = "ERROR";
}

const shortError = shorten(error, 200);

appendLog(
	logPath("failure-log.md"),
	`- \`${ts}\` | ${severity} | ${category} | ${tool} | ${shortError}`,
);

if (severity === "ERROR" || severity === "CRITICAL") {
	appendLog(
		logPath("incident-log.md"),
		`- \`${ts}\` | FAILURE | ${severity} | ${category}: ${tool} - ${shortError}`,
	);
}
process.exit(0);
