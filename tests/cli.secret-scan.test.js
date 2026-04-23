import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";

const BIN = join(import.meta.dirname, "..", "bin", "badi.js");
const TMP = join(import.meta.dirname, ".test-tmp-secrets");
const run = (cwd, ...args) =>
	execFileSync("node", [BIN, "secret-scan", ...args], {
		encoding: "utf-8",
		timeout: 10000,
		cwd,
	});

// Literal sir pattern'leri calistirma aninda birlestir (false-positive filtresinden kacinir)
const SAMPLE_AWS_KEY = "AK" + "IA" + "Z3YXK4R7Q2P5WVTM";

describe("badi secret-scan", () => {
	before(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
		mkdirSync(TMP, { recursive: true });
	});

	after(() => {
		if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
	});

	it("yardim gosterir", () => {
		const out = execFileSync("node", [BIN, "secret-scan", "--help"], {
			encoding: "utf-8",
		});
		assert.ok(out.includes("Secret") || out.includes("secret"));
	});

	it("temiz proje bulamaz", () => {
		writeFileSync(join(TMP, "index.js"), "const x = 'hello world';");
		const out = run(TMP);
		assert.ok(out.includes("tespit edilmedi") || out.includes("0"));
	});

	it("AWS key pattern tespit eder", () => {
		writeFileSync(join(TMP, "leak.js"), `const key = "${SAMPLE_AWS_KEY}";`);
		assert.throws(() => run(TMP), { status: 1 });
	});

	it("JSON format dondurur", () => {
		writeFileSync(join(TMP, "ok.js"), "var a = 1;");
		const out = run(TMP, "--format", "json");
		const parsed = JSON.parse(out);
		assert.ok(Array.isArray(parsed.findings));
	});
});
