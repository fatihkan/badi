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

// Badi - Bash Guvenlik Korumasi (PreToolUse)
// Tehlikeli komutlari uc katmanli izin sistemiyle denetler.

import {
	appendLog,
	incidentLine,
	logPath,
	projectRoot,
	readStdinJson,
	writeDecision,
} from "./_util.mjs";

const input = await readStdinJson();
const command = input.tool_input?.command || "";
if (!command) process.exit(0);

const incidentLog = logPath("incident-log.md");

function log(severity, message) {
	appendLog(incidentLog, incidentLine("GUARD-BASH", severity, message));
}

// ─── SERT ENGELLER (kesinlikle izin verilmez) ───
const HARD_BLOCKS = [
	/rm\s+-rf\s+\//i,
	/rm\s+-rf\s+\*/i,
	/git\s+push\s+--force\s+origin\s+(main|master)/i,
	/git\s+reset\s+--hard\s+origin\//i,
	/chmod\s+777/i,
	/curl.*\|\s*(bash|sh|zsh)/i,
	/wget.*\|\s*(bash|sh|zsh)/i,
	/>\s*\/etc\//i,
	/mkfs\./i,
	/dd\s+if=.*of=\/dev\//i,
	/cat\s+.*\.(env|pem|key|secret).*\|\s*(curl|nc|wget)/i,
	/echo\s+.*\$(.*password|.*secret|.*token|.*key).*\|\s*(curl|nc|wget)/i,
];

for (const re of HARD_BLOCKS) {
	if (re.test(command)) {
		log("CRITICAL", `ENGELLENDI: ${command}`);
		writeDecision(
			"block",
			"Tehlikeli komut engellendi. Bu islem sisteme zarar verebilir.",
		);
		process.exit(0);
	}
}

// ─── SOFT BLOCKS (block with a warning) ───
const SOFT_BLOCKS = [
	/rm\s+.*-[rR].*-[fF]/i,
	/rm\s+.*-[fF].*-[rR]/i,
	/rm\s+-rf\s+/i,
	/git\s+push\s+--force/i,
	/git\s+reset\s+--hard/i,
	/git\s+clean\s+-fd/i,
	/>\s*\/usr\//i,
	/>\s*\/opt\//i,
	/sudo\s+rm/i,
	/sudo\s+chmod/i,
	/sudo\s+chown/i,
	/npx\s+.*--yes.*rm/i,
];

for (const re of SOFT_BLOCKS) {
	if (re.test(command)) {
		log("WARN", `YUMUSAK ENGEL: ${command}`);
		writeDecision(
			"block",
			"This command is potentially dangerous. Use a safer alternative.",
		);
		process.exit(0);
	}
}

// ─── KAYIT UYARILARI (engellenmez ama kaydedilir) ───
const LOG_WARNINGS = [
	/^rm\s+/i,
	/^mv\s+/i,
	/git\s+checkout\s+--/i,
	/git\s+stash\s+drop/i,
	/chmod\s+/i,
	/chown\s+/i,
	/npm\s+publish/i,
];

for (const re of LOG_WARNINGS) {
	if (re.test(command)) {
		log("INFO", `KAYIT: ${command}`);
		break;
	}
}

// Proje disi yazma tespiti
const root = projectRoot();
if (/>\s*\//.test(command) && !command.includes(`> ${root}`)) {
	log("WARN", `PROJE DISI YAZMA: ${command}`);
}

process.exit(0);
