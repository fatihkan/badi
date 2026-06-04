import assert from "node:assert/strict";
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const PKG_ROOT = resolve(__dirname, "..");
const TEMPLATE_DIR = join(PKG_ROOT, ".claude");

const claude = (await import("../lib/harnesses/claude.js")).default;

const SEED_FILES = [
	"memory.md",
	"knowledge-base.md",
	"knowledge-nominations.md",
	"workspace/TaskBoard.md",
];
const TURKISH = /[çğışöüÇĞİŞÖÜ]/;

function freshInstall() {
	const target = mkdtempSync(join(tmpdir(), "badi-seed-"));
	claude.install({ target, src: TEMPLATE_DIR });
	return target;
}

describe("seed templates (fresh install)", () => {
	it("writes all seed files from the clean English template, not badi's own data", () => {
		const target = freshInstall();
		try {
			for (const rel of SEED_FILES) {
				const p = join(target, ".claude", rel);
				assert.ok(existsSync(p), `${rel} should exist after install`);
				const content = readFileSync(p, "utf-8");
				assert.ok(
					!TURKISH.test(content),
					`${rel} must be English (no Turkish chars)`,
				);
			}
		} finally {
			rmSync(target, { recursive: true, force: true });
		}
	});

	it("seeds an empty board/memory, not the maintainer's tasks or notes", () => {
		const target = freshInstall();
		try {
			const memory = readFileSync(join(target, ".claude/memory.md"), "utf-8");
			const board = readFileSync(
				join(target, ".claude/workspace/TaskBoard.md"),
				"utf-8",
			);
			// must not leak badi's own dev data
			assert.ok(!/Proje Bellegi|Badi -|v1\.32/.test(memory));
			assert.ok(!/#33|#52|Awesome Claude Code/.test(board));
			// must be the clean template
			assert.match(memory, /# Project Memory/);
			assert.match(board, /## Today/);
		} finally {
			rmSync(target, { recursive: true, force: true });
		}
	});
});

describe("seed templates (update preserves user data)", () => {
	it("never overwrites existing seed files, even with --force", () => {
		const target = freshInstall();
		try {
			const memPath = join(target, ".claude/memory.md");
			const boardPath = join(target, ".claude/workspace/TaskBoard.md");
			writeFileSync(memPath, "# Project Memory\n\n- MY OWN NOTES\n");
			writeFileSync(
				boardPath,
				"# Task Board\n\n## Today\n- [ ] MY REAL TASK\n",
			);

			claude.update({ target, src: TEMPLATE_DIR, force: true });

			assert.match(readFileSync(memPath, "utf-8"), /MY OWN NOTES/);
			assert.match(readFileSync(boardPath, "utf-8"), /MY REAL TASK/);
		} finally {
			rmSync(target, { recursive: true, force: true });
		}
	});
});

describe("seed templates (npm packaging)", () => {
	it("package.json files does not ship badi's own seed data", () => {
		const pkg = JSON.parse(
			readFileSync(join(PKG_ROOT, "package.json"), "utf-8"),
		);
		const leaked = [
			".claude/memory.md",
			".claude/knowledge-base.md",
			".claude/knowledge-nominations.md",
			".claude/workspace/TaskBoard.md",
		].filter((f) => pkg.files.includes(f));
		assert.deepEqual(leaked, [], "seed data must not be in package.json files");
	});

	it("ships the clean seed templates under lib/seed/", () => {
		for (const rel of SEED_FILES) {
			assert.ok(
				existsSync(join(PKG_ROOT, "lib", "seed", rel)),
				`lib/seed/${rel} must exist`,
			);
		}
	});
});
