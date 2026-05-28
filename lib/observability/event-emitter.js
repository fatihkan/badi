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
//
// v1.30 review C5 fix: ALLOWED_TYPES'a ek olarak `plugin.*` prefix'i de
// kabul ediliyor (plugin'lerin kendi event'lerini yayinlayabilmesi icin).
// Plugin event'leri "plugin.<plugin-adi>.<event-adi>" formatinda olmali,
// yani en az 3 parca: plugin.x.y. Bu yapi 'plugin.skill.installed' gibi
// Badi'nin kendi event'leriyle catismayi onler (cunku Badi event'leri
// `badi.` prefix'li).
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
	"badi.hook.fired",
]);

// Plugin event prefix kontrolu (v1.30 review C5).
// "plugin.<owner>.<event>" formatini kabul eder, min 3 parca + her parca
// kebab-case [a-z0-9-]. Bu cesitlilik plugin'lere alan birakir,
// arbitrary string'leri reddeder.
const PLUGIN_EVENT_RE = /^plugin\.[a-z0-9-]+\.[a-z0-9.-]+$/;

export function isAllowedType(type) {
	if (typeof type !== "string") return false;
	if (ALLOWED_TYPES.has(type)) return true;
	if (PLUGIN_EVENT_RE.test(type)) return true;
	return false;
}

function projectSlug(cwd) {
	// ~/.claude/projects/<slug>/ — Claude Code'in slug normalizasyonu ile
	// uyumlu: tum yol separator'lari "-" yapilir, baslangic "-" eklenir.
	// Ornek: /Volumes/Backup/cloud/git/badi -> -Volumes-Backup-cloud-git-badi
	let s = cwd.replace(/[\\/]/g, "-");
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
	// v1.30 review C5: badi.* (closed list) + plugin.* (regex) kabul.
	if (!isAllowedType(type)) return; // unknown types silently dropped
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
		} else if (typeof v === "number" || typeof v === "boolean" || v === null) {
			out[k] = v;
		} else if (Array.isArray(v)) {
			out[k] = v
				.slice(0, 50)
				.map((x) =>
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
 *
 * Buyuk log'larda ortalama 200 byte/event varsayarak {limit} = N istegi
 * icin son ~N*400 byte okumak yeterli (tail reader, B4 fix). Tum dosyayi
 * okumak istiyorsan limit=null kullan.
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

/**
 * Tail reader (B4 fix): dosyanin son K byte'ini oku, son `\n`'den sonra
 * parse et. Buyuk JSONL dosyalarinda `list --limit N` icin O(N) yerine
 * O(K) okuma yapar. K varsayilani limit*400 byte (200 byte/event ortalama).
 *
 * limit: kac event geri donulecek
 * cwd: opsiyonel project root override
 *
 * Returns array of parsed events, newest first. En fazla `limit` adet.
 */
export async function readEventsTail(limit = 30, opts = {}) {
	const path = eventsLogPath(opts.cwd || process.cwd());
	if (!path || !existsSync(path)) return [];
	const {
		openSync,
		readSync,
		closeSync,
		statSync: stat,
	} = await import("node:fs");

	let fd;
	try {
		fd = openSync(path, "r");
	} catch {
		return [];
	}

	try {
		const { size } = stat(path);
		if (size === 0) return [];

		// Hedef: yeterli buyuklukte tail (limit * 400 byte + emniyet pay).
		// Sinir: dosyanin tamami.
		const target = Math.min(size, Math.max(4096, limit * 400));
		const start = size - target;
		const buf = Buffer.alloc(target);
		readSync(fd, buf, 0, target, start);

		let text = buf.toString("utf-8");
		// Eger dosyanin ortasindan basladiysak ilk satir kismi olabilir; at.
		if (start > 0) {
			const firstNl = text.indexOf("\n");
			if (firstNl >= 0) text = text.slice(firstNl + 1);
		}
		const lines = text.split("\n").filter(Boolean);
		const events = [];
		// En yeni once: dosya append-only oldugu icin sondakiler en yeni.
		for (let i = lines.length - 1; i >= 0 && events.length < limit; i--) {
			try {
				events.push(JSON.parse(lines[i]));
			} catch {
				// corrupted line skip
			}
		}
		return events;
	} finally {
		try {
			closeSync(fd);
		} catch {}
	}
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
