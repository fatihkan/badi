// Stack detector — proje dosyalarindan teknoloji tespiti.
//
// Cikti: { technologies: Array<{id,name,source,skills}>, skills: Set<string> }
//
// Algoritma:
//  1. Manifest dosyalarini oku (package.json, Cargo.toml, go.mod, ...)
//  2. Her STACK_MAP entry'sinin detect kuralini test et:
//     - packages: package.json deps + devDeps
//     - configFiles: root-level glob existence (sadece FILE)
//     - configDirs: root-level glob existence (sadece DIR)
//     - fileExtensions: root-level uzanti taramasi
//     - manifestKeys: pyproject.toml/Cargo.toml/go.mod metin match
//     - scripts: package.json scripts adi
//  3. Eslesen tekniyolojileri uniq + source ile dondur

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { STACK_MAP } from "./skills/stack-map.js";

const MAX_FILE_BYTES = 1024 * 512; // 512KB — buyuk lockfile/yml taramayalim

function safeRead(filePath) {
	try {
		const st = statSync(filePath);
		if (!st.isFile() || st.size > MAX_FILE_BYTES) return null;
		return readFileSync(filePath, "utf-8");
	} catch {
		return null;
	}
}

function safeJsonParse(content) {
	if (!content) return null;
	try {
		return JSON.parse(content);
	} catch {
		return null;
	}
}

function safeReaddir(dir) {
	try {
		return readdirSync(dir);
	} catch {
		return [];
	}
}

function isKindAtRoot(target, name, kind) {
	if (kind === "any") return true;
	try {
		const st = statSync(join(target, name));
		if (kind === "file") return st.isFile();
		if (kind === "dir") return st.isDirectory();
	} catch {
		return false;
	}
	return false;
}

/**
 * package.json oku ve { allDeps: Set, scripts: Set, name } dondur.
 */
function readPackageJson(target) {
	const p = join(target, "package.json");
	const content = safeRead(p);
	const pkg = safeJsonParse(content);
	if (!pkg) return null;
	const allDeps = new Set([
		...Object.keys(pkg.dependencies || {}),
		...Object.keys(pkg.devDependencies || {}),
		...Object.keys(pkg.peerDependencies || {}),
		...Object.keys(pkg.optionalDependencies || {}),
	]);
	const scripts = new Set(Object.keys(pkg.scripts || {}));
	return { allDeps, scripts, name: pkg.name || null, raw: pkg };
}

/**
 * Glob benzeri eslesme: "*.config.*" desenini cwd icinde test eder.
 * Sadece tek dizin seviyesinde calisir, recursive degil.
 *
 * @param {string} target — taranacak kok
 * @param {string[]} patterns — glob desenleri
 * @param {Object} [opts]
 * @param {"file"|"dir"|"any"} [opts.kind="any"] — match turu
 * @param {string[]} [opts.entries] — onceden okunmus dizin listesi (cache)
 * @returns {string|null} eslesen dosya adi
 */
function matchAnyFile(target, patterns, opts = {}) {
	const { kind = "any", entries = safeReaddir(target) } = opts;
	if (entries.length === 0) return null;
	for (const pat of patterns) {
		const re = globToRegex(pat);
		const hit = entries.find(
			(e) => re.test(e) && isKindAtRoot(target, e, kind),
		);
		if (hit) return hit;
	}
	return null;
}

function globToRegex(pat) {
	const esc = pat.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
	return new RegExp(`^${esc}$`, "i");
}

/**
 * Bir teknolojinin detect kurali (DetectRule) tek dosyaya ya da pakete bakar.
 * @param {Object} detect — STACK_MAP entry'sinin detect alani
 * @param {Object} ctx — { target, pkg, rootEntries }
 * @returns {{ matched: boolean, source: string|null }}
 */
function evaluateDetect(detect, ctx) {
	// rootEntries cache eksikse defansive olarak fresh oku
	const rootEntries = ctx.rootEntries ?? safeReaddir(ctx.target);
	// 1. packages (npm)
	if (detect.packages && ctx.pkg) {
		for (const p of detect.packages) {
			if (ctx.pkg.allDeps.has(p)) {
				return { matched: true, source: `package.json:dep:${p}` };
			}
		}
	}
	// 2. configFiles (root-level, sadece FILE)
	if (detect.configFiles) {
		const hit = matchAnyFile(ctx.target, detect.configFiles, {
			kind: "file",
			entries: rootEntries,
		});
		if (hit) return { matched: true, source: `configFile:${hit}` };
	}
	// 3. configDirs (root-level, sadece DIR) — .github, prisma, ios, android
	if (detect.configDirs) {
		const hit = matchAnyFile(ctx.target, detect.configDirs, {
			kind: "dir",
			entries: rootEntries,
		});
		if (hit) return { matched: true, source: `configDir:${hit}` };
	}
	// 4. fileExtensions (root-level — hizli)
	if (detect.fileExtensions) {
		const hit = rootEntries.find((e) =>
			detect.fileExtensions.some((ext) => e.endsWith(ext)),
		);
		if (hit) return { matched: true, source: `fileExt:${hit}` };
	}
	// 5. manifestKeys — pyproject.toml/Cargo.toml/go.mod metin tabani
	if (detect.manifestKeys) {
		for (const { file, key } of detect.manifestKeys) {
			const content = safeRead(join(ctx.target, file));
			if (!content) continue;
			if (typeof key === "string") {
				if (content.includes(key)) {
					return { matched: true, source: `${file}:${key}` };
				}
			} else if (key instanceof RegExp) {
				if (key.test(content)) {
					return { matched: true, source: `${file}:regex` };
				}
			}
		}
	}
	// 6. scripts (npm scripts)
	if (detect.scripts && ctx.pkg) {
		for (const s of detect.scripts) {
			if (ctx.pkg.scripts.has(s)) {
				return { matched: true, source: `package.json:script:${s}` };
			}
		}
	}
	return { matched: false, source: null };
}

/**
 * Hedef dizinden tum stack'i tespit et.
 *
 * @param {string} target — proje koku (cwd)
 * @returns {{
 *   technologies: Array<{id: string, name: string, source: string, skills: string[]}>,
 *   skills: Set<string>
 * }}
 */
export function detectStack(target) {
	const ctx = {
		target,
		pkg: readPackageJson(target),
		rootEntries: safeReaddir(target),
	};
	const technologies = [];
	const skills = new Set();

	for (const tech of STACK_MAP) {
		const r = evaluateDetect(tech.detect, ctx);
		if (r.matched) {
			technologies.push({
				id: tech.id,
				name: tech.name,
				source: r.source,
				skills: tech.skills,
			});
			for (const s of tech.skills) skills.add(s);
		}
	}

	return { technologies, skills };
}

export { evaluateDetect, globToRegex, matchAnyFile, readPackageJson };
