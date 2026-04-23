import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
	analyzeSentiment,
	extractKeywords,
	fetchAppStoreReviews,
	LIMITS,
	lookupAppStore,
	lookupPlayStore,
	parseScreenshotUrl,
	searchAppStore,
	validateMetadata,
} from "../aso-helpers.js";
import { chalk, showBanner } from "../cli.js";

// ─── Config ───

const CONFIG_DIR = join(homedir(), ".config", "badi");
const APPS_FILE = join(CONFIG_DIR, "aso-apps.json");

function _loadApps() {
	try {
		if (existsSync(APPS_FILE))
			return JSON.parse(readFileSync(APPS_FILE, "utf-8"));
	} catch {
		/* bozuk */
	}
	return { apps: [] };
}

function _saveApps(data) {
	mkdirSync(CONFIG_DIR, { recursive: true });
	writeFileSync(APPS_FILE, JSON.stringify(data, null, 2), { mode: 0o600 });
}

// ─── audit ───

async function asoAudit(appIdOrAlias, country = "us") {
	showBanner();
	console.log(chalk.bold(`ASO Audit: ${appIdOrAlias}`));
	console.log("");

	const info = await lookupAppStore(appIdOrAlias, country);
	let score = 0;
	let maxScore = 0;
	const issues = [];

	function check(label, condition, weight = 1) {
		maxScore += weight;
		if (condition) {
			console.log(`  ${chalk.green("OK")} ${label}`);
			score += weight;
		} else {
			console.log(`  ${chalk.red("XX")} ${label}`);
			issues.push(label);
		}
	}

	function warn(label, condition) {
		if (condition) console.log(`  ${chalk.green("OK")} ${label}`);
		else console.log(`  ${chalk.yellow("!!")} ${label}`);
	}

	console.log(chalk.bold("App Bilgisi:"));
	console.log(`  Name:    ${chalk.cyan(info.name)}`);
	console.log(`  Seller:  ${chalk.cyan(info.seller)}`);
	console.log(`  Version: ${chalk.cyan(info.version)}`);
	console.log(`  Genre:   ${chalk.cyan(info.primaryGenre)}`);
	console.log(
		`  Rating:  ${chalk.cyan(info.averageRating?.toFixed(1) ?? "?")} (${info.ratingCount ?? 0} oy)`,
	);
	console.log("");

	console.log(chalk.bold("Metadata Kontrolleri:"));
	const nameVal = validateMetadata("appstore", "title", info.name);
	check(`Title uzunlugu (${nameVal.length}/${nameVal.limit})`, nameVal.ok, 2);

	if (info.subtitle) {
		const subVal = validateMetadata("appstore", "subtitle", info.subtitle);
		check(`Subtitle uzunlugu (${subVal.length}/${subVal.limit})`, subVal.ok);
	} else {
		console.log(
			`  ${chalk.yellow("!!")} Subtitle tanimlanmamis (SEO firsati kacti)`,
		);
	}

	const descLen = info.description.length;
	check(`Description uzunlugu >= 500 karakter (${descLen})`, descLen >= 500);
	check(`Description uzunlugu <= 4000 karakter (${descLen})`, descLen <= 4000);

	console.log("");
	console.log(chalk.bold("Gorseller:"));
	check(
		`Screenshot sayisi >= 3 (${info.screenshotUrls.length})`,
		info.screenshotUrls.length >= 3,
		2,
	);
	warn(
		`Screenshot sayisi >= 6 (${info.screenshotUrls.length})`,
		info.screenshotUrls.length >= 6,
	);

	console.log("");
	console.log(chalk.bold("Teknik:"));
	check("iOS minimum surumu tanimli", !!info.minimumOsVersion);
	warn(
		`Desteklenen dil sayisi (${info.supportedLanguages.length})`,
		info.supportedLanguages.length >= 2,
	);

	console.log("");
	console.log(chalk.bold("Sosyal Kanit:"));
	check(
		`Rating count >= 100 (${info.ratingCount ?? 0})`,
		(info.ratingCount ?? 0) >= 100,
		2,
	);
	warn(
		`Ortalama rating >= 4.0 (${info.averageRating?.toFixed(1) ?? "?"})`,
		(info.averageRating ?? 0) >= 4.0,
	);

	// Keyword analizi
	console.log("");
	console.log(chalk.bold("Top Keywords (description):"));
	const kws = extractKeywords(info.description).slice(0, 10);
	for (const [kw, freq] of kws) {
		console.log(`  ${chalk.cyan(kw.padEnd(20))} ${chalk.dim(`${freq}x`)}`);
	}

	// Skor
	console.log("");
	console.log(chalk.bold("═".repeat(50)));
	const pct = Math.round((score / maxScore) * 100);
	const color =
		pct >= 80
			? chalk.bold.green
			: pct >= 60
				? chalk.bold.yellow
				: chalk.bold.red;
	console.log(`  ASO Skoru: ${color(`${pct}/100`)} (${score}/${maxScore})`);

	if (issues.length > 0) {
		console.log("");
		console.log(chalk.bold("Duzeltilmesi Gereken:"));
		for (const i of issues) console.log(`  ${chalk.red("-")} ${i}`);
	}
}

