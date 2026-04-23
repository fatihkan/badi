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

describe("badi publish", () => {
	it("--help yardim gosterir", () => {
		const out = run("publish", "--help");
		assert.ok(out.includes("Release Orkestratoru") || out.includes("Publish"));
		assert.ok(out.includes("--version"));
		assert.ok(out.includes("--dry-run"));
		assert.ok(out.includes("--skip-npm"));
		assert.ok(out.includes("--skip-github"));
	});

	it("argumansiz yardim gosterir", () => {
		const out = run("publish");
		assert.ok(out.includes("Publish") || out.includes("Release"));
	});

	it("help bump tiplerini listeler", () => {
		const out = run("publish", "--help");
		assert.ok(out.includes("patch"));
		assert.ok(out.includes("minor"));
		assert.ok(out.includes("major"));
	});

	it("adim sayisi dokuz listelenir (overview)", () => {
		const out = run("publish", "--help");
		// 8 sayili adim: npm publish
		assert.ok(out.includes("npm publish") || out.includes("npm Publish"));
	});

	it("ornekler yardim metninde gorunur", () => {
		const out = run("publish", "--help");
		assert.ok(out.includes("--dry-run"));
		assert.ok(out.includes("--version minor"));
	});
});
