import { existsSync } from "node:fs";
import { join } from "node:path";
import { chalk } from "../../cli.js";
import { searchWorkspaceFiles } from "../../icerik-helpers.js";

export function runAra(args) {
	const workspaceBase = join(process.cwd(), ".claude", "workspace");
	const araArgs = args.slice(1);
	let query = "";
	const filters = {};
	let format = "text";
	let showAraHelp = false;

	for (let i = 0; i < araArgs.length; i++) {
		switch (araArgs[i]) {
			case "--platform":
				filters.platform = araArgs[++i];
				break;
			case "--tur":
				filters.tur = araArgs[++i];
				break;
			case "--son":
				filters.son = Number.parseInt(araArgs[++i], 10) || 30;
				break;
			case "--hashtag":
				filters.hashtag = araArgs[++i];
				break;
			case "--format":
				format = araArgs[++i];
				break;
			case "--help":
			case "-h":
				showAraHelp = true;
				break;
			default:
				if (!araArgs[i].startsWith("--"))
					query += (query ? " " : "") + araArgs[i];
		}
	}

	if (showAraHelp || !query) {
		console.log(chalk.bold("Content Archive Search:"));
		console.log("");
		console.log(
			`  badi icerik ara [query]           ${chalk.dim("Keyword search")}`,
		);
		console.log(
			`  badi icerik ara [q] --platform X  ${chalk.dim("Platform filter")}`,
		);
		console.log(
			`  badi icerik ara [q] --tur post    ${chalk.dim("Type filter (post/karousel/video/gorsel)")}`,
		);
		console.log(
			`  badi icerik ara [q] --son 30      ${chalk.dim("Last N days")}`,
		);
		console.log(
			`  badi icerik ara [q] --hashtag X   ${chalk.dim("Hashtag search")}`,
		);
		console.log(
			`  badi icerik ara [q] --format json ${chalk.dim("JSON output")}`,
		);
		if (!query && !showAraHelp) {
			console.log("");
			console.log(chalk.yellow("Specify a search query."));
		}
		return;
	}

	if (!existsSync(workspaceBase)) {
		console.log(chalk.yellow("Workspace not found. Generate content first."));
		return;
	}

	const results = searchWorkspaceFiles(workspaceBase, query, filters);

	if (format === "json") {
		console.log(JSON.stringify(results, null, 2));
		return;
	}

	if (results.length === 0) {
		console.log(chalk.yellow(`No results for "${query}".`));
		return;
	}

	console.log(
		chalk.bold(`Search Results: "${query}" (${results.length} results)`),
	);
	console.log("");

	for (let i = 0; i < Math.min(results.length, 20); i++) {
		const r = results[i];
		console.log(
			`  ${chalk.cyan(`${i + 1}.`)} [${chalk.bold(r.icon)}] ${r.file} ${chalk.dim(`(Score: ${r.score})`)}`,
		);
		console.log(`     Date: ${chalk.dim(r.date)} | Dir: ${chalk.dim(r.dir)}`);
		if (r.snippet) console.log(`     ${chalk.dim(`"${r.snippet}"`)}`);
		console.log("");
	}
}
