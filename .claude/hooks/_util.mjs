// Badi hook utility module — cross-platform replacement for bash hooks.
//
// This file lives in the hook directory as .claude/hooks/_util.mjs
// because for npm-installed users hooks sit at `<project>/.claude/hooks/X.mjs`
// and cannot reach `lib/hooks/util.js` (the package lives in node_modules).
// Kept self-contained: the './_util.mjs' import path always resolves.
//
// Zero external dependencies. Reads JSON stdin, creates log directories,
// detects the project root. All hooks share this module.

import { execFileSync } from "node:child_process";
import {
	appendFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	renameSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

/**
 * Read JSON from stdin — Claude Code hook input.
 * Returns an empty object on error; hooks must always exit 0.
 */
export async function readStdinJson() {
	let raw = "";
	for await (const chunk of process.stdin) {
		raw += chunk;
	}
	if (!raw.trim()) return {};
	try {
		return JSON.parse(raw);
	} catch {
		return {};
	}
}

/**
 * Date stamp. Format: '2026-05-10 14:30:45'
 */
export function timestamp() {
	const d = new Date();
	const pad = (n) => String(n).padStart(2, "0");
	return (
		`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
		`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
	);
}

/**
 * UTC ISO timestamp: '2026-05-10T14:30:45Z'
 */
export function isoTimestamp() {
	return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

// Module-level cache: a hook process runs once, and projectRoot does not
// change. Avoids re-spawning git across multiple logPath()/projectRoot()
// calls (review finding #3).
let _projectRootCache = null;

/**
 * Detect the project root. git rev-parse --show-toplevel; falls back to cwd.
 * Memoized.
 */
export function projectRoot() {
	if (_projectRootCache !== null) return _projectRootCache;
	try {
		_projectRootCache = execFileSync("git", ["rev-parse", "--show-toplevel"], {
			encoding: "utf-8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
	} catch {
		_projectRootCache = process.cwd();
	}
	return _projectRootCache;
}

/**
 * Git branch (HEAD) of a specific directory. Empty string if none/not a repo.
 * @param {string} [dir] working directory; defaults to the process cwd.
 */
export function branchOf(dir) {
	try {
		return execFileSync("git", ["branch", "--show-current"], {
			encoding: "utf-8",
			stdio: ["ignore", "pipe", "ignore"],
			...(dir ? { cwd: dir } : {}),
		}).trim();
	} catch {
		return "";
	}
}

/**
 * Current git branch (HEAD) of the process cwd. Empty string if none.
 */
export function currentBranch() {
	return branchOf();
}

// ─── Shell command analysis (branch-guard cwd/cd awareness) ───
// Pure, exported for testing. branch-guard used to flat-regex the raw command
// against the PROCESS branch evaluated once — so it (a) blocked legit commits
// where a `git switch -c` precedes the commit in the same compound command,
// (b) tripped on `git commit` text inside a heredoc body, and (c) checked the
// wrong repo when the command targets another dir via `cd`/`git -C`.

/**
 * Remove heredoc bodies from a command so text inside a commit-message heredoc
 * (e.g. a literal "git commit" line) is not mistaken for an operation. The
 * command text BEFORE the `<<` on the opening line is kept (so a real
 * `git commit -F - <<'EOF'` is still detected).
 * @param {string} command
 * @returns {string}
 */
export function stripHeredocs(command) {
	const lines = String(command || "").split("\n");
	const out = [];
	let tag = null;
	for (const line of lines) {
		if (tag) {
			if (line.trim() === tag) tag = null; // body terminator — drop it too
			continue;
		}
		// `<<TAG` heredoc opener — but NOT the `<<<` here-string operator
		// (matching inside `<<<` would swallow the rest of the command and let a
		// later `git commit` slip past the guard). Lookbehind/ahead reject a 3rd `<`.
		const m = line.match(/(?<!<)<<-?(?!<)\s*['"]?([A-Za-z_]\w*)['"]?/);
		if (m) {
			tag = m[1];
			out.push(line.slice(0, m.index));
			continue;
		}
		out.push(line);
	}
	return out.join("\n");
}

/**
 * Split a command into top-level segments on &&, ||, ;, |, and newlines.
 * `||` is matched before `|` so it is not split twice. Best-effort (does not
 * parse quotes/subshells); callers fall back to conservative behavior.
 * @param {string} command
 * @returns {string[]}
 */
export function splitSegments(command) {
	return String(command || "")
		.split(/&&|\|\||;|\n|\|/)
		.map((s) => s.trim())
		.filter(Boolean);
}

/**
 * Resolve the directory a git command actually targets: `git -C <path>`, else a
 * leading `cd`/`pushd <path>`, else baseDir. A path that doesn't exist falls
 * back to baseDir (fail-closed: evaluate the base repo rather than guess).
 * @param {string} command
 * @param {string} baseDir
 * @returns {string}
 */
export function resolveTargetDir(command, baseDir) {
	const base = baseDir || process.cwd();
	const stripped = stripHeredocs(command);
	const gc = stripped.match(/\bgit\s+-C\s+(['"]?)([^\s'"]+)\1/);
	if (gc) {
		const p = resolve(base, gc[2]);
		return existsSync(p) ? p : base;
	}
	const cd = stripped.match(/^\s*(?:cd|pushd)\s+(['"]?)([^\s'"&|;]+)\1/);
	if (cd) {
		const p = resolve(base, cd[2]);
		return existsSync(p) ? p : base;
	}
	return base;
}

/**
 * True if `text` invokes `git commit`, tolerating git global options between
 * `git` and the subcommand (e.g. `git -C <path> commit`, `git -c k=v commit`,
 * `git --no-pager commit`). A plain substring/`git\s+commit` test misses the
 * `-C <path>` form used to target another repo.
 * @param {string} text
 * @returns {boolean}
 */
export function isGitCommit(text) {
	return /\bgit\s+(?:-C\s+\S+\s+|-c\s+\S+\s+|--[\w-]+(?:=\S+)?\s+)*commit\b/.test(
		String(text || ""),
	);
}

/**
 * The branch a `git commit` in this command would land on: start from
 * baseBranch and apply any `git switch`/`checkout` (incl. `-c`/`-b` creation)
 * that appears BEFORE the commit segment. Heredoc bodies are stripped first.
 * @param {string} command
 * @param {string} baseBranch  branch of the target dir at invocation time
 * @returns {string}
 */
export function effectiveBranchForCommit(command, baseBranch) {
	const segs = splitSegments(stripHeredocs(command));
	let tracked = baseBranch;
	for (const seg of segs) {
		if (isGitCommit(seg)) break; // evaluate as of the commit
		// Track switch/checkout to a branch before the commit. Handles create
		// flags (-c/-C/-b/-B/--create), and quoted branch names that contain
		// spaces ("feat space") which an unquoted [^\s] capture would truncate.
		const m = seg.match(
			/\bgit\s+(?:switch|checkout)\s+(?:-[cCbB]\s+|--create\s+)?(?!-)(?:"([^"]+)"|'([^']+)'|(\S+))/,
		);
		if (m) tracked = m[1] || m[2] || m[3];
	}
	return tracked;
}

/**
 * Returns the log directory and file path, creating the directory if missing.
 */
export function logPath(filename) {
	const dir = join(projectRoot(), ".claude", "logs");
	mkdirSync(dir, { recursive: true });
	return join(dir, filename);
}

/**
 * Append a line to the log file (automatic newline). Fail silently on error.
 */
export function appendLog(file, line) {
	try {
		mkdirSync(dirname(file), { recursive: true });
		appendFileSync(file, `${line}\n`, "utf-8");
	} catch {
		/* no-op */
	}
}

/**
 * Standard format for the incident log:
 * `- \`<timestamp>\` | <prefix> | <severity> | <message>`
 */
export function incidentLine(prefix, severity, message) {
	return `- \`${timestamp()}\` | ${prefix} | ${severity} | ${message}`;
}

/**
 * Write a decision JSON response (stdout) — sent to Claude Code.
 *
 * { decision: "block" | "allow", reason: string }
 */
export function writeDecision(decision, reason) {
	process.stdout.write(`${JSON.stringify({ decision, reason })}\n`);
}

/**
 * UserPromptSubmit hook output: write additionalContext.
 */
export function writeContextInjection(text) {
	process.stdout.write(
		`${JSON.stringify({
			hookSpecificOutput: {
				hookEventName: "UserPromptSubmit",
				additionalContext: text,
			},
		})}\n`,
	);
}

/**
 * Return the file line count. 0 if missing.
 * Normalizes CRLF/LF; a trailing empty line is not counted (finding #5).
 */
export function lineCount(file) {
	if (!existsSync(file)) return 0;
	try {
		const content = readFileSync(file, "utf-8");
		if (content.length === 0) return 0;
		const matches = content.match(/\n/g);
		const newlines = matches ? matches.length : 0;
		// If the last character is \n, line count = \n count
		// Otherwise the last line adds +1
		return content.endsWith("\n") ? newlines : newlines + 1;
	} catch {
		return 0;
	}
}

/**
 * Truncate a log file to the last N lines. Atomic: write to a tmp file, then rename.
 * No partial write during a crash (finding #4).
 */
export function truncateLog(file, maxLines, keepLines) {
	if (!existsSync(file)) return false;
	try {
		const content = readFileSync(file, "utf-8");
		const lines = content.split("\n");
		if (lines.length <= maxLines) return false;
		const kept = lines.slice(-keepLines).join("\n");
		const tmp = `${file}.tmp.${process.pid}`;
		writeFileSync(tmp, kept, "utf-8");
		renameSync(tmp, file);
		return true;
	} catch {
		return false;
	}
}

/**
 * Take the first N characters of a string + turn newlines into spaces.
 */
export function shorten(str, max = 200) {
	return String(str || "")
		.replace(/[\r\n]+/g, " ")
		.slice(0, max);
}

/**
 * True if the file was last modified N+ days ago. mtime-based.
 */
export function olderThan(filePath, days) {
	try {
		const ms = Date.now() - statSync(filePath).mtimeMs;
		return ms > days * 86400 * 1000;
	} catch {
		return false;
	}
}

/**
 * Is the command on PATH? Pure PATH probe — instead of the shell built-in
 * 'command -v' (not executable on Linux, finding #2).
 *
 * Windows: PATHEXT (.exe/.cmd/.bat) + PATH; Unix: PATH.
 * Identical to lib/platform.js commandExists.
 */
export function commandAvailable(cmd) {
	const isWindows = process.platform === "win32";
	const PATH = process.env.PATH || process.env.Path || "";
	const sep = isWindows ? ";" : ":";
	const exts = isWindows
		? (process.env.PATHEXT || ".COM;.EXE;.BAT;.CMD").split(";")
		: [""];
	for (const dir of PATH.split(sep)) {
		if (!dir) continue;
		for (const ext of exts) {
			const candidate = `${dir}${isWindows ? "\\" : "/"}${cmd}${ext}`;
			if (existsSync(candidate)) return true;
		}
	}
	return false;
}

/**
 * XDG_CONFIG_HOME-aware config directory. The standard path on Linux/Mac/
 * Windows (finding #10). Falls back to homedir/.config when the env is unset.
 */
export function configDir(app) {
	const base = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
	return join(base, app);
}
