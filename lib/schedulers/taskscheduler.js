// Windows Task Scheduler backend.
//
// Creates a scheduled task via the `schtasks` Windows built-in CLI.
// API: the same shape as launchd/systemd (id, platform, isAvailable, install,
// uninstall, isInstalled, describe).

import { execFileSync, spawnSync } from "node:child_process";
import { isWindows } from "../platform.js";

const TASK_PREFIX = "Badi\\";

function schtasksAvailable() {
	if (!isWindows) return false;
	try {
		execFileSync("schtasks", ["/?"], { stdio: "ignore" });
		return true;
	} catch {
		return false;
	}
}

/**
 * intervalSeconds (seconds) -> schtasks /SC arguments.
 * - <60: smallest unit is 1 minute; round up to 1 minute instead of warning
 * - 60-3599: MINUTE
 * - 3600-86399: HOURLY
 * - 86400+: DAILY
 */
function intervalToSchtasksFlags(intervalSeconds) {
	const sec = Math.max(60, intervalSeconds);
	if (sec >= 86400) {
		return ["/SC", "DAILY"];
	}
	if (sec >= 3600) {
		const hours = Math.floor(sec / 3600);
		return ["/SC", "HOURLY", "/MO", String(hours)];
	}
	const minutes = Math.max(1, Math.floor(sec / 60));
	return ["/SC", "MINUTE", "/MO", String(minutes)];
}

function quoteCommand(cmd, args) {
	// Windows command line: a single string. Paths may contain spaces.
	const parts = [cmd, ...args].map((p) => (p.includes(" ") ? `"${p}"` : p));
	return parts.join(" ");
}

export default {
	id: "taskscheduler",
	platform: "win32",

	isAvailable() {
		return schtasksAvailable();
	},

	install({ name, cmd, args, cwd, intervalSeconds }, { dryRun } = {}) {
		const taskName = `${TASK_PREFIX}${name}`;
		// set cwd with `cd /d <cwd> && <cmd> <args>`.
		const cmdLine = cwd
			? `cmd /c cd /d "${cwd}" && ${quoteCommand(cmd, args)}`
			: quoteCommand(cmd, args);

		const schtasksArgs = [
			"/Create",
			"/TN",
			taskName,
			"/TR",
			cmdLine,
			"/F",
			...intervalToSchtasksFlags(intervalSeconds),
		];

		if (dryRun) {
			return { plan: taskName, content: `schtasks ${schtasksArgs.join(" ")}` };
		}

		spawnSync("schtasks", schtasksArgs, { stdio: "ignore" });
		return { plan: taskName };
	},

	uninstall({ name }, { dryRun } = {}) {
		const taskName = `${TASK_PREFIX}${name}`;
		const existed = this.isInstalled({ name });
		if (dryRun) return { plan: taskName, existed };
		if (!existed) return { plan: taskName, existed: false };
		spawnSync("schtasks", ["/Delete", "/TN", taskName, "/F"], {
			stdio: "ignore",
		});
		return { plan: taskName, existed: true };
	},

	isInstalled({ name }) {
		if (!schtasksAvailable()) return false;
		try {
			execFileSync("schtasks", ["/Query", "/TN", `${TASK_PREFIX}${name}`], {
				stdio: "ignore",
			});
			return true;
		} catch {
			return false;
		}
	},

	describe({ name }) {
		if (!this.isInstalled({ name })) return null;
		try {
			const out = execFileSync(
				"schtasks",
				["/Query", "/TN", `${TASK_PREFIX}${name}`, "/FO", "LIST", "/V"],
				{ encoding: "utf-8" },
			);
			return {
				scheduler: "taskscheduler",
				task: `${TASK_PREFIX}${name}`,
				raw: out,
			};
		} catch {
			return null;
		}
	},
};
