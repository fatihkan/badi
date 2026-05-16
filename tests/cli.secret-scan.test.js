import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	rmSync,
	symlinkSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
	applyIgnore,
	computeExitCode,
	dedupFindings,
	groupBySeverity,
	maskSecret,
	parseArgs,
	scanContent,
} from "../lib/commands/secret-scan.js";
import { PATTERNS } from "../lib/data/secret-patterns.js";

const BIN = join(import.meta.dirname, "..", "bin", "badi.js");
const TMP = join(import.meta.dirname, ".test-tmp-secrets");

// spawnSync returns the exit code without throwing — required to verify
// the K1 fix (JSON mode must return non-zero on critical findings).
const runRaw = (cwd, ...args) =>
	spawnSync("node", [BIN, "secret-scan", ...args], {
		encoding: "utf-8",
		timeout: 15000,
		cwd,
	});
const _runOk = (cwd, ...args) =>
	execFileSync("node", [BIN, "secret-scan", ...args], {
		encoding: "utf-8",
		timeout: 15000,
		cwd,
	});

// Literal sir pattern'lerini calistirma aninda birlestir (false-positive
// filtresinden kacinmak icin). Her PATTERNS entry icin canonical secret.
const SAMPLES = {
	"aws-access-key": "AK" + "IA" + "Z3YXK4R7Q2P5WVTM",
	"aws-secret": `AWS_SECRET_ACCESS_KEY = "${"a".repeat(35)}9X8Y/Z+1"`,
	"gcp-key": "AIza" + "Sy" + "C-1234567890_abcdef-1234567890_aBcDe",
	"github-pat": "ghp_" + "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8",
	"github-pat-fine": `github_pat_11AAAAAAA0${"B".repeat(30)}${"C".repeat(40)}DD`,
	"slack-token": "xoxb-" + "1234567890-1234567890-AbCdEfGhIjKlMnOp",
	"stripe-key": "sk_live_" + "A1B2C3D4E5F6G7H8I9J0K1L2",
	"openai-key": "sk-" + "Oa1b2c3d4e5f6g7h8i9j0",
	"anthropic-key":
		"sk-ant-" + "api03-" + "abcdefghijklmnopqrstuvwxyz1234567890ABCD",
	"npm-token": "npm_" + "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8",
	sendgrid:
		"SG." +
		"abcdefghij0123456789" +
		"." +
		"abcdefghij0123456789abcdefghij012345",
	twilio: "SK" + "0123456789abcdef0123456789abcdef",
	"private-key": "-----BEGIN RSA PRIVATE KEY-----",
	jwt:
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
		".eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4ifQ" +
		".SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
	"mongodb-uri": "mongodb://admin:RealPasswordValue@db.internal:27017/app",
	"postgres-uri": "postgres://app:RealPasswordValue@db.internal:5432/db",
	"generic-secret": `apiKey: "${"Z".repeat(28)}Yy"`,
};

function cleanTmp() {
	if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
	mkdirSync(TMP, { recursive: true });
}

