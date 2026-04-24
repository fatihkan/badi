import { spawnSync } from "node:child_process";

/**
 * Shell watcher: runs an arbitrary shell command and evaluates its result.
 *
 * Accepted check shape:
 *   { type: "shell", command: "npm test --silent",
 *     alert_on: "exit-nonzero" | "stdout-match:<regex>" | "stderr-match:<regex>",
 *     timeout: "60s" | number-in-seconds }
 */

function parseTimeout(t) {
	if (!t) return 60_000;
	if (typeof t === "number") return t * 1000;
	const m = t.match(/^(\d+)(s|m)?$/);
	if (!m) return 60_000;
	const n = Number.parseInt(m[1], 10);
	return m[2] === "m" ? n * 60_000 : n * 1000;
}

export default function runShellCheck(check, { cwd }) {
	if (!check.command) return { pass: false, message: "command bos" };
	const timeoutMs = parseTimeout(check.timeout);
	const alertOn = check.alert_on || "exit-nonzero";
	const res = spawnSync("bash", ["-c", check.command], {
		cwd,
		encoding: "utf-8",
		timeout: timeoutMs,
	});

	if (res.error && res.error.code === "ETIMEDOUT") {
		return {
			pass: false,
			message: `Timeout (${timeoutMs}ms) sonra oldurulmustur`,
		};
	}
	const stdout = (res.stdout || "").trim();
	const stderr = (res.stderr || "").trim();

	if (alertOn === "exit-nonzero") {
		if (res.status === 0) {
			return { pass: true, message: "OK (exit 0)" };
		}
		return {
			pass: false,
			message: `Exit ${res.status}`,
			details: [stderr || stdout].filter(Boolean).slice(0, 1),
		};
	}
	if (alertOn.startsWith("stdout-match:")) {
		const pat = alertOn.slice("stdout-match:".length);
		const re = new RegExp(pat, "i");
		const matched = re.test(stdout);
		return matched
			? {
					pass: false,
					message: `stdout eslesmesi /${pat}/`,
					details: [stdout.split("\n").find((l) => re.test(l))],
				}
			: { pass: true, message: "OK" };
	}
	if (alertOn.startsWith("stderr-match:")) {
		const pat = alertOn.slice("stderr-match:".length);
		const re = new RegExp(pat, "i");
		const matched = re.test(stderr);
		return matched
			? {
					pass: false,
					message: `stderr eslesmesi /${pat}/`,
					details: [stderr.split("\n").find((l) => re.test(l))],
				}
			: { pass: true, message: "OK" };
	}
	return { pass: false, message: `Bilinmeyen alert_on: ${alertOn}` };
}
