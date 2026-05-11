// `badi gh` — GitHub derin entegrasyon komut ailesi (#11 MVP).
//
// MVP scope: 'badi gh sync' — acik issue'lari .claude/workspace/TaskBoard.md
// dosyasina priority label'lara gore kategorize ederek senkronize eder.
//
// Kategorizasyon:
//   - priority:p1-high   -> ## Bugun
//   - priority:p2-medium -> ## Bu Hafta
//   - priority:p3-large  -> ## Bekleyen Isler
//   - priority:p4-future -> ## Bekleyen Isler
//   - etiket yok         -> ## Bekleyen Isler
//
// Idempotent: zaten TaskBoard'da olan issue numaralari tekrar eklenmez.
// Manuel eklenen "- [ ] (henuz gorev yok)" gibi placeholder'lar issue
// varsa kaldirilir; manuel gorevler korunur.

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
	console.log(chalk.bold("Badi GitHub — Derin Entegrasyon"));
	console.log("");
	console.log(chalk.bold("Kullanim:"));
	console.log(
		`  ${chalk.cyan("badi gh sync")}              Acik issue'lari TaskBoard'a senkronize et`,
	);
	console.log("");
	console.log(chalk.bold("Secenekler:"));
	console.log("  --dry-run        Diski degistirme, plan goster");
	console.log("  --repo owner/N   Belirli repo (varsayilan: git remote)");
	console.log("  --state STATE    open|closed|all (varsayilan: open)");
	console.log("  --limit N        Max issue sayisi (varsayilan: 100)");
	console.log("");
	console.log(chalk.bold("Gereksinimler:"));
	console.log("  gh CLI kurulu ve authenticated olmali");
}

/**
 * Aktif GitHub repo'sunu git remote'undan tahmin eder.
 * gh CLI --repo flag'i bos birakildiginda kendi default'u var; biz
 * sadece raporlama icin tahmin ediyoruz.
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
	// .git suffix opsiyonel, owner/repo'da '.' karakteri yok kabul edilir.
	const m = url.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
	return m ? `${m[1]}/${m[2]}` : null;
}

/**
 * Issue listesi -> gh CLI uzerinden cekilir. JSON dondurur.
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
	// Default maxBuffer 1MB; gh JSON cikti uzun olabilir, genis tutuyoruz.
	const result = spawnSync("gh", args, {
		encoding: "utf-8",
		maxBuffer: 50 * 1024 * 1024,
	});
	if (result.status !== 0) {
		throw new Error(
			`gh CLI hatasi (exit ${result.status}): ${result.stderr || "bilinmeyen hata"}`,
		);
	}
	try {
		return JSON.parse(result.stdout || "[]");
	} catch (e) {
		throw new Error(`gh JSON parse hatasi: ${e.message}`);
	}
}

/**
 * Bir issue icin TaskBoard satirini olusturur:
 *   - [ ] #11 (P3) feat(integration): GitHub derin entegrasyon — github
 *
 * Etiket yoksa "P?" yerine bos string, bolum default Bekleyen Isler.
 */
export function formatIssueLine(issue) {
	const labelNames = (issue.labels || []).map((l) => l.name);
	const priority = labelNames.find((n) => PRIORITY_TO_SECTION[n]);
	const tag = priority ? `(${PRIORITY_SHORT[priority]}) ` : "";
	return `- [ ] #${issue.number} ${tag}${issue.title}`;
}

/**
 * Issue'yu hangi bolume yazacagimizi belirler. Etiket yoksa
 * 'Bekleyen Isler' default'una dusen.
 */
export function sectionForIssue(issue) {
	const labelNames = (issue.labels || []).map((l) => l.name);
	for (const label of labelNames) {
		if (PRIORITY_TO_SECTION[label]) return PRIORITY_TO_SECTION[label];
	}
	return "Bekleyen Isler";
}

/**
 * TaskBoard.md'yi bolumlere ayirir. Donus:
 *   { sections: { 'Bugun': ['- [ ] ...', ...], ... }, order: [...] }
 *
 * 'order' baslik sirasini korur (rewrite icin onemli).
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
		if (header === null) continue; // intro/title lines disrarda kalir
		current.push(line);
	}
	flush();
	return { sections, order };
}

/**
 * Issue'lari TaskBoard.md icerigine merge eder. Idempotent:
 * mevcut '#N' iceren satirlara dokunmaz, yenileri ekler.
 *
 * Donus: { newContent, added: [{number, section}], skipped: [...] }
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
			skipped.push({ number: issue.number, reason: "zaten mevcut" });
			continue;
		}
		const target = sectionForIssue(issue);
		const line = formatIssueLine(issue);
		// Placeholder "(henuz gorev yok)" satirini temizle
		sections[target] = sections[target].filter(
			(l) => !/\(henuz gorev yok\)/.test(l),
		);
		sections[target].push(line);
		added.push({ number: issue.number, section: target });
	}

	// Bos bolumlere placeholder geri koy. Tamamlanan farkli format:
	// checkbox yerine sade "- (henuz yok)" konvansiyonu kullanir.
	for (const s of SECTIONS) {
		const hasItem = sections[s].some((l) => /^\s*-\s+/.test(l));
		if (!hasItem) {
			sections[s] =
				s === "Tamamlanan"
					? ["- (henuz yok)", ""]
					: ["- [ ] (henuz gorev yok)", ""];
		}
	}

	// Yeniden ins et
	const out = ["# Gorev Panosu", ""];
	for (const s of order) {
		out.push(`## ${s}`);
		for (const l of sections[s]) {
			out.push(l);
		}
		// Bolum sonu bos satir garantisi
		if (out[out.length - 1] !== "") out.push("");
	}

	return { newContent: `${out.join("\n").trimEnd()}\n`, added, skipped };
}

function subSync(flags) {
	const cwd = process.cwd();
	const taskBoardPath = join(cwd, ".claude", "workspace", "TaskBoard.md");
	if (!existsSync(taskBoardPath)) {
		console.error(chalk.red(`TaskBoard yok: ${taskBoardPath}`));
		console.log(chalk.dim("  Once: badi init"));
		process.exit(1);
	}

	let issues;
	try {
		issues = fetchIssues(flags);
	} catch (e) {
		console.error(chalk.red(e.message));
		process.exit(1);
	}

	const repo = flags.repo || detectRepo(cwd) || "(otomatik tespit basarisiz)";
	showBanner();
	console.log(chalk.bold(`GitHub Issue Senkronizasyonu — ${repo}`));
	if (flags.dryRun) {
		console.log(
			chalk.yellow("  [dry-run] Plan moduunda — disk degistirilmeyecek."),
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
			chalk.dim(`  ${issues.length} issue cekildi, hepsi zaten mevcut.`),
		);
		console.log("");
		console.log(chalk.green("  Hicbir degisiklik gerekmedi."));
		return;
	}

	for (const a of added) {
		console.log(`  ${chalk.green("+")} #${a.number} -> ${a.section}`);
	}
	console.log("");
	console.log(`  Yeni:           ${chalk.bold(added.length)}`);
	console.log(`  Zaten mevcut:   ${chalk.dim(skipped.length)}`);

	if (flags.dryRun) {
		console.log("");
		console.log(chalk.yellow("  [dry-run] TaskBoard.md degistirilmedi."));
		return;
	}

	writeFileSync(taskBoardPath, newContent);
	console.log("");
	console.log(chalk.green(`  ${taskBoardPath} guncellendi.`));
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
			console.error(chalk.red(`Bilinmeyen alt-komut: ${sub}`));
			showHelp();
			process.exit(1);
	}
}
