import { chalk, showBanner } from "../cli.js";

// PageSpeed Insights API - accessibility category (axe-core based)
const PSI_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

function validateUrl(url) {
	const parsed = new URL(url);
	if (!["http:", "https:"].includes(parsed.protocol))
		throw new Error("http/https required");
	return parsed;
}

async function fetchA11y(url, strategy = "mobile") {
	const params = new URLSearchParams({
		url,
		strategy,
		category: "accessibility",
	});
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 60000);
	try {
		const res = await fetch(`${PSI_API}?${params}`, {
			signal: controller.signal,
		});
		clearTimeout(timeout);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return await res.json();
	} catch (e) {
		clearTimeout(timeout);
		throw new Error(`API error: ${e.message}`);
	}
}

export async function runA11y(args) {
	const url = args[0];
	if (!url || ["--help", "-h"].includes(url)) {
		showBanner();
		console.log(chalk.bold("A11y Accessibility Audit:"));
		console.log("");
		console.log(
			`  ${chalk.cyan("badi a11y")} [url]              Mobile audit (axe-core via PSI)`,
		);
		console.log(
			`  ${chalk.cyan("badi a11y")} [url] --desktop    Desktop audit`,
		);
		console.log("");
		console.log(chalk.bold("WCAG 2.1 Level:"));
		console.log("  This audit covers levels A, AA (axe-core).");
		console.log("  Level AAA requires manual testing.");
		return;
	}

	const strategy = args.includes("--desktop") ? "desktop" : "mobile";
	let targetUrl = url;
	if (!targetUrl.startsWith("http")) targetUrl = `https://${targetUrl}`;
	try {
		validateUrl(targetUrl);
	} catch (e) {
		console.error(chalk.red(e.message));
		process.exit(1);
	}

	showBanner();
	console.log(chalk.bold(`Accessibility Audit: ${targetUrl}`));
	console.log(
		chalk.dim(`Strategy: ${strategy}, API: PageSpeed Insights (axe-core)`),
	);
	console.log("");

	let data;
	try {
		data = await fetchA11y(targetUrl, strategy);
	} catch (e) {
		console.error(chalk.red(e.message));
		process.exit(1);
	}

	const lh = data.lighthouseResult;
	const score = Math.round((lh.categories.accessibility.score || 0) * 100);
	const color =
		score >= 90
			? chalk.bold.green
			: score >= 70
				? chalk.bold.yellow
				: chalk.bold.red;
	console.log(chalk.bold(`A11y Score: ${color(`${score}/100`)}`));
	console.log("");

	const audits = lh.audits;

	// Failed audits
	const failed = [];
	const passed = [];
	const manual = [];
	for (const [id, a] of Object.entries(audits)) {
		if (
			!a.details ||
			!lh.categories.accessibility.auditRefs.some((r) => r.id === id)
		)
			continue;
		if (a.score === 0) failed.push(a);
		else if (a.score === 1) passed.push(a);
		else if (a.scoreDisplayMode === "manual") manual.push(a);
	}

	if (failed.length > 0) {
		console.log(chalk.bold.red(`Failed Checks (${failed.length}):`));
		for (const a of failed) {
			console.log(`  ${chalk.red("XX")} ${a.title}`);
			if (a.description) {
				const desc = a.description
					.replace(/\[.*?\]\(.*?\)/g, "")
					.substring(0, 120);
				console.log(`     ${chalk.dim(desc)}`);
			}
			// Element count
			const items = a.details?.items || [];
			if (items.length > 0)
				console.log(
					`     ${chalk.yellow(`${items.length} elements affected`)}`,
				);
		}
		console.log("");
	}

	console.log(
		chalk.bold(
			`Passed: ${chalk.green(passed.length)} | Failed: ${chalk.red(failed.length)} | Manual: ${chalk.yellow(manual.length)}`,
		),
	);

	if (manual.length > 0) {
		console.log("");
		console.log(chalk.bold("Manual Testing Required:"));
		for (const a of manual.slice(0, 5))
			console.log(`  ${chalk.yellow("??")} ${a.title}`);
	}

	console.log("");
	console.log(
		chalk.dim(
			"Detailed report: https://pagespeed.web.dev/analysis?url=" +
				encodeURIComponent(targetUrl),
		),
	);
	console.log(chalk.dim("WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/"));

	if (failed.length > 0) process.exit(1);
}
