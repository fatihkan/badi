import { existsSync, readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { chalk, showBanner } from "../cli.js";

// ─── Yardimcilar ───

function hasCommand(cmd) {
	try {
		execFileSync("which", [cmd], { stdio: "pipe" });
		return true;
	} catch { return false; }
}

function readJson(path) {
	try { return JSON.parse(readFileSync(path, "utf-8")); } catch { return null; }
}

// ─── mobile init ───

const FRAMEWORKS = {
	"react-native": {
		cli: "npx",
		args: (name) => ["react-native@latest", "init", name],
		check: () => hasCommand("npx"),
		installHint: "Node.js 18+ kurulu olmali",
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
		installHint: "Node.js 18+ kurulu olmali",
	},
	swift: {
		cli: null,
		args: null,
		check: () => hasCommand("xcodebuild"),
		installHint: "Xcode App Store'dan indirin (macOS)",
	},
	kotlin: {
		cli: null,
		args: null,
		check: () => hasCommand("gradle"),
		installHint: "Android Studio indirin: developer.android.com/studio",
	},
};

function mobileInit(args) {
	const name = args[0];
	let framework = "react-native";

	if (!name || name.startsWith("--")) {
		console.error(chalk.red("Proje adi belirtin: badi mobile init [proje-adi] --framework [rn|flutter|expo]"));
		process.exit(1);
	}

	for (let i = 1; i < args.length; i++) {
		if (args[i] === "--framework") framework = args[++i];
	}

	const fw = FRAMEWORKS[framework];
	if (!fw) {
		console.error(chalk.red(`Gecersiz framework: ${framework}`));
		console.log(`Gecerli: ${Object.keys(FRAMEWORKS).join(", ")}`);
		process.exit(1);
	}

	if (!fw.check()) {
		console.error(chalk.red(`${framework} icin gerekli arac bulunamadi.`));
		console.log(chalk.dim(`Kurulum: ${fw.installHint}`));
		process.exit(1);
	}

	if (!fw.cli) {
		showBanner();
		console.log(chalk.bold(`${framework} projesi icin:`));
		console.log("");
		if (framework === "swift") {
			console.log("  Xcode -> File -> New -> Project -> App");
			console.log("  Language: Swift, Interface: SwiftUI/Storyboard");
		} else if (framework === "kotlin") {
			console.log("  Android Studio -> New Project -> Empty Activity");
			console.log("  Language: Kotlin");
		}
		console.log("");
		console.log(chalk.bold("Proje olusturduktan sonra:"));
		console.log(`  cd ${name}`);
		console.log("  npx @fatihkan/badi init");
		return;
	}

	showBanner();
	console.log(chalk.bold(`Mobil Proje Olusturuluyor: ${name}`));
	console.log(`  Framework: ${chalk.cyan(framework)}`);
	console.log(`  Komut:     ${chalk.dim(fw.cli + " " + fw.args(name).join(" "))}`);
	console.log("");

	try {
		execFileSync(fw.cli, fw.args(name), { stdio: "inherit" });
		console.log("");
		console.log(chalk.bold.green(`${framework} projesi olusturuldu: ${name}`));
		console.log("");
		console.log(chalk.bold("Sonraki adimlar:"));
		console.log(`  cd ${name}`);
		console.log("  npx @fatihkan/badi init   # Badi konfigurasyonu");
		console.log("  badi mobile assets icon ./icon.png");
	} catch (e) {
		console.error(chalk.red(`Framework CLI hatasi: ${e.message}`));
		process.exit(1);
	}
}

// ─── mobile version bump ───

function findIosPlist() {
	// iOS projelerinde Info.plist konumunu bul
	const candidates = [
		"ios/Info.plist",
		"ios/RunnerInfo.plist",
	];
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
		console.error(chalk.red("Kullanim: badi mobile version bump [major|minor|patch]"));
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
			writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
			updates.push(["package.json", pkg.version, newVersion]);
		}
	}

	// iOS Info.plist
	const plistPath = findIosPlist();
	if (plistPath) {
		const content = readFileSync(plistPath, "utf-8");
		const match = content.match(/<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/);
		if (match) {
			const oldVersion = match[1];
			const newVersion = bumpVersion(oldVersion, bumpType);
			const updated = content.replace(match[0], match[0].replace(oldVersion, newVersion));
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
			const updated = content.replace(match[0], match[0].replace(oldVersion, newVersion));
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
			const updated = content.replace(match[0], `version: ${newVersion}${match[2] || ""}`);
			writeFileSync("pubspec.yaml", updated);
			updates.push(["pubspec.yaml", oldVersion, newVersion]);
		}
	}

	if (updates.length === 0) {
		console.log(chalk.yellow("Hicbir version dosyasi bulunamadi."));
		console.log(chalk.dim("package.json, Info.plist, build.gradle veya pubspec.yaml olmali."));
		process.exit(1);
	}

	console.log(chalk.bold("Guncellenen Dosyalar:"));
	for (const [file, oldV, newV] of updates) {
		console.log(`  ${chalk.green(file.padEnd(40))} ${chalk.dim(oldV)} -> ${chalk.bold.green(newV)}`);
	}
	console.log("");
	console.log(chalk.bold.green("Version bump tamamlandi!"));
}

