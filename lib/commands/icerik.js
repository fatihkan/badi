import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, appendFileSync, statSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";
import { chalk, showBanner } from "../cli.js";
import {
	loadPreferences, parseLanguageFlag, slugify, getDateString, getIcerikWorkspace,
	loadCustomTemplate, resolveTemplate, mergeTemplateContent,
	searchWorkspaceFiles, checkDuplicates, parseFrontmatter,
} from "../icerik-helpers.js";
import { contentTemplates } from "../templates/tr.js";
import { contentTemplatesEN } from "../templates/en.js";

export function runIcerik(args) {
	const subcommand = args[0];

	if (!subcommand || subcommand === "--help" || subcommand === "-h") {
		showBanner();
		console.log(chalk.bold("Icerik Uretim Komutlari:"));
		console.log("");
		console.log(chalk.bold.cyan("Oturum Yonetimi:"));
		console.log(`  ${chalk.cyan("badi icerik basla")}              Gunluk icerik seansini baslat`);
		console.log(`  ${chalk.cyan("badi icerik durum")}              Uretim durumu paneli`);
		console.log(`  ${chalk.cyan("badi icerik plan")}               Haftalik planlama seansi`);
		console.log(`  ${chalk.cyan("badi icerik kapat")}              Gunu kapat ve ozetle`);
		console.log(`  ${chalk.cyan("badi icerik fikir [tur]")}        Fikir uret (post/video/karousel)`);
		console.log(`  ${chalk.cyan("badi icerik ac [filtre]")}        En son icerik dosyasini ac`);
		console.log("");
		console.log(chalk.bold.cyan("Sablon Uretimi:"));
		console.log(`  ${chalk.cyan("badi icerik post [konu]")}        Sosyal medya post sablonu`);
		console.log(`  ${chalk.cyan("badi icerik karousel [konu]")}    Karousel (coklu kare) sablonu`);
		console.log(`  ${chalk.cyan("badi icerik video [konu]")}       Video senaryo sablonu`);
		console.log(`  ${chalk.cyan("badi icerik gorsel [konu]")}      Gorsel brief sablonu`);
		console.log(`  ${chalk.cyan("badi icerik takvim [donem]")}     Icerik takvimi sablonu`);
		console.log(`  ${chalk.cyan("badi icerik marka")}              Marka sesi rehberi sablonu`);
		console.log(`  ${chalk.cyan("badi icerik list")}               Uretilen icerikleri listele`);
		console.log("");
		console.log(chalk.bold("Gunluk Is Akisi:"));
		console.log("  Sabah:  badi icerik basla         # Seansa basla, bugun ne var?");
		console.log('  Uretim: badi icerik post "konu"   # Sablon olustur');
		console.log("  Kontrol: badi icerik durum        # Ne kadar ilerledim?");
		console.log("  Aksam:  badi icerik kapat         # Seansi kapat, yarini planla");
		console.log("");
		console.log(chalk.bold("Ornekler:"));
		console.log("  badi icerik basla");
		console.log('  badi icerik post "yeni urun lansman"');
		console.log('  badi icerik fikir post');
		console.log("  badi icerik ac");
		console.log("");
		console.log(chalk.dim("Not: Sablonlar .claude/workspace/ altina olusturulur."));
		console.log(
			chalk.dim("Tam interaktif akis icin Claude Code'da /icerik-basla, /icerik-durum, /icerik-fikir slash komutlarini kullanin."),
		);
		return;
	}

	// list alt komutu
	if (subcommand === "list") {
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
			{ dir: "icerikler", label: "Postlar ve Karouseller", icon: "P" },
			{ dir: "senaryolar", label: "Video Senaryolari", icon: "V" },
			{ dir: "gorseller", label: "Gorsel Brifler", icon: "G" },
			{ dir: "takvim", label: "Icerik Takvimleri", icon: "T" },
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

		// Marka sesi dosyasi
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
		return;
	}

	// basla alt komutu — gunluk seans baslatici
	if (subcommand === "basla") {
		const workspaceBase = join(process.cwd(), ".claude", "workspace");
		const today = getDateString();
		const dayNames = ["Pazar", "Pazartesi", "Sali", "Carsamba", "Persembe", "Cuma", "Cumartesi"];
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

		// Marka sesi kontrolu
		const markaPath = join(workspaceBase, "marka-sesi.md");
		const markaVar = existsSync(markaPath);
		console.log(
			`Marka Sesi:  ${markaVar ? chalk.green("yuklendi") : chalk.yellow("eksik — badi icerik marka")}`,
		);

		// Takvim kontrolu
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

		// Bekleyen taslaklar (son 7 gun, placeholder iceren)
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
					// Placeholder iceren dosyalar taslak sayilir
					return content.includes("[") && (content.includes("placeholder") || content.match(/\[[^\]]+\]/g)?.length > 5);
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
		console.log(`  1. Bugunun temasina uygun icerik: ${chalk.cyan(`badi icerik post "${dayTheme.toLowerCase()}"`)}`);
		if (bekleyenSayisi > 0) {
			console.log(`  2. Bekleyen ${bekleyenSayisi} taslagi tamamla`);
		}
		console.log(`  3. Fikir uret: ${chalk.cyan("badi icerik fikir")}`);
		console.log(`  4. Durum gor: ${chalk.cyan("badi icerik durum")}`);
		console.log("");
		console.log(chalk.dim("Interaktif seans icin Claude Code'da /icerik-basla komutu."));
		return;
	}

	// durum alt komutu — uretim durum paneli
	if (subcommand === "durum") {
		const workspaceBase = join(process.cwd(), ".claude", "workspace");
		if (!existsSync(workspaceBase)) {
			console.log(chalk.dim("Henuz icerik olusturulmamis. Basla: badi icerik basla"));
			return;
		}

		showBanner();
		console.log(chalk.bold("Icerik Uretim Durumu"));
		console.log(chalk.dim(`${getDateString()} ${new Date().toTimeString().substring(0, 5)}`));
		console.log("");

		const subdirs = ["icerikler", "senaryolar", "gorseller", "takvim"];
		const now = new Date();
		const today = getDateString();
		const startOfWeek = new Date(now);
		startOfWeek.setDate(now.getDate() - now.getDay());
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

		let envanter = { total: 0, bugun: 0, buHafta: 0, buAy: 0, eski: 0 };
		let tamamlanmislik = { tamamlanan: 0, kismi: 0, taslak: 0 };

		for (const dir of subdirs) {
			const dirPath = join(workspaceBase, dir);
			if (!existsSync(dirPath)) continue;
			const files = readdirSync(dirPath).filter((f) => f.endsWith(".md"));
			for (const f of files) {
				const fullPath = join(dirPath, f);
				const stat = statSync(fullPath);
				const content = readFileSync(fullPath, "utf-8");

				envanter.total++;

				// Zaman gruplaması
				const mtime = stat.mtime;
				if (mtime.toISOString().startsWith(today)) envanter.bugun++;
				if (mtime >= startOfWeek) envanter.buHafta++;
				if (mtime >= startOfMonth) envanter.buAy++;

				const daysSince = Math.floor((now - mtime) / (1000 * 60 * 60 * 24));
				if (daysSince > 30) envanter.eski++;

				// Tamamlanmislik analizi (placeholder sayimiyla)
				const placeholders = content.match(/\[[^\]\n]{2,50}\]/g) || [];
				if (placeholders.length === 0) {
					tamamlanmislik.tamamlanan++;
				} else if (placeholders.length < 5) {
					tamamlanmislik.kismi++;
				} else {
					tamamlanmislik.taslak++;
				}
			}
		}

		console.log(chalk.bold("Envanter"));
		console.log(`  Toplam:    ${chalk.cyan(envanter.total)}`);
		console.log(`  Bugun:     ${chalk.cyan(envanter.bugun)}`);
		console.log(`  Bu Hafta:  ${chalk.cyan(envanter.buHafta)}`);
		console.log(`  Bu Ay:     ${chalk.cyan(envanter.buAy)}`);
		console.log(`  Eski (30+): ${chalk.yellow(envanter.eski)}`);
		console.log("");

		console.log(chalk.bold("Tamamlanmislik"));
		const toplam = tamamlanmislik.tamamlanan + tamamlanmislik.kismi + tamamlanmislik.taslak;
		const orani = toplam > 0 ? Math.round((tamamlanmislik.tamamlanan / toplam) * 100) : 0;
		console.log(`  ${chalk.green("Tamamlanan:")} ${tamamlanmislik.tamamlanan}`);
		console.log(`  ${chalk.yellow("Kismi:     ")} ${tamamlanmislik.kismi}`);
		console.log(`  ${chalk.red("Taslak:    ")} ${tamamlanmislik.taslak}`);
		console.log(`  Oran:      ${chalk.cyan(orani)}%`);
		console.log("");

		// Marka sesi durumu
		const markaPath = join(workspaceBase, "marka-sesi.md");
		console.log(chalk.bold("Durum"));
		console.log(
			`  Marka Sesi: ${existsSync(markaPath) ? chalk.green("VAR") : chalk.yellow("YOK")}`,
		);
		console.log("");

		// Uyarilar
		if (envanter.eski > 0) {
			console.log(chalk.yellow(`UYARI: ${envanter.eski} eski (30+ gun) dosya var, gozden gecirin.`));
		}
		if (tamamlanmislik.taslak > tamamlanmislik.tamamlanan) {
			console.log(chalk.yellow("UYARI: Taslak sayisi tamamlanandan fazla, bitirmeye odaklan."));
		}
		if (envanter.bugun === 0) {
			console.log(chalk.dim("BILGI: Bugun henuz icerik uretilmemis. badi icerik basla"));
		}
		console.log("");
		console.log(chalk.dim("Detayli durum icin Claude Code'da /icerik-durum komutu."));
		return;
	}

	// fikir alt komutu — hizli fikir uretici
	if (subcommand === "fikir") {
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
		console.log(chalk.dim("Marka sesine uygun fikir uretimi icin Claude Code'da /icerik-fikir komutu."));
		return;
	}

	// plan alt komutu — haftalik planlama
	if (subcommand === "plan") {
		showBanner();
		console.log(chalk.bold("Haftalik Icerik Planlama"));
		console.log("");

		// Gelecek haftanin tarih araligi
		const now = new Date();
		const nextMonday = new Date(now);
		const daysUntilMonday = (1 - now.getDay() + 7) % 7 || 7;
		nextMonday.setDate(now.getDate() + daysUntilMonday);
		const nextSunday = new Date(nextMonday);
		nextSunday.setDate(nextMonday.getDate() + 6);

		const formatDate = (d) => d.toISOString().split("T")[0];
		console.log(`Donem: ${chalk.cyan(formatDate(nextMonday))} - ${chalk.cyan(formatDate(nextSunday))}`);
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
		console.log(`  1. Detayli takvim olustur: ${chalk.cyan(`badi icerik takvim "${formatDate(nextMonday).substring(0, 7)}"`)}`);
		console.log("  2. Her gun icin konu belirle (takvim dosyasini doldur)");
		console.log(`  3. Haftanin ilk icerigini hazirla: ${chalk.cyan('badi icerik post "[konu]"')}`);
		console.log("");
		console.log(chalk.dim("Detayli planlama seansi icin Claude Code'da /icerik-plan komutu."));
		return;
	}

	// kapat alt komutu — gun sonu kapanis
	if (subcommand === "kapat") {
		const workspaceBase = join(process.cwd(), ".claude", "workspace");
		if (!existsSync(workspaceBase)) {
			console.log(chalk.dim("Workspace yok."));
			return;
		}

		showBanner();
		console.log(chalk.bold("Seans Kapanisi"));
		console.log(chalk.dim(getDateString()));
		console.log("");

		// Bugun olusturulan/degistirilen dosyalari bul
		const today = getDateString();
		const subdirs = [
			{ dir: "icerikler", label: "Post/Karousel", icon: "P" },
			{ dir: "senaryolar", label: "Video", icon: "V" },
			{ dir: "gorseller", label: "Gorsel", icon: "G" },
			{ dir: "takvim", label: "Takvim", icon: "T" },
		];

		let bugunDosyalar = [];
		for (const { dir, label, icon } of subdirs) {
			const dirPath = join(workspaceBase, dir);
			if (!existsSync(dirPath)) continue;
			const files = readdirSync(dirPath).filter((f) => f.endsWith(".md"));
			for (const f of files) {
				const fullPath = join(dirPath, f);
				const stat = statSync(fullPath);
				const mtimeDate = stat.mtime.toISOString().split("T")[0];
				if (mtimeDate === today) {
					const content = readFileSync(fullPath, "utf-8");
					const placeholders = content.match(/\[[^\]\n]{2,50}\]/g) || [];
					const durum = placeholders.length === 0 ? "TAMAMLANAN" : placeholders.length < 5 ? "KISMI" : "TASLAK";
					bugunDosyalar.push({ dosya: f, label, icon, durum, placeholders: placeholders.length });
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
				console.log(`  ${chalk.yellow("~")} ${chalk.cyan(d.icon)} ${d.dosya} ${chalk.dim(`(${d.placeholders} yer tutucu)`)}`);
			}
		}
		if (taslak.length > 0) {
			console.log(chalk.red(`\nTASLAK (${taslak.length}):`));
			for (const d of taslak) {
				console.log(`  ${chalk.red("!")} ${chalk.cyan(d.icon)} ${d.dosya} ${chalk.dim(`(${d.placeholders} yer tutucu)`)}`);
			}
		}

		console.log("");
		console.log(chalk.bold("Yarin Icin:"));
		if (kismi.length + taslak.length > 0) {
			console.log(`  1. Bekleyen ${kismi.length + taslak.length} taslagi tamamla`);
		}
		console.log("  2. Yarinki temaya gore yeni icerik uret");
		console.log("  3. Sabahleyin: badi icerik basla");
		console.log("");
		console.log(chalk.dim("Detayli kapanis ritueli icin Claude Code'da /icerik-kapat komutu."));
		return;
	}

	// ac alt komutu — en son icerik dosyasini ac
	if (subcommand === "ac") {
		const workspaceBase = join(process.cwd(), ".claude", "workspace");
		if (!existsSync(workspaceBase)) {
			console.log(chalk.dim("Workspace yok. Once icerik uret: badi icerik post \"konu\""));
			return;
		}

		const filtre = args[1] || "";
		const subdirs = ["icerikler", "senaryolar", "gorseller", "takvim"];
		let allFiles = [];
		for (const dir of subdirs) {
			const dirPath = join(workspaceBase, dir);
			if (!existsSync(dirPath)) continue;
			const files = readdirSync(dirPath).filter((f) => f.endsWith(".md"));
			for (const f of files) {
				if (filtre && !f.toLowerCase().includes(filtre.toLowerCase())) continue;
				const fullPath = join(dirPath, f);
				const stat = statSync(fullPath);
				allFiles.push({ path: fullPath, name: f, mtime: stat.mtime, dir });
			}
		}

		// Marka sesi de dahil
		const markaPath = join(workspaceBase, "marka-sesi.md");
		if (existsSync(markaPath) && (!filtre || "marka".includes(filtre.toLowerCase()))) {
			const stat = statSync(markaPath);
			allFiles.push({ path: markaPath, name: "marka-sesi.md", mtime: stat.mtime, dir: "workspace" });
		}

		if (allFiles.length === 0) {
			console.log(chalk.yellow(`Filtreye uyan dosya bulunamadi${filtre ? ` ("${filtre}")` : ""}.`));
			console.log(chalk.dim("Dosya listesi icin: badi icerik list"));
			return;
		}

		// En son degistirilen dosyayi sec
		allFiles.sort((a, b) => b.mtime - a.mtime);
		const latest = allFiles[0];
		const relPath = relative(process.cwd(), latest.path);

		console.log(chalk.bold("En son icerik dosyasi:"));
		console.log(`  ${chalk.cyan(relPath)}`);
		console.log(chalk.dim(`  Son degisiklik: ${latest.mtime.toISOString().substring(0, 16).replace("T", " ")}`));
		console.log("");

		// --open flag'i ile editor'de ac
		if (args.includes("--open") || args.includes("-o")) {
			const editor = process.env.EDITOR || process.env.VISUAL;
			if (editor) {
				try {
					execFileSync(editor, [latest.path], { stdio: "inherit" });
				} catch {
					console.log(chalk.dim(`Acmak icin: ${editor} ${relPath}`));
				}
			} else {
				const opener = process.platform === "darwin" ? "open" : "xdg-open";
				try {
					execFileSync(opener, [latest.path], { stdio: "ignore" });
					console.log(chalk.green(`Dosya acildi: ${relPath}`));
				} catch {
					console.log(chalk.dim(`  open ${relPath}     # macOS`));
					console.log(chalk.dim(`  code ${relPath}     # VS Code`));
				}
			}
		} else {
			console.log(chalk.dim(`Editorde acmak icin: badi icerik ac --open`));
		}

		// Dosya icerigini gostermek istiyorsa
		if (args.includes("--cat") || args.includes("-c")) {
			console.log("");
			console.log(chalk.bold("Icerik:"));
			console.log(chalk.dim("─".repeat(50)));
			console.log(readFileSync(latest.path, "utf-8"));
			console.log(chalk.dim("─".repeat(50)));
		}
		return;
	}

	// perf alt komutu — icerik performans takibi
	if (subcommand === "perf") {
		const perfFile = join(process.cwd(), ".claude", "workspace", "performans.jsonl");
		const perfSub = args[1];

		// Yardimci: performans logunu oku
		function readPerfLog() {
			if (!existsSync(perfFile)) return [];
			const lines = readFileSync(perfFile, "utf-8").split("\n").filter(Boolean);
			const entries = [];
			for (const line of lines) {
				try {
					entries.push(JSON.parse(line));
				} catch {
					// Bozuk satir
				}
			}
			return entries;
		}

		// Help
		if (perfSub === "--help" || perfSub === "-h") {
			console.log(chalk.bold("Icerik Performans Takibi:"));
			console.log("");
			console.log(`  badi icerik perf                      ${chalk.dim("Haftalik ozet (varsayilan)")}`);
			console.log(`  badi icerik perf add [secenekler]     ${chalk.dim("Performans verisi ekle")}`);
			console.log(`  badi icerik perf list                 ${chalk.dim("Tum kayitlari listele")}`);
			console.log("");
			console.log(chalk.bold("Perf Add Secenekleri:"));
			console.log("  --file <dosya>       Icerik dosya adi");
			console.log("  --platform <ad>      Platform (instagram/twitter/linkedin/tiktok/facebook)");
			console.log("  --likes <sayi>       Begeni sayisi");
			console.log("  --comments <sayi>    Yorum sayisi");
			console.log("  --shares <sayi>      Paylasim sayisi");
			console.log("  --saves <sayi>       Kayit sayisi");
			console.log("  --reach <sayi>       Erisim sayisi");
			console.log("  --effort <saat>      Harcanan efor (saat)");
			console.log("");
			console.log(chalk.bold("Rapor Secenekleri:"));
			console.log("  --week               Son 7 gun (varsayilan)");
			console.log("  --month              Son 30 gun");
			console.log("  --trend              Trend analizi");
			console.log("  --roi                ROI hesaplamasi");
			console.log("  --platform <ad>      Platform bazli filtre");
			return;
		}

		// perf add
		if (perfSub === "add") {
			const perfArgs = args.slice(2);
			const entry = { timestamp: new Date().toISOString(), date: getDateString() };

			for (let i = 0; i < perfArgs.length; i++) {
				switch (perfArgs[i]) {
					case "--file":
						entry.file = perfArgs[++i];
						break;
					case "--platform":
						entry.platform = perfArgs[++i];
						break;
					case "--likes":
						entry.likes = Number.parseInt(perfArgs[++i]) || 0;
						break;
					case "--comments":
						entry.comments = Number.parseInt(perfArgs[++i]) || 0;
						break;
					case "--shares":
						entry.shares = Number.parseInt(perfArgs[++i]) || 0;
						break;
					case "--saves":
						entry.saves = Number.parseInt(perfArgs[++i]) || 0;
						break;
					case "--reach":
						entry.reach = Number.parseInt(perfArgs[++i]) || 0;
						break;
					case "--effort":
						entry.effort = Number.parseFloat(perfArgs[++i]) || 0;
						break;
				}
			}

			if (!entry.file || !entry.platform) {
				console.error(chalk.red("Eksik parametre: --file ve --platform zorunlu"));
				console.log("Ornek: badi icerik perf add --file test.md --platform instagram --likes 100");
				process.exit(1);
			}

			const dir = join(process.cwd(), ".claude", "workspace");
			mkdirSync(dir, { recursive: true });

			const line = JSON.stringify(entry);
			appendFileSync(perfFile, line + "\n");

			const engagement = (entry.likes || 0) + (entry.comments || 0) + (entry.shares || 0) + (entry.saves || 0);
			console.log(chalk.bold.green("Performans verisi kaydedildi!"));
			console.log(`  Dosya:     ${chalk.cyan(entry.file)}`);
			console.log(`  Platform:  ${chalk.cyan(entry.platform)}`);
			console.log(`  Etkilesim: ${chalk.cyan(engagement)}`);
			if (entry.reach) console.log(`  Erisim:    ${chalk.cyan(entry.reach)}`);
			return;
		}

		// perf list
		if (perfSub === "list") {
			const entries = readPerfLog();
			if (entries.length === 0) {
				console.log(chalk.yellow("Henuz performans verisi yok."));
				console.log(chalk.dim("Veri ekle: badi icerik perf add --file X --platform Y --likes N"));
				return;
			}

			console.log(chalk.bold("Performans Kayitlari:"));
			console.log("");
			console.log(
				`  ${chalk.dim("Tarih".padEnd(12))}${chalk.dim("Platform".padEnd(12))}${chalk.dim("Dosya".padEnd(30))}${chalk.dim("Begeni".padEnd(8))}${chalk.dim("Yorum".padEnd(8))}${chalk.dim("Erisim")}`,
			);
			console.log(chalk.dim("  " + "─".repeat(78)));

			for (const e of entries) {
				console.log(
					`  ${(e.date || "").padEnd(12)}${(e.platform || "").padEnd(12)}${(e.file || "").substring(0, 28).padEnd(30)}${String(e.likes || 0).padEnd(8)}${String(e.comments || 0).padEnd(8)}${e.reach || "-"}`,
				);
			}
			return;
		}

		// Rapor bayraklarini parse et
		let perfPeriod = "week";
		let perfPlatformFilter = null;
		let showTrend = false;
		let showRoi = false;
		const reportArgs = args.slice(1);

		for (let i = 0; i < reportArgs.length; i++) {
			switch (reportArgs[i]) {
				case "--week":
					perfPeriod = "week";
					break;
				case "--month":
					perfPeriod = "month";
					break;
				case "--trend":
					showTrend = true;
					break;
				case "--roi":
					showRoi = true;
					break;
				case "--platform":
					perfPlatformFilter = reportArgs[++i];
					break;
			}
		}

		let entries = readPerfLog();
		if (entries.length === 0) {
			console.log(chalk.yellow("Henuz performans verisi yok."));
			console.log(chalk.dim("Veri ekle: badi icerik perf add --file X --platform Y --likes N"));
			return;
		}

		// Donem filtresi
		const cutoffMs = perfPeriod === "month" ? 30 * 86400000 : 7 * 86400000;
		const cutoffDate = new Date(Date.now() - cutoffMs);
		entries = entries.filter((e) => new Date(e.date || e.timestamp) >= cutoffDate);

		if (perfPlatformFilter) {
			entries = entries.filter((e) => (e.platform || "").toLowerCase() === perfPlatformFilter.toLowerCase());
		}

		if (entries.length === 0) {
			console.log(chalk.yellow("Secilen donemde veri yok."));
			return;
		}

		// Trend analizi
		if (showTrend) {
			showBanner();
			console.log(chalk.bold("Trend Analizi"));
			console.log("");

			// Onceki ve mevcut donem karsilastirmasi
			const halfMs = cutoffMs / 2;
			const halfDate = new Date(Date.now() - halfMs);
			const allInRange = readPerfLog().filter((e) => new Date(e.date || e.timestamp) >= cutoffDate);
			const onceki = allInRange.filter((e) => new Date(e.date || e.timestamp) < halfDate);
			const mevcut = allInRange.filter((e) => new Date(e.date || e.timestamp) >= halfDate);

			const engOf = (arr) => arr.reduce((s, e) => s + (e.likes || 0) + (e.comments || 0) + (e.shares || 0) + (e.saves || 0), 0);
			const oncekiEng = engOf(onceki);
			const mevcutEng = engOf(mevcut);
			const change = oncekiEng > 0 ? Math.round(((mevcutEng - oncekiEng) / oncekiEng) * 100) : 0;
			const arrow = change >= 0 ? chalk.green(`↑ %${change}`) : chalk.red(`↓ %${Math.abs(change)}`);

			console.log(`  Onceki donem:  ${chalk.dim(onceki.length)} icerik, ${chalk.dim(oncekiEng)} etkilesim`);
			console.log(`  Mevcut donem:  ${chalk.dim(mevcut.length)} icerik, ${chalk.dim(mevcutEng)} etkilesim`);
			console.log(`  Degisim:       ${arrow}`);
			console.log("");

			// Platform bazli trend
			const platforms = [...new Set(allInRange.map((e) => e.platform))];
			if (platforms.length > 1) {
				console.log(chalk.bold("Platform Bazli:"));
				for (const p of platforms) {
					const pOnceki = engOf(onceki.filter((e) => e.platform === p));
					const pMevcut = engOf(mevcut.filter((e) => e.platform === p));
					const pChange = pOnceki > 0 ? Math.round(((pMevcut - pOnceki) / pOnceki) * 100) : 0;
					const pArrow = pChange >= 0 ? chalk.green(`↑ %${pChange}`) : chalk.red(`↓ %${Math.abs(pChange)}`);
					console.log(`  ${(p || "").padEnd(15)} ${pArrow}`);
				}
			}
			return;
		}

		// ROI analizi
		if (showRoi) {
			showBanner();
			console.log(chalk.bold("ROI Analizi (Etkilesim / Efor)"));
			console.log("");

			const byType = {};
			for (const e of entries) {
				const platform = e.platform || "diger";
				if (!byType[platform]) byType[platform] = { count: 0, engagement: 0, effort: 0 };
				byType[platform].count++;
				byType[platform].engagement += (e.likes || 0) + (e.comments || 0) + (e.shares || 0) + (e.saves || 0);
				byType[platform].effort += e.effort || 0;
			}

			console.log(
				`  ${chalk.dim("Platform".padEnd(15))}${chalk.dim("Icerik".padEnd(8))}${chalk.dim("Etkilesim".padEnd(12))}${chalk.dim("Efor(s)".padEnd(10))}${chalk.dim("ROI")}`,
			);
			console.log(chalk.dim("  " + "─".repeat(55)));

			const sorted = Object.entries(byType).sort((a, b) => {
				const roiA = a[1].effort > 0 ? a[1].engagement / a[1].effort : a[1].engagement;
				const roiB = b[1].effort > 0 ? b[1].engagement / b[1].effort : b[1].engagement;
				return roiB - roiA;
			});

			for (const [platform, data] of sorted) {
				const roi = data.effort > 0 ? (data.engagement / data.effort).toFixed(1) : "-";
				console.log(
					`  ${platform.padEnd(15)}${String(data.count).padEnd(8)}${String(data.engagement).padEnd(12)}${String(data.effort || "-").padEnd(10)}${chalk.bold(roi)}`,
				);
			}
			return;
		}

		// Varsayilan: haftalik/aylik ozet
		showBanner();
		const periodLabel = perfPeriod === "month" ? "Son 30 gun" : "Son 7 gun";
		console.log(chalk.bold("Icerik Performans Raporu"));
		console.log(`Donem: ${chalk.cyan(periodLabel)}`);
		if (perfPlatformFilter) console.log(`Platform: ${chalk.cyan(perfPlatformFilter)}`);
		console.log("");

		// Platform bazli ozet tablo
		const platformData = {};
		for (const e of entries) {
			const p = e.platform || "diger";
			if (!platformData[p]) platformData[p] = { count: 0, likes: 0, comments: 0, shares: 0, saves: 0, reach: 0 };
			platformData[p].count++;
			platformData[p].likes += e.likes || 0;
			platformData[p].comments += e.comments || 0;
			platformData[p].shares += e.shares || 0;
			platformData[p].saves += e.saves || 0;
			platformData[p].reach += e.reach || 0;
		}

		console.log(
			`  ${chalk.dim("Platform".padEnd(15))}${chalk.dim("Icerik".padEnd(8))}${chalk.dim("Begeni".padEnd(10))}${chalk.dim("Yorum".padEnd(10))}${chalk.dim("Kayit".padEnd(10))}${chalk.dim("Erisim")}`,
		);
		console.log(chalk.dim("  " + "─".repeat(63)));

		let totalLikes = 0;
		let totalComments = 0;
		let totalSaves = 0;
		let totalReach = 0;

		for (const [platform, data] of Object.entries(platformData)) {
			console.log(
				`  ${platform.padEnd(15)}${String(data.count).padEnd(8)}${String(data.likes).padEnd(10)}${String(data.comments).padEnd(10)}${String(data.saves).padEnd(10)}${data.reach || "-"}`,
			);
			totalLikes += data.likes;
			totalComments += data.comments;
			totalSaves += data.saves;
			totalReach += data.reach;
		}

		console.log(chalk.dim("  " + "─".repeat(63)));
		console.log(
			chalk.bold(
				`  ${"Toplam".padEnd(15)}${String(entries.length).padEnd(8)}${String(totalLikes).padEnd(10)}${String(totalComments).padEnd(10)}${String(totalSaves).padEnd(10)}${totalReach}`,
			),
		);
		console.log("");

		// En iyi performans
		const bestEntry = entries.reduce((best, e) => {
			const eng = (e.likes || 0) + (e.comments || 0) + (e.shares || 0) + (e.saves || 0);
			const bestEng = (best.likes || 0) + (best.comments || 0) + (best.shares || 0) + (best.saves || 0);
			return eng > bestEng ? e : best;
		}, entries[0]);

		if (bestEntry) {
			const bestEng = (bestEntry.likes || 0) + (bestEntry.comments || 0) + (bestEntry.shares || 0) + (bestEntry.saves || 0);
			console.log(chalk.bold("En Iyi Performans:"));
			console.log(`  ${chalk.cyan(bestEntry.file || "?")} (${bestEntry.platform || "?"})`);
			console.log(`  Etkilesim: ${chalk.bold(bestEng)}  Erisim: ${chalk.bold(bestEntry.reach || "-")}`);
		}
		return;
	}

	// ara alt komutu — arsiv arama
	if (subcommand === "ara") {
		const workspaceBase = join(process.cwd(), ".claude", "workspace");
		const araArgs = args.slice(1);
		let query = "";
		const filters = {};
		let format = "text";
		let showAraHelp = false;

		for (let i = 0; i < araArgs.length; i++) {
			switch (araArgs[i]) {
				case "--platform":
					filters.platform = araArgs[++i];
					break;
				case "--tur":
					filters.tur = araArgs[++i];
					break;
				case "--son":
					filters.son = Number.parseInt(araArgs[++i]) || 30;
					break;
				case "--hashtag":
					filters.hashtag = araArgs[++i];
					break;
				case "--format":
					format = araArgs[++i];
					break;
				case "--help":
				case "-h":
					showAraHelp = true;
					break;
				default:
					if (!araArgs[i].startsWith("--")) query += (query ? " " : "") + araArgs[i];
			}
		}

		if (showAraHelp || !query) {
			console.log(chalk.bold("Icerik Arsiv Arama:"));
			console.log("");
			console.log(`  badi icerik ara [sorgu]           ${chalk.dim("Anahtar kelime arama")}`);
			console.log(`  badi icerik ara [s] --platform X  ${chalk.dim("Platform filtresi")}`);
			console.log(`  badi icerik ara [s] --tur post    ${chalk.dim("Tur filtresi (post/karousel/video/gorsel)")}`);
			console.log(`  badi icerik ara [s] --son 30      ${chalk.dim("Son N gun")}`);
			console.log(`  badi icerik ara [s] --hashtag X   ${chalk.dim("Hashtag arama")}`);
			console.log(`  badi icerik ara [s] --format json ${chalk.dim("JSON cikti")}`);
			if (!query && !showAraHelp) {
				console.log("");
				console.log(chalk.yellow("Arama sorgusu belirtin."));
			}
			return;
		}

		if (!existsSync(workspaceBase)) {
			console.log(chalk.yellow("Workspace bulunamadi. Once icerik uretin."));
			return;
		}

		const results = searchWorkspaceFiles(workspaceBase, query, filters);

		if (format === "json") {
			console.log(JSON.stringify(results, null, 2));
			return;
		}

		if (results.length === 0) {
			console.log(chalk.yellow(`"${query}" icin sonuc bulunamadi.`));
			return;
		}

		console.log(chalk.bold(`Arama Sonuclari: "${query}" (${results.length} sonuc)`));
		console.log("");

		for (let i = 0; i < Math.min(results.length, 20); i++) {
			const r = results[i];
			console.log(`  ${chalk.cyan(`${i + 1}.`)} [${chalk.bold(r.icon)}] ${r.file} ${chalk.dim(`(Skor: ${r.score})`)}`);
			console.log(`     Tarih: ${chalk.dim(r.date)} | Dizin: ${chalk.dim(r.dir)}`);
			if (r.snippet) console.log(`     ${chalk.dim(`"${r.snippet}"`)}`);
			console.log("");
		}
		return;
	}

	// sablon alt komutu — sablon mirasi
	if (subcommand === "sablon") {
		const sablonSub = args[1];
		const sablonDir = join(process.cwd(), ".claude", "workspace", "sablonlar");

		if (!sablonSub || sablonSub === "--help" || sablonSub === "-h") {
			console.log(chalk.bold("Sablon Mirasi Sistemi:"));
			console.log("");
			console.log(`  badi icerik sablon olustur [isim] --extends [tur]  ${chalk.dim("Yeni sablon olustur")}`);
			console.log(`  badi icerik sablon list                            ${chalk.dim("Sablonlari listele")}`);
			console.log(`  badi icerik sablon sil [isim]                      ${chalk.dim("Sablon sil")}`);
			console.log("");
			console.log(chalk.bold("Kullanim:"));
			console.log('  badi icerik post "konu" --sablon saas-lansmani');
			console.log("");
			console.log(chalk.bold("Gecerli extends turleri:"));
			console.log("  post, karousel, video, gorsel, takvim");
			return;
		}

		if (sablonSub === "olustur") {
			const sablonName = args[2];
			if (!sablonName) {
				console.error(chalk.red("Sablon adi belirtin: badi icerik sablon olustur [isim] --extends [tur]"));
				process.exit(1);
			}
			let extendsType = "post";
			let description = "";
			for (let i = 3; i < args.length; i++) {
				if (args[i] === "--extends") extendsType = args[++i];
				if (args[i] === "--description") description = args[++i];
			}
			const validBases = ["post", "karousel", "video", "gorsel", "takvim"];
			if (!validBases.includes(extendsType)) {
				console.error(chalk.red(`Gecersiz extends turu: ${extendsType}`));
				console.log(`Gecerli turler: ${validBases.join(", ")}`);
				process.exit(1);
			}

			mkdirSync(sablonDir, { recursive: true });
			const filePath = join(sablonDir, `${slugify(sablonName)}.md`);
			if (existsSync(filePath)) {
				console.error(chalk.yellow(`Sablon zaten mevcut: ${sablonName}`));
				process.exit(1);
			}

			const sablonContent = `---
name: ${sablonName}
extends: ${extendsType}
description: ${description || sablonName + " icin ozel sablon"}
---

## Ek Bolum
[Bu bolumu ozellestirin. ${extendsType} sablonuna eklenir.]

## Ozel Notlar
[Sablona ozel rehber veya kurallar]
`;
			writeFileSync(filePath, sablonContent);
			console.log(chalk.bold.green("Sablon olusturuldu!"));
			console.log(`  Isim:    ${chalk.cyan(sablonName)}`);
			console.log(`  Miras:   ${chalk.cyan(extendsType)}`);
			console.log(`  Dosya:   ${chalk.cyan(relative(process.cwd(), filePath))}`);
			console.log("");
			console.log(chalk.dim("Dosyayi duzenleyip ozel bolumler ekleyin."));
			console.log(`Kullanim: badi icerik ${extendsType} "konu" --sablon ${slugify(sablonName)}`);
			return;
		}

		if (sablonSub === "list") {
			if (!existsSync(sablonDir)) {
				console.log(chalk.dim("Henuz ozel sablon yok."));
				console.log(chalk.dim("Olustur: badi icerik sablon olustur [isim] --extends post"));
				return;
			}
			const files = readdirSync(sablonDir).filter((f) => f.endsWith(".md"));
			if (files.length === 0) {
				console.log(chalk.dim("Henuz ozel sablon yok."));
				return;
			}

			console.log(chalk.bold("Yerlesik Sablonlar:"));
			console.log(chalk.dim("  post, karousel, video, gorsel, takvim, marka"));
			console.log("");
			console.log(chalk.bold("Ozel Sablonlar:"));
			for (const f of files) {
				const content = readFileSync(join(sablonDir, f), "utf-8");
				const { meta } = parseFrontmatter(content);
				const name = meta.name || f.replace(".md", "");
				const ext = meta.extends || "?";
				const desc = meta.description || "";
				console.log(`  ${chalk.cyan(name.padEnd(20))} extends: ${chalk.dim(ext.padEnd(10))} ${chalk.dim(desc)}`);
			}
			return;
		}

		if (sablonSub === "sil") {
			const sablonName = args[2];
			if (!sablonName) {
				console.error(chalk.red("Silinecek sablon adini belirtin."));
				process.exit(1);
			}
			const filePath = join(sablonDir, `${slugify(sablonName)}.md`);
			if (!existsSync(filePath)) {
				console.error(chalk.red(`Sablon bulunamadi: ${sablonName}`));
				process.exit(1);
			}
			rmSync(filePath);
			console.log(chalk.green(`Sablon silindi: ${sablonName}`));
			return;
		}

		console.error(chalk.red(`Bilinmeyen sablon komutu: ${sablonSub}`));
		console.log("Kullanim: badi icerik sablon [olustur|list|sil]");
		process.exit(1);
	}

	// Sablon turu + konu (--lang, --sablon, --force destegi)
	const validTypes = ["post", "karousel", "video", "gorsel", "takvim", "marka"];

	if (!validTypes.includes(subcommand)) {
		console.error(chalk.red(`Bilinmeyen icerik turu: ${subcommand}`));
		console.log(`Gecerli turler: ${validTypes.join(", ")}, ara, sablon`);
		console.log("Yardim: badi icerik --help");
		process.exit(1);
	}

	// --lang, --sablon, --force parse
	const { languages, remaining: langRemaining } = parseLanguageFlag(args.slice(1));
	let sablonFlag = null;
	let forceFlag = false;
	const konuParts = [];
	for (let i = 0; i < langRemaining.length; i++) {
		if (langRemaining[i] === "--sablon") {
			sablonFlag = langRemaining[++i];
		} else if (langRemaining[i] === "--force") {
			forceFlag = true;
		} else if (!langRemaining[i].startsWith("--")) {
			konuParts.push(langRemaining[i]);
		}
	}
	const konu = konuParts.join(" ") || "yeni-icerik";
	const dateStr = getDateString();
	const konuSlug = slugify(konu);

	// Benzerlik kontrolu (--force ile atlanir)
	if (!forceFlag) {
		const wsBase = join(process.cwd(), ".claude", "workspace");
		const similar = checkDuplicates(konu, wsBase);
		if (similar.length > 0) {
			console.log(chalk.yellow("UYARI: Benzer icerik tespit edildi!"));
			for (const s of similar) {
				console.log(`  ${chalk.yellow("~")} ${s.dir}/${s.file} ${chalk.dim(`(%${s.similarity} benzerlik)`)}`);
			}
			console.log("");
			console.log(chalk.dim("Devam etmek icin --force kullanin."));
			process.exit(2);
		}
	}

	// Marka ozel durum
	if (subcommand === "marka") {
		const workspaceBase = join(process.cwd(), ".claude", "workspace");
		if (!existsSync(workspaceBase)) mkdirSync(workspaceBase, { recursive: true });

		const createdFiles = [];
		for (const lang of languages) {
			const tmplSet = lang === "en" ? contentTemplatesEN() : contentTemplates();
			const markaFileName = lang === "en" ? "marka-sesi-en.md" : "marka-sesi.md";
			const markaPath = join(workspaceBase, markaFileName);
			if (existsSync(markaPath)) {
				console.error(chalk.yellow(`${markaFileName} zaten mevcut.`));
				continue;
			}
			writeFileSync(markaPath, tmplSet.marka());
			createdFiles.push(markaPath);
		}

		if (createdFiles.length === 0) {
			console.log(chalk.dim("Tum marka sesi dosyalari zaten mevcut."));
			process.exit(1);
		}

		showBanner();
		console.log(chalk.bold.green("Marka sesi rehberi olusturuldu!"));
		for (const f of createdFiles) {
			console.log(`  Dosya: ${chalk.cyan(relative(process.cwd(), f))}`);
		}
		return;
	}

	// Diger sablonlar — dil dongusunde olustur
	const createdFiles = [];
	for (const lang of languages) {
		const tmplSet = lang === "en" ? contentTemplatesEN() : contentTemplates();
		const langSuffix = lang === "en" ? "-en" : "";

		let subdir;
		let fileName;
		let content;

		switch (subcommand) {
			case "post":
				subdir = "icerikler";
				fileName = `${dateStr}-${konuSlug}${langSuffix}.md`;
				content = tmplSet.post(konu);
				break;
			case "karousel":
				subdir = "icerikler";
				fileName = `${dateStr}-karousel-${konuSlug}${langSuffix}.md`;
				content = tmplSet.karousel(konu);
				break;
			case "video":
				subdir = "senaryolar";
				fileName = `${dateStr}-${konuSlug}${langSuffix}.md`;
				content = tmplSet.video(konu);
				break;
			case "gorsel":
				subdir = "gorseller";
				fileName = `${dateStr}-${konuSlug}${langSuffix}-brief.md`;
				content = tmplSet.gorsel(konu);
				break;
			case "takvim":
				subdir = "takvim";
				fileName = `${dateStr}-takvim-${konuSlug}${langSuffix}.md`;
				content = tmplSet.takvim(konu);
				break;
		}

		// --sablon ile ozel sablon birlestirme
		if (sablonFlag) {
			const customTmpl = resolveTemplate(sablonFlag);
			if (customTmpl) {
				content = mergeTemplateContent(content, customTmpl.body);
			}
		}

		const targetDir = getIcerikWorkspace(subdir);
		const targetPath = join(targetDir, fileName);

		if (existsSync(targetPath)) {
			console.error(chalk.yellow(`Dosya zaten mevcut: ${relative(process.cwd(), targetPath)}`));
			continue;
		}

		writeFileSync(targetPath, content);
		createdFiles.push(targetPath);
	}

	if (createdFiles.length === 0) {
		console.log(chalk.dim("Olusturulacak yeni dosya yok."));
		process.exit(1);
	}

	showBanner();
	console.log(chalk.bold.green(`${subcommand.toUpperCase()} sablonu olusturuldu!`));
	console.log(`Konu: ${chalk.cyan(konu)}`);
	if (languages.length > 1) console.log(`Diller: ${chalk.cyan(languages.join(", "))}`);
	if (sablonFlag) console.log(`Sablon: ${chalk.cyan(sablonFlag)}`);
	for (const f of createdFiles) {
		console.log(`  Dosya: ${chalk.cyan(relative(process.cwd(), f))}`);
	}
	console.log("");
	console.log(chalk.bold("Sonraki adimlar:"));
	console.log("  1. Dosyayi ac ve placeholder'lari doldur");
	console.log("  2. Marka sesi rehberini kontrol et: .claude/workspace/marka-sesi.md");
	console.log(
		`  3. Tam interaktif akis icin Claude Code'da ${chalk.cyan("/" + (subcommand === "post" ? "icerik-uret" : subcommand === "video" ? "video-senaryo" : subcommand === "gorsel" ? "gorsel-brief" : subcommand === "takvim" ? "icerik-takvimi" : subcommand === "karousel" ? "karousel" : "icerik-uret"))}`,
	);
}
