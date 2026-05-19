import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { listDirs } from "../../helpers.js";

export function pluginsDir(cwd) {
	return join(cwd || process.cwd(), ".claude", "plugins");
}

export function loadAllPluginManifests(dir) {
	if (!existsSync(dir)) return [];
	const out = [];
	for (const sub of listDirs(dir)) {
		const manifestPath = join(dir, sub, "badi-plugin.json");
		if (!existsSync(manifestPath)) continue;
		try {
			const m = JSON.parse(readFileSync(manifestPath, "utf-8"));
			out.push({ ...m, _path: join(dir, sub) });
		} catch {
			// skip unreadable
		}
	}
	return out;
}
