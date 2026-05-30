import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { chalk, showBanner } from "../cli.js";

// ─── Site Configuration ───

const CONFIG_DIR = join(homedir(), ".config", "badi");
const SITES_FILE = join(CONFIG_DIR, "wp-sites.json");

// Light obfuscation — against shoulder surfing, not real password protection.
// keytar integration to be added in v2.0.
function obfuscate(s) {
	return s ? `b64:${Buffer.from(s).toString("base64")}` : s;
}
function deobfuscate(s) {
	if (!s || typeof s !== "string" || !s.startsWith("b64:")) return s;
	try {
		return Buffer.from(s.slice(4), "base64").toString("utf-8");
	} catch {
		return s;
	}
}

function loadSites() {
	try {
		if (existsSync(SITES_FILE)) {
			const data = JSON.parse(readFileSync(SITES_FILE, "utf-8"));
			for (const s of data.sites || []) {
				if (s.appPassword) s.appPassword = deobfuscate(s.appPassword);
			}
			return data;
		}
	} catch {
		/* corrupt file */
	}
	return { sites: [] };
}

function saveSites(data) {
	mkdirSync(CONFIG_DIR, { recursive: true });
	const serializable = JSON.parse(JSON.stringify(data));
	for (const s of serializable.sites || []) {
		if (s.appPassword) s.appPassword = obfuscate(s.appPassword);
	}
	writeFileSync(SITES_FILE, JSON.stringify(serializable, null, 2), {
		mode: 0o600,
	});
}

function findSite(alias) {
	const data = loadSites();
	return data.sites.find((s) => s.alias === alias || s.url === alias);
}

// ─── WP-CLI Helpers ───

function _hasWpCli() {
	try {
		execFileSync("wp", ["--version"], { stdio: "pipe" });
		return true;
	} catch {
		return false;
	}
}

function wpCmd(siteArgs, cmd, opts = {}) {
	const fullCmd = [...siteArgs, ...cmd];
	const timeout = opts.timeout || 30000;
	try {
		return execFileSync("wp", fullCmd, { stdio: "pipe", timeout })
			.toString()
			.trim();
	} catch (e) {
		throw new Error(e.stderr?.toString().trim() || e.message);
	}
}

function getSiteArgs(site) {
	const args = [];
	if (site.ssh) {
		args.push(`--ssh=${site.ssh}`);
	} else if (site.path) {
		args.push(`--path=${site.path}`);
	}
	if (site.url) args.push(`--url=${site.url}`);
	return args;
}

// ─── WP REST API Helpers ───

async function _wpApi(site, endpoint) {
	const baseUrl = site.url.replace(/\/$/, "");
	const url = `${baseUrl}/wp-json/wp/v2/${endpoint}`;
	const headers = {};
	if (site.appPassword) {
		const auth = Buffer.from(`${site.username}:${site.appPassword}`).toString(
			"base64",
		);
		headers.Authorization = `Basic ${auth}`;
	}
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10000);
	try {
		const res = await fetch(url, { signal: controller.signal, headers });
		clearTimeout(timeout);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return await res.json();
	} catch (e) {
		clearTimeout(timeout);
		throw new Error(`API error: ${e.message}`);
	}
}

async function wpApiRoot(site) {
	const baseUrl = site.url.replace(/\/$/, "");
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10000);
	try {
		const res = await fetch(`${baseUrl}/wp-json/`, {
			signal: controller.signal,
		});
		clearTimeout(timeout);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return await res.json();
	} catch (e) {
		clearTimeout(timeout);
		throw new Error(`API error: ${e.message}`);
	}
}

// ─── Subcommands ───

