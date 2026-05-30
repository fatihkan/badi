// Badi secret-scan — scans the project and its git history for secrets/credentials.
//
// Pattern registry: lib/data/secret-patterns.js (canonical).
// All behavior flags are documented in the --help output.

import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { chalk, showBanner } from "../cli.js";
import {
	PATTERNS as DEFAULT_PATTERNS,
	FALSE_POSITIVE_FILTER,
	GIT_SHOW_MAX_BUFFER,
	MAX_COMMITS_DEFAULT,
	MAX_FILE_SIZE_BYTES,
	MAX_FILES_DEFAULT,
	SCAN_EXTS,
	SKIP_DIRS,
} from "../data/secret-patterns.js";

// Path-traversal / out-of-system write protection. assertWithinProject blocks
// paths outside baseDir. We use it only for read-only / disk-write target
// files.
function assertWithinProject(baseDir, candidate, flag) {
	const rel = relative(baseDir, candidate);
	if (rel.startsWith("..") || rel.startsWith("/")) {
		throw new Error(
			`${flag} outside project root: ${candidate} (cwd: ${baseDir})`,
		);
	}
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function maskSecret(val) {
	if (val.length <= 8) return "*".repeat(val.length);
	return `${val.substring(0, 4)}...${val.substring(val.length - 4)}`;
}

function loadCustomPatterns(filePath) {
	const raw = readFileSync(filePath, "utf-8");
	const parsed = JSON.parse(raw);
	if (!Array.isArray(parsed)) {
		throw new Error("Patterns file root must be an array");
	}
	return parsed.map((p) => ({
		id: String(p.id || ""),
		name: String(p.name || p.id || "Custom"),
		regex: new RegExp(p.regex, p.flags || "g"),
		severity: String(p.severity || "MEDIUM"),
		context: p.context ? new RegExp(p.context, "i") : undefined,
	}));
}

function loadIgnoreList(filePath) {
	if (!existsSync(filePath)) return new Set();
	const lines = readFileSync(filePath, "utf-8").split("\n");
	const ids = new Set();
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		ids.add(trimmed);
	}
	return ids;
}

// ─── Scan core ──────────────────────────────────────────────────────────────

function scanContent(content, filePath, patterns) {
	const findings = [];
	for (const p of patterns) {
		for (const m of content.matchAll(p.regex)) {
			const match = m[0];
			const groupMatch = m[1];
			if (p.context) {
				const line = content.substring(
					Math.max(0, m.index - 100),
					m.index + match.length + 100,
				);
				if (!p.context.test(line)) continue;
			}
			if (FALSE_POSITIVE_FILTER.test(match)) continue;

			const lineNum = content.substring(0, m.index).split("\n").length;
			const rawMatch = groupMatch || match;
			findings.push({
				file: filePath,
				line: lineNum,
				pattern: p.name,
				patternId: p.id,
				severity: p.severity,
				rawMatch,
				masked: maskSecret(rawMatch),
			});
		}
	}
	return findings;
}

function walkDir({ dir, baseDir, patterns, maxFiles }) {
	const results = [];
	let fileCount = 0;
	let symlinksSkipped = 0;

	function walk(current) {
		if (fileCount >= maxFiles) return;
		let entries;
		try {
			entries = readdirSync(current, { withFileTypes: true });
		} catch {
			return;
		}

		for (const entry of entries) {
			if (fileCount >= maxFiles) return;

			// Y1: Always skip symlinks — cycle and out-of-project traversal risk.
			if (entry.isSymbolicLink()) {
				symlinksSkipped++;
				continue;
			}

			if (
				entry.name.startsWith(".") &&
				entry.name !== ".env" &&
				!entry.name.startsWith(".env.")
			) {
				if (entry.isDirectory() && !SKIP_DIRS.has(entry.name))
					walk(join(current, entry.name));
				continue;
			}
			const full = join(current, entry.name);
			if (entry.isDirectory()) {
				if (!SKIP_DIRS.has(entry.name)) walk(full);
			} else if (entry.isFile()) {
				const ext = extname(entry.name).toLowerCase();
				if (
					SCAN_EXTS.has(ext) ||
					entry.name.startsWith(".env") ||
					entry.name === "Dockerfile"
				) {
					try {
						// lstatSync (symlinks already skipped, but defensive on race)
						const stat = lstatSync(full);
						if (stat.size > MAX_FILE_SIZE_BYTES) continue;
						const content = readFileSync(full, "utf-8");
						const findings = scanContent(
							content,
							relative(baseDir, full),
							patterns,
						);
						results.push(...findings);
						fileCount++;
					} catch {
						/* unreadable file */
					}
				}
			}
		}
	}

	walk(dir);
	return { findings: results, fileCount, symlinksSkipped };
}

