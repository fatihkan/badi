# Hook Isolation Audit (v1.31.0)

Anthropic Claude Code **2.1.139** (11 May 2026) ile hook'lar **terminal access olmadan** calistirilmaya basladi. Bu degisiklik, hook'lardan terminal'e plain text yazimi ile interactive prompt corruption sorununu cozmek icin yapildi.

Bu audit, badi'nin 15 hook'unu (14 hook + `_util.mjs` shared) Anthropic'in yeni izolasyon kurallarina uyumluluk acisindan kategorize eder.

## Kategoriler

| Kategori | Aciklama | Etki |
|----------|----------|------|
| **1 — JSON Protocol** | stdout'a yalnizca Claude Code hook protokolune uygun JSON tek-satir yazimi. `writeDecision()` veya `writeContextInjection()`. | ✅ Guvenli |
| **2 — Plain Text Stdout** | stdout'a plain text yazimi. Eski Claude Code'da terminal'e gozukurdu, 2.1.139+ kayboluyor. | ⚠️ Protokol ihlali — fix gerek |
| **3 — Terminal Manipulation** | ANSI escape, cursor move, raw bytes. Terminal corruption riski. | ❌ TEHLIKE — derhal fix |
| **Log-only** | Yalnizca `.claude/logs/` dosyalarina yazim. stdout/stderr kullanim yok (defensive fail-safe haricinde). | ✅ Guvenli |

## Sonuc (v1.31.0 oncesi vs sonrasi)

### v1.31.0 ONCESI (snapshot)

| Hook | Kategori | Detay |
|------|----------|-------|
| `_util.mjs` | Helper | Hook degil, utility |
| `backup-before-write.mjs` | Log-only | Filesystem + log |
| `branch-guard.mjs` | 1 | `writeDecision()` |
| `completeness-gate.mjs` | 1 | `writeDecision()` |
| `dependency-audit.mjs` | **2** | `process.stdout.write("UYARI:...")` plain text |
| `guard-bash.mjs` | 1 | `writeDecision()` + log |
| `inject-active-plan.mjs` | 1 | `writeContextInjection()` |
| `log-changes.mjs` | Log-only | `appendLog()` |
| `log-failures.mjs` | Log-only | `appendLog()` |
| `log-stop-verdict.mjs` | Log-only | `appendLog()` |
| `post-compact-resume.mjs` | **2** | `process.stdout.write()` multi-line plain text |
| `pre-compact-handoff.mjs` | Log-only | Filesystem + log |
| `session-reset.mjs` | Log-only | Filesystem + log |
| `skill-router.mjs` | 1 | `writeContextInjection()` |
| `track-usage.mjs` | Log-only | `appendLog()` JSONL |

**Toplam Kategori 2**: 2 hook → **fix uygulandi**.

### v1.31.0 SONRASI (target state)

Kategori 2 hook'lari refactor edildi:

#### `dependency-audit.mjs`
- **Eski**: SessionStart'ta bulgu varsa `process.stdout.write("UYARI: ...")` plain text yazim.
- **Yeni**: `writeContextInjection()` JSON protocol ile Claude'a additionalContext olarak inject.
- **Sonuc**: Eskiden Claude'un contextine girmiyordu (kayboluyor veya terminal'e dusuyor); simdi gercekten gozukur.

#### `post-compact-resume.mjs`
- **Eski**: SessionStart-resumed'da compact mesaji `process.stdout.write()` multi-line plain text.
- **Yeni**: `writeContextInjection()` ile additionalContext.
- **Sonuc**: Compact sonrasi devam mesaji artik gercekten Claude'a iletilir.

## Stderr Kullanimi

Tum hook'lar `BADI_HOOK_DEBUG` env var ile **opt-in stderr** kullanir (defensive fail-safe):
```javascript
const _badiFailSafe = (e) => {
  if (process.env.BADI_HOOK_DEBUG) {
    try { process.stderr.write(`[badi-hook] ${e?.message || e}\n`); } catch {}
  }
  process.exit(0);
};
```

Bu **guvenli** — sadece debug modunda stderr'e yazar, Claude Code default'ta `BADI_HOOK_DEBUG` set etmedigi icin sessiz kalir. Stderr Claude'un terminal corruption riski tasimaz (Claude Code stderr'i loglar veya yutar, terminal'e bypass etmez).

## Test Stratejisi

`tests/hooks-isolation.test.js` (yeni, v1.31.0):
- Her hook icin: SIMULATE stdin → stdout cikti format kontrolu
- stdout cikti varsa → valid JSON one-line olmali (parse + assertion)
- Stderr default'ta bos (BADI_HOOK_DEBUG yok) olmali
- ANSI escape sequence yokluk kontrolu (regex)

## Referanslar
- [Claude Code Changelog 2.1.139 (11 May 2026)](https://code.claude.com/docs/en/changelog) — hook terminal-isolation
- [Hook output protocol](https://docs.claude.com/en/docs/claude-code/hooks)
- Mevcut testler: `tests/hooks-failsafe.test.js`, `tests/cli.hooks-node.test.js`
