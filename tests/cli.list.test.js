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

describe("badi list", () => {
	it("tum bilesenleri listeler", () => {
		const output = run(["list"]);
		assert.ok(
			output.includes("Agents") ||
				output.includes("Commands") ||
				output.includes("Hook"),
		);
	});

	it("--agents lists agents", () => {
		const output = run(["list", "--agents"]);
		assert.ok(output.includes("Agents"));
	});

	it("--hooks hook'lari listeler", () => {
		const output = run(["list", "--hooks"]);
		assert.ok(output.includes("Hook"));
	});

	it("--skills skill kategorilerini listeler", () => {
		const output = run(["list", "--skills"]);
		assert.ok(output.includes("Skill"));
	});
});
