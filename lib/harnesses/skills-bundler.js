// Skills bundler — `.claude/skills/<name>/` -> `<target>/skills/<name>/`
//
// Issue #56 step 2: ana repo'daki skill dosyalarini ayri `badi-skills` repo'su
// (veya verilen target dizini) icin compile eder. Eksik frontmatter alanlarini
// otomatik doldurur, references/ alt dizinini kopyalar, ve router skill
// uretir.
//
// Auto-enrichment kurallari:
// - license: "MIT"
// - compatibility: standart uyumluluk metni
// - allowed-tools: "Read Write Edit Bash Grep" (gunluk minimum)
// - metadata.author: "fatihkan"
// - metadata.homepage: badi-skills repo URL'i
// - metadata.badi-version: ">=1.14.0"
// - metadata.category: dizin adindan tahmin (KNOWN_CATEGORIES'te varsa)
//
// Bundler frontmatter'i UZERINE YAZMAZ — eksik alanlari doldurur. Mevcut
// kullanici-degerli alan korunur.

import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
	KNOWN_CATEGORIES,
	parseRichFrontmatter,
	validateSkill,
} from "../skills/schema.js";

const DEFAULT_AUTHOR = "fatihkan";
const DEFAULT_BADI_VERSION = ">=1.14.0";
const DEFAULT_LICENSE = "MIT";
const DEFAULT_ALLOWED_TOOLS = "Read Write Edit Bash Grep";
const DEFAULT_COMPATIBILITY =
	"Works with Claude Code, Cursor, or any compatible AI coding agent.";
const HOMEPAGE_BASE =
	"https://github.com/fatihkan/badi-skills/tree/main/skills";

/**
 * Skill dizinini al, eksik frontmatter alanlarini doldur, dogrula.
 * @returns {{ok, meta, body, enriched: string[], errors, warnings}}
 */
export function enrichSkill(content, name, opts = {}) {
	const enriched = [];
	const parsed = parseRichFrontmatter(content);
	const meta = parsed.meta ? structuredClone(parsed.meta) : {};
	const body = parsed.body;

	// Top-level fields
	if (!meta.name) {
		meta.name = name;
		enriched.push("name");
	}
	if (!meta.description) {
		// Try to derive from body's first non-heading paragraph
		const firstPara = body
			.split("\n")
			.filter((l) => l && !l.startsWith("#") && !l.startsWith(">"))
			.slice(0, 3)
			.join(" ")
			.replace(/\s+/g, " ")
			.trim();
		meta.description = firstPara
			? `${firstPara.substring(0, 300)} (auto-generated; refine for better trigger activation)`
			: `${name} skill — needs description.`;
		enriched.push("description");
	}
	if (!meta.license) {
		meta.license = DEFAULT_LICENSE;
		enriched.push("license");
	}
	if (!meta.compatibility) {
		meta.compatibility = DEFAULT_COMPATIBILITY;
		enriched.push("compatibility");
	}
	if (!meta["allowed-tools"]) {
		meta["allowed-tools"] = DEFAULT_ALLOWED_TOOLS;
		enriched.push("allowed-tools");
	}

	// Metadata block
	if (!meta.metadata || typeof meta.metadata !== "object") {
		meta.metadata = {};
	}
	if (!meta.metadata.author) {
		meta.metadata.author = DEFAULT_AUTHOR;
		enriched.push("metadata.author");
	}
	if (!meta.metadata.homepage) {
		meta.metadata.homepage = `${HOMEPAGE_BASE}/${name}`;
		enriched.push("metadata.homepage");
	}
	if (!meta.metadata["badi-version"]) {
		meta.metadata["badi-version"] = DEFAULT_BADI_VERSION;
		enriched.push("metadata.badi-version");
	}
	if (!meta.metadata.category) {
		// Heuristic: name itself OR substring match against KNOWN_CATEGORIES
		meta.metadata.category = guessCategory(name) || "uncategorized";
		enriched.push("metadata.category");
	}

	const validation = validateSkill(meta, {
		strict: opts.strict,
		expectedName: name,
	});

	return {
		ok: validation.ok,
		meta,
		body,
		enriched,
		errors: validation.errors,
		warnings: validation.warnings,
	};
}

function guessCategory(name) {
	const lower = name.toLowerCase();
	if (KNOWN_CATEGORIES.includes(lower)) return lower;
	for (const cat of KNOWN_CATEGORIES) {
		if (lower.includes(cat) || cat.includes(lower.split("-")[0])) return cat;
	}
	return null;
}

/**
 * Meta + body'den SKILL.md icerigi uretir. Frontmatter'i deterministik
 * sirayla yazar (diff'leri stable yapmak icin).
 */
