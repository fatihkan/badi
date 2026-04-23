import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("smoke", () => {
	it("temel aritmetik calisiyor", () => {
		assert.strictEqual(1 + 1, 2);
	});
});
