import { cpSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { PKG_ROOT } from "../cli.js";
import { buildSingleFileHarness } from "./_single-file.js";

// Gemini CLI adapter — GEMINI.md + optional .gemini/settings.json (MCP).
// Merges CLAUDE.md + memory + knowledge-base into a single file.
//
// Adapter logic was extracted to the lib/harnesses/_single-file.js factory
// (v1.30 review C1 fix). Writing the MCP settings.json was customized via
// extraWriter because gemini, unlike the other single-file harnesses,
// supports MCP configuration.

function writeGeminiSettings({ target, force, dryRun, result }) {
	const srcMcp = resolve(PKG_ROOT, ".mcp.json");
	if (!existsSync(srcMcp)) return;
	const dest = join(target, ".gemini", "settings.json");
	const existed = existsSync(dest);
	if (existed && !force) {
		result.skipped++;
		return;
	}
	if (!dryRun) {
		mkdirSync(join(dest, ".."), { recursive: true });
		cpSync(srcMcp, dest);
	}
	result.copied++;
	if (!existed) result.created++;
}

export default buildSingleFileHarness({
	id: "gemini",
	name: "Gemini CLI",
	filename: "GEMINI.md",
	supports: {
		rules: true,
		commands: false,
		mcp: true,
		subagents: false,
		hooks: false,
		skills: false,
	},
	skippedReasons: {
		hooks: "Gemini CLI has no hooks",
		skills: "Gemini CLI has no skills",
		subagents: "Gemini CLI has no subagents",
		commands:
			"Gemini CLI has no slash commands (routed to embedding in GEMINI.md)",
	},
	ensureDir: (target) => join(target, ".gemini"),
	extraWriter: writeGeminiSettings,
	doctorChecks: [
		{
			label: ".gemini/settings.json",
			fn: (target) => {
				const p = join(target, ".gemini", "settings.json");
				if (!existsSync(p)) return "warn";
				JSON.parse(readFileSync(p, "utf-8"));
				return true;
			},
		},
	],
});
