// Skills auto-router — keyword tabanli prompt → skill eslestirici.
//
// Vault'taki SKILL.md aciklamalarindan keyword indeksi kurar,
// kullanici prompt'una karsi puanlama yapar. UserPromptSubmit hook'u
// ile entegre olunca prompt tipine gore otomatik skill aktivasyonu
// saglar (filesystem'e yazmaz, per-turn context inject eder).
//
// Algoritma:
//  1. Tokenize prompt (lowercase, non-word split, stopword filter)
//  2. Her skill icin description'dan + "triggers on:" listesinden
//     keyword cumesi cikar
//  3. Skill skoru = ortak token sayisi (description: 1x, triggers: 3x)
//  4. Esik: skor >= 1 olanlar matched, skor azalan sirada
//  5. Top K dondur

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const STOPWORDS = new Set([
	"the",
	"a",
	"an",
	"is",
	"are",
	"was",
	"were",
	"be",
	"been",
	"being",
	"have",
	"has",
	"had",
	"do",
	"does",
	"did",
	"will",
	"would",
	"should",
	"could",
	"may",
	"might",
	"must",
	"can",
	"to",
	"of",
	"in",
	"on",
	"at",
	"by",
	"for",
	"with",
	"about",
	"into",
	"through",
	"during",
	"and",
	"or",
	"but",
	"if",
	"as",
	"this",
	"that",
	"these",
	"those",
	"it",
	"its",
	"i",
	"you",
	"we",
	"they",
	"he",
	"she",
	"what",
	"which",
	"who",
	"how",
	"why",
	"where",
	"when",
	"ben",
	"sen",
	"biz",
	"bir",
	"icin",
	"ile",
	"ve",
	"veya",
	"ama",
	"su",
	"bu",
	"ne",
	"nasil",
	"nicin",
	"olan",
	"olmak",
	"yap",
	"yapmak",
	"et",
	"etmek",
	"var",
	"yok",
	"iste",
	"lutfen",
	"please",
	"help",
	"need",
	"want",
	"make",
	"create",
	"build",
]);

function tokenize(text) {
	return String(text || "")
		.toLowerCase()
		.split(/[^a-z0-9-]+/i)
		.filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

function parseFrontmatter(content) {
	const m = content.match(/^---\s*\n([\s\S]*?)\n---/);
	if (!m) return null;
	const fm = {};
	for (const line of m[1].split("\n")) {
		const kv = line.match(/^([a-zA-Z][a-zA-Z0-9_-]*):\s*(.*)$/);
		if (kv) fm[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
	}
	return fm;
}

/**
 * Bir skill icin keyword indeksi kurar.
 * description'dan + "Triggers on: ..." listesinden token cumesi.
 *
 * @returns { name, descriptionTokens, triggerTokens, body }
 */
export function indexSkill(skillDir) {
	const skillFile = join(skillDir, "SKILL.md");
	if (!existsSync(skillFile)) return null;
	let content;
	try {
		content = readFileSync(skillFile, "utf-8");
	} catch {
		return null;
	}
	const fm = parseFrontmatter(content);
	if (!fm?.name) return null;

	const description = fm.description || "";
	const descriptionTokens = new Set(tokenize(description));

	// "Triggers on: X, Y, Z" deseni description icinde gomulu olabilir
	const triggerMatch = description.match(/triggers?\s+on:\s*([^.]+)/i);
	const triggerTokens = new Set(triggerMatch ? tokenize(triggerMatch[1]) : []);

	return {
		name: fm.name,
		description,
		descriptionTokens,
		triggerTokens,
		body: content,
	};
}

/**
 * Vault'taki tum skill'leri indeksle.
 */
export function buildSkillIndex(vaultDir) {
	if (!existsSync(vaultDir)) return [];
	const entries = [];
	for (const name of readdirSync(vaultDir)) {
		const dir = join(vaultDir, name);
		try {
			if (!statSync(dir).isDirectory()) continue;
		} catch {
			continue;
		}
		const idx = indexSkill(dir);
		if (idx) entries.push(idx);
	}
	return entries;
}

/**
 * Bir prompt'a karsi en uygun skill'leri puanla.
 *
 * @param {string} prompt
 * @param {Array} index — buildSkillIndex cikartisi
 * @param {Object} opts
 * @param {number} [opts.minScore=2]      Esik puan
 * @param {number} [opts.top=3]           En fazla kac skill dondur
 * @param {number} [opts.descWeight=1]    description token agirligi
 * @param {number} [opts.triggerWeight=3] trigger token agirligi
 * @returns Array<{ name, score, matched: { description, triggers } }>
 */
export function routePrompt(prompt, index, opts = {}) {
	const { minScore = 2, top = 3, descWeight = 1, triggerWeight = 3 } = opts;

	const promptTokens = new Set(tokenize(prompt));
	if (promptTokens.size === 0) return [];

	const scored = [];
	for (const skill of index) {
		const matchedDesc = [];
		const matchedTrig = [];
		for (const t of promptTokens) {
			if (skill.triggerTokens.has(t)) matchedTrig.push(t);
			else if (skill.descriptionTokens.has(t)) matchedDesc.push(t);
		}
		const score =
			matchedDesc.length * descWeight + matchedTrig.length * triggerWeight;
		if (score >= minScore) {
			scored.push({
				name: skill.name,
				score,
				matched: { description: matchedDesc, triggers: matchedTrig },
			});
		}
	}

	scored.sort((a, b) => b.score - a.score);
	return scored.slice(0, top);
}

/**
 * Match'lenen skill'lerin SKILL.md govdesini birlestirip context blob'u uretir.
 * Hook'tan UserPromptSubmit additionalContext olarak Claude'a verilir.
 *
 * @param {Array} matched — routePrompt cikartisi
 * @param {Array} index   — buildSkillIndex cikartisi
 * @returns string — markdown blob
 */
export function buildContextInjection(matched, index) {
	if (matched.length === 0) return "";
	const byName = new Map(index.map((s) => [s.name, s]));
	const sections = [];
	for (const m of matched) {
		const skill = byName.get(m.name);
		if (!skill) continue;
		sections.push(`## Skill: ${skill.name} (auto-routed)\n\n${skill.body}`);
	}
	if (sections.length === 0) return "";
	const header = `# Auto-Activated Skills (${matched.length})\n\nBadi router prompt'unuza gore su skill'leri otomatik aktiflestirdi:\n${matched.map((m) => `- **${m.name}** (skor: ${m.score})`).join("\n")}\n\n---\n`;
	return header + sections.join("\n\n---\n\n");
}
