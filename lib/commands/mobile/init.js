import { execFileSync } from "node:child_process";
import { chalk, showBanner } from "../../cli.js";
import { hasCommand } from "../../helpers.js";

// ─── mobile init ───

export const FRAMEWORKS = {
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

export function mobileInit(args) {
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
