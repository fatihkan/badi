# Badi for Enterprise

Badi, Anthropic Claude Code'un **enterprise managed-settings** ozellikleri ile uyumludur. Bu sayfa, kurumsal ortamlarda Badi'yi yapilandirma rehberidir.

## Anthropic Managed-Settings ile Uyum

Claude Code (2.1.126+) admin-tier managed settings sunar. Badi runtime'inda bu ayarlara dokunmaz — sadece pass-through davranir.

### `forceLoginOrgUUID` / `forceLoginMethod` (2.1.143)

Claude Code 2.1.143'te bu enforcement'in 3rd-party provider ve API-key session'larinda atlandi bug'i kapatildi.

**Badi etki**: Yok. Badi kendi auth tutmaz; `claude` binary'sinin auth state'ini kullanir. Bir kullanici `forceLoginMethod=sso` ile zorlanmissa, Badi calismadan once Claude Code login surec uygulanir.

### `allowManagedDomainsOnly` / `allowManagedReadPathsOnly` (2.1.126)

Sandbox-block eksik managed-settings source'lari icin enforcement'i bypass eden bug 2.1.126'da kapatildi.

**Badi etki**: Yok. Badi `dist/` (Homebrew/Scoop manifest'leri) ve `_bootstrap/badi-skills/` (skill bundle) altinda statik dosyalar uretir; uzak domain erisimi gerektirmez. Managed-settings policy badi'nin filesystem yazimini kisitlamiyor.

### `parentSettingsBehavior` (2.1.133)

Admin-tier yeni key: `'first-wins' | 'merge'`. SDK `managedSettings` parent tier policy merge'e opt-in olabilir.

**Badi etki**: Badi `.claude/settings.json` proje dosyalarini yazar (CLAUDE.md, hooks registration). Admin managed-settings ile cakisma riski: `first-wins` modunda admin policy badi'nin lokal `permissions:` rule'larini override edebilir. Onerim: kurumsal ortamlarda `badi init --no-settings-write` (v1.31+) flag'i ile sadece komut/agent/hook dosyalari yazsin, settings.json'a dokunmasin.

## `--dangerously-skip-permissions` Uyari

Claude Code 2.1.126'da bu flag'in scope'u genisletildi:

> Now bypasses prompts for writes to `.claude/`, `.git/`, `.vscode/`, shell config files, and other previously-protected paths (catastrophic removal commands still prompt as a safety net)

**Kurumsal ortamda KULLANMAYIN**. Badi'nin tum komutlari (`init`, `update`, `doctor`, `publish`) bu flag olmadan calisir. Yalniz manuel debugging icin.

## Hook Isolation (2.1.139)

Claude Code 2.1.139'da hook'lar artik terminal access olmadan calistirilir (terminal corruption fix). Badi'nin 14 hook'u (`tests/hooks-isolation.test.js` ile dogrulanmis) Anthropic'in yeni izolasyon kurallarina **tam uyumlu**:

- 13 hook: JSON output protocol veya log-only
- 1 hook (`dependency-audit.mjs`): v1.31.0'da `writeContextInjection()` JSON protocol'e refactor edildi
- 1 hook (`post-compact-resume.mjs`): v1.31.0'da `writeContextInjection()`'e refactor edildi
- 0 hook: ANSI escape veya terminal manipulation

Audit raporu: [docs/hooks/isolation-audit.md](./hooks/isolation-audit.md).

## Plugin Marketplace (2.1.143-145)

- **2.1.143**: `claude plugin disable` bagimli plugin varsa reddediyor (runtime enforcement)
- **2.1.144**: Browse pane plugin son guncelleme zamani gosteriyor
- **2.1.145**: Browse pane install **oncesinde** plugin'in commands/agents/skills/hooks/MCP/LSP listesini gosteriyor

**Badi uyum**:
- `badi plugin doctor` + `badi plugin graph` (v1.30.0+) — pre-flight + planlama (Anthropic'in runtime enforcement'ini tamamlar)
- `badi release sync-manifest` (v1.30.1+) — `.claude-plugin/{plugin,marketplace}.json` otomatik senkron
- `lastUpdated` field (v1.31.0+) — Anthropic Browse pane'de gozukur

## Telemetri ve Veri Akisi

Badi telemetrisi (`badi events`, v1.30+) **tamamen lokal**:
- `~/.claude/projects/<slug>/badi-events.jsonl`
- Whitelist: `badi.*` closed list + `plugin.<owner>.<event>` regex namespace
- Disa veri gondermez. `BADI_TELEMETRY=off` ile tamamen kapali.

Kurumsal compliance icin: bu dizinleri backup/audit policy'sine eklemek opsiyonel.

## SSO / SAML Entegrasyonu

Badi kendi auth'unu yapmaz. Claude Code'un Anthropic SSO/SAML konfigurasyonunu kullanir. Detay icin [Claude Code server-managed settings](https://code.claude.com/docs/en/server-managed-settings).

## Audit Log

Badi audit izleri:
- `.claude/logs/audit-trail.md` — tum dosya degisiklikleri (PostToolUse)
- `.claude/logs/incident-log.md` — guvenlik olaylari, branch-guard engelleri, dependency audit kritik bulgular
- `.claude/logs/usage.jsonl` — komut kullanim log
- `~/.claude/projects/<slug>/badi-events.jsonl` — telemetri event'leri

Tum log'lar lokal dosya sistemi; harici servise gonderim yok.

## Referans

- [Claude Code Changelog](https://code.claude.com/docs/en/changelog)
- [Claude Code Server-Managed Settings](https://code.claude.com/docs/en/server-managed-settings)
- Badi hook audit: [docs/hooks/isolation-audit.md](./hooks/isolation-audit.md)
