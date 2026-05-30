// `badi gh` — GitHub deep-integration command family (#11 MVP).
//
// MVP scope: 'badi gh sync' — syncs open issues into the
// .claude/workspace/TaskBoard.md file, categorized by priority label.
//
// Categorization:
//   - priority:p1-high   -> ## Bugun
//   - priority:p2-medium -> ## Bu Hafta
//   - priority:p3-large  -> ## Bekleyen Isler
//   - priority:p4-future -> ## Bekleyen Isler
//   - no label           -> ## Bekleyen Isler
//
// Idempotent: issue numbers already on the TaskBoard are not re-added.
// Placeholders like the manually added "- [ ] (henuz gorev yok)" are removed
// when an issue exists; manual tasks are preserved.
//
// NOTE: the TaskBoard section names below (Bugun / Bu Hafta / Bekleyen Isler /
// Tamamlanan), the "# Gorev Panosu" title, and the placeholder strings are a
// data contract shared with the .claude/workspace/TaskBoard.md template and
// the start/sync/wrap-up commands. They are intentionally left untranslated
// here; renaming them is a coordinated workspace change (Phase 4/5).

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chalk, showBanner } from "../cli.js";

const SECTIONS = ["Bugun", "Bu Hafta", "Bekleyen Isler", "Tamamlanan"];
const PRIORITY_TO_SECTION = {
	"priority:p1-high": "Bugun",
	"priority:p2-medium": "Bu Hafta",
	"priority:p3-large": "Bekleyen Isler",
	"priority:p4-future": "Bekleyen Isler",
};
const PRIORITY_SHORT = {
	"priority:p1-high": "P1",
	"priority:p2-medium": "P2",
	"priority:p3-large": "P3",
	"priority:p4-future": "P4",
};

function parseFlags(args) {
	const flags = { dryRun: false, repo: null, state: "open", limit: 100 };
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === "--dry-run") flags.dryRun = true;
		else if (a === "--repo") flags.repo = args[++i];
		else if (a === "--state") flags.state = args[++i];
		else if (a === "--limit") flags.limit = Number.parseInt(args[++i], 10);
	}
	return flags;
}

function showHelp() {
	showBanner();
	console.log(chalk.bold("Badi GitHub — Deep Integration"));
	console.log("");
	console.log(chalk.bold("Usage:"));
	console.log(
		`  ${chalk.cyan("badi gh sync")}              Sync open issues to the TaskBoard`,
	);
	console.log("");
	console.log(chalk.bold("Options:"));
	console.log("  --dry-run        Don't change disk, show the plan");
	console.log("  --repo owner/N   Specific repo (default: git remote)");
	console.log("  --state STATE    open|closed|all (default: open)");
	console.log("  --limit N        Max issue count (default: 100)");
	console.log("");
	console.log(chalk.bold("Requirements:"));
	console.log("  gh CLI must be installed and authenticated");
}

/**
 * Guesses the active GitHub repo from the git remote.
 * The gh CLI has its own default when --repo is left empty; we only
 * guess for reporting purposes.
 */
export function detectRepo(cwd) {
	const result = spawnSync(
		"git",
		["-C", cwd || process.cwd(), "remote", "get-url", "origin"],
		{ encoding: "utf-8" },
	);
	if (result.status !== 0) return null;
	const url = (result.stdout || "").trim();
	// SSH: git@github.com:owner/repo.git  -> owner/repo
	// HTTPS: https://github.com/owner/repo(.git)?  -> owner/repo
	// .git suffix optional, assume no '.' character in owner/repo.
	const m = url.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
	return m ? `${m[1]}/${m[2]}` : null;
}

/**
 * Issue list -> fetched via the gh CLI. Returns JSON.
 */
function fetchIssues(flags) {
	const args = [
		"issue",
		"list",
		"--state",
		flags.state,
		"--limit",
		String(flags.limit),
		"--json",
		"number,title,labels,state",
	];
	if (flags.repo) args.push("--repo", flags.repo);
	// Default maxBuffer 1MB; gh JSON output can be long, so we keep it wide.
	const result = spawnSync("gh", args, {
		encoding: "utf-8",
		maxBuffer: 50 * 1024 * 1024,
	});
	if (result.status !== 0) {
		throw new Error(
			`gh CLI error (exit ${result.status}): ${result.stderr || "unknown error"}`,
		);
	}
	try {
		return JSON.parse(result.stdout || "[]");
	} catch (e) {
		throw new Error(`gh JSON parse error: ${e.message}`);
	}
}

/**
 * Builds a TaskBoard line for an issue:
 *   - [ ] #11 (P3) feat(integration): GitHub deep integration — github
 *
 * If there's no label, "P?" is an empty string and the section defaults
 * to Bekleyen Isler.
 */
export function formatIssueLine(issue) {
	const labelNames = (issue.labels || []).map((l) => l.name);
	const priority = labelNames.find((n) => PRIORITY_TO_SECTION[n]);
	const tag = priority ? `(${PRIORITY_SHORT[priority]}) ` : "";
	return `- [ ] #${issue.number} ${tag}${issue.title}`;
}

/**
 * Decides which section to write the issue into. Falls back to the
 * 'Bekleyen Isler' default when there's no label.
 */
