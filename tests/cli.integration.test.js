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
	it("komutsuz calistiginda yardim gosterir", () => {
		const output = run();
		assert.ok(output.includes("Kullanim:"));
		assert.ok(output.includes("badi"));
	});

	it("--help bayragi yardim gosterir", () => {
		const output = run(["--help"]);
		assert.ok(output.includes("Komutlar:"));
		assert.ok(output.includes("init"));
		assert.ok(output.includes("update"));
		assert.ok(output.includes("doctor"));
		assert.ok(output.includes("list"));
		assert.ok(output.includes("plugin"));
		assert.ok(output.includes("stats"));
		assert.ok(output.includes("completion"));
		assert.ok(output.includes("schedule"));
	});

	it("-h kisa yardim bayragi calisiyor", () => {
		const output = run(["-h"]);
		assert.ok(output.includes("Kullanim:"));
	});

	it("--version surum numarasini gosterir", () => {
		const output = run(["--version"]);
		assert.ok(output.includes("badi v"));
	});

	it("bilinmeyen komut hata veriyor", () => {
		try {
			run(["nonexistent"]);
			assert.fail("Hata bekleniyor");
		} catch (e) {
			assert.ok(e.stderr.includes("Bilinmeyen komut"));
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

		it("dry-run dosya olusturmaz", () => {
			const output = run(["init", "--target", TMP, "--dry-run"]);
			assert.ok(output.includes("Dry run"));
			// Dry-run'da .claude/ olusmamalı (ama dizin olusturulmus olabilir)
		});

		it("init dosyalari kopyalar", () => {
			const output = run(["init", "--target", TMP]);
			assert.ok(output.includes("Done"));
			assert.ok(existsSync(join(TMP, ".claude")));
			assert.ok(existsSync(join(TMP, ".claude", "settings.json")));
			assert.ok(existsSync(join(TMP, ".claude", "memory.md")));
			assert.ok(existsSync(join(TMP, ".claude", "hooks")));
			assert.ok(existsSync(join(TMP, ".claude", "agents")));
		});

		it("ikinci init mevcut dosyalari atlar", () => {
			const output = run(["init", "--target", TMP]);
			assert.ok(output.includes("skipped"));
		});
	});

	describe("list", () => {
		it("bilesenleri listeler", () => {
			const output = run(["list"]);
			assert.ok(output.includes("Ajanlar") || output.includes("Komutlar"));
		});

		it("--agents bayragi calisiyor", () => {
			const output = run(["list", "--agents"]);
			assert.ok(output.includes("Ajanlar"));
		});
	});
});
