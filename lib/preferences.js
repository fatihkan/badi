import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { HARNESS_IDS } from "./harnesses/index.js";

// Test isolation + XDG-like override. Priority:
//   1. BADI_PREFS_PATH  — full file path (wins if set)
//   2. BADI_PREFS_HOME  — base dir; prefs go in <dir>/.config/badi/preferences.json
//   3. os.homedir()     — default
const HOME_BASE = process.env.BADI_PREFS_HOME || homedir();
const CONFIG_DIR = join(HOME_BASE, ".config", "badi");
const PREFS_PATH =
	process.env.BADI_PREFS_PATH || join(CONFIG_DIR, "preferences.json");

const VALIDATORS = {
	defaultHarness: (v) => typeof v === "string" && HARNESS_IDS.includes(v),
};

export function loadPreferences() {
	if (!existsSync(PREFS_PATH)) return {};
	try {
		return JSON.parse(readFileSync(PREFS_PATH, "utf-8")) || {};
	} catch {
		return {};
	}
}

export function savePreferences(prefs) {
	const dir = join(PREFS_PATH, "..");
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
	writeFileSync(PREFS_PATH, JSON.stringify(prefs, null, 2));
}

export function getPreference(key, fallback = undefined) {
	const prefs = loadPreferences();
	return prefs[key] ?? fallback;
}

export function setPreference(key, value) {
	const validator = VALIDATORS[key];
	if (validator && !validator(value)) {
		throw new Error(`Gecersiz tercih degeri: ${key}=${value}`);
	}
	const prefs = loadPreferences();
	prefs[key] = value;
	savePreferences(prefs);
}

export { PREFS_PATH };
