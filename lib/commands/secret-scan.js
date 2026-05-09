import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { chalk, showBanner } from "../cli.js";

// Secret pattern'leri (gitleaks/trufflehog'dan esinlenerek yalinlastirilmis)
const PATTERNS = [
	{
		id: "aws-access-key",
		name: "AWS Access Key",
		regex: /AKIA[0-9A-Z]{16}/g,
		severity: "KRITIK",
	},
	{
		id: "aws-secret",
		name: "AWS Secret Key",
		regex:
			/(?:aws[_-]?secret[_-]?(?:access[_-]?)?key|AWS_SECRET)[\s:="']*([A-Za-z0-9/+=]{40})/gi,
		severity: "KRITIK",
	},
	{
		id: "gcp-key",
		name: "GCP API Key",
		regex: /AIza[0-9A-Za-z\-_]{35}/g,
		severity: "KRITIK",
	},
	{
		id: "github-pat",
		name: "GitHub PAT",
		regex: /(?:ghp_|gho_|ghu_|ghs_|ghr_)[A-Za-z0-9]{36,40}/g,
		severity: "KRITIK",
	},
	{
		id: "github-classic",
		name: "GitHub Classic Token",
		regex: /[a-f0-9]{40}/g,
		severity: "DUSUK",
		context: /github|token|ghp/i,
	},
	{
		id: "slack-token",
		name: "Slack Token",
		regex: /xox[baprs]-[A-Za-z0-9-]{10,}/g,
		severity: "KRITIK",
	},
	{
		id: "stripe-key",
		name: "Stripe Key",
		regex: /(?:sk|rk|pk)_(?:test|live)_[A-Za-z0-9]{24,}/g,
		severity: "KRITIK",
	},
	{
		id: "openai-key",
		name: "OpenAI Key",
		regex: /sk-[A-Za-z0-9]{20,}/g,
		severity: "KRITIK",
	},
	{
		id: "anthropic-key",
		name: "Anthropic Key",
		regex: /sk-ant-[A-Za-z0-9\-_]{40,}/g,
		severity: "KRITIK",
	},
	{
		id: "npm-token",
		name: "npm Token",
		regex: /npm_[A-Za-z0-9]{36}/g,
		severity: "YUKSEK",
	},
	{
		id: "sendgrid",
		name: "SendGrid API Key",
		regex: /SG\.[A-Za-z0-9_-]{16,32}\.[A-Za-z0-9_-]{32,64}/g,
		severity: "YUKSEK",
	},
	{
		id: "twilio",
		name: "Twilio API Key",
		regex: /SK[0-9a-fA-F]{32}/g,
		severity: "YUKSEK",
	},
	{
		id: "private-key",
		name: "RSA/EC Private Key",
		regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/g,
		severity: "KRITIK",
	},
	{
		id: "jwt",
		name: "JWT Token",
		regex: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
		severity: "ORTA",
	},
	{
		id: "mongodb-uri",
		name: "MongoDB URI (credentials)",
		regex: /mongodb(?:\+srv)?:\/\/[^:]+:[^@]+@/g,
		severity: "YUKSEK",
	},
	{
		id: "postgres-uri",
		name: "PostgreSQL URI (credentials)",
		regex: /postgres(?:ql)?:\/\/[^:]+:[^@]+@/g,
		severity: "YUKSEK",
	},
	{
		id: "generic-secret",
		name: "Generic Secret Variable",
		regex:
			/(?:api[_-]?key|secret|password|passwd|pwd|token)["'\s:=]{1,5}["']([A-Za-z0-9+/_-]{20,64})["']/gi,
		severity: "DUSUK",
	},
];

// Dosya uzantisi dahil listesi (genisletilmis scan)
const SCAN_EXTS = new Set([
	".js",
	".mjs",
	".cjs",
	".ts",
	".tsx",
	".jsx",
	".json",
	".env",
	".yml",
	".yaml",
	".sh",
	".bash",
	".py",
	".go",
	".rb",
	".php",
	".java",
	".kt",
	".swift",
	".rs",
	".md",
	".txt",
	".xml",
	".toml",
	".ini",
	".conf",
	".config",
]);

const SKIP_DIRS = new Set([
	"node_modules",
	".git",
	"dist",
	"build",
	"coverage",
	".next",
	".nuxt",
	"vendor",
	"__pycache__",
	".venv",
	"venv",
	".pytest_cache",
	".claude",
	".test-tmp",
]);

function maskSecret(val) {
	if (val.length <= 8) return "*".repeat(val.length);
	return `${val.substring(0, 4)}...${val.substring(val.length - 4)}`;
}

function scanContent(content, filePath) {
	const findings = [];
	for (const p of PATTERNS) {
		for (const m of content.matchAll(p.regex)) {
			const match = m[0];
			const groupMatch = m[1];
			// Context kontrolu (varsa)
			if (p.context) {
				const line = content.substring(
					Math.max(0, m.index - 100),
					m.index + match.length + 100,
				);
				if (!p.context.test(line)) continue;
			}
			// False positive filtreleri
			if (
				/example|test|xxx|yyyyyy|dummy|placeholder|your[_-]?key|<.*>/i.test(
					match,
				)
			)
				continue;

			// Satir numarasi
			const lineNum = content.substring(0, m.index).split("\n").length;
			findings.push({
				file: filePath,
				line: lineNum,
				pattern: p.name,
				severity: p.severity,
				match: groupMatch || match,
				masked: maskSecret(groupMatch || match),
			});
		}
	}
	return findings;
}

function walkDir(dir, baseDir, maxFiles = 5000) {
	const results = [];
	let fileCount = 0;

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
						const stat = statSync(full);
						if (stat.size > 2 * 1024 * 1024) continue; // 2MB limit
						const content = readFileSync(full, "utf-8");
						const findings = scanContent(content, relative(baseDir, full));
						results.push(...findings);
						fileCount++;
					} catch {
						/* okuma hatasi */
					}
				}
			}
		}
	}

	walk(dir);
	return { findings: results, fileCount };
}

