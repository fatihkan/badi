import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
	analyzeSentiment,
	extractKeywords,
	LIMITS,
	parseScreenshotUrl,
	validateMetadata,
} from "../lib/aso-helpers.js";

const BIN = join(import.meta.dirname, "..", "bin", "badi.js");
const run = (...args) =>
	execFileSync("node", [BIN, ...args], {
		encoding: "utf-8",
		timeout: 10000,
	}).trim();

describe("badi aso", () => {
	it("shows help", () => {
		const out = run("aso", "--help");
		assert.ok(out.includes("ASO"));
		assert.ok(out.includes("badi aso audit"));
		assert.ok(out.includes("badi aso keywords"));
		assert.ok(out.includes("badi aso metadata"));
	});

	it("shows help with no arguments", () => {
		const out = run("aso");
		assert.ok(out.includes("ASO"));
	});

	it("metadata appstore shows the limits", () => {
		const out = run("aso", "metadata", "appstore");
		assert.ok(
			out.includes("30 chars") ||
				out.includes("100 chars") ||
				out.includes("4000 chars"),
		);
	});

	it("metadata playstore shows the limits", () => {
		const out = run("aso", "metadata", "playstore");
		assert.ok(out.includes("50 chars") || out.includes("80 chars"));
	});

	it("screenshots guide shows", () => {
		const out = run("aso", "screenshots");
		assert.ok(out.includes("1242") || out.includes("iOS"));
		assert.ok(out.includes("Android"));
	});

	it("audit errors without an app-id", () => {
		assert.throws(() => run("aso", "audit"), { status: 1 });
	});

	it("unknown command errors", () => {
		assert.throws(() => run("aso", "invalid"), { status: 1 });
	});

	// v1.11+ yeni alt komutlar (offline dogrulama)
	it("playstore errors with no arguments", () => {
		assert.throws(() => run("aso", "playstore"), { status: 1 });
	});

	it("reviews errors with no arguments", () => {
		assert.throws(() => run("aso", "reviews"), { status: 1 });
	});

	it("new commands appear in help", () => {
		const out = run("aso", "--help");
		assert.ok(out.includes("playstore"));
		assert.ok(out.includes("reviews"));
	});
});

describe("aso-helpers v1.11+", () => {
	it("analyzeSentiment classifies negative reviews correctly", () => {
		const reviews = [
			{ title: "Bu app cok kotu", content: "calismiyor", rating: 1 },
			{ title: "Great app", content: "love it", rating: 5 },
			{ title: "Please add dark mode", content: "would be nice", rating: 3 },
		];
		const analysis = analyzeSentiment(reviews);
		assert.equal(analysis.total, 3);
		assert.ok(analysis.counts.negative >= 1 || analysis.counts.bug >= 1);
		assert.ok(analysis.counts.positive >= 1);
		assert.ok(analysis.counts.feature_request >= 1);
	});

	it("analyzeSentiment rating fallback works", () => {
		const reviews = [
			{ title: "test", content: "test", rating: 5 },
			{ title: "test", content: "test", rating: 1 },
			{ title: "test", content: "test", rating: 3 },
		];
		const analysis = analyzeSentiment(reviews);
		// Rating 5 -> positive, 1 -> negative, 3 -> neutral
		assert.ok(analysis.counts.positive >= 1);
		assert.ok(analysis.counts.negative >= 1);
	});

	it("analyzeSentiment computes the average rating", () => {
		const reviews = [
			{ title: "x", content: "y", rating: 5 },
			{ title: "x", content: "y", rating: 1 },
		];
		const analysis = analyzeSentiment(reviews);
		assert.equal(analysis.averageRating, 3);
	});

	it("parseScreenshotUrl recognizes the iTunes format", () => {
		const info = parseScreenshotUrl(
			"https://is1-ssl.mzstatic.com/image/thumb/Purple/v4/abc/source/1242x2688bb.png",
		);
		assert.equal(info.width, 1242);
		assert.equal(info.height, 2688);
		assert.equal(info.orientation, "portrait");
		assert.equal(info.format, "png");
	});

	it("parseScreenshotUrl detects landscape", () => {
		const info = parseScreenshotUrl(
			"https://is1-ssl.mzstatic.com/.../2048x1024bb.jpg",
		);
		assert.equal(info.orientation, "landscape");
	});

	it("parseScreenshotUrl returns null for an invalid URL", () => {
		const info = parseScreenshotUrl("https://example.com/image.png");
		assert.equal(info.width, null);
		assert.equal(info.height, null);
	});
});

describe("aso-helpers", () => {
	it("validateMetadata limit check", () => {
		const ok = validateMetadata("appstore", "title", "Short");
		assert.ok(ok.ok);
		assert.equal(ok.limit, 30);

		const overflow = validateMetadata("appstore", "title", "a".repeat(50));
		assert.equal(overflow.ok, false);
		assert.equal(overflow.length, 50);
	});

	it("LIMITS constant is correct", () => {
		assert.equal(LIMITS.appstore.title, 30);
		assert.equal(LIMITS.appstore.keywords, 100);
		assert.equal(LIMITS.playstore.title, 50);
	});

	it("extractKeywords filters stopwords", () => {
		const kws = extractKeywords("The quick brown fox jumps over the lazy dog");
		const labels = kws.map(([k]) => k);
		assert.ok(!labels.includes("the"));
		assert.ok(labels.includes("quick"));
		assert.ok(labels.includes("brown"));
	});

	it("extractKeywords counts frequency", () => {
		const kws = extractKeywords("badi ajan badi komut badi hook");
		const badiEntry = kws.find(([k]) => k === "badi");
		assert.equal(badiEntry[1], 3);
	});
});
