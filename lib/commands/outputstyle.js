// Badi outputstyle command — Claude Code output styles management.
//
// .claude/output-styles/<name>.md  → Claude Code per-style prompt extension.
//
// Built-in profiles: terse, verbose, eli5.
// The user installs with `badi outputstyle add <name>`, and activates it in
// Claude Code with `/output-style <name>`.

import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { chalk, showBanner } from "../cli.js";

const BUILTINS = {
	terse: {
		description:
			"Short, concise answers; no unnecessary explanation, one-sentence summary, minimal tables/bullets.",
		body: `Keep your answers short and direct. Summarize in one sentence. Don't use tables or bullets unless asked. For error messages, write only the root cause + fix. When showing a code example, show the minimum necessary — no comments, beyond the main pattern. End-of-turn summaries should be one sentence.`,
	},
	verbose: {
		description:
			"Detailed, contextual answers; spell out decision rationale, alternatives, and trade-offs.",
		body: `In your answers, spell out the rationale behind decisions. State at least one alternative approach and why it wasn't chosen. List the trade-offs (performance, readability, flexibility). Before a code change, summarize why the existing structure is the way it is. At end-of-turn: what changed, why, follow-up suggestions.`,
	},
	eli5: {
		description:
			"Explanations in plain language ('so a 5-year-old understands'); back technical jargon with metaphors.",
		body: `Explain complex concepts in plain language. When you must use a technical term, back it with a metaphor + example. At most one technical concept per sentence. When showing code, add a short explanation under each line (if needed). When explaining an error, first describe it in the 'this should have happened, but this happened' format.`,
	},
};

function paths(target) {
	const dir = join(target, ".claude", "output-styles");
	return { dir };
}

function styleFile(name) {
	const fm = `---
name: ${name}
description: ${BUILTINS[name].description}
---

${BUILTINS[name].body}
`;
	return fm;
}

function listInstalled(dir) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((f) => f.endsWith(".md"))
		.map((f) => f.replace(/\.md$/, ""))
		.sort();
}

function readDescription(dir, name) {
	const file = join(dir, `${name}.md`);
	if (!existsSync(file)) return null;
	try {
		const content = readFileSync(file, "utf-8");
		const m = content.match(/^description:\s*(.+)$/m);
		return m ? m[1].trim() : null;
	} catch {
		return null;
	}
}

function showHelp() {
	console.log(`${chalk.bold("badi outputstyle")} — Claude Code output styles`);
	console.log("");
	console.log(
		"  add <name>      Install a built-in profile to .claude/output-styles/",
	);
	console.log("  remove <name>   Remove an installed profile");
	console.log("  list            Show installed profiles");
	console.log("  available       Show built-in profiles");
	console.log("  clear           Delete all installed profiles");
	console.log("");
	console.log(chalk.bold("Built-in profiles:"));
	for (const [name, p] of Object.entries(BUILTINS)) {
		console.log(`  ${chalk.cyan(name.padEnd(10))} ${chalk.dim(p.description)}`);
	}
	console.log("");
	console.log(
		chalk.dim("Usage: activate inside Claude Code with /output-style <name>."),
	);
}

export async function runOutputstyle(args) {
	const [sub, ...rest] = args;
	const target = process.cwd();
	const { dir } = paths(target);

	if (!sub || sub === "--help" || sub === "-h") {
		showBanner();
		showHelp();
		return;
	}

	if (sub === "available") {
		console.log(chalk.bold("Built-in profiles:"));
		for (const [name, p] of Object.entries(BUILTINS)) {
			console.log(`  ${chalk.cyan(name)} — ${p.description}`);
		}
		return;
	}

	if (sub === "list") {
		const installed = listInstalled(dir);
		if (installed.length === 0) {
			console.log(chalk.dim("(no installed profiles)"));
			console.log(
				chalk.dim("To see built-in profiles: badi outputstyle available"),
			);
			return;
		}
		console.log(chalk.bold(`Installed profiles (${installed.length}):`));
		for (const name of installed) {
			const desc = readDescription(dir, name) || "";
			console.log(`  ${chalk.green(name)} ${chalk.dim(desc)}`);
		}
		return;
	}

	if (sub === "add") {
		const name = rest[0];
		if (!name) {
			console.error(chalk.red("Error: profile name required"));
			console.error("Example: badi outputstyle add terse");
			process.exit(1);
		}
		if (!BUILTINS[name]) {
			console.error(chalk.red(`Error: unknown profile "${name}"`));
			console.error(
				`Available: ${Object.keys(BUILTINS)
					.map((n) => chalk.cyan(n))
					.join(", ")}`,
			);
			process.exit(1);
		}
		mkdirSync(dir, { recursive: true });
		const file = join(dir, `${name}.md`);
		const existed = existsSync(file);
		writeFileSync(file, styleFile(name), "utf-8");
		console.log(
			existed
				? chalk.yellow(`~ updated: .claude/output-styles/${name}.md`)
				: chalk.green(`+ installed: .claude/output-styles/${name}.md`),
		);
		console.log(
			chalk.dim(`Activate: /output-style ${name} inside Claude Code`),
		);
		return;
	}

	if (sub === "remove") {
		const name = rest[0];
		if (!name) {
			console.error(chalk.red("Error: profile name required"));
			process.exit(1);
		}
		const file = join(dir, `${name}.md`);
		if (!existsSync(file)) {
			console.error(chalk.red(`Error: "${name}" not installed`));
			process.exit(1);
		}
		rmSync(file);
		console.log(chalk.yellow(`- deleted: .claude/output-styles/${name}.md`));
		return;
	}

	if (sub === "clear") {
		if (!existsSync(dir)) {
			console.log(chalk.dim("(already empty)"));
			return;
		}
		const installed = listInstalled(dir);
		for (const name of installed) {
			rmSync(join(dir, `${name}.md`));
		}
		console.log(chalk.yellow(`- ${installed.length} profiles deleted`));
		return;
	}

	console.error(chalk.red(`Unknown subcommand: ${sub}`));
	showHelp();
	process.exit(1);
}
