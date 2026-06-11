import assert from "node:assert/strict";
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
	bumpVersion,
	CHECKS,
	checkBranch,
	checkDocsSync,
	checkGhCli,
	checkLint,
	checkPackageJson,
	runChecks,
} from "../lib/commands/release.js";

describe("release checks (post C2 refactor)", () => {
	it("CHECKS array contains at least 5 checks", () => {
		assert.ok(Array.isArray(CHECKS));
		assert.ok(CHECKS.length >= 5);
	});

	it("bumpVersion patch", () => {
		assert.equal(bumpVersion("1.29.0", "patch"), "1.29.1");
	});

	it("bumpVersion minor", () => {
		assert.equal(bumpVersion("1.29.5", "minor"), "1.30.0");
	});

	it("bumpVersion major", () => {
		assert.equal(bumpVersion("1.29.5", "major"), "2.0.0");
	});

	it("checkPackageJson null pkg fail", () => {
		const r = checkPackageJson({ pkg: null });
		assert.equal(r.level, "fail");
	});

	it("checkPackageJson valid pkg ok", () => {
		const r = checkPackageJson({
			pkg: { name: "x", version: "1.0.0" },
		});
		assert.equal(r.level, "ok");
		assert.match(r.label, /x v1\.0\.0/);
	});

	it("checkBranch returns level field", () => {
		const r = checkBranch();
		assert.ok(["ok", "warn", "fail"].includes(r.level));
	});

	it("checkGhCli returns level field", () => {
		const r = checkGhCli();
		assert.ok(["ok", "warn", "fail"].includes(r.level));
	});

	it("checkLint --skip-lint skips (warn, pass)", () => {
		const r = checkLint({ skipLint: true });
		assert.equal(r.name, "lint");
		assert.equal(r.pass, true);
		assert.equal(r.level, "warn");
	});

	it("checkLint returns a valid level on real execution", () => {
		// biome calistirir (hizli); repo durumuna gore ok/fail — yapiyi dogrula.
		const r = checkLint({});
		assert.equal(r.name, "lint");
		assert.ok(["ok", "fail"].includes(r.level));
	});

	it("runChecks calls all", () => {
		const results = runChecks({ pkg: null, skipTest: true, skipLint: true });
		assert.ok(results.length >= 4);
		for (const r of results) {
			assert.ok(typeof r.label === "string");
			assert.ok(["ok", "warn", "fail"].includes(r.level));
		}
	});

	// ─── docs-sync gate (v1.34.1+) ───

	it("checkDocsSync passes on the real repo (counts must stay in sync)", () => {
		const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
		const r = checkDocsSync({ targetVersion: pkg.version });
		assert.ok(r, "expected a result on a repo with a README");
		assert.equal(r.name, "docs-sync");
		assert.equal(r.level, "ok", `docs drift detected: ${r.hint}`);
	});

	it("checkDocsSync fails on disagreeing README test counts", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-docs-sync-"));
		try {
			writeFileSync(
				join(tmp, "README.md"),
				'<img src="https://img.shields.io/badge/tests-100%20passing-x" />\n' +
					"| **200 passing tests** | stuff |\n",
			);
			const r = checkDocsSync({ paths: { readme: join(tmp, "README.md") } });
			assert.equal(r.level, "fail");
			assert.match(r.hint, /test counts disagree/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("checkDocsSync fails when SECURITY.md misses the target minor", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-docs-sync2-"));
		try {
			writeFileSync(join(tmp, "README.md"), "# plain readme, no counts\n");
			writeFileSync(join(tmp, "SECURITY.md"), "| 1.33.x | Active |\n");
			const r = checkDocsSync({
				targetVersion: "1.99.0",
				paths: {
					readme: join(tmp, "README.md"),
					security: join(tmp, "SECURITY.md"),
				},
			});
			assert.equal(r.level, "fail");
			assert.match(r.hint, /1\.99\.x/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("checkDocsSync fails on harness-table subagent drift", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-docs-sync3-"));
		try {
			writeFileSync(
				join(tmp, "README.md"),
				"| Claude Code | `CLAUDE.md` | 84 | `.mcp.json` | 27 | 14 | 62 |\n",
			);
			mkdirSync(join(tmp, "agents"));
			for (let i = 0; i < 3; i++)
				writeFileSync(join(tmp, "agents", `a${i}.md`), "x");
			const r = checkDocsSync({
				paths: {
					readme: join(tmp, "README.md"),
					agentsDir: join(tmp, "agents"),
				},
			});
			assert.equal(r.level, "fail");
			assert.match(r.hint, /27 subagents, disk has 3/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("checkDocsSync returns null when README is absent", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-docs-sync4-"));
		try {
			const r = checkDocsSync({ paths: { readme: join(tmp, "nope.md") } });
			assert.equal(r, null);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});
});
