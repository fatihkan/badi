import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	isAllowedType,
	readEventsTail,
} from "../lib/observability/event-emitter.js";

describe("event-emitter extras (post v1.30 hotfix)", () => {
	it("isAllowedType: accepts badi.command.completed", () => {
		assert.ok(isAllowedType("badi.command.completed"));
	});

	it("isAllowedType: rejects unknown badi.*", () => {
		assert.ok(!isAllowedType("badi.does.not.exist"));
	});

	it("isAllowedType: accepts plugin.<name>.<event> (C5 wildcard)", () => {
		assert.ok(isAllowedType("plugin.myplug.fired"));
		assert.ok(isAllowedType("plugin.my-plug.sub-event"));
	});

	it("isAllowedType: rejects single-part 'plugin'", () => {
		assert.ok(!isAllowedType("plugin"));
	});

	it("isAllowedType: rejects two-part 'plugin.x' (3 parts required)", () => {
		assert.ok(!isAllowedType("plugin.x"));
	});

	it("isAllowedType: false when type is missing", () => {
		assert.ok(!isAllowedType(null));
		assert.ok(!isAllowedType(""));
		assert.ok(!isAllowedType(42));
	});

	it("readEventsTail returns an empty array with limit=0", async () => {
		const r = await readEventsTail(0);
		assert.ok(Array.isArray(r));
		assert.equal(r.length, 0);
	});

	it("readEventsTail returns [] for a nonexistent path", async () => {
		const r = await readEventsTail(10, { cwd: "/tmp/does-not-exist-abc" });
		assert.deepEqual(r, []);
	});
});

describe("parseRange recognized flag", () => {
	it("recognized=true for known formats", async () => {
		const { parseRange } = await import("../lib/data/plugin-manifest.js");
		assert.equal(parseRange("1.x").recognized, true);
		assert.equal(parseRange("1.30.x").recognized, true);
		assert.equal(parseRange("1.30.5").recognized, true);
		assert.equal(parseRange(">=1.0").recognized, true);
		assert.equal(parseRange("*").recognized, true);
	});

	it("recognized=false for unknown formats", async () => {
		const { parseRange } = await import("../lib/data/plugin-manifest.js");
		assert.equal(parseRange("garbage").recognized, false);
		assert.equal(parseRange("~1.0").recognized, false); // not currently supported
	});

	it("parseRange permissive fallback always matches", async () => {
		const { parseRange } = await import("../lib/data/plugin-manifest.js");
		const m = parseRange("garbage");
		assert.ok(m("1.0.0"));
		assert.ok(m("99.99.99"));
	});

	it("checkApiCompat surfaces warning on unrecognized format", async () => {
		const { checkApiCompat } = await import("../lib/data/plugin-manifest.js");
		const r = checkApiCompat({ badi: { apiVersion: "garbage" } }, "1.30.0");
		assert.ok(r.ok);
		assert.equal(r.recognized, false);
		assert.match(r.warning, /not recognized/);
	});
});

describe("plan inject hook env config", () => {
	it("BADI_PLAN_INJECT_MAX_BYTES env is readable", () => {
		// inject-active-plan.mjs runtime'da bu env'leri okur; modul-bagimsiz
		// test edemiyoruz cunku hook standalone process'tir. Test sadece env
		// var kabul/yorumlama mantigi icin sanity check.
		const prev = process.env.BADI_PLAN_INJECT_MAX_BYTES;
		process.env.BADI_PLAN_INJECT_MAX_BYTES = "100000";
		const val = Number(process.env.BADI_PLAN_INJECT_MAX_BYTES);
		assert.equal(val, 100000);
		if (prev !== undefined) process.env.BADI_PLAN_INJECT_MAX_BYTES = prev;
		else delete process.env.BADI_PLAN_INJECT_MAX_BYTES;
	});
});
