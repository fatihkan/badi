import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
	KNOWN_CATEGORIES,
	KNOWN_TOOLS,
	parseRichFrontmatter,
	validateSkill,
	validateSkillFile,
} from "../lib/skills/schema.js";

const validMeta = () => ({
	name: "frontend-taste",
	description:
		"Premium frontend design skills. Triggers on UI tasarla, design a UI, premium landing page, anti-slop, dashboard redesign, calibrated palette.",
	license: "MIT",
	compatibility: "Node.js 18+, Claude Code or skills CLI compatible agent.",
	"allowed-tools": "Read Write Edit Bash Grep",
	metadata: {
		author: "fatihkan",
		homepage:
			"https://github.com/fatihkan/badi-skills/tree/main/skills/frontend-taste",
		"badi-version": ">=1.14.0",
		category: "design",
	},
});

describe("schema: parseRichFrontmatter", () => {
	it("flat scalars", () => {
		const c = "---\nname: foo\nlicense: MIT\n---\n\n# Body";
		const { meta, body } = parseRichFrontmatter(c);
		assert.equal(meta.name, "foo");
		assert.equal(meta.license, "MIT");
		assert.match(body, /Body/);
	});

	it("nested metadata block", () => {
		const c = `---
name: foo
metadata:
  author: fatihkan
  category: design
---

body`;
		const { meta } = parseRichFrontmatter(c);
		assert.equal(meta.metadata.author, "fatihkan");
		assert.equal(meta.metadata.category, "design");
	});

	it("block-scalar (>) joins folded text", () => {
		const c = `---
name: foo
description: >
  Multi-line
  description text
license: MIT
---
`;
		const { meta } = parseRichFrontmatter(c);
		assert.match(meta.description, /Multi-line description text/);
		assert.equal(meta.license, "MIT");
	});

	it("returns null meta when no frontmatter", () => {
		const c = "# No frontmatter\n\nbody";
		const { meta } = parseRichFrontmatter(c);
		assert.equal(meta, null);
	});
});

describe("schema: validateSkill — happy path", () => {
	it("complete valid frontmatter passes", () => {
		const r = validateSkill(validMeta());
		assert.equal(r.ok, true);
		assert.equal(r.errors.length, 0);
		assert.equal(r.warnings.length, 0);
	});
});

describe("schema: validateSkill — required fields", () => {
	for (const field of [
		"name",
		"description",
		"license",
		"compatibility",
		"allowed-tools",
	]) {
		it(`missing ${field} fails`, () => {
			const m = validMeta();
			delete m[field];
			const r = validateSkill(m);
			assert.equal(r.ok, false);
			assert.match(
				r.errors.join("\n"),
				new RegExp(`Required field missing: ${field}`),
			);
		});
	}

	for (const field of ["author", "homepage", "badi-version", "category"]) {
		it(`missing metadata.${field} fails`, () => {
			const m = validMeta();
			delete m.metadata[field];
			const r = validateSkill(m);
			assert.equal(r.ok, false);
			assert.match(
				r.errors.join("\n"),
				new RegExp(`Required field missing: metadata.${field}`),
			);
		});
	}

	it("missing metadata block fails", () => {
		const m = validMeta();
		m.metadata = undefined;
		const r = validateSkill(m);
		assert.equal(r.ok, false);
		assert.match(r.errors.join("\n"), /metadata block required/);
	});
});

describe("schema: validateSkill — name slug", () => {
	it("rejects uppercase", () => {
		const m = validMeta();
		m.name = "FrontendTaste";
		const r = validateSkill(m);
		assert.equal(r.ok, false);
		assert.match(r.errors.join("\n"), /name must match/);
	});

	it("rejects underscore", () => {
		const m = validMeta();
		m.name = "front_end";
		const r = validateSkill(m);
		assert.equal(r.ok, false);
	});

	it("rejects single-char name", () => {
		const m = validMeta();
		m.name = "a";
		const r = validateSkill(m);
		assert.equal(r.ok, false);
	});

	it("warns when name mismatches expectedName", () => {
		const m = validMeta();
		const r = validateSkill(m, { expectedName: "different-dir" });
		assert.equal(r.ok, true); // warning, not error
		assert.match(r.warnings.join("\n"), /does not match directory/);
	});
});

