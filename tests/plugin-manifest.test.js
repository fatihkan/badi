import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	BADI_DEFAULT_API_VERSION,
	checkApiCompat,
	findUnsatisfied,
	parseDependency,
	parseRange,
	parseVersion,
	topoSort,
	validateManifest,
} from "../lib/data/plugin-manifest.js";

describe("parseVersion", () => {
	it("parses X.Y.Z", () => {
		const v = parseVersion("1.30.0");
		assert.deepEqual(v, { major: 1, minor: 30, patch: 0 });
	});

	it("invalid versions returns null", () => {
		assert.equal(parseVersion(""), null);
		assert.equal(parseVersion("abc"), null);
		assert.equal(parseVersion(null), null);
	});

	it("null when there is no patch in X.Y format", () => {
		assert.equal(parseVersion("1.30"), null);
	});
});

describe("parseRange", () => {
	it("'*' is always true", () => {
		const m = parseRange("*");
		assert.ok(m("1.0.0"));
		assert.ok(m("99.99.99"));
	});

	it("'1.x' only major 1", () => {
		const m = parseRange("1.x");
		assert.ok(m("1.0.0"));
		assert.ok(m("1.99.99"));
		assert.ok(!m("2.0.0"));
		assert.ok(!m("0.99.99"));
	});

	it("'1.30.x' major 1 minor 30", () => {
		const m = parseRange("1.30.x");
		assert.ok(m("1.30.0"));
		assert.ok(m("1.30.99"));
		assert.ok(!m("1.31.0"));
	});

	it("'1.30.5' exact", () => {
		const m = parseRange("1.30.5");
		assert.ok(m("1.30.5"));
		assert.ok(!m("1.30.6"));
	});

	it("'>=1.30' gte basic", () => {
		const m = parseRange(">=1.30");
		assert.ok(m("1.30.0"));
		assert.ok(m("1.30.5"));
		assert.ok(m("2.0.0"));
		assert.ok(!m("1.29.99"));
	});

	it("'>=1.30.5' gte patch", () => {
		const m = parseRange(">=1.30.5");
		assert.ok(m("1.30.5"));
		assert.ok(m("1.30.6"));
		assert.ok(m("1.31.0"));
		assert.ok(!m("1.30.4"));
	});

	it("unknown format is permissive (true for everything)", () => {
		const m = parseRange("garbage");
		assert.ok(m("1.0.0"));
	});
});

describe("validateManifest", () => {
	it("invalid when there is no name", () => {
		const r = validateManifest({});
		assert.ok(!r.valid);
		assert.ok(r.errors.length > 0);
	});

	it("minimum valid manifest", () => {
		const r = validateManifest({ name: "x" });
		assert.ok(r.valid);
	});

	it("error when badi.apiVersion is not a string", () => {
		const r = validateManifest({
			name: "x",
			badi: { apiVersion: 1 },
		});
		assert.ok(!r.valid);
	});

	it("error when badi.dependsOn is not an array", () => {
		const r = validateManifest({
			name: "x",
			badi: { dependsOn: "foo" },
		});
		assert.ok(!r.valid);
	});

	it("error on a non-string inside badi.dependsOn", () => {
		const r = validateManifest({
			name: "x",
			badi: { dependsOn: ["foo", 123] },
		});
		assert.ok(!r.valid);
	});
});

describe("checkApiCompat", () => {
	it("defaults to 1.x when there is no apiVersion", () => {
		const r = checkApiCompat({ name: "x" }, "1.30.0");
		assert.ok(r.ok);
		assert.equal(r.range, BADI_DEFAULT_API_VERSION);
	});

	it("rejects an incompatible major", () => {
		const r = checkApiCompat({ badi: { apiVersion: "2.x" } }, "1.30.0");
		assert.ok(!r.ok);
		assert.match(r.reason, /not compatible/);
	});

	it("engines.badi is also accepted (fallback)", () => {
		const r = checkApiCompat({ engines: { badi: "1.x" } }, "1.30.0");
		assert.ok(r.ok);
	});
});

describe("parseDependency", () => {
	it("parses name@range", () => {
		assert.deepEqual(parseDependency("foo@1.x"), { name: "foo", range: "1.x" });
	});

	it("'*' when there is no range", () => {
		assert.deepEqual(parseDependency("foo"), { name: "foo", range: "*" });
	});
});

describe("topoSort", () => {
	it("independent plugins stay in order", () => {
		const plugins = [
			{ name: "a", version: "1.0.0" },
			{ name: "b", version: "1.0.0" },
		];
		const sorted = topoSort(plugins);
		assert.equal(sorted.length, 2);
	});

	it("a dependency is loaded first", () => {
		const plugins = [
			{ name: "a", version: "1.0.0", badi: { dependsOn: ["b"] } },
			{ name: "b", version: "1.0.0" },
		];
		const sorted = topoSort(plugins);
		assert.equal(sorted[0].name, "b");
		assert.equal(sorted[1].name, "a");
	});

	it("a cycle throws an error", () => {
		const plugins = [
			{ name: "a", version: "1.0.0", badi: { dependsOn: ["b"] } },
			{ name: "b", version: "1.0.0", badi: { dependsOn: ["a"] } },
		];
		assert.throws(() => topoSort(plugins), /cycle/);
	});

	it("an unresolved dep does not form a cycle (it is ignored)", () => {
		const plugins = [
			{ name: "a", version: "1.0.0", badi: { dependsOn: ["does-not-exist"] } },
		];
		const sorted = topoSort(plugins);
		assert.equal(sorted.length, 1);
	});
});

describe("findUnsatisfied", () => {
	it("missing dependency reports", () => {
		const issues = findUnsatisfied([
			{ name: "a", version: "1.0.0", badi: { dependsOn: ["missing@1.x"] } },
		]);
		assert.equal(issues.length, 1);
		assert.equal(issues[0].reason, "missing");
		assert.equal(issues[0].dep, "missing");
	});

	it("version mismatch reports", () => {
		const issues = findUnsatisfied([
			{ name: "a", version: "1.0.0", badi: { dependsOn: ["b@2.x"] } },
			{ name: "b", version: "1.0.0" },
		]);
		assert.equal(issues.length, 1);
		assert.equal(issues[0].reason, "version-mismatch");
	});

	it("satisfied dep returns empty", () => {
		const issues = findUnsatisfied([
			{ name: "a", version: "1.0.0", badi: { dependsOn: ["b@1.x"] } },
			{ name: "b", version: "1.5.0" },
		]);
		assert.equal(issues.length, 0);
	});
});
