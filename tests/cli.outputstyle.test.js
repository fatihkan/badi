// outputstyle komut testleri.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");

function setup() {
	const dir = mkdtempSync(join(tmpdir(), "badi-outputstyle-test-"));
	mkdirSync(join(dir, ".claude"), { recursive: true });
	return dir;
}

function run(dir, args) {
	return execFileSync("node", [CLI, "outputstyle", ...args], {
		cwd: dir,
		encoding: "utf-8",
		timeout: 10000,
	});
}

describe("outputstyle CLI", () => {
	let dir;
	beforeEach(() => {
		dir = setup();
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("available yerlesik profilleri listeler", () => {
		const out = run(dir, ["available"]);
		assert.match(out, /terse/);
		assert.match(out, /verbose/);
		assert.match(out, /eli5/);
	});

	it("list bos durumda nasil davraniyor", () => {
		const out = run(dir, ["list"]);
		assert.match(out, /yuklu profil yok/);
	});

	it("add terse dosya olusturur", () => {
		run(dir, ["add", "terse"]);
		const file = join(dir, ".claude", "output-styles", "terse.md");
		assert.ok(existsSync(file));
		const content = readFileSync(file, "utf-8");
		assert.match(content, /^---/);
		assert.match(content, /name: terse/);
		assert.match(content, /description:/);
	});

	it("add bilinmeyen profil hata", () => {
		assert.throws(() =>
			execFileSync("node", [CLI, "outputstyle", "add", "xyz"], {
				cwd: dir,
				encoding: "utf-8",
				timeout: 10000,
				stdio: "pipe",
			}),
		);
	});

	it("list yuklu profili gosterir", () => {
		run(dir, ["add", "verbose"]);
		const out = run(dir, ["list"]);
		assert.match(out, /verbose/);
	});

	it("remove dosyayi siler", () => {
		run(dir, ["add", "eli5"]);
		const file = join(dir, ".claude", "output-styles", "eli5.md");
		assert.ok(existsSync(file));
		run(dir, ["remove", "eli5"]);
		assert.ok(!existsSync(file));
	});

	it("clear tumunu siler", () => {
		run(dir, ["add", "terse"]);
		run(dir, ["add", "verbose"]);
		run(dir, ["clear"]);
		const out = run(dir, ["list"]);
		assert.match(out, /yuklu profil yok/);
	});

	it("--help banner + komut listesi", () => {
		const out = run(dir, ["--help"]);
		assert.match(out, /add/);
		assert.match(out, /list/);
		assert.match(out, /available/);
	});
});
