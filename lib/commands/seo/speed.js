import { chalk, showBanner } from "../../cli.js";
import { fetchPage } from "./_shared.js";

// ─── Speed Test ───

export async function seoSpeed(url) {
	showBanner();
	console.log(chalk.bold(`Page Speed: ${url}`));
	console.log("");

	const start = Date.now();
	const { html, headers } = await fetchPage(url);
	const loadTime = Date.now() - start;

	console.log(chalk.bold("Load Time:"));
	const timeColor =
		loadTime < 1000 ? chalk.green : loadTime < 3000 ? chalk.yellow : chalk.red;
	console.log(`  TTFB + content: ${timeColor(`${loadTime}ms`)}`);
	console.log("");

	// Size analysis
	const htmlSize = new Blob([html]).size;
	console.log(chalk.bold("Size Analysis:"));
	console.log(`  HTML size: ${chalk.cyan(formatBytes(htmlSize))}`);

	// Resource count
	const scripts = (html.match(/<script[^>]*src=/gi) || []).length;
	const styles = (html.match(/<link[^>]*stylesheet/gi) || []).length;
	const images = (html.match(/<img[^>]*/gi) || []).length;
	const iframes = (html.match(/<iframe/gi) || []).length;

	console.log("");
	console.log(chalk.bold("Resource Counts:"));
	console.log(
		`  Script:  ${scripts > 10 ? chalk.yellow(scripts) : chalk.green(scripts)}`,
	);
	console.log(
		`  CSS:     ${styles > 5 ? chalk.yellow(styles) : chalk.green(styles)}`,
	);
	console.log(`  Images:  ${chalk.cyan(images)}`);
	if (iframes > 0) console.log(`  iframe:  ${chalk.yellow(iframes)}`);

	// Inline resource analysis
	const inlineScripts = (html.match(/<script(?!.*src)[^>]*>/gi) || []).length;
	const inlineStyles = (html.match(/<style/gi) || []).length;
	if (inlineScripts > 3 || inlineStyles > 2) {
		console.log("");
		console.log(
			chalk.yellow(
				`WARNING: ${inlineScripts} inline scripts, ${inlineStyles} inline styles — consider bundling`,
			),
		);
	}

	// Compression
	console.log("");
	console.log(chalk.bold("Server:"));
	const encoding = headers.get("content-encoding");
	if (encoding) {
		console.log(`  ${chalk.green("OK")} Compression: ${encoding}`);
	} else {
		console.log(
			`  ${chalk.yellow("!!")} No compression (gzip/brotli recommended)`,
		);
	}

	const cacheControl = headers.get("cache-control");
	if (cacheControl) {
		console.log(
			`  ${chalk.green("OK")} Cache-Control: ${chalk.dim(cacheControl)}`,
		);
	} else {
		console.log(`  ${chalk.yellow("!!")} Cache-Control header missing`);
	}

	// Performance score
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
	console.log(`  Speed Score: ${perfColor(`${pctPerf}/100`)}`);
}

function formatBytes(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
