import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");

function run(args = [], env = {}) {
	return execFileSync("node", [CLI, ...args], {
		encoding: "utf-8",
		timeout: 10000,
		env: { ...process.env, ...env },
	});
}

describe("update notifier", () => {
	it("BADI_NO_UPDATE_NOTIFIER=1 ile bildirim gostermez", () => {
		const output = run(["--version"], { BADI_NO_UPDATE_NOTIFIER: "1" });
		assert.ok(!output.includes("Yeni surum mevcut"), "Bildirim gozukmemeli");
	});

	it("CI=1 ile bildirim gostermez", () => {
		const output = run(["--version"], { CI: "1" });
		assert.ok(
			!output.includes("Yeni surum mevcut"),
			"CI ortaminda bildirim gozukmemeli",
		);
	});
});
