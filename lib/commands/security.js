import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chalk } from "../cli.js";

// `badi security` — Anthropic /security-review native komutuna kopru.
//
// v1.31.0+ — Anthropic 2.1.140 ile /security-review native slash command olarak
// Claude Code'a gomulu. Bu modul AI cagirisi yapmaz; baseline (deterministic) +
// triage (rapor okuma) + init (CI scaffold) ile kopru/orkestrasyon saglar.
//
// Subkomutlar:
//   badi security baseline           — secret-scan + npm audit deterministic baseline
//   badi security triage [report]    — son /security-review raporunu severity'ye gore filtrele
//   badi security init [--ci]        — GitHub Action scaffold (anthropics/claude-code-security-review wrap)

const __dirname = dirname(fileURLToPath(import.meta.url));

// v1.31.0+ Y3 hotfix: git proje koku tespiti — cwd-relative dosya kontrollerinden
// daha guvenli (subdirectory'den cagrildiginda lock dosyalari bulunamaz hatasi).
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
		case "init":
			return runInit(args.slice(1));
		default:
			console.error(chalk.red(`Bilinmeyen security subkomut: ${sub}`));
			showHelp();
			process.exit(1);
	}
}

function showHelp() {
	console.log(`
${chalk.bold("badi security")} — Guvenlik orkestrasyonu (Anthropic /security-review kopru)

${chalk.bold("Subkomutlar:")}
  ${chalk.cyan("baseline [--json]")}     Deterministic baseline scan (secret-scan + npm audit)
  ${chalk.cyan("triage [report]")}       Son /security-review raporunu filtrele/ozetle
  ${chalk.cyan("init --ci [--force]")}   GitHub Action scaffold (Anthropic resmi action wrap)

${chalk.bold("Onerilen akis:")}
  1. ${chalk.cyan("badi security baseline")}     # deterministic taban (sirlar + bagimliliklar)
  2. Claude Code icinde ${chalk.cyan("/security-review")} (native, semantic AI)
  3. ${chalk.cyan("badi security triage")}      # rapor varsa severity'ye gore filtrele
  4. CI: ${chalk.cyan("badi security init --ci")} (PR'larda otomatik review)

${chalk.bold("Cross-ref:")}
  /security-review  → Anthropic native (Claude Code 2.1.140+)
  /security-scan    → Badi slash (sc-orchestrator skill)
  badi secret-scan  → Deterministic regex (17 pattern)

Detay: ${chalk.cyan("docs/enterprise.md")} ve ${chalk.cyan("badi security <subkomut> --help")}
`);
}

// ─── baseline ───

