// `badi market` — App Store market research command.
//
// Combines competitor discovery, multi-region review collection,
// complaint categorization, and a difficulty score into one report.
//
// Subcommands:
//   badi market <appId>             — full report (default)
//   badi market discover <appId>    — competitor discovery only
//   badi market reviews <appId>     — multi-region review aggregation
//   badi market difficulty <appId>  — score + verdict only
//
// Phase 2 (issue-tracked): SensorTower revenue, demand×supply wishlist
// matrix, opportunity gaps cross-analysis, JSON output for piping.

import { lookupAppStore, searchAppStore } from "../aso-helpers.js";
import { chalk, showBanner } from "../cli.js";
import {
	aggregateReviewsMultiRegion,
	calculateDifficulty,
	computeWishlistMatrix,
	discoverCompetitors,
	fetchRedditDemand,
	findCrossCompetitorComplaints,
	findOpportunityGaps,
	summarizeReviews,
} from "../market-helpers.js";

function parseFlags(args) {
	const flags = {
		country: "us",
		countries: ["us"],
		pages: 3,
		limit: 10,
		json: false,
		days: 30,
		query: null,
	};
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === "--country") {
			flags.country = args[++i] || "us";
			flags.countries = flags.country.split(",").map((c) => c.trim());
		} else if (a === "--pages") {
			flags.pages = Math.max(1, Number.parseInt(args[++i], 10) || 3);
		} else if (a === "--limit") {
			flags.limit = Math.max(1, Number.parseInt(args[++i], 10) || 10);
		} else if (a === "--json") {
			flags.json = true;
		} else if (a === "--days") {
			flags.days = Math.max(1, Number.parseInt(args[++i], 10) || 30);
		} else if (a === "--query") {
			flags.query = args[++i] || null;
		}
	}
	return flags;
}

function showHelp() {
	showBanner();
	console.log(chalk.bold("Badi Market — App Store Market Research"));
	console.log("");
	console.log(chalk.bold("Usage:"));
	console.log(
		`  ${chalk.cyan("badi market <appId>")}                 Full report`,
	);
	console.log(
		`  ${chalk.cyan("badi market discover <appId>")}        Competitor discovery only`,
	);
	console.log(
		`  ${chalk.cyan("badi market reviews <appId>")}         Multi-region review aggregation`,
	);
	console.log(
		`  ${chalk.cyan("badi market difficulty <appId>")}      Difficulty score only`,
	);
	console.log(
		`  ${chalk.cyan("badi market wishlist <category>")}     Demand × supply matrix (Reddit + App Store)`,
	);
	console.log(
		`  ${chalk.cyan("badi market gaps <appId>")}            Opportunity gaps (difficulty × complaints × demand)`,
	);
	console.log("");
	console.log(chalk.bold("Options:"));
	console.log("  --country <c1,c2,..>    Regions (default: us)");
	console.log("  --pages <N>             Review page count (1-10, default: 3)");
	console.log("  --limit <N>             Competitor app count (default: 10)");
	console.log(
		"  --days <N>              wishlist/Reddit demand window in days (default: 30)",
	);
	console.log("  --query <q>             alternative search query for gaps");
	console.log("  --json                  Output as JSON (for piping)");
	console.log("");
	console.log(chalk.bold("Examples:"));
	console.log("  badi market 284882215");
	console.log("  badi market 284882215 --country us,gb,de --pages 5");
	console.log("  badi market discover 284882215 --limit 15");
	console.log('  badi market wishlist "habit tracker"');
	console.log('  badi market wishlist "ai journaling" --json');
	console.log("  badi market gaps 284882215");
	console.log(
		'  badi market gaps 284882215 --json --query "facebook alternative"',
	);
	console.log("");
	console.log(
		chalk.dim(
			"App ID = numeric id (284882215) or full URL (https://apps.apple.com/us/app/id284882215)",
		),
	);
	console.log(
		chalk.dim("Source: iTunes Lookup, iTunes Search, Apple RSS Reviews"),
	);
	console.log(
		chalk.dim(
			"No API key required. SensorTower revenue and gap report in v1.15.x.",
		),
	);
}

function parseAppId(input) {
	if (!input) return null;
	// Already numeric
	if (/^\d+$/.test(input)) return input;
	// App Store URL: ...id123456789...
	const m = input.match(/id(\d+)/);
	return m ? m[1] : null;
}

