import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, "..");
export const PKG_ROOT = resolve(__dirname, "..");
export const TEMPLATE_DIR = resolve(PKG_ROOT, ".claude");
export const VERSION = JSON.parse(
	readFileSync(resolve(PKG_ROOT, "package.json"), "utf-8"),
).version;

// Renkli cikti icin chalk (dinamik import, ESM)
let chalk;
try {
	chalk = (await import("chalk")).default;
} catch {
	const identity = (s) => s;
	const handler = {
		get() {
			return new Proxy(identity, handler);
		},
		apply(_target, _thisArg, args) {
			return args[0];
		},
	};
	chalk = new Proxy(identity, handler);
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
			console.log(
				chalk.cyan(figlet.textSync("Badi", { horizontalLayout: "default" })),
			);
		} catch {
			console.log(chalk.bold.cyan("\n  B A D I\n"));
		}
	} else {
		console.log(chalk.bold.cyan("\n  B A D I\n"));
	}
	console.log(chalk.dim(`  Claude Code Is Akisi Yonetim Sistemi v${VERSION}`));
	console.log("");
}

export function showVersion() {
	console.log(`badi v${VERSION}`);
}