describe("secret-scan: pure helpers", () => {
	it("maskSecret kisa degerleri yildizlar", () => {
		assert.equal(maskSecret("abc"), "***");
		assert.equal(maskSecret("12345678"), "********");
	});

	it("maskSecret uzun degerleri kismi gizler", () => {
		assert.equal(maskSecret("1234567890abcdef"), "1234...cdef");
	});

	it("scanContent context filter ile sadece eslesirse fire eder", () => {
		const findings = scanContent(
			'const x = "AKIA' + "Z3YXK4R7Q2P5WVTM" + '";',
			"f.js",
			PATTERNS,
		);
		assert.equal(findings.length, 1);
		assert.equal(findings[0].patternId, "aws-access-key");
	});

	it("scanContent false-positive filter 'example' ifadesini engeller", () => {
		const findings = scanContent(
			"const example = 'AKIAEXAMPLEKEY00000';",
			"f.js",
			PATTERNS,
		);
		assert.equal(findings.length, 0);
	});

	it("dedupFindings ayni dosyada ayni raw match'i tekille", () => {
		const f = {
			file: "a.js",
			line: 1,
			pattern: "AWS",
			patternId: "aws-access-key",
			severity: "KRITIK",
			rawMatch: "X",
			masked: "X",
		};
		assert.equal(dedupFindings([f, f]).length, 1);
	});

	it("dedupFindings ayni masked AMA farkli raw match collision yapmaz (K2)", () => {
		const a = {
			file: "a.js",
			line: 1,
			pattern: "OpenAI",
			patternId: "openai-key",
			severity: "KRITIK",
			rawMatch: "sk-AAAA111BBBB",
			masked: "sk-A...BBBB",
		};
		const b = { ...a, rawMatch: "sk-AAAA222BBBB" };
		assert.equal(dedupFindings([a, b]).length, 2);
	});

	it("dedupFindings ayni raw match farkli dosyalarda ikisini de tutar", () => {
		const a = {
			file: "a.js",
			line: 1,
			pattern: "OpenAI",
			patternId: "openai-key",
			severity: "KRITIK",
			rawMatch: "sk-XYZ",
			masked: "x",
		};
		const b = { ...a, file: "b.js" };
		assert.equal(dedupFindings([a, b]).length, 2);
	});

	it("applyIgnore pattern-id'leri filtreler", () => {
		const findings = [
			{ patternId: "jwt", severity: "ORTA" },
			{ patternId: "aws-access-key", severity: "KRITIK" },
		];
		const filtered = applyIgnore(findings, new Set(["jwt"]));
		assert.equal(filtered.length, 1);
		assert.equal(filtered[0].patternId, "aws-access-key");
	});

	it("groupBySeverity her seviyeyi listeler", () => {
		const g = groupBySeverity([
			{ severity: "KRITIK" },
			{ severity: "YUKSEK" },
			{ severity: "YUKSEK" },
		]);
		assert.equal(g.KRITIK.length, 1);
		assert.equal(g.YUKSEK.length, 2);
		assert.equal(g.ORTA.length, 0);
	});

	it("computeExitCode critical (default): KRITIK -> 1", () => {
		assert.equal(computeExitCode([{ severity: "KRITIK" }], "critical"), 1);
		assert.equal(computeExitCode([{ severity: "ORTA" }], "critical"), 0);
		assert.equal(computeExitCode([], "critical"), 0);
	});

	it("computeExitCode strict: herhangi bir bulgu -> 1", () => {
		assert.equal(computeExitCode([{ severity: "DUSUK" }], "strict"), 1);
		assert.equal(computeExitCode([], "strict"), 0);
	});

	it("computeExitCode never: her zaman 0", () => {
		assert.equal(computeExitCode([{ severity: "KRITIK" }], "never"), 0);
	});

	it("parseArgs default'lari atar", () => {
		const f = parseArgs([]);
		assert.equal(f.scanGit, false);
		assert.equal(f.jsonOutput, false);
		assert.equal(f.exitMode, "critical");
		assert.equal(f.maxCommits, 100);
	});

	it("parseArgs --exit-code strict|never gecirir", () => {
		assert.equal(parseArgs(["--exit-code", "strict"]).exitMode, "strict");
		assert.equal(parseArgs(["--exit-code", "never"]).exitMode, "never");
	});

	it("parseArgs --exit-code gecersiz mode'u yoksayar", () => {
		assert.equal(parseArgs(["--exit-code", "bogus"]).exitMode, "critical");
	});

	it("parseArgs --max-commits / --max-files numerik dogrular", () => {
		const f = parseArgs(["--max-commits", "50", "--max-files", "1000"]);
		assert.equal(f.maxCommits, 50);
		assert.equal(f.maxFiles, 1000);
	});

	it("parseArgs --ignore virgul ayrik id'leri Set'e koyar", () => {
		const f = parseArgs(["--ignore", "jwt,github-pat"]);
		assert.ok(f.ignore.has("jwt"));
		assert.ok(f.ignore.has("github-pat"));
	});

	it("PATTERNS canonical bir AWS Access Key SAMPLE'i match eder", () => {
		const findings = scanContent(SAMPLES["aws-access-key"], "f.js", PATTERNS);
		assert.ok(findings.some((f) => f.patternId === "aws-access-key"));
	});
});

