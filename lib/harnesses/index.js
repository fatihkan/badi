import agents from "./agents.js";
import claude from "./claude.js";
import cursor from "./cursor.js";
import gemini from "./gemini.js";
import qwen from "./qwen.js";
import windsurf from "./windsurf.js";

/**
 * Harness adapter contract:
 *
 * {
 *   id: string                  unique slug, "claude" | "cursor" | "gemini" ...
 *   name: string                human-readable label
 *   supports: {                 what the harness natively supports
 *     rules, commands, mcp, subagents, hooks, skills: boolean
 *   }
 *   detect(target): boolean     is this harness installed at target?
 *   install({target,src,force,dryRun}): {copied,skipped,created,skippedComponents[]}
 *   update({target,src,force,dryRun}): same shape
 *   doctor({target}): {pass,warn,fail,checks:[{label,status}]}
 * }
 *
 * src = absolute path to the canonical .claude/ source dir (TEMPLATE_DIR in cli.js).
 * target = the user project root (where .claude/ or .cursor/ etc. will be written).
 */
// NOTE: append new harnesses. Order is load-bearing — detectHarness() returns
// the FIRST match and doctor treats HARNESSES[0] as the default (claude).
export const HARNESSES = [claude, cursor, gemini, windsurf, agents, qwen];

export const HARNESS_IDS = HARNESSES.map((h) => h.id);

export function getHarness(id) {
	return HARNESSES.find((h) => h.id === id) ?? null;
}

/**
 * Parse --harness flag value. Accepts "all" or comma-separated ids.
 * Case-insensitive: "CURSOR" or "Cursor" both resolve to cursor.
 * Returns [{id,name,...}, ...] or throws on unknown id.
 */
export function resolveHarnesses(value) {
	if (!value) return [];
	const normalized = value.toLowerCase();
	if (normalized === "all") return [...HARNESSES];
	const ids = normalized
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
	const out = [];
	for (const id of ids) {
		const h = getHarness(id);
		if (!h) throw new Error(`Unknown harness: ${id}`);
		out.push(h);
	}
	return out;
}

/**
 * Best-effort auto-detect: returns the first harness whose detect() matches.
 * Returns null if nothing detected.
 */
export function detectHarness(target) {
	for (const h of HARNESSES) {
		try {
			if (h.detect(target)) return h;
		} catch {}
	}
	return null;
}
