import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

/**
 * File watcher: detects changes to a given file via mtime+size (cheap, no hash).
 *
 * Accepted check shape:
 *   { type: "file", path: "package.json",
 *     alert_on: "changed" | "dependency-added" | "dependency-removed" }
 *
 * State: { mtime, size, packageDeps? } persisted by runner.
 */

function readPackageDeps(filePath) {
	try {
		const pkg = JSON.parse(readFileSync(filePath, "utf-8"));
		return {
			...(pkg.dependencies || {}),
			...(pkg.devDependencies || {}),
			...(pkg.peerDependencies || {}),
		};
	} catch {
		return null;
	}
}

export default function runFileCheck(check, { cwd, state }) {
	if (!check.path) return { pass: false, message: "path empty" };
	const p = resolve(cwd, check.path);
	if (!existsSync(p)) {
		return { pass: false, message: `File not found: ${check.path}` };
	}
	const stat = statSync(p);
	const prev = state[check.path] || {};
	const now = { mtime: stat.mtimeMs, size: stat.size };
	const alertOn = check.alert_on || "changed";

	if (alertOn === "changed") {
		const changed =
			prev.mtime !== undefined &&
			(prev.mtime !== now.mtime || prev.size !== now.size);
		state[check.path] = now;
		return changed
			? {
					pass: false,
					message: `File changed: ${check.path}`,
					details: [`size ${prev.size} → ${now.size}`],
				}
			: { pass: true, message: "OK (unchanged)" };
	}

	if (alertOn === "dependency-added" || alertOn === "dependency-removed") {
		const currentDeps = readPackageDeps(p);
		if (!currentDeps) {
			return {
				pass: false,
				message: `Could not parse package.json: ${check.path}`,
			};
		}
		const prevDeps = prev.packageDeps || currentDeps;
		const added = Object.keys(currentDeps).filter((k) => !(k in prevDeps));
		const removed = Object.keys(prevDeps).filter((k) => !(k in currentDeps));
		state[check.path] = { ...now, packageDeps: currentDeps };

		if (alertOn === "dependency-added" && added.length > 0) {
			return {
				pass: false,
				message: `${added.length} new dependencies`,
				details: added.map((k) => `${k}@${currentDeps[k]}`).slice(0, 10),
			};
		}
		if (alertOn === "dependency-removed" && removed.length > 0) {
			return {
				pass: false,
				message: `${removed.length} dependencies removed`,
				details: removed.slice(0, 10),
			};
		}
		return { pass: true, message: "OK (deps unchanged)" };
	}

	return { pass: false, message: `Unknown alert_on: ${alertOn}` };
}