function runBaseline(args) {
	const jsonOut = args.includes("--format=json") || args.includes("--json");
	const root = projectRoot(); // Y3 hotfix: cwd yerine git root
	const sections = [];

	console.log(chalk.bold("\n🔒 Baseline (deterministic) — sirlar + bagimliliklar\n"));

	// 1) secret-scan — K1 hotfix: secret-scan.js artik CLI entry point'e sahip
	// (v1.31.0 hotfix), bu cagri gercekten taramayi tetikler.
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
		// O2 hotfix: silent fail yerine kullaniciya bildir
		console.error(
			chalk.yellow(`  ⚠ secret-scan ciktisi parse edilemedi: ${e.message}`),
		);
		console.error(chalk.dim(`    stderr: ${(ss.stderr || "").slice(0, 200)}`));
	}
	const secretLine =
		!secretParsed
			? chalk.yellow("  ⚠ secret-scan calistirilamadi")
			: secretCount > 0
				? chalk.red(`  ✗ ${secretCount} sir bulgu`)
				: chalk.green("  ✓ Sir bulgu yok");
	console.log(`${chalk.cyan("[1/2]")} secret-scan`);
	console.log(secretLine);
	sections.push({
		check: "secret-scan",
		findings: secretCount,
		parsed: secretParsed,
	});

	// 2) npm audit (Y3 hotfix: root-relative lock dosyasi kontrolu)
	const npmLock = join(root, "package-lock.json");
	const yarnLock = join(root, "yarn.lock");
	if (existsSync(npmLock) || existsSync(yarnLock)) {
		const manager = existsSync(yarnLock) ? "yarn" : "npm";
		// Y2 hotfix: dead code (identical ternary) kaldirildi
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
				chalk.yellow(`  ⚠ ${manager} audit ciktisi parse edilemedi: ${e.message}`),
			);
		}
		console.log(`${chalk.cyan("[2/2]")} ${manager} audit`);
		if (critical > 0)
			console.log(chalk.red(`  ✗ ${critical} kritik bagimlilik acigi`));
		if (high > 0)
			console.log(chalk.yellow(`  ⚠ ${high} yuksek bagimlilik acigi`));
		if (critical === 0 && high === 0)
			console.log(chalk.green("  ✓ Kritik/yuksek bagimlilik acigi yok"));
		sections.push({ check: `${manager} audit`, critical, high });
	} else {
		console.log(
			`${chalk.cyan("[2/2]")} npm audit ${chalk.gray("(atlandi — lock dosyasi yok)")}`,
		);
	}

	console.log(
		chalk.dim("\nSemantic AI review icin: Claude Code icinde /security-review"),
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
// K2 hotfix: regex'ler word-boundary ile + markdown heading'lere oncelik veriyor.
// Eski versiyon "/low/gi" ile "below", "follow", "yellow" kelimelerini sayardi.

const SEVERITY_PATTERNS = {
	critical: /\b(critical|kritik|KRITIK)\b/gi,
	high: /\b(high|yuksek|YUKSEK)\b/gi,
	medium: /\b(medium|orta|ORTA)\b/gi,
	low: /\b(low|dusuk|DUSUK)\b/gi,
};

// Markdown heading-based count: `##? KRITIK SQLi` gibi yapilarda en guvenilir
// sayim. /security-review default raporu bu formati kullanir.
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
	const root = projectRoot(); // Y3: cwd-relative degil
	const reportPath = args[0] || join(root, "security-report", "SECURITY-REPORT.md");
	if (!existsSync(reportPath)) {
		console.error(chalk.red(`Rapor yok: ${reportPath}`));
		console.error(
			chalk.dim(
				"\n/security-review calistirildiktan sonra security-report/ dizini olusur.",
			),
		);
		process.exit(1);
	}

	const body = readFileSync(reportPath, "utf-8");

	// Once markdown heading'leri dene (en guvenilir); 0 ise word-boundary
	// regex'e dus (heading-less rapor formatlari icin).
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
	console.log(`  Kaynak: ${chalk.cyan(reportPath)}`);
	console.log(
		`  Sayim yontemi: ${headingTotal > 0 ? "markdown heading" : "word-boundary regex"}`,
	);
	console.log(`  ${chalk.red("Kritik")}: ${counts.critical}`);
	console.log(`  ${chalk.yellow("Yuksek")}: ${counts.high}`);
	console.log(`  ${chalk.blue("Orta")}:  ${counts.medium}`);
	console.log(`  ${chalk.gray("Dusuk")}:  ${counts.low}`);

	if (counts.critical > 0) {
		console.log(
			chalk.red("\n  ➜ KRITIK bulgular merge'i bloklamali. Once cozun."),
		);
		process.exit(1);
	}
	if (counts.high > 0) {
		console.log(
			chalk.yellow("\n  ➜ Yuksek bulgular merge oncesi gozden gecirilmeli."),
		);
	}
	process.exit(0);
}

// ─── init --ci ───

function runInit(args) {
	const ci = args.includes("--ci");
	if (!ci) {
		console.log(
			chalk.yellow(
				"Su an yalniz --ci destekleniyor. Calistir: badi security init --ci",
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
		console.error(chalk.red(`Sablon bulunamadi: ${distTemplate}`));
		console.error(chalk.dim("Badi kurulumu eksik olabilir. badi doctor calistir."));
		process.exit(1);
	}

	if (existsSync(wfPath) && !args.includes("--force")) {
		console.error(chalk.yellow(`Var olan dosyayi yazmaz: ${wfPath}`));
		console.error(chalk.dim("Uzerine yazmak icin --force flag'i kullan."));
		process.exit(1);
	}

	mkdirSync(wfDir, { recursive: true });
	writeFileSync(wfPath, readFileSync(distTemplate, "utf-8"), "utf-8");

	console.log(chalk.green(`✓ ${wfPath} olusturuldu`));
	console.log(chalk.bold("\nSonraki adimlar:"));
	console.log(
		`  1. Repo Settings → Secrets → ${chalk.cyan("ANTHROPIC_API_KEY")} ekle`,
	);
	console.log(`  2. PR ac — workflow otomatik calisir`);
	console.log(
		`  3. Custom prompt (opsiyonel): ${chalk.cyan(".claude/security-review-instructions.md")}`,
	);
	process.exit(0);
}
