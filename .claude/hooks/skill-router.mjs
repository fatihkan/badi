#!/usr/bin/env node
// Badi - UserPromptSubmit Auto-Router
//
// Kullanicinin yazdigi prompt'u okur, vault'taki SKILL.md aciklamalarina karsi
// keyword match yapar, eslesen skill'lerin SKILL.md govdesini context olarak
// Claude'a verir. Filesystem'e yazma yok — per-turn injection.
//
// Aktif etmek icin: badi skills auto on
// Kapatmak icin:    badi skills auto off

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
	commandAvailable,
	projectRoot,
	readStdinJson,
	writeContextInjection,
} from "../../lib/hooks/util.js";

const input = await readStdinJson();
const prompt = input.prompt || "";

if (!prompt.trim()) process.exit(0);

const wordCount = prompt.trim().split(/\s+/).length;
if (wordCount < 3) process.exit(0);

const root = projectRoot();
const vaultDir = join(root, ".claude", "skills-vault");
if (!existsSync(vaultDir)) process.exit(0);

// badi binary'sini bul (npm-link, npm-global, node_modules fallback)
let badi;
if (commandAvailable("badi")) {
	badi = "badi";
} else {
	const localBin = join(root, "node_modules", ".bin", "badi");
	const localBinCmd = `${localBin}.cmd`; // Windows
	if (existsSync(localBin)) badi = localBin;
	else if (existsSync(localBinCmd)) badi = localBinCmd;
	else process.exit(0);
}

let injection = "";
try {
	injection = execFileSync(
		badi,
		["skills", "route", "--inject", "--top", "3", prompt],
		{ encoding: "utf-8", cwd: root, stdio: ["ignore", "pipe", "ignore"] },
	).trim();
} catch {
	process.exit(0);
}

if (!injection) process.exit(0);

writeContextInjection(injection);
process.exit(0);
