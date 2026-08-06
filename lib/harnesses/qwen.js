import {
	chmodSync,
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { PKG_ROOT } from "../cli.js";
import { copyRecursive } from "../helpers.js";

// Qwen Code adapter (v1.37+).
//
// Qwen Code cloned Claude Code's extension contract closely: it has real
// PreToolUse hooks that can DENY a tool call, subagents, per-file slash
// commands and a QWEN.md context file. That makes it the only non-Claude
// harness that can carry badi's safety layer, so this is a rich adapter
// (claude.js shape) rather than a buildSingleFileHarness() rules dump.
//
// Layout written:
//   .claude/           canonical badi assets + hook scripts + state (unchanged)
//   QWEN.md            project context (from CLAUDE.md)
//   .qwen/settings.json  hooks, matchers translated to Qwen tool ids
//   .qwen/agents/*.md    subagents, `tools:` translated
//   .qwen/commands/*.md  slash commands, `description:` frontmatter added
//
// The hook SCRIPTS are deliberately NOT forked: .claude/hooks/_util.mjs
// resolves the project root via `git rev-parse --show-toplevel` (falling back
// to cwd) and never reads $CLAUDE_PROJECT_DIR, so the same .mjs bodies run
// unmodified under Qwen. Only the wiring (paths + matchers) is translated.

/**
 * Claude Code tool id -> Qwen Code tool id.
 * Verified against Qwen Code 0.21.6's bundled docs (features/hooks.md +
 * tool-use-summaries.md). Unknown ids are passed through unchanged so a new
 * Claude tool never silently disappears from a matcher.
 */
export const TOOL_MAP = {
	Bash: "run_shell_command",
	Write: "write_file",
	Edit: "edit",
	NotebookEdit: "notebook_edit",
	Read: "read_file",
	Grep: "search_file_content",
	Glob: "glob",
	WebFetch: "web_fetch",
	WebSearch: "web_search",
	Task: "task",
	TodoWrite: "todo_write",
};

/**
 * SessionStart matcher values. Both Claude Code and Qwen Code use
 * startup|resume|clear|compact; badi historically shipped the invalid
 * "new"/"resumed", so translate those too rather than propagating a matcher
 * that silently matches nothing.
 */
export const SOURCE_MAP = {
	new: "startup",
	resumed: "resume",
	startup: "startup",
	resume: "resume",
	clear: "clear",
	compact: "compact",
};

/**
 * Translate a PreToolUse/PostToolUse matcher ("Write|Edit|NotebookEdit") into
 * Qwen tool ids ("write_file|edit|notebook_edit"). Matchers are regex on both
 * sides, so alternation survives the mapping.
 *
 * Pure + exported for testing.
 */
export function mapToolMatcher(matcher) {
	if (typeof matcher !== "string" || matcher === "" || matcher === "*") {
		return matcher;
	}
	return matcher
		.split("|")
		.map((raw) => {
			const id = raw.trim();
			return TOOL_MAP[id] ?? id;
		})
		.join("|");
}

/**
 * Translate one settings.json hook block for Qwen Code:
 *   - PreToolUse/PostToolUse/PostToolUseFailure matchers -> Qwen tool ids
 *   - SessionStart matchers -> valid source values
 *   - $CLAUDE_PROJECT_DIR -> $QWEN_PROJECT_DIR in every hook command
 * Events Qwen does not implement are dropped (reported by the caller).
 *
 * Pure + exported for testing.
 *
 * @param {object} settings parsed .claude/settings.json
 * @returns {{hooks: object, dropped: string[]}}
 */
export function translateSettings(settings) {
	const TOOL_EVENTS = new Set([
		"PreToolUse",
		"PostToolUse",
		"PostToolUseFailure",
	]);
	// Events Qwen Code 0.21.6 implements (features/hooks.md "Hook Events").
	const SUPPORTED = new Set([
		"PreToolUse",
		"PostToolUse",
		"PostToolUseFailure",
		"UserPromptSubmit",
		"SessionStart",
		"SessionEnd",
		"Stop",
		"SubagentStop",
		"PreCompact",
		"Notification",
	]);

	const src = settings?.hooks;
	const hooks = {};
	const dropped = [];
	if (!src || typeof src !== "object") return { hooks, dropped };

	for (const [event, entries] of Object.entries(src)) {
		if (!SUPPORTED.has(event)) {
			dropped.push(event);
			continue;
		}
		if (!Array.isArray(entries)) continue;
		hooks[event] = entries.map((entry) => {
			let matcher = entry?.matcher;
			if (TOOL_EVENTS.has(event)) {
				matcher = mapToolMatcher(matcher);
			} else if (event === "SessionStart" && typeof matcher === "string") {
				matcher = SOURCE_MAP[matcher] ?? matcher;
			}
			const inner = (entry?.hooks ?? []).map((h) => ({
				...h,
				...(typeof h?.command === "string"
					? {
							command: h.command
								.replaceAll("${CLAUDE_PROJECT_DIR", "${QWEN_PROJECT_DIR")
								.replaceAll("$CLAUDE_PROJECT_DIR", "$QWEN_PROJECT_DIR"),
						}
					: {}),
			}));
			return { ...entry, matcher, hooks: inner };
		});
	}
	return { hooks, dropped };
}

/**
 * Translate an agent's `tools:` frontmatter list to Qwen tool ids.
 * badi agents declare e.g. `tools: [Read, Grep, Glob, Bash]`.
 *
 * Pure + exported for testing.
 */
export function translateAgent(content) {
	return content.replace(
		/^(tools:\s*\[)([^\]]*)(\])/m,
		(_m, open, body, close) => {
			const mapped = body
				.split(",")
				.map((t) => {
					const id = t.trim();
					if (!id) return null;
					return TOOL_MAP[id] ?? id;
				})
				.filter(Boolean)
				.join(", ");
			return `${open}${mapped}${close}`;
		},
	);
}

