import {
	appendFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve as resolvePath } from "node:path";
import {
	listWatcherFiles,
	loadWatcher,
	parseEvery,
	validateWatcher,
} from "./parse.js";
import runFileCheck from "./types/file.js";
import runGitCheck from "./types/git.js";
import runHttpCheck from "./types/http.js";
import runLogCheck from "./types/log.js";
import runShellCheck from "./types/shell.js";

export { listWatcherFiles, loadWatcher, parseEvery, validateWatcher };

// ─── State (offset / mtime / deps snapshot) ───

const STATE_HOME =
	process.env.BADI_STATE_HOME || join(homedir(), ".config", "badi");
const STATE_PATH = join(STATE_HOME, "watcher-state.json");

export function loadState() {
	if (!existsSync(STATE_PATH)) return {};
	try {
		return JSON.parse(readFileSync(STATE_PATH, "utf-8")) || {};
	} catch {
		return {};
	}
}
export function saveState(all) {
	if (!existsSync(STATE_HOME)) mkdirSync(STATE_HOME, { recursive: true });
	writeFileSync(STATE_PATH, JSON.stringify(all, null, 2));
}

// ─── Runner ───

const TYPE_RUNNERS = {
	git: runGitCheck,
	shell: runShellCheck,
	file: runFileCheck,
	log: runLogCheck,
	http: runHttpCheck,
};

/**
 * Run one watcher end-to-end: load state → run all checks → write report →
 * save state. Returns { watcher, results, overall }.
 */
export async function runWatcher(filePath, { cwd = process.cwd() } = {}) {
	const watcher = loadWatcher(filePath);
	if (!watcher.active) {
		return {
			watcher,
			results: [],
			overall: "skipped",
			message: "active: false",
		};
	}

	const allState = loadState();
	const myState = allState[watcher.name] || {};

	const results = [];
	for (const check of watcher.watches) {
		const runner = TYPE_RUNNERS[check.type];
		if (!runner) {
			results.push({
				check,
				pass: false,
				message: `Unknown type: ${check.type}`,
			});
			continue;
		}
		try {
			const r = await runner(check, { cwd, state: myState });
			results.push({ check, ...r });
		} catch (e) {
			results.push({ check, pass: false, message: `Error: ${e.message}` });
		}
	}

	allState[watcher.name] = myState;
	saveState(allState);

	const overall = results.every((r) => r.pass) ? "ok" : "alert";
	writeReport(watcher, results, overall, cwd);

	return { watcher, results, overall };
}

// ─── Report writer ───

function ts() {
	const d = new Date();
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function writeReport(watcher, results, overall, cwd) {
	const path = resolvePath(cwd, watcher.reportTo);
	if (!existsSync(dirname(path))) mkdirSync(dirname(path), { recursive: true });
	const lines = [];
	lines.push(`## ${ts()} — ${overall.toUpperCase()}`);
	for (const r of results) {
		const tag = r.pass ? "OK" : "FAIL";
		lines.push(
			`- [${tag}] ${r.check.type}: ${r.message}${r.check.scope ? ` (${r.check.scope})` : ""}`,
		);
		if (r.details?.length) {
			for (const d of r.details) lines.push(`    - ${d}`);
		}
	}
	lines.push("");

	if (!existsSync(path)) {
		const header = [
			`# Watcher Report: ${watcher.name}`,
			watcher.description ? `> ${watcher.description}` : null,
			"",
			"",
		]
			.filter((x) => x !== null)
			.join("\n");
		writeFileSync(path, header);
	}
	appendFileSync(path, `${lines.join("\n")}\n`);
}

// ─── Summary for /start + badi agent status ───

/**
 * Parse a watcher report file and return entries newer than `sinceMs` ago.
 * Returns [{timestamp, overall, lines: string[]}].
 */
export function readRecentEntries(reportPath, sinceMs) {
	if (!existsSync(reportPath)) return [];
	const content = readFileSync(reportPath, "utf-8");
	const cutoff = Date.now() - sinceMs;
	const entries = [];
	const blocks = content.split(/^## /m).slice(1);
	for (const b of blocks) {
		const m = b.match(
			/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}) — (\w+)\n([\s\S]*?)(?=\n*$)/,
		);
		if (!m) continue;
		const [_, timestamp, overall, body] = m;
		const [datePart, timePart] = timestamp.split(" ");
		const [y, mo, d] = datePart.split("-").map(Number);
		const [h, mi] = timePart.split(":").map(Number);
		const when = new Date(y, mo - 1, d, h, mi).getTime();
		if (when < cutoff) continue;
		entries.push({
			timestamp,
			overall: overall.toLowerCase(),
			lines: body.trim().split("\n"),
		});
	}
	return entries;
}

/** Collect recent-warning summary across all watchers under projectRoot. */
export function summarizeRecent(projectRoot, sinceMs = 24 * 3600 * 1000) {
	const files = listWatcherFiles(projectRoot);
	const summary = [];
	for (const f of files) {
		try {
			const w = loadWatcher(f);
			const reportPath = resolvePath(projectRoot, w.reportTo);
			const entries = readRecentEntries(reportPath, sinceMs);
			const alerts = entries.filter((e) => e.overall === "alert");
			summary.push({
				name: w.name,
				reportPath,
				total: entries.length,
				alerts: alerts.length,
				latest: entries[entries.length - 1] || null,
				alertEntries: alerts,
			});
		} catch {
			// skip bozuk watcher
		}
	}
	return summary;
}

export { STATE_PATH };
