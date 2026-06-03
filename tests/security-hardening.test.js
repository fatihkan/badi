// Regression guards for the security hardening pass:
//  Y1 — skills add/remove path traversal
//  O1 — plugin install git argument injection
//  O3a — tasarim export --write project-root scope
//  O3b — secret-scan --ignore-file / --patterns project-root scope

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { isValidSkillName } from "../lib/commands/skills.js";

const BIN = join(import.meta.dirname, "..", "bin", "badi.js");
const TMP = join(import.meta.dirname, ".test-tmp-security");

function run(cwd, ...args) {
	return spawnSync("node", [BIN, ...args], {
		encoding: "utf-8",
		timeout: 10000,
		cwd,
	});
}

function setupBadiProject() {
	if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
	mkdirSync(join(TMP, ".claude", "skills-vault", "real-skill"), {
		recursive: true,
	});
	writeFileSync(
		join(TMP, ".claude", "skills-vault", "real-skill", "SKILL.md"),
		"---\nname: real-skill\n---\n",
	);
	mkdirSync(join(TMP, ".claude", "skills"), { recursive: true });
}

describe("Y1 — skills name validation (path traversal)", () => {
	it("isValidSkillName: meşru kebab-case adlar gecerli", () => {
		assert.equal(isValidSkillName("seo"), true);
		assert.equal(isValidSkillName("expo-eas-build"), true);
		assert.equal(isValidSkillName("pentest-recon-output"), true);
	});

	it("isValidSkillName: traversal adlari reddeder", () => {
		assert.equal(isValidSkillName("../etc"), false);
		assert.equal(isValidSkillName("../../secrets"), false);
		assert.equal(isValidSkillName("/etc/passwd"), false);
		assert.equal(isValidSkillName(".hidden"), false);
		assert.equal(isValidSkillName("foo/bar"), false);
		assert.equal(isValidSkillName("foo\\bar"), false);
		assert.equal(isValidSkillName(""), false);
		assert.equal(isValidSkillName(null), false);
		assert.equal(isValidSkillName("UPPER"), false);
	});

	describe("CLI", () => {
		beforeEach(setupBadiProject);
		afterEach(() => {
			if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
		});

		it("badi skills add '../<existing-dir>' reddedilir, dosya kopyalanmaz", () => {
			// Sibling dir oluşturalim ki path traversal hedefi var olsun
			mkdirSync(join(TMP, "external-secrets"), { recursive: true });
			writeFileSync(join(TMP, "external-secrets", "leak.txt"), "ATTACKER");
			const r = run(TMP, "skills", "add", "../external-secrets");
			assert.ok(
				r.status !== 0 ||
					r.stderr.includes("Not found in vault") ||
					r.stdout.includes("Not found in vault"),
				"path traversal reddedilmeli",
			);
			// External secrets active skills'e kopyalanmamali
			assert.ok(
				!existsSync(join(TMP, ".claude", "skills", "external-secrets")),
			);
			assert.ok(!existsSync(join(TMP, ".claude", "external-secrets")));
		});

		it("badi skills add 'real-skill' calismaya devam eder", () => {
			const r = run(TMP, "skills", "add", "real-skill");
			assert.equal(r.status, 0);
			assert.ok(existsSync(join(TMP, ".claude", "skills", "real-skill")));
		});
	});
});

describe("O1 — plugin install git argument injection", () => {
	beforeEach(setupBadiProject);
	afterEach(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
	});

	it("kaynak '-' ile basliyorsa reddedilir (git flag injection)", () => {
		const r = run(TMP, "plugin", "install", "--upload-pack=evil");
		assert.ok(r.status !== 0);
		assert.ok(
			r.stderr.includes("Invalid source") ||
				r.stdout.includes("Invalid source"),
		);
	});

	it("kaynak '-u' ile basliyorsa reddedilir", () => {
		const r = run(TMP, "plugin", "install", "-u");
		assert.ok(r.status !== 0);
	});
});

describe("O3a — tasarim export --write project root scope", () => {
	beforeEach(() => {
		setupBadiProject();
		// DESIGN.md icin minimal fixture
		mkdirSync(join(TMP, ".claude", "workspace"), { recursive: true });
		writeFileSync(
			join(TMP, ".claude", "workspace", "DESIGN.md"),
			"---\nname: t\ncolors:\n  primary: '#000'\n---\n",
		);
	});
	afterEach(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
	});

	it("--write '../escape.css' outside project root reddedilir", () => {
		const r = run(
			TMP,
			"design",
			"export",
			"--format",
			"tailwind",
			"--write",
			"../escape.css",
		);
		// Hata mesaji veya assert exit 1
		assert.ok(r.status !== 0);
		assert.ok(
			r.stderr.includes("outside project root") ||
				r.stdout.includes("outside project root"),
		);
	});
});

describe("O3b — secret-scan --ignore-file / --patterns project root scope", () => {
	beforeEach(setupBadiProject);
	afterEach(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
	});

	it("--ignore-file '/etc/passwd' reddedilir", () => {
		const r = run(TMP, "secret-scan", "--ignore-file", "/etc/passwd");
		assert.ok(r.status !== 0);
		assert.ok(
			r.stderr.includes("outside project root") ||
				r.stdout.includes("outside project root"),
		);
	});

	it("--patterns '../foo.json' reddedilir", () => {
		const r = run(TMP, "secret-scan", "--patterns", "../foo.json");
		assert.ok(r.status !== 0);
		assert.ok(
			r.stderr.includes("outside project root") ||
				r.stdout.includes("outside project root"),
		);
	});

	it("Proje icindeki .secretignore hala calisir", () => {
		writeFileSync(join(TMP, ".secretignore"), "jwt\n");
		const r = run(TMP, "secret-scan");
		assert.equal(r.status, 0);
	});
});

describe("O2 — test fixture split-string check (meta)", () => {
	it("tests/cli.secret-scan.test.js dosyasinda working tree finding yok", () => {
		// Repo kokunden secret-scan calistir; eger O2 fix kaybolursa
		// bu test fail eder (test fixture'lar yine flag'lenir).
		const repo = join(import.meta.dirname, "..");
		const r = run(repo, "secret-scan", "--format", "json");
		assert.equal(r.status, 0, "Repo working tree temiz olmali (O2 fix)");
	});
});
