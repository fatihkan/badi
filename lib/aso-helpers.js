// iTunes Search/Lookup API ve Google Play scraping yardimcilari

export const LIMITS = {
	appstore: { title: 30, subtitle: 30, keywords: 100, description: 4000, promo: 170 },
	playstore: { title: 50, short: 80, description: 4000 },
};

function validateUrl(url) {
	const parsed = new URL(url);
	if (!["http:", "https:"].includes(parsed.protocol)) {
		throw new Error(`Gecersiz protokol: ${parsed.protocol}`);
	}
	return parsed;
}

async function fetchJson(url, opts = {}) {
	validateUrl(url);
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), opts.timeout || 10000);
	try {
		const res = await fetch(url, {
			signal: controller.signal,
			headers: { "User-Agent": "Badi-ASO/1.5 (+https://github.com/fatihkan/badi)" },
		});
		clearTimeout(timeout);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return await res.json();
	} catch (e) {
		clearTimeout(timeout);
		throw new Error(`API hatasi: ${e.message}`);
	}
}

async function fetchHtml(url, opts = {}) {
	validateUrl(url);
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), opts.timeout || 10000);
	try {
		const res = await fetch(url, {
			signal: controller.signal,
			headers: { "User-Agent": "Badi-ASO/1.5 (+https://github.com/fatihkan/badi)" },
		});
		clearTimeout(timeout);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return await res.text();
	} catch (e) {
		clearTimeout(timeout);
		throw new Error(`Fetch hatasi: ${e.message}`);
	}
}

// ─── iTunes (App Store) ───

export async function lookupAppStore(appId, country = "us") {
	const url = `https://itunes.apple.com/lookup?id=${encodeURIComponent(appId)}&country=${country}`;
	const data = await fetchJson(url);
	if (!data.results || data.results.length === 0) {
		throw new Error(`App bulunamadi: ${appId} (country: ${country})`);
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
	const regex = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, "i");
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
		ratingCount: ratingCountMatch ? Number.parseInt(ratingCountMatch[1].replace(/,/g, "")) : null,
		url,
	};
}

// ─── Keyword Analizi ───

export function extractKeywords(text) {
	if (!text) return [];
	// Stopwords (TR+EN basit set)
	const stopwords = new Set([
		"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "is", "are", "was", "were", "be", "been", "this", "that", "these", "those", "i", "you", "he", "she", "it", "we", "they", "my", "your", "his", "her", "its", "our", "their",
		"bir", "ve", "ile", "icin", "ama", "de", "da", "bu", "su", "o", "ben", "sen", "biz", "siz", "onlar", "var", "yok", "olan", "olarak",
	]);
	const words = text.toLowerCase()
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
