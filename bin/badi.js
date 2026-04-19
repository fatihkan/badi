#!/usr/bin/env node

import { chalk, showBanner, showVersion, VERSION } from "../lib/cli.js";
import { checkForUpdate, showUpdateBanner } from "../lib/update-check.js";

function showHelp() {
	showBanner();
	console.log(chalk.bold("Kullanim:"));
	console.log("  badi <komut> [secenekler]");
	console.log("");
	console.log(chalk.bold("Komutlar:"));
	console.log(`  ${chalk.cyan("init")}      Projeyi Badi ile yapilandir`);
	console.log(`  ${chalk.cyan("update")}    Mevcut konfigurasyonu guncelle (ozellestirmeleri korur)`);
	console.log(`  ${chalk.cyan("doctor")}    Badi kurulumunu dogrula`);
	console.log(`  ${chalk.cyan("list")}      Mevcut bilesenleri listele`);
	console.log(`  ${chalk.cyan("plugin")}    Plugin yonetimi (install/remove/list)`);
	console.log(`  ${chalk.cyan("icerik")}    Hizli icerik sablonu olustur (post/karousel/video/gorsel/takvim/marka)`);
	console.log(`  ${chalk.cyan("stats")}     Kullanim istatistikleri ve analitik`);
	console.log(`  ${chalk.cyan("completion")} Kabuk tamamlama scripti olustur (bash/zsh/fish)`);
	console.log(`  ${chalk.cyan("schedule")}  Zamanlanmis komut hatirlaticilari`);
	console.log(`  ${chalk.cyan("wp")}        WordPress site yonetimi (durum/eklenti/tema/guvenlik)`);
	console.log(`  ${chalk.cyan("seo")}       SEO denetim ve analiz (audit/meta/sitemap/speed)`);
	console.log(`  ${chalk.cyan("aso")}       App Store Optimization (audit/keywords/compete/review)`);
	console.log(`  ${chalk.cyan("mobile")}    Mobil gelistirme (init/build/release/version/assets)`);
	console.log("");
	console.log(chalk.bold("Domain & Altyapi:"));
	console.log(`  ${chalk.cyan("ssl")}       SSL sertifika analizi (expire, TLS, cipher)`);
	console.log(`  ${chalk.cyan("dns")}       DNS kayit denetimi (A/MX/SPF/DMARC/CAA)`);
	console.log(`  ${chalk.cyan("whois")}     Domain tescil + expire + transfer lock`);
	console.log(`  ${chalk.cyan("lighthouse")} Performance + A11y + SEO + Best Practices`);
	console.log("");
	console.log(chalk.bold("Guvenlik & Erisilebilirlik:"));
	console.log(`  ${chalk.cyan("secret-scan")} Git history + working tree sir taramasi`);
	console.log(`  ${chalk.cyan("a11y")}      WCAG 2.1 accessibility audit (axe-core)`);
	console.log("");
	console.log(chalk.bold("Git Workflow:"));
	console.log(`  ${chalk.cyan("commit")}    Conventional commit yardimi + lint`);
	console.log(`  ${chalk.cyan("changelog")} Commit gecmisinden CHANGELOG.md uretimi`);
	console.log("");
	console.log(chalk.bold("Init Secenekleri:"));
	console.log("  --target <yol>   Hedef dizin (varsayilan: mevcut dizin)");
	console.log("  --force          Mevcut dosyalarin ustune yaz");
	console.log("  --dry-run        Degisiklikleri uygulamadan goster");
	console.log("");
	console.log(chalk.bold("List Secenekleri:"));
	console.log("  --agents         Sadece ajanlari listele");
	console.log("  --commands       Sadece komutlari listele");
	console.log("  --hooks          Sadece hook'lari listele");
	console.log("  --skills         Sadece skill kategorilerini listele");
	console.log("");
	console.log(chalk.bold("Plugin Secenekleri:"));
	console.log("  badi plugin install <kaynak>   Plugin yukle (git URL veya npm paketi)");
	console.log("  badi plugin remove <isim>      Plugin kaldir");
	console.log("  badi plugin list               Yuklu plugin'leri listele");
	console.log("");
	console.log(chalk.bold("Icerik Alt Komutlari:"));
	console.log("  badi icerik post [konu]        Sosyal medya post sablonu olustur");
	console.log("  badi icerik karousel [konu]    Karousel (coklu kare) sablonu olustur");
	console.log("  badi icerik video [konu]       Video senaryo sablonu olustur");
	console.log("  badi icerik gorsel [konu]      Gorsel brief sablonu olustur");
	console.log("  badi icerik takvim [donem]     Icerik takvimi sablonu olustur");
	console.log("  badi icerik marka              Marka sesi rehberi sablonu olustur");
	console.log("  badi icerik list               Uretilen icerikleri listele");
	console.log("  badi icerik perf [secenekler]  Icerik performans takibi");
	console.log("  badi icerik ara [sorgu]        Arsiv arama ve benzerlik tespiti");
	console.log("  badi icerik sablon [komut]     Sablon mirasi (olustur/list/sil)");
	console.log("");
	console.log(chalk.bold("Stats Secenekleri:"));
	console.log("  --week               Son 7 gun (varsayilan)");
	console.log("  --month              Son 30 gun");
	console.log("  --all                Tum zamanlar");
	console.log("  --command <arac>     Arac bazli filtre");
	console.log("  --habits             Aliskanlik serisi");
	console.log("  --export csv         CSV olarak disa aktar");
	console.log("");
	console.log(chalk.bold("Ornekler:"));
	console.log("  npx @fatihkan/badi init");
	console.log("  badi init --target ./projem");
	console.log("  badi update");
	console.log("  badi doctor");
	console.log("  badi list --agents");
	console.log("  badi plugin install https://github.com/user/badi-plugin-x.git");
	console.log('  badi icerik post "yeni urun lansman"');
	console.log('  badi icerik video "30 saniye tutorial"');
	console.log("  badi icerik list");
	console.log("  badi stats --week");
	console.log("  badi stats --habits");
	console.log("  badi completion zsh");
	console.log("  badi icerik perf --trend");
	console.log("");
	console.log(chalk.bold("WordPress Komutlari:"));
	console.log("  badi wp add blog https://example.com --method rest");
	console.log("  badi wp status blog");
	console.log("  badi wp security staging");
	console.log("  badi wp update staging all");
	console.log("");
	console.log(chalk.bold("SEO Komutlari:"));
	console.log("  badi seo audit https://example.com");
	console.log("  badi seo meta https://example.com/page");
	console.log("  badi seo sitemap https://example.com");
	console.log("  badi seo speed https://example.com");
	console.log("");
	console.log(chalk.bold("ASO Komutlari:"));
	console.log("  badi aso audit 284882215        # App listing denetimi");
	console.log("  badi aso keywords 284882215     # Keyword analizi");
	console.log("  badi aso metadata appstore      # Metadata rehberi");
	console.log("  badi aso compete 284882215 310633997  # Rakip karsilastirma");
	console.log("  badi aso search 'todo list'     # App arama");
	console.log("");
	console.log(chalk.bold("Mobile Komutlari:"));
	console.log("  badi mobile init MyApp --framework react-native");
	console.log("  badi mobile version bump minor");
	console.log("  badi mobile build android");
	console.log("  badi mobile release testflight");
	console.log("  badi mobile assets icon ./logo.png");
	console.log("  badi icerik release-notes --platform ios --version 2.3.0 --lang tr,en");
}

