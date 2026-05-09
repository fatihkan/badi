import assert from "node:assert/strict";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
	bundleSkills,
	enrichSkill,
	generateRouterSkill,
	serializeSkill,
} from "../lib/harnesses/skills-bundler.js";
import { parseRichFrontmatter } from "../lib/skills/schema.js";

let tmpRoot;
let source;
let target;

beforeEach(() => {
	tmpRoot = mkdtempSync(join(tmpdir(), "skills-bundler-"));
	source = join(tmpRoot, "src", "skills");
	target = join(tmpRoot, "out");
	mkdirSync(source, { recursive: true });
});

afterEach(() => {
	rmSync(tmpRoot, { recursive: true, force: true });
});

function writeSkill(name, content) {
	const dir = join(source, name);
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, "SKILL.md"), content);
	return dir;
}

const COMPLETE_SKILL = `---
name: complete-thing
description: A complete skill with full frontmatter for testing pass-through behavior in the bundler.
license: MIT
compatibility: Works with any agent.
allowed-tools: Read Write
metadata:
  author: alice
  homepage: https://example.com/skills/complete-thing
  badi-version: ">=1.14.0"
  category: testing
---

# Complete Thing

Body content.
`;

describe("bundler: enrichSkill", () => {
	it("preserves complete frontmatter (no enrichment)", () => {
		const r = enrichSkill(COMPLETE_SKILL, "complete-thing");
		assert.equal(r.ok, true);
		assert.deepEqual(r.enriched, []);
		assert.equal(r.meta.metadata.author, "alice");
	});

	it("enriches all missing fields", () => {
		const empty = `---\nname: empty-skill\n---\n\nbody`;
		const r = enrichSkill(empty, "empty-skill");
		assert.equal(r.ok, true);
		assert.ok(r.enriched.includes("license"));
		assert.ok(r.enriched.includes("compatibility"));
		assert.ok(r.enriched.includes("allowed-tools"));
		assert.ok(r.enriched.includes("metadata.author"));
		assert.ok(r.enriched.includes("metadata.homepage"));
		assert.ok(r.enriched.includes("metadata.badi-version"));
		assert.equal(r.meta.license, "MIT");
		assert.equal(r.meta.metadata.author, "fatihkan");
		assert.match(r.meta.metadata.homepage, /badi-skills.*empty-skill/);
	});

	it("enriches name when missing from frontmatter", () => {
		const noname = `---\nlicense: MIT\n---\n\nbody`;
		const r = enrichSkill(noname, "some-name");
		assert.equal(r.meta.name, "some-name");
		assert.ok(r.enriched.includes("name"));
	});

	it("derives description from body when missing", () => {
		const c = `---\nname: x\n---\n\n# Heading\n\nThis is the first paragraph that should land in description.\n`;
		const r = enrichSkill(c, "x");
		assert.match(r.meta.description, /first paragraph/);
		assert.match(r.meta.description, /auto-generated/);
		assert.ok(r.enriched.includes("description"));
	});

	it("guesses category from name when matching KNOWN_CATEGORIES", () => {
		const c = `---\nname: x\n---\n\nbody`;
		for (const [name, expected] of [
			["security", "security"],
			["design", "design"],
			["frontend-taste", "frontend"], // matches via substring
		]) {
			const r = enrichSkill(c, name);
			assert.equal(r.meta.metadata.category, expected, `${name} → ${expected}`);
		}
	});

	it("falls back to 'uncategorized' when no match", () => {
		const c = `---\nname: x\n---\n\nbody`;
		const r = enrichSkill(c, "totally-unique-thing");
		assert.equal(r.meta.metadata.category, "uncategorized");
	});

	it("preserves user-set values, only fills gaps", () => {
		const c = `---
name: mixed
description: User-supplied description, long enough for trigger activation pretty please.
license: Apache-2.0
metadata:
  author: someone-else
---

body`;
		const r = enrichSkill(c, "mixed");
		assert.equal(r.meta.license, "Apache-2.0");
		assert.equal(r.meta.metadata.author, "someone-else");
		// But these were filled
		assert.ok(r.enriched.includes("compatibility"));
		assert.ok(r.enriched.includes("allowed-tools"));
		assert.ok(r.enriched.includes("metadata.homepage"));
	});
});

