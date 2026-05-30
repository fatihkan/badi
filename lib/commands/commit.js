import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { chalk, showBanner } from "../cli.js";

const TYPES = [
	{ type: "feat", desc: "New feature", emoji: "+" },
	{ type: "fix", desc: "Bug fix", emoji: "x" },
	{ type: "docs", desc: "Documentation", emoji: "d" },
	{ type: "style", desc: "Format, whitespace", emoji: "s" },
	{ type: "refactor", desc: "Refactor", emoji: "r" },
	{ type: "perf", desc: "Performance", emoji: "p" },
	{ type: "test", desc: "Add/update tests", emoji: "t" },
	{ type: "chore", desc: "Chores", emoji: "c" },
	{ type: "ci", desc: "CI/CD changes", emoji: "ci" },
	{ type: "build", desc: "Build system", emoji: "b" },
];

function git(args) {
	try {
		return execFileSync("git", args, {
			encoding: "utf-8",
			timeout: 10000,
		}).trim();
	} catch (e) {
		throw new Error(`git ${args[0]} error: ${e.message}`);
	}
}

function showStagedChanges() {
	try {
		const diff = git(["diff", "--cached", "--stat"]);
		if (!diff) return null;
		return diff;
	} catch {
		return null;
	}
}

// ─── commit ───

export async function runCommit(args) {
	if (args[0] === "--help" || args[0] === "-h") {
		showBanner();
		console.log(chalk.bold("Conventional Commit Help:"));
		console.log("");
		console.log(
			`  ${chalk.cyan("badi commit")}                        Show type + message suggestions`,
		);
		console.log(
			`  ${chalk.cyan("badi commit --check")}                Lint-check the last commit`,
		);
		console.log(
			`  ${chalk.cyan("badi commit --message 'feat: X'")}    Conventional check + git commit`,
		);
		console.log("");
		console.log(chalk.bold("Types:"));
		for (const t of TYPES) {
			console.log(`  ${chalk.cyan(t.type.padEnd(10))} ${chalk.dim(t.desc)}`);
		}
		console.log("");
		console.log(chalk.bold("Format:"));
		console.log(chalk.dim("  <type>(<scope>): <short description>"));
		console.log(chalk.dim("  "));
		console.log(chalk.dim("  <body — what/why>"));
		console.log(chalk.dim("  "));
		console.log(chalk.dim("  BREAKING CHANGE: <description>"));
		return;
	}

	// --check: verify whether the last commit is conventional
	if (args.includes("--check")) {
		showBanner();
		const lastMsg = git(["log", "-1", "--pretty=%B"]);
		console.log(chalk.bold("Last Commit:"));
		console.log(chalk.dim(lastMsg.substring(0, 200)));
		console.log("");

		const firstLine = lastMsg.split("\n")[0];
		const convRegex =
			/^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\([a-z0-9-]+\))?!?:\s.{1,100}$/;
		if (convRegex.test(firstLine)) {
			console.log(chalk.bold.green("Conventional commit format OK!"));
			return;
		}

		console.log(chalk.bold.red("Conventional commit format INVALID"));
		console.log("");
		console.log(chalk.bold("Expected format:"));
		console.log(chalk.dim("  type(scope): short description"));
		console.log("");
		console.log(chalk.bold("Example:"));
		console.log(chalk.dim("  feat(auth): add JWT token refresh"));
		console.log(chalk.dim("  fix(api): handle 500 error on publish"));
		process.exit(1);
	}

	// real commit via --message
	const msgIdx = args.indexOf("--message");
	if (msgIdx >= 0) {
		const message = args[msgIdx + 1];
		if (!message) {
			console.error(chalk.red("Message empty"));
			process.exit(1);
		}

		const firstLine = message.split("\n")[0];
		const convRegex =
			/^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\([a-z0-9-]+\))?!?:\s.{1,100}$/;
		if (!convRegex.test(firstLine)) {
			console.error(chalk.red("Conventional format MISMATCH"));
			console.log(chalk.dim(`  Got: ${firstLine}`));
			console.log(chalk.dim("  Expected: type(scope): description"));
			process.exit(1);
		}

		try {
			execFileSync("git", ["commit", "-m", message], { stdio: "inherit" });
		} catch (e) {
			console.error(chalk.red(`Commit error: ${e.message}`));
			process.exit(1);
		}
		return;
	}

	// Default: interactive guidance
	showBanner();
	console.log(chalk.bold("Create Conventional Commit:"));
	console.log("");

	const staged = showStagedChanges();
	if (staged) {
		console.log(chalk.bold("Staged Files:"));
		console.log(chalk.dim(staged));
		console.log("");
	} else {
		console.log(chalk.yellow("No staged files. Run git add ... first."));
		return;
	}

	console.log(chalk.bold("Suggested Types:"));
	for (const t of TYPES) {
		console.log(`  ${chalk.cyan(t.type.padEnd(10))} ${chalk.dim(t.desc)}`);
	}

	console.log("");
	console.log(chalk.bold("To commit:"));
	console.log(
		chalk.dim('  badi commit --message "feat(area): short description"'),
	);
	console.log(chalk.dim('  git commit -m "feat(area): short description"'));
	console.log("");
	console.log(chalk.bold("To check:"));
	console.log(chalk.dim("  badi commit --check    # Verify the last commit"));
}

