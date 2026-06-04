import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const PKG_ROOT = resolve(__dirname, "..");
const TEMPLATE_DIR = join(PKG_ROOT, ".claude");

const { buildSingleFileHarness, buildMergedDoc, countSourceCommands } =
	await import("../lib/harnesses/_single-file.js");

describe("buildSingleFileHarness factory (C1 refactor)", () => {
	it("creates a simple harness", () => {
		const h = buildSingleFileHarness({
			id: "test",
			name: "Test",
			filename: ".testrules",
			skippedReasons: {
				hooks: "no hooks",
			},
		});
		assert.equal(h.id, "test");
		assert.equal(h.name, "Test");
		assert.equal(typeof h.install, "function");
		assert.equal(typeof h.detect, "function");
		assert.equal(typeof h.doctor, "function");
	});

	it("install writes the file", () => {
		const target = mkdtempSync(join(tmpdir(), "badi-factory-"));
		try {
			const h = buildSingleFileHarness({
				id: "test",
				name: "Test",
				filename: ".my-rules.md",
				skippedReasons: {},
			});
			const r = h.install({ target, src: TEMPLATE_DIR });
			assert.equal(r.copied, 1);
			assert.ok(existsSync(join(target, ".my-rules.md")));
			const body = readFileSync(join(target, ".my-rules.md"), "utf-8");
			assert.ok(body.length > 0);
		} finally {
			rmSync(target, { recursive: true, force: true });
		}
	});

	it("extraWriter is called", () => {
		const target = mkdtempSync(join(tmpdir(), "badi-extra-"));
		try {
			let called = false;
			const h = buildSingleFileHarness({
				id: "test",
				name: "Test",
				filename: ".x",
				skippedReasons: {},
				extraWriter: ({ result }) => {
					called = true;
					result.copied++;
				},
			});
			const r = h.install({ target, src: TEMPLATE_DIR });
			assert.ok(called);
			assert.equal(r.copied, 2); // filename + extraWriter
		} finally {
			rmSync(target, { recursive: true, force: true });
		}
	});

	it("force=false second install skips", () => {
		const target = mkdtempSync(join(tmpdir(), "badi-noforce-"));
		try {
			const h = buildSingleFileHarness({
				id: "test",
				name: "Test",
				filename: ".test",
				skippedReasons: {},
			});
			h.install({ target, src: TEMPLATE_DIR });
			const r = h.install({ target, src: TEMPLATE_DIR });
			assert.equal(r.copied, 0);
			assert.equal(r.skipped, 1);
		} finally {
			rmSync(target, { recursive: true, force: true });
		}
	});

	it("detect returns true when the file exists", () => {
		const target = mkdtempSync(join(tmpdir(), "badi-detect-"));
		try {
			const h = buildSingleFileHarness({
				id: "test",
				name: "Test",
				filename: ".detect-me",
				skippedReasons: {},
			});
			assert.ok(!h.detect(target));
			h.install({ target, src: TEMPLATE_DIR });
			assert.ok(h.detect(target));
		} finally {
			rmSync(target, { recursive: true, force: true });
		}
	});

	it("buildMergedDoc reads CLAUDE.md content", () => {
		const doc = buildMergedDoc(TEMPLATE_DIR);
		assert.ok(doc && doc.length > 100);
	});

	it("countSourceCommands returns a count from the template", () => {
		const n = countSourceCommands(TEMPLATE_DIR);
		assert.ok(typeof n === "number");
		assert.ok(n >= 0);
	});
});
