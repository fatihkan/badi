import { chalk, showBanner } from "../../cli.js";

// ─── mobile crash-setup ───

export function mobileCrashSetup(args) {
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
