// Marketplace manifest generator — produces `.claude-plugin/{plugin,marketplace}.json`
// from package.json + the contents of the .claude/ directory.
//
// This function is called by `badi release sync-manifest`; it is also used
// internally by `badi release check` for the "is the manifest stale" check.
//
// Design:
//   - Pure: no I/O, takes only input (paths + package.json), returns JSON.
//   - Stable hash: the agent list is alphabetically sorted; manifest content
//     is the same each time, avoiding unnecessary git diffs.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Last git commit date of package.json (ISO 8601).
 * v1.31.0+ — shown in the Claude Code 2.1.144+ marketplace Browse pane.
 *
 * Source: `git log -1 --format=%cI -- package.json`. This corresponds to the
 * date of the version-bump commit (in sync with the release).
 *
 * Fallback: empty string (behaves like null for the manifest stale-check).
 * Silent skip if git is unavailable or we are outside the repo.
 */
export function lastPackageJsonCommitDate(cwd = process.cwd()) {
	try {
		const out = execFileSync(
			"git",
			["log", "-1", "--format=%cI", "--", "package.json"],
			{
				encoding: "utf-8",
				cwd,
				stdio: ["ignore", "pipe", "ignore"],
				timeout: 5000,
			},
		).trim();
		return out || "";
	} catch {
		return "";
	}
}

/**
 * .claude/agents/*.md dosyalarini topla (alfabetik).
 */
export function collectAgents(claudeDir) {
	const dir = join(claudeDir, "agents");
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((f) => f.endsWith(".md"))
		.sort()
		.map((f) => `./.claude/agents/${f}`);
}

/**
 * Hook count (`.mjs`); files starting with `_` (util) are not counted.
 */
export function countHooks(claudeDir) {
	const dir = join(claudeDir, "hooks");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir).filter(
		(f) => f.endsWith(".mjs") && !f.startsWith("_"),
	).length;
}

/**
 * Command count (`.claude/commands/*.md`).
 */
export function countCommands(claudeDir) {
	const dir = join(claudeDir, "commands");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir).filter((f) => f.endsWith(".md")).length;
}

/**
 * Skill category count (.claude/skills-vault/<cat>/).
 */
export function countSkillCategories(claudeDir) {
	const dir = join(claudeDir, "skills-vault");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir, { withFileTypes: true }).filter((d) =>
		d.isDirectory(),
	).length;
}

/**
 * v1.30+ standard hook block — structure parallel to settings.json.
 * `${CLAUDE_PLUGIN_ROOT}` is a Claude Code marketplace runtime variable; it
 * must stay literal. In the template literal it is escaped with `\${` (not
 * interpolation); only `${file}` is real interpolation. This keeps
 * noTemplateCurlyInString from firing (not a regular string) and needs no
 * file-wide override.
 */
function defaultHooksBlock() {
	const hookCmd = (file) => `node \${CLAUDE_PLUGIN_ROOT}/.claude/hooks/${file}`;
	return {
		PreToolUse: [
			{
				matcher: "Bash",
				hooks: [
					{
						type: "command",
						command: hookCmd("guard-bash.mjs"),
						timeout: 5000,
					},
					{
						type: "command",
						command: hookCmd("branch-guard.mjs"),
						timeout: 3000,
					},
				],
			},
		],
		UserPromptSubmit: [
			{
				matcher: "",
				hooks: [
					{
						type: "command",
						command: hookCmd("inject-active-plan.mjs"),
						timeout: 2000,
					},
				],
			},
		],
	};
}

/**
 * Generates the plugin.json content. version + summary info from package.json,
 * agent list + counts from the file system.
 */
