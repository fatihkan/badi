import { existsSync, readdirSync, chmodSync } from "node:fs";
import { resolve, join } from "node:path";
import { chalk, showBanner, TEMPLATE_DIR } from "../cli.js";
import { copyRecursive } from "../helpers.js";

export function runUpdate(args, { showHelp }) {
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
