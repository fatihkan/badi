import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chalk, showBanner } from "../cli.js";
import { fetchJsonWithTimeout, hasCommand } from "../helpers.js";

// ─── Helpers ───

function readJson(path) {
	try {
		return JSON.parse(readFileSync(path, "utf-8"));
	} catch {
		return null;
	}
}

// ─── mobile init ───

const FRAMEWORKS = {
	"react-native": {
		cli: "npx",
		args: (name) => ["react-native@latest", "init", name],
		check: () => hasCommand("npx"),
		installHint: "Node.js 18+ must be installed",
	},
	flutter: {
		cli: "flutter",
		args: (name) => ["create", name],
		check: () => hasCommand("flutter"),
		installHint: "flutter.dev/docs/get-started/install",
	},
	expo: {
		cli: "npx",
		args: (name) => ["create-expo-app@latest", name],
		check: () => hasCommand("npx"),
		installHint: "Node.js 18+ must be installed",
	},
	swift: {
		cli: null,
		args: null,
		check: () => hasCommand("xcodebuild"),
		installHint: "Download Xcode from the App Store (macOS)",
	},
	kotlin: {
		cli: null,
		args: null,
		check: () => hasCommand("gradle"),
		installHint: "Download Android Studio: developer.android.com/studio",
	},
};