function scanGitHistory({ baseDir, patterns, maxCommits }) {
	try {
		const hashes = execFileSync(
			"git",
			["-C", baseDir, "log", "--pretty=format:%H", "--all"],
			{ encoding: "utf-8" },
		)
			.split("\n")
			.filter(Boolean);
		if (hashes.length === 0)
			return { findings: [], commitCount: 0, truncated: false };

		const findings = [];
		const truncated = hashes.length > maxCommits;
		const limit = Math.min(hashes.length, maxCommits);
		for (let i = 0; i < limit; i++) {
			try {
				const diff = execFileSync(
					"git",
					["-C", baseDir, "show", hashes[i], "--format="],
					{ encoding: "utf-8", maxBuffer: GIT_SHOW_MAX_BUFFER },
				);
				findings.push(
					...scanContent(
						diff,
						`[git commit ${hashes[i].substring(0, 7)}]`,
						patterns,
					),
				);
			} catch {
				/* skip large commit */
			}
		}
		return {
			findings,
			commitCount: limit,
			totalCommits: hashes.length,
			truncated,
		};
	} catch {
		return { findings: [], commitCount: 0, error: "Not a git repo" };
	}
}

// ─── Output helpers ───────────────────────────────────────────────────────

function dedupFindings(findings) {
	// K2: key includes file + rawMatch — removed masked-only collision.
	const seen = new Set();
	const unique = [];
	for (const f of findings) {
		const key = `${f.file}:${f.patternId}:${f.rawMatch}`;
		if (seen.has(key)) continue;
		seen.add(key);
		unique.push(f);
	}
	return unique;
}

function applyIgnore(findings, ignoreIds) {
	if (ignoreIds.size === 0) return findings;
	return findings.filter((f) => !ignoreIds.has(f.patternId));
}

function groupBySeverity(findings) {
	const map = { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [] };
	for (const f of findings) map[f.severity]?.push(f);
	return map;
}

function computeExitCode(findings, mode) {
	if (mode === "never") return 0;
	if (mode === "strict") return findings.length > 0 ? 1 : 0;
	// default: "critical" — CRITICAL + HIGH exit 1
	const critical = findings.filter(
		(f) => f.severity === "CRITICAL" || f.severity === "HIGH",
	).length;
	return critical > 0 ? 1 : 0;
}

function printText({
	findings,
	fileCount,
	commitCount,
	totalCommits,
	truncated,
	symlinksSkipped,
	scanGit,
	durationMs,
}) {
	console.log(
		chalk.bold(
			`Scanned: ${fileCount} files${scanGit ? `, ${commitCount} commits` : ""}`,
		),
	);
	if (truncated) {
		console.error(
			chalk.yellow(
				`WARNING: git history has ${totalCommits} commits; only the first ${commitCount} were scanned. ` +
					"Increase the limit with --max-commits N.",
			),
		);
	}
	if (symlinksSkipped > 0) {
		console.log(
			chalk.dim(
				`(${symlinksSkipped} symbolic links skipped — cycle protection)`,
			),
		);
	}
	console.log(chalk.bold(`Time: ${durationMs}ms`));
	console.log("");

	if (findings.length === 0) {
		console.log(chalk.bold.green("No secrets detected!"));
		return;
	}

	const bySeverity = groupBySeverity(findings);
	const colorMap = {
		CRITICAL: chalk.bold.red,
		HIGH: chalk.bold.yellow,
		MEDIUM: chalk.yellow,
		LOW: chalk.dim,
	};
	for (const [sev, items] of Object.entries(bySeverity)) {
		if (items.length === 0) continue;
		console.log(colorMap[sev](`${sev} (${items.length}):`));
		for (const f of items) {
			console.log(`  ${chalk.cyan(`${f.file}:${f.line}`)}`);
			console.log(`    ${chalk.dim(f.pattern)} -> ${chalk.yellow(f.masked)}`);
		}
		console.log("");
	}

	const critical = bySeverity.CRITICAL.length + bySeverity.HIGH.length;
	if (critical > 0) {
		console.log(chalk.bold.red(`${critical} high/critical secrets detected!`));
		console.log(chalk.dim("  Rotate them, add to .gitignore, use .env."));
	}
}

