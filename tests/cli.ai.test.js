import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, it } from "node:test";

const BIN = join(import.meta.dirname, "..", "bin", "badi.js");
const run = (...args) =>
	execFileSync("node", [BIN, ...args], {
		encoding: "utf-8",
		timeout: 10000,
	}).trim();

describe("badi ai", () => {
	it("shows help", () => {
		const out = run("ai");
		assert.ok(out.includes("AI/LLM"));
		assert.ok(out.includes("badi ai token"));
		assert.ok(out.includes("badi ai review"));
	});

	it("token runs", () => {
		const out = run("ai", "token");
		assert.ok(out.includes("Token") || out.includes("token"));
	});

	it("memory-diff runs", () => {
		const out = run("ai", "memory-diff");
		assert.ok(out.includes("Memory") || out.includes("Bilgi"));
	});

	it("prompt-test runs", () => {
		const out = run("ai", "prompt-test");
		assert.ok(out.includes("Prompt") || out.includes("kontrol"));
	});

	it("unknown command throws an error", () => {
		assert.throws(() => run("ai", "invalid"), { status: 1 });
	});

	it("translate throws an error without a file", () => {
		assert.throws(() => run("ai", "translate"), { status: 1 });
	});
});
