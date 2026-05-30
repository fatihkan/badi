import { existsSync, mkdirSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { createInterface } from "node:readline";
import { chalk, showBanner, TEMPLATE_DIR } from "../cli.js";
import { HARNESSES, resolveHarnesses } from "../harnesses/index.js";
import { getPreference, setPreference } from "../preferences.js";

/**
 * Parse the user's answer to the interactive harness menu.
 * Pure function, exported for testing.
 *
 * @param {string|null} answer  raw stdin line (null = non-TTY / no answer)
 * @param {string} defaultId    harness id when user hits Enter
 * @param {Array<{id:string,name:string}>} harnesses  available list
 * @returns {{harnesses: Array, error?: string}}
 *   - harnesses: resolved selection (1+ items) OR [] if error
 *   - error: human-readable error message if selection invalid
 */
export function parseMenuAnswer(answer, defaultId, harnesses) {
	const def = harnesses.find((h) => h.id === defaultId) ?? harnesses[0];
	if (answer === null || answer === "") {
		return { harnesses: [def] };
	}
	const n = Number.parseInt(answer, 10);
	if (Number.isNaN(n)) {
		const byId = harnesses.find((h) => h.id === answer.toLowerCase());
		if (byId) return { harnesses: [byId] };
		return { harnesses: [], error: `Invalid choice: ${answer}` };
	}
	if (n === harnesses.length + 1) return { harnesses: [...harnesses] };
	if (n < 1 || n > harnesses.length) {
		return { harnesses: [], error: `Invalid choice: ${n}` };
	}
	return { harnesses: [harnesses[n - 1]] };
}

function promptChoice(message) {
	return new Promise((resolve) => {
		const rl = createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		rl.question(message, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
}

async function selectHarnessInteractive() {
	const defId = getPreference("defaultHarness", "claude");
	console.log(chalk.bold("Which LLM CLI are you working with?"));
	HARNESSES.forEach((h, i) => {
		const marker = h.id === defId ? chalk.dim(" [default]") : "";
		console.log(`  ${i + 1}) ${h.name}${marker}`);
	});
	console.log(`  ${HARNESSES.length + 1}) All`);
	console.log("");

	if (!process.stdin.isTTY) {
		console.log(
			chalk.dim(`  (non-TTY environment detected, default selected: ${defId})`),
		);
		return parseMenuAnswer(null, defId, HARNESSES).harnesses;
	}

	const ans = await promptChoice(
		`Choice (1-${HARNESSES.length + 1}, Enter = ${defId}): `,
	);
	const { harnesses, error } = parseMenuAnswer(ans, defId, HARNESSES);
	if (error) {
		console.error(chalk.red(error));
		process.exit(1);
	}
	return harnesses;
}

function printResult(harness, result) {
	console.log("");
	console.log(chalk.bold(`${harness.name}:`));
	console.log(`  ${chalk.green(result.copied)} files copied`);
	console.log(`  ${chalk.yellow(result.skipped)} files skipped`);
	console.log(`  ${chalk.cyan(result.created)} directories/files created`);
	if (result.skippedComponents?.length) {
		console.log(chalk.dim("  Unsupported components:"));
		for (const s of result.skippedComponents) {
			console.log(chalk.dim(`    - ${s.component} (${s.count}) — ${s.reason}`));
		}
	}
}

export async function runInit(args, { showHelp }) {
	let target = process.cwd();
	let force = false;
	let dryRun = false;
	let harnessFlag = null;
	let saveDefault = true;

	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		switch (a) {
			case "--target":
				target = resolvePath(args[++i] || ".");
				break;
			case "--force":
				force = true;
				break;
			case "--dry-run":
				dryRun = true;
				break;
			case "--harness":
				harnessFlag = args[++i] ?? null;
				break;
			case "--no-save":
				saveDefault = false;
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

	if (!existsSync(TEMPLATE_DIR)) {
		console.error(
			chalk.red(`Error: Template directory not found: ${TEMPLATE_DIR}`),
		);
		process.exit(1);
	}

	// H2: non-TTY + no --harness flag = do not silently persist a default.
	const nonInteractiveFallback = !harnessFlag && !process.stdin.isTTY;
	if (nonInteractiveFallback) saveDefault = false;

	let selected;
	if (harnessFlag) {
		try {
			selected = resolveHarnesses(harnessFlag);
		} catch (e) {
			console.error(chalk.red(e.message));
			process.exit(1);
		}
		if (!selected.length) {
			console.error(chalk.red("--harness value cannot be empty"));
			process.exit(1);
		}
	} else {
		selected = await selectHarnessInteractive();
	}

	console.log(`${chalk.bold("Target:")} ${target}`);
	console.log(
		`${chalk.bold("Mode:")} ${
			dryRun
				? chalk.yellow("Dry run")
				: force
					? chalk.red("Force write")
					: chalk.green("Normal")
		}`,
	);
	console.log(
		`${chalk.bold("Harness:")} ${selected.map((h) => h.name).join(", ")}`,
	);

	if (!dryRun && !existsSync(target)) {
		mkdirSync(target, { recursive: true });
	}

	for (const harness of selected) {
		const result = harness.install({
			target,
			src: TEMPLATE_DIR,
			force,
			dryRun,
		});
		printResult(harness, result);
	}

	if (saveDefault && !dryRun && selected.length === 1) {
		try {
			setPreference("defaultHarness", selected[0].id);
		} catch {
			// invalid id somehow slipped past — just skip persistence
		}
	}

	console.log("");
	console.log(chalk.bold.green("Done!"));

	if (!dryRun) {
		console.log("");
		console.log(chalk.bold("Next steps:"));
		const hints = selected.map((h) => {
			if (h.id === "claude") {
				return `  - Run the ${chalk.cyan("/start")} command with Claude Code`;
			}
			if (h.id === "cursor") {
				return `  - Check ${chalk.cyan(".cursor/rules/badi-main.mdc")} in Cursor`;
			}
			if (h.id === "gemini") {
				return `  - Gemini CLI: run with ${chalk.cyan("gemini")}; ${chalk.cyan("GEMINI.md")} loads automatically`;
			}
			return `  - Verify the ${h.name} installation`;
		});
		for (const h of hints) console.log(h);
		console.log(`  - Verify: ${chalk.cyan("badi doctor")}`);
	}
}
