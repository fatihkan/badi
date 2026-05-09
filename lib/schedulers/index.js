import cron from "./cron.js";
import launchd from "./launchd.js";
import systemd from "./systemd.js";
import taskscheduler from "./taskscheduler.js";

/**
 * Scheduler registry. Each adapter exports:
 *   id, platform, isAvailable(),
 *   install(opts, {dryRun}), uninstall(opts, {dryRun}),
 *   isInstalled(opts), describe(opts)
 *
 * install() opts shape:
 *   { name, cmd, args, cwd, intervalSeconds, logDir }
 */
export const SCHEDULERS = [launchd, systemd, taskscheduler, cron];

/**
 * Pick the best available scheduler for the current platform.
 * Order: platform-specific native first, cron as universal fallback.
 */
export function pickScheduler(preferred = null) {
	if (preferred) {
		const s = SCHEDULERS.find((x) => x.id === preferred);
		if (!s) throw new Error(`Bilinmeyen scheduler: ${preferred}`);
		if (!s.isAvailable())
			throw new Error(`${preferred} bu sistemde kullanilabilir degil`);
		return s;
	}
	for (const s of SCHEDULERS) {
		if (s.isAvailable()) return s;
	}
	throw new Error(
		"Hic scheduler kullanilabilir degil (launchd/systemd/taskscheduler/cron yok)",
	);
}

export function findInstalled(name) {
	const hits = [];
	for (const s of SCHEDULERS) {
		if (!s.isAvailable()) continue;
		try {
			if (s.isInstalled({ name })) hits.push(s);
		} catch {}
	}
	return hits;
}

export { cron, launchd, systemd, taskscheduler };
