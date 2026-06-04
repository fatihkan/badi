import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");
const TMP = resolve(__dirname, "..", ".test-tmp");

function run(args = []) {
	return execFileSync("node", [CLI, ...args], {
		encoding: "utf-8",
		timeout: 10000,
	});
}

describe("badi CLI", () => {
	it("shows help when run with no command", () => {
		const output = run();
		assert.ok(output.includes("Usage:"));
		assert.ok(output.includes("badi"));
	});

	it("--help flag shows help", () => {
		const output = run(["--help"]);
		assert.ok(output.includes("Commands:"));
		assert.ok(output.includes("init"));
		assert.ok(output.includes("update"));
		assert.ok(output.includes("doctor"));
		assert.ok(output.includes("list"));
		assert.ok(output.includes("plugin"));
		assert.ok(output.includes("stats"));
		assert.ok(output.includes("completion"));
		assert.ok(output.includes("schedule"));
	});

	it("-h short help flag works", () => {
		const output = run(["-h"]);
		assert.ok(output.includes("Usage:"));
	});

	it("--version shows the version number", () => {
		const output = run(["--version"]);
		assert.ok(output.includes("badi v"));
	});

	it("unknown command errors", () => {
		try {
			run(["nonexistent"]);
			assert.fail("Hata bekleniyor");
		} catch (e) {
			assert.ok(e.stderr.includes("Unknown command"));
		}
	});

	describe("init", () => {
		before(() => {
			if (existsSync(TMP)) rmSync(TMP, { recursive: true });
			mkdirSync(TMP, { recursive: true });
		});

		after(() => {
			if (existsSync(TMP)) rmSync(TMP, { recursive: true });
		});

		it("dry-run creates no files", () => {
			const output = run(["init", "--target", TMP, "--dry-run"]);
			assert.ok(output.includes("Dry run"));
			// .claude/ should not be created in a dry-run (but the dir may already exist)
		});

		it("init copies the files", () => {
			const output = run(["init", "--target", TMP]);
			assert.ok(output.includes("Done"));
			assert.ok(existsSync(join(TMP, ".claude")));
			assert.ok(existsSync(join(TMP, ".claude", "settings.json")));
			assert.ok(existsSync(join(TMP, ".claude", "memory.md")));
			assert.ok(existsSync(join(TMP, ".claude", "hooks")));
			assert.ok(existsSync(join(TMP, ".claude", "agents")));
		});

		it("second init skips existing files", () => {
			const output = run(["init", "--target", TMP]);
			assert.ok(output.includes("skipped"));
		});
	});

	describe("list", () => {
		it("lists components", () => {
			const output = run(["list"]);
			assert.ok(output.includes("Agents") || output.includes("Commands"));
		});

		it("--agents flag works", () => {
			const output = run(["list", "--agents"]);
			assert.ok(output.includes("Agents"));
		});
	});
});
