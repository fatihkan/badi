// Hook terminal-isolation testleri (v1.31.0).
//
// Anthropic Claude Code 2.1.139 (11 May 2026) hook'lari terminal access
// olmadan calistirmaya basladi. Bu test:
//  1. Hook stdout'a sadece JSON one-line yaziyorsa (veya bos kaliyorsa) gecer.
//  2. Plain text (non-JSON) stdout = protokol ihlali = fail.
//  3. ANSI escape sequence yokluk kontrolu (terminal manipulation tehlikesi).
//  4. Stderr default'ta bos olmali (BADI_HOOK_DEBUG opt-in).
//
// docs/hooks/isolation-audit.md ile birlikte tutulur.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOOKS_DIR = resolve(__dirname, "../.claude/hooks");

// Hook event tipine gore minimal valid stdin JSON
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
const ANSI_RE = /\x1b\[[0-9;]*[a-zA-Z]|\x1b\][^\x07]*\x07/;

describe("hooks terminal-isolation (Anthropic 2.1.139 uyum)", () => {
	const hooks = listHooks();

	it("14 hook fixture'i tanimli", () => {
		for (const h of hooks) {
			assert.ok(STDIN_FIXTURES[h], `${h} icin STDIN_FIXTURES eksik`);
		}
	});

	for (const hookName of hooks) {
		it(`${hookName} stdout JSON-only veya bos`, () => {
			const r = runHook(hookName, STDIN_FIXTURES[hookName]);
			assert.equal(r.status, 0, `${hookName} exit ${r.status}`);

			const stdout = (r.stdout || "").trim();
			if (stdout === "") return; // bos OK

			// Satir satir kontrol — her satir valid JSON olmali
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
				`${hookName} stdout'unda ANSI escape: ${JSON.stringify(stdout.slice(0, 100))}`,
			);
		});

		it(`${hookName} stderr default'ta bos (BADI_HOOK_DEBUG yok)`, () => {
			const r = runHook(hookName, STDIN_FIXTURES[hookName]);
			const stderr = (r.stderr || "").trim();
			// Module yukleme uyarilari (ExperimentalWarning, vs.) tolere edilir
			const lines = stderr
				.split("\n")
				.filter((l) => l.trim() && !/Warning|deprecated/i.test(l));
			assert.equal(
				lines.length,
				0,
				`${hookName} default'ta stderr yazmamali: ${stderr.slice(0, 200)}`,
			);
		});
	}
});

describe("hooks isolation regression — Kategori 2 fix dogrulamasi", () => {
	it("dependency-audit.mjs writeContextInjection kullaniyor (plain stdout yok)", () => {
		const r = runHook("dependency-audit.mjs", "{}");
		assert.equal(r.status, 0);
		const stdout = (r.stdout || "").trim();
		if (stdout !== "") {
			// Eger cikti varsa JSON ve hookSpecificOutput icermeli
			for (const line of stdout.split("\n").filter((l) => l.trim())) {
				const parsed = JSON.parse(line);
				assert.ok(
					parsed.hookSpecificOutput ||
						parsed.decision ||
						parsed.continue !== undefined,
					"dependency-audit output JSON ama beklenen format yok",
				);
			}
		}
	});

	it("post-compact-resume.mjs writeContextInjection kullaniyor", () => {
		// .compaction-occurred marker yoksa exit early — cikti bos olmali
		const r = runHook("post-compact-resume.mjs", "{}");
		assert.equal(r.status, 0);
		// Marker yok → silent exit beklenir
		const stdout = (r.stdout || "").trim();
		// Eger stdout varsa JSON olmali (plain "Sikistirma sonrasi..." asla)
		if (stdout !== "") {
			for (const line of stdout.split("\n").filter((l) => l.trim())) {
				assert.doesNotThrow(
					() => JSON.parse(line),
					"post-compact-resume non-JSON cikti: regresyon!",
				);
			}
		}
	});
});
