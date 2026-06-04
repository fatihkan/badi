import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");
const TMP = resolve(__dirname, "..", ".test-tmp-sablon");

function run(args = [], cwd = TMP) {
	return execFileSync("node", [CLI, ...args], {
		encoding: "utf-8",
		timeout: 10000,
		cwd,
	});
}

describe("badi content template", () => {
	before(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
		mkdirSync(TMP, { recursive: true });
	});

	after(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true });
	});

	it("template --help shows help", () => {
		const output = run(["content", "template"]);
		assert.ok(output.includes("Template Inheritance"));
		assert.ok(output.includes("create"));
		assert.ok(output.includes("list"));
		assert.ok(output.includes("delete"));
	});

	it("template create creates a new template", () => {
		const output = run([
			"content",
			"template",
			"create",
			"test-sablon",
			"--extends",
			"post",
		]);
		assert.ok(output.includes("created"));
		const sablonPath = join(
			TMP,
			".claude",
			"workspace",
			"sablonlar",
			"test-sablon.md",
		);
		assert.ok(existsSync(sablonPath), "Sablon dosyasi olmali");
	});

	it("template create includes frontmatter", () => {
		const sablonPath = join(
			TMP,
			".claude",
			"workspace",
			"sablonlar",
			"test-sablon.md",
		);
		const content = readFileSync(sablonPath, "utf-8");
		assert.ok(content.includes("---"));
		assert.ok(content.includes("name: test-sablon"));
		assert.ok(content.includes("extends: post"));
	});

	it("template list lists templates", () => {
		const output = run(["content", "template", "list"]);
		assert.ok(output.includes("test-sablon"));
		assert.ok(output.includes("post"));
	});

	it("template create errors when it already exists", () => {
		assert.throws(
			() =>
				run([
					"content",
					"template",
					"create",
					"test-sablon",
					"--extends",
					"post",
				]),
			(err) => err.status === 1,
		);
	});

	it("template delete deletes a template", () => {
		run(["content", "template", "create", "silinecek", "--extends", "video"]);
		const output = run(["content", "template", "delete", "silinecek"]);
		assert.ok(output.includes("deleted"));
		const sablonPath = join(
			TMP,
			".claude",
			"workspace",
			"sablonlar",
			"silinecek.md",
		);
		assert.ok(!existsSync(sablonPath), "Dosya silinmis olmali");
	});

	it("template delete errors on a nonexistent one", () => {
		assert.throws(
			() => run(["content", "template", "delete", "yok-sablon"]),
			(err) => err.status === 1,
		);
	});

	it("creates a post with --template", () => {
		const output = run([
			"content",
			"post",
			"sablon-test",
			"--template",
			"test-sablon",
			"--force",
		]);
		assert.ok(output.includes("POST template created"));
		assert.ok(output.includes("test-sablon"));
	});

	it("--template errors on a nonexistent one", () => {
		assert.throws(
			() => run(["content", "post", "test", "--template", "yok-sablon"]),
			(err) => err.status === 1,
		);
	});

	it("an invalid extends type errors", () => {
		assert.throws(
			() =>
				run(["content", "template", "create", "bad", "--extends", "invalid"]),
			(err) => err.status === 1,
		);
	});
});
