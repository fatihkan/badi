import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");

function run(args = [], opts = {}) {
	try {
		return {
			stdout: execFileSync("node", [CLI, ...args], {
				encoding: "utf-8",
				timeout: 10000,
				cwd: opts.cwd,
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

let tmp;
before(() => {
	tmp = mkdtempSync(join(tmpdir(), "badi-plan-"));
});
after(() => {
	try {
		rmSync(tmp, { recursive: true, force: true });
	} catch {}
});

describe("badi plan", () => {
	it("new bir plan dosyasi olusturur", () => {
		const r = run(["plan", "new", "alpha"], { cwd: tmp });
		assert.equal(r.code, 0);
		assert.ok(existsSync(join(tmp, ".claude", "plans", "alpha.md")));
	});

	it("list pending durumu gosterir", () => {
		const r = run(["plan", "list"], { cwd: tmp });
		assert.equal(r.code, 0);
		assert.ok(r.stdout.includes("alpha"));
		assert.ok(r.stdout.includes("pending"));
	});

	it("status pending icin exit 1", () => {
		const r = run(["plan", "status", "alpha"], { cwd: tmp });
		assert.equal(r.code, 1);
	});

	it("approve sonrasi status exit 0 + json formatlanir", () => {
		const r1 = run(["plan", "approve", "alpha"], { cwd: tmp });
		assert.equal(r1.code, 0);
		const r2 = run(["plan", "status", "alpha", "--format", "json"], {
			cwd: tmp,
		});
		assert.equal(r2.code, 0);
		const obj = JSON.parse(r2.stdout.trim());
		assert.equal(obj.state, "approved");
		assert.equal(obj.slug, "alpha");
	});

	it("deny reason'i kaydet, status exit 1", () => {
		const r1 = run(["plan", "deny", "alpha", "scope cok genis"], {
			cwd: tmp,
		});
		assert.equal(r1.code, 0);
		const r2 = run(["plan", "status", "alpha", "--format", "json"], {
			cwd: tmp,
		});
		assert.equal(r2.code, 1);
		const obj = JSON.parse(r2.stdout.trim());
		assert.equal(obj.state, "denied");
		assert.equal(obj.reason, "scope cok genis");
	});

	it("reset markerleri siler -> pending", () => {
		run(["plan", "reset", "alpha"], { cwd: tmp });
		const r = run(["plan", "status", "alpha", "--format", "json"], {
			cwd: tmp,
		});
		const obj = JSON.parse(r.stdout.trim());
		assert.equal(obj.state, "pending");
	});

	it("gecersiz slug reddedilir (path traversal koruma)", () => {
		const r = run(["plan", "new", "../evil"], { cwd: tmp });
		assert.notEqual(r.code, 0);
	});

	it("help argumansiz gosterilir", () => {
		const r = run(["plan"]);
		assert.equal(r.code, 0);
		assert.ok(r.stdout.includes("Plan Approval"));
	});
});
