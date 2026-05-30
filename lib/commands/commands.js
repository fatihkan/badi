// Badi commands command — profile-based command management.
//
// .claude/commands-vault/  → all commands (Claude Code does not load them)
// .claude/commands/        → active profile commands (Claude Code loads them)
//
// Profile tags: core, dev, content, pentest, all
// "core" stays active in every profile, "all" enables everything.

import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { chalk } from "../cli.js";
import {
	COMMAND_PROFILES,
	commandsForProfile,
	PROFILES,
	profileCounts,
} from "../command-profiles.js";
import {
	buildCommandHint,
	buildCommandIndex,
	routePrompt,
} from "../skills-router.js";

function paths(target) {
	const claudeDir = join(target, ".claude");
	return {
		claudeDir,
		vault: join(claudeDir, "commands-vault"),
		active: join(claudeDir, "commands"),
		state: join(claudeDir, "commands.profile.json"),
	};
}

function readProfileState(statePath) {
	if (!existsSync(statePath)) return { profile: "all", updatedAt: null };
	try {
		return JSON.parse(readFileSync(statePath, "utf-8"));
	} catch {
		return { profile: "all", updatedAt: null };
	}
}

function writeProfileState(statePath, profile) {
	writeFileSync(
		statePath,
		`${JSON.stringify({ profile, updatedAt: new Date().toISOString() }, null, 2)}\n`,
	);
}

function listMarkdownFiles(dir) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((f) => f.endsWith(".md"))
		.map((f) => f.replace(/\.md$/, ""))
		.sort();
}

