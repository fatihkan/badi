// Cross-platform test runner.
//
// Sebep: shell glob (bash) Windows cmd'de yok; Node 22 'node --test tests/'
// directory argini modul olarak yorumluyor. Bu script tests/*.test.js
// dosyalarini Node.js readdirSync ile bulup --test flagiyle calistirir.

import { spawn } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] || "tests";
const watch = process.argv.includes("--watch");

const files = readdirSync(dir)
	.filter((f) => f.endsWith(".test.js"))
	.map((f) => join(dir, f));

if (files.length === 0) {
	console.error(`No .test.js dosyasi bulunamadi: ${dir}`);
	process.exit(1);
}

const args = ["--test"];
if (watch) args.push("--watch");
args.push(...files);

const cp = spawn(process.execPath, args, { stdio: "inherit" });
cp.on("exit", (code) => process.exit(code ?? 1));
