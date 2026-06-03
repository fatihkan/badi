#!/usr/bin/env node

import { chalk, showBanner, showVersion } from "../lib/cli.js";
import { emit } from "../lib/observability/event-emitter.js";
import { checkForUpdate, showUpdateBanner } from "../lib/update-check.js";

function showHelp() {
	showBanner();
	console.log(chalk.bold("Usage:"));
	console.log("  badi <command> [options]");
	console.log("");
	console.log(chalk.bold("Commands:"));
	console.log(`  ${chalk.cyan("init")}      Configure the project with Badi`);
	console.log(
		`  ${chalk.cyan("update")}    Update existing configuration (preserves customizations)`,
	);
	console.log(`  ${chalk.cyan("doctor")}    Validate the Badi installation`);
	console.log(`  ${chalk.cyan("list")}      List available components`);
	console.log(
		`  ${chalk.cyan("plugin")}    Plugin management (install/remove/list)`,
	);
	console.log(
		`  ${chalk.cyan("content")}   Quick content template generation (post/karousel/video/visual/calendar/brand)`,
	);
	console.log(`  ${chalk.cyan("stats")}     Usage statistics and analytics`);
	console.log(
		`  ${chalk.cyan("completion")} Generate shell completion script (bash/zsh/fish)`,
	);
	console.log(`  ${chalk.cyan("schedule")}  Scheduled command reminders`);
	console.log(
		`  ${chalk.cyan("skills")}    Opt-in select/reset skills (vault → active)`,
	);
	console.log(
		`  ${chalk.cyan("commands")}  Profile-based command management (core/dev/content) — v1.26+`,
	);
	console.log(
		`  ${chalk.cyan("outputstyle")} Output style profiles (terse/verbose/eli5) — v1.22+`,
	);
	console.log(
		`  ${chalk.cyan("statusline")} Status line profiles (git/skill-chip) — v1.22+`,
	);
	console.log(
		`  ${chalk.cyan("mcp")}       Model Context Protocol server (serve/tools/config) — v1.23+`,
	);
	console.log(
		`  ${chalk.cyan("wp")}        WordPress site management (status/plugin/theme/security)`,
	);
	console.log(
		`  ${chalk.cyan("seo")}       SEO audit (audit/meta/sitemap/speed/backlinks/rank/compare)`,
	);
	console.log(
		`  ${chalk.cyan("aso")}       App Store Optimization (audit/playstore/keywords/reviews/screenshots)`,
	);
	console.log(
		`  ${chalk.cyan("market")}    App Store market research (discover/reviews/difficulty + full report) — v1.15+`,
	);
	console.log(
		`  ${chalk.cyan("design")}    Visual identity command (init/lint/export/show — DESIGN.md) — v1.16+`,
	);
	console.log(
		`  ${chalk.cyan("mobile")}    Mobile development (init/build/release/crash-setup/deeplink/ota)`,
	);
	console.log(
		`  ${chalk.cyan("taste")}     Premium frontend skills (9 variants: default/minimalist/brutalist/soft...)`,
	);
	console.log(
		`  ${chalk.cyan("publish")}   Release orchestrator — bump + commit + tag + push + gh + npm (v1.11+)`,
	);
	console.log(
		`  ${chalk.cyan("release")}   Pre-publish pre-flight verifier (check) — v1.30+`,
	);
	console.log(
		`  ${chalk.cyan("agent")}     Background watcher (create/list/run/install/status) — v1.13+`,
	);
	console.log(
		`  ${chalk.cyan("plan")}      Local plan approval flow (list/new/approve/deny) — v1.29+`,
	);
	console.log(
		`  ${chalk.cyan("session")}   Single Claude Code session detail (id-prefix) — v1.29+`,
	);
	console.log(
		`  ${chalk.cyan("search")}    Multi-token AND search across all transcripts — v1.29+`,
	);
	console.log(
		`  ${chalk.cyan("events")}    Badi self-telemetry (command counters, durations) — v1.30+`,
		`  ${chalk.cyan("security")}  Security orchestration (baseline/triage/init --ci) — v1.31+`,
	);
	console.log("");
	console.log(chalk.bold("Domain & Infrastructure:"));
	console.log(
		`  ${chalk.cyan("ssl")}       SSL certificate analysis (expire, TLS, cipher)`,
	);
	console.log(
		`  ${chalk.cyan("dns")}       DNS record audit (A/MX/SPF/DMARC/CAA)`,
	);
	console.log(
		`  ${chalk.cyan("whois")}     Domain registration + expire + transfer lock`,
	);
	console.log(
		`  ${chalk.cyan("lighthouse")} Performance + A11y + SEO + Best Practices`,
	);
	console.log("");
	console.log(chalk.bold("Security & Accessibility:"));
	console.log(
		`  ${chalk.cyan("secret-scan")} Git history + working tree secret scan`,
	);
	console.log(
		`  ${chalk.cyan("a11y")}      WCAG 2.1 accessibility audit (axe-core)`,
	);
	console.log("");
	console.log(chalk.bold("Git Workflow:"));
	console.log(`  ${chalk.cyan("commit")}    Conventional commit helper + lint`);
	console.log(
		`  ${chalk.cyan("changelog")} CHANGELOG.md generation from commit history`,
	);
	console.log(
		`  ${chalk.cyan("gh")}        GitHub deep integration (sync issue -> TaskBoard) — v1.23+`,
	);
	console.log(
		`  ${chalk.cyan("kb")}        Knowledge base graph (graph/backlinks/orphans/stats) — v1.23+`,
	);
	console.log("");
	console.log(chalk.bold("AI/LLM + DevOps:"));
	console.log(
		`  ${chalk.cyan("ai")}        Token analysis, prompt test, memory diff, AI review/translate`,
	);
	console.log(
		`  ${chalk.cyan("dev")}       Deps update, bundle analyze, docker lint, env check, api test`,
	);
	console.log("");
	console.log(chalk.bold("Init Options:"));
	console.log(
		"  --target <path>       Target directory (default: current directory)",
	);
	console.log("  --force               Overwrite existing files");
	console.log("  --dry-run             Show changes without applying them");
	console.log(
		"  --harness <id>        CLI selection: claude | cursor | gemini | all | a,b",
	);
	console.log(
		"  --no-save             Do not write the selection to preferences",
	);
	console.log(
		chalk.dim("  (v1.12+) Running with no arguments opens an interactive menu"),
	);
	console.log("");
	console.log(chalk.bold("Update Options:"));
	console.log("  --force               Force-update slash/agent/hook files");
	console.log(
		"                        (memory, workspace, knowledge-base files are preserved)",
	);
	console.log("  --dry-run             Show changes without applying them");
	console.log(
		"  --harness <id>        Update a specific harness (default: installed ones)",
	);
	console.log("");
	console.log(chalk.bold("List Options:"));
	console.log("  --agents         List agents only");
	console.log("  --commands       List commands only");
	console.log("  --hooks          List hooks only");
	console.log("  --skills         List skill categories only");
	console.log("  --mcp            MCP server usage (v1.29+, transcript-based)");
	console.log("");
	console.log(chalk.bold("Doctor Subcommands (v1.28+):"));
	console.log("  badi doctor                 Audit the full Badi installation");
	console.log("  badi doctor help            Help-drift checker (for CI)");
	console.log("    --format json             JSON output (for CI parsing)");
	console.log(
		"    --strict                  Exit 1 on drift (default already exits 1)",
	);
	console.log("");
	console.log(chalk.bold("Skills Commands (v1.17+ Opt-in):"));
	console.log(
		"  badi skills                     Status + interactive selection",
	);
	console.log("  badi skills available           All skills in the vault");
	console.log("  badi skills list                Show active skills");
	console.log("  badi skills add <name...>       Activate");
	console.log("  badi skills remove <name...>    Deactivate");
	console.log("  badi skills clear               Reset all active skills");
	console.log("");
	console.log(chalk.bold("Plugin Options:"));
	console.log(
		"  badi plugin install <source>   Install a plugin (git URL or npm package)",
	);
	console.log("  badi plugin remove <name>      Remove a plugin");
	console.log("  badi plugin list               List installed plugins");
	console.log(
		"  badi plugin show <name>        Plugin detail + apiVersion (v1.29+)",
	);
	console.log("  badi plugin doctor             Health check (v1.30+)");
	console.log("  badi plugin graph              Dependency tree (v1.30+)");
	console.log("");
	console.log(chalk.bold("Release / Events Options (v1.30+):"));
	console.log(
		"  badi release check             9 pre-publish pre-flight checks",
	);
	console.log(
		"    --bump <patch|minor|major>     Auto-compute the target version",
	);
	console.log(
		"    --strict                       Treat warnings as errors (for CI)",
	);
	console.log("    --skip-test                    Skip the test stage");
	console.log(
		"  badi release sync-manifest     Regenerate .claude-plugin/ JSONs (v1.30.1+)",
	);
	console.log("    --dry-run                      Do not write; show output");
	console.log(
		"  badi events list                Last N events (--limit, --since/--until)",
	);
	console.log(
		"  badi events stats               Per-command count + average duration",
	);
	console.log(
		"  badi events path / status       Log file path / telemetry status",
	);
	console.log("");
	console.log(chalk.bold("Security orchestration (v1.31+):"));
	console.log(
		"  badi security baseline          Deterministic baseline (secret-scan + audit)",
	);
	console.log(
		"  badi security triage [report]   Filter the /security-review report by severity",
	);
	console.log(
		"  badi security init --ci         GitHub Action scaffold (official Anthropic action)",
	);
	console.log(chalk.dim("    Disable: export BADI_TELEMETRY=off"));
	console.log("");
	console.log(chalk.bold("Content Subcommands:"));
	console.log(
		"  badi content post [topic]      Generate a social media post template",
	);
	console.log(
		"  badi content karousel [topic]  Generate a carousel (multi-frame) template",
	);
	console.log(
		"  badi content video [topic]     Generate a video script template",
	);
	console.log(
		"  badi content visual [topic]    Generate a visual brief template",
	);
	console.log(
		"  badi content calendar [period] Generate a content calendar template",
	);
	console.log(
		"  badi content brand             Generate a brand voice guide template",
	);
	console.log("  badi content list              List generated content");
	console.log("  badi content perf [options]    Content performance tracking");
	console.log(
		"  badi content search [query]    Archive search and similarity detection",
	);
	console.log(
		"  badi content template [command] Template inheritance (create/list/delete)",
	);
	console.log("");
	console.log(chalk.bold("Stats Options:"));
	console.log("  --week               Last 7 days (default)");
	console.log("  --month              Last 30 days");
	console.log("  --all                All time");
	console.log("  --command <tool>     Filter by tool");
	console.log("  --habits             Habit streak");
	console.log("  --export csv         Export as CSV");
	console.log("");
	console.log(chalk.bold("Examples:"));
	console.log("  npx @fatihkan/badi init");
	console.log("  badi init --harness cursor");
	console.log("  badi init --harness claude,gemini");
	console.log("  badi init --target ./projem");
	console.log("  badi update");
	console.log("  badi doctor");
	console.log("  badi list --agents");
	console.log(
		"  badi plugin install https://github.com/user/badi-plugin-x.git",
	);
	console.log('  badi content post "new product launch"');
	console.log('  badi content video "30 second tutorial"');
	console.log("  badi content list");
	console.log("  badi stats --week");
	console.log("  badi stats --habits");
	console.log("  badi completion zsh");
	console.log("  badi content perf --trend");
	console.log("");
	console.log(chalk.bold("WordPress Commands:"));
	console.log("  badi wp add blog https://example.com --method rest");
	console.log("  badi wp status blog");
	console.log("  badi wp security staging");
	console.log("  badi wp update staging all");
	console.log("");
	console.log(chalk.bold("SEO Commands:"));
	console.log("  badi seo audit https://example.com");
	console.log("  badi seo meta https://example.com/page");
	console.log("  badi seo sitemap https://example.com");
	console.log("  badi seo speed https://example.com");
	console.log("");
	console.log(chalk.bold("ASO Commands:"));
	console.log("  badi aso audit 284882215        # App listing audit");
	console.log("  badi aso keywords 284882215     # Keyword analysis");
	console.log("  badi aso metadata appstore      # Metadata guide");
	console.log(
		"  badi aso compete 284882215 310633997  # Competitor comparison",
	);
	console.log("  badi aso search 'todo list'     # App search");
	console.log("");
	console.log(chalk.bold("Mobile Commands:"));
	console.log("  badi mobile init MyApp --framework react-native");
	console.log("  badi mobile version bump minor");
	console.log("  badi mobile build android");
	console.log("  badi mobile release testflight");
	console.log("  badi mobile assets icon ./logo.png");
	console.log(
		"  badi content release-notes --platform ios --version 2.3.0 --lang tr,en",
	);
	console.log("");
	console.log(chalk.bold("Taste Commands (Frontend Design):"));
	console.log("  badi taste                  # List 9 variants");
	console.log(
		"  badi taste show default     # Print the default variant's SKILL.md",
	);
	console.log("  badi taste prompt brutalist # Trigger example");
	console.log("  badi taste status           # Install status (9/9)");
	console.log("");
	console.log(chalk.bold("Publish Commands (v1.11+):"));
	console.log("  badi publish check                # pre-publish check");
	console.log("  badi publish --dry-run            # show steps, do not apply");
	console.log("  badi publish --version patch      # patch release");
	console.log("  badi publish --version minor      # minor release");
	console.log("  badi publish --skip-npm           # git + gh release only");
}

