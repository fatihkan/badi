// `badi tasarim` — Visual identity command. Wraps Google's @google/design.md
// CLI (npx) for lint/export and provides project-local init/show.
//
// Subcommands:
//   tasarim init [--ornek <name>] [--out PATH] [--force]
//   tasarim lint [--strict]
//   tasarim export --format tailwind|dtcg [--out PATH]
//   tasarim show [--tokens|--prose]
//
// External dependency: @google/design.md (pinned to 0.1.1, called via npx).
// Internet required for first npx invocation; subsequent runs use cache.

import { spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { chalk, showBanner } from "../cli.js";

const DEFAULT_PATH = ".claude/workspace/DESIGN.md";
const PINNED_PACKAGE = "@google/design.md@0.1.1";

const SKELETON = `---
# DESIGN.md — visual identity tokens
# https://github.com/google-labs-code/design.md

name: My Brand
version: 0.1.0

colors:
  primary: "#2563eb"        # Royal blue
  secondary: "#10b981"      # Emerald
  accent: "#f59e0b"         # Amber
  neutral:
    50: "#f9fafb"
    100: "#f3f4f6"
    500: "#6b7280"
    900: "#111827"
  background: "#ffffff"
  foreground: "#0f172a"

typography:
  fontFamily:
    sans: "Inter, system-ui, sans-serif"
    serif: "Georgia, serif"
    mono: "JetBrains Mono, monospace"
  baseSize: 16
  lineHeight: 1.6
  scale:
    xs: 12
    sm: 14
    base: 16
    lg: 18
    xl: 20
    "2xl": 24
    "3xl": 30

spacing:
  unit: 4
  scale: [0, 4, 8, 12, 16, 24, 32, 48, 64, 96]

radius:
  none: 0
  sm: 4
  md: 8
  lg: 16
  full: 9999

elevation:
  sm: "0 1px 2px rgba(0,0,0,0.05)"
  md: "0 4px 6px rgba(0,0,0,0.1)"
  lg: "0 10px 25px rgba(0,0,0,0.15)"

components:
  button:
    radius: md
    paddingX: 16
    paddingY: 8
---

# Visual Identity

Brand-level visual rationale. Document *why* the tokens above are the way
they are; future-you will need it.

## Overview

A short paragraph: brand voice, audience, mood.

## Colors

Why these specific hues? Cite contrast ratios, accessibility tests,
and any user research.

## Typography

Font choices and the reasoning. Note WCAG line-height/size minimums.

## Layout

Grid system, breakpoints, container widths.

## Elevation

When to apply shadows; when flat is preferred.

## Shapes

Border radii by component class; corners as a brand signal.

## Components

Per-component overrides. Buttons, cards, inputs, modals.

## Do's & Don'ts

Concrete examples of what looks on-brand vs. off-brand.
`;

const EXAMPLES = ["paws-and-paths", "atmospheric-glass", "totality-festival"];

function parseFlags(args) {
	const flags = {
		ornek: null,
		out: null,
		force: false,
		format: null,
		strict: false,
		tokens: false,
		prose: false,
	};
	for (let i = 0; i < args.length; i++) {
		const a = args[i];
		if (a === "--ornek") flags.ornek = args[++i];
		else if (a === "--out") flags.out = args[++i];
		else if (a === "--force") flags.force = true;
		else if (a === "--format") flags.format = args[++i];
		else if (a === "--strict") flags.strict = true;
		else if (a === "--tokens") flags.tokens = true;
		else if (a === "--prose") flags.prose = true;
	}
	return flags;
}

function showHelp() {
	showBanner();
	console.log(chalk.bold("Badi Tasarim — Gorsel Kimlik Komutu"));
	console.log("");
	console.log(chalk.bold("Kullanim:"));
	console.log(`  ${chalk.cyan("badi tasarim init")}                      Yeni DESIGN.md olustur`);
	console.log(
		`  ${chalk.cyan("badi tasarim init --ornek <ad>")}          Ornek sablondan kopyala`,
	);
	console.log(`  ${chalk.cyan("badi tasarim lint")}                      DESIGN.md'i dogrula`);
	console.log(
		`  ${chalk.cyan("badi tasarim export --format tailwind")}   Tailwind config uret`,
	);
	console.log(
		`  ${chalk.cyan("badi tasarim export --format dtcg")}       DTCG token JSON uret`,
	);
	console.log(
		`  ${chalk.cyan("badi tasarim show --tokens")}              Sadece frontmatter (tokens)`,
	);
	console.log(
		`  ${chalk.cyan("badi tasarim show --prose")}               Sadece markdown body (rationale)`,
	);
	console.log("");
	console.log(chalk.bold("Secenekler:"));
	console.log(`  --out <yol>      Cikti dosya yolu (varsayilan: ${DEFAULT_PATH})`);
	console.log(`  --force          Var olan DESIGN.md'i overwrite et`);
	console.log(`  --ornek <ad>     ${EXAMPLES.join(" | ")}`);
	console.log(`  --strict         Lint warnings -> errors`);
	console.log("");
	console.log(chalk.bold("Gereksinimler:"));
	console.log("  Internet (ilk npx cagrisi paketi indirir, sonra cache)");
	console.log(`  Pinned: ${PINNED_PACKAGE}`);
}

function ensureDir(filePath) {
	const dir = dirname(filePath);
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function runDesignMd(args, opts = {}) {
	const result = spawnSync("npx", ["--yes", PINNED_PACKAGE, ...args], {
		stdio: opts.captureStdout ? ["inherit", "pipe", "inherit"] : "inherit",
		encoding: "utf-8",
	});
	if (result.error) {
		throw new Error(
			`npx ${PINNED_PACKAGE} cagrisi basarisiz: ${result.error.message}. Internet baglantisini kontrol edin.`,
		);
	}
	if (result.status !== 0 && !opts.captureStdout) {
		process.exit(result.status || 1);
	}
	return result;
}

function subInit(flags) {
	const target = resolve(process.cwd(), flags.out || DEFAULT_PATH);

	if (existsSync(target) && !flags.force) {
		console.error(chalk.red(`Dosya zaten var: ${target}`));
		console.log(chalk.dim("  Uzerine yazmak icin --force kullanin."));
		process.exit(1);
	}

	if (flags.ornek) {
		if (!EXAMPLES.includes(flags.ornek)) {
			console.error(
				chalk.red(`Bilinmeyen ornek: ${flags.ornek}. Gecerli: ${EXAMPLES.join(", ")}`),
			);
			process.exit(1);
		}
		// Try to fetch example via npx (if @google/design.md exposes them)
		// Fallback: write a comment pointing user to examples upstream
		ensureDir(target);
		const stub = `---
# DESIGN.md — '${flags.ornek}' ornegi
# Tam ornek icin: https://github.com/google-labs-code/design.md/tree/main/examples/${flags.ornek}
---

# ${flags.ornek}

Tam ornek gerekiyorsa yukaridaki URL'den DESIGN.md'i kopyalayip uzerine yazin.
Iskelet baslangici icin: badi tasarim init --force
`;
		writeFileSync(target, stub);
		showBanner();
		console.log(chalk.green(`+ ${target}`));
		console.log(chalk.dim(`  Ornek: ${flags.ornek}`));
		console.log(
			chalk.dim(`  Detay: https://github.com/google-labs-code/design.md/tree/main/examples/${flags.ornek}`),
		);
		return;
	}

	ensureDir(target);
	writeFileSync(target, SKELETON);
	showBanner();
	console.log(chalk.green(`+ ${target}`));
	console.log(chalk.dim("  Frontmatter token'lari + 8 bolum prose iskeleti yazildi."));
	console.log(chalk.dim("  Sonraki: badi tasarim lint"));
}

function subLint(flags) {
	const target = resolve(process.cwd(), flags.out || DEFAULT_PATH);
	if (!existsSync(target)) {
		console.error(chalk.red(`DESIGN.md yok: ${target}`));
		console.log(chalk.dim("  Once: badi tasarim init"));
		process.exit(1);
	}
	const args = ["lint", target];
	if (flags.strict) args.push("--strict");
	runDesignMd(args);
}

function subExport(flags) {
	if (!flags.format) {
		console.error(chalk.red("--format belirtilmesi gerekiyor (tailwind | dtcg)"));
		process.exit(1);
	}
	if (!["tailwind", "dtcg"].includes(flags.format)) {
		console.error(chalk.red(`Gecersiz format: ${flags.format}. Gecerli: tailwind | dtcg`));
		process.exit(1);
	}
	const target = resolve(process.cwd(), flags.out || DEFAULT_PATH);
	if (!existsSync(target)) {
		console.error(chalk.red(`DESIGN.md yok: ${target}`));
		console.log(chalk.dim("  Once: badi tasarim init"));
		process.exit(1);
	}
	const args = ["export", "--format", flags.format, target];
	if (flags.out && flags.out !== target) {
		args.push("--out", resolve(process.cwd(), flags.out));
	}
	runDesignMd(args);
}

function subShow(flags) {
	const target = resolve(process.cwd(), flags.out || DEFAULT_PATH);
	if (!existsSync(target)) {
		console.error(chalk.red(`DESIGN.md yok: ${target}`));
		console.log(chalk.dim("  Once: badi tasarim init"));
		process.exit(1);
	}
	const content = readFileSync(target, "utf-8");

	const m = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!m) {
		console.error(chalk.red("DESIGN.md frontmatter parse edilemedi (--- ile sarmalanmis YAML bekliyor)"));
		process.exit(1);
	}
	const [, frontmatter, body] = m;

	if (flags.tokens) {
		console.log(frontmatter);
		return;
	}
	if (flags.prose) {
		console.log(body);
		return;
	}
	// Default: both
	showBanner();
	console.log(chalk.bold("Tokens (frontmatter):"));
	console.log("");
	console.log(frontmatter);
	console.log("");
	console.log(chalk.bold("Rationale (prose):"));
	console.log("");
	console.log(body.trim());
}

export async function runTasarim(args) {
	const sub = args[0];

	if (!sub || sub === "--help" || sub === "-h") {
		showHelp();
		return;
	}

	const flags = parseFlags(args.slice(1));

	switch (sub) {
		case "init":
			return subInit(flags);
		case "lint":
			return subLint(flags);
		case "export":
			return subExport(flags);
		case "show":
			return subShow(flags);
		default:
			console.error(chalk.red(`Bilinmeyen alt komut: ${sub}`));
			console.log(chalk.dim("  Gecerli: init | lint | export | show"));
			console.log(chalk.dim("  Yardim: badi tasarim --help"));
			process.exit(1);
	}
}
