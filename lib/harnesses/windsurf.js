import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { PKG_ROOT } from "../cli.js";

/**
 * Windsurf adapter — compiles Badi's Claude-centric source into a single
 * .windsurfrules file (Windsurf IDE's per-project rules format).
 *
 * Target layout:
 *   .windsurfrules              # merged: CLAUDE.md + memory.md + knowledge-base.md
 *
 * Not supported (reported as skippedComponents):
 *   hooks, skills, subagents, slash commands, mcp — Windsurf's rule system is
 *   prompt-only. We fall back to inlining guidance into .windsurfrules.
 */

function countSourceCommands(src) {
	const dir = join(src, "commands");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir).filter((f) => f.endsWith(".md")).length;
}

function countSourceHooks(src) {
	const dir = join(src, "hooks");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir).filter((f) => f.endsWith(".mjs") || f.endsWith(".sh"))
		.length;
}

function countSourceSkills(src) {
	const vault = join(src, "skills-vault");
	const dir = existsSync(vault) ? vault : join(src, "skills");
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

function buildWindsurfRules(src) {
	const sections = [];
	const claudeMd = resolve(PKG_ROOT, "CLAUDE.md");
	if (existsSync(claudeMd)) {
		sections.push(readFileSync(claudeMd, "utf-8").trim());
	}
	const memoryMd = join(src, "memory.md");
	if (existsSync(memoryMd)) {
		sections.push(
			`\n---\n\n# Proje Bellegi\n\n${readFileSync(memoryMd, "utf-8").trim()}`,
		);
	}
	const kbMd = join(src, "knowledge-base.md");
	if (existsSync(kbMd)) {
		sections.push(
			`\n---\n\n# Bilgi Tabani\n\n${readFileSync(kbMd, "utf-8").trim()}`,
		);
	}
	return sections.length ? `${sections.join("\n\n")}\n` : null;
}

function compileWindsurfRules(src, target, force, dryRun, result) {
	const content = buildWindsurfRules(src);
	if (!content) return;
	const dest = join(target, ".windsurfrules");
	const existed = existsSync(dest);
	if (existed && !force) {
		result.skipped++;
		return;
	}
	if (!dryRun) writeFileSync(dest, content);
	result.copied++;
	if (!existed) result.created++;
}

function buildSkippedReport(src) {
	const skipped = [];
	const hooks = countSourceHooks(src);
	const skills = countSourceSkills(src);
	const agents = countSourceAgents(src);
	const commands = countSourceCommands(src);
	if (hooks > 0)
		skipped.push({
			component: "hooks",
			count: hooks,
			reason: "Windsurf'ta hook esdegeri yok",
		});
	if (skills > 0)
		skipped.push({
			component: "skills",
			count: skills,
			reason: "Windsurf'ta skill esdegeri yok",
		});
	if (agents > 0)
		skipped.push({
			component: "subagents",
			count: agents,
			reason: "Windsurf'ta subagent yok",
		});
	if (commands > 0)
		skipped.push({
			component: "commands",
			count: commands,
			reason:
				"Windsurf'ta slash komut yok (.windsurfrules'a inline rehber gonderildi)",
		});
	return skipped;
}

function runInstall({ target, src, force = false, dryRun = false }) {
	const result = { copied: 0, skipped: 0, created: 0 };
	compileWindsurfRules(src, target, force, dryRun, result);
	result.skippedComponents = buildSkippedReport(src);
	return result;
}

export default {
	id: "windsurf",
	name: "Windsurf",
	supports: {
		rules: true,
		commands: false,
		mcp: false,
		subagents: false,
		hooks: false,
		skills: false,
	},

	detect(target) {
		return existsSync(join(target, ".windsurfrules"));
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

		run(".windsurfrules mevcut", () =>
			existsSync(join(target, ".windsurfrules")),
		);

		return { pass, warn, fail, checks };
	},
};
