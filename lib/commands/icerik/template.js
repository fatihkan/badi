import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { chalk, showBanner } from "../../cli.js";
import {
	checkDuplicates,
	getDateString,
	getIcerikWorkspace,
	mergeTemplateContent,
	parseLanguageFlag,
	resolveTemplate,
	slugify,
} from "../../icerik-helpers.js";
import { loadTemplates } from "./_shared.js";

export const TEMPLATE_TYPES = [
	"post",
	"karousel",
	"video",
	"gorsel",
	"takvim",
	"marka",
	"newsletter",
	"podcast",
	"thread",
	"case-study",
];

export async function runTemplate(args) {
	const subcommand = args[0];

	// English-only: parseLanguageFlag --lang'i argv'den siyirir (no-op).
	const { remaining: langRemaining } = parseLanguageFlag(args.slice(1));
	let sablonFlag = null;
	let forceFlag = false;
	let platformFlag = null;
	const konuParts = [];
	for (let i = 0; i < langRemaining.length; i++) {
		if (langRemaining[i] === "--sablon") {
			sablonFlag = langRemaining[++i];
		} else if (langRemaining[i] === "--force") {
			forceFlag = true;
		} else if (langRemaining[i] === "--platform") {
			platformFlag = langRemaining[++i];
		} else if (!langRemaining[i].startsWith("--")) {
			konuParts.push(langRemaining[i]);
		}
	}
	const konu = konuParts.join(" ") || "new-content";
	const dateStr = getDateString();
	const konuSlug = slugify(konu);

	if (!forceFlag) {
		const wsBase = join(process.cwd(), ".claude", "workspace");
		const similar = checkDuplicates(konu, wsBase);
		if (similar.length > 0) {
			console.log(chalk.yellow("WARNING: Similar content detected!"));
			for (const s of similar) {
				console.log(
					`  ${chalk.yellow("~")} ${s.dir}/${s.file} ${chalk.dim(`(${s.similarity}% similar)`)}`,
				);
			}
			console.log("");
			console.log(chalk.dim("Use --force to continue."));
			process.exit(2);
		}
	}

	const tmplSet = (await loadTemplates())();

	if (subcommand === "marka") {
		const workspaceBase = join(process.cwd(), ".claude", "workspace");
		if (!existsSync(workspaceBase))
			mkdirSync(workspaceBase, { recursive: true });

		const markaPath = join(workspaceBase, "marka-sesi.md");
		if (existsSync(markaPath)) {
			console.error(chalk.yellow("marka-sesi.md already exists."));
			process.exit(1);
		}
		writeFileSync(markaPath, tmplSet.marka());

		showBanner();
		console.log(chalk.bold.green("Brand voice guide created!"));
		console.log(`  File: ${chalk.cyan(relative(process.cwd(), markaPath))}`);
		return;
	}

	let subdir;
	let fileName;
	let content;

	switch (subcommand) {
		case "post":
			subdir = "icerikler";
			fileName = `${dateStr}-${konuSlug}.md`;
			content = tmplSet.post(konu);
			break;
		case "karousel":
			subdir = "icerikler";
			fileName = `${dateStr}-karousel-${konuSlug}.md`;
			content = tmplSet.karousel(konu);
			break;
		case "video":
			subdir = "senaryolar";
			fileName = `${dateStr}-${konuSlug}.md`;
			content = tmplSet.video(konu);
			break;
		case "gorsel":
			subdir = "gorseller";
			fileName = `${dateStr}-${konuSlug}-brief.md`;
			content = tmplSet.gorsel(konu);
			break;
		case "takvim":
			subdir = "takvim";
			fileName = `${dateStr}-takvim-${konuSlug}.md`;
			content = tmplSet.takvim(konu);
			break;
		case "newsletter":
			subdir = "bultenler";
			fileName = `${dateStr}-newsletter-${konuSlug}.md`;
			content = tmplSet.newsletter(konu);
			break;
		case "podcast":
			subdir = "podcastler";
			fileName = `${dateStr}-podcast-${konuSlug}.md`;
			content = tmplSet.podcast(konu);
			break;
		case "thread":
			subdir = "icerikler";
			fileName = `${dateStr}-thread-${konuSlug}.md`;
			content = tmplSet.thread(konu);
			break;
		case "case-study":
			subdir = "case-study";
			fileName = `${dateStr}-casestudy-${konuSlug}.md`;
			content = tmplSet.caseStudy(konu);
			break;
		default:
			throw new Error(
				`runTemplate: Unhandled template type: ${subcommand}. ` +
					`TEMPLATE_TYPES diverj etti — switch ile esitle.`,
			);
	}

	if (sablonFlag) {
		const customTmpl = resolveTemplate(sablonFlag);
		if (customTmpl) {
			content = mergeTemplateContent(content, customTmpl.body);
		}
	}

	const targetDir = getIcerikWorkspace(subdir);
	const targetPath = join(targetDir, fileName);

	if (existsSync(targetPath)) {
		console.error(
			chalk.yellow(
				`File already exists: ${relative(process.cwd(), targetPath)}`,
			),
		);
		process.exit(1);
	}

	if (platformFlag === "appstore") {
		content += `\n\n## Platform: App Store\n\n**CTA**: Download on the App Store\n**URL**: https://apps.apple.com/app/id[APP_ID]\n**Badge**: https://developer.apple.com/app-store/marketing/guidelines/#downloadOnAppstore\n**Hashtag**: #iOS #AppStore #iPhoneApp\n`;
	} else if (platformFlag === "playstore") {
		content += `\n\n## Platform: Google Play\n\n**CTA**: Get it on Google Play\n**URL**: https://play.google.com/store/apps/details?id=[PACKAGE_NAME]\n**Badge**: https://play.google.com/intl/en_us/badges/\n**Hashtag**: #Android #GooglePlay #AndroidApp\n`;
	} else if (platformFlag === "mobile") {
		content += `\n\n## Platform: Mobile (iOS + Android)\n\n**iOS**: https://apps.apple.com/app/id[APP_ID]\n**Android**: https://play.google.com/store/apps/details?id=[PACKAGE_NAME]\n**Hashtag**: #Mobile #App #iOS #Android\n`;
	}

	writeFileSync(targetPath, content);

	showBanner();
	console.log(
		chalk.bold.green(`${subcommand.toUpperCase()} template created!`),
	);
	console.log(`Topic: ${chalk.cyan(konu)}`);
	if (sablonFlag) console.log(`Template: ${chalk.cyan(sablonFlag)}`);
	console.log(`  File: ${chalk.cyan(relative(process.cwd(), targetPath))}`);
	console.log("");
	console.log(chalk.bold("Next steps:"));
	console.log("  1. Open the file and fill the placeholders");
	console.log(
		"  2. Check the brand voice guide: .claude/workspace/marka-sesi.md",
	);
	console.log(
		`  3. For the full interactive flow, use ${chalk.cyan(`/${subcommand === "post" ? "icerik-uret" : subcommand === "video" ? "video-senaryo" : subcommand === "gorsel" ? "gorsel-brief" : subcommand === "takvim" ? "icerik-takvimi" : subcommand === "karousel" ? "karousel" : "icerik-uret"}`)} in Claude Code`,
	);
}
