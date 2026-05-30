// Skills auto-router testleri.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
	buildContextInjection,
	buildSkillIndex,
	indexSkill,
	routePrompt,
} from "../lib/skills-router.js";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");

function setupVault() {
	const dir = mkdtempSync(join(tmpdir(), "badi-router-test-"));
	const vault = join(dir, ".claude", "skills-vault");
	mkdirSync(vault, { recursive: true });
	mkdirSync(join(dir, ".claude", "skills"), { recursive: true });

	const skills = {
		seo: "Technical SEO and content SEO. Triggers on: SEO, schema, keyword research, meta tags.",
		marketing:
			"Email marketing, social media, growth. Triggers on: campaign, marketing, growth.",
		design:
			"UI design and prototyping. Triggers on: UI, prototype, wireframe, figma.",
		"seo-crawl-budget":
			"Dusuk rekabetli long-tail keyword'ler icin 6-24 saatte indexlenme metodolojisi. Triggers on: crawl budget, crawl butcesi, long-tail, indexleme, search console, internal linking, ic linkleme, sitemap, hizli index, fast indexing.",
	};
	for (const [name, desc] of Object.entries(skills)) {
		mkdirSync(join(vault, name), { recursive: true });
		writeFileSync(
			join(vault, name, "SKILL.md"),
			`---\nname: ${name}\ndescription: ${desc}\n---\n\nBody for ${name}.\n`,
		);
	}
	return { dir, vault };
}

describe("skills-router: routePrompt", () => {
	let fixture;

	beforeEach(() => {
		fixture = setupVault();
	});

	afterEach(() => {
		rmSync(fixture.dir, { recursive: true, force: true });
	});

	it("trigger eslesmesi description'dan daha guclu skor", () => {
		const idx = buildSkillIndex(fixture.vault);
		const matched = routePrompt("schema markup ekle", idx);
		assert.ok(matched.length > 0);
		assert.equal(matched[0].name, "seo");
		// "schema" trigger'da var → skor >= 3
		assert.ok(matched[0].score >= 3);
	});

	it("eslesen skill yoksa bos array", () => {
		const idx = buildSkillIndex(fixture.vault);
		const matched = routePrompt("xyz unrelated", idx);
		assert.equal(matched.length, 0);
	});

	it("birden fazla skill eslesirse skor azalan sirali", () => {
		const idx = buildSkillIndex(fixture.vault);
		const matched = routePrompt("SEO icin meta tag ekle, marketing icin", idx);
		assert.ok(matched.length >= 1);
		for (let i = 1; i < matched.length; i++) {
			assert.ok(matched[i - 1].score >= matched[i].score);
		}
	});

	it("top sinirli", () => {
		const idx = buildSkillIndex(fixture.vault);
		const matched = routePrompt("SEO marketing UI ", idx, { top: 2 });
		assert.ok(matched.length <= 2);
	});

	it("minScore esik altindakileri eler", () => {
		const idx = buildSkillIndex(fixture.vault);
		const matched = routePrompt("SEO", idx, { minScore: 100 });
		assert.equal(matched.length, 0);
	});

	it("bos prompt -> bos sonuc", () => {
		const idx = buildSkillIndex(fixture.vault);
		assert.deepEqual(routePrompt("", idx), []);
		assert.deepEqual(routePrompt("   ", idx), []);
	});

	it("stopword'ler skorlanmaz", () => {
		const idx = buildSkillIndex(fixture.vault);
		// "the and is" tum stopword
		const matched = routePrompt("the and is do you", idx);
		assert.equal(matched.length, 0);
	});

	it("matched.triggers eslesen trigger token'larini iceriyor", () => {
		const idx = buildSkillIndex(fixture.vault);
		const matched = routePrompt("schema markup", idx);
		assert.ok(matched[0].matched.triggers.includes("schema"));
	});

	it("seo-crawl-budget TR prompt tetikler (indexleme + search console)", () => {
		const idx = buildSkillIndex(fixture.vault);
		const matched = routePrompt(
			"blog yazilarim 24 saatte indexlenmiyor, search console crawl ne diyor",
			idx,
		);
		assert.ok(matched.length > 0);
		assert.equal(matched[0].name, "seo-crawl-budget");
	});

	it("seo-crawl-budget EN prompt tetikler (long-tail + fast indexing)", () => {
		const idx = buildSkillIndex(fixture.vault);
		const matched = routePrompt(
			"need fast indexing for long-tail keywords on new site",
			idx,
		);
		assert.ok(matched.length > 0);
		assert.equal(matched[0].name, "seo-crawl-budget");
	});

	it("seo-crawl-budget 'crawl budget' iki kelimeli ifadeyi yakalar", () => {
		const idx = buildSkillIndex(fixture.vault);
		const matched = routePrompt(
			"crawl budget optimizasyonu yapmak istiyorum",
			idx,
		);
		assert.ok(matched.length > 0);
		assert.equal(matched[0].name, "seo-crawl-budget");
	});
});

