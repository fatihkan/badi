import { chalk, showBanner } from "../cli.js";

// ─── HTML Parse Yardimcilari ───

function extractTag(html, tag) {
	const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
	const match = html.match(regex);
	return match ? match[1].trim() : null;
}

function extractMeta(html, name) {
	// name veya property attribute'u
	const regex = new RegExp(`<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`, "i");
	const match = html.match(regex);
	if (match) return match[1];
	// ters siralama (content once)
	const regex2 = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`, "i");
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

function extractHeadings(html) {
	const headings = [];
	for (let level = 1; level <= 6; level++) {
		const regex = new RegExp(`<h${level}[^>]*>([\\s\\S]*?)<\\/h${level}>`, "gi");
		let m;
		while ((m = regex.exec(html)) !== null) {
			headings.push({ level, text: m[1].replace(/<[^>]*>/g, "").trim() });
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
		if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
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
	const text = html.replace(/<script[\s\S]*?<\/script>/gi, "")
		.replace(/<style[\s\S]*?<\/style>/gi, "")
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ").trim();
	return text.split(" ").filter(Boolean).length;
}

// ─── Fetch Yardimcisi ───

function validateUrl(url) {
	let parsed;
	try {
		parsed = new URL(url);
	} catch {
		throw new Error(`Gecersiz URL: ${url}`);
	}
	if (!["http:", "https:"].includes(parsed.protocol)) {
		throw new Error(`Sadece http/https URL'leri desteklenir: ${parsed.protocol}`);
	}
	const host = parsed.hostname.toLowerCase();
	// Localhost ve private IP range engellemesi
	if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1") {
		throw new Error("Lokal adresler desteklenmiyor");
	}
	// Private IP range (10.x, 172.16-31.x, 192.168.x, 169.254.x)
	const privateIpRegex = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/;
	if (privateIpRegex.test(host)) {
		throw new Error("Private IP adresleri desteklenmiyor");
	}
	return parsed;
}

async function fetchPage(url) {
	validateUrl(url);
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 15000);
	try {
		const res = await fetch(url, {
			signal: controller.signal,
			headers: { "User-Agent": "Badi-SEO/1.4 (+https://github.com/fatihkan/badi)" },
			redirect: "follow",
		});
		clearTimeout(timeout);
		const html = await res.text();
		return { html, status: res.status, headers: res.headers, url: res.url };
	} catch (e) {
		clearTimeout(timeout);
		throw new Error(`Sayfa yuklenemedi: ${e.message}`);
	}
}

// ─── SEO Audit ───

