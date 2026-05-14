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

	it("React projesi tespit edilir + onerilen kategoriler listelenir", () => {
		dir = setupProject({ deps: { react: "^18", "react-dom": "^18" } });
		const r = spawnSync("node", [BADI, "skills", "detect"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 0, `stderr: ${r.stderr}`);
		assert.match(r.stdout, /Stack tespit: 1 teknoloji/);
		assert.match(r.stdout, /React/);
		assert.match(r.stdout, /design/);
		assert.match(r.stdout, /frontend-taste/);
	});

	it("bos proje 0 teknoloji mesaji", () => {
		dir = setupProject();
		const r = spawnSync("node", [BADI, "skills", "detect"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 0);
		assert.match(r.stdout, /eslesme yok|0 teknoloji/);
	});

	it("Next.js eklenirse SEO kategorileri gelir", () => {
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

	it("--dry-run dosyaya yazmaz", () => {
		dir = setupProject({ deps: { react: "^18" } });
		const r = spawnSync("node", [BADI, "skills", "auto-install", "--dry-run"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 0);
		assert.match(r.stdout, /--dry-run aktif/);
		// .claude/skills/ olusturulmus olabilir ama design KOPYALANMAMIS olmali
		const installed = join(dir, ".claude", "skills", "design");
		assert.equal(existsSync(installed), false);
	});

	it("--yes ile interaktifsiz aktive eder", () => {
		dir = setupProject({ deps: { react: "^18" } });
		const r = spawnSync("node", [BADI, "skills", "auto-install", "--yes"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 0, `stderr: ${r.stderr}`);
		assert.match(r.stdout, /\d+ eklendi/);
		assert.equal(existsSync(join(dir, ".claude", "skills", "design")), true);
		assert.equal(
			existsSync(join(dir, ".claude", "skills", "frontend-taste")),
			true,
		);
	});

	it("zaten aktif olan tum skill'ler -> degisiklik yok", () => {
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
		assert.match(r.stdout, /zaten aktif/);
	});

	it("stack yok -> degisiklik yok mesaji", () => {
		dir = setupProject();
		const r = spawnSync("node", [BADI, "skills", "auto-install", "--yes"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.equal(r.status, 0);
		assert.match(r.stdout, /Stack tespit edilmedi|degisiklik yok/);
	});

	it("non-TTY + --yes yoksa exit 1 (CI guvenligi)", () => {
		dir = setupProject({ deps: { react: "^18" } });
		const r = spawnSync("node", [BADI, "skills", "auto-install"], {
			cwd: dir,
			encoding: "utf-8",
			stdio: ["ignore", "pipe", "pipe"],
		});
		assert.equal(r.status, 1, `stdout: ${r.stdout}\nstderr: ${r.stderr}`);
		assert.match(r.stderr, /--yes kullan|TTY/);
	});

	it("--yes + --dry-run: dry-run kazanir, dosya yazilmaz", () => {
		dir = setupProject({ deps: { react: "^18" } });
		const r = spawnSync(
			"node",
			[BADI, "skills", "auto-install", "--yes", "--dry-run"],
			{ cwd: dir, encoding: "utf-8" },
		);
		assert.equal(r.status, 0);
		assert.match(r.stdout, /--dry-run aktif/);
		assert.equal(existsSync(join(dir, ".claude", "skills", "design")), false);
	});

	it("stack tespit edildi ama vault'ta uygun kategori yok -> uyari", () => {
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
		assert.match(r.stdout, /vault'ta uygun skill kategorisi yok/);
	});
});

describe("badi skills --help: yeni komutlar gorunur", () => {
	it("detect ve auto-install help'te listeli", () => {
		const r = spawnSync("node", [BADI, "skills", "--help"], {
			encoding: "utf-8",
		});
		assert.equal(r.status, 0);
		assert.match(r.stdout, /badi skills detect/);
		assert.match(r.stdout, /badi skills auto-install/);
	});
});
