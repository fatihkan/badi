import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	utimesSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, beforeEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import cron from "../lib/schedulers/cron.js";
import { pickScheduler, SCHEDULERS } from "../lib/schedulers/index.js";
import launchd from "../lib/schedulers/launchd.js";
import systemd from "../lib/schedulers/systemd.js";
import {
	listWatcherFiles,
	loadWatcher,
	parseEvery,
	runWatcher,
} from "../lib/watchers/index.js";
import {
	parseFrontmatter,
	validateWatcher,
	WatcherError,
} from "../lib/watchers/parse.js";
import runFileCheck from "../lib/watchers/types/file.js";
import runGitCheck from "../lib/watchers/types/git.js";
import runLogCheck from "../lib/watchers/types/log.js";
import runShellCheck from "../lib/watchers/types/shell.js";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const CLI = resolve(__dirname, "..", "bin", "badi.js");

function mkTmp() {
	return mkdtempSync(join(tmpdir(), "badi-watcher-test-"));
}

function writeWatcher(dir, name, frontmatter, body = "") {
	const p = join(dir, ".claude", "watchers", `${name}.md`);
	mkdirSync(join(p, ".."), { recursive: true });
	writeFileSync(p, `---\n${frontmatter}\n---\n${body}`);
	return p;
}

describe("watcher parse", () => {
	it("frontmatter parser basit alan + liste okur", () => {
		const content = `---
name: x
active: true
every: 15m
watch:
  - type: git
    pattern: WIP
    scope: last-5-commits
  - type: shell
    command: echo ok
---
body`;
		const { meta, body } = parseFrontmatter(content);
		assert.equal(meta.name, "x");
		assert.equal(meta.active, true);
		assert.equal(meta.every, "15m");
		assert.equal(meta.watch.length, 2);
		assert.equal(meta.watch[0].type, "git");
		assert.equal(meta.watch[0].pattern, "WIP");
		assert.equal(meta.watch[1].type, "shell");
		assert.equal(body.trim(), "body");
	});

	it("frontmatter kapanisi yoksa hata", () => {
		assert.throws(() => parseFrontmatter("---\nfoo: bar\n"), WatcherError);
	});

	it("frontmatter baslangici yoksa hata", () => {
		assert.throws(() => parseFrontmatter("foo: bar\n"), WatcherError);
	});

	it("parseEvery: 15m = 900", () => assert.equal(parseEvery("15m"), 900));
	it("parseEvery: 1h = 3600", () => assert.equal(parseEvery("1h"), 3600));
	it("parseEvery: daily = 86400", () =>
		assert.equal(parseEvery("daily"), 86400));
	it("parseEvery: 30s reddedilir (min 60s)", () =>
		assert.throws(() => parseEvery("30s"), WatcherError));
	it("parseEvery: gecersiz format reddedilir", () =>
		assert.throws(() => parseEvery("abc"), WatcherError));

	it("validateWatcher: name eksik ise hata", () => {
		assert.throws(
			() => validateWatcher({ watch: [{ type: "git" }] }),
			WatcherError,
		);
	});

	it("validateWatcher: watch listesi bos ise hata", () => {
		assert.throws(
			() => validateWatcher({ name: "xy", watch: [] }),
			/watch listesi bos/,
		);
	});

	it("validateWatcher: gecersiz type reddedilir", () => {
		assert.throws(
			() =>
				validateWatcher({
					name: "xy",
					watch: [{ type: "invalid" }],
				}),
			/gecersiz/i,
		);
	});

	it("validateWatcher: gecersiz name format reddedilir", () => {
		assert.throws(
			() =>
				validateWatcher({
					name: "Has Space",
					watch: [{ type: "git" }],
				}),
			/Gecersiz name/,
		);
	});

	it("loadWatcher: .md dosyayi parse + validate eder", () => {
		const dir = mkTmp();
		try {
			const p = writeWatcher(
				dir,
				"my",
				"name: my\nevery: 10m\nwatch:\n  - type: git\n    pattern: x",
				"notes",
			);
			const w = loadWatcher(p);
			assert.equal(w.name, "my");
			assert.equal(w.every, "10m");
			assert.equal(w.watches.length, 1);
			assert.equal(w.active, true);
			assert.ok(w.reportTo.includes("my"));
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it("listWatcherFiles bos projede [] dondurur", () => {
		const dir = mkTmp();
		try {
			assert.deepEqual(listWatcherFiles(dir), []);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});
});

describe("watcher types", () => {
	let dir;
	before(() => {
		dir = mkTmp();
	});
	after(() => rmSync(dir, { recursive: true, force: true }));

	it("shell: exit-nonzero fail algilar", () => {
		const r = runShellCheck(
			{ type: "shell", command: "exit 3", alert_on: "exit-nonzero" },
			{ cwd: dir, state: {} },
		);
		assert.equal(r.pass, false);
		assert.match(r.message, /Exit 3/);
	});

	it("shell: exit 0 gecerli", () => {
		const r = runShellCheck(
			{ type: "shell", command: "true", alert_on: "exit-nonzero" },
			{ cwd: dir, state: {} },
		);
		assert.equal(r.pass, true);
	});

	it("shell: stdout-match alert", () => {
		const r = runShellCheck(
			{
				type: "shell",
				command: "echo 'found ERROR line'",
				alert_on: "stdout-match:ERROR",
			},
			{ cwd: dir, state: {} },
		);
		assert.equal(r.pass, false);
		assert.match(r.message, /stdout eslesmesi/);
	});

	it("shell: timeout", () => {
		const r = runShellCheck(
			{
				type: "shell",
				command: "sleep 5",
				alert_on: "exit-nonzero",
				timeout: "1s",
			},
			{ cwd: dir, state: {} },
		);
		assert.equal(r.pass, false);
	});

	it("file: degismemis ise OK", () => {
		const p = join(dir, "tmp-file.txt");
		writeFileSync(p, "v1");
		const state = {};
		// ilk kosma state'i kaydeder
		runFileCheck({ type: "file", path: "tmp-file.txt" }, { cwd: dir, state });
		// ikinci kosma: ayni dosya
		const r2 = runFileCheck(
			{ type: "file", path: "tmp-file.txt" },
			{ cwd: dir, state },
		);
		assert.equal(r2.pass, true);
	});

	it("file: degistiginde fail", () => {
		const p = join(dir, "tmp-file2.txt");
		writeFileSync(p, "v1");
		const state = {};
		runFileCheck({ type: "file", path: "tmp-file2.txt" }, { cwd: dir, state });
		const future = new Date(Date.now() + 2000);
		utimesSync(p, future, future);
		writeFileSync(p, "v2-longer");
		const r = runFileCheck(
			{ type: "file", path: "tmp-file2.txt" },
			{ cwd: dir, state },
		);
		assert.equal(r.pass, false);
		assert.match(r.message, /degisti/);
	});

	it("file: dependency-added tespit eder", () => {
		const p = join(dir, "package.json");
		writeFileSync(p, JSON.stringify({ dependencies: { a: "1" } }));
		const state = {};
		runFileCheck(
			{ type: "file", path: "package.json", alert_on: "dependency-added" },
			{ cwd: dir, state },
		);
		writeFileSync(p, JSON.stringify({ dependencies: { a: "1", b: "2" } }));
		const r = runFileCheck(
			{ type: "file", path: "package.json", alert_on: "dependency-added" },
			{ cwd: dir, state },
		);
		assert.equal(r.pass, false);
		assert.match(r.message, /yeni bagimlilik/);
		assert.ok(r.details.some((d) => d.includes("b@")));
	});

	it("log: ilk kosma OK", () => {
		const p = join(dir, "new.log");
		writeFileSync(p, "line1\nline2\n");
		const state = {};
		// state'i sifirlayan ilk cagri — ilk kosma "yeni giris yok" demek icin
		// mevcut size'i kaydediyor
		const _r1 = runLogCheck(
			{ type: "log", path: "new.log" },
			{ cwd: dir, state },
		);
		// sonrasinda ayni boyutta kaldigi icin pass
		const r2 = runLogCheck(
			{ type: "log", path: "new.log" },
			{ cwd: dir, state },
		);
		assert.equal(r2.pass, true);
	});

	it("log: yeni satir eklendiginde alert", () => {
		const p = join(dir, "new2.log");
		writeFileSync(p, "a\n");
		const state = {};
		runLogCheck({ type: "log", path: "new2.log" }, { cwd: dir, state });
		writeFileSync(p, "a\nb\nc\n");
		const r = runLogCheck(
			{ type: "log", path: "new2.log" },
			{ cwd: dir, state },
		);
		assert.equal(r.pass, false);
		assert.match(r.message, /yeni satir/);
	});

	it("log: pattern-match ile filtreler", () => {
		const p = join(dir, "new3.log");
		writeFileSync(p, "info: ok\n");
		const state = {};
		runLogCheck({ type: "log", path: "new3.log" }, { cwd: dir, state });
		writeFileSync(p, "info: ok\nERROR: bozuldu\ninfo: tamam\n");
		const r = runLogCheck(
			{ type: "log", path: "new3.log", alert_on: "pattern-match:ERROR" },
			{ cwd: dir, state },
		);
		assert.equal(r.pass, false);
		assert.match(r.message, /ERROR/);
	});

	it("git: git olmayan dizinde fail", () => {
		const r = runGitCheck(
			{ type: "git", pattern: "WIP" },
			{ cwd: dir, state: {} },
		);
		assert.equal(r.pass, false);
	});
});

describe("schedulers", () => {
	it("pickScheduler platforma gore dogru secer", () => {
		const s = pickScheduler();
		if (process.platform === "darwin") assert.equal(s.id, "launchd");
		// Linux/other: systemd veya cron
	});

	it("launchd dry-run plist icerigi uretir", () => {
		if (process.platform !== "darwin") return;
		const r = launchd.install(
			{
				name: "test-dry",
				cmd: "node",
				args: ["--version"],
				cwd: "/tmp",
				intervalSeconds: 900,
				logDir: "/tmp",
			},
			{ dryRun: true },
		);
		assert.ok(r.plan.endsWith(".plist"));
		assert.match(r.content, /<key>Label<\/key>/);
		assert.match(r.content, /com\.badi\.watcher\.test-dry/);
		assert.match(r.content, /<integer>900<\/integer>/);
	});

	it("systemd dry-run iki dosya planlar", () => {
		const r = systemd.install(
			{
				name: "test-dry",
				cmd: "node",
				args: ["--version"],
				cwd: "/tmp",
				intervalSeconds: 900,
			},
			{ dryRun: true },
		);
		assert.ok(r.plan.service.includes(".service"));
		assert.ok(r.plan.timer.includes(".timer"));
		assert.match(r.content.service, /ExecStart=node --version/);
		assert.match(r.content.timer, /OnUnitActiveSec=15min/);
	});

	it("cron dry-run cron expr + marker uretir", () => {
		const r = cron.install(
			{
				name: "test-dry",
				cmd: "node",
				args: ["--version"],
				cwd: "/tmp",
				intervalSeconds: 900,
			},
			{ dryRun: true },
		);
		assert.match(r.plan.line, /\*\/15 \* \* \* \*/);
		assert.match(r.plan.marker, /badi-watcher:test-dry/);
	});

	it("4 scheduler registry'de kayitli", () => {
		const ids = SCHEDULERS.map((s) => s.id).sort();
		assert.deepEqual(ids, ["cron", "launchd", "systemd", "taskscheduler"]);
	});
});

describe("runWatcher end-to-end", () => {
	it("tum kontroller + rapor yazimi", async () => {
		const dir = mkTmp();
		try {
			const p = writeWatcher(
				dir,
				"e2e",
				'name: e2e\nevery: 15m\nwatch:\n  - type: shell\n    command: "true"\n    alert_on: exit-nonzero',
				"",
			);
			const { watcher, results, overall } = await runWatcher(p, { cwd: dir });
			assert.equal(watcher.name, "e2e");
			assert.equal(results.length, 1);
			assert.equal(results[0].pass, true);
			assert.equal(overall, "ok");
			// report yazildi
			const reportPath = join(
				dir,
				".claude",
				"workspace",
				"watcher-reports",
				"e2e.md",
			);
			assert.ok(existsSync(reportPath));
			const content = readFileSync(reportPath, "utf-8");
			assert.match(content, /# Watcher Raporu: e2e/);
			assert.match(content, /— OK/);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	it("active: false olan watcher skipped", async () => {
		const dir = mkTmp();
		try {
			const p = writeWatcher(
				dir,
				"off",
				"name: off\nactive: false\nevery: 15m\nwatch:\n  - type: shell\n    command: true",
				"",
			);
			const r = await runWatcher(p, { cwd: dir });
			assert.equal(r.overall, "skipped");
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});
});

describe("badi agent CLI", () => {
	let dir;
	beforeEach(() => {
		dir = mkTmp();
		execFileSync("node", [CLI, "init", "--harness", "claude", "--no-save"], {
			cwd: dir,
			stdio: "pipe",
		});
	});

	it("agent list kurulu template'leri gosterir", () => {
		const out = execFileSync("node", [CLI, "agent", "list"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.match(out, /project-health/);
		assert.match(out, /deploy-watchdog/);
	});

	it("agent create yeni watcher olusturur", () => {
		execFileSync(
			"node",
			[CLI, "agent", "create", "yeni-watcher", "--template", "project-health"],
			{ cwd: dir, stdio: "pipe", env: { ...process.env, CI: "1" } },
		);
		const p = join(dir, ".claude", "watchers", "yeni-watcher.md");
		assert.ok(existsSync(p));
		const body = readFileSync(p, "utf-8");
		assert.match(body, /name: yeni-watcher/);
	});

	it("agent create gecersiz isim reddeder", () => {
		assert.throws(() =>
			execFileSync("node", [CLI, "agent", "create", "Has Space"], {
				cwd: dir,
				stdio: "pipe",
				env: { ...process.env, CI: "1" },
			}),
		);
	});

	it("agent install --dry-run yazilim yapmaz", () => {
		const out = execFileSync(
			"node",
			[CLI, "agent", "install", "project-health", "--dry-run"],
			{ cwd: dir, encoding: "utf-8" },
		);
		assert.match(out, /DRY-RUN/);
	});

	it("agent install bilinmeyen watcher icin temiz hata", () => {
		assert.throws(() => {
			execFileSync(
				"node",
				[CLI, "agent", "install", "yok-boyle", "--dry-run"],
				{ cwd: dir, stdio: "pipe", encoding: "utf-8" },
			);
		}, /Watcher yok/);
	});

	it("agent tail bilinmeyen watcher icin temiz hata", () => {
		assert.throws(() => {
			execFileSync("node", [CLI, "agent", "tail", "yok-boyle"], {
				cwd: dir,
				stdio: "pipe",
				encoding: "utf-8",
			});
		}, /Watcher yok/);
	});

	it("agent --help install satirinda --yes bayragini gosterir", () => {
		const out = execFileSync("node", [CLI, "agent", "--help"], {
			cwd: dir,
			encoding: "utf-8",
		});
		assert.match(out, /install .*--yes/);
	});

	it("agent status bos projede hata vermez", () => {
		const r = execFileSync("node", [CLI, "agent", "status"], {
			cwd: mkTmp(),
			encoding: "utf-8",
		});
		assert.match(r, /Kayitli watcher yok|Son/);
	});

	it("agent remove watcher.md siler", () => {
		execFileSync("node", [CLI, "agent", "remove", "project-health"], {
			cwd: dir,
			stdio: "pipe",
		});
		const p = join(dir, ".claude", "watchers", "project-health.md");
		assert.equal(existsSync(p), false);
	});
});
