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
	branchOf,
	effectiveBranchForCommit,
	incidentLine,
	isGitCommit,
	logPath,
	readStdinJson,
	resolveTargetDir,
	stripHeredocs,
	writeDecision,
} from "./_util.mjs";

const input = await readStdinJson();
const command = input.tool_input?.command || "";
if (!command) process.exit(0);

// Evaluate the repo the command actually targets (cd/git -C), not just the
// hook's own cwd — and ignore heredoc bodies when scanning for operations.
const baseDir = input.cwd || process.cwd();
const targetDir = resolveTargetDir(command, baseDir);
const baseBranch = branchOf(targetDir);
const scan = stripHeredocs(command);

// Force push: block on main/master/release/* branches
// --force | --force-with-lease | -f flag (finding #8).
if (/git\s+push.*(--force\b|\s-f\b)/.test(scan)) {
	if (
		baseBranch === "main" ||
		baseBranch === "master" ||
		/^release\//.test(baseBranch)
	) {
		appendLog(
			logPath("incident-log.md"),
			incidentLine(
				"BRANCH-GUARD",
				"BLOCK",
				`force push to '${baseBranch}' blocked`,
			),
		);
		writeDecision(
			"block",
			`'${baseBranch}' is a protected branch; force push is not allowed.`,
		);
		process.exit(0);
	}
}

// Only block the git commit command on protected branches (heredoc bodies
// stripped; tolerates git global options like `-C <path>` before `commit`).
if (!isGitCommit(scan)) process.exit(0);

// Do not block merge commits — git merge already creates a commit automatically
if (/git\s+merge\b/.test(scan)) process.exit(0);

// The branch the commit would actually land on: a `git switch -c`/`checkout -b`
// earlier in the same compound command takes effect before the commit.
const branch = effectiveBranchForCommit(command, baseBranch);
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
