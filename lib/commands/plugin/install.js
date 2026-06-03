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
		console.error(chalk.red("Error: No plugin source specified."));
		console.log("Usage: badi plugin install <git-url|npm-package>");
		process.exit(1);
	}

	// Argument injection guard (v1.28.1 O1): a source starting with '-' could be
	// interpreted as a flag by git or npm. Reject + `--` separator below.
	if (source.startsWith("-")) {
		console.error(
			chalk.red(`Invalid source: values starting with '-' are not accepted.`),
		);
		console.log(chalk.dim("For a local path, use './<dir>' or a full path."));
		process.exit(1);
	}

	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

	let isGitHubUrl = false;
	try {
		const u = new URL(source);
		isGitHubUrl =
			u.hostname === "github.com" || u.hostname.endsWith(".github.com");
	} catch {
		// non-URL source
	}

	let pluginName;
	if (isGitHubUrl || source.endsWith(".git")) {
		pluginName = basename(source, ".git").replace(/^badi-plugin-/, "");
		const destDir = join(dir, pluginName);
		if (existsSync(destDir)) {
			console.error(
				chalk.yellow(
					`Plugin '${pluginName}' is already installed. Remove it first.`,
				),
			);
			process.exit(1);
		}
		console.log(chalk.cyan(`Downloading plugin: ${source}`));
		try {
			execFileSync("git", ["clone", "--depth", "1", "--", source, destDir], {
				stdio: "pipe",
			});
			const gitDir = join(destDir, ".git");
			if (existsSync(gitDir)) rmSync(gitDir, { recursive: true });
			console.log(
				chalk.green(`Plugin '${pluginName}' installed successfully!`),
			);
		} catch (e) {
			console.error(chalk.red(`Plugin install failed: ${e.message}`));
			process.exit(1);
		}
	} else {
		pluginName = source.replace(/^@.*\//, "").replace(/^badi-plugin-/, "");
		const destDir = join(dir, pluginName);
		if (existsSync(destDir)) {
			console.error(
				chalk.yellow(`Plugin '${pluginName}' is already installed.`),
			);
			process.exit(1);
		}
		console.log(chalk.cyan(`Downloading plugin from npm: ${source}`));
		try {
			mkdirSync(destDir, { recursive: true });
			execFileSync("npm", ["pack", source, "--pack-destination", destDir], {
				stdio: "pipe",
			});
			console.log(
				chalk.green(`Plugin '${pluginName}' installed successfully!`),
			);
		} catch (e) {
			console.error(chalk.red(`Plugin install failed: ${e.message}`));
			if (existsSync(destDir)) rmSync(destDir, { recursive: true });
			process.exit(1);
		}
	}

	// Manifest read-back: validation, apiVersion check, content summary
	const manifestPath = join(dir, pluginName, "badi-plugin.json");
	if (!existsSync(manifestPath)) {
		console.log(
			chalk.yellow(
				"Warning: badi-plugin.json not found. The plugin configuration may be incomplete.",
			),
		);
		return;
	}
	try {
		const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
		const validation = validateManifest(manifest);
		if (!validation.valid) {
			console.log("");
			console.log(chalk.yellow("Manifest validation warnings:"));
			for (const err of validation.errors) {
				console.log(chalk.yellow(`  - ${err}`));
			}
		}
		const compat = checkApiCompat(manifest, VERSION);
		if (!compat.ok) {
			console.log("");
			console.log(
				chalk.yellow(
					`Warning: Plugin apiVersion='${compat.range}' may be incompatible with Badi v${VERSION}. Test and report.`,
				),
			);
		}
		if (compat.warning) {
			console.log("");
			console.log(chalk.yellow(`Warning: ${compat.warning}`));
		}

		console.log("");
		console.log(chalk.bold("Plugin contents:"));
		if (manifest.agents?.length)
			console.log(`  Agents: ${manifest.agents.join(", ")}`);
		if (manifest.commands?.length)
			console.log(`  Commands: ${manifest.commands.join(", ")}`);
		if (manifest.hooks?.length)
			console.log(`  Hooks: ${manifest.hooks.join(", ")}`);
		if (manifest.skills)
			console.log(`  Skills: ${Object.keys(manifest.skills).join(", ")}`);
		if (manifest.badi?.apiVersion) {
			console.log(chalk.dim(`  apiVersion: ${manifest.badi.apiVersion}`));
		}
		if (manifest.badi?.dependsOn?.length) {
			console.log(
				chalk.dim(`  dependsOn:  ${manifest.badi.dependsOn.join(", ")}`),
			);
		}
	} catch {
		// stay silent if the manifest cannot be read
	}
}
