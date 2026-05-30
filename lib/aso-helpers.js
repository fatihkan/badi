// iTunes Search/Lookup API ve Google Play scraping yardimcilari

import { fetchJsonWithTimeout, fetchWithTimeout } from "./helpers.js";

export const LIMITS = {
	appstore: {
		title: 30,
		subtitle: 30,
		keywords: 100,
		description: 4000,
		promo: 170,
	},
	playstore: { title: 50, short: 80, description: 4000 },
};

const ASO_UA = "Badi-ASO/1.11 (+https://github.com/fatihkan/badi)";

async function fetchJson(url, opts = {}) {
	return fetchJsonWithTimeout(url, {
		timeoutMs: opts.timeout || 10000,
		userAgent: ASO_UA,
	});
}

async function fetchHtml(url, opts = {}) {
	const res = await fetchWithTimeout(url, {
		timeoutMs: opts.timeout || 10000,
		userAgent: ASO_UA,
	});
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return await res.text();
}

// ─── iTunes (App Store) ───

export async function lookupAppStore(appId, country = "us") {
	const url = `https://itunes.apple.com/lookup?id=${encodeURIComponent(appId)}&country=${country}`;
	const data = await fetchJson(url);
	if (!data.results || data.results.length === 0) {
		throw new Error(`App not found: ${appId} (country: ${country})`);
	}
	const r = data.results[0];
	return {
		id: r.trackId,
		name: r.trackName,
		subtitle: r.subtitle || "",
		description: r.description || "",
		releaseNotes: r.releaseNotes || "",
		version: r.version,
		seller: r.sellerName,
		primaryGenre: r.primaryGenreName,
		genres: r.genres || [],
		averageRating: r.averageUserRating,
		ratingCount: r.userRatingCount,
		price: r.price,
		currency: r.currency,
		contentAdvisoryRating: r.contentAdvisoryRating,
		fileSizeBytes: Number(r.fileSizeBytes || 0),
		screenshotUrls: r.screenshotUrls || [],
		icon: r.artworkUrl512 || r.artworkUrl100,
		bundleId: r.bundleId,
		minimumOsVersion: r.minimumOsVersion,
		supportedLanguages: r.languageCodesISO2A || [],
		updatedAt: r.currentVersionReleaseDate,
		releaseDate: r.releaseDate,
		url: r.trackViewUrl,
	};
}

export async function searchAppStore(query, country = "us", limit = 10) {
	const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=${country}&media=software&limit=${limit}`;
	const data = await fetchJson(url);
	return (data.results || []).map((r) => ({
		id: r.trackId,
		name: r.trackName,
		seller: r.sellerName,
		genre: r.primaryGenreName,
		rating: r.averageUserRating,
		ratingCount: r.userRatingCount,
		url: r.trackViewUrl,
	}));
}

// ─── Google Play (HTML scrape) ───

function extractMetaContent(html, property) {
	const regex = new RegExp(
		`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`,
		"i",
	);
	return html.match(regex)?.[1] || null;
}

export async function lookupPlayStore(appId, country = "us", lang = "en") {
	const url = `https://play.google.com/store/apps/details?id=${encodeURIComponent(appId)}&gl=${country}&hl=${lang}`;
	const html = await fetchHtml(url);
	const title = extractMetaContent(html, "og:title") || "";
	const description = extractMetaContent(html, "og:description") || "";
	const image = extractMetaContent(html, "og:image") || "";

	// Rating cekme (best effort)
	const ratingMatch = html.match(/"ratingValue":"?([\d.]+)"?/);
	const ratingCountMatch = html.match(/"ratingCount":"?([\d,]+)"?/);

	return {
		id: appId,
		name: title.replace(/ - Apps on Google Play$/, ""),
		description,
		icon: image,
		averageRating: ratingMatch ? Number.parseFloat(ratingMatch[1]) : null,
		ratingCount: ratingCountMatch
			? Number.parseInt(ratingCountMatch[1].replace(/,/g, ""), 10)
			: null,
		url,
	};
}

// ─── Keyword Analizi ───

