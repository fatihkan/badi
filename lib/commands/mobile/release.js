import { chalk, showBanner } from "../../cli.js";

// ─── mobile release (guide) ───

export function mobileRelease(args) {
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
