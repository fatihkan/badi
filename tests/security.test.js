// `badi security` command tests (v1.31.0+).
//
// 4 subcommands: baseline / triage / pipeline / init --ci

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	utimesSync,
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
	it("badi security --help works, lists 4 subcommands", () => {
		const r = runBadi(["security", "--help"]);
		assert.equal(r.status, 0);
		assert.match(r.stdout, /baseline/);
		assert.match(r.stdout, /triage/);
		assert.match(r.stdout, /pipeline/);
		assert.match(r.stdout, /init/);
		assert.match(r.stdout, /security-review/);
	});

	it("badi security unknown subcommand exits 1", () => {
		const r = runBadi(["security", "foobar"]);
		assert.equal(r.status, 1);
	});

	it("badi security init --ci writes scaffold workflow", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-sec-init-"));
		try {
			const r = runBadi(["security", "init", "--ci"], { cwd: tmp });
			assert.equal(r.status, 0, `stderr: ${r.stderr}`);
			const wf = join(tmp, ".github", "workflows", "security-review.yml");
			assert.ok(existsSync(wf), "scaffold file was not created");
			// Verify the workflow content
			const body = readFileSync(wf, "utf-8");
			assert.match(body, /permissions:/);
			assert.match(body, /anthropics\/claude-code-security-review/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("badi security init --ci errors if it already exists", () => {
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

	it("badi security triage exits 1 when no report", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-sec-triage-"));
		try {
			const r = runBadi(["security", "triage"], { cwd: tmp });
			assert.equal(r.status, 1);
			assert.match(r.stderr, /No report/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	// v1.31.0+ O1 hotfix: baseline integration test so the K1 bug does not come back.
	it("badi security baseline actually runs secret-scan (K1 regression)", () => {
		// Run baseline in a clean repo — it wants the secret-scan line, the npm audit
		// line, and the "No findings" message.
		const tmp = mkdtempSync(join(tmpdir(), "badi-sec-baseline-"));
		try {
			// Minimal project: secret-scan runs without package.json; audit is skipped
			writeFileSync(join(tmp, "README.md"), "# test\n");
			// Git init — for projectRoot detection
			spawnSync("git", ["init"], { cwd: tmp, encoding: "utf-8" });

			const r = runBadi(["security", "baseline"], { cwd: tmp });
			// secret-scan must run; if there is no audit lock it must skip
			assert.match(
				r.stdout,
				/\[1\/2\].*secret-scan/,
				`No secret-scan line. stdout: ${r.stdout.slice(0, 300)}`,
			);
			assert.match(r.stdout, /No secret findings|secret findings/);
			assert.match(r.stdout, /skipped.*no lock file/);
			// K1 regression check: it must not print that the secret-scan output could not be parsed
			assert.doesNotMatch(
				r.stderr,
				/secret-scan ciktisi parse edilemedi/,
				"K1 hotfix regression: the secret-scan parse error came back",
			);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	// v1.31.0+ K2 hotfix regression: word-boundary regex over-counting
	it("badi security triage must not produce 'below'/'follow'/'yellow' false positives", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-sec-k2-"));
		try {
			const reportDir = join(tmp, "security-report");
			mkdirSync(reportDir, { recursive: true });
			// There should be a single "DUSUK" word, but "follow", "yellow", "below" are traps
			writeFileSync(
				join(reportDir, "SECURITY-REPORT.md"),
				"# Report\n\nThe following code is below threshold, yellow flag.\n\n## DUSUK style\n",
			);

			const r = runBadi(["security", "triage"], { cwd: tmp });
			// Heading-based count: should be exactly 1 DUSUK, never 4+
			assert.match(r.stdout, /Low.*1\b/, `K2 regression. stdout: ${r.stdout}`);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	// ─── pipeline (v1.34+) ───

	it("badi security pipeline: empty chain reports missing stages, exits 0", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-sec-pipe1-"));
		try {
			spawnSync("git", ["init"], { cwd: tmp, encoding: "utf-8" });
			const r = runBadi(["security", "pipeline"], { cwd: tmp });
			assert.equal(r.status, 0, `stderr: ${r.stderr}`);
			assert.match(r.stdout, /VULN-FINDINGS\.json/);
			assert.match(r.stdout, /missing/);
			// THREAT_MODEL.md is the optional head — marked none, not missing
			assert.match(r.stdout, /THREAT_MODEL\.md.*\(optional\)/);
			assert.match(r.stdout, /Next:/);
			assert.match(r.stdout, /run security check/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("badi security pipeline: findings present, triage missing → suggests verify stage", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-sec-pipe2-"));
		try {
			spawnSync("git", ["init"], { cwd: tmp, encoding: "utf-8" });
			writeFileSync(join(tmp, "VULN-FINDINGS.json"), '{"findings":[]}');
			const r = runBadi(["security", "pipeline"], { cwd: tmp });
			assert.equal(r.status, 0);
			assert.match(r.stdout, /TRIAGE\.json.*missing|missing.*TRIAGE/s);
			assert.match(r.stdout, /verify stage/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("badi security pipeline: downstream older than upstream is flagged stale", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-sec-pipe3-"));
		try {
			spawnSync("git", ["init"], { cwd: tmp, encoding: "utf-8" });
			writeFileSync(join(tmp, "VULN-FINDINGS.json"), '{"findings":[]}');
			writeFileSync(join(tmp, "TRIAGE.json"), '{"findings":[]}');
			// Make TRIAGE.json 60s older than VULN-FINDINGS.json (deterministic mtimes)
			const now = Date.now() / 1000;
			utimesSync(join(tmp, "TRIAGE.json"), now - 60, now - 60);
			utimesSync(join(tmp, "VULN-FINDINGS.json"), now, now);
			const r = runBadi(["security", "pipeline"], { cwd: tmp });
			assert.equal(r.status, 0);
			assert.match(r.stdout, /stale/i);
			assert.match(r.stdout, /Re-run/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("badi security pipeline: full fresh chain reports complete, no stale", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-sec-pipe4-"));
		try {
			spawnSync("git", ["init"], { cwd: tmp, encoding: "utf-8" });
			const now = Date.now() / 1000;
			writeFileSync(join(tmp, "THREAT_MODEL.md"), "# Threat Model\n");
			writeFileSync(join(tmp, "VULN-FINDINGS.json"), '{"findings":[]}');
			writeFileSync(join(tmp, "TRIAGE.json"), '{"findings":[]}');
			// Explicit mtime order: head oldest → triage newest
			utimesSync(join(tmp, "THREAT_MODEL.md"), now - 120, now - 120);
			utimesSync(join(tmp, "VULN-FINDINGS.json"), now - 60, now - 60);
			utimesSync(join(tmp, "TRIAGE.json"), now, now);
			const r = runBadi(["security", "pipeline"], { cwd: tmp });
			assert.equal(r.status, 0);
			assert.doesNotMatch(r.stdout, /stale/i);
			assert.doesNotMatch(r.stdout, /missing/);
			assert.match(r.stdout, /Chain complete/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("badi security pipeline --json emits machine-readable status", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-sec-pipe5-"));
		try {
			spawnSync("git", ["init"], { cwd: tmp, encoding: "utf-8" });
			writeFileSync(join(tmp, "VULN-FINDINGS.json"), '{"findings":[]}');
			const r = runBadi(["security", "pipeline", "--json"], { cwd: tmp });
			assert.equal(r.status, 0);
			const parsed = JSON.parse(r.stdout);
			assert.equal(parsed.pipeline.length, 3);
			const findings = parsed.pipeline.find(
				(s) => s.file === "VULN-FINDINGS.json",
			);
			assert.equal(findings.exists, true);
			assert.equal(findings.stale, false);
			assert.match(parsed.next, /verify stage/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("badi security pipeline is read-only — writes no files", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-sec-pipe6-"));
		try {
			spawnSync("git", ["init"], { cwd: tmp, encoding: "utf-8" });
			writeFileSync(join(tmp, "VULN-FINDINGS.json"), '{"findings":[]}');
			const before = readdirSync(tmp).sort();
			const r = runBadi(["security", "pipeline"], { cwd: tmp });
			assert.equal(r.status, 0);
			const after = readdirSync(tmp).sort();
			assert.deepEqual(
				after,
				before,
				"pipeline must not create or remove files",
			);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("badi security triage counts severities when a report exists", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-sec-triage2-"));
		try {
			const reportDir = join(tmp, "security-report");
			mkdirSync(reportDir, { recursive: true });
			writeFileSync(
				join(reportDir, "SECURITY-REPORT.md"),
				"# Report\n\n## KRITIK SQLi\n## YUKSEK XSS\n## ORTA CSRF\n## DUSUK style\n",
			);

			const r = runBadi(["security", "triage"], { cwd: tmp });
			// If there is a critical finding, exit 1 — expected
			assert.equal(r.status, 1);
			assert.match(r.stdout, /Critical.*1/);
			assert.match(r.stdout, /High.*1/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});
});