export function buildPluginManifest({ pkg, claudeDir, lastUpdated }) {
	const agentCount = collectAgents(claudeDir).length;
	const commandCount = countCommands(claudeDir);
	const hookCount = countHooks(claudeDir);
	const skillCount = countSkillCategories(claudeDir);

	const description =
		`Workflow management for Claude Code, Cursor, Gemini, Windsurf, AGENTS.md ` +
		`— ${agentCount} AI agents, ${commandCount} commands, ${hookCount} hooks, ${skillCount} opt-in skill categories. ` +
		`Built for Anthropic Claude Opus 4.7 and Sonnet 4.6.`;

	const manifest = {
		$schema: "https://json.schemastore.org/claude-code-plugin-manifest.json",
		name: pkg.name?.replace(/^@.*\//, "") || "badi",
		version: pkg.version || "0.0.0",
		description,
		author: {
			name: "Fatih Kan",
			url: "https://github.com/fatihkan",
		},
		homepage: "https://github.com/fatihkan/badi",
		repository: "https://github.com/fatihkan/badi",
		license: pkg.license || "MIT",
		keywords: [
			"claude",
			"claude-code",
			"claude-opus",
			"claude-sonnet",
			"anthropic",
			"ai-agents",
			"subagents",
			"workflow",
			"agents",
			"skills",
			"observability",
			"owasp",
			"code-review",
			"cursor",
			"gemini-cli",
			"windsurf",
		],
		agents: collectAgents(claudeDir),
		commands: "./.claude/commands",
		skills: "./.claude/skills-vault",
		hooks: defaultHooksBlock(),
	};
	// v1.31.0+ Claude Code 2.1.144 marketplace Browse pane compatibility.
	// If lastUpdated is an empty string the field is omitted (to stay
	// consistent with the stale-check when git is absent in CI clones).
	const lu = lastUpdated ?? lastPackageJsonCommitDate();
	if (lu) manifest.lastUpdated = lu;
	return manifest;
}

/**
 * marketplace.json icerigini generate eder.
 */
export function buildMarketplaceManifest({ pkg, claudeDir, lastUpdated }) {
	const agentCount = collectAgents(claudeDir).length;
	const commandCount = countCommands(claudeDir);
	const skillCount = countSkillCategories(claudeDir);
	const lu = lastUpdated ?? lastPackageJsonCommitDate();

	const plugin = {
		name: pkg.name?.replace(/^@.*\//, "") || "badi",
		source: "./",
		description:
			`Workflow management for Claude Code — ${agentCount} AI agents, ${commandCount} commands, ${skillCount} skill categories. ` +
			`Built for Anthropic Claude Opus 4.7 and Sonnet 4.6.`,
		author: {
			name: "Fatih Kan",
			url: "https://github.com/fatihkan",
		},
		homepage: "https://github.com/fatihkan/badi",
		repository: "https://github.com/fatihkan/badi",
		license: pkg.license || "MIT",
		keywords: [
			"claude",
			"claude-code",
			"claude-opus",
			"claude-sonnet",
			"anthropic",
			"ai-agents",
			"subagents",
			"workflow",
			"observability",
			"owasp",
			"code-review",
		],
		category: "productivity",
		strict: true,
	};
	if (lu) plugin.lastUpdated = lu;

	return {
		$schema: "https://json.schemastore.org/claude-code-marketplace.json",
		name: "badi-marketplace",
		metadata: {
			description:
				"Marketplace entry for Badi — workflow management plugin for Claude Code (also exports to Cursor, Gemini, Windsurf, AGENTS.md).",
		},
		owner: {
			name: "Fatih Kan",
			url: "https://github.com/fatihkan",
		},
		plugins: [plugin],
	};
}

/**
 * Compares two JSON-safe objects in order (key-order insensitive, recursive).
 * v1.30.1 review O3 fix: the stale-check used to compare with JSON.stringify;
 * it reported a false "stale" when editor JSON formatting changed key order.
 * This deep-equal run compares the content semantically.
 */
export function deepEqualJson(a, b) {
	if (a === b) return true;
	if (a === null || b === null) return a === b;
	if (typeof a !== "object" || typeof b !== "object") return false;
	if (Array.isArray(a) !== Array.isArray(b)) return false;
	if (Array.isArray(a)) {
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) {
			if (!deepEqualJson(a[i], b[i])) return false;
		}
		return true;
	}
	const ka = Object.keys(a).sort();
	const kb = Object.keys(b).sort();
	if (ka.length !== kb.length) return false;
	for (let i = 0; i < ka.length; i++) {
		if (ka[i] !== kb[i]) return false;
		if (!deepEqualJson(a[ka[i]], b[ka[i]])) return false;
	}
	return true;
}

/**
 * Stale check — is the on-disk manifest equal to the generator output?
 * Returns { stale: bool, missing: bool, reason?: string }
 */
export function isManifestStale({ pluginDir, generated }) {
	const path = join(pluginDir, "plugin.json");
	if (!existsSync(path)) return { stale: true, missing: true };
	let current;
	try {
		current = JSON.parse(readFileSync(path, "utf-8"));
	} catch (e) {
		return { stale: true, missing: false, reason: `parse: ${e.message}` };
	}
	// O3 fix: deep-equal (key-order independent) instead of JSON.stringify.
	// lastUpdated is informational only (the marketplace Browse "last updated"
	// display). Being a timestamp, it does NOT take part in the staleness
	// comparison: otherwise every regen/publish would look "stale" on its own
	// (toISOString vs git %cI format difference + publish-time != commit-time —
	// PR #197 K1; also the package.json commit changed lastUpdated and produced
	// false staleness — #200). Only structural content (agent/command/hook/
	// description/keywords) is compared.
	const structural = (m) => {
		const c = { ...m };
		delete c.lastUpdated;
		return c;
	};
	const equal = deepEqualJson(structural(current), structural(generated));
	return {
		stale: !equal,
		missing: false,
		reason: equal ? null : "content differs",
	};
}

/**
 * Tum manifest dosyalarini disk'e yaz. {synced: [paths], skipped: [paths]}
 */
export function writeManifests({ pluginDir, plugin, marketplace, dryRun }) {
	const synced = [];
	const skipped = [];
	const pluginPath = join(pluginDir, "plugin.json");
	const marketPath = join(pluginDir, "marketplace.json");
	const pluginJSON = `${JSON.stringify(plugin, null, "\t")}\n`;
	const marketJSON = `${JSON.stringify(marketplace, null, "\t")}\n`;

	if (!dryRun) {
		writeFileSync(pluginPath, pluginJSON, "utf-8");
		writeFileSync(marketPath, marketJSON, "utf-8");
	}
	synced.push(relative(process.cwd(), pluginPath));
	synced.push(relative(process.cwd(), marketPath));
	return { synced, skipped };
}

export { collectAgents as listAgents };
