// Badi help-doctor — detects help-drift in command files.
//
// Drift: a subcommand or flag accepted by the parser
// does not appear in the --help text shown to the user.
//
// Method (heuristic, no AST):
//   1. Extract parser-side subcommands from the source
//      (`case "x":`, `args[0] === "x"`, `sub === "x"`)
//   2. Extract parser-side flags from the source
//      (literal "--xxx" strings)
//   3. find the body of the --help / -h handler (showHelp() or inline)
//   4. Compare, report what's missing
//
// Being a heuristic, it has a false-positive surface:
//   - String values (format choice, severity, etc.) may be mistaken for subcommands
//   - "--xxx" inside a regex pattern may be mistaken for a flag
//   - When the help body is split into an external function (showHelp), the whole file is the body
// Allowlist mechanism: per-file exceptions via .claude/help-doctor.allow.json.

import { existsSync, readFileSync } from "node:fs";

// Capture strings that appear as subcommands on the parser side.
const SUBCOMMAND_PATTERNS = [
	/case\s+["'`]([a-z][a-z0-9-]+)["'`]\s*:/g,
	/(?:args\[0\]|sub|cmd)\s*===\s*["'`]([a-z][a-z0-9-]+)["'`]/g,
	/sub\s*=\s*args\[0\];[\s\S]{0,500}?["'`]([a-z][a-z0-9-]+)["'`]/g,
];

// Help/control flow strings — not counted as drift.
const CONTROL_KEYWORDS = new Set([
	"help",
	"--help",
	"-h",
	"-v",
	"-y",
	"--version",
]);

// Capture literals that appear as flags on the parser side.
// Only arg-parsing contexts: args.includes / args[i] === / a === / case
// This way the raw flag list of static lookup tables (like completion.js)
// does not leak into the detector.
const FLAG_PARSING_PATTERNS = [
	/args\.includes\s*\(\s*["'`](--[a-z][a-z0-9-]+)["'`]\s*\)/g,
	/args\[\w+\]\s*===?\s*["'`](--[a-z][a-z0-9-]+)["'`]/g,
	/\b[a-z_]\s*===?\s*["'`](--[a-z][a-z0-9-]+)["'`]/g,
	/case\s+["'`](--[a-z][a-z0-9-]+)["'`]\s*:/g,
];

function extractParserSubcommands(source) {
	const subs = new Set();
	for (const re of SUBCOMMAND_PATTERNS) {
		// New regex instance — avoid sharing global state
		const r = new RegExp(re.source, re.flags);
		for (const m of source.matchAll(r)) {
			if (m[1] && !CONTROL_KEYWORDS.has(m[1])) subs.add(m[1]);
		}
	}
	return subs;
}

function extractParserFlags(source) {
	const flags = new Set();
	for (const re of FLAG_PARSING_PATTERNS) {
		const r = new RegExp(re.source, re.flags);
		for (const m of source.matchAll(r)) {
			if (m[1] && !CONTROL_KEYWORDS.has(m[1])) flags.add(m[1]);
		}
	}
	return flags;
}

/**
 * Find the help body: join all `console.log(...)` call arguments in the file
 * (string/template literal). This approach:
 *   - does not rely on different helper names like showHelp, showAgentHelp
 *   - with multiple exports in the same file (runCommit+runChangelog in commit.js
 *     etc.), it covers all their help text
 *   - Low false-positive surface because only "text printed to screen"
 *     counts as documentation
 *
 * Limitation: values inside template literal `${...}` interpolation within
 * console.log are not captured (the level a regex can know). No practical impact.
 */
function extractHelpBody(source) {
	const parts = [];
	// console.log(...) — capture all arguments (including multi-line)
	const callRe = /console\.(?:log|error|warn|info)\s*\(([\s\S]*?)\)\s*;/g;
	for (const m of source.matchAll(callRe)) {
		const args = m[1];
		// take the "..." / '...' / `...` literals
		for (const s of args.matchAll(/(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g)) {
			parts.push(s[2]);
		}
	}
	// Fallback when there is no console.log: the whole file
	if (parts.length === 0) return source;
	return parts.join("\n");
}

/**
 * Detect drift in a single command file.
 *
 * @param {string} filePath - lib/commands/<name>.js
 * @param {object} [opts]
 * @param {Set<string>} [opts.allowSubs] - subcommand ids that won't be counted as drift
 * @param {Set<string>} [opts.allowFlags] - flags that won't be counted as drift
 * @returns {{ missingSubs: string[], missingFlags: string[] }}
 */
export function detectDrift(filePath, opts = {}) {
	const source = readFileSync(filePath, "utf-8");
	const parserSubs = extractParserSubcommands(source);
	const parserFlags = extractParserFlags(source);
	const helpBody = extractHelpBody(source);

	const allowSubs = opts.allowSubs || new Set();
	const allowFlags = opts.allowFlags || new Set();

	const missingSubs = [...parserSubs]
		.filter((s) => !allowSubs.has(s))
		.filter((s) => !helpBody.includes(s))
		.sort();

	const missingFlags = [...parserFlags]
		.filter((f) => !allowFlags.has(f))
		.filter((f) => !helpBody.includes(f))
		.sort();

	return { missingSubs, missingFlags };
}

/**
 * Read the allowlist file. Format:
 * {
 *   "<filename>.js": {
 *     "subs": ["json", "true"],
 *     "flags": ["--internal-debug"]
 *   }
 * }
 */
export function loadAllowlist(allowlistPath) {
	if (!existsSync(allowlistPath)) return {};
	try {
		return JSON.parse(readFileSync(allowlistPath, "utf-8"));
	} catch {
		return {};
	}
}

/**
 * Audit multiple command files.
 *
 * @param {string[]} filePaths
 * @param {object} [opts]
 * @param {string} [opts.allowlistPath]
 * @returns {Array<{ file: string, missingSubs: string[], missingFlags: string[] }>}
 */
export function auditFiles(filePaths, opts = {}) {
	const allowlist = opts.allowlistPath ? loadAllowlist(opts.allowlistPath) : {};
	const results = [];
	for (const filePath of filePaths) {
		const fileName = filePath.split("/").pop();
		const entry = allowlist[fileName] || {};
		const allowSubs = new Set(entry.subs || []);
		const allowFlags = new Set(entry.flags || []);
		const drift = detectDrift(filePath, { allowSubs, allowFlags });
		if (drift.missingSubs.length > 0 || drift.missingFlags.length > 0) {
			results.push({ file: fileName, ...drift });
		}
	}
	return results;
}