describe("schema: validateSkill — description length", () => {
	it("warns when description < 50 chars", () => {
		const m = validMeta();
		m.description = "Short.";
		const r = validateSkill(m);
		assert.equal(r.ok, true);
		assert.match(r.warnings.join("\n"), /trigger activation/);
	});

	it("ok at exactly 50 chars", () => {
		const m = validMeta();
		m.description = "x".repeat(50);
		const r = validateSkill(m);
		assert.equal(r.ok, true);
		assert.equal(r.warnings.length, 0);
	});
});

describe("schema: validateSkill — allowed-tools", () => {
	it("warns on unknown tool", () => {
		const m = validMeta();
		m["allowed-tools"] = "Read Write Banana";
		const r = validateSkill(m);
		assert.equal(r.ok, true);
		assert.match(r.warnings.join("\n"), /Banana/);
	});

	it("errors on empty allowed-tools list", () => {
		const m = validMeta();
		m["allowed-tools"] = "   ";
		const r = validateSkill(m);
		assert.equal(r.ok, false);
	});

	it("accepts all known tools", () => {
		const m = validMeta();
		m["allowed-tools"] = KNOWN_TOOLS.join(" ");
		const r = validateSkill(m);
		assert.equal(r.ok, true);
		assert.equal(r.warnings.length, 0);
	});
});

describe("schema: validateSkill — metadata fields", () => {
	it("rejects non-URL homepage", () => {
		const m = validMeta();
		m.metadata.homepage = "not-a-url";
		const r = validateSkill(m);
		assert.equal(r.ok, false);
		assert.match(r.errors.join("\n"), /http\(s\) URL/);
	});

	it("warns on non-semver badi-version", () => {
		const m = validMeta();
		m.metadata["badi-version"] = "latest";
		const r = validateSkill(m);
		assert.equal(r.ok, true);
		assert.match(r.warnings.join("\n"), /semver constraint/);
	});

	it("accepts >=, ^, ~ semver prefixes", () => {
		for (const v of [">=1.14.0", "^1.14.0", "~1.14.0", "1.14.0"]) {
			const m = validMeta();
			m.metadata["badi-version"] = v;
			const r = validateSkill(m);
			assert.equal(r.ok, true, `should accept ${v}`);
		}
	});

	it("warns on unknown category", () => {
		const m = validMeta();
		m.metadata.category = "made-up";
		const r = validateSkill(m);
		assert.equal(r.ok, true);
		assert.match(r.warnings.join("\n"), /not in the known list/);
	});

	it("accepts all known categories", () => {
		for (const c of KNOWN_CATEGORIES) {
			const m = validMeta();
			m.metadata.category = c;
			const r = validateSkill(m);
			assert.equal(r.ok, true, `should accept category ${c}`);
		}
	});
});

describe("schema: strict mode", () => {
	it("promotes warnings to errors", () => {
		const m = validMeta();
		m.description = "Short.";
		m.metadata.category = "made-up";

		const lenient = validateSkill(m);
		assert.equal(lenient.ok, true);
		assert.equal(lenient.warnings.length, 2);

		const strict = validateSkill(m, { strict: true });
		assert.equal(strict.ok, false);
		assert.equal(strict.warnings.length, 0);
		assert.ok(strict.errors.length >= 2);
	});
});

describe("schema: validateSkillFile end-to-end", () => {
	it("parses + validates valid SKILL.md", () => {
		const content = `---
name: frontend-taste
description: Premium frontend design skills. Triggers on UI tasarla, design a UI, premium landing page, dashboard redesign.
license: MIT
compatibility: Node.js 18+, Claude Code compatible.
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: fatihkan
  homepage: https://github.com/fatihkan/badi-skills/tree/main/skills/frontend-taste
  badi-version: ">=1.14.0"
  category: design
---

# Frontend Taste

Body content.
`;
		const r = validateSkillFile(content);
		assert.equal(r.ok, true);
	});

	it("flags missing frontmatter", () => {
		const content = "# No frontmatter\n\nbody only";
		const r = validateSkillFile(content);
		assert.equal(r.ok, false);
		assert.match(r.errors.join("\n"), /parse edilemedi/);
	});
});