// ─── mobile build ───

function mobileBuild(args) {
	const platform = args[0];
	if (!platform || !["ios", "android"].includes(platform)) {
		console.error(chalk.red("Kullanim: badi mobile build [ios|android]"));
		process.exit(1);
	}

	showBanner();
	console.log(chalk.bold(`Build: ${platform}`));
	console.log("");

	if (platform === "ios") {
		if (!hasCommand("xcodebuild")) {
			console.error(chalk.red("Xcode bulunamadi. macOS + Xcode gerekli."));
			process.exit(1);
		}
		// React Native projesi tespit
		if (existsSync("ios") && existsSync("package.json")) {
			console.log(chalk.dim("React Native iOS build..."));
			try {
				execFileSync("npx", ["react-native", "run-ios", "--mode", "Release"], { stdio: "inherit" });
			} catch (e) {
				console.error(chalk.red(`Build hatasi: ${e.message}`));
				process.exit(1);
			}
		} else if (existsSync("ios") && existsSync("pubspec.yaml")) {
			try {
				execFileSync("flutter", ["build", "ios", "--release"], { stdio: "inherit" });
			} catch (e) {
				console.error(chalk.red(`Build hatasi: ${e.message}`));
				process.exit(1);
			}
		} else {
			console.log(chalk.yellow("Proje turu tespit edilemedi. Xcode'dan manuel build yapin."));
			console.log(chalk.dim("  xcodebuild -scheme YourScheme -configuration Release"));
		}
	} else {
		// android
		if (existsSync("android") && existsSync("package.json")) {
			console.log(chalk.dim("React Native Android build..."));
			try {
				const gradlew = existsSync("android/gradlew") ? "./gradlew" : "gradle";
				execFileSync(gradlew, ["assembleRelease"], { cwd: "android", stdio: "inherit" });
			} catch (e) {
				console.error(chalk.red(`Build hatasi: ${e.message}`));
				process.exit(1);
			}
		} else if (existsSync("android") && existsSync("pubspec.yaml")) {
			try {
				execFileSync("flutter", ["build", "apk", "--release"], { stdio: "inherit" });
			} catch (e) {
				console.error(chalk.red(`Build hatasi: ${e.message}`));
				process.exit(1);
			}
		} else {
			console.log(chalk.yellow("Proje turu tespit edilemedi."));
		}
	}
}

// ─── mobile release (rehber) ───

