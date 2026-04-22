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
		console.log(`${chalk.bold.green(v.label)} ${chalk.dim("(" + v.id + ")")}`);
		console.log(`  ${chalk.dim("Skill ID:")} ${v.name}`);
		console.log(`  ${v.desc}`);
		console.log(`  ${chalk.yellow("-")} ${v.use}`);
		console.log("");
	}
}

function showShow(id) {
	const variant = VARIANTS.find((v) => v.id === id);
	if (!variant) {
		console.error(chalk.red(`Bilinmeyen varyant: ${id}`));
		console.error(`Kullanilabilirler: ${VARIANTS.map((v) => v.id).join(", ")}`);
		process.exit(1);
	}

	const file = join(SKILL_ROOT, variant.id, "SKILL.md");
	if (!existsSync(file)) {
		console.error(chalk.red(`Skill dosyasi bulunamadi: ${file}`));
		console.error(
			chalk.yellow("Once 'badi update' calistirarak skill'i yukleyin."),
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
		console.error(chalk.red(`Bilinmeyen varyant: ${id}`));
		process.exit(1);
	}
	console.log(chalk.bold.cyan(`\nOrnek prompt (${variant.label}):`));
	console.log(chalk.dim("Claude Code'a bunu yapistirin:\n"));
	console.log(`  ${variant.prompt}\n`);
}

function showHelp() {
	showBanner();
	const state = checkInstalled();

	console.log(chalk.bold("badi taste - Frontend Taste Skills"));
	console.log(
		chalk.dim(
			"Premium UI uretimi icin 9 varyant. AI'nin uretebilecegi jenerik tasarima engel.",
		),
	);
	console.log("");
	console.log(chalk.bold("Komutlar:"));
	console.log(
		`  ${chalk.cyan("badi taste")}                 Varyant listesini goster`,
	);
	console.log(
		`  ${chalk.cyan("badi taste list")}            Varyant listesini goster (ayni)`,
	);
	console.log(
		`  ${chalk.cyan("badi taste show <id>")}       Bir varyantin tam SKILL.md icerigini yazdir`,
	);
	console.log(
		`  ${chalk.cyan("badi taste prompt <id>")}     Ornek tetikleme prompt'u goster`,
	);
	console.log(
		`  ${chalk.cyan("badi taste status")}          Kurulum durumunu kontrol et`,
	);
	console.log("");
	console.log(chalk.bold("Varyant ID'leri:"));
	console.log(`  ${VARIANTS.map((v) => chalk.cyan(v.id)).join(", ")}`);
	console.log("");
	console.log(chalk.bold("Ornekler:"));
	console.log("  badi taste");
	console.log("  badi taste show default");
	console.log("  badi taste prompt brutalist");
	console.log("  badi taste status");
	console.log("");
	console.log(chalk.bold("Nasil kullanilir:"));
	console.log(
		chalk.dim("  Claude Code oturumunda prompt icinde varyant ismini gecirin."),
	);
	console.log(
		chalk.dim(
			'  Ornek: "Build a premium hero. Use the frontend-taste/default skill."',
		),
	);
	console.log("");

	if (!state.installed) {
		console.log(
			chalk.yellow(
				"! Skill'ler kurulu degil. Bu paket surumunu kullaniyor olabilirsiniz.",
			),
		);
		console.log(
			chalk.yellow(
				"  Cozum: 'badi update' veya 'npm i -g @fatihkan/badi@latest' sonra 'badi init'",
			),
		);
	} else if (state.missing.length > 0) {
		console.log(
			chalk.yellow(`! Eksik varyant(lar): ${state.missing.join(", ")}`),
		);
		console.log(
			chalk.yellow("  'badi update --force' calistirarak duzeltebilirsiniz."),
		);
	} else {
		console.log(chalk.green("+ 9/9 varyant kurulu."));
	}
}

function showStatus() {
	showBanner();
	const state = checkInstalled();
	console.log(chalk.bold("Frontend Taste - Kurulum Durumu"));
	console.log("");

	if (!state.installed) {
		console.log(chalk.red("- .claude/skills/frontend-taste/ bulunamadi"));
		console.log(chalk.yellow("  'badi init' veya 'badi update' calistirin."));
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
	console.log(chalk.bold(`Sonuc: ${total}/${VARIANTS.length} varyant kurulu.`));
}

export async function runTaste(args) {
	const sub = args[0];

	if (!sub || sub === "list") {
		showList();
		console.log(
			chalk.dim(
				"Detay icin: 'badi taste show <id>' - Yardim: 'badi taste --help'",
			),
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
				console.error(chalk.red("Varyant ID girin: badi taste show <id>"));
				console.error(
					`Kullanilabilirler: ${VARIANTS.map((v) => v.id).join(", ")}`,
				);
				process.exit(1);
			}
			showShow(id);
			return;
		}
		case "prompt": {
			const id = args[1];
			if (!id) {
				console.error(chalk.red("Varyant ID girin: badi taste prompt <id>"));
				process.exit(1);
			}
			showPrompt(id);
			return;
		}
		default:
			console.error(chalk.red(`Bilinmeyen alt komut: ${sub}`));
			console.error(`Yardim icin: ${chalk.cyan('"badi taste --help"')}`);
			process.exit(1);
	}
}
