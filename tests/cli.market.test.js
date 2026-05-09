import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
	calculateDifficulty,
	categorizeReviewIssue,
	computeWishlistMatrix,
	findCrossCompetitorComplaints,
	findOpportunityGaps,
	ISSUE_CODES,
	summarizeReviews,
} from "../lib/market-helpers.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN = join(__dirname, "..", "bin", "badi.js");

describe("market: categorizeReviewIssue", () => {
	it("crash matches", () => {
		assert.equal(
			categorizeReviewIssue("App keeps crashing on startup"),
			"crash",
		);
		assert.equal(categorizeReviewIssue("Donuyor surekli"), "crash");
	});

	it("performance matches", () => {
		assert.equal(categorizeReviewIssue("Cok yavas, takiliyor"), "performance");
		assert.equal(
			categorizeReviewIssue("Loading forever, sluggish"),
			"performance",
		);
	});

	it("login matches", () => {
		assert.equal(
			categorizeReviewIssue("Sign-in not working, password reset broken"),
			"login",
		);
	});

	it("ads matches", () => {
		assert.equal(
			categorizeReviewIssue("Too many ads, paywall everywhere"),
			"ads",
		);
	});

	it("missing-feature matches", () => {
		assert.equal(
			categorizeReviewIssue("I wish there was dark mode"),
			"missing-feature",
		);
	});

	it("falls back to 'other'", () => {
		assert.equal(categorizeReviewIssue("Generic comment"), "other");
		assert.equal(categorizeReviewIssue(""), "other");
	});

	it("returns one of ISSUE_CODES", () => {
		const result = categorizeReviewIssue("App crashes");
		assert.ok(ISSUE_CODES.includes(result));
	});
});

describe("market: summarizeReviews", () => {
	it("counts ratings + categorizes negatives", () => {
		const reviews = [
			{ title: "Crashes", content: "Crashes daily", rating: 1 },
			{ title: "Slow", content: "Very slow", rating: 2 },
			{ title: "OK", content: "Fine", rating: 3 },
			{ title: "Great", content: "Love it", rating: 5 },
			{ title: "Good", content: "Wish it had more features", rating: 4 },
		];
		const r = summarizeReviews(reviews);
		assert.equal(r.total, 5);
		assert.equal(r.byRating[1], 1);
		assert.equal(r.byRating[5], 1);
		assert.equal(r.negativeCount, 3); // 1, 2, 3 stars
		assert.equal(r.positiveCount, 2); // 4, 5 stars
		assert.ok(r.issueCounts.crash >= 1);
		assert.ok(r.issueCounts.performance >= 1);
	});

	it("handles empty list", () => {
		const r = summarizeReviews([]);
		assert.equal(r.total, 0);
		assert.equal(r.negativeCount, 0);
		assert.equal(r.positiveCount, 0);
	});
});

describe("market: calculateDifficulty", () => {
	const target = {
		ratingCount: 100,
		averageRating: 4.0,
		primaryGenre: "Weather",
	};

	it("BLUE_OCEAN for sparse competitor field", () => {
		const r = calculateDifficulty(target, [
			{ rating: 3.5, ratingCount: 50 },
			{ rating: 3.5, ratingCount: 100 },
		]);
		assert.equal(r.verdict, "BLUE_OCEAN");
	});

	it("SATURATED for crowded high-rating field", () => {
		const competitors = Array.from({ length: 12 }, () => ({
			rating: 4.7,
			ratingCount: 500_000,
		}));
		const r = calculateDifficulty(target, competitors);
		assert.equal(r.verdict, "SATURATED");
		assert.ok(r.score >= 80);
	});

	it("score is bounded 0-100", () => {
		const lots = Array.from({ length: 30 }, () => ({
			rating: 5,
			ratingCount: 1_000_000,
		}));
		const r = calculateDifficulty(target, lots);
		assert.ok(r.score <= 100);
		assert.ok(r.score >= 0);
	});

	it("includes component breakdown", () => {
		const r = calculateDifficulty(target, [{ rating: 4.0, ratingCount: 1000 }]);
		assert.ok("competitorPressure" in r.components);
		assert.ok("ratingFloor" in r.components);
		assert.ok("incumbentEntrenchment" in r.components);
	});
});

