import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, it } from "node:test";

const BIN = join(import.meta.dirname, "..", "bin", "badi.js");
const run = (...args) =>
	execFileSync("node", [BIN, ...args], {
		encoding: "utf-8",
		timeout: 5000,
	}).trim();

describe("badi lighthouse + a11y", () => {
	it("lighthouse shows help", () => {
		const out = run("lighthouse");
		assert.ok(out.includes("Lighthouse") || out.includes("PageSpeed"));
	});

	it("a11y shows help", () => {
		const out = run("a11y");
		assert.ok(out.includes("Accessibility") || out.includes("WCAG"));
	});
});