// ─── keywords ───

async function asoKeywords(appId, country = "us") {
	showBanner();
	console.log(chalk.bold(`Keyword Analizi: ${appId}`));
	console.log("");

	const info = await lookupAppStore(appId, country);
	console.log(`  App: ${chalk.cyan(info.name)}`);
	console.log("");

	const titleKws = extractKeywords(info.name).slice(0, 10);
	const subKws = extractKeywords(info.subtitle).slice(0, 10);
	const descKws = extractKeywords(info.description).slice(0, 20);

	console.log(chalk.bold("Title Keywords:"));
	for (const [k, f] of titleKws)
		console.log(`  ${chalk.cyan(k)} ${chalk.dim(`${f}x`)}`);

	if (subKws.length > 0) {
		console.log("");
		console.log(chalk.bold("Subtitle Keywords:"));
		for (const [k, f] of subKws)
			console.log(`  ${chalk.cyan(k)} ${chalk.dim(`${f}x`)}`);
	}

	console.log("");
	console.log(chalk.bold("Description Keywords (top 20):"));
	for (const [k, f] of descKws)
		console.log(`  ${chalk.cyan(k.padEnd(20))} ${chalk.dim(`${f}x`)}`);
}

// ─── metadata ───

function asoMetadata(platform = "appstore") {
	if (!LIMITS[platform]) {
		console.error(
			chalk.red(`Gecersiz platform: ${platform} (appstore|playstore)`),
		);
		process.exit(1);
	}
	showBanner();
	console.log(chalk.bold(`Metadata Rehberi: ${platform}`));
	console.log("");

	console.log(chalk.bold("Karakter Limitleri:"));
	const limits = LIMITS[platform];
	for (const [k, v] of Object.entries(limits)) {
		console.log(
			`  ${chalk.cyan(k.padEnd(15))} ${chalk.yellow(`${v} karakter`)}`,
		);
	}

	console.log("");
	console.log(chalk.bold("TR/EN Sablon:"));
	if (platform === "appstore") {
		console.log(chalk.dim("  Title (30):       [Marka] - [Ana Fayda]"));
		console.log(
			chalk.dim("  Subtitle (30):    [Kullanici tipini cozen tek cumle]"),
		);
		console.log(
			chalk.dim(
				"  Keywords (100):   virgul,ayrimli,hic,bosluk,yok,100,karakter",
			),
		);
		console.log(
			chalk.dim(
				"  Description:      Hook (ilk 3 satir) + Ozellikler + Sosyal kanit + CTA",
			),
		);
		console.log(
			chalk.dim("  Promo Text (170): Yeni ozellik duyurusu / kampanya"),
		);
	} else {
		console.log(
			chalk.dim("  Title (50):       [Marka] - [Ana Fayda ve Kategori]"),
		);
		console.log(
			chalk.dim("  Short (80):       Appi tek cumlede aciklayan hook"),
		);
		console.log(
			chalk.dim(
				"  Description:      Full description, formatted with emojis + bullets",
			),
		);
	}

	console.log("");
	console.log(chalk.bold("Ipuclari:"));
	console.log("  - Title'a en guclu keyword'u yerlestir (ilk 30 karakter)");
	console.log("  - Keywords alani: marka rakiplerini dahil etme (rejected)");
	console.log("  - Description: ilk 3 satir hook, kalan detaylar");
	console.log("  - Localizasyon: her dilde ayri keyword optimizasyonu");
}

