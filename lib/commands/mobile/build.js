import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { chalk, showBanner } from "../../cli.js";
import { hasCommand } from "../../helpers.js";

// ─── mobile build ───

export function mobileBuild(args) {
	const platform = args[0];
	if (!platform || !["ios", "android"].includes(platform)) {
		console.error(chalk.red("Usage: badi mobile build [ios|android]"));
		process.exit(1);
	}

	showBanner();
	console.log(chalk.bold(`Build: ${platform}`));
	console.log("");

	if (platform === "ios") {
		if (!hasCommand("xcodebuild")) {
			console.error(chalk.red("Xcode not found. macOS + Xcode required."));
			process.exit(1);
		}
		// React Native project detection
		if (existsSync("ios") && existsSync("package.json")) {
			console.log(chalk.dim("React Native iOS build..."));
			try {
				execFileSync("npx", ["react-native", "run-ios", "--mode", "Release"], {
					stdio: "inherit",
				});
			} catch (e) {
				console.error(chalk.red(`Build error: ${e.message}`));
				process.exit(1);
			}
		} else if (existsSync("ios") && existsSync("pubspec.yaml")) {
			try {
				execFileSync("flutter", ["build", "ios", "--release"], {
					stdio: "inherit",
				});
			} catch (e) {
				console.error(chalk.red(`Build error: ${e.message}`));
				process.exit(1);
			}
		} else {
			console.log(
				chalk.yellow("Project type not detected. Build manually from Xcode."),
			);
			console.log(
				chalk.dim("  xcodebuild -scheme YourScheme -configuration Release"),
			);
		}
	} else {
		// android
		if (existsSync("android") && existsSync("package.json")) {
			console.log(chalk.dim("React Native Android build..."));
			try {
				const gradlew = existsSync("android/gradlew") ? "./gradlew" : "gradle";
				execFileSync(gradlew, ["assembleRelease"], {
					cwd: "android",
					stdio: "inherit",
				});
			} catch (e) {
				console.error(chalk.red(`Build error: ${e.message}`));
				process.exit(1);
			}
		} else if (existsSync("android") && existsSync("pubspec.yaml")) {
			try {
				execFileSync("flutter", ["build", "apk", "--release"], {
					stdio: "inherit",
				});
			} catch (e) {
				console.error(chalk.red(`Build error: ${e.message}`));
				process.exit(1);
			}
		} else {
			console.log(chalk.yellow("Project type not detected."));
		}
	}
}
