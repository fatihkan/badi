import { resolve } from "node:path";
import { chalk, showBanner, TEMPLATE_DIR } from "../cli.js";
import { HARNESSES, resolveHarnesses } from "../harnesses/index.js";

function printResult(harness, result, force) {
	console.log("");
	console.log(chalk.bold(`${harness.name}:`));
	if (force) {
		console.log(`  ${chalk.green(result.copied)} files updated (overwritten)`);
		console.log(`  ${chalk.gray(result.skipped)} user files preserved`);
	} else {
		console.log(`  ${chalk.green(result.copied)} new files added`);
		console.log(`  ${chalk.gray(result.skipped)} existing files preserved`);
	}
	console.log(`  ${chalk.cyan(result.created)} new directories created`);
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
				"Error: No harness installation detected in this directory. Run 'badi init' first.",
			),
		);
		process.exit(1);
	}

	console.log(`${chalk.bold("Target:")} ${target}`);
	if (force) {
		console.log(
			`${chalk.bold("Mode:")} ${chalk.red("Force update")} (writes everything EXCEPT user-customizable files)`,
		);
		console.log(
			chalk.dim(
				"  Preserved: memory.md, knowledge-base.md, workspace/, plugins/",
			),
		);
	} else {
		console.log(
			`${chalk.bold("Mode:")} ${chalk.cyan("Safe update")} (existing files preserved, adds new ones)`,
		);
		console.log(
			chalk.dim(
				"  To force-refresh all slash commands + agents + hooks: --force",
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
	console.log(chalk.bold.green("Update complete!"));

	if (!force && totalCopied === 0) {
		console.log("");
		console.log(chalk.yellow("No new files added."));
		console.log(
			chalk.dim("To pull updates to existing files: badi update --force"),
		);
	}
}
