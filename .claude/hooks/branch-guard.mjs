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

// Badi - Branch Guard (PreToolUse - Bash)
// Blocks direct commit operations on protected branches.
// A push is treated as a post-merge publish and is not blocked.

import {
	appendLog,
	currentBranch,
	incidentLine,
	logPath,
	readStdinJson,
	writeDecision,
} from "./_util.mjs";

const input = await readStdinJson();
const command = input.tool_input?.command || "";
if (!command) process.exit(0);

const branch = currentBranch();

// Force push: block on main/master/release/* branches
// --force | --force-with-lease | -f flag (finding #8).
if (/git\s+push.*(--force\b|\s-f\b)/.test(command)) {
	if (branch === "main" || branch === "master" || /^release\//.test(branch)) {
		appendLog(
			logPath("incident-log.md"),
			incidentLine(
				"BRANCH-GUARD",
				"BLOCK",
				`force push to '${branch}' blocked`,
			),
		);
		writeDecision(
			"block",
			`'${branch}' is a protected branch; force push is not allowed.`,
		);
		process.exit(0);
	}
}

// Only block the git commit command on protected branches
if (!/git\s+commit\b/.test(command)) process.exit(0);

// Do not block merge commits — git merge already creates a commit automatically
if (/git\s+merge\b/.test(command)) process.exit(0);

if (!branch) process.exit(0);

const protectedBranches = ["main", "master", "production"];
if (protectedBranches.includes(branch)) {
	appendLog(
		logPath("incident-log.md"),
		incidentLine(
			"BRANCH-GUARD",
			"BLOCK",
			`direct commit to '${branch}' blocked: ${command}`,
		),
	);
	writeDecision(
		"block",
		`'${branch}' is a protected branch. Direct commits are not allowed. Switch to a feature branch: git checkout -b feature/name`,
	);
	process.exit(0);
}

process.exit(0);
