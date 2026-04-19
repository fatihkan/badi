import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const BIN = join(import.meta.dirname, "..", "bin", "badi.js");
const run = (...args) => execFileSync("node", [BIN, ...args], { encoding: "utf-8", timeout: 5000 }).trim();

describe("badi commit + changelog", () => {
	it("commit yardim gosterir", () => {
		const out = run("commit", "--help");
		assert.ok(out.includes("Conventional") || out.includes("commit"));
	});

	it("commit tipleri gosterir", () => {
		const out = run("commit", "--help");
		assert.ok(out.includes("feat") && out.includes("fix") && out.includes("chore"));
	});

	it("changelog yardim gosterir", () => {
		const out = run("changelog", "--help");
		assert.ok(out.includes("Changelog") || out.includes("commit"));
	});

	it("commit gecersiz format reddeder", () => {
		assert.throws(() => run("commit", "--message", "garip bir mesaj"), { status: 1 });
	});
});
