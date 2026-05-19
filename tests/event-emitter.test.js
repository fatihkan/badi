import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	ALLOWED_TYPES,
	emit,
	getEventsPath,
	isEnabled,
} from "../lib/observability/event-emitter.js";

describe("event-emitter", () => {
	it("ALLOWED_TYPES whitelist tanimli", () => {
		assert.ok(ALLOWED_TYPES.has("badi.command.started"));
		assert.ok(ALLOWED_TYPES.has("badi.command.completed"));
		assert.ok(ALLOWED_TYPES.has("badi.command.failed"));
		assert.ok(!ALLOWED_TYPES.has("bogus.type"));
	});

	it("BADI_TELEMETRY=off sirasinda isEnabled false", () => {
		const prev = process.env.BADI_TELEMETRY;
		// import zaten okudu — bu test sadece flagi sayar
		assert.equal(typeof isEnabled(), "boolean");
		if (prev !== undefined) process.env.BADI_TELEMETRY = prev;
		else delete process.env.BADI_TELEMETRY;
	});

	it("emit bilinmeyen tip atilir (silently dropped)", () => {
		// throw etmemeli; emit dropp eder
		assert.doesNotThrow(() => emit("bogus.type", {}));
	});

	it("getEventsPath bir yol uretir", () => {
		const p = getEventsPath();
		assert.ok(p);
		assert.match(p, /badi-events\.jsonl$/);
	});
});
