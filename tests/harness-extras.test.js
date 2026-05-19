import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const PKG_ROOT = resolve(__dirname, "..");
const TEMPLATE_DIR = join(PKG_ROOT, ".claude");

// Dynamic import (no top-level await issues across runners)
const { default: windsurf } = await import("../lib/harnesses/windsurf.js");
const { default: agents } = await import("../lib/harnesses/agents.js");
const { HARNESSES, getHarness } = await import("../lib/harnesses/index.js");

describe("HARNESSES registry", () => {
	it("windsurf ve agents kayitli", () => {
		const ids = HARNESSES.map((h) => h.id);
		assert.ok(ids.includes("windsurf"));
		assert.ok(ids.includes("agents"));
	});

	it("getHarness windsurf bulur", () => {
		const h = getHarness("windsurf");
		assert.ok(h);
		assert.equal(h.id, "windsurf");
	});

	it("getHarness agents bulur", () => {
		const h = getHarness("agents");
		assert.ok(h);
		assert.equal(h.id, "agents");
	});
});

describe("windsurf harness", () => {
	it("install .windsurfrules olusturur", () => {
		const target = mkdtempSync(join(tmpdir(), "badi-ws-"));
		try {
			const result = windsurf.install({ target, src: TEMPLATE_DIR });
			assert.equal(result.copied, 1);
			assert.ok(existsSync(join(target, ".windsurfrules")));
			const body = readFileSync(join(target, ".windsurfrules"), "utf-8");
			assert.ok(body.length > 0);
		} finally {
			rmSync(target, { recursive: true, force: true });
		}
	});

	it("detect existing .windsurfrules", () => {
		const target = mkdtempSync(join(tmpdir(), "badi-ws-d-"));
		try {
			assert.ok(!windsurf.detect(target));
			windsurf.install({ target, src: TEMPLATE_DIR });
			assert.ok(windsurf.detect(target));
		} finally {
			rmSync(target, { recursive: true, force: true });
		}
	});

	it("skippedComponents commands/hooks/skills'i raporlar", () => {
		const target = mkdtempSync(join(tmpdir(), "badi-ws-s-"));
		try {
			const result = windsurf.install({ target, src: TEMPLATE_DIR });
			const skipped = result.skippedComponents || [];
			const types = skipped.map((s) => s.component);
			// Source repo'da hooks/skills/commands olduguna gore en az biri raporlanmali
			assert.ok(
				types.length > 0,
				"Source repo bilesenler iceriyor olmali (template tarafindan dolduruluyor)",
			);
		} finally {
			rmSync(target, { recursive: true, force: true });
		}
	});

	it("force=false olmadan tekrar install skip eder", () => {
		const target = mkdtempSync(join(tmpdir(), "badi-ws-f-"));
		try {
			windsurf.install({ target, src: TEMPLATE_DIR });
			const result = windsurf.install({ target, src: TEMPLATE_DIR });
			assert.equal(result.copied, 0);
			assert.equal(result.skipped, 1);
		} finally {
			rmSync(target, { recursive: true, force: true });
		}
	});
});

describe("agents harness", () => {
	it("install AGENTS.md olusturur", () => {
		const target = mkdtempSync(join(tmpdir(), "badi-ag-"));
		try {
			const result = agents.install({ target, src: TEMPLATE_DIR });
			assert.equal(result.copied, 1);
			assert.ok(existsSync(join(target, "AGENTS.md")));
		} finally {
			rmSync(target, { recursive: true, force: true });
		}
	});

	it("detect existing AGENTS.md", () => {
		const target = mkdtempSync(join(tmpdir(), "badi-ag-d-"));
		try {
			assert.ok(!agents.detect(target));
			agents.install({ target, src: TEMPLATE_DIR });
			assert.ok(agents.detect(target));
		} finally {
			rmSync(target, { recursive: true, force: true });
		}
	});

	it("doctor pass when AGENTS.md mevcut", () => {
		const target = mkdtempSync(join(tmpdir(), "badi-ag-doc-"));
		try {
			agents.install({ target, src: TEMPLATE_DIR });
			const r = agents.doctor({ target });
			assert.equal(r.fail, 0);
		} finally {
			rmSync(target, { recursive: true, force: true });
		}
	});
});
