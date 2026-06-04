import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");

function run(args = []) {
	try {
		return {
			stdout: execFileSync("node", [CLI, ...args], {
				encoding: "utf-8",
				timeout: 10_000,
			}),
			code: 0,
		};
	} catch (e) {
		return {
			stdout: e.stdout?.toString() || "",
			stderr: e.stderr?.toString() || "",
			code: e.status ?? 1,
		};
	}
}

describe("badi release", () => {
	it("--help lists the basic commands", () => {
		const r = run(["release", "--help"]);
		assert.equal(r.code, 0);
		assert.match(r.stdout, /badi release check/);
		assert.match(r.stdout, /--bump/);
		assert.match(r.stdout, /--strict/);
	});

	it("check --help works independently", () => {
		const r = run(["release", "check", "--help"]);
		assert.equal(r.code, 0);
		assert.ok(r.stdout.length > 0);
	});

	it("unknown subcommand exit 1", () => {
		const r = run(["release", "bogus"]);
		assert.equal(r.code, 1);
	});
});
