import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chalk } from "../../cli.js";
import { listDirs } from "../../helpers.js";
import { pluginsDir } from "./_shared.js";

export function runList() {
	const dir = pluginsDir(process.cwd());
	if (!existsSync(dir)) {
		console.log(chalk.dim("Yuklu plugin yok."));
		return;
	}
	const plugins = listDirs(dir);
	if (plugins.length === 0) {
		console.log(chalk.dim("Yuklu plugin yok."));
		return;
	}
	console.log(chalk.bold(`Yuklu Plugin'ler (${plugins.length}):`));
	for (const p of plugins) {
		const manifestPath = join(dir, p, "badi-plugin.json");
		if (existsSync(manifestPath)) {
			try {
				const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
				console.log(
					`  ${chalk.magenta("+")} ${manifest.name || p} v${manifest.version || "?"} - ${manifest.description || ""}`,
				);
			} catch {
				console.log(`  ${chalk.magenta("+")} ${p}`);
			}
		} else {
			console.log(`  ${chalk.magenta("+")} ${p}`);
		}
	}
}