/**
 * badi command files carry their description on line 1 as plain prose (that
 * line is mirrored in command-index.md, so it is never rewritten). Qwen reads
 * a `description:` from YAML frontmatter, so prepend one without touching the
 * body.
 *
 * Pure + exported for testing.
 */
export function commandToQwen(content) {
	if (content.startsWith("---")) return content; // already has frontmatter
	const firstLine = content.split("\n", 1)[0].trim();
	const desc = firstLine.replace(/"/g, '\\"');
	return `---\ndescription: "${desc}"\n---\n\n${content}`;
}

// Qwen Code ships built-in slash commands; a badi command of the same name
// would be shadowed. Rename the known collisions on the way out.
const COMMAND_RENAMES = { clear: "badi-clear", memory: "badi-memory" };

function writeQwenTree({ target, src, force, dryRun, result }) {
	const qwenDir = join(target, ".qwen");
	const mk = (p) => {
		if (!dryRun) mkdirSync(p, { recursive: true });
	};
	const put = (dest, body) => {
		const existed = existsSync(dest);
		if (existed && !force) {
			result.skipped++;
			return;
		}
		if (!dryRun) {
			mkdirSync(join(dest, ".."), { recursive: true });
			writeFileSync(dest, body);
		}
		result.copied++;
		if (!existed) result.created++;
	};

	mk(qwenDir);

	// 1. QWEN.md — project context, from the canonical CLAUDE.md.
	const srcCtx = resolve(PKG_ROOT, "CLAUDE.md");
	if (existsSync(srcCtx)) {
		put(join(target, "QWEN.md"), readFileSync(srcCtx, "utf-8"));
	}

	// 2. .qwen/settings.json — hooks with translated matchers + paths.
	const srcSettings = join(src, "settings.json");
	if (existsSync(srcSettings)) {
		try {
			const parsed = JSON.parse(readFileSync(srcSettings, "utf-8"));
			const { hooks } = translateSettings(parsed);
			put(
				join(qwenDir, "settings.json"),
				`${JSON.stringify({ hooks }, null, 2)}\n`,
			);
		} catch {
			result.skippedComponents.push({
				component: "hooks",
				reason: "source .claude/settings.json is not valid JSON",
			});
		}
	}

	// 3. .qwen/agents/*.md — subagents with translated tool lists.
	const srcAgents = join(src, "agents");
	if (existsSync(srcAgents)) {
		for (const f of readdirSync(srcAgents)) {
			if (!f.endsWith(".md")) continue;
			const body = translateAgent(readFileSync(join(srcAgents, f), "utf-8"));
			put(join(qwenDir, "agents", f), body);
		}
	}

	// 4. .qwen/commands/*.md — slash commands with description frontmatter.
	const srcCommands = join(src, "commands");
	if (existsSync(srcCommands)) {
		for (const f of readdirSync(srcCommands)) {
			if (!f.endsWith(".md")) continue;
			const stem = f.slice(0, -3);
			const out = `${COMMAND_RENAMES[stem] ?? stem}.md`;
			const body = commandToQwen(readFileSync(join(srcCommands, f), "utf-8"));
			put(join(qwenDir, "commands", out), body);
		}
	}
}

function chmodHooks(destClaude) {
	const hooksDir = join(destClaude, "hooks");
	if (!existsSync(hooksDir)) return;
	for (const f of readdirSync(hooksDir)) {
		if (f.endsWith(".sh") || f.endsWith(".mjs")) {
			try {
				chmodSync(join(hooksDir, f), 0o755);
			} catch {
				/* Windows: no-op */
			}
		}
	}
}

function run({ target, src, force, dryRun, updateMode }) {
	const destClaude = join(target, ".claude");
	if (!dryRun && !existsSync(destClaude)) {
		mkdirSync(destClaude, { recursive: true });
	}
	// badi's canonical assets (hook scripts, skills vault, state) stay in
	// .claude/ — the hook bodies resolve paths from the git root, not from an
	// env var, so they run unmodified under Qwen.
	const result = copyRecursive(src, destClaude, {
		force,
		dryRun,
		...(updateMode ? { updateMode: !force } : {}),
	});
	result.files = [];
	result.skippedComponents = [];
	writeQwenTree({ target, src, force, dryRun, result });
	if (!dryRun) chmodHooks(destClaude);
	return result;
}

export default {
	id: "qwen",
	name: "Qwen Code",
	supports: {
		rules: true,
		commands: true,
		mcp: true,
		subagents: true,
		hooks: true,
		skills: false,
	},

	detect(target) {
		return (
			existsSync(join(target, ".qwen")) || existsSync(join(target, "QWEN.md"))
		);
	},

	install({ target, src, force = false, dryRun = false }) {
		return run({ target, src, force, dryRun, updateMode: false });
	},

	update({ target, src, force = false, dryRun = false }) {
		return run({ target, src, force, dryRun, updateMode: true });
	},

	doctor({ target }) {
		const checks = [];
		let pass = 0;
		let warn = 0;
		let fail = 0;
		const check = (label, fn) => {
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

		const qwenDir = join(target, ".qwen");
		check("QWEN.md exists", () => existsSync(join(target, "QWEN.md")));
		check(".qwen/ directory exists", () => existsSync(qwenDir));
		check(".qwen/settings.json is valid JSON", () => {
			const p = join(qwenDir, "settings.json");
			if (!existsSync(p)) return "warn";
			JSON.parse(readFileSync(p, "utf-8"));
			return true;
		});
		check("hook commands are project-root anchored", () => {
			const p = join(qwenDir, "settings.json");
			if (!existsSync(p)) return "warn";
			let s;
			try {
				s = JSON.parse(readFileSync(p, "utf-8"));
			} catch {
				return "warn";
			}
			const bad = [];
			for (const entries of Object.values(s?.hooks ?? {})) {
				for (const entry of entries ?? []) {
					for (const h of entry?.hooks ?? []) {
						const c = h?.command;
						if (typeof c !== "string") continue;
						if (c.includes("hooks/") && !c.includes("QWEN_PROJECT_DIR")) {
							bad.push(c);
						}
					}
				}
			}
			return bad.length === 0 ? true : "warn";
		});
		check("hook matchers use Qwen tool ids", () => {
			const p = join(qwenDir, "settings.json");
			if (!existsSync(p)) return "warn";
			let s;
			try {
				s = JSON.parse(readFileSync(p, "utf-8"));
			} catch {
				return "warn";
			}
			// A Claude-style matcher here means the guard fires on nothing.
			const claudeIds = Object.keys(TOOL_MAP);
			for (const ev of ["PreToolUse", "PostToolUse", "PostToolUseFailure"]) {
				for (const entry of s?.hooks?.[ev] ?? []) {
					const m = entry?.matcher;
					if (typeof m !== "string") continue;
					for (const part of m.split("|")) {
						if (claudeIds.includes(part.trim())) return "fail";
					}
				}
			}
			return true;
		});
		check("hook scripts present (.claude/hooks/)", () =>
			existsSync(join(target, ".claude", "hooks")),
		);
		check(".qwen/agents/ populated", () => {
			const p = join(qwenDir, "agents");
			if (!existsSync(p)) return "warn";
			return readdirSync(p).filter((f) => f.endsWith(".md")).length > 0
				? true
				: "warn";
		});
		check(".qwen/commands/ populated", () => {
			const p = join(qwenDir, "commands");
			if (!existsSync(p)) return "warn";
			return readdirSync(p).filter((f) => f.endsWith(".md")).length > 0
				? true
				: "warn";
		});

		return { pass, warn, fail, checks };
	},
};
