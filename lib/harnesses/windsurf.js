import { buildSingleFileHarness } from "./_single-file.js";

// Windsurf adapter — `.windsurfrules` single file. CLAUDE.md + memory +
// merges the knowledge-base. Adapter logic was extracted to lib/harnesses/_single-file.js
// factory (v1.30 review C1 fix).

export default buildSingleFileHarness({
	id: "windsurf",
	name: "Windsurf",
	filename: ".windsurfrules",
	supports: {
		rules: true,
		commands: false,
		mcp: false,
		subagents: false,
		hooks: false,
		skills: false,
	},
	skippedReasons: {
		hooks: "Windsurf has no hook equivalent",
		skills: "Windsurf has no skill equivalent",
		subagents: "Windsurf has no subagents",
		commands:
			"Windsurf has no slash commands (inline guidance sent to .windsurfrules)",
	},
});
