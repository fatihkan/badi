import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";
import { chalk } from "../../cli.js";
import { parseFrontmatter, slugify } from "../../icerik-helpers.js";

export function runSablon(args) {
	const sablonSub = args[1];
	const sablonDir = join(process.cwd(), ".claude", "workspace", "sablonlar");

	if (!sablonSub || sablonSub === "--help" || sablonSub === "-h") {
		console.log(chalk.bold("Sablon Mirasi Sistemi:"));
		console.log("");
		console.log(
			`  badi icerik sablon olustur [isim] --extends [tur]  ${chalk.dim("Yeni sablon olustur")}`,
		);
		console.log(
			`  badi icerik sablon list                            ${chalk.dim("Sablonlari listele")}`,
		);
		console.log(
			`  badi icerik sablon sil [isim]                      ${chalk.dim("Sablon sil")}`,
		);
		console.log("");
		console.log(chalk.bold("Kullanim:"));
		console.log('  badi icerik post "konu" --sablon saas-lansmani');
		console.log("");
		console.log(chalk.bold("Gecerli extends turleri:"));
		console.log("  post, karousel, video, gorsel, takvim");
		return;
	}

	if (sablonSub === "olustur") {
		const sablonName = args[2];
		if (!sablonName) {
			console.error(
				chalk.red(
					"Sablon adi belirtin: badi icerik sablon olustur [isim] --extends [tur]",
				),
			);
			process.exit(1);
		}
		let extendsType = "post";
		let description = "";
		for (let i = 3; i < args.length; i++) {
			if (args[i] === "--extends") extendsType = args[++i];
			if (args[i] === "--description") description = args[++i];
		}
		const validBases = ["post", "karousel", "video", "gorsel", "takvim"];
		if (!validBases.includes(extendsType)) {
			console.error(chalk.red(`Gecersiz extends turu: ${extendsType}`));
			console.log(`Gecerli turler: ${validBases.join(", ")}`);
			process.exit(1);
		}

		mkdirSync(sablonDir, { recursive: true });
		const filePath = join(sablonDir, `${slugify(sablonName)}.md`);
		if (existsSync(filePath)) {
			console.error(chalk.yellow(`Sablon zaten mevcut: ${sablonName}`));
			process.exit(1);
		}

		const sablonContent = `---
name: ${sablonName}
extends: ${extendsType}
description: ${description || `${sablonName} icin ozel sablon`}
---

## Ek Bolum
[Bu bolumu ozellestirin. ${extendsType} sablonuna eklenir.]

## Ozel Notlar
[Sablona ozel rehber veya kurallar]
`;
		writeFileSync(filePath, sablonContent);
		console.log(chalk.bold.green("Sablon olusturuldu!"));
		console.log(`  Isim:    ${chalk.cyan(sablonName)}`);
		console.log(`  Miras:   ${chalk.cyan(extendsType)}`);
		console.log(`  Dosya:   ${chalk.cyan(relative(process.cwd(), filePath))}`);
		console.log("");
		console.log(chalk.dim("Dosyayi duzenleyip ozel bolumler ekleyin."));
		console.log(
			`Kullanim: badi icerik ${extendsType} "konu" --sablon ${slugify(sablonName)}`,
		);
		return;
	}

	if (sablonSub === "list") {
		if (!existsSync(sablonDir)) {
			console.log(chalk.dim("Henuz ozel sablon yok."));
			console.log(
				chalk.dim("Olustur: badi icerik sablon olustur [isim] --extends post"),
			);
			return;
		}
		const files = readdirSync(sablonDir).filter((f) => f.endsWith(".md"));
		if (files.length === 0) {
			console.log(chalk.dim("Henuz ozel sablon yok."));
			return;
		}

		console.log(chalk.bold("Yerlesik Sablonlar:"));
		console.log(chalk.dim("  post, karousel, video, gorsel, takvim, marka"));
		console.log("");
		console.log(chalk.bold("Ozel Sablonlar:"));
		for (const f of files) {
			const content = readFileSync(join(sablonDir, f), "utf-8");
			const { meta } = parseFrontmatter(content);
			const name = meta.name || f.replace(".md", "");
			const ext = meta.extends || "?";
			const desc = meta.description || "";
			console.log(
				`  ${chalk.cyan(name.padEnd(20))} extends: ${chalk.dim(ext.padEnd(10))} ${chalk.dim(desc)}`,
			);
		}
		return;
	}

	if (sablonSub === "sil") {
		const sablonName = args[2];
		if (!sablonName) {
			console.error(chalk.red("Silinecek sablon adini belirtin."));
			process.exit(1);
		}
		const filePath = join(sablonDir, `${slugify(sablonName)}.md`);
		if (!existsSync(filePath)) {
			console.error(chalk.red(`Sablon bulunamadi: ${sablonName}`));
			process.exit(1);
		}
		rmSync(filePath);
		console.log(chalk.green(`Sablon silindi: ${sablonName}`));
		return;
	}

	console.error(chalk.red(`Bilinmeyen sablon komutu: ${sablonSub}`));
	console.log("Kullanim: badi icerik sablon [olustur|list|sil]");
	process.exit(1);
}
