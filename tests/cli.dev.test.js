import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BIN = join(import.meta.dirname, "..", "bin", "badi.js");
const run = (...args) => execFileSync("node", [BIN, ...args], { encoding: "utf-8", timeout: 15000 }).trim();

describe("badi dev", () => {
	it("yardim gosterir", () => {
		const out = run("dev");
		assert.ok(out.includes("DevOps"));
		assert.ok(out.includes("badi dev deps"));
		assert.ok(out.includes("badi dev bundle"));
	});

	it("bundle calisir", () => {
		const out = run("dev", "bundle");
		assert.ok(out.includes("Bundle") || out.includes("Framework"));
	});

	it("api-test yardim gosterir", () => {
		const out = run("dev", "api-test");
		assert.ok(out.includes("API") || out.includes("Kullanim"));
	});

	it("bilinmeyen komut hata verir", () => {
		assert.throws(() => run("dev", "invalid"), { status: 1 });
	});

	it("docker-lint Dockerfile yoksa hata verir", () => {
		if (!existsSync("Dockerfile")) {
			assert.throws(() => run("dev", "docker-lint"), { status: 1 });
		}
	});
});
