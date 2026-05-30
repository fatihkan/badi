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

describe("stats v1.29+ flag'lari", () => {
	it("stats --help yeni flag'lari listeler", () => {
		const r = run(["stats", "--help"]);
		assert.equal(r.code, 0);
		assert.ok(r.stdout.includes("--session"));
		assert.ok(r.stdout.includes("--models"));
		assert.ok(r.stdout.includes("--cost"));
		assert.ok(r.stdout.includes("--since"));
		assert.ok(r.stdout.includes("--until"));
		assert.ok(r.stdout.includes("--branch"));
	});

	// Asagidaki testler ~/.claude/projects/ verisine bagli; CI'da transcript
	// yoksa "Bulunan: 0 session" cikar — invariant olarak banner ve baslik
	// her zaman dolar.
	it("stats --session calisir (transcript yoksa bile)", () => {
		const r = run(["stats", "--session", "--limit", "1"]);
		assert.equal(r.code, 0);
		assert.ok(r.stdout.includes("Session Analytics"));
	});

	it("stats --models calisir", () => {
		const r = run(["stats", "--models"]);
		assert.equal(r.code, 0);
		assert.ok(r.stdout.includes("Model Distribution"));
	});

	it("stats --cost calisir", () => {
		const r = run(["stats", "--cost"]);
		assert.equal(r.code, 0);
		assert.ok(r.stdout.includes("Cost"));
	});
});

describe("badi search", () => {
	it("argumansiz help gosterir", () => {
		const r = run(["search"]);
		assert.equal(r.code, 0);
		assert.ok(
			r.stdout.includes("AND search") || r.stdout.includes("Transcript Arama"),
		);
	});

	it("--help calisir", () => {
		const r = run(["search", "--help"]);
		assert.equal(r.code, 0);
		assert.ok(r.stdout.includes("--since"));
	});
});

describe("badi session", () => {
	it("argumansiz help gosterir", () => {
		const r = run(["session"]);
		assert.equal(r.code, 0);
		assert.ok(r.stdout.includes("Session Detay"));
	});

	it("bilinmeyen ID hatasi exit 1", () => {
		const r = run(["session", "zzzzzzzz"]);
		assert.notEqual(r.code, 0);
		assert.ok((r.stderr || r.stdout).includes("bulunamadi"));
	});
});

describe("badi list --mcp", () => {
	it("MCP kullanim bolumunu cikarir", () => {
		const r = run(["list", "--mcp"]);
		assert.equal(r.code, 0);
		assert.ok(r.stdout.includes("MCP Server Kullanimi"));
	});
});

describe("badi plugin show", () => {
	it("bilinmeyen plugin hatasi exit 1", () => {
		const r = run(["plugin", "show", "nonexistent-xyz"]);
		assert.notEqual(r.code, 0);
	});

	it("isim verilmezse exit 1", () => {
		const r = run(["plugin", "show"]);
		assert.notEqual(r.code, 0);
	});
});
