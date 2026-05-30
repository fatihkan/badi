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

	console.log(chalk.bold("App Info:"));
	console.log(`  Name:    ${chalk.cyan(info.name)}`);
	console.log(`  Seller:  ${chalk.cyan(info.seller)}`);
	console.log(`  Version: ${chalk.cyan(info.version)}`);
	console.log(`  Genre:   ${chalk.cyan(info.primaryGenre)}`);
	console.log(
		`  Rating:  ${chalk.cyan(info.averageRating?.toFixed(1) ?? "?")} (${info.ratingCount ?? 0} ratings)`,
	);
	console.log("");

	console.log(chalk.bold("Metadata Checks:"));
	const nameVal = validateMetadata("appstore", "title", info.name);
	check(`Title length (${nameVal.length}/${nameVal.limit})`, nameVal.ok, 2);

	if (info.subtitle) {
		const subVal = validateMetadata("appstore", "subtitle", info.subtitle);
		check(`Subtitle length (${subVal.length}/${subVal.limit})`, subVal.ok);
	} else {
		console.log(
			`  ${chalk.yellow("!!")} Subtitle not defined (missed SEO opportunity)`,
		);
	}

	const descLen = info.description.length;
	check(`Description length >= 500 chars (${descLen})`, descLen >= 500);
	check(`Description length <= 4000 chars (${descLen})`, descLen <= 4000);

	console.log("");
	console.log(chalk.bold("Visuals:"));
	check(
		`Screenshot count >= 3 (${info.screenshotUrls.length})`,
		info.screenshotUrls.length >= 3,
		2,
	);
	warn(
		`Screenshot count >= 6 (${info.screenshotUrls.length})`,
		info.screenshotUrls.length >= 6,
	);

	console.log("");
	console.log(chalk.bold("Technical:"));
	check("iOS minimum version defined", !!info.minimumOsVersion);
	warn(
		`Supported language count (${info.supportedLanguages.length})`,
		info.supportedLanguages.length >= 2,
	);

	console.log("");
	console.log(chalk.bold("Social Proof:"));
	check(
		`Rating count >= 100 (${info.ratingCount ?? 0})`,
		(info.ratingCount ?? 0) >= 100,
		2,
	);
	warn(
		`Average rating >= 4.0 (${info.averageRating?.toFixed(1) ?? "?"})`,
		(info.averageRating ?? 0) >= 4.0,
	);

	// Keyword analysis
	console.log("");
	console.log(chalk.bold("Top Keywords (description):"));
	const kws = extractKeywords(info.description).slice(0, 10);
	for (const [kw, freq] of kws) {
		console.log(`  ${chalk.cyan(kw.padEnd(20))} ${chalk.dim(`${freq}x`)}`);
	}

	// Score
	console.log("");
	console.log(chalk.bold("═".repeat(50)));
	const pct = Math.round((score / maxScore) * 100);
	const color =
		pct >= 80
			? chalk.bold.green
			: pct >= 60
				? chalk.bold.yellow
				: chalk.bold.red;
	console.log(`  ASO Score: ${color(`${pct}/100`)} (${score}/${maxScore})`);

	if (issues.length > 0) {
		console.log("");
		console.log(chalk.bold("Needs Fixing:"));
		for (const i of issues) console.log(`  ${chalk.red("-")} ${i}`);
	}
}

// ─── keywords ───

