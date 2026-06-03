import { chalk, VERSION } from "../../cli.js";
import {
	checkApiCompat,
	findUnsatisfied,
	validateManifest,
} from "../../data/plugin-manifest.js";
import { loadAllPluginManifests, pluginsDir } from "./_shared.js";

export function runDoctor() {
	const plugins = loadAllPluginManifests(pluginsDir(process.cwd()));
	if (plugins.length === 0) {
		console.log(chalk.dim("No plugins installed."));
		return;
	}
	console.log(chalk.bold(`Plugin Doctor (${plugins.length} plugin):`));
	console.log("");

	let issues = 0;
	for (const p of plugins) {
		const v = validateManifest(p);
		const c = checkApiCompat(p, VERSION);
		const okMark = v.valid && c.ok ? chalk.green("OK") : chalk.red("XX");
		console.log(
			`  ${okMark}  ${p.name || "(noname)"}  ${chalk.dim(`v${p.version || "?"}`)}`,
		);
		if (!v.valid) {
			for (const e of v.errors) {
				console.log(chalk.red(`       - ${e}`));
				issues++;
			}
		}
		for (const w of v.warnings) {
			console.log(chalk.yellow(`       - ${w}`));
		}
		if (!c.ok) {
			console.log(chalk.red(`       - ${c.reason}`));
			issues++;
		}
		if (c.warning) {
			// A2/B1 fix: unrecognized parseRange format -> doctor emits a warning
			// (the old permissive fallback misleadingly printed "OK").
			console.log(chalk.yellow(`       - ${c.warning}`));
			issues++;
		}
		if (p.badi?.apiVersion) {
			console.log(
				chalk.dim(`       apiVersion: ${p.badi.apiVersion} (Badi v${VERSION})`),
			);
		}
	}

	const unsat = findUnsatisfied(plugins);
	if (unsat.length) {
		console.log("");
		console.log(chalk.bold("Dependency issues:"));
		for (const u of unsat) {
			console.log(
				chalk.red(
					`  - ${u.plugin}: ${u.dep}@${u.requested} ${u.reason === "missing" ? "(not installed)" : `(installed ${u.installed})`}`,
				),
			);
			issues++;
		}
	}

	console.log("");
	if (issues > 0) {
		console.log(chalk.red(`${issues} issue(s) detected.`));
		process.exit(1);
	}
	console.log(chalk.green("All plugins are healthy."));
}
