import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chalk, showBanner } from "../cli.js";

export function parseUsageLog(cwd) {
	const logFile = join(cwd || process.cwd(), ".claude", "logs", "usage.jsonl");
	if (!existsSync(logFile)) return [];
	const lines = readFileSync(logFile, "utf-8").split("\n").filter(Boolean);
	const entries = [];
	for (const line of lines) {
		try {
			entries.push(JSON.parse(line));
		} catch {
			// Bozuk satiri atla
		}
	}
	return entries;
}

export function filterByPeriod(entries, period) {
	if (period === "all") return entries;
	const now = Date.now();
	const msMap = { week: 7 * 86400000, month: 30 * 86400000 };
	const cutoff = now - (msMap[period] || msMap.week);
	return entries.filter((e) => new Date(e.timestamp).getTime() >= cutoff);
}

export function buildStats(entries) {
	const toolCounts = {};
	const dailyCounts = {};
	const commandCounts = {};

	for (const e of entries) {
		const tool = e.tool || "unknown";
		toolCounts[tool] = (toolCounts[tool] || 0) + 1;

		const day = (e.timestamp || "").substring(0, 10);
		if (day) dailyCounts[day] = (dailyCounts[day] || 0) + 1;

		if (e.command === "badi" && e.subcommand) {
			commandCounts[e.subcommand] = (commandCounts[e.subcommand] || 0) + 1;
		}
	}

	return { toolCounts, dailyCounts, commandCounts };
}

export function renderBarChart(counts, maxWidth = 30) {
	const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
	if (sorted.length === 0) return;
	const maxVal = sorted[0][1];
	const maxLabel = Math.max(...sorted.map(([k]) => k.length));

	for (const [label, count] of sorted.slice(0, 15)) {
		const barLen = Math.max(1, Math.round((count / maxVal) * maxWidth));
		const bar = chalk.cyan("█".repeat(barLen));
		console.log(`  ${label.padEnd(maxLabel)}  ${bar} ${chalk.dim(count)}`);
	}
}

export function renderDailyTrend(dailyCounts) {
	const days = Object.entries(dailyCounts).sort((a, b) =>
		a[0].localeCompare(b[0]),
	);
	if (days.length === 0) return;
	const maxVal = Math.max(...days.map(([, v]) => v));

	for (const [day, count] of days.slice(-14)) {
		const barLen = Math.max(1, Math.round((count / maxVal) * 20));
		const bar = chalk.green("▓".repeat(barLen));
		console.log(`  ${chalk.dim(day)}  ${bar} ${count}`);
	}
}

export function renderHabitStreaks(dailyCounts) {
	const days = Object.keys(dailyCounts).sort();
	if (days.length === 0) {
		console.log(chalk.dim("  Henuz veri yok"));
		return;
	}

	const today = new Date();

	// Mevcut seri: bugunden geriye, kirilana kadar say
	let currentStreak = 0;
	for (let i = 0; i < 365; i++) {
		const d = new Date(today);
		d.setDate(d.getDate() - i);
		const key = d.toISOString().substring(0, 10);
		if (dailyCounts[key]) currentStreak++;
		else break;
	}

	// En uzun seri: tum gecmisi tara
	let longestStreak = 0;
	let streak = 0;
	for (let i = 0; i < 365; i++) {
		const d = new Date(today);
		d.setDate(d.getDate() - i);
		const key = d.toISOString().substring(0, 10);
		if (dailyCounts[key]) {
			streak++;
			if (streak > longestStreak) longestStreak = streak;
		} else {
			streak = 0;
		}
	}

	// Bu hafta aktif gun
	const weekStart = new Date(today);
	weekStart.setDate(weekStart.getDate() - weekStart.getDay());
	let weekActive = 0;
	for (let i = 0; i < 7; i++) {
		const d = new Date(weekStart);
		d.setDate(d.getDate() + i);
		const key = d.toISOString().substring(0, 10);
		if (dailyCounts[key]) weekActive++;
	}

	console.log(`  Mevcut seri:   ${chalk.bold.green(currentStreak)} gun`);
	console.log(`  En uzun seri:  ${chalk.bold(longestStreak)} gun`);
	console.log(`  Bu hafta:      ${chalk.bold(weekActive)}/7 gun aktif`);
}