async function asoKeywords(appId, country = "us") {
	showBanner();
	console.log(chalk.bold(`Keyword Analysis: ${appId}`));
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
			chalk.red(`Invalid platform: ${platform} (appstore|playstore)`),
		);
		process.exit(1);
	}
	showBanner();
	console.log(chalk.bold(`Metadata Guide: ${platform}`));
	console.log("");

	console.log(chalk.bold("Character Limits:"));
	const limits = LIMITS[platform];
	for (const [k, v] of Object.entries(limits)) {
		console.log(`  ${chalk.cyan(k.padEnd(15))} ${chalk.yellow(`${v} chars`)}`);
	}

	console.log("");
	console.log(chalk.bold("Template:"));
	if (platform === "appstore") {
		console.log(chalk.dim("  Title (30):       [Brand] - [Main Benefit]"));
		console.log(
			chalk.dim("  Subtitle (30):    [One sentence solving the user's need]"),
		);
		console.log(
			chalk.dim(
				"  Keywords (100):   comma,separated,no,spaces,up,to,100,chars",
			),
		);
		console.log(
			chalk.dim(
				"  Description:      Hook (first 3 lines) + Features + Social proof + CTA",
			),
		);
		console.log(
			chalk.dim("  Promo Text (170): New feature announcement / campaign"),
		);
	} else {
		console.log(
			chalk.dim("  Title (50):       [Brand] - [Main Benefit and Category]"),
		);
		console.log(
			chalk.dim("  Short (80):       Hook describing the app in one sentence"),
		);
		console.log(
			chalk.dim(
				"  Description:      Full description, formatted with emojis + bullets",
			),
		);
	}

	console.log("");
	console.log(chalk.bold("Tips:"));
	console.log("  - Place your strongest keyword in the title (first 30 chars)");
	console.log(
		"  - Keywords field: do not include competitor brands (rejected)",
	);
	console.log("  - Description: first 3 lines hook, remaining details after");
	console.log("  - Localization: optimize keywords separately per language");
}

// ─── compete ───

async function asoCompete(myAppId, competitorId, country = "us") {
	showBanner();
	console.log(chalk.bold("Competitor Comparison"));
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

	// Shared keywords
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
	console.log(chalk.bold(`Shared Keywords (${shared.length}):`));
	console.log(`  ${chalk.dim(shared.slice(0, 15).join(", "))}`);

	console.log("");
	console.log(chalk.bold(`Competitor Uses, You Don't (${onlyThem.length}):`));
	console.log(`  ${chalk.yellow(onlyThem.slice(0, 15).join(", "))}`);
}

// ─── review ───

async function asoReview(appId, country = "us") {
	showBanner();
	const info = await lookupAppStore(appId, country);
	console.log(chalk.bold(`Review Info: ${info.name}`));
	console.log("");

	console.log(chalk.bold("Current Status:"));
	console.log(
		`  Average Rating: ${chalk.cyan(info.averageRating?.toFixed(2) ?? "?")}`,
	);
	console.log(`  Total Ratings:  ${chalk.cyan(info.ratingCount ?? 0)}`);
	console.log(
		`  Latest Version: ${chalk.cyan(info.version)} (${info.updatedAt?.substring(0, 10)})`,
	);
	console.log("");

	console.log(chalk.bold("Response Templates:"));
	console.log("");
	console.log(chalk.cyan("Positive Review Reply:"));
	console.log(
		chalk.dim(
			`  "[User name], thanks for your kind review! We're glad [specific feature] is helping you. Follow us for new features."`,
		),
	);
	console.log("");
	console.log(chalk.cyan("Negative Review Reply (bug):"));
	console.log(
		chalk.dim(
			`  "[User name], we're sorry for the trouble. Please reach support@example.com with [device model + iOS version]. We'll resolve it as soon as possible."`,
		),
	);
	console.log("");
	console.log(chalk.cyan("Negative Review Reply (feature):"));
	console.log(
		chalk.dim(
			`  "[User name], thanks for your feedback! We've added [requested feature] to the roadmap. You'll see it in an upcoming release."`,
		),
	);
	console.log("");
	console.log(
		chalk.dim(
			"Note: For detailed sentiment analysis, call the /aso-strategist agent in Claude Code.",
		),
	);
}

// ─── screenshots ───

