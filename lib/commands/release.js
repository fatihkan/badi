import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { chalk, showBanner } from "../cli.js";
import {
	buildMarketplaceManifest,
	buildPluginManifest,
	isManifestStale,
	writeManifests,
} from "../data/marketplace-manifest.js";
import { hasCommand, shCapture as sh } from "../helpers.js";

// Release pre-flight verifier.
//
// `badi release check` runs and reports to the screen — it doesn't write
// files, commit, or bump. For checking the pre-publish state standalone.
//
// v1.30 review C2 fix: refactored from a monolithic procedural structure to a
// CHECKS array. Each check is defined separately as a pure function and is
// testable. The CHECKS array is public; plugins may add checks in the future.

// ─── Helpers ───

function gitClean() {
	try {
		return sh("git", ["status", "--porcelain"]) === "";
	} catch {
		return false;
	}
}

function currentBranch() {
	try {
		return sh("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
	} catch {
		return null;
	}
}

function bumpVersion(version, type) {
	const [major, minor, patch] = version.split(".").map(Number);
	if (type === "major") return `${major + 1}.0.0`;
	if (type === "minor") return `${major}.${minor + 1}.0`;
	return `${major}.${minor}.${patch + 1}`;
}

function readPackageJson() {
	if (!existsSync("package.json")) return null;
	try {
		return JSON.parse(readFileSync("package.json", "utf-8"));
	} catch {
		return null;
	}
}

function changelogHasVersion(file, version) {
	if (!existsSync(file)) return null;
	const body = readFileSync(file, "utf-8");
	return body.includes(`[${version}]`);
}

// Parse pass/fail counts from `node --test` summary output. The runner
// (scripts/run-tests.mjs) emits the SPEC reporter ("ℹ pass N" / "ℹ fail N");
// older/TAP setups emit "# pass N". Match either so the count survives a
// reporter change — checkDocsSync's reality check depends on `passed` being a
// real number, so a format mismatch silently disables it (review #278).
// Exported + pure for direct testing (the previous TAP-only regex had zero
// coverage and never matched the live spec output).
export function parseTestSummary(out) {
	const text = out || "";
	// Anchor on a summary line that is "<glyphs/spaces> pass <N>" with nothing
	// alphabetic before "pass" — matches "# pass N" (TAP), "ℹ pass N" (spec,
	// incl. a ℹ️ variation selector), and tolerates any reporter prefix without
	// hard-coding the glyph. The no-letters-before-pass rule rejects lines like
	// "ℹ tests N" and per-test "✔ … pass …" descriptions.
	const passMatch = text.match(/^[^A-Za-z\n]*pass\s+(\d+)\s*$/im);
	const failMatch = text.match(/^[^A-Za-z\n]*fail\s+(\d+)\s*$/im);
	return {
		passed: passMatch ? Number(passMatch[1]) : null,
		failed: failMatch ? Number(failMatch[1]) : null,
	};
}

function runNpmTest() {
	const r = spawnSync("npm", ["test", "--silent"], {
		encoding: "utf-8",
		timeout: 120_000,
	});
	const out = `${r.stdout || ""}${r.stderr || ""}`;
	const { passed, failed } = parseTestSummary(out);
	return {
		exitCode: r.status,
		out,
		passed,
		// A null fail count means the summary was unparseable; fall back to the
		// exit code (don't silently treat "couldn't tell" as zero failures).
		failed: failed == null ? (r.status === 0 ? 0 : null) : failed,
	};
}

function runLint() {
	const r = spawnSync("npm", ["run", "lint", "--silent"], {
		encoding: "utf-8",
		timeout: 60_000,
	});
	const out = `${r.stdout || ""}${r.stderr || ""}`;
	// Capture biome's "Found N errors" line (for info/hint).
	const errMatch = out.match(/Found\s+(\d+)\s+error/i);
	return {
		exitCode: r.status,
		out,
		errors: errMatch ? Number(errMatch[1]) : null,
	};
}

function npmPackDryRun() {
	const r = spawnSync("npm", ["pack", "--dry-run", "--json"], {
		encoding: "utf-8",
		timeout: 30_000,
	});
	if (r.status !== 0) return { ok: false, size: null };
	try {
		const arr = JSON.parse(r.stdout);
		const pkg = arr?.[0];
		return {
			ok: true,
			size: pkg?.size || null,
			unpackedSize: pkg?.unpackedSize || null,
		};
	} catch {
		return { ok: false, size: null };
	}
}

// ─── Pure CHECK functions ───
//
// Each check takes ctx ({ pkg, targetVersion, skipTest }) and returns
// {pass, level, label, hint, info?}. level ∈ {"ok","warn","fail"}.

function checkGitClean() {
	const clean = gitClean();
	return {
		name: "git-clean",
		label: "Git status clean",
		pass: clean,
		level: clean ? "ok" : "fail",
		hint: clean ? null : "git status -s",
	};
}

function checkBranch() {
	const branch = currentBranch();
	const onMain = branch === "main" || branch === "master";
	return {
		name: "branch",
		label: onMain
			? `Branch main/master (${branch})`
			: `Not on branch main/master (${branch ?? "?"})`,
		pass: onMain,
		level: onMain ? "ok" : "warn",
		hint: null,
	};
}

function checkPackageJson(ctx) {
	if (!ctx.pkg) {
		return {
			name: "package-json",
			label: "package.json readable",
			pass: false,
			level: "fail",
			hint: null,
		};
	}
	return {
		name: "package-json",
		label: `package.json present (${ctx.pkg.name} v${ctx.pkg.version})`,
		pass: true,
		level: "ok",
	};
}

function checkChangelogEn(ctx) {
	const r = changelogHasVersion("CHANGELOG.md", ctx.targetVersion);
	if (r === null) {
		return {
			name: "changelog-en",
			label: "CHANGELOG.md present",
			pass: false,
			level: "fail",
			hint: "file missing",
		};
	}
	return {
		name: "changelog-en",
		label: `[${ctx.targetVersion}] in CHANGELOG.md`,
		pass: r,
		level: r ? "ok" : "fail",
		hint: r ? null : "new-version entry missing",
	};
}

function checkChangelogTr(ctx) {
	if (!existsSync("CHANGELOG.tr.md")) {
		return null; // skip
	}
	const r = changelogHasVersion("CHANGELOG.tr.md", ctx.targetVersion);
	return {
		name: "changelog-tr",
		label: `[${ctx.targetVersion}] in CHANGELOG.tr.md`,
		pass: r,
		level: r ? "ok" : "warn",
		hint: r ? null : "update the TR translation too",
	};
}

function checkNpmTest(ctx) {
	if (ctx.skipTest) {
		return {
			name: "test",
			label: "Test skipped (--skip-test)",
			pass: true,
			level: "warn",
			hint: null,
		};
	}
	const t = runNpmTest();
	const ok = t.exitCode === 0 && t.failed === 0;
	// Feed the real pass count forward so a later checkDocsSync can compare the
	// README's advertised count against reality (not just internal agreement).
	if (ok && typeof t.passed === "number") ctx.actualTests = t.passed;
	return {
		name: "test",
		label: "Test (npm test)",
		pass: ok,
		level: ok ? "ok" : "fail",
		info: ok
			? t.passed != null
				? `${t.passed} tests passed`
				: null
			: `exit ${t.exitCode}${t.failed ? `, ${t.failed} fail` : ""}`,
	};
}

function checkLint(ctx) {
	if (ctx.skipLint) {
		return {
			name: "lint",
			label: "Lint skipped (--skip-lint)",
			pass: true,
			level: "warn",
			hint: null,
		};
	}
	const r = runLint();
	const ok = r.exitCode === 0;
	return {
		name: "lint",
		label: "Lint (biome check)",
		pass: ok,
		level: ok ? "ok" : "fail",
		info: ok ? "clean" : null,
		hint: ok
			? null
			: `${r.errors != null ? `${r.errors} errors` : "lint error"} — npm run lint:fix`,
	};
}

function checkGhCli() {
	const ok = hasCommand("gh");
	return {
		name: "gh-cli",
		label: ok ? "gh CLI installed" : "gh CLI not installed",
		pass: ok,
		level: ok ? "ok" : "warn",
		hint: ok ? null : "brew install gh",
	};
}

function checkMarketplaceManifest() {
	const pluginDir = ".claude-plugin";
	if (!existsSync(pluginDir)) {
		return null; // optional — skip silently if marketplace setup disabled
	}
	const pkg = readPackageJson();
	if (!pkg) return null;
	const plugin = buildPluginManifest({ pkg, claudeDir: ".claude" });
	const status = isManifestStale({ pluginDir, generated: plugin });
	if (status.missing) {
		return {
			name: "marketplace-manifest",
			label: ".claude-plugin/plugin.json present",
			pass: false,
			level: "fail",
			hint: "generate with badi release sync-manifest",
		};
	}
	if (status.stale) {
		return {
			name: "marketplace-manifest",
			label: ".claude-plugin/plugin.json up to date",
			pass: false,
			level: "warn",
			hint: `${status.reason || "stale"} — badi release sync-manifest`,
		};
	}
	return {
		name: "marketplace-manifest",
		label: ".claude-plugin/plugin.json up to date",
		pass: true,
		level: "ok",
	};
}

// The scoop manifest carries BOTH a `version` and a concrete download `url`
// (hash is filled at scoop-bucket publish time). A version bump that misses the
// url leaves the file internally inconsistent — a manual install from the
// checked-in url would pull the wrong tarball. release.js/publish.js never
// rewrite this static url, so without this gate the drift is silent (it bit
// v1.34.2: version 1.34.2 shipped with a badi-1.34.1.tgz url).
export function checkScoopManifest(ctx = {}) {
	const scoopPath = ctx.paths?.scoop ?? "dist/scoop/badi.json";
	if (!existsSync(scoopPath)) return null; // optional distribution channel
	const version = ctx.targetVersion || readPackageJson()?.version;
	if (!version) return null;
	let scoop;
	try {
		scoop = JSON.parse(readFileSync(scoopPath, "utf-8"));
	} catch {
		return {
			name: "scoop-manifest",
			label: "dist/scoop/badi.json valid JSON",
			pass: false,
			level: "fail",
			hint: "dist/scoop/badi.json is not valid JSON",
		};
	}
	const problems = [];
	if (scoop.version !== version) {
		problems.push(`version ${scoop.version} != ${version}`);
	}
	if (typeof scoop.url === "string" && !scoop.url.includes(version)) {
		problems.push(`url does not reference ${version} (${scoop.url})`);
	}
	if (problems.length) {
		return {
			name: "scoop-manifest",
			label: "dist/scoop/badi.json in sync",
			pass: false,
			level: "warn",
			hint: `${problems.join("; ")} — update dist/scoop/badi.json`,
		};
	}
	return {
		name: "scoop-manifest",
		label: "dist/scoop/badi.json in sync",
		pass: true,
		level: "ok",
	};
}

function checkNpmPack() {
	const pack = npmPackDryRun();
	if (!pack.ok) {
		return {
			name: "npm-pack",
			label: "npm pack dry-run",
			pass: false,
			level: "warn",
			hint: "could not run",
		};
	}
	const sizeKb = pack.size ? (pack.size / 1024).toFixed(1) : "?";
	const tooBig = pack.size && pack.size > 5 * 1024 * 1024;
	return {
		name: "npm-pack",
		label: tooBig ? `Package size large (${sizeKb} KB)` : "npm pack dry-run",
		pass: !tooBig,
		level: tooBig ? "warn" : "ok",
		info: tooBig ? null : `${sizeKb} KB tarball`,
		hint: tooBig ? "check the package.json files array" : null,
	};
}

// v1.34.1+ docs-sync gate. Root cause of the recurring drift class (v1.32 →
// v1.34 each shipped stale README/SECURITY numbers): no release-time check
// compared the marketing surfaces against reality. Three deterministic
// assertions, no test-suite run needed:
//   1. Every README test-count mention agrees (badge / feature table / dev
//      section) — internal consistency.
//   2. README harness-table subagent count == .claude/agents/*.md on disk.
//   3. SECURITY.md "Supported Versions" covers the target major.minor.
// ctx.paths is an optional override map for tests.
export function checkDocsSync(ctx = {}) {
	const paths = {
		readme: "README.md",
		security: "SECURITY.md",
		agentsDir: ".claude/agents",
		...ctx.paths,
	};
	const problems = [];

	let readme = "";
	try {
		readme = readFileSync(paths.readme, "utf-8");
	} catch {
		return null; // no README — nothing to gate (library consumers)
	}

	// 1) test-count surfaces — must agree with EACH OTHER and, when the suite
	//    actually ran (ctx.actualTests, fed by checkNpmTest), with REALITY.
	//    Internal consistency alone is insufficient: a synchronized-but-stale
	//    bump (the exact v1.32→v1.34 drift class this gate exists to stop)
	//    would otherwise pass — and did, until this was added (review #277).
	const surfaces = [
		{ where: "badge", re: /tests-(\d+)%20passing/ },
		{ where: "feature table", re: /\*\*(\d+) passing tests\*\*/ },
		{ where: "dev section", re: /#\s*(\d+) tests across \d+ suites/ },
	];
	const counts = [];
	for (const s of surfaces) {
		const m = readme.match(s.re);
		if (m) counts.push({ where: s.where, n: Number(m[1]) });
	}
	const distinct = [...new Set(counts.map((c) => c.n))];
	if (distinct.length > 1) {
		problems.push(
			`README test counts disagree: ${counts.map((c) => `${c.where}=${c.n}`).join(", ")}`,
		);
	}
	if (typeof ctx.actualTests === "number") {
		// Floor: the suite ran but no surface parsed → the regexes drifted off
		// the prose (a README reword would otherwise pass while verifying nothing).
		if (counts.length === 0) {
			problems.push(
				"no parseable README test-count surface to verify against the suite",
			);
		}
		const stale = counts.filter((c) => c.n !== ctx.actualTests);
		if (stale.length > 0) {
			problems.push(
				`README test count stale vs suite (${ctx.actualTests}): ${stale
					.map((c) => `${c.where}=${c.n}`)
					.join(", ")}`,
			);
		}
	}

	// 2) harness-table subagent count vs disk
	try {
		const agents = readdirSync(paths.agentsDir).filter((f) =>
			f.endsWith(".md"),
		).length;
		const row = readme.match(
			/\|\s*Claude Code\s*\|[^|]*\|\s*\d+\s*\|[^|]*\|\s*(\d+)\s*\|/,
		);
		if (row && Number(row[1]) !== agents) {
			problems.push(
				`README harness table says ${row[1]} subagents, disk has ${agents}`,
			);
		}
	} catch {
		// agents dir absent — skip silently
	}

	// 3) SECURITY.md supported-version row — the target's minor must appear in a
	//    row AND that row must be marked active/supported. A bare substring test
	//    would false-pass a version explicitly listed as Unsupported/EOL, and
	//    would prefix-collide (e.g. "11.34.x" contains "1.34.x").
	if (ctx.targetVersion && existsSync(paths.security)) {
		const [major, minor] = ctx.targetVersion.split(".");
		const want = `${major}.${minor}.x`;
		const sec = readFileSync(paths.security, "utf-8");
		const isActive = (cell) =>
			/^(?:active|supported|yes)\b/i.test(cell) || cell.includes("✅");
		const supportedRow = sec.split("\n").some((line) => {
			const cells = line.split("|").map((c) => c.trim());
			// The status must be in the cell ADJACENT to the version cell, not
			// "any cell on the line" — otherwise a note/comment cell on an
			// Unsupported row could read as supported.
			const vi = cells.indexOf(want);
			return vi !== -1 && isActive(cells[vi + 1] || "");
		});
		if (!supportedRow) {
			problems.push(
				`SECURITY.md does not list ${want} as an actively supported version`,
			);
		}
	}

	if (problems.length > 0) {
		return {
			name: "docs-sync",
			label: "Docs in sync (README/SECURITY counts)",
			pass: false,
			level: "fail",
			hint: problems.join(" · "),
		};
	}
	return {
		name: "docs-sync",
		label: "Docs in sync (README/SECURITY counts)",
		pass: true,
		level: "ok",
	};
}

// Public CHECK registry — plugins can extend it with push().
// Run in order; checks that return null are skipped.
export const CHECKS = [
	checkGitClean,
	checkBranch,
	checkPackageJson,
	checkChangelogEn,
	checkChangelogTr,
	checkMarketplaceManifest,
	checkScoopManifest,
	checkLint,
	checkNpmTest,
	// docs-sync runs AFTER test so checkNpmTest can populate ctx.actualTests,
	// letting the README count be verified against the real suite size.
	checkDocsSync,
	checkGhCli,
	checkNpmPack,
];

/**
 * Pure runner — no UI, returns only the result array. Testable.
 * Returns: [{name, label, pass, level, hint, info}, ...]
 */
export function runChecks(ctx) {
	const out = [];
	for (const check of CHECKS) {
		const r = check(ctx);
		if (r == null) continue;
		out.push(r);
	}
	return out;
}

// ─── UI Renderer ───

function renderResult(r) {
	if (r.level === "ok") {
		const tail = r.info ? chalk.dim(`  (${r.info})`) : "";
		console.log(`  ${chalk.green("OK")}  ${r.label}${tail}`);
	} else if (r.level === "warn") {
		const tail = r.hint ? chalk.dim(`  (${r.hint})`) : "";
		console.log(`  ${chalk.yellow("!!")}  ${r.label}${tail}`);
	} else {
		const tail = r.hint || r.info ? chalk.dim(`  (${r.hint || r.info})`) : "";
		console.log(`  ${chalk.red("XX")}  ${r.label}${tail}`);
	}
}

function printSummary(pass, warnings, fail, strict, targetVersion) {
	console.log("");
	console.log(
		`${chalk.bold("Result:")} ${chalk.green(`${pass} OK`)} / ${chalk.yellow(`${warnings} WARN`)} / ${chalk.red(`${fail} FAIL`)}`,
	);
	if (targetVersion) {
		console.log(chalk.dim(`  Target version: ${targetVersion}`));
	}
	console.log("");

	if (fail > 0) {
		console.log(chalk.red("Not ready to publish. Fix the errors."));
		process.exit(1);
	}
	if (strict && warnings > 0) {
		console.log(
			chalk.yellow(
				"--strict mode: warnings count as errors. Publish cancelled.",
			),
		);
		process.exit(1);
	}
	if (warnings > 0) {
		console.log(
			chalk.dim(
				"Ready to publish (with warnings). Can be blocked in CI with --strict.",
			),
		);
	} else {
		console.log(chalk.green("Ready to publish."));
	}
}

export function runReleaseCheck(args = []) {
	let strict = false;
	let versionFlag = null;
	let skipTest = false;
	let skipLint = false;
	let nextVersionType = null;

	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === "--strict") strict = true;
		else if (a === "--skip-test") skipTest = true;
		else if (a === "--skip-lint") skipLint = true;
		else if (a === "--version") {
			versionFlag = args[++i] ?? null;
		} else if (a === "--bump") {
			nextVersionType = args[++i] ?? null;
		} else if (a === "--help" || a === "-h") {
			printHelp();
			return;
		}
	}

	showBanner();
	console.log(chalk.bold("Release Check"));
	console.log("");

	const pkg = readPackageJson();
	let targetVersion = versionFlag;
	if (!targetVersion && nextVersionType && pkg?.version) {
		targetVersion = bumpVersion(pkg.version, nextVersionType);
	}
	if (!targetVersion && pkg?.version) targetVersion = pkg.version;

	const ctx = { pkg, targetVersion, skipTest, skipLint };
	const results = runChecks(ctx);

	// Note: some checks take a while (npm test). Start inline without a
	// "running" message; render with renderResult once the result arrives.
	let pass = 0;
	let warnings = 0;
	let fail = 0;
	for (const r of results) {
		renderResult(r);
		if (r.level === "ok") pass++;
		else if (r.level === "warn") warnings++;
		else fail++;
	}

	printSummary(pass, warnings, fail, strict, targetVersion);
}

