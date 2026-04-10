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

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
const PKG_ROOT = resolve(__dirname, "..");
const TEMPLATE_DIR = join(PKG_ROOT, ".claude");
const VERSION = "1.0.0";

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
}

function showVersion() {
	console.log(`badi v${VERSION}`);
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
		console.log(`  ${chalk.cyan("badi icerik post [konu]")}        Sosyal medya post sablonu`);
		console.log(`  ${chalk.cyan("badi icerik karousel [konu]")}    Karousel (coklu kare) sablonu`);
		console.log(`  ${chalk.cyan("badi icerik video [konu]")}       Video senaryo sablonu`);
		console.log(`  ${chalk.cyan("badi icerik gorsel [konu]")}      Gorsel brief sablonu`);
		console.log(`  ${chalk.cyan("badi icerik takvim [donem]")}     Icerik takvimi sablonu`);
		console.log(`  ${chalk.cyan("badi icerik marka")}              Marka sesi rehberi sablonu`);
		console.log(`  ${chalk.cyan("badi icerik list")}               Uretilen icerikleri listele`);
		console.log("");
		console.log(chalk.bold("Ornekler:"));
		console.log('  badi icerik post "yeni urun lansman"');
		console.log('  badi icerik karousel "5 uretkenlik ipucu"');
		console.log('  badi icerik video "30 saniye tutorial"');
		console.log('  badi icerik gorsel "sabah rutini post"');
		console.log('  badi icerik takvim "2026-04"');
		console.log("  badi icerik marka");
		console.log("");
		console.log(chalk.dim("Not: Sablonlar .claude/workspace/ altina olusturulur."));
		console.log(
			chalk.dim("Tam interaktif akis icin Claude Code'da /icerik-uret, /karousel, /video-senaryo komutlarini kullanin."),
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
