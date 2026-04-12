#!/usr/bin/env node

import {
	existsSync,
	mkdirSync,
	cpSync,
	readdirSync,
	readFileSync,
	writeFileSync,
	rmSync,
	statSync,
	chmodSync,
} from "node:fs";
import { resolve, join, basename, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { homedir } from "node:os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
const PKG_ROOT = resolve(__dirname, "..");
const TEMPLATE_DIR = join(PKG_ROOT, ".claude");
const VERSION = "1.1.0";

// Renkli cikti icin chalk (dinamik import, ESM)
let chalk;
try {
	chalk = (await import("chalk")).default;
} catch {
	// chalk yoksa duzsuz cikti
	chalk = {
		bold: (s) => s,
		green: (s) => s,
		red: (s) => s,
		yellow: (s) => s,
		cyan: (s) => s,
		gray: (s) => s,
		dim: (s) => s,
		magenta: (s) => s,
		blue: (s) => s,
		white: (s) => s,
	};
	chalk.bold.cyan = (s) => s;
	chalk.bold.green = (s) => s;
	chalk.bold.red = (s) => s;
	chalk.bold.yellow = (s) => s;
	chalk.bold.magenta = (s) => s;
}

// ASCII banner
let figlet;
try {
	figlet = (await import("figlet")).default;
} catch {
	figlet = null;
}

function showBanner() {
	if (figlet) {
		try {
			console.log(chalk.cyan(figlet.textSync("Badi", { horizontalLayout: "default" })));
		} catch {
			console.log(chalk.bold.cyan("\n  B A D I\n"));
		}
	} else {
		console.log(chalk.bold.cyan("\n  B A D I\n"));
	}
	console.log(chalk.dim("  Claude Code Is Akisi Yonetim Sistemi v" + VERSION));
	console.log("");
}

function showHelp() {
	showBanner();
	console.log(chalk.bold("Kullanim:"));
	console.log("  badi <komut> [secenekler]");
	console.log("");
	console.log(chalk.bold("Komutlar:"));
	console.log(`  ${chalk.cyan("init")}      Projeyi Badi ile yapilandir`);
	console.log(`  ${chalk.cyan("update")}    Mevcut konfigurasyonu guncelle (ozellestirmeleri korur)`);
	console.log(`  ${chalk.cyan("doctor")}    Badi kurulumunu dogrula`);
	console.log(`  ${chalk.cyan("list")}      Mevcut bilesenleri listele`);
	console.log(`  ${chalk.cyan("plugin")}    Plugin yonetimi (install/remove/list)`);
	console.log(`  ${chalk.cyan("icerik")}    Hizli icerik sablonu olustur (post/karousel/video/gorsel/takvim/marka)`);
	console.log(`  ${chalk.cyan("stats")}     Kullanim istatistikleri ve analitik`);
	console.log(`  ${chalk.cyan("completion")} Kabuk tamamlama scripti olustur (bash/zsh/fish)`);
	console.log("");
	console.log(chalk.bold("Init Secenekleri:"));
	console.log("  --target <yol>   Hedef dizin (varsayilan: mevcut dizin)");
	console.log("  --force          Mevcut dosyalarin ustune yaz");
	console.log("  --dry-run        Degisiklikleri uygulamadan goster");
	console.log("");
	console.log(chalk.bold("List Secenekleri:"));
	console.log("  --agents         Sadece ajanlari listele");
	console.log("  --commands       Sadece komutlari listele");
	console.log("  --hooks          Sadece hook'lari listele");
	console.log("  --skills         Sadece skill kategorilerini listele");
	console.log("");
	console.log(chalk.bold("Plugin Secenekleri:"));
	console.log("  badi plugin install <kaynak>   Plugin yukle (git URL veya npm paketi)");
	console.log("  badi plugin remove <isim>      Plugin kaldir");
	console.log("  badi plugin list               Yuklu plugin'leri listele");
	console.log("");
	console.log(chalk.bold("Icerik Alt Komutlari:"));
	console.log("  badi icerik post [konu]        Sosyal medya post sablonu olustur");
	console.log("  badi icerik karousel [konu]    Karousel (coklu kare) sablonu olustur");
	console.log("  badi icerik video [konu]       Video senaryo sablonu olustur");
	console.log("  badi icerik gorsel [konu]      Gorsel brief sablonu olustur");
	console.log("  badi icerik takvim [donem]     Icerik takvimi sablonu olustur");
	console.log("  badi icerik marka              Marka sesi rehberi sablonu olustur");
	console.log("  badi icerik list               Uretilen icerikleri listele");
	console.log("  badi icerik perf [secenekler]  Icerik performans takibi");
	console.log("");
	console.log(chalk.bold("Stats Secenekleri:"));
	console.log("  --week               Son 7 gun (varsayilan)");
	console.log("  --month              Son 30 gun");
	console.log("  --all                Tum zamanlar");
	console.log("  --command <arac>     Arac bazli filtre");
	console.log("  --habits             Aliskanlik serisi");
	console.log("  --export csv         CSV olarak disa aktar");
	console.log("");
	console.log(chalk.bold("Ornekler:"));
	console.log("  npx @fatihkan/badi init");
	console.log("  badi init --target ./projem");
	console.log("  badi update");
	console.log("  badi doctor");
	console.log("  badi list --agents");
	console.log("  badi plugin install https://github.com/user/badi-plugin-x.git");
	console.log('  badi icerik post "yeni urun lansman"');
	console.log('  badi icerik video "30 saniye tutorial"');
	console.log("  badi icerik list");
	console.log("  badi stats --week");
	console.log("  badi stats --habits");
	console.log("  badi completion zsh");
	console.log("  badi icerik perf --trend");
}

function showVersion() {
	console.log(`badi v${VERSION}`);
}

// ─── Update Notifier ───

function semverGt(a, b) {
	const pa = a.split(".").map(Number);
	const pb = b.split(".").map(Number);
	for (let i = 0; i < 3; i++) {
		if ((pa[i] || 0) > (pb[i] || 0)) return true;
		if ((pa[i] || 0) < (pb[i] || 0)) return false;
	}
	return false;
}

async function checkForUpdate() {
	if (process.env.BADI_NO_UPDATE_NOTIFIER === "1" || process.env.CI) return null;

	const configDir = join(homedir(), ".config", "badi");
	const cacheFile = join(configDir, "update-check.json");

	try {
		if (existsSync(cacheFile)) {
			const cache = JSON.parse(readFileSync(cacheFile, "utf-8"));
			if (Date.now() - new Date(cache.lastCheck).getTime() < 86400000) {
				return { current: VERSION, latest: cache.latestVersion };
			}
		}
	} catch {
		// Cache okuma hatasi, devam et
	}

	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 3000);
		const res = await fetch("https://registry.npmjs.org/@fatihkan/badi/latest", {
			signal: controller.signal,
		});
		clearTimeout(timeout);
		const data = await res.json();
		const latest = data.version;

		try {
			mkdirSync(configDir, { recursive: true });
			writeFileSync(cacheFile, JSON.stringify({ lastCheck: new Date().toISOString(), latestVersion: latest }));
		} catch {
			// Cache yazma hatasi, onemli degil
		}

		return { current: VERSION, latest };
	} catch {
		return null;
	}
}

function showUpdateBanner(info) {
	if (!info || !semverGt(info.latest, info.current)) return;
	console.log("");
	console.log(chalk.yellow("┌─────────────────────────────────────────────────┐"));
	console.log(chalk.yellow(`│  Yeni surum mevcut: ${chalk.bold(info.current)} → ${chalk.bold.green(info.latest)}${" ".repeat(Math.max(0, 23 - info.current.length - info.latest.length))}│`));
	console.log(chalk.yellow(`│  Guncelle: ${chalk.cyan("npm install -g @fatihkan/badi")}        │`));
	console.log(chalk.yellow("└─────────────────────────────────────────────────┘"));
}

// ─── Yardimci Fonksiyonlar ───

function copyRecursive(src, dest, options = {}) {
	const { force = false, dryRun = false, updateMode = false } = options;
	let copied = 0;
	let skipped = 0;
	let created = 0;

	if (!existsSync(src)) return { copied, skipped, created };

	const entries = readdirSync(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = join(src, entry.name);
		const destPath = join(dest, entry.name);

		if (entry.isDirectory()) {
			if (!existsSync(destPath)) {
				if (!dryRun) {
					mkdirSync(destPath, { recursive: true });
				}
				created++;
				if (dryRun) {
					console.log(`  ${chalk.green("+")} ${chalk.cyan("dizin")} ${relative(process.cwd(), destPath)}/`);
				}
			}
			const result = copyRecursive(srcPath, destPath, options);
			copied += result.copied;
			skipped += result.skipped;
			created += result.created;
		} else {
			if (existsSync(destPath)) {
				if (updateMode) {
					// Update modunda mevcut dosyalara dokunma
					if (dryRun) {
						console.log(`  ${chalk.gray("-")} ${chalk.dim(relative(process.cwd(), destPath))} (mevcut, atlandi)`);
					}
					skipped++;
				} else if (!force) {
					if (dryRun) {
						console.log(`  ${chalk.yellow("~")} ${relative(process.cwd(), destPath)} (mevcut, atlandi)`);
					}
					skipped++;
				} else {
					if (!dryRun) {
						cpSync(srcPath, destPath);
					}
					if (dryRun) {
						console.log(`  ${chalk.yellow("!")} ${relative(process.cwd(), destPath)} (ustune yazildi)`);
					}
					copied++;
				}
			} else {
				if (!dryRun) {
					mkdirSync(resolve(destPath, ".."), { recursive: true });
					cpSync(srcPath, destPath);
				}
				if (dryRun) {
					console.log(`  ${chalk.green("+")} ${relative(process.cwd(), destPath)}`);
				}
				copied++;
			}
		}
	}

	return { copied, skipped, created };
}

function countFiles(dir, ext = null) {
	if (!existsSync(dir)) return 0;
	let count = 0;
	const entries = readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		if (entry.isDirectory()) {
			count += countFiles(join(dir, entry.name), ext);
		} else if (!ext || extname(entry.name) === ext) {
			count++;
		}
	}
	return count;
}

function listMdFiles(dir) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((f) => f.endsWith(".md"))
		.map((f) => f.replace(".md", ""));
}

function listDirs(dir) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name);
}

// ─── INIT Komutu ───

