import { buildSingleFileHarness } from "./_single-file.js";

// Generic AGENTS.md adapter — neutral fallback for OpenAI Codex CLI, Aider,
// and other tools. Merges CLAUDE.md + memory + knowledge-base. The adapter
// logic was extracted into the lib/harnesses/_single-file.js factory (v1.30
// review C1 fix).

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
		hooks: "Generic AGENTS.md is prompt context only, no runtime",
		skills: "AGENTS.md is a single file, outside the skill system",
		subagents: "AGENTS.md is a single file, no subagents",
		commands: "AGENTS.md is prompt context only, no slash commands",
	},
});
