import { closeSync, existsSync, openSync, readSync, statSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Log watcher: tails a log file from the last known offset and checks for
 * new entries (optionally matching a pattern).
 *
 * Accepted check shape:
 *   { type: "log", path: ".claude/logs/failures.log",
 *     alert_on: "new-entry" | "pattern-match:<regex>" }
 *
 * State: { size } — persisted by runner so each run reads only the delta.
 */
export default function runLogCheck(check, { cwd, state }) {
	if (!check.path) return { pass: false, message: "path empty" };
	const p = resolve(cwd, check.path);
	if (!existsSync(p)) {
		state[check.path] = { size: 0 };
		return { pass: true, message: `No log: ${check.path} (first run)` };
	}
	const stat = statSync(p);
	const prev = state[check.path] || { size: 0 };
	const alertOn = check.alert_on || "new-entry";

	// Log rotation detection: size shrank → read from zero
	const start = stat.size < prev.size ? 0 : prev.size;
	const delta = stat.size - start;
	state[check.path] = { size: stat.size };

	if (delta === 0) {
		return { pass: true, message: "OK (no new entries)" };
	}

	let newContent = "";
	if (delta > 0) {
		const buf = Buffer.alloc(Math.min(delta, 1_000_000)); // max 1MB per run
		const fd = openSync(p, "r");
		try {
			readSync(fd, buf, 0, buf.length, start);
		} finally {
			closeSync(fd);
		}
		newContent = buf.toString("utf-8");
	}
	const newLines = newContent.split("\n").filter(Boolean);

	if (alertOn === "new-entry") {
		return {
			pass: false,
			message: `${newLines.length} new lines`,
			details: newLines.slice(-5),
		};
	}
	if (alertOn.startsWith("pattern-match:")) {
		const pat = alertOn.slice("pattern-match:".length);
		const re = new RegExp(pat, "i");
		const matches = newLines.filter((l) => re.test(l));
		return matches.length
			? {
					pass: false,
					message: `${matches.length} lines matched /${pat}/`,
					details: matches.slice(0, 5),
				}
			: {
					pass: true,
					message: `OK (none of the ${newLines.length} new lines matched)`,
				};
	}
	return { pass: false, message: `Unknown alert_on: ${alertOn}` };
}