function mobileInit(args) {
	const name = args[0];
	let framework = "react-native";

	if (!name || name.startsWith("--")) {
		console.error(
			chalk.red(
				"Specify a project name: badi mobile init [project-name] --framework [rn|flutter|expo]",
			),
		);
		process.exit(1);
	}

	for (let i = 1; i < args.length; i++) {
		if (args[i] === "--framework") framework = args[++i];
	}

	const fw = FRAMEWORKS[framework];
	if (!fw) {
		console.error(chalk.red(`Invalid framework: ${framework}`));
		console.log(`Valid: ${Object.keys(FRAMEWORKS).join(", ")}`);
		process.exit(1);
	}

	if (!fw.check()) {
		console.error(chalk.red(`Required tool for ${framework} not found.`));
		console.log(chalk.dim(`Install: ${fw.installHint}`));
		process.exit(1);
	}

	if (!fw.cli) {
		showBanner();
		console.log(chalk.bold(`For a ${framework} project:`));
		console.log("");
		if (framework === "swift") {
			console.log("  Xcode -> File -> New -> Project -> App");
			console.log("  Language: Swift, Interface: SwiftUI/Storyboard");
		} else if (framework === "kotlin") {
			console.log("  Android Studio -> New Project -> Empty Activity");
			console.log("  Language: Kotlin");
		}
		console.log("");
		console.log(chalk.bold("After creating the project:"));
		console.log(`  cd ${name}`);
		console.log("  npx @fatihkan/badi init");
		return;
	}

	showBanner();
	console.log(chalk.bold(`Creating Mobile Project: ${name}`));
	console.log(`  Framework: ${chalk.cyan(framework)}`);
	console.log(
		`  Command:   ${chalk.dim(`${fw.cli} ${fw.args(name).join(" ")}`)}`,
	);
	console.log("");

	try {
		execFileSync(fw.cli, fw.args(name), { stdio: "inherit" });
		console.log("");
		console.log(chalk.bold.green(`${framework} project created: ${name}`));
		console.log("");
		console.log(chalk.bold("Next steps:"));
		console.log(`  cd ${name}`);
		console.log("  npx @fatihkan/badi init   # Badi configuration");
		console.log("  badi mobile assets icon ./icon.png");
	} catch (e) {
		console.error(chalk.red(`Framework CLI error: ${e.message}`));
		process.exit(1);
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

function bumpVersion(version, type = "patch") {
	const [major, minor, patch] = version.split(".").map(Number);
	if (type === "major") return `${major + 1}.0.0`;
	if (type === "minor") return `${major}.${minor + 1}.0`;
	return `${major}.${minor}.${patch + 1}`;
}

function mobileVersion(args) {
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

// ─── mobile build ───

function mobileBuild(args) {
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

// ─── mobile release (guide) ───

function mobileRelease(args) {
	const target = args[0];
	const validTargets = ["testflight", "play-internal", "appstore", "play"];
	if (!target || !validTargets.includes(target)) {
		console.error(
			chalk.red(`Usage: badi mobile release [${validTargets.join("|")}]`),
		);
		process.exit(1);
	}

	showBanner();
	console.log(chalk.bold(`Release Guide: ${target}`));
	console.log("");

	const guides = {
		testflight: [
			"1. Xcode: Product -> Archive",
			"2. Organizer -> Distribute App -> App Store Connect",
			"3. Wait (processing ~30 min)",
			"4. TestFlight -> add Internal/External testers",
			"",
			"With Fastlane:",
			"  fastlane ios beta",
			"",
			"From CLI:",
			"  xcodebuild -scheme X archive -archivePath build.xcarchive",
			"  xcodebuild -exportArchive -archivePath build.xcarchive -exportPath build/",
			"  xcrun altool --upload-app -f build/X.ipa -u APPLE_ID -p APP_PASSWORD",
		],
		"play-internal": [
			"1. Play Console -> Testing -> Internal testing",
			"2. Create new release -> Upload AAB (android/app/build/outputs/bundle/release/app-release.aab)",
			"3. Review + Rollout",
			"",
			"With Fastlane:",
			"  fastlane android beta",
			"",
			"With bundletool:",
			"  bundletool build-apks --bundle=app.aab --output=app.apks",
		],
		appstore: [
			"1. Test on TestFlight first",
			"2. App Store Connect -> App Store -> + Version",
			"3. Update What's New, Screenshots, Description",
			"4. Select build -> Submit for Review",
			"5. Review takes 1-3 days",
			"",
			"Tip: badi content release-notes --platform ios --version X.Y.Z",
		],
		play: [
			"1. Play Console -> Production",
			"2. Create new release -> Upload AAB",
			"3. Release notes (500 char limit)",
			"4. Rollout percentage (1% -> 10% -> 50% -> 100%)",
			"",
			"Tip: badi content release-notes --platform android --version X.Y.Z",
		],
	};

	const guide = guides[target];
	for (const line of guide) {
		if (
			line.startsWith("With Fastlane") ||
			line.startsWith("From CLI") ||
			line.startsWith("With bundletool") ||
			line.startsWith("Tip")
		) {
			console.log(chalk.cyan(line));
		} else if (
			line.trim().startsWith("//") ||
			line.trim().startsWith("#") ||
			line === ""
		) {
			console.log(line);
		} else {
			console.log(`  ${line}`);
		}
	}
	console.log("");
	console.log(
		chalk.dim(
			"For automated releases use fastlane or eas submit (v2.0 roadmap).",
		),
	);
}

// ─── mobile assets ───

function mobileAssetsIcon(source) {
	showBanner();
	console.log(chalk.bold("Icon Generation Guide"));
	console.log("");

	if (source && !existsSync(source)) {
		console.error(chalk.red(`Source not found: ${source}`));
		process.exit(1);
	}

	const iosSizes = [
		[20, "Notification"],
		[29, "Settings"],
		[40, "Spotlight"],
		[58, "Settings @2x"],
		[60, "Notification @3x"],
		[76, "iPad App"],
		[80, "Spotlight @2x"],
		[87, "Settings @3x"],
		[120, "iPhone App @2x"],
		[152, "iPad App @2x"],
		[167, "iPad Pro"],
		[180, "iPhone App @3x"],
		[1024, "App Store"],
	];
	const androidSizes = [
		[48, "mdpi"],
		[72, "hdpi"],
		[96, "xhdpi"],
		[144, "xxhdpi"],
		[192, "xxxhdpi"],
		[512, "Play Store"],
	];

	console.log(chalk.bold("iOS Sizes:"));
	for (const [size, label] of iosSizes) {
		console.log(`  ${chalk.cyan(`${size}x${size}`.padEnd(12))} ${label}`);
	}
	console.log("");
	console.log(chalk.bold("Android Sizes:"));
	for (const [size, label] of androidSizes) {
		console.log(`  ${chalk.cyan(`${size}x${size}`.padEnd(12))} ${label}`);
	}

	console.log("");
	if (source) {
		console.log(chalk.bold("Automatic Generation:"));
		if (hasCommand("magick") || hasCommand("convert")) {
			const cmd = hasCommand("magick") ? "magick" : "convert";
			console.log(chalk.cyan("ImageMagick found. Example commands:"));
			for (const [size] of [...iosSizes, ...androidSizes]) {
				console.log(
					chalk.dim(
						`  ${cmd} ${source} -resize ${size}x${size} icon-${size}.png`,
					),
				);
			}
		} else {
			console.log(
				chalk.yellow("ImageMagick not found (brew install imagemagick)."),
			);
			console.log(
				chalk.dim("Alternative: sharp-cli package or https://appicon.co"),
			);
		}
	} else {
		console.log(chalk.dim("Usage: badi mobile assets icon [source.png]"));
	}

	console.log("");
	console.log(chalk.bold("Tips:"));
	console.log("  - Start from a 1024x1024 source (highest resolution)");
	console.log(
		"  - PNG, no transparency (iOS), transparency ok (Android adaptive)",
	);
	console.log("  - iOS: corner rounding is automatic via Apple");
	console.log("  - Android: adaptive icon (foreground + background)");
}

function mobileAssetsSplash() {
	showBanner();
	console.log(chalk.bold("Splash Screen Guide"));
	console.log("");

	console.log(chalk.bold("iOS LaunchScreen:"));
	console.log(
		`  ${chalk.cyan("LaunchScreen.storyboard")}  Edit with Xcode (responsive)`,
	);
	console.log(`  ${chalk.cyan("1242 x 2688 px")}           Portrait @3x base`);
	console.log(
		`  ${chalk.cyan("Assets.xcassets")}          Use with an image asset`,
	);

	console.log("");
	console.log(chalk.bold("Android Splash:"));
	console.log(`  ${chalk.cyan("drawable/")}                Transition image`);
	console.log(`  ${chalk.cyan("1080 x 1920 px")}           Portrait xxxhdpi`);
	console.log(`  ${chalk.cyan("SplashTheme style")}        values/styles.xml`);

	console.log("");
	console.log(chalk.bold("Modern Approach (Android 12+):"));
	console.log(chalk.dim("  Use the SplashScreen API — maximum 288x288 icon"));
	console.log(chalk.dim("  Theme: windowSplashScreenAnimatedIcon"));

	console.log("");
	console.log(chalk.bold("Best Practices:"));
	console.log("  - Don't keep it longer than 2 seconds");
	console.log("  - Logo centered, minimal animation");
	console.log("  - Brand color + logo is enough");
	console.log("  - Add a dark mode variation");
}

function mobileAssetsScreenshots() {
	showBanner();
	console.log(chalk.bold("Screenshot Guide"));
	console.log("");

	console.log(chalk.bold("iOS Required Sizes:"));
	console.log(`  ${chalk.cyan('6.7" (iPhone 14 Pro Max)')}   1290 x 2796 px`);
	console.log(`  ${chalk.cyan('6.5" (iPhone 11 Pro Max)')}   1242 x 2688 px`);
	console.log(`  ${chalk.cyan('5.5" (iPhone 8 Plus)')}       1242 x 2208 px`);
	console.log(`  ${chalk.cyan('12.9" iPad Pro (3rd gen+)')}  2048 x 2732 px`);

	console.log("");
	console.log(chalk.bold("Android Required Sizes:"));
	console.log(`  ${chalk.cyan("Phone")}              1080 x 1920 px (min 2-8)`);
	console.log(`  ${chalk.cyan("Feature Graphic")}    1024 x 500 px (required)`);
	console.log(`  ${chalk.cyan('7" Tablet')}         1200 x 1920 px`);
	console.log(`  ${chalk.cyan('10" Tablet')}        1920 x 1200 px`);

	console.log("");
	console.log(chalk.bold("Design Principles:"));
	console.log("  1. First screenshot is most critical — value proposition");
	console.log("  2. Max 5 words per screenshot, >= 40pt");
	console.log("  3. Add a device frame (professional)");
	console.log("  4. Brand color + clean background");
	console.log("  5. Story flow: problem -> solution -> result");

	console.log("");
	console.log(
		chalk.bold.green("Automatic Generation (app-store-screenshots skill):"),
	);
	console.log(
		`  Installed alongside Badi at ${chalk.cyan(".claude/skills/mobile/app-store-screenshots/")}.`,
	);
	console.log("  Trigger it in Claude Code like this:");
	console.log("");
	console.log(
		chalk.dim('  "Create 6 App Store screenshots for my habit tracker app.'),
	);
	console.log(
		chalk.dim(
			'   Clean/minimal style, calm premium feel, brand color #4F46E5."',
		),
	);
	console.log("");
	console.log("  The skill scaffolds Next.js, designs the pitch per slide,");
	console.log("  and exports PNG at Apple + Google required resolutions.");
	console.log("");
	console.log(
		chalk.dim(
			'For a detailed brief: badi content visual "app store screenshot"',
		),
	);
}

function mobileAssets(args) {
	const sub = args[0];
	if (!sub) {
		showBanner();
		console.log(chalk.bold("Mobile Asset Commands:"));
		console.log(
			`  ${chalk.cyan("badi mobile assets icon")} [source]        40+ size icon guide`,
		);
		console.log(
			`  ${chalk.cyan("badi mobile assets splash")}               Splash screen guide`,
		);
		console.log(
			`  ${chalk.cyan("badi mobile assets screenshots")}          Screenshot size + design guide`,
		);
		return;
	}
	switch (sub) {
		case "icon":
			mobileAssetsIcon(args[1]);
			break;
		case "splash":
			mobileAssetsSplash();
			break;
		case "screenshots":
			mobileAssetsScreenshots();
			break;
		default:
			console.error(chalk.red(`Unknown assets command: ${sub}`));
			process.exit(1);
	}
}

// ─── mobile crash-setup ───

function mobileCrashSetup(args) {
	const framework = args[0] || "react-native";
	const provider = args[1] || "sentry";
	const validFw = ["react-native", "flutter", "ios", "android"];
	const validProv = ["sentry", "crashlytics"];

	if (!validFw.includes(framework)) {
		console.error(
			chalk.red(`Invalid framework: ${framework} (${validFw.join("|")})`),
		);
		process.exit(1);
	}
	if (!validProv.includes(provider)) {
		console.error(
			chalk.red(`Invalid provider: ${provider} (${validProv.join("|")})`),
		);
		process.exit(1);
	}

	showBanner();
	console.log(chalk.bold(`Crash Reporting Setup: ${framework} + ${provider}`));
	console.log("");

	const snippets = {
		"react-native-sentry": [
			[chalk.bold("1. Install package:"), "npm install @sentry/react-native"],
			[chalk.bold("2. Native link (iOS):"), "cd ios && pod install"],
			[
				chalk.bold("3. Get the DSN:"),
				"sentry.io -> Project Settings -> Client Keys",
			],
			[
				chalk.bold("4. At the app entry point (App.tsx):"),
				`import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "YOUR_DSN",
  tracesSampleRate: 1.0,
  enableNative: true,
  enableAutoSessionTracking: true,
});

export default Sentry.wrap(App);`,
			],
			[
				chalk.bold("5. Source map upload:"),
				`npx sentry-cli releases files RELEASE upload-sourcemaps \\
  --dist DIST --rewrite main.jsbundle main.jsbundle.map`,
			],
			[chalk.bold("6. Test:"), `Sentry.captureException(new Error("test"));`],
		],
		"react-native-crashlytics": [
			[
				chalk.bold("1. Create a Firebase project:"),
				"console.firebase.google.com",
			],
			[
				chalk.bold("2. Packages:"),
				"npm install @react-native-firebase/app @react-native-firebase/crashlytics",
			],
			[
				chalk.bold("3. iOS config:"),
				"add ios/GoogleService-Info.plist (drag-drop in Xcode)",
			],
			[
				chalk.bold("4. Android config:"),
				"add android/app/google-services.json",
			],
			[
				chalk.bold("5. App.tsx:"),
				`import crashlytics from "@react-native-firebase/crashlytics";

crashlytics().log("App opened");
crashlytics().setUserId("user_123");`,
			],
			[
				chalk.bold("6. Test crash:"),
				`crashlytics().crash();  // Only caught in release builds`,
			],
		],
		"flutter-sentry": [
			[chalk.bold("1. pubspec.yaml:"), "sentry_flutter: ^7.0.0"],
			[
				chalk.bold("2. main.dart:"),
				`import "package:sentry_flutter/sentry_flutter.dart";

Future<void> main() async {
  await SentryFlutter.init(
    (options) {
      options.dsn = "YOUR_DSN";
      options.tracesSampleRate = 1.0;
    },
    appRunner: () => runApp(MyApp()),
  );
}`,
			],
			[chalk.bold("3. Test:"), `Sentry.captureException(Exception("test"));`],
		],
		"flutter-crashlytics": [
			[
				chalk.bold("1. pubspec.yaml:"),
				`firebase_core: ^2.0.0
firebase_crashlytics: ^3.0.0`,
			],
			[
				chalk.bold("2. flutterfire configure:"),
				"dart pub global activate flutterfire_cli && flutterfire configure",
			],
			[
				chalk.bold("3. main.dart:"),
				`await Firebase.initializeApp();
FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;`,
			],
		],
		"ios-sentry": [
			[
				chalk.bold("1. SPM package:"),
				"https://github.com/getsentry/sentry-cocoa",
			],
			[
				chalk.bold("2. AppDelegate.swift:"),
				`import Sentry

SentrySDK.start { options in
  options.dsn = "YOUR_DSN"
  options.tracesSampleRate = 1.0
}`,
			],
			[
				chalk.bold("3. Test:"),
				`SentrySDK.capture(error: NSError(domain: "Test", code: 1))`,
			],
		],
		"ios-crashlytics": [
			[
				chalk.bold("1. Firebase iOS SDK:"),
				"SPM: https://github.com/firebase/firebase-ios-sdk",
			],
			[
				chalk.bold("2. GoogleService-Info.plist:"),
				"add to Xcode (include in the target)",
			],
			[
				chalk.bold("3. AppDelegate.swift:"),
				`import FirebaseCore

FirebaseApp.configure()`,
			],
		],
		"android-sentry": [
			[
				chalk.bold("1. build.gradle (app):"),
				`implementation "io.sentry:sentry-android:7.0.0"`,
			],
			[
				chalk.bold("2. AndroidManifest.xml:"),
				`<meta-data android:name="io.sentry.dsn" android:value="YOUR_DSN" />`,
			],
			[
				chalk.bold("3. Test:"),
				`Sentry.captureException(new Exception("test"));`,
			],
		],
		"android-crashlytics": [
			[
				chalk.bold("1. build.gradle (project):"),
				`classpath "com.google.firebase:firebase-crashlytics-gradle:2.9.0"`,
			],
			[
				chalk.bold("2. build.gradle (app):"),
				`apply plugin: "com.google.firebase.crashlytics"
implementation platform("com.google.firebase:firebase-bom:32.0.0")
implementation "com.google.firebase:firebase-crashlytics"`,
			],
			[chalk.bold("3. google-services.json:"), "add to the app/ folder"],
		],
	};

	const key = `${framework}-${provider}`;
	const steps = snippets[key];
	if (!steps) {
		console.error(
			chalk.red(`${framework} + ${provider} combination not supported`),
		);
		process.exit(1);
	}

	for (const [label, body] of steps) {
		console.log(label);
		console.log(chalk.dim(body));
		console.log("");
	}

	console.log(chalk.bold("Verification:"));
	console.log("  - See the test event in the Sentry/Firebase dashboard");
	console.log("  - Run a release build on a device, trigger a manual crash");
	console.log("  - Check source map / ProGuard mapping upload");
	console.log("");
	console.log(
		chalk.dim(
			"Detailed guide: sentry.io/for/react-native | firebase.google.com/docs/crashlytics",
		),
	);
}

// ─── mobile deeplink ───
// Note: the validateUrl call inside fetchJsonWithTimeout blocks private IPs +
// localhost — since mobile deeplink accepts a user-provided domain, this guard
// is essential against SSRF.

async function mobileDeeplink(args) {
	const urlOrScheme = args[0];
	if (!urlOrScheme) {
		console.error(
			chalk.red("Usage: badi mobile deeplink [test|validate] <domain|scheme>"),
		);
		console.error("Example:  badi mobile deeplink test example.com");
		console.error("          badi mobile deeplink validate myapp://");
		process.exit(1);
	}

	showBanner();
	console.log(chalk.bold("Deep Link Validation"));
	console.log("");

	// If a scheme (myapp://)
	if (urlOrScheme.includes("://") && !urlOrScheme.startsWith("http")) {
		const schemeMatch = urlOrScheme.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\//);
		if (!schemeMatch) {
			console.error(chalk.red("Invalid URL scheme (RFC 3986 violation)"));
			console.log(
				chalk.dim("Scheme: [a-z][a-z0-9+.-]*  example: myapp, com-company-app"),
			);
			process.exit(1);
		}
		const scheme = schemeMatch[1];
		console.log(`Scheme: ${chalk.cyan(scheme)}`);
		console.log(`  ${chalk.green("OK")} RFC 3986 compliant`);
		console.log("");
		console.log(chalk.bold("iOS Info.plist:"));
		console.log(
			chalk.dim(`<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array><string>${scheme}</string></array>
  </dict>
</array>`),
		);
		console.log("");
		console.log(chalk.bold("Android AndroidManifest.xml:"));
		console.log(
			chalk.dim(`<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="${scheme}" />
</intent-filter>`),
		);
		console.log("");
		console.log(chalk.bold("Test commands:"));
		console.log(
			chalk.dim(`  iOS:     xcrun simctl openurl booted "${scheme}://test"`),
		);
		console.log(
			chalk.dim(
				`  Android: adb shell am start -a android.intent.action.VIEW -d "${scheme}://test"`,
			),
		);
		return;
	}

	// Universal Link / App Link validation
	const host = urlOrScheme.replace(/^https?:\/\//, "").replace(/\/.*/, "");
	console.log(`Domain: ${chalk.cyan(host)}`);
	console.log("");

	// iOS AASA
	console.log(chalk.bold("iOS — apple-app-site-association (AASA):"));
	const aasaUrls = [
		`https://${host}/.well-known/apple-app-site-association`,
		`https://${host}/apple-app-site-association`,
	];
	let aasaFound = false;
	for (const url of aasaUrls) {
		try {
			const data = await fetchJsonWithTimeout(url, {
				timeoutMs: 8000,
				userAgent: "Badi-Mobile/1.11 (+https://github.com/fatihkan/badi)",
			});
			console.log(`  ${chalk.green("OK")} ${url}`);
			if (data.applinks?.details) {
				for (const d of data.applinks.details) {
					const appID = d.appID || d.appIDs?.[0] || "?";
					console.log(`       appID: ${chalk.cyan(appID)}`);
					const paths = d.paths || d.components || [];
					console.log(
						`       paths: ${chalk.dim(JSON.stringify(paths).substring(0, 60))}`,
					);
				}
			} else {
				console.log(`  ${chalk.yellow("!!")} applinks.details missing`);
			}
			aasaFound = true;
			break;
		} catch (_e) {
			/* try the other one */
		}
	}
	if (!aasaFound) {
		console.log(`  ${chalk.red("XX")} AASA file not found (${aasaUrls[0]})`);
		console.log(
			chalk.dim(
				`       Content-Type: application/json, HTTPS required, no redirect`,
			),
		);
	}

	// Android assetlinks
	console.log("");
	console.log(chalk.bold("Android — assetlinks.json:"));
	const alUrl = `https://${host}/.well-known/assetlinks.json`;
	try {
		const data = await fetchJsonWithTimeout(alUrl, {
			timeoutMs: 8000,
			userAgent: "Badi-Mobile/1.11 (+https://github.com/fatihkan/badi)",
		});
		if (Array.isArray(data) && data.length > 0) {
			console.log(`  ${chalk.green("OK")} ${alUrl}`);
			for (const entry of data) {
				const pkg = entry.target?.package_name || "?";
				const fp = entry.target?.sha256_cert_fingerprints?.[0] || "?";
				console.log(`       package: ${chalk.cyan(pkg)}`);
				console.log(
					`       SHA256 prefix: ${chalk.dim(`${(fp || "").substring(0, 20)}...`)}`,
				);
			}
		} else {
			console.log(`  ${chalk.yellow("!!")} Empty or invalid assetlinks`);
		}
	} catch (_e) {
		console.log(`  ${chalk.red("XX")} ${alUrl} not found`);
		console.log(
			chalk.dim(`       Content-Type: application/json, HTTPS required`),
		);
	}

	// Validation tool suggestions
	console.log("");
	console.log(chalk.bold("External Validators:"));
	console.log(
		chalk.dim(`  iOS:     search.apple.com/open-link?url=https://${host}/test`),
	);
	console.log(
		chalk.dim(
			`  Android: developers.google.com/digital-asset-links/tools/generator`,
		),
	);
	console.log(chalk.dim(`  Branch:  branch.io/resources/aasa-validator`));
}

// ─── mobile ota ───

function mobileOta(args) {
	const provider = args[0] || "codepush";
	const valid = ["codepush", "expo"];
	if (!valid.includes(provider)) {
		console.error(
			chalk.red(`Invalid OTA provider: ${provider} (${valid.join("|")})`),
		);
		process.exit(1);
	}

	showBanner();
	console.log(chalk.bold(`OTA Update Setup: ${provider}`));
	console.log("");

	if (provider === "codepush") {
		console.log(chalk.bold("1. Install App Center CLI:"));
		console.log(chalk.dim("  npm install -g appcenter-cli"));
		console.log(chalk.dim("  appcenter login"));
		console.log("");
		console.log(chalk.bold("2. React Native package:"));
		console.log(chalk.dim("  npm install react-native-code-push"));
		console.log("");
		console.log(chalk.bold("3. Create apps:"));
		console.log(
			chalk.dim("  appcenter apps create -d MyApp-iOS -o iOS -p React-Native"),
		);
		console.log(
			chalk.dim(
				"  appcenter apps create -d MyApp-Android -o Android -p React-Native",
			),
		);
		console.log("");
		console.log(chalk.bold("4. Get deployment keys:"));
		console.log(
			chalk.dim("  appcenter codepush deployment list -a ORG/MyApp-iOS -k"),
		);
		console.log("");
		console.log(chalk.bold("5. App.tsx:"));
		console.log(
			chalk.dim(`import codePush from "react-native-code-push";

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.ON_NEXT_RESTART,
};

export default codePush(codePushOptions)(App);`),
		);
		console.log("");
		console.log(chalk.bold("6. iOS config (Info.plist):"));
		console.log(
			chalk.dim(`<key>CodePushDeploymentKey</key>
<string>YOUR_IOS_KEY</string>`),
		);
		console.log("");
		console.log(chalk.bold("7. Android config (strings.xml):"));
		console.log(
			chalk.dim(
				`<string moduleConfig="true" name="CodePushDeploymentKey">YOUR_ANDROID_KEY</string>`,
			),
		);
		console.log("");
		console.log(chalk.bold("8. Release commands:"));
		console.log(
			chalk.dim(
				"  appcenter codepush release-react -a ORG/MyApp-iOS -d Staging",
			),
		);
		console.log(
			chalk.dim(
				"  appcenter codepush promote -a ORG/MyApp-iOS -s Staging -d Production",
			),
		);
		console.log("");
		console.log(
			chalk.yellow(
				"Warning: App Center CodePush retire date: March 2025. For new projects consider EAS Update.",
			),
		);
	} else {
		// expo / eas
		console.log(chalk.bold("1. Install EAS CLI:"));
		console.log(chalk.dim("  npm install -g eas-cli"));
		console.log(chalk.dim("  eas login"));
		console.log("");
		console.log(chalk.bold("2. Expo packages:"));
		console.log(chalk.dim("  npx expo install expo-updates"));
		console.log("");
		console.log(chalk.bold("3. Create eas.json:"));
		console.log(chalk.dim("  eas build:configure"));
		console.log("");
		console.log(chalk.bold("4. Update channel:"));
		console.log(
			chalk.dim(`{
  "build": {
    "preview": { "channel": "preview", "distribution": "internal" },
    "production": { "channel": "production" }
  }
}`),
		);
		console.log("");
		console.log(chalk.bold("5. Publish an update:"));
		console.log(
			chalk.dim('  eas update --branch production --message "v1.0.1 fix"'),
		);
		console.log("");
		console.log(chalk.bold("6. App.tsx (runtime check):"));
		console.log(
			chalk.dim(`import * as Updates from "expo-updates";

useEffect(() => {
  async function check() {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  }
  check();
}, []);`),
		);
		console.log("");
		console.log(chalk.bold("7. Rollback:"));
		console.log(
			chalk.dim(
				"  eas update --branch production --republish-update <update-id>",
			),
		);
	}

	console.log("");
	console.log(chalk.bold("Best Practices:"));
	console.log("  - Native code change = new binary (not OTA)");
	console.log("  - JS-only change = suitable for OTA");
	console.log("  - Use the Staging -> Production promotion flow");
	console.log("  - Percentage rollout: 5% -> 25% -> 100%");
}

// ─── Main Command ───

export async function runMobile(args) {
	const sub = args[0];

	if (!sub || sub === "--help" || sub === "-h") {
		showBanner();
		console.log(chalk.bold("Mobile Development:"));
		console.log("");
		console.log(chalk.bold.cyan("Project:"));
		console.log(
			`  ${chalk.cyan("badi mobile init")} [name] --framework [rn|flutter|expo|swift|kotlin]`,
		);
		console.log(
			`  ${chalk.cyan("badi mobile version bump")} [major|minor|patch]   iOS/Android sync`,
		);
		console.log("");
		console.log(chalk.bold.cyan("Build + Release:"));
		console.log(
			`  ${chalk.cyan("badi mobile build")} [ios|android]                  Release build`,
		);
		console.log(
			`  ${chalk.cyan("badi mobile release")} [testflight|play-internal|appstore|play]`,
		);
		console.log("");
		console.log(chalk.bold.cyan("Asset Generation:"));
		console.log(
			`  ${chalk.cyan("badi mobile assets icon")} [source.png]            Icon guide`,
		);
		console.log(
			`  ${chalk.cyan("badi mobile assets splash")}                        Splash guide`,
		);
		console.log(
			`  ${chalk.cyan("badi mobile assets screenshots")}                   Screenshot guide + skill`,
		);
		console.log("");
		console.log(chalk.bold.cyan("Operations (v1.11+):"));
		console.log(
			`  ${chalk.cyan("badi mobile crash-setup")} [fw] [provider]          Sentry/Crashlytics scaffold`,
		);
		console.log(
			`  ${chalk.cyan("badi mobile deeplink")} [domain|scheme://]          Universal link + AASA/assetlinks`,
		);
		console.log(
			`  ${chalk.cyan("badi mobile ota")} [codepush|expo]                  OTA update setup`,
		);
		console.log("");
		console.log(
			chalk.dim(
				"  Tip: the app-store-screenshots skill is installed alongside Badi.",
			),
		);
		console.log(
			chalk.dim(
				'  It triggers automatically when you tell Claude Code "create App Store screenshots".',
			),
		);
		console.log("");
		console.log(chalk.bold("Examples:"));
		console.log("  badi mobile init MyApp --framework react-native");
		console.log("  badi mobile version bump minor");
		console.log("  badi mobile build android");
		console.log("  badi mobile release testflight");
		console.log("  badi mobile assets icon ./logo-1024.png");
		console.log("  badi mobile crash-setup react-native sentry");
		console.log("  badi mobile deeplink example.com");
		console.log("  badi mobile ota expo");
		return;
	}

	switch (sub) {
		case "init":
			mobileInit(args.slice(1));
			break;
		case "version":
			if (args[1] === "bump") mobileVersion(args.slice(2));
			else {
				console.error(
					chalk.red("Usage: badi mobile version bump [major|minor|patch]"),
				);
				process.exit(1);
			}
			break;
		case "build":
			mobileBuild(args.slice(1));
			break;
		case "release":
			mobileRelease(args.slice(1));
			break;
		case "assets":
			mobileAssets(args.slice(1));
			break;
		case "crash-setup":
			mobileCrashSetup(args.slice(1));
			break;
		case "deeplink":
			await mobileDeeplink(args.slice(1));
			break;
		case "ota":
			mobileOta(args.slice(1));
			break;
		default:
			console.error(chalk.red(`Unknown mobile command: ${sub}`));
			console.log("Usage: badi mobile [init|version|build|release|assets]");
			process.exit(1);
	}
}
