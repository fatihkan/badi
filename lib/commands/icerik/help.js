import { chalk, showBanner } from "../../cli.js";

export function runHelp() {
	showBanner();
	console.log(chalk.bold("Content Production Commands:"));
	console.log("");
	console.log(chalk.bold.cyan("Session Management:"));
	console.log(
		`  ${chalk.cyan("badi icerik basla")}              Start the daily content session`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik durum")}              Production status panel`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik plan")}               Weekly planning session`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik kapat")}              Close the day and summarize`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik fikir [type]")}       Generate ideas (post/video/karousel)`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik ac [filter]")}        Open the latest content file`,
	);
	console.log("");
	console.log(chalk.bold.cyan("Template Generation:"));
	console.log(
		`  ${chalk.cyan("badi icerik post [topic]")}       Social media post template`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik karousel [topic]")}   Carousel (multi-slide) template`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik video [topic]")}      Video script template`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik gorsel [topic]")}     Visual brief template`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik takvim [period]")}    Content calendar template`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik marka")}              Brand voice guide template`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik newsletter [topic]")} Weekly newsletter template (v1.11+)`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik podcast [topic]")}    Podcast episode + show notes template (v1.11+)`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik thread [topic]")}     X/LinkedIn 10-post thread (v1.11+)`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik case-study [topic]")} Customer success story (v1.11+)`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik list")}               List generated content`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik perf [options]")}     Performance tracking`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik ara [query]")}        Archive search and similarity detection`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik sablon [command]")}   Custom template inheritance management`,
	);
	console.log(
		`  ${chalk.cyan("badi icerik release-notes")}      App Store/Play Store release notes (--platform ios|android --version X.Y.Z)`,
	);
	console.log("");
	console.log(chalk.bold("Daily Workflow:"));
	console.log(
		"  Morning: badi icerik basla        # Start the session, what's on today?",
	);
	console.log('  Create:  badi icerik post "topic" # Generate a template');
	console.log("  Check:   badi icerik durum        # How far have I come?");
	console.log(
		"  Evening: badi icerik kapat        # Close the session, plan tomorrow",
	);
	console.log("");
	console.log(chalk.bold("Examples:"));
	console.log("  badi icerik basla");
	console.log('  badi icerik post "new product launch"');
	console.log("  badi icerik fikir post");
	console.log("  badi icerik ac");
	console.log("");
	console.log(
		chalk.dim("Note: Templates are created under .claude/workspace/."),
	);
	console.log(
		chalk.dim(
			"For the full interactive flow, use the /icerik-basla, /icerik-durum, /icerik-fikir slash commands in Claude Code.",
		),
	);
}
