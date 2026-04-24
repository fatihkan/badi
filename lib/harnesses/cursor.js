import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { PKG_ROOT } from "../cli.js";

/**
 * Cursor adapter — compiles Badi's Claude-centric source into Cursor's rules +
 * commands + mcp.json layout.
 *
 * Target layout:
 *   .cursor/
 *     rules/
 *       badi-main.mdc            # CLAUDE.md (always-apply rule)
 *     commands/
 *       <name>.md                # 1:1 from .claude/commands/, with preface
 *     mcp.json                   # copied from project-root .mcp.json
 *
 * Not supported by Cursor (reported as skippedComponents):
 *   hooks, skills, subagents (Cursor's agents are still beta; we do not emit).
 *
 * Content transform: commands and the main rule carry a short preface that
 * warns about Claude-specific path references (`.claude/hooks/...`, subagents)
 * that do not exist in a Cursor workspace. We keep the body verbatim — we do
 * not rewrite links, because they are still informative for the LLM even if
 * the paths are not accessible.
 */

// alwaysApply: true makes `globs` irrelevant per Cursor docs — omit it.
const BADI_RULE_HEADER = `---
description: Badi workflow rules for Cursor (compiled from Claude Code source)
alwaysApply: true
---
`;

const CURSOR_PREFACE = `> **Not:** Bu dosya Badi tarafindan Claude Code kaynak formatindan derlendi.
> \`.claude/hooks/\`, subagent ve skill referanslari Cursor ortaminda birebir calismaz;
> icerigi rehber olarak kullan, path'ler Claude Code baglamindadir.

`;

function countSourceCommands(src) {
	const dir = join(src, "commands");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir).filter((f) => f.endsWith(".md")).length;
}

function countSourceSkills(src) {
	const dir = join(src, "skills");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir, { withFileTypes: true }).filter((d) =>
		d.isDirectory(),
	).length;
}

function countSourceHooks(src) {
	const dir = join(src, "hooks");
	if (!existsSync(dir)) return 0;
	return readdirSync(dir).filter((f) => f.endsWith(".sh")).length;
}

/**
 * Wrap Claude-sourced content for Cursor: prepends preface; preserves body.
 * Exported for tests.
 */
export function transformCommand(content) {
	if (content.startsWith("> **Not:** Bu dosya Badi")) return content;
	return CURSOR_PREFACE + content;
}

function writeText(destPath, content, dryRun) {
	if (dryRun) return;
	mkdirSync(join(destPath, ".."), { recursive: true });
	writeFileSync(destPath, content);
}

function buildRule() {
	const claudeMd = resolve(PKG_ROOT, "CLAUDE.md");
	if (!existsSync(claudeMd)) return null;
	const body = readFileSync(claudeMd, "utf-8");
	return BADI_RULE_HEADER + CURSOR_PREFACE + body;
}

function compileRules(target, force, dryRun, result) {
	const ruleContent = buildRule();
	if (!ruleContent) return;
	const destRule = join(target, ".cursor", "rules", "badi-main.mdc");
	const existed = existsSync(destRule);
	if (existed && !force) {
		result.skipped++;
		return;
	}
	writeText(destRule, ruleContent, dryRun);
	result.copied++;
	if (!existed) result.created++;
}

function compileCommands(src, target, force, dryRun, result) {
	const srcDir = join(src, "commands");
	if (!existsSync(srcDir)) return;
	const destDir = join(target, ".cursor", "commands");
	if (!dryRun) mkdirSync(destDir, { recursive: true });

	for (const file of readdirSync(srcDir)) {
		if (!file.endsWith(".md")) continue;
		const srcFile = join(srcDir, file);
		const destFile = join(destDir, file);
		const existed = existsSync(destFile);
		if (existed && !force) {
			result.skipped++;
			continue;
		}
		const body = readFileSync(srcFile, "utf-8");
		const transformed = transformCommand(body);
		writeText(destFile, transformed, dryRun);
		result.copied++;
		if (!existed) result.created++;
	}
}

function compileMcp(target, force, dryRun, result) {
	const srcMcp = resolve(PKG_ROOT, ".mcp.json");
	if (!existsSync(srcMcp)) return;
	const destMcp = join(target, ".cursor", "mcp.json");
	const existed = existsSync(destMcp);
	if (existed && !force) {
		result.skipped++;
		return;
	}
	const body = readFileSync(srcMcp, "utf-8");
	writeText(destMcp, body, dryRun);
	result.copied++;
	if (!existed) result.created++;
}

function buildSkippedReport(src) {
	const hooks = countSourceHooks(src);
	const skills = countSourceSkills(src);
	const skipped = [];
	if (hooks > 0) {
		skipped.push({
			component: "hooks",
			count: hooks,
			reason: "Cursor'da hook esdegeri yok",
		});
	}
	if (skills > 0) {
		skipped.push({
			component: "skills",
			count: skills,
			reason: "Cursor'da skill esdegeri yok",
		});
	}
	return skipped;
}

function runInstall({ target, src, force = false, dryRun = false }) {
	const result = { copied: 0, skipped: 0, created: 0 };
	if (!dryRun) {
		mkdirSync(join(target, ".cursor"), { recursive: true });
	}
	compileRules(target, force, dryRun, result);
	compileCommands(src, target, force, dryRun, result);
	compileMcp(target, force, dryRun, result);
	result.skippedComponents = buildSkippedReport(src);
	result.totalCommands = countSourceCommands(src);
	return result;
}

export default {
	id: "cursor",
	name: "Cursor",
	supports: {
		rules: true,
		commands: true,
		mcp: true,
		subagents: false,
		hooks: false,
		skills: false,
	},

	detect(target) {
		return existsSync(join(target, ".cursor"));
	},

	install(opts) {
		return runInstall(opts);
	},

	update(opts) {
		return runInstall({ ...opts, force: !!opts.force });
	},

	doctor({ target }) {
		const cursorDir = join(target, ".cursor");
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

		run(".cursor/ dizini mevcut", () => existsSync(cursorDir));
		run(".cursor/rules/badi-main.mdc", () =>
			existsSync(join(cursorDir, "rules", "badi-main.mdc")),
		);
		run(".cursor/commands/ en az 1 komut", () => {
			const d = join(cursorDir, "commands");
			if (!existsSync(d)) return false;
			const count = readdirSync(d).filter((f) => f.endsWith(".md")).length;
			return count >= 1 ? true : "warn";
		});
		run(".cursor/mcp.json", () => {
			const p = join(cursorDir, "mcp.json");
			if (!existsSync(p)) return "warn";
			JSON.parse(readFileSync(p, "utf-8"));
			return true;
		});

		return { pass, warn, fail, checks };
	},
};
