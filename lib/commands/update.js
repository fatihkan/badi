import { resolve } from "node:path";
import { chalk, showBanner, TEMPLATE_DIR } from "../cli.js";
import { HARNESSES, resolveHarnesses } from "../harnesses/index.js";

function printResult(harness, result, force) {
	console.log("");
	console.log(chalk.bold(`${harness.name}:`));
	if (force) {
		console.log(
			`  ${chalk.green(result.copied)} dosya guncellendi (ustune yazildi)`,
		);
		console.log(`  ${chalk.gray(result.skipped)} kullanici dosyasi korundu`);
	} else {
		console.log(`  ${chalk.green(result.copied)} yeni dosya eklendi`);
		console.log(`  ${chalk.gray(result.skipped)} mevcut dosya korundu`);
	}
	console.log(`  ${chalk.cyan(result.created)} yeni dizin olusturuldu`);
}

export function runUpdate(args, { showHelp }) {
	let target = process.cwd();
	let dryRun = false;
	let force = false;
	let harnessFlag = null;

	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		switch (a) {
			case "--target":
				target = resolve(args[++i] || ".");
				break;
			case "--dry-run":
				dryRun = true;
				break;
			case "--force":
				force = true;
				break;
			case "--harness":
				harnessFlag = args[++i] ?? null;
				break;
			case "--help":
			case "-h":
				showHelp();
				return;
			default:
				if (a.startsWith("--harness=")) {
					harnessFlag = a.slice("--harness=".length);
				}
		}
	}

	showBanner();

	let selected;
	if (harnessFlag) {
		try {
			selected = resolveHarnesses(harnessFlag);
		} catch (e) {
			console.error(chalk.red(e.message));
			process.exit(1);
		}
	} else {
		selected = HARNESSES.filter((h) => h.detect(target));
	}

	if (!selected.length) {
		console.error(
			chalk.red(
				"Hata: Bu dizinde hicbir harness kurulumu tespit edilmedi. Once 'badi init' calistirin.",
			),
		);
		process.exit(1);
	}

	console.log(`${chalk.bold("Hedef:")} ${target}`);
	if (force) {
		console.log(
			`${chalk.bold("Mod:")} ${chalk.red("Zorla guncelleme")} (user-customizable dosyalar HARIC hepsini yazar)`,
		);
		console.log(
			chalk.dim(
				"  Korunan: memory.md, knowledge-base.md, workspace/, plugins/",
			),
		);
	} else {
		console.log(
			`${chalk.bold("Mod:")} ${chalk.cyan("Guvenli guncelleme")} (mevcut dosyalar korunur, yenisini ekler)`,
		);
		console.log(
			chalk.dim(
				"  Tum slash komut + ajan + hook'lari zorla yenilemek icin: --force",
			),
		);
	}
	console.log(
		`${chalk.bold("Harness:")} ${selected.map((h) => h.name).join(", ")}`,
	);

	let totalCopied = 0;
	for (const harness of selected) {
		const result = harness.update({
			target,
			src: TEMPLATE_DIR,
			force,
			dryRun,
		});
		totalCopied += result.copied;
		printResult(harness, result, force);
	}

	console.log("");
	console.log(chalk.bold.green("Guncelleme tamamlandi!"));

	if (!force && totalCopied === 0) {
		console.log("");
		console.log(chalk.yellow("Hicbir yeni dosya eklenmedi."));
		console.log(
			chalk.dim(
				"Mevcut dosyalarda guncelleme varsa almak icin: badi update --force",
			),
		);
	}
}
