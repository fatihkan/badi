// Badi secret-scan — projeyi ve git history'sini sir/credential icin tarar.
//
// Pattern registry: lib/data/secret-patterns.js (canonical).
// Tum davranis bayraklari --help cikti'sinda dokumante edilmistir.

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

// Path-traversal/sistem-disi yazma koruma. assertWithinProject baseDir
// disindaki yollari engeller. Yalniz read-only/disk-write hedef dosyalari
// icin kullaniyoruz.
function assertWithinProject(baseDir, candidate, flag) {
	const rel = relative(baseDir, candidate);
	if (rel.startsWith("..") || rel.startsWith("/")) {
		throw new Error(
			`${flag} proje koku disinda: ${candidate} (cwd: ${baseDir})`,
		);
	}
}

// ─── Yardimcilar ──────────────────────────────────────────────────────────

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
		severity: String(p.severity || "ORTA"),
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

// ─── Tarama cekirdek ──────────────────────────────────────────────────────

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

			// Y1: Symlink'leri her zaman atla — cycle ve proje-disi traversal riski.
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
						/* okunmaz dosya */
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
				/* buyuk commit skip */
			}
		}
		return {
			findings,
			commitCount: limit,
			totalCommits: hashes.length,
			truncated,
		};
	} catch {
		return { findings: [], commitCount: 0, error: "Git repo degil" };
	}
}

// ─── Cikti yardimcilari ───────────────────────────────────────────────────

function dedupFindings(findings) {
	// K2: anahtara file + rawMatch dahil — masked-only collision kaldirildi.
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
	const map = { KRITIK: [], YUKSEK: [], ORTA: [], DUSUK: [] };
	for (const f of findings) map[f.severity]?.push(f);
	return map;
}

function computeExitCode(findings, mode) {
	if (mode === "never") return 0;
	if (mode === "strict") return findings.length > 0 ? 1 : 0;
	// default: "critical" — KRITIK + YUKSEK exit 1
	const critical = findings.filter(
		(f) => f.severity === "KRITIK" || f.severity === "YUKSEK",
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
			`Taranan: ${fileCount} dosya${scanGit ? `, ${commitCount} commit` : ""}`,
		),
	);
	if (truncated) {
		console.error(
			chalk.yellow(
				`UYARI: git history ${totalCommits} commit iceriyor; sadece ilk ${commitCount} tarandi. ` +
					"--max-commits N ile siniri arttir.",
			),
		);
	}
	if (symlinksSkipped > 0) {
		console.log(
			chalk.dim(`(${symlinksSkipped} sembolik link atlandi — cycle koruma)`),
		);
	}
	console.log(chalk.bold(`Sure: ${durationMs}ms`));
	console.log("");

	if (findings.length === 0) {
		console.log(chalk.bold.green("Hic sir/secret tespit edilmedi!"));
		return;
	}

	const bySeverity = groupBySeverity(findings);
	const colorMap = {
		KRITIK: chalk.bold.red,
		YUKSEK: chalk.bold.yellow,
		ORTA: chalk.yellow,
		DUSUK: chalk.dim,
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

	const critical = bySeverity.KRITIK.length + bySeverity.YUKSEK.length;
	if (critical > 0) {
		console.log(chalk.bold.red(`${critical} yuksek/kritik sir tespit edildi!`));
		console.log(
			chalk.dim("  Rotate edin, .gitignore'a ekleyin, .env kullanin."),
		);
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
	console.log(chalk.bold("Kullanim:"));
	console.log(
		`  ${chalk.cyan("badi secret-scan")}                  Working tree scan`,
	);
	console.log(
		`  ${chalk.cyan("badi secret-scan --git")}            + son N commit (varsayilan 100)`,
	);
	console.log(
		`  ${chalk.cyan("badi secret-scan --format json")}    JSON cikti`,
	);
	console.log("");
	console.log(chalk.bold("Bayraklar:"));
	console.log("  --exit-code <mode>     critical (default) | strict | never");
	console.log("                         critical: KRITIK+YUKSEK -> exit 1");
	console.log(
		"                         strict:   herhangi bir bulgu -> exit 1",
	);
	console.log("                         never:    bulguya bakmaksizin exit 0");
	console.log(
		"  --max-commits N        Git history tarama siniri (default 100)",
	);
	console.log("  --max-files N          Dosya tarama siniri (default 5000)");
	console.log(
		"  --ignore id1,id2,...   Belirli pattern-id'leri yoksay (orn: jwt,github-pat)",
	);
	console.log(
		"  --ignore-file <path>   .secretignore-benzeri dosyadan pattern-id oku",
	);
	console.log(
		"  --patterns <path>      Ek pattern JSON dosyasi yukle (custom kurum)",
	);
	console.log("");
	console.log(chalk.bold("Cikis kodlari:"));
	console.log(
		"  0   Bulgu yok (veya --exit-code never; veya sadece ORTA/DUSUK default)",
	);
	console.log("  1   KRITIK veya YUKSEK bulgu (CI fail icin uygun)");
	console.log("");
	console.log(chalk.bold("Tespit Edilenler (17 pattern):"));
	console.log("  AWS Access/Secret, GCP, GitHub PAT (classic + fine-grained),");
	console.log("  Slack, Stripe, OpenAI, Anthropic, npm, SendGrid, Twilio,");
	console.log("  JWT, MongoDB/Postgres URI, RSA/EC private keys, generic.");
	console.log("");
	console.log(chalk.bold("Kapsam:"));
	console.log(
		chalk.dim("  Symlink'ler atlanir (cycle + path traversal koruma)."),
	);
	console.log(
		chalk.dim(
			"  Git stash / reflog / packed-refs taranmaz (--git reachable commits).",
		),
	);
}

// ─── Ana komut ────────────────────────────────────────────────────────────

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

	// Ignore listesi: --ignore flag + --ignore-file + .secretignore (cwd)
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
		console.log(chalk.dim(`Hedef: ${baseDir}`));
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

	// K1: exit code'u format-bagimsiz tek noktada uygula.
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

// v1.31.0+ K1 hotfix: doğrudan `node lib/commands/secret-scan.js ...` cagrildiginda
// runSecretScan'i tetikle. `badi security baseline` bu yolu kullanir.
// Test/import path'i etkilenmez — yalniz process.argv[1] bu dosya ise calisir.
if (
	import.meta.url.startsWith("file:") &&
	process.argv[1] &&
	import.meta.url === new URL(`file://${process.argv[1]}`).href
) {
	runSecretScan(process.argv.slice(2));
}
