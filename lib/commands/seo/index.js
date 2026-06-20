import { chalk } from "../../cli.js";
import { seoAudit } from "./audit.js";
import { seoBacklinks } from "./backlinks.js";
import { seoCompare } from "./compare.js";
import { seoHelp } from "./help.js";
import { seoMeta } from "./meta.js";
import { seoRank } from "./rank.js";
import { seoSitemap } from "./sitemap.js";
import { seoSpeed } from "./speed.js";

// parseDDGResults moved to _shared.js with the split; re-exported here so the
// command's public surface (tests import it) is unchanged.
export { parseDDGResults } from "./_shared.js";

// ─── Main Command ───

export async function runSeo(args) {
	const sub = args[0];

	if (!sub || sub === "--help" || sub === "-h") {
		seoHelp();
		return;
	}

	const url = args[1];
	if (!url) {
		console.error(
			chalk.red(`Specify a URL/domain: badi seo ${sub} [url|domain]`),
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
						chalk.red("Keyword required: badi seo rank [domain] [keyword]"),
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
						chalk.red("Two URLs required: badi seo compare [url1] [url2]"),
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
				console.error(chalk.red(`Unknown seo command: ${sub}`));
				console.log(
					"Usage: badi seo [audit|meta|sitemap|speed|backlinks|rank|compare]",
				);
				process.exit(1);
		}
	} catch (e) {
		console.error(chalk.red(`Error: ${e.message}`));
		process.exit(1);
	}
}
