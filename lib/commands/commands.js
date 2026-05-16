// Badi commands komutu — profil bazli komut yonetimi.
//
// .claude/commands-vault/  → tum komutlar (Claude Code yuklemez)
// .claude/commands/        → aktif profil komutlari (Claude Code yukler)
//
// Profil etiketleri: core, dev, content, pentest, all
// "core" her profilde aktif kalir, "all" hepsini acar.

import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { chalk } from "../cli.js";
import {
	COMMAND_PROFILES,
	commandsForProfile,
	PROFILES,
	profileCounts,
} from "../command-profiles.js";
import {
	buildCommandHint,
	buildCommandIndex,
	routePrompt,
} from "../skills-router.js";

function paths(target) {
	const claudeDir = join(target, ".claude");
	return {
		claudeDir,
		vault: join(claudeDir, "commands-vault"),
		active: join(claudeDir, "commands"),
		state: join(claudeDir, "commands.profile.json"),
	};
}

function readProfileState(statePath) {
	if (!existsSync(statePath)) return { profile: "all", updatedAt: null };
	try {
		return JSON.parse(readFileSync(statePath, "utf-8"));
	} catch {
		return { profile: "all", updatedAt: null };
	}
}

function writeProfileState(statePath, profile) {
	writeFileSync(
		statePath,
		`${JSON.stringify({ profile, updatedAt: new Date().toISOString() }, null, 2)}\n`,
	);
}

function listMarkdownFiles(dir) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((f) => f.endsWith(".md"))
		.map((f) => f.replace(/\.md$/, ""))
		.sort();
}

