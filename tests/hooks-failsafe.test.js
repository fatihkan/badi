// Hook defensive fail-safe testleri (#162).
//
// Tum .mjs hook'lari runtime hatasi durumunda exit 0 ile cikmali,
// Claude Code session'i etkilenmemeli.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOOKS_DIR = resolve(__dirname, "../.claude/hooks");
const MARKER = "Badi v1.27+ defensive fail-safe (#162)";

function listHooks() {
	return readdirSync(HOOKS_DIR)
		.filter((f) => f.endsWith(".mjs") && f !== "_util.mjs")
		.map((f) => join(HOOKS_DIR, f));
}

function runHook(hookPath, stdin = "", env = {}) {
	return spawnSync(process.execPath, [hookPath], {
		input: stdin,
		encoding: "utf-8",
		timeout: 5000,
		env: { ...process.env, ...env },
	});
}

describe("hooks fail-safe header (#162)", () => {
	const hooks = listHooks();

	it("13 .mjs hook bulunmali", () => {
		assert.equal(hooks.length, 13, `Beklenen 13, bulunan ${hooks.length}`);
	});

	for (const hookPath of hooks) {
		const name = hookPath.split("/").pop();
		it(`${name} marker icerir`, () => {
			const content = readFileSync(hookPath, "utf-8");
			assert.ok(content.includes(MARKER), `${name} icinde "${MARKER}" yok`);
		});
	}
});

describe("hooks runtime resilience (#162)", () => {
	const hooks = listHooks();

	for (const hookPath of hooks) {
		const name = hookPath.split("/").pop();
		it(`${name} bos stdin'de exit 0`, () => {
			const r = runHook(hookPath, "");
			assert.equal(
				r.status,
				0,
				`${name} exit ${r.status}, stderr: ${r.stderr}`,
			);
		});

		it(`${name} bozuk JSON stdin'de exit 0`, () => {
			const r = runHook(hookPath, "{not valid json}");
			assert.equal(
				r.status,
				0,
				`${name} exit ${r.status}, stderr: ${r.stderr}`,
			);
		});

		it(`${name} minimal valid JSON ile exit 0`, () => {
			const r = runHook(
				hookPath,
				JSON.stringify({
					session_id: "test",
					transcript_path: "/tmp/x.jsonl",
					tool_name: "Bash",
					tool_input: { command: "ls" },
					prompt: "test prompt",
				}),
			);
			assert.equal(
				r.status,
				0,
				`${name} exit ${r.status}, stderr: ${r.stderr}`,
			);
		});
	}
});
