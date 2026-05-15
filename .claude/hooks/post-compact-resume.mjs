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
import { projectRoot } from "./_util.mjs";

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

process.stdout.write(`Sikistirma sonrasi devam (${compactTime}).

Baglami yeniden yuklemek icin:
1. .claude/memory.md dosyasini oku
2. En son Gunluk Notu oku
3. Devam eden gorev uzerinde calismaya devam et

Oncelik: Yarida kalan islemleri tamamla.
`);
process.exit(0);
