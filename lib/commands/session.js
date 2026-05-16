import { chalk, showBanner } from "../cli.js";
import {
	findSession,
	formatDuration,
	parseSessionWithEvents,
	shortSessionId,
} from "../data/transcript-reader.js";

function truncate(s, n = 80) {
	if (!s) return "";
	const flat = s.replace(/\s+/g, " ").trim();
	return flat.length > n ? `${flat.slice(0, n - 1)}…` : flat;
}

function renderHeader(s) {
	console.log(chalk.bold(`Session ${chalk.cyan(shortSessionId(s.sessionId))}`));
	console.log(chalk.dim(`  Tam ID: ${s.sessionId}`));
	console.log(chalk.dim(`  Proje:  ${s.project || "?"}  (${s.cwd || "?"})`));
	console.log(chalk.dim(`  Branch: ${s.gitBranch || "-"}`));
	console.log(
		chalk.dim(
			`  Zaman:  ${(s.firstTs || "?").slice(0, 19)} → ${(s.lastTs || "?").slice(0, 19)} (${formatDuration(s.durationMs)})`,
		),
	);
	console.log(
		chalk.dim(
			`  Model:  ${s.models.filter((m) => m && m !== "<synthetic>").join(", ") || "-"}`,
		),
	);
	console.log(
		chalk.dim(
			`  Token:  in=${s.usage.input.toLocaleString()} out=${s.usage.output.toLocaleString()} cacheR=${s.usage.cacheRead.toLocaleString()} cacheW=${s.usage.cacheCreate.toLocaleString()}`,
		),
	);
	console.log(chalk.dim(`  Cost:   $${s.costUsd.toFixed(2)}`));
	console.log(
		chalk.dim(
			`  Promptlar: ${s.promptCount}  Tool kullanim: ${s.toolUseCount}`,
		),
	);
}

function renderToolBreakdown(s) {
	const rows = Object.entries(s.toolCounts).sort((a, b) => b[1] - a[1]);
	if (rows.length === 0) {
		console.log(chalk.dim("  Tool kullanimi yok."));
		return;
	}
	const maxLabel = Math.max(...rows.map(([k]) => k.length));
	for (const [name, count] of rows.slice(0, 15)) {
		console.log(`  ${name.padEnd(maxLabel)}  ${chalk.yellow(count)}`);
	}
	if (rows.length > 15)
		console.log(chalk.dim(`  ... ${rows.length - 15} tool daha`));
}

function renderFilesTouched(s) {
	if (s.filesTouched.length === 0) {
		console.log(chalk.dim("  Dosya islemi yok."));
		return;
	}
	const list = s.filesTouched.slice(0, 20);
	for (const f of list) {
		console.log(`  ${chalk.dim(f)}`);
	}
	if (s.filesTouched.length > 20)
		console.log(chalk.dim(`  ... ${s.filesTouched.length - 20} dosya daha`));
}

function renderTimeline(events, limit) {
	if (events.length === 0) {
		console.log(chalk.dim("  Timeline bos."));
		return;
	}
	const slice = events.slice(0, limit);
	for (const e of slice) {
		const ts = (e.ts || "?").slice(11, 19);
		if (e.kind === "prompt") {
			console.log(
				`  ${chalk.dim(ts)} ${chalk.green("►")} ${truncate(e.text, 100)}`,
			);
		} else if (e.kind === "tool") {
			const fp = e.input?.file_path || e.input?.path || e.input?.command || "";
			console.log(
				`  ${chalk.dim(ts)} ${chalk.yellow("⚙")} ${chalk.cyan(e.name)}${fp ? ` ${chalk.dim(truncate(String(fp), 60))}` : ""}`,
			);
		} else if (e.kind === "thinking") {
			console.log(
				`  ${chalk.dim(ts)} ${chalk.magenta("∿")} ${chalk.dim("thinking")}`,
			);
		}
	}
	if (events.length > limit)
		console.log(
			chalk.dim(
				`  ... ${events.length - limit} event daha (--full ile tum timeline)`,
			),
		);
}

export function runSession(args) {
	if (!args[0] || args[0] === "--help" || args[0] === "-h") {
		console.log(chalk.bold("Session Detay:"));
		console.log("");
		console.log(
			`  badi session <id>           ${chalk.dim("Tek session ozet + timeline (ilk 30 event)")}`,
		);
		console.log(`  badi session <id> --full    ${chalk.dim("Tam timeline")}`);
		console.log(
			`  badi session <id> --tools   ${chalk.dim("Sadece tool dagilimi")}`,
		);
		console.log(
			`  badi session <id> --files   ${chalk.dim("Sadece dokunulan dosyalar")}`,
		);
		console.log("");
		console.log(chalk.dim("  ID kismi prefix de olabilir (orn. c026ac75)"));
		return;
	}

	const idOrPrefix = args[0];
	const opts = {
		full: args.includes("--full"),
		toolsOnly: args.includes("--tools"),
		filesOnly: args.includes("--files"),
	};

	let entry;
	try {
		entry = findSession(idOrPrefix);
	} catch (e) {
		if (e.code === "AMBIGUOUS") {
			console.error(chalk.red(e.message));
			process.exit(1);
		}
		throw e;
	}
	if (!entry) {
		console.error(chalk.red(`Session bulunamadi: ${idOrPrefix}`));
		console.log(chalk.dim("Mevcut session'lari listele: badi stats --session"));
		process.exit(1);
	}

	const s = parseSessionWithEvents(entry.path);
	if (!s) {
		console.error(chalk.red(`Session okunamadi: ${entry.path}`));
		process.exit(1);
	}

	showBanner();
	renderHeader(s);
	console.log("");

	if (opts.toolsOnly) {
		console.log(chalk.bold("Tool Dagilimi:"));
		renderToolBreakdown(s);
		return;
	}
	if (opts.filesOnly) {
		console.log(chalk.bold("Dokunulan Dosyalar:"));
		renderFilesTouched(s);
		return;
	}

	console.log(chalk.bold("Tool Dagilimi:"));
	renderToolBreakdown(s);
	console.log("");
	console.log(chalk.bold("Dokunulan Dosyalar:"));
	renderFilesTouched(s);
	console.log("");
	console.log(chalk.bold("Timeline:"));
	renderTimeline(s.events, opts.full ? s.events.length : 30);
}
