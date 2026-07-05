# awesome-claude-code Başvuru — Copy/Paste (sayılar v1.35 gerçeğine tazelendi, 05.07.2026)

> **Not:** Aşağıdaki sayılar güncel gerçeğe (30 ajan / 86 komut / 14 hook / 63 skill / 1321 test) çekildi.
> #1955 (05.06.2026) gönderilirken o günkü sayılar (84 komut / 62 skill / 1185 test) kullanıldı — o form
> gönderildi/kilitli; buradaki güncel rakamlar bekleyen diğer listeler (awesome-ai-devtools vb.) içindir.

> **✅ GÖNDERİLDİ (05.06.2026):** https://github.com/hesreallyhim/awesome-claude-code/issues/1955
> Bot validation geçti (10:48 UTC), maintainer review kuyruğunda. Aşağıdaki form içeriği arşiv.
> **#1955'e yorum SADECE insan elinden** — AI yorumu cooldown riski.

**ÖNEMLİ — GOLDEN Rule:** Başvuru SADECE github.com web UI'daki issue formu üzerinden, İNSAN eliyle.
`gh` CLI ile gönderim, PR ile gönderim ve AI/agent gönderimi YASAK → otomatik kapatma + cooldown
(1. ihlal 7 gün, 2. 14 gün, 3. 30 gün, 4. kalıcı ban).

**Form URL:**
https://github.com/hesreallyhim/awesome-claude-code/issues/new?template=recommend-resource.yml

## Uygunluk anlık görüntüsü (05.06.2026 doğrulandı)

| Şart | Durum |
|------|-------|
| İlk public commit'ten ≥7 gün | ✅ repo 09.04.2026'da açıldı (~2 ay) |
| **≥5 yıldız** | ⚠️ tam 5 yıldız — SINIRDA. Bir yıldız çekilirse şart bozulur; submit öncesi tekrar bak |
| Hesap ≥14 gün | ✅ |
| Kripto ile ilgisiz | ✅ |
| Duplicate değil | ✅ THE_RESOURCES_TABLE.csv'de badi/fatihkan yok (05.06 kontrol) |
| Bu repoda başka açık issue'm yok | submit anında kontrol et |

## Konumlandırma notu (red riski)

Maintainer ipuçları: "focused resources, not general-purpose marketplaces" + "avoid complex
systems that require long onboarding". Badi büyük (30 ajan / 86 komut) → formda şunu vurgula:
- Onboarding 2 komut: `npm install -g @fatihkan/badi` + `badi init` → `/start` ile anında günlük akış
- Vault mimarisi: skill'ler ve komutların çoğu opt-in; varsayılan token maliyeti sıfır
- Odak: günlük geliştirme operasyonu (start/sync/wrap-up ritmi), marketplace değil

Maintainer ayrıca kendi `.claude/commands/evaluate-repository.md` prompt'uyla ön-değerlendirme
yapmayı öneriyor — submit öncesi bizde çalıştırmak faydalı.

---

## Title (issue başlığı)

```
[Resource]: Badi
```

## Display Name

```
Badi
```

## Category

`Tooling`

## Sub-Category

`Tooling: Orchestrators`

> _Gerekçe:_ Badi 30 ajan + 86 slash komut + 14 hook + 63 opt-in skill kategorisini tek CLI
> altında orkestre ediyor. "Config Managers" da uyar ama orkestrasyon ana değer.

## Primary Link

```
https://github.com/fatihkan/badi
```

## Author Name

```
fatihkan
```

## Author Link

```
https://github.com/fatihkan
```

## License

`MIT`

## Description (1-3 cümle, açıklayıcı, promosyon değil, okuyucuya hitap yok, emoji yok)

```
Badi is a workflow management CLI for Claude Code that ships 30 subagents, 86 slash commands, 14 Node.js hooks, and 63 opt-in skill categories from a single npm package. Daily-driver conventions (/start, /sync, /wrap-up, /audit) are organized around project-local memory, knowledge-base, and TaskBoard files under .claude/, and the same source compiles to Cursor and Gemini CLI layouts. Skills and most commands live in vaults that load zero tokens until explicitly activated.
```

## Validate Claims (zorunlu — düşük sürtüşmeli kanıt)

```
After installation, run `badi doctor` in any project for a diagnostic report covering hook presence, settings.json validity, agent/command counts, the skill vault, and memory limits; `badi doctor help` runs the CLI's built-in help-drift checker. `badi list --agents --commands --hooks --skills` enumerates everything shipped. `badi mcp serve` exposes Badi as a stdio MCP server so an external Claude session can call its tools directly. None of this requires --dangerously-skip-permissions.
```

