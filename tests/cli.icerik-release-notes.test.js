import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
} from "node:fs";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";

const BIN = join(import.meta.dirname, "..", "bin", "badi.js");
const TMP = join(import.meta.dirname, ".test-tmp-release-notes");

function run(cwd, ...args) {
	return execFileSync("node", [BIN, "content", ...args], {
		encoding: "utf-8",
		timeout: 10000,
		cwd,
	}).trim();
}

describe("badi content release-notes", () => {
	before(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
		mkdirSync(TMP, { recursive: true });
	});

	after(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
	});

	it("creates ios release notes", () => {
		run(TMP, "release-notes", "--platform", "ios", "--version", "1.2.3");
		const dir = join(TMP, ".claude", "workspace", "icerikler");
		assert.ok(existsSync(dir));
		const files = readdirSync(dir).filter(
			(f) =>
				f.includes("release-notes") && f.includes("1.2.3") && f.includes("ios"),
		);
		assert.ok(files.length >= 1);
		const content = readFileSync(join(dir, files[0]), "utf-8");
		assert.ok(content.includes("App Store"));
		assert.ok(content.includes("4000"));
		assert.ok(content.includes("1.2.3"));
	});

	it("creates android release notes", () => {
		run(
			TMP,
			"release-notes",
			"--platform",
			"android",
			"--version",
			"2.0.0",
			"--lang",
			"en",
		);
		const dir = join(TMP, ".claude", "workspace", "icerikler");
		const files = readdirSync(dir).filter(
			(f) =>
				f.includes("release-notes") &&
				f.includes("2.0.0") &&
				f.includes("android"),
		);
		assert.ok(files.length >= 1);
		const content = readFileSync(join(dir, files[0]), "utf-8");
		assert.ok(content.includes("Play Store"));
		assert.ok(content.includes("500"));
		assert.ok(content.includes("What's New"));
	});

	it("invalid platform throws an error", () => {
		assert.throws(() => run(TMP, "release-notes", "--platform", "windows"), {
			status: 1,
		});
	});

	it("--lang no-op: single English file (no suffix)", () => {
		run(
			TMP,
			"release-notes",
			"--platform",
			"ios",
			"--version",
			"3.0.0",
			"--lang",
			"tr,en",
		);
		const dir = join(TMP, ".claude", "workspace", "icerikler");
		const files = readdirSync(dir).filter((f) => f.includes("3.0.0"));
		assert.equal(files.length, 1, "English-only: tek dosya");
		assert.ok(
			!files[0].includes("-tr") && !files[0].includes("-en"),
			"lang suffix olmamali",
		);
		const content = readFileSync(join(dir, files[0]), "utf-8");
		assert.ok(content.includes("What's New"), "icerik English olmali");
		assert.ok(!content.includes("Yeni Ozellikler"), "TR icerik kalmamali");
	});
});
