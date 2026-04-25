import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { chalk, showBanner } from "../../cli.js";
import { getDateString } from "../../icerik-helpers.js";

export function runKapat() {
	const workspaceBase = join(process.cwd(), ".claude", "workspace");
	if (!existsSync(workspaceBase)) {
		console.log(chalk.dim("Workspace yok."));
		return;
	}

	showBanner();
	console.log(chalk.bold("Seans Kapanisi"));
	console.log(chalk.dim(getDateString()));
	console.log("");

	const now = new Date();
	const startOfToday = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	);
	const subdirs = [
		{ dir: "icerikler", label: "Post/Karousel", icon: "P" },
		{ dir: "senaryolar", label: "Video", icon: "V" },
		{ dir: "gorseller", label: "Gorsel", icon: "G" },
		{ dir: "takvim", label: "Takvim", icon: "T" },
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
						? "TAMAMLANAN"
						: placeholders.length < 5
							? "KISMI"
							: "TASLAK";
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
		console.log(chalk.dim("Bugun hicbir icerik uretilmedi."));
		console.log(chalk.dim("Yarin icin basla: badi icerik basla"));
		return;
	}

	console.log(chalk.bold(`Bugun Uretilenler (${bugunDosyalar.length}):`));
	const tamamlanan = bugunDosyalar.filter((d) => d.durum === "TAMAMLANAN");
	const kismi = bugunDosyalar.filter((d) => d.durum === "KISMI");
	const taslak = bugunDosyalar.filter((d) => d.durum === "TASLAK");

	if (tamamlanan.length > 0) {
		console.log(chalk.green(`\nTAMAMLANAN (${tamamlanan.length}):`));
		for (const d of tamamlanan) {
			console.log(`  ${chalk.green("+")} ${chalk.cyan(d.icon)} ${d.dosya}`);
		}
	}
	if (kismi.length > 0) {
		console.log(chalk.yellow(`\nKISMI (${kismi.length}):`));
		for (const d of kismi) {
			console.log(
				`  ${chalk.yellow("~")} ${chalk.cyan(d.icon)} ${d.dosya} ${chalk.dim(`(${d.placeholders} yer tutucu)`)}`,
			);
		}
	}
	if (taslak.length > 0) {
		console.log(chalk.red(`\nTASLAK (${taslak.length}):`));
		for (const d of taslak) {
			console.log(
				`  ${chalk.red("!")} ${chalk.cyan(d.icon)} ${d.dosya} ${chalk.dim(`(${d.placeholders} yer tutucu)`)}`,
			);
		}
	}

	console.log("");
	console.log(chalk.bold("Yarin Icin:"));
	if (kismi.length + taslak.length > 0) {
		console.log(
			`  1. Bekleyen ${kismi.length + taslak.length} taslagi tamamla`,
		);
	}
	console.log("  2. Yarinki temaya gore yeni icerik uret");
	console.log("  3. Sabahleyin: badi icerik basla");
	console.log("");
	console.log(
		chalk.dim(
			"Detayli kapanis ritueli icin Claude Code'da /icerik-kapat komutu.",
		),
	);
}
