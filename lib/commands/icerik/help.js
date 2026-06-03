import { chalk, showBanner } from "../../cli.js";

export function runHelp() {
	showBanner();
	console.log(chalk.bold("Content Production Commands:"));
	console.log("");
	console.log(chalk.bold.cyan("Session Management:"));
	console.log(
		`  ${chalk.cyan("badi content start")}              Start the daily content session`,
	);
	console.log(
		`  ${chalk.cyan("badi content status")}              Production status panel`,
	);
	console.log(
		`  ${chalk.cyan("badi content plan")}               Weekly planning session`,
	);
	console.log(
		`  ${chalk.cyan("badi content close")}              Close the day and summarize`,
	);
	console.log(
		`  ${chalk.cyan("badi content idea [type]")}       Generate ideas (post/video/carousel)`,
	);
	console.log(
		`  ${chalk.cyan("badi content open [filter]")}        Open the latest content file`,
	);
	console.log("");
	console.log(chalk.bold.cyan("Template Generation:"));
	console.log(
		`  ${chalk.cyan("badi content post [topic]")}       Social media post template`,
	);
	console.log(
		`  ${chalk.cyan("badi content carousel [topic]")}   Carousel (multi-slide) template`,
	);
	console.log(
		`  ${chalk.cyan("badi content video [topic]")}      Video script template`,
	);
	console.log(
		`  ${chalk.cyan("badi content visual [topic]")}     Visual brief template`,
	);
	console.log(
		`  ${chalk.cyan("badi content calendar [period]")}    Content calendar template`,
	);
	console.log(
		`  ${chalk.cyan("badi content brand")}              Brand voice guide template`,
	);
	console.log(
		`  ${chalk.cyan("badi content newsletter [topic]")} Weekly newsletter template (v1.11+)`,
	);
	console.log(
		`  ${chalk.cyan("badi content podcast [topic]")}    Podcast episode + show notes template (v1.11+)`,
	);
	console.log(
		`  ${chalk.cyan("badi content thread [topic]")}     X/LinkedIn 10-post thread (v1.11+)`,
	);
	console.log(
		`  ${chalk.cyan("badi content case-study [topic]")} Customer success story (v1.11+)`,
	);
	console.log(
		`  ${chalk.cyan("badi content list")}               List generated content`,
	);
	console.log(
		`  ${chalk.cyan("badi content perf [options]")}     Performance tracking`,
	);
	console.log(
		`  ${chalk.cyan("badi content search [query]")}        Archive search and similarity detection`,
	);
	console.log(
		`  ${chalk.cyan("badi content template [command]")}   Custom template inheritance management`,
	);
	console.log(
		`  ${chalk.cyan("badi content release-notes")}      App Store/Play Store release notes (--platform ios|android --version X.Y.Z)`,
	);
	console.log("");
	console.log(chalk.bold("Daily Workflow:"));
	console.log(
		"  Morning: badi content start        # Start the session, what's on today?",
	);
	console.log('  Create:  badi content post "topic" # Generate a template');
	console.log("  Check:   badi content status        # How far have I come?");
	console.log(
		"  Evening: badi content close        # Close the session, plan tomorrow",
	);
	console.log("");
	console.log(chalk.bold("Examples:"));
	console.log("  badi content start");
	console.log('  badi content post "new product launch"');
	console.log("  badi content idea post");
	console.log("  badi content open");
	console.log("");
	console.log(
		chalk.dim("Note: Templates are created under .claude/workspace/."),
	);
	console.log(
		chalk.dim(
			"For the full interactive flow, use the /content-start, /content-status, /content-idea slash commands in Claude Code.",
		),
	);
}