describe("secret-scan: CLI end-to-end", () => {
	beforeEach(cleanTmp);
	afterEach(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
	});

	it("yardim gosterir", () => {
		const out = execFileSync("node", [BIN, "secret-scan", "--help"], {
			encoding: "utf-8",
		});
		assert.ok(out.includes("Secret"));
		assert.ok(out.includes("--exit-code"));
		assert.ok(out.includes("Cikis kodlari"));
	});

	it("temiz proje bulamaz, exit 0", () => {
		writeFileSync(join(TMP, "index.js"), "const x = 'hello world';");
		const r = runRaw(TMP);
		assert.equal(r.status, 0);
		assert.ok(r.stdout.includes("tespit edilmedi"));
	});

	it("AWS key text mode exit 1", () => {
		writeFileSync(
			join(TMP, "leak.js"),
			`const key = "${SAMPLES["aws-access-key"]}";`,
		);
		const r = runRaw(TMP);
		assert.equal(r.status, 1);
		assert.ok(r.stdout.includes("KRITIK"));
	});

	it("K1 fix: JSON mode KRITIK bulguda exit 1 dondurur", () => {
		writeFileSync(
			join(TMP, "leak.js"),
			`const key = "${SAMPLES["aws-access-key"]}";`,
		);
		const r = runRaw(TMP, "--format", "json");
		assert.equal(r.status, 1, "JSON mode kritik bulguda exit 1 olmali");
		const parsed = JSON.parse(r.stdout);
		assert.ok(parsed.findings.length >= 1);
	});

	it("--exit-code never KRITIK olsa bile 0 dondurur", () => {
		writeFileSync(
			join(TMP, "leak.js"),
			`const key = "${SAMPLES["aws-access-key"]}";`,
		);
		const r = runRaw(TMP, "--exit-code", "never");
		assert.equal(r.status, 0);
	});

	it("--exit-code strict ORTA bulguda exit 1", () => {
		writeFileSync(join(TMP, "leak.js"), `const t = "${SAMPLES.jwt}";`);
		const r = runRaw(TMP, "--exit-code", "strict");
		assert.equal(r.status, 1);
	});

	it("JSON ciktisi parseable + scanned.symlinksSkipped alani var", () => {
		writeFileSync(join(TMP, "ok.js"), "var a = 1;");
		const r = runRaw(TMP, "--format", "json");
		assert.equal(r.status, 0);
		const parsed = JSON.parse(r.stdout);
		assert.ok(Array.isArray(parsed.findings));
		assert.equal(parsed.scanned.symlinksSkipped, 0);
	});

	it("--ignore patternId KRITIK'i yoksayinca exit 0", () => {
		writeFileSync(
			join(TMP, "leak.js"),
			`const key = "${SAMPLES["aws-access-key"]}";`,
		);
		const r = runRaw(TMP, "--ignore", "aws-access-key");
		assert.equal(r.status, 0);
	});

	it(".secretignore dosyasi pattern-id'leri yoksayar", () => {
		writeFileSync(
			join(TMP, "leak.js"),
			`const key = "${SAMPLES["aws-access-key"]}";`,
		);
		writeFileSync(join(TMP, ".secretignore"), "# yorum\naws-access-key\n");
		const r = runRaw(TMP);
		assert.equal(r.status, 0);
	});

	it("Y1 fix: symlink'ler atlanir (cycle koruma)", {
		skip: process.platform === "win32",
	}, () => {
		writeFileSync(join(TMP, "real.js"), "var a = 1;");
		try {
			symlinkSync("./nonexistent", join(TMP, "broken-link"));
			symlinkSync(".", join(TMP, "cycle-link"));
		} catch (e) {
			// Bazi FS'ler symlink desteklemez (windows wsl bridge vb.) — skip
			if (e.code === "EPERM") return;
			throw e;
		}
		const r = runRaw(TMP, "--format", "json");
		assert.equal(r.status, 0);
		const parsed = JSON.parse(r.stdout);
		assert.ok(parsed.scanned.symlinksSkipped >= 1);
	});

	it("K2 fix: ayni dosyada 2 farkli OpenAI key (ayni prefix/suffix) 2 finding", () => {
		// Iki gercek-format OpenAI key, ilk 4 + son 4 ortak ama govde farkli.
		// rawMatch'i farkli oldugundan dedup kapatamayacak.
		writeFileSync(
			join(TMP, "two.js"),
			'const a = "sk-AAAA' +
				"1".repeat(20) +
				'BBBB";\n' +
				'const b = "sk-AAAA' +
				"2".repeat(20) +
				'BBBB";',
		);
		const r = runRaw(TMP, "--format", "json");
		const parsed = JSON.parse(r.stdout);
		const openaiHits = parsed.findings.filter(
			(f) => f.patternId === "openai-key",
		);
		assert.ok(
			openaiHits.length >= 2,
			`K2: 2 finding bekleniyor, ${openaiHits.length}`,
		);
	});

	it("Y2 fix: 40-char hex (SHA-1) yorum icinde DUSUK uyarisi vermez", () => {
		// Eski github-classic pattern false-positive yariyordu; yeni surumde
		// pattern kaldirildi, hex artik match etmemeli.
		writeFileSync(
			join(TMP, "sha.js"),
			"// github.com commit b02a44c8d3f0e9c01a4f2b6e7d8c9f0e1a2b3c4d ref\n",
		);
		const r = runRaw(TMP, "--format", "json");
		assert.equal(r.status, 0);
		const parsed = JSON.parse(r.stdout);
		assert.equal(parsed.findings.length, 0);
	});

	it("--max-files siniri asilirsa erken durur", () => {
		for (let i = 0; i < 5; i++) {
			writeFileSync(join(TMP, `f${i}.js`), "var a = 1;");
		}
		const r = runRaw(TMP, "--max-files", "2", "--format", "json");
		assert.equal(r.status, 0);
		const parsed = JSON.parse(r.stdout);
		assert.ok(parsed.scanned.files <= 2);
	});

	it("Anthropic key sadece 'Anthropic Key' patern'inde fire eder (OpenAI overlap yok)", () => {
		writeFileSync(
			join(TMP, "anth.js"),
			`const k = "${SAMPLES["anthropic-key"]}";`,
		);
		const r = runRaw(TMP, "--format", "json");
		const parsed = JSON.parse(r.stdout);
		const ids = new Set(parsed.findings.map((f) => f.patternId));
		assert.ok(ids.has("anthropic-key"));
		assert.ok(
			!ids.has("openai-key"),
			"OpenAI pattern Anthropic key'i match etmemeli",
		);
	});
});