function printJson({
	findings,
	fileCount,
	commitCount,
	totalCommits,
	truncated,
	symlinksSkipped,
	durationMs,
}) {
	console.log(
		JSON.stringify(
			{
				scanned: {
					files: fileCount,
					commits: commitCount,
					totalCommits,
					truncated,
					symlinksSkipped,
				},
				findings: findings.map((f) => ({
					file: f.file,
					line: f.line,
					pattern: f.pattern,
					patternId: f.patternId,
					severity: f.severity,
					masked: f.masked,
				})),
				duration_ms: durationMs,
			},
			null,
			2,
		),
	);
}

// ─── Argument parser ──────────────────────────────────────────────────────

function parseArgs(args) {
	const flags = {
		scanGit: false,
		jsonOutput: false,
		exitMode: "critical", // critical | strict | never
		maxCommits: MAX_COMMITS_DEFAULT,
		maxFiles: MAX_FILES_DEFAULT,
		ignore: new Set(),
		patternsFile: null,
		ignoreFile: null,
	};
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === "--git") flags.scanGit = true;
		else if (a === "--format") {
			if (args[i + 1] === "json") flags.jsonOutput = true;
			i++;
		} else if (a === "--exit-code") {
			const mode = args[i + 1];
			if (["critical", "strict", "never"].includes(mode)) flags.exitMode = mode;
			i++;
		} else if (a === "--max-commits") {
			const n = Number.parseInt(args[i + 1], 10);
			if (Number.isFinite(n) && n > 0) flags.maxCommits = n;
			i++;
		} else if (a === "--max-files") {
			const n = Number.parseInt(args[i + 1], 10);
			if (Number.isFinite(n) && n > 0) flags.maxFiles = n;
			i++;
		} else if (a === "--ignore") {
			const ids = args[i + 1] || "";
			for (const id of ids
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean)) {
				flags.ignore.add(id);
			}
			i++;
		} else if (a === "--ignore-file") {
			flags.ignoreFile = args[i + 1];
			i++;
		} else if (a === "--patterns") {
			flags.patternsFile = args[i + 1];
			i++;
		}
	}
	return flags;
}

// ─── Help ─────────────────────────────────────────────────────────────────

function showHelp() {
	showBanner();
	console.log(chalk.bold("Secret Scanner:"));
	console.log("");
	console.log(chalk.bold("Usage:"));
	console.log(
		`  ${chalk.cyan("badi secret-scan")}                  Working tree scan`,
	);
	console.log(
		`  ${chalk.cyan("badi secret-scan --git")}            + last N commits (default 100)`,
	);
	console.log(
		`  ${chalk.cyan("badi secret-scan --format json")}    JSON output`,
	);
	console.log("");
	console.log(chalk.bold("Flags:"));
	console.log("  --exit-code <mode>     critical (default) | strict | never");
	console.log("                         critical: CRITICAL+HIGH -> exit 1");
	console.log("                         strict:   any finding -> exit 1");
	console.log(
		"                         never:    exit 0 regardless of findings",
	);
	console.log("  --max-commits N        Git history scan limit (default 100)");
	console.log("  --max-files N          File scan limit (default 5000)");
	console.log(
		"  --ignore id1,id2,...   Ignore specific pattern-ids (e.g. jwt,github-pat)",
	);
	console.log(
		"  --ignore-file <path>   Read pattern-ids from a .secretignore-like file",
	);
	console.log(
		"  --patterns <path>      Load an additional pattern JSON file (custom org)",
	);
	console.log("");
	console.log(chalk.bold("Exit codes:"));
	console.log(
		"  0   No findings (or --exit-code never; or only MEDIUM/LOW by default)",
	);
	console.log("  1   CRITICAL or HIGH finding (suitable for CI fail)");
	console.log("");
	console.log(chalk.bold("Detected (17 patterns):"));
	console.log("  AWS Access/Secret, GCP, GitHub PAT (classic + fine-grained),");
	console.log("  Slack, Stripe, OpenAI, Anthropic, npm, SendGrid, Twilio,");
	console.log("  JWT, MongoDB/Postgres URI, RSA/EC private keys, generic.");
	console.log("");
	console.log(chalk.bold("Scope:"));
	console.log(
		chalk.dim("  Symlinks are skipped (cycle + path traversal protection)."),
	);
	console.log(
		chalk.dim(
			"  Git stash / reflog / packed-refs are not scanned (--git reachable commits).",
		),
	);
}

