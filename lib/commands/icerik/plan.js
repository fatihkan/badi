import { chalk, showBanner } from "../../cli.js";

export function runPlan() {
	showBanner();
	console.log(chalk.bold("Weekly Content Planning"));
	console.log("");

	const now = new Date();
	const nextMonday = new Date(now);
	const daysUntilMonday = (1 - now.getDay() + 7) % 7 || 7;
	nextMonday.setDate(now.getDate() + daysUntilMonday);
	const nextSunday = new Date(nextMonday);
	nextSunday.setDate(nextMonday.getDate() + 6);

	const formatDate = (d) => d.toISOString().split("T")[0];
	console.log(
		`Period: ${chalk.cyan(formatDate(nextMonday))} - ${chalk.cyan(formatDate(nextSunday))}`,
	);
	console.log("");

	console.log(chalk.bold("Day Themes of the Week:"));
	const temalar = [
		["Monday", "Motivation / Week kickoff"],
		["Tuesday", "Educational / Tip"],
		["Wednesday", "Behind the scenes / Community"],
		["Thursday", "Product / Service"],
		["Friday", "Fun / Trend"],
		["Saturday", "UGC / Social proof"],
		["Sunday", "Inspiration / Weekly recap"],
	];
	for (const [gun, tema] of temalar) {
		console.log(`  ${chalk.cyan(gun.padEnd(10))} ${tema}`);
	}
	console.log("");

	console.log(chalk.bold("Suggested Platform Distribution (weekly):"));
	console.log("  Instagram Post:  3-5");
	console.log("  Instagram Reel:  2-3");
	console.log("  Twitter/X:       5-7");
	console.log("  LinkedIn:        2-3");
	console.log("  TikTok:          3-5");
	console.log(chalk.dim("  (quality > quantity principle)"));
	console.log("");

	console.log(chalk.bold("Next Steps:"));
	console.log(
		`  1. Create a detailed calendar: ${chalk.cyan(`badi content calendar "${formatDate(nextMonday).substring(0, 7)}"`)}`,
	);
	console.log("  2. Set a topic for each day (fill the calendar file)");
	console.log(
		`  3. Prepare the week's first content: ${chalk.cyan('badi content post "[topic]"')}`,
	);
	console.log("");
	console.log(
		chalk.dim(
			"For a detailed planning session, use /content-plan in Claude Code.",
		),
	);
}
