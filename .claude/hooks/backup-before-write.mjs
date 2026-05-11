#!/usr/bin/env node
// Badi - Yazma Oncesi Yedekleme (PreToolUse - Async)
// Dosya degisikliklerinden once otomatik yedek olusturur.

import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	rmSync,
	statSync,
} from "node:fs";
import { basename, join } from "node:path";
import { olderThan, projectRoot, readStdinJson } from "./_util.mjs";

const input = await readStdinJson();
const filePath = input.tool_input?.file_path || input.tool_input?.path || "";

if (!filePath || !existsSync(filePath)) {
	process.exit(0);
}

// Atlanacak yollar
const skipPatterns = [
	".claude/backups",
	".test-tmp-",
	"/tmp/",
	".claude\\backups",
	".claude/logs/",
	".claude\\logs\\",
];
if (skipPatterns.some((p) => filePath.includes(p))) {
	process.exit(0);
}

const root = projectRoot();
const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const backupDir = join(root, ".claude", "backups", today);
mkdirSync(backupDir, { recursive: true });

const d = new Date();
const pad = (n) => String(n).padStart(2, "0");
const stamp = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

const dest = join(backupDir, `${basename(filePath)}.${stamp}.bak`);
try {
	copyFileSync(filePath, dest);
} catch {
	/* no-op */
}

// 7 gunden eski yedek dizinlerini temizle
const backupsRoot = join(root, ".claude", "backups");
if (existsSync(backupsRoot)) {
	for (const entry of readdirSync(backupsRoot)) {
		const p = join(backupsRoot, entry);
		try {
			if (statSync(p).isDirectory() && olderThan(p, 7)) {
				rmSync(p, { recursive: true, force: true });
			}
		} catch {
			/* no-op */
		}
	}
}

process.exit(0);
