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
// Konfigurasyon (env override):
//   BADI_PLAN_INJECT_MAX_BYTES   Total injection cap (default 50KB)
//   BADI_PLAN_INJECT_MAX_PLANS   En fazla N plan inject (default 3)
//   BADI_PLAN_INJECT_OFF         '1' / 'true' / 'off' ile tamamen kapali
//   BADI_HOOK_DEBUG              stderr trace (kaç plan inject edildi, kaç byte)
//
// Tasarim notlari:
//   - denied / pending planlar inject edilmez
//   - hicbir plan yoksa sessiz cik (no-op)
//   - A3 fix: plan body icindeki "</active-plan>" literal'i escape edilir
//     (XML-ish wrapper'in erken kapanmasini engeller).
//   - B2 fix: default cap 200KB -> 50KB (Claude context'in ~%6'si).

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { projectRoot, writeContextInjection } from "./_util.mjs";

const OFF =
	process.env.BADI_PLAN_INJECT_OFF === "1" ||
	process.env.BADI_PLAN_INJECT_OFF === "true" ||
	process.env.BADI_PLAN_INJECT_OFF === "off";

const MAX_PLANS_TO_INJECT = Number.isFinite(
	Number(process.env.BADI_PLAN_INJECT_MAX_PLANS),
)
	? Math.max(1, Number(process.env.BADI_PLAN_INJECT_MAX_PLANS))
	: 3;

const MAX_TOTAL_BYTES = Number.isFinite(
	Number(process.env.BADI_PLAN_INJECT_MAX_BYTES),
)
	? Math.max(1024, Number(process.env.BADI_PLAN_INJECT_MAX_BYTES))
	: 50 * 1024;

function trace(msg) {
	if (process.env.BADI_HOOK_DEBUG) {
		try {
			process.stderr.write(`[plan-inject] ${msg}\n`);
		} catch {}
	}
}

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
			approvedAt = raw.split("\n")[0] || null;
		} catch {}
		let mtimeMs = 0;
		try {
			mtimeMs = statSync(md).mtimeMs;
		} catch {}
		out.push({ slug, mdPath: md, approvedAt, mtimeMs });
	}
	out.sort((a, b) => b.mtimeMs - a.mtimeMs);
	return out;
}

// A3 fix: escape "</active-plan>" literal'larini Claude parser'in erken
// kapatmamasi icin. Tek-yon escape — display'de ayni gozukur.
function escapePlanBody(body) {
	return body.replace(/<\/active-plan>/gi, "</ active-plan>");
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
		body = escapePlanBody(body);
		const block = [
			`<active-plan slug="${p.slug}" state="approved"${p.approvedAt ? ` approved-at="${p.approvedAt}"` : ""}>`,
			body.trim(),
			"</active-plan>",
		].join("\n");
		if (totalBytes + block.length > MAX_TOTAL_BYTES) {
			trace(
				`cap reached at ${injected}/${plans.length} plans (${totalBytes} bytes)`,
			);
			break;
		}
		blocks.push(block);
		totalBytes += block.length;
		injected++;
	}
	if (blocks.length === 0) return null;
	const header =
		blocks.length === 1
			? "Onayli aktif plan (badi plan):"
			: `Onayli aktif planlar (${blocks.length} — badi plan):`;
	trace(`injected ${blocks.length} plans, ${totalBytes} bytes`);
	return `${header}\n\n${blocks.join("\n\n")}`;
}

async function main() {
	if (OFF) {
		trace("disabled via BADI_PLAN_INJECT_OFF");
		process.exit(0);
	}
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