function ensureDir(dir) {
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

/**
 * Mevcut .claude/commands/ icerigini vault'a kopyala.
 * Vault'ta zaten varsa uzerine yazmaz (canonical-vault prensibi).
 * Geri dondurur: { migrated, skipped }
 */
function migrateToVault(active, vault) {
	ensureDir(vault);
	const sources = listMarkdownFiles(active);
	let migrated = 0;
	let skipped = 0;
	for (const name of sources) {
		const src = join(active, `${name}.md`);
		const dst = join(vault, `${name}.md`);
		if (existsSync(dst)) {
			skipped++;
			continue;
		}
		copyFileSync(src, dst);
		migrated++;
	}
	return { migrated, skipped };
}

/**
 * Profil degisikligini uygula:
 *  - Vault'taki tum komutlardan, hedef profile uyanlari .claude/commands/'a
 *    kopyala (yoksa).
 *  - Profil disinda kalan komutlari .claude/commands/'tan sil.
 *  - "all" profil = vault icerigini tam yansit.
 *  - Bilinmeyen komutlara (vault'ta olmayan) dokunma (kullanici komutu).
 *
 * Geri dondurur: { added: [], removed: [] }
 */
function applyProfile(vault, active, profile) {
	ensureDir(active);
	const vaultCmds = listMarkdownFiles(vault);
	const activeCmds = listMarkdownFiles(active);
	const targetSet = new Set(commandsForProfile(profile));

	const added = [];
	const removed = [];

	// Eksikleri ekle
	for (const name of vaultCmds) {
		if (profile === "all" || targetSet.has(name)) {
			if (!activeCmds.includes(name)) {
				copyFileSync(join(vault, `${name}.md`), join(active, `${name}.md`));
				added.push(name);
			}
		}
	}

	// Profil disindakileri sil (sadece COMMAND_PROFILES'ta tanimli olanlari)
	for (const name of activeCmds) {
		if (!COMMAND_PROFILES[name]) continue; // bilinmeyen = kullanici komutu, dokunma
		if (profile === "all") continue;
		if (!targetSet.has(name)) {
			rmSync(join(active, `${name}.md`));
			removed.push(name);
		}
	}

	return { added: added.sort(), removed: removed.sort() };
}

function promptChoice(message) {
	return new Promise((resolve) => {
		const rl = createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		rl.question(message, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
}

function showHelp() {
	console.log(chalk.bold("Commands Yonetimi (Profil bazli, v1.26+):"));
	console.log("");
	console.log(chalk.bold("Durum / Listeleme:"));
	console.log(
		"  badi commands                    Aktif profil + komut sayilari",
	);
	console.log(
		"  badi commands list               Aktif komutlari ve profillerini listele",
	);
	console.log(
		"  badi commands available          Vault'taki tum komutlari listele",
	);
	console.log(
		"  badi commands profiles           Profil tanimlarini ve sayilarini goster",
	);
	console.log("");
	console.log(chalk.bold("Profil Yonetimi:"));
	console.log(`  badi commands profile            Aktif profili goster`);
	console.log(
		`  badi commands profile <ad>       Profili degistir (${PROFILES.join("|")})`,
	);
	console.log(
		"  badi commands migrate            Mevcut commands/'i vault'a kopyala (ilk kurulum)",
	);
	console.log(
		"  badi commands restore            Tum profili 'all'a sifirla (commands/'a tum vault'u koy)",
	);
	console.log("");
	console.log(chalk.bold("Prompt-Aware Routing (v1.26+):"));
	console.log(
		'  badi commands route "<prompt>"   Prompt\'a uyan komutlari skorla',
	);
	console.log("  badi commands route < file.txt   Stdin'den prompt oku");
	console.log("");
	console.log(chalk.bold("Profil komutu flag'leri:"));
	console.log(
		"  --yes, -y          Onay sormadan uygula (CI/non-TTY icin gerekli)",
	);
	console.log("  --dry-run          Sadece preview, dosyaya yazma");
	console.log(
		"  --force            Ayni profile yeniden uygula (cache temizleme)",
	);
	console.log(
		"  --verbose, -v      Eklenecek/silinecek komutlari isim-isim listele",
	);
	console.log("");
	console.log(chalk.bold("Route komutu flag'leri:"));
	console.log("  --top N            En iyi N eslesme (default: 3)");
	console.log("  --inject           Hook formatinda hint blob'u stdout'a yaz");
	console.log(
		"  --json             JSON cikti (matched/contextLength alanlari)",
	);
	console.log("");
	console.log(chalk.bold("Profil mantigi:"));
	console.log("  core    — her zaman aktif (oturum, olcum, audit)");
	console.log("  dev     — kod, devops, security, audit araclari");
	console.log("  content — sosyal medya, marka, icerik takvimi");
	console.log("  pentest — yetkili pentest engagement (gelecek)");
	console.log("  all     — hepsi (default)");
	console.log("");
	console.log(chalk.bold("Ornekler:"));
	console.log(chalk.dim("  badi commands profile content --yes"));
	console.log(chalk.dim("  badi commands profile dev --dry-run --verbose"));
	console.log(chalk.dim('  badi commands route "yeni post yaz" --top 5'));
	console.log(chalk.dim('  badi commands route "react bug fix" --json'));
	console.log(
		chalk.dim('  echo "release plan" | badi commands route --inject'),
	);
	console.log("");
	console.log(
		chalk.dim(
			"Not: profile degistirmek .claude/commands/ icerigini fiziksel olarak duzenler.",
		),
	);
	console.log(
		chalk.dim(
			"     Vault canonical kalir; profili her zaman 'all'a geri dondurebilirsin.",
		),
	);
	console.log(
		chalk.dim("     Vault disindaki (kullanici) komutlara dokunulmaz."),
	);
}

function status(target) {
	const { vault, active, state } = paths(target);
	if (!existsSync(vault)) {
		console.log(
			chalk.yellow("Vault olusmamis. Ilk kurulum: badi commands migrate"),
		);
		return;
	}
	const vaultCmds = listMarkdownFiles(vault);
	const activeCmds = listMarkdownFiles(active);
	const { profile } = readProfileState(state);
	const counts = profileCounts();
	console.log(chalk.bold("Commands Durumu"));
	console.log("");
	console.log(`  Aktif profil   : ${chalk.cyan(profile)}`);
	console.log(`  Vault toplam   : ${vaultCmds.length} komut`);
	console.log(`  Aktif toplam   : ${activeCmds.length} komut`);
	console.log("");
	console.log(chalk.bold("Profil sayilari (vault'tan):"));
	console.log(`  core    ${chalk.green(counts.core)}`);
	console.log(`  dev     ${chalk.cyan(counts.dev)}`);
	console.log(`  content ${chalk.magenta(counts.content)}`);
	console.log(`  pentest ${chalk.yellow(counts.pentest)}`);
	console.log("");
	console.log(
		chalk.dim("Profil degistir: badi commands profile <core|dev|content|all>"),
	);
}

function listActive(target) {
	const { active, state } = paths(target);
	const cmds = listMarkdownFiles(active);
	const { profile } = readProfileState(state);
	console.log(
		chalk.bold(`Aktif komutlar (${cmds.length}) — profil: ${profile}`),
	);
	console.log("");
	for (const name of cmds) {
		const p = COMMAND_PROFILES[name] || "user";
		const color =
			p === "core"
				? chalk.green
				: p === "dev"
					? chalk.cyan
					: p === "content"
						? chalk.magenta
						: p === "pentest"
							? chalk.yellow
							: chalk.dim;
		console.log(`  ${color(`[${p}]`.padEnd(10))} ${name}`);
	}
}

function listAvailable(target) {
	const { vault } = paths(target);
	if (!existsSync(vault)) {
		console.log(
			chalk.yellow("Vault olusmamis. Ilk kurulum: badi commands migrate"),
		);
		return;
	}
	const cmds = listMarkdownFiles(vault);
	console.log(chalk.bold(`Vault icerigi (${cmds.length}):`));
	console.log("");
	for (const name of cmds) {
		const p = COMMAND_PROFILES[name] || "user";
		console.log(`  ${chalk.dim(`[${p}]`.padEnd(10))} ${name}`);
	}
}

function showProfiles() {
	const counts = profileCounts();
	const total = Object.values(counts).reduce((a, b) => a + b, 0);
	console.log(chalk.bold("Profil Tanimlari"));
	console.log("");
	console.log(
		`  ${chalk.green("core")}    ${counts.core} komut — her zaman aktif`,
	);
	console.log(
		`  ${chalk.cyan("dev")}     ${counts.dev} komut — gelistirme/devops/audit`,
	);
	console.log(
		`  ${chalk.magenta("content")} ${counts.content} komut — sosyal medya/marka/icerik`,
	);
	console.log(
		`  ${chalk.yellow("pentest")} ${counts.pentest} komut — yetkili pentest (gelecek)`,
	);
	console.log("");
	console.log(`  Toplam tanimli: ${total} komut`);
}

async function switchProfile(target, profile, opts = {}) {
	if (!PROFILES.includes(profile)) {
		console.error(chalk.red(`Bilinmeyen profil: ${profile}`));
		console.error(chalk.dim(`Gecerli profiller: ${PROFILES.join(", ")}`));
		process.exitCode = 1;
		return;
	}
	const { vault, active, state } = paths(target);
	if (!existsSync(vault)) {
		console.error(
			chalk.red("Vault olusmamis. Ilk kurulum icin: badi commands migrate"),
		);
		process.exitCode = 1;
		return;
	}

	const current = readProfileState(state).profile;
	if (current === profile && !opts.force) {
		console.log(chalk.green(`✓ Zaten ${profile} profilindesin.`));
		console.log(
			chalk.dim(
				"Yeniden uygulamak icin: badi commands profile " + profile + " --force",
			),
		);
		return;
	}

	// Dry-run preview
	const vaultCmds = listMarkdownFiles(vault);
	const activeCmds = listMarkdownFiles(active);
	const targetSet = new Set(commandsForProfile(profile));
	const willAdd = vaultCmds.filter(
		(n) => (profile === "all" || targetSet.has(n)) && !activeCmds.includes(n),
	);
	const willRemove = activeCmds.filter(
		(n) => COMMAND_PROFILES[n] && profile !== "all" && !targetSet.has(n),
	);

	console.log(chalk.bold(`Profil: ${current} → ${profile}`));
	console.log("");
	if (willAdd.length > 0) {
		console.log(chalk.green(`  + ${willAdd.length} komut eklenecek`));
		if (opts.verbose) for (const n of willAdd) console.log(`     + ${n}`);
	}
	if (willRemove.length > 0) {
		console.log(chalk.red(`  − ${willRemove.length} komut kaldirilacak`));
		if (opts.verbose) for (const n of willRemove) console.log(`     − ${n}`);
	}
	if (willAdd.length === 0 && willRemove.length === 0) {
		console.log(chalk.dim("  Degisiklik yok."));
		writeProfileState(state, profile);
		return;
	}

	if (opts.dryRun) {
		console.log("");
		console.log(chalk.dim("--dry-run aktif: dosyaya yazilmadi."));
		return;
	}

	if (!opts.yes) {
		if (!process.stdin.isTTY) {
			console.error(chalk.red("Non-TTY: --yes kullan veya TTY'de calistir."));
			process.exitCode = 1;
			return;
		}
		const ans = await promptChoice("Onayliyor musun? [e/H] ");
		if (!/^(e|y|yes|evet)$/i.test(ans)) {
			console.log(chalk.dim("Iptal edildi."));
			return;
		}
	}

	const result = applyProfile(vault, active, profile);
	writeProfileState(state, profile);
	console.log("");
	console.log(
		chalk.green(
			`✓ Profil uygulandi: +${result.added.length} / −${result.removed.length}`,
		),
	);
}

function runMigrate(target, opts = {}) {
	const { vault, active, state } = paths(target);
	if (!existsSync(active)) {
		console.error(chalk.red(".claude/commands/ bulunamadi."));
		process.exitCode = 1;
		return;
	}
	const result = migrateToVault(active, vault);
	if (!existsSync(state)) writeProfileState(state, "all");
	console.log(
		chalk.green(
			`✓ Migrate: ${result.migrated} kopyalandi, ${result.skipped} zaten vardi.`,
		),
	);
	console.log(chalk.dim(`Vault: ${vault}`));
	if (opts.verbose) {
		console.log(chalk.dim(`Profil state: ${state} (all)`));
	}
}

async function runRestore(target, opts = {}) {
	await switchProfile(target, "all", { ...opts, force: true });
}

export async function commandsCommand(args, opts = {}) {
	const target = opts.cwd || process.cwd();
	const sub = args[0];

	if (!sub) {
		status(target);
		return;
	}

	if (sub === "--help" || sub === "-h" || sub === "help") {
		showHelp();
		return;
	}

	const restArgs = args.slice(1);
	const flags = {
		yes: restArgs.includes("--yes") || restArgs.includes("-y"),
		dryRun: restArgs.includes("--dry-run"),
		force: restArgs.includes("--force"),
		verbose: restArgs.includes("--verbose") || restArgs.includes("-v"),
	};

	switch (sub) {
		case "list":
			listActive(target);
			return;
		case "available":
			listAvailable(target);
			return;
		case "profiles":
			showProfiles();
			return;
		case "profile": {
			const profile = restArgs.find((a) => !a.startsWith("-"));
			if (!profile) {
				const { state } = paths(target);
				const cur = readProfileState(state).profile;
				console.log(`Aktif profil: ${chalk.cyan(cur)}`);
				console.log(
					chalk.dim(`Degistir: badi commands profile <${PROFILES.join("|")}>`),
				);
				return;
			}
			await switchProfile(target, profile, flags);
			return;
		}
		case "migrate":
			runMigrate(target, flags);
			return;
		case "restore":
			await runRestore(target, flags);
			return;
		case "route": {
			const promptArgs = args.slice(1);
			let inject = false;
			let json = false;
			let topN = 3;
			const promptParts = [];
			for (let i = 0; i < promptArgs.length; i++) {
				const a = promptArgs[i];
				if (a === "--inject") inject = true;
				else if (a === "--json") json = true;
				else if (a === "--top")
					topN = Math.max(1, Number.parseInt(promptArgs[++i], 10) || 3);
				else promptParts.push(a);
			}
			let prompt = promptParts.join(" ").trim();
			if (!prompt) {
				try {
					prompt = readFileSync(0, "utf-8").trim();
				} catch {
					/* ignore */
				}
			}
			if (!prompt) {
				console.error(chalk.red("Hata: prompt gerekli (arg veya stdin)."));
				process.exitCode = 1;
				return;
			}

			const { vault } = paths(target);
			const index = buildCommandIndex(vault);
			const matched = routePrompt(prompt, index, { top: topN, minScore: 1 });

			if (inject) {
				const blob = buildCommandHint(matched, index);
				if (json) {
					console.log(
						JSON.stringify({ matched, contextLength: blob.length }, null, 2),
					);
				} else if (blob) {
					process.stdout.write(blob);
				}
				return;
			}
			if (json) {
				console.log(JSON.stringify({ prompt, matched }, null, 2));
				return;
			}
			console.log(
				chalk.bold(
					`Prompt: "${prompt.slice(0, 80)}${prompt.length > 80 ? "…" : ""}"`,
				),
			);
			console.log("");
			if (matched.length === 0) {
				console.log(chalk.dim("(eslesen komut yok)"));
				return;
			}
			console.log(chalk.bold(`Eslesen komutlar (${matched.length}):`));
			for (const m of matched) {
				console.log(
					`  ${chalk.bold(`/${m.name}`.padEnd(22))} ${chalk.green(`skor ${m.score}`)}`,
				);
			}
			return;
		}
		default:
			console.error(chalk.red(`Bilinmeyen alt komut: ${sub}`));
			console.error(chalk.dim("Yardim: badi commands --help"));
			process.exitCode = 1;
	}
}

// Test exports
export {
	applyProfile,
	listMarkdownFiles,
	migrateToVault,
	paths,
	readProfileState,
	writeProfileState,
};
