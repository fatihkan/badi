import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chalk, showBanner } from "../cli.js";
import {
	applyFilters,
	formatDuration,
	listTranscriptFiles,
	parseSession,
	shortSessionId,
} from "../data/transcript-reader.js";

export function parseUsageLog(cwd) {
	const logFile = join(cwd || process.cwd(), ".claude", "logs", "usage.jsonl");
	if (!existsSync(logFile)) return [];
	const lines = readFileSync(logFile, "utf-8").split("\n").filter(Boolean);
	const entries = [];
	for (const line of lines) {
		try {
			entries.push(JSON.parse(line));
		} catch {
			// Skip corrupt line
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
		console.log(chalk.dim("  No data yet"));
		return;
	}

	const today = new Date();

	// Current streak: count back from today until a gap
	let currentStreak = 0;
	for (let i = 0; i < 365; i++) {
		const d = new Date(today);
		d.setDate(d.getDate() - i);
		const key = d.toISOString().substring(0, 10);
		if (dailyCounts[key]) currentStreak++;
		else break;
	}

	// Longest streak: scan all history
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

	// Active days this week
	const weekStart = new Date(today);
	weekStart.setDate(weekStart.getDate() - weekStart.getDay());
	let weekActive = 0;
	for (let i = 0; i < 7; i++) {
		const d = new Date(weekStart);
		d.setDate(d.getDate() + i);
		const key = d.toISOString().substring(0, 10);
		if (dailyCounts[key]) weekActive++;
	}

	console.log(`  Current streak: ${chalk.bold.green(currentStreak)} days`);
	console.log(`  Longest streak: ${chalk.bold(longestStreak)} days`);
	console.log(`  This week:      ${chalk.bold(weekActive)}/7 days active`);
}

// v1.29+ Claude Code transcript-based session statistics.
// The existing "tool usage from .claude/logs/usage.jsonl" flow is preserved;
// new flags (--session, --models, --cost, --since, --until, --branch) read
// ~/.claude/projects/*.jsonl transcripts.
function loadFilteredSessions(opts) {
	const files = listTranscriptFiles();
	const sessions = [];
	for (const f of files) {
		const s = parseSession(f.path);
		if (!s) continue;
		s.mtimeMs = f.mtimeMs;
		s.projectSlug = f.projectSlug;
		sessions.push(s);
	}
	return applyFilters(sessions, opts);
}

function renderSessionList(sessions, limit) {
	const sorted = sessions
		.slice()
		.sort(
			(a, b) =>
				new Date(b.lastTs || 0).getTime() - new Date(a.lastTs || 0).getTime(),
		)
		.slice(0, limit);
	if (sorted.length === 0) {
		console.log(chalk.dim("  No sessions match the filter."));
		return;
	}
	const header = [
		"ID",
		"Project",
		"Branch",
		"Model",
		"Duration",
		"Prompts",
		"Tools",
		"Cost",
	];
	console.log(
		"  " +
			chalk.dim(
				`${header[0].padEnd(9)} ${header[1].padEnd(20)} ${header[2].padEnd(12)} ${header[3].padEnd(10)} ${header[4].padEnd(8)} ${header[5].padEnd(7)} ${header[6].padEnd(6)} ${header[7]}`,
			),
	);
	for (const s of sorted) {
		const id = shortSessionId(s.sessionId);
		const proj = (s.project || "?").slice(0, 19).padEnd(20);
		const br = (s.gitBranch || "-").slice(0, 11).padEnd(12);
		const modelClass = modelClassFor(s.models);
		const dur = formatDuration(s.durationMs).padEnd(8);
		const cost = `$${s.costUsd.toFixed(2)}`;
		console.log(
			`  ${chalk.cyan(id.padEnd(9))} ${proj} ${chalk.dim(br)} ${chalk.yellow(modelClass.padEnd(10))} ${dur} ${String(s.promptCount).padEnd(7)} ${String(s.toolUseCount).padEnd(6)} ${chalk.green(cost)}`,
		);
	}
}

function modelClassFor(models) {
	if (!Array.isArray(models) || models.length === 0) return "-";
	const real = models.filter((m) => m && m !== "<synthetic>");
	if (real.length === 0) return "synth";
	const first = real[0];
	if (first.includes("fable") || first.includes("mythos")) return "fable";
	if (first.includes("opus")) return "opus";
	if (first.includes("sonnet")) return "sonnet";
	if (first.includes("haiku")) return "haiku";
	return first.slice(0, 10);
}

function renderModelStats(sessions) {
	const byModel = {};
	let totalCacheRead = 0;
	let totalCacheCreate = 0;
	let totalInput = 0;
	for (const s of sessions) {
		totalInput += s.usage.input;
		totalCacheRead += s.usage.cacheRead;
		totalCacheCreate += s.usage.cacheCreate;
		for (const m of s.models) {
			if (m === "<synthetic>") continue;
			byModel[m] = byModel[m] || { sessions: 0, cost: 0 };
			byModel[m].sessions += 1;
			byModel[m].cost += s.costUsd / Math.max(1, s.models.length);
		}
	}
	const rows = Object.entries(byModel).sort(
		(a, b) => b[1].sessions - a[1].sessions,
	);
	if (rows.length === 0) {
		console.log(chalk.dim("  No model data."));
		return;
	}
	const maxLabel = Math.max(...rows.map(([k]) => k.length));
	for (const [m, v] of rows) {
		console.log(
			`  ${m.padEnd(maxLabel)}  ${chalk.yellow(String(v.sessions).padStart(4))} session  ${chalk.green(`$${v.cost.toFixed(2)}`)}`,
		);
	}
	const totalReadable = totalCacheRead + totalCacheCreate + totalInput;
	const hitRate =
		totalReadable > 0 ? (totalCacheRead / totalReadable) * 100 : 0;
	console.log("");
	console.log(
		`  ${chalk.bold("Cache hit rate")}: ${chalk.cyan(`${hitRate.toFixed(1)}%`)}  ${chalk.dim(`(${totalCacheRead.toLocaleString()} read / ${totalReadable.toLocaleString()} total)`)}`,
	);
}

function renderCostBreakdown(sessions) {
	let total = 0;
	const byProj = {};
	const byBranch = {};
	for (const s of sessions) {
		total += s.costUsd;
		const p = s.project || "?";
		byProj[p] = (byProj[p] || 0) + s.costUsd;
		const b = s.gitBranch || "-";
		byBranch[b] = (byBranch[b] || 0) + s.costUsd;
	}
	console.log(
		`  ${chalk.bold("Total")}: ${chalk.green(`$${total.toFixed(2)}`)}  ${chalk.dim(`(${sessions.length} session)`)}`,
	);
	console.log("");
	console.log(chalk.bold("  By project:"));
	const projs = Object.entries(byProj)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10);
	const maxLabel = projs.length ? Math.max(...projs.map(([k]) => k.length)) : 0;
	for (const [p, c] of projs) {
		console.log(
			`    ${p.padEnd(maxLabel)}  ${chalk.green(`$${c.toFixed(2)}`)}`,
		);
	}
}

