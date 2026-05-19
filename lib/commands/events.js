import { chalk } from "../cli.js";
import {
	eventsFileSize,
	getEventsPath,
	isEnabled,
	readEvents,
	readEventsTail,
} from "../observability/event-emitter.js";

function parseDateArg(s) {
	if (!s) return null;
	const m = s.match(/^(\d{4}-\d{2}-\d{2})$/);
	if (m) return new Date(`${m[1]}T00:00:00Z`).getTime();
	const t = Date.parse(s);
	return Number.isNaN(t) ? null : t;
}

function formatDuration(ms) {
	if (ms == null) return "-";
	if (ms < 1000) return `${ms}ms`;
	if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
	return `${Math.floor(ms / 60_000)}m${Math.floor((ms % 60_000) / 1000)}s`;
}

function printHelp() {
	console.log(chalk.bold("Badi Self-Telemetry (Events):"));
	console.log("");
	console.log(
		`  badi events list [--limit N]    ${chalk.dim("Son N olay (default 30)")}`,
	);
	console.log(
		`  badi events stats               ${chalk.dim("Komut bazli sayim + ortalama sure")}`,
	);
	console.log(
		`  badi events tail                ${chalk.dim("list --limit 10 kisaltma")}`,
	);
	console.log("");
	console.log(chalk.bold("Filtreler (list/stats):"));
	console.log(`  --since YYYY-MM-DD              Bu tarihten itibaren`);
	console.log(`  --until YYYY-MM-DD              Bu tarihe kadar`);
	console.log(`  --cmd <ad>                      Sadece bu komut`);
	console.log(
		`  --type <event.type>             Sadece bu olay tipi (orn. badi.command.completed)`,
	);
	console.log("");
	console.log(chalk.bold("Diagnostik:"));
	console.log(`  badi events path                Log dosyasi yolu`);
	console.log(`  badi events status              Telemetry on/off + log boyutu`);
	console.log("");
	console.log(
		chalk.dim(
			"Telemetry kapatma: export BADI_TELEMETRY=off  (her cagri no-op)",
		),
	);
	console.log(
		chalk.dim("Tum veri lokal: ~/.claude/projects/<slug>/badi-events.jsonl"),
	);
}

function parseFlags(args) {
	const out = { limit: 30, since: null, until: null, cmd: null, type: null };
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === "--limit") out.limit = Number(args[++i] || 30);
		else if (a === "--since") out.since = parseDateArg(args[++i]);
		else if (a === "--until") out.until = parseDateArg(args[++i]);
		else if (a === "--cmd") out.cmd = args[++i];
		else if (a === "--type") out.type = args[++i];
	}
	return out;
}

function applyFilters(events, flags) {
	let out = events;
	if (flags.since != null) {
		out = out.filter((e) => new Date(e.ts).getTime() >= flags.since);
	}
	if (flags.until != null) {
		out = out.filter((e) => new Date(e.ts).getTime() <= flags.until);
	}
	if (flags.cmd) {
		out = out.filter((e) => e.cmd === flags.cmd);
	}
	if (flags.type) {
		out = out.filter((e) => e.type === flags.type);
	}
	return out;
}

async function cmdList(args, limitOverride) {
	const flags = parseFlags(args);
	if (limitOverride != null) flags.limit = limitOverride;
	// B4 fix: filtre yoksa tail reader kullan (buyuk loglarda O(K) okuma).
	// Filtre varsa tum dosyayi okuyup filtrelemek gerekiyor.
	const hasFilters = !!(flags.since || flags.until || flags.cmd || flags.type);
	const events = hasFilters
		? await readEvents()
		: await readEventsTail(flags.limit);
	if (events.length === 0) {
		console.log(chalk.dim("Olay yok. Komut calistirin, sonra tekrar deneyin."));
		return;
	}
	const filtered = applyFilters(events, flags);
	const shown = filtered.slice(0, flags.limit);
	console.log(
		chalk.bold(
			`Son ${shown.length} olay (toplam ${filtered.length}${filtered.length !== events.length ? `, filtreli ${events.length} olay` : ""}):`,
		),
	);
	console.log("");
	for (const e of shown) {
		const ts = e.ts ? new Date(e.ts).toISOString().slice(0, 19).replace("T", " ") : "?";
		const dur = e.duration_ms != null ? ` ${chalk.dim(formatDuration(e.duration_ms))}` : "";
		const exit =
			e.exit_code != null
				? e.exit_code === 0
					? chalk.green(` exit:${e.exit_code}`)
					: chalk.red(` exit:${e.exit_code}`)
				: "";
		const type = e.type?.replace(/^badi\./, "") || "(unknown)";
		const cmd = e.cmd ? ` ${chalk.cyan(e.cmd)}` : "";
		console.log(`  ${chalk.dim(ts)}  ${type}${cmd}${dur}${exit}`);
	}
}

