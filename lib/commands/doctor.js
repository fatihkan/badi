import { existsSync, readdirSync } from "node:fs";
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
		`  ${chalk.green(`${report.pass} passed`)}  ${chalk.yellow(`${report.warn} warnings`)}  ${chalk.red(`${report.fail} failed`)}`,
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
		// Include both top-level *.js command files AND directory-modules
		// (a dir containing index.js, e.g. mobile/, icerik/) so split commands
		// stay under help-doctor coverage.
		files = readdirSync(commandsDir, { withFileTypes: true })
			.filter((d) =>
				d.isDirectory()
					? existsSync(join(commandsDir, d.name, "index.js"))
					: d.name.endsWith(".js"),
			)
			.map((d) => join(commandsDir, d.name));
	} catch {
		console.error(chalk.red(`lib/commands/ not found: ${commandsDir}`));
		console.error(
			chalk.dim("badi doctor help only runs from the Badi repo root."),
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
	console.log(chalk.dim(`Target: ${commandsDir}`));
	console.log(chalk.dim(`Allowlist: ${allowlistPath}`));
	console.log("");

	if (drift.length === 0) {
		console.log(
			chalk.bold.green(`All ${files.length} command files drift-free.`),
		);
		return;
	}

	console.log(
		chalk.bold.red(`Drift detected (${drift.length}/${files.length}):`),
	);
	console.log("");
	for (const d of drift) {
		console.log(chalk.cyan(`  ${d.file}`));
		if (d.missingSubs.length) {
			console.log(
				chalk.yellow(`    missing subs: ${d.missingSubs.join(", ")}`),
			);
		}
		if (d.missingFlags.length) {
			console.log(
				chalk.yellow(`    missing flags: ${d.missingFlags.join(", ")}`),
			);
		}
	}
	console.log("");
	console.log(chalk.dim("Fix:"));
	console.log(chalk.dim("  1. Update the help text (showHelp or inline)"));
	console.log(
		chalk.dim(
			"  2. If a legitimate false-positive, add to .claude/help-doctor.allow.json",
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
	console.log(chalk.bold("Badi Installation Verification"));
	console.log(`${chalk.bold("Target:")} ${target}`);
	console.log(`${chalk.bold("OS:")}    ${osSummary()}`);
	console.log(
		`${chalk.bold("Bash:")}  ${bashAvailable() ? chalk.green("yes") : chalk.red("no")} (hooks require bash)`,
	);
	console.log(`${chalk.bold("Sched:")} ${getSchedulerKind() || "none"}`);
	const hint = utf8Hint();
	if (hint) console.log(chalk.yellow(`!! ${hint}`));
	if (isWindows && !bashAvailable()) {
		console.log(
			chalk.yellow(
				"!! bash not found on Windows — hooks may not work. Install Git for Windows or WSL2.",
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

	console.log(chalk.bold("Total:"));
	console.log(
		`  ${chalk.green(`${totalPass} passed`)}  ${chalk.yellow(`${totalWarn} warnings`)}  ${chalk.red(`${totalFail} failed`)}`,
	);

	if (totalFail === 0 && totalWarn === 0) {
		console.log("");
		console.log(chalk.bold.green("Badi installation is healthy!"));
	} else if (totalFail === 0) {
		console.log("");
		console.log(
			chalk.bold.yellow(
				"Badi installation has minor issues. Review the details.",
			),
		);
	} else {
		console.log("");
		console.log(chalk.bold.red("Badi installation has problems."));
		console.log("");
		console.log(chalk.bold("Suggested fixes:"));
		console.log(
			`  ${chalk.cyan("badi update")}         # Adds missing files, preserves custom files`,
		);
		console.log(
			`  ${chalk.cyan("badi init --force")}   # Force-reinstalls everything`,
		);
	}

	process.exit(totalFail > 0 ? 1 : 0);
}
