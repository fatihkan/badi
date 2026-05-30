import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");
const TMP = resolve(__dirname, "..", ".test-tmp-lang");

function run(args = [], cwd = TMP) {
	return execFileSync("node", [CLI, ...args], {
		encoding: "utf-8",
		timeout: 10000,
		cwd,
	});
}

// English-only (faz 1): icerik uretimi yalniz EN; --lang no-op, lang suffix yok.
describe("badi icerik (English-only)", () => {
	before(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
		mkdirSync(TMP, { recursive: true });
	});

	after(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
	});

	it("post English icerik olusturur (lang suffix yok)", () => {
		const output = run(["icerik", "post", "post-test"]);
		assert.ok(output.includes("POST template created"));
		const dir = join(TMP, ".claude", "workspace", "icerikler");
		const files = existsSync(dir) ? readdirSync(dir) : [];
		const f = files.find((x) => x.includes("post-test"));
		assert.ok(f, "post dosyasi olusturulmali");
		assert.ok(!f.includes("-en") && !f.includes("-tr"), "lang suffix olmamali");
		const content = readFileSync(join(dir, f), "utf-8");
		assert.ok(
			content.includes("Social Media Post") || content.includes("VARIATION"),
			"icerik English olmali",
		);
	});

	it("--lang no-op: tr istense bile English uretir", () => {
		run(["icerik", "post", "noop-test", "--lang", "tr", "--force"]);
		const dir = join(TMP, ".claude", "workspace", "icerikler");
		const f = readdirSync(dir).find((x) => x.includes("noop-test"));
		assert.ok(f, "dosya olusturulmali");
		const content = readFileSync(join(dir, f), "utf-8");
		assert.ok(content.includes("Social Media Post"), "English uretilmeli");
		assert.ok(!content.includes("Sosyal Medya Post"), "TR icerik kalmamali");
	});

	it("marka sesi English marka-sesi.md olusturur", () => {
		const output = run(["icerik", "marka"]);
		assert.ok(output.includes("created"));
		const p = join(TMP, ".claude", "workspace", "marka-sesi.md");
		assert.ok(existsSync(p), "marka-sesi.md olusturulmali");
		const content = readFileSync(p, "utf-8");
		assert.ok(content.includes("Brand Voice"), "marka sesi English olmali");
	});

	it("karousel English sablon olusturur", () => {
		const output = run(["icerik", "karousel", "karo-test", "--force"]);
		assert.ok(output.includes("KAROUSEL template created"));
		const dir = join(TMP, ".claude", "workspace", "icerikler");
		const f = readdirSync(dir).find((x) => x.includes("karo-test"));
		assert.ok(f, "karousel dosyasi olusturulmali");
		const content = readFileSync(join(dir, f), "utf-8");
		assert.ok(content.includes("Carousel"), "icerik English olmali");
	});
});
