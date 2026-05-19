import { chalk } from "../../cli.js";
import { topoSort } from "../../data/plugin-manifest.js";
import { loadAllPluginManifests, pluginsDir } from "./_shared.js";

export function runGraph() {
	const plugins = loadAllPluginManifests(pluginsDir(process.cwd()));
	if (plugins.length === 0) {
		console.log(chalk.dim("Yuklu plugin yok."));
		return;
	}
	let sorted;
	try {
		sorted = topoSort(plugins);
	} catch (e) {
		console.error(chalk.red(e.message));
		process.exit(1);
	}
	console.log(chalk.bold("Plugin Bagimlilik Agaci (load sirasi):"));
	console.log("");
	for (let i = 0; i < sorted.length; i++) {
		const p = sorted[i];
		const deps = p.badi?.dependsOn || [];
		const arrow = deps.length ? chalk.dim(` ← ${deps.join(", ")}`) : "";
		const isLast = i === sorted.length - 1;
		const branch = isLast ? "└─" : "├─";
		console.log(
			`  ${branch} ${p.name} ${chalk.dim(`v${p.version || "?"}`)}${arrow}`,
		);
	}
}
