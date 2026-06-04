// Skills auto-router — keyword tabanli prompt → skill eslestirici.
//
// Vault'taki SKILL.md aciklamalarindan keyword indeksi kurar,
// scores against the user prompt. When integrated with the UserPromptSubmit
// hook, it enables automatic skill activation based on prompt type
// (does not write to the filesystem; injects per-turn context).
//
// Algoritma:
//  1. Tokenize prompt (lowercase, non-word split, stopword filter)
//  2. For each skill, from the description + the "triggers on:" list
//     keyword cumesi cikar
//  3. Skill score = shared token count (description: 1x, triggers: 3x)
//  4. Esik: skor >= 1 olanlar matched, skor azalan sirada
//  5. Return the top K

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
 * Builds the keyword index for a skill.
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
 * Builds the keyword index for a command file.
 * Commands have no frontmatter; the first line is a short description.
 *
 * @param {string} filePath  .md dosyasinin tam yolu
 * @returns { name, description, descriptionTokens, triggerTokens, body } | null
 */
export function indexCommandFile(filePath) {
	if (!existsSync(filePath)) return null;
	let content;
	try {
		content = readFileSync(filePath, "utf-8");
	} catch {
		return null;
	}
	const fileName = filePath.split(/[\\/]/).pop() || "";
	const name = fileName.replace(/\.md$/, "");
	if (!name) return null;

	const firstLine = content.split("\n")[0].trim();
	const description = firstLine.replace(/^#+\s*/, "");
	const descriptionTokens = new Set(tokenize(description));

	return {
		name,
		description,
		descriptionTokens,
		triggerTokens: new Set(),
		body: content,
	};
}

/**
 * Index every command in the commands-vault directory.
 */
export function buildCommandIndex(vaultDir) {
	if (!existsSync(vaultDir)) return [];
	const entries = [];
	for (const name of readdirSync(vaultDir)) {
		if (!name.endsWith(".md")) continue;
		const filePath = join(vaultDir, name);
		try {
			if (!statSync(filePath).isFile()) continue;
		} catch {
			continue;
		}
		const idx = indexCommandFile(filePath);
		if (idx) entries.push(idx);
	}
	return entries;
}

/**
 * Index every skill in the vault.
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
 * @param {number} [opts.top=3]           How many skills to return at most
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
 * Concatenates the matched skills' SKILL.md bodies and produces a context blob.
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

/**
 * Produces a context blob for the matched commands.
 * Not the FULL command body, just a "command available" reminder
 * inject edilir — DEX odakli, token bilincli.
 *
 * @param {Array} matched — routePrompt cikartisi
 * @param {Array} index   — buildCommandIndex cikartisi
 * @returns string — markdown blob
 */
export function buildCommandHint(matched, index) {
	if (matched.length === 0) return "";
	const byName = new Map(index.map((s) => [s.name, s]));
	const lines = [];
	for (const m of matched) {
		const cmd = byName.get(m.name);
		if (!cmd) continue;
		const desc = cmd.description.slice(0, 120);
		lines.push(`- **/${cmd.name}** — ${desc}`);
	}
	if (lines.length === 0) return "";
	return `# Suggested Commands (${lines.length})\n\nBadi router prompt'una gore su komutlari oneriyor:\n\n${lines.join("\n")}\n`;
}
