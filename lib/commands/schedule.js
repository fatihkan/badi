import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { chalk } from "../cli.js";

export const DAY_MAP = {
	mon: 1,
	tue: 2,
	wed: 3,
	thu: 4,
	fri: 5,
	sat: 6,
	sun: 0,
};
export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function loadSchedules() {
	const file = join(homedir(), ".config", "badi", "schedules.json");
	try {
		if (existsSync(file)) return JSON.parse(readFileSync(file, "utf-8"));
	} catch {
		// Corrupt file
	}
	return { version: 1, schedules: [] };
}

export function saveSchedules(data) {
	const dir = join(homedir(), ".config", "badi");
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, "schedules.json"), JSON.stringify(data, null, 2));
}

export function parseTimeSpec(timeStr, daysStr) {
	let hours = 9;
	let minutes = 0;
	let days = null; // null = every day

	// Parse time
	const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
	if (timeMatch) {
		hours = Number.parseInt(timeMatch[1], 10);
		minutes = Number.parseInt(timeMatch[2], 10);
		if (hours > 23 || minutes > 59) {
			console.error(
				chalk.red(
					`Invalid time: ${hours}:${String(minutes).padStart(2, "0")} (must be within 0-23:0-59)`,
				),
			);
			process.exit(1);
		}
	}

	// Parse days — "mon-fri", "mon,wed,fri", "daily", or a single day
	if (daysStr) {
		const lower = daysStr.toLowerCase();
		if (lower === "daily") {
			days = null;
		} else if (lower.includes("-")) {
			const [start, end] = lower.split("-");
			const startDay = DAY_MAP[start] ?? 1;
			const endDay = DAY_MAP[end] ?? 5;
			days = [];
			if (endDay < startDay) {
				for (let d = startDay; d <= 6; d++) days.push(d);
				for (let d = 0; d <= endDay; d++) days.push(d);
			} else {
				for (let d = startDay; d <= endDay; d++) days.push(d);
			}
		} else {
			days = lower
				.split(",")
				.map((d) => DAY_MAP[d.trim()] ?? -1)
				.filter((d) => d >= 0);
		}
	}

	// If timeStr contains a day name
	if (!daysStr) {
		for (const [name, idx] of Object.entries(DAY_MAP)) {
			if (timeStr.toLowerCase().includes(name)) {
				days = [idx];
				break;
			}
		}
	}

	return { hours, minutes, days };
}

export function isScheduleDue(schedule, now) {
	const { hours, minutes, days } = schedule;
	const nowDay = now.getDay();
	const nowHour = now.getHours();
	const nowMin = now.getMinutes();

	// Day check
	if (days && !days.includes(nowDay)) return false;

	// Time-window check (60min tolerance)
	const scheduleMin = hours * 60 + minutes;
	const nowMinTotal = nowHour * 60 + nowMin;
	return nowMinTotal >= scheduleMin && nowMinTotal < scheduleMin + 60;
}

