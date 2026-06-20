import { chalk, showBanner } from "../../cli.js";
import { fetchPage } from "./_shared.js";

// ─── Sitemap Check ───

export async function seoSitemap(url) {
	showBanner();
	const baseUrl = url.replace(/\/$/, "");
	console.log(chalk.bold(`Sitemap Check: ${baseUrl}`));
	console.log("");

	// robots.txt check
	console.log(chalk.bold("robots.txt:"));
	try {
		const { html: robotsTxt, status } = await fetchPage(
			`${baseUrl}/robots.txt`,
		);
		if (status === 200) {
			console.log(
				`  ${chalk.green("OK")} robots.txt present (${robotsTxt.length} bytes)`,
			);
			const sitemapLines = robotsTxt
				.split("\n")
				.filter((l) => l.toLowerCase().startsWith("sitemap:"));
			if (sitemapLines.length > 0) {
				console.log(`  ${chalk.green("OK")} Sitemap reference present:`);
				for (const l of sitemapLines) {
					console.log(
						`       ${chalk.cyan(l.split(":").slice(1).join(":").trim())}`,
					);
				}
			} else {
				console.log(
					`  ${chalk.yellow("!!")} No Sitemap reference in robots.txt`,
				);
			}
			// Disallow check
			const disallowLines = robotsTxt
				.split("\n")
				.filter((l) => l.startsWith("Disallow:"));
			if (disallowLines.length > 0) {
				console.log(`  ${chalk.dim(`${disallowLines.length} Disallow rules`)}`);
			}
		} else {
			console.log(`  ${chalk.red("XX")} robots.txt not found (${status})`);
		}
	} catch (e) {
		console.log(`  ${chalk.red("XX")} robots.txt unreachable: ${e.message}`);
	}

	// Sitemap check
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

				// URL count
				const urlCount = (smContent.match(/<url>/gi) || []).length;
				const sitemapCount = (smContent.match(/<sitemap>/gi) || []).length;

				if (urlCount > 0) {
					console.log(`       ${chalk.cyan(urlCount)} URLs`);
				}
				if (sitemapCount > 0) {
					console.log(
						`       ${chalk.cyan(sitemapCount)} sub-sitemaps (index)`,
					);
				}

				// lastmod check
				const hasLastmod = smContent.includes("<lastmod>");
				if (hasLastmod) {
					console.log(`       ${chalk.green("OK")} lastmod dates present`);
				} else {
					console.log(`       ${chalk.yellow("!!")} lastmod dates missing`);
				}
			}
		} catch {
			/* unreachable */
		}
	}
}
