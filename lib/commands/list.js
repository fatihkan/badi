import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { chalk, showBanner, PKG_ROOT } from "../cli.js";
import { listMdFiles, listDirs, countFiles } from "../helpers.js";

export function runList(args, { showHelp }) {
	let showAgents = false;
	let showCommands = false;
	let showHooks = false;
	let showSkills = false;
	let target = PKG_ROOT;

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case "--agents":
				showAgents = true;
				break;
			case "--commands":
				showCommands = true;
				break;
			case "--hooks":
				showHooks = true;
				break;
			case "--skills":
				showSkills = true;
				break;
			case "--target":
				target = resolve(args[++i] || ".");
				break;
			case "--help":
			case "-h":
				showHelp();
				return;
		}
	}

	const showAll = !showAgents && !showCommands && !showHooks && !showSkills;
	const claudeDir = join(target, ".claude");

	showBanner();

	if (showAll || showAgents) {
		const agents = listMdFiles(join(claudeDir, "agents"));
		console.log(chalk.bold(`Ajanlar (${agents.length}):`));
		for (const a of agents) {
			console.log(`  ${chalk.cyan("-")} ${a}`);
		}
		console.log("");
	}

	if (showAll || showCommands) {
		const commands = listMdFiles(join(claudeDir, "commands"));
		console.log(chalk.bold(`Komutlar (${commands.length}):`));
		for (const c of commands) {
			console.log(`  ${chalk.cyan("/")} ${c}`);
		}
		console.log("");
	}

	if (showAll || showHooks) {
		const hooksDir = join(claudeDir, "hooks");
		const hooks = existsSync(hooksDir) ? readdirSync(hooksDir).filter((f) => f.endsWith(".sh")) : [];
		console.log(chalk.bold(`Hook'lar (${hooks.length}):`));
		for (const h of hooks) {
			console.log(`  ${chalk.cyan("*")} ${h}`);
		}
		console.log("");
	}

	if (showAll || showSkills) {
		const skillsDir = join(claudeDir, "skills");
		const categories = listDirs(skillsDir);
		const totalSkills = categories.reduce((sum, cat) => {
			return sum + countFiles(join(skillsDir, cat), ".md");
		}, 0);
		console.log(chalk.bold(`Skill Kategorileri (${categories.length} kategori, ${totalSkills} skill):`));
		for (const cat of categories.sort()) {
			const count = countFiles(join(skillsDir, cat), ".md");
			console.log(`  ${chalk.cyan("-")} ${cat} (${count} skill)`);
		}
		console.log("");
	}

	const pluginsDir = join(claudeDir, "plugins");
	if (existsSync(pluginsDir)) {
		const plugins = listDirs(pluginsDir);
		if (plugins.length > 0 || showAll) {
			console.log(chalk.bold(`Plugin'ler (${plugins.length}):`));
			for (const p of plugins) {
				const manifestPath = join(pluginsDir, p, "badi-plugin.json");
				if (existsSync(manifestPath)) {
					try {
						const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
						console.log(`  ${chalk.magenta("+")} ${manifest.name || p} v${manifest.version || "?"}`);
					} catch {
						console.log(`  ${chalk.magenta("+")} ${p}`);
					}
				} else {
					console.log(`  ${chalk.magenta("+")} ${p}`);
				}
			}
			console.log("");
		}
	}
}
