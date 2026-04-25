import { chalk, showBanner } from "../../cli.js";

export function runHelp() {
	showBanner();
	console.log(chalk.bold("Icerik Uretim Komutlari:"));
	console.log("");
	console.log(chalk.bold.cyan("Oturum Yonetimi:"));
	console.log(
		`  ${chalk.cyan("badi icerik basla")}              Gunluk icerik seansini baslat`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik durum")}              Uretim durumu paneli`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik plan")}               Haftalik planlama seansi`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik kapat")}              Gunu kapat ve ozetle`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik fikir [tur]")}        Fikir uret (post/video/karousel)`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik ac [filtre]")}        En son icerik dosyasini ac`,
	);
	console.log("");
	console.log(chalk.bold.cyan("Sablon Uretimi:"));
	console.log(
		`  ${chalk.cyan("badi icerik post [konu]")}        Sosyal medya post sablonu`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik karousel [konu]")}    Karousel (coklu kare) sablonu`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik video [konu]")}       Video senaryo sablonu`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik gorsel [konu]")}      Gorsel brief sablonu`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik takvim [donem]")}     Icerik takvimi sablonu`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik marka")}              Marka sesi rehberi sablonu`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik newsletter [konu]")} Haftalik bulten sablonu (v1.11+)`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik podcast [konu]")}    Podcast episode + show notes sablonu (v1.11+)`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik thread [konu]")}     X/LinkedIn 10-post thread (v1.11+)`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik case-study [konu]")} Musteri basari hikayesi (v1.11+)`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik list")}               Uretilen icerikleri listele`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik perf [secenekler]")} Performans takibi`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik ara [sorgu]")}        Arsiv arama ve benzerlik tespiti`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik sablon [komut]")}     Ozel sablon mirasi yonetimi`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik release-notes")}      App Store/Play Store release notes (--platform ios|android --version X.Y.Z)`,
	);
	console.log("");
	console.log(chalk.bold("Gunluk Is Akisi:"));
	console.log(
		"  Sabah:  badi icerik basla         # Seansa basla, bugun ne var?",
	);
	console.log('  Uretim: badi icerik post "konu"   # Sablon olustur');
	console.log("  Kontrol: badi icerik durum        # Ne kadar ilerledim?");
	console.log(
		"  Aksam:  badi icerik kapat         # Seansi kapat, yarini planla",
	);
	console.log("");
	console.log(chalk.bold("Ornekler:"));
	console.log("  badi icerik basla");
	console.log('  badi icerik post "yeni urun lansman"');
	console.log("  badi icerik fikir post");
	console.log("  badi icerik ac");
	console.log("");
	console.log(
		chalk.dim("Not: Sablonlar .claude/workspace/ altina olusturulur."),
	);
	console.log(
		chalk.dim(
			"Tam interaktif akis icin Claude Code'da /icerik-basla, /icerik-durum, /icerik-fikir slash komutlarini kullanin.",
		),
	);
}
