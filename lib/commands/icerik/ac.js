import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { chalk } from "../../cli.js";
import { getOpener } from "../../platform.js";

export function runAc(args) {
	const workspaceBase = join(process.cwd(), ".claude", "workspace");
	if (!existsSync(workspaceBase)) {
		console.log(
			chalk.dim(
				'No workspace. Generate content first: badi icerik post "topic"',
			),
		);
		return;
	}

	const filtre = args[1] || "";
	const subdirs = ["icerikler", "senaryolar", "gorseller", "takvim"];
	const allFiles = [];
	for (const dir of subdirs) {
		const dirPath = join(workspaceBase, dir);
		if (!existsSync(dirPath)) continue;
		const files = readdirSync(dirPath).filter((f) => f.endsWith(".md"));
		for (const f of files) {
			if (filtre && !f.toLowerCase().includes(filtre.toLowerCase())) continue;
			const fullPath = join(dirPath, f);
			const stat = statSync(fullPath);
			allFiles.push({ path: fullPath, name: f, mtime: stat.mtime, dir });
		}
	}

	const markaPath = join(workspaceBase, "marka-sesi.md");
	if (
		existsSync(markaPath) &&
		(!filtre || "marka".includes(filtre.toLowerCase()))
	) {
		const stat = statSync(markaPath);
		allFiles.push({
			path: markaPath,
			name: "marka-sesi.md",
			mtime: stat.mtime,
			dir: "workspace",
		});
	}

	if (allFiles.length === 0) {
		console.log(
			chalk.yellow(`No matching files${filtre ? ` ("${filtre}")` : ""}.`),
		);
		console.log(chalk.dim("For the file list: badi icerik list"));
		return;
	}

	allFiles.sort((a, b) => b.mtime - a.mtime);
	const latest = allFiles[0];
	const relPath = relative(process.cwd(), latest.path);

	console.log(chalk.bold("Latest content file:"));
	console.log(`  ${chalk.cyan(relPath)}`);
	console.log(
		chalk.dim(
			`  Last modified: ${latest.mtime.toISOString().substring(0, 16).replace("T", " ")}`,
		),
	);
	console.log("");

	if (args.includes("--open") || args.includes("-o")) {
		const editor = process.env.EDITOR || process.env.VISUAL;
		if (editor) {
			try {
				execFileSync(editor, [latest.path], { stdio: "inherit" });
			} catch {
				console.log(chalk.dim(`To open: ${editor} ${relPath}`));
			}
		} else {
			const { cmd, args: openerArgs } = getOpener();
			try {
				execFileSync(cmd, [...openerArgs, latest.path], { stdio: "ignore" });
				console.log(chalk.green(`File opened: ${relPath}`));
			} catch {
				console.log(chalk.dim(`  open ${relPath}     # macOS`));
				console.log(chalk.dim(`  start ${relPath}    # Windows`));
				console.log(chalk.dim(`  code ${relPath}     # VS Code`));
			}
		}
	} else {
		console.log(chalk.dim("To open in editor: badi icerik ac --open"));
	}

	if (args.includes("--cat") || args.includes("-c")) {
		console.log("");
		console.log(chalk.bold("Content:"));
		console.log(chalk.dim("─".repeat(50)));
		console.log(readFileSync(latest.path, "utf-8"));
		console.log(chalk.dim("─".repeat(50)));
	}
}
