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

	const { languages, remaining: langRemaining } = parseLanguageFlag(
		args.slice(1),
	);
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
	const konu = konuParts.join(" ") || "yeni-icerik";
	const dateStr = getDateString();
	const konuSlug = slugify(konu);

	if (!forceFlag) {
		const wsBase = join(process.cwd(), ".claude", "workspace");
		const similar = checkDuplicates(konu, wsBase);
		if (similar.length > 0) {
			console.log(chalk.yellow("UYARI: Benzer icerik tespit edildi!"));
			for (const s of similar) {
				console.log(
					`  ${chalk.yellow("~")} ${s.dir}/${s.file} ${chalk.dim(`(%${s.similarity} benzerlik)`)}`,
				);
			}
			console.log("");
			console.log(chalk.dim("Devam etmek icin --force kullanin."));
			process.exit(2);
		}
	}

	if (subcommand === "marka") {
		const workspaceBase = join(process.cwd(), ".claude", "workspace");
		if (!existsSync(workspaceBase))
			mkdirSync(workspaceBase, { recursive: true });

		const createdFiles = [];
		for (const lang of languages) {
			const tmplSet = (await loadTemplates(lang))();
			const markaFileName =
				lang === "en" ? "marka-sesi-en.md" : "marka-sesi.md";
			const markaPath = join(workspaceBase, markaFileName);
			if (existsSync(markaPath)) {
				console.error(chalk.yellow(`${markaFileName} zaten mevcut.`));
				continue;
			}
			writeFileSync(markaPath, tmplSet.marka());
			createdFiles.push(markaPath);
		}

		if (createdFiles.length === 0) {
			console.log(chalk.dim("Tum marka sesi dosyalari zaten mevcut."));
			process.exit(1);
		}

		showBanner();
		console.log(chalk.bold.green("Marka sesi rehberi olusturuldu!"));
		for (const f of createdFiles) {
			console.log(`  Dosya: ${chalk.cyan(relative(process.cwd(), f))}`);
		}
		return;
	}

	const createdFiles = [];
	for (const lang of languages) {
		const tmplSet = (await loadTemplates(lang))();
		const langSuffix = lang === "en" ? "-en" : "";

		let subdir;
		let fileName;
		let content;

		switch (subcommand) {
			case "post":
				subdir = "icerikler";
				fileName = `${dateStr}-${konuSlug}${langSuffix}.md`;
				content = tmplSet.post(konu);
				break;
			case "karousel":
				subdir = "icerikler";
				fileName = `${dateStr}-karousel-${konuSlug}${langSuffix}.md`;
				content = tmplSet.karousel(konu);
				break;
			case "video":
				subdir = "senaryolar";
				fileName = `${dateStr}-${konuSlug}${langSuffix}.md`;
				content = tmplSet.video(konu);
				break;
			case "gorsel":
				subdir = "gorseller";
				fileName = `${dateStr}-${konuSlug}${langSuffix}-brief.md`;
				content = tmplSet.gorsel(konu);
				break;
			case "takvim":
				subdir = "takvim";
				fileName = `${dateStr}-takvim-${konuSlug}${langSuffix}.md`;
				content = tmplSet.takvim(konu);
				break;
			case "newsletter":
				subdir = "bultenler";
				fileName = `${dateStr}-newsletter-${konuSlug}${langSuffix}.md`;
				content = tmplSet.newsletter(konu);
				break;
			case "podcast":
				subdir = "podcastler";
				fileName = `${dateStr}-podcast-${konuSlug}${langSuffix}.md`;
				content = tmplSet.podcast(konu);
				break;
			case "thread":
				subdir = "icerikler";
				fileName = `${dateStr}-thread-${konuSlug}${langSuffix}.md`;
				content = tmplSet.thread(konu);
				break;
			case "case-study":
				subdir = "case-study";
				fileName = `${dateStr}-casestudy-${konuSlug}${langSuffix}.md`;
				content = tmplSet.caseStudy(konu);
				break;
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
					`Dosya zaten mevcut: ${relative(process.cwd(), targetPath)}`,
				),
			);
			continue;
		}

		if (platformFlag === "appstore") {
			content += `\n\n## Platform: App Store\n\n**CTA**: Download on the App Store\n**URL**: https://apps.apple.com/app/id[APP_ID]\n**Badge**: https://developer.apple.com/app-store/marketing/guidelines/#downloadOnAppstore\n**Hashtag**: #iOS #AppStore #iPhoneApp\n`;
		} else if (platformFlag === "playstore") {
			content += `\n\n## Platform: Google Play\n\n**CTA**: Get it on Google Play\n**URL**: https://play.google.com/store/apps/details?id=[PACKAGE_NAME]\n**Badge**: https://play.google.com/intl/en_us/badges/\n**Hashtag**: #Android #GooglePlay #AndroidApp\n`;
		} else if (platformFlag === "mobile") {
			content += `\n\n## Platform: Mobile (iOS + Android)\n\n**iOS**: https://apps.apple.com/app/id[APP_ID]\n**Android**: https://play.google.com/store/apps/details?id=[PACKAGE_NAME]\n**Hashtag**: #Mobile #App #iOS #Android\n`;
		}

		writeFileSync(targetPath, content);
		createdFiles.push(targetPath);
	}

	if (createdFiles.length === 0) {
		console.log(chalk.dim("Olusturulacak yeni dosya yok."));
		process.exit(1);
	}

	showBanner();
	console.log(
		chalk.bold.green(`${subcommand.toUpperCase()} sablonu olusturuldu!`),
	);
	console.log(`Konu: ${chalk.cyan(konu)}`);
	if (languages.length > 1)
		console.log(`Diller: ${chalk.cyan(languages.join(", "))}`);
	if (sablonFlag) console.log(`Sablon: ${chalk.cyan(sablonFlag)}`);
	for (const f of createdFiles) {
		console.log(`  Dosya: ${chalk.cyan(relative(process.cwd(), f))}`);
	}
	console.log("");
	console.log(chalk.bold("Sonraki adimlar:"));
	console.log("  1. Dosyayi ac ve placeholder'lari doldur");
	console.log(
		"  2. Marka sesi rehberini kontrol et: .claude/workspace/marka-sesi.md",
	);
	console.log(
		`  3. Tam interaktif akis icin Claude Code'da ${chalk.cyan(`/${subcommand === "post" ? "icerik-uret" : subcommand === "video" ? "video-senaryo" : subcommand === "gorsel" ? "gorsel-brief" : subcommand === "takvim" ? "icerik-takvimi" : subcommand === "karousel" ? "karousel" : "icerik-uret"}`)}`,
	);
}