describe("bundler: serializeSkill (round-trip)", () => {
	it("parse -> serialize -> parse produces equivalent meta", () => {
		const { meta } = parseRichFrontmatter(COMPLETE_SKILL);
		const out = serializeSkill(meta, "\n# Body\n");
		const reparsed = parseRichFrontmatter(out).meta;
		assert.equal(reparsed.name, meta.name);
		assert.equal(reparsed.license, meta.license);
		assert.equal(reparsed.metadata.author, meta.metadata.author);
		assert.equal(reparsed.metadata.category, meta.metadata.category);
	});

	it("emits required fields in deterministic order", () => {
		const { meta } = parseRichFrontmatter(COMPLETE_SKILL);
		const out = serializeSkill(meta, "");
		const lines = out.split("\n");
		const idx = (k) => lines.findIndex((l) => l.startsWith(`${k}:`));
		assert.ok(idx("name") < idx("description"));
		assert.ok(idx("description") < idx("license"));
		assert.ok(idx("license") < idx("compatibility"));
		assert.ok(idx("compatibility") < idx("allowed-tools"));
	});

	it("escapes backslash before double-quote — round-trip stays lossless", () => {
		const { meta } = parseRichFrontmatter(COMPLETE_SKILL);
		// Bir alani problematik kar akterlerle doldur: backslash + tirnak +
		// kontrol karakteri. Eski kod backslash'i escape etmiyordu, sonuc
		// `"\\""` (= `\"` escape edilmis tirnak) gibi yorumlanip parse'da
		// veri kaybına yol aciyordu.
		meta.description = `Path C:\\Users\\test "quoted" — see #note`;
		const out = serializeSkill(meta, "");
		const reparsed = parseRichFrontmatter(out).meta;
		assert.equal(reparsed.description, meta.description);
	});
});

describe("bundler: bundleSkills", () => {
	it("scans source, writes target, no behavior on dry-run", async () => {
		writeSkill("skill-one", COMPLETE_SKILL);
		const dryResult = await bundleSkills({ source, target, dryRun: true });
		assert.equal(dryResult.bundled.length, 1);
		assert.equal(existsSync(target), false, "dry run should not create target");

		const realResult = await bundleSkills({ source, target });
		assert.equal(realResult.bundled.length, 1);
		assert.ok(existsSync(join(target, "skills", "skill-one", "SKILL.md")));
	});

	it("skips directories without SKILL.md", async () => {
		mkdirSync(join(source, "no-skill-md"), { recursive: true });
		writeFileSync(join(source, "no-skill-md", "README.md"), "# stub");
		const r = await bundleSkills({ source, target });
		assert.equal(r.bundled.length, 0);
		assert.equal(r.skipped.length, 1);
		assert.equal(r.skipped[0].reason, "no SKILL.md");
	});

	it("copies references/ subdirectory", async () => {
		const dir = writeSkill("skill-with-refs", COMPLETE_SKILL);
		mkdirSync(join(dir, "references"), { recursive: true });
		writeFileSync(join(dir, "references", "doc.md"), "# extra");
		await bundleSkills({ source, target });
		const refDst = join(
			target,
			"skills",
			"skill-with-refs",
			"references",
			"doc.md",
		);
		assert.ok(existsSync(refDst), "references/doc.md should be copied");
		assert.equal(readFileSync(refDst, "utf-8"), "# extra");
	});

	it("enriches skill missing frontmatter and bundles successfully", async () => {
		writeSkill(
			"design-bare",
			"# Design Skills\n\nThis is the design skills category. It covers UI, UX, and visual identity workflows comprehensively.\n",
		);
		const r = await bundleSkills({ source, target });
		assert.equal(r.bundled.length, 1);
		const out = readFileSync(
			join(target, "skills", "design-bare", "SKILL.md"),
			"utf-8",
		);
		assert.match(out, /name: design-bare/);
		assert.match(out, /license: MIT/);
		assert.match(out, /author: fatihkan/);
	});

	it("strict mode rejects soft warnings", async () => {
		writeSkill(
			"short-desc",
			`---\nname: short-desc\ndescription: tiny\n---\n\nbody`,
		);
		const r = await bundleSkills({ source, target, strict: true });
		// Strict promotes the <50 char description warning to an error,
		// so this skill is skipped.
		assert.equal(r.bundled.length, 0);
		assert.equal(r.skipped.length, 1);
	});

	it("totalSkills reflects bundled + skipped", async () => {
		writeSkill("ok-one", COMPLETE_SKILL);
		mkdirSync(join(source, "no-skill-md"), { recursive: true });
		const r = await bundleSkills({ source, target });
		assert.equal(r.totalSkills, 2);
	});
});

describe("bundler: generateRouterSkill", () => {
	it("groups by category and outputs frontmatter + sections", () => {
		const bundled = [
			{ name: "alpha", category: "design" },
			{ name: "beta", category: "security" },
			{ name: "gamma", category: "design" },
		];
		const out = generateRouterSkill(bundled);
		assert.match(out, /name: badi/);
		assert.match(out, /## design/);
		assert.match(out, /## security/);
		// sorted alphabetically within category
		const designIdx = out.indexOf("## design");
		const securityIdx = out.indexOf("## security");
		const alphaIdx = out.indexOf("alpha");
		const gammaIdx = out.indexOf("gamma");
		assert.ok(designIdx < alphaIdx && alphaIdx < gammaIdx);
		assert.ok(gammaIdx < securityIdx);
	});

	it("handles uncategorized entries", () => {
		const out = generateRouterSkill([{ name: "orphan" }]);
		assert.match(out, /## uncategorized/);
		assert.match(out, /\[orphan\]/);
	});
});
