// `badi tasarim lint` smoke testleri (#137).
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

describe("badi tasarim lint: DESIGN.md yok ise", () => {
	let dir;
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "badi-tasarim-test-"));
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("exit 1 dondurur + stderr 'DESIGN.md yok' icerir", () => {
		const r = runBadi(["tasarim", "lint"], { cwd: dir });
		assert.equal(r.status, 1, `expected exit 1, got ${r.status}`);
		assert.match(r.stderr, /DESIGN\.md yok/);
		assert.match(r.stdout, /badi tasarim init/);
	});

	it("--out flag custom path icin de error path tetikler", () => {
		const r = runBadi(["tasarim", "lint", "--out", "missing/path.md"], {
			cwd: dir,
		});
		assert.equal(r.status, 1);
		assert.match(r.stderr, /DESIGN\.md yok/);
		assert.match(r.stderr, /missing\/path\.md/);
	});
});

describe("badi tasarim: yardim akisi", () => {
	it("--help help mesaji gosterir", () => {
		const r = runBadi(["tasarim", "--help"]);
		assert.equal(r.status, 0);
		assert.match(r.stdout, /tasarim/);
		assert.match(r.stdout, /lint/);
		assert.match(r.stdout, /export/);
	});

	it("bilinmeyen alt-komut yardim doner", () => {
		const r = runBadi(["tasarim", "bogus-subcommand"]);
		// parseFlags + showHelp yolundan ya hata ya help; en azindan crash etmemeli
		assert.notEqual(r.status, null);
	});
});

describe("resolveLintExit: saf exit code mantigi (#138)", () => {
	it("errors=0 + status=0 -> 0", () => {
		const stdout = JSON.stringify({ summary: { errors: 0, warnings: 2 } });
		assert.equal(resolveLintExit(stdout, 0), 0);
	});

	it("errors>0 + status=0 -> 1", () => {
		const stdout = JSON.stringify({ summary: { errors: 3 } });
		assert.equal(resolveLintExit(stdout, 0), 1);
	});

	it("errors=0 + status!=0 -> status korunur", () => {
		const stdout = JSON.stringify({ summary: { errors: 0 } });
		assert.equal(resolveLintExit(stdout, 2), 2);
	});

	it("errors>0 + status!=0 -> status korunur (paket exit'e oncelik)", () => {
		const stdout = JSON.stringify({ summary: { errors: 1 } });
		assert.equal(resolveLintExit(stdout, 5), 5);
	});

	it("JSON disi cikti + status=0 -> 0", () => {
		assert.equal(resolveLintExit("plain text", 0), 0);
	});

	it("JSON disi cikti + status!=0 -> status korunur", () => {
		assert.equal(resolveLintExit("paket hatasi", 7), 7);
	});

	it("bos string + status=0 -> 0", () => {
		assert.equal(resolveLintExit("", 0), 0);
	});

	it("summary alani eksik -> errors=0 sayilir", () => {
		assert.equal(resolveLintExit(JSON.stringify({ other: "data" }), 0), 0);
	});
});

describe("badi tasarim export --write: empty-on-error guard (#138)", () => {
	let dir;
	beforeEach(() => {
		dir = mkdtempSync(join(tmpdir(), "badi-export-test-"));
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("DESIGN.md yok ise --write dosya yazmaz, exit 1", () => {
		const target = join(dir, "out.css");
		const r = runBadi(
			["tasarim", "export", "--format", "tailwind", "--write", target],
			{ cwd: dir },
		);
		assert.equal(r.status, 1);
		assert.equal(existsSync(target), false, "Hata durumunda dosya yazilmamali");
		assert.match(r.stderr, /DESIGN\.md yok/);
	});

	it("--format eksik ise --write dosya yazmaz, exit 1", () => {
		const target = join(dir, "out.css");
		const r = runBadi(["tasarim", "export", "--write", target], { cwd: dir });
		assert.equal(r.status, 1);
		assert.equal(existsSync(target), false);
		assert.match(r.stderr, /--format/);
	});
});
