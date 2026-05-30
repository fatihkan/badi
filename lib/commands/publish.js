import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chalk, showBanner } from "../cli.js";
import {
	buildMarketplaceManifest,
	buildPluginManifest,
	writeManifests,
} from "../data/marketplace-manifest.js";
import {
	bundleSkills,
	generateRouterSkill,
} from "../harnesses/skills-bundler.js";
import { hasCommand, shCapture as sh } from "../helpers.js";

// ─── Helpers ───

function bumpVersion(version, type) {
	const [major, minor, patch] = version.split(".").map(Number);
	if (type === "major") return `${major + 1}.0.0`;
	if (type === "minor") return `${major}.${minor + 1}.0`;
	return `${major}.${minor}.${patch + 1}`;
}

function gitClean() {
	try {
		const out = sh("git", ["status", "--porcelain"]);
		return out === "";
	} catch {
		return false;
	}
}

function currentBranch() {
	return sh("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
}

function parseFlags(args) {
	const flags = {
		version: "patch",
		dryRun: false,
		skipNpm: false,
		skipGithub: false,
		skipChangelog: false,
		skipManifestSync: false,
		message: null,
	};
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === "--version") flags.version = args[++i] || "patch";
		else if (a === "--dry-run") flags.dryRun = true;
		else if (a === "--skip-npm") flags.skipNpm = true;
		else if (a === "--skip-github") flags.skipGithub = true;
		else if (a === "--skip-changelog") flags.skipChangelog = true;
		else if (a === "--skip-manifest-sync") flags.skipManifestSync = true;
		else if (a === "--message" || a === "-m") flags.message = args[++i];
		else if (a === "--skill-bundle") flags.skillBundle = true;
		else if (a === "--target") flags.target = args[++i];
		else if (a === "--source") flags.source = args[++i];
		else if (a === "--strict") flags.strict = true;
	}
	if (!["patch", "minor", "major"].includes(flags.version)) {
		throw new Error(`--version invalid: ${flags.version} (patch|minor|major)`);
	}
	return flags;
}

// ─── Skill-bundle flow (issue #56) ───

export async function runSkillBundle(flags) {
	// v1.17+ opt-in: all skills now live in the vault. Fall back to the legacy path.
	const cwd = process.cwd();
	const vaultPath = join(cwd, ".claude", "skills-vault");
	const legacyPath = join(cwd, ".claude", "skills");
	const source =
		flags.source || (existsSync(vaultPath) ? vaultPath : legacyPath);
	const target = flags.target || join(process.cwd(), "badi-skills");
	const dryRun = flags.dryRun || false;
	const strict = flags.strict || false;

	showBanner();
	console.log(
		chalk.bold(
			`Badi Skill Bundle ${dryRun ? chalk.yellow("[DRY RUN]") : ""}${strict ? chalk.cyan(" [STRICT]") : ""}`,
		),
	);
	console.log("");
	console.log(`  Source: ${chalk.cyan(source)}`);
	console.log(`  Target: ${chalk.cyan(target)}`);
	console.log("");

	if (!existsSync(source)) {
		throw new Error(`Source dir does not exist: ${source}`);
	}

	const result = await bundleSkills({ source, target, dryRun, strict });

	console.log(chalk.bold("Result:"));
	console.log(`  ${chalk.green(`+ ${result.bundled.length} skills bundled`)}`);
	if (result.skipped.length > 0) {
		console.log(
			`  ${chalk.yellow(`! ${result.skipped.length} skills skipped`)}`,
		);
	}

	let totalEnriched = 0;
	let totalWarnings = 0;
	for (const b of result.bundled) {
		totalEnriched += b.enriched.length;
		totalWarnings += b.warnings.length;
	}
	if (totalEnriched > 0) {
		console.log(
			chalk.dim(
				`  ${totalEnriched} fields auto-filled (license, compatibility, allowed-tools, metadata.*)`,
			),
		);
	}
	if (totalWarnings > 0) {
		console.log(
			chalk.dim(`  ${totalWarnings} schema warnings (description<50ch, etc.)`),
		);
	}

	if (result.skipped.length > 0) {
		console.log("");
		console.log(chalk.bold("Skipped skills:"));
		for (const s of result.skipped) {
			console.log(`  ${chalk.yellow("-")} ${s.name}: ${s.reason}`);
			if (s.errors) {
				for (const e of s.errors) {
					console.log(chalk.dim(`      ${e}`));
				}
			}
		}
	}

	// Generate router skill
	if (!dryRun && result.bundled.length > 0) {
		const routerContent = generateRouterSkill(result.bundled);
		const routerDir = join(target, "skills", "badi");
		const { mkdirSync } = await import("node:fs");
		mkdirSync(routerDir, { recursive: true });
		writeFileSync(join(routerDir, "SKILL.md"), routerContent);
		console.log("");
		console.log(
			chalk.green(`+ Router skill written: ${join(routerDir, "SKILL.md")}`),
		);
	}

	console.log("");
	console.log(chalk.bold("Next steps:"));
	if (dryRun) {
		console.log("  --dry-run mode — no disk changes");
		console.log("  For a real bundle: badi publish --skill-bundle");
	} else {
		console.log(
			`  1. ${chalk.cyan(`cd ${target}`)} — inspect the bundle output`,
		);
		console.log("  2. if in the badi-skills repo: git diff, commit, tag, push");
		console.log(
			"  3. npm publish (if released as a separate package) or GitHub release",
		);
	}
	return result;
}

