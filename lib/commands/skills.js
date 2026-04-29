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
} from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { chalk } from "../cli.js";
import { listDirs } from "../helpers.js";

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
	console.log(chalk.dim("Ornek:"));
	console.log(chalk.dim("  badi skills add seo marketing security"));
	console.log(chalk.dim("  badi skills clear && badi skills add development"));
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
