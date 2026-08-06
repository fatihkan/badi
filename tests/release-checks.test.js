import assert from "node:assert/strict";
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
	bumpVersion,
	CHECKS,
	checkBranch,
	checkDocsSync,
	checkGhCli,
	checkLint,
	checkPackageJson,
	checkScoopManifest,
	parseTestSummary,
	runChecks,
} from "../lib/commands/release.js";

describe("release checks (post C2 refactor)", () => {
	it("CHECKS array contains at least 5 checks", () => {
		assert.ok(Array.isArray(CHECKS));
		assert.ok(CHECKS.length >= 5);
	});

	it("bumpVersion patch", () => {
		assert.equal(bumpVersion("1.29.0", "patch"), "1.29.1");
	});

	it("bumpVersion minor", () => {
		assert.equal(bumpVersion("1.29.5", "minor"), "1.30.0");
	});

	it("bumpVersion major", () => {
		assert.equal(bumpVersion("1.29.5", "major"), "2.0.0");
	});

	it("checkPackageJson null pkg fail", () => {
		const r = checkPackageJson({ pkg: null });
		assert.equal(r.level, "fail");
	});

	it("checkPackageJson valid pkg ok", () => {
		const r = checkPackageJson({
			pkg: { name: "x", version: "1.0.0" },
		});
		assert.equal(r.level, "ok");
		assert.match(r.label, /x v1\.0\.0/);
	});

	it("checkBranch returns level field", () => {
		const r = checkBranch();
		assert.ok(["ok", "warn", "fail"].includes(r.level));
	});

	it("checkGhCli returns level field", () => {
		const r = checkGhCli();
		assert.ok(["ok", "warn", "fail"].includes(r.level));
	});

	it("checkLint --skip-lint skips (warn, pass)", () => {
		const r = checkLint({ skipLint: true });
		assert.equal(r.name, "lint");
		assert.equal(r.pass, true);
		assert.equal(r.level, "warn");
	});

	it("checkLint returns a valid level on real execution", () => {
		// biome calistirir (hizli); repo durumuna gore ok/fail — yapiyi dogrula.
		const r = checkLint({});
		assert.equal(r.name, "lint");
		assert.ok(["ok", "fail"].includes(r.level));
	});

	it("runChecks calls all", () => {
		const results = runChecks({ pkg: null, skipTest: true, skipLint: true });
		assert.ok(results.length >= 4);
		for (const r of results) {
			assert.ok(typeof r.label === "string");
			assert.ok(["ok", "warn", "fail"].includes(r.level));
		}
	});

	// ─── parseTestSummary (reality feed for docs-sync) ───
	// Regression guard: the producer was TAP-only ("# pass N") while the runner
	// emits the spec reporter ("ℹ pass N"), so the count was always null and the
	// docs-sync reality check was silently inert in production (review #278).

	it("parseTestSummary reads the spec reporter (ℹ pass/fail/suites N)", () => {
		const out = "ℹ tests 1264\nℹ suites 221\nℹ pass 1264\nℹ fail 0\nℹ todo 0\n";
		assert.deepEqual(parseTestSummary(out), {
			passed: 1264,
			failed: 0,
			suites: 221,
		});
	});

	it("parseTestSummary reads the TAP reporter (# pass/fail N)", () => {
		const out = "1..1264\n# tests 1264\n# suites 220\n# pass 1264\n# fail 0\n";
		assert.deepEqual(parseTestSummary(out), {
			passed: 1264,
			failed: 0,
			suites: 220,
		});
	});

	it("parseTestSummary does not mistake 'ℹ tests N' or per-test lines for the pass count", () => {
		const out =
			"  ✔ something pass-through (1ms)\nℹ tests 9\nℹ pass 7\nℹ fail 2\n";
		assert.deepEqual(parseTestSummary(out), {
			passed: 7,
			failed: 2,
			suites: null,
		});
	});

	it("parseTestSummary returns nulls when the summary is absent", () => {
		assert.deepEqual(parseTestSummary("no summary here\n"), {
			passed: null,
			failed: null,
			suites: null,
		});
		assert.deepEqual(parseTestSummary(""), {
			passed: null,
			failed: null,
			suites: null,
		});
	});

	// ─── docs-sync gate (v1.34.1+) ───

	it("checkScoopManifest passes on the real repo (version + url in sync)", () => {
		const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
		const r = checkScoopManifest({ targetVersion: pkg.version });
		assert.ok(r, "expected a result on a repo with dist/scoop/badi.json");
		assert.equal(r.name, "scoop-manifest");
		assert.equal(r.level, "ok", `scoop drift detected: ${r.hint}`);
	});

	it("checkScoopManifest warns when the url lags the version (the v1.34.2 drift)", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-scoop-url-"));
		try {
			const p = join(tmp, "badi.json");
			writeFileSync(
				p,
				JSON.stringify({
					version: "1.34.2",
					url: "https://registry.npmjs.org/@fatihkan/badi/-/badi-1.34.1.tgz",
				}),
			);
			const r = checkScoopManifest({
				targetVersion: "1.34.2",
				paths: { scoop: p },
			});
			assert.equal(r.level, "warn");
			assert.match(r.hint, /url does not reference 1\.34\.2/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("checkScoopManifest warns when the version field disagrees", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-scoop-ver-"));
		try {
			const p = join(tmp, "badi.json");
			writeFileSync(
				p,
				JSON.stringify({
					version: "1.34.1",
					url: "https://registry.npmjs.org/@fatihkan/badi/-/badi-1.34.2.tgz",
				}),
			);
			const r = checkScoopManifest({
				targetVersion: "1.34.2",
				paths: { scoop: p },
			});
			assert.equal(r.level, "warn");
			assert.match(r.hint, /version 1\.34\.1 != 1\.34\.2/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("checkScoopManifest passes when both version and url match", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-scoop-ok-"));
		try {
			const p = join(tmp, "badi.json");
			writeFileSync(
				p,
				JSON.stringify({
					version: "1.34.2",
					url: "https://registry.npmjs.org/@fatihkan/badi/-/badi-1.34.2.tgz",
				}),
			);
			const r = checkScoopManifest({
				targetVersion: "1.34.2",
				paths: { scoop: p },
			});
			assert.equal(r.level, "ok");
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("checkScoopManifest returns null when the manifest is absent (optional channel)", () => {
		const r = checkScoopManifest({
			targetVersion: "1.34.2",
			paths: { scoop: join(tmpdir(), "definitely-missing-scoop-xyz.json") },
		});
		assert.equal(r, null);
	});

	it("checkDocsSync passes on the real repo (counts must stay in sync)", () => {
		const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
		const r = checkDocsSync({ targetVersion: pkg.version });
		assert.ok(r, "expected a result on a repo with a README");
		assert.equal(r.name, "docs-sync");
		assert.equal(r.level, "ok", `docs drift detected: ${r.hint}`);
	});

	it("checkDocsSync fails on disagreeing README test counts", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-docs-sync-"));
		try {
			writeFileSync(
				join(tmp, "README.md"),
				'<img src="https://img.shields.io/badge/tests-100%20passing-x" />\n' +
					"| **200 passing tests** | stuff |\n",
			);
			const r = checkDocsSync({ paths: { readme: join(tmp, "README.md") } });
			assert.equal(r.level, "fail");
			assert.match(r.hint, /test counts disagree/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("checkDocsSync fails when README counts agree but are STALE vs the real suite", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-docs-real-"));
		try {
			// all three surfaces agree (1191) — internal consistency holds — but
			// the suite actually has 1260; reality check must catch it.
			writeFileSync(
				join(tmp, "README.md"),
				'<img src="https://img.shields.io/badge/tests-1191%20passing-x" />\n' +
					"| **1191 passing tests** | stuff |\n" +
					"npm test # 1191 tests across 220 suites\n",
			);
			const r = checkDocsSync({
				actualTests: 1260,
				paths: { readme: join(tmp, "README.md") },
			});
			assert.equal(r.level, "fail");
			assert.match(r.hint, /stale vs suite \(1260\)/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("checkDocsSync fails when the dev-section SUITE count is stale vs reality", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-docs-suites-"));
		try {
			// test count is correct (1260) but the suite count (220) lags reality (222)
			writeFileSync(
				join(tmp, "README.md"),
				'<img src="https://img.shields.io/badge/tests-1260%20passing-x" />\n' +
					"| **1260 passing tests** | stuff |\n" +
					"npm test # 1260 tests across 220 suites\n",
			);
			const r = checkDocsSync({
				actualTests: 1260,
				actualSuites: 222,
				paths: { readme: join(tmp, "README.md") },
			});
			assert.equal(r.level, "fail");
			assert.match(
				r.hint,
				/suite count stale vs suite \(222\): dev section=220/,
			);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("checkDocsSync WARNs that reality was skipped under --skip-test", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-docs-skip-"));
		try {
			// counts agree internally; with skipTest the suite never ran, so the
			// gate must warn it verified consistency only, not reality.
			writeFileSync(
				join(tmp, "README.md"),
				'<img src="https://img.shields.io/badge/tests-1260%20passing-x" />\n' +
					"| **1260 passing tests** | stuff |\n",
			);
			const r = checkDocsSync({
				skipTest: true,
				paths: { readme: join(tmp, "README.md") },
			});
			assert.equal(r.pass, true);
			assert.equal(r.level, "warn");
			assert.match(r.hint, /reality check skipped/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("checkDocsSync passes when README counts match the real suite", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-docs-real2-"));
		try {
			writeFileSync(
				join(tmp, "README.md"),
				'<img src="https://img.shields.io/badge/tests-1260%20passing-x" />\n' +
					"| **1260 passing tests** | stuff |\n",
			);
			const r = checkDocsSync({
				actualTests: 1260,
				paths: { readme: join(tmp, "README.md") },
			});
			assert.equal(r.name, "docs-sync");
			assert.equal(r.pass, true);
			assert.equal(r.level, "ok");
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("checkDocsSync passes when the target minor is listed AND active", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-docs-secok-"));
		try {
			writeFileSync(join(tmp, "README.md"), "# no counts\n");
			writeFileSync(
				join(tmp, "SECURITY.md"),
				"| Version | Support |\n| 1.34.x | Active |\n| < 1.34 | Unsupported |\n",
			);
			const r = checkDocsSync({
				targetVersion: "1.34.0",
				paths: {
					readme: join(tmp, "README.md"),
					security: join(tmp, "SECURITY.md"),
				},
			});
			assert.equal(r.level, "ok");
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("checkDocsSync floor: suite ran but no parseable README count → fail", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-docs-floor-"));
		try {
			writeFileSync(
				join(tmp, "README.md"),
				"# reworded, no count regex hits\n",
			);
			const r = checkDocsSync({
				actualTests: 1260,
				paths: { readme: join(tmp, "README.md") },
			});
			assert.equal(r.level, "fail");
			assert.match(r.hint, /no parseable README test-count surface/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("checkDocsSync fails when the target minor is listed but UNSUPPORTED", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-docs-sec-"));
		try {
			writeFileSync(join(tmp, "README.md"), "# no counts\n");
			writeFileSync(
				join(tmp, "SECURITY.md"),
				"| Version | Support |\n| 1.34.x | Unsupported |\n| < 1.34 | EOL |\n",
			);
			const r = checkDocsSync({
				targetVersion: "1.34.0",
				paths: {
					readme: join(tmp, "README.md"),
					security: join(tmp, "SECURITY.md"),
				},
			});
			assert.equal(r.level, "fail");
			assert.match(r.hint, /actively supported/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("checkDocsSync fails when SECURITY.md misses the target minor", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-docs-sync2-"));
		try {
			writeFileSync(join(tmp, "README.md"), "# plain readme, no counts\n");
			writeFileSync(join(tmp, "SECURITY.md"), "| 1.33.x | Active |\n");
			const r = checkDocsSync({
				targetVersion: "1.99.0",
				paths: {
					readme: join(tmp, "README.md"),
					security: join(tmp, "SECURITY.md"),
				},
			});
			assert.equal(r.level, "fail");
			assert.match(r.hint, /1\.99\.x/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("checkDocsSync fails on harness-table subagent drift", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-docs-sync3-"));
		try {
			writeFileSync(
				join(tmp, "README.md"),
				"| Claude Code | `CLAUDE.md` | 84 | `.mcp.json` | 27 | 14 | 62 |\n",
			);
			mkdirSync(join(tmp, "agents"));
			for (let i = 0; i < 3; i++)
				writeFileSync(join(tmp, "agents", `a${i}.md`), "x");
			const r = checkDocsSync({
				paths: {
					readme: join(tmp, "README.md"),
					agentsDir: join(tmp, "agents"),
				},
			});
			assert.equal(r.level, "fail");
			assert.match(r.hint, /27 subagents, disk has 3/);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});

	it("checkDocsSync returns null when README is absent", () => {
		const tmp = mkdtempSync(join(tmpdir(), "badi-docs-sync4-"));
		try {
			const r = checkDocsSync({ paths: { readme: join(tmp, "nope.md") } });
			assert.equal(r, null);
		} finally {
			rmSync(tmp, { recursive: true, force: true });
		}
	});
});

// Version drift guard. A bare `npm version patch` bumps package.json only; if
// that commit rides into main on an unrelated PR (it has happened twice), the
// repo ends up claiming a version that has no CHANGELOG entry, no manifest
// sync, and no npm release. `badi release check` catches it, but only when
// someone runs it — this runs on every `npm test`.
describe("version consistency across the repo", () => {
	const ROOT = resolve(resolve(fileURLToPath(import.meta.url), ".."), "..");
	const readJson = (p) => JSON.parse(readFileSync(resolve(ROOT, p), "utf-8"));
	const version = readJson("package.json").version;

	it("package.json matches the newest CHANGELOG entry", () => {
		const changelog = readFileSync(resolve(ROOT, "CHANGELOG.md"), "utf-8");
		const newest = changelog.match(/## \[(\d+\.\d+\.\d+)\]/)?.[1];
		assert.equal(
			version,
			newest,
			`package.json is ${version} but the newest CHANGELOG entry is ${newest} — a version was bumped without a release`,
		);
	});

	it("package.json matches the plugin and scoop manifests", () => {
		assert.equal(
			readJson(".claude-plugin/plugin.json").version,
			version,
			"plugin.json drifted — run `badi release sync-manifest`",
		);
		assert.equal(
			readJson("dist/scoop/badi.json").version,
			version,
			"dist/scoop/badi.json drifted from package.json",
		);
	});
});