async function cmdStats(args) {
	const flags = parseFlags(args);
	const events = await readEvents();
	if (events.length === 0) {
		console.log(chalk.dim("Olay yok."));
		return;
	}
	const filtered = applyFilters(events, flags);
	const completedByCmd = new Map();
	for (const e of filtered) {
		if (e.type !== "badi.command.completed") continue;
		const key = e.cmd || "(unknown)";
		const entry = completedByCmd.get(key) || { count: 0, totalMs: 0 };
		entry.count++;
		if (typeof e.duration_ms === "number") entry.totalMs += e.duration_ms;
		completedByCmd.set(key, entry);
	}
	const failedByCmd = new Map();
	for (const e of filtered) {
		if (e.type !== "badi.command.failed") continue;
		const key = e.cmd || "(unknown)";
		failedByCmd.set(key, (failedByCmd.get(key) || 0) + 1);
	}

	console.log(
		chalk.bold(`Badi Self-Telemetry — Komut Istatistikleri (${filtered.length} olay)`),
	);
	console.log("");

	if (completedByCmd.size === 0 && failedByCmd.size === 0) {
		console.log(chalk.dim("Komut olayi yok."));
		return;
	}

	const allCmds = new Set([...completedByCmd.keys(), ...failedByCmd.keys()]);
	const rows = [];
	for (const cmd of allCmds) {
		const c = completedByCmd.get(cmd) || { count: 0, totalMs: 0 };
		const f = failedByCmd.get(cmd) || 0;
		const avg = c.count > 0 ? c.totalMs / c.count : 0;
		rows.push({ cmd, ok: c.count, fail: f, avg });
	}
	rows.sort((a, b) => b.ok + b.fail - (a.ok + a.fail));

	const maxCmd = Math.max(8, ...rows.map((r) => r.cmd.length));
	console.log(
		`  ${chalk.bold("Komut".padEnd(maxCmd))}  ${chalk.bold("OK")}  ${chalk.bold("Fail")}  ${chalk.bold("Avg sure")}`,
	);
	for (const r of rows) {
		const failColor = r.fail > 0 ? chalk.red(String(r.fail).padStart(4)) : chalk.dim("   0");
		console.log(
			`  ${r.cmd.padEnd(maxCmd)}  ${String(r.ok).padStart(3)}  ${failColor}  ${chalk.dim(formatDuration(r.avg))}`,
		);
	}
}

async function cmdPath() {
	const p = getEventsPath();
	console.log(p || chalk.dim("(yol cozulemedi)"));
}

async function cmdStatus() {
	const enabled = isEnabled();
	const size = eventsFileSize();
	const sizeKb = (size / 1024).toFixed(1);
	console.log(
		`Telemetry: ${enabled ? chalk.green("on") : chalk.yellow("off (BADI_TELEMETRY=off)")}`,
	);
	console.log(`Log dosyasi: ${getEventsPath()}`);
	console.log(`Boyut: ${size > 0 ? `${sizeKb} KB` : chalk.dim("(bos veya yok)")}`);
	if (size > 5 * 1024 * 1024) {
		console.log(
			chalk.yellow(
				"Uyari: log dosyasi 5MB ustunde. Kullanici manuel rotate edebilir (mv ...jsonl ...jsonl.1).",
			),
		);
	}
}

export async function runEvents(args = []) {
	const sub = args[0];
	if (!sub || sub === "--help" || sub === "-h") {
		printHelp();
		return;
	}
	switch (sub) {
		case "list":
			return cmdList(args.slice(1), null);
		case "tail":
			return cmdList(args.slice(1), 10);
		case "stats":
			return cmdStats(args.slice(1));
		case "path":
			return cmdPath();
		case "status":
			return cmdStatus();
		default:
			console.error(chalk.red(`Bilinmeyen events komutu: ${sub}`));
			printHelp();
			process.exit(1);
	}
}
