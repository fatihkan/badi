// Badi help-doctor — komut dosyalarinda help-drift tespit eder.
//
// Drift: parser tarafindan kabul edilen bir subcommand veya flag,
// kullaniciya gosterilen --help metninde yer almiyor.
//
// Yontem (heuristik, AST'siz):
//   1. Source'tan parser-side subcommand'leri cikar
//      (`case "x":`, `args[0] === "x"`, `sub === "x"`)
//   2. Source'tan parser-side flag'leri cikar
//      (literal "--xxx" string'leri)
//   3. --help / -h handler'inin govdesini bul (showHelp() veya inline)
//   4. Karsilastir, eksikleri raporla
//
// Heuristik oldugu icin false-positive yuzeyi vardir:
//   - String value'lari (format secimi, severity etc.) subcommand sanilabilir
//   - Regex pattern icindeki "--xxx" flag sanilabilir
//   - Help body'si dis fonksiyona (showHelp) bolundugunde tum dosya body
// Allowlist mekanizmasi: .claude/help-doctor.allow.json ile per-file exception.

import { existsSync, readFileSync } from "node:fs";

// Parser tarafinda subcommand olarak gozuken stringleri yakala.
const SUBCOMMAND_PATTERNS = [
	/case\s+["'`]([a-z][a-z0-9-]+)["'`]\s*:/g,
	/(?:args\[0\]|sub|cmd)\s*===\s*["'`]([a-z][a-z0-9-]+)["'`]/g,
	/sub\s*=\s*args\[0\];[\s\S]{0,500}?["'`]([a-z][a-z0-9-]+)["'`]/g,
];

// Help/control flow stringleri — drift olarak sayilmaz.
const CONTROL_KEYWORDS = new Set([
	"help",
	"--help",
	"-h",
	"-v",
	"-y",
	"--version",
]);

// Parser tarafinda flag olarak gozuken literal'leri yakala.
// Sadece arg-parsing context'leri: args.includes / args[i] === / a === / case
// Bu sayede static lookup tablolarinin (completion.js gibi) ham flag listesi
// detector'a girmez.
const FLAG_PARSING_PATTERNS = [
	/args\.includes\s*\(\s*["'`](--[a-z][a-z0-9-]+)["'`]\s*\)/g,
	/args\[\w+\]\s*===?\s*["'`](--[a-z][a-z0-9-]+)["'`]/g,
	/\b[a-z_]\s*===?\s*["'`](--[a-z][a-z0-9-]+)["'`]/g,
	/case\s+["'`](--[a-z][a-z0-9-]+)["'`]\s*:/g,
];

function extractParserSubcommands(source) {
	const subs = new Set();
	for (const re of SUBCOMMAND_PATTERNS) {
		// Yeni regex instance — global state paylasimini onle
		const r = new RegExp(re.source, re.flags);
		for (const m of source.matchAll(r)) {
			if (m[1] && !CONTROL_KEYWORDS.has(m[1])) subs.add(m[1]);
		}
	}
	return subs;
}

function extractParserFlags(source) {
	const flags = new Set();
	for (const re of FLAG_PARSING_PATTERNS) {
		const r = new RegExp(re.source, re.flags);
		for (const m of source.matchAll(r)) {
			if (m[1] && !CONTROL_KEYWORDS.has(m[1])) flags.add(m[1]);
		}
	}
	return flags;
}

/**
 * Help govdesini bul: dosyadaki tum `console.log(...)` cagrisi argumanlarini
 * (string/template literal) birlestir. Bu yaklasim:
 *   - showHelp, showAgentHelp gibi farkli helper adlandirmalarina dayanmaz
 *   - Ayni dosyada birden fazla export (commit.js'te runCommit+runChangelog
 *     gibi) varsa hepsinin help'ini kapsar
 *   - False-positive surfance dusuk cunku sadece "ekrana basilan metin"
 *     dokuman olarak sayilir
 *
 * Sinir: console.log icinde template literal `${...}` interpolation icindeki
 * degerler captures edilmez (regex'in bilebilecegi seviye). Pratik etkisi yok.
 */
function extractHelpBody(source) {
	const parts = [];
	// console.log(...) — tum argumanlari yakala (multi-line dahil)
	const callRe = /console\.(?:log|error|warn|info)\s*\(([\s\S]*?)\)\s*;/g;
	for (const m of source.matchAll(callRe)) {
		const args = m[1];
		// "..." / '...' / `...` literal'lerini al
		for (const s of args.matchAll(/(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g)) {
			parts.push(s[2]);
		}
	}
	// Hicbir console.log yoksa fallback: dosyanin tamami
	if (parts.length === 0) return source;
	return parts.join("\n");
}

/**
 * Tek bir komut dosyasinda drift tespit et.
 *
 * @param {string} filePath - lib/commands/<name>.js
 * @param {object} [opts]
 * @param {Set<string>} [opts.allowSubs] - drift sayilmayacak subcommand id'leri
 * @param {Set<string>} [opts.allowFlags] - drift sayilmayacak flag'ler
 * @returns {{ missingSubs: string[], missingFlags: string[] }}
 */
export function detectDrift(filePath, opts = {}) {
	const source = readFileSync(filePath, "utf-8");
	const parserSubs = extractParserSubcommands(source);
	const parserFlags = extractParserFlags(source);
	const helpBody = extractHelpBody(source);

	const allowSubs = opts.allowSubs || new Set();
	const allowFlags = opts.allowFlags || new Set();

	const missingSubs = [...parserSubs]
		.filter((s) => !allowSubs.has(s))
		.filter((s) => !helpBody.includes(s))
		.sort();

	const missingFlags = [...parserFlags]
		.filter((f) => !allowFlags.has(f))
		.filter((f) => !helpBody.includes(f))
		.sort();

	return { missingSubs, missingFlags };
}

/**
 * Allowlist dosyasini oku. Format:
 * {
 *   "<filename>.js": {
 *     "subs": ["json", "true"],
 *     "flags": ["--internal-debug"]
 *   }
 * }
 */
export function loadAllowlist(allowlistPath) {
	if (!existsSync(allowlistPath)) return {};
	try {
		return JSON.parse(readFileSync(allowlistPath, "utf-8"));
	} catch {
		return {};
	}
}

/**
 * Birden fazla komut dosyasini denetle.
 *
 * @param {string[]} filePaths
 * @param {object} [opts]
 * @param {string} [opts.allowlistPath]
 * @returns {Array<{ file: string, missingSubs: string[], missingFlags: string[] }>}
 */
export function auditFiles(filePaths, opts = {}) {
	const allowlist = opts.allowlistPath ? loadAllowlist(opts.allowlistPath) : {};
	const results = [];
	for (const filePath of filePaths) {
		const fileName = filePath.split("/").pop();
		const entry = allowlist[fileName] || {};
		const allowSubs = new Set(entry.subs || []);
		const allowFlags = new Set(entry.flags || []);
		const drift = detectDrift(filePath, { allowSubs, allowFlags });
		if (drift.missingSubs.length > 0 || drift.missingFlags.length > 0) {
			results.push({ file: fileName, ...drift });
		}
	}
	return results;
}