async function wpStatus(site) {
	console.log(chalk.bold(`WordPress Status: ${site.alias}`));
	console.log(`  URL: ${chalk.cyan(site.url)}`);
	console.log("");

	if (site.method === "wp-cli") {
		const siteArgs = getSiteArgs(site);
		try {
			const version = wpCmd(siteArgs, ["core", "version"]);
			console.log(`  WP Version:  ${chalk.green(version)}`);

			const theme = wpCmd(siteArgs, [
				"theme",
				"list",
				"--status=active",
				"--format=csv",
				"--fields=name,version",
			]);
			const themeLines = theme.split("\n").slice(1);
			for (const line of themeLines) {
				const [name, ver] = line.split(",");
				console.log(`  Active Theme: ${chalk.cyan(name)} v${ver}`);
			}

			const plugins = wpCmd(siteArgs, [
				"plugin",
				"list",
				"--format=csv",
				"--fields=name,status,version,update",
			]);
			const pluginLines = plugins.split("\n").slice(1).filter(Boolean);
			let activeCount = 0;
			let updateCount = 0;
			for (const line of pluginLines) {
				const parts = line.split(",");
				if (parts[1] === "active") activeCount++;
				if (parts[3] === "available") updateCount++;
			}
			console.log(
				`  Plugins:     ${chalk.cyan(activeCount)} active, ${updateCount > 0 ? chalk.yellow(`${updateCount} updates pending`) : chalk.green("up to date")}`,
			);

			const updates = wpCmd(siteArgs, [
				"core",
				"check-update",
				"--format=csv",
			]).trim();
			if (updates && !updates.includes("Success")) {
				console.log(`  Core:        ${chalk.yellow("Update available")}`);
			} else {
				console.log(`  Core:        ${chalk.green("Up to date")}`);
			}
		} catch (e) {
			console.error(chalk.red(`WP-CLI error: ${e.message}`));
		}
	} else {
		try {
			const info = await wpApiRoot(site);
			console.log(`  Site Name:   ${chalk.cyan(info.name || "?")}`);
			console.log(`  Description: ${chalk.dim(info.description || "?")}`);
			console.log(
				`  WP Version:  ${chalk.green(info.gmt_offset !== undefined ? "REST API accessible" : "?")}`,
			);
			console.log(
				`  Namespace:   ${chalk.dim((info.namespaces || []).join(", "))}`,
			);
		} catch (e) {
			console.error(chalk.red(`REST API error: ${e.message}`));
		}
	}
}

function wpPlugins(site) {
	if (site.method !== "wp-cli") {
		console.error(
			chalk.yellow(
				`Plugin management requires WP-CLI. Site method: ${site.method}`,
			),
		);
		return;
	}
	const siteArgs = getSiteArgs(site);
	try {
		const output = wpCmd(siteArgs, ["plugin", "list", "--format=table"]);
		console.log(chalk.bold(`Plugins: ${site.alias}`));
		console.log(output);
	} catch (e) {
		console.error(chalk.red(`Error: ${e.message}`));
	}
}

function wpThemes(site) {
	if (site.method !== "wp-cli") {
		console.error(chalk.yellow("Theme management requires WP-CLI."));
		return;
	}
	const siteArgs = getSiteArgs(site);
	try {
		const output = wpCmd(siteArgs, ["theme", "list", "--format=table"]);
		console.log(chalk.bold(`Themes: ${site.alias}`));
		console.log(output);
	} catch (e) {
		console.error(chalk.red(`Error: ${e.message}`));
	}
}

function wpUpdate(site, target) {
	if (site.method !== "wp-cli") {
		console.error(chalk.yellow("Updates require WP-CLI."));
		return;
	}
	const siteArgs = getSiteArgs(site);
	const longTimeout = { timeout: 120000 };
	try {
		if (!target || target === "all") {
			console.log(chalk.bold("Updating core..."));
			console.log(wpCmd(siteArgs, ["core", "update"], longTimeout));
			console.log(chalk.bold("Updating plugins..."));
			console.log(wpCmd(siteArgs, ["plugin", "update", "--all"], longTimeout));
			console.log(chalk.bold("Updating themes..."));
			console.log(wpCmd(siteArgs, ["theme", "update", "--all"], longTimeout));
		} else if (target === "core") {
			console.log(wpCmd(siteArgs, ["core", "update"], longTimeout));
		} else if (target === "plugins") {
			console.log(wpCmd(siteArgs, ["plugin", "update", "--all"], longTimeout));
		} else if (target === "themes") {
			console.log(wpCmd(siteArgs, ["theme", "update", "--all"], longTimeout));
		} else {
			console.log(wpCmd(siteArgs, ["plugin", "update", target], longTimeout));
		}
		console.log(chalk.bold.green("Update complete!"));
	} catch (e) {
		console.error(chalk.red(`Update error: ${e.message}`));
	}
}

