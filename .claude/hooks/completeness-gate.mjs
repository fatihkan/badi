#!/usr/bin/env node
// Badi - Tamamlanmislik Kapisi (PreToolUse)
// Kritik dosyalara yazma oncesi icerik dogrulamasi yapar.

import { basename } from "node:path";
import { readStdinJson, writeDecision } from "./_util.mjs";

const input = await readStdinJson();
const toolName = input.tool_name || "";
const filePath = input.tool_input?.file_path || input.tool_input?.path || "";
const content = input.tool_input?.content || input.tool_input?.new_string || "";

if (!filePath || !content) process.exit(0);

// Test ve gecici dosyalari atla
if (filePath.includes(".test-tmp-") || filePath.startsWith("/tmp/")) {
	process.exit(0);
}

const fileName = basename(filePath);

// ─── Gizli Bilgi Tespiti (.env haricinde) ───
// Modern token formatlari dahil (bulgu #9).
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
				"Gizli bilgi tespit edildi! API anahtari veya token icermemeli. .env dosyasini kullanin.",
			);
			process.exit(0);
		}
	}
}

// ─── Bilgi Tabani Dogrulamasi ───
if (filePath.endsWith("knowledge-base.md")) {
	if (/(TBD|TODO|FIXME|PLACEHOLDER|XXX)/.test(content)) {
		writeDecision(
			"block",
			"knowledge-base.md dosyasinda TBD/TODO/FIXME isaretleri olamaz. Tamamlanmis icerik girin.",
		);
		process.exit(0);
	}
	if (toolName === "Write") {
		const lines = content.split("\n").length;
		if (lines > 200) {
			writeDecision(
				"block",
				`knowledge-base.md dosyasi ${lines} satir. Maksimum 200 satir olmali.`,
			);
			process.exit(0);
		}
	}
}

// ─── Bellek Dosyasi Dogrulamasi ───
if (filePath.endsWith("memory.md") && toolName === "Write") {
	const lines = content.split("\n").length;
	if (lines > 100) {
		writeDecision(
			"block",
			`memory.md dosyasi ${lines} satir. Maksimum 100 satir olmali. /clear ile temizleyin.`,
		);
		process.exit(0);
	}
}

// ─── Settings JSON Dogrulamasi ───
if (fileName === "settings.json") {
	try {
		JSON.parse(content);
	} catch {
		writeDecision(
			"block",
			"settings.json gecersiz JSON iceriyor. Lutfen JSON soz dizimini duzeltip tekrar deneyin.",
		);
		process.exit(0);
	}
}

// ─── Agent Tanimlari Dogrulamasi ───
if (
	(filePath.includes("agents/") || filePath.includes("agents\\")) &&
	filePath.endsWith(".md")
) {
	if (/(\[TAMAMLANACAK\]|\[TODO\]|\[TBD\]|\[PLACEHOLDER\])/.test(content)) {
		writeDecision(
			"block",
			"Agent taniminda tamamlanmamis isaretler var. Icerik tamamlanmadan kayit yapilamaz.",
		);
		process.exit(0);
	}
}

process.exit(0);
