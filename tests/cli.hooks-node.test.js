// Node.js hook tests (#126 phase 2).
// Each hook is tested against its stdin->stdout/exit contract.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const REPO_ROOT = resolve(__dirname, "..");
const HOOKS_DIR = resolve(REPO_ROOT, ".claude", "hooks");

// Hook test sandbox lives under REPO_ROOT/.hook-sandbox/ (gitignored).
// - os.tmpdir() is NOT used: in some environments it is under /tmp; the
//   completeness-gate + backup-before-write hooks deliberately skip /tmp/ and
//   .test-tmp- paths (throwaway-file protection) -> gate/backup logic could
//   never be tested.
// - bare ".test-tmp" is not used: cli.integration.test.js owns it and deletes
//   it during parallel runs (mkdtemp throws ENOENT).
// .hook-sandbox matches no skip pattern and is deterministic in all environments.
const SANDBOX_BASE = join(REPO_ROOT, ".hook-sandbox");

function runHook(name, stdin, opts = {}) {
	const file = join(HOOKS_DIR, `${name}.mjs`);
	return spawnSync("node", [file], {
		input: typeof stdin === "string" ? stdin : JSON.stringify(stdin),
		encoding: "utf-8",
		timeout: 8000,
		cwd: opts.cwd || REPO_ROOT,
		env: { ...process.env, ...(opts.env || {}) },
	});
}

function setupTempProject() {
	// Ensure the base exists every time (parallel tests or cleanup may have removed it).
	mkdirSync(SANDBOX_BASE, { recursive: true });
	const dir = mkdtempSync(join(SANDBOX_BASE, "badi-hook-test-"));
	mkdirSync(join(dir, ".claude", "hooks"), { recursive: true });
	mkdirSync(join(dir, ".claude", "logs"), { recursive: true });
	mkdirSync(join(dir, ".claude", "agents"), { recursive: true });
	// Make the sandbox its own git repo so the hooks' projectRoot()
	// (git rev-parse --show-toplevel) call resolves to the sandbox rather than
	// the main repo; otherwise logs/backups get written to the main repo root.
	spawnSync("git", ["init", "-q"], { cwd: dir });
	return dir;
}

