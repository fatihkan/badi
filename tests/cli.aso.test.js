import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { validateMetadata, extractKeywords, LIMITS } from "../lib/aso-helpers.js";

const BIN = join(import.meta.dirname, "..", "bin", "badi.js");
const run = (...args) => execFileSync("node", [BIN, ...args], { encoding: "utf-8", timeout: 10000 }).trim();

describe("badi aso", () => {
	it("yardim gosterir", () => {
		const out = run("aso", "--help");
		assert.ok(out.includes("ASO"));
		assert.ok(out.includes("badi aso audit"));
		assert.ok(out.includes("badi aso keywords"));
		assert.ok(out.includes("badi aso metadata"));
	});

	it("argumansiz yardim gosterir", () => {
		const out = run("aso");
		assert.ok(out.includes("ASO"));
	});

	it("metadata appstore limitleri gosterir", () => {
		const out = run("aso", "metadata", "appstore");
		assert.ok(out.includes("30 karakter") || out.includes("100 karakter") || out.includes("4000 karakter"));
	});

	it("metadata playstore limitleri gosterir", () => {
		const out = run("aso", "metadata", "playstore");
		assert.ok(out.includes("50 karakter") || out.includes("80 karakter"));
	});

	it("screenshots rehberi gosterir", () => {
		const out = run("aso", "screenshots");
		assert.ok(out.includes("1242") || out.includes("iOS"));
		assert.ok(out.includes("Android"));
	});

	it("audit app-id olmadan hata verir", () => {
		assert.throws(() => run("aso", "audit"), { status: 1 });
	});

	it("bilinmeyen komut hata verir", () => {
		assert.throws(() => run("aso", "invalid"), { status: 1 });
	});
});

describe("aso-helpers", () => {
	it("validateMetadata limit kontrolu", () => {
		const ok = validateMetadata("appstore", "title", "Short");
		assert.ok(ok.ok);
		assert.equal(ok.limit, 30);

		const overflow = validateMetadata("appstore", "title", "a".repeat(50));
		assert.equal(overflow.ok, false);
		assert.equal(overflow.length, 50);
	});

	it("LIMITS sabit dogru", () => {
		assert.equal(LIMITS.appstore.title, 30);
		assert.equal(LIMITS.appstore.keywords, 100);
		assert.equal(LIMITS.playstore.title, 50);
	});

	it("extractKeywords stopword filtreler", () => {
		const kws = extractKeywords("The quick brown fox jumps over the lazy dog");
		const labels = kws.map(([k]) => k);
		assert.ok(!labels.includes("the"));
		assert.ok(labels.includes("quick"));
		assert.ok(labels.includes("brown"));
	});

	it("extractKeywords frekans sayar", () => {
		const kws = extractKeywords("badi ajan badi komut badi hook");
		const badiEntry = kws.find(([k]) => k === "badi");
		assert.equal(badiEntry[1], 3);
	});
});
