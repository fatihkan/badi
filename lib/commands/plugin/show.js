import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chalk, VERSION } from "../../cli.js";
import {
	BADI_DEFAULT_API_VERSION,
	checkApiCompat,
} from "../../data/plugin-manifest.js";
import { pluginsDir } from "./_shared.js";

export function runShow(args) {
	const name = args[0];
	if (!name) {
		console.error(chalk.red("Hata: Plugin adi belirtilmedi."));
		console.log("Kullanim: badi plugin show <isim>");
		process.exit(1);
	}
	const dir = join(pluginsDir(process.cwd()), name);
	if (!existsSync(dir)) {
		console.error(chalk.red(`Plugin '${name}' bulunamadi.`));
		process.exit(1);
	}
	const manifestPath = join(dir, "badi-plugin.json");
	let manifest = null;
	if (existsSync(manifestPath)) {
		try {
			manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
		} catch (e) {
			console.error(chalk.red(`Manifest parse hatasi: ${e.message}`));
		}
	}

	console.log(chalk.bold(`Plugin: ${manifest?.name || name}`));
	if (manifest?.version)
		console.log(chalk.dim(`  Version:     ${manifest.version}`));
	if (manifest?.description)
		console.log(chalk.dim(`  Description: ${manifest.description}`));
	console.log(chalk.dim(`  Path:        ${dir}`));

	if (manifest?.badi?.apiVersion) {
		const compat = checkApiCompat(manifest, VERSION);
		const tag = compat.ok ? chalk.green("uyumlu") : chalk.red("UYUMSUZ");
		console.log(
			`${chalk.dim(`  apiVersion:  ${manifest.badi.apiVersion}`)} (${tag})`,
		);
		if (compat.warning) {
			console.log(chalk.yellow(`    ${compat.warning}`));
		}
	} else if (manifest) {
		console.log(
			chalk.dim(
				`  apiVersion:  (belirtilmemis, ${BADI_DEFAULT_API_VERSION} varsayilir)`,
			),
		);
	}
	if (manifest?.badi?.dependsOn?.length) {
		console.log(
			chalk.dim(`  dependsOn:   ${manifest.badi.dependsOn.join(", ")}`),
		);
	}
	console.log("");

	const agentCount = manifest?.agents?.length || 0;
	const commandCount = manifest?.commands?.length || 0;
	const hookCount = manifest?.hooks?.length || 0;
	const skillCount = manifest?.skills ? Object.keys(manifest.skills).length : 0;

	console.log(chalk.bold("Icerik:"));
	console.log(`  ${chalk.cyan("Ajanlar")}:  ${agentCount}`);
	if (manifest?.agents?.length) {
		for (const a of manifest.agents) console.log(`    - ${a}`);
	}
	console.log(`  ${chalk.cyan("Komutlar")}: ${commandCount}`);
	if (manifest?.commands?.length) {
		for (const c of manifest.commands) console.log(`    - ${c}`);
	}
	console.log(`  ${chalk.cyan("Hook'lar")}: ${hookCount}`);
	if (manifest?.hooks?.length) {
		for (const h of manifest.hooks) console.log(`    - ${h}`);
	}
	console.log(`  ${chalk.cyan("Skill'ler")}: ${skillCount}`);
	if (manifest?.skills) {
		for (const [cat, items] of Object.entries(manifest.skills)) {
			const count = Array.isArray(items) ? items.length : 0;
			console.log(`    - ${cat} (${count})`);
		}
	}
	if (!manifest) {
		console.log(chalk.yellow("  badi-plugin.json bulunamadi"));
	}
}