// ─── changelog ───

function parseCommits(range) {
	const format = "%H|%s|%an|%aI";
	const raw = git(["log", range, `--pretty=format:${format}`]);
	if (!raw) return [];
	return raw
		.split("\n")
		.filter(Boolean)
		.map((line) => {
			const [hash, subject, author, date] = line.split("|");
			return { hash: hash.substring(0, 7), subject, author, date };
		});
}

function groupCommits(commits) {
	const groups = {
		feat: { label: "Added", emoji: "+" },
		fix: { label: "Fixed", emoji: "x" },
		perf: { label: "Performance", emoji: "p" },
		refactor: { label: "Refactored", emoji: "r" },
		docs: { label: "Documentation", emoji: "d" },
		test: { label: "Test", emoji: "t" },
		build: { label: "Build", emoji: "b" },
		ci: { label: "CI/CD", emoji: "ci" },
		chore: { label: "Chores", emoji: "c" },
		other: { label: "Other", emoji: "?" },
	};
	const result = {};
	for (const c of commits) {
		const m = c.subject.match(/^(\w+)(?:\([^)]+\))?!?:\s*(.+)$/);
		const type = m ? m[1] : "other";
		const clean = m ? m[2] : c.subject;
		if (!groups[type]) continue;
		if (!result[type]) result[type] = [];
		result[type].push({ ...c, clean });
	}
	return { groups, result };
}

export async function runChangelog(args) {
	if (args[0] === "--help" || args[0] === "-h") {
		showBanner();
		console.log(chalk.bold("Changelog Generator:"));
		console.log("");
		console.log(
			`  ${chalk.cyan("badi changelog")}                    From last tag to HEAD`,
		);
		console.log(
			`  ${chalk.cyan("badi changelog --from v1.0.0")}      Since a specific tag`,
		);
		console.log(
			`  ${chalk.cyan("badi changelog --to v2.0.0")}        Up to a specific tag`,
		);
		console.log(
			`  ${chalk.cyan("badi changelog --version 1.5.0")}    Generate a new CHANGELOG.md section`,
		);
		console.log(
			`  ${chalk.cyan("badi changelog --write")}            Append to CHANGELOG.md`,
		);
		console.log("");
		console.log(chalk.dim("Groups by conventional commit types."));
		return;
	}

	// Parameters
	let fromRef = null;
	let toRef = "HEAD";
	let version = null;
	const write = args.includes("--write");
	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--from") fromRef = args[++i];
		else if (args[i] === "--to") toRef = args[++i];
		else if (args[i] === "--version") version = args[++i];
	}

	// If fromRef is not given, find the latest tag
	if (!fromRef) {
		try {
			fromRef = git(["describe", "--tags", "--abbrev=0"]);
		} catch {
			// No tag — start from the first commit
			fromRef = git(["rev-list", "--max-parents=0", "HEAD"]).split("\n")[0];
		}
	}

	const range = `${fromRef}..${toRef}`;
	showBanner();
	console.log(chalk.bold(`Changelog: ${fromRef} -> ${toRef}`));
	console.log("");

	const commits = parseCommits(range);
	if (commits.length === 0) {
		console.log(chalk.dim("No commits in this range."));
		return;
	}

	const { groups, result } = groupCommits(commits);
	const today = new Date().toISOString().substring(0, 10);

	// Markdown output
	const lines = [];
	if (version) lines.push(`## [${version}] - ${today}`);
	else lines.push(`## [${toRef}] - ${today}`);
	lines.push("");

	for (const [type, items] of Object.entries(result)) {
		if (items.length === 0) continue;
		lines.push(`### ${groups[type].label}`);
		for (const c of items) {
			lines.push(`- ${c.clean} (${c.hash})`);
		}
		lines.push("");
	}

	const content = lines.join("\n");

	if (write) {
		if (!existsSync("CHANGELOG.md")) {
			writeFileSync("CHANGELOG.md", `# Changelog\n\n${content}\n`);
			console.log(chalk.green("CHANGELOG.md created"));
			return;
		}
		const current = readFileSync("CHANGELOG.md", "utf-8");
		// Insert after the first ## line (or at the top)
		const firstVersionIdx = current.search(/^## /m);
		if (firstVersionIdx >= 0) {
			const updated =
				current.substring(0, firstVersionIdx) +
				content +
				"\n" +
				current.substring(firstVersionIdx);
			writeFileSync("CHANGELOG.md", updated);
		} else {
			writeFileSync("CHANGELOG.md", `${current}\n${content}\n`);
		}
		console.log(
			chalk.green(`CHANGELOG.md updated (${commits.length} commits)`),
		);
	} else {
		console.log(content);
		console.log("");
		console.log(chalk.dim(`Total: ${commits.length} commits`));
		console.log(
			chalk.dim("To write to file: badi changelog --write --version X.Y.Z"),
		);
	}
}