async function subWishlist(query, flags) {
	if (!query) {
		console.error(chalk.red("Category/keyword required"));
		console.log(chalk.dim('Example: badi market wishlist "habit tracker"'));
		process.exit(1);
	}

	if (!flags.json) {
		showBanner();
		console.log(chalk.bold(`Wishlist Matrix: ${query}`));
		console.log(
			chalk.dim(`Demand: Reddit (last ${flags.days} days) | Supply: App Store`),
		);
		console.log("");
		console.log(chalk.dim("[1/2] Collecting Reddit demand signal..."));
	}

	const demand = await fetchRedditDemand(query, {
		days: flags.days,
		limit: 100,
	});

	if (!flags.json) {
		console.log(chalk.dim(`[2/2] Measuring App Store competitor supply...`));
	}

	let supply = 0;
	let supplySample = [];
	try {
		const results = await searchAppStore(query, flags.countries[0], 25);
		supply = results.length;
		supplySample = results.slice(0, 5).map((r) => ({
			id: r.id,
			name: r.name,
			rating: r.rating,
			ratingCount: r.ratingCount,
		}));
	} catch (e) {
		if (!flags.json) {
			console.log(chalk.yellow(`  Supply measurement failed: ${e.message}`));
		}
	}

	const matrix = computeWishlistMatrix({
		demand: demand.mentions,
		supply,
	});

	const report = {
		query,
		demand: {
			mentions: demand.mentions,
			subreddits: demand.subreddits,
			sample: demand.sample,
			error: demand.error,
		},
		supply: {
			count: supply,
			sample: supplySample,
		},
		matrix,
		generatedAt: new Date().toISOString(),
	};

	if (flags.json) {
		console.log(JSON.stringify(report, null, 2));
		return;
	}

	console.log("");
	const verdictColor =
		matrix.quadrant === "BLUE_OCEAN"
			? chalk.green
			: matrix.quadrant === "COMPETITIVE"
				? chalk.yellow
				: matrix.quadrant === "NICHE"
					? chalk.cyan
					: chalk.red;

	console.log(chalk.bold("Result:"));
	console.log(`  ${verdictColor(chalk.bold(matrix.quadrant))}`);
	console.log("");
	console.log(chalk.bold("Demand (Reddit):"));
	console.log(`  ${demand.mentions} mentions in the last ${flags.days} days`);
	if (demand.error) {
		console.log(chalk.yellow(`  Warning: ${demand.error}`));
	}
	const topSubs = Object.entries(demand.subreddits)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);
	if (topSubs.length > 0) {
		console.log(chalk.bold("  Top subreddits:"));
		for (const [sub, c] of topSubs) {
			console.log(`    r/${sub.padEnd(25)} ${c}`);
		}
	}
	console.log("");
	console.log(chalk.bold("Supply (App Store):"));
	console.log(`  ${supply} apps found (first page)`);
	for (const s of supplySample) {
		console.log(
			`    ${(s.name || "").substring(0, 38).padEnd(40)} ${chalk.dim(`★${s.rating || "-"} (${s.ratingCount || 0})`)}`,
		);
	}
	console.log("");
	console.log(chalk.bold("Quadrant guide:"));
	console.log(
		`${chalk.green("  BLUE_OCEAN")}    high demand, low supply   -> opportunity`,
	);
	console.log(
		`${chalk.yellow("  COMPETITIVE")}  high demand, high supply  -> differentiate`,
	);
	console.log(
		`${chalk.cyan("  NICHE")}        low demand, low supply    -> niche audience`,
	);
	console.log(
		`${chalk.red("  SATURATED")}    low demand, high supply   -> avoid`,
	);
}

