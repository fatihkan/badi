// Consolidated semver helpers (v1.35.0): parseVersion/bumpVersion/semverGt were
// duplicated across plugin-manifest.js, release.js, mobile.js, update-check.js
// and now live in lib/helpers.js. These guard the single source directly;
// plugin-manifest.test.js and release-checks.test.js still exercise the
// re-exported surfaces.

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bumpVersion, parseVersion, semverGt } from "../lib/helpers.js";

describe("helpers semver — parseVersion", () => {
	it("parses a 3-part version", () => {
		assert.deepEqual(parseVersion("1.34.2"), {
			major: 1,
			minor: 34,
			patch: 2,
		});
	});

	it("tolerates trailing prerelease/build metadata", () => {
		assert.deepEqual(parseVersion("2.0.0-beta.3"), {
			major: 2,
			minor: 0,
			patch: 0,
		});
	});

	it("returns null for unparseable / non-3-part input", () => {
		assert.equal(parseVersion("1.30"), null);
		assert.equal(parseVersion("abc"), null);
		assert.equal(parseVersion(""), null);
		assert.equal(parseVersion(null), null);
		assert.equal(parseVersion(undefined), null);
	});
});

describe("helpers semver — bumpVersion", () => {
	it("bumps patch/minor/major", () => {
		assert.equal(bumpVersion("1.29.0", "patch"), "1.29.1");
		assert.equal(bumpVersion("1.29.5", "minor"), "1.30.0");
		assert.equal(bumpVersion("1.29.5", "major"), "2.0.0");
	});

	it("defaults to patch", () => {
		assert.equal(bumpVersion("1.34.2"), "1.34.3");
	});

	it("throws on an unparseable version (no silent 1.2.NaN)", () => {
		assert.throws(() => bumpVersion("1.2", "patch"), /unparseable version/);
		assert.throws(() => bumpVersion("nope"), /unparseable version/);
	});
});

describe("helpers semver — semverGt", () => {
	it("compares across major/minor/patch", () => {
		assert.equal(semverGt("1.10.0", "1.9.0"), true);
		assert.equal(semverGt("2.0.0", "1.99.99"), true);
		assert.equal(semverGt("1.0.1", "1.0.0"), true);
		assert.equal(semverGt("1.0.0", "1.0.1"), false);
		assert.equal(semverGt("1.0.0", "1.0.0"), false);
	});

	it("ignores prerelease tails and is conservative on bad input", () => {
		assert.equal(semverGt("1.2.3-beta", "1.2.3"), false); // same core
		assert.equal(semverGt("garbage", "1.0.0"), false);
		assert.equal(semverGt("1.0.0", "garbage"), false);
	});
});