function runInit(args) {
	let target = process.cwd();
	let force = false;
	let dryRun = false;

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case "--target":
				target = resolve(args[++i] || ".");
				break;
			case "--force":
				force = true;
				break;
			case "--dry-run":
				dryRun = true;
				break;
			case "--help":
			case "-h":
				showHelp();
				return;
		}
	}

	showBanner();

	const destClaude = join(target, ".claude");
	const destClaudeMd = join(target, "CLAUDE.md");
	const srcClaudeMd = join(PKG_ROOT, "CLAUDE.md");

	console.log(`${chalk.bold("Hedef:")} ${target}`);
	console.log(
		`${chalk.bold("Mod:")} ${dryRun ? chalk.yellow("Kuru calistirma") : force ? chalk.red("Zorla yazma") : chalk.green("Normal")}`,
	);
	console.log("");

	if (!existsSync(TEMPLATE_DIR)) {
		console.error(chalk.red("Hata: Sablon dizini bulunamadi: " + TEMPLATE_DIR));
		process.exit(1);
	}

	if (!dryRun && !existsSync(destClaude)) {
		mkdirSync(destClaude, { recursive: true });
	}

	// .claude/ dizinini kopyala
	console.log(chalk.bold("Dosyalar:"));
	const result = copyRecursive(TEMPLATE_DIR, destClaude, { force, dryRun });

	// CLAUDE.md dosyasini kopyala
	if (existsSync(srcClaudeMd)) {
		if (!existsSync(destClaudeMd) || force) {
			if (!dryRun) {
				cpSync(srcClaudeMd, destClaudeMd);
			}
			console.log(`  ${chalk.green("+")} CLAUDE.md`);
			result.copied++;
		} else {
			console.log(`  ${chalk.yellow("~")} CLAUDE.md (mevcut, atlandi)`);
			result.skipped++;
		}
	}

	// Hook scriptlerini calistirilabilir yap
	if (!dryRun) {
		const hooksDir = join(destClaude, "hooks");
		if (existsSync(hooksDir)) {
			for (const f of readdirSync(hooksDir)) {
				if (f.endsWith(".sh")) {
					chmodSync(join(hooksDir, f), 0o755);
				}
			}
		}
	}

	console.log("");
	console.log(chalk.bold.green("Tamamlandi!"));
	console.log(`  ${chalk.green(result.copied)} dosya kopyalandi`);
	console.log(`  ${chalk.yellow(result.skipped)} dosya atlandi`);
	console.log(`  ${chalk.cyan(result.created)} dizin olusturuldu`);

	if (!dryRun) {
		console.log("");
		console.log(chalk.bold("Sonraki adimlar:"));
		console.log(`  1. ${chalk.cyan(".claude/settings.json")} dosyasini inceleyin`);
		console.log(`  2. Claude Code ile ${chalk.cyan("/start")} komutunu calistirin`);
		console.log(`  3. Dogrulama icin ${chalk.cyan("badi doctor")} calistirin`);
		console.log(`  4. Uretken olun!`);
	}
}

// ─── UPDATE Komutu ───

function runUpdate(args) {
	let target = process.cwd();
	let dryRun = false;

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case "--target":
				target = resolve(args[++i] || ".");
				break;
			case "--dry-run":
				dryRun = true;
				break;
			case "--help":
			case "-h":
				showHelp();
				return;
		}
	}

	showBanner();

	const destClaude = join(target, ".claude");

	if (!existsSync(destClaude)) {
		console.error(chalk.red("Hata: .claude/ dizini bulunamadi. Once 'badi init' calistirin."));
		process.exit(1);
	}

	console.log(`${chalk.bold("Hedef:")} ${target}`);
	console.log(`${chalk.bold("Mod:")} ${chalk.cyan("Guncelleme")} (mevcut dosyalar korunur)`);
	console.log("");

	console.log(chalk.bold("Dosyalar:"));
	const result = copyRecursive(TEMPLATE_DIR, destClaude, {
		dryRun,
		updateMode: true,
	});

	// Hook scriptlerini calistirilabilir yap
	if (!dryRun) {
		const hooksDir = join(destClaude, "hooks");
		if (existsSync(hooksDir)) {
			for (const f of readdirSync(hooksDir)) {
				if (f.endsWith(".sh")) {
					chmodSync(join(hooksDir, f), 0o755);
				}
			}
		}
	}

	console.log("");
	console.log(chalk.bold.green("Guncelleme tamamlandi!"));
	console.log(`  ${chalk.green(result.copied)} yeni dosya eklendi`);
	console.log(`  ${chalk.gray(result.skipped)} mevcut dosya korundu`);
	console.log(`  ${chalk.cyan(result.created)} yeni dizin olusturuldu`);
}

// ─── DOCTOR Komutu ───

function runDoctor(args) {
	let target = process.cwd();

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case "--target":
				target = resolve(args[++i] || ".");
				break;
			case "--help":
			case "-h":
				showHelp();
				return;
		}
	}

	showBanner();
	console.log(chalk.bold("Badi Kurulum Dogrulamasi"));
	console.log(`${chalk.bold("Hedef:")} ${target}`);
	console.log("");

	const claudeDir = join(target, ".claude");
	let pass = 0;
	let warn = 0;
	let fail = 0;

	function check(label, fn) {
		try {
			const result = fn();
			if (result === true) {
				console.log(`  ${chalk.green("OK")}  ${label}`);
				pass++;
			} else if (result === "warn") {
				console.log(`  ${chalk.yellow("!!")}  ${label}`);
				warn++;
			} else {
				console.log(`  ${chalk.red("XX")}  ${label}`);
				fail++;
			}
		} catch (e) {
			console.log(`  ${chalk.red("XX")}  ${label} (${e.message})`);
			fail++;
		}
	}

	// 1. .claude/ dizini var mi?
	check(".claude/ dizini mevcut", () => existsSync(claudeDir));

	// 2. settings.json gecerli JSON mi?
	check("settings.json gecerli JSON", () => {
		const p = join(claudeDir, "settings.json");
		if (!existsSync(p)) return false;
		JSON.parse(readFileSync(p, "utf-8"));
		return true;
	});

	// 3. Hook scriptleri mevcut ve calistirilabilir mi?
	const expectedHooks = [
		"guard-bash.sh",
		"backup-before-write.sh",
		"completeness-gate.sh",
		"log-changes.sh",
		"log-failures.sh",
		"log-stop-verdict.sh",
		"post-compact-resume.sh",
		"pre-compact-handoff.sh",
		"session-reset.sh",
		"dependency-audit.sh",
		"branch-guard.sh",
		"track-usage.sh",
	];

	for (const hook of expectedHooks) {
		check(`Hook: ${hook}`, () => {
			const p = join(claudeDir, "hooks", hook);
			if (!existsSync(p)) return false;
			try {
				const stat = statSync(p);
				// eslint-disable-next-line no-bitwise
				if (!(stat.mode & 0o111)) return "warn";
			} catch {
				return "warn";
			}
			return true;
		});
	}

	// 4. Agent dosyalari mevcut ve frontmatter'li mi?
	const expectedAgents = [
		"archaeologist",
		"auditor",
		"coach",
		"debt-collector",
		"error-whisperer",
		"onboarding-sherpa",
		"pr-ghostwriter",
		"rubber-duck",
		"unsticker",
		"yak-shave-detector",
		"security-scanner",
		"performance-profiler",
		"test-strategist",
		"api-designer",
		"migration-pilot",
		"code-generator",
		"refactoring-advisor",
		"architecture-advisor",
		"content-creator",
		"visual-director",
		"project-architect",
	];

	for (const agent of expectedAgents) {
		check(`Agent: ${agent}.md`, () => {
			const p = join(claudeDir, "agents", `${agent}.md`);
			if (!existsSync(p)) return false;
			const content = readFileSync(p, "utf-8");
			if (!content.startsWith("---")) return "warn";
			return true;
		});
	}

	// 5. Bellek dosyalari boyut limitleri
	check("memory.md boyut limiti (<=100 satir)", () => {
		const p = join(claudeDir, "memory.md");
		if (!existsSync(p)) return "warn";
		const lines = readFileSync(p, "utf-8").split("\n").length;
		return lines <= 100 ? true : "warn";
	});

	check("knowledge-base.md boyut limiti (<=200 satir)", () => {
		const p = join(claudeDir, "knowledge-base.md");
		if (!existsSync(p)) return "warn";
		const lines = readFileSync(p, "utf-8").split("\n").length;
		return lines <= 200 ? true : "warn";
	});

	// 6. CLAUDE.md mevcut mu?
	check("CLAUDE.md mevcut", () => existsSync(join(target, "CLAUDE.md")));

	// 7. command-index.md mevcut mu?
	check("command-index.md mevcut", () => existsSync(join(claudeDir, "command-index.md")));

	// 8. Skill dizin yapisi
	check("Skill dizin yapisi", () => {
		const skillsDir = join(claudeDir, "skills");
		if (!existsSync(skillsDir)) return false;
		const dirs = listDirs(skillsDir);
		return dirs.length >= 16 ? true : dirs.length >= 1 ? "warn" : false;
	});

	// Ozet
	console.log("");
	console.log(chalk.bold("Sonuc:"));
	console.log(`  ${chalk.green(pass + " basarili")}  ${chalk.yellow(warn + " uyari")}  ${chalk.red(fail + " basarisiz")}`);

	if (fail === 0 && warn === 0) {
		console.log("");
		console.log(chalk.bold.green("Badi kurulumu saglikli!"));
	} else if (fail === 0) {
		console.log("");
		console.log(chalk.bold.yellow("Badi kurulumunda kucuk sorunlar var. Detaylari inceleyin."));
	} else {
		console.log("");
		console.log(chalk.bold.red("Badi kurulumunda sorunlar tespit edildi. 'badi init --force' ile yeniden kurun."));
	}

	process.exit(fail > 0 ? 1 : 0);
}

// ─── LIST Komutu ───

function runList(args) {
	let showAgents = false;
	let showCommands = false;
	let showHooks = false;
	let showSkills = false;
	let target = PKG_ROOT;

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case "--agents":
				showAgents = true;
				break;
			case "--commands":
				showCommands = true;
				break;
			case "--hooks":
				showHooks = true;
				break;
			case "--skills":
				showSkills = true;
				break;
			case "--target":
				target = resolve(args[++i] || ".");
				break;
			case "--help":
			case "-h":
				showHelp();
				return;
		}
	}

	const showAll = !showAgents && !showCommands && !showHooks && !showSkills;
	const claudeDir = join(target, ".claude");

	showBanner();

	if (showAll || showAgents) {
		const agents = listMdFiles(join(claudeDir, "agents"));
		console.log(chalk.bold(`Ajanlar (${agents.length}):`));
		for (const a of agents) {
			console.log(`  ${chalk.cyan("-")} ${a}`);
		}
		console.log("");
	}

	if (showAll || showCommands) {
		const commands = listMdFiles(join(claudeDir, "commands"));
		console.log(chalk.bold(`Komutlar (${commands.length}):`));
		for (const c of commands) {
			console.log(`  ${chalk.cyan("/")} ${c}`);
		}
		console.log("");
	}

	if (showAll || showHooks) {
		const hooksDir = join(claudeDir, "hooks");
		const hooks = existsSync(hooksDir) ? readdirSync(hooksDir).filter((f) => f.endsWith(".sh")) : [];
		console.log(chalk.bold(`Hook'lar (${hooks.length}):`));
		for (const h of hooks) {
			console.log(`  ${chalk.cyan("*")} ${h}`);
		}
		console.log("");
	}

	if (showAll || showSkills) {
		const skillsDir = join(claudeDir, "skills");
		const categories = listDirs(skillsDir);
		const totalSkills = categories.reduce((sum, cat) => {
			return sum + countFiles(join(skillsDir, cat), ".md");
		}, 0);
		console.log(chalk.bold(`Skill Kategorileri (${categories.length} kategori, ${totalSkills} skill):`));
		for (const cat of categories.sort()) {
			const count = countFiles(join(skillsDir, cat), ".md");
			console.log(`  ${chalk.cyan("-")} ${cat} (${count} skill)`);
		}
		console.log("");
	}

	// Plugin'leri her zaman goster
	const pluginsDir = join(claudeDir, "plugins");
	if (existsSync(pluginsDir)) {
		const plugins = listDirs(pluginsDir);
		if (plugins.length > 0 || showAll) {
			console.log(chalk.bold(`Plugin'ler (${plugins.length}):`));
			for (const p of plugins) {
				const manifestPath = join(pluginsDir, p, "badi-plugin.json");
				if (existsSync(manifestPath)) {
					try {
						const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
						console.log(`  ${chalk.magenta("+")} ${manifest.name || p} v${manifest.version || "?"}`);
					} catch {
						console.log(`  ${chalk.magenta("+")} ${p}`);
					}
				} else {
					console.log(`  ${chalk.magenta("+")} ${p}`);
				}
			}
			console.log("");
		}
	}
}