function mobileRelease(args) {
	const target = args[0];
	const validTargets = ["testflight", "play-internal", "appstore", "play"];
	if (!target || !validTargets.includes(target)) {
		console.error(chalk.red(`Kullanim: badi mobile release [${validTargets.join("|")}]`));
		process.exit(1);
	}

	showBanner();
	console.log(chalk.bold(`Release Rehberi: ${target}`));
	console.log("");

	const guides = {
		testflight: [
			"1. Xcode: Product -> Archive",
			"2. Organizer -> Distribute App -> App Store Connect",
			"3. Bekleyin (processing ~30 min)",
			"4. TestFlight -> Internal/External testers ekleyin",
			"",
			"Fastlane ile:",
			"  fastlane ios beta",
			"",
			"Komut satirindan:",
			"  xcodebuild -scheme X archive -archivePath build.xcarchive",
			"  xcodebuild -exportArchive -archivePath build.xcarchive -exportPath build/",
			"  xcrun altool --upload-app -f build/X.ipa -u APPLE_ID -p APP_PASSWORD",
		],
		"play-internal": [
			"1. Play Console -> Testing -> Internal testing",
			"2. Create new release -> Upload AAB (android/app/build/outputs/bundle/release/app-release.aab)",
			"3. Review + Rollout",
			"",
			"Fastlane ile:",
			"  fastlane android beta",
			"",
			"bundletool ile:",
			"  bundletool build-apks --bundle=app.aab --output=app.apks",
		],
		appstore: [
			"1. Once TestFlight'ta test edin",
			"2. App Store Connect -> App Store -> + Version",
			"3. What's New, Screenshots, Description guncelleyin",
			"4. Build sec -> Submit for Review",
			"5. Inceleme 1-3 gun surer",
			"",
			"Ipucu: badi icerik release-notes --platform ios --version X.Y.Z",
		],
		play: [
			"1. Play Console -> Production",
			"2. Create new release -> Upload AAB",
			"3. Release notes (500 char limit)",
			"4. Rollout percentage (1% -> 10% -> 50% -> 100%)",
			"",
			"Ipucu: badi icerik release-notes --platform android --version X.Y.Z",
		],
	};

	const guide = guides[target];
	for (const line of guide) {
		if (line.startsWith("Fastlane") || line.startsWith("Komut") || line.startsWith("bundletool") || line.startsWith("Ipucu")) {
			console.log(chalk.cyan(line));
		} else if (line.trim().startsWith("//") || line.trim().startsWith("#") || line === "") {
			console.log(line);
		} else {
			console.log(`  ${line}`);
		}
	}
	console.log("");
	console.log(chalk.dim("Otomatik release icin fastlane veya eas submit kullanin (v2.0 roadmap)."));
}

// ─── mobile assets ───

function mobileAssetsIcon(source) {
	showBanner();
	console.log(chalk.bold("Icon Uretim Rehberi"));
	console.log("");

	if (source && !existsSync(source)) {
		console.error(chalk.red(`Kaynak bulunamadi: ${source}`));
		process.exit(1);
	}

	const iosSizes = [
		[20, "Notification"], [29, "Settings"], [40, "Spotlight"], [58, "Settings @2x"], [60, "Notification @3x"],
		[76, "iPad App"], [80, "Spotlight @2x"], [87, "Settings @3x"], [120, "iPhone App @2x"],
		[152, "iPad App @2x"], [167, "iPad Pro"], [180, "iPhone App @3x"], [1024, "App Store"],
	];
	const androidSizes = [
		[48, "mdpi"], [72, "hdpi"], [96, "xhdpi"], [144, "xxhdpi"], [192, "xxxhdpi"], [512, "Play Store"],
	];

	console.log(chalk.bold("iOS Boyutlari:"));
	for (const [size, label] of iosSizes) {
		console.log(`  ${chalk.cyan(`${size}x${size}`.padEnd(12))} ${label}`);
	}
	console.log("");
	console.log(chalk.bold("Android Boyutlari:"));
	for (const [size, label] of androidSizes) {
		console.log(`  ${chalk.cyan(`${size}x${size}`.padEnd(12))} ${label}`);
	}

	console.log("");
	if (source) {
		console.log(chalk.bold("Otomatik Uretim:"));
		if (hasCommand("magick") || hasCommand("convert")) {
			const cmd = hasCommand("magick") ? "magick" : "convert";
			console.log(chalk.cyan("ImageMagick bulundu. Ornek komutlar:"));
			for (const [size] of [...iosSizes, ...androidSizes]) {
				console.log(chalk.dim(`  ${cmd} ${source} -resize ${size}x${size} icon-${size}.png`));
			}
		} else {
			console.log(chalk.yellow("ImageMagick bulunamadi (brew install imagemagick)."));
			console.log(chalk.dim("Alternatif: sharp-cli paketi veya https://appicon.co"));
		}
	} else {
		console.log(chalk.dim("Kullanim: badi mobile assets icon [source.png]"));
	}

	console.log("");
	console.log(chalk.bold("Ipuclari:"));
	console.log("  - 1024x1024 kaynaktan baslayin (en yuksek cozunurluk)");
	console.log("  - PNG, seffaflik yok (iOS), seffaflik var (Android adaptive)");
	console.log("  - iOS: kose yumusatma Apple tarafindan otomatik");
	console.log("  - Android: adaptive icon (foreground + background)");
}

