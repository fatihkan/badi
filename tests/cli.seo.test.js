import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, it } from "node:test";
import { parseDDGResults } from "../lib/commands/seo.js";

const BIN = join(import.meta.dirname, "..", "bin", "badi.js");
const run = (...args) =>
	execFileSync("node", [BIN, ...args], {
		encoding: "utf-8",
		timeout: 10000,
	}).trim();

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
		assert.throws(() => run("seo", "invalid", "https://example.com"), {
			status: 1,
		});
	});

	// v1.11+ yeni alt komutlar
	it("help'te yeni komutlar gorunur", () => {
		const out = run("seo", "--help");
		assert.ok(out.includes("backlinks"));
		assert.ok(out.includes("rank"));
		assert.ok(out.includes("compare"));
	});

	it("rank keyword olmadan hata verir", () => {
		assert.throws(() => run("seo", "rank", "example.com"), { status: 1 });
	});

	it("compare ikinci url olmadan hata verir", () => {
		assert.throws(() => run("seo", "compare", "https://example.com"), {
			status: 1,
		});
	});

	it("backlinks domain olmadan hata verir", () => {
		assert.throws(() => run("seo", "backlinks"), { status: 1 });
	});
});

describe("parseDDGResults (offline)", () => {
	const sampleHtml = `
		<html><body>
		<div class="result">
			<a class="result__url" href="https://example.com/page">example.com</a>
		</div>
		<div class="result">
			<a rel="noopener" class="result__url" href="https://www.wikipedia.org/wiki/X">wikipedia</a>
		</div>
		<div class="result">
			<a class="result__url" href="//cdn.stackoverflow.com/q/1">so</a>
		</div>
		<div class="result">
			<a class="result__url" href="not a url">gecersiz</a>
		</div>
		<div class="result">
			<a class="result__url" href="https://github.com/user/repo">github</a>
		</div>
		</body></html>
	`;

	it("host + position cikarir, www.'yi soyar", () => {
		const results = parseDDGResults(sampleHtml);
		assert.equal(results.length, 4, "gecerli 4 URL olmali");
		assert.equal(results[0].position, 1);
		assert.equal(results[0].host, "example.com");
		assert.equal(results[1].host, "wikipedia.org", "www. prefix'i soyulmali");
		assert.equal(
			results[2].host,
			"cdn.stackoverflow.com",
			"// ile baslayan URL'ler desteklenmeli",
		);
		assert.equal(results[3].host, "github.com");
	});

	it("gecersiz URL'leri atlar", () => {
		const results = parseDDGResults(sampleHtml);
		// "not a url" cikarilmis olmali
		assert.ok(results.every((r) => r.host && r.host.length > 0));
	});

	it("max parametresi uyulur", () => {
		const results = parseDDGResults(sampleHtml, 2);
		assert.equal(results.length, 2);
	});

	it("bos HTML'de bos array doner", () => {
		assert.deepEqual(parseDDGResults(""), []);
		assert.deepEqual(parseDDGResults("<html></html>"), []);
	});

	it("result__url olmayan link'leri yoksayar", () => {
		const html = '<a href="https://example.com">plain link</a>';
		assert.deepEqual(parseDDGResults(html), []);
	});
});
