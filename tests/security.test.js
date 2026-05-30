// `badi security` komutu testleri (v1.31.0+).
//
// 3 subkomut: baseline / triage / init --ci

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BADI = resolve(__dirname, "..", "bin", "badi.js");

function runBadi(args, opts = {}) {
	return spawnSync(process.execPath, [BADI, ...args], {
		encoding: "utf-8",
		timeout: 30_000,
		...opts,
	});
}

describe("badi security command", () => {
	it("badi security --help calisir, 3 subkomut listeler", () => {
		const r = runBadi(["security", "--help"]);
		assert.equal(r.status, 0);
		assert.match(r.stdout, /baseline/);
		assert.match(r.stdout, /triage/);
		assert.match(r.stdout, /init/);
		assert.match(r.stdout, /security-review/);
	});

	it("badi security bilinmeyen subkomut exit 1", () => {
		const r = runBadi(["security", "foobar"]);
		assert.equal(r.status, 1);
	});

	it("badi security init --ci scaffold workflow yazar", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-sec-init-"));
		try {
			const r = runBadi(["security", "init", "--ci"], { cwd: tmp });
			assert.equal(r.status, 0, `stderr: ${r.stderr}`);
			const wf = join(tmp, ".github", "workflows", "security-review.yml");
			assert.ok(existsSync(wf), "scaffold dosyasi olusturulmadi");
			// Workflow icerigi dogrula
			const body = readFileSync(wf, "utf-8");
			assert.match(body, /permissions:/);
			assert.match(body, /anthropics\/claude-code-security-review/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("badi security init --ci uzerinde varsa hata", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-sec-init2-"));
		try {
			const wfDir = join(tmp, ".github", "workflows");
			mkdirSync(wfDir, { recursive: true });
			writeFileSync(join(wfDir, "security-review.yml"), "# placeholder\n");

			const r = runBadi(["security", "init", "--ci"], { cwd: tmp });
			assert.equal(r.status, 1);
			assert.match(r.stderr, /Won't overwrite existing file/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("badi security triage rapor yoksa exit 1", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-sec-triage-"));
		try {
			const r = runBadi(["security", "triage"], { cwd: tmp });
			assert.equal(r.status, 1);
			assert.match(r.stderr, /No report/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	// v1.31.0+ O1 hotfix: K1 bug'inin tekrar gelmemesi icin baseline integration testi.
	it("badi security baseline secret-scan'i gercekten calistirir (K1 regression)", () => {
		// Clean repo'da baseline calistir — secret-scan satirini, npm audit satirini
		// ve "Sir bulgu yok" mesajini ister.
		const tmp = mkdtempSync(join(tmpdir(), "badi-sec-baseline-"));
		try {
			// Minimal proje: package.json olmadan secret-scan calisir; audit skip eder
			writeFileSync(join(tmp, "README.md"), "# test\n");
			// Git init — projectRoot tespiti icin
			spawnSync("git", ["init"], { cwd: tmp, encoding: "utf-8" });

			const r = runBadi(["security", "baseline"], { cwd: tmp });
			// secret-scan calismali, audit lock yoksa skip etmeli
			assert.match(
				r.stdout,
				/\[1\/2\].*secret-scan/,
				`secret-scan satiri yok. stdout: ${r.stdout.slice(0, 300)}`,
			);
			assert.match(r.stdout, /No secret findings|secret findings/);
			assert.match(r.stdout, /skipped.*no lock file/);
			// K1 regression check: secret-scan ciktisi parse edilemedi yazmamali
			assert.doesNotMatch(
				r.stderr,
				/secret-scan ciktisi parse edilemedi/,
				"K1 hotfix gerileme: secret-scan parse hatasi tekrar dondu",
			);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	// v1.31.0+ K2 hotfix regression: word-boundary regex over-counting
	it("badi security triage 'below'/'follow'/'yellow' false positive uretmemeli", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-sec-k2-"));
		try {
			const reportDir = join(tmp, "security-report");
			mkdirSync(reportDir, { recursive: true });
			// Tek "DUSUK" word olmali ama "follow", "yellow", "below" trapleri var
			writeFileSync(
				join(reportDir, "SECURITY-REPORT.md"),
				"# Report\n\nThe following code is below threshold, yellow flag.\n\n## DUSUK style\n",
			);

			const r = runBadi(["security", "triage"], { cwd: tmp });
			// Heading-based count: tam 1 DUSUK olmali, asla 4+ degil
			assert.match(r.stdout, /Low.*1\b/, `K2 regression. stdout: ${r.stdout}`);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("badi security triage rapor varsa severity sayim", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-sec-triage2-"));
		try {
			const reportDir = join(tmp, "security-report");
			mkdirSync(reportDir, { recursive: true });
			writeFileSync(
				join(reportDir, "SECURITY-REPORT.md"),
				"# Report\n\n## KRITIK SQLi\n## YUKSEK XSS\n## ORTA CSRF\n## DUSUK style\n",
			);

			const r = runBadi(["security", "triage"], { cwd: tmp });
			// Kritik bulgu varsa exit 1 — beklenir
			assert.equal(r.status, 1);
			assert.match(r.stdout, /Critical.*1/);
			assert.match(r.stdout, /High.*1/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});
});
