import { buildSingleFileHarness } from "./_single-file.js";

// Windsurf adapter — `.windsurfrules` tek dosya. CLAUDE.md + memory +
// knowledge-base'i merge eder. Adapter mantigi lib/harnesses/_single-file.js
// factory'sine cikarildi (v1.30 review C1 fix).

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
		hooks: "Windsurf'ta hook esdegeri yok",
		skills: "Windsurf'ta skill esdegeri yok",
		subagents: "Windsurf'ta subagent yok",
		commands:
			"Windsurf'ta slash komut yok (.windsurfrules'a inline rehber gonderildi)",
	},
});