// ─── PLUGIN Komutu ───

function runPlugin(args) {
	const subcommand = args[0];

	if (!subcommand || subcommand === "--help" || subcommand === "-h") {
		console.log(chalk.bold("Plugin Yonetimi:"));
		console.log(`  badi plugin install <kaynak>   Plugin yukle`);
		console.log(`  badi plugin remove <isim>      Plugin kaldir`);
		console.log(`  badi plugin list               Yuklu plugin'leri listele`);
		return;
	}

	const target = process.cwd();
	const pluginsDir = join(target, ".claude", "plugins");

	switch (subcommand) {
		case "install": {
			const source = args[1];
			if (!source) {
				console.error(chalk.red("Hata: Plugin kaynagi belirtilmedi."));
				console.log("Kullanim: badi plugin install <git-url|npm-paket>");
				process.exit(1);
			}

			if (!existsSync(pluginsDir)) {
				mkdirSync(pluginsDir, { recursive: true });
			}

			// Git URL mi yoksa npm paketi mi?
			if (source.includes("github.com") || source.endsWith(".git")) {
				const pluginName = basename(source, ".git").replace(/^badi-plugin-/, "");
				const destDir = join(pluginsDir, pluginName);

				if (existsSync(destDir)) {
					console.error(chalk.yellow(`Plugin '${pluginName}' zaten yuklu. Once kaldirin.`));
					process.exit(1);
				}

				console.log(chalk.cyan(`Plugin indiriliyor: ${source}`));
				try {
					execSync(`git clone --depth 1 ${source} ${destDir}`, {
						stdio: "pipe",
					});
					// .git dizinini temizle
					const gitDir = join(destDir, ".git");
					if (existsSync(gitDir)) {
						rmSync(gitDir, { recursive: true });
					}
					console.log(chalk.green(`Plugin '${pluginName}' basariyla yuklendi!`));
				} catch (e) {
					console.error(chalk.red(`Plugin yuklenemedi: ${e.message}`));
					process.exit(1);
				}
			} else {
				// npm paketi olarak yukle
				const pluginName = source.replace(/^@.*\//, "").replace(/^badi-plugin-/, "");
				const destDir = join(pluginsDir, pluginName);

				if (existsSync(destDir)) {
					console.error(chalk.yellow(`Plugin '${pluginName}' zaten yuklu.`));
					process.exit(1);
				}

				console.log(chalk.cyan(`Plugin npm'den indiriliyor: ${source}`));
				try {
					mkdirSync(destDir, { recursive: true });
					execSync(`npm pack ${source} --pack-destination ${destDir}`, {
						stdio: "pipe",
					});
					console.log(chalk.green(`Plugin '${pluginName}' basariyla yuklendi!`));
				} catch (e) {
					console.error(chalk.red(`Plugin yuklenemedi: ${e.message}`));
					if (existsSync(destDir)) rmSync(destDir, { recursive: true });
					process.exit(1);
				}
			}

			// Manifest kontrolu
			const installedName = basename(args[1], ".git").replace(/^badi-plugin-/, "");
			const manifestPath = join(pluginsDir, installedName, "badi-plugin.json");
			if (existsSync(manifestPath)) {
				try {
					const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
					console.log("");
					console.log(chalk.bold("Plugin icerigi:"));
					if (manifest.agents?.length) console.log(`  Ajanlar: ${manifest.agents.join(", ")}`);
					if (manifest.commands?.length) console.log(`  Komutlar: ${manifest.commands.join(", ")}`);
					if (manifest.hooks?.length) console.log(`  Hook'lar: ${manifest.hooks.join(", ")}`);
					if (manifest.skills) console.log(`  Skill'ler: ${Object.keys(manifest.skills).join(", ")}`);
				} catch {
					// manifest okunamadiysa ses cikarma
				}
			} else {
				console.log(chalk.yellow("Uyari: badi-plugin.json bulunamadi. Plugin yapilandirmasi eksik olabilir."));
			}
			break;
		}

		case "remove": {
			const name = args[1];
			if (!name) {
				console.error(chalk.red("Hata: Plugin adi belirtilmedi."));
				process.exit(1);
			}

			const pluginDir = join(pluginsDir, name);
			if (!existsSync(pluginDir)) {
				console.error(chalk.red(`Plugin '${name}' bulunamadi.`));
				process.exit(1);
			}

			rmSync(pluginDir, { recursive: true });
			console.log(chalk.green(`Plugin '${name}' basariyla kaldirildi.`));
			break;
		}

		case "list": {
			if (!existsSync(pluginsDir)) {
				console.log(chalk.dim("Yuklu plugin yok."));
				return;
			}

			const plugins = listDirs(pluginsDir);
			if (plugins.length === 0) {
				console.log(chalk.dim("Yuklu plugin yok."));
				return;
			}

			console.log(chalk.bold(`Yuklu Plugin'ler (${plugins.length}):`));
			for (const p of plugins) {
				const manifestPath = join(pluginsDir, p, "badi-plugin.json");
				if (existsSync(manifestPath)) {
					try {
						const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
						console.log(`  ${chalk.magenta("+")} ${manifest.name || p} v${manifest.version || "?"} - ${manifest.description || ""}`);
					} catch {
						console.log(`  ${chalk.magenta("+")} ${p}`);
					}
				} else {
					console.log(`  ${chalk.magenta("+")} ${p}`);
				}
			}
			break;
		}

		default:
			console.error(chalk.red(`Bilinmeyen plugin komutu: ${subcommand}`));
			console.log("Kullanim: badi plugin [install|remove|list]");
			process.exit(1);
	}
}

// ─── COMPLETION Komutu ───

function getCommandMap() {
	return {
		init: { flags: ["--target", "--force", "--dry-run", "--help"] },
		update: { flags: ["--target", "--dry-run", "--help"] },
		doctor: { flags: ["--target", "--help"] },
		list: { flags: ["--agents", "--commands", "--hooks", "--skills", "--target", "--help"] },
		plugin: { subs: ["install", "remove", "list"], flags: ["--help"] },
		icerik: {
			subs: ["post", "karousel", "video", "gorsel", "takvim", "marka", "list", "basla", "durum", "fikir", "plan", "kapat", "ac", "perf"],
			flags: ["--help"],
		},
		stats: { flags: ["--week", "--month", "--all", "--command", "--habits", "--export", "--help"] },
		completion: { subs: ["bash", "zsh", "fish"], flags: ["--help"] },
	};
}

function generateBashCompletion() {
	const cmds = getCommandMap();
	const mainCmds = Object.keys(cmds).join(" ");
	let script = `# badi bash completion
# Kullanim: badi completion bash >> ~/.bashrc && source ~/.bashrc

_badi_completion() {
    local cur prev words cword
    _init_completion || return

    local commands="${mainCmds}"

    if [[ $cword -eq 1 ]]; then
        COMPREPLY=( $(compgen -W "$commands --help --version" -- "$cur") )
        return
    fi

    case "\${words[1]}" in
`;
	for (const [cmd, info] of Object.entries(cmds)) {
		const opts = [...(info.subs || []), ...(info.flags || [])].join(" ");
		script += `        ${cmd})\n            COMPREPLY=( $(compgen -W "${opts}" -- "$cur") )\n            ;;\n`;
	}
	script += `    esac
}

complete -F _badi_completion badi
`;
	return script;
}

function generateZshCompletion() {
	const cmds = getCommandMap();
	let script = `#compdef badi
# badi zsh completion
# Kullanim: badi completion zsh > "\${fpath[1]}/_badi" && compinit

_badi() {
    local -a commands
    commands=(
`;
	for (const cmd of Object.keys(cmds)) {
		script += `        '${cmd}:${cmd} komutu'\n`;
	}
	script += `    )

    _arguments -C \\
        '1:komut:->command' \\
        '*::arg:->args'

    case $state in
        command)
            _describe 'badi komutu' commands
            ;;
        args)
            case $words[1] in
`;
	for (const [cmd, info] of Object.entries(cmds)) {
		if (info.subs) {
			const subsStr = info.subs.map((s) => `'${s}:${s}'`).join(" ");
			script += `                ${cmd})\n                    local -a subcmds=(${subsStr})\n                    _describe '${cmd} alt komutu' subcmds\n                    ;;\n`;
		} else if (info.flags) {
			const flagStr = info.flags.join(" ");
			script += `                ${cmd})\n                    _arguments '*:bayrak:(${flagStr})'\n                    ;;\n`;
		}
	}
	script += `            esac
            ;;
    esac
}

_badi "$@"
`;
	return script;
}

function generateFishCompletion() {
	const cmds = getCommandMap();
	let script = `# badi fish completion
# Kullanim: badi completion fish > ~/.config/fish/completions/badi.fish

# Ana komutlar
set -l commands ${Object.keys(cmds).join(" ")}

# Sadece ust duzey komutlarda tamamla
complete -c badi -f
complete -c badi -n "not __fish_seen_subcommand_from $commands" -a "$commands" -d "Badi komutu"
complete -c badi -n "not __fish_seen_subcommand_from $commands" -l help -d "Yardim goster"
complete -c badi -n "not __fish_seen_subcommand_from $commands" -l version -d "Surum goster"

`;
	for (const [cmd, info] of Object.entries(cmds)) {
		if (info.subs) {
			for (const sub of info.subs) {
				script += `complete -c badi -n "__fish_seen_subcommand_from ${cmd}" -a "${sub}" -d "${sub}"\n`;
			}
		}
		if (info.flags) {
			for (const flag of info.flags) {
				const name = flag.replace(/^--/, "");
				script += `complete -c badi -n "__fish_seen_subcommand_from ${cmd}" -l "${name}" -d "${name}"\n`;
			}
		}
	}
	return script;
}

function runCompletion(args) {
	const shell = args[0];

	if (!shell || shell === "--help" || shell === "-h") {
		console.log(chalk.bold("Kabuk Tamamlama Scriptleri:"));
		console.log(`  badi completion ${chalk.cyan("bash")}    Bash tamamlama scripti`);
		console.log(`  badi completion ${chalk.cyan("zsh")}     Zsh tamamlama scripti`);
		console.log(`  badi completion ${chalk.cyan("fish")}    Fish tamamlama scripti`);
		console.log("");
		console.log(chalk.bold("Kurulum:"));
		console.log("  badi completion bash >> ~/.bashrc");
		console.log('  badi completion zsh > "${fpath[1]}/_badi"');
		console.log("  badi completion fish > ~/.config/fish/completions/badi.fish");
		return;
	}

	switch (shell) {
		case "bash":
			process.stdout.write(generateBashCompletion());
			break;
		case "zsh":
			process.stdout.write(generateZshCompletion());
			break;
		case "fish":
			process.stdout.write(generateFishCompletion());
			break;
		default:
			console.error(chalk.red(`Bilinmeyen kabuk: ${shell}`));
			console.log("Desteklenen kabuklar: bash, zsh, fish");
			process.exit(1);
	}
}

// ─── STATS Komutu ───

function parseUsageLog(cwd) {
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

function filterByPeriod(entries, period) {
	if (period === "all") return entries;
	const now = Date.now();
	const msMap = { week: 7 * 86400000, month: 30 * 86400000 };
	const cutoff = now - (msMap[period] || msMap.week);
	return entries.filter((e) => new Date(e.timestamp).getTime() >= cutoff);
}

function buildStats(entries) {
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

function renderBarChart(counts, maxWidth = 30) {
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

function renderDailyTrend(dailyCounts) {
	const days = Object.entries(dailyCounts).sort((a, b) => a[0].localeCompare(b[0]));
	if (days.length === 0) return;
	const maxVal = Math.max(...days.map(([, v]) => v));

	for (const [day, count] of days.slice(-14)) {
		const barLen = Math.max(1, Math.round((count / maxVal) * 20));
		const bar = chalk.green("▓".repeat(barLen));
		console.log(`  ${chalk.dim(day)}  ${bar} ${count}`);
	}
}

function renderHabitStreaks(dailyCounts) {
	const days = Object.keys(dailyCounts).sort();
	if (days.length === 0) {
		console.log(chalk.dim("  Henuz veri yok"));
		return;
	}

	// Mevcut seri hesapla
	let currentStreak = 0;
	let longestStreak = 0;
	let streak = 0;
	const today = new Date();

	for (let i = 0; i < 365; i++) {
		const d = new Date(today);
		d.setDate(d.getDate() - i);
		const key = d.toISOString().substring(0, 10);
		if (dailyCounts[key]) {
			streak++;
			if (i === 0 || (i > 0 && streak > 0)) currentStreak = streak;
		} else {
			if (streak > longestStreak) longestStreak = streak;
			if (i === 0) currentStreak = 0;
			streak = 0;
		}
	}
	if (streak > longestStreak) longestStreak = streak;

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

function runStats(args) {
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
		console.log(`  badi stats              ${chalk.dim("Haftalik ozet (varsayilan)")}`);
		console.log(`  badi stats --month      ${chalk.dim("Aylik ozet")}`);
		console.log(`  badi stats --all        ${chalk.dim("Tum zamanlar")}`);
		console.log(`  badi stats --command X  ${chalk.dim("Arac bazli filtre")}`);
		console.log(`  badi stats --habits     ${chalk.dim("Aliskanlik serisi analizi")}`);
		console.log(`  badi stats --export csv ${chalk.dim("CSV olarak disa aktar")}`);
		return;
	}

	let entries = parseUsageLog();
	entries = filterByPeriod(entries, period);

	if (commandFilter) {
		entries = entries.filter(
			(e) => (e.tool || "").toLowerCase().includes(commandFilter.toLowerCase()) || (e.subcommand || "").toLowerCase().includes(commandFilter.toLowerCase()),
		);
	}

	if (exportFormat === "csv") {
		console.log("timestamp,tool,command,subcommand,exit_code");
		for (const e of entries) {
			console.log(`${e.timestamp || ""},${e.tool || ""},${e.command || ""},${e.subcommand || ""},${e.exit_code ?? ""}`);
		}
		return;
	}

	if (entries.length === 0) {
		console.log(chalk.yellow("Henuz kullanim verisi yok."));
		console.log(chalk.dim("Badi kullandikca veriler otomatik toplanir."));
		return;
	}

	const periodLabels = { week: "Son 7 gun", month: "Son 30 gun", all: "Tum zamanlar" };
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
	console.log(chalk.dim(`Toplam: ${totalTools} arac kullanimi, ${totalBadi} badi komutu`));
}

// ─── ICERIK Komutu ───

function slugify(text) {
	return text
		.toLowerCase()
		.replace(/ı/g, "i")
		.replace(/ğ/g, "g")
		.replace(/ü/g, "u")
		.replace(/ş/g, "s")
		.replace(/ö/g, "o")
		.replace(/ç/g, "c")
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.substring(0, 50);
}

function getDateString() {
	const d = new Date();
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const dd = String(d.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
}

function getIcerikWorkspace(subdir) {
	const base = join(process.cwd(), ".claude", "workspace", subdir);
	if (!existsSync(base)) {
		mkdirSync(base, { recursive: true });
	}
	return base;
}

function contentTemplates() {
	return {
		post: (konu) => `# Sosyal Medya Post — ${konu}

**Tarih:** ${getDateString()}
**Platform:** [Instagram / Twitter-X / LinkedIn / TikTok / Facebook]
**Tur:** [Bilgilendirici / Ilham / Eglence / Satis / Topluluk / Egitici]
**Ton:** [Samimi / Profesyonel / Eglenceli / Ilham verici]

---

## VARYASYON A — Dogrudan Deger

[Hook — ilk 1-2 satir, dikkat cekici]

[Govde — ana mesaj]

[CTA — net cagri]

**Hashtag:** #hashtag1 #hashtag2 #hashtag3

---

## VARYASYON B — Hikaye Anlatimi

[Kisisel deneyim veya senaryo ile basla]

[Duygu baglantisi kur]

[CTA]

**Hashtag:** #hashtag1 #hashtag2 #hashtag3

---

## VARYASYON C — Soru/Merak

[Sasirtici soru veya iddia]

[Merak boslugu ac]

[CTA]

**Hashtag:** #hashtag1 #hashtag2 #hashtag3

---

## GORSEL NOTU
- Boyut: [1080x1080 / 1080x1350 / 1920x1080]
- Stil: [minimalist / fotografik / tipografik]
- Renk: [marka renkleri veya palet]

## ZAMANLAMA
- Onerilen gun: [gun]
- Onerilen saat: [saat]
- Sebep: [neden bu zaman]

## META
- Dosya: ${getDateString()}-${slugify(konu)}.md
- Marka sesi: .claude/workspace/marka-sesi.md (varsa)
`,

		karousel: (konu) => `# Karousel Icerik — ${konu}

**Tarih:** ${getDateString()}
**Platform:** [Instagram / LinkedIn]
**Amac:** [Egitici / Hikaye / Liste / Karsilastirma / Adim adim]
**Kare Sayisi:** 7
**Gorsel Stil:** [Minimalist / Renkli / Fotografik / Tipografik]

---

## KARE 1: KAPAK
**Baslik:** [buyuk, dikkat cekici baslik]
**Alt Baslik:** [varsa]
**Gorsel:** [arka plan + ana gorsel aciklamasi]
**Amac:** Dikkat yakalamak, kaydirmaya tesvik

---

## KARE 2: [baslik]
**Baslik:** [metin]
**Govde:**
- Madde 1
- Madde 2
- Madde 3

**Gorsel:** [arka plan + oge]
**Gecis:** [sonraki kareye gecis hissi]

---

## KARE 3: [baslik]
**Baslik:** [metin]
**Govde:** [icerik]
**Gorsel:** [arka plan + oge]

---

## KARE 4: [baslik]
**Baslik:** [metin]
**Govde:** [icerik]
**Gorsel:** [arka plan + oge]

---

## KARE 5: [baslik]
**Baslik:** [metin]
**Govde:** [icerik]
**Gorsel:** [arka plan + oge]

---

## KARE 6: [baslik]
**Baslik:** [metin]
**Govde:** [icerik]
**Gorsel:** [arka plan + oge]

---

## KARE 7: SON KARE — CTA
**Baslik:** [kapanis mesaji]
**CTA:** [net aksiyon: Kaydet / Paylas / Takip et / Yorum yap]
**Gorsel:** [arka plan + marka ogeleri]

---

## CAPTION
[Hazir caption metni — kopyala yapistir]

**Hook:** [ilk satir]
**Hashtag:** #hashtag1 #hashtag2 #hashtag3
**CTA:** [caption icindeki cagri]

## TASARIM NOTLARI
- Renk Paleti: [#hex kodlari]
- Baslik Font: [font adi]
- Govde Font: [font adi]
- Logo Konumu: [kapak + son kare / her karede]
- Kare Numarasi: [1/7, 2/7... formati]

## META
- Dosya: ${getDateString()}-karousel-${slugify(konu)}.md
`,

		video: (konu) => `# Video Senaryo — ${konu}

**Tarih:** ${getDateString()}
**Platform:** [Instagram Reels / YouTube Shorts / TikTok / YouTube]
**Sure:** [15s / 30s / 60s / 3-10dk]
**Tur:** [Egitici / Eglence / Tanitim / Hikaye / Trend]
**Konusmaci:** [Yuz / Seslendirme / Metin+Gorsel / Ekran Kaydi]

---

## HOOK (0-3s)
**GORUNTU:** [ilk kare detayi — ekranda ne var]
**SES:** "[soylenen ilk cumle]"
**METIN:** [ekran ustu yazi]
**AMAC:** [neden bu hook calisir]

---

## SAHNE 1 — Baglam (3s-Xs)
**GORUNTU:** [kamera acisi, hareket, obje]
**SES:** "[konusma metni]"
**METIN:** [ekran yazisi]
**GECIS:** [sonraki sahneye nasil gecilecek]

---

## SAHNE 2 — Ana Icerik (Xs-Ys)
**GORUNTU:** [detay]
**SES:** "[konusma]"
**METIN:** [ekran yazisi]
**GECIS:** [gecis tipi]

---

## SAHNE 3 — Detay/Ornek (Ys-Zs)
**GORUNTU:** [detay]
**SES:** "[konusma]"
**METIN:** [ekran yazisi]
**GECIS:** [gecis tipi]

---

## KAPANISIS — CTA (son 3-5s)
**GORUNTU:** [son kare]
**SES:** "[CTA metni]"
**METIN:** [ekran yazisi — CTA]

---

## CAPTION
[Video altina yazilacak aciklama]

**Hashtag:** #hashtag1 #hashtag2 #hashtag3
**Mention:** @hesap1 @hesap2
**CTA:** [yorum yap / kaydet / takip et]

## POST-PRODUKSIYON
- **Muzik:** [trend ses / orijinal / arka plan]
- **Filtre/LUT:** [renk gradasyonu notu]
- **Gecis Efektleri:** [whip pan / kesme / fade]
- **Hiz:** [yavaslatma / hizlandirma noktalari]
- **Altyazi:** [acik / kapali] — [font onerisi]

## THUMBNAIL (YouTube icin)
- **Metin:** [baslik — max 5-6 kelime]
- **Gorsel:** [ana obje/kisi]
- **Renk:** [kontrast vurgusu]

## META
- Dosya: ${getDateString()}-${slugify(konu)}.md
- Tahmini Cekim: [dakika]
- Tahmini Kurgu: [dakika]
- Gerekli Ekipman: [telefon / kamera / mikrofon / isik]
`,

		gorsel: (konu) => `# Gorsel Brief — ${konu}

**Tarih:** ${getDateString()}
**Kullanim:** [Post / Story / Karousel / Thumbnail / Banner / Reklam]
**Platform:** [Instagram / Twitter / LinkedIn / YouTube / Facebook]
**Stil:** [Fotografik / Minimalist / Illustrasyon / Tipografik / 3D]

---

## GORSEL ACIKLAMASI
[Detayli kompozisyon, objeler, atmosfer]

## TEKNIK OZELLIKLER
- **Boyut:** [genislik]x[yukseklik] px
- **En-Boy:** [1:1 / 4:5 / 9:16 / 16:9]
- **Format:** [PNG / JPG / SVG]

## RENK PALETI
- **Birincil:** #______ — [isim/kullanim]
- **Ikincil:** #______ — [isim/kullanim]
- **Vurgu:** #______ — [CTA butonu]
- **Arka Plan:** #______
- **Metin:** #______

## TIPOGRAFI
- **Baslik:** [font] / [boyut]px / [kalinlik] / [#renk]
- **Alt Baslik:** [font] / [boyut]px / [#renk]
- **CTA:** [font] / [boyut]px / BG:[#hex] FG:[#hex]

## KOMPOZISYON
- **Odak Noktasi:** [orta / uc'te bir / alt / ust]
- **Bos Alan:** [yogun / orta / ferah]
- **Simetri:** [simetrik / asimetrik]

---

## AI PROMPTLAR

### Midjourney
\`\`\`
/imagine [detayli aciklama], [stil], [atmosfer], [kompozisyon] --ar [oran] --v 6.1 --style raw
\`\`\`

### DALL-E
\`\`\`
[Detayli dogal dil aciklamasi, stil ve atmosfer dahil]
\`\`\`

### Flux / Stable Diffusion
\`\`\`
[pozitif prompt], [stil etiketleri]
Negative: [istenmeyen ogeler]
\`\`\`

## CANVA / FIGMA NOTU
- **Sablon:** [kategori]
- **Katman Sirasi:** arka plan > gorsel > metin > logo
- **Elemanlar:** [ikon / sekil / foto]

## META
- Dosya: ${getDateString()}-${slugify(konu)}-brief.md
`,

		takvim: (donem) => `# Icerik Takvimi — ${donem}

**Tarih:** ${getDateString()}
**Donem:** ${donem}
**Platformlar:** [Instagram, Twitter, LinkedIn, TikTok, YouTube]
**Toplam Icerik:** [sayi]

---

## TEMA HARITASI

| Gun | Tema | Format | Enerji |
|-----|------|--------|--------|
| Pzt | Motivasyon / Hafta Basli | Post | Yuksek |
| Sal | Egitici / Ipucu | Karousel | Orta |
| Car | Perde Arkasi / Topluluk | Story | Samimi |
| Per | Urun / Hizmet | Reel | Satis |
| Cum | Eglence / Trend | Reel | Eglenceli |
| Cts | UGC / Sosyal Kanit | Post | Guvenilir |
| Paz | Ilham / Ozet | Karousel | Dusunceli |

---

## HAFTA 1

| Tarih | Platform | Format | Konu | CTA | Saat | Durum |
|-------|----------|--------|------|-----|------|-------|
| | IG Post | | | | | Planli |
| | Twitter | | | | | Planli |
| | LinkedIn | | | | | Planli |
| | IG Reel | | | | | Planli |
| | TikTok | | | | | Planli |

## HAFTA 2

| Tarih | Platform | Format | Konu | CTA | Saat | Durum |
|-------|----------|--------|------|-----|------|-------|
| | | | | | | Planli |

## HAFTA 3

| Tarih | Platform | Format | Konu | CTA | Saat | Durum |
|-------|----------|--------|------|-----|------|-------|
| | | | | | | Planli |

## HAFTA 4

| Tarih | Platform | Format | Konu | CTA | Saat | Durum |
|-------|----------|--------|------|-----|------|-------|
| | | | | | | Planli |

---

## OZEL GUNLER

| Tarih | Etkinlik | Planlanan Icerik | Platform |
|-------|----------|------------------|----------|
| | | | |

## KAMPANYALAR

| Baslangic | Bitis | Kampanya | Icerik Sayisi |
|-----------|-------|----------|---------------|
| | | | |

---

## PERFORMANS TAKIBI
(sonradan doldur)

| Tarih | Platform | Etkilesim | Erisim | Tiklama | Not |
|-------|----------|-----------|--------|---------|-----|
| | | | | | |

## NOTLAR
- Genel strateji: [not]
- Onceki donem ogrenimleri: [not]

## META
- Dosya: ${getDateString()}-takvim-${slugify(donem)}.md
`,

		marka: () => `# Marka Sesi Rehberi

**Marka:** [marka adi]
**Tarih:** ${getDateString()}
**Versiyon:** v1.0

---

## KISILIK
- **3 Sifat:** [sifat1], [sifat2], [sifat3]
- **Insan Karsiligi:** [yas, meslek, kisilik tanimi]
- **Kahraman:** [Biz / Musteri / Topluluk]
- **Uyandirilan Duygu:** [guven / heyecan / huzur / ilham]

## FARKLILIK
- **Rakiplerden Farki:** [tek cumle]
- **Tercih Edilme Sebebi:** [musteri geri bildirimi]

---

## TON SPEKTRUMU (1-10)

| Eksen | Konum | Not |
|-------|-------|-----|
| Resmi <-> Samimi | [1-10] | |
| Ciddi <-> Eglenceli | [1-10] | |
| Teknik <-> Sade | [1-10] | |
| Guvenli <-> Cesur | [1-10] | |
| Kisa <-> Detayli | [1-10] | |
| Sakin <-> Enerjik | [1-10] | |
| Ogrenici <-> Ogreten | [1-10] | |

---

## DIL KURALLARI

### Hitap
- **Sekil:** [sen / siz]
- **Cokluk:** [biz / marka adi / ben]

### Kullanilacak Kelimeler
- [kelime1]
- [kelime2]
- [kelime3]

### Kacinilacak Kelimeler
- [klise1 — ornek: "dunya lideri"]
- [klise2]
- [rakip terimleri]

### Emoji Politikasi
| Platform | Kullanim | Tercih Edilen |
|----------|----------|---------------|
| Instagram | Serbest | |
| Twitter/X | Orta | |
| LinkedIn | Kisitli | |
| TikTok | Serbest | |

### Noktalama
- Unlem: [serbest / sinirli / yok]
- Buyuk harf vurgu: [evet / hayir]
- Hashtag stili: [#kelimekelime / #Kelimekelime]

---

## PLATFORM TONLARI

### Instagram
[ton kaymasi ve ozel notlar]

### Twitter/X
[ton kaymasi ve ozel notlar]

### LinkedIn
[ton kaymasi ve ozel notlar]

### TikTok
[ton kaymasi ve ozel notlar]

### YouTube
[ton kaymasi ve ozel notlar]

---

## ORNEKLER

### Iyi Ornek Post
\`\`\`
[marka sesine tam uyan ornek]
\`\`\`
**Neden iyi:** [aciklama]

### Kotu Ornek Post
\`\`\`
[marka sesine uymayan ornek]
\`\`\`
**Neden kotu:** [aciklama]

---

## KONTROL LISTESI
- [ ] Hitap sekli dogru mu?
- [ ] Emoji politikasina uyuyor mu?
- [ ] Kacinilacak kelimeler icermiyor mu?
- [ ] Platform tonuna uygun mu?
- [ ] Marka kisiligini yansitiyor mu?
- [ ] CTA marka sesine uygun mu?

## META
- **Dosya:** marka-sesi.md
- **Sonraki Guncelleme:** 3 ayda bir veya buyuk degisiklik
- **Tum icerik komutlari bu dosyayi okur.**
`,
	};
}

function runIcerik(args) {
	const subcommand = args[0];

	if (!subcommand || subcommand === "--help" || subcommand === "-h") {
		showBanner();
		console.log(chalk.bold("Icerik Uretim Komutlari:"));
		console.log("");
		console.log(chalk.bold.cyan("Oturum Yonetimi:"));
		console.log(`  ${chalk.cyan("badi icerik basla")}              Gunluk icerik seansini baslat`);
		console.log(`  ${chalk.cyan("badi icerik durum")}              Uretim durumu paneli`);
		console.log(`  ${chalk.cyan("badi icerik plan")}               Haftalik planlama seansi`);
		console.log(`  ${chalk.cyan("badi icerik kapat")}              Gunu kapat ve ozetle`);
		console.log(`  ${chalk.cyan("badi icerik fikir [tur]")}        Fikir uret (post/video/karousel)`);
		console.log(`  ${chalk.cyan("badi icerik ac [filtre]")}        En son icerik dosyasini ac`);
		console.log("");
		console.log(chalk.bold.cyan("Sablon Uretimi:"));
		console.log(`  ${chalk.cyan("badi icerik post [konu]")}        Sosyal medya post sablonu`);
		console.log(`  ${chalk.cyan("badi icerik karousel [konu]")}    Karousel (coklu kare) sablonu`);
		console.log(`  ${chalk.cyan("badi icerik video [konu]")}       Video senaryo sablonu`);
		console.log(`  ${chalk.cyan("badi icerik gorsel [konu]")}      Gorsel brief sablonu`);
		console.log(`  ${chalk.cyan("badi icerik takvim [donem]")}     Icerik takvimi sablonu`);
		console.log(`  ${chalk.cyan("badi icerik marka")}              Marka sesi rehberi sablonu`);
		console.log(`  ${chalk.cyan("badi icerik list")}               Uretilen icerikleri listele`);
		console.log("");
		console.log(chalk.bold("Gunluk Is Akisi:"));
		console.log("  Sabah:  badi icerik basla         # Seansa basla, bugun ne var?");
		console.log('  Uretim: badi icerik post "konu"   # Sablon olustur');
		console.log("  Kontrol: badi icerik durum        # Ne kadar ilerledim?");
		console.log("  Aksam:  badi icerik kapat         # Seansi kapat, yarini planla");
		console.log("");
		console.log(chalk.bold("Ornekler:"));
		console.log("  badi icerik basla");
		console.log('  badi icerik post "yeni urun lansman"');
		console.log('  badi icerik fikir post');
		console.log("  badi icerik ac");
		console.log("");
		console.log(chalk.dim("Not: Sablonlar .claude/workspace/ altina olusturulur."));
		console.log(
			chalk.dim("Tam interaktif akis icin Claude Code'da /icerik-basla, /icerik-durum, /icerik-fikir slash komutlarini kullanin."),
		);
		return;
	}

	// list alt komutu
	if (subcommand === "list") {
		const workspaceBase = join(process.cwd(), ".claude", "workspace");
		if (!existsSync(workspaceBase)) {
			console.log(chalk.dim("Henuz icerik olusturulmamis."));
			console.log(chalk.dim('Basla: badi icerik post "konu"'));
			return;
		}

		showBanner();
		console.log(chalk.bold("Uretilen Icerikler:"));
		console.log("");

		const subdirs = [
			{ dir: "icerikler", label: "Postlar ve Karouseller", icon: "P" },
			{ dir: "senaryolar", label: "Video Senaryolari", icon: "V" },
			{ dir: "gorseller", label: "Gorsel Brifler", icon: "G" },
			{ dir: "takvim", label: "Icerik Takvimleri", icon: "T" },
		];

		let totalFiles = 0;
		for (const { dir, label, icon } of subdirs) {
			const path = join(workspaceBase, dir);
			if (!existsSync(path)) continue;
			const files = readdirSync(path).filter((f) => f.endsWith(".md"));
			if (files.length === 0) continue;

			console.log(chalk.bold(`${label} (${files.length}):`));
			for (const f of files.sort().reverse()) {
				console.log(`  ${chalk.cyan(icon)} ${f}`);
				totalFiles++;
			}
			console.log("");
		}

		// Marka sesi dosyasi
		const markaPath = join(workspaceBase, "marka-sesi.md");
		if (existsSync(markaPath)) {
			console.log(chalk.bold("Marka Sesi:"));
			console.log(`  ${chalk.magenta("M")} marka-sesi.md`);
			console.log("");
			totalFiles++;
		}

		if (totalFiles === 0) {
			console.log(chalk.dim("Henuz icerik olusturulmamis."));
			console.log(chalk.dim('Basla: badi icerik post "konu"'));
		} else {
			console.log(chalk.dim(`Toplam: ${totalFiles} dosya`));
		}
		return;
	}

	// basla alt komutu — gunluk seans baslatici
	if (subcommand === "basla") {
		const workspaceBase = join(process.cwd(), ".claude", "workspace");
		const today = getDateString();
		const dayNames = ["Pazar", "Pazartesi", "Sali", "Carsamba", "Persembe", "Cuma", "Cumartesi"];
		const dayName = dayNames[new Date().getDay()];
		const dayTheme = {
			Pazartesi: "Motivasyon / Hafta basligi",
			Sali: "Egitici / Ipucu",
			Carsamba: "Perde arkasi / Topluluk",
			Persembe: "Urun / Hizmet",
			Cuma: "Eglence / Trend",
			Cumartesi: "UGC / Sosyal kanit",
			Pazar: "Ilham / Haftalik ozet",
		}[dayName];

		showBanner();
		console.log(chalk.bold(`Icerik Seansi — ${today} (${dayName})`));
		console.log("");

		// Marka sesi kontrolu
		const markaPath = join(workspaceBase, "marka-sesi.md");
		const markaVar = existsSync(markaPath);
		console.log(
			`Marka Sesi:  ${markaVar ? chalk.green("yuklendi") : chalk.yellow("eksik — badi icerik marka")}`,
		);

		// Takvim kontrolu
		const takvimDir = join(workspaceBase, "takvim");
		const takvimSayisi = existsSync(takvimDir)
			? readdirSync(takvimDir).filter((f) => f.endsWith(".md")).length
			: 0;
		console.log(
			`Takvim:      ${takvimSayisi > 0 ? chalk.green(`${takvimSayisi} dosya`) : chalk.yellow("yok — badi icerik takvim")}`,
		);

		console.log("");
		console.log(chalk.bold(`Bugunun Temasi (${dayName}):`));
		console.log(`  ${chalk.cyan(dayTheme)}`);
		console.log("");

		// Bekleyen taslaklar (son 7 gun, placeholder iceren)
		console.log(chalk.bold("Bekleyen Taslaklar (son 7 gun):"));
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		const taslakDirs = [
			{ dir: "icerikler", label: "P" },
			{ dir: "senaryolar", label: "V" },
			{ dir: "gorseller", label: "G" },
		];

		let bekleyenSayisi = 0;
		for (const { dir, label } of taslakDirs) {
			const dirPath = join(workspaceBase, dir);
			if (!existsSync(dirPath)) continue;
			const files = readdirSync(dirPath)
				.filter((f) => f.endsWith(".md"))
				.filter((f) => {
					const fullPath = join(dirPath, f);
					const stat = statSync(fullPath);
					if (stat.mtime < sevenDaysAgo) return false;
					const content = readFileSync(fullPath, "utf-8");
					// Placeholder iceren dosyalar taslak sayilir
					return content.includes("[") && (content.includes("placeholder") || content.match(/\[[^\]]+\]/g)?.length > 5);
				});
			for (const f of files) {
				console.log(`  ${chalk.yellow("~")} ${chalk.cyan(label)} ${f}`);
				bekleyenSayisi++;
			}
		}
		if (bekleyenSayisi === 0) {
			console.log(chalk.dim("  (bekleyen taslak yok)"));
		}

		console.log("");
		console.log(chalk.bold("Bugun Odaklanabileceklerin:"));
		console.log(`  1. Bugunun temasina uygun icerik: ${chalk.cyan(`badi icerik post "${dayTheme.toLowerCase()}"`)}`);
		if (bekleyenSayisi > 0) {
			console.log(`  2. Bekleyen ${bekleyenSayisi} taslagi tamamla`);
		}
		console.log(`  3. Fikir uret: ${chalk.cyan("badi icerik fikir")}`);
		console.log(`  4. Durum gor: ${chalk.cyan("badi icerik durum")}`);
		console.log("");
		console.log(chalk.dim("Interaktif seans icin Claude Code'da /icerik-basla komutu."));
		return;
	}

	// durum alt komutu — uretim durum paneli
	if (subcommand === "durum") {
		const workspaceBase = join(process.cwd(), ".claude", "workspace");
		if (!existsSync(workspaceBase)) {
			console.log(chalk.dim("Henuz icerik olusturulmamis. Basla: badi icerik basla"));
			return;
		}

		showBanner();
		console.log(chalk.bold("Icerik Uretim Durumu"));
		console.log(chalk.dim(`${getDateString()} ${new Date().toTimeString().substring(0, 5)}`));
		console.log("");

		const subdirs = ["icerikler", "senaryolar", "gorseller", "takvim"];
		const now = new Date();
		const today = getDateString();
		const startOfWeek = new Date(now);
		startOfWeek.setDate(now.getDate() - now.getDay());
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

		let envanter = { total: 0, bugun: 0, buHafta: 0, buAy: 0, eski: 0 };
		let tamamlanmislik = { tamamlanan: 0, kismi: 0, taslak: 0 };

		for (const dir of subdirs) {
			const dirPath = join(workspaceBase, dir);
			if (!existsSync(dirPath)) continue;
			const files = readdirSync(dirPath).filter((f) => f.endsWith(".md"));
			for (const f of files) {
				const fullPath = join(dirPath, f);
				const stat = statSync(fullPath);
				const content = readFileSync(fullPath, "utf-8");

				envanter.total++;

				// Zaman gruplaması
				const mtime = stat.mtime;
				if (mtime.toISOString().startsWith(today)) envanter.bugun++;
				if (mtime >= startOfWeek) envanter.buHafta++;
				if (mtime >= startOfMonth) envanter.buAy++;

				const daysSince = Math.floor((now - mtime) / (1000 * 60 * 60 * 24));
				if (daysSince > 30) envanter.eski++;

				// Tamamlanmislik analizi (placeholder sayimiyla)
				const placeholders = content.match(/\[[^\]\n]{2,50}\]/g) || [];
				if (placeholders.length === 0) {
					tamamlanmislik.tamamlanan++;
				} else if (placeholders.length < 5) {
					tamamlanmislik.kismi++;
				} else {
					tamamlanmislik.taslak++;
				}
			}
		}

		console.log(chalk.bold("Envanter"));
		console.log(`  Toplam:    ${chalk.cyan(envanter.total)}`);
		console.log(`  Bugun:     ${chalk.cyan(envanter.bugun)}`);
		console.log(`  Bu Hafta:  ${chalk.cyan(envanter.buHafta)}`);
		console.log(`  Bu Ay:     ${chalk.cyan(envanter.buAy)}`);
		console.log(`  Eski (30+): ${chalk.yellow(envanter.eski)}`);
		console.log("");

		console.log(chalk.bold("Tamamlanmislik"));
		const toplam = tamamlanmislik.tamamlanan + tamamlanmislik.kismi + tamamlanmislik.taslak;
		const orani = toplam > 0 ? Math.round((tamamlanmislik.tamamlanan / toplam) * 100) : 0;
		console.log(`  ${chalk.green("Tamamlanan:")} ${tamamlanmislik.tamamlanan}`);
		console.log(`  ${chalk.yellow("Kismi:     ")} ${tamamlanmislik.kismi}`);
		console.log(`  ${chalk.red("Taslak:    ")} ${tamamlanmislik.taslak}`);
		console.log(`  Oran:      ${chalk.cyan(orani)}%`);
		console.log("");

		// Marka sesi durumu
		const markaPath = join(workspaceBase, "marka-sesi.md");
		console.log(chalk.bold("Durum"));
		console.log(
			`  Marka Sesi: ${existsSync(markaPath) ? chalk.green("VAR") : chalk.yellow("YOK")}`,
		);
		console.log("");

		// Uyarilar
		if (envanter.eski > 0) {
			console.log(chalk.yellow(`UYARI: ${envanter.eski} eski (30+ gun) dosya var, gozden gecirin.`));
		}
		if (tamamlanmislik.taslak > tamamlanmislik.tamamlanan) {
			console.log(chalk.yellow("UYARI: Taslak sayisi tamamlanandan fazla, bitirmeye odaklan."));
		}
		if (envanter.bugun === 0) {
			console.log(chalk.dim("BILGI: Bugun henuz icerik uretilmemis. badi icerik basla"));
		}
		console.log("");
		console.log(chalk.dim("Detayli durum icin Claude Code'da /icerik-durum komutu."));
		return;
	}

	// fikir alt komutu — hizli fikir uretici
	if (subcommand === "fikir") {
		const tur = args[1] || "genel";
		showBanner();
		console.log(chalk.bold(`Icerik Fikirleri — ${tur}`));
		console.log("");

		const fikirKategori = {
			post: [
				"X nasil yapilir — adim adim kilavuz",
				"Yaygin yapilan 5 hata ve cozumu",
				"Baslangic icin temel kavramlar",
				"Bu hafta ogrendigim tek sey",
				"Yanlis bilinenler — dogrusu nedir?",
				"Hizli kazanç ipucu",
				"Sorular / cevaplar",
			],
			karousel: [
				"5 ipucu / 5 kural / 5 yontem listesi",
				"Oncesi vs sonrasi karsilastirmasi",
				"X icin 7 adimli kilavuz",
				"Yaygin sorular ve cevaplari (SSS)",
				"Kaynak / arac listesi",
				"Hatalar ve dogrulari",
				"Baslangictan uzmanliga yolculuk",
			],
			video: [
				"30 saniyelik hizli tutorial",
				"Perde arkasi — gunluk rutin",
				"Musteri referansi / basari hikayesi",
				"Trend sesle egitici icerik",
				"Oncesi/sonrasi donusum videosu",
				"Duet / tepki videosu",
				"Live soru-cevap",
			],
			gorsel: [
				"Tipografik alintisozu",
				"Infografik (veri gorselligi)",
				"Urun tanitim minimalist",
				"Oncesi/sonrasi karsilastirma",
				"Adim adim gorsel kilavuz",
				"Moodboard / ilham panosu",
				"Before/after visual",
			],
			genel: [
				"Bugun ogrendigim sey",
				"Sektorumuzdeki populer yanlis bilgi",
				"Aci nokta + cozum",
				"Musteri sorusu + detayli cevap",
				"Basarisizliktan ders",
				"Arac incelemesi / karsilastirma",
				"Trend konu + marka yorumumuz",
				"Topluluk sorusu — herkes cevaplasin",
				"Zaman cizelgesi / gelisim hikayesi",
				"Hizli anket / fikir toplama",
			],
		};

		const fikirler = fikirKategori[tur] || fikirKategori.genel;
		fikirler.forEach((fikir, i) => {
			console.log(`  ${chalk.cyan(`${i + 1}.`)} ${fikir}`);
		});

		console.log("");
		console.log(chalk.bold("Secilen fikri uygulamak icin:"));
		console.log(`  badi icerik ${tur === "genel" ? "post" : tur} "[fikir]"`);
		console.log("");
		console.log(chalk.dim("Marka sesine uygun fikir uretimi icin Claude Code'da /icerik-fikir komutu."));
		return;
	}

	// plan alt komutu — haftalik planlama
	if (subcommand === "plan") {
		showBanner();
		console.log(chalk.bold("Haftalik Icerik Planlama"));
		console.log("");

		// Gelecek haftanin tarih araligi
		const now = new Date();
		const nextMonday = new Date(now);
		const daysUntilMonday = (1 - now.getDay() + 7) % 7 || 7;
		nextMonday.setDate(now.getDate() + daysUntilMonday);
		const nextSunday = new Date(nextMonday);
		nextSunday.setDate(nextMonday.getDate() + 6);

		const formatDate = (d) => d.toISOString().split("T")[0];
		console.log(`Donem: ${chalk.cyan(formatDate(nextMonday))} - ${chalk.cyan(formatDate(nextSunday))}`);
		console.log("");

		console.log(chalk.bold("Haftanin Gun Temalari:"));
		const temalar = [
			["Pazartesi", "Motivasyon / Hafta basligi"],
			["Sali", "Egitici / Ipucu"],
			["Carsamba", "Perde arkasi / Topluluk"],
			["Persembe", "Urun / Hizmet"],
			["Cuma", "Eglence / Trend"],
			["Cumartesi", "UGC / Sosyal kanit"],
			["Pazar", "Ilham / Haftalik ozet"],
		];
		for (const [gun, tema] of temalar) {
			console.log(`  ${chalk.cyan(gun.padEnd(10))} ${tema}`);
		}
		console.log("");

		console.log(chalk.bold("Onerilen Platform Dagilimi (haftalik):"));
		console.log("  Instagram Post:  3-5");
		console.log("  Instagram Reel:  2-3");
		console.log("  Twitter/X:       5-7");
		console.log("  LinkedIn:        2-3");
		console.log("  TikTok:          3-5");
		console.log(chalk.dim("  (kalite > kantite ilkesi)"));
		console.log("");

		console.log(chalk.bold("Sonraki Adimlar:"));
		console.log(`  1. Detayli takvim olustur: ${chalk.cyan(`badi icerik takvim "${formatDate(nextMonday).substring(0, 7)}"`)}`);
		console.log("  2. Her gun icin konu belirle (takvim dosyasini doldur)");
		console.log(`  3. Haftanin ilk icerigini hazirla: ${chalk.cyan('badi icerik post "[konu]"')}`);
		console.log("");
		console.log(chalk.dim("Detayli planlama seansi icin Claude Code'da /icerik-plan komutu."));
		return;
	}

	// kapat alt komutu — gun sonu kapanis
	if (subcommand === "kapat") {
		const workspaceBase = join(process.cwd(), ".claude", "workspace");
		if (!existsSync(workspaceBase)) {
			console.log(chalk.dim("Workspace yok."));
			return;
		}

		showBanner();
		console.log(chalk.bold("Seans Kapanisi"));
		console.log(chalk.dim(getDateString()));
		console.log("");

		// Bugun olusturulan/degistirilen dosyalari bul
		const today = getDateString();
		const subdirs = [
			{ dir: "icerikler", label: "Post/Karousel", icon: "P" },
			{ dir: "senaryolar", label: "Video", icon: "V" },
			{ dir: "gorseller", label: "Gorsel", icon: "G" },
			{ dir: "takvim", label: "Takvim", icon: "T" },
		];

		let bugunDosyalar = [];
		for (const { dir, label, icon } of subdirs) {
			const dirPath = join(workspaceBase, dir);
			if (!existsSync(dirPath)) continue;
			const files = readdirSync(dirPath).filter((f) => f.endsWith(".md"));
			for (const f of files) {
				const fullPath = join(dirPath, f);
				const stat = statSync(fullPath);
				const mtimeDate = stat.mtime.toISOString().split("T")[0];
				if (mtimeDate === today) {
					const content = readFileSync(fullPath, "utf-8");
					const placeholders = content.match(/\[[^\]\n]{2,50}\]/g) || [];
					const durum = placeholders.length === 0 ? "TAMAMLANAN" : placeholders.length < 5 ? "KISMI" : "TASLAK";
					bugunDosyalar.push({ dosya: f, label, icon, durum, placeholders: placeholders.length });
				}
			}
		}

		if (bugunDosyalar.length === 0) {
			console.log(chalk.dim("Bugun hicbir icerik uretilmedi."));
			console.log(chalk.dim("Yarin icin basla: badi icerik basla"));
			return;
		}

		console.log(chalk.bold(`Bugun Uretilenler (${bugunDosyalar.length}):`));
		const tamamlanan = bugunDosyalar.filter((d) => d.durum === "TAMAMLANAN");
		const kismi = bugunDosyalar.filter((d) => d.durum === "KISMI");
		const taslak = bugunDosyalar.filter((d) => d.durum === "TASLAK");

		if (tamamlanan.length > 0) {
			console.log(chalk.green(`\nTAMAMLANAN (${tamamlanan.length}):`));
			for (const d of tamamlanan) {
				console.log(`  ${chalk.green("+")} ${chalk.cyan(d.icon)} ${d.dosya}`);
			}
		}
		if (kismi.length > 0) {
			console.log(chalk.yellow(`\nKISMI (${kismi.length}):`));
			for (const d of kismi) {
				console.log(`  ${chalk.yellow("~")} ${chalk.cyan(d.icon)} ${d.dosya} ${chalk.dim(`(${d.placeholders} yer tutucu)`)}`);
			}
		}
		if (taslak.length > 0) {
			console.log(chalk.red(`\nTASLAK (${taslak.length}):`));
			for (const d of taslak) {
				console.log(`  ${chalk.red("!")} ${chalk.cyan(d.icon)} ${d.dosya} ${chalk.dim(`(${d.placeholders} yer tutucu)`)}`);
			}
		}

		console.log("");
		console.log(chalk.bold("Yarin Icin:"));
		if (kismi.length + taslak.length > 0) {
			console.log(`  1. Bekleyen ${kismi.length + taslak.length} taslagi tamamla`);
		}
		console.log("  2. Yarinki temaya gore yeni icerik uret");
		console.log("  3. Sabahleyin: badi icerik basla");
		console.log("");
		console.log(chalk.dim("Detayli kapanis ritueli icin Claude Code'da /icerik-kapat komutu."));
		return;
	}

	// ac alt komutu — en son icerik dosyasini ac
	if (subcommand === "ac") {
		const workspaceBase = join(process.cwd(), ".claude", "workspace");
		if (!existsSync(workspaceBase)) {
			console.log(chalk.dim("Workspace yok. Once icerik uret: badi icerik post \"konu\""));
			return;
		}

		const filtre = args[1] || "";
		const subdirs = ["icerikler", "senaryolar", "gorseller", "takvim"];
		let allFiles = [];
		for (const dir of subdirs) {
			const dirPath = join(workspaceBase, dir);
			if (!existsSync(dirPath)) continue;
			const files = readdirSync(dirPath).filter((f) => f.endsWith(".md"));
			for (const f of files) {
				if (filtre && !f.toLowerCase().includes(filtre.toLowerCase())) continue;
				const fullPath = join(dirPath, f);
				const stat = statSync(fullPath);
				allFiles.push({ path: fullPath, name: f, mtime: stat.mtime, dir });
			}
		}

		// Marka sesi de dahil
		const markaPath = join(workspaceBase, "marka-sesi.md");
		if (existsSync(markaPath) && (!filtre || "marka".includes(filtre.toLowerCase()))) {
			const stat = statSync(markaPath);
			allFiles.push({ path: markaPath, name: "marka-sesi.md", mtime: stat.mtime, dir: "workspace" });
		}

		if (allFiles.length === 0) {
			console.log(chalk.yellow(`Filtreye uyan dosya bulunamadi${filtre ? ` ("${filtre}")` : ""}.`));
			console.log(chalk.dim("Dosya listesi icin: badi icerik list"));
			return;
		}

		// En son degistirilen dosyayi sec
		allFiles.sort((a, b) => b.mtime - a.mtime);
		const latest = allFiles[0];
		const relPath = relative(process.cwd(), latest.path);

		console.log(chalk.bold("En son icerik dosyasi:"));
		console.log(`  ${chalk.cyan(relPath)}`);
		console.log(chalk.dim(`  Son degisiklik: ${latest.mtime.toISOString().substring(0, 16).replace("T", " ")}`));
		console.log("");

		// Editor ile acma denemesi
		const editor = process.env.EDITOR || process.env.VISUAL;
		if (editor) {
			console.log(chalk.dim(`Acmak icin: ${editor} ${relPath}`));
		} else {
			console.log(chalk.dim("EDITOR degiskeni tanimli degil. Dosyayi manuel acin:"));
			console.log(chalk.dim(`  open ${relPath}     # macOS`));
			console.log(chalk.dim(`  code ${relPath}     # VS Code`));
		}

		// Dosya icerigini gostermek istiyorsa
		if (args.includes("--cat") || args.includes("-c")) {
			console.log("");
			console.log(chalk.bold("Icerik:"));
			console.log(chalk.dim("─".repeat(50)));
			console.log(readFileSync(latest.path, "utf-8"));
			console.log(chalk.dim("─".repeat(50)));
		}
		return;
	}

	// perf alt komutu — icerik performans takibi
	if (subcommand === "perf") {
		const perfFile = join(process.cwd(), ".claude", "workspace", "performans.jsonl");
		const perfSub = args[1];

		// Yardimci: performans logunu oku
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

		// Help
		if (perfSub === "--help" || perfSub === "-h") {
			console.log(chalk.bold("Icerik Performans Takibi:"));
			console.log("");
			console.log(`  badi icerik perf                      ${chalk.dim("Haftalik ozet (varsayilan)")}`);
			console.log(`  badi icerik perf add [secenekler]     ${chalk.dim("Performans verisi ekle")}`);
			console.log(`  badi icerik perf list                 ${chalk.dim("Tum kayitlari listele")}`);
			console.log("");
			console.log(chalk.bold("Perf Add Secenekleri:"));
			console.log("  --file <dosya>       Icerik dosya adi");
			console.log("  --platform <ad>      Platform (instagram/twitter/linkedin/tiktok/facebook)");
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

		// perf add
		if (perfSub === "add") {
			const perfArgs = args.slice(2);
			const entry = { timestamp: new Date().toISOString(), date: getDateString() };

			for (let i = 0; i < perfArgs.length; i++) {
				switch (perfArgs[i]) {
					case "--file":
						entry.file = perfArgs[++i];
						break;
					case "--platform":
						entry.platform = perfArgs[++i];
						break;
					case "--likes":
						entry.likes = Number.parseInt(perfArgs[++i]) || 0;
						break;
					case "--comments":
						entry.comments = Number.parseInt(perfArgs[++i]) || 0;
						break;
					case "--shares":
						entry.shares = Number.parseInt(perfArgs[++i]) || 0;
						break;
					case "--saves":
						entry.saves = Number.parseInt(perfArgs[++i]) || 0;
						break;
					case "--reach":
						entry.reach = Number.parseInt(perfArgs[++i]) || 0;
						break;
					case "--effort":
						entry.effort = Number.parseFloat(perfArgs[++i]) || 0;
						break;
				}
			}

			if (!entry.file || !entry.platform) {
				console.error(chalk.red("Eksik parametre: --file ve --platform zorunlu"));
				console.log("Ornek: badi icerik perf add --file test.md --platform instagram --likes 100");
				process.exit(1);
			}

			const dir = join(process.cwd(), ".claude", "workspace");
			mkdirSync(dir, { recursive: true });

			const line = JSON.stringify(entry);
			if (existsSync(perfFile)) {
				writeFileSync(perfFile, readFileSync(perfFile, "utf-8") + line + "\n");
			} else {
				writeFileSync(perfFile, line + "\n");
			}

			const engagement = (entry.likes || 0) + (entry.comments || 0) + (entry.shares || 0) + (entry.saves || 0);
			console.log(chalk.bold.green("Performans verisi kaydedildi!"));
			console.log(`  Dosya:     ${chalk.cyan(entry.file)}`);
			console.log(`  Platform:  ${chalk.cyan(entry.platform)}`);
			console.log(`  Etkilesim: ${chalk.cyan(engagement)}`);
			if (entry.reach) console.log(`  Erisim:    ${chalk.cyan(entry.reach)}`);
			return;
		}

		// perf list
		if (perfSub === "list") {
			const entries = readPerfLog();
			if (entries.length === 0) {
				console.log(chalk.yellow("Henuz performans verisi yok."));
				console.log(chalk.dim("Veri ekle: badi icerik perf add --file X --platform Y --likes N"));
				return;
			}

			console.log(chalk.bold("Performans Kayitlari:"));
			console.log("");
			console.log(
				`  ${chalk.dim("Tarih".padEnd(12))}${chalk.dim("Platform".padEnd(12))}${chalk.dim("Dosya".padEnd(30))}${chalk.dim("Begeni".padEnd(8))}${chalk.dim("Yorum".padEnd(8))}${chalk.dim("Erisim")}`,
			);
			console.log(chalk.dim("  " + "─".repeat(78)));

			for (const e of entries) {
				console.log(
					`  ${(e.date || "").padEnd(12)}${(e.platform || "").padEnd(12)}${(e.file || "").substring(0, 28).padEnd(30)}${String(e.likes || 0).padEnd(8)}${String(e.comments || 0).padEnd(8)}${e.reach || "-"}`,
				);
			}
			return;
		}

		// Rapor bayraklarini parse et
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
			console.log(chalk.dim("Veri ekle: badi icerik perf add --file X --platform Y --likes N"));
			return;
		}

		// Donem filtresi
		const cutoffMs = perfPeriod === "month" ? 30 * 86400000 : 7 * 86400000;
		const cutoffDate = new Date(Date.now() - cutoffMs);
		entries = entries.filter((e) => new Date(e.date || e.timestamp) >= cutoffDate);

		if (perfPlatformFilter) {
			entries = entries.filter((e) => (e.platform || "").toLowerCase() === perfPlatformFilter.toLowerCase());
		}

		if (entries.length === 0) {
			console.log(chalk.yellow("Secilen donemde veri yok."));
			return;
		}

		// Trend analizi
		if (showTrend) {
			showBanner();
			console.log(chalk.bold("Trend Analizi"));
			console.log("");

			// Onceki ve mevcut donem karsilastirmasi
			const halfMs = cutoffMs / 2;
			const halfDate = new Date(Date.now() - halfMs);
			const allInRange = readPerfLog().filter((e) => new Date(e.date || e.timestamp) >= cutoffDate);
			const onceki = allInRange.filter((e) => new Date(e.date || e.timestamp) < halfDate);
			const mevcut = allInRange.filter((e) => new Date(e.date || e.timestamp) >= halfDate);

			const engOf = (arr) => arr.reduce((s, e) => s + (e.likes || 0) + (e.comments || 0) + (e.shares || 0) + (e.saves || 0), 0);
			const oncekiEng = engOf(onceki);
			const mevcutEng = engOf(mevcut);
			const change = oncekiEng > 0 ? Math.round(((mevcutEng - oncekiEng) / oncekiEng) * 100) : 0;
			const arrow = change >= 0 ? chalk.green(`↑ %${change}`) : chalk.red(`↓ %${Math.abs(change)}`);

			console.log(`  Onceki donem:  ${chalk.dim(onceki.length)} icerik, ${chalk.dim(oncekiEng)} etkilesim`);
			console.log(`  Mevcut donem:  ${chalk.dim(mevcut.length)} icerik, ${chalk.dim(mevcutEng)} etkilesim`);
			console.log(`  Degisim:       ${arrow}`);
			console.log("");

			// Platform bazli trend
			const platforms = [...new Set(allInRange.map((e) => e.platform))];
			if (platforms.length > 1) {
				console.log(chalk.bold("Platform Bazli:"));
				for (const p of platforms) {
					const pOnceki = engOf(onceki.filter((e) => e.platform === p));
					const pMevcut = engOf(mevcut.filter((e) => e.platform === p));
					const pChange = pOnceki > 0 ? Math.round(((pMevcut - pOnceki) / pOnceki) * 100) : 0;
					const pArrow = pChange >= 0 ? chalk.green(`↑ %${pChange}`) : chalk.red(`↓ %${Math.abs(pChange)}`);
					console.log(`  ${(p || "").padEnd(15)} ${pArrow}`);
				}
			}
			return;
		}

		// ROI analizi
		if (showRoi) {
			showBanner();
			console.log(chalk.bold("ROI Analizi (Etkilesim / Efor)"));
			console.log("");

			const byType = {};
			for (const e of entries) {
				const platform = e.platform || "diger";
				if (!byType[platform]) byType[platform] = { count: 0, engagement: 0, effort: 0 };
				byType[platform].count++;
				byType[platform].engagement += (e.likes || 0) + (e.comments || 0) + (e.shares || 0) + (e.saves || 0);
				byType[platform].effort += e.effort || 0;
			}

			console.log(
				`  ${chalk.dim("Platform".padEnd(15))}${chalk.dim("Icerik".padEnd(8))}${chalk.dim("Etkilesim".padEnd(12))}${chalk.dim("Efor(s)".padEnd(10))}${chalk.dim("ROI")}`,
			);
			console.log(chalk.dim("  " + "─".repeat(55)));

			const sorted = Object.entries(byType).sort((a, b) => {
				const roiA = a[1].effort > 0 ? a[1].engagement / a[1].effort : a[1].engagement;
				const roiB = b[1].effort > 0 ? b[1].engagement / b[1].effort : b[1].engagement;
				return roiB - roiA;
			});

			for (const [platform, data] of sorted) {
				const roi = data.effort > 0 ? (data.engagement / data.effort).toFixed(1) : "-";
				console.log(
					`  ${platform.padEnd(15)}${String(data.count).padEnd(8)}${String(data.engagement).padEnd(12)}${String(data.effort || "-").padEnd(10)}${chalk.bold(roi)}`,
				);
			}
			return;
		}

		// Varsayilan: haftalik/aylik ozet
		showBanner();
		const periodLabel = perfPeriod === "month" ? "Son 30 gun" : "Son 7 gun";
		console.log(chalk.bold("Icerik Performans Raporu"));
		console.log(`Donem: ${chalk.cyan(periodLabel)}`);
		if (perfPlatformFilter) console.log(`Platform: ${chalk.cyan(perfPlatformFilter)}`);
		console.log("");

		// Platform bazli ozet tablo
		const platformData = {};
		for (const e of entries) {
			const p = e.platform || "diger";
			if (!platformData[p]) platformData[p] = { count: 0, likes: 0, comments: 0, shares: 0, saves: 0, reach: 0 };
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
		console.log(chalk.dim("  " + "─".repeat(63)));

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

		console.log(chalk.dim("  " + "─".repeat(63)));
		console.log(
			chalk.bold(
				`  ${"Toplam".padEnd(15)}${String(entries.length).padEnd(8)}${String(totalLikes).padEnd(10)}${String(totalComments).padEnd(10)}${String(totalSaves).padEnd(10)}${totalReach}`,
			),
		);
		console.log("");

		// En iyi performans
		const bestEntry = entries.reduce((best, e) => {
			const eng = (e.likes || 0) + (e.comments || 0) + (e.shares || 0) + (e.saves || 0);
			const bestEng = (best.likes || 0) + (best.comments || 0) + (best.shares || 0) + (best.saves || 0);
			return eng > bestEng ? e : best;
		}, entries[0]);

		if (bestEntry) {
			const bestEng = (bestEntry.likes || 0) + (bestEntry.comments || 0) + (bestEntry.shares || 0) + (bestEntry.saves || 0);
			console.log(chalk.bold("En Iyi Performans:"));
			console.log(`  ${chalk.cyan(bestEntry.file || "?")} (${bestEntry.platform || "?"})`);
			console.log(`  Etkilesim: ${chalk.bold(bestEng)}  Erisim: ${chalk.bold(bestEntry.reach || "-")}`);
		}
		return;
	}

	// Sablon turu + konu
	const templates = contentTemplates();
	const validTypes = ["post", "karousel", "video", "gorsel", "takvim", "marka"];

	if (!validTypes.includes(subcommand)) {
		console.error(chalk.red(`Bilinmeyen icerik turu: ${subcommand}`));
		console.log(`Gecerli turler: ${validTypes.join(", ")}`);
		console.log("Yardim: badi icerik --help");
		process.exit(1);
	}

	const konu = args.slice(1).join(" ") || "yeni-icerik";
	const dateStr = getDateString();
	const konuSlug = slugify(konu);

	// Hedef dizin ve dosya adi
	let subdir;
	let fileName;
	let content;

	switch (subcommand) {
		case "post":
			subdir = "icerikler";
			fileName = `${dateStr}-${konuSlug}.md`;
			content = templates.post(konu);
			break;
		case "karousel":
			subdir = "icerikler";
			fileName = `${dateStr}-karousel-${konuSlug}.md`;
			content = templates.karousel(konu);
			break;
		case "video":
			subdir = "senaryolar";
			fileName = `${dateStr}-${konuSlug}.md`;
			content = templates.video(konu);
			break;
		case "gorsel":
			subdir = "gorseller";
			fileName = `${dateStr}-${konuSlug}-brief.md`;
			content = templates.gorsel(konu);
			break;
		case "takvim":
			subdir = "takvim";
			fileName = `${dateStr}-takvim-${konuSlug}.md`;
			content = templates.takvim(konu);
			break;
		case "marka": {
			// Marka sesi dogrudan workspace altina
			const workspaceBase = join(process.cwd(), ".claude", "workspace");
			if (!existsSync(workspaceBase)) mkdirSync(workspaceBase, { recursive: true });
			const markaPath = join(workspaceBase, "marka-sesi.md");
			if (existsSync(markaPath)) {
				console.error(chalk.yellow("marka-sesi.md zaten mevcut."));
				console.log(`Konum: ${markaPath}`);
				console.log(chalk.dim("Duzenlemek icin dosyayi acin veya silin ve tekrar calistirin."));
				process.exit(1);
			}
			writeFileSync(markaPath, templates.marka());
			showBanner();
			console.log(chalk.bold.green("Marka sesi rehberi olusturuldu!"));
			console.log(`Dosya: ${chalk.cyan(relative(process.cwd(), markaPath))}`);
			console.log("");
			console.log(chalk.dim("Bu dosya tum icerik komutlari tarafindan otomatik okunur."));
			return;
		}
	}

	const targetDir = getIcerikWorkspace(subdir);
	const targetPath = join(targetDir, fileName);

	if (existsSync(targetPath)) {
		console.error(chalk.yellow(`Dosya zaten mevcut: ${relative(process.cwd(), targetPath)}`));
		console.log(chalk.dim("Baska bir konu ile deneyin veya mevcut dosyayi silin."));
		process.exit(1);
	}

	writeFileSync(targetPath, content);

	showBanner();
	console.log(chalk.bold.green(`${subcommand.toUpperCase()} sablonu olusturuldu!`));
	console.log(`Konu: ${chalk.cyan(konu)}`);
	console.log(`Dosya: ${chalk.cyan(relative(process.cwd(), targetPath))}`);
	console.log("");
	console.log(chalk.bold("Sonraki adimlar:"));
	console.log("  1. Dosyayi ac ve placeholder'lari doldur");
	console.log("  2. Marka sesi rehberini kontrol et: .claude/workspace/marka-sesi.md");
	console.log(
		`  3. Tam interaktif akis icin Claude Code'da ${chalk.cyan("/" + (subcommand === "post" ? "icerik-uret" : subcommand === "video" ? "video-senaryo" : subcommand === "gorsel" ? "gorsel-brief" : subcommand === "takvim" ? "icerik-takvimi" : subcommand === "karousel" ? "karousel" : "icerik-uret"))}`,
	);
}

// ─── Ana Giris Noktasi ───

const updatePromise = checkForUpdate();
const [, , command, ...args] = process.argv;

switch (command) {
	case "init":
		runInit(args);
		break;
	case "update":
		runUpdate(args);
		break;
	case "doctor":
		runDoctor(args);
		break;
	case "list":
		runList(args);
		break;
	case "plugin":
		runPlugin(args);
		break;
	case "icerik":
		runIcerik(args);
		break;
	case "stats":
		runStats(args);
		break;
	case "completion":
		runCompletion(args);
		break;
	case "--version":
	case "-v":
		showVersion();
		break;
	case "--help":
	case "-h":
	case "help":
		showHelp();
		break;
	case undefined:
		showHelp();
		break;
	default:
		console.error(chalk.red(`Bilinmeyen komut: ${command}`));
		console.error(`Yardim icin ${chalk.cyan('"badi --help"')} komutunu kullanin.`);
		process.exit(1);
}

updatePromise.then(showUpdateBanner).catch(() => {});
