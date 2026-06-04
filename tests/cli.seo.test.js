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
	it("shows help", () => {
		const out = run("seo", "--help");
		assert.ok(out.includes("SEO Analysis and Audit"));
		assert.ok(out.includes("badi seo audit"));
		assert.ok(out.includes("badi seo meta"));
		assert.ok(out.includes("badi seo sitemap"));
		assert.ok(out.includes("badi seo speed"));
	});

	it("shows help without arguments", () => {
		const out = run("seo");
		assert.ok(out.includes("SEO Analysis and Audit"));
	});

	it("errors without a url", () => {
		assert.throws(() => run("seo", "audit"), { status: 1 });
	});

	it("an invalid command errors", () => {
		assert.throws(() => run("seo", "invalid", "https://example.com"), {
			status: 1,
		});
	});

	// v1.11+ yeni alt komutlar
	it("new commands appear in help", () => {
		const out = run("seo", "--help");
		assert.ok(out.includes("backlinks"));
		assert.ok(out.includes("rank"));
		assert.ok(out.includes("compare"));
	});

	it("rank errors without a keyword", () => {
		assert.throws(() => run("seo", "rank", "example.com"), { status: 1 });
	});

	it("compare errors without a second url", () => {
		assert.throws(() => run("seo", "compare", "https://example.com"), {
			status: 1,
		});
	});

	it("backlinks errors without a domain", () => {
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

	it("extracts host + position, strips www.", () => {
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

	it("skips invalid URLs", () => {
		const results = parseDDGResults(sampleHtml);
		// "not a url" cikarilmis olmali
		assert.ok(results.every((r) => r.host && r.host.length > 0));
	});

	it("the max parameter is respected", () => {
		const results = parseDDGResults(sampleHtml, 2);
		assert.equal(results.length, 2);
	});

	it("returns an empty array for empty HTML", () => {
		assert.deepEqual(parseDDGResults(""), []);
		assert.deepEqual(parseDDGResults("<html></html>"), []);
	});

	it("ignores links that are not result__url", () => {
		const html = '<a href="https://example.com">plain link</a>';
		assert.deepEqual(parseDDGResults(html), []);
	});
});
