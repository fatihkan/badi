import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { chalk, showBanner } from "../cli.js";
import { hasCommand, shCapture as sh } from "../helpers.js";

// Release pre-flight verifier.
//
// `badi release check` calistirir, ekrana raporlar — dosya yazmaz, commit
// etmez, bump etmez. Publish-oncesi durumu standalone kontrol etmek icin.

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
	const passMatch = out.match(/pass\s+(\d+)/i);
	const failMatch = out.match(/fail\s+(\d+)/i);
	return {
		exitCode: r.status,
		out,
		passed: passMatch ? Number(passMatch[1]) : null,
		failed: failMatch ? Number(failMatch[1]) : 0,
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
		const size = pkg?.size || null;
		return { ok: true, size, unpackedSize: pkg?.unpackedSize || null };
	} catch {
		return { ok: false, size: null };
	}
}

function status(label, ok, hint) {
	const mark = ok ? chalk.green("OK") : chalk.red("XX");
	const tail = hint ? chalk.dim(`  (${hint})`) : "";
	console.log(`  ${mark}  ${label}${tail}`);
}

function warn(label, hint) {
	console.log(
		`  ${chalk.yellow("!!")}  ${label}${hint ? chalk.dim(`  (${hint})`) : ""}`,
	);
}

export function runReleaseCheck(args = []) {
	let strict = false;
	let versionFlag = null;
	let skipTest = false;
	let nextVersionType = null; // patch/minor/major

	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === "--strict") strict = true;
		else if (a === "--skip-test") skipTest = true;
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

	let pass = 0;
	let warnings = 0;
	let fail = 0;

	// 1. Git temizligi
	const clean = gitClean();
	if (clean) {
		status("Git durumu temiz", true);
		pass++;
	} else {
		status("Git durumu temiz", false, "git status -s");
		fail++;
	}

	// 2. Branch
	const branch = currentBranch();
	const onMain = branch === "main" || branch === "master";
	if (onMain) {
		status(`Branch main/master (${branch})`, true);
		pass++;
	} else {
		warn(`Branch main/master degil (${branch ?? "?"})`);
		warnings++;
	}

	// 3. package.json
	const pkg = readPackageJson();
	if (!pkg) {
		status("package.json okunabilir", false);
		fail++;
		printSummary(pass, warnings, fail, strict);
		return;
	}
	status(`package.json mevcut (${pkg.name} v${pkg.version})`, true);
	pass++;

	// 4. Target version belirleme
	let targetVersion = versionFlag;
	if (!targetVersion && nextVersionType) {
		targetVersion = bumpVersion(pkg.version, nextVersionType);
	}
	if (!targetVersion) targetVersion = pkg.version;

	// 5. CHANGELOG.md
	const enOk = changelogHasVersion("CHANGELOG.md", targetVersion);
	if (enOk === null) {
		status("CHANGELOG.md mevcut", false, "dosya yok");
		fail++;
	} else if (enOk) {
		status(`CHANGELOG.md icinde [${targetVersion}]`, true);
		pass++;
	} else {
		status(
			`CHANGELOG.md icinde [${targetVersion}]`,
			false,
			"yeni surum girdisi eksik",
		);
		fail++;
	}

	// 6. CHANGELOG.tr.md
	if (existsSync("CHANGELOG.tr.md")) {
		const trOk = changelogHasVersion("CHANGELOG.tr.md", targetVersion);
		if (trOk) {
			status(`CHANGELOG.tr.md icinde [${targetVersion}]`, true);
			pass++;
		} else {
			warn(
				`CHANGELOG.tr.md icinde [${targetVersion}] eksik`,
				"TR cevirisi de gunceleyin",
			);
			warnings++;
		}
	}

	// 7. Test
	if (skipTest) {
		warn("Test atlandi (--skip-test)");
		warnings++;
	} else {
		console.log(chalk.dim("  ...  npm test calisiyor"));
		const t = runNpmTest();
		if (t.exitCode === 0 && t.failed === 0) {
			status(
				"Test (npm test)",
				true,
				t.passed != null ? `${t.passed} test gecti` : null,
			);
			pass++;
		} else {
			status(
				"Test (npm test)",
				false,
				`exit ${t.exitCode}${t.failed ? `, ${t.failed} fail` : ""}`,
			);
			fail++;
		}
	}

	// 8. gh CLI
	if (hasCommand("gh")) {
		status("gh CLI kurulu", true);
		pass++;
	} else {
		warn("gh CLI kurulu degil", "brew install gh");
		warnings++;
	}

	// 9. npm pack dry-run
	const pack = npmPackDryRun();
	if (pack.ok) {
		const sizeKb = pack.size ? (pack.size / 1024).toFixed(1) : "?";
		status(`npm pack dry-run`, true, `${sizeKb} KB tarball`);
		pass++;
		if (pack.size && pack.size > 5 * 1024 * 1024) {
			warn(
				`Paket boyutu buyuk (${sizeKb} KB)`,
				"package.json files array kontrol edin",
			);
			warnings++;
		}
	} else {
		warn("npm pack dry-run", "calistirilamadi");
		warnings++;
	}

	printSummary(pass, warnings, fail, strict, targetVersion);
}

function printSummary(pass, warnings, fail, strict, targetVersion) {
	console.log("");
	console.log(
		`${chalk.bold("Sonuc:")} ${chalk.green(`${pass} OK`)} / ${chalk.yellow(`${warnings} UYARI`)} / ${chalk.red(`${fail} HATA`)}`,
	);
	if (targetVersion) {
		console.log(chalk.dim(`  Hedef surum: ${targetVersion}`));
	}
	console.log("");

	if (fail > 0) {
		console.log(chalk.red("Publish'a hazir degil. Hatalari giderin."));
		process.exit(1);
	}
	if (strict && warnings > 0) {
		console.log(
			chalk.yellow("--strict modu: uyarilar hata sayilir. Publish iptal."),
		);
		process.exit(1);
	}
	if (warnings > 0) {
		console.log(
			chalk.dim(
				"Publish'a hazir (uyarilar var). --strict ile CI'da blok edilebilir.",
			),
		);
	} else {
		console.log(chalk.green("Publish'a hazir."));
	}
}

function printHelp() {
	console.log(chalk.bold("Release Komutlari:"));
	console.log("");
	console.log(
		`  badi release check                ${chalk.dim("Publish-oncesi pre-flight kontroller")}`,
	);
	console.log("");
	console.log(chalk.bold("Secenekler:"));
	console.log(
		`  --version <X.Y.Z>                 Hedef surum (CHANGELOG kontrolu icin)`,
	);
	console.log(
		`  --bump <patch|minor|major>        package.json'dan otomatik bump hesapla`,
	);
	console.log(
		`  --strict                          Uyariyi da hata say (CI'da kullanin)`,
	);
	console.log(
		`  --skip-test                       Test asamasini atla (hizli check)`,
	);
	console.log("");
	console.log(chalk.bold("Ornekler:"));
	console.log(`  badi release check`);
	console.log(`  badi release check --bump minor`);
	console.log(`  badi release check --version 1.30.0 --strict`);
	console.log(`  badi release check --skip-test`);
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
	console.error(chalk.red(`Bilinmeyen release komutu: ${sub}`));
	printHelp();
	process.exit(1);
}