export function sectionForIssue(issue) {
	const labelNames = (issue.labels || []).map((l) => l.name);
	for (const label of labelNames) {
		if (PRIORITY_TO_SECTION[label]) return PRIORITY_TO_SECTION[label];
	}
	return "Bekleyen Isler";
}

/**
 * Splits TaskBoard.md into sections. Returns:
 *   { sections: { 'Bugun': ['- [ ] ...', ...], ... }, order: [...] }
 *
 * 'order' preserves the heading order (important for rewrite).
 */
export function parseTaskBoard(content) {
	const lines = content.replace(/\r\n/g, "\n").split("\n");
	const sections = {};
	const order = [];
	let header = null;
	let current = [];
	const flush = () => {
		if (header !== null) {
			sections[header] = current;
			order.push(header);
		}
	};
	for (const line of lines) {
		const m = line.match(/^## (.+)$/);
		if (m) {
			flush();
			header = m[1].trim();
			current = [];
			continue;
		}
		if (header === null) continue; // intro/title lines stay outside
		current.push(line);
	}
	flush();
	return { sections, order };
}

/**
 * Merges issues into TaskBoard.md content. Idempotent:
 * doesn't touch lines already containing '#N', adds new ones.
 *
 * Returns: { newContent, added: [{number, section}], skipped: [...] }
 */
export function mergeIssuesIntoTaskBoard(content, issues) {
	const { sections, order } = parseTaskBoard(content);
	for (const s of SECTIONS) {
		if (!sections[s]) {
			sections[s] = [];
			if (!order.includes(s)) order.push(s);
		}
	}

	const existingIssueNums = new Set();
	for (const lines of Object.values(sections)) {
		for (const line of lines) {
			const m = line.match(/#(\d+)\b/);
			if (m) existingIssueNums.add(Number.parseInt(m[1], 10));
		}
	}

	const added = [];
	const skipped = [];
	for (const issue of issues) {
		if (existingIssueNums.has(issue.number)) {
			skipped.push({ number: issue.number, reason: "already exists" });
			continue;
		}
		const target = sectionForIssue(issue);
		const line = formatIssueLine(issue);
		// Clear the "(henuz gorev yok)" placeholder line
		sections[target] = sections[target].filter(
			(l) => !/\(henuz gorev yok\)/.test(l),
		);
		sections[target].push(line);
		added.push({ number: issue.number, section: target });
	}

	// Put a placeholder back in empty sections. Tamamlanan uses a different
	// format: a plain "- (henuz yok)" convention instead of a checkbox.
	for (const s of SECTIONS) {
		const hasItem = sections[s].some((l) => /^\s*-\s+/.test(l));
		if (!hasItem) {
			sections[s] =
				s === "Tamamlanan"
					? ["- (henuz yok)", ""]
					: ["- [ ] (henuz gorev yok)", ""];
		}
	}

	// Rebuild
	const out = ["# Gorev Panosu", ""];
	for (const s of order) {
		out.push(`## ${s}`);
		for (const l of sections[s]) {
			out.push(l);
		}
		// Guarantee a blank line at the end of the section
		if (out[out.length - 1] !== "") out.push("");
	}

	return { newContent: `${out.join("\n").trimEnd()}\n`, added, skipped };
}

function subSync(flags) {
	const cwd = process.cwd();
	const taskBoardPath = join(cwd, ".claude", "workspace", "TaskBoard.md");
	if (!existsSync(taskBoardPath)) {
		console.error(chalk.red(`No TaskBoard: ${taskBoardPath}`));
		console.log(chalk.dim("  First: badi init"));
		process.exit(1);
	}

	let issues;
	try {
		issues = fetchIssues(flags);
	} catch (e) {
		console.error(chalk.red(e.message));
		process.exit(1);
	}

	const repo = flags.repo || detectRepo(cwd) || "(auto-detect failed)";
	showBanner();
	console.log(chalk.bold(`GitHub Issue Sync — ${repo}`));
	if (flags.dryRun) {
		console.log(
			chalk.yellow("  [dry-run] Plan mode — disk will not be changed."),
		);
	}
	console.log("");

	const content = readFileSync(taskBoardPath, "utf-8");
	const { newContent, added, skipped } = mergeIssuesIntoTaskBoard(
		content,
		issues,
	);

	if (added.length === 0) {
		console.log(
			chalk.dim(`  ${issues.length} issues fetched, all already present.`),
		);
		console.log("");
		console.log(chalk.green("  No changes needed."));
		return;
	}

	for (const a of added) {
		console.log(`  ${chalk.green("+")} #${a.number} -> ${a.section}`);
	}
	console.log("");
	console.log(`  New:             ${chalk.bold(added.length)}`);
	console.log(`  Already present: ${chalk.dim(skipped.length)}`);

	if (flags.dryRun) {
		console.log("");
		console.log(chalk.yellow("  [dry-run] TaskBoard.md not changed."));
		return;
	}

	writeFileSync(taskBoardPath, newContent);
	console.log("");
	console.log(chalk.green(`  ${taskBoardPath} updated.`));
}

export async function runGh(args) {
	const sub = args[0];
	if (!sub || sub === "--help" || sub === "-h" || sub === "help") {
		showHelp();
		return;
	}
	const flags = parseFlags(args.slice(1));
	switch (sub) {
		case "sync":
			return subSync(flags);
		default:
			console.error(chalk.red(`Unknown subcommand: ${sub}`));
			showHelp();
			process.exit(1);
	}
}
