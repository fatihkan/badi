import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseMenuAnswer } from "../lib/commands/init.js";
import claudeAdapter, {
	findRelativeHookCommands,
} from "../lib/harnesses/claude.js";
import cursorAdapter, { transformCommand } from "../lib/harnesses/cursor.js";
import geminiAdapter from "../lib/harnesses/gemini.js";
import {
	detectHarness,
	getHarness,
	HARNESS_IDS,
	HARNESSES,
	resolveHarnesses,
} from "../lib/harnesses/index.js";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");
const PKG_ROOT = resolve(__dirname, "..");
const SRC = resolve(PKG_ROOT, ".claude");

function mkTmp() {
	return mkdtempSync(join(tmpdir(), "badi-harness-"));
}

function runCli(args, cwd, extraEnv = {}) {
	return execFileSync("node", [CLI, ...args], {
		encoding: "utf-8",
		timeout: 20000,
		cwd,
		env: { ...process.env, BADI_PREFS_HOME: cwd, ...extraEnv },
	});
}

describe("harness registry", () => {
	it("5 harnesses registered: claude, cursor, gemini, windsurf, agents", () => {
		assert.deepEqual(HARNESS_IDS.sort(), [
			"agents",
			"claude",
			"cursor",
			"gemini",
			"windsurf",
		]);
	});

	it("getHarness finds by id", () => {
		assert.equal(getHarness("claude").id, "claude");
		assert.equal(getHarness("cursor").id, "cursor");
		assert.equal(getHarness("gemini").id, "gemini");
		assert.equal(getHarness("yok"), null);
	});

	it("resolveHarnesses 'all' returns all harnesses", () => {
		const r = resolveHarnesses("all");
		assert.equal(r.length, 5);
	});

	it("resolveHarnesses parses comma-separated values", () => {
		const r = resolveHarnesses("claude,cursor");
		assert.equal(r.length, 2);
		assert.equal(r[0].id, "claude");
		assert.equal(r[1].id, "cursor");
	});

	it("resolveHarnesses returns a single id", () => {
		const r = resolveHarnesses("gemini");
		assert.equal(r.length, 1);
		assert.equal(r[0].id, "gemini");
	});

	it("resolveHarnesses returns an empty array for an empty string", () => {
		assert.deepEqual(resolveHarnesses(""), []);
		assert.deepEqual(resolveHarnesses(null), []);
	});

	it("resolveHarnesses throws on an unknown id", () => {
		assert.throws(() => resolveHarnesses("bogus"), /Unknown harness/);
	});

	it("resolveHarnesses works case-insensitively", () => {
		assert.equal(resolveHarnesses("CURSOR")[0].id, "cursor");
		assert.equal(resolveHarnesses("Gemini")[0].id, "gemini");
		assert.equal(resolveHarnesses("ALL").length, 5);
		const mixed = resolveHarnesses("Claude,CURSOR");
		assert.equal(mixed[0].id, "claude");
		assert.equal(mixed[1].id, "cursor");
	});

	it("detectHarness returns null in an empty directory", () => {
		const tmp = mkTmp();
		try {
			assert.equal(detectHarness(tmp), null);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("detectHarness returns claude for .claude", () => {
		const tmp = mkTmp();
		try {
			mkdirSync(join(tmp, ".claude"));
			assert.equal(detectHarness(tmp)?.id, "claude");
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("every adapter carries the required fields", () => {
		for (const h of HARNESSES) {
			assert.ok(h.id);
			assert.ok(h.name);
			assert.ok(typeof h.install === "function");
			assert.ok(typeof h.update === "function");
			assert.ok(typeof h.doctor === "function");
			assert.ok(typeof h.detect === "function");
			assert.ok(h.supports && typeof h.supports === "object");
		}
	});
});

describe("claude adapter", () => {
	let tmp;
	before(() => {
		tmp = mkTmp();
	});
	after(() => rmSync(tmp, { recursive: true, force: true }));

	it("install generates .claude/ in an empty directory", () => {
		const r = claudeAdapter.install({ target: tmp, src: SRC });
		assert.ok(r.copied > 0);
		assert.ok(existsSync(join(tmp, ".claude")));
	});

	it("install copies CLAUDE.md", () => {
		assert.ok(existsSync(join(tmp, "CLAUDE.md")));
	});

	it("install places the Node.js hooks", () => {
		const hook = join(tmp, ".claude", "hooks", "guard-bash.mjs");
		assert.ok(existsSync(hook), "guard-bash.mjs should exist");
	});

	it("detect detects an installed directory", () => {
		assert.equal(claudeAdapter.detect(tmp), true);
	});

	it("doctor reports fail=0 after install", () => {
		const r = claudeAdapter.doctor({ target: tmp });
		assert.equal(r.fail, 0);
		assert.ok(Array.isArray(r.checks));
		assert.equal(r.pass + r.warn + r.fail, r.checks.length);
	});

	it("update --force preserves user files", () => {
		const memPath = join(tmp, ".claude", "memory.md");
		writeFileSync(memPath, "# Ozel icerik - kayip olmasin");
		claudeAdapter.update({ target: tmp, src: SRC, force: true });
		assert.ok(readFileSync(memPath, "utf-8").includes("Ozel icerik"));
	});
});

describe("cursor adapter", () => {
	let tmp;
	before(() => {
		tmp = mkTmp();
	});
	after(() => rmSync(tmp, { recursive: true, force: true }));

	it("install generates the .cursor/ structure", () => {
		const r = cursorAdapter.install({ target: tmp, src: SRC });
		assert.ok(r.copied > 0);
		assert.ok(existsSync(join(tmp, ".cursor")));
	});

	it("creates the badi-main.mdc rule file", () => {
		const p = join(tmp, ".cursor", "rules", "badi-main.mdc");
		assert.ok(existsSync(p));
		const content = readFileSync(p, "utf-8");
		assert.ok(content.startsWith("---"));
		assert.ok(content.includes("alwaysApply: true"));
	});

	it("copies commands under .cursor/commands/", () => {
		const cmdDir = join(tmp, ".cursor", "commands");
		assert.ok(existsSync(cmdDir));
		const files = readdirSync(cmdDir).filter((f) => f.endsWith(".md"));
		const srcCount = readdirSync(join(SRC, "commands")).filter((f) =>
			f.endsWith(".md"),
		).length;
		assert.equal(files.length, srcCount);
	});

	it("copied commands carry the Cursor preface", () => {
		const cmdDir = join(tmp, ".cursor", "commands");
		const first = readdirSync(cmdDir).find((f) => f.endsWith(".md"));
		const body = readFileSync(join(cmdDir, first), "utf-8");
		assert.ok(body.startsWith("> **Note:** This file was compiled by Badi"));
	});

	it("badi-main.mdc contains alwaysApply: true, no globs line", () => {
		const content = readFileSync(
			join(tmp, ".cursor", "rules", "badi-main.mdc"),
			"utf-8",
		);
		assert.ok(content.includes("alwaysApply: true"));
		assert.equal(content.includes("globs:"), false);
	});

	it("copies mcp.json under .cursor/", () => {
		const p = join(tmp, ".cursor", "mcp.json");
		assert.ok(existsSync(p));
		const obj = JSON.parse(readFileSync(p, "utf-8"));
		assert.ok(obj.mcpServers);
	});

	it("skippedComponents reports hooks + skills", () => {
		const r = cursorAdapter.install({ target: mkTmp(), src: SRC });
		const kinds = r.skippedComponents.map((s) => s.component);
		assert.ok(kinds.includes("hooks"));
		assert.ok(kinds.includes("skills"));
	});

	it("transformCommand does not add the preface twice (idempotent)", () => {
		const original = "# Test\nbody";
		const once = transformCommand(original);
		const twice = transformCommand(once);
		assert.equal(once, twice);
	});

	it("supports.hooks = false, supports.skills = false", () => {
		assert.equal(cursorAdapter.supports.hooks, false);
		assert.equal(cursorAdapter.supports.skills, false);
		assert.equal(cursorAdapter.supports.commands, true);
	});

	it("detect detects .cursor", () => {
		assert.equal(cursorAdapter.detect(tmp), true);
	});

	it("doctor is healthy after install", () => {
		const r = cursorAdapter.doctor({ target: tmp });
		assert.equal(r.fail, 0);
		assert.equal(r.pass + r.warn + r.fail, r.checks.length);
	});

	it("doctor reports fail > 0 for an empty directory", () => {
		const empty = mkTmp();
		try {
			const r = cursorAdapter.doctor({ target: empty });
			assert.ok(r.fail > 0);
		} finally {
			rmSync(empty, { recursive: true, force: true });
		}
	});

	it("dry-run does not modify the disk", () => {
		const empty = mkTmp();
		try {
			cursorAdapter.install({ target: empty, src: SRC, dryRun: true });
			assert.equal(existsSync(join(empty, ".cursor", "rules")), false);
		} finally {
			rmSync(empty, { recursive: true, force: true });
		}
	});
});

describe("gemini adapter", () => {
	let tmp;
	before(() => {
		tmp = mkTmp();
	});
	after(() => rmSync(tmp, { recursive: true, force: true }));

	it("install generates GEMINI.md + .gemini/settings.json", () => {
		const r = geminiAdapter.install({ target: tmp, src: SRC });
		assert.ok(r.copied >= 1);
		assert.ok(existsSync(join(tmp, "GEMINI.md")));
	});

	it("GEMINI.md carries the CLAUDE.md content", () => {
		const content = readFileSync(join(tmp, "GEMINI.md"), "utf-8");
		assert.ok(content.includes("Badi") || content.includes("Is Akisi"));
	});

	it("settings.json is valid JSON", () => {
		const p = join(tmp, ".gemini", "settings.json");
		if (existsSync(p)) {
			assert.doesNotThrow(() => JSON.parse(readFileSync(p, "utf-8")));
		}
	});

	it("skippedComponents reports commands + hooks", () => {
		const r = geminiAdapter.install({ target: mkTmp(), src: SRC });
		const kinds = r.skippedComponents.map((s) => s.component);
		assert.ok(kinds.includes("commands"));
		assert.ok(kinds.includes("hooks"));
		assert.ok(kinds.includes("skills"));
		assert.ok(kinds.includes("subagents"));
	});

	it("supports limits are correct", () => {
		assert.equal(geminiAdapter.supports.commands, false);
		assert.equal(geminiAdapter.supports.hooks, false);
		assert.equal(geminiAdapter.supports.rules, true);
		assert.equal(geminiAdapter.supports.mcp, true);
	});

	it("detect detects GEMINI.md or .gemini", () => {
		assert.equal(geminiAdapter.detect(tmp), true);
	});

	it("doctor is healthy when GEMINI.md exists", () => {
		const r = geminiAdapter.doctor({ target: tmp });
		assert.equal(r.fail, 0);
	});

	it("doctor reports fail > 0 for an empty directory", () => {
		const empty = mkTmp();
		try {
			const r = geminiAdapter.doctor({ target: empty });
			assert.ok(r.fail > 0);
		} finally {
			rmSync(empty, { recursive: true, force: true });
		}
	});
});

describe("init --harness CLI integration", () => {
	it("--harness cursor installs cursor silently", () => {
		const tmp = mkTmp();
		try {
			const out = runCli(["init", "--harness", "cursor", "--no-save"], tmp);
			assert.ok(out.includes("Cursor"));
			assert.ok(existsSync(join(tmp, ".cursor")));
			assert.equal(existsSync(join(tmp, ".claude")), false);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("--harness=gemini equal-form works", () => {
		const tmp = mkTmp();
		try {
			runCli(["init", "--harness=gemini", "--no-save"], tmp);
			assert.ok(existsSync(join(tmp, "GEMINI.md")));
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("--harness all installs all of them", () => {
		const tmp = mkTmp();
		try {
			runCli(["init", "--harness", "all", "--no-save"], tmp);
			assert.ok(existsSync(join(tmp, ".claude")));
			assert.ok(existsSync(join(tmp, ".cursor")));
			assert.ok(existsSync(join(tmp, "GEMINI.md")));
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("--harness works comma-separated", () => {
		const tmp = mkTmp();
		try {
			runCli(["init", "--harness", "claude,gemini", "--no-save"], tmp);
			assert.ok(existsSync(join(tmp, ".claude")));
			assert.ok(existsSync(join(tmp, "GEMINI.md")));
			assert.equal(existsSync(join(tmp, ".cursor")), false);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("unknown --harness exits 1", () => {
		const tmp = mkTmp();
		try {
			assert.throws(
				() => runCli(["init", "--harness", "bogus", "--no-save"], tmp),
				{ status: 1 },
			);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("--dry-run does not modify the disk", () => {
		const tmp = mkTmp();
		try {
			runCli(["init", "--harness", "cursor", "--dry-run", "--no-save"], tmp);
			assert.equal(existsSync(join(tmp, ".cursor")), false);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});
});

describe("update --harness CLI integration", () => {
	it("errors in a directory without an install", () => {
		const tmp = mkTmp();
		try {
			assert.throws(() => runCli(["update"], tmp), { status: 1 });
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("auto-detects a cursor install", () => {
		const tmp = mkTmp();
		try {
			runCli(["init", "--harness", "cursor", "--no-save"], tmp);
			const out = runCli(["update"], tmp);
			assert.ok(out.includes("Cursor"));
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});
});

describe("doctor --harness CLI integration", () => {
	it("reports a cursor install correctly", () => {
		const tmp = mkTmp();
		try {
			runCli(["init", "--harness", "cursor", "--no-save"], tmp);
			const out = runCli(["doctor"], tmp);
			assert.ok(out.includes("Cursor"));
			assert.ok(out.includes("saglikli") || out.includes("OK"));
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("reports a gemini install correctly", () => {
		const tmp = mkTmp();
		try {
			runCli(["init", "--harness", "gemini", "--no-save"], tmp);
			const out = runCli(["doctor", "--harness", "gemini"], tmp);
			assert.ok(out.includes("Gemini"));
			assert.ok(out.includes("GEMINI.md"));
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});
});

describe("parseMenuAnswer (offline)", () => {
	const h = [
		{ id: "claude", name: "Claude Code" },
		{ id: "cursor", name: "Cursor" },
		{ id: "gemini", name: "Gemini CLI" },
	];

	it("null (non-TTY) returns the default", () => {
		const { harnesses, error } = parseMenuAnswer(null, "cursor", h);
		assert.equal(error, undefined);
		assert.equal(harnesses.length, 1);
		assert.equal(harnesses[0].id, "cursor");
	});

	it("empty string (Enter) returns the default", () => {
		const { harnesses } = parseMenuAnswer("", "gemini", h);
		assert.equal(harnesses[0].id, "gemini");
	});

	it("numeric menu input selects the matching harness", () => {
		assert.equal(parseMenuAnswer("1", "claude", h).harnesses[0].id, "claude");
		assert.equal(parseMenuAnswer("2", "claude", h).harnesses[0].id, "cursor");
		assert.equal(parseMenuAnswer("3", "claude", h).harnesses[0].id, "gemini");
	});

	it("last+1 number means 'All'", () => {
		const r = parseMenuAnswer(String(h.length + 1), "claude", h);
		assert.equal(r.harnesses.length, 3);
	});

	it("id is also accepted as text (case-insensitive)", () => {
		assert.equal(
			parseMenuAnswer("cursor", "claude", h).harnesses[0].id,
			"cursor",
		);
		assert.equal(
			parseMenuAnswer("GEMINI", "claude", h).harnesses[0].id,
			"gemini",
		);
	});

	it("returns an error for an out-of-range number", () => {
		const r = parseMenuAnswer("9", "claude", h);
		assert.equal(r.harnesses.length, 0);
		assert.match(r.error, /Invalid choice/);
	});

	it("returns an error for a negative / zero number", () => {
		assert.match(parseMenuAnswer("0", "claude", h).error, /Invalid/);
		assert.match(parseMenuAnswer("-1", "claude", h).error, /Invalid/);
	});

	it("returns an error for an unknown id string", () => {
		const r = parseMenuAnswer("bogus", "claude", h);
		assert.equal(r.harnesses.length, 0);
		assert.match(r.error, /Invalid choice/);
	});

	it("falls back to the first item when the default id is not in the list", () => {
		const { harnesses } = parseMenuAnswer(null, "yok", h);
		assert.equal(harnesses[0].id, "claude");
	});
});

describe("preferences env var isolation", () => {
	// The Windows ESM loader does not accept absolute paths ('Received protocol d:').
	// Convert to a file:// URL with pathToFileURL.
	const PREFS_URL = pathToFileURL(
		resolve(__dirname, "..", "lib", "preferences.js"),
	).href;

	it("BADI_PREFS_HOME overrides the home directory for tests", async () => {
		const tmp = mkTmp();
		try {
			// Child ESM import: it gets cached after a dynamic import, so
			// we use execFileSync with env instead of a separate child process.
			const out = execFileSync(
				"node",
				[
					"-e",
					`(async () => {
						const m = await import("${PREFS_URL}");
						m.setPreference("defaultHarness", "cursor");
						console.log(m.getPreference("defaultHarness"));
						console.log(m.PREFS_PATH);
					})();`,
				],
				{
					encoding: "utf-8",
					env: { ...process.env, BADI_PREFS_HOME: tmp },
				},
			);
			const [value, path] = out.trim().split("\n");
			assert.equal(value, "cursor");
			assert.ok(
				path.startsWith(tmp),
				`PREFS_PATH should be under ${tmp}, got ${path}`,
			);
			assert.ok(existsSync(path));
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("setPreference rejects an invalid defaultHarness", async () => {
		const tmp = mkTmp();
		try {
			assert.throws(() => {
				execFileSync(
					"node",
					[
						"-e",
						`(async () => {
							const m = await import("${PREFS_URL}");
							m.setPreference("defaultHarness", "bogus");
						})();`,
					],
					{
						encoding: "utf-8",
						env: { ...process.env, BADI_PREFS_HOME: tmp },
						stdio: "pipe",
					},
				);
			});
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});
});

describe("findRelativeHookCommands — hook path anchoring", () => {
	it("flags a relative `node .claude/hooks/X.mjs` command", () => {
		const settings = {
			hooks: {
				Stop: [
					{
						matcher: "",
						hooks: [{ type: "command", command: "node .claude/hooks/x.mjs" }],
					},
				],
			},
		};
		const offenders = findRelativeHookCommands(settings);
		assert.equal(offenders.length, 1);
		assert.equal(offenders[0], "node .claude/hooks/x.mjs");
	});

	it("accepts a $CLAUDE_PROJECT_DIR-anchored command", () => {
		const settings = {
			hooks: {
				Stop: [
					{
						hooks: [
							{
								type: "command",
								command: 'node "$CLAUDE_PROJECT_DIR/.claude/hooks/x.mjs"',
							},
						],
					},
				],
			},
		};
		assert.deepEqual(findRelativeHookCommands(settings), []);
	});

	it("accepts the $CLAUDE_PLUGIN_ROOT plugin variant", () => {
		const settings = {
			hooks: {
				Stop: [
					{
						hooks: [
							{
								// biome-ignore lint/suspicious/noTemplateCurlyInString: literal ${CLAUDE_PLUGIN_ROOT} is the shipped plugin-variant form, not JS interpolation
								command: "node ${CLAUDE_PLUGIN_ROOT}/.claude/hooks/x.mjs",
							},
						],
					},
				],
			},
		};
		assert.deepEqual(findRelativeHookCommands(settings), []);
	});

	it("tolerates missing/empty/odd shapes", () => {
		assert.deepEqual(findRelativeHookCommands(undefined), []);
		assert.deepEqual(findRelativeHookCommands({}), []);
		assert.deepEqual(findRelativeHookCommands({ hooks: null }), []);
		assert.deepEqual(findRelativeHookCommands({ hooks: { Stop: "x" } }), []);
	});

	it("the shipped template settings.json is fully anchored", () => {
		const settings = JSON.parse(
			readFileSync(join(SRC, "settings.json"), "utf-8"),
		);
		assert.deepEqual(
			findRelativeHookCommands(settings),
			[],
			"badi's own .claude/settings.json must anchor every hook to $CLAUDE_PROJECT_DIR",
		);
	});
});
