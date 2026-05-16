import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chalk, showBanner } from "../cli.js";
import {
	listTranscriptFiles,
	parseSession,
} from "../data/transcript-reader.js";
import { countFiles, listDirs, listMdFiles } from "../helpers.js";

function renderMcpUsage() {
	const files = listTranscriptFiles();
	if (files.length === 0) {
		console.log(
			chalk.dim("  ~/.claude/projects/ icinde transcript bulunamadi."),
		);
		return;
	}
	const agg = {};
	let sessionsWithMcp = 0;
	let totalSessions = 0;
	for (const f of files) {
		const s = parseSession(f.path);
		if (!s) continue;
		totalSessions++;
		const keys = Object.keys(s.mcpToolCounts);
		if (keys.length > 0) sessionsWithMcp++;
		for (const [k, v] of Object.entries(s.mcpToolCounts)) {
			// "mcp__servername__toolname" formati — server adini cikar
			const m = k.match(/^mcp__([^_]+(?:_[^_]+)*?)__/);
			const server = m ? m[1] : k;
			agg[server] = agg[server] || { calls: 0, tools: new Set() };
			agg[server].calls += v;
			agg[server].tools.add(k);
		}
	}
	const rows = Object.entries(agg).sort((a, b) => b[1].calls - a[1].calls);
	if (rows.length === 0) {
		console.log(chalk.dim("  MCP tool kullanimi yok."));
		return;
	}
	const maxLabel = Math.max(...rows.map(([k]) => k.length));
	for (const [server, info] of rows) {
		console.log(
			`  ${chalk.magenta("⚙")} ${server.padEnd(maxLabel)}  ${chalk.yellow(String(info.calls).padStart(5))} cagri  ${chalk.dim(`${info.tools.size} tool`)}`,
		);
	}
	console.log("");
	console.log(
		chalk.dim(`  ${sessionsWithMcp}/${totalSessions} session MCP kullaniyor`),
	);
}

export function runList(args, { showHelp }) {
	let showAgents = false;
	let showCommands = false;
	let showHooks = false;
	let showSkills = false;
	let showMcp = false;
	let target = process.cwd();

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
			case "--mcp":
				showMcp = true;
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

	const showAll =
		!showAgents && !showCommands && !showHooks && !showSkills && !showMcp;
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
		const hooks = existsSync(hooksDir)
			? readdirSync(hooksDir).filter((f) => f.endsWith(".sh"))
			: [];
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
		console.log(
			chalk.bold(
				`Skill Kategorileri (${categories.length} kategori, ${totalSkills} skill):`,
			),
		);
		for (const cat of categories.sort()) {
			const count = countFiles(join(skillsDir, cat), ".md");
			console.log(`  ${chalk.cyan("-")} ${cat} (${count} skill)`);
		}
		console.log("");
	}

	if (showMcp) {
		console.log(chalk.bold("MCP Server Kullanimi (transcript bazli):"));
		renderMcpUsage();
		console.log("");
		return;
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
						console.log(
							`  ${chalk.magenta("+")} ${manifest.name || p} v${manifest.version || "?"}`,
						);
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
