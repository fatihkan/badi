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

	it("--help kullanim gosterir", () => {
		const out = run(["skills", "--help"], cwd);
		assert.match(out, /Skills Management/);
		assert.match(out, /add/);
		assert.match(out, /clear/);
	});

	it("available vault'taki tum skill'leri listeler", () => {
		const out = run(["skills", "available"], cwd);
		assert.match(out, /seo/);
		assert.match(out, /marketing/);
		assert.match(out, /security/);
		assert.match(out, /Vault \(3 skills\)/);
	});

	it("list bos durumda hicbiri gosterir", () => {
		const out = run(["skills", "list"], cwd);
		assert.match(out, /Active skills \(0\)/);
		assert.match(out, /none/);
	});

	it("add tek skill'i aktif eder", () => {
		const out = run(["skills", "add", "seo"], cwd);
		assert.match(out, /\+ seo/);
		assert.ok(existsSync(join(cwd, ".claude", "skills", "seo", "SKILL.md")));
	});

	it("add birden fazla skill'i aktif eder", () => {
		run(["skills", "add", "seo", "marketing"], cwd);
		const list = run(["skills", "list"], cwd);
		assert.match(list, /seo/);
		assert.match(list, /marketing/);
		assert.doesNotMatch(list, /security/);
	});

	it("add ayni skill'i tekrarlamayi atlar", () => {
		run(["skills", "add", "seo"], cwd);
		const out = run(["skills", "add", "seo"], cwd);
		assert.match(out, /already active/);
	});

	it("add olmayan skill icin hata firlatir", () => {
		try {
			run(["skills", "add", "nonexistent"], cwd);
			assert.fail("Hata bekleniyor");
		} catch (e) {
			assert.equal(e.status, 1);
			assert.match(e.stderr || e.stdout, /Not found in vault/);
		}
	});

	it("remove aktif skill'i kaldirir", () => {
		run(["skills", "add", "seo", "marketing"], cwd);
		const out = run(["skills", "remove", "seo"], cwd);
		assert.match(out, /- seo/);
		assert.ok(!existsSync(join(cwd, ".claude", "skills", "seo")));
		assert.ok(existsSync(join(cwd, ".claude", "skills", "marketing")));
	});

	it("clear tum aktif skill'leri sifirlar", () => {
		run(["skills", "add", "seo", "marketing", "security"], cwd);
		const out = run(["skills", "clear"], cwd);
		assert.match(out, /3 active skills reset/);
		const list = run(["skills", "list"], cwd);
		assert.match(list, /Active skills \(0\)/);
	});

	it("reset clear ile ayni isi yapar", () => {
		run(["skills", "add", "seo"], cwd);
		const out = run(["skills", "reset"], cwd);
		assert.match(out, /1 active skills reset/);
	});

	it("clear bos listede sessizce uyarir", () => {
		const out = run(["skills", "clear"], cwd);
		assert.match(out, /nothing to reset/);
	});

	it("argumansiz cagri durum tablosu gosterir (non-TTY)", () => {
		const out = run(["skills"], cwd);
		assert.match(out, /Skills status: 0\/3 active/);
		assert.match(out, /requires a TTY/);
	});

	it("vault yoksa hata firlatir", () => {
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
