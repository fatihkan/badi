import { existsSync } from "node:fs";
import { chalk, showBanner } from "../../cli.js";
import { hasCommand } from "../../helpers.js";

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

export function mobileAssets(args) {
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