// ─── Lazy Command Loader ───
// Loads each command only when invoked (speeds up startup).

const commands = {
	init: () => import("../lib/commands/init.js").then((m) => m.runInit),
	update: () => import("../lib/commands/update.js").then((m) => m.runUpdate),
	doctor: () => import("../lib/commands/doctor.js").then((m) => m.runDoctor),
	list: () => import("../lib/commands/list.js").then((m) => m.runList),
	plugin: () =>
		import("../lib/commands/plugin/index.js").then((m) => m.runPlugin),
	content: () =>
		import("../lib/commands/icerik/index.js").then((m) => m.runIcerik),
	stats: () => import("../lib/commands/stats.js").then((m) => m.runStats),
	completion: () =>
		import("../lib/commands/completion.js").then((m) => m.runCompletion),
	schedule: () =>
		import("../lib/commands/schedule.js").then((m) => m.runSchedule),
	wp: () => import("../lib/commands/wp.js").then((m) => m.runWp),
	seo: () => import("../lib/commands/seo.js").then((m) => m.runSeo),
	aso: () => import("../lib/commands/aso.js").then((m) => m.runAso),
	market: () => import("../lib/commands/market.js").then((m) => m.runMarket),
	design: () => import("../lib/commands/tasarim.js").then((m) => m.runTasarim),
	mobile: () => import("../lib/commands/mobile.js").then((m) => m.runMobile),
	taste: () => import("../lib/commands/taste.js").then((m) => m.runTaste),
	publish: () => import("../lib/commands/publish.js").then((m) => m.runPublish),
	ssl: () => import("../lib/commands/domain.js").then((m) => m.runSslCmd),
	dns: () => import("../lib/commands/domain.js").then((m) => m.runDnsCmd),
	whois: () => import("../lib/commands/domain.js").then((m) => m.runWhoisCmd),
	lighthouse: () =>
		import("../lib/commands/lighthouse.js").then((m) => m.runLighthouse),
	"secret-scan": () =>
		import("../lib/commands/secret-scan.js").then((m) => m.runSecretScan),
	a11y: () => import("../lib/commands/a11y.js").then((m) => m.runA11y),
	commit: () => import("../lib/commands/commit.js").then((m) => m.runCommit),
	changelog: () =>
		import("../lib/commands/commit.js").then((m) => m.runChangelog),
	ai: () => import("../lib/commands/ai.js").then((m) => m.runAi),
	dev: () => import("../lib/commands/dev.js").then((m) => m.runDev),
	agent: () => import("../lib/commands/agent.js").then((m) => m.runAgent),
	skills: () => import("../lib/commands/skills.js").then((m) => m.runSkills),
	commands: () =>
		import("../lib/commands/commands.js").then((m) => m.commandsCommand),
	outputstyle: () =>
		import("../lib/commands/outputstyle.js").then((m) => m.runOutputstyle),
	statusline: () =>
		import("../lib/commands/statusline.js").then((m) => m.runStatusline),
	mcp: () => import("../lib/commands/mcp.js").then((m) => m.runMcp),
	gh: () => import("../lib/commands/gh.js").then((m) => m.runGh),
	kb: () => import("../lib/commands/kb.js").then((m) => m.runKb),
	search: () => import("../lib/commands/search.js").then((m) => m.runSearch),
	session: () => import("../lib/commands/session.js").then((m) => m.runSession),
	plan: () => import("../lib/commands/plan.js").then((m) => m.runPlan),
	release: () => import("../lib/commands/release.js").then((m) => m.runRelease),
	events: () => import("../lib/commands/events.js").then((m) => m.runEvents),
	security: () =>
		import("../lib/commands/security.js").then((m) => m.runSecurity),
};

