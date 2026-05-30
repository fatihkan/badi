import { execFileSync } from "node:child_process";
import {
	existsSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { extname, join, relative } from "node:path";
import { chalk, showBanner } from "../cli.js";

// Rough token count (close to OpenAI tiktoken): 1 token ~= 4 chars (EN), ~3.5 in Turkish
function estimateTokens(text) {
	return Math.ceil(text.length / 3.8);
}

function walkDir(dir, exts = [".md", ".json", ".sh"]) {
	const results = [];
	if (!existsSync(dir)) return results;
	function walk(current) {
		for (const entry of readdirSync(current, { withFileTypes: true })) {
			if (entry.name.startsWith(".") && entry.name !== ".claude") continue;
			const full = join(current, entry.name);
			if (entry.isDirectory()) walk(full);
			else if (
				entry.isFile() &&
				(exts.length === 0 || exts.includes(extname(entry.name)))
			) {
				try {
					const stat = statSync(full);
					if (stat.size > 500 * 1024) continue;
					results.push(full);
				} catch {
					/* */
				}
			}
		}
	}
	walk(dir);
	return results;
}

// ─── badi ai token ───

function aiToken() {
	showBanner();
	console.log(chalk.bold("Token Usage Analysis (.claude/)"));
	console.log("");

	const claudeDir = join(process.cwd(), ".claude");
	if (!existsSync(claudeDir)) {
		console.error(chalk.red(".claude/ directory not found"));
		process.exit(1);
	}

	const categories = {
		agents: 0,
		commands: 0,
		hooks: 0,
		skills: 0,
		references: 0,
		memory: 0,
		workspace: 0,
		other: 0,
	};
	const fileList = { agents: [], commands: [], skills: [] };
	let totalFiles = 0;
	let totalBytes = 0;
	let totalTokens = 0;

	for (const subdir of Object.keys(categories)) {
		const path = join(claudeDir, subdir);
		if (!existsSync(path)) continue;
		const files = walkDir(path);
		for (const f of files) {
			try {
				const content = readFileSync(f, "utf-8");
				const tokens = estimateTokens(content);
				categories[subdir] += tokens;
				totalTokens += tokens;
				totalBytes += content.length;
				totalFiles++;
				if (fileList[subdir]) {
					fileList[subdir].push({ path: relative(claudeDir, f), tokens });
				}
			} catch {
				/* */
			}
		}
	}

	// CLAUDE.md
	const claudeMd = join(process.cwd(), "CLAUDE.md");
	let claudeMdTokens = 0;
	if (existsSync(claudeMd)) {
		claudeMdTokens = estimateTokens(readFileSync(claudeMd, "utf-8"));
	}

	console.log(chalk.bold("By Category:"));
	const maxLabel = 12;
	for (const [cat, tokens] of Object.entries(categories)) {
		if (tokens === 0) continue;
		const pct = ((tokens / totalTokens) * 100).toFixed(1);
		const bar = "█".repeat(Math.round(pct / 2));
		const color =
			tokens > 50000 ? chalk.red : tokens > 20000 ? chalk.yellow : chalk.green;
		console.log(
			`  ${cat.padEnd(maxLabel)} ${color(String(tokens).padStart(7))} tokens  ${chalk.dim(`${pct}%`)}  ${chalk.cyan(bar)}`,
		);
	}

	console.log("");
	console.log(chalk.bold("Total:"));
	console.log(`  File count:       ${chalk.cyan(totalFiles)}`);
	console.log(
		`  Total bytes:      ${chalk.cyan(`${(totalBytes / 1024).toFixed(1)} KB`)}`,
	);
	console.log(
		`  Estimated tokens: ${chalk.bold.cyan(totalTokens)} (~${Math.round(totalTokens / 1000)}K)`,
	);
	if (claudeMdTokens > 0) {
		console.log(`  CLAUDE.md:        ${chalk.cyan(claudeMdTokens)} tokens`);
	}

	// v1.17+ opt-in skill note: the vault is not loaded, report it separately
	const vaultDir = join(claudeDir, "skills-vault");
	if (existsSync(vaultDir)) {
		let vaultTokens = 0;
		for (const f of walkDir(vaultDir)) {
			try {
				vaultTokens += estimateTokens(readFileSync(f, "utf-8"));
			} catch {
				/* */
			}
		}
		if (vaultTokens > 0) {
			console.log(
				`  ${chalk.dim("Vault (not loaded):")}  ${chalk.dim(vaultTokens)} tokens ${chalk.dim("— select with 'badi skills'")}`,
			);
		}
	}

	// Largest files
	console.log("");
	console.log(chalk.bold("Largest 10 Files:"));
	const allFiles = [
		...fileList.agents,
		...fileList.commands,
		...fileList.skills,
	]
		.sort((a, b) => b.tokens - a.tokens)
		.slice(0, 10);
	for (const f of allFiles) {
		console.log(
			`  ${chalk.yellow(String(f.tokens).padStart(6))} ${chalk.dim(f.path)}`,
		);
	}

	// Warnings
	console.log("");
	if (totalTokens > 150000) {
		console.log(
			chalk.red("WARNING: Total tokens are high. Optimization suggestions:"),
		);
		console.log(
			chalk.dim("  - Split large SKILL.md files into reference files"),
		);
		console.log(chalk.dim("  - Remove unused commands"));
		console.log(chalk.dim("  - Minimize CLAUDE.md"));
	} else if (totalTokens > 80000) {
		console.log(chalk.yellow("Token usage is moderate. Keep monitoring."));
	} else {
		console.log(chalk.green("Token usage is healthy."));
	}
}

// ─── badi ai prompt-test ───

function aiPromptTest() {
	showBanner();
	console.log(chalk.bold("Prompt Regression Test"));
	console.log("");

	const commandsDir = join(process.cwd(), ".claude", "commands");
	const agentsDir = join(process.cwd(), ".claude", "agents");
	let issues = 0;
	let checked = 0;

	function checkFile(path, type) {
		const content = readFileSync(path, "utf-8");
		const name = relative(process.cwd(), path);
		checked++;

		// Empty file
		if (content.trim().length < 50) {
			console.log(
				`  ${chalk.red("XX")} ${name} — too short (${content.trim().length} chars)`,
			);
			issues++;
			return;
		}

		// Agent frontmatter check
		if (type === "agent") {
			if (!content.startsWith("---")) {
				console.log(`  ${chalk.red("XX")} ${name} — frontmatter missing`);
				issues++;
			} else {
				const hasName = /^name:\s*\S/m.test(content);
				const hasDesc = /^description:\s*\S/m.test(content);
				if (!hasName || !hasDesc) {
					console.log(
						`  ${chalk.yellow("!!")} ${name} — name/description missing`,
					);
					issues++;
				}
			}
		}

		// TODO/TBD/FIXME check (for production)
		const todos = content.match(/\b(TODO|TBD|FIXME|XXX)\b/g);
		if (todos && todos.length > 0) {
			console.log(
				`  ${chalk.yellow("!!")} ${name} — ${todos.length} TODO/FIXME`,
			);
			issues++;
		}

		// Very long single line (formatting may be broken)
		const lines = content.split("\n");
		const longLines = lines.filter((l) => l.length > 500).length;
		if (longLines > 0) {
			console.log(
				`  ${chalk.yellow("!!")} ${name} — ${longLines} long lines (>500 chars)`,
			);
			issues++;
		}
	}

	console.log(chalk.bold("Slash Commands:"));
	if (existsSync(commandsDir)) {
		for (const f of readdirSync(commandsDir).filter((f) => f.endsWith(".md"))) {
			checkFile(join(commandsDir, f), "command");
		}
	}

	console.log("");
	console.log(chalk.bold("Agents:"));
	if (existsSync(agentsDir)) {
		for (const f of readdirSync(agentsDir).filter((f) => f.endsWith(".md"))) {
			checkFile(join(agentsDir, f), "agent");
		}
	}

	console.log("");
	if (issues === 0) {
		console.log(chalk.bold.green(`${checked} files clean!`));
	} else {
		console.log(
			chalk.bold.yellow(`${checked} files checked, ${issues} issues found.`),
		);
	}
}

// ─── badi ai memory-diff ───

function aiMemoryDiff() {
	const memoryFile = join(process.cwd(), ".claude", "memory.md");
	const kbFile = join(process.cwd(), ".claude", "knowledge-base.md");
	const globalMemDir = join(homedir(), ".claude", "projects");

	showBanner();
	console.log(chalk.bold("Memory Analysis"));
	console.log("");

	if (existsSync(memoryFile)) {
		const content = readFileSync(memoryFile, "utf-8");
		const lines = content.split("\n").length;
		const limit = 100;
		const tokens = estimateTokens(content);
		const color =
			lines > limit
				? chalk.red
				: lines > limit * 0.8
					? chalk.yellow
					: chalk.green;
		console.log(chalk.bold("Session Memory (.claude/memory.md):"));
		console.log(`  Lines: ${color(lines)} / ${limit}`);
		console.log(`  Token: ${chalk.cyan(tokens)}`);
		if (lines > limit) {
			console.log(
				chalk.yellow("  WARNING: Limit exceeded. Consolidation recommended."),
			);
		}
		console.log("");
	}

	if (existsSync(kbFile)) {
		const content = readFileSync(kbFile, "utf-8");
		const lines = content.split("\n").length;
		const limit = 200;
		const tokens = estimateTokens(content);
		const color =
			lines > limit
				? chalk.red
				: lines > limit * 0.8
					? chalk.yellow
					: chalk.green;
		console.log(chalk.bold("Knowledge Base (.claude/knowledge-base.md):"));
		console.log(`  Lines: ${color(lines)} / ${limit}`);
		console.log(`  Token: ${chalk.cyan(tokens)}`);
		// TBD/TODO check
		const forbidden = content.match(/\b(TBD|TODO|FIXME)\b/g);
		if (forbidden && forbidden.length > 0) {
			console.log(
				chalk.red(
					`  WARNING: ${forbidden.length} TBD/TODO/FIXME — FORBIDDEN in knowledge-base`,
				),
			);
		}
		console.log("");
	}

	// Global projects comparison (if any)
	if (existsSync(globalMemDir)) {
		const projects = readdirSync(globalMemDir, { withFileTypes: true })
			.filter((d) => d.isDirectory())
			.map((d) => d.name);
		if (projects.length > 1) {
			console.log(chalk.bold(`Global Memory Projects (${projects.length}):`));
			for (const p of projects.slice(0, 10)) {
				const memFile = join(globalMemDir, p, "memory", "MEMORY.md");
				if (existsSync(memFile)) {
					try {
						const c = readFileSync(memFile, "utf-8");
						console.log(
							`  ${chalk.dim(p.padEnd(40))} ${chalk.cyan(`${c.split("\n").length} lines`)}`,
						);
					} catch {
						/* */
					}
				}
			}
		}
	}
}

// ─── badi ai review ───

async function aiReview() {
	showBanner();
	console.log(chalk.bold("Staged Diff AI Review"));
	console.log("");

	const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
	if (!apiKey) {
		console.error(chalk.red("ANTHROPIC_API_KEY is not set."));
		console.log(chalk.dim("Setup: export ANTHROPIC_API_KEY=sk-ant-..."));
		console.log(
			chalk.dim("Sign up: https://console.anthropic.com/settings/keys"),
		);
		process.exit(1);
	}

	// Get the staged diff
	let diff;
	try {
		diff = execFileSync("git", ["diff", "--cached"], { encoding: "utf-8" });
	} catch {
		console.error(chalk.red("git diff error"));
		process.exit(1);
	}

	if (!diff || diff.trim().length < 50) {
		console.log(chalk.yellow("No staged changes. Run git add ... first."));
		return;
	}

	if (diff.length > 50000) {
		console.log(
			chalk.yellow(
				`Diff too large (${(diff.length / 1024).toFixed(1)}KB). First 50KB will be sent.`,
			),
		);
		diff = diff.substring(0, 50000);
	}

	console.log(
		chalk.cyan(
			`Sending to the Claude API (${(diff.length / 1024).toFixed(1)}KB)...`,
		),
	);
	console.log("");

	const systemPrompt = `You are a senior code reviewer. Review the staged git diff and report findings in these categories:
1. CRITICAL security issues
2. Potential bugs
3. Performance issues
4. Code quality (DRY, naming, complexity)
5. Positive observations

Be concise and concrete. Give a file:line reference for each finding. Write in English.`;

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 60000);

	try {
		const res = await fetch("https://api.anthropic.com/v1/messages", {
			method: "POST",
			signal: controller.signal,
			headers: {
				"content-type": "application/json",
				"x-api-key": apiKey,
				"anthropic-version": "2023-06-01",
			},
			body: JSON.stringify({
				model: "claude-haiku-4-5-20251001",
				max_tokens: 2000,
				system: systemPrompt,
				messages: [
					{
						role: "user",
						content: `Git diff review:\n\n\`\`\`diff\n${diff}\n\`\`\``,
					},
				],
			}),
		});
		clearTimeout(timeout);

		if (!res.ok) {
			const err = await res.text();
			console.error(chalk.red(`API error: ${res.status}`));
			console.error(chalk.dim(err.substring(0, 500)));
			process.exit(1);
		}

		const data = await res.json();
		const review = data.content?.[0]?.text || "(empty response)";
		console.log(chalk.bold("Code Review:"));
		console.log("");
		console.log(review);
		console.log("");
		console.log(
			chalk.dim(
				`Model: ${data.model}  Tokens: in=${data.usage?.input_tokens} out=${data.usage?.output_tokens}`,
			),
		);
	} catch (e) {
		clearTimeout(timeout);
		console.error(chalk.red(`Error: ${e.message}`));
		process.exit(1);
	}
}

