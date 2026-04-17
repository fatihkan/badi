import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const BIN = join(import.meta.dirname, "..", "bin", "badi.js");
const run = (...args) => execFileSync("node", [BIN, ...args], { encoding: "utf-8", timeout: 10000 }).trim();

describe("badi seo", () => {
	it("yardim gosterir", () => {
		const out = run("seo", "--help");
		assert.ok(out.includes("SEO Analiz ve Denetim"));
		assert.ok(out.includes("badi seo audit"));
		assert.ok(out.includes("badi seo meta"));
		assert.ok(out.includes("badi seo sitemap"));
		assert.ok(out.includes("badi seo speed"));
	});

	it("argumansiz yardim gosterir", () => {
		const out = run("seo");
		assert.ok(out.includes("SEO Analiz ve Denetim"));
	});

	it("url olmadan hata verir", () => {
		assert.throws(() => run("seo", "audit"), { status: 1 });
	});

	it("gecersiz komut hata verir", () => {
		assert.throws(() => run("seo", "invalid", "https://example.com"), { status: 1 });
	});
});
