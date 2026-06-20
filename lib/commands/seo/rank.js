import { chalk, showBanner } from "../../cli.js";
import { fetchDDG, parseDDGResults } from "./_shared.js";

// ─── SEO Rank Tracker (DuckDuckGo) ───

export async function seoRank(domain, keyword) {
	showBanner();
	const clean = domain.replace(/^https?:\/\//, "").replace(/\/.*/, "");
	console.log(chalk.bold(`Rank Check: "${keyword}" → ${clean}`));
	console.log("");
	console.log(
		chalk.dim(
			"Note: Uses DuckDuckGo instead of Google (fast + bot-friendly). For Google rank, use Search Console.",
		),
	);
	console.log("");

	const html = await fetchDDG(keyword);
	const results = parseDDGResults(html, 30);

	if (results.length === 0) {
		console.log(
			chalk.yellow(
				"Could not extract results (HTML structure may have changed).",
			),
		);
		return;
	}

	console.log(chalk.bold(`Top ${results.length} results:`));
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
		console.log(chalk.bold.green(`Found: ${clean} → position #${pos}`));
		if (pos <= 3) console.log(chalk.green("  Top 3 — excellent!"));
		else if (pos <= 10) console.log(chalk.green("  Top 10 — good"));
		else console.log(chalk.yellow("  Outside Top 10 — optimization needed"));
	} else {
		console.log(
			chalk.red(
				`Not found: ${clean} is not in the first ${results.length} results`,
			),
		);
		console.log(chalk.dim(`  To optimize: badi seo audit https://${clean}`));
	}
}
