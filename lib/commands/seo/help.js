import { chalk, showBanner } from "../../cli.js";

export function seoHelp() {
	showBanner();
	console.log(chalk.bold("SEO Analysis and Audit:"));
	console.log("");
	console.log(chalk.bold.cyan("Audit:"));
	console.log(
		`  ${chalk.cyan("badi seo audit")} [url]           Comprehensive SEO audit (20+ checks)`,
	);
	console.log(
		`  ${chalk.cyan("badi seo meta")} [url]            Meta tag analysis`,
	);
	console.log(
		`  ${chalk.cyan("badi seo sitemap")} [url]         Sitemap and robots.txt check`,
	);
	console.log(
		`  ${chalk.cyan("badi seo speed")} [url]           Page speed and resource analysis`,
	);
	console.log("");
	console.log(chalk.bold.cyan("Extended (v1.11+):"));
	console.log(
		`  ${chalk.cyan("badi seo backlinks")} [domain]    DuckDuckGo + Wayback mention/snapshot scan`,
	);
	console.log(
		`  ${chalk.cyan("badi seo rank")} [domain] [kw]   DuckDuckGo organic rank check`,
	);
	console.log(
		`  ${chalk.cyan("badi seo compare")} [url1] [url2] Compare two URLs side by side`,
	);
	console.log("");
	console.log(chalk.bold("Examples:"));
	console.log("  badi seo audit https://example.com");
	console.log("  badi seo meta https://blog.example.com/post-1");
	console.log("  badi seo sitemap https://example.com");
	console.log("  badi seo speed https://example.com");
	console.log("  badi seo backlinks example.com");
	console.log('  badi seo rank example.com "keyword"');
	console.log("  badi seo compare https://example.com https://competitor.com");
	console.log("");
	console.log(chalk.bold("Checked Areas:"));
	console.log("  Title, Description, OG tags, Twitter Card");
	console.log("  Heading structure (H1-H6), Image alt tags");
	console.log("  Canonical URL, Viewport, Lang, Charset");
	console.log("  HTTPS, Schema.org, robots meta");
	console.log("  Sitemap.xml, robots.txt, lastmod");
	console.log("  TTFB, HTML size, resource counts");
	console.log("  Compression, Cache-Control");
}
