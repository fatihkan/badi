// Node.js hook testleri (#126 phase 2).
// Her hook stdin->stdout/exit kontratina test eder.

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
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const REPO_ROOT = resolve(__dirname, "..");
const HOOKS_DIR = resolve(REPO_ROOT, ".claude", "hooks");

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
	const dir = mkdtempSync(join(tmpdir(), "badi-hook-test-"));
	mkdirSync(join(dir, ".claude", "hooks"), { recursive: true });
	mkdirSync(join(dir, ".claude", "logs"), { recursive: true });
	mkdirSync(join(dir, ".claude", "agents"), { recursive: true });
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

	it("usage.jsonl'e satir ekler", () => {
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

	it("badi olmayan komut subcommand bos", () => {
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

	it("audit-trail.md'ye satir ekler", () => {
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
		spawnSync("git", ["init", "-b", "feature/test"], { cwd: dir });
	});
	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
	});

	it("feature branch icin pas (bos cikti)", () => {
		const r = runHook(
			"branch-guard",
			{ tool_input: { command: "git commit -m 'x'" } },
			{ cwd: dir },
		);
		assert.equal(r.status, 0);
		assert.equal(r.stdout.trim(), "");
	});

	it("commit olmayan komut atlar", () => {
		const r = runHook(
			"branch-guard",
			{ tool_input: { command: "ls" } },
			{ cwd: dir },
		);
		assert.equal(r.status, 0);
		assert.equal(r.stdout.trim(), "");
	});
});

describe("hooks-node: guard-bash", () => {
	it("rm -rf / engellenir (HARD_BLOCK)", () => {
		const r = runHook("guard-bash", {
			tool_input: { command: "rm -rf /" },
		});
		assert.equal(r.status, 0);
		const out = JSON.parse(r.stdout.trim());
		assert.equal(out.decision, "block");
	});

	it("git push --force engellenir (SOFT_BLOCK)", () => {
		const r = runHook("guard-bash", {
			tool_input: { command: "git push --force" },
		});
		assert.equal(r.status, 0);
		const out = JSON.parse(r.stdout.trim());
		assert.equal(out.decision, "block");
	});

	it("normal komut pas gecer", () => {
		const r = runHook("guard-bash", {
			tool_input: { command: "ls -la" },
		});
		assert.equal(r.status, 0);
		assert.equal(r.stdout.trim(), "");
	});

	it("npm publish kayit edilir ama gecer", () => {
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

	it("Generic AKIA AWS key tespit edilir", () => {
		// Runtime'da olustur, literal kullanma.
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
		assert.match(out.reason, /Gizli/);
	});

	it("knowledge-base.md'de tamamlanmamis isaretler engellenir", () => {
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

	it("settings.json gecersiz JSON engellenir", () => {
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

	it("normal yazma gecer", () => {
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

	it("yedek olusturur", () => {
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

	it("/tmp/ atlar", () => {
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

	it("ENOENT FILESYSTEM/WARN olur", () => {
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

	it("network hatasi NETWORK/ERROR + incident-log", () => {
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

	it("pre-compact marker yazar, post-compact siler", () => {
		const pre = runHook("pre-compact-handoff", "{}", { cwd: dir });
		assert.equal(pre.status, 0);
		const marker = join(dir, ".claude", ".compaction-occurred");
		assert.ok(existsSync(marker));

		const post = runHook("post-compact-resume", "{}", { cwd: dir });
		assert.equal(post.status, 0);
		assert.ok(!existsSync(marker));
		assert.match(post.stdout, /Sikistirma sonrasi devam/);
	});

	it("post-compact marker yoksa pas", () => {
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

	it("block kararlari sayar", () => {
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

	it("learning nominasyona eklenir", () => {
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

	it("standart dizinleri olusturur ve marker'lari temizler", () => {
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
			assert.ok(existsSync(join(dir, ".claude", d)), `${d} olmali`);
		}
	});
});
