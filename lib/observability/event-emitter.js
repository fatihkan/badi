// Badi typed event emission — self-telemetry.
//
// Privacy notu:
//   - Tum kayitlar LOKAL: ~/.claude/projects/<project>/badi-events.jsonl
//   - Hicbir veri dis sisteme gonderilmez (network call yok).
//   - BADI_TELEMETRY=off ile tamamen devre disi (her cagri no-op).
//   - Args/payload icinde token, secret, kullanici icerigi DEPOLANMAZ.
//     Sadece cmd adi + duration_ms + exit_code + bilinen safe alanlar.
//
// Format: JSONL, her satir tek bir event.
//   { ts, type, cmd?, duration_ms?, exit_code?, ... }

import { appendFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";

const TELEMETRY_OFF =
	process.env.BADI_TELEMETRY === "off" ||
	process.env.BADI_TELEMETRY === "0" ||
	process.env.BADI_TELEMETRY === "false";

// Allowed event types (whitelist; unknown types blocked).
export const ALLOWED_TYPES = new Set([
	"badi.command.started",
	"badi.command.completed",
	"badi.command.failed",
	"badi.skill.installed",
	"badi.skill.removed",
	"badi.plugin.installed",
	"badi.plugin.removed",
	"badi.publish.started",
	"badi.publish.completed",
	"badi.publish.failed",
	"badi.release.check",
]);

function projectSlug(cwd) {
	// ~/.claude/projects/<slug>/ — Claude Code'in slug normalizasyonu ile
	// uyumlu: tum yol separator'lari "-" yapilir, baslangic "-" eklenir.
	// Ornek: /Volumes/Backup/cloud/git/badi -> -Volumes-Backup-cloud-git-badi
	let s = cwd.replace(/[\\\/]/g, "-");
	if (!s.startsWith("-")) s = `-${s}`;
	return s;
}

function eventsLogPath(cwd) {
	const slug = projectSlug(cwd || process.cwd());
	const dir = join(homedir(), ".claude", "projects", slug);
	if (!existsSync(dir)) {
		try {
			mkdirSync(dir, { recursive: true });
		} catch {
			return null;
		}
	}
	return join(dir, "badi-events.jsonl");
}

/**
 * Emit a single event. Pure best-effort; never throws to caller.
 *   type: must be in ALLOWED_TYPES
 *   data: shallow object; only safe primitives recommended
 */
export function emit(type, data = {}) {
	if (TELEMETRY_OFF) return;
	if (!ALLOWED_TYPES.has(type)) return; // unknown types silently dropped
	try {
		const event = {
			ts: new Date().toISOString(),
			type,
			...sanitize(data),
		};
		const path = eventsLogPath(data.cwd || process.cwd());
		if (!path) return;
		appendFileSync(path, `${JSON.stringify(event)}\n`, "utf-8");
	} catch {
		// best-effort: never propagate telemetry errors
	}
}

function sanitize(data) {
	const out = {};
	for (const [k, v] of Object.entries(data)) {
		if (k === "cwd") continue; // cwd already used for path, not stored
		if (typeof v === "string") {
			// Truncate strings to 200 chars to prevent accidental leakage
			out[k] = v.length > 200 ? `${v.slice(0, 200)}...` : v;
		} else if (
			typeof v === "number" ||
			typeof v === "boolean" ||
			v === null
		) {
			out[k] = v;
		} else if (Array.isArray(v)) {
			out[k] = v.slice(0, 50).map((x) =>
				typeof x === "string" && x.length > 100 ? `${x.slice(0, 100)}...` : x,
			);
		}
		// drop nested objects / undefined silently
	}
	return out;
}

/**
 * Read all events from current project's JSONL. Best-effort.
 * Returns array of parsed events, newest first.
 */
export async function readEvents(opts = {}) {
	const path = eventsLogPath(opts.cwd || process.cwd());
	if (!path || !existsSync(path)) return [];
	const { readFileSync } = await import("node:fs");
	const lines = readFileSync(path, "utf-8").split("\n").filter(Boolean);
	const events = [];
	for (const line of lines) {
		try {
			events.push(JSON.parse(line));
		} catch {
			// skip corrupted line
		}
	}
	return events.reverse();
}

export function isEnabled() {
	return !TELEMETRY_OFF;
}

export function getEventsPath(cwd) {
	return eventsLogPath(cwd || process.cwd());
}

/**
 * Helper: time a sync/async function with command emission.
 * Returns the wrapped function's return value (or re-throws).
 */
export async function timeCommand(cmd, args, fn) {
	const start = Date.now();
	emit("badi.command.started", { cmd, args_count: args?.length || 0 });
	try {
		const result = await fn();
		emit("badi.command.completed", {
			cmd,
			duration_ms: Date.now() - start,
			exit_code: 0,
		});
		return result;
	} catch (e) {
		emit("badi.command.failed", {
			cmd,
			duration_ms: Date.now() - start,
			error_message: e?.message || String(e),
			exit_code: 1,
		});
		throw e;
	}
}

// File size diagnostics (used by `badi events` to advise rotation).
export function eventsFileSize(cwd) {
	const p = eventsLogPath(cwd || process.cwd());
	if (!p || !existsSync(p)) return 0;
	try {
		return statSync(p).size;
	} catch {
		return 0;
	}
}

export const FILENAME = "badi-events.jsonl";
export { basename };
