// Badi skills komutu — opt-in skill yonetimi.
//
// .claude/skills-vault/  → tum skill'ler (Claude Code yuklemez)
// .claude/skills/        → kullanici secimi (Claude Code yukler)
//
// Token tasarrufu icin: kurulu skill'ler 0 ile baslar, kullanici secer.

import {
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { chalk } from "../cli.js";
import { listDirs } from "../helpers.js";
import {
	buildContextInjection,
	buildSkillIndex,
	routePrompt,
} from "../skills-router.js";

function paths(target) {
	const claudeDir = join(target, ".claude");
	return {
		vault: join(claudeDir, "skills-vault"),
		active: join(claudeDir, "skills"),
	};
}

function listSkillCategories(dir) {
	if (!existsSync(dir)) return [];
	return listDirs(dir).sort();
}

function isSkillCategory(dir, name) {
	const path = join(dir, name);
	if (!existsSync(path)) return false;
	try {
		return statSync(path).isDirectory();
	} catch {
		return false;
	}
}

function readSkillDescription(skillDir) {
	const skillFile = join(skillDir, "SKILL.md");
	if (!existsSync(skillFile)) return null;
	try {
		const content = readFileSync(skillFile, "utf-8");
		const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
		if (!fmMatch) return null;
		const desc = fmMatch[1].match(/^description:\s*(.+)$/m);
		return desc ? desc[1].trim().replace(/^["']|["']$/g, "") : null;
	} catch {
		return null;
	}
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

function parseSelection(input, max) {
	const trimmed = input.trim().toLowerCase();
	if (!trimmed) return { indices: [], action: "cancel" };
	if (trimmed === "all")
		return { indices: [...Array(max).keys()], action: "set" };
	if (trimmed === "none" || trimmed === "clear")
		return { indices: [], action: "set" };

	const tokens = trimmed.split(/[,\s]+/).filter(Boolean);
	const indices = new Set();
	for (const tok of tokens) {
		const range = tok.match(/^(\d+)-(\d+)$/);
		if (range) {
			const a = Number.parseInt(range[1], 10);
			const b = Number.parseInt(range[2], 10);
			if (a >= 1 && b >= a && b <= max) {
				for (let i = a; i <= b; i++) indices.add(i - 1);
			}
		} else {
			const n = Number.parseInt(tok, 10);
			if (n >= 1 && n <= max) indices.add(n - 1);
		}
	}
	return { indices: [...indices].sort((a, b) => a - b), action: "set" };
}

function copySkill(vault, active, name) {
	const src = join(vault, name);
	const dst = join(active, name);
	if (!existsSync(src)) {
		throw new Error(`Vault'ta bulunamadi: ${name}`);
	}
	if (existsSync(dst)) {
		return { added: false };
	}
	cpSync(src, dst, { recursive: true });
	return { added: true };
}

function removeSkill(active, name) {
	const dst = join(active, name);
	if (!existsSync(dst)) return { removed: false };
	rmSync(dst, { recursive: true, force: true });
	return { removed: true };
}

function ensureActiveDir(active) {
	if (!existsSync(active)) mkdirSync(active, { recursive: true });
}

function printStatusTable({ vaultList, activeSet }) {
	const total = vaultList.length;
	const active = activeSet.size;
	console.log(chalk.bold(`Skills durumu: ${active}/${total} aktif`));
	console.log("");
	const W = 22;
	for (let i = 0; i < vaultList.length; i++) {
		const name = vaultList[i];
		const isActive = activeSet.has(name);
		const marker = isActive ? chalk.green("[v]") : chalk.dim("[ ]");
		const num = String(i + 1).padStart(2, " ");
		console.log(`  ${marker} ${chalk.cyan(num)}) ${name.padEnd(W)}`);
	}
	console.log("");
}

function showHelp() {
	console.log(chalk.bold("Skills Yonetimi (Opt-in):"));
	console.log(
		"  badi skills                     Durum tablosu + interaktif secim",
	);
	console.log(
		"  badi skills available           Vault'taki tum skill'leri listele",
	);
	console.log("  badi skills list                Aktif skill'leri listele");
	console.log(
		"  badi skills add <ad...>         Bir veya birden fazla skill aktif et",
	);
	console.log("  badi skills remove <ad...>      Aktif skill'i kaldir");
	console.log("  badi skills clear               Tum aktif skill'leri sifirla");
	console.log("  badi skills reset               clear ile ayni");
	console.log("");
	console.log(chalk.bold("Auto-router (v1.20+):"));
	console.log('  badi skills route "<prompt>"    Prompt → eslesen skill\'leri puanla');
	console.log("  badi skills route --inject      Match'lenenleri SKILL.md govdesi olarak yaz (hook icin)");
	console.log("  badi skills auto on             UserPromptSubmit hook'unu aktif et");
	console.log("  badi skills auto off            Hook'u kaldir");
	console.log("  badi skills auto status         Hook durumunu goster");
	console.log("");
	console.log(chalk.dim("Ornek:"));
	console.log(chalk.dim("  badi skills add seo marketing security"));
	console.log(chalk.dim('  badi skills route "Instagram post yaz"'));
	console.log(chalk.dim("  badi skills auto on   # her prompt'tan once otomatik route"));
}

export async function runSkills(args) {
	const target = process.cwd();
	const { vault, active } = paths(target);

	if (!existsSync(vault)) {
		console.error(chalk.red(`skills-vault bulunamadi: ${vault}`));
		console.log(chalk.dim("Once 'badi update' calistirip kurulumu tazeleyin."));
		process.exit(1);
	}

	ensureActiveDir(active);

	const sub = args[0];

	if (sub === "--help" || sub === "-h") {
		showHelp();
		return;
	}

	const vaultList = listSkillCategories(vault);
	const activeSet = new Set(listSkillCategories(active));

	switch (sub) {
		case undefined: {
			// Interaktif mod (TTY) veya sadece tablo (non-TTY)
			printStatusTable({ vaultList, activeSet });

			if (!process.stdin.isTTY) {
				console.log(chalk.dim("Etkilesim icin TTY gerekir. Sub-komut kullan:"));
				console.log(
					chalk.dim("  badi skills add <ad>   |   badi skills clear"),
				);
				return;
			}

			console.log(chalk.bold("Aktif edilecek skill'leri sec:"));
			console.log(
				chalk.dim(
					"  Numara/aralik (1,3,5-7), 'all', 'none' (sifirla) veya Enter = iptal",
				),
			);
			const ans = await promptChoice("> ");
			if (!ans) {
				console.log(chalk.dim("Iptal edildi, degisiklik yok."));
				return;
			}
			const { indices, action } = parseSelection(ans, vaultList.length);
			if (action === "cancel") {
				console.log(chalk.dim("Iptal edildi."));
				return;
			}

			// Set semantik: secilenler aktif, secilmeyenler kaldirilir
			const targetNames = new Set(indices.map((i) => vaultList[i]));
			let added = 0;
			let removed = 0;
			for (const name of vaultList) {
				const wantActive = targetNames.has(name);
				const isActive = activeSet.has(name);
				if (wantActive && !isActive) {
					copySkill(vault, active, name);
					added++;
				} else if (!wantActive && isActive) {
					removeSkill(active, name);
					removed++;
				}
			}
			console.log("");
			console.log(
				`${chalk.green(`+${added}`)} eklendi  ${chalk.yellow(`-${removed}`)} kaldirildi  ${chalk.cyan(targetNames.size)} aktif`,
			);
			break;
		}

		case "available": {
			console.log(chalk.bold(`Vault (${vaultList.length} skill):`));
			for (const name of vaultList) {
				const desc = readSkillDescription(join(vault, name));
				const marker = activeSet.has(name)
					? chalk.green("[v]")
					: chalk.dim("[ ]");
				const head = desc ? desc.slice(0, 70) : "";
				console.log(
					`  ${marker} ${chalk.cyan(name.padEnd(20))} ${chalk.dim(head)}`,
				);
			}
			break;
		}

		case "list": {
			const activeList = [...activeSet].sort();
			console.log(chalk.bold(`Aktif skill'ler (${activeList.length}):`));
			if (activeList.length === 0) {
				console.log(chalk.dim("  (hicbiri — 'badi skills' ile sec)"));
				return;
			}
			for (const name of activeList) {
				console.log(`  ${chalk.green("v")} ${name}`);
			}
			break;
		}

		case "add": {
			const names = args.slice(1).filter(Boolean);
			if (names.length === 0) {
				console.error(chalk.red("Hata: en az bir skill adi gerekli."));
				console.log(chalk.dim("Ornek: badi skills add seo marketing"));
				process.exit(1);
			}
			let added = 0;
			let skipped = 0;
			for (const name of names) {
				if (!isSkillCategory(vault, name)) {
					console.error(chalk.red(`Vault'ta bulunamadi: ${name}`));
					console.log(chalk.dim("'badi skills available' ile listeyi gor."));
					process.exit(1);
				}
				const r = copySkill(vault, active, name);
				if (r.added) {
					console.log(`  ${chalk.green("+")} ${name}`);
					added++;
				} else {
					console.log(
						`  ${chalk.dim("=")} ${name} ${chalk.dim("(zaten aktif)")}`,
					);
					skipped++;
				}
			}
			console.log("");
			console.log(
				`${chalk.green(added)} eklendi, ${chalk.yellow(skipped)} atlandi.`,
			);
			break;
		}

		case "remove":
		case "rm": {
			const names = args.slice(1).filter(Boolean);
			if (names.length === 0) {
				console.error(chalk.red("Hata: en az bir skill adi gerekli."));
				console.log(chalk.dim("Ornek: badi skills remove seo"));
				process.exit(1);
			}
			let removed = 0;
			let missing = 0;
			for (const name of names) {
				const r = removeSkill(active, name);
				if (r.removed) {
					console.log(`  ${chalk.yellow("-")} ${name}`);
					removed++;
				} else {
					console.log(
						`  ${chalk.dim("=")} ${name} ${chalk.dim("(zaten pasif)")}`,
					);
					missing++;
				}
			}
			console.log("");
			console.log(
				`${chalk.yellow(removed)} kaldirildi, ${chalk.dim(missing)} atlandi.`,
			);
			break;
		}

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
				else if (a === "--top") topN = Math.max(1, Number.parseInt(promptArgs[++i], 10) || 3);
				else promptParts.push(a);
			}
			let prompt = promptParts.join(" ").trim();
			if (!prompt) {
				// Read stdin if no arg
				try {
					const { readFileSync: r } = await import("node:fs");
					prompt = r(0, "utf-8").trim();
				} catch {
					/* ignore */
				}
			}
			if (!prompt) {
				console.error(chalk.red("Hata: prompt gerekli (arg veya stdin)."));
				console.log(chalk.dim('Ornek: badi skills route "SEO icin meta tag yaz"'));
				process.exit(1);
			}

			const index = buildSkillIndex(vault);
			const matched = routePrompt(prompt, index, { top: topN });

			if (inject) {
				const blob = buildContextInjection(matched, index);
				if (json) {
					console.log(
						JSON.stringify({ matched, contextLength: blob.length }, null, 2),
					);
				} else {
					process.stdout.write(blob);
				}
				return;
			}
			if (json) {
				console.log(JSON.stringify({ prompt, matched }, null, 2));
				return;
			}
			console.log(chalk.bold(`Prompt: "${prompt.slice(0, 80)}${prompt.length > 80 ? "…" : ""}"`));
			console.log("");
			if (matched.length === 0) {
				console.log(chalk.dim("(eslesen skill yok — 'badi skills available' ile listeyi gor)"));
				return;
			}
			console.log(chalk.bold(`Eslesen skill'ler (${matched.length}):`));
			for (const m of matched) {
				const trigText = m.matched.triggers.length
					? chalk.cyan(`triggers: ${m.matched.triggers.join(", ")}`)
					: "";
				const descText = m.matched.description.length
					? chalk.dim(`desc: ${m.matched.description.join(", ")}`)
					: "";
				console.log(
					`  ${chalk.bold(m.name.padEnd(20))} ${chalk.green(`skor ${m.score}`.padEnd(10))} ${trigText} ${descText}`,
				);
			}
			break;
		}

		case "auto": {
			const onOff = args[1];
			const settingsPath = join(target, ".claude", "settings.json");
			let settings = {};
			if (existsSync(settingsPath)) {
				try {
					settings = JSON.parse(readFileSync(settingsPath, "utf-8"));
				} catch {
					console.error(chalk.red("settings.json gecersiz JSON"));
					process.exit(1);
				}
			}
			settings.hooks = settings.hooks || {};
			settings.hooks.UserPromptSubmit = settings.hooks.UserPromptSubmit || [];

			const HOOK_ENTRY = {
				matcher: "*",
				hooks: [
					{
						type: "command",
						command: "bash .claude/hooks/skill-router.sh",
					},
				],
			};

			const hasEntry = settings.hooks.UserPromptSubmit.some((entry) =>
				JSON.stringify(entry).includes("skill-router.sh"),
			);

			if (onOff === "on") {
				if (hasEntry) {
					console.log(chalk.dim("Auto-router zaten aktif."));
					return;
				}
				settings.hooks.UserPromptSubmit.push(HOOK_ENTRY);
				writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
				console.log(chalk.green("✓ Auto-router aktif"));
				console.log(
					chalk.dim("Her prompt'tan once vault taranir, eslesen skill'ler context'e inject edilir."),
				);
				console.log(chalk.dim("Kapatmak icin: badi skills auto off"));
			} else if (onOff === "off") {
				if (!hasEntry) {
					console.log(chalk.dim("Auto-router zaten kapali."));
					return;
				}
				settings.hooks.UserPromptSubmit = settings.hooks.UserPromptSubmit.filter(
					(entry) => !JSON.stringify(entry).includes("skill-router.sh"),
				);
				if (settings.hooks.UserPromptSubmit.length === 0) {
					delete settings.hooks.UserPromptSubmit;
				}
				writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
				console.log(chalk.yellow("✓ Auto-router kapatildi"));
			} else if (!onOff || onOff === "status") {
				console.log(
					chalk.bold(
						`Auto-router: ${hasEntry ? chalk.green("AKTIF") : chalk.dim("kapali")}`,
					),
				);
				console.log(chalk.dim("Acmak icin:  badi skills auto on"));
				console.log(chalk.dim("Kapatmak:    badi skills auto off"));
			} else {
				console.error(chalk.red(`Bilinmeyen: ${onOff}. Kullan: on / off / status`));
				process.exit(1);
			}
			break;
		}

		case "clear":
		case "reset": {
			const names = [...activeSet];
			if (names.length === 0) {
				console.log(chalk.dim("Aktif skill yok, sifirlamaya gerek yok."));
				return;
			}
			for (const name of names) removeSkill(active, name);
			console.log(`${chalk.yellow(names.length)} aktif skill sifirlandi.`);
			console.log(
				chalk.dim(
					"Yeniden secmek icin: 'badi skills' veya 'badi skills add <ad>'",
				),
			);
			break;
		}

		default:
			console.error(chalk.red(`Bilinmeyen alt komut: ${sub}`));
			showHelp();
			process.exit(1);
	}
}
