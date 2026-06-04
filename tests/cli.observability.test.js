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
				timeout: 15000,
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

describe("stats v1.29+ flags", () => {
	it("stats --help lists the new flags", () => {
		const r = run(["stats", "--help"]);
		assert.equal(r.code, 0);
		assert.ok(r.stdout.includes("--session"));
		assert.ok(r.stdout.includes("--models"));
		assert.ok(r.stdout.includes("--cost"));
		assert.ok(r.stdout.includes("--since"));
		assert.ok(r.stdout.includes("--until"));
		assert.ok(r.stdout.includes("--branch"));
	});

	// The tests below depend on ~/.claude/projects/ data; if there is no
	// transcript in CI, "Bulunan: 0 session" appears — as an invariant the
	// banner and title are always populated.
	it("stats --session works (even with no transcript)", () => {
		const r = run(["stats", "--session", "--limit", "1"]);
		assert.equal(r.code, 0);
		assert.ok(r.stdout.includes("Session Analytics"));
	});

	it("stats --models works", () => {
		const r = run(["stats", "--models"]);
		assert.equal(r.code, 0);
		assert.ok(r.stdout.includes("Model Distribution"));
	});

	it("stats --cost works", () => {
		const r = run(["stats", "--cost"]);
		assert.equal(r.code, 0);
		assert.ok(r.stdout.includes("Cost"));
	});
});

describe("badi search", () => {
	it("shows help with no arguments", () => {
		const r = run(["search"]);
		assert.equal(r.code, 0);
		assert.ok(
			r.stdout.includes("AND search") || r.stdout.includes("Transcript Arama"),
		);
	});

	it("--help works", () => {
		const r = run(["search", "--help"]);
		assert.equal(r.code, 0);
		assert.ok(r.stdout.includes("--since"));
	});
});

describe("badi session", () => {
	it("shows help with no arguments", () => {
		const r = run(["session"]);
		assert.equal(r.code, 0);
		assert.ok(r.stdout.includes("Session Detail"));
	});

	it("unknown ID error exits 1", () => {
		const r = run(["session", "zzzzzzzz"]);
		assert.notEqual(r.code, 0);
		assert.ok((r.stderr || r.stdout).includes("not found"));
	});
});

describe("badi list --mcp", () => {
	it("outputs the MCP usage section", () => {
		const r = run(["list", "--mcp"]);
		assert.equal(r.code, 0);
		assert.ok(r.stdout.includes("MCP Server Usage"));
	});
});

describe("badi plugin show", () => {
	it("unknown plugin error exits 1", () => {
		const r = run(["plugin", "show", "nonexistent-xyz"]);
		assert.notEqual(r.code, 0);
	});

	it("exits 1 when no name is given", () => {
		const r = run(["plugin", "show"]);
		assert.notEqual(r.code, 0);
	});
});
