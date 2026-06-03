import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";
import { chalk } from "../../cli.js";
import { parseFrontmatter, slugify } from "../../icerik-helpers.js";

export function runSablon(args) {
	const sablonSub = args[1];
	const sablonDir = join(process.cwd(), ".claude", "workspace", "sablonlar");

	if (!sablonSub || sablonSub === "--help" || sablonSub === "-h") {
		console.log(chalk.bold("Template Inheritance System:"));
		console.log("");
		console.log(
			`  badi content template create [name] --extends [type]  ${chalk.dim("Create new template")}`,
		);
		console.log(
			`  badi content template list                            ${chalk.dim("List templates")}`,
		);
		console.log(
			`  badi content template delete [name]                   ${chalk.dim("Delete template")}`,
		);
		console.log("");
		console.log(chalk.bold("Usage:"));
		console.log('  badi content post "topic" --template saas-launch');
		console.log("");
		console.log(chalk.bold("Valid extends types:"));
		console.log("  post, karousel, video, visual, calendar");
		return;
	}

	if (sablonSub === "create") {
		const sablonName = args[2];
		if (!sablonName) {
			console.error(
				chalk.red(
					"Specify a template name: badi content template create [name] --extends [type]",
				),
			);
			process.exit(1);
		}
		let extendsType = "post";
		let description = "";
		for (let i = 3; i < args.length; i++) {
			if (args[i] === "--extends") extendsType = args[++i];
			if (args[i] === "--description") description = args[++i];
		}
		const validBases = ["post", "karousel", "video", "visual", "calendar"];
		if (!validBases.includes(extendsType)) {
			console.error(chalk.red(`Invalid extends type: ${extendsType}`));
			console.log(`Valid types: ${validBases.join(", ")}`);
			process.exit(1);
		}

		mkdirSync(sablonDir, { recursive: true });
		const filePath = join(sablonDir, `${slugify(sablonName)}.md`);
		if (existsSync(filePath)) {
			console.error(chalk.yellow(`Template already exists: ${sablonName}`));
			process.exit(1);
		}

		const sablonContent = `---
name: ${sablonName}
extends: ${extendsType}
description: ${description || `Custom template for ${sablonName}`}
---

## Additional Section
[Customize this section. Appended to the ${extendsType} template.]

## Custom Notes
[Template-specific guide or rules]
`;
		writeFileSync(filePath, sablonContent);
		console.log(chalk.bold.green("Template created!"));
		console.log(`  Name:     ${chalk.cyan(sablonName)}`);
		console.log(`  Inherits: ${chalk.cyan(extendsType)}`);
		console.log(`  File:     ${chalk.cyan(relative(process.cwd(), filePath))}`);
		console.log("");
		console.log(chalk.dim("Edit the file to add custom sections."));
		console.log(
			`Usage: badi content ${extendsType} "topic" --template ${slugify(sablonName)}`,
		);
		return;
	}

	if (sablonSub === "list") {
		if (!existsSync(sablonDir)) {
			console.log(chalk.dim("No custom templates yet."));
			console.log(
				chalk.dim("Create: badi content template create [name] --extends post"),
			);
			return;
		}
		const files = readdirSync(sablonDir).filter((f) => f.endsWith(".md"));
		if (files.length === 0) {
			console.log(chalk.dim("No custom templates yet."));
			return;
		}

		console.log(chalk.bold("Built-in Templates:"));
		console.log(chalk.dim("  post, karousel, video, visual, calendar, brand"));
		console.log("");
		console.log(chalk.bold("Custom Templates:"));
		for (const f of files) {
			const content = readFileSync(join(sablonDir, f), "utf-8");
			const { meta } = parseFrontmatter(content);
			const name = meta.name || f.replace(".md", "");
			const ext = meta.extends || "?";
			const desc = meta.description || "";
			console.log(
				`  ${chalk.cyan(name.padEnd(20))} extends: ${chalk.dim(ext.padEnd(10))} ${chalk.dim(desc)}`,
			);
		}
		return;
	}

	if (sablonSub === "delete") {
		const sablonName = args[2];
		if (!sablonName) {
			console.error(chalk.red("Specify the template name to delete."));
			process.exit(1);
		}
		const filePath = join(sablonDir, `${slugify(sablonName)}.md`);
		if (!existsSync(filePath)) {
			console.error(chalk.red(`Template not found: ${sablonName}`));
			process.exit(1);
		}
		rmSync(filePath);
		console.log(chalk.green(`Template deleted: ${sablonName}`));
		return;
	}

	console.error(chalk.red(`Unknown template command: ${sablonSub}`));
	console.log("Usage: badi content template [create|list|delete]");
	process.exit(1);
}