// ─── compete ───

async function asoCompete(myAppId, competitorId, country = "us") {
	showBanner();
	console.log(chalk.bold("Rakip Karsilastirma"));
	console.log("");

	const [me, they] = await Promise.all([
		lookupAppStore(myAppId, country),
		lookupAppStore(competitorId, country),
	]);

	const rows = [
		["Name", me.name, they.name],
		["Version", me.version, they.version],
		["Genre", me.primaryGenre, they.primaryGenre],
		[
			"Rating",
			`${me.averageRating?.toFixed(1) ?? "?"} (${me.ratingCount ?? 0})`,
			`${they.averageRating?.toFixed(1) ?? "?"} (${they.ratingCount ?? 0})`,
		],
		["Title len", String(me.name.length), String(they.name.length)],
		[
			"Desc len",
			String(me.description.length),
			String(they.description.length),
		],
		[
			"Screenshots",
			String(me.screenshotUrls.length),
			String(they.screenshotUrls.length),
		],
		["Min iOS", me.minimumOsVersion, they.minimumOsVersion],
		[
			"Languages",
			String(me.supportedLanguages.length),
			String(they.supportedLanguages.length),
		],
		[
			"Size (MB)",
			(me.fileSizeBytes / 1048576).toFixed(1),
			(they.fileSizeBytes / 1048576).toFixed(1),
		],
	];

	const col1 = 14,
		col2 = 28,
		col3 = 28;
	console.log(
		`  ${chalk.dim("Metric".padEnd(col1))}${chalk.dim("Me".padEnd(col2))}${chalk.dim("Competitor")}`,
	);
	console.log(chalk.dim(`  ${"─".repeat(col1 + col2 + col3)}`));
	for (const [label, mine, theirs] of rows) {
		console.log(
			`  ${label.padEnd(col1)}${String(mine)
				.substring(0, col2 - 2)
				.padEnd(col2)}${String(theirs).substring(0, col3 - 2)}`,
		);
	}

	// Ortak keywordler
	const myKws = new Set(
		extractKeywords(me.description)
			.slice(0, 30)
			.map(([k]) => k),
	);
	const theirKws = new Set(
		extractKeywords(they.description)
			.slice(0, 30)
			.map(([k]) => k),
	);
	const shared = [...myKws].filter((k) => theirKws.has(k));
	const onlyThem = [...theirKws].filter((k) => !myKws.has(k));

	console.log("");
	console.log(chalk.bold(`Ortak Keywordler (${shared.length}):`));
	console.log(`  ${chalk.dim(shared.slice(0, 15).join(", "))}`);

	console.log("");
	console.log(
		chalk.bold(`Rakibin Kullanip Sizin Kullanmadiginiz (${onlyThem.length}):`),
	);
	console.log(`  ${chalk.yellow(onlyThem.slice(0, 15).join(", "))}`);
}

// ─── review ───

async function asoReview(appId, country = "us") {
	showBanner();
	const info = await lookupAppStore(appId, country);
	console.log(chalk.bold(`Review Bilgileri: ${info.name}`));
	console.log("");

	console.log(chalk.bold("Mevcut Durum:"));
	console.log(
		`  Ortalama Rating: ${chalk.cyan(info.averageRating?.toFixed(2) ?? "?")}`,
	);
	console.log(`  Toplam Oy:       ${chalk.cyan(info.ratingCount ?? 0)}`);
	console.log(
		`  Son Surum:       ${chalk.cyan(info.version)} (${info.updatedAt?.substring(0, 10)})`,
	);
	console.log("");

	console.log(chalk.bold("Response Sablonlari:"));
	console.log("");
	console.log(chalk.cyan("Pozitif Review Yaniti:"));
	console.log(
		chalk.dim(
			`  "[Kullanici adi], guzel yorumunuz icin tesekkurler! [Spesifik ozellik]'in size yardimci olmasina seviniyoruz. Yeni ozellikler icin bizi takip edin."`,
		),
	);
	console.log("");
	console.log(chalk.cyan("Negatif Review Yaniti (bug):"));
	console.log(
		chalk.dim(
			`  "[Kullanici adi], yasadiginiz sorun icin ozur dileriz. Lutfen destek@example.com'a [cihaz modeli + iOS surumu] ile ulasin. En kisa surede cozelim."`,
		),
	);
	console.log("");
	console.log(chalk.cyan("Negatif Review Yaniti (feature):"));
	console.log(
		chalk.dim(
			`  "[Kullanici adi], geri bildiriminiz icin tesekkurler! [Istenen ozellik]'i roadmap'e aldik. Yeni surumde goreceksiniz."`,
		),
	);
	console.log("");
	console.log(
		chalk.dim(
			"Not: Detayli sentiment analizi icin Claude Code'da /aso-strategist ajanini cagirin.",
		),
	);
}