// ─── badi ai translate ───

async function aiTranslate(args) {
	const sourceFile = args[0];
	if (!sourceFile) {
		console.error(
			chalk.red("Source file required: badi ai translate [file.md] --to en"),
		);
		process.exit(1);
	}
	if (!existsSync(sourceFile)) {
		console.error(chalk.red(`File not found: ${sourceFile}`));
		process.exit(1);
	}

	const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
	if (!apiKey) {
		console.error(chalk.red("ANTHROPIC_API_KEY is not set."));
		process.exit(1);
	}

	let targetLang = "en";
	const toIdx = args.indexOf("--to");
	if (toIdx >= 0) targetLang = args[toIdx + 1] || "en";

	const content = readFileSync(sourceFile, "utf-8");
	if (content.length > 30000) {
		console.error(chalk.red("File too large (>30KB). Send in chunks."));
		process.exit(1);
	}

	showBanner();
	console.log(
		chalk.bold(
			`Content Translation: ${sourceFile} -> ${targetLang.toUpperCase()}`,
		),
	);
	console.log("");

	const langMap = {
		tr: "Turkish",
		en: "English",
		es: "Spanish",
		de: "German",
		fr: "French",
	};
	const targetName = langMap[targetLang] || targetLang;

	const systemPrompt = `You are a content translation expert. Preserve the social-media/blog content tone. Don't break the markdown formatting. Localize hashtags and technical terms appropriately.`;

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 60000);

	try {
		const res = await fetch("https://api.anthropic.com/v1/messages", {
			method: "POST",
			signal: controller.signal,
			headers: {
				"content-type": "application/json",
				"x-api-key": apiKey,
				"anthropic-version": "2023-06-01",
			},
			body: JSON.stringify({
				model: "claude-haiku-4-5-20251001",
				max_tokens: 4000,
				system: systemPrompt,
				messages: [
					{
						role: "user",
						content: `Translate this content to ${targetName}. Preserve the markdown structure.\n\n${content}`,
					},
				],
			}),
		});
		clearTimeout(timeout);

		if (!res.ok) {
			const err = await res.text();
			console.error(chalk.red(`API error: ${res.status}`));
			console.error(chalk.dim(err.substring(0, 500)));
			process.exit(1);
		}

		const data = await res.json();
		const translated = data.content?.[0]?.text || "";

		// Write to file
		const ext = extname(sourceFile);
		const base = sourceFile.substring(0, sourceFile.length - ext.length);
		const outFile = `${base}-${targetLang}${ext}`;
		writeFileSync(outFile, translated);

		console.log(chalk.bold.green("Translation complete!"));
		console.log(`  Output: ${chalk.cyan(outFile)}`);
		console.log(
			chalk.dim(
				`  Model: ${data.model}  Tokens: in=${data.usage?.input_tokens} out=${data.usage?.output_tokens}`,
			),
		);
	} catch (e) {
		clearTimeout(timeout);
		console.error(chalk.red(`Error: ${e.message}`));
		process.exit(1);
	}
}

