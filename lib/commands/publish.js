import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { chalk, showBanner } from "../cli.js";

// ─── Yardimcilar ───

function sh(cmd, args, opts = {}) {
	const res = spawnSync(cmd, args, { encoding: "utf-8", ...opts });
	if (res.status !== 0) {
		const err = res.stderr || res.stdout || "(bilinmeyen hata)";
		throw new Error(`${cmd} ${args.join(" ")} basarisiz:\n${err.trim()}`);
	}
	return (res.stdout || "").trim();
}

function hasCommand(cmd) {
	try {
		execFileSync("which", [cmd], { stdio: "pipe" });
		return true;
	} catch {
		return false;
	}
}

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
		message: null,
	};
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === "--version") flags.version = args[++i] || "patch";
		else if (a === "--dry-run") flags.dryRun = true;
		else if (a === "--skip-npm") flags.skipNpm = true;
		else if (a === "--skip-github") flags.skipGithub = true;
		else if (a === "--skip-changelog") flags.skipChangelog = true;
		else if (a === "--message" || a === "-m") flags.message = args[++i];
	}
	if (!["patch", "minor", "major"].includes(flags.version)) {
		throw new Error(`--version gecersiz: ${flags.version} (patch|minor|major)`);
	}
	return flags;
}

// ─── Ana orkestrator ───