function printHelp() {
	console.log(chalk.bold("Release Commands:"));
	console.log("");
	console.log(
		`  badi release check                ${chalk.dim("Pre-publish pre-flight checks")}`,
	);
	console.log(
		`  badi release sync-manifest        ${chalk.dim("Generate .claude-plugin/{plugin,marketplace}.json (v1.30.1+)")}`,
	);
	console.log("");
	console.log(chalk.bold("'check' Options:"));
	console.log(
		`  --version <X.Y.Z>                 Target version (for the CHANGELOG check)`,
	);
	console.log(
		`  --bump <patch|minor|major>        Auto-compute the bump from package.json`,
	);
	console.log(
		`  --strict                          Count warnings as errors (use in CI)`,
	);
	console.log(
		`  --skip-test                       Skip the test stage (fast check)`,
	);
	console.log(
		`  --skip-lint                       Skip the lint (biome) stage`,
	);
	console.log("");
	console.log(chalk.bold("'sync-manifest' Options:"));
	console.log(
		`  --dry-run                         Don't write; just show what would be generated`,
	);
	console.log("");
	console.log(chalk.bold("Examples:"));
	console.log(`  badi release check`);
	console.log(`  badi release check --bump minor`);
	console.log(`  badi release check --version 1.30.0 --strict`);
	console.log(`  badi release sync-manifest`);
	console.log(`  badi release sync-manifest --dry-run`);
}

