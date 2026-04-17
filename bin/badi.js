#!/usr/bin/env node

import { chalk, showBanner, showVersion, VERSION } from "../lib/cli.js";
import { checkForUpdate, showUpdateBanner } from "../lib/update-check.js";
import { runInit } from "../lib/commands/init.js";
import { runUpdate } from "../lib/commands/update.js";
import { runDoctor } from "../lib/commands/doctor.js";
import { runList } from "../lib/commands/list.js";
import { runPlugin } from "../lib/commands/plugin.js";
import { runCompletion } from "../lib/commands/completion.js";
import { runSchedule } from "../lib/commands/schedule.js";
import { runStats } from "../lib/commands/stats.js";
import { runIcerik } from "../lib/commands/icerik.js";
import { runWp } from "../lib/commands/wp.js";
import { runSeo } from "../lib/commands/seo.js";

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
}

// ─── Ana Giris Noktasi ───

const updatePromise = checkForUpdate();
const [, , command, ...args] = process.argv;
const deps = { showHelp };

switch (command) {
	case "init":
		runInit(args, deps);
		break;
	case "update":
		runUpdate(args, deps);
		break;
	case "doctor":
		runDoctor(args, deps);
		break;
	case "list":
		runList(args, deps);
		break;
	case "plugin":
		runPlugin(args);
		break;
	case "icerik":
		runIcerik(args);
		break;
	case "stats":
		runStats(args);
		break;
	case "completion":
		runCompletion(args);
		break;
	case "schedule":
		runSchedule(args);
		break;
	case "wp":
		runWp(args);
		break;
	case "seo":
		runSeo(args);
		break;
	case "--version":
	case "-v":
		showVersion();
		break;
	case "--help":
	case "-h":
	case "help":
		showHelp();
		break;
	case undefined:
		showHelp();
		break;
	default:
		console.error(chalk.red(`Bilinmeyen komut: ${command}`));
		console.error(`Yardim icin ${chalk.cyan('"badi --help"')} komutunu kullanin.`);
		process.exit(1);
}

updatePromise.then(showUpdateBanner).catch(() => {});
