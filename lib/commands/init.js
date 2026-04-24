import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import { chalk, showBanner, TEMPLATE_DIR } from "../cli.js";
import { getHarness, HARNESSES, resolveHarnesses } from "../harnesses/index.js";
import { getPreference, setPreference } from "../preferences.js";

function promptChoice(message) {
	if (!process.stdin.isTTY) return Promise.resolve(null);
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
	const def = getPreference("defaultHarness", "claude");
	console.log(chalk.bold("Hangi LLM CLI'si ile calisiyorsun?"));
	HARNESSES.forEach((h, i) => {
		const marker = h.id === def ? chalk.dim(" [varsayilan]") : "";
		console.log(`  ${i + 1}) ${h.name}${marker}`);
	});
	console.log(`  ${HARNESSES.length + 1}) Hepsi`);
	console.log("");
	const ans = await promptChoice(
		`Secim (1-${HARNESSES.length + 1}, Enter = ${def}): `,
	);
	if (ans === null) return [getHarness(def)];
	if (!ans) return [getHarness(def)];
	const n = Number.parseInt(ans, 10);
	if (Number.isNaN(n)) {
		const h = getHarness(ans);
		if (h) return [h];
		console.error(chalk.red(`Gecersiz secim: ${ans}`));
		process.exit(1);
	}
	if (n === HARNESSES.length + 1) return [...HARNESSES];
	if (n < 1 || n > HARNESSES.length) {
		console.error(chalk.red(`Gecersiz secim: ${n}`));
		process.exit(1);
	}
	return [HARNESSES[n - 1]];
}

function printResult(harness, result) {
	console.log("");
	console.log(chalk.bold(`${harness.name}:`));
	console.log(`  ${chalk.green(result.copied)} dosya kopyalandi`);
	console.log(`  ${chalk.yellow(result.skipped)} dosya atlandi`);
	console.log(`  ${chalk.cyan(result.created)} dizin/dosya olusturuldu`);
	if (result.skippedComponents?.length) {
		console.log(chalk.dim("  Desteklenmeyen bilesenler:"));
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
				target = resolve(args[++i] || ".");
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
		console.error(chalk.red(`Hata: Sablon dizini bulunamadi: ${TEMPLATE_DIR}`));
		process.exit(1);
	}

	let selected;
	if (harnessFlag) {
		try {
			selected = resolveHarnesses(harnessFlag);
		} catch (e) {
			console.error(chalk.red(e.message));
			process.exit(1);
		}
		if (!selected.length) {
			console.error(chalk.red("--harness degeri bos olamaz"));
			process.exit(1);
		}
	} else {
		selected = await selectHarnessInteractive();
	}

	console.log(`${chalk.bold("Hedef:")} ${target}`);
	console.log(
		`${chalk.bold("Mod:")} ${
			dryRun
				? chalk.yellow("Kuru calistirma")
				: force
					? chalk.red("Zorla yazma")
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
		setPreference("defaultHarness", selected[0].id);
	}

	console.log("");
	console.log(chalk.bold.green("Tamamlandi!"));

	if (!dryRun) {
		console.log("");
		console.log(chalk.bold("Sonraki adimlar:"));
		const hints = selected.map((h) => {
			if (h.id === "claude") {
				return `  - Claude Code ile ${chalk.cyan("/start")} komutunu calistir`;
			}
			if (h.id === "cursor") {
				return `  - Cursor'da ${chalk.cyan(".cursor/rules/badi-main.mdc")} 'e bak`;
			}
			if (h.id === "gemini") {
				return `  - Gemini CLI: ${chalk.cyan("gemini")} ile calistir; ${chalk.cyan("GEMINI.md")} otomatik yuklenir`;
			}
			return `  - ${h.name} kurulumunu dogrula`;
		});
		for (const h of hints) console.log(h);
		console.log(`  - Dogrulama: ${chalk.cyan("badi doctor")}`);
	}
}
