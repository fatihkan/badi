import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
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

function runNpmTest() {
	const r = spawnSync("npm", ["test", "--silent"], {
		encoding: "utf-8",
		timeout: 120_000,
	});
	const out = `${r.stdout || ""}${r.stderr || ""}`;
	// B3 fix: anchor regex to TAP `# pass N` / `# fail N` lines.
	const passMatch = out.match(/^#\s*pass\s+(\d+)$/im);
	const failMatch = out.match(/^#\s*fail\s+(\d+)$/im);
	return {
		exitCode: r.status,
		out,
		passed: passMatch ? Number(passMatch[1]) : null,
		failed: failMatch ? Number(failMatch[1]) : 0,
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

// Public CHECK registry — plugins can extend it with push().
// Run in order; checks that return null are skipped.
export const CHECKS = [
	checkGitClean,
	checkBranch,
	checkPackageJson,
	checkChangelogEn,
	checkChangelogTr,
	checkMarketplaceManifest,
	checkLint,
	checkNpmTest,
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
