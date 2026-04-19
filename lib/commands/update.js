import { existsSync, readdirSync, chmodSync, cpSync } from "node:fs";
import { resolve, join } from "node:path";
import { chalk, showBanner, PKG_ROOT, TEMPLATE_DIR } from "../cli.js";
import { copyRecursive } from "../helpers.js";

// Kullanici ozellestirebilecegi dosyalar — --force'ta bile KORUNAN alanlar
const USER_CUSTOMIZABLE = [
	"memory.md",
	"knowledge-base.md",
	"knowledge-nominations.md",
	"workspace/",
	"plugins/",
	"logs/",
	"backups/",
	"agent-memory/",
];

function isUserFile(relativePath) {
	return USER_CUSTOMIZABLE.some((p) => relativePath === p || relativePath.startsWith(p));
}

export function runUpdate(args, { showHelp }) {
	let target = process.cwd();
	let dryRun = false;
	let force = false;

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case "--target":
				target = resolve(args[++i] || ".");
				break;
			case "--dry-run":
				dryRun = true;
				break;
			case "--force":
				force = true;
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
	if (force) {
		console.log(`${chalk.bold("Mod:")} ${chalk.red("Zorla guncelleme")} (user-customizable dosyalar HARIC hepsini yazar)`);
		console.log(chalk.dim("  Korunan: memory.md, knowledge-base.md, workspace/, plugins/"));
	} else {
		console.log(`${chalk.bold("Mod:")} ${chalk.cyan("Guvenli guncelleme")} (mevcut dosyalar korunur, yenisini ekler)`);
		console.log(chalk.dim("  Tum slash komut + ajan + hook'lari zorla yenilemek icin: --force"));
	}
	console.log("");

	console.log(chalk.bold("Dosyalar:"));
	const result = copyRecursive(TEMPLATE_DIR, destClaude, {
		dryRun,
		updateMode: !force, // force ise updateMode kapali (yani ustune yazabilir)
		force, // updateMode kapaliysa force ile ustune yazar
		userCustomizable: isUserFile, // User dosyalari korunur
	});

	// CLAUDE.md guncelle
	const srcClaudeMd = join(PKG_ROOT, "CLAUDE.md");
	const destClaudeMd = join(target, "CLAUDE.md");
	if (existsSync(srcClaudeMd)) {
		const claudeMdMissing = !existsSync(destClaudeMd);
		if (claudeMdMissing || force) {
			if (!dryRun) cpSync(srcClaudeMd, destClaudeMd);
			console.log(`  ${chalk.green(claudeMdMissing ? "+" : "!")} CLAUDE.md ${claudeMdMissing ? "(yeni eklendi)" : "(ustune yazildi)"}`);
			result.copied++;
		}
	}

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
	if (force) {
		console.log(`  ${chalk.green(result.copied)} dosya guncellendi (ustune yazildi)`);
		console.log(`  ${chalk.gray(result.skipped)} kullanici dosyasi korundu (memory/knowledge/workspace)`);
	} else {
		console.log(`  ${chalk.green(result.copied)} yeni dosya eklendi`);
		console.log(`  ${chalk.gray(result.skipped)} mevcut dosya korundu`);
	}
	console.log(`  ${chalk.cyan(result.created)} yeni dizin olusturuldu`);

	if (!force && result.copied === 0) {
		console.log("");
		console.log(chalk.yellow("Hicbir yeni dosya eklenmedi."));
		console.log(chalk.dim("Mevcut dosyalarda guncelleme varsa almak icin: badi update --force"));
	}
}
