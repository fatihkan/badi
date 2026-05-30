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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { chalk, showBanner } from "../cli.js";

// Is the given path within the project root? A path starting with '..' or an
// absolute path outside the project returns false. Guards against path
// traversal / accidentally overwriting a system file.
function isWithinProject(baseDir, candidate) {
	const rel = relative(baseDir, candidate);
	if (!rel || rel === "") return true;
	if (rel.startsWith("..")) return false;
	if (rel.startsWith("/")) return false;
	return true;
}

function assertProjectPath(flag, candidate) {
	const baseDir = process.cwd();
	if (!isWithinProject(baseDir, candidate)) {
		console.error(
			chalk.red(`${flag} outside project root: ${candidate} (cwd: ${baseDir})`),
		);
		console.error(
			chalk.dim(
				"  Only the current directory and below are accepted as write targets.",
			),
		);
		process.exit(1);
	}
}

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
		write: null,
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
		else if (a === "--write") flags.write = args[++i];
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
	console.log(chalk.bold("Badi Design — Visual Identity Command"));
	console.log("");
	console.log(chalk.bold("Usage:"));
	console.log(
		`  ${chalk.cyan("badi tasarim init")}                      Create a new DESIGN.md`,
	);
	console.log(
		`  ${chalk.cyan("badi tasarim init --ornek <name>")}        Copy from an example template`,
	);
	console.log(
		`  ${chalk.cyan("badi tasarim lint")}                      Validate DESIGN.md`,
	);
	console.log(
		`  ${chalk.cyan("badi tasarim export --format tailwind")}   Generate Tailwind config`,
	);
	console.log(
		`  ${chalk.cyan("badi tasarim export --format dtcg")}       Generate DTCG token JSON`,
	);
	console.log(
		`  ${chalk.cyan("badi tasarim show --tokens")}              Frontmatter only (tokens)`,
	);
	console.log(
		`  ${chalk.cyan("badi tasarim show --prose")}               Markdown body only (rationale)`,
	);
	console.log("");
	console.log(chalk.bold("Options:"));
	console.log(
		`  --out <path>     DESIGN.md file path (default: ${DEFAULT_PATH})`,
	);
	console.log(
		`                   init: write target · lint/show/export: read source`,
	);
	console.log(
		`  --write <path>   Write export output to a file (instead of stdout)`,
	);
	console.log(`  --force          Overwrite an existing DESIGN.md`);
	console.log(`  --ornek <name>   ${EXAMPLES.join(" | ")}`);
	console.log(`  --strict         Lint warnings -> errors`);
	console.log("");
	console.log(chalk.bold("Requirements:"));
	console.log(
		"  Internet (the first npx call downloads the package, then cache)",
	);
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
			`npx ${PINNED_PACKAGE} call failed: ${result.error.message}. Check your internet connection.`,
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
		console.error(chalk.red(`File already exists: ${target}`));
		console.log(chalk.dim("  Use --force to overwrite."));
		process.exit(1);
	}

	if (flags.ornek) {
		if (!EXAMPLES.includes(flags.ornek)) {
			console.error(
				chalk.red(
					`Unknown example: ${flags.ornek}. Valid: ${EXAMPLES.join(", ")}`,
				),
			);
			process.exit(1);
		}
		// Try to fetch example via npx (if @google/design.md exposes them)
		// Fallback: write a comment pointing user to examples upstream
		ensureDir(target);
		const stub = `---
# DESIGN.md — '${flags.ornek}' example
# For the full example: https://github.com/google-labs-code/design.md/tree/main/examples/${flags.ornek}
---

# ${flags.ornek}

If you need the full example, copy DESIGN.md from the URL above and overwrite this.
For a skeleton start: badi tasarim init --force
`;
		writeFileSync(target, stub);
		showBanner();
		console.log(chalk.green(`+ ${target}`));
		console.log(chalk.dim(`  Example: ${flags.ornek}`));
		console.log(
			chalk.dim(
				`  Details: https://github.com/google-labs-code/design.md/tree/main/examples/${flags.ornek}`,
			),
		);
		return;
	}

	ensureDir(target);
	writeFileSync(target, SKELETON);
	showBanner();
	console.log(chalk.green(`+ ${target}`));
	console.log(
		chalk.dim("  Wrote frontmatter tokens + an 8-section prose skeleton."),
	);
	console.log(chalk.dim("  Next: badi tasarim lint"));
}

