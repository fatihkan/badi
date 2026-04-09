import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
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

	it("saglikli kurulumda basarili sonuc doner", () => {
		const output = run(["doctor", "--target", TMP]);
		assert.ok(output.includes("basarili"));
	});

	it("settings.json kontrolu yapar", () => {
		const output = run(["doctor", "--target", TMP]);
		assert.ok(output.includes("settings.json"));
	});

	it("CLAUDE.md kontrolu yapar", () => {
		const output = run(["doctor", "--target", TMP]);
		assert.ok(output.includes("CLAUDE.md"));
	});
});
