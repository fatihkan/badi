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
		console.log(chalk.bold("Icerik Arsiv Arama:"));
		console.log("");
		console.log(
			`  badi icerik ara [sorgu]           ${chalk.dim("Anahtar kelime arama")}`,
		);
		console.log(
			`  badi icerik ara [s] --platform X  ${chalk.dim("Platform filtresi")}`,
		);
		console.log(
			`  badi icerik ara [s] --tur post    ${chalk.dim("Tur filtresi (post/karousel/video/gorsel)")}`,
		);
		console.log(
			`  badi icerik ara [s] --son 30      ${chalk.dim("Son N gun")}`,
		);
		console.log(
			`  badi icerik ara [s] --hashtag X   ${chalk.dim("Hashtag arama")}`,
		);
		console.log(
			`  badi icerik ara [s] --format json ${chalk.dim("JSON cikti")}`,
		);
		if (!query && !showAraHelp) {
			console.log("");
			console.log(chalk.yellow("Arama sorgusu belirtin."));
		}
		return;
	}

	if (!existsSync(workspaceBase)) {
		console.log(chalk.yellow("Workspace bulunamadi. Once icerik uretin."));
		return;
	}

	const results = searchWorkspaceFiles(workspaceBase, query, filters);

	if (format === "json") {
		console.log(JSON.stringify(results, null, 2));
		return;
	}

	if (results.length === 0) {
		console.log(chalk.yellow(`"${query}" icin sonuc bulunamadi.`));
		return;
	}

	console.log(
		chalk.bold(`Arama Sonuclari: "${query}" (${results.length} sonuc)`),
	);
	console.log("");

	for (let i = 0; i < Math.min(results.length, 20); i++) {
		const r = results[i];
		console.log(
			`  ${chalk.cyan(`${i + 1}.`)} [${chalk.bold(r.icon)}] ${r.file} ${chalk.dim(`(Skor: ${r.score})`)}`,
		);
		console.log(
			`     Tarih: ${chalk.dim(r.date)} | Dizin: ${chalk.dim(r.dir)}`,
		);
		if (r.snippet) console.log(`     ${chalk.dim(`"${r.snippet}"`)}`);
		console.log("");
	}
}
