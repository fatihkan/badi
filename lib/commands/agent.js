import {
	existsSync,
	mkdirSync,
	readFileSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { chalk, PKG_ROOT, showBanner } from "../cli.js";
import {
	findInstalled,
	pickScheduler,
	SCHEDULERS,
} from "../schedulers/index.js";
import {
	listWatcherFiles,
	loadWatcher,
	parseEvery,
	runWatcher,
	summarizeRecent,
} from "../watchers/index.js";

const TEMPLATE_DIR = join(PKG_ROOT, ".claude", "watchers");
const LOG_DIR = join(homedir(), ".config", "badi", "watcher-logs");

function watchersDir(cwd) {
	return join(cwd, ".claude", "watchers");
}

function watcherPath(cwd, name) {
	return join(watchersDir(cwd), `${name}.md`);
}

async function ask(message) {
	if (!process.stdin.isTTY) return "";
	return new Promise((resolvePromise) => {
		const rl = createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		rl.question(message, (a) => {
			rl.close();
			resolvePromise(a.trim());
		});
	});
}

// ─── create ───

const TEMPLATES = {
	"project-health": "project-health.md",
	"deploy-watchdog": "deploy-watchdog.md",
};

async function subCreate(args, cwd) {
	const name = args[0];
	let template = null;
	for (let i = 1; i < args.length; i++) {
		if (args[i] === "--template") template = args[++i];
	}
	if (!name) {
		console.error(
			chalk.red("Kullanim: badi agent create <isim> [--template <isim>]"),
		);
		process.exit(1);
	}
	if (!/^[a-z0-9][a-z0-9-]{1,63}$/i.test(name)) {
		console.error(chalk.red(`Gecersiz isim: ${name} (harf/rakam/tire, 2-64)`));
		process.exit(1);
	}
	const dest = watcherPath(cwd, name);
	if (existsSync(dest)) {
		console.error(chalk.red(`Zaten var: ${dest}`));
		process.exit(1);
	}

	let content;
	if (template) {
		const tpl = TEMPLATES[template];
		if (!tpl) {
			console.error(
				chalk.red(
					`Bilinmeyen template: ${template} (mevcut: ${Object.keys(TEMPLATES).join(", ")})`,
				),
			);
			process.exit(1);
		}
		content = readFileSync(join(TEMPLATE_DIR, tpl), "utf-8").replace(
			/^name: .*/m,
			`name: ${name}`,
		);
	} else {
		// minimal interactive boilerplate
		const desc = await ask("Aciklama (bos = atla): ");
		const every = (await ask("Calistirma araligi [15m]: ")) || "15m";
		content = `---
name: ${name}
description: ${desc}
active: true
every: ${every}
watch:
  - type: shell
    command: echo "hello from ${name}"
    alert_on: exit-nonzero
report_to: .claude/workspace/watcher-reports/${name}.md
---

## Notlar
${desc || `"${name}" takipcisi. Watch tiplerini duzenleyerek genislet.`}
`;
	}

	mkdirSync(watchersDir(cwd), { recursive: true });
	writeFileSync(dest, content);
	console.log(chalk.green(`+ ${dest}`));
	console.log(
		chalk.dim(
			"  badi agent run " +
				name +
				"      # manual calistir\n  badi agent install " +
				name +
				"  # scheduler'a kayit et",
		),
	);
}

// ─── list ───

function subList(cwd) {
	const files = listWatcherFiles(cwd);
	if (!files.length) {
		console.log(
			chalk.dim(
				"Henuz watcher yok. Ornek: badi agent create proje-saglik --template project-health",
			),
		);
		return;
	}
	console.log(chalk.bold("Watcher'lar:"));
	for (const f of files) {
		try {
			const w = loadWatcher(f);
			const installed = findInstalled(w.name);
			const marker = installed.length
				? chalk.green(`[${installed.map((s) => s.id).join(",")}]`)
				: chalk.dim("[install edilmemis]");
			const active = w.active ? "" : chalk.dim(" (pasif)");
			console.log(
				`  ${w.name.padEnd(24)} ${marker} ${w.every.padEnd(6)} ${w.watches.length} watch${active}`,
			);
		} catch (e) {
			console.log(
				`  ${chalk.red(basename(f, ".md"))}  ${chalk.dim(`(bozuk: ${e.message})`)}`,
			);
		}
	}
}

// ─── run ───

async function subRun(args, cwd) {
	const name = args[0];
	if (!name) {
		console.error(chalk.red("Kullanim: badi agent run <isim>"));
		process.exit(1);
	}
	const file = watcherPath(cwd, name);
	if (!existsSync(file)) {
		console.error(chalk.red(`Watcher yok: ${file}`));
		process.exit(1);
	}
	const { watcher, results, overall } = await runWatcher(file, { cwd });
	const icon =
		overall === "ok"
			? chalk.green("OK")
			: overall === "skipped"
				? chalk.dim("--")
				: chalk.red("!!");
	console.log(`${icon}  ${watcher.name}: ${results.length} kontrol`);
	for (const r of results) {
		const tag = r.pass ? chalk.green("ok") : chalk.red("fail");
		console.log(`  [${tag}] ${r.check.type}: ${r.message}`);
		if (r.details?.length) {
			for (const d of r.details) console.log(chalk.dim(`     - ${d}`));
		}
	}
	const reportPath = resolve(cwd, watcher.reportTo);
	console.log(chalk.dim(`  rapor: ${reportPath}`));
	process.exit(overall === "alert" ? 2 : 0);
}

// ─── install / uninstall ───

function subInstall(args, cwd) {
	const name = args[0];
	let preferred = null;
	let dryRun = false;
	for (let i = 1; i < args.length; i++) {
		if (args[i] === "--scheduler") preferred = args[++i];
		else if (args[i] === "--dry-run") dryRun = true;
	}
	if (!name) {
		console.error(
			chalk.red(
				"Kullanim: badi agent install <isim> [--scheduler id] [--dry-run]",
			),
		);
		process.exit(1);
	}
	const file = watcherPath(cwd, name);
	const w = loadWatcher(file);
	const intervalSeconds = parseEvery(w.every) || 900;

	// Onay iste: shell watcher varsa acikca uyar
	const hasShell = w.watches.some((c) => c.type === "shell");
	if (hasShell && process.stdin.isTTY && !dryRun) {
		console.log(
			chalk.yellow(
				`Dikkat: '${name}' rastgele shell komutu calistiracak. Zamanlayiciya kayit edilsin mi?`,
			),
		);
	}

	const scheduler = pickScheduler(preferred);
	const installResult = scheduler.install(
		{
			name: w.name,
			cmd: process.execPath, // node binary
			args: [resolve(PKG_ROOT, "bin", "badi.js"), "agent", "run", w.name],
			cwd,
			intervalSeconds,
			logDir: LOG_DIR,
		},
		{ dryRun },
	);

	if (dryRun) {
		console.log(chalk.bold("DRY-RUN — diske yazilmadi."));
		console.log(chalk.dim(`  Scheduler: ${scheduler.id}`));
		console.log(chalk.dim(`  Plan: ${JSON.stringify(installResult.plan)}`));
		const c = installResult.content;
		if (typeof c === "string") {
			console.log(chalk.dim(`  --- content ---\n${c.trim()}`));
		} else if (c && typeof c === "object") {
			for (const k of Object.keys(c)) {
				console.log(chalk.dim(`  --- ${k} ---\n${String(c[k]).trim()}`));
			}
		}
		return;
	}
	console.log(chalk.green(`+ ${scheduler.id} ile kayit edildi`));
	console.log(
		chalk.dim(`  Her ${w.every} bir calisacak (${intervalSeconds}s)`),
	);
}

function subUninstall(args, cwd) {
	const name = args[0];
	if (!name) {
		console.error(chalk.red("Kullanim: badi agent uninstall <isim>"));
		process.exit(1);
	}
	const installed = findInstalled(name);
	if (!installed.length) {
		console.log(chalk.dim(`${name}: kurulu scheduler yok`));
		return;
	}
	for (const s of installed) {
		const r = s.uninstall({ name });
		if (r.existed) {
			console.log(chalk.green(`- ${s.id}: temizlendi`));
		}
	}
	// cwd param used for symmetry with other subcommands; scheduler adapters
	// write to home dir, so cwd isn't needed for uninstall itself.
	void cwd;
}

// ─── tail ───

function subTail(args, cwd) {
	const name = args[0];
	let n = 20;
	for (let i = 1; i < args.length; i++) {
		if (args[i] === "-n") n = Number.parseInt(args[++i], 10) || 20;
	}
	if (!name) {
		console.error(chalk.red("Kullanim: badi agent tail <isim> [-n N]"));
		process.exit(1);
	}
	const w = loadWatcher(watcherPath(cwd, name));
	const p = resolve(cwd, w.reportTo);
	if (!existsSync(p)) {
		console.log(chalk.dim(`Rapor yok: ${p}`));
		return;
	}
	const lines = readFileSync(p, "utf-8").split("\n");
	const tail = lines.slice(-n).join("\n");
	console.log(tail);
}

// ─── status ───

function subStatus(args, cwd) {
	let sinceMs = 24 * 3600 * 1000;
	let format = "text";
	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--since") {
			const raw = args[++i] || "24h";
			const m = raw.match(/^(\d+)(h|m|d)$/);
			if (m) {
				const n = Number.parseInt(m[1], 10);
				sinceMs =
					m[2] === "d"
						? n * 86400_000
						: m[2] === "h"
							? n * 3_600_000
							: n * 60_000;
			}
		} else if (args[i] === "--format") {
			format = args[++i];
		}
	}
	const summary = summarizeRecent(cwd, sinceMs);
	if (format === "json") {
		console.log(JSON.stringify(summary, null, 2));
		return;
	}
	if (!summary.length) {
		console.log(chalk.dim("Kayitli watcher yok."));
		return;
	}
	console.log(chalk.bold(`Son ${Math.round(sinceMs / 3_600_000)}h icinde:`));
	for (const s of summary) {
		const label =
			s.alerts > 0 ? chalk.red(`!! ${s.alerts} uyari`) : chalk.green("OK");
		console.log(`  ${s.name.padEnd(24)} ${label}  (toplam ${s.total} rapor)`);
		if (s.alerts > 0) {
			for (const e of s.alertEntries.slice(-3)) {
				console.log(chalk.dim(`    ${e.timestamp}:`));
				for (const line of e.lines) {
					console.log(chalk.dim(`      ${line}`));
				}
			}
		}
	}
	const anyAlert = summary.some((s) => s.alerts > 0);
	process.exit(anyAlert ? 2 : 0);
}