// ─── Main command ─────────────────────────────────────────────────────────

export async function runSecretScan(args) {
	if (args[0] === "--help" || args[0] === "-h") {
		showHelp();
		return;
	}

	const flags = parseArgs(args);
	const baseDir = process.cwd();

	let patternsPath = null;
	if (flags.patternsFile) {
		patternsPath = resolve(flags.patternsFile);
		try {
			assertWithinProject(baseDir, patternsPath, "--patterns");
		} catch (e) {
			console.error(chalk.red(e.message));
			process.exit(1);
		}
	}
	const patterns = patternsPath
		? [...DEFAULT_PATTERNS, ...loadCustomPatterns(patternsPath)]
		: DEFAULT_PATTERNS;

	// Ignore list: --ignore flag + --ignore-file + .secretignore (cwd)
	const ignore = new Set(flags.ignore);
	const defaultIgnoreFile = join(baseDir, ".secretignore");
	for (const id of loadIgnoreList(defaultIgnoreFile)) ignore.add(id);
	if (flags.ignoreFile) {
		const ignorePath = resolve(flags.ignoreFile);
		try {
			assertWithinProject(baseDir, ignorePath, "--ignore-file");
		} catch (e) {
			console.error(chalk.red(e.message));
			process.exit(1);
		}
		for (const id of loadIgnoreList(ignorePath)) ignore.add(id);
	}

	if (!flags.jsonOutput) {
		showBanner();
		console.log(chalk.bold("Secret Scanner"));
		console.log(chalk.dim(`Target: ${baseDir}`));
		console.log("");
	}

	const startTime = Date.now();
	const wt = walkDir({
		dir: baseDir,
		baseDir,
		patterns,
		maxFiles: flags.maxFiles,
	});
	let gitResult = {
		findings: [],
		commitCount: 0,
		totalCommits: 0,
		truncated: false,
	};
	if (flags.scanGit) {
		gitResult = scanGitHistory({
			baseDir,
			patterns,
			maxCommits: flags.maxCommits,
		});
	}

	const all = [...wt.findings, ...gitResult.findings];
	const filtered = applyIgnore(dedupFindings(all), ignore);
	const durationMs = Date.now() - startTime;

	const payload = {
		findings: filtered,
		fileCount: wt.fileCount,
		commitCount: gitResult.commitCount,
		totalCommits: gitResult.totalCommits || 0,
		truncated: gitResult.truncated || false,
		symlinksSkipped: wt.symlinksSkipped,
		scanGit: flags.scanGit,
		durationMs,
	};

	if (flags.jsonOutput) {
		printJson(payload);
	} else {
		printText(payload);
	}

	// K1: apply the exit code at a single format-independent point.
	const code = computeExitCode(filtered, flags.exitMode);
	if (code !== 0) process.exit(code);
}

// Test exports
export {
	applyIgnore,
	computeExitCode,
	dedupFindings,
	groupBySeverity,
	loadCustomPatterns,
	loadIgnoreList,
	maskSecret,
	parseArgs,
	scanContent,
	scanGitHistory,
	walkDir,
};

// v1.31.0+ K1 hotfix: when invoked directly as `node lib/commands/secret-scan.js ...`,
// trigger runSecretScan. `badi security baseline` uses this path.
// The test/import path is unaffected — runs only when process.argv[1] is this file.
if (
	import.meta.url.startsWith("file:") &&
	process.argv[1] &&
	import.meta.url === new URL(`file://${process.argv[1]}`).href
) {
	runSecretScan(process.argv.slice(2));
}
