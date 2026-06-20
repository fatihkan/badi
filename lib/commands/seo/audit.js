import { chalk, showBanner } from "../../cli.js";
import {
	countWords,
	extractHeadings,
	extractImages,
	extractLinks,
	extractMeta,
	extractTag,
	fetchPage,
} from "./_shared.js";

// ─── SEO Audit ───

export async function seoAudit(url) {
	showBanner();
	console.log(chalk.bold(`SEO Audit: ${url}`));
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
	check(`HTTP status code: ${status}`, status === 200, 2);

	// Title
	const title = extractTag(html, "title");
	console.log("");
	console.log(chalk.bold("Meta Info:"));
	check(`Title tag present${title ? ` (${title.length} chars)` : ""}`, !!title);
	if (title) {
		check("Title length 30-60 chars", title.length >= 30 && title.length <= 60);
	}

	// Description
	const description = extractMeta(html, "description");
	check(
		`Meta description present${description ? ` (${description.length} chars)` : ""}`,
		!!description,
	);
	if (description) {
		check(
			"Description length 120-160 chars",
			description.length >= 120 && description.length <= 160,
		);
	}

	// Open Graph
	console.log("");
	console.log(chalk.bold("Social Media:"));
	const ogTitle = extractMeta(html, "og:title");
	const ogDesc = extractMeta(html, "og:description");
	const ogImage = extractMeta(html, "og:image");
	check("og:title present", !!ogTitle);
	check("og:description present", !!ogDesc);
	check("og:image present", !!ogImage);

	// Twitter Card
	const twCard = extractMeta(html, "twitter:card");
	warn("twitter:card present", !!twCard);

	// Headings
	console.log("");
	console.log(chalk.bold("Heading Structure:"));
	const headings = extractHeadings(html);
	const h1s = headings.filter((h) => h.level === 1);
	check(`H1 tag present (${h1s.length})`, h1s.length === 1, 2);
	if (h1s.length > 1) {
		console.log(
			chalk.yellow(
				`       Multiple H1: ${h1s.map((h) => h.text.substring(0, 40)).join(", ")}`,
			),
		);
	}
	const h2s = headings.filter((h) => h.level === 2);
	warn(`H2 tags present (${h2s.length})`, h2s.length > 0);

	// Images
	console.log("");
	console.log(chalk.bold("Visuals:"));
	const images = extractImages(html);
	const noAlt = images.filter((img) => !img.hasAlt || !img.alt);
	check(
		`All images have alt text (${images.length} images)`,
		noAlt.length === 0,
	);
	if (noAlt.length > 0) {
		for (const img of noAlt.slice(0, 5)) {
			console.log(chalk.dim(`       Missing alt: ${img.src}`));
		}
	}

	// Links
	console.log("");
	console.log(chalk.bold("Links:"));
	const links = extractLinks(html, url);
	console.log(
		`  ${chalk.dim("Internal links:")} ${links.internal}  ${chalk.dim("External links:")} ${links.external}  ${chalk.dim("Nofollow:")} ${links.nofollow}`,
	);

	// Content
	console.log("");
	console.log(chalk.bold("Content:"));
	const wordCount = countWords(html);
	check(`Word count sufficient (${wordCount} words)`, wordCount >= 300);

	// Canonical
	console.log("");
	console.log(chalk.bold("Technical:"));
	const canonical = html.match(
		/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i,
	)?.[1];
	check("Canonical URL defined", !!canonical);
	if (canonical) console.log(chalk.dim(`       ${canonical}`));

	// Viewport
	const viewport = extractMeta(html, "viewport");
	check("Viewport meta defined (mobile-friendly)", !!viewport);

	// Language
	const lang = html.match(/<html[^>]*lang=["']([^"']*)["']/i)?.[1];
	check("HTML lang attribute defined", !!lang);
	if (lang) console.log(chalk.dim(`       lang="${lang}"`));

	// Charset
	const charset = html.match(/<meta[^>]*charset=["']?([^"'\s>]*)["']?/i)?.[1];
	check("Charset defined", !!charset);

	// HTTPS
	check("HTTPS in use", url.startsWith("https://"), 2);

	// Schema.org
	const hasSchema =
		html.includes("application/ld+json") || html.includes("itemscope");
	warn("Schema.org structured data present", hasSchema);

	// robots
	const robotsMeta = extractMeta(html, "robots");
	if (robotsMeta) {
		check("robots meta has no noindex", !robotsMeta.includes("noindex"));
	}

	// Result
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
		`  SEO Score: ${color(`${pct}/100`)} (${score}/${maxScore} checks passed)`,
	);

	if (issues.length > 0) {
		console.log("");
		console.log(chalk.bold("Needs Fixing:"));
		for (const issue of issues) {
			console.log(`  ${chalk.red("-")} ${issue}`);
		}
	}
}
