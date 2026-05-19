import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { chalk, showBanner } from "../cli.js";
import { hasCommand, shCapture as sh } from "../helpers.js";

// Release pre-flight verifier.
//
// `badi release check` calistirir, ekrana raporlar — dosya yazmaz, commit
// etmez, bump etmez. Publish-oncesi durumu standalone kontrol etmek icin.
//
// v1.30 review C2 fix: monolitik prosedural yapidan CHECKS array'ine
// refactor. Her kontrol pure-function olarak ayri tanimli ve test
// edilebilir. CHECKS dizisi public; ileride plugin'ler kontrol ekleyebilir.

// ─── Yardimcilar ───

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

// ─── Pure CHECK fonksiyonlari ───
//
// Her check ctx alir ({ pkg, targetVersion, skipTest }), {pass, level, label,
// hint, info?} doner. level ∈ {"ok","warn","fail"}.

function checkGitClean() {
	const clean = gitClean();
	return {
		name: "git-clean",
		label: "Git durumu temiz",
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
			: `Branch main/master degil (${branch ?? "?"})`,
		pass: onMain,
		level: onMain ? "ok" : "warn",
		hint: null,
	};
}

function checkPackageJson(ctx) {
	if (!ctx.pkg) {
		return {
			name: "package-json",
			label: "package.json okunabilir",
			pass: false,
			level: "fail",
			hint: null,
		};
	}
	return {
		name: "package-json",
		label: `package.json mevcut (${ctx.pkg.name} v${ctx.pkg.version})`,
		pass: true,
		level: "ok",
	};
}

function checkChangelogEn(ctx) {
	const r = changelogHasVersion("CHANGELOG.md", ctx.targetVersion);
	if (r === null) {
		return {
			name: "changelog-en",
			label: "CHANGELOG.md mevcut",
			pass: false,
			level: "fail",
			hint: "dosya yok",
		};
	}
	return {
		name: "changelog-en",
		label: `CHANGELOG.md icinde [${ctx.targetVersion}]`,
		pass: r,
		level: r ? "ok" : "fail",
		hint: r ? null : "yeni surum girdisi eksik",
	};
}

function checkChangelogTr(ctx) {
	if (!existsSync("CHANGELOG.tr.md")) {
		return null; // skip
	}
	const r = changelogHasVersion("CHANGELOG.tr.md", ctx.targetVersion);
	return {
		name: "changelog-tr",
		label: `CHANGELOG.tr.md icinde [${ctx.targetVersion}]`,
		pass: r,
		level: r ? "ok" : "warn",
		hint: r ? null : "TR cevirisi de gunceleyin",
	};
}

function checkNpmTest(ctx) {
	if (ctx.skipTest) {
		return {
			name: "test",
			label: "Test atlandi (--skip-test)",
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
				? `${t.passed} test gecti`
				: null
			: `exit ${t.exitCode}${t.failed ? `, ${t.failed} fail` : ""}`,
	};
}

function checkGhCli() {
	const ok = hasCommand("gh");
	return {
		name: "gh-cli",
		label: ok ? "gh CLI kurulu" : "gh CLI kurulu degil",
		pass: ok,
		level: ok ? "ok" : "warn",
		hint: ok ? null : "brew install gh",
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
			hint: "calistirilamadi",
		};
	}
	const sizeKb = pack.size ? (pack.size / 1024).toFixed(1) : "?";
	const tooBig = pack.size && pack.size > 5 * 1024 * 1024;
	return {
		name: "npm-pack",
		label: tooBig
			? `Paket boyutu buyuk (${sizeKb} KB)`
			: "npm pack dry-run",
		pass: !tooBig,
		level: tooBig ? "warn" : "ok",
		info: tooBig ? null : `${sizeKb} KB tarball`,
		hint: tooBig ? "package.json files array kontrol edin" : null,
	};
}

// Public CHECK registry — plugin'ler push() ile genisletebilir.
// Sirayla calistirilir; null donen check'ler atlanir.
export const CHECKS = [
	checkGitClean,
	checkBranch,
	checkPackageJson,
	checkChangelogEn,
	checkChangelogTr,
	checkNpmTest,
	checkGhCli,
	checkNpmPack,
];

/**
 * Pure runner — UI'siz, sadece sonuc dizisi doner. Test edilebilir.
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

export function runReleaseCheck(args = []) {
	let strict = false;
	let versionFlag = null;
	let skipTest = false;
	let nextVersionType = null;

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

	const pkg = readPackageJson();
	let targetVersion = versionFlag;
	if (!targetVersion && nextVersionType && pkg?.version) {
		targetVersion = bumpVersion(pkg.version, nextVersionType);
	}
	if (!targetVersion && pkg?.version) targetVersion = pkg.version;

	const ctx = { pkg, targetVersion, skipTest };
	const results = runChecks(ctx);

	// Note: bazi check'ler uzun surer (npm test). Inline'da "calisiyor" mesaji
	// bilgisi olmadan basla; sonuc gelince renderResult.
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

// Exports for unit testing
export {
	bumpVersion,
	changelogHasVersion,
	checkBranch,
	checkChangelogEn,
	checkChangelogTr,
	checkGhCli,
	checkGitClean,
	checkNpmPack,
	checkNpmTest,
	checkPackageJson,
};
