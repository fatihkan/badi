import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { chalk, VERSION } from "./cli.js";
import { semverGt } from "./helpers.js";

// semverGt now lives in lib/helpers.js (single semver source); re-exported so
// existing importers of this module keep working.
export { semverGt };

export async function checkForUpdate() {
	if (process.env.BADI_NO_UPDATE_NOTIFIER === "1" || process.env.CI)
		return null;

	const configDir = join(homedir(), ".config", "badi");
	const cacheFile = join(configDir, "update-check.json");

	try {
		if (existsSync(cacheFile)) {
			const cache = JSON.parse(readFileSync(cacheFile, "utf-8"));
			if (Date.now() - new Date(cache.lastCheck).getTime() < 86400000) {
				return { current: VERSION, latest: cache.latestVersion };
			}
		}
	} catch {
		// Cache read error
	}

	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 3000);
		const res = await fetch(
			"https://registry.npmjs.org/@fatihkan/badi/latest",
			{
				signal: controller.signal,
			},
		);
		clearTimeout(timeout);
		const data = await res.json();
		const latest = data.version;

		try {
			mkdirSync(configDir, { recursive: true });
			writeFileSync(
				cacheFile,
				JSON.stringify({
					lastCheck: new Date().toISOString(),
					latestVersion: latest,
				}),
			);
		} catch {
			// Cache write error
		}

		return { current: VERSION, latest };
	} catch {
		return null;
	}
}

export function showUpdateBanner(info) {
	if (!info || !semverGt(info.latest, info.current)) return;
	console.log("");
	console.log(
		chalk.yellow("┌─────────────────────────────────────────────────┐"),
	);
	console.log(
		chalk.yellow(
			`│  New version available: ${chalk.bold(info.current)} → ${chalk.bold.green(info.latest)}${" ".repeat(Math.max(0, 21 - info.current.length - info.latest.length))}│`,
		),
	);
	console.log(
		chalk.yellow(
			`│  Update: ${chalk.cyan("npm install -g @fatihkan/badi")}          │`,
		),
	);
	console.log(
		chalk.yellow("└─────────────────────────────────────────────────┘"),
	);
}
