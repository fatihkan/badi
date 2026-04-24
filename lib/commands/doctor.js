import { resolve } from "node:path";
import { chalk, showBanner } from "../cli.js";
import { HARNESSES, resolveHarnesses } from "../harnesses/index.js";

function printReport(harness, report) {
	console.log(chalk.bold(`${harness.name}:`));
	for (const c of report.checks) {
		const icon =
			c.status === "pass"
				? chalk.green("OK")
				: c.status === "warn"
					? chalk.yellow("!!")
					: chalk.red("XX");
		console.log(`  ${icon}  ${c.label}`);
	}
	console.log("");
	console.log(
		`  ${chalk.green(`${report.pass} basarili`)}  ${chalk.yellow(`${report.warn} uyari`)}  ${chalk.red(`${report.fail} basarisiz`)}`,
	);
	console.log("");
}

export function runDoctor(args, { showHelp }) {
	let target = process.cwd();
	let harnessFlag = null;

	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		switch (a) {
			case "--target":
				target = resolve(args[++i] || ".");
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
	console.log(chalk.bold("Badi Kurulum Dogrulamasi"));
	console.log(`${chalk.bold("Hedef:")} ${target}`);
	console.log("");

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
		if (!selected.length) selected = [HARNESSES[0]]; // claude default
	}

	let totalPass = 0;
	let totalWarn = 0;
	let totalFail = 0;

	for (const harness of selected) {
		const report = harness.doctor({ target });
		printReport(harness, report);
		totalPass += report.pass;
		totalWarn += report.warn;
		totalFail += report.fail;
	}

	console.log(chalk.bold("Toplam:"));
	console.log(
		`  ${chalk.green(`${totalPass} basarili`)}  ${chalk.yellow(`${totalWarn} uyari`)}  ${chalk.red(`${totalFail} basarisiz`)}`,
	);

	if (totalFail === 0 && totalWarn === 0) {
		console.log("");
		console.log(chalk.bold.green("Badi kurulumu saglikli!"));
	} else if (totalFail === 0) {
		console.log("");
		console.log(
			chalk.bold.yellow(
				"Badi kurulumunda kucuk sorunlar var. Detaylari inceleyin.",
			),
		);
	} else {
		console.log("");
		console.log(chalk.bold.red("Badi kurulumunda sorunlar tespit edildi."));
		console.log("");
		console.log(chalk.bold("Cozum onerileri:"));
		console.log(
			`  ${chalk.cyan("badi update")}         # Eksik dosyalari ekler, ozel dosyalari korur`,
		);
		console.log(
			`  ${chalk.cyan("badi init --force")}   # Her seyi zorla yeniden kurar`,
		);
	}

	process.exit(totalFail > 0 ? 1 : 0);
}
