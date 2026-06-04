// Market research helpers — competitor discovery, multi-region review
// aggregation, complaint categorization, difficulty scoring.
//
// MVP scope: competitor discovery + categorization + difficulty score.
// Phase 2 (tracked separately): SensorTower revenue, complaint heatmap,
// wishlist demand×supply matrix, opportunity gaps.
//
// All public endpoints — no API keys.

import { fetchAppStoreReviews, searchAppStore } from "./aso-helpers.js";

const ISSUE_CODES = [
	"crash",
	"performance",
	"login",
	"sync",
	"notification",
	"payment",
	"ads",
	"ui",
	"missing-feature",
	"broken-feature",
	"other",
];

// Patterns use stem matching (no \b on right side) so "crashing", "crashed",
// "yavasi" all match their stems. Order in ISSUE_CODES decides priority on
// multi-match.
const ISSUE_PATTERNS = {
	crash: /\b(crash|cok(uyor|en)|kapan(iyor|di)|donu(yor|p)|freeze|froze)/i,
	performance: /\b(slow|lag|yavas|takil|sluggish|loading forever|stuck)/i,
	login: /\b(login|sign[- ]?in|password|giris|sifre|hesab|account|locked out)/i,
	sync: /\b(sync|synchron|backup|cloud|kaydetm|veri kayb|data loss|lost data)/i,
	notification: /\b(notification|alert|push|bildirim|hatirlat|reminder)/i,
	payment: /\b(billing|charge|refund|odeme|abon|subscription|odiyo|paid)/i,
	ads: /\b(ads?\b|advert|reklam|popup|paywall)/i,
	ui: /\b(ui\b|interface|design|layout|tasarim|arayuz|confusing|kafa karistir)/i,
	"missing-feature":
		/\b(wish|hope|need|missing|olsa|isterim|eksik|should add|please add|gerek)/i,
	"broken-feature": /\b(broken|doesn'?t work|won'?t work|calismi|bozuk|hata)/i,
};

/**
 * Assigns a review's text to one of 11 categories.
 * If multiple patterns match, takes the first (in ISSUE_CODES order).
 */
export function categorizeReviewIssue(text) {
	const blob = String(text || "").toLowerCase();
	for (const code of ISSUE_CODES) {
		const pat = ISSUE_PATTERNS[code];
		if (pat?.test(blob)) return code;
	}
	return "other";
}

/**
 * Find N competitors from the target app's category.
 * The only downside of iTunes Search is that it does not support category
 * filtering — we use the app name or type as the search query.
 */
export async function discoverCompetitors(target, opts = {}) {
	const { country = "us", limit = 10 } = opts;
	const queries = [target.primaryGenre, ...(target.genres || [])].filter(
		Boolean,
	);

	const seen = new Map();
	for (const q of queries) {
		if (seen.size >= limit + 5) break;
		try {
			const results = await searchAppStore(q, country, 25);
			for (const app of results) {
				if (app.id === target.id) continue;
				if (seen.has(app.id)) continue;
				if (app.genre && app.genre !== target.primaryGenre) continue;
				seen.set(app.id, app);
				if (seen.size >= limit) break;
			}
		} catch {
			// Search failure on one term is non-fatal
		}
	}

	return [...seen.values()].slice(0, limit);
}

/**
 * Multi-page + multi-region review aggregation.
 * @returns Flat array of reviews with country tag.
 */
export async function aggregateReviewsMultiRegion(appId, opts = {}) {
	const { countries = ["us"], pages = 3 } = opts;
	const all = [];
	for (const country of countries) {
		for (let p = 1; p <= pages; p++) {
			try {
				const reviews = await fetchAppStoreReviews(appId, country, p);
				for (const r of reviews) {
					all.push({ ...r, country });
				}
				// Empty page means no more reviews
				if (reviews.length === 0) break;
			} catch {
				// Region/page failure is non-fatal
				break;
			}
		}
	}
	return all;
}

/**
 * 11-code issue distribution + ratings summary from a review list.
 */