describe("skills-router: indexSkill", () => {
	let fixture;
	beforeEach(() => {
		fixture = setupVault();
	});
	afterEach(() => {
		rmSync(fixture.dir, { recursive: true, force: true });
	});

	it("frontmatter parse + token cikarimi", () => {
		const idx = indexSkill(join(fixture.vault, "seo"));
		assert.equal(idx.name, "seo");
		assert.ok(idx.descriptionTokens.size > 0);
		assert.ok(idx.triggerTokens.has("schema"));
		assert.ok(idx.triggerTokens.has("seo"));
	});

	it("eksik SKILL.md null doner", () => {
		mkdirSync(join(fixture.vault, "empty-skill"), { recursive: true });
		const idx = indexSkill(join(fixture.vault, "empty-skill"));
		assert.equal(idx, null);
	});

	it("frontmatter olmayan SKILL.md null doner", () => {
		mkdirSync(join(fixture.vault, "no-fm"), { recursive: true });
		writeFileSync(join(fixture.vault, "no-fm", "SKILL.md"), "Just body.");
		const idx = indexSkill(join(fixture.vault, "no-fm"));
		assert.equal(idx, null);
	});
});

describe("skills-router: buildContextInjection", () => {
	let fixture;
	beforeEach(() => {
		fixture = setupVault();
	});
	afterEach(() => {
		rmSync(fixture.dir, { recursive: true, force: true });
	});

	it("matched yoksa bos string", () => {
		assert.equal(buildContextInjection([], []), "");
	});

	it("match'leri SKILL.md govdesi olarak yazar", () => {
		const idx = buildSkillIndex(fixture.vault);
		const matched = routePrompt("schema markup keyword", idx);
		const blob = buildContextInjection(matched, idx);
		assert.match(blob, /Auto-Activated Skills/);
		assert.match(blob, /Skill: seo/);
		assert.match(blob, /Body for seo/);
	});

	it("birden fazla skill ayrac ile ayrilir", () => {
		const idx = buildSkillIndex(fixture.vault);
		const matched = routePrompt("SEO marketing UI prototype", idx);
		const blob = buildContextInjection(matched, idx);
		const sectionCount = (blob.match(/## Skill:/g) || []).length;
		assert.equal(sectionCount, matched.length);
	});
});

describe("skills-router: CLI integration", () => {
	let fixture;
	beforeEach(() => {
		fixture = setupVault();
	});
	afterEach(() => {
		rmSync(fixture.dir, { recursive: true, force: true });
	});

	it("badi skills route eslesen skill'leri yazar", () => {
		const out = execFileSync(
			"node",
			[CLI, "skills", "route", "schema markup keyword"],
			{ cwd: fixture.dir, encoding: "utf-8", timeout: 10000 },
		);
		assert.match(out, /seo/);
	});

	it("badi skills route --json yapilandirilmis cikti", () => {
		const out = execFileSync(
			"node",
			[CLI, "skills", "route", "--json", "schema markup"],
			{ cwd: fixture.dir, encoding: "utf-8", timeout: 10000 },
		);
		const parsed = JSON.parse(out);
		assert.ok(parsed.matched);
		assert.ok(parsed.matched.some((m) => m.name === "seo"));
	});

	it("badi skills route --inject SKILL.md govdesi yazar", () => {
		const out = execFileSync(
			"node",
			[CLI, "skills", "route", "--inject", "schema markup"],
			{ cwd: fixture.dir, encoding: "utf-8", timeout: 10000 },
		);
		assert.match(out, /Auto-Activated Skills/);
		assert.match(out, /Body for seo/);
	});

	it("badi skills route prompt yoksa hata", () => {
		assert.throws(() => {
			execFileSync("node", [CLI, "skills", "route"], {
				cwd: fixture.dir,
				encoding: "utf-8",
				timeout: 10000,
				stdio: "pipe",
				input: "", // empty stdin
			});
		});
	});

	it("badi skills auto status default kapali", () => {
		const out = execFileSync("node", [CLI, "skills", "auto", "status"], {
			cwd: fixture.dir,
			encoding: "utf-8",
			timeout: 10000,
		});
		assert.match(out, /disabled/);
	});

	it("badi skills auto on settings.json'a hook ekler", () => {
		execFileSync("node", [CLI, "skills", "auto", "on"], {
			cwd: fixture.dir,
			encoding: "utf-8",
			timeout: 10000,
		});
		const settingsPath = join(fixture.dir, ".claude", "settings.json");
		assert.ok(existsSync(settingsPath));
		const settings = JSON.parse(readFileSync(settingsPath, "utf-8"));
		assert.ok(settings.hooks.UserPromptSubmit);
		assert.ok(
			settings.hooks.UserPromptSubmit.some((entry) =>
				JSON.stringify(entry).includes("skill-router.sh"),
			),
		);
	});

	it("badi skills auto off hook'u kaldirir", () => {
		execFileSync("node", [CLI, "skills", "auto", "on"], {
			cwd: fixture.dir,
			encoding: "utf-8",
			timeout: 10000,
		});
		execFileSync("node", [CLI, "skills", "auto", "off"], {
			cwd: fixture.dir,
			encoding: "utf-8",
			timeout: 10000,
		});
		const settingsPath = join(fixture.dir, ".claude", "settings.json");
		const settings = JSON.parse(readFileSync(settingsPath, "utf-8"));
		const has =
			settings.hooks?.UserPromptSubmit?.some((entry) =>
				JSON.stringify(entry).includes("skill-router.sh"),
			) ?? false;
		assert.equal(has, false);
	});

	it("--help auto-router bolumu listeler", () => {
		const out = execFileSync("node", [CLI, "skills", "--help"], {
			encoding: "utf-8",
			timeout: 10000,
		});
		assert.match(out, /Auto-router/);
		assert.match(out, /badi skills route/);
		assert.match(out, /badi skills auto/);
	});
});
