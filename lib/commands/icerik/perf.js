import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chalk, showBanner } from "../../cli.js";
import { getDateString } from "../../icerik-helpers.js";

export function runPerf(args) {
	const perfFile = join(
		process.cwd(),
		".claude",
		"workspace",
		"performans.jsonl",
	);
	const perfSub = args[1];

	function readPerfLog() {
		if (!existsSync(perfFile)) return [];
		const lines = readFileSync(perfFile, "utf-8").split("\n").filter(Boolean);
		const entries = [];
		for (const line of lines) {
			try {
				entries.push(JSON.parse(line));
			} catch {
				// Bozuk satir
			}
		}
		return entries;
	}

	if (perfSub === "--help" || perfSub === "-h") {
		console.log(chalk.bold("Icerik Performans Takibi:"));
		console.log("");
		console.log(
			`  badi icerik perf                      ${chalk.dim("Haftalik ozet (varsayilan)")}`,
		);
		console.log(
			`  badi icerik perf add [secenekler]     ${chalk.dim("Performans verisi ekle")}`,
		);
		console.log(
			`  badi icerik perf list                 ${chalk.dim("Tum kayitlari listele")}`,
		);
		console.log("");
		console.log(chalk.bold("Perf Add Secenekleri:"));
		console.log("  --file <dosya>       Icerik dosya adi");
		console.log(
			"  --platform <ad>      Platform (instagram/twitter/linkedin/tiktok/facebook)",
		);
		console.log("  --likes <sayi>       Begeni sayisi");
		console.log("  --comments <sayi>    Yorum sayisi");
		console.log("  --shares <sayi>      Paylasim sayisi");
		console.log("  --saves <sayi>       Kayit sayisi");
		console.log("  --reach <sayi>       Erisim sayisi");
		console.log("  --effort <saat>      Harcanan efor (saat)");
		console.log("");
		console.log(chalk.bold("Rapor Secenekleri:"));
		console.log("  --week               Son 7 gun (varsayilan)");
		console.log("  --month              Son 30 gun");
		console.log("  --trend              Trend analizi");
		console.log("  --roi                ROI hesaplamasi");
		console.log("  --platform <ad>      Platform bazli filtre");
		return;
	}

	if (perfSub === "add") {
		const perfArgs = args.slice(2);
		const entry = {
			timestamp: new Date().toISOString(),
			date: getDateString(),
		};

		for (let i = 0; i < perfArgs.length; i++) {
			switch (perfArgs[i]) {
				case "--file":
					entry.file = perfArgs[++i];
					break;
				case "--platform":
					entry.platform = perfArgs[++i];
					break;
				case "--likes":
					entry.likes = Number.parseInt(perfArgs[++i], 10) || 0;
					break;
				case "--comments":
					entry.comments = Number.parseInt(perfArgs[++i], 10) || 0;
					break;
				case "--shares":
					entry.shares = Number.parseInt(perfArgs[++i], 10) || 0;
					break;
				case "--saves":
					entry.saves = Number.parseInt(perfArgs[++i], 10) || 0;
					break;
				case "--reach":
					entry.reach = Number.parseInt(perfArgs[++i], 10) || 0;
					break;
				case "--effort":
					entry.effort = Number.parseFloat(perfArgs[++i]) || 0;
					break;
			}
		}

		if (!entry.file || !entry.platform) {
			console.error(chalk.red("Eksik parametre: --file ve --platform zorunlu"));
			console.log(
				"Ornek: badi icerik perf add --file test.md --platform instagram --likes 100",
			);
			process.exit(1);
		}

		const dir = join(process.cwd(), ".claude", "workspace");
		mkdirSync(dir, { recursive: true });

		const line = JSON.stringify(entry);
		appendFileSync(perfFile, `${line}\n`);

		const engagement =
			(entry.likes || 0) +
			(entry.comments || 0) +
			(entry.shares || 0) +
			(entry.saves || 0);
		console.log(chalk.bold.green("Performans verisi kaydedildi!"));
		console.log(`  Dosya:     ${chalk.cyan(entry.file)}`);
		console.log(`  Platform:  ${chalk.cyan(entry.platform)}`);
		console.log(`  Etkilesim: ${chalk.cyan(engagement)}`);
		if (entry.reach) console.log(`  Erisim:    ${chalk.cyan(entry.reach)}`);
		return;
	}

	if (perfSub === "list") {
		const entries = readPerfLog();
		if (entries.length === 0) {
			console.log(chalk.yellow("Henuz performans verisi yok."));
			console.log(
				chalk.dim(
					"Veri ekle: badi icerik perf add --file X --platform Y --likes N",
				),
			);
			return;
		}

		console.log(chalk.bold("Performans Kayitlari:"));
		console.log("");
		console.log(
			`  ${chalk.dim("Tarih".padEnd(12))}${chalk.dim("Platform".padEnd(12))}${chalk.dim("Dosya".padEnd(30))}${chalk.dim("Begeni".padEnd(8))}${chalk.dim("Yorum".padEnd(8))}${chalk.dim("Erisim")}`,
		);
		console.log(chalk.dim(`  ${"─".repeat(78)}`));

		for (const e of entries) {
			console.log(
				`  ${(e.date || "").padEnd(12)}${(e.platform || "").padEnd(12)}${(e.file || "").substring(0, 28).padEnd(30)}${String(e.likes || 0).padEnd(8)}${String(e.comments || 0).padEnd(8)}${e.reach || "-"}`,
			);
		}
		return;
	}

	let perfPeriod = "week";
	let perfPlatformFilter = null;
	let showTrend = false;
	let showRoi = false;
	const reportArgs = args.slice(1);

	for (let i = 0; i < reportArgs.length; i++) {
		switch (reportArgs[i]) {
			case "--week":
				perfPeriod = "week";
				break;
			case "--month":
				perfPeriod = "month";
				break;
			case "--trend":
				showTrend = true;
				break;
			case "--roi":
				showRoi = true;
				break;
			case "--platform":
				perfPlatformFilter = reportArgs[++i];
				break;
		}
	}

	let entries = readPerfLog();
	if (entries.length === 0) {
		console.log(chalk.yellow("Henuz performans verisi yok."));
		console.log(
			chalk.dim(
				"Veri ekle: badi icerik perf add --file X --platform Y --likes N",
			),
		);
		return;
	}

	const cutoffMs = perfPeriod === "month" ? 30 * 86400000 : 7 * 86400000;
	const cutoffDate = new Date(Date.now() - cutoffMs);
	entries = entries.filter(
		(e) => new Date(e.date || e.timestamp) >= cutoffDate,
	);

	if (perfPlatformFilter) {
		entries = entries.filter(
			(e) =>
				(e.platform || "").toLowerCase() === perfPlatformFilter.toLowerCase(),
		);
	}

	if (entries.length === 0) {
		console.log(chalk.yellow("Secilen donemde veri yok."));
		return;
	}

	if (showTrend) {
		showBanner();
		console.log(chalk.bold("Trend Analizi"));
		console.log("");

		const halfMs = cutoffMs / 2;
		const halfDate = new Date(Date.now() - halfMs);
		const allInRange = readPerfLog().filter(
			(e) => new Date(e.date || e.timestamp) >= cutoffDate,
		);
		const onceki = allInRange.filter(
			(e) => new Date(e.date || e.timestamp) < halfDate,
		);
		const mevcut = allInRange.filter(
			(e) => new Date(e.date || e.timestamp) >= halfDate,
		);

		const engOf = (arr) =>
			arr.reduce(
				(s, e) =>
					s +
					(e.likes || 0) +
					(e.comments || 0) +
					(e.shares || 0) +
					(e.saves || 0),
				0,
			);
		const oncekiEng = engOf(onceki);
		const mevcutEng = engOf(mevcut);
		const change =
			oncekiEng > 0
				? Math.round(((mevcutEng - oncekiEng) / oncekiEng) * 100)
				: 0;
		const arrow =
			change >= 0
				? chalk.green(`↑ %${change}`)
				: chalk.red(`↓ %${Math.abs(change)}`);

		console.log(
			`  Onceki donem:  ${chalk.dim(onceki.length)} icerik, ${chalk.dim(oncekiEng)} etkilesim`,
		);
		console.log(
			`  Mevcut donem:  ${chalk.dim(mevcut.length)} icerik, ${chalk.dim(mevcutEng)} etkilesim`,
		);
		console.log(`  Degisim:       ${arrow}`);
		console.log("");

		const platforms = [...new Set(allInRange.map((e) => e.platform))];
		if (platforms.length > 1) {
			console.log(chalk.bold("Platform Bazli:"));
			for (const p of platforms) {
				const pOnceki = engOf(onceki.filter((e) => e.platform === p));
				const pMevcut = engOf(mevcut.filter((e) => e.platform === p));
				const pChange =
					pOnceki > 0 ? Math.round(((pMevcut - pOnceki) / pOnceki) * 100) : 0;
				const pArrow =
					pChange >= 0
						? chalk.green(`↑ %${pChange}`)
						: chalk.red(`↓ %${Math.abs(pChange)}`);
				console.log(`  ${(p || "").padEnd(15)} ${pArrow}`);
			}
		}
		return;
	}

	if (showRoi) {
		showBanner();
		console.log(chalk.bold("ROI Analizi (Etkilesim / Efor)"));
		console.log("");

		const byType = {};
		for (const e of entries) {
			const platform = e.platform || "diger";
			if (!byType[platform])
				byType[platform] = { count: 0, engagement: 0, effort: 0 };
			byType[platform].count++;
			byType[platform].engagement +=
				(e.likes || 0) + (e.comments || 0) + (e.shares || 0) + (e.saves || 0);
			byType[platform].effort += e.effort || 0;
		}

		console.log(
			`  ${chalk.dim("Platform".padEnd(15))}${chalk.dim("Icerik".padEnd(8))}${chalk.dim("Etkilesim".padEnd(12))}${chalk.dim("Efor(s)".padEnd(10))}${chalk.dim("ROI")}`,
		);
		console.log(chalk.dim(`  ${"─".repeat(55)}`));

		const sorted = Object.entries(byType).sort((a, b) => {
			const roiA =
				a[1].effort > 0 ? a[1].engagement / a[1].effort : a[1].engagement;
			const roiB =
				b[1].effort > 0 ? b[1].engagement / b[1].effort : b[1].engagement;
			return roiB - roiA;
		});

		for (const [platform, data] of sorted) {
			const roi =
				data.effort > 0 ? (data.engagement / data.effort).toFixed(1) : "-";
			console.log(
				`  ${platform.padEnd(15)}${String(data.count).padEnd(8)}${String(data.engagement).padEnd(12)}${String(data.effort || "-").padEnd(10)}${chalk.bold(roi)}`,
			);
		}
		return;
	}

	showBanner();
	const periodLabel = perfPeriod === "month" ? "Son 30 gun" : "Son 7 gun";
	console.log(chalk.bold("Icerik Performans Raporu"));
	console.log(`Donem: ${chalk.cyan(periodLabel)}`);
	if (perfPlatformFilter)
		console.log(`Platform: ${chalk.cyan(perfPlatformFilter)}`);
	console.log("");

	const platformData = {};
	for (const e of entries) {
		const p = e.platform || "diger";
		if (!platformData[p])
			platformData[p] = {
				count: 0,
				likes: 0,
				comments: 0,
				shares: 0,
				saves: 0,
				reach: 0,
			};
		platformData[p].count++;
		platformData[p].likes += e.likes || 0;
		platformData[p].comments += e.comments || 0;
		platformData[p].shares += e.shares || 0;
		platformData[p].saves += e.saves || 0;
		platformData[p].reach += e.reach || 0;
	}

	console.log(
		`  ${chalk.dim("Platform".padEnd(15))}${chalk.dim("Icerik".padEnd(8))}${chalk.dim("Begeni".padEnd(10))}${chalk.dim("Yorum".padEnd(10))}${chalk.dim("Kayit".padEnd(10))}${chalk.dim("Erisim")}`,
	);
	console.log(chalk.dim(`  ${"─".repeat(63)}`));

	let totalLikes = 0;
	let totalComments = 0;
	let totalSaves = 0;
	let totalReach = 0;

	for (const [platform, data] of Object.entries(platformData)) {
		console.log(
			`  ${platform.padEnd(15)}${String(data.count).padEnd(8)}${String(data.likes).padEnd(10)}${String(data.comments).padEnd(10)}${String(data.saves).padEnd(10)}${data.reach || "-"}`,
		);
		totalLikes += data.likes;
		totalComments += data.comments;
		totalSaves += data.saves;
		totalReach += data.reach;
	}

	console.log(chalk.dim(`  ${"─".repeat(63)}`));
	console.log(
		chalk.bold(
			`  ${"Toplam".padEnd(15)}${String(entries.length).padEnd(8)}${String(totalLikes).padEnd(10)}${String(totalComments).padEnd(10)}${String(totalSaves).padEnd(10)}${totalReach}`,
		),
	);
	console.log("");

	const bestEntry = entries.reduce((best, e) => {
		const eng =
			(e.likes || 0) + (e.comments || 0) + (e.shares || 0) + (e.saves || 0);
		const bestEng =
			(best.likes || 0) +
			(best.comments || 0) +
			(best.shares || 0) +
			(best.saves || 0);
		return eng > bestEng ? e : best;
	}, entries[0]);

	if (bestEntry) {
		const bestEng =
			(bestEntry.likes || 0) +
			(bestEntry.comments || 0) +
			(bestEntry.shares || 0) +
			(bestEntry.saves || 0);
		console.log(chalk.bold("En Iyi Performans:"));
		console.log(
			`  ${chalk.cyan(bestEntry.file || "?")} (${bestEntry.platform || "?"})`,
		);
		console.log(
			`  Etkilesim: ${chalk.bold(bestEng)}  Erisim: ${chalk.bold(bestEntry.reach || "-")}`,
		);
	}
}
