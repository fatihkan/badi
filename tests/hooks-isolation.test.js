// Hook terminal-isolation tests (v1.31.0).
//
// Anthropic Claude Code 2.1.139 (11 May 2026) started running hooks without
// terminal access. This test:
//  1. Passes if the hook writes only one-line JSON to stdout (or stays empty).
//  2. Plain text (non-JSON) stdout = protocol violation = fail.
//  3. Checks for the absence of ANSI escape sequences (terminal manipulation danger).
//  4. Stderr must be empty by default (BADI_HOOK_DEBUG opt-in).
//
// Kept together with docs/hooks/isolation-audit.md.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOOKS_DIR = resolve(__dirname, "../.claude/hooks");

// Minimal valid stdin JSON per hook event type
const STDIN_FIXTURES = {
	"backup-before-write.mjs": JSON.stringify({
		tool_name: "Write",
		tool_input: { file_path: "/tmp/__badi_test_nonexistent.md" },
	}),
	"branch-guard.mjs": JSON.stringify({
		tool_name: "Bash",
		tool_input: { command: "echo test" },
	}),
	"completeness-gate.mjs": JSON.stringify({
		tool_name: "Write",
		tool_input: { file_path: "/tmp/__badi_test.md", content: "OK" },
	}),
	"dependency-audit.mjs": "{}",
	"guard-bash.mjs": JSON.stringify({
		tool_name: "Bash",
		tool_input: { command: "echo safe" },
	}),
	"inject-active-plan.mjs": JSON.stringify({ prompt: "test" }),
	"log-changes.mjs": JSON.stringify({
		tool_name: "Read",
		tool_input: { file_path: "/tmp/__badi_test.md" },
	}),
	"log-failures.mjs": JSON.stringify({ tool_name: "Bash", error: "ENOENT" }),
	"log-stop-verdict.mjs": JSON.stringify({
		decision: "allow",
		reason: "test",
	}),
	"post-compact-resume.mjs": "{}",
	"pre-compact-handoff.mjs": "{}",
	"session-reset.mjs": "{}",
	"skill-router.mjs": JSON.stringify({
		prompt: "uzun test prompt cumlesi route et",
	}),
	"track-usage.mjs": JSON.stringify({ tool_name: "Bash" }),
};

function listHooks() {
	return readdirSync(HOOKS_DIR)
		.filter((f) => f.endsWith(".mjs") && f !== "_util.mjs")
		.sort();
}

function runHook(hookName, stdin) {
	return spawnSync(process.execPath, [join(HOOKS_DIR, hookName)], {
		input: stdin,
		encoding: "utf-8",
		timeout: 5000,
	});
}

// ANSI escape: ESC[, ESC], cursor moves, color codes
// biome-ignore lint/suspicious/noControlCharactersInRegex: a literal control character is needed to DETECT ANSI sequences
const ANSI_RE = /\x1b\[[0-9;]*[a-zA-Z]|\x1b\][^\x07]*\x07/;

describe("hooks terminal-isolation (Anthropic 2.1.139 compliance)", () => {
	const hooks = listHooks();

	it("14 hook fixtures defined", () => {
		for (const h of hooks) {
			assert.ok(STDIN_FIXTURES[h], `STDIN_FIXTURES missing for ${h}`);
		}
	});

	for (const hookName of hooks) {
		it(`${hookName} stdout JSON-only veya bos`, () => {
			const r = runHook(hookName, STDIN_FIXTURES[hookName]);
			assert.equal(r.status, 0, `${hookName} exit ${r.status}`);

			const stdout = (r.stdout || "").trim();
			if (stdout === "") return; // empty is OK

			// Line-by-line check — every line must be valid JSON
			for (const line of stdout.split("\n")) {
				const trimmed = line.trim();
				if (trimmed === "") continue;
				assert.doesNotThrow(
					() => JSON.parse(trimmed),
					`${hookName} non-JSON stdout: "${trimmed.slice(0, 80)}"`,
				);
			}
		});

		it(`${hookName} stdout ANSI escape icermez`, () => {
			const r = runHook(hookName, STDIN_FIXTURES[hookName]);
			const stdout = r.stdout || "";
			assert.ok(
				!ANSI_RE.test(stdout),
				`${hookName} ANSI escape in stdout: ${JSON.stringify(stdout.slice(0, 100))}`,
			);
		});

		it(`${hookName} stderr default'ta bos (BADI_HOOK_DEBUG yok)`, () => {
			const r = runHook(hookName, STDIN_FIXTURES[hookName]);
			const stderr = (r.stderr || "").trim();
			// Module loading warnings (ExperimentalWarning, etc.) are tolerated
			const lines = stderr
				.split("\n")
				.filter((l) => l.trim() && !/Warning|deprecated/i.test(l));
			assert.equal(
				lines.length,
				0,
				`${hookName} should not write to stderr by default: ${stderr.slice(0, 200)}`,
			);
		});
	}
});

describe("hooks isolation regression — Category 2 fix verification", () => {
	it("dependency-audit.mjs writeContextInjection kullaniyor (plain stdout yok)", () => {
		const r = runHook("dependency-audit.mjs", "{}");
		assert.equal(r.status, 0);
		const stdout = (r.stdout || "").trim();
		if (stdout !== "") {
			// If there is output it must be JSON and contain hookSpecificOutput
			for (const line of stdout.split("\n").filter((l) => l.trim())) {
				const parsed = JSON.parse(line);
				assert.ok(
					parsed.hookSpecificOutput ||
						parsed.decision ||
						parsed.continue !== undefined,
					"dependency-audit output is JSON but not in the expected format",
				);
			}
		}
	});

	it("post-compact-resume.mjs writeContextInjection kullaniyor", () => {
		// If there is no .compaction-occurred marker, exit early — output must be empty
		const r = runHook("post-compact-resume.mjs", "{}");
		assert.equal(r.status, 0);
		// No marker → a silent exit is expected
		const stdout = (r.stdout || "").trim();
		// If there is stdout it must be JSON (never plain "Sikistirma sonrasi...")
		if (stdout !== "") {
			for (const line of stdout.split("\n").filter((l) => l.trim())) {
				assert.doesNotThrow(
					() => JSON.parse(line),
					"post-compact-resume non-JSON output: regression!",
				);
			}
		}
	});
});
