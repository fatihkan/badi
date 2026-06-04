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

describe("badi plugin", () => {
	it("shows help", () => {
		const output = run(["plugin"]);
		assert.ok(output.includes("Plugin Yonetimi") || output.includes("install"));
	});

	it("list shows an empty plugin list", () => {
		const output = run(["plugin", "list"]);
		assert.ok(output.includes("No plugins") || output.includes("Plugin"));
	});

	it("install throws an error without a source", () => {
		try {
			run(["plugin", "install"]);
			assert.fail("Hata bekleniyor");
		} catch (e) {
			assert.ok(e.stderr.includes("kaynak") || e.status === 1);
		}
	});
});
