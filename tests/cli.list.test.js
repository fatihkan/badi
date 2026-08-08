import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, describe, it } from "node:test";
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
	it("lists all components", () => {
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

	it("--hooks lists hooks", () => {
		const output = run(["list", "--hooks"]);
		assert.ok(output.includes("Hook"));
	});

	it("--skills lists skill categories", () => {
		const output = run(["list", "--skills"]);
		assert.ok(output.includes("Skill"));
	});
});

// Regression: `list --hooks` filtered by `.sh`, but hooks migrated to `.mjs`,
// so it silently reported Hooks (0) on every real install. The pre-existing
// "--hooks lists hooks" test only checked for the word "Hook", so it passed on
// the broken output. This asserts the real count against a fresh install.
describe("badi list --hooks counts real hooks (not zero)", () => {
	let dir;
	before(() => {
		dir = mkdtempSync(join(tmpdir(), "badi-list-hooks-"));
		run(["init", "--harness", "claude", "--target", dir]);
	});
	after(() => rmSync(dir, { recursive: true, force: true }));

	it("reports a double-digit hook count from an installed .claude/", () => {
		const output = run(["list", "--hooks", "--target", dir]);
		const m = output.match(/Hooks \((\d+)\)/);
		assert.ok(m, `expected a "Hooks (N)" line, got:\n${output}`);
		const count = Number(m[1]);
		assert.ok(
			count >= 10,
			`expected the real hook count (>=10), got Hooks (${count}) — the .sh/.mjs filter regressed`,
		);
	});

	it("excludes the _-prefixed shared helper (_util.mjs is not a hook)", () => {
		const output = run(["list", "--hooks", "--target", dir]);
		assert.ok(
			!output.includes("_util"),
			"_util.mjs is a shared helper, not a hook, and must not be listed",
		);
	});
});