function asoScreenshots() {
	showBanner();
	console.log(chalk.bold("App Store / Play Store Screenshot Guide"));
	console.log("");

	console.log(chalk.bold("iOS Sizes (required):"));
	console.log(`  ${chalk.cyan('6.5" (iPhone 11 Pro Max)')} 1242 x 2688 px`);
	console.log(`  ${chalk.cyan('5.5" (iPhone 8 Plus)')}    1242 x 2208 px`);
	console.log(`  ${chalk.cyan('12.9" iPad Pro (3rd+)')}   2048 x 2732 px`);
	console.log("");
	console.log(chalk.bold("iOS Sizes (optional):"));
	console.log(`  ${chalk.dim('6.7" (iPhone 14 Pro Max)')} 1290 x 2796 px`);
	console.log(`  ${chalk.dim('5.8" (iPhone 11 Pro)')}    1125 x 2436 px`);
	console.log(`  ${chalk.dim('4.7" (iPhone 8)')}          750 x 1334 px`);

	console.log("");
	console.log(chalk.bold("Android Sizes:"));
	console.log(
		`  ${chalk.cyan("Phone")}   1080 x 1920 px (min) - 2-8 screenshots`,
	);
	console.log(`  ${chalk.cyan('7" Tablet')} 1200 x 1920 px`);
	console.log(`  ${chalk.cyan('10" Tablet')} 1920 x 1200 px`);
	console.log(`  ${chalk.cyan("Feature Graphic")} 1024 x 500 px (required)`);

	console.log("");
	console.log(chalk.bold("Design Guide:"));
	console.log("  1. First screenshot matters most — value proposition");
	console.log("  2. Text: max 5 words, large font (>= 40pt)");
	console.log("  3. Add a device frame (more professional)");
	console.log("  4. Show action/benefit, not static UI");
	console.log("  5. Brand color + clean background");
	console.log("  6. Carousel logic: tell a story");

	console.log("");
	console.log(
		chalk.dim(
			'For a detailed brief: badi icerik gorsel "app store screenshot"',
		),
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

	console.log(chalk.bold("App Info:"));
	console.log(`  Name:   ${chalk.cyan(info.name || "?")}`);
	console.log(
		`  Rating: ${chalk.cyan(info.averageRating?.toFixed(1) ?? "?")} (${info.ratingCount ?? 0} ratings)`,
	);
	console.log("");

	console.log(chalk.bold("Metadata Checks:"));
	const titleVal = validateMetadata("playstore", "title", info.name);
	check(`Title length (${titleVal.length}/${titleVal.limit})`, titleVal.ok, 2);

	const descLen = (info.description || "").length;
	check(`Description >= 500 chars (${descLen})`, descLen >= 500);
	check(`Description <= 4000 chars (${descLen})`, descLen <= 4000);

	console.log("");
	console.log(chalk.bold("Social Proof:"));
	check(
		`Rating count >= 100 (${info.ratingCount ?? 0})`,
		(info.ratingCount ?? 0) >= 100,
		2,
	);
	check(
		`Average rating >= 4.0 (${info.averageRating?.toFixed(1) ?? "?"})`,
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
		`  ASO Score (Play Store): ${color(`${pct}/100`)} (${score}/${maxScore})`,
	);

	if (issues.length > 0) {
		console.log("");
		console.log(chalk.bold("Needs Fixing:"));
		for (const i of issues) console.log(`  ${chalk.red("-")} ${i}`);
	}

	console.log("");
	console.log(
		chalk.dim(
			"Note: Play Store data is limited (HTML scraping). Check the Console for screenshots / short description.",
		),
	);
}

// ─── reviews (real data + sentiment) ───

async function asoReviews(appId, country = "us", pages = 2) {
	showBanner();
	console.log(chalk.bold(`Review Analysis: ${appId} (${country})`));
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
		console.log(chalk.yellow("No reviews found."));
		console.log(
			chalk.dim("Note: New apps may not appear in the RSS feed yet."),
		);
		return;
	}

	const analysis = analyzeSentiment(all);

	console.log(chalk.bold(`Fetched Reviews: ${analysis.total}`));
	console.log(
		`Average Rating: ${chalk.cyan(analysis.averageRating.toFixed(2))}`,
	);
	console.log("");

	console.log(chalk.bold("Category Distribution:"));
	const rows = [
		[
			"Positive",
			analysis.counts.positive,
			analysis.percentages.positive,
			chalk.green,
		],
		[
			"Negative",
			analysis.counts.negative,
			analysis.percentages.negative,
			chalk.red,
		],
		["Bug/Error", analysis.counts.bug, analysis.percentages.bug, chalk.red],
		[
			"Feature Request",
			analysis.counts.feature_request,
			analysis.percentages.feature_request,
			chalk.yellow,
		],
		[
			"Neutral",
			analysis.counts.neutral,
			analysis.percentages.neutral,
			chalk.dim,
		],
	];
	for (const [label, count, pct, color] of rows) {
		const bar = "█".repeat(Math.max(0, Math.floor(pct / 3)));
		console.log(
			`  ${color(label.padEnd(15))} ${String(count).padEnd(4)} ${chalk.dim(`%${pct}`.padEnd(5))} ${color(bar)}`,
		);
	}

	// Top 5 critical reviews
	const critical = analysis.categorized
		.filter(
			(r) => r.categories.includes("bug") || r.categories.includes("negative"),
		)
		.slice(0, 5);

	if (critical.length > 0) {
		console.log("");
		console.log(chalk.bold("Critical Reviews (top 5):"));
		for (const r of critical) {
			console.log(
				`  ${chalk.red("★".repeat(r.rating))} ${chalk.cyan(r.author || "?")} (v${r.version || "?"})`,
			);
			console.log(`    ${chalk.bold(r.title)}`);
			console.log(
				`    ${chalk.dim(r.content.substring(0, 120).replace(/\n/g, " "))}${r.content.length > 120 ? "..." : ""}`,
			);
			console.log(`    ${chalk.dim(`Category: ${r.categories.join(", ")}`)}`);
			console.log("");
		}
	}

	// Feature requests
	const features = analysis.categorized
		.filter((r) => r.categories.includes("feature_request"))
		.slice(0, 5);

	if (features.length > 0) {
		console.log(chalk.bold("Feature Requests (top 5):"));
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
			"Simple keyword classification. For details, call the /aso-strategist agent.",
		),
	);
}