// ─── screenshots ───

function asoScreenshots() {
	showBanner();
	console.log(chalk.bold("App Store / Play Store Screenshot Rehberi"));
	console.log("");

	console.log(chalk.bold("iOS Boyutlari (zorunlu):"));
	console.log(`  ${chalk.cyan('6.5" (iPhone 11 Pro Max)')} 1242 x 2688 px`);
	console.log(`  ${chalk.cyan('5.5" (iPhone 8 Plus)')}    1242 x 2208 px`);
	console.log(`  ${chalk.cyan('12.9" iPad Pro (3rd+)')}   2048 x 2732 px`);
	console.log("");
	console.log(chalk.bold("iOS Boyutlari (opsiyonel):"));
	console.log(`  ${chalk.dim('6.7" (iPhone 14 Pro Max)')} 1290 x 2796 px`);
	console.log(`  ${chalk.dim('5.8" (iPhone 11 Pro)')}    1125 x 2436 px`);
	console.log(`  ${chalk.dim('4.7" (iPhone 8)')}          750 x 1334 px`);

	console.log("");
	console.log(chalk.bold("Android Boyutlari:"));
	console.log(
		`  ${chalk.cyan("Phone")}   1080 x 1920 px (min) - 2-8 screenshot`,
	);
	console.log(`  ${chalk.cyan('7" Tablet')} 1200 x 1920 px`);
	console.log(`  ${chalk.cyan('10" Tablet')} 1920 x 1200 px`);
	console.log(`  ${chalk.cyan("Feature Graphic")} 1024 x 500 px (zorunlu)`);

	console.log("");
	console.log(chalk.bold("Tasarim Rehberi:"));
	console.log("  1. Ilk screenshot en onemli — value proposition");
	console.log("  2. Metin: max 5 kelime, buyuk punto (>= 40pt)");
	console.log("  3. Device frame ekleyin (daha profesyonel)");
	console.log("  4. Action/benefit gosterin, statik UI yerine");
	console.log("  5. Brand rengi + sade arka plan");
	console.log("  6. Carousel mantigi: hikaye anlatsin");

	console.log("");
	console.log(
		chalk.dim('Detayli brief icin: badi icerik gorsel "app store screenshot"'),
	);
}

// ─── playstore audit ───

