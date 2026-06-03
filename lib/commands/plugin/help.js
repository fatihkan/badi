import { chalk } from "../../cli.js";

export function runHelp() {
	console.log(chalk.bold("Plugin Management:"));
	console.log(`  badi plugin install <source>   Install a plugin`);
	console.log(`  badi plugin remove <name>      Remove a plugin`);
	console.log(`  badi plugin list               List installed plugins`);
	console.log(`  badi plugin show <name>        Plugin details (v1.29+)`);
	console.log(
		`  badi plugin doctor             Health check for all plugins (v1.30+)`,
	);
	console.log(
		`  badi plugin graph              Print the plugin dependency tree (v1.30+)`,
	);
}
