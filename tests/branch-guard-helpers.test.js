// Pure unit tests for the branch-guard cwd/cd-awareness helpers (v1.35.0 PR-C).
// These live in .claude/hooks/_util.mjs (no top-level execution, safe to import).
// End-to-end hook behavior is covered in cli.hooks-node.test.js.

import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
	effectiveBranchForCommit,
	isGitCommit,
	resolveTargetDir,
	splitSegments,
	stripHeredocs,
} from "../.claude/hooks/_util.mjs";

describe("branch-guard: isGitCommit", () => {
	it("matches git commit incl. global options before the subcommand", () => {
		assert.equal(isGitCommit("git commit -m x"), true);
		assert.equal(isGitCommit("git -C /repo commit -m x"), true);
		assert.equal(isGitCommit("git -c user.name=x commit"), true);
		assert.equal(isGitCommit("git --no-pager commit"), true);
	});

	it("does not match non-commit git commands", () => {
		assert.equal(isGitCommit("git push"), false);
		assert.equal(isGitCommit("git merge main"), false);
		assert.equal(isGitCommit("ls -la"), false);
	});
});

describe("branch-guard: stripHeredocs", () => {
	it("drops the heredoc body and terminator, keeps text before <<", () => {
		const cmd = "git commit -F - <<'EOF'\ngit switch -c sneaky\nbody\nEOF\nls";
		const out = stripHeredocs(cmd);
		assert.match(out, /git commit -F -/);
		assert.doesNotMatch(out, /switch -c sneaky/);
		assert.doesNotMatch(out, /\bbody\b/);
		assert.match(out, /\bls\b/);
	});

	it("is a no-op without a heredoc", () => {
		assert.equal(stripHeredocs("git commit -m x"), "git commit -m x");
	});
});

describe("branch-guard: splitSegments", () => {
	it("splits on && || ; | and newlines, || before |", () => {
		assert.deepEqual(splitSegments("a && b || c ; d | e\nf"), [
			"a",
			"b",
			"c",
			"d",
			"e",
			"f",
		]);
	});
});

describe("branch-guard: effectiveBranchForCommit", () => {
	it("plain commit stays on the base branch", () => {
		assert.equal(effectiveBranchForCommit("git commit -m x", "main"), "main");
	});

	it("a `git switch -c` before the commit takes effect (the false-positive bug)", () => {
		assert.equal(
			effectiveBranchForCommit("git switch -c feature/x && git commit -m x", "main"),
			"feature/x",
		);
		assert.equal(
			effectiveBranchForCommit("git checkout -b feat 2>&1 | tail\ngit commit", "main"),
			"feat",
		);
	});

	it("a plain switch to an existing branch also takes effect", () => {
		assert.equal(
			effectiveBranchForCommit("git switch feature/y; git commit", "main"),
			"feature/y",
		);
	});

	it("a switch AFTER the commit does NOT count (commit still on base)", () => {
		assert.equal(
			effectiveBranchForCommit("git commit && git switch -c x", "main"),
			"main",
		);
	});

	it("a switch buried in a heredoc body is ignored", () => {
		assert.equal(
			effectiveBranchForCommit(
				"git commit -F - <<'EOF'\ngit switch -c sneaky\nEOF",
				"main",
			),
			"main",
		);
	});
});

describe("branch-guard: resolveTargetDir", () => {
	it("returns baseDir when no cd / git -C is present", () => {
		assert.equal(resolveTargetDir("git commit -m x", "/base"), "/base");
	});

	it("falls back to baseDir when the cd target does not exist (fail-closed)", () => {
		assert.equal(
			resolveTargetDir("cd /nope-xyz-123 && git commit", "/base"),
			"/base",
		);
	});

	it("resolves an existing cd target", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-bg-"));
		try {
			assert.equal(resolveTargetDir(`cd ${tmp} && git commit`, tmpdir()), tmp);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("resolves an existing `git -C <path>` target", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-bg-c-"));
		try {
			assert.equal(
				resolveTargetDir(`git -C ${tmp} commit -m x`, tmpdir()),
				tmp,
			);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});
});
