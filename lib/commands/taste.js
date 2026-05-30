import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chalk, showBanner } from "../cli.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
const PKG_ROOT = resolve(__dirname, "..", "..");
const SKILL_ROOT = join(PKG_ROOT, ".claude", "skills", "frontend-taste");

const VARIANTS = [
	{
		id: "default",
		name: "design-taste-frontend",
		label: "Default (All-Rounder)",
		desc: "Senior UI/UX engineer. Overrides LLM design biases. Dials: DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY.",
		use: "Premium landing pages, SaaS UI, dashboards. Safe general pick.",
		prompt:
			"Build a premium landing page hero for a SaaS analytics product. Use the frontend-taste/default skill.",
	},
	{
		id: "gpt-taste",
		name: "gpt-taste",
		label: "GPT-Taste (Strict Editorial)",
		desc: "High variance layouts, wide editorial typography, AIDA structure, mandatory GSAP ScrollTriggers.",
		use: "When using GPT/Codex. Editorial portfolios, agency sites.",
		prompt:
			"Design an editorial portfolio landing with gsap scrolltelling. Use the frontend-taste/gpt-taste skill.",
	},
	{
		id: "minimalist",
		name: "minimalist-ui",
		label: "Minimalist (Notion / Linear)",
		desc: "Clean editorial interfaces. Warm monochrome, flat bento grids, muted pastels. No gradients, no heavy shadows.",
		use: "Productivity apps, editorial/CMS UIs, Notion/Linear-style tools.",
		prompt:
			"Build a minimal task-manager dashboard. Use the frontend-taste/minimalist skill.",
	},
	{
		id: "brutalist",
		name: "industrial-brutalist-ui",
		label: "Brutalist (Swiss / Industrial)",
		desc: "Swiss typographic print + military terminal. Rigid grids, extreme type scale contrast, utilitarian color.",
		use: "Data-heavy dashboards, editorial sites, technical docs with raw feel.",
		prompt:
			"Design a raw-brutalist technical doc homepage. Use the frontend-taste/brutalist skill.",
	},
	{
		id: "soft",
		name: "high-end-visual-design",
		label: "Soft (High-End Agency)",
		desc: "Calm, expensive feel. Premium fonts, softer contrast, generous whitespace, spring motion.",
		use: "Luxury brands, DTC product pages, bespoke agency sites.",
		prompt:
			"Craft a luxury skincare landing in high-end agency style. Use the frontend-taste/soft skill.",
	},
	{
		id: "redesign",
		name: "redesign-existing-projects",
		label: "Redesign (Audit + Fix)",
		desc: "Audits current UI, identifies generic AI patterns, applies high-end standards without breaking functionality.",
		use: "When you already have an app and want to improve it rather than rebuild.",
		prompt:
			"Audit this dashboard and propose a redesign pass. Use the frontend-taste/redesign skill.",
	},
	{
		id: "output",
		name: "full-output-enforcement",
		label: "Output (Anti-Truncation)",
		desc: "Overrides LLM truncation. Bans placeholder patterns. Handles token-limit splits cleanly.",
		use: "Stack with any other variant when the agent keeps giving half-finished code.",
		prompt:
			"Implement the full component with no placeholders. Use the frontend-taste/output skill alongside default.",
	},
	{
		id: "stitch",
		name: "stitch-design-taste",
		label: "Stitch (Google Stitch)",
		desc: "Generates agent-friendly DESIGN.md files tuned for Google Stitch with premium UI standards.",
		use: "When shipping to Stitch-compatible tooling.",
		prompt:
			"Produce a DESIGN.md for this page. Use the frontend-taste/stitch skill.",
	},
	{
		id: "images-first",
		name: "image-taste-frontend",
		label: "Images-First (Reference-Led)",
		desc: "Generate premium reference images, analyze them, then implement the frontend to match.",
		use: "Visual-led projects where getting the look right matters more than the logic.",
		prompt:
			"Generate images, analyze them, then build the landing. Use the frontend-taste/images-first skill.",
	},
];

function checkInstalled() {
	if (!existsSync(SKILL_ROOT)) {
		return { installed: false };
	}
	const missing = [];
	for (const v of VARIANTS) {
		const p = join(SKILL_ROOT, v.id, "SKILL.md");
		if (!existsSync(p)) missing.push(v.id);
	}
	return { installed: true, missing };
}

function showList() {
	console.log(chalk.bold.cyan("\nFrontend Taste - 9 Design Variants"));
	console.log(
		chalk.dim(
			"Premium frontend skills that stop AI from generating generic UI.\n",
		),
	);

	for (const v of VARIANTS) {
		console.log(`${chalk.bold.green(v.label)} ${chalk.dim(`(${v.id})`)}`);
		console.log(`  ${chalk.dim("Skill ID:")} ${v.name}`);
		console.log(`  ${v.desc}`);
		console.log(`  ${chalk.yellow("-")} ${v.use}`);
		console.log("");
	}
}

