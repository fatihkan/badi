// Stack detector — proje dosyalarindan teknoloji tespiti.
//
// Cikti: [{ id: "react", name: "React", source: "package.json:dep:react", confidence: 1.0 }]
//
// Algoritma:
//  1. Manifest dosyalarini oku (package.json, Cargo.toml, go.mod, ...)
//  2. Her STACK_MAP entry'sinin detect kuralini test et:
//     - packages: package.json deps + devDeps
//     - configFiles: glob existence
//     - filePatterns: glob existence
//     - manifestKeys: pyproject.toml/Cargo.toml/go.mod metin match
//  3. Eslesen tekniyolojileri uniq + skor + source ile dondur

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
 */
function matchAnyFile(target, patterns) {
	let entries;
	try {
		entries = readdirSync(target);
	} catch {
		return null;
	}
	for (const pat of patterns) {
		const re = globToRegex(pat);
		const hit = entries.find((e) => re.test(e));
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
 * @returns {{ matched: boolean, source: string|null }}
 */
function evaluateDetect(detect, ctx) {
	// 1. packages (npm)
	if (detect.packages && ctx.pkg) {
		for (const p of detect.packages) {
			if (ctx.pkg.allDeps.has(p)) {
				return { matched: true, source: `package.json:dep:${p}` };
			}
		}
	}
	// 2. configFiles (root-level)
	if (detect.configFiles) {
		const hit = matchAnyFile(ctx.target, detect.configFiles);
		if (hit) return { matched: true, source: `configFile:${hit}` };
	}
	// 3. fileExtensions (root-level — hizli)
	if (detect.fileExtensions) {
		try {
			const entries = readdirSync(ctx.target);
			const hit = entries.find((e) =>
				detect.fileExtensions.some((ext) => e.endsWith(ext)),
			);
			if (hit) return { matched: true, source: `fileExt:${hit}` };
		} catch {
			/* ignore */
		}
	}
	// 4. manifestKeys — pyproject.toml/Cargo.toml/go.mod metin tabani
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
	// 5. scripts (npm scripts)
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
 * @returns {{ technologies: Array<{id, name, source}>, skills: Set<string> }}
 */
export function detectStack(target) {
	const ctx = { target, pkg: readPackageJson(target) };
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
