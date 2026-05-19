import { cpSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { PKG_ROOT } from "../cli.js";
import { buildSingleFileHarness } from "./_single-file.js";

// Gemini CLI adapter — GEMINI.md + opsiyonel .gemini/settings.json (MCP).
// CLAUDE.md + memory + knowledge-base'i tek dosyaya merge eder.
//
// Adapter mantigi lib/harnesses/_single-file.js factory'sine cikarildi
// (v1.30 review C1 fix). MCP settings.json yazimi extraWriter olarak
// ozellestirildi cunku gemini, diger tek-dosya harness'lerden farkli
// olarak MCP yapilandirmasini destekler.

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
		hooks: "Gemini CLI'de hook yok",
		skills: "Gemini CLI'de skill yok",
		subagents: "Gemini CLI'de subagent yok",
		commands:
			"Gemini CLI'de slash komut yok (GEMINI.md'ye gommeye yonlendirildi)",
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