async function asoPlaystore(appIdOrPackage, country = "us", lang = "en") {
	showBanner();
	console.log(chalk.bold(`Play Store Audit: ${appIdOrPackage}`));
	console.log("");

	const info = await lookupPlayStore(appIdOrPackage, country, lang);
	let score = 0;
	let maxScore = 0;
	const issues = [];

	function check(label, condition, weight = 1) {
		maxScore += weight;
		if (condition) {
			console.log(`  ${chalk.green("OK")} ${label}`);
			score += weight;
		} else {
			console.log(`  ${chalk.red("XX")} ${label}`);
			issues.push(label);
		}
	}

	console.log(chalk.bold("App Bilgisi:"));
	console.log(`  Name:   ${chalk.cyan(info.name || "?")}`);
	console.log(
		`  Rating: ${chalk.cyan(info.averageRating?.toFixed(1) ?? "?")} (${info.ratingCount ?? 0} oy)`,
	);
	console.log("");

	console.log(chalk.bold("Metadata Kontrolleri:"));
	const titleVal = validateMetadata("playstore", "title", info.name);
	check(
		`Title uzunlugu (${titleVal.length}/${titleVal.limit})`,
		titleVal.ok,
		2,
	);

	const descLen = (info.description || "").length;
	check(`Description >= 500 karakter (${descLen})`, descLen >= 500);
	check(`Description <= 4000 karakter (${descLen})`, descLen <= 4000);

	console.log("");
	console.log(chalk.bold("Sosyal Kanit:"));
	check(
		`Rating count >= 100 (${info.ratingCount ?? 0})`,
		(info.ratingCount ?? 0) >= 100,
		2,
	);
	check(
		`Ortalama rating >= 4.0 (${info.averageRating?.toFixed(1) ?? "?"})`,
		(info.averageRating ?? 0) >= 4.0,
	);

	if (info.description) {
		console.log("");
		console.log(chalk.bold("Top Keywords (description):"));
		const kws = extractKeywords(info.description).slice(0, 10);
		for (const [kw, freq] of kws) {
			console.log(`  ${chalk.cyan(kw.padEnd(20))} ${chalk.dim(`${freq}x`)}`);
		}
	}

	console.log("");
	console.log(chalk.bold("═".repeat(50)));
	const pct = Math.round((score / maxScore) * 100);
	const color =
		pct >= 80
			? chalk.bold.green
			: pct >= 60
				? chalk.bold.yellow
				: chalk.bold.red;
	console.log(
		`  ASO Skoru (Play Store): ${color(`${pct}/100`)} (${score}/${maxScore})`,
	);

	if (issues.length > 0) {
		console.log("");
		console.log(chalk.bold("Duzeltilmesi Gereken:"));
		for (const i of issues) console.log(`  ${chalk.red("-")} ${i}`);
	}

	console.log("");
	console.log(
		chalk.dim(
			"Not: Play Store verileri sinirli (HTML scraping). Screenshot/short desc icin Console'a bakin.",
		),
	);
}

// ─── reviews (real data + sentiment) ───

async function asoReviews(appId, country = "us", pages = 2) {
	showBanner();
	console.log(chalk.bold(`Review Analizi: ${appId} (${country})`));
	console.log("");

	const all = [];
	for (let p = 1; p <= pages; p++) {
		try {
			const batch = await fetchAppStoreReviews(appId, country, p);
			all.push(...batch);
			if (batch.length === 0) break;
		} catch (e) {
			if (p === 1) throw e;
			break;
		}
	}

	if (all.length === 0) {
		console.log(chalk.yellow("Yorum bulunamadi."));
		console.log(
			chalk.dim("Not: Yeni uygulamalar RSS feed'de henuz gorunmuyor olabilir."),
		);
		return;
	}

	const analysis = analyzeSentiment(all);

	console.log(chalk.bold(`Cekilen Yorumlar: ${analysis.total}`));
	console.log(
		`Ortalama Rating: ${chalk.cyan(analysis.averageRating.toFixed(2))}`,
	);
	console.log("");

	console.log(chalk.bold("Kategori Dagilimi:"));
	const rows = [
		[
			"Pozitif",
			analysis.counts.positive,
			analysis.percentages.positive,
			chalk.green,
		],
		[
			"Negatif",
			analysis.counts.negative,
			analysis.percentages.negative,
			chalk.red,
		],
		["Bug/Hata", analysis.counts.bug, analysis.percentages.bug, chalk.red],
		[
			"Feature Talep",
			analysis.counts.feature_request,
			analysis.percentages.feature_request,
			chalk.yellow,
		],
		["Notr", analysis.counts.neutral, analysis.percentages.neutral, chalk.dim],
	];
	for (const [label, count, pct, color] of rows) {
		const bar = "█".repeat(Math.max(0, Math.floor(pct / 3)));
		console.log(
			`  ${color(label.padEnd(15))} ${String(count).padEnd(4)} ${chalk.dim(`%${pct}`.padEnd(5))} ${color(bar)}`,
		);
	}

	// En kritik 5 review
	const critical = analysis.categorized
		.filter(
			(r) => r.categories.includes("bug") || r.categories.includes("negative"),
		)
		.slice(0, 5);

	if (critical.length > 0) {
		console.log("");
		console.log(chalk.bold("Kritik Yorumlar (ilk 5):"));
		for (const r of critical) {
			console.log(
				`  ${chalk.red("★".repeat(r.rating))} ${chalk.cyan(r.author || "?")} (v${r.version || "?"})`,
			);
			console.log(`    ${chalk.bold(r.title)}`);
			console.log(
				`    ${chalk.dim(r.content.substring(0, 120).replace(/\n/g, " "))}${r.content.length > 120 ? "..." : ""}`,
			);
			console.log(`    ${chalk.dim(`Kategori: ${r.categories.join(", ")}`)}`);
			console.log("");
		}
	}

	// Feature talepleri
	const features = analysis.categorized
		.filter((r) => r.categories.includes("feature_request"))
		.slice(0, 5);

	if (features.length > 0) {
		console.log(chalk.bold("Feature Talepleri (ilk 5):"));
		for (const r of features) {
			console.log(
				`  ${chalk.yellow("→")} ${chalk.bold(r.title)} — ${chalk.dim(r.author || "?")}`,
			);
			console.log(
				`    ${chalk.dim(r.content.substring(0, 100).replace(/\n/g, " "))}${r.content.length > 100 ? "..." : ""}`,
			);
		}
		console.log("");
	}

	console.log(
		chalk.dim(
			"Basit anahtar kelime siniflandirma. Detay icin /aso-strategist ajanini cagirin.",
		),
	);
}