export function serializeSkill(meta, body) {
	const lines = ["---"];
	for (const k of [
		"name",
		"description",
		"license",
		"compatibility",
		"allowed-tools",
	]) {
		if (meta[k] !== undefined && meta[k] !== null) {
			lines.push(`${k}: ${formatScalar(meta[k])}`);
		}
	}
	if (meta.metadata && typeof meta.metadata === "object") {
		lines.push("metadata:");
		const order = ["author", "homepage", "badi-version", "category"];
		const seen = new Set();
		for (const k of order) {
			if (meta.metadata[k] !== undefined && meta.metadata[k] !== null) {
				lines.push(`  ${k}: ${formatScalar(meta.metadata[k])}`);
				seen.add(k);
			}
		}
		for (const k of Object.keys(meta.metadata)) {
			if (seen.has(k)) continue;
			const v = meta.metadata[k];
			if (Array.isArray(v)) {
				lines.push(`  ${k}:`);
				for (const item of v) lines.push(`    - ${formatScalar(item)}`);
			} else {
				lines.push(`  ${k}: ${formatScalar(v)}`);
			}
		}
	}
	lines.push("---");
	return `${lines.join("\n")}\n${body}`;
}

function formatScalar(v) {
	if (typeof v === "string") {
		// Quote if it has special chars or starts with special
		if (/[:#&*!|>'"%@`]/.test(v[0]) || /[\n]/.test(v)) {
			// Backslash once escape edilmeli — aksi halde sonrasinda eklenen
			// `\"` escape'i ham backslash'larla karisip cikti'yi YAML'da
			// gecersiz hale getirir.
			const escaped = v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
			return `"${escaped}"`;
		}
		return v;
	}
	return String(v);
}

/**
 * Source dizinindeki tum skill'leri tara, target'a yaz.
 * @returns {{bundled, skipped, totalSkills}}
 */
export async function bundleSkills(opts) {
	const { source, target, dryRun = false, strict = false } = opts;
	if (!existsSync(source)) {
		throw new Error(`Source dir does not exist: ${source}`);
	}

	const bundled = [];
	const skipped = [];

	const entries = readdirSync(source, { withFileTypes: true });
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		const skillName = entry.name;
		const skillDir = join(source, skillName);
		const skillFile = join(skillDir, "SKILL.md");
		if (!existsSync(skillFile)) {
			skipped.push({ name: skillName, reason: "no SKILL.md" });
			continue;
		}

		const content = readFileSync(skillFile, "utf-8");
		const result = enrichSkill(content, skillName, { strict });

		if (!result.ok) {
			skipped.push({
				name: skillName,
				reason: "validation failed after enrichment",
				errors: result.errors,
			});
			continue;
		}

		const targetSkillDir = join(target, "skills", skillName);
		const targetFile = join(targetSkillDir, "SKILL.md");
		const out = serializeSkill(result.meta, result.body);

		if (!dryRun) {
			mkdirSync(targetSkillDir, { recursive: true });
			writeFileSync(targetFile, out);

			// Copy references/ if present
			const refsSrc = join(skillDir, "references");
			if (existsSync(refsSrc) && statSync(refsSrc).isDirectory()) {
				const refsDst = join(targetSkillDir, "references");
				cpSync(refsSrc, refsDst, { recursive: true });
			}
		}

		bundled.push({
			name: skillName,
			sourceFile: skillFile,
			targetFile,
			enriched: result.enriched,
			warnings: result.warnings,
			category: result.meta?.metadata?.category || "uncategorized",
		});
	}

	return { bundled, skipped, totalSkills: bundled.length + skipped.length };
}

/**
 * Bundle edilmis skill'lerden router skill (skills/badi/SKILL.md) uretir.
 * Router, kategorilere gore gruplanmis skill listesidir.
 */
export function generateRouterSkill(bundled) {
	const byCategory = new Map();
	for (const b of bundled) {
		// Read meta from re-parsed targetFile content if needed; for now
		// caller passes meta. Simplest: parse minimal info from targetFile.
		const cat = b.category || "uncategorized";
		if (!byCategory.has(cat)) byCategory.set(cat, []);
		byCategory.get(cat).push(b);
	}

	const lines = [
		"---",
		"name: badi",
		'description: "Entry point and router for the Badi skill collection. Lists every bundled Badi skill grouped by category. Triggers when an agent needs to discover Badi capabilities or pick the right skill for a task."',
		"license: MIT",
		"compatibility: Works with Claude Code, Cursor, or any compatible AI coding agent.",
		"allowed-tools: Read",
		"metadata:",
		"  author: fatihkan",
		`  homepage: ${HOMEPAGE_BASE}/badi`,
		'  badi-version: ">=1.14.0"',
		"  category: behavioral",
		"---",
		"",
		"# Badi Skills",
		"",
		"Auto-generated router. Each entry links to a bundled skill.",
		"",
	];

	const sortedCats = [...byCategory.keys()].sort();
	for (const cat of sortedCats) {
		lines.push(`## ${cat}`);
		lines.push("");
		const skills = byCategory
			.get(cat)
			.sort((a, b) => a.name.localeCompare(b.name));
		for (const s of skills) {
			lines.push(`- [${s.name}](../${s.name}/) — see \`SKILL.md\``);
		}
		lines.push("");
	}

	return lines.join("\n");
}
