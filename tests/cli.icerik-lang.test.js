import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
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

describe("badi icerik --lang", () => {
	before(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
		mkdirSync(TMP, { recursive: true });
	});

	after(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
	});

	it("--lang tr post sablonu olusturur (varsayilan)", () => {
		const output = run(["icerik", "post", "dil-test", "--lang", "tr"]);
		assert.ok(output.includes("POST sablonu olusturuldu"));
		const dir = join(TMP, ".claude", "workspace", "icerikler");
		const files = existsSync(dir) ? readdirSync(dir) : [];
		const trFile = files.find((f) => f.includes("dil-test") && !f.includes("-en"));
		assert.ok(trFile, "TR dosya olusturulmali");
	});

	it("--lang en post sablonu EN icerikle olusturur", () => {
		const output = run(["icerik", "post", "english-test", "--lang", "en", "--force"]);
		assert.ok(output.includes("POST sablonu olusturuldu"));
		const dir = join(TMP, ".claude", "workspace", "icerikler");
		const files = readdirSync(dir);
		const enFile = files.find((f) => f.includes("english-test") && f.includes("-en"));
		assert.ok(enFile, "EN dosya -en suffix ile olusturulmali");
		const content = readFileSync(join(dir, enFile), "utf-8");
		assert.ok(content.includes("Social Media Post") || content.includes("VARIATION"), "EN icerik Ingilizce olmali");
	});

	it("--lang tr,en her iki dilde olusturur", () => {
		const output = run(["icerik", "video", "dual-test", "--lang", "tr,en", "--force"]);
		assert.ok(output.includes("VIDEO sablonu olusturuldu"));
		assert.ok(output.includes("tr, en") || output.includes("Diller"));
		const dir = join(TMP, ".claude", "workspace", "senaryolar");
		const files = readdirSync(dir);
		const trFile = files.find((f) => f.includes("dual-test") && !f.includes("-en"));
		const enFile = files.find((f) => f.includes("dual-test") && f.includes("-en"));
		assert.ok(trFile, "TR dosya olmali");
		assert.ok(enFile, "EN dosya olmali");
	});

	it("--lang en marka sesi EN dosyasi olusturur", () => {
		const output = run(["icerik", "marka", "--lang", "en"]);
		assert.ok(output.includes("olusturuldu"));
		const enPath = join(TMP, ".claude", "workspace", "marka-sesi-en.md");
		assert.ok(existsSync(enPath), "marka-sesi-en.md olmali");
		const content = readFileSync(enPath, "utf-8");
		assert.ok(content.includes("Brand Voice"), "EN marka sesi Ingilizce olmali");
	});

	it("--lang tr marka sesi TR dosyasi olusturur", () => {
		const output = run(["icerik", "marka", "--lang", "tr"]);
		assert.ok(output.includes("olusturuldu"));
		const trPath = join(TMP, ".claude", "workspace", "marka-sesi.md");
		assert.ok(existsSync(trPath), "marka-sesi.md olmali");
	});

	it("karousel EN sablon olusturur", () => {
		const output = run(["icerik", "karousel", "en-karo", "--lang", "en", "--force"]);
		assert.ok(output.includes("KAROUSEL sablonu olusturuldu"));
		const dir = join(TMP, ".claude", "workspace", "icerikler");
		const files = readdirSync(dir);
		const enFile = files.find((f) => f.includes("en-karo") && f.includes("-en"));
		assert.ok(enFile, "EN karousel dosya olmali");
	});
});
