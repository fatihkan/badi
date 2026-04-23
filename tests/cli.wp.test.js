import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";

const BIN = join(import.meta.dirname, "..", "bin", "badi.js");
const run = (...args) =>
	execFileSync("node", [BIN, ...args], {
		encoding: "utf-8",
		timeout: 10000,
	}).trim();

describe("badi wp", () => {
	const configDir = join(homedir(), ".config", "badi");
	const sitesFile = join(configDir, "wp-sites.json");
	let backup = null;

	before(() => {
		if (existsSync(sitesFile)) {
			backup = readFileSync(sitesFile, "utf-8");
		}
	});

	after(() => {
		if (backup) {
			writeFileSync(sitesFile, backup);
		} else if (existsSync(sitesFile)) {
			// Testten once dosya yoktu — temizle
			try {
				rmSync(sitesFile);
			} catch {
				/* */
			}
		}
	});

	it("yardim gosterir", () => {
		const out = run("wp", "--help");
		assert.ok(out.includes("WordPress Yonetimi"));
		assert.ok(out.includes("badi wp add"));
		assert.ok(out.includes("badi wp status"));
	});

	it("argumansiz yardim gosterir", () => {
		const out = run("wp");
		assert.ok(out.includes("WordPress Yonetimi"));
	});

	it("site ekler", () => {
		const out = run(
			"wp",
			"add",
			"test-site",
			"https://test.example.com",
			"--method",
			"rest",
		);
		assert.ok(out.includes("Site eklendi") || out.includes("Site guncellendi"));
		assert.ok(out.includes("test-site"));
	});

	it("site listeler", () => {
		const out = run("wp", "list");
		assert.ok(out.includes("test-site"));
	});

	it("site siler", () => {
		const out = run("wp", "remove", "test-site");
		assert.ok(out.includes("Site silindi"));
	});

	it("bilinmeyen site hata verir", () => {
		assert.throws(() => run("wp", "status", "nonexistent"), { status: 1 });
	});
});