function mobileAssetsSplash() {
	showBanner();
	console.log(chalk.bold("Splash Screen Rehberi"));
	console.log("");

	console.log(chalk.bold("iOS LaunchScreen:"));
	console.log(`  ${chalk.cyan("LaunchScreen.storyboard")}  Xcode ile duzenleyin (responsive)`);
	console.log(`  ${chalk.cyan("1242 x 2688 px")}           Portrait @3x base`);
	console.log(`  ${chalk.cyan("Assets.xcassets")}          Image asset ile kullanin`);

	console.log("");
	console.log(chalk.bold("Android Splash:"));
	console.log(`  ${chalk.cyan("drawable/")}                Gecis gorseli`);
	console.log(`  ${chalk.cyan("1080 x 1920 px")}           Portrait xxxhdpi`);
	console.log(`  ${chalk.cyan("SplashTheme style")}        values/styles.xml`);

	console.log("");
	console.log(chalk.bold("Modern Yaklasim (Android 12+):"));
	console.log(chalk.dim("  SplashScreen API kullanin — maksimum 288x288 icon"));
	console.log(chalk.dim("  Tema: windowSplashScreenAnimatedIcon"));

	console.log("");
	console.log(chalk.bold("Best Practices:"));
	console.log("  - 2 saniyeden fazla tutmayin");
	console.log("  - Logo merkezde, mininmum animasyon");
	console.log("  - Brand rengi + logo yeterli");
	console.log("  - Dark mode varyasyonu ekleyin");
}

function mobileAssetsScreenshots() {
	showBanner();
	console.log(chalk.bold("Screenshot Rehberi"));
	console.log("");

	console.log(chalk.bold("iOS Zorunlu Boyutlar:"));
	console.log(`  ${chalk.cyan("6.7\" (iPhone 14 Pro Max)")}   1290 x 2796 px`);
	console.log(`  ${chalk.cyan("6.5\" (iPhone 11 Pro Max)")}   1242 x 2688 px`);
	console.log(`  ${chalk.cyan("5.5\" (iPhone 8 Plus)")}       1242 x 2208 px`);
	console.log(`  ${chalk.cyan("12.9\" iPad Pro (3rd gen+)")}  2048 x 2732 px`);

	console.log("");
	console.log(chalk.bold("Android Zorunlu Boyutlar:"));
	console.log(`  ${chalk.cyan("Phone")}              1080 x 1920 px (min 2-8 adet)`);
	console.log(`  ${chalk.cyan("Feature Graphic")}    1024 x 500 px (zorunlu)`);
	console.log(`  ${chalk.cyan("7\" Tablet")}         1200 x 1920 px`);
	console.log(`  ${chalk.cyan("10\" Tablet")}        1920 x 1200 px`);

	console.log("");
	console.log(chalk.bold("Tasarim Ilkesi:"));
	console.log("  1. Ilk screenshot en kritik — value proposition");
	console.log("  2. Her screenshot'ta max 5 kelime, >= 40pt");
	console.log("  3. Device frame ekleyin (profesyonel)");
	console.log("  4. Brand rengi + sade arka plan");
	console.log("  5. Hikaye akisi: problem -> cozum -> sonuc");

	console.log("");
	console.log(chalk.bold.green("Otomatik Uretim (app-store-screenshots skill):"));
	console.log(`  Badi ile birlikte ${chalk.cyan(".claude/skills/mobile/app-store-screenshots/")} kuruluyor.`);
	console.log("  Claude Code'da su sekilde tetikleyin:");
	console.log("");
	console.log(chalk.dim("  \"Habit tracker uygulamam icin 6 App Store screenshot olustur."));
	console.log(chalk.dim("   Temiz/minimal stil, sakin premium his, marka rengi #4F46E5.\""));
	console.log("");
	console.log("  Skill Next.js iskelesi kurar, slayt basina reklami tasarlar,");
	console.log("  Apple + Google zorunlu cozunurluklerinde PNG export eder.");
	console.log("");
	console.log(chalk.dim("Detayli brief icin: badi icerik gorsel \"app store screenshot\""));
}

