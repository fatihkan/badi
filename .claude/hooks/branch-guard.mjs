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

// Badi - Dal Korumasi (PreToolUse - Bash)
// Korunmus dallara dogrudan commit islemlerini engeller.
// Push islemi merge sonrasi yayim olarak kabul edilir, engellenmez.

import {
	appendLog,
	currentBranch,
	incidentLine,
	logPath,
	readStdinJson,
	writeDecision,
} from "./_util.mjs";

const input = await readStdinJson();
const command = input.tool_input?.command || "";
if (!command) process.exit(0);

const branch = currentBranch();

// Force push: main/master/release/* dallarinda engelle
// --force | --force-with-lease | -f flag (bulgu #8).
if (/git\s+push.*(--force\b|\s-f\b)/.test(command)) {
	if (branch === "main" || branch === "master" || /^release\//.test(branch)) {
		appendLog(
			logPath("incident-log.md"),
			incidentLine(
				"BRANCH-GUARD",
				"BLOCK",
				`'${branch}' dalinda force push engellendi`,
			),
		);
		writeDecision(
			"block",
			`'${branch}' korunmus bir daldir, force push yapilamaz.`,
		);
		process.exit(0);
	}
}

// Sadece git commit komutunu korunmus dallarda engelle
if (!/git\s+commit\b/.test(command)) process.exit(0);

// Merge commit'leri engelleme — git merge zaten otomatik commit olusturur
if (/git\s+merge\b/.test(command)) process.exit(0);

if (!branch) process.exit(0);

const protectedBranches = ["main", "master", "production"];
if (protectedBranches.includes(branch)) {
	appendLog(
		logPath("incident-log.md"),
		incidentLine(
			"BRANCH-GUARD",
			"BLOCK",
			`'${branch}' dalinda dogrudan commit engellendi: ${command}`,
		),
	);
	writeDecision(
		"block",
		`'${branch}' korunmus bir daldir. Dogrudan commit yapilamaz. Bir feature dalina gecin: git checkout -b feature/isim`,
	);
	process.exit(0);
}

process.exit(0);
