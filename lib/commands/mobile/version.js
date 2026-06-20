import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chalk, showBanner } from "../../cli.js";
import { bumpVersion } from "../../helpers.js";

function readJson(path) {
	try {
		return JSON.parse(readFileSync(path, "utf-8"));
	} catch {
		return null;
	}
}

// ─── mobile version bump ───

function findIosPlist() {
	// Find the Info.plist location in iOS projects
	const candidates = ["ios/Info.plist", "ios/RunnerInfo.plist"];
	for (const c of candidates) {
		if (existsSync(c)) return c;
	}
	// ios/*/Info.plist
	if (existsSync("ios")) {
		for (const d of readdirSync("ios", { withFileTypes: true })) {
			if (d.isDirectory()) {
				const p = join("ios", d.name, "Info.plist");
				if (existsSync(p)) return p;
			}
		}
	}
	return null;
}

export function mobileVersion(args) {
	const bumpType = args[0];
	if (!bumpType || !["major", "minor", "patch"].includes(bumpType)) {
		console.error(
			chalk.red("Usage: badi mobile version bump [major|minor|patch]"),
		);
		process.exit(1);
	}

	showBanner();
	console.log(chalk.bold(`Version Bump: ${bumpType}`));
	console.log("");

	const updates = [];

	// package.json
	if (existsSync("package.json")) {
		const pkg = readJson("package.json");
		if (pkg?.version) {
			const newVersion = bumpVersion(pkg.version, bumpType);
			pkg.version = newVersion;
			writeFileSync("package.json", `${JSON.stringify(pkg, null, 2)}\n`);
			updates.push(["package.json", pkg.version, newVersion]);
		}
	}

	// iOS Info.plist
	const plistPath = findIosPlist();
	if (plistPath) {
		const content = readFileSync(plistPath, "utf-8");
		const match = content.match(
			/<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/,
		);
		if (match) {
			const oldVersion = match[1];
			const newVersion = bumpVersion(oldVersion, bumpType);
			const updated = content.replace(
				match[0],
				match[0].replace(oldVersion, newVersion),
			);
			writeFileSync(plistPath, updated);
			updates.push([plistPath, oldVersion, newVersion]);
		}
	}

	// Android build.gradle
	const gradlePath = "android/app/build.gradle";
	if (existsSync(gradlePath)) {
		const content = readFileSync(gradlePath, "utf-8");
		const match = content.match(/versionName\s+["']([^"']+)["']/);
		if (match) {
			const oldVersion = match[1];
			const newVersion = bumpVersion(oldVersion, bumpType);
			const updated = content.replace(
				match[0],
				match[0].replace(oldVersion, newVersion),
			);
			writeFileSync(gradlePath, updated);
			updates.push([gradlePath, oldVersion, newVersion]);
		}
	}

	// Flutter pubspec.yaml
	if (existsSync("pubspec.yaml")) {
		const content = readFileSync("pubspec.yaml", "utf-8");
		const match = content.match(/^version:\s*([\d.]+)(\+\d+)?$/m);
		if (match) {
			const oldVersion = match[1];
			const newVersion = bumpVersion(oldVersion, bumpType);
			const updated = content.replace(
				match[0],
				`version: ${newVersion}${match[2] || ""}`,
			);
			writeFileSync("pubspec.yaml", updated);
			updates.push(["pubspec.yaml", oldVersion, newVersion]);
		}
	}

	if (updates.length === 0) {
		console.log(chalk.yellow("No version file found."));
		console.log(
			chalk.dim(
				"Expected package.json, Info.plist, build.gradle or pubspec.yaml.",
			),
		);
		process.exit(1);
	}

	console.log(chalk.bold("Updated Files:"));
	for (const [file, oldV, newV] of updates) {
		console.log(
			`  ${chalk.green(file.padEnd(40))} ${chalk.dim(oldV)} -> ${chalk.bold.green(newV)}`,
		);
	}
	console.log("");
	console.log(chalk.bold.green("Version bump complete!"));
}
