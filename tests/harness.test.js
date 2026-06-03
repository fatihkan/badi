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
import claudeAdapter from "../lib/harnesses/claude.js";
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
	it("5 harness kayitli: claude, cursor, gemini, windsurf, agents", () => {
		assert.deepEqual(HARNESS_IDS.sort(), [
			"agents",
			"claude",
			"cursor",
			"gemini",
			"windsurf",
		]);
	});

	it("getHarness id ile bulur", () => {
		assert.equal(getHarness("claude").id, "claude");
		assert.equal(getHarness("cursor").id, "cursor");
		assert.equal(getHarness("gemini").id, "gemini");
		assert.equal(getHarness("yok"), null);
	});

	it("resolveHarnesses 'all' tum harness'lari verir", () => {
		const r = resolveHarnesses("all");
		assert.equal(r.length, 5);
	});

	it("resolveHarnesses virgul-ayrimli parse eder", () => {
		const r = resolveHarnesses("claude,cursor");
		assert.equal(r.length, 2);
		assert.equal(r[0].id, "claude");
		assert.equal(r[1].id, "cursor");
	});

	it("resolveHarnesses tek id verir", () => {
		const r = resolveHarnesses("gemini");
		assert.equal(r.length, 1);
		assert.equal(r[0].id, "gemini");
	});

	it("resolveHarnesses bos string icin bos array", () => {
		assert.deepEqual(resolveHarnesses(""), []);
		assert.deepEqual(resolveHarnesses(null), []);
	});

	it("resolveHarnesses bilinmeyen id firlatir", () => {
		assert.throws(() => resolveHarnesses("bogus"), /Bilinmeyen harness/);
	});

	it("resolveHarnesses case-insensitive calisir", () => {
		assert.equal(resolveHarnesses("CURSOR")[0].id, "cursor");
		assert.equal(resolveHarnesses("Gemini")[0].id, "gemini");
		assert.equal(resolveHarnesses("ALL").length, 5);
		const mixed = resolveHarnesses("Claude,CURSOR");
		assert.equal(mixed[0].id, "claude");
		assert.equal(mixed[1].id, "cursor");
	});

	it("detectHarness bos dizinde null", () => {
		const tmp = mkTmp();
		try {
			assert.equal(detectHarness(tmp), null);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("detectHarness .claude icin claude dondurur", () => {
		const tmp = mkTmp();
		try {
			mkdirSync(join(tmp, ".claude"));
			assert.equal(detectHarness(tmp)?.id, "claude");
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("her adapter zorunlu alanlari tasir", () => {
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

	it("bos dizinde install .claude/ uretir", () => {
		const r = claudeAdapter.install({ target: tmp, src: SRC });
		assert.ok(r.copied > 0);
		assert.ok(existsSync(join(tmp, ".claude")));
	});

	it("install CLAUDE.md kopyalar", () => {
		assert.ok(existsSync(join(tmp, "CLAUDE.md")));
	});

	it("install Node.js hook'lari yerlestirir", () => {
		const hook = join(tmp, ".claude", "hooks", "guard-bash.mjs");
		assert.ok(existsSync(hook), "guard-bash.mjs mevcut olmali");
	});

	it("detect kurulu dizini tespit eder", () => {
		assert.equal(claudeAdapter.detect(tmp), true);
	});

	it("doctor kurulumdan sonra fail=0", () => {
		const r = claudeAdapter.doctor({ target: tmp });
		assert.equal(r.fail, 0);
		assert.ok(Array.isArray(r.checks));
		assert.equal(r.pass + r.warn + r.fail, r.checks.length);
	});

	it("update --force user file'lari korur", () => {
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

	it("install .cursor/ yapisini uretir", () => {
		const r = cursorAdapter.install({ target: tmp, src: SRC });
		assert.ok(r.copied > 0);
		assert.ok(existsSync(join(tmp, ".cursor")));
	});

	it("badi-main.mdc rule dosyasi olusur", () => {
		const p = join(tmp, ".cursor", "rules", "badi-main.mdc");
		assert.ok(existsSync(p));
		const content = readFileSync(p, "utf-8");
		assert.ok(content.startsWith("---"));
		assert.ok(content.includes("alwaysApply: true"));
	});

	it("komutlar .cursor/commands/ altina kopyalanir", () => {
		const cmdDir = join(tmp, ".cursor", "commands");
		assert.ok(existsSync(cmdDir));
		const files = readdirSync(cmdDir).filter((f) => f.endsWith(".md"));
		const srcCount = readdirSync(join(SRC, "commands")).filter((f) =>
			f.endsWith(".md"),
		).length;
		assert.equal(files.length, srcCount);
	});

	it("kopyalanan komutlar Cursor preface'i tasiyor", () => {
		const cmdDir = join(tmp, ".cursor", "commands");
		const first = readdirSync(cmdDir).find((f) => f.endsWith(".md"));
		const body = readFileSync(join(cmdDir, first), "utf-8");
		assert.ok(body.startsWith("> **Note:** This file was compiled by Badi"));
	});

	it("badi-main.mdc alwaysApply: true icerir, globs satiri yok", () => {
		const content = readFileSync(
			join(tmp, ".cursor", "rules", "badi-main.mdc"),
			"utf-8",
		);
		assert.ok(content.includes("alwaysApply: true"));
		assert.equal(content.includes("globs:"), false);
	});

	it("mcp.json .cursor/ altina kopyalanir", () => {
		const p = join(tmp, ".cursor", "mcp.json");
		assert.ok(existsSync(p));
		const obj = JSON.parse(readFileSync(p, "utf-8"));
		assert.ok(obj.mcpServers);
	});

	it("skippedComponents hooks + skills raporlar", () => {
		const r = cursorAdapter.install({ target: mkTmp(), src: SRC });
		const kinds = r.skippedComponents.map((s) => s.component);
		assert.ok(kinds.includes("hooks"));
		assert.ok(kinds.includes("skills"));
	});

	it("transformCommand preface'i iki kez eklemez (idempotent)", () => {
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

	it("detect .cursor tespit eder", () => {
		assert.equal(cursorAdapter.detect(tmp), true);
	});

	it("doctor kurulumdan sonra saglikli", () => {
		const r = cursorAdapter.doctor({ target: tmp });
		assert.equal(r.fail, 0);
		assert.equal(r.pass + r.warn + r.fail, r.checks.length);
	});

	it("doctor bos dizin icin fail > 0", () => {
		const empty = mkTmp();
		try {
			const r = cursorAdapter.doctor({ target: empty });
			assert.ok(r.fail > 0);
		} finally {
			rmSync(empty, { recursive: true, force: true });
		}
	});

	it("dry-run diski degistirmez", () => {
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

	it("install GEMINI.md + .gemini/settings.json uretir", () => {
		const r = geminiAdapter.install({ target: tmp, src: SRC });
		assert.ok(r.copied >= 1);
		assert.ok(existsSync(join(tmp, "GEMINI.md")));
	});

	it("GEMINI.md CLAUDE.md icerigini tasir", () => {
		const content = readFileSync(join(tmp, "GEMINI.md"), "utf-8");
		assert.ok(content.includes("Badi") || content.includes("Is Akisi"));
	});

	it("settings.json JSON olarak gecerli", () => {
		const p = join(tmp, ".gemini", "settings.json");
		if (existsSync(p)) {
			assert.doesNotThrow(() => JSON.parse(readFileSync(p, "utf-8")));
		}
	});

	it("skippedComponents commands + hooks raporlar", () => {
		const r = geminiAdapter.install({ target: mkTmp(), src: SRC });
		const kinds = r.skippedComponents.map((s) => s.component);
		assert.ok(kinds.includes("commands"));
		assert.ok(kinds.includes("hooks"));
		assert.ok(kinds.includes("skills"));
		assert.ok(kinds.includes("subagents"));
	});

	it("supports sinirlari dogru", () => {
		assert.equal(geminiAdapter.supports.commands, false);
		assert.equal(geminiAdapter.supports.hooks, false);
		assert.equal(geminiAdapter.supports.rules, true);
		assert.equal(geminiAdapter.supports.mcp, true);
	});

	it("detect GEMINI.md veya .gemini tespit eder", () => {
		assert.equal(geminiAdapter.detect(tmp), true);
	});

	it("doctor GEMINI.md varsa saglikli", () => {
		const r = geminiAdapter.doctor({ target: tmp });
		assert.equal(r.fail, 0);
	});

	it("doctor bos dizin icin fail > 0", () => {
		const empty = mkTmp();
		try {
			const r = geminiAdapter.doctor({ target: empty });
			assert.ok(r.fail > 0);
		} finally {
			rmSync(empty, { recursive: true, force: true });
		}
	});
});

describe("init --harness CLI entegrasyonu", () => {
	it("--harness cursor sessizce cursor kurar", () => {
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

	it("--harness=gemini equal-form calisir", () => {
		const tmp = mkTmp();
		try {
			runCli(["init", "--harness=gemini", "--no-save"], tmp);
			assert.ok(existsSync(join(tmp, "GEMINI.md")));
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("--harness all hepsini kurar", () => {
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

	it("--harness virgul-ayrimli calisir", () => {
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

	it("bilinmeyen --harness exit 1", () => {
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

	it("--dry-run diski degistirmez", () => {
		const tmp = mkTmp();
		try {
			runCli(["init", "--harness", "cursor", "--dry-run", "--no-save"], tmp);
			assert.equal(existsSync(join(tmp, ".cursor")), false);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});
});

describe("update --harness CLI entegrasyonu", () => {
	it("kurulumsuz dizinde hata verir", () => {
		const tmp = mkTmp();
		try {
			assert.throws(() => runCli(["update"], tmp), { status: 1 });
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("cursor kurulumu otomatik tespit eder", () => {
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

describe("doctor --harness CLI entegrasyonu", () => {
	it("cursor kurulumunu dogru raporlar", () => {
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

	it("gemini kurulumunu dogru raporlar", () => {
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

	it("null (non-TTY) default dondurur", () => {
		const { harnesses, error } = parseMenuAnswer(null, "cursor", h);
		assert.equal(error, undefined);
		assert.equal(harnesses.length, 1);
		assert.equal(harnesses[0].id, "cursor");
	});

	it("bos string (Enter) default dondurur", () => {
		const { harnesses } = parseMenuAnswer("", "gemini", h);
		assert.equal(harnesses[0].id, "gemini");
	});

	it("sayi menu girisi ilgili harness'i secer", () => {
		assert.equal(parseMenuAnswer("1", "claude", h).harnesses[0].id, "claude");
		assert.equal(parseMenuAnswer("2", "claude", h).harnesses[0].id, "cursor");
		assert.equal(parseMenuAnswer("3", "claude", h).harnesses[0].id, "gemini");
	});

	it("son+1 numarasi 'Hepsi' demek", () => {
		const r = parseMenuAnswer(String(h.length + 1), "claude", h);
		assert.equal(r.harnesses.length, 3);
	});

	it("id metin olarak da kabul edilir (case-insensitive)", () => {
		assert.equal(
			parseMenuAnswer("cursor", "claude", h).harnesses[0].id,
			"cursor",
		);
		assert.equal(
			parseMenuAnswer("GEMINI", "claude", h).harnesses[0].id,
			"gemini",
		);
	});

	it("sinir disi sayi icin error dondurur", () => {
		const r = parseMenuAnswer("9", "claude", h);
		assert.equal(r.harnesses.length, 0);
		assert.match(r.error, /Invalid choice/);
	});

	it("negatif / sifir sayi icin error dondurur", () => {
		assert.match(parseMenuAnswer("0", "claude", h).error, /Invalid/);
		assert.match(parseMenuAnswer("-1", "claude", h).error, /Invalid/);
	});

	it("bilinmeyen id string icin error dondurur", () => {
		const r = parseMenuAnswer("bogus", "claude", h);
		assert.equal(r.harnesses.length, 0);
		assert.match(r.error, /Invalid choice/);
	});

	it("default id listede yoksa ilk item'a duser", () => {
		const { harnesses } = parseMenuAnswer(null, "yok", h);
		assert.equal(harnesses[0].id, "claude");
	});
});

describe("preferences env var isolation", () => {
	// Windows ESM loader absolute path'leri kabul etmez ('Received protocol d:').
	// pathToFileURL ile file:// URL'e cevir.
	const PREFS_URL = pathToFileURL(
		resolve(__dirname, "..", "lib", "preferences.js"),
	).href;

	it("BADI_PREFS_HOME tests icin home dizinini override eder", async () => {
		const tmp = mkTmp();
		try {
			// Child ESM import: dynamic import sonrasinda cache'lenir, bu nedenle
			// ayri bir child process yerine env ile execFileSync kullaniyoruz.
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

	it("setPreference gecersiz defaultHarness reddetler", async () => {
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
