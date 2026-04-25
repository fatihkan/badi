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

import { lookupAppStore } from "../aso-helpers.js";
import { chalk, showBanner } from "../cli.js";
import {
	aggregateReviewsMultiRegion,
	calculateDifficulty,
	discoverCompetitors,
	findCrossCompetitorComplaints,
	summarizeReviews,
} from "../market-helpers.js";

function parseFlags(args) {
	const flags = {
		country: "us",
		countries: ["us"],
		pages: 3,
		limit: 10,
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
		}
	}
	return flags;
}

function showHelp() {
	showBanner();
	console.log(chalk.bold("Badi Market — App Store Pazar Arastirmasi"));
	console.log("");
	console.log(chalk.bold("Kullanim:"));
	console.log(`  ${chalk.cyan("badi market <appId>")}                 Tam rapor`);
	console.log(`  ${chalk.cyan("badi market discover <appId>")}        Sadece rakip kesfi`);
	console.log(`  ${chalk.cyan("badi market reviews <appId>")}         Coklu bolge yorum aggregation`);
	console.log(`  ${chalk.cyan("badi market difficulty <appId>")}      Sadece zorluk skoru`);
	console.log("");
	console.log(chalk.bold("Secenekler:"));
	console.log("  --country <c1,c2,..>    Bolgeler (varsayilan: us)");
	console.log("  --pages <N>             Inceleme sayfa sayisi (1-10, varsayilan: 3)");
	console.log("  --limit <N>             Rakip uygulama sayisi (varsayilan: 10)");
	console.log("");
	console.log(chalk.bold("Ornekler:"));
	console.log("  badi market 284882215");
	console.log("  badi market 284882215 --country us,gb,de --pages 5");
	console.log("  badi market discover 284882215 --limit 15");
	console.log("");
	console.log(
		chalk.dim("App ID = numerik id (284882215) veya tam URL (https://apps.apple.com/us/app/id284882215)"),
	);
	console.log(chalk.dim("Kaynak: iTunes Lookup, iTunes Search, Apple RSS Reviews"));
	console.log(chalk.dim("API anahtari gerekmez. SensorTower revenue ve gap report v1.15.x'te."));
}

function parseAppId(input) {
	if (!input) return null;
	// Already numeric
	if (/^\d+$/.test(input)) return input;
	// App Store URL: ...id123456789...
	const m = input.match(/id(\d+)/);
	return m ? m[1] : null;
}

async function subDiscover(appId, flags) {
	const target = await lookupAppStore(appId, flags.country.split(",")[0]);
	const competitors = await discoverCompetitors(target, {
		country: flags.countries[0],
		limit: flags.limit,
	});

	showBanner();
	console.log(chalk.bold(`Hedef: ${target.name}`));
	console.log(chalk.dim(`Tur: ${target.primaryGenre} | Rating: ${target.averageRating} | Yorum: ${target.ratingCount}`));
	console.log("");
	console.log(chalk.bold(`${competitors.length} Rakip Bulundu:`));
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
	console.log(chalk.bold(`Yorum Aggregation: ${target.name}`));
	console.log(
		chalk.dim(`Bolgeler: ${flags.countries.join(", ")} | Sayfa: ${flags.pages} | Toplam: ${summary.total}`),
	);
	console.log("");
	console.log(chalk.bold("Rating Dagilimi:"));
	for (const star of [5, 4, 3, 2, 1]) {
		const c = summary.byRating[star];
		const pct = summary.total > 0 ? Math.round((c / summary.total) * 100) : 0;
		const bar = "█".repeat(Math.min(40, Math.round(pct / 2)));
		console.log(`  ${"★".repeat(star).padEnd(5)} ${String(c).padStart(4)}  ${bar} ${pct}%`);
	}
	console.log("");
	console.log(chalk.bold("Sikayet Kategorileri (1-3 ★):"));
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
	console.log(chalk.bold(`Zorluk Analizi: ${target.name}`));
	console.log("");

	const verdictColor =
		diff.verdict === "BLUE_OCEAN"
			? chalk.green
			: diff.verdict === "COMPETITIVE"
				? chalk.yellow
				: diff.verdict === "HARD"
					? chalk.red
					: chalk.bold.red;
	console.log(`  Skor:    ${chalk.bold(diff.score)}/100`);
	console.log(`  Verdict: ${verdictColor(diff.verdict)}`);
	console.log("");
	console.log(chalk.bold("Bilesenler:"));
	console.log(`  Rakip baskisi:        ${diff.components.competitorPressure}/100`);
	console.log(`  Rating tavani:        ${diff.components.ratingFloor}/30 (avg: ${diff.components.avgRating})`);
	console.log(`  Sahip olunmus alan:   ${diff.components.incumbentEntrenchment}/30 (median ratings: ${diff.components.medianRatingCount})`);
}

