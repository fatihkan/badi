import { parse as parseHtml } from "node-html-parser";
import { fetchWithTimeout } from "../../helpers.js";

export const SEO_UA = "Badi-SEO/1.11 (+https://github.com/fatihkan/badi)";

// ─── HTML Parse Helpers ───

export function extractTag(html, tag) {
	const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
	const match = html.match(regex);
	return match ? match[1].trim() : null;
}

export function extractMeta(html, name) {
	// name or property attribute
	const regex = new RegExp(
		`<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`,
		"i",
	);
	const match = html.match(regex);
	if (match) return match[1];
	// reverse order (content first)
	const regex2 = new RegExp(
		`<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`,
		"i",
	);
	const match2 = html.match(regex2);
	return match2 ? match2[1] : null;
}

export function extractAllMeta(html) {
	const metas = [];
	const regex = /<meta[^>]*>/gi;
	for (const m of html.matchAll(regex)) {
		const tag = m[0];
		const name = tag.match(/(?:name|property)=["']([^"']*)["']/i)?.[1] || "";
		const content = tag.match(/content=["']([^"']*)["']/i)?.[1] || "";
		if (name) metas.push({ name, content });
	}
	return metas;
}

// Nested tag injection (e.g. `<scr<script>ipt>`) is not handled by a
// single-pass strip: removing the inner tag completes the outer one.
// Replace recursively until no further change remains.
export function stripTags(text) {
	let prev;
	let out = text;
	do {
		prev = out;
		out = out.replace(/<[^>]*>/g, "");
	} while (out !== prev);
	return out;
}

export function extractHeadings(html) {
	const headings = [];
	for (let level = 1; level <= 6; level++) {
		const regex = new RegExp(
			`<h${level}[^>]*>([\\s\\S]*?)<\\/h${level}>`,
			"gi",
		);
		for (const m of html.matchAll(regex)) {
			headings.push({ level, text: stripTags(m[1]).trim() });
		}
	}
	return headings;
}

export function extractImages(html) {
	const images = [];
	const regex = /<img[^>]*>/gi;
	for (const m of html.matchAll(regex)) {
		const tag = m[0];
		const src = tag.match(/src=["']([^"']*)["']/i)?.[1] || "";
		const alt = tag.match(/alt=["']([^"']*)["']/i)?.[1] || "";
		const hasAlt = /alt=["']/i.test(tag);
		images.push({ src: src.substring(0, 60), alt, hasAlt });
	}
	return images;
}

export function extractLinks(html, baseUrl) {
	const links = { internal: 0, external: 0, nofollow: 0, broken: [] };
	const regex = /<a[^>]*href=["']([^"']*)["'][^>]*>/gi;
	const host = new URL(baseUrl).hostname;
	for (const m of html.matchAll(regex)) {
		const href = m[1];
		const tag = m[0];
		if (
			href.startsWith("#") ||
			href.startsWith("mailto:") ||
			href.startsWith("tel:")
		)
			continue;
		try {
			const url = new URL(href, baseUrl);
			if (url.hostname === host) links.internal++;
			else links.external++;
		} catch {
			links.internal++;
		}
		if (/rel=["'][^"']*nofollow/i.test(tag)) links.nofollow++;
	}
	return links;
}

export function countWords(html) {
	// Strip script/style content safely via the HTML parser. Regex-based
	// sanitization is considered bypass-prone by CodeQL (nested injection,
	// closing tags with attributes, etc.) — walking the DOM tree is far more
	// robust. `structuredText` inserts newlines between block elements, so
	// "<p>One</p><p>Two</p>" becomes "One\nTwo" instead of "OneTwo" (correct
	// word count).
	const root = parseHtml(html, { lowerCaseTagName: true });
	for (const node of root.querySelectorAll("script, style")) {
		node.remove();
	}
	const text = root.structuredText.replace(/\s+/g, " ").trim();
	return text.split(" ").filter(Boolean).length;
}

// ─── Fetch Helper ───

export async function fetchPage(url) {
	try {
		const res = await fetchWithTimeout(url, {
			timeoutMs: 15000,
			userAgent: SEO_UA,
			redirect: "follow",
		});
		const html = await res.text();
		return { html, status: res.status, headers: res.headers, url: res.url };
	} catch (e) {
		throw new Error(`Failed to load page: ${e.message}`);
	}
}

// ─── DuckDuckGo (backlinks + rank) ───

export async function fetchDDG(query, timeoutMs = 15000) {
	// The DDG HTML endpoint returns a shell page on GET — POST + browser UA required.
	const res = await fetchWithTimeout("https://html.duckduckgo.com/html/", {
		timeoutMs,
		method: "POST",
		userAgent:
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({ q: query }).toString(),
	});
	if (!res.ok) throw new Error(`DDG HTTP ${res.status}`);
	return await res.text();
}

// Pure function: extracts the result list from DDG HTML.
// Testable (no network needed). Returns URL host+position+raw info.
export function parseDDGResults(html, max = 30) {
	const regex =
		/<a[^>]*class=["'][^"']*result__url[^"']*["'][^>]*href=["']([^"']+)["']/gi;
	const results = [];
	for (const m of html.matchAll(regex)) {
		if (results.length >= max) break;
		try {
			const raw = m[1];
			const decoded = raw.startsWith("//") ? `https:${raw}` : raw;
			const host = new URL(decoded).hostname.replace(/^www\./, "");
			results.push({ position: results.length + 1, host, url: decoded });
		} catch {
			/* invalid URL, skip */
		}
	}
	return results;
}