// ─── Main orchestrator ───

export async function runPublish(args) {
	const sub = args[0];

	if (!sub || sub === "--help" || sub === "-h") {
		showBanner();
		console.log(chalk.bold("Badi Publish — Release Orchestrator"));
		console.log("");
		console.log(chalk.bold("Usage:"));
		console.log(
			`  ${chalk.cyan("badi publish")} [options]          Run the full flow`,
		);
		console.log(
			`  ${chalk.cyan("badi publish check")}             Pre-release check (is git clean?)`,
		);
		console.log("");
		console.log(chalk.bold("Options:"));
		console.log("  --version <type>     patch|minor|major (default: patch)");
		console.log("  --dry-run            Apply nothing, show the steps");
		console.log("  --skip-npm           Skip npm publish");
		console.log("  --skip-github        Skip gh release create");
		console.log("  --skip-changelog     Skip the CHANGELOG check");
		console.log(
			"  --skip-manifest-sync Skip .claude-plugin/*.json sync (v1.32+)",
		);
		console.log("  -m, --message <str>  Extra note in the commit message");
		console.log("");
		console.log(chalk.bold("Skill Bundle (issue #56, v1.14+):"));
		console.log(
			`  ${chalk.cyan("badi publish --skill-bundle")} [--source <path>] [--target <path>] [--strict] [--dry-run]`,
		);
		console.log("    Bundles .claude/skills/ -> <target>/skills/.");
		console.log("    Auto-fills missing frontmatter fields.");
		console.log("    Generates a router skill (skills/badi/SKILL.md).");
		console.log(
			"    --source overrides the source skill directory (default: .claude/skills)",
		);
		console.log("");
		console.log(chalk.bold("Steps (in order):"));
		console.log("  1. Is git clean? (stops if not clean)");
		console.log("  2. Is branch main? (warns if not)");
		console.log("  3. Is there a new-version entry in CHANGELOG?");
		console.log("  4. package.json version bump");
		console.log(
			"  5. .claude-plugin/{plugin,marketplace}.json sync (v1.32+, skippable)",
		);
		console.log("  6. git commit (chore: release vX.Y.Z) — manifest included");
		console.log("  7. git tag vX.Y.Z");
		console.log("  8. git push main + tag");
		console.log("  9. gh release create (if available)");
		console.log("  10. npm publish --access public");
		console.log("");
		console.log(chalk.bold("Examples:"));
		console.log("  badi publish --dry-run");
		console.log("  badi publish --version minor");
		console.log("  badi publish --version patch --skip-github");
		console.log("  badi publish --skill-bundle --dry-run");
		console.log("  badi publish --skill-bundle --target ../badi-skills");
		console.log("  badi publish check");
		return;
	}

	if (sub === "check") {
		return publishCheck();
	}

	const flags = parseFlags(args);

	if (flags.skillBundle) {
		return runSkillBundle(flags);
	}

	showBanner();
	console.log(
		chalk.bold(`Badi Publish ${flags.dryRun ? chalk.yellow("[DRY RUN]") : ""}`),
	);
	console.log("");

	// 0. Pre-checks
	if (!existsSync("package.json")) {
		throw new Error("package.json not found — run from the project root");
	}
	const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
	const oldVersion = pkg.version;
	const newVersion = bumpVersion(oldVersion, flags.version);

	console.log(chalk.bold("Pre-flight:"));
	console.log(`  Package:  ${chalk.cyan(pkg.name)}`);
	console.log(
		`  Version:  ${chalk.cyan(oldVersion)} → ${chalk.bold.green(newVersion)}`,
	);
	console.log(`  Type:     ${chalk.cyan(flags.version)}`);
	console.log("");

	// Step counter — keep numbers contiguous when skips are applied
	let step = 0;
	const heading = (label) => {
		step++;
		console.log(chalk.bold(`${step}. ${label}`));
	};

	// Git clean
	heading("Git Status:");
	if (!gitClean()) {
		console.log(`  ${chalk.red("XX")} Working directory is not clean`);
		console.log(chalk.dim("  Commit or stash first."));
		throw new Error("Git not clean");
	}
	console.log(`  ${chalk.green("OK")} Working directory clean`);

	// Branch check (continuation of same step, no number)
	const branch = currentBranch();
	console.log(
		`  ${branch === "main" || branch === "master" ? chalk.green("OK") : chalk.yellow("!!")} Branch: ${chalk.cyan(branch)}`,
	);
	if (branch !== "main" && branch !== "master") {
		console.log(
			chalk.yellow("  Warning: you're on a branch other than main/master."),
		);
	}
	console.log("");

	// CHANGELOG check
	if (!flags.skipChangelog) {
		heading("CHANGELOG Check:");
		const cl = existsSync("CHANGELOG.md")
			? readFileSync("CHANGELOG.md", "utf-8")
			: "";
		const clTr = existsSync("CHANGELOG.tr.md")
			? readFileSync("CHANGELOG.tr.md", "utf-8")
			: "";
		const versionMarker = `[${newVersion}]`;
		const hasEn = cl.includes(versionMarker);
		const hasTr = clTr.includes(versionMarker);
		console.log(
			`  ${hasEn ? chalk.green("OK") : chalk.red("XX")} ${versionMarker} ${hasEn ? "present" : "missing"} in CHANGELOG.md`,
		);
		if (existsSync("CHANGELOG.tr.md")) {
			console.log(
				`  ${hasTr ? chalk.green("OK") : chalk.yellow("!!")} ${versionMarker} ${hasTr ? "present" : "missing"} in CHANGELOG.tr.md`,
			);
		}
		if (!hasEn) {
			console.log(
				chalk.dim(
					"  Add a new-version entry to CHANGELOG.md first. Can be skipped with --skip-changelog.",
				),
			);
			throw new Error("CHANGELOG missing");
		}
		console.log("");
	}

	// package.json version bump
	heading("Version Bump:");
	if (flags.dryRun) {
		console.log(
			chalk.dim(`  [dry] package.json: ${oldVersion} -> ${newVersion}`),
		);
	} else {
		pkg.version = newVersion;
		writeFileSync("package.json", `${JSON.stringify(pkg, null, 2)}\n`, "utf-8");
		// also package-lock.json if present
		if (existsSync("package-lock.json")) {
			try {
				const lock = JSON.parse(readFileSync("package-lock.json", "utf-8"));
				lock.version = newVersion;
				if (lock.packages?.[""]) lock.packages[""].version = newVersion;
				writeFileSync(
					"package-lock.json",
					`${JSON.stringify(lock, null, 2)}\n`,
					"utf-8",
				);
				console.log(`  ${chalk.green("OK")} package-lock.json also updated`);
			} catch {
				console.log(
					`  ${chalk.yellow("!!")} package-lock.json could not be parsed`,
				);
			}
		}
		console.log(
			`  ${chalk.green("OK")} package.json: ${oldVersion} -> ${newVersion}`,
		);
	}
	console.log("");

	// Plugin manifest sync (issue #196)
	// lastUpdated is informational only (marketplace "last updated" display) and
	// is excluded by isManifestStale; so the publish-time toISOString value is
	// sufficient — it need not match the commit date (PR #197 review K1).
	const pluginDirExists = existsSync(".claude-plugin");
	let manifestSynced = false;
	if (!flags.skipManifestSync && pluginDirExists) {
		heading("Plugin Manifest Sync:");
		const lastUpdated = new Date().toISOString();
		const syncedPkg = flags.dryRun ? { ...pkg, version: newVersion } : pkg;
		const plugin = buildPluginManifest({
			pkg: syncedPkg,
			claudeDir: ".claude",
			lastUpdated,
		});
		const marketplace = buildMarketplaceManifest({
			pkg: syncedPkg,
			claudeDir: ".claude",
			lastUpdated,
		});
		if (flags.dryRun) {
			console.log(
				chalk.dim(
					`  [dry] .claude-plugin/plugin.json -> v${newVersion} (lastUpdated: ${lastUpdated})`,
				),
			);
			console.log(
				chalk.dim(`  [dry] .claude-plugin/marketplace.json -> v${newVersion}`),
			);
		} else {
			try {
				const result = writeManifests({
					pluginDir: ".claude-plugin",
					plugin,
					marketplace,
					dryRun: false,
				});
				for (const p of result.synced) {
					console.log(`  ${chalk.green("OK")} ${p}`);
				}
				manifestSynced = true;
			} catch (e) {
				console.log(`  ${chalk.red("XX")} Manifest sync failed: ${e.message}`);
				console.log(
					chalk.dim(
						"  Can be skipped with --skip-manifest-sync; later: badi release sync-manifest",
					),
				);
				throw e;
			}
		}
		console.log("");
	} else if (flags.skipManifestSync) {
		heading("Plugin Manifest Sync:");
		console.log(`  ${chalk.yellow("!!")} --skip-manifest-sync — skipped`);
		console.log(chalk.dim("  Manually later: badi release sync-manifest"));
		console.log("");
	}

	// Commit
	heading("Commit:");
	const commitMsg = flags.message
		? `chore(release): v${newVersion} — ${flags.message}`
		: `chore(release): v${newVersion}`;
	if (flags.dryRun) {
		console.log(chalk.dim(`  [dry] git add package.json package-lock.json`));
		if (!flags.skipManifestSync && pluginDirExists) {
			console.log(
				chalk.dim(`  [dry] git add .claude-plugin/{plugin,marketplace}.json`),
			);
		}
		console.log(chalk.dim(`  [dry] git commit -m "${commitMsg}"`));
	} else {
		try {
			const files = ["package.json"];
			if (existsSync("package-lock.json")) files.push("package-lock.json");
			if (manifestSynced) {
				files.push(".claude-plugin/plugin.json");
				files.push(".claude-plugin/marketplace.json");
			}
			sh("git", ["add", ...files]);
			sh("git", ["commit", "-m", commitMsg]);
			console.log(`  ${chalk.green("OK")} Commit: ${chalk.cyan(commitMsg)}`);
		} catch (e) {
			console.log(`  ${chalk.red("XX")} Commit failed: ${e.message}`);
			throw e;
		}
	}
	console.log("");

	// Tag
	heading("Tag:");
	const tagName = `v${newVersion}`;
	if (flags.dryRun) {
		console.log(
			chalk.dim(`  [dry] git tag -a ${tagName} -m "Release ${tagName}"`),
		);
	} else {
		try {
			sh("git", ["tag", "-a", tagName, "-m", `Release ${tagName}`]);
			console.log(`  ${chalk.green("OK")} Tag: ${chalk.cyan(tagName)}`);
		} catch (e) {
			console.log(`  ${chalk.red("XX")} Tag failed: ${e.message}`);
			throw e;
		}
	}
	console.log("");

	// Push
	heading("Push:");
	if (flags.dryRun) {
		console.log(chalk.dim(`  [dry] git push origin ${branch}`));
		console.log(chalk.dim(`  [dry] git push origin ${tagName}`));
	} else {
		try {
			sh("git", ["push", "origin", branch]);
			console.log(`  ${chalk.green("OK")} Branch push: ${chalk.cyan(branch)}`);
			sh("git", ["push", "origin", tagName]);
			console.log(`  ${chalk.green("OK")} Tag push: ${chalk.cyan(tagName)}`);
		} catch (e) {
			console.log(`  ${chalk.red("XX")} Push failed: ${e.message}`);
			throw e;
		}
	}
	console.log("");

	// GitHub release
	if (!flags.skipGithub) {
		heading("GitHub Release:");
		if (!hasCommand("gh")) {
			console.log(`  ${chalk.yellow("!!")} gh CLI not found — skipping`);
			console.log(chalk.dim("  brew install gh && gh auth login"));
		} else {
			const releaseArgs = [
				"release",
				"create",
				tagName,
				"--title",
				tagName,
				"--generate-notes",
			];
			if (flags.dryRun) {
				console.log(chalk.dim(`  [dry] gh ${releaseArgs.join(" ")}`));
			} else {
				try {
					const out = sh("gh", releaseArgs);
					console.log(
						`  ${chalk.green("OK")} Release: ${chalk.cyan(out.split("\n").pop())}`,
					);
				} catch (e) {
					console.log(
						`  ${chalk.yellow("!!")} GitHub release failed (continuing): ${e.message.substring(0, 200)}`,
					);
				}
			}
		}
		console.log("");
	}

	// npm publish
	if (!flags.skipNpm) {
		heading("npm Publish:");
		if (flags.dryRun) {
			console.log(chalk.dim("  [dry] npm publish --access public"));
		} else {
			try {
				// 2FA may be required — allow interaction via stdio inherit
				const res = spawnSync("npm", ["publish", "--access", "public"], {
					stdio: "inherit",
				});
				if (res.status !== 0) {
					console.log(
						`  ${chalk.red("XX")} npm publish failed (check npm whoami)`,
					);
					console.log(chalk.dim("  Login: npm login (2FA may be required)"));
				} else {
					console.log(`  ${chalk.green("OK")} npm publish complete`);
				}
			} catch (e) {
				console.log(`  ${chalk.yellow("!!")} npm publish error: ${e.message}`);
			}
		}
		console.log("");
	}

	console.log(
		chalk.bold.green(
			`${flags.dryRun ? "[DRY RUN] " : ""}Release v${newVersion} ready!`,
		),
	);
	if (!flags.dryRun) {
		console.log("");
		console.log(chalk.bold("Next steps:"));
		console.log(`  - npm: https://www.npmjs.com/package/${pkg.name}`);
		console.log(`  - GitHub: git log --oneline -1`);
	}
}

