import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { PKG_ROOT } from "../cli.js";

/**
 * Gemini CLI adapter — compiles Badi's Claude-centric source into a single
 * GEMINI.md memory file plus an optional .gemini/settings.json mcp config.
 *
 * Target layout:
 *   GEMINI.md                   # merged: CLAUDE.md + memory.md + knowledge-base.md
 *   .gemini/
 *     settings.json             # { mcpServers: { ... } } from .mcp.json
 *
 * Not supported (reported as skippedComponents):
 *   hooks, skills, subagents, slash commands (Gemini CLI has none of these
 *   as first-class constructs — fell back to inlining guidance into GEMINI.md).
 */

function countSourceCommands(src) {
	const dir = join(src, "commands");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir).filter((f) => f.endsWith(".md")).length;
}

function countSourceHooks(src) {
	const dir = join(src, "hooks");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir).filter((f) => f.endsWith(".sh")).length;
}

function countSourceSkills(src) {
	const dir = join(src, "skills");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir, { withFileTypes: true }).filter((d) =>
		d.isDirectory(),
	).length;
}

function countSourceAgents(src) {
	const dir = join(src, "agents");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir).filter((f) => f.endsWith(".md")).length;
}

function buildGeminiMd(src) {
	const sections = [];
	const claudeMd = resolve(PKG_ROOT, "CLAUDE.md");
	if (existsSync(claudeMd)) {
		sections.push(readFileSync(claudeMd, "utf-8").trim());
	}
	const memoryMd = join(src, "memory.md");
	if (existsSync(memoryMd)) {
		sections.push(
			`\n---\n\n# Proje Bellegi (memory.md)\n\n${readFileSync(memoryMd, "utf-8").trim()}`,
		);
	}
	const kbMd = join(src, "knowledge-base.md");
	if (existsSync(kbMd)) {
		sections.push(
			`\n---\n\n# Bilgi Tabani (knowledge-base.md)\n\n${readFileSync(kbMd, "utf-8").trim()}`,
		);
	}
	return sections.length ? `${sections.join("\n\n")}\n` : null;
}

function compileGeminiMd(src, target, force, dryRun, result) {
	const content = buildGeminiMd(src);
	if (!content) return;
	const dest = join(target, "GEMINI.md");
	const existed = existsSync(dest);
	if (existed && !force) {
		result.skipped++;
		return;
	}
	if (!dryRun) writeFileSync(dest, content);
	result.copied++;
	if (!existed) result.created++;
}

function compileSettings(target, force, dryRun, result) {
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

function buildSkippedReport(src) {
	const hooks = countSourceHooks(src);
	const skills = countSourceSkills(src);
	const agents = countSourceAgents(src);
	const commands = countSourceCommands(src);
	const skipped = [];
	if (hooks > 0)
		skipped.push({
			component: "hooks",
			count: hooks,
			reason: "Gemini CLI'de hook yok",
		});
	if (skills > 0)
		skipped.push({
			component: "skills",
			count: skills,
			reason: "Gemini CLI'de skill yok",
		});
	if (agents > 0)
		skipped.push({
			component: "subagents",
			count: agents,
			reason: "Gemini CLI'de subagent yok",
		});
	if (commands > 0)
		skipped.push({
			component: "commands",
			count: commands,
			reason:
				"Gemini CLI'de slash komut yok (GEMINI.md'ye gommeye yonlendirildi)",
		});
	return skipped;
}

function runInstall({ target, src, force = false, dryRun = false }) {
	const result = { copied: 0, skipped: 0, created: 0 };
	const geminiDir = join(target, ".gemini");
	if (!dryRun && !existsSync(geminiDir)) {
		mkdirSync(geminiDir, { recursive: true });
		result.created++;
	}
	compileGeminiMd(src, target, force, dryRun, result);
	compileSettings(target, force, dryRun, result);
	result.skippedComponents = buildSkippedReport(src);
	return result;
}

export default {
	id: "gemini",
	name: "Gemini CLI",
	supports: {
		rules: true,
		commands: false,
		mcp: true,
		subagents: false,
		hooks: false,
		skills: false,
	},

	detect(target) {
		return (
			existsSync(join(target, "GEMINI.md")) ||
			existsSync(join(target, ".gemini"))
		);
	},

	install(opts) {
		return runInstall(opts);
	},

	update(opts) {
		return runInstall({ ...opts, force: !!opts.force });
	},

	doctor({ target }) {
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

		run("GEMINI.md mevcut", () => existsSync(join(target, "GEMINI.md")));
		run(".gemini/settings.json", () => {
			const p = join(target, ".gemini", "settings.json");
			if (!existsSync(p)) return "warn";
			JSON.parse(readFileSync(p, "utf-8"));
			return true;
		});

		return { pass, warn, fail, checks };
	},
};
