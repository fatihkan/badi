import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { chalk, showBanner } from "../../cli.js";

export function runList() {
	const workspaceBase = join(process.cwd(), ".claude", "workspace");
	if (!existsSync(workspaceBase)) {
		console.log(chalk.dim("Henuz icerik olusturulmamis."));
		console.log(chalk.dim('Basla: badi icerik post "konu"'));
		return;
	}

	showBanner();
	console.log(chalk.bold("Uretilen Icerikler:"));
	console.log("");

	const subdirs = [
		{
			dir: "icerikler",
			label: "Postlar, Karouseller ve Thread'ler",
			icon: "P",
		},
		{ dir: "senaryolar", label: "Video Senaryolari", icon: "V" },
		{ dir: "gorseller", label: "Gorsel Brifler", icon: "G" },
		{ dir: "takvim", label: "Icerik Takvimleri", icon: "T" },
		{ dir: "bultenler", label: "Bultenler (Newsletter)", icon: "N" },
		{ dir: "podcastler", label: "Podcast Episode'lari", icon: "Pd" },
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
		console.log(chalk.bold("Marka Sesi:"));
		console.log(`  ${chalk.magenta("M")} marka-sesi.md`);
		console.log("");
		totalFiles++;
	}

	if (totalFiles === 0) {
		console.log(chalk.dim("Henuz icerik olusturulmamis."));
		console.log(chalk.dim('Basla: badi icerik post "konu"'));
	} else {
		console.log(chalk.dim(`Toplam: ${totalFiles} dosya`));
	}
}