export function summarizeReviews(reviews) {
	const counts = Object.fromEntries(ISSUE_CODES.map((c) => [c, 0]));
	const byRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
	const negative = []; // 1-3 stars
	const positive = []; // 4-5 stars

	for (const r of reviews) {
		const text = `${r.title} ${r.content || r.review || ""}`;
		const rating = Number(r.rating);
		if (rating >= 1 && rating <= 5) byRating[rating]++;

		if (rating <= 3) {
			const code = categorizeReviewIssue(text);
			counts[code]++;
			negative.push({ ...r, code });
		} else if (rating >= 4) {
			positive.push(r);
		}
	}

	return {
		total: reviews.length,
		byRating,
		negativeCount: negative.length,
		positiveCount: positive.length,
		issueCounts: counts,
		negative,
		positive,
	};
}

/**
 * Difficulty score: 0-100 + categorical verdict.
 * Heuristic: rating count median, average rating, competitor count.
 */
export function calculateDifficulty(_target, competitors) {
	const counts = competitors
		.map((c) => c.ratingCount || 0)
		.sort((a, b) => a - b);
	const median =
		counts.length === 0 ? 0 : counts[Math.floor(counts.length / 2)];
	const avgRating =
		competitors.length === 0
			? 0
			: competitors.reduce((s, c) => s + (c.rating || 0), 0) /
				competitors.length;

	// Score components (0-100):
	const competitorPressure = Math.min(100, competitors.length * 8); // 10 comps -> 80
	const ratingFloor = avgRating >= 4.5 ? 30 : avgRating >= 4 ? 15 : 0;
	const incumbentEntrenchment =
		median >= 100_000 ? 30 : median >= 10_000 ? 15 : 0;

	const score = Math.min(
		100,
		Math.round(competitorPressure * 0.5 + ratingFloor + incumbentEntrenchment),
	);

	let verdict;
	if (score < 30) verdict = "BLUE_OCEAN";
	else if (score < 55) verdict = "COMPETITIVE";
	else if (score < 80) verdict = "HARD";
	else verdict = "SATURATED";

	return {
		score,
		verdict,
		components: {
			competitorPressure,
			ratingFloor,
			incumbentEntrenchment,
			medianRatingCount: median,
			avgRating: Number(avgRating.toFixed(2)),
		},
	};
}

/**
 * Find the most frequently recurring complaints as an intersection across competitors.
 * Returns: { code, total, perCompetitor: {appName: count} }
 */
export function findCrossCompetitorComplaints(competitorSummaries) {
	const matrix = {};
	for (const code of ISSUE_CODES) {
		matrix[code] = { total: 0, perApp: {} };
	}
	for (const { name, summary } of competitorSummaries) {
		for (const [code, count] of Object.entries(summary.issueCounts)) {
			if (count > 0) {
				matrix[code].total += count;
				matrix[code].perApp[name] = count;
			}
		}
	}
	return Object.entries(matrix)
		.map(([code, data]) => ({ code, ...data }))
		.filter((e) => e.total > 0)
		.sort((a, b) => b.total - a.total);
}

/**
 * Cross-competitor complaint-intersection data + difficulty + (optional) wishlist demand
 * signals are crossed to produce opportunity findings.
 *
 * Each finding is built around a complaint category:
 *   - how many competitor apps suffer from this complaint (coverage)
 *   - total negative review count (volume)
 *   - the combined estimate of the market-gap score (gap score) in this category
 *
 * gap score = coverage% (percentage / 100) * volume * (1 - difficulty/100)
 *   - high coverage: present in many competitors -> the complaint is sector-wide
 *   - high volume: a complaint that can be sustained cheaply
 *   - low difficulty: market entry is feasible
 *
 * @param {Object} input
 * @param {Array} input.crossComplaints — findCrossCompetitorComplaints output
 * @param {Number} input.competitorCount — total competitor count (for coverage%)
 * @param {Object} input.difficulty — calculateDifficulty result
 * @param {Number} [input.demandSignal] — optional Reddit mentions
 * @returns Array<{ code, coverage, volume, gapScore, severity, rationale }>
 */