export async function runPublish(args) {
	const sub = args[0];

	if (!sub || sub === "--help" || sub === "-h") {
		showBanner();
		console.log(chalk.bold("Badi Publish — Release Orkestratoru"));
		console.log("");
		console.log(chalk.bold("Kullanim:"));
		console.log(
			`  ${chalk.cyan("badi publish")} [secenekler]      Tum akisi calistir`,
		);
		console.log(
			`  ${chalk.cyan("badi publish check")}             Yayin on-kontrol (git temiz mi?)`,
		);
		console.log("");
		console.log(chalk.bold("Secenekler:"));
		console.log("  --version <type>     patch|minor|major (varsayilan: patch)");
		console.log("  --dry-run            Hicbir sey uygulama, adimlari goster");
		console.log("  --skip-npm           npm publish'i atla");
		console.log("  --skip-github        gh release create'i atla");
		console.log("  --skip-changelog     CHANGELOG kontrolunu atla");
		console.log("  -m, --message <str>  Commit mesajinda extra not");
		console.log("");
		console.log(chalk.bold("Adimlar (sirasiyla):"));
		console.log("  1. Git temiz mi? (temizlik yoksa durur)");
		console.log("  2. Branch main mi? (degilse uyari)");
		console.log("  3. CHANGELOG yeni surum girdisi mevcut mu?");
		console.log("  4. package.json version bump");
		console.log("  5. git commit (chore: release vX.Y.Z)");
		console.log("  6. git tag vX.Y.Z");
		console.log("  7. git push main + tag");
		console.log("  8. gh release create (varsa)");
		console.log("  9. npm publish --access public");
		console.log("");
		console.log(chalk.bold("Ornekler:"));
		console.log("  badi publish --dry-run");
		console.log("  badi publish --version minor");
		console.log("  badi publish --version patch --skip-github");
		console.log("  badi publish check");
		return;
	}

	if (sub === "check") {
		return publishCheck();
	}

	const flags = parseFlags(args);

	showBanner();
	console.log(
		chalk.bold(`Badi Publish ${flags.dryRun ? chalk.yellow("[DRY RUN]") : ""}`),
	);
	console.log("");

	// 0. On kontroller
	if (!existsSync("package.json")) {
		throw new Error("package.json bulunamadi — proje kokunde calistirin");
	}
	const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
	const oldVersion = pkg.version;
	const newVersion = bumpVersion(oldVersion, flags.version);

	console.log(chalk.bold("On Durum:"));
	console.log(`  Paket:    ${chalk.cyan(pkg.name)}`);
	console.log(
		`  Sufum:    ${chalk.cyan(oldVersion)} → ${chalk.bold.green(newVersion)}`,
	);
	console.log(`  Tip:      ${chalk.cyan(flags.version)}`);
	console.log("");

	// 1. Git clean
	console.log(chalk.bold("1. Git Durumu:"));
	if (!gitClean()) {
		console.log(`  ${chalk.red("XX")} Calisma dizini temiz degil`);
		console.log(chalk.dim("  Once commit et veya stashla."));
		throw new Error("Git temiz degil");
	}
	console.log(`  ${chalk.green("OK")} Calisma dizini temiz`);

	// 2. Branch kontrolu
	const branch = currentBranch();
	console.log(
		`  ${branch === "main" || branch === "master" ? chalk.green("OK") : chalk.yellow("!!")} Branch: ${chalk.cyan(branch)}`,
	);
	if (branch !== "main" && branch !== "master") {
		console.log(chalk.yellow("  Uyari: main/master disinda bir branch'tesin."));
	}
	console.log("");

	// 3. CHANGELOG kontrolu
	if (!flags.skipChangelog) {
		console.log(chalk.bold("2. CHANGELOG Kontrolu:"));
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
			`  ${hasEn ? chalk.green("OK") : chalk.red("XX")} CHANGELOG.md icinde ${versionMarker} ${hasEn ? "mevcut" : "eksik"}`,
		);
		if (existsSync("CHANGELOG.tr.md")) {
			console.log(
				`  ${hasTr ? chalk.green("OK") : chalk.yellow("!!")} CHANGELOG.tr.md icinde ${versionMarker} ${hasTr ? "mevcut" : "eksik"}`,
			);
		}
		if (!hasEn) {
			console.log(
				chalk.dim(
					"  Once CHANGELOG.md'ye yeni surum girdisi ekle. --skip-changelog ile atlanabilir.",
				),
			);
			throw new Error("CHANGELOG eksik");
		}
		console.log("");
	}

	// 4. package.json version bump
	console.log(chalk.bold("3. Version Bump:"));
	if (flags.dryRun) {
		console.log(
			chalk.dim(`  [dry] package.json: ${oldVersion} -> ${newVersion}`),
		);
	} else {
		pkg.version = newVersion;
		writeFileSync("package.json", `${JSON.stringify(pkg, null, 2)}\n`, "utf-8");
		// package-lock.json da varsa
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
				console.log(`  ${chalk.green("OK")} package-lock.json da guncellendi`);
			} catch {
				console.log(
					`  ${chalk.yellow("!!")} package-lock.json parse edilemedi`,
				);
			}
		}
		console.log(
			`  ${chalk.green("OK")} package.json: ${oldVersion} -> ${newVersion}`,
		);
	}
	console.log("");

	// 5. Commit
	console.log(chalk.bold("4. Commit:"));
	const commitMsg = flags.message
		? `chore(release): v${newVersion} — ${flags.message}`
		: `chore(release): v${newVersion}`;
	if (flags.dryRun) {
		console.log(chalk.dim(`  [dry] git add package.json package-lock.json`));
		console.log(chalk.dim(`  [dry] git commit -m "${commitMsg}"`));
	} else {
		try {
			const files = ["package.json"];
			if (existsSync("package-lock.json")) files.push("package-lock.json");
			sh("git", ["add", ...files]);
			sh("git", ["commit", "-m", commitMsg]);
			console.log(`  ${chalk.green("OK")} Commit: ${chalk.cyan(commitMsg)}`);
		} catch (e) {
			console.log(`  ${chalk.red("XX")} Commit basarisiz: ${e.message}`);
			throw e;
		}
	}
	console.log("");

	// 6. Tag
	console.log(chalk.bold("5. Tag:"));
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
			console.log(`  ${chalk.red("XX")} Tag basarisiz: ${e.message}`);
			throw e;
		}
	}
	console.log("");

	// 7. Push
	console.log(chalk.bold("6. Push:"));
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
			console.log(`  ${chalk.red("XX")} Push basarisiz: ${e.message}`);
			throw e;
		}
	}
	console.log("");

	// 8. GitHub release
	if (!flags.skipGithub) {
		console.log(chalk.bold("7. GitHub Release:"));
		if (!hasCommand("gh")) {
			console.log(`  ${chalk.yellow("!!")} gh CLI yok — atlaniyor`);
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
						`  ${chalk.yellow("!!")} GitHub release basarisiz (devam ediliyor): ${e.message.substring(0, 200)}`,
					);
				}
			}
		}
		console.log("");
	}

	// 9. npm publish
	if (!flags.skipNpm) {
		console.log(chalk.bold("8. npm Publish:"));
		if (flags.dryRun) {
			console.log(chalk.dim("  [dry] npm publish --access public"));
		} else {
			try {
				// 2FA gerekebilir — stdio inherit ile etkilesim izin ver
				const res = spawnSync("npm", ["publish", "--access", "public"], {
					stdio: "inherit",
				});
				if (res.status !== 0) {
					console.log(
						`  ${chalk.red("XX")} npm publish basarisiz (npm whoami kontrol et)`,
					);
					console.log(chalk.dim("  Login: npm login (2FA gerekli olabilir)"));
				} else {
					console.log(`  ${chalk.green("OK")} npm publish tamamlandi`);
				}
			} catch (e) {
				console.log(`  ${chalk.yellow("!!")} npm publish hatasi: ${e.message}`);
			}
		}
		console.log("");
	}

	console.log(
		chalk.bold.green(
			`${flags.dryRun ? "[DRY RUN] " : ""}Release v${newVersion} hazir!`,
		),
	);
	if (!flags.dryRun) {
		console.log("");
		console.log(chalk.bold("Sonraki adimlar:"));
		console.log(`  - npm: https://www.npmjs.com/package/${pkg.name}`);
		console.log(`  - GitHub: git log --oneline -1`);
	}
}

