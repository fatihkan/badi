import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("smoke", () => {
	it("temel aritmetik calisiyor", () => {
		assert.strictEqual(1 + 1, 2);
	});
});