export function findOpportunityGaps(input) {
	const {
		crossComplaints = [],
		competitorCount = 0,
		difficulty = { score: 50 },
		demandSignal,
	} = input;

	if (competitorCount === 0 || crossComplaints.length === 0) {
		return [];
	}

	const findings = crossComplaints.map((c) => {
		const affected = Object.keys(c.perApp || {}).length;
		const coverage = competitorCount > 0 ? affected / competitorCount : 0;
		const volume = c.total || 0;
		const difficultyFactor = 1 - difficulty.score / 100;
		const gapScore = Math.round(coverage * 100 * volume * difficultyFactor);

		// Demand boost: if reddit demand exists, multiply gap score
		const boostedScore = demandSignal
			? Math.round(gapScore * (1 + Math.min(2, demandSignal / 50)))
			: gapScore;

		let severity;
		if (coverage >= 0.6 && volume >= 8) severity = "HIGH";
		else if (coverage >= 0.4 || volume >= 5) severity = "MEDIUM";
		else severity = "LOW";

		const coveragePct = Math.round(coverage * 100);
		const rationale = `${affected}/${competitorCount} competitors (${coveragePct}%) affected by this issue; ${volume} negative reviews; market difficulty ${difficulty.score}/100`;

		return {
			code: c.code,
			coverage: coveragePct,
			affected,
			volume,
			gapScore: boostedScore,
			severity,
			rationale,
			perApp: c.perApp,
		};
	});

	return findings.sort((a, b) => b.gapScore - a.gapScore);
}

/**
 * Demand signal over the last N days for a category/keyword on Reddit.
 * Uses an anonymous JSON endpoint (free, 60 req/min). No API key.
 *
 * @returns { mentions, subreddits, sample, fetchedAt }
 */
export async function fetchRedditDemand(query, opts = {}) {
	const { days = 30, limit = 100 } = opts;
	const sinceTs = Math.floor((Date.now() - days * 86400_000) / 1000);
	const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&t=month&limit=${limit}`;

	let data;
	try {
		const res = await fetch(url, {
			headers: {
				// Reddit rejects requests without a User-Agent
				"User-Agent": "badi-market/1.0 (+https://github.com/fatihkan/badi)",
			},
		});
		if (!res.ok) {
			throw new Error(`Reddit ${res.status}`);
		}
		data = await res.json();
	} catch (e) {
		return {
			mentions: 0,
			subreddits: {},
			sample: [],
			error: e.message,
			fetchedAt: new Date().toISOString(),
		};
	}

	const posts = (data?.data?.children || [])
		.map((c) => c?.data || {})
		.filter((p) => p.created_utc >= sinceTs);

	const subreddits = {};
	const sample = [];
	for (const p of posts) {
		const sub = p.subreddit || "unknown";
		subreddits[sub] = (subreddits[sub] || 0) + 1;
		if (sample.length < 5) {
			sample.push({
				title: p.title,
				subreddit: sub,
				score: p.score,
				comments: p.num_comments,
				url: `https://reddit.com${p.permalink}`,
			});
		}
	}

	return {
		mentions: posts.length,
		subreddits,
		sample,
		fetchedAt: new Date().toISOString(),
	};
}

/**
 * Wishlist demand × supply matrix.
 * Demand from Reddit mentions; supply from App Store competitor count.
 *
 * Quadrants:
 *   high demand × low supply  → BLUE_OCEAN
 *   high demand × high supply → COMPETITIVE
 *   low demand  × low supply  → NICHE
 *   low demand  × high supply → SATURATED
 */
export function computeWishlistMatrix({ demand, supply, thresholds = {} }) {
	const { highDemand = 30, highSupply = 8 } = thresholds;
	const isHighDemand = demand >= highDemand;
	const isHighSupply = supply >= highSupply;

	let quadrant;
	if (isHighDemand && !isHighSupply) quadrant = "BLUE_OCEAN";
	else if (isHighDemand && isHighSupply) quadrant = "COMPETITIVE";
	else if (!isHighDemand && !isHighSupply) quadrant = "NICHE";
	else quadrant = "SATURATED";

	return {
		demand,
		supply,
		quadrant,
		thresholds: { highDemand, highSupply },
	};
}

export { ISSUE_CODES };
