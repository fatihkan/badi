import { existsSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { chalk, showBanner } from "../../cli.js";
import {
	getDateString,
	getIcerikWorkspace,
	parseLanguageFlag,
} from "../../icerik-helpers.js";

export function runReleaseNotes(args) {
	const rnArgs = args.slice(1);
	let platform = "ios";
	let version = "1.0.0";
	const { languages } = parseLanguageFlag(rnArgs);

	for (let i = 0; i < rnArgs.length; i++) {
		if (rnArgs[i] === "--platform") platform = rnArgs[++i] || "ios";
		else if (rnArgs[i] === "--version") version = rnArgs[++i] || "1.0.0";
	}

	if (!["ios", "android"].includes(platform)) {
		console.error(chalk.red(`Gecersiz platform: ${platform} (ios|android)`));
		process.exit(1);
	}

	const limit = platform === "ios" ? 4000 : 500;
	const workspaceBase = getIcerikWorkspace("icerikler");
	const createdFiles = [];

	for (const lang of languages) {
		const langSuffix = lang === "en" ? "-en" : "-tr";
		const fileName = `${getDateString()}-release-notes-v${version}-${platform}${langSuffix}.md`;
		const filePath = join(workspaceBase, fileName);

		if (existsSync(filePath)) {
			console.log(chalk.yellow(`Atlaniyor (mevcut): ${fileName}`));
			continue;
		}

		const isTR = lang === "tr";
		const header =
			platform === "ios"
				? isTR
					? `# v${version} — Release Notes (App Store)\n\n**Platform**: iOS  |  **Limit**: ${limit} karakter  |  **Dil**: TR\n`
					: `# v${version} — Release Notes (App Store)\n\n**Platform**: iOS  |  **Limit**: ${limit} chars  |  **Language**: EN\n`
				: isTR
					? `# v${version} — Release Notes (Play Store)\n\n**Platform**: Android  |  **Limit**: ${limit} karakter  |  **Dil**: TR\n`
					: `# v${version} — Release Notes (Play Store)\n\n**Platform**: Android  |  **Limit**: ${limit} chars  |  **Language**: EN\n`;

		const body = isTR
			? `\n## Yeni Ozellikler\n- [Yeni ozellik 1 — kullanici faydasi]\n- [Yeni ozellik 2]\n- [Yeni ozellik 3]\n\n## Iyilestirmeler\n- [Performans iyilestirmesi]\n- [UI iyilestirmesi]\n\n## Hata Duzeltmeleri\n- [Giderilen hata]\n\n## Tesekkurler\nGeri bildirimleriniz icin tesekkurler! Her guncellemede gelisiyoruz.\n`
			: `\n## What's New\n- [Feature 1 — user benefit]\n- [Feature 2]\n- [Feature 3]\n\n## Improvements\n- [Performance improvement]\n- [UI polish]\n\n## Bug Fixes\n- [Fixed issue]\n\n## Thanks\nThanks for your feedback! We keep improving with every update.\n`;

		const footer = `\n---\n\n**Karakter Sayisi Uyarisi**: Bu sablonu doldurduktan sonra icerigin uzunlugu **${limit} karakteri** gecmemelidir.\n\n${platform === "ios" ? "App Store Connect → Version Information → What's New" : "Play Console → Release → What's new"} alanina yapistirin.\n`;

		writeFileSync(filePath, header + body + footer);
		createdFiles.push(filePath);
	}

	if (createdFiles.length === 0) {
		console.log(chalk.dim("Olusturulacak dosya yok."));
		process.exit(1);
	}

	showBanner();
	console.log(chalk.bold.green(`Release notes sablonu olusturuldu!`));
	console.log(`Platform: ${chalk.cyan(platform)}`);
	console.log(`Version:  ${chalk.cyan(version)}`);
	console.log(`Limit:    ${chalk.cyan(`${limit} karakter`)}`);
	console.log(`Diller:   ${chalk.cyan(languages.join(", "))}`);
	for (const f of createdFiles) {
		console.log(`  Dosya: ${chalk.cyan(relative(process.cwd(), f))}`);
	}
}
