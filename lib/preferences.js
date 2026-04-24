import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_DIR = join(homedir(), ".config", "badi");
const PREFS_PATH = join(CONFIG_DIR, "preferences.json");

export function loadPreferences() {
	if (!existsSync(PREFS_PATH)) return {};
	try {
		return JSON.parse(readFileSync(PREFS_PATH, "utf-8")) || {};
	} catch {
		return {};
	}
}

export function savePreferences(prefs) {
	if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
	writeFileSync(PREFS_PATH, JSON.stringify(prefs, null, 2));
}

export function getPreference(key, fallback = undefined) {
	const prefs = loadPreferences();
	return prefs[key] ?? fallback;
}

export function setPreference(key, value) {
	const prefs = loadPreferences();
	prefs[key] = value;
	savePreferences(prefs);
}

export { PREFS_PATH };
