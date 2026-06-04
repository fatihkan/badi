import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");
const TMP = resolve(__dirname, "..", ".test-tmp-update");

function run(args = []) {
	return execFileSync("node", [CLI, ...args], {
		encoding: "utf-8",
		timeout: 10000,
	});
}

describe("badi update", () => {
	before(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
		mkdirSync(TMP, { recursive: true });
		run(["init", "--target", TMP]);
	});

	after(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
	});

	it("throws an error when .claude/ directory is missing", () => {
		const emptyDir = resolve(TMP, "..", ".test-empty");
		mkdirSync(emptyDir, { recursive: true });
		try {
			run(["update", "--target", emptyDir]);
			assert.fail("Hata bekleniyor");
		} catch (e) {
			assert.ok(e.stderr.includes(".claude/") || e.status === 1);
		} finally {
			rmSync(emptyDir, { recursive: true });
		}
	});

	it("preserves existing files", () => {
		const output = run(["update", "--target", TMP]);
		assert.ok(
			output.includes("preserved") || output.includes("Update complete"),
		);
	});

	it("dry-run works", () => {
		const output = run(["update", "--target", TMP, "--dry-run"]);
		assert.ok(
			output.includes("existing") || output.includes("Update complete"),
		);
	});
});
