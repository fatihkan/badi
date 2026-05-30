import { chalk, showBanner } from "../cli.js";

// PageSpeed Insights API (Google Lighthouse) — free, API key optional
const PSI_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

function validateUrl(url) {
	const parsed = new URL(url);
	if (!["http:", "https:"].includes(parsed.protocol))
		throw new Error("http/https required");
	return parsed;
}

async function fetchPsi(url, strategy = "mobile") {
	const params = new URLSearchParams({
		url,
		strategy,
		category: "performance",
	});
	params.append("category", "accessibility");
	params.append("category", "best-practices");
	params.append("category", "seo");

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 60000);
	try {
		const res = await fetch(`${PSI_API}?${params}`, {
			signal: controller.signal,
		});
		clearTimeout(timeout);
		if (!res.ok) {
			const text = await res.text();
			throw new Error(`HTTP ${res.status}: ${text.substring(0, 200)}`);
		}
		return await res.json();
	} catch (e) {
		clearTimeout(timeout);
		throw new Error(`PageSpeed API error: ${e.message}`);
	}
}

function scoreColor(score) {
	const s = Math.round(score * 100);
	if (s >= 90) return chalk.bold.green(s);
	if (s >= 50) return chalk.bold.yellow(s);
	return chalk.bold.red(s);
}

function formatMs(ms) {
	if (ms < 1000) return `${Math.round(ms)}ms`;
	return `${(ms / 1000).toFixed(1)}s`;
}

export async function runLighthouse(args) {
	const url = args[0];
	if (!url || ["--help", "-h"].includes(url)) {
		showBanner();
		console.log(chalk.bold("Lighthouse (PageSpeed Insights):"));
		console.log("");
		console.log(
			`  ${chalk.cyan("badi lighthouse")} [url]               Mobile audit (default)`,
		);
		console.log(
			`  ${chalk.cyan("badi lighthouse")} [url] --desktop     Desktop audit`,
		);
		console.log("");
		console.log(chalk.bold("What's Measured:"));
		console.log("  Performance  - FCP, LCP, TBT, CLS, Speed Index");
		console.log("  Accessibility - WCAG compliance (axe-core)");
		console.log("  Best Practices - HTTPS, console errors, permissions");
		console.log("  SEO - meta tags, crawlability, mobile-friendly");
		console.log("");
		console.log(chalk.bold("Examples:"));
		console.log("  badi lighthouse https://example.com");
		console.log("  badi lighthouse https://example.com --desktop");
		return;
	}

	const strategy = args.includes("--desktop") ? "desktop" : "mobile";
	let targetUrl = url;
	if (!targetUrl.startsWith("http")) targetUrl = `https://${targetUrl}`;

	try {
		validateUrl(targetUrl);
	} catch (e) {
		console.error(chalk.red(`Invalid URL: ${e.message}`));
		process.exit(1);
	}

	showBanner();
	console.log(chalk.bold(`Lighthouse Audit: ${targetUrl}`));
	console.log(chalk.dim(`Strategy: ${strategy}`));
	console.log(chalk.dim("Calling PageSpeed Insights API (60s timeout)..."));
	console.log("");

	let data;
	try {
		data = await fetchPsi(targetUrl, strategy);
	} catch (e) {
		console.error(chalk.red(e.message));
		process.exit(1);
	}

	const lh = data.lighthouseResult;
	if (!lh) {
		console.error(chalk.red("Could not retrieve Lighthouse results"));
		process.exit(1);
	}

	// Category scores
	console.log(chalk.bold("Category Scores (0-100):"));
	const cats = lh.categories;
	for (const [key, label] of [
		["performance", "Performance   "],
		["accessibility", "Accessibility "],
		["best-practices", "Best Practices"],
		["seo", "SEO           "],
	]) {
		const c = cats[key];
		if (c) console.log(`  ${label} ${scoreColor(c.score)}`);
	}

	// Core Web Vitals
	console.log("");
	console.log(chalk.bold("Core Web Vitals:"));
	const audits = lh.audits;
	const cwv = [
		["FCP (First Contentful Paint)", "first-contentful-paint"],
		["LCP (Largest Contentful Paint)", "largest-contentful-paint"],
		["TBT (Total Blocking Time)", "total-blocking-time"],
		["CLS (Cumulative Layout Shift)", "cumulative-layout-shift"],
		["Speed Index", "speed-index"],
		["TTI (Time to Interactive)", "interactive"],
	];
	for (const [label, id] of cwv) {
		const a = audits[id];
		if (!a) continue;
		const display = a.displayValue || formatMs(a.numericValue || 0);
		const color =
			a.score >= 0.9 ? chalk.green : a.score >= 0.5 ? chalk.yellow : chalk.red;
		console.log(`  ${label.padEnd(34)} ${color(display)}`);
	}

	// Improvement opportunities
	console.log("");
	console.log(chalk.bold("Top Improvement Opportunities:"));
	const opps = Object.values(audits)
		.filter(
			(a) =>
				a.details?.type === "opportunity" && a.score !== null && a.score < 1,
		)
		.sort((a, b) => (b.numericValue || 0) - (a.numericValue || 0))
		.slice(0, 5);
	if (opps.length === 0) console.log(chalk.dim("  (no major opportunities)"));
	else
		for (const o of opps) {
			const saving = o.numericValue
				? ` (${formatMs(o.numericValue)} savings)`
				: "";
			console.log(`  ${chalk.yellow("!!")} ${o.title}${chalk.dim(saving)}`);
		}

	// Accessibility errors
	console.log("");
	console.log(chalk.bold("Accessibility Errors:"));
	const a11yFails = Object.values(audits)
		.filter((a) => a.score === 0 && a.details?.type === "table")
		.slice(0, 5);
	if (a11yFails.length === 0) console.log(chalk.dim("  (no critical errors)"));
	else
		for (const a of a11yFails) console.log(`  ${chalk.red("XX")} ${a.title}`);

	console.log("");
	console.log(
		chalk.dim(
			"Detailed report: https://pagespeed.web.dev/analysis?url=" +
				encodeURIComponent(targetUrl),
		),
	);
}
