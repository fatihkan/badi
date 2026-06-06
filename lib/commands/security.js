import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chalk } from "../cli.js";

// `badi security` — bridge to Anthropic's native /security-review command.
//
// v1.31.0+ — As of Anthropic 2.1.140, /security-review is embedded in Claude
// Code as a native slash command. This module makes no AI calls; it provides a
// bridge/orchestration via baseline (deterministic) + triage (report reading) +
// init (CI scaffold) + pipeline (artifact-chain status, v1.34+).
//
// Subcommands:
//   badi security baseline           — secret-scan + npm audit deterministic baseline
//   badi security triage [report]    — filter the latest /security-review report by severity
//   badi security pipeline [--json]  — harness-interop artifact chain status (read-only)
//   badi security init [--ci]        — GitHub Action scaffold (wraps anthropics/claude-code-security-review)

const __dirname = dirname(fileURLToPath(import.meta.url));

// v1.31.0+ Y3 hotfix: git project root detection — safer than cwd-relative file
// checks (avoids "lock files not found" when called from a subdirectory).
function projectRoot() {
	try {
		return execFileSync("git", ["rev-parse", "--show-toplevel"], {
			encoding: "utf-8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
	} catch {
		return process.cwd();
	}
}

export function runSecurity(args) {
	const sub = args[0];
	if (!sub || sub === "--help" || sub === "-h") {
		return showHelp();
	}
	switch (sub) {
		case "baseline":
			return runBaseline(args.slice(1));
		case "triage":
			return runTriage(args.slice(1));
		case "pipeline":
			return runPipeline(args.slice(1));
		case "init":
			return runInit(args.slice(1));
		default:
			console.error(chalk.red(`Unknown security subcommand: ${sub}`));
			showHelp();
			process.exit(1);
	}
}

function showHelp() {
	console.log(`
${chalk.bold("badi security")} — Security orchestration (Anthropic /security-review bridge)

${chalk.bold("Subcommands:")}
  ${chalk.cyan("baseline [--json]")}     Deterministic baseline scan (secret-scan + npm audit)
  ${chalk.cyan("triage [report]")}       Filter/summarize the latest /security-review report
  ${chalk.cyan("pipeline [--json]")}     Harness-interop artifact chain status (read-only, v1.34+)
  ${chalk.cyan("init --ci [--force]")}   GitHub Action scaffold (wraps Anthropic's official action)

${chalk.bold("Recommended flow:")}
  1. ${chalk.cyan("badi security baseline")}     # deterministic baseline (secrets + dependencies)
  2. ${chalk.cyan("/security-review")} inside Claude Code (native, semantic AI)
  3. ${chalk.cyan("badi security triage")}      # filter by severity if a report exists
  4. CI: ${chalk.cyan("badi security init --ci")} (automatic review on PRs)

${chalk.bold("Note:")} ${chalk.cyan("badi security triage")} is a deterministic severity filter over
  security-report/SECURITY-REPORT.md. The agentic verify stage (sc-verifier skill)
  is separate — it writes TRIAGE.json; track it with ${chalk.cyan("badi security pipeline")}.

${chalk.bold("Cross-ref:")}
  /security-review  → Anthropic native (Claude Code 2.1.140+)
  /security-scan    → Badi slash (sc-orchestrator skill)
  badi secret-scan  → Deterministic regex (17 patterns)

Details: ${chalk.cyan("docs/enterprise.md")} and ${chalk.cyan("badi security <subcommand> --help")}
`);
}

// ─── baseline ───

function runBaseline(args) {
	const jsonOut = args.includes("--format=json") || args.includes("--json");
	const root = projectRoot(); // Y3 hotfix: git root instead of cwd
	const sections = [];

	console.log(
		chalk.bold("\n🔒 Baseline (deterministic) — secrets + dependencies\n"),
	);

	// 1) secret-scan — K1 hotfix: secret-scan.js now has a CLI entry point
	// (v1.31.0 hotfix), so this call actually triggers the scan.
	const ss = spawnSync(
		process.execPath,
		[resolve(__dirname, "secret-scan.js"), "--format", "json"],
		{ encoding: "utf-8", timeout: 60_000, cwd: root },
	);
	let secretCount = 0;
	let secretParsed = false;
	try {
		const parsed = JSON.parse(ss.stdout || "{}");
		secretCount = Array.isArray(parsed.findings) ? parsed.findings.length : 0;
		secretParsed = true;
	} catch (e) {
		// O2 hotfix: notify the user instead of failing silently
		console.error(
			chalk.yellow(`  ⚠ could not parse secret-scan output: ${e.message}`),
		);
		console.error(chalk.dim(`    stderr: ${(ss.stderr || "").slice(0, 200)}`));
	}
	const secretLine = !secretParsed
		? chalk.yellow("  ⚠ could not run secret-scan")
		: secretCount > 0
			? chalk.red(`  ✗ ${secretCount} secret findings`)
			: chalk.green("  ✓ No secret findings");
	console.log(`${chalk.cyan("[1/2]")} secret-scan`);
	console.log(secretLine);
	sections.push({
		check: "secret-scan",
		findings: secretCount,
		parsed: secretParsed,
	});

	// 2) npm audit (Y3 hotfix: root-relative lock file check)
	const npmLock = join(root, "package-lock.json");
	const yarnLock = join(root, "yarn.lock");
	if (existsSync(npmLock) || existsSync(yarnLock)) {
		const manager = existsSync(yarnLock) ? "yarn" : "npm";
		// Y2 hotfix: removed dead code (identical ternary)
		const audit = spawnSync(manager, ["audit", "--json"], {
			encoding: "utf-8",
			timeout: 60_000,
			cwd: root,
		});
		let critical = 0;
		let high = 0;
		try {
			if (manager === "npm") {
				const p = JSON.parse(audit.stdout || "{}");
				critical = p.metadata?.vulnerabilities?.critical || 0;
				high = p.metadata?.vulnerabilities?.high || 0;
			} else {
				const lines = (audit.stdout || "").split("\n").filter(Boolean);
				const last = JSON.parse(lines[lines.length - 1] || "{}");
				critical = last.data?.vulnerabilities?.critical || 0;
				high = last.data?.vulnerabilities?.high || 0;
			}
		} catch (e) {
			console.error(
				chalk.yellow(
					`  ⚠ could not parse ${manager} audit output: ${e.message}`,
				),
			);
		}
		console.log(`${chalk.cyan("[2/2]")} ${manager} audit`);
		if (critical > 0)
			console.log(
				chalk.red(`  ✗ ${critical} critical dependency vulnerabilities`),
			);
		if (high > 0)
			console.log(chalk.yellow(`  ⚠ ${high} high dependency vulnerabilities`));
		if (critical === 0 && high === 0)
			console.log(
				chalk.green("  ✓ No critical/high dependency vulnerabilities"),
			);
		sections.push({ check: `${manager} audit`, critical, high });
	} else {
		console.log(
			`${chalk.cyan("[2/2]")} npm audit ${chalk.gray("(skipped — no lock file)")}`,
		);
	}

	console.log(
		chalk.dim("\nFor semantic AI review: /security-review inside Claude Code"),
	);

	if (jsonOut) {
		console.log(JSON.stringify({ baseline: sections }, null, 2));
	}

	const hasFindings = sections.some(
		(s) => s.findings > 0 || s.critical > 0 || s.high > 0,
	);
	process.exit(hasFindings ? 1 : 0);
}

// ─── triage ───
//
// K2 hotfix: patterns use word boundaries + prioritize markdown headings.
// The old version counted "below", "follow", "yellow" with "/low/gi".

const SEVERITY_PATTERNS = {
	critical: /\b(critical|kritik|KRITIK)\b/gi,
	high: /\b(high|yuksek|YUKSEK)\b/gi,
	medium: /\b(medium|orta|ORTA)\b/gi,
	low: /\b(low|dusuk|DUSUK)\b/gi,
};

// Markdown heading-based count: most reliable on structures like `##? KRITIK SQLi`.
// The default /security-review report uses this format.
const HEADING_PATTERNS = {
	critical: /^#{1,4}\s+(?:critical|kritik|KRITIK)\b/gim,
	high: /^#{1,4}\s+(?:high|yuksek|YUKSEK)\b/gim,
	medium: /^#{1,4}\s+(?:medium|orta|ORTA)\b/gim,
	low: /^#{1,4}\s+(?:low|dusuk|DUSUK)\b/gim,
};

function countMatches(text, re) {
	const m = text.match(re);
	return m ? m.length : 0;
}

function runTriage(args) {
	const root = projectRoot(); // Y3: not cwd-relative
	const reportPath =
		args[0] || join(root, "security-report", "SECURITY-REPORT.md");
	if (!existsSync(reportPath)) {
		console.error(chalk.red(`No report: ${reportPath}`));
		console.error(
			chalk.dim(
				"\nThe security-report/ directory is created after running /security-review.",
			),
		);
		process.exit(1);
	}

	const body = readFileSync(reportPath, "utf-8");

	// Try markdown headings first (most reliable); if 0, fall back to the
	// word-boundary regex (for heading-less report formats).
	const headingCounts = {
		critical: countMatches(body, HEADING_PATTERNS.critical),
		high: countMatches(body, HEADING_PATTERNS.high),
		medium: countMatches(body, HEADING_PATTERNS.medium),
		low: countMatches(body, HEADING_PATTERNS.low),
	};
	const headingTotal = Object.values(headingCounts).reduce((a, b) => a + b, 0);
	const counts =
		headingTotal > 0
			? headingCounts
			: {
					critical: countMatches(body, SEVERITY_PATTERNS.critical),
					high: countMatches(body, SEVERITY_PATTERNS.high),
					medium: countMatches(body, SEVERITY_PATTERNS.medium),
					low: countMatches(body, SEVERITY_PATTERNS.low),
				};

	console.log(chalk.bold("\n📋 Security Report Triage\n"));
	console.log(`  Source: ${chalk.cyan(reportPath)}`);
	console.log(
		`  Count method: ${headingTotal > 0 ? "markdown heading" : "word-boundary regex"}`,
	);
	console.log(`  ${chalk.red("Critical")}: ${counts.critical}`);
	console.log(`  ${chalk.yellow("High")}: ${counts.high}`);
	console.log(`  ${chalk.blue("Medium")}: ${counts.medium}`);
	console.log(`  ${chalk.gray("Low")}: ${counts.low}`);

	if (counts.critical > 0) {
		console.log(
			chalk.red(
				"\n  ➜ CRITICAL findings should block the merge. Fix them first.",
			),
		);
		process.exit(1);
	}
	if (counts.high > 0) {
		console.log(
			chalk.yellow("\n  ➜ High findings should be reviewed before merge."),
		);
	}
	process.exit(0);
}

// ─── pipeline ───
//
// v1.34+ — read-only status of the harness-interop artifact chain
// (THREAT_MODEL.md → VULN-FINDINGS.json → TRIAGE.json) emitted by the
// security-check skill family. Filenames follow Anthropic's
// defending-code-reference-harness for outbound, name-level interop.
// Always exits 0: this is an informational status, not a CI gate.

const PIPELINE_STAGES = [
	{
		file: "THREAT_MODEL.md",
		label: "Threat model",
		optional: true,
		producer: 'pentest-threat-model skill — "create a threat model"',
	},
	{
		file: "VULN-FINDINGS.json",
		label: "Raw findings",
		optional: false,
		producer: 'sc-orchestrator Phase 2 — "run security check"',
	},
	{
		file: "TRIAGE.json",
		label: "Triage verdicts",
		optional: false,
		producer: "sc-verifier Phase 3 (runs within the same scan)",
	},
];

function stageStatus(root) {
	const stages = PIPELINE_STAGES.map((s) => {
		const path = join(root, s.file);
		const exists = existsSync(path);
		return {
			...s,
			path,
			exists,
			mtimeMs: exists ? statSync(path).mtimeMs : null,
			stale: false,
		};
	});
	// Downstream is stale when any existing upstream artifact is newer than it.
	for (let i = 1; i < stages.length; i++) {
		const down = stages[i];
		if (!down.exists) continue;
		for (let j = 0; j < i; j++) {
			const up = stages[j];
			if (up.exists && up.mtimeMs > down.mtimeMs) down.stale = true;
		}
	}
	return stages;
}

function pipelineNextStep(stages) {
	const [threat, findings, triage] = stages;
	if (!findings.exists)
		return threat.exists
			? `Run the scan: ${findings.producer}`
			: `Optional head first (${threat.producer}), then: ${findings.producer}`;
	if (!triage.exists) return `Run the verify stage: ${triage.producer}`;
	const stale = stages.filter((s) => s.stale);
	if (stale.length > 0)
		return `Re-run the scan to refresh: ${stale.map((s) => s.file).join(", ")} (upstream changed)`;
	return "Chain complete and fresh — review TRIAGE.md / security-report/SECURITY-REPORT.md";
}

function runPipeline(args) {
	const jsonOut = args.includes("--format=json") || args.includes("--json");
	const root = projectRoot(); // Y3: not cwd-relative
	const stages = stageStatus(root);

	if (jsonOut) {
		console.log(
			JSON.stringify(
				{
					pipeline: stages.map((s) => ({
						file: s.file,
						exists: s.exists,
						stale: s.stale,
						optional: s.optional,
					})),
					next: pipelineNextStep(stages),
				},
				null,
				2,
			),
		);
		process.exit(0);
	}

	console.log(chalk.bold("\n🔗 Security artifact chain (harness-interop)\n"));
	console.log(
		chalk.dim("  THREAT_MODEL.md → VULN-FINDINGS.json → TRIAGE.json\n"),
	);
	for (const s of stages) {
		const mark = s.exists
			? s.stale
				? chalk.yellow("⚠ stale ")
				: chalk.green("✓ ok    ")
			: s.optional
				? chalk.gray("○ none  ")
				: chalk.red("✗ missing");
		const opt = s.optional ? chalk.dim(" (optional)") : "";
		console.log(`  ${mark} ${chalk.cyan(s.file.padEnd(19))} ${s.label}${opt}`);
		if (!s.exists || s.stale)
			console.log(chalk.dim(`           ↳ ${s.producer}`));
	}
	console.log(`\n  ${chalk.bold("Next:")} ${pipelineNextStep(stages)}`);
	console.log(
		chalk.dim(
			"\n  Note: `badi security triage` is a deterministic severity filter over\n  security-report/SECURITY-REPORT.md — distinct from the agentic verify\n  stage (sc-verifier) that writes TRIAGE.json.",
		),
	);
	process.exit(0);
}

// ─── init --ci ───

function runInit(args) {
	const ci = args.includes("--ci");
	if (!ci) {
		console.log(
			chalk.yellow(
				"Only --ci is supported right now. Run: badi security init --ci",
			),
		);
		process.exit(1);
	}

	const wfDir = join(process.cwd(), ".github", "workflows");
	const wfPath = join(wfDir, "security-review.yml");
	const distTemplate = resolve(
		__dirname,
		"..",
		"..",
		"dist",
		"github-actions",
		"security-review.yml",
	);

	if (!existsSync(distTemplate)) {
		console.error(chalk.red(`Template not found: ${distTemplate}`));
		console.error(
			chalk.dim("Badi installation may be incomplete. Run badi doctor."),
		);
		process.exit(1);
	}

	if (existsSync(wfPath) && !args.includes("--force")) {
		console.error(chalk.yellow(`Won't overwrite existing file: ${wfPath}`));
		console.error(chalk.dim("Use the --force flag to overwrite."));
		process.exit(1);
	}

	mkdirSync(wfDir, { recursive: true });
	writeFileSync(wfPath, readFileSync(distTemplate, "utf-8"), "utf-8");

	console.log(chalk.green(`✓ ${wfPath} created`));
	console.log(chalk.bold("\nNext steps:"));
	console.log(
		`  1. Repo Settings → Secrets → add ${chalk.cyan("ANTHROPIC_API_KEY")}`,
	);
	console.log(`  2. Open a PR — the workflow runs automatically`);
	console.log(
		`  3. Custom prompt (optional): ${chalk.cyan(".claude/security-review-instructions.md")}`,
	);
	process.exit(0);
}
