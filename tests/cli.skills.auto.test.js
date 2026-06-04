// `badi skills detect` + `badi skills auto-install` subprocess testleri.
//
// Vault gerektigi icin geçici proje altinda gerekli skills-vault iskelesini
// kuruyoruz; gercek vault icerigine bagimli olmadan calisir.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const REPO_ROOT = resolve(__dirname, "..");
const BADI = join(REPO_ROOT, "bin", "badi.js");

function setupProject({ deps = {}, devDeps = {}, files = {} } = {}) {
	const dir = mkdtempSync(join(tmpdir(), "badi-skills-auto-"));
	mkdirSync(join(dir, ".claude", "skills-vault", "design"), {
		recursive: true,
	});
	mkdirSync(join(dir, ".claude", "skills-vault", "frontend-taste"), {
		recursive: true,
	});
	mkdirSync(join(dir, ".claude", "skills-vault", "testing"), {
		recursive: true,
	});
	mkdirSync(join(dir, ".claude", "skills-vault", "finance"), {
		recursive: true,
	});
	mkdirSync(join(dir, ".claude", "skills-vault", "seo"), { recursive: true });
	mkdirSync(join(dir, ".claude", "skills-vault", "seo-crawl-budget"), {
		recursive: true,
	});
	mkdirSync(join(dir, ".claude", "skills-vault", "development"), {
		recursive: true,
	});
	mkdirSync(join(dir, ".claude", "skills-vault", "mobile"), {
		recursive: true,
	});
	// Minimal SKILL.md frontmatter
	for (const name of [
		"design",
		"frontend-taste",
		"testing",
		"finance",
		"seo",
		"seo-crawl-budget",
		"development",
		"mobile",
	]) {
		writeFileSync(
			join(dir, ".claude", "skills-vault", name, "SKILL.md"),
			`---\nname: ${name}\ndescription: ${name} skill\n---\n# ${name}\n`,
		);
	}
	// package.json
	writeFileSync(
		join(dir, "package.json"),
		JSON.stringify(
			{ name: "tst", dependencies: deps, devDependencies: devDeps },
			null,
			2,
		),
	);
	// Ek dosyalar
	for (const [name, content] of Object.entries(files)) {
		writeFileSync(join(dir, name), content);
	}
	return dir;
}

describe("badi skills detect", () => {
	let dir;
	afterEach(() => {
		if (dir) rmSync(dir, { recursive: true, force: true });
		dir = null;
	});

	it("React project is detected + suggested categories are listed", () => {
		dir = setupProject({ deps: { react: "^18", "react-dom": "^18" } });
		const r = spawnSync("node", [BADI, "skills", "detect"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 0, `stderr: ${r.stderr}`);
		assert.match(r.stdout, /Stack detected: 1 technologies/);
		assert.match(r.stdout, /React/);
		assert.match(r.stdout, /design/);
		assert.match(r.stdout, /frontend-taste/);
	});

	it("empty project shows 0 technologies message", () => {
		dir = setupProject();
		const r = spawnSync("node", [BADI, "skills", "detect"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 0);
		assert.match(r.stdout, /no match|0 technologies/);
	});

	it("SEO categories appear when Next.js is added", () => {
		dir = setupProject({
			deps: { next: "^14" },
			files: { "next.config.mjs": "" },
		});
		const r = spawnSync("node", [BADI, "skills", "detect"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 0);
		assert.match(r.stdout, /Next\.js/);
		assert.match(r.stdout, /seo-crawl-budget/);
	});
});

describe("badi skills auto-install", () => {
	let dir;
	afterEach(() => {
		if (dir) rmSync(dir, { recursive: true, force: true });
		dir = null;
	});

	it("--dry-run writes no file", () => {
		dir = setupProject({ deps: { react: "^18" } });
		const r = spawnSync("node", [BADI, "skills", "auto-install", "--dry-run"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 0);
		assert.match(r.stdout, /--dry-run active/);
		// .claude/skills/ olusturulmus olabilir ama design KOPYALANMAMIS olmali
		const installed = join(dir, ".claude", "skills", "design");
		assert.equal(existsSync(installed), false);
	});

	it("--yes activates non-interactively", () => {
		dir = setupProject({ deps: { react: "^18" } });
		const r = spawnSync("node", [BADI, "skills", "auto-install", "--yes"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 0, `stderr: ${r.stderr}`);
		assert.match(r.stdout, /\d+ added/);
		assert.equal(existsSync(join(dir, ".claude", "skills", "design")), true);
		assert.equal(
			existsSync(join(dir, ".claude", "skills", "frontend-taste")),
			true,
		);
	});

	it("all skills already active -> no changes", () => {
		dir = setupProject({ deps: { react: "^18" } });
		// Ilk calistirma
		spawnSync("node", [BADI, "skills", "auto-install", "--yes"], {
			cwd: dir,
			encoding: "utf-8",
		});
		// Ikinci
		const r = spawnSync("node", [BADI, "skills", "auto-install", "--yes"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 0);
		assert.match(r.stdout, /already active/);
	});

	it("no stack -> no changes message", () => {
		dir = setupProject();
		const r = spawnSync("node", [BADI, "skills", "auto-install", "--yes"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 0);
		assert.match(r.stdout, /No stack detected|no changes/);
	});

	it("non-TTY without --yes exits 1 (CI safety)", () => {
		dir = setupProject({ deps: { react: "^18" } });
		const r = spawnSync("node", [BADI, "skills", "auto-install"], {
			cwd: dir,
			encoding: "utf-8",
			stdio: ["ignore", "pipe", "pipe"],
		});
		assert.equal(r.status, 1, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
		assert.match(r.stderr, /--yes|TTY/);
	});

	it("--yes + --dry-run: dry-run wins, no file written", () => {
		dir = setupProject({ deps: { react: "^18" } });
		const r = spawnSync(
			"node",
			[BADI, "skills", "auto-install", "--yes", "--dry-run"],
			{ cwd: dir, encoding: "utf-8" },
		);
		assert.equal(r.status, 0);
		assert.match(r.stdout, /--dry-run active/);
		assert.equal(existsSync(join(dir, ".claude", "skills", "design")), false);
	});

	it("stack detected but no suitable category in vault -> warning", () => {
		// React projesi ama vault'tan design ve frontend-taste'i kaldir
		dir = setupProject({ deps: { react: "^18" } });
		rmSync(join(dir, ".claude", "skills-vault", "design"), {
			recursive: true,
			force: true,
		});
		rmSync(join(dir, ".claude", "skills-vault", "frontend-taste"), {
			recursive: true,
			force: true,
		});
		const r = spawnSync("node", [BADI, "skills", "auto-install", "--yes"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 0);
		assert.match(r.stdout, /No suitable skill category in the vault/);
	});
});

describe("badi skills --help: new commands appear", () => {
	it("detect and auto-install are listed in help", () => {
		const r = spawnSync("node", [BADI, "skills", "--help"], {
			encoding: "utf-8",
		});
		assert.equal(r.status, 0);
		assert.match(r.stdout, /badi skills detect/);
		assert.match(r.stdout, /badi skills auto-install/);
	});
});
