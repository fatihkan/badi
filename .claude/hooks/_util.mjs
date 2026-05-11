// Badi hook utility module — cross-platform replacement for bash hooks.
//
// Bu dosya .claude/hooks/_util.mjs olarak hook dizinine yerlestirildi
// cunku npm-installed user'larda hook'lar `<proje>/.claude/hooks/X.mjs`
// konumunda olur ve `lib/hooks/util.js`'e ulasamaz (paket node_modules'ta).
// Self-contained tutuldu: import yolu './_util.mjs' her zaman cozumlenir.
//
// Sifir disa bagimlilik. JSON stdin okur, log dizinleri olusturur,
// proje koku tespit eder. Tum hook'lar bu modulu paylasir.

import { execFileSync } from "node:child_process";
import {
	appendFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	renameSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
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

// Module-level cache: hook process tek seferlik calisir, projectRoot da
// degismez. Birden fazla logPath()/projectRoot() cagrisinda git spawn'i
// tekrarlamamak icin (review bulgu #3).
let _projectRootCache = null;

/**
 * Proje kokunu tespit et. git rev-parse --show-toplevel; basarisizsa cwd.
 * Memoize edilir.
 */
export function projectRoot() {
	if (_projectRootCache !== null) return _projectRootCache;
	try {
		_projectRootCache = execFileSync("git", ["rev-parse", "--show-toplevel"], {
			encoding: "utf-8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
	} catch {
		_projectRootCache = process.cwd();
	}
	return _projectRootCache;
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
 * CRLF/LF normalize ederek son satir bos ise sayilmaz (bulgu #5).
 */
export function lineCount(file) {
	if (!existsSync(file)) return 0;
	try {
		const content = readFileSync(file, "utf-8");
		if (content.length === 0) return 0;
		const matches = content.match(/\n/g);
		const newlines = matches ? matches.length : 0;
		// Son karakter \n ise satir sayisi = \n sayisi
		// Aksi halde son satir +1
		return content.endsWith("\n") ? newlines : newlines + 1;
	} catch {
		return 0;
	}
}

/**
 * Bir log dosyasini son N satirla kirp. Atomik: tmp dosyaya yaz, rename.
 * Crash sirasinda kismi yazma olmaz (bulgu #4).
 */
export function truncateLog(file, maxLines, keepLines) {
	if (!existsSync(file)) return false;
	try {
		const content = readFileSync(file, "utf-8");
		const lines = content.split("\n");
		if (lines.length <= maxLines) return false;
		const kept = lines.slice(-keepLines).join("\n");
		const tmp = `${file}.tmp.${process.pid}`;
		writeFileSync(tmp, kept, "utf-8");
		renameSync(tmp, file);
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
 * Dosyayi N+ gun once degistirildiyse true. mtime tabanli.
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
 * Komut PATH'te mi? Pure PATH probe — shell built-in 'command -v' yerine
 * (Linux'ta executable degil, bulgu #2).
 *
 * Windows: PATHEXT (.exe/.cmd/.bat) + PATH; Unix: PATH.
 * lib/platform.js commandExists ile aynidir.
 */
export function commandAvailable(cmd) {
	const isWindows = process.platform === "win32";
	const PATH = process.env.PATH || process.env.Path || "";
	const sep = isWindows ? ";" : ":";
	const exts = isWindows
		? (process.env.PATHEXT || ".COM;.EXE;.BAT;.CMD").split(";")
		: [""];
	for (const dir of PATH.split(sep)) {
		if (!dir) continue;
		for (const ext of exts) {
			const candidate = `${dir}${isWindows ? "\\" : "/"}${cmd}${ext}`;
			if (existsSync(candidate)) return true;
		}
	}
	return false;
}

/**
 * XDG_CONFIG_HOME-aware config directory. Linux/Mac/Windows hepsinde
 * Standard yol (bulgu #10). Windows'ta env yoksa homedir/.config kullanir.
 */
export function configDir(app) {
	const base = process.env.XDG_CONFIG_HOME || join(homedir(), ".config");
	return join(base, app);
}