function mobileAssets(args) {
	const sub = args[0];
	if (!sub) {
		showBanner();
		console.log(chalk.bold("Mobil Asset Komutlari:"));
		console.log(`  ${chalk.cyan("badi mobile assets icon")} [source]        40+ boyut icon rehberi`);
		console.log(`  ${chalk.cyan("badi mobile assets splash")}               Splash screen rehberi`);
		console.log(`  ${chalk.cyan("badi mobile assets screenshots")}          Screenshot boyut + tasarim rehberi`);
		return;
	}
	switch (sub) {
		case "icon": mobileAssetsIcon(args[1]); break;
		case "splash": mobileAssetsSplash(); break;
		case "screenshots": mobileAssetsScreenshots(); break;
		default:
			console.error(chalk.red(`Bilinmeyen assets komutu: ${sub}`));
			process.exit(1);
	}
}

// ─── Ana Komut ───

export async function runMobile(args) {
	const sub = args[0];

	if (!sub || sub === "--help" || sub === "-h") {
		showBanner();
		console.log(chalk.bold("Mobil Gelistirme:"));
		console.log("");
		console.log(chalk.bold.cyan("Proje:"));
		console.log(`  ${chalk.cyan("badi mobile init")} [name] --framework [rn|flutter|expo|swift|kotlin]`);
		console.log(`  ${chalk.cyan("badi mobile version bump")} [major|minor|patch]   iOS/Android sync`);
		console.log("");
		console.log(chalk.bold.cyan("Build + Release:"));
		console.log(`  ${chalk.cyan("badi mobile build")} [ios|android]                  Release build`);
		console.log(`  ${chalk.cyan("badi mobile release")} [testflight|play-internal|appstore|play]`);
		console.log("");
		console.log(chalk.bold.cyan("Asset Uretimi:"));
		console.log(`  ${chalk.cyan("badi mobile assets icon")} [source.png]            Icon rehberi`);
		console.log(`  ${chalk.cyan("badi mobile assets splash")}                        Splash rehberi`);
		console.log(`  ${chalk.cyan("badi mobile assets screenshots")}                   Screenshot rehberi + skill`);
		console.log("");
		console.log(chalk.dim("  Ipucu: app-store-screenshots skill'i Badi ile birlikte kurulur."));
		console.log(chalk.dim("  Claude Code'a \"App Store screenshot olustur\" dediginde otomatik tetiklenir."));
		console.log("");
		console.log(chalk.bold("Ornekler:"));
		console.log("  badi mobile init MyApp --framework react-native");
		console.log("  badi mobile version bump minor");
		console.log("  badi mobile build android");
		console.log("  badi mobile release testflight");
		console.log("  badi mobile assets icon ./logo-1024.png");
		return;
	}

	switch (sub) {
		case "init": mobileInit(args.slice(1)); break;
		case "version":
			if (args[1] === "bump") mobileVersion(args.slice(2));
			else { console.error(chalk.red("Kullanim: badi mobile version bump [major|minor|patch]")); process.exit(1); }
			break;
		case "build": mobileBuild(args.slice(1)); break;
		case "release": mobileRelease(args.slice(1)); break;
		case "assets": mobileAssets(args.slice(1)); break;
		default:
			console.error(chalk.red(`Bilinmeyen mobile komutu: ${sub}`));
			console.log("Kullanim: badi mobile [init|version|build|release|assets]");
			process.exit(1);
	}
}
