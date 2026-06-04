import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { PKG_ROOT } from "../cli.js";

// _single-file.js — shared harness factory (v1.30 review C1 fix).
//
// the gemini / windsurf / agents adapters shared more than 80% of the same code
// (553 lines, count*, build*, runInstall, doctor). This module abstracts the
// shared signature; each adapter only declares its own configuration.
//
// Configuration:
//   id: "windsurf"
//   name: "Windsurf"
//   filename: ".windsurfrules"             // target file (single-file rules)
//   skippedReasons: {                       // a reason per component
//     hooks: "Windsurf has no hook equivalent",
//     skills: "...",
//     subagents: "...",
//     commands: "...",
//   }
//   extraWriter (optional):                 // .gemini/settings.json for gemini
//     ({ target, src, force, dryRun, result }) => void
//   ensureDir (optional):                   // the .gemini/ directory for gemini
//     (target) => string | null
//
// The adapter ultimately exports { id, name, supports, detect, install, update, doctor }
// — as before.

export function countSourceCommands(src) {
	const dir = join(src, "commands");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir).filter((f) => f.endsWith(".md")).length;
}

export function countSourceHooks(src) {
	const dir = join(src, "hooks");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir).filter((f) => f.endsWith(".mjs") || f.endsWith(".sh"))
		.length;
}

export function countSourceSkills(src) {
	const vault = join(src, "skills-vault");
	const dir = existsSync(vault) ? vault : join(src, "skills");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir, { withFileTypes: true }).filter((d) =>
		d.isDirectory(),
	).length;
}

export function countSourceAgents(src) {
	const dir = join(src, "agents");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir).filter((f) => f.endsWith(".md")).length;
}

/**
 * Merges canonical CLAUDE.md + memory + knowledge-base into a single string.
 * All single-file harnesses read the same source.
 */
export function buildMergedDoc(src) {
	const sections = [];
	const claudeMd = resolve(PKG_ROOT, "CLAUDE.md");
	if (existsSync(claudeMd)) {
		sections.push(readFileSync(claudeMd, "utf-8").trim());
	}
	const memoryMd = join(src, "memory.md");
	if (existsSync(memoryMd)) {
		sections.push(
			`\n---\n\n# Project Memory\n\n${readFileSync(memoryMd, "utf-8").trim()}`,
		);
	}
	const kbMd = join(src, "knowledge-base.md");
	if (existsSync(kbMd)) {
		sections.push(
			`\n---\n\n# Knowledge Base\n\n${readFileSync(kbMd, "utf-8").trim()}`,
		);
	}
	return sections.length ? `${sections.join("\n\n")}\n` : null;
}

function compileFile(src, target, filename, force, dryRun, result) {
	const content = buildMergedDoc(src);
	if (!content) return;
	const dest = join(target, filename);
	const existed = existsSync(dest);
	if (existed && !force) {
		result.skipped++;
		return;
	}
	if (!dryRun) {
		mkdirSync(dirname(dest), { recursive: true });
		writeFileSync(dest, content);
	}
	result.copied++;
	if (!existed) result.created++;
}

function buildSkippedReport(src, reasons) {
	const hooks = countSourceHooks(src);
	const skills = countSourceSkills(src);
	const agents = countSourceAgents(src);
	const commands = countSourceCommands(src);
	const skipped = [];
	if (hooks > 0 && reasons.hooks)
		skipped.push({ component: "hooks", count: hooks, reason: reasons.hooks });
	if (skills > 0 && reasons.skills)
		skipped.push({
			component: "skills",
			count: skills,
			reason: reasons.skills,
		});
	if (agents > 0 && reasons.subagents)
		skipped.push({
			component: "subagents",
			count: agents,
			reason: reasons.subagents,
		});
	if (commands > 0 && reasons.commands)
		skipped.push({
			component: "commands",
			count: commands,
			reason: reasons.commands,
		});
	return skipped;
}

/**
 * Factory — create a single-file harness adapter.
 * The former 3 adapters (gemini/windsurf/agents) wrap this.
 */
export function buildSingleFileHarness({
	id,
	name,
	filename,
	supports,
	skippedReasons,
	extraWriter,
	ensureDir,
	doctorChecks,
}) {
	const detectFiles = [filename];

	function runInstall({ target, src, force = false, dryRun = false }) {
		const result = { copied: 0, skipped: 0, created: 0 };
		if (ensureDir && !dryRun) {
			const dir = ensureDir(target);
			if (dir && !existsSync(dir)) {
				mkdirSync(dir, { recursive: true });
				result.created++;
			}
		}
		compileFile(src, target, filename, force, dryRun, result);
		if (typeof extraWriter === "function") {
			extraWriter({ target, src, force, dryRun, result });
		}
		result.skippedComponents = buildSkippedReport(src, skippedReasons || {});
		return result;
	}

	return {
		id,
		name,
		supports: supports || {
			rules: true,
			commands: false,
			mcp: false,
			subagents: false,
			hooks: false,
			skills: false,
		},

		detect(target) {
			return detectFiles.some((f) => existsSync(join(target, f)));
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

			// Default: target file existence
			run(`${filename} present`, () => existsSync(join(target, filename)));
			// Adapter-specific extra checks (.gemini/settings.json for gemini)
			if (Array.isArray(doctorChecks)) {
				for (const c of doctorChecks) run(c.label, () => c.fn(target));
			}

			return { pass, warn, fail, checks };
		},
	};
}

// Re-export internal helpers — for tests and most adapters
export { buildSkippedReport, compileFile, cpSync, existsSync, mkdirSync };