// ─── screenshots (app-specific: actual assets) ───

async function asoScreenshotsFor(appId, country = "us") {
	showBanner();
	const info = await lookupAppStore(appId, country);
	console.log(chalk.bold(`Screenshot Assets: ${info.name}`));
	console.log("");

	const shots = (info.screenshotUrls || []).map(parseScreenshotUrl);
	if (shots.length === 0) {
		console.log(chalk.yellow("This app has no screenshot URLs."));
		return;
	}

	console.log(chalk.bold(`Total: ${shots.length}`));
	console.log("");

	// Orientation distribution
	const portrait = shots.filter((s) => s.orientation === "portrait").length;
	const landscape = shots.filter((s) => s.orientation === "landscape").length;
	console.log(chalk.bold("Orientation:"));
	console.log(`  Portrait:  ${chalk.cyan(portrait)}`);
	console.log(`  Landscape: ${chalk.cyan(landscape)}`);
	console.log("");

	// Resolution distribution
	console.log(chalk.bold("Resolutions:"));
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
		console.log(`  ${chalk.cyan(res.padEnd(12))} ${chalk.dim(`${count}`)}`);
	}
	console.log("");

	// URLs (first 10)
	console.log(chalk.bold("URL Examples (first 5):"));
	for (const s of shots.slice(0, 5)) {
		console.log(
			`  ${chalk.dim(s.url.substring(0, 80))}${s.url.length > 80 ? "..." : ""}`,
		);
	}

	console.log("");
	console.log(chalk.bold("Recommendations:"));
	if (shots.length < 3)
		console.log(
			`  ${chalk.yellow("!!")} Screenshots < 3 (minimum 3, ideal 6-10)`,
		);
	if (shots.length >= 3 && shots.length < 6)
		console.log(`  ${chalk.yellow("!!")} 6+ screenshots increase conversion`);
	if (shots.length >= 6)
		console.log(`  ${chalk.green("OK")} Screenshot count is sufficient`);
	if (landscape > portrait)
		console.log(
			`  ${chalk.yellow("!!")} Landscape-heavy — portrait is usually preferred for mobile apps`,
		);
	console.log("");
	console.log(
		chalk.dim(
			"To analyze visual design, trigger the app-store-screenshots skill in Claude Code.",
		),
	);
}