// ─── screenshots (app-specific: actual assets) ───

async function asoScreenshotsFor(appId, country = "us") {
	showBanner();
	const info = await lookupAppStore(appId, country);
	console.log(chalk.bold(`Screenshot Varliklari: ${info.name}`));
	console.log("");

	const shots = (info.screenshotUrls || []).map(parseScreenshotUrl);
	if (shots.length === 0) {
		console.log(chalk.yellow("Bu uygulamada screenshot URL'si yok."));
		return;
	}

	console.log(chalk.bold(`Toplam: ${shots.length} adet`));
	console.log("");

	// Orientation dagilimi
	const portrait = shots.filter((s) => s.orientation === "portrait").length;
	const landscape = shots.filter((s) => s.orientation === "landscape").length;
	console.log(chalk.bold("Yonelim:"));
	console.log(`  Portrait:  ${chalk.cyan(portrait)}`);
	console.log(`  Landscape: ${chalk.cyan(landscape)}`);
	console.log("");

	// Cozunurluk dagilimi
	console.log(chalk.bold("Cozunurlukler:"));
	const byRes = {};
	for (const s of shots) {
		if (s.width && s.height) {
			const key = `${s.width}x${s.height}`;
			byRes[key] = (byRes[key] || 0) + 1;
		}
	}
	for (const [res, count] of Object.entries(byRes).sort(
		(a, b) => b[1] - a[1],
	)) {
		console.log(
			`  ${chalk.cyan(res.padEnd(12))} ${chalk.dim(`${count} adet`)}`,
		);
	}
	console.log("");

	// URL'ler (ilk 10)
	console.log(chalk.bold("URL Ornekleri (ilk 5):"));
	for (const s of shots.slice(0, 5)) {
		console.log(
			`  ${chalk.dim(s.url.substring(0, 80))}${s.url.length > 80 ? "..." : ""}`,
		);
	}

	console.log("");
	console.log(chalk.bold("Oneriler:"));
	if (shots.length < 3)
		console.log(
			`  ${chalk.yellow("!!")} Screenshot < 3 (minimum 3, ideal 6-10)`,
		);
	if (shots.length >= 3 && shots.length < 6)
		console.log(`  ${chalk.yellow("!!")} 6+ screenshot conversion'i arttirir`);
	if (shots.length >= 6)
		console.log(`  ${chalk.green("OK")} Screenshot sayisi yeterli`);
	if (landscape > portrait)
		console.log(
			`  ${chalk.yellow("!!")} Landscape agirlikli — mobil uygulamalarda genelde portrait tercih edilir`,
		);
	console.log("");
	console.log(
		chalk.dim(
			"Gorsel tasarim analizi icin app-store-screenshots skill'ini Claude Code'da tetikleyin.",
		),
	);
}

// ─── Ana komut ───

