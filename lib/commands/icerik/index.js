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

export async function runIcerik(args) {
	const subcommand = args[0];

	if (!subcommand || subcommand === "--help" || subcommand === "-h") {
		runHelp();
		return;
	}

	if (subcommand === "list") return runList();
	if (subcommand === "basla") return runBasla();
	if (subcommand === "durum") return runDurum();
	if (subcommand === "fikir") return runFikir(args);
	if (subcommand === "plan") return runPlan();
	if (subcommand === "kapat") return runKapat();
	if (subcommand === "ac") return runAc(args);
	if (subcommand === "perf") return runPerf(args);
	if (subcommand === "ara") return runAra(args);
	if (subcommand === "sablon") return runSablon(args);
	if (subcommand === "release-notes") return runReleaseNotes(args);

	if (TEMPLATE_TYPES.includes(subcommand)) {
		return await runTemplate(args);
	}

	console.error(chalk.red(`Bilinmeyen icerik turu: ${subcommand}`));
	console.log(`Gecerli turler: ${TEMPLATE_TYPES.join(", ")}, ara, sablon`);
	console.log("Yardim: badi icerik --help");
	process.exit(1);
}
