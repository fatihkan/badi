import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");
const TMP = resolve(__dirname, "..", ".test-tmp-sablon");

function run(args = [], cwd = TMP) {
	return execFileSync("node", [CLI, ...args], {
		encoding: "utf-8",
		timeout: 10000,
		cwd,
	});
}

describe("badi icerik sablon", () => {
	before(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
		mkdirSync(TMP, { recursive: true });
	});

	after(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
	});

	it("sablon --help yardim gosterir", () => {
		const output = run(["icerik", "sablon"]);
		assert.ok(output.includes("Template Inheritance"));
		assert.ok(output.includes("olustur"));
		assert.ok(output.includes("list"));
		assert.ok(output.includes("sil"));
	});

	it("sablon olustur yeni sablon yaratir", () => {
		const output = run([
			"icerik",
			"sablon",
			"olustur",
			"test-sablon",
			"--extends",
			"post",
		]);
		assert.ok(output.includes("created"));
		const sablonPath = join(
			TMP,
			".claude",
			"workspace",
			"sablonlar",
			"test-sablon.md",
		);
		assert.ok(existsSync(sablonPath), "Sablon dosyasi olmali");
	});

	it("sablon olustur frontmatter icerir", () => {
		const sablonPath = join(
			TMP,
			".claude",
			"workspace",
			"sablonlar",
			"test-sablon.md",
		);
		const content = readFileSync(sablonPath, "utf-8");
		assert.ok(content.includes("---"));
		assert.ok(content.includes("name: test-sablon"));
		assert.ok(content.includes("extends: post"));
	});

	it("sablon list sablonlari listeler", () => {
		const output = run(["icerik", "sablon", "list"]);
		assert.ok(output.includes("test-sablon"));
		assert.ok(output.includes("post"));
	});

	it("sablon olustur zaten mevcut hata verir", () => {
		assert.throws(
			() =>
				run([
					"icerik",
					"sablon",
					"olustur",
					"test-sablon",
					"--extends",
					"post",
				]),
			(err) => err.status === 1,
		);
	});

	it("sablon sil sablon siler", () => {
		run(["icerik", "sablon", "olustur", "silinecek", "--extends", "video"]);
		const output = run(["icerik", "sablon", "sil", "silinecek"]);
		assert.ok(output.includes("deleted"));
		const sablonPath = join(
			TMP,
			".claude",
			"workspace",
			"sablonlar",
			"silinecek.md",
		);
		assert.ok(!existsSync(sablonPath), "Dosya silinmis olmali");
	});

	it("sablon sil mevcut olmayan hata verir", () => {
		assert.throws(
			() => run(["icerik", "sablon", "sil", "yok-sablon"]),
			(err) => err.status === 1,
		);
	});

	it("--sablon ile post olusturur", () => {
		const output = run([
			"icerik",
			"post",
			"sablon-test",
			"--sablon",
			"test-sablon",
			"--force",
		]);
		assert.ok(output.includes("POST sablonu olusturuldu"));
		assert.ok(output.includes("test-sablon"));
	});

	it("--sablon mevcut olmayan hata verir", () => {
		assert.throws(
			() => run(["icerik", "post", "test", "--sablon", "yok-sablon"]),
			(err) => err.status === 1,
		);
	});

	it("gecersiz extends turu hata verir", () => {
		assert.throws(
			() => run(["icerik", "sablon", "olustur", "bad", "--extends", "invalid"]),
			(err) => err.status === 1,
		);
	});
});
