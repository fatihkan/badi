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

// Badi v1.30+ — Plan Injection Hook
//
// UserPromptSubmit'te tetiklenir. `.claude/plans/` icinde `<slug>.approved`
// marker'i olan planlari okur, plan markdown icerigini Claude'a inject eder.
//
// Aktif etmek icin settings.json'a UserPromptSubmit hook olarak ekle:
//   "command": "node .claude/hooks/inject-active-plan.mjs"
//
// Tasarim notlari:
//   - denied / pending planlar inject edilmez
//   - hicbir plan yoksa sessiz cik (no-op)
//   - max 5 plan inject (gurultuyu sinirla); fazlasi varsa en yeni 5
//   - 200KB total cap (Claude context disciplini)
//   - BADI_HOOK_DEBUG=1 ile stderr trace

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { projectRoot, writeContextInjection } from "./_util.mjs";

const MAX_PLANS_TO_INJECT = 5;
const MAX_TOTAL_BYTES = 200 * 1024;

function listApprovedPlans(plansDir) {
	if (!existsSync(plansDir)) return [];
	const out = [];
	for (const f of readdirSync(plansDir)) {
		if (!f.endsWith(".approved")) continue;
		const slug = f.replace(/\.approved$/, "");
		const md = join(plansDir, `${slug}.md`);
		if (!existsSync(md)) continue;
		let approvedAt = null;
		try {
			const raw = readFileSync(join(plansDir, f), "utf-8").trim();
			// Marker dosyasi 1. satir ISO timestamp.
			approvedAt = raw.split("\n")[0] || null;
		} catch {}
		let mtimeMs = 0;
		try {
			mtimeMs = statSync(md).mtimeMs;
		} catch {}
		out.push({ slug, mdPath: md, approvedAt, mtimeMs });
	}
	// En yeni once (mtime desc).
	out.sort((a, b) => b.mtimeMs - a.mtimeMs);
	return out;
}

function buildInjection(plans) {
	if (plans.length === 0) return null;
	const blocks = [];
	let totalBytes = 0;
	let injected = 0;
	for (const p of plans) {
		if (injected >= MAX_PLANS_TO_INJECT) break;
		let body = "";
		try {
			body = readFileSync(p.mdPath, "utf-8");
		} catch {
			continue;
		}
		const block = [
			`<active-plan slug="${p.slug}" state="approved"${p.approvedAt ? ` approved-at="${p.approvedAt}"` : ""}>`,
			body.trim(),
			"</active-plan>",
		].join("\n");
		if (totalBytes + block.length > MAX_TOTAL_BYTES) break;
		blocks.push(block);
		totalBytes += block.length;
		injected++;
	}
	if (blocks.length === 0) return null;
	const header =
		blocks.length === 1
			? "Onayli aktif plan (badi plan):"
			: `Onayli aktif planlar (${blocks.length} — badi plan):`;
	return `${header}\n\n${blocks.join("\n\n")}`;
}

async function main() {
	const root = projectRoot();
	const plansDir = join(root, ".claude", "plans");
	const plans = listApprovedPlans(plansDir);
	const injection = buildInjection(plans);
	if (injection) {
		writeContextInjection(injection);
	}
	process.exit(0);
}

main();
