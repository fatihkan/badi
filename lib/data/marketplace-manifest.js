// Marketplace manifest generator — `.claude-plugin/{plugin,marketplace}.json`
// dosyalarini package.json + .claude/ dizini icerikleri ustunden uretir.
//
// Bu fonksiyon `badi release sync-manifest` ile cagrilir; ayrica
// `badi release check` ic icin "manifest stale mi" kontrolu kullanir.
//
// Tasarim:
//   - Pure: I/O yapmaz, sadece input (paths + package.json) alir, JSON doner.
//   - Stabil hash: agent listesi alfabetik sirali; manifest icerigi
//     sirayla aynidir, gereksiz git diff'i olmaz.

import {
	existsSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";

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
 * Hook sayisi (`.mjs`); `_` ile baslayanlar (util) sayilmaz.
 */
export function countHooks(claudeDir) {
	const dir = join(claudeDir, "hooks");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir).filter(
		(f) => f.endsWith(".mjs") && !f.startsWith("_"),
	).length;
}

/**
 * Komut sayisi (`.claude/commands/*.md`).
 */
export function countCommands(claudeDir) {
	const dir = join(claudeDir, "commands");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir).filter((f) => f.endsWith(".md")).length;
}

/**
 * Skill kategori sayisi (.claude/skills-vault/<cat>/).
 */
export function countSkillCategories(claudeDir) {
	const dir = join(claudeDir, "skills-vault");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir, { withFileTypes: true }).filter((d) =>
		d.isDirectory(),
	).length;
}

/**
 * v1.30+ standart hook block — settings.json ile yapisi paralel.
 * `${CLAUDE_PLUGIN_ROOT}` Claude Code marketplace runtime variable.
 */
function defaultHooksBlock() {
	return {
		PreToolUse: [
			{
				matcher: "Bash",
				hooks: [
					{
						type: "command",
						command:
							"node ${CLAUDE_PLUGIN_ROOT}/.claude/hooks/guard-bash.mjs",
						timeout: 5000,
					},
					{
						type: "command",
						command:
							"node ${CLAUDE_PLUGIN_ROOT}/.claude/hooks/branch-guard.mjs",
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
						command:
							"node ${CLAUDE_PLUGIN_ROOT}/.claude/hooks/inject-active-plan.mjs",
						timeout: 2000,
					},
				],
			},
		],
	};
}

/**
 * plugin.json icerigini generate eder. version + ozet bilgileri package.json'dan,
 * agent listesi + sayilar dosya sisteminden.
 */
export function buildPluginManifest({ pkg, claudeDir }) {
	const agentCount = collectAgents(claudeDir).length;
	const commandCount = countCommands(claudeDir);
	const hookCount = countHooks(claudeDir);
	const skillCount = countSkillCategories(claudeDir);

	const description =
		`Workflow management for Claude Code, Cursor, Gemini, Windsurf, AGENTS.md ` +
		`— ${agentCount} AI agents, ${commandCount} commands, ${hookCount} hooks, ${skillCount} opt-in skill categories. ` +
		`Built for Anthropic Claude Opus 4.7 and Sonnet 4.6.`;

	return {
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
}

/**
 * marketplace.json icerigini generate eder.
 */
export function buildMarketplaceManifest({ pkg, claudeDir }) {
	const agentCount = collectAgents(claudeDir).length;
	const commandCount = countCommands(claudeDir);
	const skillCount = countSkillCategories(claudeDir);

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
		plugins: [
			{
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
			},
		],
	};
}

/**
 * Iki JSON-saf objeyi sirali kiyaslar (key-order'a duyarsiz, recursive).
 * v1.30.1 review O3 fix: stale-check eskiden JSON.stringify ile karsilastiriyordu;
 * kullanici editor JSON formatlamasi key sirasini bozdugunda yanlis "stale"
 * raporluyordu. Bu deep-equal calistirmasi icerigi semantically kiyaslar.
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
 * Stale check — disk'teki manifest, generator ciktisi ile esit mi?
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
	// O3 fix: deep-equal (key-order bagimsiz) JSON.stringify yerine.
	const equal = deepEqualJson(current, generated);
	return {
		stale: !equal,
		missing: false,
		reason: equal ? null : "icerik farkli",
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
