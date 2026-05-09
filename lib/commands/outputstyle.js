// Badi outputstyle komutu — Claude Code output styles yonetimi.
//
// .claude/output-styles/<name>.md  → Claude Code per-style prompt extension.
//
// Yerlesik profiller (built-in): terse, verbose, eli5.
// Kullanici `badi outputstyle add <name>` ile yukler, Claude Code'da
// `/output-style <name>` ile aktive eder.

import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { chalk, showBanner } from "../cli.js";

const BUILTINS = {
	terse: {
		description:
			"Kisa ve ozlu cevaplar; gereksiz aciklama yok, tek cumle ozet, minimum tablo/bullet.",
		body: `Cevaplarini kisa ve direkt tut. Tek cumle ile ozetle. Tablo veya bullet kullanma sorulmadikca. Hata mesaji varsa sadece kok neden + cozum yaz. Kod ornegi isterken minimum gerekli olani goster — yorum eklemeden, baslica desen disinda. End-of-turn ozetleri tek cumle olsun.`,
	},
	verbose: {
		description:
			"Detayli ve contextli cevaplar; karar gerekcelerini, alternatifleri ve trade-off'lari ac.",
		body: `Cevaplarinda kararlarin arkasindaki gerekceyi ac. En az bir alternatif yaklasim ve neden secilmedigini belirt. Trade-off'lari listele (performans, okunabilirlik, esneklik). Kod degisikliginden once mevcut yapinin neden boyle oldugunu ozetle. End-of-turn'da: ne degisti, neden, takip onerileri.`,
	},
	eli5: {
		description:
			"Basit dilde ('5 yasinda biri anlasin') aciklamalar; teknik jargonu metafor ile destekle.",
		body: `Karmasik kavramlari basit dilde anlat. Teknik terim kullanmak zorunda kaldiginda metafor + ornek ile destekle. Her cumlede en fazla bir teknik kavram. Kod gosterirken her satirin altina kisa bir aciklama ekle (gerekiyorsa). Hata aciklarken once 'su olmasi gerekiyordu, ama su oldu' formatinda anlat.`,
	},
};

function paths(target) {
	const dir = join(target, ".claude", "output-styles");
	return { dir };
}

function styleFile(name) {
	const fm = `---
name: ${name}
description: ${BUILTINS[name].description}
---

${BUILTINS[name].body}
`;
	return fm;
}

function listInstalled(dir) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((f) => f.endsWith(".md"))
		.map((f) => f.replace(/\.md$/, ""))
		.sort();
}

function readDescription(dir, name) {
	const file = join(dir, `${name}.md`);
	if (!existsSync(file)) return null;
	try {
		const content = readFileSync(file, "utf-8");
		const m = content.match(/^description:\s*(.+)$/m);
		return m ? m[1].trim() : null;
	} catch {
		return null;
	}
}

function showHelp() {
	console.log(`${chalk.bold("badi outputstyle")} — Claude Code output styles`);
	console.log("");
	console.log(
		"  add <name>      Yerlesik profili .claude/output-styles/'a yukle",
	);
	console.log("  remove <name>   Yuklu profili kaldir");
	console.log("  list            Yuklu profilleri goster");
	console.log("  available       Yerlesik profilleri goster");
	console.log("  clear           Tum yuklu profilleri sil");
	console.log("");
	console.log(chalk.bold("Yerlesik profiller:"));
	for (const [name, p] of Object.entries(BUILTINS)) {
		console.log(`  ${chalk.cyan(name.padEnd(10))} ${chalk.dim(p.description)}`);
	}
	console.log("");
	console.log(
		chalk.dim(
			"Kullanim: Claude Code icinde /output-style <name> ile aktif et.",
		),
	);
}

export async function runOutputstyle(args) {
	const [sub, ...rest] = args;
	const target = process.cwd();
	const { dir } = paths(target);

	if (!sub || sub === "--help" || sub === "-h") {
		showBanner();
		showHelp();
		return;
	}

	if (sub === "available") {
		console.log(chalk.bold("Yerlesik profiller:"));
		for (const [name, p] of Object.entries(BUILTINS)) {
			console.log(`  ${chalk.cyan(name)} — ${p.description}`);
		}
		return;
	}

	if (sub === "list") {
		const installed = listInstalled(dir);
		if (installed.length === 0) {
			console.log(chalk.dim("(yuklu profil yok)"));
			console.log(
				chalk.dim(
					"Yerlesik profilleri gormek icin: badi outputstyle available",
				),
			);
			return;
		}
		console.log(chalk.bold(`Yuklu profiller (${installed.length}):`));
		for (const name of installed) {
			const desc = readDescription(dir, name) || "";
			console.log(`  ${chalk.green(name)} ${chalk.dim(desc)}`);
		}
		return;
	}

	if (sub === "add") {
		const name = rest[0];
		if (!name) {
			console.error(chalk.red("Hata: profil adi gerekli"));
			console.error("Ornek: badi outputstyle add terse");
			process.exit(1);
		}
		if (!BUILTINS[name]) {
			console.error(chalk.red(`Hata: bilinmeyen profil "${name}"`));
			console.error(
				`Mevcut: ${Object.keys(BUILTINS)
					.map((n) => chalk.cyan(n))
					.join(", ")}`,
			);
			process.exit(1);
		}
		mkdirSync(dir, { recursive: true });
		const file = join(dir, `${name}.md`);
		const existed = existsSync(file);
		writeFileSync(file, styleFile(name), "utf-8");
		console.log(
			existed
				? chalk.yellow(`~ guncellendi: .claude/output-styles/${name}.md`)
				: chalk.green(`+ yuklendi: .claude/output-styles/${name}.md`),
		);
		console.log(
			chalk.dim(`Aktif et: Claude Code icinde /output-style ${name}`),
		);
		return;
	}

	if (sub === "remove") {
		const name = rest[0];
		if (!name) {
			console.error(chalk.red("Hata: profil adi gerekli"));
			process.exit(1);
		}
		const file = join(dir, `${name}.md`);
		if (!existsSync(file)) {
			console.error(chalk.red(`Hata: "${name}" yuklu degil`));
			process.exit(1);
		}
		rmSync(file);
		console.log(chalk.yellow(`- silindi: .claude/output-styles/${name}.md`));
		return;
	}

	if (sub === "clear") {
		if (!existsSync(dir)) {
			console.log(chalk.dim("(zaten bos)"));
			return;
		}
		const installed = listInstalled(dir);
		for (const name of installed) {
			rmSync(join(dir, `${name}.md`));
		}
		console.log(chalk.yellow(`- ${installed.length} profil silindi`));
		return;
	}

	console.error(chalk.red(`Bilinmeyen alt komut: ${sub}`));
	showHelp();
	process.exit(1);
}