function publishCheck() {
	showBanner();
	console.log(chalk.bold("Publish Pre-check"));
	console.log("");

	const checks = [];

	// Git clean
	const clean = gitClean();
	checks.push([clean, `Git status clean`, clean ? "" : "git status -s"]);

	// Branch
	const branch = currentBranch();
	const mainBranch = branch === "main" || branch === "master";
	checks.push([mainBranch, `Branch main/master (${branch})`, ""]);

	// package.json
	const hasPkg = existsSync("package.json");
	checks.push([hasPkg, `package.json present`, ""]);

	if (hasPkg) {
		const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
		checks.push([
			!!pkg.version,
			`package.json version defined (${pkg.version || "?"})`,
			"",
		]);
		checks.push([
			!!pkg.name,
			`package.json name defined (${pkg.name || "?"})`,
			"",
		]);
		const hasFiles = Array.isArray(pkg.files) && pkg.files.length > 0;
		checks.push([
			hasFiles,
			`package.json files array present`,
			hasFiles ? "" : "npm publish should not ship the whole directory",
		]);
	}

	// CHANGELOG
	checks.push([existsSync("CHANGELOG.md"), `CHANGELOG.md present`, ""]);

	// gh CLI
	checks.push([
		hasCommand("gh"),
		`gh CLI installed`,
		hasCommand("gh") ? "" : "brew install gh",
	]);

	// npm auth
	try {
		const who = sh("npm", ["whoami"]);
		checks.push([true, `npm user: ${who}`, ""]);
	} catch {
		checks.push([false, `npm whoami failed`, "npm login"]);
	}

	let ok = 0;
	let total = 0;
	for (const [pass, label, hint] of checks) {
		total++;
		if (pass) {
			ok++;
			console.log(`  ${chalk.green("OK")} ${label}`);
		} else {
			console.log(
				`  ${chalk.red("XX")} ${label}${hint ? chalk.dim(` — ${hint}`) : ""}`,
			);
		}
	}

	console.log("");
	console.log(chalk.bold(`${ok}/${total} checks passed`));
	if (ok < total) process.exit(1);
}
