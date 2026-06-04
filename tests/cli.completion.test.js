import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");

function run(args = []) {
	return execFileSync("node", [CLI, ...args], {
		encoding: "utf-8",
		timeout: 10000,
	});
}

describe("badi completion", () => {
	it("shows help (without arguments)", () => {
		const output = run(["completion"]);
		assert.ok(output.includes("Kabuk Tamamlama"));
		assert.ok(output.includes("bash"));
		assert.ok(output.includes("zsh"));
		assert.ok(output.includes("fish"));
	});

	it("--help shows help", () => {
		const output = run(["completion", "--help"]);
		assert.ok(output.includes("Kabuk Tamamlama"));
	});

	it("produces a bash script", () => {
		const output = run(["completion", "bash"]);
		assert.ok(output.includes("_badi_completion"));
		assert.ok(output.includes("complete -F"));
		assert.ok(output.includes("init"));
		assert.ok(output.includes("content"));
		assert.ok(output.includes("stats"));
	});

	it("produces a zsh script", () => {
		const output = run(["completion", "zsh"]);
		assert.ok(output.includes("#compdef badi"));
		assert.ok(output.includes("_badi"));
		assert.ok(output.includes("init"));
	});

	it("produces a fish script", () => {
		const output = run(["completion", "fish"]);
		assert.ok(output.includes("complete -c badi"));
		assert.ok(output.includes("init"));
		assert.ok(output.includes("stats"));
	});

	it("an unknown shell errors", () => {
		assert.throws(
			() => run(["completion", "powershell"]),
			(err) => err.status === 1,
		);
	});

	it("the bash script contains all commands", () => {
		const output = run(["completion", "bash"]);
		const expectedCmds = [
			"init",
			"update",
			"doctor",
			"list",
			"plugin",
			"content",
			"stats",
			"completion",
		];
		for (const cmd of expectedCmds) {
			assert.ok(output.includes(cmd), `"${cmd}" bash completion'da bulunamadi`);
		}
	});
});
