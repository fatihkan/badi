import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { chalk, showBanner } from "../cli.js";
import { HARNESSES, resolveHarnesses } from "../harnesses/index.js";
import { auditFiles } from "../help-doctor.js";
import {
	bashAvailable,
	getSchedulerKind,
	isWindows,
	osSummary,
	utf8Hint,
} from "../platform.js";

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

function runHelpDoctor(args) {
	const target = (() => {
		const idx = args.indexOf("--target");
		return idx >= 0 ? resolve(args[idx + 1] || ".") : process.cwd();
	})();
	const jsonOutput =
		args.includes("--format") && args[args.indexOf("--format") + 1] === "json";
	const strict = args.includes("--strict");

	const commandsDir = join(target, "lib", "commands");
	const allowlistPath = join(target, ".claude", "help-doctor.allow.json");

	let files;
	try {
		files = readdirSync(commandsDir)
			.filter((f) => f.endsWith(".js"))
			.map((f) => join(commandsDir, f));
	} catch {
		console.error(chalk.red(`lib/commands/ bulunamadi: ${commandsDir}`));
		console.error(
			chalk.dim("badi doctor help yalniz Badi repo kokunden calistirilir."),
		);
		process.exit(1);
	}

	const drift = auditFiles(files, { allowlistPath });

	if (jsonOutput) {
		console.log(
			JSON.stringify(
				{
					scanned: { files: files.length },
					drift,
					ok: drift.length === 0,
				},
				null,
				2,
			),
		);
		if (drift.length > 0 || strict) process.exit(drift.length === 0 ? 0 : 1);
		return;
	}

	showBanner();
	console.log(chalk.bold("Help-Doctor"));
	console.log(chalk.dim(`Hedef: ${commandsDir}`));
	console.log(chalk.dim(`Allowlist: ${allowlistPath}`));
	console.log("");

	if (drift.length === 0) {
		console.log(
			chalk.bold.green(`Tum ${files.length} komut dosyasi drift-free.`),
		);
		return;
	}

	console.log(
		chalk.bold.red(`Drift tespit edildi (${drift.length}/${files.length}):`),
	);
	console.log("");
	for (const d of drift) {
		console.log(chalk.cyan(`  ${d.file}`));
		if (d.missingSubs.length) {
			console.log(chalk.yellow(`    subs eksik: ${d.missingSubs.join(", ")}`));
		}
		if (d.missingFlags.length) {
			console.log(
				chalk.yellow(`    flags eksik: ${d.missingFlags.join(", ")}`),
			);
		}
	}
	console.log("");
	console.log(chalk.dim("Cozum:"));
	console.log(chalk.dim("  1. Help text'i guncelle (showHelp veya inline)"));
	console.log(
		chalk.dim(
			"  2. Mesru false-positive ise .claude/help-doctor.allow.json'a ekle",
		),
	);
	process.exit(1);
}

export function runDoctor(args, { showHelp }) {
	if (args[0] === "help") {
		runHelpDoctor(args.slice(1));
		return;
	}

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
	console.log(`${chalk.bold("OS:")}    ${osSummary()}`);
	console.log(
		`${chalk.bold("Bash:")}  ${bashAvailable() ? chalk.green("var") : chalk.red("yok")} (hooks bash gerektirir)`,
	);
	console.log(`${chalk.bold("Sched:")} ${getSchedulerKind() || "yok"}`);
	const hint = utf8Hint();
	if (hint) console.log(chalk.yellow(`!! ${hint}`));
	if (isWindows && !bashAvailable()) {
		console.log(
			chalk.yellow(
				"!! Windows'ta bash bulunamadi — hooks calismayabilir. Git for Windows veya WSL2 kurun.",
			),
		);
	}
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
