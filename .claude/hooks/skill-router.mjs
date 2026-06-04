#!/usr/bin/env node
// Badi v1.27+ defensive fail-safe (#162): runtime errors -> exit 0; set BADI_HOOK_DEBUG=1 for stderr.
const _badiFailSafe = (e) => {
	if (process.env.BADI_HOOK_DEBUG) {
		try {
			process.stderr.write(`[badi-hook] ${e?.message || e}\n`);
		} catch {}
	}
	process.exit(0);
};
process.on("uncaughtException", _badiFailSafe);
process.on("unhandledRejection", _badiFailSafe);

// Badi - UserPromptSubmit Auto-Router
//
// Injects from two vaults:
//   skills-vault   → full SKILL.md body (high information density)
//   commands-vault → command name + 1-line hint (v1.26+)
//
// To enable:  badi skills auto on
// To disable: badi skills auto off

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
	commandAvailable,
	projectRoot,
	readStdinJson,
	writeContextInjection,
} from "./_util.mjs";

const input = await readStdinJson();
const prompt = input.prompt || "";

if (!prompt.trim()) process.exit(0);

const wordCount = prompt.trim().split(/\s+/).length;
if (wordCount < 3) process.exit(0);

const root = projectRoot();
const skillsVault = join(root, ".claude", "skills-vault");
const commandsVault = join(root, ".claude", "commands-vault");
const hasSkills = existsSync(skillsVault);
const hasCommands = existsSync(commandsVault);
if (!hasSkills && !hasCommands) process.exit(0);

// find the badi binary (npm-link, npm-global, node_modules fallback)
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

function tryCall(args) {
	try {
		return execFileSync(badi, args, {
			encoding: "utf-8",
			cwd: root,
			stdio: ["ignore", "pipe", "ignore"],
			timeout: 4000,
		}).trim();
	} catch {
		return "";
	}
}

const parts = [];
if (hasSkills) {
	const out = tryCall(["skills", "route", "--inject", "--top", "3", prompt]);
	if (out) parts.push(out);
}
if (hasCommands) {
	const out = tryCall(["commands", "route", "--inject", "--top", "3", prompt]);
	if (out) parts.push(out);
}

const injection = parts.join("\n\n");
if (!injection) process.exit(0);

writeContextInjection(injection);
process.exit(0);
