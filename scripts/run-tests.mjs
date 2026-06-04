// Cross-platform test runner.
//
// Reason: shell glob (bash) does not exist in Windows cmd; Node 22 interprets
// the 'node --test tests/' directory arg as a module. This script finds the
// tests/*.test.js files via Node.js readdirSync and runs them with the --test flag.

import { spawn } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] || "tests";
const watch = process.argv.includes("--watch");

const files = readdirSync(dir)
	.filter((f) => f.endsWith(".test.js"))
	.map((f) => join(dir, f));

if (files.length === 0) {
	console.error(`No .test.js files found: ${dir}`);
	process.exit(1);
}

const args = ["--test"];
if (watch) args.push("--watch");
args.push(...files);

const cp = spawn(process.execPath, args, { stdio: "inherit" });
cp.on("exit", (code) => process.exit(code ?? 1));