async function subGaps(appId, flags) {
	if (!flags.json) {
		showBanner();
		console.log(chalk.bold(`Opportunity Gaps: app ${appId}`));
		console.log(
			chalk.dim(
				"Difficulty + cross-competitor complaints + (optional) Reddit demand",
			),
		);
		console.log("");
		console.log(chalk.dim("[1/5] Target profile..."));
	}
	const target = await lookupAppStore(appId, flags.countries[0]);

	if (!flags.json)
		console.log(
			chalk.dim(`[2/5] Competitor discovery (${flags.limit} apps)...`),
		);
	const competitors = await discoverCompetitors(target, {
		country: flags.countries[0],
		limit: flags.limit,
	});

	if (!flags.json)
		console.log(chalk.dim(`[3/5] Collecting competitor reviews...`));
	const competitorSummaries = [];
	for (const c of competitors) {
		try {
			const cReviews = await aggregateReviewsMultiRegion(c.id, {
				countries: flags.countries,
				pages: Math.max(1, Math.floor(flags.pages / 2)),
			});
			competitorSummaries.push({
				name: c.name,
				id: c.id,
				summary: summarizeReviews(cReviews),
			});
		} catch {
			// non-fatal
		}
	}

	const difficulty = calculateDifficulty(target, competitors);
	const crossComplaints = findCrossCompetitorComplaints(competitorSummaries);

	let demandSignal;
	let demandMeta = null;
	if (flags.query) {
		if (!flags.json)
			console.log(chalk.dim(`[4/5] Reddit demand: "${flags.query}"`));
		try {
			const demand = await fetchRedditDemand(flags.query, { days: flags.days });
			demandSignal = demand.mentions;
			demandMeta = demand;
		} catch {
			// non-fatal
		}
	} else if (!flags.json) {
		console.log(
			chalk.dim("[4/5] Reddit demand skipped (--query not provided)"),
		);
	}

	if (!flags.json) console.log(chalk.dim("[5/5] Computing gap score..."));
	const gaps = findOpportunityGaps({
		crossComplaints,
		competitorCount: competitorSummaries.length,
		difficulty,
		demandSignal,
	});

	const report = {
		target: {
			id: target.id,
			name: target.name,
			genre: target.primaryGenre,
		},
		difficulty,
		competitorCount: competitorSummaries.length,
		demand: demandMeta && {
			query: flags.query,
			mentions: demandMeta.mentions,
			subreddits: demandMeta.subreddits,
		},
		gaps,
		generatedAt: new Date().toISOString(),
	};

	if (flags.json) {
		console.log(JSON.stringify(report, null, 2));
		return;
	}

	console.log("");
	console.log(chalk.bold(`Target: ${target.name}`));
	console.log(
		chalk.dim(
			`Genre: ${target.primaryGenre} | Difficulty: ${difficulty.score}/100 (${difficulty.verdict})`,
		),
	);
	console.log(
		chalk.dim(
			`Competitors: ${competitorSummaries.length} | Complaint categories: ${crossComplaints.length}`,
		),
	);
	if (demandMeta) {
		console.log(
			chalk.dim(
				`Demand: "${flags.query}" → ${demandMeta.mentions} mentions/${flags.days} days`,
			),
		);
	}
	console.log("");

	if (gaps.length === 0) {
		console.log(
			chalk.dim("(insufficient data — more competitor reviews needed)"),
		);
		return;
	}

	console.log(chalk.bold("Top Opportunity Gaps:"));
	console.log(
		chalk.dim(
			`  ${"Code".padEnd(18)} ${"Sev".padEnd(8)} ${"Score".padEnd(8)} Description`,
		),
	);
	for (const g of gaps.slice(0, 8)) {
		const sevColor =
			g.severity === "HIGH"
				? chalk.red
				: g.severity === "MEDIUM"
					? chalk.yellow
					: chalk.dim;
		console.log(
			`  ${chalk.bold(g.code.padEnd(18))} ${sevColor(g.severity.padEnd(8))} ${String(g.gapScore).padStart(6)}  ${chalk.dim(g.rationale)}`,
		);
	}
	console.log("");
	console.log(
		chalk.dim("High score + HIGH severity = strong signal for market entry"),
	);
	console.log(
		chalk.dim("Add Reddit demand with --query <category> to enrich the score"),
	);
}

async function subDiscover(appId, flags) {
	const target = await lookupAppStore(appId, flags.country.split(",")[0]);
	const competitors = await discoverCompetitors(target, {
		country: flags.countries[0],
		limit: flags.limit,
	});

	showBanner();
	console.log(chalk.bold(`Target: ${target.name}`));
	console.log(
		chalk.dim(
			`Genre: ${target.primaryGenre} | Rating: ${target.averageRating} | Reviews: ${target.ratingCount}`,
		),
	);
	console.log("");
	console.log(chalk.bold(`${competitors.length} Competitors Found:`));
	for (const c of competitors) {
		console.log(
			`  ${chalk.cyan(c.id.toString().padEnd(12))} ${(c.name || "").substring(0, 35).padEnd(36)} ${chalk.dim(`★${c.rating || "-"} (${c.ratingCount || 0})`)}`,
		);
	}
}

