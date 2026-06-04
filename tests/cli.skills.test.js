// Badi skills komutu testleri (v1.17+ opt-in model).

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");

function run(args, cwd) {
	return execFileSync("node", [CLI, ...args], {
		cwd,
		encoding: "utf-8",
		timeout: 10000,
	});
}

function setupFixture() {
	const dir = mkdtempSync(join(tmpdir(), "badi-skills-test-"));
	const claudeDir = join(dir, ".claude");
	const vault = join(claudeDir, "skills-vault");
	const active = join(claudeDir, "skills");
	mkdirSync(vault, { recursive: true });
	mkdirSync(active, { recursive: true });

	// Sahte 3 skill yarat
	for (const name of ["seo", "marketing", "security"]) {
		const sd = join(vault, name);
		mkdirSync(sd, { recursive: true });
		writeFileSync(
			join(sd, "SKILL.md"),
			`---\nname: ${name}\ndescription: Test skill ${name}\n---\n\nBody.\n`,
		);
	}
	return dir;
}

describe("badi skills", () => {
	let cwd;

	beforeEach(() => {
		cwd = setupFixture();
	});

	afterEach(() => {
		rmSync(cwd, { recursive: true, force: true });
	});

	it("--help shows usage", () => {
		const out = run(["skills", "--help"], cwd);
		assert.match(out, /Skills Management/);
		assert.match(out, /add/);
		assert.match(out, /clear/);
	});

	it("available lists all skills in the vault", () => {
		const out = run(["skills", "available"], cwd);
		assert.match(out, /seo/);
		assert.match(out, /marketing/);
		assert.match(out, /security/);
		assert.match(out, /Vault \(3 skills\)/);
	});

	it("list shows none when empty", () => {
		const out = run(["skills", "list"], cwd);
		assert.match(out, /Active skills \(0\)/);
		assert.match(out, /none/);
	});

	it("add activates a single skill", () => {
		const out = run(["skills", "add", "seo"], cwd);
		assert.match(out, /\+ seo/);
		assert.ok(existsSync(join(cwd, ".claude", "skills", "seo", "SKILL.md")));
	});

	it("add activates multiple skills", () => {
		run(["skills", "add", "seo", "marketing"], cwd);
		const list = run(["skills", "list"], cwd);
		assert.match(list, /seo/);
		assert.match(list, /marketing/);
		assert.doesNotMatch(list, /security/);
	});

	it("add skips re-adding the same skill", () => {
		run(["skills", "add", "seo"], cwd);
		const out = run(["skills", "add", "seo"], cwd);
		assert.match(out, /already active/);
	});

	it("add throws an error for a nonexistent skill", () => {
		try {
			run(["skills", "add", "nonexistent"], cwd);
			assert.fail("Hata bekleniyor");
		} catch (e) {
			assert.equal(e.status, 1);
			assert.match(e.stderr || e.stdout, /Not found in vault/);
		}
	});

	it("remove removes an active skill", () => {
		run(["skills", "add", "seo", "marketing"], cwd);
		const out = run(["skills", "remove", "seo"], cwd);
		assert.match(out, /- seo/);
		assert.ok(!existsSync(join(cwd, ".claude", "skills", "seo")));
		assert.ok(existsSync(join(cwd, ".claude", "skills", "marketing")));
	});

	it("clear resets all active skills", () => {
		run(["skills", "add", "seo", "marketing", "security"], cwd);
		const out = run(["skills", "clear"], cwd);
		assert.match(out, /3 active skills reset/);
		const list = run(["skills", "list"], cwd);
		assert.match(list, /Active skills \(0\)/);
	});

	it("reset does the same thing as clear", () => {
		run(["skills", "add", "seo"], cwd);
		const out = run(["skills", "reset"], cwd);
		assert.match(out, /1 active skills reset/);
	});

	it("clear warns quietly on an empty list", () => {
		const out = run(["skills", "clear"], cwd);
		assert.match(out, /nothing to reset/);
	});

	it("a call without arguments shows the status table (non-TTY)", () => {
		const out = run(["skills"], cwd);
		assert.match(out, /Skills status: 0\/3 active/);
		assert.match(out, /requires a TTY/);
	});

	it("throws an error when the vault is missing", () => {
		// Vault'u sil
		rmSync(join(cwd, ".claude", "skills-vault"), { recursive: true });
		try {
			run(["skills", "available"], cwd);
			assert.fail("Hata bekleniyor");
		} catch (e) {
			assert.equal(e.status, 1);
			assert.match(e.stderr || e.stdout, /skills-vault not found/);
		}
	});
});