export function runSchedule(args) {
	const sub = args[0];

	if (!sub || sub === "--help" || sub === "-h") {
		console.log(chalk.bold("Scheduled Reminders:"));
		console.log("");
		console.log(
			`  badi schedule add [command] --at [time] --days [days]  ${chalk.dim("Add a reminder")}`,
		);
		console.log(
			`  badi schedule list                                     ${chalk.dim("List")}`,
		);
		console.log(
			`  badi schedule remove [id]                              ${chalk.dim("Remove")}`,
		);
		console.log(
			`  badi schedule check                                    ${chalk.dim("Show due reminders")}`,
		);
		console.log("");
		console.log(chalk.bold("Examples:"));
		console.log(
			'  badi schedule add "icerik basla" --at "09:00" --days "mon-fri"',
		);
		console.log('  badi schedule add "wrap-up" --at "18:00"');
		console.log('  badi schedule add "icerik plan" --at "sun 20:00"');
		console.log("");
		console.log(chalk.bold("Shell Integration:"));
		console.log(chalk.dim("  Add to ~/.bashrc or ~/.zshrc:"));
		console.log(
			"  command -v badi &>/dev/null && badi schedule check 2>/dev/null",
		);
		return;
	}

	if (sub === "add") {
		const cmdParts = [];
		let atTime = "09:00";
		let daysSpec = null;
		const addArgs = args.slice(1);

		for (let i = 0; i < addArgs.length; i++) {
			if (addArgs[i] === "--at") {
				atTime = addArgs[++i] || "09:00";
			} else if (addArgs[i] === "--days") {
				daysSpec = addArgs[++i] || "daily";
			} else if (!addArgs[i].startsWith("--")) {
				cmdParts.push(addArgs[i]);
			}
		}

		const cmdStr = cmdParts.join(" ");
		if (!cmdStr) {
			console.error(
				chalk.red(
					'Specify a command: badi schedule add "command" --at "09:00"',
				),
			);
			process.exit(1);
		}

		const { hours, minutes, days } = parseTimeSpec(atTime, daysSpec);
		const data = loadSchedules();
		const maxId =
			data.schedules.length > 0
				? Math.max(...data.schedules.map((s) => s.id))
				: 0;

		const newSchedule = {
			id: maxId + 1,
			command: cmdStr.startsWith("badi ") ? cmdStr : `badi ${cmdStr}`,
			hours,
			minutes,
			days,
			active: true,
			createdAt: new Date().toISOString(),
			lastChecked: null,
		};

		data.schedules.push(newSchedule);
		saveSchedules(data);

		const timeLabel = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
		const daysLabel = days ? days.map((d) => DAY_NAMES[d]).join(", ") : "Daily";

		console.log(chalk.bold.green("Reminder created!"));
		console.log(`  ID:      ${chalk.cyan(newSchedule.id)}`);
		console.log(`  Command: ${chalk.cyan(newSchedule.command)}`);
		console.log(`  Time:    ${chalk.cyan(timeLabel)}`);
		console.log(`  Days:    ${chalk.cyan(daysLabel)}`);
		return;
	}

	if (sub === "list") {
		const data = loadSchedules();
		if (data.schedules.length === 0) {
			console.log(chalk.dim("No reminders yet."));
			console.log(chalk.dim('Add: badi schedule add "command" --at "09:00"'));
			return;
		}

		console.log(chalk.bold("Scheduled Reminders:"));
		console.log("");
		console.log(
			`  ${chalk.dim("ID".padEnd(5))}${chalk.dim("Command".padEnd(30))}${chalk.dim("Time".padEnd(8))}${chalk.dim("Days".padEnd(20))}${chalk.dim("Status")}`,
		);
		console.log(chalk.dim(`  ${"─".repeat(70)}`));

		for (const s of data.schedules) {
			const timeLabel = `${String(s.hours).padStart(2, "0")}:${String(s.minutes).padStart(2, "0")}`;
			const daysLabel = s.days
				? s.days.map((d) => DAY_NAMES[d]).join(",")
				: "Daily";
			const status = s.active ? chalk.green("Active") : chalk.dim("Inactive");
			console.log(
				`  ${String(s.id).padEnd(5)}${(s.command || "").substring(0, 28).padEnd(30)}${timeLabel.padEnd(8)}${daysLabel.padEnd(20)}${status}`,
			);
		}
		return;
	}

	if (sub === "remove") {
		const removeId = Number.parseInt(args[1], 10);
		if (!removeId) {
			console.error(chalk.red("Specify the reminder ID to remove."));
			process.exit(1);
		}
		const data = loadSchedules();
		const idx = data.schedules.findIndex((s) => s.id === removeId);
		if (idx === -1) {
			console.error(chalk.red(`Reminder not found: ID ${removeId}`));
			process.exit(1);
		}
		const removed = data.schedules.splice(idx, 1)[0];
		saveSchedules(data);
		console.log(
			chalk.green(`Reminder removed: ${removed.command} (ID: ${removeId})`),
		);
		return;
	}

	if (sub === "check") {
		const data = loadSchedules();
		const now = new Date();
		let anyDue = false;

		for (const s of data.schedules) {
			if (!s.active) continue;
			if (!isScheduleDue(s, now)) continue;

			// Don't show again within the same hour
			if (s.lastChecked) {
				const lastCheck = new Date(s.lastChecked);
				if (now.getTime() - lastCheck.getTime() < 3600000) continue;
			}

			if (!anyDue) {
				console.log(chalk.bold.yellow("Badi Reminder:"));
				console.log("");
			}
			anyDue = true;
			const timeLabel = `${String(s.hours).padStart(2, "0")}:${String(s.minutes).padStart(2, "0")}`;
			console.log(
				`  ${chalk.cyan(">")} ${s.command} ${chalk.dim(`(${timeLabel})`)}`,
			);
			s.lastChecked = now.toISOString();
		}

		if (anyDue) {
			saveSchedules(data);
			console.log("");
		}
		return;
	}

	console.error(chalk.red(`Unknown schedule command: ${sub}`));
	console.log("Usage: badi schedule [add|list|remove|check]");
	process.exit(1);
}
