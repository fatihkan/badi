#!/usr/bin/env node
// Badi - Degisiklik Kaydi (PostToolUse - Async)
// Tum dosya degisikliklerini denetim izine kaydeder.

import { relative } from "node:path";
import {
	appendLog,
	logPath,
	projectRoot,
	readStdinJson,
	timestamp,
} from "./_util.mjs";

const input = await readStdinJson();
const tool = input.tool_name || "unknown";
const filePath =
	input.tool_input?.file_path || input.tool_input?.path || "unknown";

const root = projectRoot();
const relPath = filePath.startsWith(root) ? relative(root, filePath) : filePath;

appendLog(
	logPath("audit-trail.md"),
	`- \`${timestamp()}\` | ${tool} | ${relPath}`,
);
process.exit(0);
