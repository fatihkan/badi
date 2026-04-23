import { existsSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { chalk, showBanner } from "../cli.js";
import { listDirs } from "../helpers.js";

export function runDoctor(args, { showHelp }) {
	let target = process.cwd();

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case "--target":
				target = resolve(args[++i] || ".");
				break;
			case "--help":
			case "-h":
				showHelp();
				return;
		}
	}

	showBanner();
	console.log(chalk.bold("Badi Kurulum Dogrulamasi"));
	console.log(`${chalk.bold("Hedef:")} ${target}`);
	console.log("");

	const claudeDir = join(target, ".claude");
	let pass = 0;
	let warn = 0;
	let fail = 0;

	function check(label, fn) {
		try {
			const result = fn();
			if (result === true) {
				console.log(`  ${chalk.green("OK")}  ${label}`);
				pass++;
			} else if (result === "warn") {
				console.log(`  ${chalk.yellow("!!")}  ${label}`);
				warn++;
			} else {
				console.log(`  ${chalk.red("XX")}  ${label}`);
				fail++;
			}
		} catch (e) {
			console.log(`  ${chalk.red("XX")}  ${label} (${e.message})`);
			fail++;
		}
	}

	check(".claude/ dizini mevcut", () => existsSync(claudeDir));

	check("settings.json gecerli JSON", () => {
		const p = join(claudeDir, "settings.json");
		if (!existsSync(p)) return false;
		JSON.parse(readFileSync(p, "utf-8"));
		return true;
	});

	const expectedHooks = [
		"guard-bash.sh",
		"backup-before-write.sh",
		"completeness-gate.sh",
		"log-changes.sh",
		"log-failures.sh",
		"log-stop-verdict.sh",
		"post-compact-resume.sh",
		"pre-compact-handoff.sh",
		"session-reset.sh",
		"dependency-audit.sh",
		"branch-guard.sh",
		"track-usage.sh",
	];

	for (const hook of expectedHooks) {
		check(`Hook: ${hook}`, () => {
			const p = join(claudeDir, "hooks", hook);
			if (!existsSync(p)) return false;
			try {
				const stat = statSync(p);
				if (!(stat.mode & 0o111)) return "warn";
			} catch {
				return "warn";
			}
			return true;
		});
	}

	const expectedAgents = [
		"archaeologist",
		"auditor",
		"coach",
		"debt-collector",
		"error-whisperer",
		"onboarding-sherpa",
		"pr-ghostwriter",
		"rubber-duck",
		"unsticker",
		"yak-shave-detector",
		"security-scanner",
		"performance-profiler",
		"test-strategist",
		"api-designer",
		"migration-pilot",
		"code-generator",
		"refactoring-advisor",
		"architecture-advisor",
		"content-creator",
		"visual-director",
		"project-architect",
	];

	for (const agent of expectedAgents) {
		check(`Agent: ${agent}.md`, () => {
			const p = join(claudeDir, "agents", `${agent}.md`);
			if (!existsSync(p)) return false;
			const content = readFileSync(p, "utf-8");
			if (!content.startsWith("---")) return "warn";
			return true;
		});
	}

	check("memory.md boyut limiti (<=100 satir)", () => {
		const p = join(claudeDir, "memory.md");
		if (!existsSync(p)) return "warn";
		const lines = readFileSync(p, "utf-8").split("\n").length;
		return lines <= 100 ? true : "warn";
	});

	check("knowledge-base.md boyut limiti (<=200 satir)", () => {
		const p = join(claudeDir, "knowledge-base.md");
		if (!existsSync(p)) return "warn";
		const lines = readFileSync(p, "utf-8").split("\n").length;
		return lines <= 200 ? true : "warn";
	});

	check("CLAUDE.md mevcut", () => existsSync(join(target, "CLAUDE.md")));
	check("command-index.md mevcut", () =>
		existsSync(join(claudeDir, "command-index.md")),
	);

	check("Skill dizin yapisi", () => {
		const skillsDir = join(claudeDir, "skills");
		if (!existsSync(skillsDir)) return false;
		const dirs = listDirs(skillsDir);
		return dirs.length >= 16 ? true : dirs.length >= 1 ? "warn" : false;
	});

	console.log("");
	console.log(chalk.bold("Sonuc:"));
	console.log(
		`  ${chalk.green(`${pass} basarili`)}  ${chalk.yellow(`${warn} uyari`)}  ${chalk.red(`${fail} basarisiz`)}`,
	);

	if (fail === 0 && warn === 0) {
		console.log("");
		console.log(chalk.bold.green("Badi kurulumu saglikli!"));
	} else if (fail === 0) {
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
			`  ${chalk.cyan("badi update")}         # Eksik dosyalari ekler, ozel dosyalari korur (onerilen)`,
		);
		console.log(
			`  ${chalk.cyan("badi init --force")}   # Her seyi zorla yeniden kurar (ozel degisiklikler kaybolur)`,
		);
		console.log("");
		console.log(chalk.dim("Hook eksikse su hatayi alirsiniz:"));
		console.log(
			chalk.dim(
				"  bash: .claude/hooks/guard-bash.sh: No such file or directory",
			),
		);
		console.log(chalk.dim("Cozum: 'badi update' calistirin."));
	}

	process.exit(fail > 0 ? 1 : 0);
}