/**
 * `badi release sync-manifest` — regenerates the
 * `.claude-plugin/{plugin,marketplace}.json` files. Use `--dry-run` to show
 * the diff.
 */
export function runSyncManifest(args = []) {
	const dryRun = args.includes("--dry-run");
	const pluginDir = ".claude-plugin";
	if (!existsSync(pluginDir)) {
		console.error(
			chalk.red(`Error: ${pluginDir}/ directory missing. Create it first.`),
		);
		process.exit(1);
	}
	const pkg = readPackageJson();
	if (!pkg) {
		console.error(chalk.red("Error: could not read package.json."));
		process.exit(1);
	}
	const plugin = buildPluginManifest({ pkg, claudeDir: ".claude" });
	const marketplace = buildMarketplaceManifest({
		pkg,
		claudeDir: ".claude",
	});

	const result = writeManifests({
		pluginDir,
		plugin,
		marketplace,
		dryRun,
	});

	if (dryRun) {
		console.log(chalk.yellow("DRY RUN — files not written"));
	}
	console.log(chalk.bold("Manifest sync:"));
	for (const p of result.synced) {
		console.log(
			`  ${dryRun ? chalk.yellow("would write") : chalk.green("ok")}  ${p}`,
		);
	}
	console.log("");
	console.log(chalk.dim(`Plugin agents: ${plugin.agents.length}`));
	console.log(chalk.dim(`Plugin version: ${plugin.version}`));
}

export async function runRelease(args = []) {
	const sub = args[0];
	if (!sub || sub === "--help" || sub === "-h") {
		printHelp();
		return;
	}
	if (sub === "check") {
		return runReleaseCheck(args.slice(1));
	}
	if (sub === "sync-manifest") {
		return runSyncManifest(args.slice(1));
	}
	console.error(chalk.red(`Unknown release command: ${sub}`));
	printHelp();
	process.exit(1);
}

// Exports for unit testing
export {
	bumpVersion,
	changelogHasVersion,
	checkBranch,
	checkChangelogEn,
	checkChangelogTr,
	checkGhCli,
	checkGitClean,
	checkLint,
	checkNpmPack,
	checkNpmTest,
	checkPackageJson,
};
