import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { chalk } from "./cli.js";

// ─── Semver ───
// Single source for version parsing/bumping (was duplicated: parseVersion in
// lib/data/plugin-manifest.js, identical bumpVersion in release.js + mobile.js,
// ad-hoc split in update-check.js). Strict 3-part parse; trailing
// prerelease/build metadata is tolerated and ignored.

/**
 * Parse a semver string into {major,minor,patch}, or null if unparseable.
 * @param {string} version
 * @returns {{major:number,minor:number,patch:number}|null}
 */
export function parseVersion(version) {
	if (!version || typeof version !== "string") return null;
	const m = version.match(/^(\d+)\.(\d+)\.(\d+)/);
	if (!m) return null;
	return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

/**
 * Bump a semver string by release type. Throws on an unparseable version
 * (fail-fast: the old permissive `.split(".")` produced "1.2.NaN" silently).
 * @param {string} version
 * @param {"major"|"minor"|"patch"} [type="patch"]
 * @returns {string} the bumped version
 */
export function bumpVersion(version, type = "patch") {
	const v = parseVersion(version);
	if (!v) throw new Error(`bumpVersion: unparseable version "${version}"`);
	if (type === "major") return `${v.major + 1}.0.0`;
	if (type === "minor") return `${v.major}.${v.minor + 1}.0`;
	return `${v.major}.${v.minor}.${v.patch + 1}`;
}

/**
 * True if version `a` is strictly greater than `b` (semver). Unparseable
 * operands compare as not-greater (conservative).
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function semverGt(a, b) {
	const pa = parseVersion(a);
	const pb = parseVersion(b);
	if (!pa || !pb) return false;
	if (pa.major !== pb.major) return pa.major > pb.major;
	if (pa.minor !== pb.minor) return pa.minor > pb.minor;
	return pa.patch > pb.patch;
}

// ─── URL Security (SSRF) ───

/**
 * Validate a URL: protocol + localhost + private IP range block.
 * All external fetch wrappers on the CLI side must go through this.
 * @param {string} url
 * @returns {URL} parsed URL
 * @throws Error if the host is invalid or forbidden
 */
export function validateUrl(url) {
	let parsed;
	try {
		parsed = new URL(url);
	} catch {
		throw new Error(`Invalid URL: ${url}`);
	}
	if (!["http:", "https:"].includes(parsed.protocol)) {
		throw new Error(`Only http/https is supported: ${parsed.protocol}`);
	}
	const host = parsed.hostname.toLowerCase();
	if (
		host === "localhost" ||
		host === "127.0.0.1" ||
		host === "0.0.0.0" ||
		host === "::1"
	) {
		throw new Error("Local addresses are not supported");
	}
	if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/.test(host)) {
		throw new Error("Private IP addresses are not supported");
	}
	return parsed;
}

// ─── Subprocess Helpers ───

/**
 * Check whether a command exists on the PATH.
 */
export function hasCommand(cmd) {
	try {
		execFileSync("which", [cmd], { stdio: "pipe" });
		return true;
	} catch {
		return false;
	}
}

/**
 * spawnSync wrapper — throws a meaningful error if exit status is not 0.
 * Arguments are always passed as an array (no shell injection).
 */
export function shCapture(cmd, args, opts = {}) {
	const res = spawnSync(cmd, args, { encoding: "utf-8", ...opts });
	if (res.status !== 0) {
		const err = res.stderr || res.stdout || "(unknown error)";
		throw new Error(`${cmd} ${args.join(" ")} failed:\n${err.trim()}`);
	}
	return (res.stdout || "").trim();
}

// ─── HTTP Fetch Wrappers (timeout + SSRF guard) ───

const DEFAULT_UA = "Badi/1.11 (+https://github.com/fatihkan/badi)";

/**
 * Safe fetch with timeout + validateUrl + AbortController.
 * Returns a Response to the caller; the caller reads the body (text/json flexible).
 */