function ensureDir(dir) {
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

/**
 * Copy the current .claude/commands/ contents into the vault.
 * Does not overwrite if already present in the vault (canonical-vault principle).
 * Returns: { migrated, skipped }
 */
function migrateToVault(active, vault) {
	ensureDir(vault);
	const sources = listMarkdownFiles(active);
	let migrated = 0;
	let skipped = 0;
	for (const name of sources) {
		const src = join(active, `${name}.md`);
		const dst = join(vault, `${name}.md`);
		if (existsSync(dst)) {
			skipped++;
			continue;
		}
		copyFileSync(src, dst);
		migrated++;
	}
	return { migrated, skipped };
}

/**
 * Apply a profile change:
 *  - From all commands in the vault, copy those matching the target profile
 *    into .claude/commands/ (if missing).
 *  - Remove commands outside the profile from .claude/commands/.
 *  - "all" profile = mirror the vault contents exactly.
 *  - Don't touch unknown commands (not in the vault) (user commands).
 *
 * Returns: { added: [], removed: [] }
 */
function applyProfile(vault, active, profile) {
	ensureDir(active);
	const vaultCmds = listMarkdownFiles(vault);
	const activeCmds = listMarkdownFiles(active);
	const targetSet = new Set(commandsForProfile(profile));

	const added = [];
	const removed = [];

	// Add missing ones
	for (const name of vaultCmds) {
		if (profile === "all" || targetSet.has(name)) {
			if (!activeCmds.includes(name)) {
				copyFileSync(join(vault, `${name}.md`), join(active, `${name}.md`));
				added.push(name);
			}
		}
	}

	// Remove those outside the profile (only ones defined in COMMAND_PROFILES)
	for (const name of activeCmds) {
		if (!COMMAND_PROFILES[name]) continue; // unknown = user command, don't touch
		if (profile === "all") continue;
		if (!targetSet.has(name)) {
			rmSync(join(active, `${name}.md`));
			removed.push(name);
		}
	}

	return { added: added.sort(), removed: removed.sort() };
}

function promptChoice(message) {
	return new Promise((resolve) => {
		const rl = createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		rl.question(message, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
}

function showHelp() {
	console.log(chalk.bold("Commands Management (Profile-based, v1.26+):"));
	console.log("");
	console.log(chalk.bold("Status / Listing:"));
	console.log(
		"  badi commands                    Active profile + command counts",
	);
	console.log(
		"  badi commands list               List active commands and their profiles",
	);
	console.log(
		"  badi commands available          List all commands in the vault",
	);
	console.log(
		"  badi commands profiles           Show profile definitions and counts",
	);
	console.log("");
	console.log(chalk.bold("Profile Management:"));
	console.log(`  badi commands profile            Show the active profile`);
	console.log(
		`  badi commands profile <name>     Change the profile (${PROFILES.join("|")})`,
	);
	console.log(
		"  badi commands migrate            Copy current commands/ to the vault (first setup)",
	);
	console.log(
		"  badi commands restore            Reset the whole profile to 'all' (put the entire vault in commands/)",
	);
	console.log("");
	console.log(chalk.bold("Prompt-Aware Routing (v1.26+):"));
	console.log(
		'  badi commands route "<prompt>"   Score commands matching the prompt',
	);
	console.log("  badi commands route < file.txt   Read prompt from stdin");
	console.log("");
	console.log(chalk.bold("Profile command flags:"));
	console.log(
		"  --yes, -y          Apply without asking for confirmation (required for CI/non-TTY)",
	);
	console.log("  --dry-run          Preview only, don't write to disk");
	console.log(
		"  --force            Re-apply the same profile (cache clearing)",
	);
	console.log("  --verbose, -v      List commands to add/remove by name");
	console.log("");
	console.log(chalk.bold("Route command flags:"));
	console.log("  --top N            Top N matches (default: 3)");
	console.log(
		"  --inject           Write a hint blob in hook format to stdout",
	);
	console.log(
		"  --json             JSON output (matched/contextLength fields)",
	);
	console.log("");
	console.log(chalk.bold("Profile logic:"));
	console.log("  core    — always active (session, metrics, audit)");
	console.log("  dev     — code, devops, security, audit tools");
	console.log("  content — social media, brand, content calendar");
	console.log("  pentest — authorized pentest engagement (future)");
	console.log("  all     — everything (default)");
	console.log("");
	console.log(chalk.bold("Examples:"));
	console.log(chalk.dim("  badi commands profile content --yes"));
	console.log(chalk.dim("  badi commands profile dev --dry-run --verbose"));
	console.log(chalk.dim('  badi commands route "write a new post" --top 5'));
	console.log(chalk.dim('  badi commands route "react bug fix" --json'));
	console.log(
		chalk.dim('  echo "release plan" | badi commands route --inject'),
	);
	console.log("");
	console.log(
		chalk.dim(
			"Note: changing the profile physically edits the .claude/commands/ contents.",
		),
	);
	console.log(
		chalk.dim(
			"     The vault stays canonical; you can always revert the profile to 'all'.",
		),
	);
	console.log(
		chalk.dim(
			"     Commands outside the vault (user commands) are not touched.",
		),
	);
}

function status(target) {
	const { vault, active, state } = paths(target);
	if (!existsSync(vault)) {
		console.log(
			chalk.yellow("Vault not created. First setup: badi commands migrate"),
		);
		return;
	}
	const vaultCmds = listMarkdownFiles(vault);
	const activeCmds = listMarkdownFiles(active);
	const { profile } = readProfileState(state);
	const counts = profileCounts();
	console.log(chalk.bold("Commands Status"));
	console.log("");
	console.log(`  Active profile : ${chalk.cyan(profile)}`);
	console.log(`  Vault total    : ${vaultCmds.length} commands`);
	console.log(`  Active total   : ${activeCmds.length} commands`);
	console.log("");
	console.log(chalk.bold("Profile counts (from vault):"));
	console.log(`  core    ${chalk.green(counts.core)}`);
	console.log(`  dev     ${chalk.cyan(counts.dev)}`);
	console.log(`  content ${chalk.magenta(counts.content)}`);
	console.log(`  pentest ${chalk.yellow(counts.pentest)}`);
	console.log("");
	console.log(
		chalk.dim("Change profile: badi commands profile <core|dev|content|all>"),
	);
}

function listActive(target) {
	const { active, state } = paths(target);
	const cmds = listMarkdownFiles(active);
	const { profile } = readProfileState(state);
	console.log(
		chalk.bold(`Active commands (${cmds.length}) — profile: ${profile}`),
	);
	console.log("");
	for (const name of cmds) {
		const p = COMMAND_PROFILES[name] || "user";
		const color =
			p === "core"
				? chalk.green
				: p === "dev"
					? chalk.cyan
					: p === "content"
						? chalk.magenta
						: p === "pentest"
							? chalk.yellow
							: chalk.dim;
		console.log(`  ${color(`[${p}]`.padEnd(10))} ${name}`);
	}
}

function listAvailable(target) {
	const { vault } = paths(target);
	if (!existsSync(vault)) {
		console.log(
			chalk.yellow("Vault not created. First setup: badi commands migrate"),
		);
		return;
	}
	const cmds = listMarkdownFiles(vault);
	console.log(chalk.bold(`Vault contents (${cmds.length}):`));
	console.log("");
	for (const name of cmds) {
		const p = COMMAND_PROFILES[name] || "user";
		console.log(`  ${chalk.dim(`[${p}]`.padEnd(10))} ${name}`);
	}
}

function showProfiles() {
	const counts = profileCounts();
	const total = Object.values(counts).reduce((a, b) => a + b, 0);
	console.log(chalk.bold("Profile Definitions"));
	console.log("");
	console.log(
		`  ${chalk.green("core")}    ${counts.core} commands — always active`,
	);
	console.log(
		`  ${chalk.cyan("dev")}     ${counts.dev} commands — development/devops/audit`,
	);
	console.log(
		`  ${chalk.magenta("content")} ${counts.content} commands — social media/brand/content`,
	);
	console.log(
		`  ${chalk.yellow("pentest")} ${counts.pentest} commands — authorized pentest (future)`,
	);
	console.log("");
	console.log(`  Total defined: ${total} commands`);
}

async function switchProfile(target, profile, opts = {}) {
	if (!PROFILES.includes(profile)) {
		console.error(chalk.red(`Unknown profile: ${profile}`));
		console.error(chalk.dim(`Valid profiles: ${PROFILES.join(", ")}`));
		process.exitCode = 1;
		return;
	}
	const { vault, active, state } = paths(target);
	if (!existsSync(vault)) {
		console.error(
			chalk.red("Vault not created. For first setup: badi commands migrate"),
		);
		process.exitCode = 1;
		return;
	}

	const current = readProfileState(state).profile;
	if (current === profile && !opts.force) {
		console.log(chalk.green(`✓ You're already on the ${profile} profile.`));
		console.log(
			chalk.dim(`To re-apply: badi commands profile ${profile} --force`),
		);
		return;
	}

	// Dry-run preview
	const vaultCmds = listMarkdownFiles(vault);
	const activeCmds = listMarkdownFiles(active);
	const targetSet = new Set(commandsForProfile(profile));
	const willAdd = vaultCmds.filter(
		(n) => (profile === "all" || targetSet.has(n)) && !activeCmds.includes(n),
	);
	const willRemove = activeCmds.filter(
		(n) => COMMAND_PROFILES[n] && profile !== "all" && !targetSet.has(n),
	);

	console.log(chalk.bold(`Profile: ${current} → ${profile}`));
	console.log("");
	if (willAdd.length > 0) {
		console.log(chalk.green(`  + ${willAdd.length} commands will be added`));
		if (opts.verbose) for (const n of willAdd) console.log(`     + ${n}`);
	}
	if (willRemove.length > 0) {
		console.log(chalk.red(`  − ${willRemove.length} commands will be removed`));
		if (opts.verbose) for (const n of willRemove) console.log(`     − ${n}`);
	}
	if (willAdd.length === 0 && willRemove.length === 0) {
		console.log(chalk.dim("  No changes."));
		writeProfileState(state, profile);
		return;
	}

	if (opts.dryRun) {
		console.log("");
		console.log(chalk.dim("--dry-run active: nothing written to disk."));
		return;
	}

	if (!opts.yes) {
		if (!process.stdin.isTTY) {
			console.error(chalk.red("Non-TTY: use --yes or run in a TTY."));
			process.exitCode = 1;
			return;
		}
		const ans = await promptChoice("Confirm? [y/N] ");
		if (!/^(y|yes)$/i.test(ans)) {
			console.log(chalk.dim("Cancelled."));
			return;
		}
	}

	const result = applyProfile(vault, active, profile);
	writeProfileState(state, profile);
	console.log("");
	console.log(
		chalk.green(
			`✓ Profile applied: +${result.added.length} / −${result.removed.length}`,
		),
	);
}

function runMigrate(target, opts = {}) {
	const { vault, active, state } = paths(target);
	if (!existsSync(active)) {
		console.error(chalk.red(".claude/commands/ not found."));
		process.exitCode = 1;
		return;
	}
	const result = migrateToVault(active, vault);
	if (!existsSync(state)) writeProfileState(state, "all");
	console.log(
		chalk.green(
			`✓ Migrate: ${result.migrated} copied, ${result.skipped} already existed.`,
		),
	);
	console.log(chalk.dim(`Vault: ${vault}`));
	if (opts.verbose) {
		console.log(chalk.dim(`Profile state: ${state} (all)`));
	}
}

async function runRestore(target, opts = {}) {
	await switchProfile(target, "all", { ...opts, force: true });
}

export async function commandsCommand(args, opts = {}) {
	const target = opts.cwd || process.cwd();
	const sub = args[0];

	if (!sub) {
		status(target);
		return;
	}

	if (sub === "--help" || sub === "-h" || sub === "help") {
		showHelp();
		return;
	}

	const restArgs = args.slice(1);
	const flags = {
		yes: restArgs.includes("--yes") || restArgs.includes("-y"),
		dryRun: restArgs.includes("--dry-run"),
		force: restArgs.includes("--force"),
		verbose: restArgs.includes("--verbose") || restArgs.includes("-v"),
	};

	switch (sub) {
		case "list":
			listActive(target);
			return;
		case "available":
			listAvailable(target);
			return;
		case "profiles":
			showProfiles();
			return;
		case "profile": {
			const profile = restArgs.find((a) => !a.startsWith("-"));
			if (!profile) {
				const { state } = paths(target);
				const cur = readProfileState(state).profile;
				console.log(`Active profile: ${chalk.cyan(cur)}`);
				console.log(
					chalk.dim(`Change: badi commands profile <${PROFILES.join("|")}>`),
				);
				return;
			}
			await switchProfile(target, profile, flags);
			return;
		}
		case "migrate":
			runMigrate(target, flags);
			return;
		case "restore":
			await runRestore(target, flags);
			return;
		case "route": {
			const promptArgs = args.slice(1);
			let inject = false;
			let json = false;
			let topN = 3;
			const promptParts = [];
			for (let i = 0; i < promptArgs.length; i++) {
				const a = promptArgs[i];
				if (a === "--inject") inject = true;
				else if (a === "--json") json = true;
				else if (a === "--top")
					topN = Math.max(1, Number.parseInt(promptArgs[++i], 10) || 3);
				else promptParts.push(a);
			}
			let prompt = promptParts.join(" ").trim();
			if (!prompt) {
				try {
					prompt = readFileSync(0, "utf-8").trim();
				} catch {
					/* ignore */
				}
			}
			if (!prompt) {
				console.error(chalk.red("Error: prompt required (arg or stdin)."));
				process.exitCode = 1;
				return;
			}

			const { vault } = paths(target);
			const index = buildCommandIndex(vault);
			const matched = routePrompt(prompt, index, { top: topN, minScore: 1 });

			if (inject) {
				const blob = buildCommandHint(matched, index);
				if (json) {
					console.log(
						JSON.stringify({ matched, contextLength: blob.length }, null, 2),
					);
				} else if (blob) {
					process.stdout.write(blob);
				}
				return;
			}
			if (json) {
				console.log(JSON.stringify({ prompt, matched }, null, 2));
				return;
			}
			console.log(
				chalk.bold(
					`Prompt: "${prompt.slice(0, 80)}${prompt.length > 80 ? "…" : ""}"`,
				),
			);
			console.log("");
			if (matched.length === 0) {
				console.log(chalk.dim("(no matching command)"));
				return;
			}
			console.log(chalk.bold(`Matching commands (${matched.length}):`));
			for (const m of matched) {
				console.log(
					`  ${chalk.bold(`/${m.name}`.padEnd(22))} ${chalk.green(`score ${m.score}`)}`,
				);
			}
			return;
		}
		default:
			console.error(chalk.red(`Unknown subcommand: ${sub}`));
			console.error(chalk.dim("Help: badi commands --help"));
			process.exitCode = 1;
	}
}

// Test exports
export {
	applyProfile,
	listMarkdownFiles,
	migrateToVault,
	paths,
	readProfileState,
	writeProfileState,
};
