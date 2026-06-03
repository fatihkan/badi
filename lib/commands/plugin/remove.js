import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { chalk } from "../../cli.js";
import { pluginsDir } from "./_shared.js";

export function runRemove(args) {
	const name = args[0];
	if (!name) {
		console.error(chalk.red("Error: No plugin name specified."));
		process.exit(1);
	}
	const dir = join(pluginsDir(process.cwd()), name);
	if (!existsSync(dir)) {
		console.error(chalk.red(`Plugin '${name}' not found.`));
		process.exit(1);
	}
	rmSync(dir, { recursive: true });
	console.log(chalk.green(`Plugin '${name}' removed successfully.`));
}
