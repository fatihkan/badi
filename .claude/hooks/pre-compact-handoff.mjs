#!/usr/bin/env node
// Badi - Sikistirma Oncesi Durum Kaydi (PreCompact)
// Otomatik sikistirma oncesi durumu kaydeder.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	appendLog,
	incidentLine,
	logPath,
	projectRoot,
	timestamp,
} from "../../lib/hooks/util.js";

const root = projectRoot();
const claudeDir = join(root, ".claude");
mkdirSync(claudeDir, { recursive: true });

const ts = timestamp();
writeFileSync(join(claudeDir, ".compaction-occurred"), ts, "utf-8");

appendLog(
	logPath("incident-log.md"),
	incidentLine(
		"COMPACTION",
		"INFO",
		"Otomatik sikistirma tetiklendi — durum kaydedildi",
	),
);
process.exit(0);