function showShow(id) {
	const variant = VARIANTS.find((v) => v.id === id);
	if (!variant) {
		console.error(chalk.red(`Unknown variant: ${id}`));
		console.error(`Available: ${VARIANTS.map((v) => v.id).join(", ")}`);
		process.exit(1);
	}

	const file = join(SKILL_ROOT, variant.id, "SKILL.md");
	if (!existsSync(file)) {
		console.error(chalk.red(`Skill file not found: ${file}`));
		console.error(
			chalk.yellow("Install the skill first by running 'badi update'."),
		);
		process.exit(1);
	}

	const content = readFileSync(file, "utf-8");
	console.log(chalk.bold.cyan(`\n${variant.label}`));
	console.log(chalk.dim(`${file}\n`));
	console.log(content);
}

function showPrompt(id) {
	const variant = VARIANTS.find((v) => v.id === id);
	if (!variant) {
		console.error(chalk.red(`Unknown variant: ${id}`));
		process.exit(1);
	}
	console.log(chalk.bold.cyan(`\nExample prompt (${variant.label}):`));
	console.log(chalk.dim("Paste this into Claude Code:\n"));
	console.log(`  ${variant.prompt}\n`);
}

function showHelp() {
	showBanner();
	const state = checkInstalled();

	console.log(chalk.bold("badi taste - Frontend Taste Skills"));
	console.log(
		chalk.dim(
			"9 variants for premium UI generation. Stops the generic design AI tends to produce.",
		),
	);
	console.log("");
	console.log(chalk.bold("Commands:"));
	console.log(
		`  ${chalk.cyan("badi taste")}                 Show the variant list`,
	);
	console.log(
		`  ${chalk.cyan("badi taste list")}            Show the variant list (same)`,
	);
	console.log(
		`  ${chalk.cyan("badi taste show <id>")}       Print a variant's full SKILL.md content`,
	);
	console.log(
		`  ${chalk.cyan("badi taste prompt <id>")}     Show an example trigger prompt`,
	);
	console.log(
		`  ${chalk.cyan("badi taste status")}          Check installation status`,
	);
	console.log("");
	console.log(chalk.bold("Variant IDs:"));
	console.log(`  ${VARIANTS.map((v) => chalk.cyan(v.id)).join(", ")}`);
	console.log("");
	console.log(chalk.bold("Examples:"));
	console.log("  badi taste");
	console.log("  badi taste show default");
	console.log("  badi taste prompt brutalist");
	console.log("  badi taste status");
	console.log("");
	console.log(chalk.bold("How to use:"));
	console.log(
		chalk.dim(
			"  Pass the variant name in your prompt during a Claude Code session.",
		),
	);
	console.log(
		chalk.dim(
			'  Example: "Build a premium hero. Use the frontend-taste/default skill."',
		),
	);
	console.log("");

	if (!state.installed) {
		console.log(
			chalk.yellow(
				"! Skills not installed. You may be on a package-only version.",
			),
		);
		console.log(
			chalk.yellow(
				"  Fix: 'badi update' or 'npm i -g @fatihkan/badi@latest' then 'badi init'",
			),
		);
	} else if (state.missing.length > 0) {
		console.log(
			chalk.yellow(`! Missing variant(s): ${state.missing.join(", ")}`),
		);
		console.log(
			chalk.yellow("  You can fix it by running 'badi update --force'."),
		);
	} else {
		console.log(chalk.green("+ 9/9 variants installed."));
	}
}

function showStatus() {
	showBanner();
	const state = checkInstalled();
	console.log(chalk.bold("Frontend Taste - Installation Status"));
	console.log("");

	if (!state.installed) {
		console.log(chalk.red("- .claude/skills/frontend-taste/ not found"));
		console.log(chalk.yellow("  Run 'badi init' or 'badi update'."));
		return;
	}

	console.log(chalk.dim(`Skill root: ${SKILL_ROOT}`));
	console.log("");
	for (const v of VARIANTS) {
		const p = join(SKILL_ROOT, v.id, "SKILL.md");
		const icon = existsSync(p) ? chalk.green("+") : chalk.red("-");
		console.log(`  ${icon} ${v.id.padEnd(14)} ${chalk.dim(v.name)}`);
	}
	console.log("");
	const total = VARIANTS.length - state.missing.length;
	console.log(
		chalk.bold(`Result: ${total}/${VARIANTS.length} variants installed.`),
	);
}

export async function runTaste(args) {
	const sub = args[0];

	if (!sub || sub === "list") {
		showList();
		console.log(
			chalk.dim("Details: 'badi taste show <id>' - Help: 'badi taste --help'"),
		);
		return;
	}

	switch (sub) {
		case "--help":
		case "-h":
		case "help":
			showHelp();
			return;
		case "status":
			showStatus();
			return;
		case "show": {
			const id = args[1];
			if (!id) {
				console.error(chalk.red("Enter a variant ID: badi taste show <id>"));
				console.error(`Available: ${VARIANTS.map((v) => v.id).join(", ")}`);
				process.exit(1);
			}
			showShow(id);
			return;
		}
		case "prompt": {
			const id = args[1];
			if (!id) {
				console.error(chalk.red("Enter a variant ID: badi taste prompt <id>"));
				process.exit(1);
			}
			showPrompt(id);
			return;
		}
		default:
			console.error(chalk.red(`Unknown subcommand: ${sub}`));
			console.error(`For help: ${chalk.cyan('"badi taste --help"')}`);
			process.exit(1);
	}
}
