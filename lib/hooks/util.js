// Badi hook utility module — cross-platform replacement for bash hooks.
//
// Sifir disa bagimlilik. JSON stdin okur, log dizinleri olusturur,
// proje koku tespit eder. Tum hook'lar bu modulu paylasir.

import { execFileSync } from "node:child_process";
import {
	appendFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";

/**
 * stdin'den JSON oku — Claude Code hook input.
 * Hata varsa bos obje doner; hook'lar her zaman exit 0 yapmali.
 */
export async function readStdinJson() {
	let raw = "";
	for await (const chunk of process.stdin) {
		raw += chunk;
	}
	if (!raw.trim()) return {};
	try {
		return JSON.parse(raw);
	} catch {
		return {};
	}
}

/**
 * Tarih damgasi. Format: '2026-05-10 14:30:45'
 */
export function timestamp() {
	const d = new Date();
	const pad = (n) => String(n).padStart(2, "0");
	return (
		`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
		`${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
	);
}

/**
 * UTC ISO timestamp: '2026-05-10T14:30:45Z'
 */
export function isoTimestamp() {
	return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

/**
 * Proje kokunu tespit et. git rev-parse --show-toplevel; basarisizsa cwd.
 */
export function projectRoot() {
	try {
		return execFileSync("git", ["rev-parse", "--show-toplevel"], {
			encoding: "utf-8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
	} catch {
		return process.cwd();
	}
}

/**
 * Mevcut git branch (HEAD). Yoksa bos string.
 */
export function currentBranch() {
	try {
		return execFileSync("git", ["branch", "--show-current"], {
			encoding: "utf-8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
	} catch {
		return "";
	}
}

/**
 * Log dizini ve dosyasi yolunu dondurur, dizin yoksa olusturur.
 */
export function logPath(filename) {
	const dir = join(projectRoot(), ".claude", "logs");
	mkdirSync(dir, { recursive: true });
	return join(dir, filename);
}

/**
 * Log dosyasina satir ekle (otomatik newline). Hata olursa sessizce gec.
 */
export function appendLog(file, line) {
	try {
		mkdirSync(dirname(file), { recursive: true });
		appendFileSync(file, `${line}\n`, "utf-8");
	} catch {
		/* no-op */
	}
}

/**
 * Incident log icin standart format:
 * `- \`<timestamp>\` | <prefix> | <severity> | <message>`
 */
export function incidentLine(prefix, severity, message) {
	return `- \`${timestamp()}\` | ${prefix} | ${severity} | ${message}`;
}

/**
 * Decision JSON cevabi yaz (stdout) — Claude Code'a gonderilir.
 *
 * { decision: "block" | "allow", reason: string }
 */
export function writeDecision(decision, reason) {
	process.stdout.write(`${JSON.stringify({ decision, reason })}\n`);
}

/**
 * UserPromptSubmit hook output: additionalContext yaz.
 */
export function writeContextInjection(text) {
	process.stdout.write(
		`${JSON.stringify({
			hookSpecificOutput: {
				hookEventName: "UserPromptSubmit",
				additionalContext: text,
			},
		})}\n`,
	);
}

/**
 * Dosya satir sayisini dondur. Yoksa 0.
 */
export function lineCount(file) {
	if (!existsSync(file)) return 0;
	try {
		return readFileSync(file, "utf-8").split("\n").length;
	} catch {
		return 0;
	}
}

/**
 * Bir log dosyasini son N satirla kirp (in-place).
 */
export function truncateLog(file, maxLines, keepLines) {
	if (!existsSync(file)) return false;
	try {
		const content = readFileSync(file, "utf-8");
		const lines = content.split("\n");
		if (lines.length <= maxLines) return false;
		const kept = lines.slice(-keepLines).join("\n");
		writeFileSync(file, kept, "utf-8");
		return true;
	} catch {
		return false;
	}
}

/**
 * String'in ilk N karakterini al + newline'lari space yap.
 */
export function shorten(str, max = 200) {
	return String(str || "")
		.replace(/[\r\n]+/g, " ")
		.slice(0, max);
}

/**
 * Dosyayi 7+ gun once degistirildiyse sil. mtime tabanli.
 */
export function olderThan(filePath, days) {
	try {
		const ms = Date.now() - statSync(filePath).mtimeMs;
		return ms > days * 86400 * 1000;
	} catch {
		return false;
	}
}

/**
 * Komut PATH'te mi? execFileSync ile probe.
 */
export function commandAvailable(cmd) {
	try {
		const probe = process.platform === "win32" ? "where" : "command";
		const args = process.platform === "win32" ? [cmd] : ["-v", cmd];
		execFileSync(probe, args, { stdio: "ignore" });
		return true;
	} catch {
		return false;
	}
}