// ─── Main Entry Point ───

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
		console.error(chalk.red(`Unknown command: ${command}`));
		console.error(`Run ${chalk.cyan('"badi --help"')} for help.`);
		process.exit(1);
	}

	const run = await loader();
	// init/update/doctor/list need showHelp
	const needsDeps = ["init", "update", "doctor", "list"].includes(command);
	const startMs = Date.now();
	// v1.30+ self-telemetry: command.started/completed/failed (disabled with BADI_TELEMETRY=off)
	emit("badi.command.started", { cmd: command, args_count: args.length });

	// v1.30 review C6 fix: most commands exit on error via process.exit(1)
	// (they do not throw), so try/catch is not enough. We capture the real exit
	// code with process.on("exit"). A flag prevents a double-emit.
	let emittedFinal = false;
	process.on("exit", (code) => {
		if (emittedFinal) return;
		emittedFinal = true;
		const evt = code === 0 ? "badi.command.completed" : "badi.command.failed";
		emit(evt, {
			cmd: command,
			duration_ms: Date.now() - startMs,
			exit_code: code,
		});
	});

	try {
		await run(args, needsDeps ? deps : undefined);
		// Normal path: the completed event is written by the 'exit' handler (code 0).
	} catch (e) {
		if (!emittedFinal) {
			emittedFinal = true;
			emit("badi.command.failed", {
				cmd: command,
				duration_ms: Date.now() - startMs,
				error_message: e?.message || String(e),
				exit_code: 1,
			});
		}
		throw e;
	}
}

main()
	.catch((e) => {
		console.error(chalk.red(`Error: ${e.message}`));
		process.exit(1);
	})
	.finally(() => {
		updatePromise.then(showUpdateBanner).catch(() => {});
	});
