import { parse as parseHtml } from "node-html-parser";
import { chalk, showBanner } from "../cli.js";
import { fetchWithTimeout } from "../helpers.js";

const SEO_UA = "Badi-SEO/1.11 (+https://github.com/fatihkan/badi)";

// ─── HTML Parse Yardimcilari ───

function extractTag(html, tag) {
	const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
	const match = html.match(regex);
	return match ? match[1].trim() : null;
}

function extractMeta(html, name) {
	// name veya property attribute'u
	const regex = new RegExp(
		`<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`,
		"i",
	);
	const match = html.match(regex);
	if (match) return match[1];
	// ters siralama (content once)
	const regex2 = new RegExp(
		`<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`,
		"i",
	);
	const match2 = html.match(regex2);
	return match2 ? match2[1] : null;
}

function extractAllMeta(html) {
	const metas = [];
	const regex = /<meta[^>]*>/gi;
	let m;
	while ((m = regex.exec(html)) !== null) {
		const tag = m[0];
		const name = tag.match(/(?:name|property)=["']([^"']*)["']/i)?.[1] || "";
		const content = tag.match(/content=["']([^"']*)["']/i)?.[1] || "";
		if (name) metas.push({ name, content });
	}
	return metas;
}

// Iceri-icine tag yerlestirme (orn. `<scr<script>ipt>`) tek-gecisli
// strip'te calismaz: ic tag silinince dis tag tamamlanir. Recursive
// olarak, hicbir degisiklik kalmayana kadar replace et.
function stripTags(text) {
	let prev;
	let out = text;
	do {
		prev = out;
		out = out.replace(/<[^>]*>/g, "");
	} while (out !== prev);
	return out;
}

function extractHeadings(html) {
	const headings = [];
	for (let level = 1; level <= 6; level++) {
		const regex = new RegExp(
			`<h${level}[^>]*>([\\s\\S]*?)<\\/h${level}>`,
			"gi",
		);
		let m;
		while ((m = regex.exec(html)) !== null) {
			headings.push({ level, text: stripTags(m[1]).trim() });
		}
	}
	return headings;
}

