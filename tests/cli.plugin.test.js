import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
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
	it("yardim gosterir", () => {
		const output = run(["plugin"]);
		assert.ok(output.includes("Plugin Yonetimi") || output.includes("install"));
	});

	it("list bos plugin listesi gosterir", () => {
		const output = run(["plugin", "list"]);
		assert.ok(output.includes("plugin yok") || output.includes("Plugin"));
	});

	it("kaynak belirtilmeden install hata verir", () => {
		try {
			run(["plugin", "install"]);
			assert.fail("Hata bekleniyor");
		} catch (e) {
			assert.ok(e.stderr.includes("kaynak") || e.status === 1);
		}
	});
});