export function extractKeywords(text) {
	if (!text) return [];
	// Stopwords (TR+EN basit set)
	const stopwords = new Set([
		"the",
		"a",
		"an",
		"and",
		"or",
		"but",
		"in",
		"on",
		"at",
		"to",
		"for",
		"of",
		"with",
		"by",
		"from",
		"is",
		"are",
		"was",
		"were",
		"be",
		"been",
		"this",
		"that",
		"these",
		"those",
		"i",
		"you",
		"he",
		"she",
		"it",
		"we",
		"they",
		"my",
		"your",
		"his",
		"her",
		"its",
		"our",
		"their",
		"bir",
		"ve",
		"ile",
		"icin",
		"ama",
		"de",
		"da",
		"bu",
		"su",
		"o",
		"ben",
		"sen",
		"biz",
		"siz",
		"onlar",
		"var",
		"yok",
		"olan",
		"olarak",
	]);
	const words = text
		.toLowerCase()
		.replace(/[^\p{L}\s]/gu, " ")
		.split(/\s+/)
		.filter((w) => w.length >= 3 && !stopwords.has(w));
	const freq = {};
	for (const w of words) freq[w] = (freq[w] || 0) + 1;
	return Object.entries(freq).sort((a, b) => b[1] - a[1]);
}

export function validateMetadata(platform, field, text) {
	const limit = LIMITS[platform]?.[field];
	if (!limit) return { ok: true, limit: null };
	const len = (text || "").length;
	return { ok: len <= limit, limit, length: len, remaining: limit - len };
}

// ─── Reviews (iTunes RSS) ───

export async function fetchAppStoreReviews(appId, country = "us", page = 1) {
	const url = `https://itunes.apple.com/${country}/rss/customerreviews/page=${page}/id=${encodeURIComponent(appId)}/sortBy=mostRecent/json`;
	const data = await fetchJson(url);
	const entries = data.feed?.entry || [];
	return entries
		.filter((e) => e["im:rating"])
		.map((e) => ({
			id: e.id?.label || "",
			title: e.title?.label || "",
			content: e.content?.label || "",
			rating: Number.parseInt(e["im:rating"]?.label || "0", 10),
			version: e["im:version"]?.label || "",
			author: e.author?.name?.label || "",
			updated: e.updated?.label || "",
		}));
}

const SENTIMENT_KEYWORDS = {
	positive: [
		"great",
		"love",
		"awesome",
		"perfect",
		"best",
		"excellent",
		"amazing",
		"good",
		"super",
		"harika",
		"mukemmel",
		"sevdim",
		"guzel",
		"bayildim",
		"muhtesem",
		"favorim",
	],
	negative: [
		"bad",
		"terrible",
		"worst",
		"hate",
		"awful",
		"disappointed",
		"garbage",
		"useless",
		"slow",
		"kotu",
		"berbat",
		"nefret",
		"yavas",
		"hayal",
	],
	bug: [
		"crash",
		"bug",
		"broken",
		"freeze",
		"stuck",
		"error",
		"glitch",
		"cokuyor",
		"donuyor",
		"acilmiyor",
		"calismiyor",
		"bozuk",
	],
	feature_request: [
		"wish",
		"please add",
		"would be nice",
		"suggestion",
		"missing",
		"should have",
		"feature request",
		"eklenmeli",
		"olmali",
		"keske",
		"eksik",
	],
};

export function analyzeSentiment(reviews) {
	const counts = {
		positive: 0,
		negative: 0,
		bug: 0,
		feature_request: 0,
		neutral: 0,
	};
	const categorized = [];

	for (const r of reviews) {
		const text = `${r.title} ${r.content}`.toLowerCase();
		const cats = new Set();
		for (const [cat, keywords] of Object.entries(SENTIMENT_KEYWORDS)) {
			for (const kw of keywords) {
				if (text.includes(kw)) {
					cats.add(cat);
					break;
				}
			}
		}
		if (cats.size === 0) {
			if (r.rating >= 4) cats.add("positive");
			else if (r.rating <= 2) cats.add("negative");
			else cats.add("neutral");
		}
		for (const c of cats) counts[c]++;
		categorized.push({ ...r, categories: [...cats] });
	}

	const total = reviews.length || 1;
	return {
		total: reviews.length,
		averageRating:
			reviews.length > 0
				? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
				: 0,
		counts,
		percentages: Object.fromEntries(
			Object.entries(counts).map(([k, v]) => [
				k,
				Math.round((v / total) * 100),
			]),
		),
		categorized,
	};
}

// ─── Screenshot metadata ───

export function parseScreenshotUrl(url) {
	const m = url.match(/\/(\d+)x(\d+)[a-z]*\.(png|jpg|jpeg|webp)/i);
	if (m) {
		return {
			url,
			width: Number.parseInt(m[1], 10),
			height: Number.parseInt(m[2], 10),
			format: m[3].toLowerCase(),
			orientation:
				Number.parseInt(m[2], 10) > Number.parseInt(m[1], 10)
					? "portrait"
					: "landscape",
		};
	}
	return { url, width: null, height: null, format: null, orientation: null };
}