export function runStats(args) {
	let period = "week";
	let commandFilter = null;
	let showHabits = false;
	let exportFormat = null;
	let showHelp = false;

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case "--week":
				period = "week";
				break;
			case "--month":
				period = "month";
				break;
			case "--all":
				period = "all";
				break;
			case "--command":
				commandFilter = args[++i];
				break;
			case "--habits":
				showHabits = true;
				break;
			case "--export":
				exportFormat = args[++i];
				break;
			case "--help":
			case "-h":
				showHelp = true;
				break;
		}
	}

	if (showHelp) {
		console.log(chalk.bold("Kullanim Istatistikleri:"));
		console.log("");
		console.log(
			`  badi stats              ${chalk.dim("Haftalik ozet (varsayilan)")}`,
		);
		console.log(
			`  badi stats --week       ${chalk.dim("Haftalik ozet (explicit)")}`,
		);
		console.log(`  badi stats --month      ${chalk.dim("Aylik ozet")}`);
		console.log(`  badi stats --all        ${chalk.dim("Tum zamanlar")}`);
		console.log(`  badi stats --command X  ${chalk.dim("Arac bazli filtre")}`);
		console.log(
			`  badi stats --habits     ${chalk.dim("Aliskanlik serisi analizi")}`,
		);
		console.log(
			`  badi stats --export csv ${chalk.dim("CSV olarak disa aktar")}`,
		);
		return;
	}

	let entries = parseUsageLog();
	entries = filterByPeriod(entries, period);

	if (commandFilter) {
		entries = entries.filter(
			(e) =>
				(e.tool || "").toLowerCase().includes(commandFilter.toLowerCase()) ||
				(e.subcommand || "")
					.toLowerCase()
					.includes(commandFilter.toLowerCase()),
		);
	}

	if (exportFormat === "csv") {
		const csvSafe = (val) => {
			const s = String(val ?? "");
			if (/^[=+\-@\t\r]/.test(s)) return `'${s}`;
			if (s.includes(",") || s.includes('"'))
				return `"${s.replace(/"/g, '""')}"`;
			return s;
		};
		console.log("timestamp,tool,command,subcommand,exit_code");
		for (const e of entries) {
			console.log(
				[e.timestamp, e.tool, e.command, e.subcommand, e.exit_code]
					.map(csvSafe)
					.join(","),
			);
		}
		return;
	}

	if (entries.length === 0) {
		console.log(chalk.yellow("Henuz kullanim verisi yok."));
		console.log(chalk.dim("Badi kullandikca veriler otomatik toplanir."));
		return;
	}

	const periodLabels = {
		week: "Son 7 gun",
		month: "Son 30 gun",
		all: "Tum zamanlar",
	};
	const stats = buildStats(entries);

	showBanner();
	console.log(chalk.bold("Kullanim Istatistikleri"));
	console.log(`Donem: ${chalk.cyan(periodLabels[period])}`);
	if (commandFilter) console.log(`Filtre: ${chalk.cyan(commandFilter)}`);
	console.log("");

	if (showHabits) {
		console.log(chalk.bold("Aliskanlik Serisi:"));
		renderHabitStreaks(stats.dailyCounts);
		console.log("");
		return;
	}

	console.log(chalk.bold("En Cok Kullanilan Araclar:"));
	renderBarChart(stats.toolCounts);
	console.log("");

	console.log(chalk.bold("Gunluk Aktivite:"));
	renderDailyTrend(stats.dailyCounts);
	console.log("");

	if (Object.keys(stats.commandCounts).length > 0) {
		console.log(chalk.bold("Badi Komutlari:"));
		renderBarChart(stats.commandCounts);
		console.log("");
	}

	const totalTools = entries.length;
	const totalBadi = entries.filter((e) => e.command === "badi").length;
	console.log(
		chalk.dim(`Toplam: ${totalTools} arac kullanimi, ${totalBadi} badi komutu`),
	);
}