export function runStats(args) {
	let period = "week";
	let commandFilter = null;
	let showHabits = false;
	let exportFormat = null;
	let showHelp = false;
	let showSession = false;
	let showModels = false;
	let showCost = false;
	let since = null;
	let until = null;
	let branchFilter = null;
	let limit = 20;

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
			case "--session":
			case "--sessions":
				showSession = true;
				break;
			case "--models":
				showModels = true;
				break;
			case "--cost":
				showCost = true;
				break;
			case "--since":
				since = args[++i];
				break;
			case "--until":
				until = args[++i];
				break;
			case "--branch":
				branchFilter = args[++i];
				break;
			case "--limit":
				limit = Math.max(1, parseInt(args[++i], 10) || 20);
				break;
			case "--help":
			case "-h":
				showHelp = true;
				break;
		}
	}

	if (showHelp) {
		console.log(chalk.bold("Usage Statistics:"));
		console.log("");
		console.log(
			`  badi stats              ${chalk.dim("Weekly summary (default)")}`,
		);
		console.log(
			`  badi stats --week       ${chalk.dim("Weekly summary (explicit)")}`,
		);
		console.log(`  badi stats --month      ${chalk.dim("Monthly summary")}`);
		console.log(`  badi stats --all        ${chalk.dim("All time")}`);
		console.log(`  badi stats --command X  ${chalk.dim("Filter by tool")}`);
		console.log(
			`  badi stats --habits     ${chalk.dim("Habit streak analysis")}`,
		);
		console.log(`  badi stats --export csv ${chalk.dim("Export as CSV")}`);
		console.log("");
		console.log(chalk.bold("  Claude Code transcript analysis (v1.29+):"));
		console.log(
			`  badi stats --session    ${chalk.dim("List last N sessions (count via --limit)")}`,
		);
		console.log(
			`  badi stats --models     ${chalk.dim("Model distribution + cache hit rate")}`,
		);
		console.log(
			`  badi stats --cost       ${chalk.dim("Token-based USD cost (project breakdown)")}`,
		);
		console.log(
			`  badi stats --since DATE ${chalk.dim("Date range start (ISO or YYYY-MM-DD)")}`,
		);
		console.log(`  badi stats --until DATE ${chalk.dim("Date range end")}`);
		console.log(
			`  badi stats --branch X   ${chalk.dim("Git branch filter (for transcript modes)")}`,
		);
		console.log(
			`  badi stats --limit N    ${chalk.dim("Row count for --session (default 20)")}`,
		);
		return;
	}

	// New transcript-based flow (--session/--models/--cost)
	if (showSession || showModels || showCost) {
		const sessions = loadFilteredSessions({
			since,
			until,
			branch: branchFilter,
		});
		showBanner();
		console.log(chalk.bold("Claude Code Session Analytics"));
		const filterParts = [];
		if (since) filterParts.push(`since=${since}`);
		if (until) filterParts.push(`until=${until}`);
		if (branchFilter) filterParts.push(`branch=${branchFilter}`);
		if (filterParts.length)
			console.log(chalk.dim(`Filter: ${filterParts.join(" ")}`));
		console.log(chalk.dim(`Found: ${sessions.length} sessions`));
		console.log("");

		if (showSession) {
			console.log(chalk.bold(`Last ${limit} Sessions:`));
			renderSessionList(sessions, limit);
			console.log("");
		}
		if (showModels) {
			console.log(chalk.bold("Model Distribution:"));
			renderModelStats(sessions);
			console.log("");
		}
		if (showCost) {
			console.log(chalk.bold("Cost Summary:"));
			renderCostBreakdown(sessions);
			console.log("");
		}
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
		console.log(chalk.yellow("No usage data yet."));
		console.log(chalk.dim("Data is collected automatically as you use Badi."));
		return;
	}

	const periodLabels = {
		week: "Last 7 days",
		month: "Last 30 days",
		all: "All time",
	};
	const stats = buildStats(entries);

	showBanner();
	console.log(chalk.bold("Usage Statistics"));
	console.log(`Period: ${chalk.cyan(periodLabels[period])}`);
	if (commandFilter) console.log(`Filter: ${chalk.cyan(commandFilter)}`);
	console.log("");

	if (showHabits) {
		console.log(chalk.bold("Habit Streak:"));
		renderHabitStreaks(stats.dailyCounts);
		console.log("");
		return;
	}

	console.log(chalk.bold("Most Used Tools:"));
	renderBarChart(stats.toolCounts);
	console.log("");

	console.log(chalk.bold("Daily Activity:"));
	renderDailyTrend(stats.dailyCounts);
	console.log("");

	if (Object.keys(stats.commandCounts).length > 0) {
		console.log(chalk.bold("Badi Commands:"));
		renderBarChart(stats.commandCounts);
		console.log("");
	}

	const totalTools = entries.length;
	const totalBadi = entries.filter((e) => e.command === "badi").length;
	console.log(
		chalk.dim(`Total: ${totalTools} tool uses, ${totalBadi} badi commands`),
	);
}