async function seoAudit(url) {
	showBanner();
	console.log(chalk.bold(`SEO Denetimi: ${url}`));
	console.log("");

	const { html, status, headers } = await fetchPage(url);
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
	check(`Title tagi mevcut${title ? ` (${title.length} karakter)` : ""}`, !!title);
	if (title) {
		check("Title uzunlugu 30-60 karakter", title.length >= 30 && title.length <= 60);
	}

	// Description
	const description = extractMeta(html, "description");
	check(`Meta description mevcut${description ? ` (${description.length} karakter)` : ""}`, !!description);
	if (description) {
		check("Description uzunlugu 120-160 karakter", description.length >= 120 && description.length <= 160);
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
		console.log(chalk.yellow(`       Birden fazla H1: ${h1s.map((h) => h.text.substring(0, 40)).join(", ")}`));
	}
	const h2s = headings.filter((h) => h.level === 2);
	warn(`H2 taglari mevcut (${h2s.length} adet)`, h2s.length > 0);

	// Images
	console.log("");
	console.log(chalk.bold("Gorseller:"));
	const images = extractImages(html);
	const noAlt = images.filter((img) => !img.hasAlt || !img.alt);
	check(`Tum gorsellerde alt tagi var (${images.length} gorsel)`, noAlt.length === 0);
	if (noAlt.length > 0) {
		for (const img of noAlt.slice(0, 5)) {
			console.log(chalk.dim(`       Eksik alt: ${img.src}`));
		}
	}

	// Links
	console.log("");
	console.log(chalk.bold("Linkler:"));
	const links = extractLinks(html, url);
	console.log(`  ${chalk.dim("Ic linkler:")} ${links.internal}  ${chalk.dim("Dis linkler:")} ${links.external}  ${chalk.dim("Nofollow:")} ${links.nofollow}`);

	// Content
	console.log("");
	console.log(chalk.bold("Icerik:"));
	const wordCount = countWords(html);
	check(`Kelime sayisi yeterli (${wordCount} kelime)`, wordCount >= 300);

	// Canonical
	console.log("");
	console.log(chalk.bold("Teknik:"));
	const canonical = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i)?.[1];
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
	const hasSchema = html.includes("application/ld+json") || html.includes("itemscope");
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
	const color = pct >= 80 ? chalk.bold.green : pct >= 60 ? chalk.bold.yellow : chalk.bold.red;
	console.log(`  SEO Skoru: ${color(`${pct}/100`)} (${score}/${maxScore} kontrol gecti)`);

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
		console.log(chalk.dim(`  ${title.length} karakter ${title.length >= 30 && title.length <= 60 ? chalk.green("(uygun)") : chalk.yellow("(30-60 onerilir)")}`));
		console.log("");
	}

	// Kategorize et
	const categories = {
		"Temel": ["description", "keywords", "author", "robots", "viewport", "charset"],
		"Open Graph": metas.filter((m) => m.name.startsWith("og:")).map((m) => m.name),
		"Twitter": metas.filter((m) => m.name.startsWith("twitter:")).map((m) => m.name),
		"Diger": [],
	};

	console.log(chalk.bold("Meta Taglari:"));
	for (const m of metas) {
		const isOg = m.name.startsWith("og:");
		const isTw = m.name.startsWith("twitter:");
		const color = isOg ? chalk.blue : isTw ? chalk.cyan : chalk.white;
		console.log(`  ${color(m.name.padEnd(25))} ${chalk.dim(m.content.substring(0, 60))}${m.content.length > 60 ? "..." : ""}`);
	}

	if (metas.length === 0) {
		console.log(chalk.yellow("  Meta tag bulunamadi!"));
	}

	// Eksik onemli meta taglari
	console.log("");
	console.log(chalk.bold("Eksik Onemli Meta Taglari:"));
	const important = ["description", "og:title", "og:description", "og:image", "twitter:card"];
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
		const { html: robotsTxt, status } = await fetchPage(`${baseUrl}/robots.txt`);
		if (status === 200) {
			console.log(`  ${chalk.green("OK")} robots.txt mevcut (${robotsTxt.length} byte)`);
			const sitemapLines = robotsTxt.split("\n").filter((l) => l.toLowerCase().startsWith("sitemap:"));
			if (sitemapLines.length > 0) {
				console.log(`  ${chalk.green("OK")} Sitemap referansi mevcut:`);
				for (const l of sitemapLines) {
					console.log(`       ${chalk.cyan(l.split(":").slice(1).join(":").trim())}`);
				}
			} else {
				console.log(`  ${chalk.yellow("!!")} robots.txt'de Sitemap referansi yok`);
			}
			// Disallow kontrol
			const disallowLines = robotsTxt.split("\n").filter((l) => l.startsWith("Disallow:"));
			if (disallowLines.length > 0) {
				console.log(`  ${chalk.dim(`${disallowLines.length} Disallow kurali`)}`);
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
			if (status === 200 && (smContent.includes("<urlset") || smContent.includes("<sitemapindex"))) {
				console.log(`  ${chalk.green("OK")} ${smUrl.replace(baseUrl, "")}`);

				// URL sayisi
				const urlCount = (smContent.match(/<url>/gi) || []).length;
				const sitemapCount = (smContent.match(/<sitemap>/gi) || []).length;

				if (urlCount > 0) {
					console.log(`       ${chalk.cyan(urlCount)} URL iceriyor`);
				}
				if (sitemapCount > 0) {
					console.log(`       ${chalk.cyan(sitemapCount)} alt sitemap iceriyor (index)`);
				}

				// lastmod kontrol
				const hasLastmod = smContent.includes("<lastmod>");
				if (hasLastmod) {
					console.log(`       ${chalk.green("OK")} lastmod tarihleri mevcut`);
				} else {
					console.log(`       ${chalk.yellow("!!")} lastmod tarihleri eksik`);
				}
			}
		} catch { /* erisilemedi */ }
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
	const timeColor = loadTime < 1000 ? chalk.green : loadTime < 3000 ? chalk.yellow : chalk.red;
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
	console.log(`  Script:  ${scripts > 10 ? chalk.yellow(scripts) : chalk.green(scripts)}`);
	console.log(`  CSS:     ${styles > 5 ? chalk.yellow(styles) : chalk.green(styles)}`);
	console.log(`  Gorsel:  ${chalk.cyan(images)}`);
	if (iframes > 0) console.log(`  iframe:  ${chalk.yellow(iframes)}`);

	// Inline resource analizi
	const inlineScripts = (html.match(/<script(?!.*src)[^>]*>/gi) || []).length;
	const inlineStyles = (html.match(/<style/gi) || []).length;
	if (inlineScripts > 3 || inlineStyles > 2) {
		console.log("");
		console.log(chalk.yellow(`UYARI: ${inlineScripts} inline script, ${inlineStyles} inline style — bundle etmeyi dusunun`));
	}

	// Compression
	console.log("");
	console.log(chalk.bold("Sunucu:"));
	const encoding = headers.get("content-encoding");
	if (encoding) {
		console.log(`  ${chalk.green("OK")} Compression: ${encoding}`);
	} else {
		console.log(`  ${chalk.yellow("!!")} Compression yok (gzip/brotli onerisi)`);
	}

	const cacheControl = headers.get("cache-control");
	if (cacheControl) {
		console.log(`  ${chalk.green("OK")} Cache-Control: ${chalk.dim(cacheControl)}`);
	} else {
		console.log(`  ${chalk.yellow("!!")} Cache-Control header eksik`);
	}

	// Performans skoru
	console.log("");
	let perfScore = 0;
	if (loadTime < 1000) perfScore += 3; else if (loadTime < 2000) perfScore += 2; else if (loadTime < 3000) perfScore += 1;
	if (htmlSize < 100000) perfScore += 2; else if (htmlSize < 300000) perfScore += 1;
	if (scripts <= 10) perfScore += 1;
	if (encoding) perfScore += 2;
	if (cacheControl) perfScore += 1;

	const pctPerf = Math.round((perfScore / 9) * 100);
	const perfColor = pctPerf >= 80 ? chalk.bold.green : pctPerf >= 50 ? chalk.bold.yellow : chalk.bold.red;
	console.log(`  Hiz Skoru: ${perfColor(`${pctPerf}/100`)}`);
}

