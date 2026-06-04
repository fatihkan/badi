import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");
const TMP = resolve(__dirname, "..", ".test-tmp-doctor");

function run(args = []) {
	return execFileSync("node", [CLI, ...args], {
		encoding: "utf-8",
		timeout: 10000,
	});
}

describe("badi doctor", () => {
	before(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
		mkdirSync(TMP, { recursive: true });
		// Once init yap
		run(["init", "--target", TMP]);
	});

	after(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
	});

	it("returns a successful result for a healthy install", () => {
		const output = run(["doctor", "--target", TMP]);
		assert.ok(output.includes("passed"));
	});

	it("checks settings.json", () => {
		const output = run(["doctor", "--target", TMP]);
		assert.ok(output.includes("settings.json"));
	});

	it("checks CLAUDE.md", () => {
		const output = run(["doctor", "--target", TMP]);
		assert.ok(output.includes("CLAUDE.md"));
	});
});
