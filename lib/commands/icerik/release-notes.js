import { existsSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { chalk, showBanner } from "../../cli.js";
import { getDateString, getIcerikWorkspace } from "../../icerik-helpers.js";

export function runReleaseNotes(args) {
	const rnArgs = args.slice(1);
	let platform = "ios";
	let version = "1.0.0";

	for (let i = 0; i < rnArgs.length; i++) {
		if (rnArgs[i] === "--platform") platform = rnArgs[++i] || "ios";
		else if (rnArgs[i] === "--version") version = rnArgs[++i] || "1.0.0";
	}

	if (!["ios", "android"].includes(platform)) {
		console.error(chalk.red(`Invalid platform: ${platform} (ios|android)`));
		process.exit(1);
	}

	const limit = platform === "ios" ? 4000 : 500;
	const workspaceBase = getIcerikWorkspace("icerikler");
	const fileName = `${getDateString()}-release-notes-v${version}-${platform}.md`;
	const filePath = join(workspaceBase, fileName);

	if (existsSync(filePath)) {
		console.log(chalk.yellow(`Skipping (exists): ${fileName}`));
		process.exit(1);
	}

	const store = platform === "ios" ? "App Store" : "Play Store";
	const osName = platform === "ios" ? "iOS" : "Android";
	const header = `# v${version} — Release Notes (${store})\n\n**Platform**: ${osName}  |  **Limit**: ${limit} chars  |  **Language**: EN\n`;
	const body = `\n## What's New\n- [Feature 1 — user benefit]\n- [Feature 2]\n- [Feature 3]\n\n## Improvements\n- [Performance improvement]\n- [UI polish]\n\n## Bug Fixes\n- [Fixed issue]\n\n## Thanks\nThanks for your feedback! We keep improving with every update.\n`;
	const footer = `\n---\n\n**Character limit**: after filling this template, keep the content under **${limit} characters**.\n\nPaste into ${platform === "ios" ? "App Store Connect → Version Information → What's New" : "Play Console → Release → What's new"}.\n`;

	writeFileSync(filePath, header + body + footer);

	showBanner();
	console.log(chalk.bold.green("Release notes template created!"));
	console.log(`Platform: ${chalk.cyan(platform)}`);
	console.log(`Version:  ${chalk.cyan(version)}`);
	console.log(`Limit:    ${chalk.cyan(`${limit} chars`)}`);
	console.log(`  File: ${chalk.cyan(relative(process.cwd(), filePath))}`);
}