async function subReviews(appId, flags) {
	const target = await lookupAppStore(appId, flags.countries[0]);
	const reviews = await aggregateReviewsMultiRegion(appId, {
		countries: flags.countries,
		pages: flags.pages,
	});
	const summary = summarizeReviews(reviews);

	showBanner();
	console.log(chalk.bold(`Review Aggregation: ${target.name}`));
	console.log(
		chalk.dim(
			`Regions: ${flags.countries.join(", ")} | Pages: ${flags.pages} | Total: ${summary.total}`,
		),
	);
	console.log("");
	console.log(chalk.bold("Rating Distribution:"));
	for (const star of [5, 4, 3, 2, 1]) {
		const c = summary.byRating[star];
		const pct = summary.total > 0 ? Math.round((c / summary.total) * 100) : 0;
		const bar = "█".repeat(Math.min(40, Math.round(pct / 2)));
		console.log(
			`  ${"★".repeat(star).padEnd(5)} ${String(c).padStart(4)}  ${bar} ${pct}%`,
		);
	}
	console.log("");
	console.log(chalk.bold("Complaint Categories (1-3 ★):"));
	const ranked = Object.entries(summary.issueCounts)
		.filter(([, n]) => n > 0)
		.sort((a, b) => b[1] - a[1]);
	for (const [code, count] of ranked) {
		const bar = "▓".repeat(Math.min(30, count));
		console.log(
			`  ${chalk.yellow(code.padEnd(20))} ${String(count).padStart(3)}  ${bar}`,
		);
	}
}

async function subDifficulty(appId, flags) {
	const target = await lookupAppStore(appId, flags.countries[0]);
	const competitors = await discoverCompetitors(target, {
		country: flags.countries[0],
		limit: flags.limit,
	});
	const diff = calculateDifficulty(target, competitors);

	showBanner();
	console.log(chalk.bold(`Difficulty Analysis: ${target.name}`));
	console.log("");

	const verdictColor =
		diff.verdict === "BLUE_OCEAN"
			? chalk.green
			: diff.verdict === "COMPETITIVE"
				? chalk.yellow
				: diff.verdict === "HARD"
					? chalk.red
					: chalk.bold.red;
	console.log(`  Score:   ${chalk.bold(diff.score)}/100`);
	console.log(`  Verdict: ${verdictColor(diff.verdict)}`);
	console.log("");
	console.log(chalk.bold("Components:"));
	console.log(
		`  Competitor pressure:  ${diff.components.competitorPressure}/100`,
	);
	console.log(
		`  Rating floor:         ${diff.components.ratingFloor}/30 (avg: ${diff.components.avgRating})`,
	);
	console.log(
		`  Incumbent ownership:  ${diff.components.incumbentEntrenchment}/30 (median ratings: ${diff.components.medianRatingCount})`,
	);
}