function wpSecurity(site) {
	if (site.method !== "wp-cli") {
		console.error(chalk.yellow("Security scan requires WP-CLI."));
		return;
	}
	const siteArgs = getSiteArgs(site);
	console.log(chalk.bold(`Security Scan: ${site.alias}`));
	console.log("");

	let issues = 0;

	// WP version
	try {
		const version = wpCmd(siteArgs, ["core", "version"]);
		const updates = wpCmd(siteArgs, [
			"core",
			"check-update",
			"--format=csv",
		]).trim();
		if (updates && !updates.includes("Success")) {
			console.log(`  ${chalk.red("XX")} WP Core not up to date (${version})`);
			issues++;
		} else {
			console.log(`  ${chalk.green("OK")} WP Core up to date (${version})`);
		}
	} catch {
		/* */
	}

	// Plugin updates
	try {
		const plugins = wpCmd(siteArgs, [
			"plugin",
			"list",
			"--format=csv",
			"--fields=name,status,update",
		]);
		const outdated = plugins
			.split("\n")
			.slice(1)
			.filter((l) => l.includes("available"));
		if (outdated.length > 0) {
			console.log(
				`  ${chalk.red("XX")} ${outdated.length} plugins pending update`,
			);
			for (const p of outdated)
				console.log(`       ${chalk.dim(p.split(",")[0])}`);
			issues++;
		} else {
			console.log(`  ${chalk.green("OK")} All plugins up to date`);
		}
	} catch {
		/* */
	}

	// Inactive plugins
	try {
		const plugins = wpCmd(siteArgs, [
			"plugin",
			"list",
			"--status=inactive",
			"--format=csv",
			"--fields=name",
		]);
		const inactive = plugins.split("\n").slice(1).filter(Boolean);
		if (inactive.length > 0) {
			console.log(
				`  ${chalk.yellow("!!")} ${inactive.length} inactive plugins (remove or activate)`,
			);
			issues++;
		} else {
			console.log(`  ${chalk.green("OK")} No inactive plugins`);
		}
	} catch {
		/* */
	}

	// File permissions (local site)
	if (site.path) {
		try {
			const wpConfig = join(site.path, "wp-config.php");
			if (existsSync(wpConfig)) {
				const content = readFileSync(wpConfig, "utf-8");
				if (
					content.includes("define('WP_DEBUG', true)") ||
					content.includes("define( 'WP_DEBUG', true )")
				) {
					console.log(
						`  ${chalk.yellow("!!")} WP_DEBUG is on — should be off in production`,
					);
					issues++;
				} else {
					console.log(`  ${chalk.green("OK")} WP_DEBUG is off`);
				}
				if (!content.includes("DISALLOW_FILE_EDIT")) {
					console.log(`  ${chalk.yellow("!!")} DISALLOW_FILE_EDIT not defined`);
					issues++;
				} else {
					console.log(`  ${chalk.green("OK")} DISALLOW_FILE_EDIT defined`);
				}
			}
		} catch {
			/* */
		}
	}

	// Admin user
	try {
		const users = wpCmd(siteArgs, [
			"user",
			"list",
			"--role=administrator",
			"--format=csv",
			"--fields=user_login",
		]);
		const admins = users.split("\n").slice(1).filter(Boolean);
		const hasAdmin = admins.some((u) => u.trim().toLowerCase() === "admin");
		if (hasAdmin) {
			console.log(`  ${chalk.red("XX")} 'admin' username exists — change it`);
			issues++;
		} else {
			console.log(`  ${chalk.green("OK")} No default 'admin' user`);
		}
		if (admins.length > 3) {
			console.log(
				`  ${chalk.yellow("!!")} ${admins.length} admin users — revoke unnecessary privileges`,
			);
			issues++;
		}
	} catch {
		/* */
	}

	console.log("");
	if (issues === 0) {
		console.log(chalk.bold.green("Security scan clean!"));
	} else {
		console.log(chalk.bold.yellow(`${issues} issues detected.`));
	}
}

// ─── Main Command ───

