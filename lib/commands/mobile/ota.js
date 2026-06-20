import { chalk, showBanner } from "../../cli.js";

// ─── mobile ota ───

export function mobileOta(args) {
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
