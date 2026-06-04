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

// Badi - Completeness Gate (PreToolUse)
// Validates content before writes to critical files.

import { basename } from "node:path";
import { readStdinJson, writeDecision } from "./_util.mjs";

const input = await readStdinJson();
const toolName = input.tool_name || "";
const filePath = input.tool_input?.file_path || input.tool_input?.path || "";
const content = input.tool_input?.content || input.tool_input?.new_string || "";

if (!filePath || !content) process.exit(0);

// Skip test and temporary files
if (filePath.includes(".test-tmp-") || filePath.startsWith("/tmp/")) {
	process.exit(0);
}

const fileName = basename(filePath);

// ─── Secret Detection (except .env) ───
// Includes modern token formats (finding #9).
if (!fileName.startsWith(".env")) {
	const secretPatterns = [
		// Stripe
		/sk_live_[a-zA-Z0-9]+/,
		/sk_test_[a-zA-Z0-9]+/,
		/rk_live_[a-zA-Z0-9]+/, // restricted keys
		/rk_test_[a-zA-Z0-9]+/,
		// GitHub
		/ghp_[a-zA-Z0-9]+/, // personal access token
		/gho_[a-zA-Z0-9]+/, // OAuth
		/ghu_[a-zA-Z0-9]+/, // user-to-server
		/ghs_[a-zA-Z0-9]+/, // server-to-server
		/ghr_[a-zA-Z0-9]+/, // refresh
		// AWS
		/AKIA[A-Z0-9]{16}/,
		// Slack
		/xox[bpsar]-[a-zA-Z0-9-]+/,
		// JWT
		/eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+/,
		// GitLab PAT
		/glpat-[a-zA-Z0-9_-]{20,}/,
		// Google API key
		/AIza[a-zA-Z0-9_-]{35}/,
		// OpenAI / Anthropic API key prefix patterns
		/sk-[a-zA-Z0-9]{20,}/, // OpenAI old format catches Anthropic-style too
	];
	for (const re of secretPatterns) {
		if (re.test(content)) {
			writeDecision(
				"block",
				"Secret detected! Content must not contain an API key or token. Use the .env file.",
			);
			process.exit(0);
		}
	}
}

// ─── Knowledge Base Validation ───
if (filePath.endsWith("knowledge-base.md")) {
	if (/(TBD|TODO|FIXME|PLACEHOLDER|XXX)/.test(content)) {
		writeDecision(
			"block",
			"knowledge-base.md must not contain placeholder markers. Enter completed content.",
		);
		process.exit(0);
	}
	if (toolName === "Write") {
		const lines = content.split("\n").length;
		if (lines > 200) {
			writeDecision(
				"block",
				`knowledge-base.md is ${lines} lines. It must stay at or under 200 lines.`,
			);
			process.exit(0);
		}
	}
}

// ─── Memory File Validation ───
if (filePath.endsWith("memory.md") && toolName === "Write") {
	const lines = content.split("\n").length;
	if (lines > 100) {
		writeDecision(
			"block",
			`memory.md is ${lines} lines. It must stay at or under 100 lines. Clean up with /clear.`,
		);
		process.exit(0);
	}
}

// ─── Settings JSON Validation ───
if (fileName === "settings.json") {
	try {
		JSON.parse(content);
	} catch {
		writeDecision(
			"block",
			"settings.json contains invalid JSON. Please fix the JSON syntax and try again.",
		);
		process.exit(0);
	}
}

// ─── Agent Definition Validation ───
if (
	(filePath.includes("agents/") || filePath.includes("agents\\")) &&
	filePath.endsWith(".md")
) {
	if (/(\[TAMAMLANACAK\]|\[TODO\]|\[TBD\]|\[PLACEHOLDER\])/.test(content)) {
		writeDecision(
			"block",
			"The agent definition has incomplete markers. It cannot be saved until the content is complete.",
		);
		process.exit(0);
	}
}

process.exit(0);
