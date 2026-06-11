// Vault-walking frontmatter validation (v1.34.1+).
//
// Until now NO test walked .claude/skills-vault/ — the metadata.homepage gap
// silently regressed twice (v1.25 pentest-*, v1.27 expo-*; 37/62 categories
// failed validateSkillFile while the bundler's enrichSkill auto-filled the
// field and hid the failure). This suite walks every top-level category
// SKILL.md so a third recurrence fails CI instead of shipping.

import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { validateSkillFile } from "../lib/skills/schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VAULT = resolve(__dirname, "..", ".claude", "skills-vault");

const categories = readdirSync(VAULT)
	.filter((d) => {
		try {
			return statSync(join(VAULT, d)).isDirectory();
		} catch {
			return false;
		}
	})
	.sort();

describe("skills-vault frontmatter (walks every category)", () => {
	it("vault has the expected family structure (general + pentest-* + expo-*)", () => {
		const pentest = categories.filter((d) => d.startsWith("pentest-"));
		const expo = categories.filter((d) => d.startsWith("expo-"));
		const general = categories.length - pentest.length - expo.length;
		// Floors, not exact counts — new categories must not break this test.
		assert.ok(categories.length >= 62, `vault has ${categories.length} dirs`);
		assert.ok(general >= 25, `general family shrank to ${general}`);
		assert.ok(
			pentest.length >= 25,
			`pentest family shrank to ${pentest.length}`,
		);
		assert.ok(expo.length >= 12, `expo family shrank to ${expo.length}`);
	});

	for (const cat of categories) {
		it(`${cat}/SKILL.md passes validateSkillFile`, () => {
			const p = join(VAULT, cat, "SKILL.md");
			const r = validateSkillFile(readFileSync(p, "utf-8"));
			assert.equal(
				r.ok,
				true,
				`${cat}: ${r.errors.join("; ")} — every vault category must be ` +
					"schema-valid WITHOUT relying on the bundler's enrichSkill auto-fill",
			);
		});
	}

	it("every category sets metadata.homepage explicitly (no enrichSkill reliance)", () => {
		const missing = categories.filter(
			(cat) =>
				!/^\s+homepage:\s*\S/m.test(
					readFileSync(join(VAULT, cat, "SKILL.md"), "utf-8"),
				),
		);
		assert.deepEqual(
			missing,
			[],
			"categories missing an explicit metadata.homepage",
		);
	});
});
