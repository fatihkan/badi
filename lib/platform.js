// Badi platform capabilities API.
//
// Tek noktadan OS tespiti + uygun komut/kanal secimi. macOS, Linux, Windows
// (native + WSL + Git Bash) destegi.
//
// Hicbir disa bagimlilik. Pure Node.js.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { release } from "node:os";

export const platform = process.platform; // 'darwin' | 'linux' | 'win32'
export const isMac = platform === "darwin";
export const isLinux = platform === "linux";
export const isWindows = platform === "win32";

/**
 * WSL altinda Linux gibi davraniliyor mu?
 * Microsoft WSL kernel marker'i `/proc/version` icinde "microsoft" gecirir.
 */
export function isWsl() {
	if (!isLinux) return false;
	try {
		const v = readFileSync("/proc/version", "utf-8").toLowerCase();
		return v.includes("microsoft") || v.includes("wsl");
	} catch {
		return false;
	}
}

/**
 * Komut PATH'te mevcut mu? Pure PATH probe — shell gerektirmez.
 * Windows'ta .exe/.cmd/.bat uzantilarini kontrol eder.
 */
export function commandExists(cmd) {
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
 * Bash mevcut mu? Windows'ta WSL + Git Bash + native bash hepsini sayar.
 */
export function bashAvailable() {
	if (!isWindows) return commandExists("bash");
	// Windows: bash, sh, veya wsl
	return (
		commandExists("bash") ||
		commandExists("sh") ||
		commandExists("wsl") ||
		existsSync("C:\\Program Files\\Git\\bin\\bash.exe") ||
		existsSync("C:\\Program Files (x86)\\Git\\bin\\bash.exe")
	);
}

/**
 * Dosya/URL acmak icin platforma uygun komut + arg listesi.
 * Donus: { cmd: string, args: string[] } — execFileSync(cmd, [...args, target]) ile cagrilir.
 */
export function getOpener() {
	if (isMac) return { cmd: "open", args: [] };
	if (isWindows) {
		// `start` cmd built-in, ilk arg pencere basligi (bos string); ardindan path/URL.
		return { cmd: "cmd", args: ["/c", "start", ""] };
	}
	return { cmd: "xdg-open", args: [] };
}

/**
 * Aktif scheduler backend ismi: 'launchd' | 'systemd' | 'taskscheduler' | null
 */
export function getSchedulerKind() {
	if (isMac) return "launchd";
	if (isLinux) return "systemd";
	if (isWindows) return "taskscheduler";
	return null;
}

/**
 * OS surum ozeti — `badi doctor` ciktisi icin tek satir.
 */
export function osSummary() {
	const kernel = release();
	if (isMac) return `macOS (${kernel})`;
	if (isWindows) return `Windows (${kernel})`;
	if (isLinux) {
		const wsl = isWsl() ? " [WSL]" : "";
		return `Linux (${kernel})${wsl}`;
	}
	return `${platform} (${kernel})`;
}

/**
 * Konsol UTF-8 cikti destegi var mi? Windows cmd default cp1252.
 * Heuristik: terminal env veya chcp ciktisi.
 */
export function utf8Console() {
	if (!isWindows) return true;
	// PowerShell + Windows Terminal genelde UTF-8 destekler
	if (process.env.WT_SESSION) return true;
	if (process.env.TERM_PROGRAM === "vscode") return true;
	// Default cmd: false. Kullanici `chcp 65001` calistirmalidir.
	try {
		const out = execFileSync("chcp", [], { encoding: "utf-8" });
		return out.includes("65001");
	} catch {
		return false;
	}
}

/**
 * Uyari mesaji: Windows'ta UTF-8 yokken Turkce karakter kirilir.
 */
export function utf8Hint() {
	if (utf8Console()) return null;
	return "Windows console UTF-8 degil — Turkce karakterler bozulabilir. `chcp 65001` calistirin veya Windows Terminal kullanin.";
}
