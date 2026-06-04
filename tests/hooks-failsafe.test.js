// Hook defensive fail-safe tests (#162).
//
// All .mjs hooks must exit 0 on a runtime error so the
// Claude Code session is not affected.

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

	it("should find 14 .mjs hooks", () => {
		assert.equal(hooks.length, 14, `Expected 14, found ${hooks.length}`);
	});

	for (const hookPath of hooks) {
		const name = hookPath.split("/").pop();
		it(`${name} contains marker`, () => {
			const content = readFileSync(hookPath, "utf-8");
			assert.ok(
				content.includes(MARKER),
				`${name} does not contain "${MARKER}"`,
			);
		});
	}
});

describe("hooks runtime resilience (#162)", () => {
	const hooks = listHooks();

	for (const hookPath of hooks) {
		const name = hookPath.split("/").pop();
		it(`${name} exit 0 on empty stdin`, () => {
			const r = runHook(hookPath, "");
			assert.equal(
				r.status,
				0,
				`${name} exit ${r.status}, stderr: ${r.stderr}`,
			);
		});

		it(`${name} exit 0 on malformed JSON stdin`, () => {
			const r = runHook(hookPath, "{not valid json}");
			assert.equal(
				r.status,
				0,
				`${name} exit ${r.status}, stderr: ${r.stderr}`,
			);
		});

		it(`${name} exit 0 with minimal valid JSON`, () => {
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
