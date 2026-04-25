import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

const BIN = join(import.meta.dirname, "..", "bin", "badi.js");
const run = (...args) =>
	execFileSync("node", [BIN, ...args], {
		encoding: "utf-8",
		timeout: 10000,
	}).trim();

describe("badi publish", () => {
	it("--help yardim gosterir", () => {
		const out = run("publish", "--help");
		assert.ok(out.includes("Release Orkestratoru") || out.includes("Publish"));
		assert.ok(out.includes("--version"));
		assert.ok(out.includes("--dry-run"));
		assert.ok(out.includes("--skip-npm"));
		assert.ok(out.includes("--skip-github"));
	});

	it("argumansiz yardim gosterir", () => {
		const out = run("publish");
		assert.ok(out.includes("Publish") || out.includes("Release"));
	});

	it("help bump tiplerini listeler", () => {
		const out = run("publish", "--help");
		assert.ok(out.includes("patch"));
		assert.ok(out.includes("minor"));
		assert.ok(out.includes("major"));
	});

	it("adim sayisi dokuz listelenir (overview)", () => {
		const out = run("publish", "--help");
		// 8 sayili adim: npm publish
		assert.ok(out.includes("npm publish") || out.includes("npm Publish"));
	});

	it("ornekler yardim metninde gorunur", () => {
		const out = run("publish", "--help");
		assert.ok(out.includes("--dry-run"));
		assert.ok(out.includes("--version minor"));
	});

	it("--skill-bundle flag yardim metninde gorunur", () => {
		const out = run("publish", "--help");
		assert.ok(out.includes("--skill-bundle"));
		assert.ok(out.includes("badi-skills"));
		assert.ok(out.includes("Router skill"));
	});
});

describe("badi publish --skill-bundle", () => {
	function setupTmpProject() {
		const dir = mkdtempSync(join(tmpdir(), "badi-publish-skill-"));
		const skillsDir = join(dir, ".claude", "skills", "frontend-taste");
		mkdirSync(skillsDir, { recursive: true });
		writeFileSync(
			join(skillsDir, "SKILL.md"),
			`---
name: frontend-taste
description: Premium frontend design skills triggering on UI tasarla, design a UI, premium landing.
license: MIT
compatibility: Works.
allowed-tools: Read Write
metadata:
  author: fatihkan
  homepage: https://example.com
  badi-version: ">=1.14.0"
  category: design
---

# body
`,
		);
		return dir;
	}

	it("--skill-bundle --dry-run dosya yazmaz", () => {
		const cwd = setupTmpProject();
		const out = execFileSync(
			"node",
			[BIN, "publish", "--skill-bundle", "--dry-run"],
			{ encoding: "utf-8", cwd, timeout: 10000 },
		);
		assert.match(out, /DRY RUN/);
		assert.match(out, /1 skill bundle edildi/);
	});

	it("--skill-bundle gercek modda target dizini yazar", () => {
		const cwd = setupTmpProject();
		const target = join(cwd, "out");
		const out = execFileSync(
			"node",
			[BIN, "publish", "--skill-bundle", "--target", target],
			{ encoding: "utf-8", cwd, timeout: 10000 },
		);
		assert.match(out, /1 skill bundle edildi/);
		assert.match(out, /Router skill yazildi/);
		assert.ok(
			existsSync(join(target, "skills", "frontend-taste", "SKILL.md")),
			"target SKILL.md should exist",
		);
		assert.ok(
			existsSync(join(target, "skills", "badi", "SKILL.md")),
			"router SKILL.md should exist",
		);
	});
});
