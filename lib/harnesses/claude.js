import {
	chmodSync,
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { PKG_ROOT } from "../cli.js";
import { copyRecursive, listDirs } from "../helpers.js";

const USER_CUSTOMIZABLE = [
	"memory.md",
	"knowledge-base.md",
	"knowledge-nominations.md",
	"workspace/",
	"plugins/",
	"logs/",
	"backups/",
	"agent-memory/",
	"skills/", // v1.17+ opt-in: user selection, preserved during update
];

function isUserFile(relativePath) {
	return USER_CUSTOMIZABLE.some(
		(p) => relativePath === p || relativePath.startsWith(p),
	);
}

/**
 * Find hook commands that reference `.claude/hooks/` with a relative path.
 *
 * Relative commands (`node .claude/hooks/X.mjs`) resolve against the launch
 * cwd, so launching Claude from a SUBDIRECTORY of a badi project breaks every
 * hook with MODULE_NOT_FOUND. Commands anchored to `$CLAUDE_PROJECT_DIR` (local
 * install) or `$CLAUDE_PLUGIN_ROOT` (plugin variant) resolve regardless of cwd.
 *
 * Pure + exported for testing.
 *
 * @param {object} settings  parsed settings.json
 * @returns {string[]}  the offending command strings (empty = all anchored)
 */
export function findRelativeHookCommands(settings) {
	const hookGroups = settings?.hooks;
	if (!hookGroups || typeof hookGroups !== "object") return [];
	const offenders = [];
	for (const entries of Object.values(hookGroups)) {
		if (!Array.isArray(entries)) continue;
		for (const entry of entries) {
			for (const h of entry?.hooks ?? []) {
				const cmd = h?.command;
				if (typeof cmd !== "string") continue;
				if (
					cmd.includes(".claude/hooks/") &&
					!cmd.includes("$CLAUDE_PROJECT_DIR") &&
					!cmd.includes("${CLAUDE_PROJECT_DIR") &&
					!cmd.includes("$CLAUDE_PLUGIN_ROOT") &&
					!cmd.includes("${CLAUDE_PLUGIN_ROOT")
				) {
					offenders.push(cmd);
				}
			}
		}
	}
	return offenders;
}

/**
 * Extract the hook script filenames wired in a settings.json (e.g.
 * "guard-bash.mjs"). Lets `doctor` derive which hooks to verify from the
 * actually-wired set instead of a hardcoded list that has to be hand-bumped
 * every time a hook is added or removed.
 *
 * Pure + exported for testing.
 *
 * @param {object} settings  parsed settings.json
 * @returns {string[]}  unique hook filenames referenced by hook commands
 */
export function hookFilesFromSettings(settings) {
	const hookGroups = settings?.hooks;
	if (!hookGroups || typeof hookGroups !== "object") return [];
	const files = new Set();
	for (const entries of Object.values(hookGroups)) {
		if (!Array.isArray(entries)) continue;
		for (const entry of entries) {
			for (const h of entry?.hooks ?? []) {
				if (typeof h?.command !== "string") continue;
				const m = h.command.match(/\.claude\/hooks\/([\w.-]+\.mjs)/);
				if (m) files.add(m[1]);
			}
		}
	}
	return [...files];
}

// Seed files are written from clean English templates (lib/seed/) on a fresh
// install, NOT copied from the package's .claude/ (which holds badi's own
// development memory). They are never overwritten once they exist — the
// user's working data is preserved across updates.
const SEED_FILES = [
	"memory.md",
	"knowledge-base.md",
	"knowledge-nominations.md",
	"workspace/TaskBoard.md",
];

function isSeedFile(relativePath) {
	return SEED_FILES.includes(relativePath);
}

function seedUserFiles(destClaude, dryRun) {
	const seedDir = resolve(PKG_ROOT, "lib", "seed");
	let seeded = 0;
	for (const rel of SEED_FILES) {
		const dest = join(destClaude, rel);
		if (existsSync(dest)) continue; // preserve user data, never overwrite
		const srcSeed = join(seedDir, rel);
		if (!existsSync(srcSeed)) continue;
		if (!dryRun) {
			mkdirSync(join(dest, ".."), { recursive: true });
			cpSync(srcSeed, dest);
		}
		seeded++;
	}
	return seeded;
}

function chmodHooks(destClaude) {
	const hooksDir = join(destClaude, "hooks");
	if (!existsSync(hooksDir)) return;
	// chmod is a no-op on Windows; .mjs files are invoked via node so they
	// need no executable bit. .sh kept for backwards-compat with old installs.
	for (const f of readdirSync(hooksDir)) {
		if (f.endsWith(".sh") || f.endsWith(".mjs")) {
			try {
				chmodSync(join(hooksDir, f), 0o755);
			} catch {
				/* Windows: no-op */
			}
		}
	}
}

function installClaudeMd(target, force, dryRun, result) {
	const srcClaudeMd = resolve(PKG_ROOT, "CLAUDE.md");
	const destClaudeMd = join(target, "CLAUDE.md");
	if (!existsSync(srcClaudeMd)) return;
	const missing = !existsSync(destClaudeMd);
	if (missing || force) {
		if (!dryRun) cpSync(srcClaudeMd, destClaudeMd);
		result.copied++;
		result.files.push({
			path: "CLAUDE.md",
			status: missing ? "added" : "overwritten",
		});
	} else {
		result.skipped++;
	}
}

export default {
	id: "claude",
	name: "Claude Code",
	supports: {
		rules: true,
		commands: true,
		mcp: true,
		subagents: true,
		hooks: true,
		skills: true,
	},

	detect(target) {
		return existsSync(join(target, ".claude"));
	},

	install({ target, src, force = false, dryRun = false }) {
		const destClaude = join(target, ".claude");
		if (!dryRun && !existsSync(destClaude)) {
			mkdirSync(destClaude, { recursive: true });
		}
		const result = copyRecursive(src, destClaude, {
			force,
			dryRun,
			exclude: isSeedFile,
		});
		result.copied += seedUserFiles(destClaude, dryRun);
		result.files = [];
		installClaudeMd(target, force, dryRun, result);
		if (!dryRun) chmodHooks(destClaude);
		result.skippedComponents = [];
		return result;
	},

	update({ target, src, force = false, dryRun = false }) {
		const destClaude = join(target, ".claude");
		const result = copyRecursive(src, destClaude, {
			dryRun,
			updateMode: !force,
			force,
			userCustomizable: isUserFile,
			exclude: isSeedFile,
		});
		result.copied += seedUserFiles(destClaude, dryRun);
		result.files = [];
		installClaudeMd(target, force, dryRun, result);
		if (!dryRun) chmodHooks(destClaude);
		result.skippedComponents = [];
		return result;
	},

	doctor({ target }) {
		const claudeDir = join(target, ".claude");
		const checks = [];
		let pass = 0;
		let warn = 0;
		let fail = 0;

		const run = (label, fn) => {
			try {
				const r = fn();
				const status = r === true ? "pass" : r === "warn" ? "warn" : "fail";
				checks.push({ label, status });
				if (status === "pass") pass++;
				else if (status === "warn") warn++;
				else fail++;
			} catch (e) {
				checks.push({ label: `${label} (${e.message})`, status: "fail" });
				fail++;
			}
		};

		run(".claude/ directory exists", () => existsSync(claudeDir));
		run("settings.json is valid JSON", () => {
			const p = join(claudeDir, "settings.json");
			if (!existsSync(p)) return false;
			JSON.parse(readFileSync(p, "utf-8"));
			return true;
		});
		run("hook commands are project-root anchored", () => {
			// Relative `node .claude/hooks/X.mjs` commands resolve against the
			// launch cwd, not the project root — so launching Claude from a
			// SUBDIRECTORY of a badi project makes every hook MODULE_NOT_FOUND.
			// Anchor with $CLAUDE_PROJECT_DIR (or $CLAUDE_PLUGIN_ROOT for the
			// plugin variant) so they resolve regardless of cwd.
			const p = join(claudeDir, "settings.json");
			if (!existsSync(p)) return "warn";
			let settings;
			try {
				settings = JSON.parse(readFileSync(p, "utf-8"));
			} catch {
				return "warn"; // invalid-JSON already failed above
			}
			const stale = findRelativeHookCommands(settings);
			return stale.length === 0 ? true : "warn";
		});

		// Expected hooks are DERIVED from the wired settings.json (so adding or
		// removing a hook there no longer requires hand-editing a list here — the
		// 52->53 hand-bump pain), plus skill-router.mjs which ships but is only
		// wired on demand by `badi skills auto on`. Falls back to a known set if
		// settings.json is missing/invalid so doctor still checks something.
		let hooks;
		try {
			const sp = join(claudeDir, "settings.json");
			const wired = existsSync(sp)
				? hookFilesFromSettings(JSON.parse(readFileSync(sp, "utf-8")))
				: [];
			hooks = [...new Set([...wired, "skill-router.mjs"])].sort();
		} catch {
			hooks = ["skill-router.mjs"]; // invalid-JSON already failed above
		}
		for (const h of hooks) {
			run(`Hook: ${h}`, () => {
				const p = join(claudeDir, "hooks", h);
				return existsSync(p);
			});
		}

		const agents = [
			"archaeologist",
			"auditor",
			"coach",
			"debt-collector",
			"error-whisperer",
			"onboarding-sherpa",
			"pr-ghostwriter",
			"rubber-duck",
			"unsticker",
			"yak-shave-detector",
			"security-scanner",
			"performance-profiler",
			"test-strategist",
			"api-designer",
			"migration-pilot",
			"code-generator",
			"refactoring-advisor",
			"architecture-advisor",
			"content-creator",
			"visual-director",
			"project-architect",
			"tasarim-kurator",
			"product-strategist",
			"engineering-manager",
			"release-manager",
			"qa-lead",
			"ads-strategist",
			"market-researcher",
			"seo-strategist",
			"data-analyst",
		];
		for (const a of agents) {
			run(`Agent: ${a}.md`, () => {
				const p = join(claudeDir, "agents", `${a}.md`);
				if (!existsSync(p)) return false;
				const content = readFileSync(p, "utf-8");
				if (!content.startsWith("---")) return "warn";
				return true;
			});
		}

		run("memory.md size limit (<=100 lines)", () => {
			const p = join(claudeDir, "memory.md");
			if (!existsSync(p)) return "warn";
			return readFileSync(p, "utf-8").split("\n").length <= 100 ? true : "warn";
		});
		run("knowledge-base.md size limit (<=200 lines)", () => {
			const p = join(claudeDir, "knowledge-base.md");
			if (!existsSync(p)) return "warn";
			return readFileSync(p, "utf-8").split("\n").length <= 200 ? true : "warn";
		});
		run("CLAUDE.md exists", () => existsSync(join(target, "CLAUDE.md")));
		run("command-index.md exists", () =>
			existsSync(join(claudeDir, "command-index.md")),
		);
		run("Skill vault exists", () => {
			// v1.17+ opt-in: the vault holds all skills; the user picks the active directory
			const vault = join(claudeDir, "skills-vault");
			if (!existsSync(vault)) return false;
			return listDirs(vault).length >= 16 ? true : "warn";
		});
		run("Active skill directory structure", () => {
			// v1.17+ opt-in: 0 active is normal (the user selects via 'badi skills add')
			const skillsDir = join(claudeDir, "skills");
			return existsSync(skillsDir) ? true : "warn";
		});

		return { pass, warn, fail, checks };
	},
};
