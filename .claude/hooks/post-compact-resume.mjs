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

// Badi - Sikistirma Sonrasi Devam (SessionStart - Resumed)
// Sikistirma sonrasi baglami geri yukler.

import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { projectRoot, writeContextInjection } from "./_util.mjs";

const root = projectRoot();
const marker = join(root, ".claude", ".compaction-occurred");

if (!existsSync(marker)) {
	process.exit(0);
}

let compactTime = "bilinmiyor";
try {
	compactTime = readFileSync(marker, "utf-8").trim() || "bilinmiyor";
} catch {
	/* no-op */
}

// Oturum sayaclarini sifirla
for (const f of [
	join(root, ".claude", "hooks", "__counter"),
	join(root, ".claude", "hooks", "quality-gate-active"),
	marker,
]) {
	try {
		rmSync(f, { force: true });
	} catch {
		/* no-op */
	}
}

// v1.31.0 fix: Anthropic 2.1.139 hook terminal-isolation compliance.
// Old plain-text stdout never reached SessionStart context; injected via the
// additionalContext JSON protocol.
writeContextInjection(
	`[badi:post-compact-resume] Resuming after compaction (${compactTime}).\n\n` +
		"To reload context:\n" +
		"1. Read .claude/memory.md\n" +
		"2. Read the latest daily note\n" +
		"3. Continue working on the in-progress task\n\n" +
		"Priority: finish the half-done work.",
);
process.exit(0);
