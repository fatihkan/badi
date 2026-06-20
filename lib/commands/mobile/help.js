import { chalk, showBanner } from "../../cli.js";

export function mobileHelp() {
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
}