async function subFull(appId, flags) {
	const target = await lookupAppStore(appId, flags.countries[0]);
	console.log(chalk.dim(`[1/5] Target: ${target.name}`));

	const competitors = await discoverCompetitors(target, {
		country: flags.countries[0],
		limit: flags.limit,
	});
	console.log(chalk.dim(`[2/5] ${competitors.length} competitors found`));

	const targetReviews = await aggregateReviewsMultiRegion(appId, {
		countries: flags.countries,
		pages: flags.pages,
	});
	const targetSummary = summarizeReviews(targetReviews);
	console.log(
		chalk.dim(`[3/5] Collected ${targetSummary.total} reviews for the target`),
	);

	const competitorSummaries = [];
	for (const c of competitors) {
		try {
			const cReviews = await aggregateReviewsMultiRegion(c.id, {
				countries: flags.countries,
				pages: Math.max(1, Math.floor(flags.pages / 2)),
			});
			competitorSummaries.push({
				name: c.name,
				id: c.id,
				summary: summarizeReviews(cReviews),
			});
		} catch {
			// Skip competitor on review fetch failure
		}
	}
	console.log(
		chalk.dim(
			`[4/5] Review analysis done for ${competitorSummaries.length} competitors`,
		),
	);

	const diff = calculateDifficulty(target, competitors);
	const crossComplaints = findCrossCompetitorComplaints(competitorSummaries);
	console.log(chalk.dim(`[5/5] Cross-competitor intersection analysis done`));
	console.log("");

	// Report
	showBanner();
	console.log(chalk.bold(`Market Research Report: ${target.name}`));
	console.log(
		chalk.dim(
			`Genre: ${target.primaryGenre} | Regions: ${flags.countries.join(", ")}`,
		),
	);
	console.log("");

	const verdictColor =
		diff.verdict === "BLUE_OCEAN"
			? chalk.green
			: diff.verdict === "COMPETITIVE"
				? chalk.yellow
				: chalk.red;
	console.log(chalk.bold("Difficulty:"));
	console.log(`  ${chalk.bold(diff.score)}/100  ${verdictColor(diff.verdict)}`);
	console.log("");

	console.log(
		chalk.bold(`Target Rating Distribution (${targetSummary.total} reviews):`),
	);
	for (const star of [5, 4, 3, 2, 1]) {
		const c = targetSummary.byRating[star];
		console.log(`  ${"★".repeat(star).padEnd(5)} ${String(c).padStart(4)}`);
	}
	console.log("");

	console.log(chalk.bold("Target Complaint Categories (1-3 ★):"));
	const targetRanked = Object.entries(targetSummary.issueCounts)
		.filter(([, n]) => n > 0)
		.sort((a, b) => b[1] - a[1]);
	if (targetRanked.length === 0) {
		console.log(chalk.dim("  (none)"));
	} else {
		for (const [code, count] of targetRanked.slice(0, 6)) {
			console.log(`  ${chalk.yellow(code.padEnd(20))} ${count}`);
		}
	}
	console.log("");

	console.log(
		chalk.bold("Cross-Competitor Common Complaints (market opportunity):"),
	);
	if (crossComplaints.length === 0) {
		console.log(chalk.dim("  (insufficient data)"));
	} else {
		console.log(
			chalk.dim(`  ${"Code".padEnd(20)} Total   Affected competitors`),
		);
		for (const c of crossComplaints.slice(0, 8)) {
			const apps = Object.keys(c.perApp).length;
			console.log(
				`  ${chalk.red(c.code.padEnd(20))} ${String(c.total).padStart(5)}   ${apps} competitors`,
			);
		}
		console.log("");
		console.log(
			chalk.dim(
				"  Complaints recurring across many competitors = market gap signal",
			),
		);
	}
	console.log("");

	console.log(chalk.bold("Competitor List:"));
	for (const c of competitors.slice(0, 8)) {
		console.log(
			`  ${chalk.cyan(c.id.toString().padEnd(12))} ${(c.name || "").substring(0, 35).padEnd(36)} ${chalk.dim(`★${c.rating || "-"} (${c.ratingCount || 0})`)}`,
		);
	}
	if (competitors.length > 8) {
		console.log(
			chalk.dim(`  ... and ${competitors.length - 8} more competitors`),
		);
	}
	console.log("");
	console.log(
		chalk.dim(
			"v1.15.x: SensorTower revenue + wishlist demand×supply matrix + opportunity gaps",
		),
	);
}

export async function runMarket(args) {
	if (!args[0] || args[0] === "--help" || args[0] === "-h") {
		showHelp();
		return;
	}

	// Wishlist subcommand: takes a free-text query, not appId
	if (args[0] === "wishlist") {
		const query = args[1];
		const flags = parseFlags(args.slice(2));
		try {
			return await subWishlist(query, flags);
		} catch (e) {
			console.error(chalk.red(`Error: ${e.message}`));
			process.exit(1);
		}
	}

	let sub = "full";
	let appIdInput = args[0];
	if (["discover", "reviews", "difficulty", "gaps", "full"].includes(args[0])) {
		sub = args[0];
		appIdInput = args[1];
	}

	const appId = parseAppId(appIdInput);
	if (!appId) {
		console.error(
			chalk.red(`Invalid app ID or URL: ${appIdInput || "(none)"}`),
		);
		console.log(chalk.dim("Example: badi market 284882215"));
		console.log(
			chalk.dim("       badi market https://apps.apple.com/us/app/id284882215"),
		);
		process.exit(1);
	}

	const flags = parseFlags(args.slice(sub === "full" ? 1 : 2));

	try {
		if (sub === "discover") return await subDiscover(appId, flags);
		if (sub === "reviews") return await subReviews(appId, flags);
		if (sub === "difficulty") return await subDifficulty(appId, flags);
		if (sub === "gaps") return await subGaps(appId, flags);
		return await subFull(appId, flags);
	} catch (e) {
		console.error(chalk.red(`Error: ${e.message}`));
		process.exit(1);
	}
}
