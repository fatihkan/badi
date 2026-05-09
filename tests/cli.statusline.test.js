// statusline komut testleri.

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
	const dir = mkdtempSync(join(tmpdir(), "badi-statusline-test-"));
	mkdirSync(join(dir, ".claude"), { recursive: true });
	return dir;
}

function run(dir, args) {
	return execFileSync("node", [CLI, "statusline", ...args], {
		cwd: dir,
		encoding: "utf-8",
		timeout: 10000,
	});
}

describe("statusline CLI", () => {
	let dir;
	beforeEach(() => {
		dir = setup();
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("available yerlesik profilleri listeler", () => {
		const out = run(dir, ["available"]);
		assert.match(out, /git/);
		assert.match(out, /skill-chip/);
	});

	it("list konfigure edilmemis durumu gosterir", () => {
		const out = run(dir, ["list"]);
		assert.match(out, /konfigure edilmemis/);
	});

	it("set git settings.json'a yazar", () => {
		run(dir, ["set", "git"]);
		const settings = JSON.parse(
			readFileSync(join(dir, ".claude", "settings.json"), "utf-8"),
		);
		assert.equal(settings.statusLine?.type, "command");
		assert.match(settings.statusLine?.command || "", /git\.sh/);
		assert.ok(existsSync(join(dir, ".claude", "status-line", "git.sh")));
	});

	it("set skill-chip script olusturur", () => {
		run(dir, ["set", "skill-chip"]);
		assert.ok(existsSync(join(dir, ".claude", "status-line", "skill-chip.sh")));
	});

	it("set bilinmeyen profil hata", () => {
		assert.throws(() =>
			execFileSync("node", [CLI, "statusline", "set", "xyz"], {
				cwd: dir,
				encoding: "utf-8",
				timeout: 10000,
				stdio: "pipe",
			}),
		);
	});

	it("reset statusLine alanini kaldirir", () => {
		run(dir, ["set", "git"]);
		run(dir, ["reset"]);
		const settings = JSON.parse(
			readFileSync(join(dir, ".claude", "settings.json"), "utf-8"),
		);
		assert.equal(settings.statusLine, undefined);
	});

	it("--help banner + komut listesi", () => {
		const out = run(dir, ["--help"]);
		assert.match(out, /set/);
		assert.match(out, /list/);
		assert.match(out, /available/);
		assert.match(out, /reset/);
	});
});