// ─── remove ───

function subRemove(args, cwd) {
	const name = args[0];
	if (!name) {
		console.error(chalk.red("Kullanim: badi agent remove <isim>"));
		process.exit(1);
	}
	// first uninstall any scheduler
	subUninstall([name], cwd);
	const p = watcherPath(cwd, name);
	if (existsSync(p)) {
		unlinkSync(p);
		console.log(chalk.green(`- ${p} silindi`));
	} else {
		console.log(chalk.dim(`${p} zaten yok`));
	}
}

// ─── help ───

function showAgentHelp() {
	console.log(chalk.bold("badi agent — arka plan watcher yonetimi"));
	console.log("");
	console.log("Komutlar:");
	console.log("  create <isim> [--template project-health|deploy-watchdog]");
	console.log("  list");
	console.log("  run <isim>                       # manual calistir (test)");
	console.log("  install <isim> [--scheduler id] [--dry-run]");
	console.log("  uninstall <isim>");
	console.log("  tail <isim> [-n N]");
	console.log("  status [--since 24h|7d] [--format text|json]");
	console.log(
		"  remove <isim>                    # watcher.md + scheduler'i sil",
	);
	console.log("");
	console.log("Desteklenen scheduler'lar:");
	for (const s of SCHEDULERS) {
		const avail = s.isAvailable()
			? chalk.green("[available]")
			: chalk.dim("[yok]");
		console.log(`  ${s.id.padEnd(10)} ${s.platform.padEnd(7)} ${avail}`);
	}
}

// ─── dispatch ───

export async function runAgent(args) {
	const cwd = process.cwd();
	const sub = args[0];
	const rest = args.slice(1);
	if (!sub || sub === "--help" || sub === "-h") {
		showBanner();
		showAgentHelp();
		return;
	}
	switch (sub) {
		case "create":
			return subCreate(rest, cwd);
		case "list":
			return subList(cwd);
		case "run":
			return subRun(rest, cwd);
		case "install":
			return subInstall(rest, cwd);
		case "uninstall":
			return subUninstall(rest, cwd);
		case "tail":
			return subTail(rest, cwd);
		case "status":
			return subStatus(rest, cwd);
		case "remove":
			return subRemove(rest, cwd);
		default:
			console.error(chalk.red(`Bilinmeyen alt komut: ${sub}`));
			process.exit(1);
	}
}
