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
	it("new creates a plan file", () => {
		const r = run(["plan", "new", "alpha"], { cwd: tmp });
		assert.equal(r.code, 0);
		assert.ok(existsSync(join(tmp, ".claude", "plans", "alpha.md")));
	});

	it("list shows the pending state", () => {
		const r = run(["plan", "list"], { cwd: tmp });
		assert.equal(r.code, 0);
		assert.ok(r.stdout.includes("alpha"));
		assert.ok(r.stdout.includes("pending"));
	});

	it("status exits 1 for pending", () => {
		const r = run(["plan", "status", "alpha"], { cwd: tmp });
		assert.equal(r.code, 1);
	});

	it("after approve, status exits 0 + json is formatted", () => {
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

	it("deny records the reason, status exits 1", () => {
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

	it("reset deletes the markers -> pending", () => {
		run(["plan", "reset", "alpha"], { cwd: tmp });
		const r = run(["plan", "status", "alpha", "--format", "json"], {
			cwd: tmp,
		});
		const obj = JSON.parse(r.stdout.trim());
		assert.equal(obj.state, "pending");
	});

	it("invalid slug is rejected (path traversal protection)", () => {
		const r = run(["plan", "new", "../evil"], { cwd: tmp });
		assert.notEqual(r.code, 0);
	});

	it("help is shown with no arguments", () => {
		const r = run(["plan"]);
		assert.equal(r.code, 0);
		assert.ok(r.stdout.includes("Plan Approval"));
	});
});
