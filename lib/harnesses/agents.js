import { buildSingleFileHarness } from "./_single-file.js";

// Generic AGENTS.md adapter — OpenAI Codex CLI, Aider ve diger araclar icin
// notr fallback. CLAUDE.md + memory + knowledge-base'i merge eder. Adapter
// mantigi lib/harnesses/_single-file.js factory'sine cikarildi (v1.30 review
// C1 fix).

export default buildSingleFileHarness({
	id: "agents",
	name: "AGENTS.md (Generic)",
	filename: "AGENTS.md",
	supports: {
		rules: true,
		commands: false,
		mcp: false,
		subagents: false,
		hooks: false,
		skills: false,
	},
	skippedReasons: {
		hooks: "Generic AGENTS.md sadece prompt context, runtime yok",
		skills: "AGENTS.md tek dosya, skill sistemi disinda",
		subagents: "AGENTS.md tek dosya, subagent yok",
		commands: "AGENTS.md sadece prompt context, slash komut yok",
	},
});