## Specific Task(s)

```
Install Badi globally with `npm install -g @fatihkan/badi` and run `badi init --harness claude` in an empty directory. Then ask Claude Code to use the `/start` slash command — it triggers the daily-briefing workflow that loads .claude/memory.md, surveys .claude/workspace/TaskBoard.md, summarizes background watcher reports, and presents a structured briefing with priorities to confirm.
```

## Specific Prompt(s)

```
/start
```

(Tek satır yeterli — komut tüm akışı yönetiyor.)

## Additional Comments (opsiyonel ama network disclosure ZORUNLU kuralı burada karşılanıyor)

```
Network disclosure: core workflow features are fully local. Two automatic, opt-out-able calls exist: a startup version check against the npm registry (BADI_NO_UPDATE_NOTIFIER=1) and a session-start dependency audit that runs `npm/yarn/pnpm audit` with a 24h cache (BADI_NO_DEP_AUDIT=1) — both documented in the README "Network Usage" table. Optional domain commands (seo / aso / market / ssl / dns / whois / lighthouse / wp) make user-initiated requests to public endpoints: the iTunes Search API, Google PageSpeed Insights, Reddit's anonymous JSON API, and the target site the user names. Self-telemetry is local JSONL only and can be disabled with BADI_TELEMETRY=off; nothing of the user's content leaves the machine. All 14 hooks are pure Node.js (Windows-compatible), every agent declares explicit permissionMode plus disallowedTools, and the suite is covered by 1321 tests. Badi began as personal scaffolding for daily Claude Code use and grew into a packaged distribution; "badi" is Turkish slang for "buddy."
```

## Recommendation Checklist (hepsini işaretle)

- [x] I have checked that this resource hasn't already been submitted
- [x] It has been over one week since the first public commit
- [x] All provided links are working and publicly accessible
- [x] I do NOT have any other open issues in this repository

---

## Submission Sonrası Akış

1. Bot 1-2 dakika içinde validation yorumu atar (URL, duplicate, format)
2. "needs changes" derse → düzelt
3. Validation geçerse maintainer review kuyruğunda bekler (maintainer Claude'a candid review yaptırıyor)
4. Onaylanırsa bot otomatik PR açıp listeye ekler

**Submission sonrası haber ver — issue # ile takip edilebilir.**

---

## Diğer hedef listeler (issue #33)

| Liste | Durum |
|-------|-------|
| awesome-nodejs | ❌ ŞARTLAR SAĞLANMIYOR: ≥100 yıldız gerekli (badi: 5). Park — yıldız büyüyünce |
| awesome-ai-devtools | 🟡 HAZIR — aşağıda tam talimat |
| Product Hunt | 🟡 ayrı launch hazırlığı ister (görsel + tagline + ilk yorum); ayrı seans |

---

## awesome-ai-devtools PR talimatı (hazır — 05.06.2026 doğrulandı)

Repo: https://github.com/jamesmurdza/awesome-ai-devtools — PR ile başvuru, görünür bir
yıldız/yaş şartı ve AI-gönderim yasağı YOK (yine de PR'ı kendi hesabından açman önerilir).

**Hedef bölüm:** `README.md` → `## Terminal` → `### CLI Utilities`
(badi otonom ajan değil, Claude Code etrafında tooling → CLI Utilities doğru ev.)

**Eklenecek satır (formatları birebir: `- [Name](link) — Description.`):**

```
- [Badi](https://github.com/fatihkan/badi) — Workflow management CLI for Claude Code with 30 sub-agents, 86 slash commands, 14 safety hooks, and 63 opt-in skill categories. Daily-ritual commands (/start, /sync, /wrap-up), OWASP + secret scans, and a vault architecture that loads zero tokens until activated. Compiles the same source to Cursor and Gemini CLI layouts. MIT.
```

**PR başlığı:** `Add Badi to CLI Utilities`
**PR açıklaması:**

```
Adds Badi — an MIT-licensed workflow management CLI for Claude Code (also compiles to Cursor and Gemini CLI). 30 sub-agents, 86 slash commands, 14 safety hooks, 63 opt-in skill categories, 1321 tests. npm: @fatihkan/badi
```

Adımlar: repo'yu fork'la → README.md'de CLI Utilities bölümünün sonuna satırı ekle →
tek-commit PR aç. (İstersen fork+PR'ı Claude da açabilir — bu listede insan-eli şartı yok.)
