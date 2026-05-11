#!/usr/bin/env node
// Badi - Oturum Sifirlama (SessionStart - New)
// Yeni oturum baslatildiginda durum temizligi ve butunluk kontrolu yapar.

import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
} from "node:fs";
import { basename, join } from "node:path";
import {
	appendLog,
	incidentLine,
	logPath,
	projectRoot,
	truncateLog,
} from "./_util.mjs";

const root = projectRoot();
const logDir = join(root, ".claude", "logs");
const hooksDir = join(root, ".claude", "hooks");
const agentsDir = join(root, ".claude", "agents");

// ─── Standart dizinleri olustur ───
for (const d of [
	logDir,
	join(root, ".claude", "agent-memory"),
	join(root, ".claude", "backups"),
	join(root, ".claude", "skills"),
	join(root, ".claude", "workspace"),
	join(root, ".claude", "plugins"),
]) {
	mkdirSync(d, { recursive: true });
}

// ─── Eski oturum kalintilarini temizle ───
for (const f of [
	join(hooksDir, "__counter"),
	join(hooksDir, "quality-gate-active"),
	join(root, ".claude", ".compaction-occurred"),
]) {
	try {
		rmSync(f, { force: true });
	} catch {
		/* no-op */
	}
}

// ─── Agent tanimlarini dogrula ───
if (existsSync(agentsDir)) {
	for (const f of readdirSync(agentsDir)) {
		if (!f.endsWith(".md")) continue;
		const file = join(agentsDir, f);
		try {
			const firstLine = readFileSync(file, "utf-8").split("\n")[0];
			if (!firstLine.startsWith("---")) {
				appendLog(
					logPath("incident-log.md"),
					incidentLine(
						"SESSION-RESET",
						"WARN",
						`Agent frontmatter eksik: ${f}`,
					),
				);
			}
		} catch {
			/* no-op */
		}
	}
}

// ─── Log rotasyonu ───
const logsToTrim = [
	{ file: join(logDir, "audit-trail.md"), max: 5000, keep: 2000 },
	{ file: join(logDir, "usage.jsonl"), max: 1000, keep: 500 },
	{ file: join(logDir, "incident-log.md"), max: 500, keep: 250 },
	{ file: join(logDir, "failure-log.md"), max: 500, keep: 250 },
];
for (const { file, max, keep } of logsToTrim) {
	if (truncateLog(file, max, keep)) {
		appendLog(
			logPath("incident-log.md"),
			incidentLine(
				"SESSION-RESET",
				"INFO",
				`Log budandi: ${basename(file)} -> ${keep} satir`,
			),
		);
	}
}

// ─── Eski yedekleri temizle (son 50 tut) ───
const backupDir = join(root, ".claude", "backups");
if (existsSync(backupDir)) {
	const files = [];
	const walk = (dir) => {
		for (const entry of readdirSync(dir)) {
			const p = join(dir, entry);
			try {
				const s = statSync(p);
				if (s.isDirectory()) walk(p);
				else files.push({ path: p, mtime: s.mtimeMs });
			} catch {
				/* no-op */
			}
		}
	};
	walk(backupDir);
	if (files.length > 50) {
		files.sort((a, b) => a.mtime - b.mtime);
		const toRemove = files.slice(0, files.length - 50);
		for (const f of toRemove) {
			try {
				rmSync(f.path, { force: true });
			} catch {
				/* no-op */
			}
		}
	}
}

process.exit(0);
