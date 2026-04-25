import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { chalk, showBanner } from "../../cli.js";
import { getDateString } from "../../icerik-helpers.js";

export function runBasla() {
	const workspaceBase = join(process.cwd(), ".claude", "workspace");
	const today = getDateString();
	const dayNames = [
		"Pazar",
		"Pazartesi",
		"Sali",
		"Carsamba",
		"Persembe",
		"Cuma",
		"Cumartesi",
	];
	const dayName = dayNames[new Date().getDay()];
	const dayTheme = {
		Pazartesi: "Motivasyon / Hafta basligi",
		Sali: "Egitici / Ipucu",
		Carsamba: "Perde arkasi / Topluluk",
		Persembe: "Urun / Hizmet",
		Cuma: "Eglence / Trend",
		Cumartesi: "UGC / Sosyal kanit",
		Pazar: "Ilham / Haftalik ozet",
	}[dayName];

	showBanner();
	console.log(chalk.bold(`Icerik Seansi — ${today} (${dayName})`));
	console.log("");

	const markaPath = join(workspaceBase, "marka-sesi.md");
	const markaVar = existsSync(markaPath);
	console.log(
		`Marka Sesi:  ${markaVar ? chalk.green("yuklendi") : chalk.yellow("eksik — badi icerik marka")}`,
	);

	const takvimDir = join(workspaceBase, "takvim");
	const takvimSayisi = existsSync(takvimDir)
		? readdirSync(takvimDir).filter((f) => f.endsWith(".md")).length
		: 0;
	console.log(
		`Takvim:      ${takvimSayisi > 0 ? chalk.green(`${takvimSayisi} dosya`) : chalk.yellow("yok — badi icerik takvim")}`,
	);

	console.log("");
	console.log(chalk.bold(`Bugunun Temasi (${dayName}):`));
	console.log(`  ${chalk.cyan(dayTheme)}`);
	console.log("");

	console.log(chalk.bold("Bekleyen Taslaklar (son 7 gun):"));
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
	const taslakDirs = [
		{ dir: "icerikler", label: "P" },
		{ dir: "senaryolar", label: "V" },
		{ dir: "gorseller", label: "G" },
	];

	let bekleyenSayisi = 0;
	for (const { dir, label } of taslakDirs) {
		const dirPath = join(workspaceBase, dir);
		if (!existsSync(dirPath)) continue;
		const files = readdirSync(dirPath)
			.filter((f) => f.endsWith(".md"))
			.filter((f) => {
				const fullPath = join(dirPath, f);
				const stat = statSync(fullPath);
				if (stat.mtime < sevenDaysAgo) return false;
				const content = readFileSync(fullPath, "utf-8");
				return (
					content.includes("[") &&
					(content.includes("placeholder") ||
						content.match(/\[[^\]]+\]/g)?.length > 5)
				);
			});
		for (const f of files) {
			console.log(`  ${chalk.yellow("~")} ${chalk.cyan(label)} ${f}`);
			bekleyenSayisi++;
		}
	}
	if (bekleyenSayisi === 0) {
		console.log(chalk.dim("  (bekleyen taslak yok)"));
	}

	console.log("");
	console.log(chalk.bold("Bugun Odaklanabileceklerin:"));
	console.log(
		`  1. Bugunun temasina uygun icerik: ${chalk.cyan(`badi icerik post "${dayTheme.toLowerCase()}"`)}`,
	);
	if (bekleyenSayisi > 0) {
		console.log(`  2. Bekleyen ${bekleyenSayisi} taslagi tamamla`);
	}
	console.log(`  3. Fikir uret: ${chalk.cyan("badi icerik fikir")}`);
	console.log(`  4. Durum gor: ${chalk.cyan("badi icerik durum")}`);
	console.log("");
	console.log(
		chalk.dim("Interaktif seans icin Claude Code'da /icerik-basla komutu."),
	);
}
