import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { basename, join } from "node:path";
import { chalk, VERSION } from "../../cli.js";
import {
	checkApiCompat,
	validateManifest,
} from "../../data/plugin-manifest.js";
import { pluginsDir } from "./_shared.js";

export function runInstall(args) {
	const target = process.cwd();
	const dir = pluginsDir(target);
	const source = args[0];

	if (!source) {
		console.error(chalk.red("Hata: Plugin kaynagi belirtilmedi."));
		console.log("Kullanim: badi plugin install <git-url|npm-paket>");
		process.exit(1);
	}

	// Argument injection koruma (v1.28.1 O1): '-' ile baslayan kaynak git veya
	// npm tarafindan flag olarak yorumlanabilir. Reject + `--` separator alt.
	if (source.startsWith("-")) {
		console.error(
			chalk.red(`Gecersiz kaynak: '-' ile baslayan deger kabul edilmiyor.`),
		);
		console.log(
			chalk.dim(
				"Yerel yol veriyorsaniz './<dizin>' veya tam yol kullanin.",
			),
		);
		process.exit(1);
	}

	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

	let isGitHubUrl = false;
	try {
		const u = new URL(source);
		isGitHubUrl =
			u.hostname === "github.com" || u.hostname.endsWith(".github.com");
	} catch {
		// non-URL kaynak
	}

	let pluginName;
	if (isGitHubUrl || source.endsWith(".git")) {
		pluginName = basename(source, ".git").replace(/^badi-plugin-/, "");
		const destDir = join(dir, pluginName);
		if (existsSync(destDir)) {
			console.error(
				chalk.yellow(`Plugin '${pluginName}' zaten yuklu. Once kaldirin.`),
			);
			process.exit(1);
		}
		console.log(chalk.cyan(`Plugin indiriliyor: ${source}`));
		try {
			execFileSync(
				"git",
				["clone", "--depth", "1", "--", source, destDir],
				{ stdio: "pipe" },
			);
			const gitDir = join(destDir, ".git");
			if (existsSync(gitDir)) rmSync(gitDir, { recursive: true });
			console.log(chalk.green(`Plugin '${pluginName}' basariyla yuklendi!`));
		} catch (e) {
			console.error(chalk.red(`Plugin yuklenemedi: ${e.message}`));
			process.exit(1);
		}
	} else {
		pluginName = source.replace(/^@.*\//, "").replace(/^badi-plugin-/, "");
		const destDir = join(dir, pluginName);
		if (existsSync(destDir)) {
			console.error(chalk.yellow(`Plugin '${pluginName}' zaten yuklu.`));
			process.exit(1);
		}
		console.log(chalk.cyan(`Plugin npm'den indiriliyor: ${source}`));
		try {
			mkdirSync(destDir, { recursive: true });
			execFileSync("npm", ["pack", source, "--pack-destination", destDir], {
				stdio: "pipe",
			});
			console.log(chalk.green(`Plugin '${pluginName}' basariyla yuklendi!`));
		} catch (e) {
			console.error(chalk.red(`Plugin yuklenemedi: ${e.message}`));
			if (existsSync(destDir)) rmSync(destDir, { recursive: true });
			process.exit(1);
		}
	}

	// Manifest read-back: validation, apiVersion check, content summary
	const manifestPath = join(dir, pluginName, "badi-plugin.json");
	if (!existsSync(manifestPath)) {
		console.log(
			chalk.yellow(
				"Uyari: badi-plugin.json bulunamadi. Plugin yapilandirmasi eksik olabilir.",
			),
		);
		return;
	}
	try {
		const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
		const validation = validateManifest(manifest);
		if (!validation.valid) {
			console.log("");
			console.log(chalk.yellow("Manifest validation uyarilari:"));
			for (const err of validation.errors) {
				console.log(chalk.yellow(`  - ${err}`));
			}
		}
		const compat = checkApiCompat(manifest, VERSION);
		if (!compat.ok) {
			console.log("");
			console.log(
				chalk.yellow(
					`Uyari: Plugin apiVersion='${compat.range}' Badi v${VERSION} ile uyumsuz olabilir. Test edip raporlayin.`,
				),
			);
		}
		if (compat.warning) {
			console.log("");
			console.log(chalk.yellow(`Uyari: ${compat.warning}`));
		}

		console.log("");
		console.log(chalk.bold("Plugin icerigi:"));
		if (manifest.agents?.length)
			console.log(`  Ajanlar: ${manifest.agents.join(", ")}`);
		if (manifest.commands?.length)
			console.log(`  Komutlar: ${manifest.commands.join(", ")}`);
		if (manifest.hooks?.length)
			console.log(`  Hook'lar: ${manifest.hooks.join(", ")}`);
		if (manifest.skills)
			console.log(
				`  Skill'ler: ${Object.keys(manifest.skills).join(", ")}`,
			);
		if (manifest.badi?.apiVersion) {
			console.log(chalk.dim(`  apiVersion: ${manifest.badi.apiVersion}`));
		}
		if (manifest.badi?.dependsOn?.length) {
			console.log(
				chalk.dim(`  dependsOn:  ${manifest.badi.dependsOn.join(", ")}`),
			);
		}
	} catch {
		// manifest okunamadiysa ses cikarma
	}
}
