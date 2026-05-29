import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	bumpVersion,
	CHECKS,
	checkBranch,
	checkGhCli,
	checkLint,
	checkPackageJson,
	runChecks,
} from "../lib/commands/release.js";

describe("release checks (post C2 refactor)", () => {
	it("CHECKS dizisi en az 5 check icerir", () => {
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

	it("checkLint --skip-lint atlar (warn, pass)", () => {
		const r = checkLint({ skipLint: true });
		assert.equal(r.name, "lint");
		assert.equal(r.pass, true);
		assert.equal(r.level, "warn");
	});

	it("checkLint gercek calistirma gecerli level doner", () => {
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
});