function extractImages(html) {
	const images = [];
	const regex = /<img[^>]*>/gi;
	let m;
	while ((m = regex.exec(html)) !== null) {
		const tag = m[0];
		const src = tag.match(/src=["']([^"']*)["']/i)?.[1] || "";
		const alt = tag.match(/alt=["']([^"']*)["']/i)?.[1] || "";
		const hasAlt = /alt=["']/i.test(tag);
		images.push({ src: src.substring(0, 60), alt, hasAlt });
	}
	return images;
}

function extractLinks(html, baseUrl) {
	const links = { internal: 0, external: 0, nofollow: 0, broken: [] };
	const regex = /<a[^>]*href=["']([^"']*)["'][^>]*>/gi;
	let m;
	const host = new URL(baseUrl).hostname;
	while ((m = regex.exec(html)) !== null) {
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

function countWords(html) {
	// HTML parser ile script/style icerigini guvenli sekilde cikar. Regex
	// bazli sanitization CodeQL tarafindan bypass-prone goruluyor (icine
	// yerlestirme, attribute'lu closing tag, vb.) — DOM tree uzerinden
	// dolasarak cok daha saglam. `structuredText` blok elementleri arasina
	// newline koyar, boylelikle "<p>One</p><p>Two</p>" "OneTwo" yerine
	// "One\nTwo" olur (kelime sayisi dogru).
	const root = parseHtml(html, { lowerCaseTagName: true });
	for (const node of root.querySelectorAll("script, style")) {
		node.remove();
	}
	const text = root.structuredText.replace(/\s+/g, " ").trim();
	return text.split(" ").filter(Boolean).length;
}

// ─── Fetch Yardimcisi ───

async function fetchPage(url) {
	try {
		const res = await fetchWithTimeout(url, {
			timeoutMs: 15000,
			userAgent: SEO_UA,
			redirect: "follow",
		});
		const html = await res.text();
		return { html, status: res.status, headers: res.headers, url: res.url };
	} catch (e) {
		throw new Error(`Sayfa yuklenemedi: ${e.message}`);
	}
}

// ─── SEO Audit ───

async function seoAudit(url) {
	showBanner();
	console.log(chalk.bold(`SEO Denetimi: ${url}`));
	console.log("");

	const { html, status } = await fetchPage(url);
	let score = 0;
	let maxScore = 0;
	const issues = [];

	function check(label, condition, weight = 1) {
		maxScore += weight;
		if (condition) {
			console.log(`  ${chalk.green("OK")} ${label}`);
			score += weight;
		} else {
			console.log(`  ${chalk.red("XX")} ${label}`);
			issues.push(label);
		}
	}

	function warn(label, condition) {
		if (condition) {
			console.log(`  ${chalk.green("OK")} ${label}`);
		} else {
			console.log(`  ${chalk.yellow("!!")} ${label}`);
			issues.push(label);
		}
	}

	// Status code
	check(`HTTP durum kodu: ${status}`, status === 200, 2);

	// Title
	const title = extractTag(html, "title");
	console.log("");
	console.log(chalk.bold("Meta Bilgileri:"));
	check(
		`Title tagi mevcut${title ? ` (${title.length} karakter)` : ""}`,
		!!title,
	);
	if (title) {
		check(
			"Title uzunlugu 30-60 karakter",
			title.length >= 30 && title.length <= 60,
		);
	}

	// Description
	const description = extractMeta(html, "description");
	check(
		`Meta description mevcut${description ? ` (${description.length} karakter)` : ""}`,
		!!description,
	);
	if (description) {
		check(
			"Description uzunlugu 120-160 karakter",
			description.length >= 120 && description.length <= 160,
		);
	}

	// Open Graph
	console.log("");
	console.log(chalk.bold("Sosyal Medya:"));
	const ogTitle = extractMeta(html, "og:title");
	const ogDesc = extractMeta(html, "og:description");
	const ogImage = extractMeta(html, "og:image");
	check("og:title mevcut", !!ogTitle);
	check("og:description mevcut", !!ogDesc);
	check("og:image mevcut", !!ogImage);

	// Twitter Card
	const twCard = extractMeta(html, "twitter:card");
	warn("twitter:card mevcut", !!twCard);

	// Headings
	console.log("");
	console.log(chalk.bold("Baslik Yapisi:"));
	const headings = extractHeadings(html);
	const h1s = headings.filter((h) => h.level === 1);
	check(`H1 tagi mevcut (${h1s.length} adet)`, h1s.length === 1, 2);
	if (h1s.length > 1) {
		console.log(
			chalk.yellow(
				`       Birden fazla H1: ${h1s.map((h) => h.text.substring(0, 40)).join(", ")}`,
			),
		);
	}
	const h2s = headings.filter((h) => h.level === 2);
	warn(`H2 taglari mevcut (${h2s.length} adet)`, h2s.length > 0);

	// Images
	console.log("");
	console.log(chalk.bold("Gorseller:"));
	const images = extractImages(html);
	const noAlt = images.filter((img) => !img.hasAlt || !img.alt);
	check(
		`Tum gorsellerde alt tagi var (${images.length} gorsel)`,
		noAlt.length === 0,
	);
	if (noAlt.length > 0) {
		for (const img of noAlt.slice(0, 5)) {
			console.log(chalk.dim(`       Eksik alt: ${img.src}`));
		}
	}

	// Links
	console.log("");
	console.log(chalk.bold("Linkler:"));
	const links = extractLinks(html, url);
	console.log(
		`  ${chalk.dim("Ic linkler:")} ${links.internal}  ${chalk.dim("Dis linkler:")} ${links.external}  ${chalk.dim("Nofollow:")} ${links.nofollow}`,
	);

	// Content
	console.log("");
	console.log(chalk.bold("Icerik:"));
	const wordCount = countWords(html);
	check(`Kelime sayisi yeterli (${wordCount} kelime)`, wordCount >= 300);

	// Canonical
	console.log("");
	console.log(chalk.bold("Teknik:"));
	const canonical = html.match(
		/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i,
	)?.[1];
	check("Canonical URL tanimli", !!canonical);
	if (canonical) console.log(chalk.dim(`       ${canonical}`));

	// Viewport
	const viewport = extractMeta(html, "viewport");
	check("Viewport meta tanimli (mobil uyumluluk)", !!viewport);

	// Language
	const lang = html.match(/<html[^>]*lang=["']([^"']*)["']/i)?.[1];
	check("HTML lang attribute tanimli", !!lang);
	if (lang) console.log(chalk.dim(`       lang="${lang}"`));

	// Charset
	const charset = html.match(/<meta[^>]*charset=["']?([^"'\s>]*)["']?/i)?.[1];
	check("Charset tanimli", !!charset);

	// HTTPS
	check("HTTPS kullaniliyor", url.startsWith("https://"), 2);

	// Schema.org
	const hasSchema =
		html.includes("application/ld+json") || html.includes("itemscope");
	warn("Schema.org structured data mevcut", hasSchema);

	// robots
	const robotsMeta = extractMeta(html, "robots");
	if (robotsMeta) {
		check("robots meta noindex icermiyor", !robotsMeta.includes("noindex"));
	}

	// Sonuc
	console.log("");
	console.log(chalk.bold("═".repeat(50)));
	const pct = Math.round((score / maxScore) * 100);
	const color =
		pct >= 80
			? chalk.bold.green
			: pct >= 60
				? chalk.bold.yellow
				: chalk.bold.red;
	console.log(
		`  SEO Skoru: ${color(`${pct}/100`)} (${score}/${maxScore} kontrol gecti)`,
	);

	if (issues.length > 0) {
		console.log("");
		console.log(chalk.bold("Duzeltilmesi Gereken:"));
		for (const issue of issues) {
			console.log(`  ${chalk.red("-")} ${issue}`);
		}
	}
}

// ─── SEO Meta Analiz ───

async function seoMeta(url) {
	showBanner();
	console.log(chalk.bold(`Meta Tag Analizi: ${url}`));
	console.log("");

	const { html } = await fetchPage(url);
	const metas = extractAllMeta(html);
	const title = extractTag(html, "title");

	if (title) {
		console.log(chalk.bold("Title:"));
		console.log(`  ${chalk.cyan(title)}`);
		console.log(
			chalk.dim(
				`  ${title.length} karakter ${title.length >= 30 && title.length <= 60 ? chalk.green("(uygun)") : chalk.yellow("(30-60 onerilir)")}`,
			),
		);
		console.log("");
	}

	// Kategorize et
	const _categories = {
		Temel: [
			"description",
			"keywords",
			"author",
			"robots",
			"viewport",
			"charset",
		],
		"Open Graph": metas
			.filter((m) => m.name.startsWith("og:"))
			.map((m) => m.name),
		Twitter: metas
			.filter((m) => m.name.startsWith("twitter:"))
			.map((m) => m.name),
		Diger: [],
	};

	console.log(chalk.bold("Meta Taglari:"));
	for (const m of metas) {
		const isOg = m.name.startsWith("og:");
		const isTw = m.name.startsWith("twitter:");
		const color = isOg ? chalk.blue : isTw ? chalk.cyan : chalk.white;
		console.log(
			`  ${color(m.name.padEnd(25))} ${chalk.dim(m.content.substring(0, 60))}${m.content.length > 60 ? "..." : ""}`,
		);
	}

	if (metas.length === 0) {
		console.log(chalk.yellow("  Meta tag bulunamadi!"));
	}

	// Eksik onemli meta taglari
	console.log("");
	console.log(chalk.bold("Eksik Onemli Meta Taglari:"));
	const important = [
		"description",
		"og:title",
		"og:description",
		"og:image",
		"twitter:card",
	];
	let missingCount = 0;
	for (const name of important) {
		if (!metas.some((m) => m.name === name)) {
			console.log(`  ${chalk.red("-")} ${name}`);
			missingCount++;
		}
	}
	if (missingCount === 0) {
		console.log(chalk.green("  Tum onemli meta taglar mevcut!"));
	}
}

// ─── Sitemap Kontrol ───

async function seoSitemap(url) {
	showBanner();
	const baseUrl = url.replace(/\/$/, "");
	console.log(chalk.bold(`Sitemap Kontrolu: ${baseUrl}`));
	console.log("");

	// robots.txt kontrol
	console.log(chalk.bold("robots.txt:"));
	try {
		const { html: robotsTxt, status } = await fetchPage(
			`${baseUrl}/robots.txt`,
		);
		if (status === 200) {
			console.log(
				`  ${chalk.green("OK")} robots.txt mevcut (${robotsTxt.length} byte)`,
			);
			const sitemapLines = robotsTxt
				.split("\n")
				.filter((l) => l.toLowerCase().startsWith("sitemap:"));
			if (sitemapLines.length > 0) {
				console.log(`  ${chalk.green("OK")} Sitemap referansi mevcut:`);
				for (const l of sitemapLines) {
					console.log(
						`       ${chalk.cyan(l.split(":").slice(1).join(":").trim())}`,
					);
				}
			} else {
				console.log(
					`  ${chalk.yellow("!!")} robots.txt'de Sitemap referansi yok`,
				);
			}
			// Disallow kontrol
			const disallowLines = robotsTxt
				.split("\n")
				.filter((l) => l.startsWith("Disallow:"));
			if (disallowLines.length > 0) {
				console.log(
					`  ${chalk.dim(`${disallowLines.length} Disallow kurali`)}`,
				);
			}
		} else {
			console.log(`  ${chalk.red("XX")} robots.txt bulunamadi (${status})`);
		}
	} catch (e) {
		console.log(`  ${chalk.red("XX")} robots.txt erisilemedi: ${e.message}`);
	}

	// Sitemap kontrol
	console.log("");
	console.log(chalk.bold("Sitemap:"));
	const sitemapUrls = [
		`${baseUrl}/sitemap.xml`,
		`${baseUrl}/sitemap_index.xml`,
		`${baseUrl}/wp-sitemap.xml`,
	];

	for (const smUrl of sitemapUrls) {
		try {
			const { html: smContent, status } = await fetchPage(smUrl);
			if (
				status === 200 &&
				(smContent.includes("<urlset") || smContent.includes("<sitemapindex"))
			) {
				console.log(`  ${chalk.green("OK")} ${smUrl.replace(baseUrl, "")}`);

				// URL sayisi
				const urlCount = (smContent.match(/<url>/gi) || []).length;
				const sitemapCount = (smContent.match(/<sitemap>/gi) || []).length;

				if (urlCount > 0) {
					console.log(`       ${chalk.cyan(urlCount)} URL iceriyor`);
				}
				if (sitemapCount > 0) {
					console.log(
						`       ${chalk.cyan(sitemapCount)} alt sitemap iceriyor (index)`,
					);
				}

				// lastmod kontrol
				const hasLastmod = smContent.includes("<lastmod>");
				if (hasLastmod) {
					console.log(`       ${chalk.green("OK")} lastmod tarihleri mevcut`);
				} else {
					console.log(`       ${chalk.yellow("!!")} lastmod tarihleri eksik`);
				}
			}
		} catch {
			/* erisilemedi */
		}
	}
}

// ─── Hiz Testi ───

async function seoSpeed(url) {
	showBanner();
	console.log(chalk.bold(`Sayfa Hizi: ${url}`));
	console.log("");

	const start = Date.now();
	const { html, headers } = await fetchPage(url);
	const loadTime = Date.now() - start;

	console.log(chalk.bold("Yukleme Suresi:"));
	const timeColor =
		loadTime < 1000 ? chalk.green : loadTime < 3000 ? chalk.yellow : chalk.red;
	console.log(`  TTFB + icerik: ${timeColor(`${loadTime}ms`)}`);
	console.log("");

	// Boyut analizi
	const htmlSize = new Blob([html]).size;
	console.log(chalk.bold("Boyut Analizi:"));
	console.log(`  HTML boyutu: ${chalk.cyan(formatBytes(htmlSize))}`);

	// Resource count
	const scripts = (html.match(/<script[^>]*src=/gi) || []).length;
	const styles = (html.match(/<link[^>]*stylesheet/gi) || []).length;
	const images = (html.match(/<img[^>]*/gi) || []).length;
	const iframes = (html.match(/<iframe/gi) || []).length;

	console.log("");
	console.log(chalk.bold("Kaynak Sayilari:"));
	console.log(
		`  Script:  ${scripts > 10 ? chalk.yellow(scripts) : chalk.green(scripts)}`,
	);
	console.log(
		`  CSS:     ${styles > 5 ? chalk.yellow(styles) : chalk.green(styles)}`,
	);
	console.log(`  Gorsel:  ${chalk.cyan(images)}`);
	if (iframes > 0) console.log(`  iframe:  ${chalk.yellow(iframes)}`);

	// Inline resource analizi
	const inlineScripts = (html.match(/<script(?!.*src)[^>]*>/gi) || []).length;
	const inlineStyles = (html.match(/<style/gi) || []).length;
	if (inlineScripts > 3 || inlineStyles > 2) {
		console.log("");
		console.log(
			chalk.yellow(
				`UYARI: ${inlineScripts} inline script, ${inlineStyles} inline style — bundle etmeyi dusunun`,
			),
		);
	}

	// Compression
	console.log("");
	console.log(chalk.bold("Sunucu:"));
	const encoding = headers.get("content-encoding");
	if (encoding) {
		console.log(`  ${chalk.green("OK")} Compression: ${encoding}`);
	} else {
		console.log(
			`  ${chalk.yellow("!!")} Compression yok (gzip/brotli onerisi)`,
		);
	}

	const cacheControl = headers.get("cache-control");
	if (cacheControl) {
		console.log(
			`  ${chalk.green("OK")} Cache-Control: ${chalk.dim(cacheControl)}`,
		);
	} else {
		console.log(`  ${chalk.yellow("!!")} Cache-Control header eksik`);
	}

	// Performans skoru
	console.log("");
	let perfScore = 0;
	if (loadTime < 1000) perfScore += 3;
	else if (loadTime < 2000) perfScore += 2;
	else if (loadTime < 3000) perfScore += 1;
	if (htmlSize < 100000) perfScore += 2;
	else if (htmlSize < 300000) perfScore += 1;
	if (scripts <= 10) perfScore += 1;
	if (encoding) perfScore += 2;
	if (cacheControl) perfScore += 1;

	const pctPerf = Math.round((perfScore / 9) * 100);
	const perfColor =
		pctPerf >= 80
			? chalk.bold.green
			: pctPerf >= 50
				? chalk.bold.yellow
				: chalk.bold.red;
	console.log(`  Hiz Skoru: ${perfColor(`${pctPerf}/100`)}`);
}

function formatBytes(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── SEO Backlinks (best-effort, ucretsiz) ───

async function fetchDDG(query, timeoutMs = 15000) {
	// DDG HTML endpoint GET'te shell sayfa donduruyor — POST + browser UA sart.
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

// Pure fonksiyon: DDG HTML'inden sonuc listesini cikarir.
// Test edilebilir (network gerekmez). Dondurulen URL host+position+raw bilgisi.
export function parseDDGResults(html, max = 30) {
	const regex =
		/<a[^>]*class=["'][^"']*result__url[^"']*["'][^>]*href=["']([^"']+)["']/gi;
	const results = [];
	let m;
	while ((m = regex.exec(html)) !== null && results.length < max) {
		try {
			const raw = m[1];
			const decoded = raw.startsWith("//") ? `https:${raw}` : raw;
			const host = new URL(decoded).hostname.replace(/^www\./, "");
			results.push({ position: results.length + 1, host, url: decoded });
		} catch {
			/* gecersiz URL, atla */
		}
	}
	return results;
}

async function seoBacklinks(domain) {
	showBanner();
	const clean = domain.replace(/^https?:\/\//, "").replace(/\/.*/, "");
	console.log(chalk.bold(`Backlink Tarama: ${clean}`));
	console.log("");
	console.log(
		chalk.dim(
			"Not: Ahrefs/Moz API yerine DuckDuckGo + Wayback kullanilir. Sonuclar ornek niteliginde.",
		),
	);
	console.log("");

	// 1) DuckDuckGo: domain'den bahseden ama domain'de olmayan sayfalar
	const ddgQuery = `"${clean}" -site:${clean}`;
	const referring = new Map();
	try {
		const html = await fetchDDG(ddgQuery);
		for (const r of parseDDGResults(html, 100)) {
			if (r.host !== clean && !r.host.endsWith(`.${clean}`)) {
				referring.set(r.host, (referring.get(r.host) || 0) + 1);
			}
		}
	} catch (e) {
		console.log(
			`  ${chalk.yellow("!!")} DuckDuckGo tarama basarisiz: ${e.message}`,
		);
	}

	console.log(
		chalk.bold(
			`DuckDuckGo mention sonuclari (${referring.size} benzersiz domain):`,
		),
	);
	if (referring.size === 0) {
		console.log(chalk.yellow("  Bahseden domain bulunamadi."));
	} else {
		const sorted = [...referring.entries()].sort((a, b) => b[1] - a[1]);
		for (const [host, count] of sorted.slice(0, 15)) {
			console.log(`  ${chalk.cyan(host.padEnd(40))} ${chalk.dim(`${count}x`)}`);
		}
	}

	// 2) Wayback Machine CDX: domain snapshot sayisi (erisim + aktiflik proxy'si)
	console.log("");
	console.log(chalk.bold("Wayback Machine Varligi:"));
	try {
		const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(clean)}&matchType=prefix&fl=timestamp&collapse=timestamp:6&limit=1000&output=json`;
		const res = await fetchWithTimeout(cdxUrl, {
			timeoutMs: 10000,
			userAgent: SEO_UA,
		});
		if (res.ok) {
			const data = await res.json();
			const rows = data.slice(1); // ilk satir header
			console.log(
				`  ${chalk.green("OK")} ${rows.length} aylik snapshot mevcut`,
			);
			if (rows.length > 0) {
				const first = rows[0][0];
				const last = rows[rows.length - 1][0];
				console.log(
					`       Ilk snapshot:  ${chalk.cyan(first.substring(0, 4))}-${first.substring(4, 6)}`,
				);
				console.log(
					`       Son snapshot:  ${chalk.cyan(last.substring(0, 4))}-${last.substring(4, 6)}`,
				);
			}
		} else {
			console.log(
				`  ${chalk.yellow("!!")} Wayback erisilemedi (${res.status})`,
			);
		}
	} catch (e) {
		console.log(`  ${chalk.yellow("!!")} Wayback hatasi: ${e.message}`);
	}

	console.log("");
	console.log(chalk.bold("Daha Derin Analiz:"));
	console.log(
		chalk.dim("  - Ahrefs Webmaster Tools (site sahibiyseniz) — ucretsiz"),
	);
	console.log(chalk.dim("  - Google Search Console -> Links raporu"));
	console.log(chalk.dim("  - Bing Webmaster Tools -> Backlinks"));
	console.log(chalk.dim("  - Common Crawl (toplu veri analizi)"));
}

// ─── SEO Rank Tracker (DuckDuckGo) ───

async function seoRank(domain, keyword) {
	showBanner();
	const clean = domain.replace(/^https?:\/\//, "").replace(/\/.*/, "");
	console.log(chalk.bold(`Rank Kontrolu: "${keyword}" → ${clean}`));
	console.log("");
	console.log(
		chalk.dim(
			"Not: Google yerine DuckDuckGo kullanilir (hizli + botlara dostane). Google ranki icin Search Console.",
		),
	);
	console.log("");

	const html = await fetchDDG(keyword);
	const results = parseDDGResults(html, 30);

	if (results.length === 0) {
		console.log(
			chalk.yellow("Sonuc cikarilamadi (HTML yapisi degismis olabilir)."),
		);
		return;
	}

	console.log(chalk.bold(`Top ${results.length} sonuc:`));
	let found = false;
	for (const r of results) {
		const match = r.host === clean || r.host.endsWith(`.${clean}`);
		const marker = match
			? chalk.bold.green(`#${r.position}`)
			: chalk.dim(`#${r.position}`);
		const hostColor = match ? chalk.bold.green : chalk.white;
		console.log(`  ${marker.padEnd(5)} ${hostColor(r.host)}`);
		if (match && !found) found = true;
	}

	console.log("");
	if (found) {
		const pos = results.find(
			(r) => r.host === clean || r.host.endsWith(`.${clean}`),
		).position;
		console.log(chalk.bold.green(`Bulundu: ${clean} → #${pos} pozisyon`));
		if (pos <= 3) console.log(chalk.green("  Top 3 — mukemmel!"));
		else if (pos <= 10) console.log(chalk.green("  Top 10 — iyi"));
		else console.log(chalk.yellow("  Top 10 disi — optimizasyon gerekli"));
	} else {
		console.log(
			chalk.red(`Bulunamadi: ${clean} ilk ${results.length} sonuca girmiyor`),
		);
		console.log(
			chalk.dim(`  Optimizasyon icin: badi seo audit https://${clean}`),
		);
	}
}

// ─── SEO Compare ───

async function seoCompare(url1, url2) {
	showBanner();
	console.log(chalk.bold(`SEO Karsilastirma`));
	console.log(`  A: ${chalk.cyan(url1)}`);
	console.log(`  B: ${chalk.cyan(url2)}`);
	console.log("");

	async function audit(url) {
		const { html, status, headers } = await fetchPage(url);
		const title = extractTag(html, "title") || "";
		const description = extractMeta(html, "description") || "";
		const ogTitle = extractMeta(html, "og:title");
		const ogImage = extractMeta(html, "og:image");
		const twCard = extractMeta(html, "twitter:card");
		const canonical = html.match(
			/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i,
		)?.[1];
		const headings = extractHeadings(html);
		const images = extractImages(html);
		const noAlt = images.filter((img) => !img.hasAlt || !img.alt).length;
		const wordCount = countWords(html);
		const lang = html.match(/<html[^>]*lang=["']([^"']*)["']/i)?.[1];
		const hasSchema =
			html.includes("application/ld+json") || html.includes("itemscope");
		const htmlSize = new Blob([html]).size;
		const scripts = (html.match(/<script[^>]*src=/gi) || []).length;

		return {
			status,
			title,
			titleLen: title.length,
			description,
			descLen: description.length,
			ogTitle: !!ogTitle,
			ogImage: !!ogImage,
			twCard: !!twCard,
			canonical: !!canonical,
			h1Count: headings.filter((h) => h.level === 1).length,
			h2Count: headings.filter((h) => h.level === 2).length,
			imgCount: images.length,
			imgNoAlt: noAlt,
			wordCount,
			lang: lang || "—",
			schema: hasSchema,
			https: url.startsWith("https://"),
			htmlKb: (htmlSize / 1024).toFixed(1),
			scripts,
			compression: !!headers.get("content-encoding"),
		};
	}

	const [A, B] = await Promise.all([audit(url1), audit(url2)]);

	const c1 = 20,
		c2 = 30,
		c3 = 30;
	const dim = chalk.dim;
	console.log(
		`  ${dim("Metric".padEnd(c1))}${dim("Site A".padEnd(c2))}${dim("Site B")}`,
	);
	console.log(dim(`  ${"─".repeat(c1 + c2 + c3)}`));

	function row(label, a, b, comparator) {
		const aCol = comparator ? comparator(a, b, "a") : String(a);
		const bCol = comparator ? comparator(a, b, "b") : String(b);
		console.log(
			`  ${label.padEnd(c1)}${String(aCol)
				.substring(0, c2 - 2)
				.padEnd(c2)}${String(bCol).substring(0, c3 - 2)}`,
		);
	}

	const winner = (cmp) => (val, other, side) => {
		const win = side === "a" ? cmp(val, other) : cmp(other, val);
		if (win === 0) return String(val);
		return win > 0 ? chalk.green(String(val)) : chalk.dim(String(val));
	};

	const numCmp = (a, b) => (Number(a) || 0) - (Number(b) || 0);
	const _strLenCmp = (a, b) => String(a).length - String(b).length;
	const boolCmp = (a, b) => (a ? 1 : 0) - (b ? 1 : 0);

	row(
		"HTTP Status",
		A.status,
		B.status,
		winner((a, b) => (a === 200 ? 1 : 0) - (b === 200 ? 1 : 0)),
	);
	row(
		"HTTPS",
		A.https ? "evet" : "hayir",
		B.https ? "evet" : "hayir",
		winner(boolCmp),
	);
	row("Lang attribute", A.lang, B.lang);
	row("Title", A.title.substring(0, 26), B.title.substring(0, 26));
	row(
		"Title len",
		A.titleLen,
		B.titleLen,
		winner((a, b) => {
			const ideal = (n) => (n >= 30 && n <= 60 ? 1 : 0);
			return ideal(a) - ideal(b);
		}),
	);
	row(
		"Meta desc len",
		A.descLen,
		B.descLen,
		winner((a, b) => {
			const ideal = (n) => (n >= 120 && n <= 160 ? 1 : 0);
			return ideal(a) - ideal(b);
		}),
	);
	row(
		"OG tags",
		`${A.ogTitle ? "title" : "-"}/${A.ogImage ? "image" : "-"}`,
		`${B.ogTitle ? "title" : "-"}/${B.ogImage ? "image" : "-"}`,
	);
	row(
		"Twitter Card",
		A.twCard ? "evet" : "hayir",
		B.twCard ? "evet" : "hayir",
		winner(boolCmp),
	);
	row(
		"Canonical",
		A.canonical ? "evet" : "hayir",
		B.canonical ? "evet" : "hayir",
		winner(boolCmp),
	);
	row(
		"H1 count",
		A.h1Count,
		B.h1Count,
		winner((a, b) => (a === 1 ? 1 : 0) - (b === 1 ? 1 : 0)),
	);
	row("H2 count", A.h2Count, B.h2Count, winner(numCmp));
	row("Images", A.imgCount, B.imgCount);
	row(
		"Missing alt",
		A.imgNoAlt,
		B.imgNoAlt,
		winner((a, b) => -numCmp(a, b)),
	);
	row("Word count", A.wordCount, B.wordCount, winner(numCmp));
	row(
		"Schema.org",
		A.schema ? "evet" : "hayir",
		B.schema ? "evet" : "hayir",
		winner(boolCmp),
	);
	row(
		"HTML size (KB)",
		A.htmlKb,
		B.htmlKb,
		winner((a, b) => -numCmp(a, b)),
	);
	row(
		"Script tags",
		A.scripts,
		B.scripts,
		winner((a, b) => -numCmp(a, b)),
	);
	row(
		"Compression",
		A.compression ? "evet" : "hayir",
		B.compression ? "evet" : "hayir",
		winner(boolCmp),
	);

	console.log("");
	console.log(
		chalk.dim("Yesil = o satirda o taraf daha iyi. Nötr metrikler renksiz."),
	);
}

// ─── Ana Komut ───

export async function runSeo(args) {
	const sub = args[0];

	if (!sub || sub === "--help" || sub === "-h") {
		showBanner();
		console.log(chalk.bold("SEO Analiz ve Denetim:"));
		console.log("");
		console.log(chalk.bold.cyan("Denetim:"));
		console.log(
			`  ${chalk.cyan("badi seo audit")} [url]           Kapsamli SEO denetimi (20+ kontrol)`,
		);
		console.log(
			`  ${chalk.cyan("badi seo meta")} [url]            Meta tag analizi`,
		);
		console.log(
			`  ${chalk.cyan("badi seo sitemap")} [url]         Sitemap ve robots.txt kontrolu`,
		);
		console.log(
			`  ${chalk.cyan("badi seo speed")} [url]           Sayfa hizi ve kaynak analizi`,
		);
		console.log("");
		console.log(chalk.bold.cyan("Genisletme (v1.11+):"));
		console.log(
			`  ${chalk.cyan("badi seo backlinks")} [domain]    DuckDuckGo + Wayback mention/snapshot taramasi`,
		);
		console.log(
			`  ${chalk.cyan("badi seo rank")} [domain] [kw]   DuckDuckGo organic rank kontrolu`,
		);
		console.log(
			`  ${chalk.cyan("badi seo compare")} [url1] [url2] Iki URL yan yana karsilastirma`,
		);
		console.log("");
		console.log(chalk.bold("Ornekler:"));
		console.log("  badi seo audit https://example.com");
		console.log("  badi seo meta https://blog.example.com/post-1");
		console.log("  badi seo sitemap https://example.com");
		console.log("  badi seo speed https://example.com");
		console.log("  badi seo backlinks example.com");
		console.log('  badi seo rank example.com "anahtar kelime"');
		console.log("  badi seo compare https://example.com https://rakip.com");
		console.log("");
		console.log(chalk.bold("Kontrol Edilen Alanlar:"));
		console.log("  Title, Description, OG tags, Twitter Card");
		console.log("  Baslik yapisi (H1-H6), Gorsel alt taglari");
		console.log("  Canonical URL, Viewport, Lang, Charset");
		console.log("  HTTPS, Schema.org, robots meta");
		console.log("  Sitemap.xml, robots.txt, lastmod");
		console.log("  TTFB, HTML boyutu, kaynak sayilari");
		console.log("  Compression, Cache-Control");
		return;
	}

	const url = args[1];
	if (!url) {
		console.error(
			chalk.red(`URL/domain belirtin: badi seo ${sub} [url|domain]`),
		);
		process.exit(1);
	}

	// URL normalize
	let normalizedUrl = url;
	if (!normalizedUrl.startsWith("http")) {
		normalizedUrl = `https://${normalizedUrl}`;
	}

	try {
		switch (sub) {
			case "audit":
				await seoAudit(normalizedUrl);
				break;
			case "meta":
				await seoMeta(normalizedUrl);
				break;
			case "sitemap":
				await seoSitemap(normalizedUrl);
				break;
			case "speed":
				await seoSpeed(normalizedUrl);
				break;
			case "backlinks":
				await seoBacklinks(url);
				break;
			case "rank": {
				const keyword = args.slice(2).join(" ");
				if (!keyword) {
					console.error(
						chalk.red(
							"Anahtar kelime gerekli: badi seo rank [domain] [keyword]",
						),
					);
					process.exit(1);
				}
				await seoRank(url, keyword);
				break;
			}
			case "compare": {
				const url2 = args[2];
				if (!url2) {
					console.error(
						chalk.red("Iki URL gerekli: badi seo compare [url1] [url2]"),
					);
					process.exit(1);
				}
				const normalizedUrl2 = url2.startsWith("http")
					? url2
					: `https://${url2}`;
				await seoCompare(normalizedUrl, normalizedUrl2);
				break;
			}
			default:
				console.error(chalk.red(`Bilinmeyen seo komutu: ${sub}`));
				console.log(
					"Kullanim: badi seo [audit|meta|sitemap|speed|backlinks|rank|compare]",
				);
				process.exit(1);
		}
	} catch (e) {
		console.error(chalk.red(`Hata: ${e.message}`));
		process.exit(1);
	}
}