function formatBytes(bytes) {
	if (bytes < 1024) return bytes + " B";
	if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
	return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// ─── Ana Komut ───

export async function runSeo(args) {
	const sub = args[0];

	if (!sub || sub === "--help" || sub === "-h") {
		showBanner();
		console.log(chalk.bold("SEO Analiz ve Denetim:"));
		console.log("");
		console.log(chalk.bold.cyan("Denetim:"));
		console.log(`  ${chalk.cyan("badi seo audit")} [url]     Kapsamli SEO denetimi (20+ kontrol)`);
		console.log(`  ${chalk.cyan("badi seo meta")} [url]      Meta tag analizi`);
		console.log(`  ${chalk.cyan("badi seo sitemap")} [url]   Sitemap ve robots.txt kontrolu`);
		console.log(`  ${chalk.cyan("badi seo speed")} [url]     Sayfa hizi ve kaynak analizi`);
		console.log("");
		console.log(chalk.bold("Ornekler:"));
		console.log("  badi seo audit https://example.com");
		console.log("  badi seo meta https://blog.example.com/post-1");
		console.log("  badi seo sitemap https://example.com");
		console.log("  badi seo speed https://example.com");
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
		console.error(chalk.red(`URL belirtin: badi seo ${sub} [url]`));
		process.exit(1);
	}

	// URL normalize
	let normalizedUrl = url;
	if (!normalizedUrl.startsWith("http")) {
		normalizedUrl = `https://${normalizedUrl}`;
	}

	try {
		switch (sub) {
			case "audit": await seoAudit(normalizedUrl); break;
			case "meta": await seoMeta(normalizedUrl); break;
			case "sitemap": await seoSitemap(normalizedUrl); break;
			case "speed": await seoSpeed(normalizedUrl); break;
			default:
				console.error(chalk.red(`Bilinmeyen seo komutu: ${sub}`));
				console.log("Kullanim: badi seo [audit|meta|sitemap|speed]");
				process.exit(1);
		}
	} catch (e) {
		console.error(chalk.red(`Hata: ${e.message}`));
		process.exit(1);
	}
}
