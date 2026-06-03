import { chalk } from "../../cli.js";
import { runDoctor } from "./doctor.js";
import { runGraph } from "./graph.js";
import { runHelp } from "./help.js";
import { runInstall } from "./install.js";
import { runList } from "./list.js";
import { runRemove } from "./remove.js";
import { runShow } from "./show.js";

// plugin.js v1.30 review C3 fix — was previously 437 lines in a single file.
// Sub-commands now live in separate files, following the icerik/ pattern.

export function runPlugin(args) {
	const sub = args[0];
	if (!sub || sub === "--help" || sub === "-h") {
		runHelp();
		return;
	}
	switch (sub) {
		case "install":
			return runInstall(args.slice(1));
		case "remove":
			return runRemove(args.slice(1));
		case "list":
			return runList();
		case "show":
			return runShow(args.slice(1));
		case "doctor":
			return runDoctor();
		case "graph":
			return runGraph();
		default:
			console.error(chalk.red(`Unknown plugin command: ${sub}`));
			console.log("Usage: badi plugin [install|remove|list|show|doctor|graph]");
			process.exit(1);
	}
}
