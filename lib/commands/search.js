import { readFileSync } from "node:fs";
import { chalk, showBanner } from "../cli.js";
import {
	applyFilters,
	formatDuration,
	listTranscriptFiles,
	parseSession,
	shortSessionId,
} from "../data/transcript-reader.js";

// AND-match multi-token search across session prompts + last-prompt + project name.
// Karma'nin "multi-token AND search" semantigi: tum token'lar gecmek zorunda.
function tokenize(q) {
	return q.toLowerCase().split(/\s+/).filter(Boolean);
}

function buildSearchIndex(filePath) {
	let raw;
	try {
		raw = readFileSync(filePath, "utf-8");
	} catch {
		return "";
	}
	const lines = raw.split("\n");
	const parts = [];
	for (const line of lines) {
		if (!line) continue;
		let o;
		try {
			o = JSON.parse(line);
		} catch {
			continue;
		}
		if (o.type === "user" && typeof o.message?.content === "string") {
			parts.push(o.message.content);
		} else if (o.type === "last-prompt" && typeof o.prompt === "string") {
			parts.push(o.prompt);
		}
	}
	return parts.join("\n").toLowerCase();
}

function matchAll(haystack, tokens) {
	for (const t of tokens) {
		if (!haystack.includes(t)) return false;
	}
	return true;
}

function snippet(haystack, tokens, max = 120) {
	for (const t of tokens) {
		const idx = haystack.indexOf(t);
		if (idx >= 0) {
			const start = Math.max(0, idx - 30);
			const end = Math.min(haystack.length, idx + max - 30);
			return (
				(start > 0 ? "..." : "") +
				haystack.slice(start, end).replace(/\s+/g, " ") +
				(end < haystack.length ? "..." : "")
			);
		}
	}
	return haystack.slice(0, max);
}

export function runSearch(args) {
	let query = null;
	let since = null;
	let until = null;
	let branch = null;
	let limit = 20;
	let showHelp = false;

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case "--since":
				since = args[++i];
				break;
			case "--until":
				until = args[++i];
				break;
			case "--branch":
				branch = args[++i];
				break;
			case "--limit":
				limit = Math.max(1, parseInt(args[++i], 10) || 20);
				break;
			case "--help":
			case "-h":
				showHelp = true;
				break;
			default:
				if (!query && !args[i].startsWith("-")) query = args[i];
				else if (query && !args[i].startsWith("-")) query += ` ${args[i]}`;
		}
	}

	if (showHelp || !query) {
		console.log(chalk.bold("Session-level Transcript Arama:"));
		console.log("");
		console.log(
			`  badi search "<query>"           ${chalk.dim('Multi-token AND search (ornek: "secret-scan refactor")')}`,
		);
		console.log(
			`  badi search "<q>" --since DATE  ${chalk.dim("Tarih filtre basi")}`,
		);
		console.log(
			`  badi search "<q>" --until DATE  ${chalk.dim("Tarih filtre sonu")}`,
		);
		console.log(
			`  badi search "<q>" --branch X    ${chalk.dim("Git branch filtre")}`,
		);
		console.log(
			`  badi search "<q>" --limit N     ${chalk.dim("Sonuc sayisi (default 20)")}`,
		);
		return;
	}

	const tokens = tokenize(query);
	const files = listTranscriptFiles();
	const matches = [];
	for (const f of files) {
		const summary = parseSession(f.path);
		if (!summary) continue;
		const filtered = applyFilters([summary], { since, until, branch });
		if (filtered.length === 0) continue;
		const haystack = buildSearchIndex(f.path);
		if (!haystack) continue;
		if (!matchAll(haystack, tokens)) continue;
		matches.push({
			session: filtered[0],
			snippet: snippet(haystack, tokens),
		});
	}

	matches.sort(
		(a, b) =>
			new Date(b.session.lastTs || 0).getTime() -
			new Date(a.session.lastTs || 0).getTime(),
	);

	showBanner();
	console.log(chalk.bold(`Arama: "${query}"`));
	console.log(chalk.dim(`${matches.length} session eslesti`));
	console.log("");

	for (const m of matches.slice(0, limit)) {
		const s = m.session;
		const date = (s.lastTs || "").slice(0, 10);
		console.log(
			`  ${chalk.cyan(shortSessionId(s.sessionId))} ${chalk.dim(date)} ${chalk.yellow((s.project || "?").slice(0, 18).padEnd(18))} ${chalk.dim(s.gitBranch || "-")} ${chalk.dim(formatDuration(s.durationMs))}`,
		);
		console.log(`    ${chalk.dim(m.snippet)}`);
	}
	if (matches.length > limit) {
		console.log(
			chalk.dim(
				`\n  ... ${matches.length - limit} sonuc daha (--limit ile arttir)`,
			),
		);
	}
}