function scanGitHistory(baseDir) {
	try {
		const hashes = execFileSync(
			"git",
			["-C", baseDir, "log", "--pretty=format:%H", "--all"],
			{ encoding: "utf-8" },
		)
			.split("\n")
			.filter(Boolean);
		if (hashes.length === 0) return { findings: [], commitCount: 0 };

		const findings = [];
		const maxCommits = Math.min(hashes.length, 100);
		for (let i = 0; i < maxCommits; i++) {
			try {
				const diff = execFileSync(
					"git",
					["-C", baseDir, "show", hashes[i], "--format="],
					{ encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 },
				);
				const commitFindings = scanContent(
					diff,
					`[git commit ${hashes[i].substring(0, 7)}]`,
				);
				findings.push(...commitFindings);
			} catch {
				/* buyuk commit skip */
			}
		}
		return { findings, commitCount: maxCommits };
	} catch {
		return { findings: [], commitCount: 0, error: "Git repo degil" };
	}
}

export async function runSecretScan(args) {
	if (args[0] === "--help" || args[0] === "-h") {
		showBanner();
		console.log(chalk.bold("Secret Scanner:"));
		console.log("");
		console.log(
			`  ${chalk.cyan("badi secret-scan")}                    Working tree scan`,
		);
		console.log(
			`  ${chalk.cyan("badi secret-scan --git")}              Son 100 commit'i da tara`,
		);
		console.log(
			`  ${chalk.cyan("badi secret-scan --format json")}      JSON cikti`,
		);
		console.log("");
		console.log(chalk.bold("Tespit Edilenler:"));
		console.log("  AWS, GCP, GitHub, Slack, Stripe, OpenAI, Anthropic,");
		console.log("  npm, SendGrid, Twilio, JWT, MongoDB/Postgres URI,");
		console.log("  RSA/EC private keys, generic secrets (20-64 char)");
		return;
	}

	const scanGit = args.includes("--git");
	const jsonOutput =
		args.includes("--format") && args[args.indexOf("--format") + 1] === "json";
	const baseDir = process.cwd();

	if (!jsonOutput) {
		showBanner();
		console.log(chalk.bold(`Secret Scanner`));
		console.log(chalk.dim(`Hedef: ${baseDir}`));
		console.log("");
	}

	const startTime = Date.now();
	const { findings: fsFindings, fileCount } = walkDir(baseDir, baseDir);
	let gitFindings = [];
	let commitCount = 0;
	if (scanGit) {
		const gitResult = scanGitHistory(baseDir);
		gitFindings = gitResult.findings;
		commitCount = gitResult.commitCount;
	}

	const allFindings = [...fsFindings, ...gitFindings];

	// Duplicate filtresi (ayni pattern + aym masked degeri)
	const seen = new Set();
	const unique = [];
	for (const f of allFindings) {
		const key = `${f.pattern}:${f.masked}`;
		if (seen.has(key)) continue;
		seen.add(key);
		unique.push(f);
	}

	if (jsonOutput) {
		console.log(
			JSON.stringify(
				{
					scanned: { files: fileCount, commits: commitCount },
					findings: unique.map((f) => ({
						file: f.file,
						line: f.line,
						pattern: f.pattern,
						severity: f.severity,
						masked: f.masked,
					})),
					duration_ms: Date.now() - startTime,
				},
				null,
				2,
			),
		);
		return;
	}

	console.log(
		chalk.bold(
			`Taranan: ${fileCount} dosya${scanGit ? `, ${commitCount} commit` : ""}`,
		),
	);
	console.log(chalk.bold(`Sure: ${Date.now() - startTime}ms`));
	console.log("");

	if (unique.length === 0) {
		console.log(chalk.bold.green("Hic sir/secret tespit edilmedi!"));
		return;
	}

	// Severity bazli grupla
	const bySeverity = { KRITIK: [], YUKSEK: [], ORTA: [], DUSUK: [] };
	for (const f of unique) bySeverity[f.severity]?.push(f);

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
		process.exit(1);
	}
}
