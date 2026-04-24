import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

/**
 * Minimal YAML-ish frontmatter parser for watcher markdown files.
 * Intentionally narrow: supports the subset we document in README/issue #55.
 *
 * Accepted forms:
 *   key: value                 (scalar)
 *   key:                       (then indented list items follow)
 *     - item
 *     - key: value              (nested object in list)
 *       other: value
 *   active: true / false
 *   every: 15m | 1h | daily | cron:"..."
 */

const VALID_TYPES = ["git", "shell", "file", "log", "http"];
const EVERY_UNITS = { s: 1, m: 60, h: 3600 };

export class WatcherError extends Error {}

function tokenize(lines) {
	return lines.map((raw) => {
		const match = raw.match(/^(\s*)(.*)$/);
		return { indent: match[1].length, content: match[2], raw };
	});
}

function parseScalar(v) {
	if (v === "true") return true;
	if (v === "false") return false;
	if (v === "null") return null;
	if (/^-?\d+$/.test(v)) return Number.parseInt(v, 10);
	if (/^-?\d+\.\d+$/.test(v)) return Number.parseFloat(v);
	if (
		(v.startsWith('"') && v.endsWith('"')) ||
		(v.startsWith("'") && v.endsWith("'"))
	) {
		return v.slice(1, -1);
	}
	return v;
}

function parseBlock(tokens, start, baseIndent) {
	const obj = {};
	let i = start;
	while (i < tokens.length) {
		const t = tokens[i];
		if (t.content === "") {
			i++;
			continue;
		}
		if (t.indent < baseIndent) break;
		if (t.indent > baseIndent) {
			i++;
			continue;
		}
		if (t.content.startsWith("- ")) break;
		const colon = t.content.indexOf(":");
		if (colon === -1) {
			throw new WatcherError(`YAML parse hatasi: '${t.raw}'`);
		}
		const key = t.content.slice(0, colon).trim();
		const value = t.content.slice(colon + 1).trim();
		if (value) {
			obj[key] = parseScalar(value);
			i++;
			continue;
		}
		// value bos → sonraki satira bak: ya liste ya nested obje
		const next = tokens[i + 1];
		if (!next || next.indent <= baseIndent) {
			obj[key] = null;
			i++;
			continue;
		}
		if (next.content.startsWith("- ")) {
			const { list, nextIndex } = parseList(tokens, i + 1, next.indent);
			obj[key] = list;
			i = nextIndex;
		} else {
			const { obj: sub, nextIndex } = (() => {
				const sub = parseBlock(tokens, i + 1, next.indent);
				let j = i + 1;
				while (
					j < tokens.length &&
					tokens[j].content !== "" &&
					tokens[j].indent >= next.indent
				)
					j++;
				return { obj: sub, nextIndex: j };
			})();
			obj[key] = sub;
			i = nextIndex;
		}
	}
	return obj;
}

function parseList(tokens, start, baseIndent) {
	const list = [];
	let i = start;
	while (i < tokens.length) {
		const t = tokens[i];
		if (t.content === "") {
			i++;
			continue;
		}
		if (t.indent < baseIndent) break;
		if (t.indent > baseIndent) {
			i++;
			continue;
		}
		if (!t.content.startsWith("- ")) break;
		const firstKeyLine = t.content.slice(2);
		const colon = firstKeyLine.indexOf(":");
		if (colon === -1) {
			// yalin liste degeri
			list.push(parseScalar(firstKeyLine.trim()));
			i++;
			continue;
		}
		const key = firstKeyLine.slice(0, colon).trim();
		const value = firstKeyLine.slice(colon + 1).trim();
		const item = {};
		item[key] = value ? parseScalar(value) : null;
		i++;
		// sonraki satirlardan baseIndent+2 ile devam edenler ayni item'in alanlari
		const itemIndent = baseIndent + 2;
		while (i < tokens.length) {
			const nt = tokens[i];
			if (nt.content === "") {
				i++;
				continue;
			}
			if (nt.indent < itemIndent) break;
			if (nt.content.startsWith("- ") && nt.indent === baseIndent) break;
			if (nt.indent === itemIndent) {
				const c = nt.content.indexOf(":");
				if (c === -1) break;
				const k = nt.content.slice(0, c).trim();
				const v = nt.content.slice(c + 1).trim();
				item[k] = v ? parseScalar(v) : null;
			}
			i++;
		}
		list.push(item);
	}
	return { list, nextIndex: i };
}