// ─── Main command ───

export async function runAi(args) {
	const sub = args[0];

	if (!sub || sub === "--help" || sub === "-h") {
		showBanner();
		console.log(chalk.bold("AI/LLM Tools:"));
		console.log("");
		console.log(chalk.bold.cyan("Analysis (no API required):"));
		console.log(
			`  ${chalk.cyan("badi ai token")}           Token usage analysis (.claude/)`,
		);
		console.log(
			`  ${chalk.cyan("badi ai prompt-test")}     Slash/agent files regression`,
		);
		console.log(
			`  ${chalk.cyan("badi ai memory-diff")}     memory.md + knowledge-base limit analysis`,
		);
		console.log("");
		console.log(chalk.bold.cyan("Claude API (ANTHROPIC_API_KEY required):"));
		console.log(
			`  ${chalk.cyan("badi ai review")}          Staged diff AI code review`,
		);
		console.log(
			`  ${chalk.cyan("badi ai translate [file]")} Markdown translation (--to en|de|fr)`,
		);
		console.log("");
		console.log(chalk.bold("API Key:"));
		console.log(chalk.dim("  export ANTHROPIC_API_KEY=sk-ant-..."));
		console.log(
			chalk.dim("  Sign up: https://console.anthropic.com/settings/keys"),
		);
		return;
	}

	try {
		switch (sub) {
			case "token":
				aiToken();
				break;
			case "prompt-test":
				aiPromptTest();
				break;
			case "memory-diff":
				aiMemoryDiff();
				break;
			case "review":
				await aiReview();
				break;
			case "translate":
				await aiTranslate(args.slice(1));
				break;
			default:
				console.error(chalk.red(`Unknown ai command: ${sub}`));
				console.log(
					"Usage: badi ai [token|prompt-test|memory-diff|review|translate]",
				);
				process.exit(1);
		}
	} catch (e) {
		console.error(chalk.red(`Error: ${e.message}`));
		process.exit(1);
	}
}