// ─── Lazy Komut Yukleyici ───
// Her komutu sadece cagrildiginda yukler (startup'i hizlandirir).

const commands = {
	init: () => import("../lib/commands/init.js").then((m) => m.runInit),
	update: () => import("../lib/commands/update.js").then((m) => m.runUpdate),
	doctor: () => import("../lib/commands/doctor.js").then((m) => m.runDoctor),
	list: () => import("../lib/commands/list.js").then((m) => m.runList),
	plugin: () => import("../lib/commands/plugin.js").then((m) => m.runPlugin),
	icerik: () => import("../lib/commands/icerik.js").then((m) => m.runIcerik),
	stats: () => import("../lib/commands/stats.js").then((m) => m.runStats),
	completion: () => import("../lib/commands/completion.js").then((m) => m.runCompletion),
	schedule: () => import("../lib/commands/schedule.js").then((m) => m.runSchedule),
	wp: () => import("../lib/commands/wp.js").then((m) => m.runWp),
	seo: () => import("../lib/commands/seo.js").then((m) => m.runSeo),
	aso: () => import("../lib/commands/aso.js").then((m) => m.runAso),
	mobile: () => import("../lib/commands/mobile.js").then((m) => m.runMobile),
	ssl: () => import("../lib/commands/domain.js").then((m) => m.runSslCmd),
	dns: () => import("../lib/commands/domain.js").then((m) => m.runDnsCmd),
	whois: () => import("../lib/commands/domain.js").then((m) => m.runWhoisCmd),
	lighthouse: () => import("../lib/commands/lighthouse.js").then((m) => m.runLighthouse),
	"secret-scan": () => import("../lib/commands/secret-scan.js").then((m) => m.runSecretScan),
	a11y: () => import("../lib/commands/a11y.js").then((m) => m.runA11y),
	commit: () => import("../lib/commands/commit.js").then((m) => m.runCommit),
	changelog: () => import("../lib/commands/commit.js").then((m) => m.runChangelog),
};

// ─── Ana Giris Noktasi ───

const updatePromise = checkForUpdate();
const [, , command, ...args] = process.argv;
const deps = { showHelp };

async function main() {
	switch (command) {
		case "--version":
		case "-v":
			showVersion();
			return;
		case "--help":
		case "-h":
		case "help":
		case undefined:
			showHelp();
			return;
	}

	const loader = commands[command];
	if (!loader) {
		console.error(chalk.red(`Bilinmeyen komut: ${command}`));
		console.error(`Yardim icin ${chalk.cyan('"badi --help"')} komutunu kullanin.`);
		process.exit(1);
	}

	const run = await loader();
	// init/update/doctor/list showHelp gerekiyor
	const needsDeps = ["init", "update", "doctor", "list"].includes(command);
	await run(args, needsDeps ? deps : undefined);
}

main()
	.catch((e) => {
		console.error(chalk.red(`Hata: ${e.message}`));
		process.exit(1);
	})
	.finally(() => {
		updatePromise.then(showUpdateBanner).catch(() => {});
	});
