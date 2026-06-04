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
import { dirname, join } from "node:path";

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
 * Current git branch (HEAD). Empty string if none.
 */
export function currentBranch() {
	try {
		return execFileSync("git", ["branch", "--show-current"], {
			encoding: "utf-8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
	} catch {
		return "";
	}
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
