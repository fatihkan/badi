import { chalk } from "../../cli.js";
import { mobileAssets } from "./assets.js";
import { mobileBuild } from "./build.js";
import { mobileCrashSetup } from "./crash.js";
import { mobileDeeplink } from "./deeplink.js";
import { mobileHelp } from "./help.js";
import { mobileInit } from "./init.js";
import { mobileOta } from "./ota.js";
import { mobileRelease } from "./release.js";
import { mobileVersion } from "./version.js";

// ─── Main Command ───

export async function runMobile(args) {
	const sub = args[0];

	if (!sub || sub === "--help" || sub === "-h") {
		mobileHelp();
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