// ─── Main command ───

export async function runAso(args) {
	const sub = args[0];

	if (!sub || sub === "--help" || sub === "-h") {
		showBanner();
		console.log(chalk.bold("ASO — App Store Optimization:"));
		console.log("");
		console.log(
			`  ${chalk.cyan("badi aso audit")} [app-id]          App listing audit (iOS)`,
		);
		console.log(
			`  ${chalk.cyan("badi aso playstore")} [app-id]     Play Store listing audit (v1.11+)`,
		);
		console.log(
			`  ${chalk.cyan("badi aso keywords")} [app-id]       Keyword analysis`,
		);
		console.log(
			`  ${chalk.cyan("badi aso metadata")} [platform]     Metadata limit guide`,
		);
		console.log(
			`  ${chalk.cyan("badi aso review")} [app-id]         Review response templates`,
		);
		console.log(
			`  ${chalk.cyan("badi aso reviews")} [app-id]        Fetch real reviews + sentiment analysis (v1.11+)`,
		);
		console.log(
			`  ${chalk.cyan("badi aso compete")} [id1] [id2]     Compare two apps`,
		);
		console.log(
			`  ${chalk.cyan("badi aso screenshots")} [app-id?]   Guide + app-specific asset dump (v1.11+)`,
		);
		console.log(
			`  ${chalk.cyan("badi aso search")} [query]          App Store search`,
		);
		console.log("");
		console.log(chalk.bold("Examples:"));
		console.log("  badi aso audit 284882215        # Facebook iOS");
		console.log("  badi aso playstore com.facebook.katana  # Facebook Android");
		console.log("  badi aso reviews 284882215 --country us");
		console.log(
			"  badi aso screenshots 284882215  # App-specific screenshot asset analysis",
		);
		console.log("  badi aso keywords 284882215");
		console.log("  badi aso metadata appstore");
		console.log("  badi aso compete 284882215 310633997");
		console.log("  badi aso search 'todo list' --country tr");
		console.log("");
		console.log(
			chalk.dim(
				"Note: For detailed strategy, call /aso-master in Claude Code.",
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
					console.error(chalk.red("App ID required"));
					process.exit(1);
				}
				await asoAudit(args[1], country);
				break;
			case "keywords":
				if (!args[1]) {
					console.error(chalk.red("App ID required"));
					process.exit(1);
				}
				await asoKeywords(args[1], country);
				break;
			case "metadata":
				asoMetadata(args[1] || "appstore");
				break;
			case "review":
				if (!args[1]) {
					console.error(chalk.red("App ID required"));
					process.exit(1);
				}
				await asoReview(args[1], country);
				break;
			case "compete":
				if (!args[1] || !args[2]) {
					console.error(
						chalk.red("Two App IDs required: badi aso compete [id1] [id2]"),
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
					console.error(chalk.red("App ID / package required"));
					process.exit(1);
				}
				await asoPlaystore(args[1], country);
				break;
			case "reviews":
				if (!args[1]) {
					console.error(chalk.red("App ID required"));
					process.exit(1);
				}
				await asoReviews(args[1], country);
				break;
			case "search": {
				if (!args[1]) {
					console.error(chalk.red("Query required"));
					process.exit(1);
				}
				const results = await searchAppStore(args[1], country, 10);
				showBanner();
				console.log(
					chalk.bold(`Search Results: "${args[1]}" (${results.length})`),
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
				console.error(chalk.red(`Unknown aso command: ${sub}`));
				console.log(
					"Usage: badi aso [audit|playstore|keywords|metadata|review|reviews|compete|screenshots|search]",
				);
				process.exit(1);
		}
	} catch (e) {
		console.error(chalk.red(`Error: ${e.message}`));
		process.exit(1);
	}
}