/**
 * Determine the exit code from lint output. Does not call process.exit —
 * a testable pure function. Returns: 0 (success) or >0 (error).
 */
export function resolveLintExit(stdout, status) {
	try {
		const parsed = JSON.parse(stdout || "");
		const errors = parsed?.summary?.errors ?? 0;
		if (errors > 0 || status !== 0) return status || 1;
		return 0;
	} catch {
		// Non-JSON format: trust the package exit code
		return status !== 0 ? status : 0;
	}
}

function subLint(flags) {
	const target = resolve(process.cwd(), flags.out || DEFAULT_PATH);
	if (!existsSync(target)) {
		console.error(chalk.red(`No DESIGN.md: ${target}`));
		console.log(chalk.dim("  First: badi tasarim init"));
		process.exit(1);
	}
	const args = ["lint", target];
	if (flags.strict) args.push("--strict");
	const result = runDesignMd(args, { captureStdout: true });
	const stdout = result.stdout || "";
	process.stdout.write(stdout);
	const code = resolveLintExit(stdout, result.status);
	if (code !== 0) process.exit(code);
}

function subExport(flags) {
	if (!flags.format) {
		console.error(chalk.red("--format must be specified (tailwind | dtcg)"));
		process.exit(1);
	}
	if (!["tailwind", "dtcg"].includes(flags.format)) {
		console.error(
			chalk.red(`Invalid format: ${flags.format}. Valid: tailwind | dtcg`),
		);
		process.exit(1);
	}
	const target = resolve(process.cwd(), flags.out || DEFAULT_PATH);
	if (!existsSync(target)) {
		console.error(chalk.red(`No DESIGN.md: ${target}`));
		console.log(chalk.dim("  First: badi tasarim init"));
		process.exit(1);
	}
	const args = ["export", "--format", flags.format, target];
	if (flags.write) {
		const writePath = resolve(process.cwd(), flags.write);
		assertProjectPath("--write", writePath);
		const result = runDesignMd(args, { captureStdout: true });
		const stdout = result.stdout || "";
		// Empty-on-error guard: don't write if the package errored or produced
		// empty output. Otherwise a broken/incomplete file gets written to disk.
		if (result.status !== 0) {
			console.error(
				chalk.red(`Export failed (exit ${result.status}); file not written.`),
			);
			process.exit(result.status);
		}
		if (!stdout.trim()) {
			console.error(
				chalk.red("Export returned empty output; file not written."),
			);
			process.exit(1);
		}
		ensureDir(writePath);
		writeFileSync(writePath, stdout);
		console.log(chalk.green(`+ ${writePath}`));
		console.log(chalk.dim(`  Format: ${flags.format}`));
		return;
	}
	runDesignMd(args);
}

function subShow(flags) {
	const target = resolve(process.cwd(), flags.out || DEFAULT_PATH);
	if (!existsSync(target)) {
		console.error(chalk.red(`No DESIGN.md: ${target}`));
		console.log(chalk.dim("  First: badi tasarim init"));
		process.exit(1);
	}
	const content = readFileSync(target, "utf-8");

	const m = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
	if (!m) {
		console.error(
			chalk.red(
				"Could not parse DESIGN.md frontmatter (expects YAML wrapped in ---)",
			),
		);
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
			console.error(chalk.red(`Unknown subcommand: ${sub}`));
			console.log(chalk.dim("  Valid: init | lint | export | show"));
			console.log(chalk.dim("  Help: badi tasarim --help"));
			process.exit(1);
	}
}
