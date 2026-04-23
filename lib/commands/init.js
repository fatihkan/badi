import { chmodSync, cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { chalk, PKG_ROOT, showBanner, TEMPLATE_DIR } from "../cli.js";
import { copyRecursive } from "../helpers.js";

export function runInit(args, { showHelp }) {
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
		console.error(chalk.red(`Hata: Sablon dizini bulunamadi: ${TEMPLATE_DIR}`));
		process.exit(1);
	}

	if (!dryRun && !existsSync(destClaude)) {
		mkdirSync(destClaude, { recursive: true });
	}

	console.log(chalk.bold("Dosyalar:"));
	const result = copyRecursive(TEMPLATE_DIR, destClaude, { force, dryRun });

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
		console.log(
			`  1. ${chalk.cyan(".claude/settings.json")} dosyasini inceleyin`,
		);
		console.log(
			`  2. Claude Code ile ${chalk.cyan("/start")} komutunu calistirin`,
		);
		console.log(`  3. Dogrulama icin ${chalk.cyan("badi doctor")} calistirin`);
		console.log(`  4. Uretken olun!`);
	}
}
