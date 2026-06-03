import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { chalk, showBanner } from "../../cli.js";
import { getDateString } from "../../icerik-helpers.js";

export function runKapat() {
	const workspaceBase = join(process.cwd(), ".claude", "workspace");
	if (!existsSync(workspaceBase)) {
		console.log(chalk.dim("No workspace."));
		return;
	}

	showBanner();
	console.log(chalk.bold("Session Close"));
	console.log(chalk.dim(getDateString()));
	console.log("");

	const now = new Date();
	const startOfToday = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	);
	const subdirs = [
		{ dir: "icerikler", label: "Post/Carousel", icon: "P" },
		{ dir: "senaryolar", label: "Video", icon: "V" },
		{ dir: "gorseller", label: "Visual", icon: "G" },
		{ dir: "takvim", label: "Calendar", icon: "T" },
	];

	const bugunDosyalar = [];
	for (const { dir, label, icon } of subdirs) {
		const dirPath = join(workspaceBase, dir);
		if (!existsSync(dirPath)) continue;
		const files = readdirSync(dirPath).filter((f) => f.endsWith(".md"));
		for (const f of files) {
			const fullPath = join(dirPath, f);
			const stat = statSync(fullPath);
			if (stat.mtime >= startOfToday) {
				const content = readFileSync(fullPath, "utf-8");
				const placeholders = content.match(/\[[^\]\n]{2,50}\]/g) || [];
				const durum =
					placeholders.length === 0
						? "COMPLETE"
						: placeholders.length < 5
							? "PARTIAL"
							: "DRAFT";
				bugunDosyalar.push({
					dosya: f,
					label,
					icon,
					durum,
					placeholders: placeholders.length,
				});
			}
		}
	}

	if (bugunDosyalar.length === 0) {
		console.log(chalk.dim("No content generated today."));
		console.log(chalk.dim("Start tomorrow: badi content start"));
		return;
	}

	console.log(chalk.bold(`Generated Today (${bugunDosyalar.length}):`));
	const tamamlanan = bugunDosyalar.filter((d) => d.durum === "COMPLETE");
	const kismi = bugunDosyalar.filter((d) => d.durum === "PARTIAL");
	const taslak = bugunDosyalar.filter((d) => d.durum === "DRAFT");

	if (tamamlanan.length > 0) {
		console.log(chalk.green(`\nCOMPLETE (${tamamlanan.length}):`));
		for (const d of tamamlanan) {
			console.log(`  ${chalk.green("+")} ${chalk.cyan(d.icon)} ${d.dosya}`);
		}
	}
	if (kismi.length > 0) {
		console.log(chalk.yellow(`\nPARTIAL (${kismi.length}):`));
		for (const d of kismi) {
			console.log(
				`  ${chalk.yellow("~")} ${chalk.cyan(d.icon)} ${d.dosya} ${chalk.dim(`(${d.placeholders} placeholders)`)}`,
			);
		}
	}
	if (taslak.length > 0) {
		console.log(chalk.red(`\nDRAFT (${taslak.length}):`));
		for (const d of taslak) {
			console.log(
				`  ${chalk.red("!")} ${chalk.cyan(d.icon)} ${d.dosya} ${chalk.dim(`(${d.placeholders} placeholders)`)}`,
			);
		}
	}

	console.log("");
	console.log(chalk.bold("For Tomorrow:"));
	if (kismi.length + taslak.length > 0) {
		console.log(
			`  1. Complete ${kismi.length + taslak.length} pending draft(s)`,
		);
	}
	console.log("  2. Create new content for tomorrow's theme");
	console.log("  3. In the morning: badi content start");
	console.log("");
	console.log(
		chalk.dim("For the full close ritual, use /icerik-kapat in Claude Code."),
	);
}