export async function runAso(args) {
	const sub = args[0];

	if (!sub || sub === "--help" || sub === "-h") {
		showBanner();
		console.log(chalk.bold("ASO — App Store Optimization:"));
		console.log("");
		console.log(
			`  ${chalk.cyan("badi aso audit")} [app-id]          App listing denetimi (iOS)`,
		);
		console.log(
			`  ${chalk.cyan("badi aso playstore")} [app-id]     Play Store listing denetimi (v1.11+)`,
		);
		console.log(
			`  ${chalk.cyan("badi aso keywords")} [app-id]       Keyword analizi`,
		);
		console.log(
			`  ${chalk.cyan("badi aso metadata")} [platform]     Metadata limit rehberi`,
		);
		console.log(
			`  ${chalk.cyan("badi aso review")} [app-id]         Review response sablonlari`,
		);
		console.log(
			`  ${chalk.cyan("badi aso reviews")} [app-id]        Gercek yorumlari cek + sentiment analiz (v1.11+)`,
		);
		console.log(
			`  ${chalk.cyan("badi aso compete")} [id1] [id2]     Iki app karsilastirma`,
		);
		console.log(
			`  ${chalk.cyan("badi aso screenshots")} [app-id?]   Rehber + app-spesifik varlik dokumunu (v1.11+)`,
		);
		console.log(
			`  ${chalk.cyan("badi aso search")} [sorgu]          App Store arama`,
		);
		console.log("");
		console.log(chalk.bold("Ornekler:"));
		console.log("  badi aso audit 284882215        # Facebook iOS");
		console.log("  badi aso playstore com.facebook.katana  # Facebook Android");
		console.log("  badi aso reviews 284882215 --country us");
		console.log(
			"  badi aso screenshots 284882215  # Uygulamaya ait screenshot varlik analizi",
		);
		console.log("  badi aso keywords 284882215");
		console.log("  badi aso metadata appstore");
		console.log("  badi aso compete 284882215 310633997");
		console.log("  badi aso search 'todo list' --country tr");
		console.log("");
		console.log(
			chalk.dim(
				"Not: Detayli strateji icin Claude Code'da /aso-master cagirin.",
			),
		);
		return;
	}

	// Country flag
	let country = "us";
	const countryIdx = args.indexOf("--country");
	if (countryIdx >= 0) {
		country = args[countryIdx + 1] || "us";
	}

	try {
		switch (sub) {
			case "audit":
				if (!args[1]) {
					console.error(chalk.red("App ID gerekli"));
					process.exit(1);
				}
				await asoAudit(args[1], country);
				break;
			case "keywords":
				if (!args[1]) {
					console.error(chalk.red("App ID gerekli"));
					process.exit(1);
				}
				await asoKeywords(args[1], country);
				break;
			case "metadata":
				asoMetadata(args[1] || "appstore");
				break;
			case "review":
				if (!args[1]) {
					console.error(chalk.red("App ID gerekli"));
					process.exit(1);
				}
				await asoReview(args[1], country);
				break;
			case "compete":
				if (!args[1] || !args[2]) {
					console.error(
						chalk.red("Iki App ID gerekli: badi aso compete [id1] [id2]"),
					);
					process.exit(1);
				}
				await asoCompete(args[1], args[2], country);
				break;
			case "screenshots":
				if (args[1]) await asoScreenshotsFor(args[1], country);
				else asoScreenshots();
				break;
			case "playstore":
				if (!args[1]) {
					console.error(chalk.red("App ID / package gerekli"));
					process.exit(1);
				}
				await asoPlaystore(args[1], country);
				break;
			case "reviews":
				if (!args[1]) {
					console.error(chalk.red("App ID gerekli"));
					process.exit(1);
				}
				await asoReviews(args[1], country);
				break;
			case "search": {
				if (!args[1]) {
					console.error(chalk.red("Sorgu gerekli"));
					process.exit(1);
				}
				const results = await searchAppStore(args[1], country, 10);
				showBanner();
				console.log(
					chalk.bold(`Arama Sonuclari: "${args[1]}" (${results.length})`),
				);
				console.log("");
				for (const r of results) {
					console.log(`  ${chalk.cyan(r.id)} ${r.name}`);
					console.log(
						`    ${chalk.dim(`${r.seller} | ${r.genre} | ${r.rating?.toFixed(1) ?? "?"} (${r.ratingCount ?? 0})`)}`,
					);
				}
				break;
			}
			default:
				console.error(chalk.red(`Bilinmeyen aso komutu: ${sub}`));
				console.log(
					"Kullanim: badi aso [audit|playstore|keywords|metadata|review|reviews|compete|screenshots|search]",
				);
				process.exit(1);
		}
	} catch (e) {
		console.error(chalk.red(`Hata: ${e.message}`));
		process.exit(1);
	}
}