describe("hooks-node: track-usage", () => {
	let dir;
	beforeEach(() => {
		dir = setupTempProject();
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("appends a line to usage.jsonl", () => {
		const r = runHook(
			"track-usage",
			{ tool_name: "Bash", tool_input: { command: "badi doctor" } },
			{ cwd: dir },
		);
		assert.equal(r.status, 0);
		const log = readFileSync(
			join(dir, ".claude", "logs", "usage.jsonl"),
			"utf-8",
		);
		const entry = JSON.parse(log.trim().split("\n").pop());
		assert.equal(entry.tool, "Bash");
		assert.equal(entry.command, "badi");
		assert.equal(entry.subcommand, "doctor");
	});

	it("non-badi command has an empty subcommand", () => {
		const r = runHook(
			"track-usage",
			{ tool_name: "Bash", tool_input: { command: "ls -la" } },
			{ cwd: dir },
		);
		assert.equal(r.status, 0);
		const log = readFileSync(
			join(dir, ".claude", "logs", "usage.jsonl"),
			"utf-8",
		);
		const entry = JSON.parse(log.trim().split("\n").pop());
		assert.equal(entry.command, "");
	});
});

describe("hooks-node: log-changes", () => {
	let dir;
	beforeEach(() => {
		dir = setupTempProject();
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("appends a line to audit-trail.md", () => {
		const r = runHook(
			"log-changes",
			{ tool_name: "Edit", tool_input: { file_path: "/tmp/foo.js" } },
			{ cwd: dir },
		);
		assert.equal(r.status, 0);
		const log = readFileSync(
			join(dir, ".claude", "logs", "audit-trail.md"),
			"utf-8",
		);
		assert.match(log, /Edit/);
		assert.match(log, /foo\.js/);
	});
});

describe("hooks-node: branch-guard", () => {
	let dir;
	beforeEach(() => {
		dir = setupTempProject();
		// setupTempProject already ran git init (default branch); switch to feature.
		spawnSync("git", ["checkout", "-b", "feature/test"], { cwd: dir });
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("passes for a feature branch (empty output)", () => {
		const r = runHook(
			"branch-guard",
			{ tool_input: { command: "git commit -m 'x'" } },
			{ cwd: dir },
		);
		assert.equal(r.status, 0);
		assert.equal(r.stdout.trim(), "");
	});

	it("skips a non-commit command", () => {
		const r = runHook(
			"branch-guard",
			{ tool_input: { command: "ls" } },
			{ cwd: dir },
		);
		assert.equal(r.status, 0);
		assert.equal(r.stdout.trim(), "");
	});
});

describe("hooks-node: branch-guard (cwd/cd awareness, PR-C)", () => {
	const dirs = [];
	// A sandbox repo forced onto a known branch (no commit needed:
	// `git branch --show-current` reports the unborn branch).
	function mkRepo(branch) {
		mkdirSync(SANDBOX_BASE, { recursive: true });
		const d = mkdtempSync(join(SANDBOX_BASE, "badi-bg-"));
		spawnSync("git", ["init", "-q", "-b", branch], { cwd: d });
		dirs.push(d);
		return d;
	}
	afterEach(() => {
		while (dirs.length) rmSync(dirs.pop(), { recursive: true, force: true });
	});

	it("BLOCKS a plain commit on a protected branch (main)", () => {
		const d = mkRepo("main");
		const r = runHook(
			"branch-guard",
			{ tool_input: { command: "git commit -m x" } },
			{ cwd: d },
		);
		assert.equal(r.status, 0);
		assert.equal(JSON.parse(r.stdout.trim()).decision, "block");
	});

	it("PASSES when a `git switch -c` precedes the commit (the false-positive bug)", () => {
		const d = mkRepo("main");
		const r = runHook(
			"branch-guard",
			{ tool_input: { command: "git switch -c feature/x && git commit -m x" } },
			{ cwd: d },
		);
		assert.equal(r.status, 0);
		assert.equal(
			r.stdout.trim(),
			"",
			"switch precedes commit -> must not block",
		);
	});

	it("ignores a `git commit` mention inside a heredoc body", () => {
		const d = mkRepo("main");
		const r = runHook(
			"branch-guard",
			{
				tool_input: {
					command: "cat <<'EOF' > note.txt\ngit commit -m junk\nEOF",
				},
			},
			{ cwd: d },
		);
		assert.equal(r.status, 0);
		assert.equal(r.stdout.trim(), "", "heredoc body is not a real commit");
	});

	it("BLOCKS a commit targeting another repo on main via `cd`", () => {
		const feature = mkRepo("feature/here");
		const mainRepo = mkRepo("main");
		const r = runHook(
			"branch-guard",
			{ tool_input: { command: `cd ${mainRepo} && git commit -m x` } },
			{ cwd: feature },
		);
		assert.equal(r.status, 0);
		assert.equal(JSON.parse(r.stdout.trim()).decision, "block");
	});

	it("BLOCKS a commit targeting another repo on main via `git -C`", () => {
		const feature = mkRepo("feature/here");
		const mainRepo = mkRepo("main");
		const r = runHook(
			"branch-guard",
			{ tool_input: { command: `git -C ${mainRepo} commit -m x` } },
			{ cwd: feature },
		);
		assert.equal(r.status, 0);
		assert.equal(JSON.parse(r.stdout.trim()).decision, "block");
	});
});

describe("hooks-node: guard-bash", () => {
	it("rm -rf / is blocked (HARD_BLOCK)", () => {
		const r = runHook("guard-bash", {
			tool_input: { command: "rm -rf /" },
		});
		assert.equal(r.status, 0);
		const out = JSON.parse(r.stdout.trim());
		assert.equal(out.decision, "block");
	});

	it("git push --force is blocked (SOFT_BLOCK)", () => {
		const r = runHook("guard-bash", {
			tool_input: { command: "git push --force" },
		});
		assert.equal(r.status, 0);
		const out = JSON.parse(r.stdout.trim());
		assert.equal(out.decision, "block");
	});

	it("a normal command passes through", () => {
		const r = runHook("guard-bash", {
			tool_input: { command: "ls -la" },
		});
		assert.equal(r.status, 0);
		assert.equal(r.stdout.trim(), "");
	});

	it("npm publish is logged but passes", () => {
		const r = runHook("guard-bash", {
			tool_input: { command: "npm publish" },
		});
		assert.equal(r.status, 0);
		assert.equal(r.stdout.trim(), "");
	});
});

describe("hooks-node: completeness-gate", () => {
	let dir;
	beforeEach(() => {
		dir = setupTempProject();
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("a generic AKIA AWS key is detected", () => {
		// Build at runtime, do not use a literal.
		const fake = "AKIA" + "ABCDEFGHIJKLMNOP";
		const r = runHook(
			"completeness-gate",
			{
				tool_name: "Write",
				tool_input: {
					file_path: join(dir, "config.js"),
					content: `const k = "${fake}";`,
				},
			},
			{ cwd: dir },
		);
		assert.equal(r.status, 0);
		const out = JSON.parse(r.stdout.trim());
		assert.equal(out.decision, "block");
		assert.match(out.reason, /Secret detected/);
	});

	it("incomplete markers in knowledge-base.md are blocked", () => {
		const marker = "T" + "B" + "D";
		const r = runHook(
			"completeness-gate",
			{
				tool_name: "Write",
				tool_input: {
					file_path: join(dir, ".claude", "knowledge-base.md"),
					content: `# KB\n\n${marker}\n`,
				},
			},
			{ cwd: dir },
		);
		assert.equal(r.status, 0);
		const out = JSON.parse(r.stdout.trim());
		assert.equal(out.decision, "block");
	});

	it("invalid JSON in settings.json is blocked", () => {
		const r = runHook(
			"completeness-gate",
			{
				tool_name: "Write",
				tool_input: {
					file_path: join(dir, ".claude", "settings.json"),
					content: "{not json",
				},
			},
			{ cwd: dir },
		);
		assert.equal(r.status, 0);
		const out = JSON.parse(r.stdout.trim());
		assert.equal(out.decision, "block");
	});

	it("a normal write passes", () => {
		const r = runHook(
			"completeness-gate",
			{
				tool_name: "Write",
				tool_input: {
					file_path: join(dir, "src/foo.js"),
					content: "export const x = 1;",
				},
			},
			{ cwd: dir },
		);
		assert.equal(r.status, 0);
		assert.equal(r.stdout.trim(), "");
	});
});

describe("hooks-node: backup-before-write", () => {
	let dir;
	beforeEach(() => {
		dir = setupTempProject();
		writeFileSync(join(dir, "src.js"), "original", "utf-8");
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("creates a backup", () => {
		const r = runHook(
			"backup-before-write",
			{ tool_input: { file_path: join(dir, "src.js") } },
			{ cwd: dir },
		);
		assert.equal(r.status, 0);
		const today = new Date().toISOString().slice(0, 10);
		const backupDir = join(dir, ".claude", "backups", today);
		assert.ok(existsSync(backupDir));
	});

	it("skips /tmp/", () => {
		const r = runHook(
			"backup-before-write",
			{ tool_input: { file_path: "/tmp/foo.js" } },
			{ cwd: dir },
		);
		assert.equal(r.status, 0);
		assert.ok(!existsSync(join(dir, ".claude", "backups")));
	});
});

describe("hooks-node: log-failures", () => {
	let dir;
	beforeEach(() => {
		dir = setupTempProject();
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("ENOENT becomes FILESYSTEM/WARN", () => {
		const r = runHook(
			"log-failures",
			{ tool_name: "Read", error: "ENOENT: no such file" },
			{ cwd: dir },
		);
		assert.equal(r.status, 0);
		const log = readFileSync(
			join(dir, ".claude", "logs", "failure-log.md"),
			"utf-8",
		);
		assert.match(log, /WARN \| FILESYSTEM/);
	});

	it("a network error becomes NETWORK/ERROR + incident-log", () => {
		const r = runHook(
			"log-failures",
			{ tool_name: "WebFetch", error: "ECONNREFUSED" },
			{ cwd: dir },
		);
		assert.equal(r.status, 0);
		const incident = readFileSync(
			join(dir, ".claude", "logs", "incident-log.md"),
			"utf-8",
		);
		assert.match(incident, /NETWORK/);
	});
});

describe("hooks-node: pre-compact + post-compact roundtrip", () => {
	let dir;
	beforeEach(() => {
		dir = setupTempProject();
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("pre-compact writes a marker, post-compact deletes it", () => {
		const pre = runHook("pre-compact-handoff", "{}", { cwd: dir });
		assert.equal(pre.status, 0);
		const marker = join(dir, ".claude", ".compaction-occurred");
		assert.ok(existsSync(marker));

		const post = runHook("post-compact-resume", "{}", { cwd: dir });
		assert.equal(post.status, 0);
		assert.ok(!existsSync(marker));
		assert.match(post.stdout, /Resuming after compaction/);
	});

	it("post-compact passes when there is no marker", () => {
		const r = runHook("post-compact-resume", "{}", { cwd: dir });
		assert.equal(r.status, 0);
		assert.equal(r.stdout, "");
	});
});

describe("hooks-node: log-stop-verdict", () => {
	let dir;
	beforeEach(() => {
		dir = setupTempProject();
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("counts block decisions", () => {
		runHook(
			"log-stop-verdict",
			{ decision: "block", reason: "test1" },
			{ cwd: dir },
		);
		runHook(
			"log-stop-verdict",
			{ decision: "block", reason: "test2" },
			{ cwd: dir },
		);
		const counter = readFileSync(
			join(dir, ".claude", "hooks", "__counter"),
			"utf-8",
		);
		assert.equal(counter.trim(), "2");
		assert.ok(existsSync(join(dir, ".claude", "hooks", "quality-gate-active")));
	});

	it("a learning is added to the nominations", () => {
		runHook(
			"log-stop-verdict",
			{ decision: "allow", learning: "Hep test yaz" },
			{ cwd: dir },
		);
		const noms = readFileSync(
			join(dir, ".claude", "knowledge-nominations.md"),
			"utf-8",
		);
		assert.match(noms, /Hep test yaz/);
	});
});

describe("hooks-node: session-reset", () => {
	let dir;
	beforeEach(() => {
		dir = setupTempProject();
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("creates standard directories and clears markers", () => {
		writeFileSync(join(dir, ".claude", "hooks", "__counter"), "5", "utf-8");
		writeFileSync(
			join(dir, ".claude", "hooks", "quality-gate-active"),
			"",
			"utf-8",
		);

		const r = runHook("session-reset", "{}", { cwd: dir });
		assert.equal(r.status, 0);

		assert.ok(!existsSync(join(dir, ".claude", "hooks", "__counter")));
		assert.ok(
			!existsSync(join(dir, ".claude", "hooks", "quality-gate-active")),
		);

		for (const d of [
			"agent-memory",
			"backups",
			"skills",
			"workspace",
			"plugins",
		]) {
			assert.ok(existsSync(join(dir, ".claude", d)), `${d} should exist`);
		}
	});
});

// Wiring guard: a hook can be perfectly correct and still never run if its
// matcher in settings.json is not a value the harness actually emits. That is
// silent — no error, no failing hook test — so it is asserted here.
// Regression: SessionStart shipped "new"/"resumed" (invalid), which left
// session-reset, dependency-audit and post-compact-resume dead, and broke the
// pre-compact-handoff -> post-compact-resume handoff in half.
describe("settings.json hook wiring", () => {
	const settings = JSON.parse(
		readFileSync(resolve(REPO_ROOT, ".claude", "settings.json"), "utf-8"),
	);

	// Claude Code SessionStart `source` values.
	const SESSION_START_SOURCES = [
		"startup",
		"resume",
		"clear",
		"compact",
		"fork",
	];

	it("SessionStart matchers only use real source values", () => {
		for (const entry of settings.hooks?.SessionStart ?? []) {
			const matcher = entry.matcher ?? "";
			if (matcher === "") continue; // empty = always fires
			for (const part of matcher.split("|")) {
				assert.ok(
					SESSION_START_SOURCES.includes(part.trim()),
					`SessionStart matcher "${part}" is not a real source value (${SESSION_START_SOURCES.join("|")}) — the hook would never fire`,
				);
			}
		}
	});

	it("the compaction handoff is wired at both ends", () => {
		const wiredOn = (event) =>
			(settings.hooks?.[event] ?? [])
				.flatMap((e) => e.hooks ?? [])
				.map((h) => h.command)
				.join(" ");
		assert.match(wiredOn("PreCompact"), /pre-compact-handoff\.mjs/);
		const resume = (settings.hooks?.SessionStart ?? []).find((e) =>
			(e.hooks ?? []).some((h) => h.command?.includes("post-compact-resume")),
		);
		assert.ok(resume, "post-compact-resume.mjs is not wired to SessionStart");
		assert.match(
			resume.matcher ?? "",
			/compact/,
			"post-compact-resume must fire on the `compact` source or the handoff it reads is never consumed",
		);
	});

	it("every wired hook command points at a file that exists", () => {
		for (const entries of Object.values(settings.hooks ?? {})) {
			for (const entry of entries ?? []) {
				for (const h of entry.hooks ?? []) {
					const m = h.command?.match(/\.claude\/hooks\/([\w.-]+\.mjs)/);
					if (!m) continue;
					assert.ok(
						existsSync(join(HOOKS_DIR, m[1])),
						`settings.json wires ${m[1]} but the file does not exist`,
					);
				}
			}
		}
	});
});
