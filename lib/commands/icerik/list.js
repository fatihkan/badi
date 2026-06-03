import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { chalk, showBanner } from "../../cli.js";

export function runList() {
	const workspaceBase = join(process.cwd(), ".claude", "workspace");
	if (!existsSync(workspaceBase)) {
		console.log(chalk.dim("No content generated yet."));
		console.log(chalk.dim('Start: badi content post "topic"'));
		return;
	}

	showBanner();
	console.log(chalk.bold("Generated Content:"));
	console.log("");

	const subdirs = [
		{
			dir: "icerikler",
			label: "Posts, Carousels & Threads",
			icon: "P",
		},
		{ dir: "senaryolar", label: "Video Scripts", icon: "V" },
		{ dir: "gorseller", label: "Visual Briefs", icon: "G" },
		{ dir: "takvim", label: "Content Calendars", icon: "T" },
		{ dir: "bultenler", label: "Newsletters", icon: "N" },
		{ dir: "podcastler", label: "Podcast Episodes", icon: "Pd" },
		{ dir: "case-study", label: "Case Studies", icon: "C" },
	];

	let totalFiles = 0;
	for (const { dir, label, icon } of subdirs) {
		const path = join(workspaceBase, dir);
		if (!existsSync(path)) continue;
		const files = readdirSync(path).filter((f) => f.endsWith(".md"));
		if (files.length === 0) continue;

		console.log(chalk.bold(`${label} (${files.length}):`));
		for (const f of files.sort().reverse()) {
			console.log(`  ${chalk.cyan(icon)} ${f}`);
			totalFiles++;
		}
		console.log("");
	}

	const markaPath = join(workspaceBase, "marka-sesi.md");
	if (existsSync(markaPath)) {
		console.log(chalk.bold("Brand Voice:"));
		console.log(`  ${chalk.magenta("M")} marka-sesi.md`);
		console.log("");
		totalFiles++;
	}

	if (totalFiles === 0) {
		console.log(chalk.dim("No content generated yet."));
		console.log(chalk.dim('Start: badi content post "topic"'));
	} else {
		console.log(chalk.dim(`Total: ${totalFiles} files`));
	}
}
