import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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

function writeManifest(dir, name, payload) {
	const pdir = join(dir, ".claude", "plugins", name);
	mkdirSync(pdir, { recursive: true });
	writeFileSync(
		join(pdir, "badi-plugin.json"),
		JSON.stringify(payload),
		"utf-8",
	);
	return pdir;
}

let tmp;
before(() => {
	tmp = mkdtempSync(join(tmpdir(), "badi-plug-doc-"));
});
after(() => {
	try {
		rmSync(tmp, { recursive: true, force: true });
	} catch {}
});

describe("badi plugin doctor + graph (post-split)", () => {
	it("bos pluginlerle 'doctor' sessiz cikar", () => {
		const r = run(["plugin", "doctor"], { cwd: tmp });
		assert.equal(r.code, 0);
		assert.match(r.stdout, /No plugins installed/);
	});

	it("apiVersion 'garbage' format taninmadi uyarisi gosterir (A2/B1)", () => {
		writeManifest(tmp, "test-recognize", {
			name: "test-recognize",
			version: "1.0.0",
			badi: { apiVersion: "garbage-format" },
		});
		const r = run(["plugin", "doctor"], { cwd: tmp });
		// doctor uyari iceriyorsa exit 1
		assert.equal(r.code, 1);
		assert.match(r.stdout, /apiVersion format taninmadi/);
	});

	it("apiVersion uyumsuz major reject", () => {
		writeManifest(tmp, "test-incompat", {
			name: "test-incompat",
			version: "1.0.0",
			badi: { apiVersion: "99.x" },
		});
		const r = run(["plugin", "doctor"], { cwd: tmp });
		assert.equal(r.code, 1);
		assert.match(r.stdout, /uyumlu degil/);
	});

	it("graph topo-sort cikti uretir", () => {
		const r = run(["plugin", "graph"], { cwd: tmp });
		assert.equal(r.code, 0);
		assert.match(r.stdout, /Plugin Dependency Tree/);
	});
});