export function parseFrontmatter(content) {
	const lines = content.split(/\r?\n/);
	if (lines[0].trim() !== "---") {
		throw new WatcherError("Frontmatter bulunamadi (--- ile baslamali)");
	}
	let end = -1;
	for (let i = 1; i < lines.length; i++) {
		if (lines[i].trim() === "---") {
			end = i;
			break;
		}
	}
	if (end === -1) throw new WatcherError("Frontmatter kapanisi bulunamadi");
	const body = lines.slice(end + 1).join("\n");
	const tokens = tokenize(lines.slice(1, end));
	const meta = parseBlock(tokens, 0, 0);
	return { meta, body };
}

/**
 * Parse and validate a watcher markdown file.
 * Throws WatcherError on any malformed / unsafe definition.
 */
export function loadWatcher(filePath) {
	if (!existsSync(filePath))
		throw new WatcherError(`Watcher dosyasi yok: ${filePath}`);
	const content = readFileSync(filePath, "utf-8");
	const { meta, body } = parseFrontmatter(content);
	return validateWatcher(
		{
			...meta,
			_filePath: filePath,
			_defaultName: basename(filePath, ".md"),
			notes: body.trim() || null,
		},
		{ filePath },
	);
}

export function validateWatcher(w, { filePath } = {}) {
	const name = w.name || w._defaultName;
	if (!name) throw new WatcherError(`name bos (${filePath || ""})`);
	if (!/^[a-z0-9][a-z0-9-]{1,63}$/i.test(name)) {
		throw new WatcherError(
			`Gecersiz name '${name}': harf/rakam/tire, 2-64 kar.`,
		);
	}
	const active = w.active !== false;
	const every = w.every || "15m";
	parseEvery(every); // validate format

	const watches = Array.isArray(w.watch) ? w.watch : [];
	if (!watches.length) throw new WatcherError(`${name}: watch listesi bos`);
	for (const [i, c] of watches.entries()) {
		if (!c || typeof c !== "object")
			throw new WatcherError(`${name}: watch[${i}] obje degil`);
		if (!VALID_TYPES.includes(c.type))
			throw new WatcherError(
				`${name}: watch[${i}].type gecersiz (${c.type}) — gecerli: ${VALID_TYPES.join(", ")}`,
			);
	}

	return {
		name,
		description: w.description || "",
		active,
		every,
		watches,
		reportTo: w.report_to || `.claude/workspace/watcher-reports/${name}.md`,
		notify: w.notify || [],
		notes: w.notes || null,
		filePath: w._filePath || filePath || null,
	};
}

/** "15m" → 900, "1h" → 3600, "daily" → 86400, "cron:..." → null (cron expr) */
export function parseEvery(spec) {
	if (typeof spec !== "string" || !spec)
		throw new WatcherError(`Gecersiz every: ${spec}`);
	if (spec === "daily") return 86400;
	if (spec === "hourly") return 3600;
	if (spec.startsWith("cron:")) return null; // raw cron expr
	const m = spec.match(/^(\d+)([smh])$/);
	if (!m) throw new WatcherError(`Gecersiz every formati: ${spec}`);
	const n = Number.parseInt(m[1], 10);
	const seconds = n * EVERY_UNITS[m[2]];
	if (seconds < 60) throw new WatcherError(`every >= 60s olmali: ${spec}`);
	return seconds;
}

/** List all watcher files under .claude/watchers/ */
export function listWatcherFiles(projectRoot) {
	const dir = join(projectRoot, ".claude", "watchers");
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((f) => f.endsWith(".md"))
		.map((f) => join(dir, f))
		.sort();
}

export { VALID_TYPES };
