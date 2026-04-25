import { chalk, showBanner } from "../../cli.js";

export function runPlan() {
	showBanner();
	console.log(chalk.bold("Haftalik Icerik Planlama"));
	console.log("");

	const now = new Date();
	const nextMonday = new Date(now);
	const daysUntilMonday = (1 - now.getDay() + 7) % 7 || 7;
	nextMonday.setDate(now.getDate() + daysUntilMonday);
	const nextSunday = new Date(nextMonday);
	nextSunday.setDate(nextMonday.getDate() + 6);

	const formatDate = (d) => d.toISOString().split("T")[0];
	console.log(
		`Donem: ${chalk.cyan(formatDate(nextMonday))} - ${chalk.cyan(formatDate(nextSunday))}`,
	);
	console.log("");

	console.log(chalk.bold("Haftanin Gun Temalari:"));
	const temalar = [
		["Pazartesi", "Motivasyon / Hafta basligi"],
		["Sali", "Egitici / Ipucu"],
		["Carsamba", "Perde arkasi / Topluluk"],
		["Persembe", "Urun / Hizmet"],
		["Cuma", "Eglence / Trend"],
		["Cumartesi", "UGC / Sosyal kanit"],
		["Pazar", "Ilham / Haftalik ozet"],
	];
	for (const [gun, tema] of temalar) {
		console.log(`  ${chalk.cyan(gun.padEnd(10))} ${tema}`);
	}
	console.log("");

	console.log(chalk.bold("Onerilen Platform Dagilimi (haftalik):"));
	console.log("  Instagram Post:  3-5");
	console.log("  Instagram Reel:  2-3");
	console.log("  Twitter/X:       5-7");
	console.log("  LinkedIn:        2-3");
	console.log("  TikTok:          3-5");
	console.log(chalk.dim("  (kalite > kantite ilkesi)"));
	console.log("");

	console.log(chalk.bold("Sonraki Adimlar:"));
	console.log(
		`  1. Detayli takvim olustur: ${chalk.cyan(`badi icerik takvim "${formatDate(nextMonday).substring(0, 7)}"`)}`,
	);
	console.log("  2. Her gun icin konu belirle (takvim dosyasini doldur)");
	console.log(
		`  3. Haftanin ilk icerigini hazirla: ${chalk.cyan('badi icerik post "[konu]"')}`,
	);
	console.log("");
	console.log(
		chalk.dim(
			"Detayli planlama seansi icin Claude Code'da /icerik-plan komutu.",
		),
	);
}
