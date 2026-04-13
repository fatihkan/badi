import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
export const PKG_ROOT = resolve(__dirname, "..");
export const TEMPLATE_DIR = resolve(PKG_ROOT, ".claude");
export const VERSION = "1.3.0";

// Renkli cikti icin chalk (dinamik import, ESM)
let chalk;
try {
	chalk = (await import("chalk")).default;
} catch {
	chalk = {
		bold: (s) => s,
		green: (s) => s,
		red: (s) => s,
		yellow: (s) => s,
		cyan: (s) => s,
		gray: (s) => s,
		dim: (s) => s,
		magenta: (s) => s,
		blue: (s) => s,
		white: (s) => s,
	};
	chalk.bold.cyan = (s) => s;
	chalk.bold.green = (s) => s;
	chalk.bold.red = (s) => s;
	chalk.bold.yellow = (s) => s;
	chalk.bold.magenta = (s) => s;
}
export { chalk };

// ASCII banner
let figlet;
try {
	figlet = (await import("figlet")).default;
} catch {
	figlet = null;
}
export { figlet };

export function showBanner() {
	if (figlet) {
		try {
			console.log(chalk.cyan(figlet.textSync("Badi", { horizontalLayout: "default" })));
		} catch {
			console.log(chalk.bold.cyan("\n  B A D I\n"));
		}
	} else {
		console.log(chalk.bold.cyan("\n  B A D I\n"));
	}
	console.log(chalk.dim("  Claude Code Is Akisi Yonetim Sistemi v" + VERSION));
	console.log("");
}

export function showVersion() {
	console.log(`badi v${VERSION}`);
}
