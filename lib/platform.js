// Badi platform capabilities API.
//
// Single-point OS detection + the right command/channel selection. macOS, Linux, Windows
// (native + WSL + Git Bash) support.
//
// No external dependencies. Pure Node.js.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { release } from "node:os";

export const platform = process.platform; // 'darwin' | 'linux' | 'win32'
export const isMac = platform === "darwin";
export const isLinux = platform === "linux";
export const isWindows = platform === "win32";

/**
 * Are we behaving like Linux under WSL?
 * The Microsoft WSL kernel marker puts "microsoft" inside `/proc/version`.
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
 * Is the command available on PATH? Pure PATH probe — no shell required.
 * Checks .exe/.cmd/.bat extensions on Windows.
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
 * Is Bash available? On Windows this counts WSL + Git Bash + native bash.
 */
export function bashAvailable() {
	if (!isWindows) return commandExists("bash");
	// Windows: bash, sh, or wsl
	return (
		commandExists("bash") ||
		commandExists("sh") ||
		commandExists("wsl") ||
		existsSync("C:\\Program Files\\Git\\bin\\bash.exe") ||
		existsSync("C:\\Program Files (x86)\\Git\\bin\\bash.exe")
	);
}

/**
 * The platform-appropriate command + arg list for opening a file/URL.
 * Returns: { cmd: string, args: string[] } — called via execFileSync(cmd, [...args, target]).
 */
export function getOpener() {
	if (isMac) return { cmd: "open", args: [] };
	if (isWindows) {
		// `start` is a cmd built-in; the first arg is the window title (empty string), then the path/URL.
		return { cmd: "cmd", args: ["/c", "start", ""] };
	}
	return { cmd: "xdg-open", args: [] };
}

/**
 * Active scheduler backend name: 'launchd' | 'systemd' | 'taskscheduler' | null
 */
export function getSchedulerKind() {
	if (isMac) return "launchd";
	if (isLinux) return "systemd";
	if (isWindows) return "taskscheduler";
	return null;
}

/**
 * OS version summary — a single line for `badi doctor` output.
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
 * Does the console support UTF-8 output? Windows cmd defaults to cp1252.
 * Heuristic: the terminal env or chcp output.
 */
export function utf8Console() {
	if (!isWindows) return true;
	// PowerShell + Windows Terminal generally support UTF-8
	if (process.env.WT_SESSION) return true;
	if (process.env.TERM_PROGRAM === "vscode") return true;
	// Default cmd: false. The user should run `chcp 65001`.
	try {
		const out = execFileSync("chcp", [], { encoding: "utf-8" });
		return out.includes("65001");
	} catch {
		return false;
	}
}

/**
 * Warning message: without UTF-8 on Windows, non-ASCII characters get garbled.
 */
export function utf8Hint() {
	if (utf8Console()) return null;
	return "Windows console is not UTF-8 — characters may be garbled. Run `chcp 65001` or use Windows Terminal.";
}
