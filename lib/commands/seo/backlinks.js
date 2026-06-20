import { chalk, showBanner } from "../../cli.js";
import { fetchWithTimeout } from "../../helpers.js";
import { fetchDDG, parseDDGResults, SEO_UA } from "./_shared.js";

// ─── SEO Backlinks (best-effort, free) ───

export async function seoBacklinks(domain) {
	showBanner();
	const clean = domain.replace(/^https?:\/\//, "").replace(/\/.*/, "");
	console.log(chalk.bold(`Backlink Scan: ${clean}`));
	console.log("");
	console.log(
		chalk.dim(
			"Note: Uses DuckDuckGo + Wayback instead of Ahrefs/Moz API. Results are indicative.",
		),
	);
	console.log("");

	// 1) DuckDuckGo: pages that mention the domain but are not on the domain
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
		console.log(`  ${chalk.yellow("!!")} DuckDuckGo scan failed: ${e.message}`);
	}

	console.log(
		chalk.bold(
			`DuckDuckGo mention results (${referring.size} unique domains):`,
		),
	);
	if (referring.size === 0) {
		console.log(chalk.yellow("  No referring domains found."));
	} else {
		const sorted = [...referring.entries()].sort((a, b) => b[1] - a[1]);
		for (const [host, count] of sorted.slice(0, 15)) {
			console.log(`  ${chalk.cyan(host.padEnd(40))} ${chalk.dim(`${count}x`)}`);
		}
	}

	// 2) Wayback Machine CDX: domain snapshot count (proxy for reach + activity)
	console.log("");
	console.log(chalk.bold("Wayback Machine Presence:"));
	try {
		const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(clean)}&matchType=prefix&fl=timestamp&collapse=timestamp:6&limit=1000&output=json`;
		const res = await fetchWithTimeout(cdxUrl, {
			timeoutMs: 10000,
			userAgent: SEO_UA,
		});
		if (res.ok) {
			const data = await res.json();
			const rows = data.slice(1); // first row is the header
			console.log(
				`  ${chalk.green("OK")} ${rows.length} monthly snapshots present`,
			);
			if (rows.length > 0) {
				const first = rows[0][0];
				const last = rows[rows.length - 1][0];
				console.log(
					`       First snapshot: ${chalk.cyan(first.substring(0, 4))}-${first.substring(4, 6)}`,
				);
				console.log(
					`       Last snapshot:  ${chalk.cyan(last.substring(0, 4))}-${last.substring(4, 6)}`,
				);
			}
		} else {
			console.log(
				`  ${chalk.yellow("!!")} Wayback unreachable (${res.status})`,
			);
		}
	} catch (e) {
		console.log(`  ${chalk.yellow("!!")} Wayback error: ${e.message}`);
	}

	console.log("");
	console.log(chalk.bold("Deeper Analysis:"));
	console.log(
		chalk.dim("  - Ahrefs Webmaster Tools (if you own the site) — free"),
	);
	console.log(chalk.dim("  - Google Search Console -> Links report"));
	console.log(chalk.dim("  - Bing Webmaster Tools -> Backlinks"));
	console.log(chalk.dim("  - Common Crawl (bulk data analysis)"));
}
