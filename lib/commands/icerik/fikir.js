import { chalk, showBanner } from "../../cli.js";

export function runFikir(args) {
	const tur = args[1] || "genel";
	showBanner();
	console.log(chalk.bold(`Icerik Fikirleri — ${tur}`));
	console.log("");

	const fikirKategori = {
		post: [
			"X nasil yapilir — adim adim kilavuz",
			"Yaygin yapilan 5 hata ve cozumu",
			"Baslangic icin temel kavramlar",
			"Bu hafta ogrendigim tek sey",
			"Yanlis bilinenler — dogrusu nedir?",
			"Hizli kazanç ipucu",
			"Sorular / cevaplar",
		],
		karousel: [
			"5 ipucu / 5 kural / 5 yontem listesi",
			"Oncesi vs sonrasi karsilastirmasi",
			"X icin 7 adimli kilavuz",
			"Yaygin sorular ve cevaplari (SSS)",
			"Kaynak / arac listesi",
			"Hatalar ve dogrulari",
			"Baslangictan uzmanliga yolculuk",
		],
		video: [
			"30 saniyelik hizli tutorial",
			"Perde arkasi — gunluk rutin",
			"Musteri referansi / basari hikayesi",
			"Trend sesle egitici icerik",
			"Oncesi/sonrasi donusum videosu",
			"Duet / tepki videosu",
			"Live soru-cevap",
		],
		gorsel: [
			"Tipografik alintisozu",
			"Infografik (veri gorselligi)",
			"Urun tanitim minimalist",
			"Oncesi/sonrasi karsilastirma",
			"Adim adim gorsel kilavuz",
			"Moodboard / ilham panosu",
			"Before/after visual",
		],
		genel: [
			"Bugun ogrendigim sey",
			"Sektorumuzdeki populer yanlis bilgi",
			"Aci nokta + cozum",
			"Musteri sorusu + detayli cevap",
			"Basarisizliktan ders",
			"Arac incelemesi / karsilastirma",
			"Trend konu + marka yorumumuz",
			"Topluluk sorusu — herkes cevaplasin",
			"Zaman cizelgesi / gelisim hikayesi",
			"Hizli anket / fikir toplama",
		],
	};

	const fikirler = fikirKategori[tur] || fikirKategori.genel;
	fikirler.forEach((fikir, i) => {
		console.log(`  ${chalk.cyan(`${i + 1}.`)} ${fikir}`);
	});

	console.log("");
	console.log(chalk.bold("Secilen fikri uygulamak icin:"));
	console.log(`  badi icerik ${tur === "genel" ? "post" : tur} "[fikir]"`);
	console.log("");
	console.log(
		chalk.dim(
			"Marka sesine uygun fikir uretimi icin Claude Code'da /icerik-fikir komutu.",
		),
	);
}
