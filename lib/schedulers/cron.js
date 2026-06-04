import { spawnSync } from "node:child_process";

const MARKER_PREFIX = "# badi-watcher:";

function readCrontab() {
	const r = spawnSync("crontab", ["-l"], { encoding: "utf-8" });
	if (r.status !== 0) return "";
	return r.stdout || "";
}

function writeCrontab(content) {
	const r = spawnSync("crontab", ["-"], {
		input: content,
		encoding: "utf-8",
	});
	if (r.status !== 0) {
		throw new Error(`crontab write failed: ${r.stderr?.trim()}`);
	}
}

function intervalToCron(intervalSeconds) {
	if (intervalSeconds >= 86400) return "0 0 * * *"; // daily
	if (intervalSeconds >= 3600) {
		const h = Math.round(intervalSeconds / 3600);
		return `0 */${h} * * *`;
	}
	const m = Math.max(1, Math.round(intervalSeconds / 60));
	return `*/${m} * * * *`;
}

function removeMarkedLines(crontab, name) {
	const marker = `${MARKER_PREFIX}${name}`;
	const lines = crontab.split("\n");
	const kept = [];
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].includes(marker)) {
			// we also clean up the watcher line + the marker two lines below, ahead of time
			continue;
		}
		// If the previous line is a marker, this line is the command itself or its continuation.
		if (i > 0 && lines[i - 1].includes(marker)) {
			continue;
		}
		kept.push(lines[i]);
	}
	return kept.join("\n");
}

function cronAvailable() {
	const r = spawnSync("crontab", ["-l"], { stdio: "ignore" });
	return r.status === 0 || r.status === 1; // 1 = empty but command present
}

export default {
	id: "cron",
	platform: "*",

	isAvailable() {
		return cronAvailable();
	},

	install({ name, cmd, args, cwd, intervalSeconds }, { dryRun } = {}) {
		const cronExpr = intervalToCron(intervalSeconds);
		const cdPart = cwd ? `cd ${cwd} && ` : "";
		const cmdPart = [cmd, ...args]
			.map((a) => (a.includes(" ") ? `"${a}"` : a))
			.join(" ");
		const line = `${cronExpr} ${cdPart}${cmdPart} >> /tmp/badi-watcher-${name}.log 2>&1`;
		const marker = `${MARKER_PREFIX}${name}`;

		if (dryRun) return { plan: { line, marker } };

		const existing = readCrontab();
		const cleaned = removeMarkedLines(existing, name);
		const updated = `${cleaned.trimEnd()}\n${marker}\n${line}\n`;
		writeCrontab(updated);
		return { plan: { line, marker } };
	},

	uninstall({ name }, { dryRun } = {}) {
		if (dryRun) return { plan: { marker: `${MARKER_PREFIX}${name}` } };
		const existing = readCrontab();
		const cleaned = removeMarkedLines(existing, name);
		if (cleaned === existing)
			return { existed: false, plan: { marker: `${MARKER_PREFIX}${name}` } };
		writeCrontab(cleaned);
		return { existed: true, plan: { marker: `${MARKER_PREFIX}${name}` } };
	},

	isInstalled({ name }) {
		const c = readCrontab();
		return c.includes(`${MARKER_PREFIX}${name}`);
	},

	describe({ name }) {
		const c = readCrontab();
		const marker = `${MARKER_PREFIX}${name}`;
		const idx = c.indexOf(marker);
		if (idx === -1) return null;
		const after = c.slice(idx).split("\n").slice(0, 2).join("\n");
		return { scheduler: "cron", entry: after };
	},
};