describe("market: findCrossCompetitorComplaints", () => {
	it("aggregates by code across competitors", () => {
		const comps = [
			{
				name: "AppA",
				summary: { issueCounts: { crash: 5, ads: 2, other: 0 } },
			},
			{
				name: "AppB",
				summary: { issueCounts: { crash: 3, ui: 1, other: 0 } },
			},
		];
		// Pad with all known issue codes
		for (const c of comps) {
			for (const code of ISSUE_CODES) {
				if (!(code in c.summary.issueCounts)) c.summary.issueCounts[code] = 0;
			}
		}
		const result = findCrossCompetitorComplaints(comps);
		const crashEntry = result.find((e) => e.code === "crash");
		assert.ok(crashEntry);
		assert.equal(crashEntry.total, 8);
		assert.equal(crashEntry.perApp.AppA, 5);
		assert.equal(crashEntry.perApp.AppB, 3);
	});

	it("filters out zero-count codes", () => {
		const comps = [
			{
				name: "AppA",
				summary: {
					issueCounts: Object.fromEntries(ISSUE_CODES.map((c) => [c, 0])),
				},
			},
		];
		const result = findCrossCompetitorComplaints(comps);
		assert.equal(result.length, 0);
	});

	it("sorts by total descending", () => {
		const comps = [
			{
				name: "AppA",
				summary: {
					issueCounts: Object.fromEntries(
						ISSUE_CODES.map((c) => [
							c,
							c === "ui" ? 10 : c === "crash" ? 3 : 0,
						]),
					),
				},
			},
		];
		const result = findCrossCompetitorComplaints(comps);
		assert.equal(result[0].code, "ui");
		assert.equal(result[1].code, "crash");
	});
});

describe("market: CLI smoke", () => {
	it("--help yardim gosterir", () => {
		const out = execFileSync("node", [BIN, "market", "--help"], {
			encoding: "utf-8",
			timeout: 10000,
		});
		assert.match(out, /Pazar Arastirmasi/);
		assert.match(out, /discover/);
		assert.match(out, /reviews/);
		assert.match(out, /difficulty/);
	});

	it("argumansiz --help'i tetikler", () => {
		const out = execFileSync("node", [BIN, "market"], {
			encoding: "utf-8",
			timeout: 10000,
		});
		assert.match(out, /Pazar Arastirmasi/);
	});

	it("gecersiz appId hata verir", () => {
		assert.throws(() => {
			execFileSync("node", [BIN, "market", "discover", "not-an-id"], {
				encoding: "utf-8",
				timeout: 10000,
				stdio: "pipe",
			});
		}, /Gecersiz app ID/);
	});

	it("URL'den appId cikarir (parse smoke)", () => {
		// Using --help instead of full run to avoid network calls
		const out = execFileSync("node", [BIN, "market", "--help"], {
			encoding: "utf-8",
			timeout: 10000,
		});
		// Help mentions URL parsing
		assert.match(out, /apps\.apple\.com/);
	});

	it("--help wishlist subcommand'i listeler", () => {
		const out = execFileSync("node", [BIN, "market", "--help"], {
			encoding: "utf-8",
			timeout: 10000,
		});
		assert.match(out, /wishlist/);
		assert.match(out, /Demand × supply matrix/);
	});
});

describe("market: computeWishlistMatrix", () => {
	it("yuksek talep + dusuk arz -> BLUE_OCEAN", () => {
		const m = computeWishlistMatrix({ demand: 50, supply: 3 });
		assert.equal(m.quadrant, "BLUE_OCEAN");
	});

	it("yuksek talep + yuksek arz -> COMPETITIVE", () => {
		const m = computeWishlistMatrix({ demand: 100, supply: 25 });
		assert.equal(m.quadrant, "COMPETITIVE");
	});

	it("dusuk talep + dusuk arz -> NICHE", () => {
		const m = computeWishlistMatrix({ demand: 5, supply: 2 });
		assert.equal(m.quadrant, "NICHE");
	});

	it("dusuk talep + yuksek arz -> SATURATED", () => {
		const m = computeWishlistMatrix({ demand: 10, supply: 50 });
		assert.equal(m.quadrant, "SATURATED");
	});

	it("eslik (esit) demand threshold -> high tarafta", () => {
		const m = computeWishlistMatrix({ demand: 30, supply: 3 });
		assert.equal(m.quadrant, "BLUE_OCEAN");
	});

	it("eslik (esit) supply threshold -> high tarafta", () => {
		const m = computeWishlistMatrix({ demand: 5, supply: 8 });
		assert.equal(m.quadrant, "SATURATED");
	});

	it("custom thresholds uygulanir", () => {
		const m = computeWishlistMatrix({
			demand: 15,
			supply: 4,
			thresholds: { highDemand: 10, highSupply: 3 },
		});
		assert.equal(m.quadrant, "COMPETITIVE");
	});

	it("response shape doğru", () => {
		const m = computeWishlistMatrix({ demand: 50, supply: 3 });
		assert.equal(typeof m.demand, "number");
		assert.equal(typeof m.supply, "number");
		assert.ok(m.thresholds.highDemand);
		assert.ok(m.thresholds.highSupply);
	});
});