describe("secret-scan: pattern coverage", () => {
	beforeEach(cleanTmp);
	afterEach(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
	});

	// Her PATTERNS entry icin canonical SAMPLE'i planted-file'a yazip
	// scanContent'in match'lemesini dogrula. CLI'a dokunmadan unit test.
	for (const p of PATTERNS) {
		if (!SAMPLES[p.id]) continue;
		it(`${p.id} pattern canonical SAMPLE'i match eder`, () => {
			const sample = SAMPLES[p.id];
			// private-key sample'i context'siz dogrudan match olur.
			const content = `// test fixture\nconst k = "${sample}";\n`;
			const findings = scanContent(content, "fixture.js", PATTERNS);
			assert.ok(
				findings.some((f) => f.patternId === p.id),
				`${p.id} canonical SAMPLE icinde match etmeli; bulundu: ${findings
					.map((f) => f.patternId)
					.join(",")}`,
			);
		});
	}
});

describe("secret-scan: --git history", () => {
	beforeEach(cleanTmp);
	afterEach(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
	});

	it("git history'de silinen AWS key'i yakalar + JSON exit 1", () => {
		execFileSync("git", ["-C", TMP, "init", "-q"], { encoding: "utf-8" });
		execFileSync("git", ["-C", TMP, "config", "user.email", "t@t"]);
		execFileSync("git", ["-C", TMP, "config", "user.name", "t"]);
		const secretFile = join(TMP, "intro.js");
		writeFileSync(secretFile, `const k = "${SAMPLES["aws-access-key"]}";\n`);
		execFileSync("git", ["-C", TMP, "add", "intro.js"]);
		execFileSync("git", ["-C", TMP, "commit", "-q", "-m", "intro"]);
		writeFileSync(secretFile, "const k = 'PLACEHOLDER';\n");
		execFileSync("git", ["-C", TMP, "add", "intro.js"]);
		execFileSync("git", ["-C", TMP, "commit", "-q", "-m", "remove"]);

		// Working tree: temiz
		const wt = runRaw(TMP, "--format", "json");
		assert.equal(wt.status, 0);

		// --git: tarihte yakalamali + exit 1 (K1 ek vaka)
		const gh = runRaw(TMP, "--git", "--format", "json");
		assert.equal(gh.status, 1, "git history'deki KRITIK bulguda exit 1");
		const parsed = JSON.parse(gh.stdout);
		assert.ok(parsed.findings.some((f) => f.patternId === "aws-access-key"));
	});

	it("--max-commits siniri uygulanir + truncated bayragi", () => {
		execFileSync("git", ["-C", TMP, "init", "-q"], { encoding: "utf-8" });
		execFileSync("git", ["-C", TMP, "config", "user.email", "t@t"]);
		execFileSync("git", ["-C", TMP, "config", "user.name", "t"]);
		for (let i = 0; i < 4; i++) {
			writeFileSync(join(TMP, `f${i}.txt`), `noop${i}`);
			execFileSync("git", ["-C", TMP, "add", "."]);
			execFileSync("git", ["-C", TMP, "commit", "-q", "-m", `c${i}`]);
		}
		const r = runRaw(TMP, "--git", "--max-commits", "2", "--format", "json");
		assert.equal(r.status, 0);
		const parsed = JSON.parse(r.stdout);
		assert.equal(parsed.scanned.commits, 2);
		assert.equal(parsed.scanned.truncated, true);
		assert.equal(parsed.scanned.totalCommits, 4);
	});
});
