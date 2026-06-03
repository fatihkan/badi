import { chalk } from "../../cli.js";
import { runAc } from "./ac.js";
import { runAra } from "./ara.js";
import { runBasla } from "./basla.js";
import { runDurum } from "./durum.js";
import { runFikir } from "./fikir.js";
import { runHelp } from "./help.js";
import { runKapat } from "./kapat.js";
import { runList } from "./list.js";
import { runPerf } from "./perf.js";
import { runPlan } from "./plan.js";
import { runReleaseNotes } from "./release-notes.js";
import { runSablon } from "./sablon.js";
import { runTemplate, TEMPLATE_TYPES } from "./template.js";

const SESSION_SUBCOMMANDS = [
	"list",
	"start",
	"status",
	"idea",
	"plan",
	"close",
	"open",
	"perf",
	"search",
	"template",
	"release-notes",
];

export async function runIcerik(args) {
	const subcommand = args[0];

	if (!subcommand || subcommand === "--help" || subcommand === "-h") {
		runHelp();
		return;
	}

	if (subcommand === "list") return runList();
	if (subcommand === "start") return runBasla();
	if (subcommand === "status") return runDurum();
	if (subcommand === "idea") return runFikir(args);
	if (subcommand === "plan") return runPlan();
	if (subcommand === "close") return runKapat();
	if (subcommand === "open") return runAc(args);
	if (subcommand === "perf") return runPerf(args);
	if (subcommand === "search") return runAra(args);
	if (subcommand === "template") return runSablon(args);
	if (subcommand === "release-notes") return runReleaseNotes(args);

	if (TEMPLATE_TYPES.includes(subcommand)) {
		return await runTemplate(args);
	}

	console.error(chalk.red(`Unknown content type: ${subcommand}`));
	console.log(
		`Valid commands: ${[...SESSION_SUBCOMMANDS, ...TEMPLATE_TYPES].join(", ")}`,
	);
	console.log("Help: badi content --help");
	process.exit(1);
}