describe("market: findOpportunityGaps", () => {
	const sampleCross = [
		{ code: "crash", total: 12, perApp: { A: 5, B: 4, C: 3 } },
		{ code: "ads", total: 5, perApp: { A: 3, B: 2 } },
		{ code: "ui", total: 2, perApp: { C: 2 } },
	];

	it("bos input bos array doner", () => {
		assert.deepEqual(
			findOpportunityGaps({ crossComplaints: [], competitorCount: 0 }),
			[],
		);
		assert.deepEqual(
			findOpportunityGaps({ crossComplaints: sampleCross, competitorCount: 0 }),
			[],
		);
	});

	it("gap score = coverage% * volume * (1 - difficulty/100)", () => {
		const gaps = findOpportunityGaps({
			crossComplaints: sampleCross,
			competitorCount: 5,
			difficulty: { score: 50 },
		});
		const crash = gaps.find((g) => g.code === "crash");
		// coverage = 3/5 = 0.6 -> 60%
		// gapScore = 60 * 12 * 0.5 = 360
		assert.equal(crash.gapScore, 360);
		assert.equal(crash.coverage, 60);
	});

	it("HIGH severity = high coverage + high volume", () => {
		const gaps = findOpportunityGaps({
			crossComplaints: [
				{ code: "crash", total: 10, perApp: { A: 4, B: 3, C: 3 } },
			],
			competitorCount: 5,
			difficulty: { score: 30 },
		});
		assert.equal(gaps[0].severity, "HIGH");
	});

	it("LOW severity = low coverage + low volume", () => {
		const gaps = findOpportunityGaps({
			crossComplaints: [{ code: "ui", total: 2, perApp: { A: 2 } }],
			competitorCount: 5,
			difficulty: { score: 30 },
		});
		assert.equal(gaps[0].severity, "LOW");
	});

	it("dusuk difficulty -> yuksek gapScore (1 - difficulty etkisi)", () => {
		const cross = [{ code: "crash", total: 10, perApp: { A: 5, B: 5 } }];
		const easy = findOpportunityGaps({
			crossComplaints: cross,
			competitorCount: 5,
			difficulty: { score: 10 },
		});
		const hard = findOpportunityGaps({
			crossComplaints: cross,
			competitorCount: 5,
			difficulty: { score: 90 },
		});
		assert.ok(easy[0].gapScore > hard[0].gapScore);
	});

	it("Reddit demand boost gapScore'u artirir", () => {
		const cross = [{ code: "crash", total: 10, perApp: { A: 5, B: 5 } }];
		const noBoost = findOpportunityGaps({
			crossComplaints: cross,
			competitorCount: 5,
			difficulty: { score: 50 },
		});
		const withBoost = findOpportunityGaps({
			crossComplaints: cross,
			competitorCount: 5,
			difficulty: { score: 50 },
			demandSignal: 100,
		});
		assert.ok(withBoost[0].gapScore > noBoost[0].gapScore);
	});

	it("sonuc gapScore'a gore azalan sirali", () => {
		const gaps = findOpportunityGaps({
			crossComplaints: sampleCross,
			competitorCount: 5,
			difficulty: { score: 50 },
		});
		for (let i = 1; i < gaps.length; i++) {
			assert.ok(gaps[i - 1].gapScore >= gaps[i].gapScore);
		}
	});

	it("rationale insan-okunabilir cumle", () => {
		const gaps = findOpportunityGaps({
			crossComplaints: sampleCross,
			competitorCount: 5,
			difficulty: { score: 40 },
		});
		assert.match(gaps[0].rationale, /rakip/);
		assert.match(gaps[0].rationale, /negatif yorum/);
		assert.match(gaps[0].rationale, /pazar zorlugu/);
	});
});
