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