export async function fetchWithTimeout(url, opts = {}) {
	validateUrl(url);
	const {
		timeoutMs = 10000,
		headers = {},
		userAgent = DEFAULT_UA,
		...rest
	} = opts;
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch(url, {
			signal: controller.signal,
			headers: { "User-Agent": userAgent, ...headers },
			...rest,
		});
		clearTimeout(timer);
		return res;
	} catch (e) {
		clearTimeout(timer);
		throw new Error(`Fetch: ${e.message}`);
	}
}

/**
 * fetchWithTimeout + JSON parse. Throws on HTTP !ok or parse error.
 */
export async function fetchJsonWithTimeout(url, opts = {}) {
	const res = await fetchWithTimeout(url, opts);
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const text = await res.text();
	try {
		return JSON.parse(text);
	} catch {
		throw new Error("JSON parse error");
	}
}

export function copyRecursive(src, dest, options = {}, baseDest = null) {
	const {
		force = false,
		dryRun = false,
		updateMode = false,
		userCustomizable,
		exclude,
	} = options;
	const rootDest = baseDest || dest;
	let copied = 0;
	let skipped = 0;
	let created = 0;

	if (!existsSync(src)) return { copied, skipped, created };

	const entries = readdirSync(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = join(src, entry.name);
		const destPath = join(dest, entry.name);
		const relFromRoot = relative(rootDest, destPath);

		// Never copy excluded paths from src (e.g. seed files written from
		// a clean template instead — see harness seedUserFiles()).
		if (exclude?.(relFromRoot)) continue;

		// Preserve user-customizable files (even with --force)
		const isUser = userCustomizable?.(relFromRoot);

		if (entry.isDirectory()) {
			if (!existsSync(destPath)) {
				if (!dryRun) {
					mkdirSync(destPath, { recursive: true });
				}
				created++;
				if (dryRun) {
					console.log(
						`  ${chalk.green("+")} ${chalk.cyan("dir")} ${relative(process.cwd(), destPath)}/`,
					);
				}
			}
			const result = copyRecursive(srcPath, destPath, options, rootDest);
			copied += result.copied;
			skipped += result.skipped;
			created += result.created;
		} else {
			if (existsSync(destPath)) {
				// Always skip user files (even with force)
				if (isUser) {
					skipped++;
					continue;
				}
				if (updateMode) {
					if (dryRun) {
						console.log(
							`  ${chalk.gray("-")} ${chalk.dim(relative(process.cwd(), destPath))} (exists, skipped)`,
						);
					}
					skipped++;
				} else if (!force) {
					if (dryRun) {
						console.log(
							`  ${chalk.yellow("~")} ${relative(process.cwd(), destPath)} (exists, skipped)`,
						);
					}
					skipped++;
				} else {
					if (!dryRun) {
						cpSync(srcPath, destPath);
					}
					if (dryRun) {
						console.log(
							`  ${chalk.yellow("!")} ${relative(process.cwd(), destPath)} (overwritten)`,
						);
					}
					copied++;
				}
			} else {
				if (!dryRun) {
					mkdirSync(join(destPath, ".."), { recursive: true });
					cpSync(srcPath, destPath);
				}
				if (dryRun) {
					console.log(
						`  ${chalk.green("+")} ${relative(process.cwd(), destPath)}`,
					);
				}
				copied++;
			}
		}
	}

	return { copied, skipped, created };
}

export function countFiles(dir, ext = null) {
	if (!existsSync(dir)) return 0;
	let count = 0;
	const entries = readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		if (entry.isDirectory()) {
			count += countFiles(join(dir, entry.name), ext);
		} else if (!ext || extname(entry.name) === ext) {
			count++;
		}
	}
	return count;
}

export function listMdFiles(dir) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((f) => f.endsWith(".md"))
		.sort();
}

export function listDirs(dir) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name)
		.sort();
}
