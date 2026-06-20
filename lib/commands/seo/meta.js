import { chalk, showBanner } from "../../cli.js";
import { extractAllMeta, extractTag, fetchPage } from "./_shared.js";

// ─── SEO Meta Analysis ───

export async function seoMeta(url) {
	showBanner();
	console.log(chalk.bold(`Meta Tag Analysis: ${url}`));
	console.log("");

	const { html } = await fetchPage(url);
	const metas = extractAllMeta(html);
	const title = extractTag(html, "title");

	if (title) {
		console.log(chalk.bold("Title:"));
		console.log(`  ${chalk.cyan(title)}`);
		console.log(
			chalk.dim(
				`  ${title.length} chars ${title.length >= 30 && title.length <= 60 ? chalk.green("(good)") : chalk.yellow("(30-60 recommended)")}`,
			),
		);
		console.log("");
	}

	// Categorize
	const _categories = {
		Basic: [
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
		Other: [],
	};

	console.log(chalk.bold("Meta Tags:"));
	for (const m of metas) {
		const isOg = m.name.startsWith("og:");
		const isTw = m.name.startsWith("twitter:");
		const color = isOg ? chalk.blue : isTw ? chalk.cyan : chalk.white;
		console.log(
			`  ${color(m.name.padEnd(25))} ${chalk.dim(m.content.substring(0, 60))}${m.content.length > 60 ? "..." : ""}`,
		);
	}

	if (metas.length === 0) {
		console.log(chalk.yellow("  No meta tags found!"));
	}

	// Missing important meta tags
	console.log("");
	console.log(chalk.bold("Missing Important Meta Tags:"));
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
		console.log(chalk.green("  All important meta tags present!"));
	}
}