export async function runWp(args) {
	const sub = args[0];

	if (!sub || sub === "--help" || sub === "-h") {
		showBanner();
		console.log(chalk.bold("WordPress Management:"));
		console.log("");
		console.log(chalk.bold.cyan("Site Management:"));
		console.log(`  ${chalk.cyan("badi wp add")} [alias] [url]        Add site`);
		console.log(
			`  ${chalk.cyan("badi wp list")}                     List saved sites`,
		);
		console.log(
			`  ${chalk.cyan("badi wp remove")} [alias]           Remove site`,
		);
		console.log("");
		console.log(chalk.bold.cyan("Status and Analysis:"));
		console.log(
			`  ${chalk.cyan("badi wp status")} [alias]           Site status (version, theme, plugins)`,
		);
		console.log(
			`  ${chalk.cyan("badi wp plugins")} [alias]          Plugin list`,
		);
		console.log(
			`  ${chalk.cyan("badi wp themes")} [alias]           Theme list`,
		);
		console.log(
			`  ${chalk.cyan("badi wp security")} [alias]         Security scan`,
		);
		console.log("");
		console.log(chalk.bold.cyan("Operations:"));
		console.log(
			`  ${chalk.cyan("badi wp update")} [alias] [target]  Update (all/core/plugins/themes)`,
		);
		console.log("");
		console.log(chalk.bold("Connection Methods:"));
		console.log(`  --method wp-cli     ${chalk.dim("WP-CLI (local or SSH)")}`);
		console.log(`  --method rest       ${chalk.dim("WordPress REST API")}`);
		console.log(
			`  --path /var/www/    ${chalk.dim("Local WP directory (wp-cli)")}`,
		);
		console.log(`  --ssh user@host     ${chalk.dim("WP-CLI over SSH")}`);
		console.log(`  --user admin        ${chalk.dim("REST API username")}`);
		console.log(
			`  --app-password XXX  ${chalk.dim("REST API application password")}`,
		);
		console.log("");
		console.log(chalk.bold("Examples:"));
		console.log("  badi wp add blog https://blog.example.com --method rest");
		console.log(
			"  badi wp add staging --method wp-cli --ssh user@staging.example.com",
		);
		console.log("  badi wp add local --method wp-cli --path /var/www/html");
		console.log("  badi wp status blog");
		console.log("  badi wp security staging");
		console.log("  badi wp update staging all");
		return;
	}

	// add
	if (sub === "add") {
		const alias = args[1];
		const url = args[2] || "";
		if (!alias) {
			console.error(
				chalk.red("Specify a site alias: badi wp add [alias] [url]"),
			);
			process.exit(1);
		}

		const siteConfig = {
			alias,
			url,
			method: "wp-cli",
			path: null,
			ssh: null,
			username: null,
			appPassword: null,
		};

		for (let i = 3; i < args.length; i++) {
			switch (args[i]) {
				case "--method":
					siteConfig.method = args[++i] || "wp-cli";
					break;
				case "--path":
					siteConfig.path = args[++i];
					break;
				case "--ssh":
					siteConfig.ssh = args[++i];
					break;
				case "--user":
					siteConfig.username = args[++i];
					break;
				case "--app-password":
					siteConfig.appPassword = args[++i];
					break;
			}
		}

		const data = loadSites();
		const existing = data.sites.findIndex((s) => s.alias === alias);
		if (existing >= 0) {
			data.sites[existing] = siteConfig;
			console.log(chalk.yellow(`Site updated: ${alias}`));
		} else {
			data.sites.push(siteConfig);
			console.log(chalk.bold.green(`Site added: ${alias}`));
		}
		saveSites(data);

		console.log(`  Alias:   ${chalk.cyan(alias)}`);
		console.log(`  URL:     ${chalk.cyan(url || "(none)")}`);
		console.log(`  Method:  ${chalk.cyan(siteConfig.method)}`);
		if (siteConfig.path)
			console.log(`  Path:    ${chalk.cyan(siteConfig.path)}`);
		if (siteConfig.ssh) console.log(`  SSH:     ${chalk.cyan(siteConfig.ssh)}`);
		return;
	}

	// list
	if (sub === "list") {
		const data = loadSites();
		if (data.sites.length === 0) {
			console.log(chalk.dim("No saved WordPress sites."));
			console.log(
				chalk.dim("Add: badi wp add [alias] [url] --method [wp-cli|rest]"),
			);
			return;
		}
		console.log(chalk.bold(`WordPress Sites (${data.sites.length}):`));
		console.log("");
		console.log(
			`  ${chalk.dim("Alias".padEnd(15))}${chalk.dim("URL".padEnd(35))}${chalk.dim("Method".padEnd(10))}${chalk.dim("Connection")}`,
		);
		console.log(chalk.dim(`  ${"─".repeat(70)}`));
		for (const s of data.sites) {
			const conn = s.ssh ? `ssh:${s.ssh}` : s.path ? `path:${s.path}` : "rest";
			console.log(
				`  ${s.alias.padEnd(15)}${(s.url || "-").substring(0, 33).padEnd(35)}${(s.method || "?").padEnd(10)}${chalk.dim(conn)}`,
			);
		}
		return;
	}

	// remove
	if (sub === "remove") {
		const alias = args[1];
		if (!alias) {
			console.error(chalk.red("Specify a site alias."));
			process.exit(1);
		}
		const data = loadSites();
		const idx = data.sites.findIndex((s) => s.alias === alias);
		if (idx === -1) {
			console.error(chalk.red(`Site not found: ${alias}`));
			process.exit(1);
		}
		data.sites.splice(idx, 1);
		saveSites(data);
		console.log(chalk.green(`Site deleted: ${alias}`));
		return;
	}

	// Commands that require a site
	const siteAlias = args[1];
	if (!siteAlias) {
		console.error(chalk.red(`Specify a site alias: badi wp ${sub} [alias]`));
		process.exit(1);
	}
	const site = findSite(siteAlias);
	if (!site) {
		console.error(chalk.red(`Site not found: ${siteAlias}`));
		console.log(chalk.dim("Saved sites: badi wp list"));
		process.exit(1);
	}

	switch (sub) {
		case "status":
			await wpStatus(site);
			break;
		case "plugins":
			wpPlugins(site);
			break;
		case "themes":
			wpThemes(site);
			break;
		case "update":
			wpUpdate(site, args[2]);
			break;
		case "security":
			wpSecurity(site);
			break;
		default:
			console.error(chalk.red(`Unknown wp command: ${sub}`));
			console.log(
				"Usage: badi wp [add|list|remove|status|plugins|themes|update|security]",
			);
			process.exit(1);
	}
}
