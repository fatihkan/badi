import { fetchWithTimeout } from "../../helpers.js";

/**
 * HTTP watcher: GET the URL (SSRF guard via helpers.validateUrl via fetchWithTimeout)
 * and alert on status / latency / body pattern.
 *
 * Accepted check shape:
 *   { type: "http", url: "https://example.com/health",
 *     alert_on: "status-nonok" | "latency>2s" | "body-match:<regex>" | composite (comma-sep) }
 */
function parseLatencyThreshold(spec) {
	const m = spec.match(/^latency>(\d+)(ms|s)?$/);
	if (!m) return null;
	const n = Number.parseInt(m[1], 10);
	return m[2] === "s" || !m[2] ? n * 1000 : n;
}

export default async function runHttpCheck(check) {
	if (!check.url) return { pass: false, message: "url empty" };
	const conditions = (check.alert_on || "status-nonok")
		.split("|")
		.map((s) => s.trim());
	const start = Date.now();
	let res;
	let body = "";
	try {
		res = await fetchWithTimeout(check.url, { timeoutMs: 10000 });
		body = await res.text();
	} catch (e) {
		return { pass: false, message: `Fetch error: ${e.message}` };
	}
	const latency = Date.now() - start;
	const failures = [];

	for (const cond of conditions) {
		if (cond === "status-nonok") {
			if (!res.ok) failures.push(`status ${res.status}`);
		} else if (cond.startsWith("latency>")) {
			const threshold = parseLatencyThreshold(cond);
			if (threshold !== null && latency > threshold) {
				failures.push(`latency ${latency}ms > ${threshold}ms`);
			}
		} else if (cond.startsWith("body-match:")) {
			const pat = cond.slice("body-match:".length);
			const re = new RegExp(pat, "i");
			if (re.test(body)) failures.push(`body /${pat}/ matched`);
		} else if (cond.startsWith("body-miss:")) {
			const pat = cond.slice("body-miss:".length);
			const re = new RegExp(pat, "i");
			if (!re.test(body)) failures.push(`body /${pat}/ not found`);
		} else {
			failures.push(`Unknown alert_on: ${cond}`);
		}
	}

	if (failures.length === 0) {
		return { pass: true, message: `${res.status} in ${latency}ms` };
	}
	return {
		pass: false,
		message: failures.join("; "),
		details: [`HTTP ${res.status} in ${latency}ms`],
	};
}
