import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { chalk, showBanner } from "../../cli.js";
import { getDateString } from "../../icerik-helpers.js";

export function runBasla() {
	const workspaceBase = join(process.cwd(), ".claude", "workspace");
	const today = getDateString();
	const dayNames = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	const dayName = dayNames[new Date().getDay()];
	const dayTheme = {
		Monday: "Motivation / Week kickoff",
		Tuesday: "Educational / Tip",
		Wednesday: "Behind the scenes / Community",
		Thursday: "Product / Service",
		Friday: "Fun / Trend",
		Saturday: "UGC / Social proof",
		Sunday: "Inspiration / Weekly recap",
	}[dayName];

	showBanner();
	console.log(chalk.bold(`Content Session — ${today} (${dayName})`));
	console.log("");

	const markaPath = join(workspaceBase, "marka-sesi.md");
	const markaVar = existsSync(markaPath);
	console.log(
		`Brand Voice:  ${markaVar ? chalk.green("loaded") : chalk.yellow("missing — badi content brand")}`,
	);

	const takvimDir = join(workspaceBase, "takvim");
	const takvimSayisi = existsSync(takvimDir)
		? readdirSync(takvimDir).filter((f) => f.endsWith(".md")).length
		: 0;
	console.log(
		`Calendar:     ${takvimSayisi > 0 ? chalk.green(`${takvimSayisi} files`) : chalk.yellow("none — badi content calendar")}`,
	);

	console.log("");
	console.log(chalk.bold(`Today's Theme (${dayName}):`));
	console.log(`  ${chalk.cyan(dayTheme)}`);
	console.log("");

	console.log(chalk.bold("Pending Drafts (last 7 days):"));
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
		console.log(chalk.dim("  (no pending drafts)"));
	}

	console.log("");
	console.log(chalk.bold("What You Can Focus On Today:"));
	console.log(
		`  1. Content matching today's theme: ${chalk.cyan(`badi content post "${dayTheme.toLowerCase()}"`)}`,
	);
	if (bekleyenSayisi > 0) {
		console.log(`  2. Complete ${bekleyenSayisi} pending draft(s)`);
	}
	console.log(`  3. Generate ideas: ${chalk.cyan("badi content idea")}`);
	console.log(`  4. See status: ${chalk.cyan("badi content status")}`);
	console.log("");
	console.log(
		chalk.dim("For an interactive session, use /content-start in Claude Code."),
	);
}
