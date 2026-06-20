import { chalk, showBanner } from "../../cli.js";
import {
	countWords,
	extractHeadings,
	extractImages,
	extractMeta,
	extractTag,
	fetchPage,
} from "./_shared.js";

// ─── SEO Compare ───

export async function seoCompare(url1, url2) {
	showBanner();
	console.log(chalk.bold(`SEO Comparison`));
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
	row("HTTPS", A.https ? "yes" : "no", B.https ? "yes" : "no", winner(boolCmp));
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
		A.twCard ? "yes" : "no",
		B.twCard ? "yes" : "no",
		winner(boolCmp),
	);
	row(
		"Canonical",
		A.canonical ? "yes" : "no",
		B.canonical ? "yes" : "no",
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
		A.schema ? "yes" : "no",
		B.schema ? "yes" : "no",
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
		A.compression ? "yes" : "no",
		B.compression ? "yes" : "no",
		winner(boolCmp),
	);

	console.log("");
	console.log(
		chalk.dim(
			"Green = that side is better on that row. Neutral metrics are uncolored.",
		),
	);
}