async function subFull(appId, flags) {
	const target = await lookupAppStore(appId, flags.countries[0]);
	console.log(chalk.dim(`[1/5] Hedef: ${target.name}`));

	const competitors = await discoverCompetitors(target, {
		country: flags.countries[0],
		limit: flags.limit,
	});
	console.log(chalk.dim(`[2/5] ${competitors.length} rakip bulundu`));

	const targetReviews = await aggregateReviewsMultiRegion(appId, {
		countries: flags.countries,
		pages: flags.pages,
	});
	const targetSummary = summarizeReviews(targetReviews);
	console.log(chalk.dim(`[3/5] Hedef icin ${targetSummary.total} yorum toplandi`));

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
	console.log(chalk.dim(`[4/5] ${competitorSummaries.length} rakip icin yorum analizi tamamlandi`));

	const diff = calculateDifficulty(target, competitors);
	const crossComplaints = findCrossCompetitorComplaints(competitorSummaries);
	console.log(chalk.dim(`[5/5] Cross-rakip kesim analizi tamamlandi`));
	console.log("");

	// Report
	showBanner();
	console.log(chalk.bold(`Pazar Arastirma Raporu: ${target.name}`));
	console.log(chalk.dim(`Tur: ${target.primaryGenre} | Bolgeler: ${flags.countries.join(", ")}`));
	console.log("");

	const verdictColor =
		diff.verdict === "BLUE_OCEAN"
			? chalk.green
			: diff.verdict === "COMPETITIVE"
				? chalk.yellow
				: chalk.red;
	console.log(chalk.bold("Zorluk:"));
	console.log(`  ${chalk.bold(diff.score)}/100  ${verdictColor(diff.verdict)}`);
	console.log("");

	console.log(chalk.bold(`Hedef Rating Dagilimi (${targetSummary.total} yorum):`));
	for (const star of [5, 4, 3, 2, 1]) {
		const c = targetSummary.byRating[star];
		console.log(`  ${"★".repeat(star).padEnd(5)} ${String(c).padStart(4)}`);
	}
	console.log("");

	console.log(chalk.bold("Hedefin Sikayet Kategorileri (1-3 ★):"));
	const targetRanked = Object.entries(targetSummary.issueCounts)
		.filter(([, n]) => n > 0)
		.sort((a, b) => b[1] - a[1]);
	if (targetRanked.length === 0) {
		console.log(chalk.dim("  (yok)"));
	} else {
		for (const [code, count] of targetRanked.slice(0, 6)) {
			console.log(`  ${chalk.yellow(code.padEnd(20))} ${count}`);
		}
	}
	console.log("");

	console.log(chalk.bold("Cross-Rakip Sik Sikayetler (pazar firsati):"));
	if (crossComplaints.length === 0) {
		console.log(chalk.dim("  (yetersiz veri)"));
	} else {
		console.log(
			chalk.dim(`  ${"Kod".padEnd(20)} Toplam  Etkilenen rakip`),
		);
		for (const c of crossComplaints.slice(0, 8)) {
			const apps = Object.keys(c.perApp).length;
			console.log(
				`  ${chalk.red(c.code.padEnd(20))} ${String(c.total).padStart(5)}   ${apps} rakip`,
			);
		}
		console.log("");
		console.log(
			chalk.dim("  Bircok rakip icin geri donen sikayetler = pazar bosligu sinyali"),
		);
	}
	console.log("");

	console.log(chalk.bold("Rakip Listesi:"));
	for (const c of competitors.slice(0, 8)) {
		console.log(
			`  ${chalk.cyan(c.id.toString().padEnd(12))} ${(c.name || "").substring(0, 35).padEnd(36)} ${chalk.dim(`★${c.rating || "-"} (${c.ratingCount || 0})`)}`,
		);
	}
	if (competitors.length > 8) {
		console.log(chalk.dim(`  ... ve ${competitors.length - 8} rakip daha`));
	}
	console.log("");
	console.log(
		chalk.dim("v1.15.x: SensorTower revenue + wishlist demand×supply matrix + opportunity gaps"),
	);
}

export async function runMarket(args) {
	if (!args[0] || args[0] === "--help" || args[0] === "-h") {
		showHelp();
		return;
	}

	let sub = "full";
	let appIdInput = args[0];
	if (["discover", "reviews", "difficulty", "full"].includes(args[0])) {
		sub = args[0];
		appIdInput = args[1];
	}

	const appId = parseAppId(appIdInput);
	if (!appId) {
		console.error(chalk.red(`Gecersiz app ID veya URL: ${appIdInput || "(yok)"}`));
		console.log(chalk.dim("Ornek: badi market 284882215"));
		console.log(chalk.dim("       badi market https://apps.apple.com/us/app/id284882215"));
		process.exit(1);
	}

	const flags = parseFlags(args.slice(sub === "full" ? 1 : 2));

	try {
		if (sub === "discover") return await subDiscover(appId, flags);
		if (sub === "reviews") return await subReviews(appId, flags);
		if (sub === "difficulty") return await subDifficulty(appId, flags);
		return await subFull(appId, flags);
	} catch (e) {
		console.error(chalk.red(`Hata: ${e.message}`));
		process.exit(1);
	}
}
