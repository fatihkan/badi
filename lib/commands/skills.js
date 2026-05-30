// Badi skills command — opt-in skill management.
//
// .claude/skills-vault/  → all skills (Claude Code does not load them)
// .claude/skills/        → user selection (Claude Code loads them)
//
// To save tokens: installed skills start at 0, the user selects.

import {
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline";
import { chalk } from "../cli.js";
import { listDirs } from "../helpers.js";
import {
	buildContextInjection,
	buildSkillIndex,
	routePrompt,
} from "../skills-router.js";
import { detectStack } from "../stack-detector.js";

function paths(target) {
	const claudeDir = join(target, ".claude");
	return {
		vault: join(claudeDir, "skills-vault"),
		active: join(claudeDir, "skills"),
	};
}

// Legitimate name format for skill categories. Blocks path-traversal
// attacks: contains no '../', '/', '\', '.'.
const SKILL_NAME_RE = /^[a-z0-9][a-z0-9-]*$/;

export function isValidSkillName(name) {
	return typeof name === "string" && SKILL_NAME_RE.test(name);
}

function listSkillCategories(dir) {
	if (!existsSync(dir)) return [];
	return listDirs(dir).sort();
}

function isSkillCategory(dir, name) {
	if (!isValidSkillName(name)) return false;
	const path = join(dir, name);
	if (!existsSync(path)) return false;
	try {
		return statSync(path).isDirectory();
	} catch {
		return false;
	}
}

function readSkillDescription(skillDir) {
	const skillFile = join(skillDir, "SKILL.md");
	if (!existsSync(skillFile)) return null;
	try {
		const content = readFileSync(skillFile, "utf-8");
		const fmMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
		if (!fmMatch) return null;
		const desc = fmMatch[1].match(/^description:\s*(.+)$/m);
		return desc ? desc[1].trim().replace(/^["']|["']$/g, "") : null;
	} catch {
		return null;
	}
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

function parseSelection(input, max) {
	const trimmed = input.trim().toLowerCase();
	if (!trimmed) return { indices: [], action: "cancel" };
	if (trimmed === "all")
		return { indices: [...Array(max).keys()], action: "set" };
	if (trimmed === "none" || trimmed === "clear")
		return { indices: [], action: "set" };

	const tokens = trimmed.split(/[,\s]+/).filter(Boolean);
	const indices = new Set();
	for (const tok of tokens) {
		const range = tok.match(/^(\d+)-(\d+)$/);
		if (range) {
			const a = Number.parseInt(range[1], 10);
			const b = Number.parseInt(range[2], 10);
			if (a >= 1 && b >= a && b <= max) {
				for (let i = a; i <= b; i++) indices.add(i - 1);
			}
		} else {
			const n = Number.parseInt(tok, 10);
			if (n >= 1 && n <= max) indices.add(n - 1);
		}
	}
	return { indices: [...indices].sort((a, b) => a - b), action: "set" };
}

function copySkill(vault, active, name) {
	if (!isValidSkillName(name)) {
		throw new Error(`Invalid skill name: ${name}`);
	}
	const src = join(vault, name);
	const dst = join(active, name);
	if (!existsSync(src)) {
		throw new Error(`Not found in vault: ${name}`);
	}
	if (existsSync(dst)) {
		return { added: false };
	}
	cpSync(src, dst, { recursive: true });
	return { added: true };
}

function removeSkill(active, name) {
	if (!isValidSkillName(name)) {
		throw new Error(`Invalid skill name: ${name}`);
	}
	const dst = join(active, name);
	if (!existsSync(dst)) return { removed: false };
	rmSync(dst, { recursive: true, force: true });
	return { removed: true };
}

function ensureActiveDir(active) {
	if (!existsSync(active)) mkdirSync(active, { recursive: true });
}

function printStatusTable({ vaultList, activeSet }) {
	const total = vaultList.length;
	const active = activeSet.size;
	console.log(chalk.bold(`Skills status: ${active}/${total} active`));
	console.log("");
	const W = 22;
	for (let i = 0; i < vaultList.length; i++) {
		const name = vaultList[i];
		const isActive = activeSet.has(name);
		const marker = isActive ? chalk.green("[v]") : chalk.dim("[ ]");
		const num = String(i + 1).padStart(2, " ");
		console.log(`  ${marker} ${chalk.cyan(num)}) ${name.padEnd(W)}`);
	}
	console.log("");
}

function summarizeDetection(result, vaultList) {
	const vaultSet = new Set(vaultList);
	const proposedSet = new Set();
	for (const s of result.skills) {
		if (vaultSet.has(s)) proposedSet.add(s);
	}
	return { proposedSet };
}

function printDetectResult(result, vaultList, activeSet) {
	const { proposedSet } = summarizeDetection(result, vaultList);
	console.log(
		chalk.bold(`Stack detected: ${result.technologies.length} technologies`),
	);
	console.log("");
	if (result.technologies.length === 0) {
		console.log(
			chalk.dim(
				"  (no match — package.json/configFile/manifest files are scanned)",
			),
		);
		return;
	}
	for (const t of result.technologies) {
		const skillTxt = t.skills.length
			? chalk.dim(`→ ${t.skills.join(", ")}`)
			: chalk.dim("→ (no skill)");
		console.log(
			`  ${chalk.green("✓")} ${chalk.cyan(t.name.padEnd(18))} ${chalk.dim(`[${t.source}]`)}  ${skillTxt}`,
		);
	}
	console.log("");
	console.log(chalk.bold(`Suggested skill categories: ${proposedSet.size}`));
	const sorted = [...proposedSet].sort();
	for (const name of sorted) {
		const isActive = activeSet.has(name);
		const marker = isActive ? chalk.green("[v]") : chalk.yellow("[ ]");
		const tag = isActive
			? chalk.dim("(already active)")
			: chalk.dim("(not active)");
		console.log(`  ${marker} ${chalk.cyan(name.padEnd(20))} ${tag}`);
	}
	const inactive = sorted.filter((n) => !activeSet.has(n));
	if (inactive.length > 0) {
		console.log("");
		console.log(
			chalk.dim(
				`To activate: badi skills auto-install  (or individually: badi skills add ${inactive.join(" ")})`,
			),
		);
	}
}

async function runAutoInstall({
	target,
	vault,
	active,
	vaultList,
	activeSet,
	autoYes,
	dryRun,
}) {
	const result = detectStack(target);
	const { proposedSet } = summarizeDetection(result, vaultList);

	if (result.technologies.length === 0) {
		console.log(chalk.dim("No stack detected — no changes."));
		return;
	}

	if (proposedSet.size === 0) {
		console.log(
			chalk.yellow(
				"No suitable skill category in the vault for the detected technologies.",
			),
		);
		console.log(
			chalk.dim("(no match in stack-map.js or the category was removed)"),
		);
		return;
	}

	const toAdd = [...proposedSet].filter((s) => !activeSet.has(s)).sort();
	if (toAdd.length === 0) {
		console.log(
			chalk.green("✓ All suggested skills are already active. No changes."),
		);
		return;
	}

	console.log(
		chalk.bold(`Stack detected: ${result.technologies.length} technologies`),
	);
	for (const t of result.technologies) {
		console.log(
			`  ${chalk.green("✓")} ${t.name} ${chalk.dim(`[${t.source}]`)}`,
		);
	}
	console.log("");
	console.log(chalk.bold(`Skills to add (${toAdd.length}):`));
	for (const name of toAdd) {
		console.log(`  ${chalk.yellow("+")} ${chalk.cyan(name)}`);
	}
	console.log("");

	if (dryRun) {
		console.log(chalk.dim("--dry-run active: nothing written to disk."));
		return;
	}

	if (!autoYes) {
		if (!process.stdin.isTTY) {
			console.error(
				chalk.red(
					"Non-TTY: cannot get confirmation. Use --yes or run in a TTY.",
				),
			);
			process.exitCode = 1;
			return;
		}
		const ans = await promptChoice(`Activate ${toAdd.length} skills? [y/N] `);
		if (!/^(y|yes)$/i.test(ans)) {
			console.log(chalk.dim("Cancelled."));
			return;
		}
	}

	let added = 0;
	for (const name of toAdd) {
		try {
			const r = copySkill(vault, active, name);
			if (r.added) {
				console.log(`  ${chalk.green("+")} ${name}`);
				added++;
			}
		} catch (err) {
			console.error(chalk.red(`  ! ${name}: ${err.message}`));
		}
	}
	console.log("");
	console.log(
		`${chalk.green(added)} added, total active: ${activeSet.size + added}/${vaultList.length}`,
	);
}

function showHelp() {
	console.log(chalk.bold("Skills Management (Opt-in):"));
	console.log(
		"  badi skills                     Status table + interactive selection",
	);
	console.log("  badi skills available           List all skills in the vault");
	console.log("  badi skills list                List active skills");
	console.log("  badi skills add <name...>       Activate one or more skills");
	console.log("  badi skills remove <name...>    Remove an active skill");
	console.log("  badi skills clear               Reset all active skills");
	console.log("  badi skills reset               Same as clear");
	console.log("");
	console.log(chalk.bold("Stack-aware install (v1.24+):"));
	console.log(
		"  badi skills detect              Scan the project, list matching skills (read-only)",
	);
	console.log(
		"  badi skills auto-install        Detect + interactive confirmation + activate skills",
	);
	console.log(
		"    --yes / -y                    Activate matches without asking for confirmation",
	);
	console.log("    --dry-run                     Show only, don't touch disk");
	console.log("");
	console.log(chalk.bold("Auto-router (v1.20+):"));
	console.log(
		'  badi skills route "<prompt>"    Prompt → score matching skills',
	);
	console.log("  badi skills route < file.txt    Read prompt from stdin");
	console.log(
		"  badi skills auto on             Enable the UserPromptSubmit hook",
	);
	console.log("  badi skills auto off            Remove the hook");
	console.log("  badi skills auto status         Show hook status");
	console.log("");
	console.log(chalk.bold("Route command flags:"));
	console.log("    --top N                       Top N matches (default: 3)");
	console.log(
		"    --inject                      Write matches as SKILL.md body (for the hook)",
	);
	console.log(
		"    --json                        JSON output (matched/contextLength)",
	);
	console.log("");
	console.log(chalk.dim("Example:"));
	console.log(chalk.dim("  badi skills add seo marketing security"));
	console.log(chalk.dim('  badi skills route "write an Instagram post"'));
	console.log(chalk.dim('  badi skills route "expo eas build" --top 5'));
	console.log(chalk.dim('  echo "react bug" | badi skills route --inject'));
	console.log(
		chalk.dim("  badi skills auto on   # auto route before every prompt"),
	);
	console.log("");
	console.log(chalk.bold("Categories (v1.27):"));
	console.log(
		chalk.dim(
			"  25 general + 25 pentest-* + 12 expo-* = 62 categories (opt-in vault).",
		),
	);
	console.log(
		chalk.dim(
			"  pentest-*: advisory/defensive, authorized-engagement discipline.",
		),
	);
	console.log(
		chalk.dim(
			"  expo-*:    React Native + cross-platform mobile dev lifecycle.",
		),
	);
	console.log(
		chalk.dim("  To see a family: badi skills available | grep <prefix>"),
	);
}

export async function runSkills(args) {
	const target = process.cwd();
	const { vault, active } = paths(target);

	if (!existsSync(vault)) {
		console.error(chalk.red(`skills-vault not found: ${vault}`));
		console.log(
			chalk.dim("Run 'badi update' first to refresh the installation."),
		);
		process.exit(1);
	}

	ensureActiveDir(active);

	const sub = args[0];

	if (sub === "--help" || sub === "-h") {
		showHelp();
		return;
	}

	const vaultList = listSkillCategories(vault);
	const activeSet = new Set(listSkillCategories(active));

	switch (sub) {
		case undefined: {
			// Interactive mode (TTY) or table only (non-TTY)
			printStatusTable({ vaultList, activeSet });

			if (!process.stdin.isTTY) {
				console.log(chalk.dim("Interaction requires a TTY. Use a subcommand:"));
				console.log(
					chalk.dim("  badi skills add <name>   |   badi skills clear"),
				);
				return;
			}

			console.log(chalk.bold("Select skills to activate:"));
			console.log(
				chalk.dim(
					"  Number/range (1,3,5-7), 'all', 'none' (reset) or Enter = cancel",
				),
			);
			const ans = await promptChoice("> ");
			if (!ans) {
				console.log(chalk.dim("Cancelled, no changes."));
				return;
			}
			const { indices, action } = parseSelection(ans, vaultList.length);
			if (action === "cancel") {
				console.log(chalk.dim("Cancelled."));
				return;
			}

			// Set semantics: selected become active, unselected are removed
			const targetNames = new Set(indices.map((i) => vaultList[i]));
			let added = 0;
			let removed = 0;
			for (const name of vaultList) {
				const wantActive = targetNames.has(name);
				const isActive = activeSet.has(name);
				if (wantActive && !isActive) {
					copySkill(vault, active, name);
					added++;
				} else if (!wantActive && isActive) {
					removeSkill(active, name);
					removed++;
				}
			}
			console.log("");
			console.log(
				`${chalk.green(`+${added}`)} added  ${chalk.yellow(`-${removed}`)} removed  ${chalk.cyan(targetNames.size)} active`,
			);
			break;
		}

		case "available": {
			console.log(chalk.bold(`Vault (${vaultList.length} skills):`));
			for (const name of vaultList) {
				const desc = readSkillDescription(join(vault, name));
				const marker = activeSet.has(name)
					? chalk.green("[v]")
					: chalk.dim("[ ]");
				const head = desc ? desc.slice(0, 70) : "";
				console.log(
					`  ${marker} ${chalk.cyan(name.padEnd(20))} ${chalk.dim(head)}`,
				);
			}
			break;
		}

		case "list": {
			const activeList = [...activeSet].sort();
			console.log(chalk.bold(`Active skills (${activeList.length}):`));
			if (activeList.length === 0) {
				console.log(chalk.dim("  (none — select with 'badi skills')"));
				return;
			}
			for (const name of activeList) {
				console.log(`  ${chalk.green("v")} ${name}`);
			}
			break;
		}

		case "add": {
			const names = args.slice(1).filter(Boolean);
			if (names.length === 0) {
				console.error(chalk.red("Error: at least one skill name required."));
				console.log(chalk.dim("Example: badi skills add seo marketing"));
				process.exit(1);
			}
			let added = 0;
			let skipped = 0;
			for (const name of names) {
				if (!isSkillCategory(vault, name)) {
					console.error(chalk.red(`Not found in vault: ${name}`));
					console.log(chalk.dim("See the list with 'badi skills available'."));
					process.exit(1);
				}
				const r = copySkill(vault, active, name);
				if (r.added) {
					console.log(`  ${chalk.green("+")} ${name}`);
					added++;
				} else {
					console.log(
						`  ${chalk.dim("=")} ${name} ${chalk.dim("(already active)")}`,
					);
					skipped++;
				}
			}
			console.log("");
			console.log(
				`${chalk.green(added)} added, ${chalk.yellow(skipped)} skipped.`,
			);
			break;
		}

		case "remove":
		case "rm": {
			const names = args.slice(1).filter(Boolean);
			if (names.length === 0) {
				console.error(chalk.red("Error: at least one skill name required."));
				console.log(chalk.dim("Example: badi skills remove seo"));
				process.exit(1);
			}
			let removed = 0;
			let missing = 0;
			for (const name of names) {
				const r = removeSkill(active, name);
				if (r.removed) {
					console.log(`  ${chalk.yellow("-")} ${name}`);
					removed++;
				} else {
					console.log(
						`  ${chalk.dim("=")} ${name} ${chalk.dim("(already inactive)")}`,
					);
					missing++;
				}
			}
			console.log("");
			console.log(
				`${chalk.yellow(removed)} removed, ${chalk.dim(missing)} skipped.`,
			);
			break;
		}

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
				// Read stdin if no arg
				try {
					const { readFileSync: r } = await import("node:fs");
					prompt = r(0, "utf-8").trim();
				} catch {
					/* ignore */
				}
			}
			if (!prompt) {
				console.error(chalk.red("Error: prompt required (arg or stdin)."));
				console.log(
					chalk.dim('Example: badi skills route "write meta tags for SEO"'),
				);
				process.exit(1);
			}

			const index = buildSkillIndex(vault);
			const matched = routePrompt(prompt, index, { top: topN });

			if (inject) {
				const blob = buildContextInjection(matched, index);
				if (json) {
					console.log(
						JSON.stringify({ matched, contextLength: blob.length }, null, 2),
					);
				} else {
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
				console.log(
					chalk.dim(
						"(no matching skill — see the list with 'badi skills available')",
					),
				);
				return;
			}
			console.log(chalk.bold(`Matching skills (${matched.length}):`));
			for (const m of matched) {
				const trigText = m.matched.triggers.length
					? chalk.cyan(`triggers: ${m.matched.triggers.join(", ")}`)
					: "";
				const descText = m.matched.description.length
					? chalk.dim(`desc: ${m.matched.description.join(", ")}`)
					: "";
				console.log(
					`  ${chalk.bold(m.name.padEnd(20))} ${chalk.green(`score ${m.score}`.padEnd(10))} ${trigText} ${descText}`,
				);
			}
			break;
		}

		case "auto": {
			const onOff = args[1];
			const settingsPath = join(target, ".claude", "settings.json");
			let settings = {};
			if (existsSync(settingsPath)) {
				try {
					settings = JSON.parse(readFileSync(settingsPath, "utf-8"));
				} catch {
					console.error(chalk.red("settings.json invalid JSON"));
					process.exit(1);
				}
			}
			settings.hooks = settings.hooks || {};
			settings.hooks.UserPromptSubmit = settings.hooks.UserPromptSubmit || [];

			const HOOK_ENTRY = {
				matcher: "*",
				hooks: [
					{
						type: "command",
						command: "bash .claude/hooks/skill-router.sh",
					},
				],
			};

			const hasEntry = settings.hooks.UserPromptSubmit.some((entry) =>
				JSON.stringify(entry).includes("skill-router.sh"),
			);

			if (onOff === "on") {
				if (hasEntry) {
					console.log(chalk.dim("Auto-router already active."));
					return;
				}
				settings.hooks.UserPromptSubmit.push(HOOK_ENTRY);
				writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
				console.log(chalk.green("✓ Auto-router enabled"));
				console.log(
					chalk.dim(
						"The vault is scanned before every prompt, matching skills are injected into the context.",
					),
				);
				console.log(chalk.dim("To disable: badi skills auto off"));
			} else if (onOff === "off") {
				if (!hasEntry) {
					console.log(chalk.dim("Auto-router already disabled."));
					return;
				}
				settings.hooks.UserPromptSubmit =
					settings.hooks.UserPromptSubmit.filter(
						(entry) => !JSON.stringify(entry).includes("skill-router.sh"),
					);
				if (settings.hooks.UserPromptSubmit.length === 0) {
					delete settings.hooks.UserPromptSubmit;
				}
				writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
				console.log(chalk.yellow("✓ Auto-router disabled"));
			} else if (!onOff || onOff === "status") {
				console.log(
					chalk.bold(
						`Auto-router: ${hasEntry ? chalk.green("ACTIVE") : chalk.dim("disabled")}`,
					),
				);
				console.log(chalk.dim("To enable:   badi skills auto on"));
				console.log(chalk.dim("To disable:  badi skills auto off"));
			} else {
				console.error(chalk.red(`Unknown: ${onOff}. Use: on / off / status`));
				process.exit(1);
			}
			break;
		}

		case "detect": {
			const result = detectStack(target);
			printDetectResult(result, vaultList, activeSet);
			break;
		}

		case "auto-install": {
			const flags = args.slice(1);
			const autoYes = flags.includes("--yes") || flags.includes("-y");
			const dryRun = flags.includes("--dry-run");
			await runAutoInstall({
				target,
				vault,
				active,
				vaultList,
				activeSet,
				autoYes,
				dryRun,
			});
			break;
		}

		case "clear":
		case "reset": {
			const names = [...activeSet];
			if (names.length === 0) {
				console.log(chalk.dim("No active skills, nothing to reset."));
				return;
			}
			for (const name of names) removeSkill(active, name);
			console.log(`${chalk.yellow(names.length)} active skills reset.`);
			console.log(
				chalk.dim("To select again: 'badi skills' or 'badi skills add <name>'"),
			);
			break;
		}

		default:
			console.error(chalk.red(`Unknown subcommand: ${sub}`));
			showHelp();
			process.exit(1);
	}
}
