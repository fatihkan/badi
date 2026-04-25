#!/usr/bin/env node
// scripts/enrich-skills.js
//
// In-place frontmatter enrichment for .claude/skills/<name>/SKILL.md
// Uses lib/harnesses/skills-bundler.js's enrichSkill + serializeSkill but
// writes back to the SAME file rather than producing a bundle.
//
// Idempotent: running twice produces no diff once enrichment completes.
//
// Use:
//   node scripts/enrich-skills.js          # enrich
//   node scripts/enrich-skills.js --check  # report what would change, don't write

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	enrichSkill,
	serializeSkill,
} from "../lib/harnesses/skills-bundler.js";

const SOURCE = join(process.cwd(), ".claude", "skills");
const checkOnly = process.argv.includes("--check");

const curated = JSON.parse(
	readFileSync(join(import.meta.dirname, "skill-descriptions.json"), "utf-8"),
);

const entries = readdirSync(SOURCE, { withFileTypes: true });
let touched = 0;
let warned = 0;
let skipped = 0;

for (const entry of entries) {
	if (!entry.isDirectory()) continue;
	const name = entry.name;
	const file = join(SOURCE, name, "SKILL.md");
	let content;
	try {
		content = readFileSync(file, "utf-8");
	} catch {
		skipped++;
		continue;
	}

	const result = enrichSkill(content, name);

	// Override description with curated entry if available — auto-derived
	// descriptions for category-summary files are usually low quality.
	if (curated[name]) {
		result.meta.description = curated[name];
		if (!result.enriched.includes("description (curated)")) {
			result.enriched.push("description (curated)");
		}
	}

	const out = serializeSkill(result.meta, result.body);

	if (out === content) continue;

	if (result.warnings.length > 0) warned++;

	if (checkOnly) {
		console.log(`would enrich: ${name} (added: ${result.enriched.join(", ") || "—"})`);
	} else {
		writeFileSync(file, out);
		console.log(
			`+ ${name}: ${result.enriched.length === 0 ? "frontmatter formatted" : `added ${result.enriched.join(", ")}`}`,
		);
	}
	touched++;
}

console.log("");
console.log(
	`${checkOnly ? "[check] " : ""}touched: ${touched}, warnings: ${warned}, skipped: ${skipped}`,
);