function publishCheck() {
	showBanner();
	console.log(chalk.bold("Publish On-Kontrol"));
	console.log("");

	const checks = [];

	// Git temiz
	const clean = gitClean();
	checks.push([clean, `Git durumu temiz`, clean ? "" : "git status -s"]);

	// Branch
	const branch = currentBranch();
	const mainBranch = branch === "main" || branch === "master";
	checks.push([mainBranch, `Branch main/master (${branch})`, ""]);

	// package.json
	const hasPkg = existsSync("package.json");
	checks.push([hasPkg, `package.json mevcut`, ""]);

	if (hasPkg) {
		const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
		checks.push([
			!!pkg.version,
			`package.json version tanimli (${pkg.version || "?"})`,
			"",
		]);
		checks.push([
			!!pkg.name,
			`package.json name tanimli (${pkg.name || "?"})`,
			"",
		]);
		const hasFiles = Array.isArray(pkg.files) && pkg.files.length > 0;
		checks.push([
			hasFiles,
			`package.json files array mevcut`,
			hasFiles ? "" : "npm publish tum dizini gondermeli degil",
		]);
	}

	// CHANGELOG
	checks.push([existsSync("CHANGELOG.md"), `CHANGELOG.md mevcut`, ""]);

	// gh CLI
	checks.push([
		hasCommand("gh"),
		`gh CLI kurulu`,
		hasCommand("gh") ? "" : "brew install gh",
	]);

	// npm auth
	try {
		const who = sh("npm", ["whoami"]);
		checks.push([true, `npm kullanicisi: ${who}`, ""]);
	} catch {
		checks.push([false, `npm whoami basarisiz`, "npm login"]);
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
	console.log(chalk.bold(`${ok}/${total} kontrol gecti`));
	if (ok < total) process.exit(1);
}
