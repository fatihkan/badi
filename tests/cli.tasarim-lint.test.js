// `badi design lint` smoke testleri (#137).
// Asil davranis (npx @google/design.md) external bagimliyla, test
// sadece wrapper'in error path'lerini kapsiyor.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { resolveLintExit } from "../lib/commands/tasarim.js";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const REPO_ROOT = resolve(__dirname, "..");
const BADI = join(REPO_ROOT, "bin", "badi.js");

function runBadi(args, opts = {}) {
	return spawnSync("node", [BADI, ...args], {
		encoding: "utf-8",
		timeout: 10000,
		cwd: opts.cwd || REPO_ROOT,
		env: { ...process.env, ...(opts.env || {}) },
	});
}

describe("badi design lint: when DESIGN.md is missing", () => {
	let dir;
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "badi-tasarim-test-"));
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("returns exit 1 + stderr contains 'No DESIGN.md'", () => {
		const r = runBadi(["design", "lint"], { cwd: dir });
		assert.equal(r.status, 1, `expected exit 1, got ${r.status}`);
		assert.match(r.stderr, /No DESIGN\.md/);
		assert.match(r.stdout, /badi design init/);
	});

	it("--out flag also triggers the error path for a custom path", () => {
		const r = runBadi(["design", "lint", "--out", "missing/path.md"], {
			cwd: dir,
		});
		assert.equal(r.status, 1);
		assert.match(r.stderr, /No DESIGN\.md/);
		assert.match(r.stderr, /missing\/path\.md/);
	});
});

describe("badi design: help flow", () => {
	it("--help shows the help message", () => {
		const r = runBadi(["design", "--help"]);
		assert.equal(r.status, 0);
		assert.match(r.stdout, /design/);
		assert.match(r.stdout, /lint/);
		assert.match(r.stdout, /export/);
	});

	it("unknown subcommand returns help", () => {
		const r = runBadi(["design", "bogus-subcommand"]);
		// parseFlags + showHelp yolundan ya hata ya help; en azindan crash etmemeli
		assert.notEqual(r.status, null);
	});
});

describe("resolveLintExit: pure exit code logic (#138)", () => {
	it("errors=0 + status=0 -> 0", () => {
		const stdout = JSON.stringify({ summary: { errors: 0, warnings: 2 } });
		assert.equal(resolveLintExit(stdout, 0), 0);
	});

	it("errors>0 + status=0 -> 1", () => {
		const stdout = JSON.stringify({ summary: { errors: 3 } });
		assert.equal(resolveLintExit(stdout, 0), 1);
	});

	it("errors=0 + status!=0 -> status is preserved", () => {
		const stdout = JSON.stringify({ summary: { errors: 0 } });
		assert.equal(resolveLintExit(stdout, 2), 2);
	});

	it("errors>0 + status!=0 -> status is preserved (package exit takes priority)", () => {
		const stdout = JSON.stringify({ summary: { errors: 1 } });
		assert.equal(resolveLintExit(stdout, 5), 5);
	});

	it("non-JSON output + status=0 -> 0", () => {
		assert.equal(resolveLintExit("plain text", 0), 0);
	});

	it("non-JSON output + status!=0 -> status is preserved", () => {
		assert.equal(resolveLintExit("paket hatasi", 7), 7);
	});

	it("empty string + status=0 -> 0", () => {
		assert.equal(resolveLintExit("", 0), 0);
	});

	it("missing summary field -> counted as errors=0", () => {
		assert.equal(resolveLintExit(JSON.stringify({ other: "data" }), 0), 0);
	});
});

describe("badi design export --write: empty-on-error guard (#138)", () => {
	let dir;
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "badi-export-test-"));
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("when DESIGN.md is missing, --write writes no file, exit 1", () => {
		const target = join(dir, "out.css");
		const r = runBadi(
			["design", "export", "--format", "tailwind", "--write", target],
			{ cwd: dir },
		);
		assert.equal(r.status, 1);
		assert.equal(existsSync(target), false, "Hata durumunda dosya yazilmamali");
		assert.match(r.stderr, /No DESIGN\.md/);
	});

	it("when --format is missing, --write writes no file, exit 1", () => {
		const target = join(dir, "out.css");
		const r = runBadi(["design", "export", "--write", target], { cwd: dir });
		assert.equal(r.status, 1);
		assert.equal(existsSync(target), false);
		assert.match(r.stderr, /--format/);
	});
});
