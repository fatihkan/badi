// Market research helpers — competitor discovery, multi-region review
// aggregation, complaint categorization, difficulty scoring.
//
// MVP scope: competitor discovery + categorization + difficulty score.
// Phase 2 (tracked separately): SensorTower revenue, complaint heatmap,
// wishlist demand×supply matrix, opportunity gaps.
//
// All public endpoints — no API keys.

import {
	fetchAppStoreReviews,
	lookupAppStore,
	searchAppStore,
} from "./aso-helpers.js";

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
	performance:
		/\b(slow|lag|yavas|takil|sluggish|loading forever|stuck)/i,
	login: /\b(login|sign[- ]?in|password|giris|sifre|hesab|account|locked out)/i,
	sync: /\b(sync|synchron|backup|cloud|kaydetm|veri kayb|data loss|lost data)/i,
	notification: /\b(notification|alert|push|bildirim|hatirlat|reminder)/i,
	payment: /\b(billing|charge|refund|odeme|abon|subscription|odiyo|paid)/i,
	ads: /\b(ads?\b|advert|reklam|popup|paywall)/i,
	ui: /\b(ui\b|interface|design|layout|tasarim|arayuz|confusing|kafa karistir)/i,
	"missing-feature":
		/\b(wish|hope|need|missing|olsa|isterim|eksik|should add|please add|gerek)/i,
	"broken-feature":
		/\b(broken|doesn'?t work|won'?t work|calismi|bozuk|hata)/i,
};

/**
 * Bir incelemenin metnini 11 kategoriden birine atar.
 * Birden fazla pattern eslesirse ilk match'i alir (ISSUE_CODES sirasinda).
 */
export function categorizeReviewIssue(text) {
	const blob = String(text || "").toLowerCase();
	for (const code of ISSUE_CODES) {
		const pat = ISSUE_PATTERNS[code];
		if (pat && pat.test(blob)) return code;
	}
	return "other";
}

/**
 * Hedef app'in kategorisinden N rakip bul.
 * iTunes Search'in tek dezavantaji kategori filtre desteklemiyor olmasi —
 * arama query'si olarak app adi veya tur kullaniyoruz.
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
 * Coklu sayfa + coklu bolge inceleme aggregation.
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
 * Inceleme listesinden 11-kod issue dağılımı + ratings ozeti.
 */
export function summarizeReviews(reviews) {
	const counts = Object.fromEntries(ISSUE_CODES.map((c) => [c, 0]));
	const byRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
	const negative = []; // 1-3 yildiz
	const positive = []; // 4-5 yildiz

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
export function calculateDifficulty(target, competitors) {
	const counts = competitors.map((c) => c.ratingCount || 0).sort((a, b) => a - b);
	const median =
		counts.length === 0 ? 0 : counts[Math.floor(counts.length / 2)];
	const avgRating =
		competitors.length === 0
			? 0
			: competitors.reduce((s, c) => s + (c.rating || 0), 0) / competitors.length;

	// Score components (0-100):
	const competitorPressure = Math.min(100, competitors.length * 8); // 10 comps -> 80
	const ratingFloor = avgRating >= 4.5 ? 30 : avgRating >= 4 ? 15 : 0;
	const incumbentEntrenchment = median >= 100_000 ? 30 : median >= 10_000 ? 15 : 0;

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
 * En sik tekrar eden sikayetleri rakipler arasinda kesisim olarak bul.
 * Geri donus: { code, total, perCompetitor: {appName: count} }
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

export { ISSUE_CODES };
