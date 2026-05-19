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
	it("X.Y.Z parse eder", () => {
		const v = parseVersion("1.30.0");
		assert.deepEqual(v, { major: 1, minor: 30, patch: 0 });
	});

	it("invalid versions returns null", () => {
		assert.equal(parseVersion(""), null);
		assert.equal(parseVersion("abc"), null);
		assert.equal(parseVersion(null), null);
	});

	it("X.Y formatinda patch yoksa null", () => {
		assert.equal(parseVersion("1.30"), null);
	});
});

describe("parseRange", () => {
	it("'*' her zaman true", () => {
		const m = parseRange("*");
		assert.ok(m("1.0.0"));
		assert.ok(m("99.99.99"));
	});

	it("'1.x' sadece major 1", () => {
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

	it("bilinmeyen format permissive (her seye true)", () => {
		const m = parseRange("garbage");
		assert.ok(m("1.0.0"));
	});
});

describe("validateManifest", () => {
	it("name yoksa invalid", () => {
		const r = validateManifest({});
		assert.ok(!r.valid);
		assert.ok(r.errors.length > 0);
	});

	it("minimum valid manifest", () => {
		const r = validateManifest({ name: "x" });
		assert.ok(r.valid);
	});

	it("badi.apiVersion string degilse error", () => {
		const r = validateManifest({
			name: "x",
			badi: { apiVersion: 1 },
		});
		assert.ok(!r.valid);
	});

	it("badi.dependsOn array degilse error", () => {
		const r = validateManifest({
			name: "x",
			badi: { dependsOn: "foo" },
		});
		assert.ok(!r.valid);
	});

	it("badi.dependsOn icinde non-string error", () => {
		const r = validateManifest({
			name: "x",
			badi: { dependsOn: ["foo", 123] },
		});
		assert.ok(!r.valid);
	});
});

describe("checkApiCompat", () => {
	it("apiVersion yok ise default 1.x", () => {
		const r = checkApiCompat({ name: "x" }, "1.30.0");
		assert.ok(r.ok);
		assert.equal(r.range, BADI_DEFAULT_API_VERSION);
	});

	it("uyumsuz major reject", () => {
		const r = checkApiCompat({ badi: { apiVersion: "2.x" } }, "1.30.0");
		assert.ok(!r.ok);
		assert.match(r.reason, /uyumlu degil/);
	});

	it("engines.badi de kabul edilir (fallback)", () => {
		const r = checkApiCompat({ engines: { badi: "1.x" } }, "1.30.0");
		assert.ok(r.ok);
	});
});

describe("parseDependency", () => {
	it("name@range parse eder", () => {
		assert.deepEqual(parseDependency("foo@1.x"), { name: "foo", range: "1.x" });
	});

	it("range yoksa '*'", () => {
		assert.deepEqual(parseDependency("foo"), { name: "foo", range: "*" });
	});
});

describe("topoSort", () => {
	it("bagimsiz plugins sirali kalir", () => {
		const plugins = [{ name: "a", version: "1.0.0" }, { name: "b", version: "1.0.0" }];
		const sorted = topoSort(plugins);
		assert.equal(sorted.length, 2);
	});

	it("dependency once load edilir", () => {
		const plugins = [
			{ name: "a", version: "1.0.0", badi: { dependsOn: ["b"] } },
			{ name: "b", version: "1.0.0" },
		];
		const sorted = topoSort(plugins);
		assert.equal(sorted[0].name, "b");
		assert.equal(sorted[1].name, "a");
	});

	it("cycle hata firlatir", () => {
		const plugins = [
			{ name: "a", version: "1.0.0", badi: { dependsOn: ["b"] } },
			{ name: "b", version: "1.0.0", badi: { dependsOn: ["a"] } },
		];
		assert.throws(() => topoSort(plugins), /cycle/);
	});

	it("unresolved dep cycle yapmaz (gormezden gelir)", () => {
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
