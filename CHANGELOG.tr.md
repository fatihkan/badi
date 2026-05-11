# Degisiklik Gunlugu

> **Dil / Language:** [English](CHANGELOG.md) · **Turkce**

Bu proje [Keep a Changelog](https://keepachangelog.com/tr/1.0.0/) formatini ve [Semantik Versiyonlama](https://semver.org/lang/tr/) standardini takip eder.

## [Unreleased]

### Eklendi — `badi gh sync` GitHub issue → TaskBoard (#11 MVP)

Yeni `badi gh` alt-komut ailesi. Ilk komut `badi gh sync` acik GitHub
issue'larini (`gh` CLI uzerinden) cekip `.claude/workspace/TaskBoard.md`
dosyasina priority etiketlerine gore kategorize ederek senkronize eder:

- `priority:p1-high` → `## Bugun`
- `priority:p2-medium` → `## Bu Hafta`
- `priority:p3-large`, `priority:p4-future`, etiketsiz → `## Bekleyen Isler`

Idempotent — yeni issue yoksa tekrar calistirmak hicbir sey eklemez.
TaskBoard'daki manuel gorevler korunur. `--dry-run`, `--repo`, `--state`,
`--limit` destekli. Sifir runtime bagimlilik (kullanicinin halihazirda
sahip oldugu `gh` CLI'i kullanir).

#11 scope'unda gelecek MVP'lere: `badi gh pr draft`,
`badi gh release draft <surum>`, iki yonlu durum sync.

### Degistirildi — subLint refactor + subExport --write guard (#138)

`lib/commands/tasarim.js`:

- **`subLint`**: saf bir `resolveLintExit(stdout, status) -> code`
  fonksiyonuna + ince orchestrator'a bolundu. `process.exit` artik tek
  noktada cagriliyor. Davranis ayni; test edilebilirlik cok arti.
- **`subExport --write`**: empty-on-error guard. Alttaki paket non-zero
  status verir veya bos stdout dondurirse, hedef dosya **artik
  yazilmaz**. Onceden parsiyel/bos icerikli dosya diske basilabiliyordu.
  Komut artik paketin status'unu (veya bos stdout icin `1`) ile cikar
  ve stderr'a net mesaj basar.

### Eklendi — Tasarim + frontmatter test kapsami (#137)

- `tests/frontmatter.test.js` (12 test) — `parseFrontmatter` birim testleri:
  tipik kullanim, CRLF toleransi, URL/ratio degerler, edge case (bos
  string, kapatilmamis frontmatter, body trim).
- `tests/cli.tasarim-lint.test.js` (14 test) — `badi tasarim
  lint`/`export` wrapper'in error path'leri + yeni `resolveLintExit`
  davranis matrisi (8 case) + `--write` guard subprocess testleri (2 case).

Test: 642 -> 668 (+26). Lint: 0 issue.

### Degistirildi — Biome 2.4.14 -> 2.4.15 (#136)

Dependabot patch bump. `biome.json` `$schema` URL hizalandi.
Test'lerde gizli bir bug tespit edildi:
`tests/cli.hooks-node.test.js::branch-guard` testi ana repo cwd'sinde
calisiyordu, `main` branch'inde kendi kendini bloklar haldeydi.
Testler artik izole temp proje + `git init -b feature/test` ile
calisir.

## [1.22.1] - 2026-05-11

### Duzeltildi — Windows ESM URL scheme + chmod assertion (#126 phase 3)

Phase 2 sonrasi kalan iki Windows test failure kategorisi temizlendi:

**ESM URL scheme**: `tests/harness.test.js` icindeki iki dynamic import
Windows absolute path (`D:\...`) ile cagriliyordu. Node 22 ESM loader
reddediyor (`Received protocol 'd:'`). `pathToFileURL` ile `file://`
URL'e cevrildi.

**chmod assertion**: Eski test `install hook'lari +x yapar` chmod mode
bit'lerini kontrol ediyordu (Windows'ta no-op). Phase 2'de hook'lar
.mjs olduktan sonra +x bit zaten gerekmiyordu; test sadece dosya
varligini kontrol etmeye guncellendi (`statSync` import'u temizlendi).

### Eklendi — Windows kurulum bolumu (README) (#126 phase 4)

README.md ve README.tr.md'ye yeni "Windows install" bolumu eklendi:
- `npm install -g @fatihkan/badi` + `badi init --harness claude`
- `chcp 65001` ipucu (Turkce karakter destegi)
- WSL otomatik tespit notu

### Degistirildi — Bash hook'lari Node.js'e cevrildi (#126 phase 2)

Tum 13 hook script'i `.sh` -> `.mjs` cevrildi. Bash artik gerekli degil;
Windows kullanicilari WSL/Git Bash kurmadan hook'lari calistirabilir.

**Etkilenen dosyalar:**
- 13 yeni `.claude/hooks/<name>.mjs` (eski `.sh` dosyalari silindi)
- `lib/hooks/util.js` — paylasilan yardimcilar (readStdinJson, projectRoot,
  appendLog, writeDecision, truncateLog, vb.)
- `.claude/settings.json` — komutlar `bash X.sh` -> `node X.mjs`
- `lib/harnesses/{claude,cursor,gemini}.js` — `.sh` -> `.mjs` veya
  `.mjs|.sh` cift filtresi (geri uyumluluk)
- `tests/cli.hooks-node.test.js` — 22 yeni test (her hook icin smoke +
  contract). Eski `tests/hooks.test.js` silindi.
- `biome.json` — `package.json` icin 2-space override (npm konvansiyonu)

**Davranis korundu:**
- `guard-bash`: HARD_BLOCK / SOFT_BLOCK / LOG_WARNING uc katmanli izin
- `branch-guard`: main/master/release/* korumasi
- `completeness-gate`: gizli bilgi pattern'leri (Stripe, GitHub, AWS,
  Slack, JWT) + knowledge-base tamamlanmamis isaretler + memory.md 100
  satir + settings.json JSON dogrulama
- `dependency-audit`: 24 saat cache + lock dosyasi hash + npm/yarn/pnpm
- `session-reset`: dizin yapisini olustur + counter/marker temizligi +
  log rotasyonu
- `skill-router`: prompt -> eslesen skill SKILL.md govdesi context
  injection
- log-changes / log-failures / log-stop-verdict / track-usage / pre &
  post-compact: ayni kayit/temizlik akisi

**Test:** 624 -> 642 (+18 net, 22 yeni hook + bazi cross-platform fix)
**Lint:** 0 issue.

### Eklendi — Windows uyumluluk baseline'i (#126 phase 1)

`lib/platform.js` capabilities API + Windows Task Scheduler backend +
`badi doctor` Windows-aware bolum + CI `windows-latest` matrisi.

**`lib/platform.js`** — OS tespiti icin tek nokta:

```js
import { isWindows, bashAvailable, getOpener, getSchedulerKind, osSummary } from "./platform.js";
```

Disa acilan: `platform`, `isMac`, `isLinux`, `isWindows`, `isWsl()`,
`commandExists()`, `bashAvailable()` (WSL + Git Bash + native bash),
`getOpener()` (platforma uygun cmd-args), `getSchedulerKind()`,
`osSummary()`, `utf8Console()`, `utf8Hint()`.

**`badi doctor`** artik OS / bash / scheduler / UTF-8 durumunu yazar
ve Windows'ta bash yoksa uyari verir (hooks calismaz).

**Windows Task Scheduler** (`lib/schedulers/taskscheduler.js`) —
launchd/systemd ile ayni API'ye uyumlu adapter: `id`, `platform`,
`isAvailable`, `install`, `uninstall`, `isInstalled`, `describe`.
Windows'ta `pickScheduler()` tarafindan otomatik secilir.

**Dosya acici** (`lib/commands/icerik/ac.js`) — Windows `cmd /c start`
kullaniyor, sessizce dusmez.

**CI matrisi** — `.github/workflows/test.yml` artik ubuntu/macos
yaninda `windows-latest` icin de Node 20.x ve 22.x calistiriyor.

**Devam fazlari** (#126'da):

- Bash hook'larini Node.js'e cevirme (cross-platform calismasi icin)
- README Windows kurulum bolumu
- WSL/Git Bash olmayan kullanicilar icin Cmd/PowerShell hook fallback

## [1.22.0] - 2026-05-09

### Eklendi — `badi mcp serve` Model Context Protocol server (#120)

Badi artik kendisini stdio uzerinden MCP server olarak expose edebilir.
Disardaki AI client'lari (Claude Code, Cursor, Continue.dev, Claude
Desktop) `claude mcp add badi -- npx -y @fatihkan/badi mcp serve` ile
bagladiginda Badi tool ve resource'larini her oturumdan cagirabilir.

**Tools** (read-only, guvenli):

- `badi.skills.route` — verilen prompt icin eslesen skill'leri puanlar
- `badi.skills.list` — aktif (opt-in) skill kategorileri
- `badi.skills.available` — vault'taki tum skill kategorileri
- `badi.skills.inject` — eslesen SKILL.md govdelerini birlestirip dondurur

**Resources**:

- `badi://memory` — `.claude/memory.md`
- `badi://knowledge-base` — `.claude/knowledge-base.md`
- `badi://taskboard` — `.claude/workspace/TaskBoard.md`

```bash
# Tek seferlik kurulum (Claude Code)
claude mcp add badi -- npx -y @fatihkan/badi mcp serve

# Ya da snippet'i manuel yaz
badi mcp config > .mcp.json

# Acik tool/resource'lari incele
badi mcp tools
badi mcp resources
```

Sifir disa bagimlilik — JSON-RPC over stdio ~100 LOC ile elle implemente
edildi; `@modelcontextprotocol/sdk` (express + hono + zod baglar) gerekli
degil. MCP spec versiyonu `2024-11-05`.

### Eklendi — `outputstyle` ve `statusline` komutlari (#118)

Iki yeni opt-in komut Claude Code harness ozellestirmesi icin:

**`badi outputstyle`** — `.claude/output-styles/<name>.md` profilleri
yonetir. Claude Code icinde `/output-style <name>` ile aktive edilir. Uc
yerlesik profil: `terse` (kisa, gereksiz aciklama yok), `verbose` (detayli
gerekce + trade-off), `eli5` (basit dilde aciklama).

```bash
badi outputstyle available     # yerlesik profilleri listele
badi outputstyle add terse     # profili yukle
badi outputstyle list          # yuklu profilleri goster
badi outputstyle remove terse
badi outputstyle clear
```

Sonra Claude Code icinde: `/output-style terse`

**`badi statusline`** — `.claude/settings.json`'a `statusLine` alani
yazar ve `.claude/status-line/` altina helper scripti yerlestirir. Iki
yerlesik profil: `git` (branch + dirty mark), `skill-chip` (branch +
aktif skill sayisi).

```bash
badi statusline available
badi statusline set git
badi statusline list
badi statusline reset
```

Status line guncellemesini gormek icin Claude Code'u yeniden baslat.

### Duzeltildi — lint baseline + dep bump (#119)

- biome lint: 28 hata → 0; 6 `noAssignInExpressions` modern idyoma
  refactor edildi (`for (const m of str.matchAll(regex))`)
- biome.json schema 2.4.8 → 2.4.14 (CLI ile esit)
- @biomejs/biome 2.4.13 → 2.4.14
- vitepress 1.6.3 → 1.6.4
- Tests: 580 → 595 (15 yeni outputstyle + statusline icin)

### Notlar

- Bilesen sayisi: 79 komut (eski 77), 22 ajan, 13 hook, 25 skill
- 3 acik `npm audit` moderate (transitive `esbuild` via vitepress)
  duruyor — upstream "no fix available", sadece dev surumde

## [1.21.0] - 2026-05-03

### Eklendi — `seo-crawl-budget` skill (#109)

Yeni opt-in skill: dusuk rekabetli long-tail keyword'ler icin 6-24
saatte indexlenme metodolojisi. 20 makalelik kampanya, dongusel
ic-link matrisi, Search Console manuel tetikleme, 6 fazli yapi
(keyword uretimi, brief sablonlari, link matrisi, yayin takvimi,
GSC aksiyonlari, takip metrikleri).

[moneyvadi-prog/crawl-budget-manipulation](https://github.com/moneyvadi-prog/crawl-budget-manipulation)
(MIT, Gulsah Arslan) reposundan adapte edildi.

v1.20 auto-router ile entegre: `badi skills auto on` aktifken
"crawl budget", "long-tail", "search console", "indexleme",
"internal linking" gibi TR/EN trigger'lar prompt'ta gectiginde
SKILL.md govdesi otomatik enjekte edilir.

#### Kullanim — Otomatik mod (onerilir)

```bash
# Bir kerelik kurulum
badi skills auto on
```

Sonrasinda Claude Code icinde dogrudan istersin:

```
You ▸ Yeni blog yazilarim indexlenmiyor, crawl budget yonetimi nasil?
[Badi auto-router]
  - seo-crawl-budget (skor 12) — triggers: crawl budget, indexleme
Claude ▸ {SKILL.md gomulu} 20 makalelik kampanya planliyorum...
```

#### Kullanim — Manuel mod

```bash
badi skills available | grep seo-crawl-budget   # listede mevcut
badi skills add seo-crawl-budget                  # kalici opt-in
badi skills list                                  # aktif skill'leri gor
```

#### Kullanim — Tek seferlik (router olmadan, opt-in olmadan)

```bash
badi skills route --inject "long-tail keyword indexlenme problemi"
# SKILL.md govdesini stdout'a yazar
```

#### Skill ne uretiyor

Aktif olunca ajan asagidaki dosyalari onerir / sablon olarak verir:

```
seo-campaign-<slug>/
├── keywords-A.json          # 10 esit yayinlanan
├── keywords-B.json          # 10 zamanlanmis
├── briefs/                  # 20 makale brief'i
├── linking-matrix.md        # Dongusel ic-link grafi
├── publication-schedule.csv # Tarih + saat
├── search-console-checklist.md
└── tracking-template.md     # 14-28 gun metrik
```

**Yeni dosyalar**: `.claude/skills-vault/seo-crawl-budget/SKILL.md`.
Test: `tests/cli.skills-router.test.js` TR + EN trigger eslesme
case'leri (3 yeni test, 583 toplam).

Skill kategorileri sayisi: 24 -> 25.

## [1.20.0] - 2026-05-02

### Eklendi — otomatik skill router (`badi skills route` + `auto on/off`)

Prompt'a gore otomatik skill aktivasyonu. Vault'taki SKILL.md
aciklamalarindan keyword indeksi kurulur, kullanici prompt'una karsi
puanlama yapilir. UserPromptSubmit hook'u ile entegre olunca prompt
tipine gore eslesen skill'lerin govdesi her turun context'ine inject
edilir (filesystem yazma yok).

```
badi skills route "SEO icin schema markup ekle"   # eslesenleri puanla
badi skills route --inject "..."                   # SKILL.md govdesi yazar
badi skills auto on                                # hook'u aktif et
badi skills auto off                               # kapat
badi skills auto status                            # durum
```

**Skor formulu**: trigger token (`triggers on:` listesi) eslesmesi 3x,
description token eslesmesi 1x. Default `minScore=2`, top 3 skill.
TR + EN stopword filtresi yanlis match'i azaltir.

**Opt-in**: `badi skills auto on` settings.json'a UserPromptSubmit
hook ekler. Hook prompt'u okur, eslesen skill'lerin SKILL.md
govdesini additionalContext olarak verir. Token vergisi sadece
eslesme aninda — kisa prompt veya match yoksa hook sessizce gecer.

**Yeni dosyalar**: `lib/skills-router.js`,
`.claude/hooks/skill-router.sh`, `tests/cli.skills-router.test.js`
(22 test). doctor yeni hook'u denetliyor.

### Eklendi — `badi market gaps` (#84 phase 2)

Mevcut market sinyallerini cross-pozisyonlayan yeni `gaps` alt-komutu:

```
badi market gaps 284882215
badi market gaps 284882215 --query "facebook alternative" --json
```

Her cross-rakip sikayet kodu icin
`gapScore = coverage% * volume * (1 - difficulty/100)` hesaplanir;
`--query` verildiginde Reddit demand ile carpilarak skor zenginlesir.
Her bulgu coverage yuzdesi (kac rakip etkilenmis), volume (negatif
yorum sayisi), severity (`HIGH`/`MEDIUM`/`LOW`) ve tek satirlik
rationale icerir.

Cikti gapScore azalan sirada — en ust girisler "bu pazar dilimi
yaygin olarak yetersiz hizmet alan bir ihtiyaç tasiyor" sinyalinin
en gucludu. `--json` modu yapilandirilmis raporu yazar (hedef +
difficulty + demand + siralanmis bulgular).

#84 Phase 2'nin ucuncu yetenegi de boylece kapaniyor. SensorTower
revenue (#84-1) hala paid API'ye bagli; `gaps` ona bagimli degil.

## [1.19.0] - 2026-05-02

### Eklendi — `badi market wishlist` (#84 phase 2)

Demand × supply matrix icin yeni alt-komut:

```
badi market wishlist "habit tracker"
badi market wishlist "ai journaling" --json --days 60
```

Talep sinyali: Reddit anonim JSON araması (API anahtari gerekmez,
varsayilan son 30 gun). Arz sinyali: App Store araması sonuc sayisi.
Matrix dort kadrana ayrilir: `BLUE_OCEAN` (yuksek talep × dusuk arz),
`COMPETITIVE`, `NICHE`, `SATURATED`.

`--json` bayragi yapilandirilmis rapor cikarir (top post + subreddit
ornekleri + top app'ler rating ve sayisi ile) — diger araclara
borulamak icin.

Phase 2'nin ucunden ikincisi. SensorTower revenue (#84-1) paid API
erisimine takili; opportunity gaps cross-analysis (#84-3) takip eder.

## [1.18.0] - 2026-05-02

### Eklendi — agent frontmatter audit (#90)

21 ajanin tumune acik `permissionMode: default` eklendi. 15 read-only/
danisman ajan (archaeologist, api-designer, architecture-advisor,
debt-collector, error-whisperer, migration-pilot, onboarding-sherpa,
performance-profiler, pr-ghostwriter, refactoring-advisor, rubber-duck,
security-scanner, test-strategist, unsticker, yak-shave-detector)
artik `disallowedTools: [Write, Edit, NotebookEdit]` tasiyor — Claude
Code 2.1.119+ headless/`--print` calistirmalarinda bu alanlar uygulandigi
icin defense-in-depth saglaniyor.

`tests/agent-frontmatter.test.js` her calismada politikayi dogruluyor
(21 ajan icin 122 assertion).

### Eklendi — `badi tasarim` Phase 2 (#85)

- Yeni `tasarim-kurator` ajani — marka kimligi, renk psikolojisi,
  tipografi karakteri ve bilesen kararlarini sorgulayan interaktif
  DESIGN.md ureticisi (rationale dolu cikti)
- Yeni `design-tokens` skill'i (vault) — aktif oldugunda UI/bilesen/
  gorsel ureten ajanlar projedeki DESIGN.md frontmatter'ina danisarak
  canonical token'lari kullanir, ad-hoc deger uretmez
- `visual-director` artik DESIGN.md delegasyonu yapiyor: token'lari
  `design-tokens` skill'i uzerinden okur, marka drift uyarilarini
  yuzeylere cikarir, yeni renk/tipografi kararlarini
  `tasarim-kurator`'a devreder

Skill opt-in (v1.17 modeline uygun). Aktif et:
```
badi skills add design-tokens
```

## [1.17.0] - 2026-04-29

### Degisen — opt-in skill modeli (BREAKING)

Skill'ler artik otomatik yuklenmiyor. 23 skill kategorisinin tumu
`.claude/skills-vault/` dizinine tasindi (Claude Code bu dizini
taramaz). Aktif `.claude/skills/` klasoru bos baslar; kullanici
yeni `badi skills` komutuyla istedigi skill'leri secer.

**Neden:** 23 skill kategorisini otomatik yuklemek, hicbiri
kullanilmasa bile her tur ~10-15k token maliyeti getiriyordu.
Opt-in modeli bu maliyeti varsayilan olarak sifira indirir,
kullaniciya kontrol verir.

**Plugin yolu da `skills` alanini kaldirdi** (`plugin.json`).
Plugin kullanicilari npm CLI'sini de kurarsa `badi skills` ile ayni
opt-in akisini yasayabilir — plugin artik hicbir skill gondermiyor,
plugin kullanicilari icin de auto-load vergisi yok.

### Eklenen — `badi skills` komutu

```
badi skills                  # durum tablosu + interaktif picker
badi skills available        # vault'taki tum skill'ler
badi skills list             # aktif skill'ler
badi skills add <ad…>        # bir veya birden fazla aktif et
badi skills remove <ad…>     # aktif degil yap
badi skills clear            # tum aktif skill'leri sifirla
badi skills reset            # clear ile ayni
```

Interaktif mod (sadece TTY) numarali kontrol listesi gosterir;
`1,3,5-7`, `all`, `none` gibi secimler kabul edilir ve aktif kume
tek seferde guncellenir.

### Goc notlari

Mevcut kurulumlar korunur: update yolu `.claude/skills/`'i
kullanici verisi olarak isaretler, oradaki tum dosyalar oldugu gibi
kalir. Yalin varsayilana gecmek icin: `badi skills clear` ve
ardindan `badi skills add <yalniz ihtiyac duyulanlar>`. Token
analizi (`badi ai token`) vault boyutunu "Vault (yuklenmez)" olarak
ayrica raporlar — kazanci gormek icin kullanin.

## [1.16.5] - 2026-04-29

### Eklenen — plugin seviyesi guvenlik hook'lari

Claude Code plugin yolu artik `plugin.json` icinde inline olarak iki
evrensel guvenlik hook'u tasiyor —
`/plugin install badi@badi-marketplace` artik kullanicilara npm
yoluyla ayni Bash seviyesi korumalari saglıyor:

- **`guard-bash.sh`** (PreToolUse, matcher `Bash`) — yikici komut
  desenlerini bloke eder (`rm -rf /`, main/master'a force-push,
  `chmod 777`, `curl | bash`, secret exfiltration, `dd of=/dev/`
  vb.). Uc kademeli: hard-block, prompt, izin.
- **`branch-guard.sh`** (PreToolUse, matcher `Bash`) — `main` /
  `master` / `production` dallarinda dogrudan `git commit`'i ve
  `main` / `master` / `release/*` dallarinda
  `git push --force`'u reddeder. Feature dallarina push gecer.

Hook'lar script'leri `${CLAUDE_PLUGIN_ROOT}/.claude/hooks/`
uzerinden cagirir, plugin cache'inden kullanicinin proje
yapisindan bagimsiz olarak dogru cozulur.

### Bilincli olarak atlananlar

Proje-state hook'lari (`pre-compact-handoff`, `post-compact-resume`,
`session-reset`, `track-usage`, `log-*`, `backup-before-write`,
`completeness-gate`, `dependency-audit`) npm-only kaliyor. Yazilabilir
proje-local `.claude/` agacina (memory.md, TaskBoard.md, logs/,
backups/) bagimlilar — plugin cache bunu sunamaz. Tum hook setini
isteyen plugin kullanicilari `npx @fatihkan/badi init` ile alabilir.

## [1.16.4] - 2026-04-29

### Eklenen — Claude Code plugin dagitimi

Badi artik mevcut npm yoluna ek olarak Claude Code plugin olarak da
kurulabilir:

```
/plugin marketplace add fatihkan/badi
/plugin install badi@badi-marketplace
```

`.claude-plugin/` altinda iki yeni manifest:

- `plugin.json` — 21 ajan (`./.claude/agents/*.md`), komutlar
  (`./.claude/commands`) ve skill'leri (`./.claude/skills`) custom
  path'lerle deklare ediyor; mevcut `.claude/` agaci kanonik kaynak
  olarak kaliyor, hicbir kopya yok. `agents` alani schema'da dizin
  path'i kabul etmedigi icin 21 ajan dosyasi tek tek listelendi.
- `marketplace.json` — `badi-marketplace` adi altinda tek-plugin
  marketplace girdisi (category: productivity, strict: true).

Iki manifest da `claude plugin validate`'den yesil gectti. Gercek
Claude Code oturumunda end-to-end smoke-test yapildi:
`marketplace add fatihkan/badi` → `install badi@badi-marketplace`
plugin cache'e tam ajan/komut/skill agaciyla v1.16.3'i indirdi.

`.claude-plugin/` `package.json#files`'a eklendi — npm tarball'i da
manifest'leri tasiyor, tek checkout iki dagitim kanali besliyor.

### Dagitim kapsami

| Bilesen | Plugin (`/plugin install`) | npm CLI (`npx @fatihkan/badi init`) |
|---------|:--------------------------:|:----------------------------------:|
| 21 ajan | ✓ | ✓ |
| 77 slash komut | ✓ | ✓ |
| 23 skill kategorisi | ✓ | ✓ |
| 12 otomasyon hook'u | — | ✓ |
| Multi-harness compiler (Cursor / Gemini CLI) | — | ✓ |
| `badi` CLI takim aletleri (icerik / market / tasarim / publish / schedule / list / stats / doctor) | — | ✓ |

Hook'lar npm-only kaliyor cunku plugin cache yazilabilir bir
`.claude/` agaci sunmuyor (plugin icerigi read-only ve kullanicinin
projesinden ayri cache'leniyor).

## [1.16.3] - 2026-04-29

### Degisiklik — kesfedilebilirlik

npm ve GitHub yuzeylerinde Ingilizce-oncelikli metadata, ayrica
Anthropic Claude Opus 4.7 ve Sonnet 4.6 modellerine acik referans —
arama gorunurlugunu genisletmek icin.

- `package.json` description Ingilizceye cevrildi, marka + model
  versiyonlari dahil edildi.
- `package.json` keywords SEO icin secildi: dar terimler
  (`turkish`, `business-operating-system`) atildi; `anthropic`,
  `claude`, `claude-opus`, `claude-sonnet`, `ai-agents`, `subagents`,
  `cli`, `developer-tools`, `security-scanner`, `owasp`,
  `code-review`, `cursor`, `gemini-cli` eklendi (toplam 20).
- README hero paragrafi (EN + TR) Anthropic + Claude Opus 4.7 /
  Sonnet 4.6 + multi-harness vurgusuyla yeniden yazildi.
- GitHub repo description + topics API uzerinden guncellendi: 6
  dusuk-deger topic atildi (`typescript`, `nodejs`, `npm-package`,
  `workflow-automation`, `open-source`, `security-scanning`),
  11 yuksek-deger topic eklendi.

### Duzeltme — sayim drift'i

CLAUDE.md ve README dosyalari farkli bilesen sayilari soyluyordu.
Filesystem'e karsi cross-check ile su sayilarda standartlasildi:

- 21 ajan (`.claude/agents/*.md`)
- 77 komut (`.claude/commands/*.md`)
- 12 hook (`.claude/hooks/*.sh`)
- 23 skill kategorisi (`.claude/skills/*/`)
- 398 test

CLAUDE.md hero "50 komut, 21 beceri kategorisi" diyordu; README
tablosu "25 skill kategorisi" / "395 test" yaziyordu.

### Duzeltme — node badge

README.md ve README.tr.md badge'i `node >=18` diyordu fakat
`engines.node` v1.13'ten beri `>=20.11.0`. Badge artik tutarli.

## [1.16.2] - 2026-04-26

### Duzeltme — guvenlik

Tek PR'da 8 acik CodeQL alarmi (1 yuksek-onem hata + 7 uyari)
kapatildi. Ozet:

- `domain.js`: strict-first TLS baglantisi — sadece bilinen cert
  dogrulama hatalarinda (suresi dolmus, self-signed, hostname
  uyumsuz) insecure fallback'e gec. Donen veride yeni
  `validForDomain` flag'i, `badi ssl-check` ciktisina yeni kontrol
  satiri olarak yansidi.
- `skills-bundler.js#formatScalar`: backslash artik double-quote'tan
  once escape ediliyor — Windows yollari ve regex-literal iceren
  string'ler kayipsiz round-trip yapiyor.
- `seo.js#countWords`: regex bazli script/style strip yerine (CodeQL
  surekli yeni bypass'lar buluyordu) `node-html-parser` DOM agacina
  gecildi. Yeni runtime bagimliligi ama tum sanitization siniflari
  cozumlendi.
- `plugin.js`: `source.includes("github.com")` yerine
  `new URL(source).hostname` exact match — `evil.com/?github.com=1`
  artik GitHub URL sayilmiyor.
- `.github/workflows/test.yml`: `permissions: { contents: read }`
  eklendi (diger 4 workflow zaten explicit permissions iceriyordu).

`.claude/memory.md`'ye yeni kural eklendi: HTML processing icin
sanitization veya text extraction parser kullanmali, regex degil.

### Duzeltme — `badi tasarim`

`badi tasarim` (v1.16.0) manuel smoke-test'i uc kullanilabilirlik
sorunu ortaya cikardi. Hepsi bu hotfix'te kapatildi; testler
395 → 397.

- **Lint exit code bulgulari yansitiyor.** `badi tasarim lint`
  bulgular oldugu halde exit 0 donduruyordu — CI/automation icin
  sessiz hata. Artik JSON ciktisi parse ediliyor; `summary.errors > 0`
  ise exit 1.
- **`--write` flag'i export icin.** `badi tasarim export` ciktiyi
  dosyaya yonlendirmenin yolu yoktu (sadece stdout). `--write <yol>`
  eklendi.
- **Help metni netlestirildi.** `--out` aciklamasi artik bunun
  DESIGN.md dosya yolu oldugunu belirtiyor (init: yazma hedefi;
  lint/show/export: kaynak). Onceki "Cikti dosya yolu" ifadesi
  yaniltici idi.

Iki upstream sorunu acik kaldi (GitHub issue olarak dosyalandi, bu
repoda cozulemez):
- `@google/design.md@0.1.1` lint, varsayilan `badi tasarim init`
  iskelesinde `raw.match is not a function` firlatiyor.
- `@google/design.md@0.1.1` export ayni iskelet icin bos token
  kategorileri donduruyor — ayni parse defekti.

## [1.16.0] - 2026-04-26

### Eklenen — `badi tasarim`

Gorsel kimlik komutu. #58 kapanir. Google'in `@google/design.md`
CLI'sini (pinned `0.1.1`, npx ile) lint/export icin sarar; init/show
yerel.

Alt komutlar:
- `badi tasarim init [--ornek <ad>] [--out PATH] [--force]` — yeni
  `DESIGN.md` olustur (frontmatter tokens: colors / typography /
  spacing / radius / elevation / components + 8-bolum prose iskelet).
  `--ornek` ile upstream ornek stub'i.
- `badi tasarim lint [--strict]` — `@google/design.md lint` ile
  dogrula.
- `badi tasarim export --format tailwind|dtcg [--out PATH]` — Tailwind
  config veya DTCG JSON token export.
- `badi tasarim show [--tokens|--prose]` — frontmatter, prose veya
  ikisi (varsayilan).

Varsayilan yer: `.claude/workspace/DESIGN.md`. Ilk npx cagrisi internet
gerektirir; sonraki cagrilar cache.

### Testler

379 → 395 (+16).

## [1.15.3] - 2026-04-26

Dokumantasyon cilasi. Kod veya test degisikligi yok.

## [1.15.2] - 2026-04-26

Dokumantasyon cilasi. Kod veya test degisikligi yok.

## [1.15.1] - 2026-04-26

Dokumantasyon cilasi. Kod veya test degisikligi yok.

## [1.15.0] - 2026-04-26

### Eklenen — `badi market`

App Store pazar arastirmasi komutu. MVP kapsam: rakip kesfi + coklu
bolge yorum aggregation + 11-kod sikayet kategorize + zorluk skoru
(BLUE_OCEAN / COMPETITIVE / HARD / SATURATED).

Alt komutlar:
- `badi market <appId>` — tam rapor (5-asama pipeline)
- `badi market discover <appId>` — rakip kesfi (genre filtreli)
- `badi market reviews <appId>` — coklu bolge yorum + rating dagilimi +
  sikayet kategorileri
- `badi market difficulty <appId>` — 0-100 skor + kategorik verdict

Bayraklar: `--country <c1,c2,...>`, `--pages <N>`, `--limit <N>`. API
anahtari gerekmez (iTunes Lookup, iTunes Search, Apple RSS).

Yeni `lib/market-helpers.js`: 6 helper. Mevcut `aso-helpers.js`'i
yeniden kullaniyor (iTunes API yuzeyi icin).

### Faz 2 (ayri issue'lar, 1.15.0 disinda)

- SensorTower revenue scrape (gercek $/indirme)
- Wishlist demand×supply matrix (`✓✓✓ eksik` / `✓✓ buggy` / `✓ var ama
  kötü` / `✓✓✓ var` notasyon)
- Opportunity gap raporu (sikayet ∩ wishlist + verbatim alintilar)
- `--format json` (otomasyon)
- Bolge-bilincli zorluk (US vs TR vs JP)

### Testler

359 → 379 (+20).

## [1.14.1] - 2026-04-26

CI / engines bump. Runtime kod degisimi yok.

### Degisti
- **CI matrisinden Node 18 cikarildi.** `tests/cli.*.test.js` (14
  dosya) ve `scripts/enrich-skills.js` `import.meta.dirname`
  kullaniyor — Node 20.11+ ozelligi. Node 18 satiri bu dosyalar icin
  sessizce kiriliyordu; matris bumped'i kalan suite'i temizliyor.
- **`engines.node` `>=20.11.0`'e bumped** (eskiden `>=18.0.0`).
  Paket metadatasi gercek runtime gereksinimine hizali.
- README kurulum talimatlari Node 20.11+ gerektirecek sekilde
  guncellendi.

### Notlar
- Production CLI yuzeyi (`bin/badi.js`, `lib/`) zaten cross-version
  guvenli `fileURLToPath(import.meta.url)` paternini kullaniyor;
  Node 20+ kullanicisi etkilenmiyor. Node 18 kullanicilari test
  suite'ini hicbir zaman calistiramazdi ama CLI calisiyordu.

## [1.14.0] - 2026-04-26

**Skill ekosistemi MVP.** Issue #56 (skill-bundle altyapisi) ve #57
(badi-discipline davranissal skill) kapaniyor.

### Eklenen — Skill bundle pipeline

- `lib/skills/schema.js` — Badi skill bundle frontmatter validator'i.
  Iki mod: warn (varsayilan) ve strict (CI).
- `lib/harnesses/skills-bundler.js` — `.claude/skills/<name>/` →
  `<target>/skills/<name>/` compile eder. Eksik frontmatter
  alanlarini otomatik doldurur, `references/` alt dizinini kopyalar,
  router skill uretir (kategoriye gore gruplanmis liste).
- `badi publish --skill-bundle [--target] [--source] [--strict]
  [--dry-run]` — bundler'i publish orkestratorune bagliyor.
- `scripts/enrich-skills.js` + `scripts/skill-descriptions.json` —
  source `.claude/skills/<name>/SKILL.md` dosyalarini in-place
  zenginlestiriyor. Idempotent.
- 23 `.claude/skills/<name>/SKILL.md` dosyasi tam Badi skill bundle
  frontmatter'ina sahip.

### Eklenen — `badi-skills` bootstrap kit

- `_bootstrap/badi-skills/` — ayri `badi-skills` GitHub repo'su icin
  bare skeleton. LICENSE, README (skills CLI / Claude Code marketplace
  / Cursor Remote Rule / OpenAI Codex install rehberi), CLAUDE.md +
  AGENTS.md, `.claude-plugin/plugin.json`, `.cursor-plugin/manifest.json`,
  `.github/workflows/validate.yml` (CI ana repo'dan schema'yi cekiyor
  ve strict modda dogruluyor).

### Eklenen — `badi-discipline` davranissal skill

- 8 ilke: Think Before Coding, Simplicity First, Surgical Changes,
  Goal-Driven Execution, Yak-Shave Detection, TaskBoard Discipline,
  Knowledge-Base Source Requirement, Destructive Action Gate.
- 4 progressive-disclosure references.
- SKILL.md preamble tradeoff notunu acikca tasiyor:
  "These are prompt-level guidelines, not enforcement."

### Testler

- 307 → 359 (+52).

## [1.13.2] - 2026-04-25

v1.13.1 sonrasi kod incelemesinden cikan 7 bulguyu tek hotfix'te kapatir.

### Duzeltildi
- **Yerel-saat "bugun" hesabi.** `badi icerik durum` ve `badi icerik kapat`
  bugun sayisini `mtime.toISOString()` (UTC) ile yerel `getDateString()`
  arasinda kiyasliyordu. UTC siniri yerel sinirla farkliysa (ornek: UTC+3
  saat 01:00) "bugun" yanlis sayilirdi. Artik yerel `startOfToday`
  karsilastirmasi.
- **`runTemplate` switch** olası tip drift'ine karsi `default: throw` ile
  korundu. `TEMPLATE_TYPES` listesi switch ile esitsiz olursa erken
  patliyor (uretilen dosya bos icerikle yazilmiyor).
- **`badi icerik` bilinmeyen subcommand mesaji** sadece template-tiplerini
  degil, oturum komutlarini (`list`, `basla`, `durum`, ...) da gosteriyor.
  Toplam 21 gecerli komut listeleniyor.

### Yeniden Duzenlendi
- `lib/commands/icerik.js` shim'i kaldirildi; `bin/badi.js` artik
  `lib/commands/icerik/index.js`'i dogrudan import ediyor (gereksiz
  indirection silindi).
- `lib/commands/agent.js` `subInstall` yorumu shell-watcher onayinin
  *neden* gerekli oldugunu anlatiyor.

### Testler
- 307/307 yesil — davranis korundu.

## [1.13.1] - 2026-04-25

### Duzeltildi — `badi agent`
- **`agent install` onay prompt'u sahteydi.** Watcher'da `shell` kontrolu
  varsa, install "kayit edilsin mi?" yaziyor ama hicbir input beklemiyordu.
  Sonra her halukarda install ediyordu. Artik gercekten `y/N` bekliyor.
  Scripted kullanim icin `--yes` / `-y` bayragi.
- **`agent install <yok>` ve `agent tail <yok>` ham `WatcherError` stack
  trace firlatiyordu.** Ikisi de artik temiz `Watcher yok: <yol>` veriyor
  ve `1` ile cikiyor.

### Yeniden Duzenlendi
- `lib/commands/icerik.js` 1667 satirlik tek if-chain idi (13 alt komut).
  `lib/commands/icerik/` altinda alt-komut basina modullere bolundu
  (issue #41). `icerik.js` 1-satirlik re-export shim oldu — geriye
  uyumluluk icin tutuldu, v1.13.2'de tamamen kaldirildi.

### Testler
- 304 → 307 (+3): yardim ciktisinda `--yes`, install/tail icin eksik
  watcher temiz hata. +3 sayisi tamamen `agent.js` cilasindan; icerik
  refactor'u test-degisikligi getirmedi.

## [1.13.0] - 2026-04-24

### Eklenen — Arka Plan Agent'lar (issue #55)

Badi artik **arka plan watcher** (takipci) sistemine sahip. Kullanici `.claude/watchers/` dizininde YAML frontmatter'li watcher'lar tanimlayip, OS-native bir scheduler'da calistirabilir. Ureten raporlar bir sonraki `/start` oturumunda brifing'e otomatik dusuyor.

Yeni komutlar:
- `badi agent create <isim> [--template project-health|deploy-watchdog]` — watcher iskelesi.
- `badi agent list` — kurulu watcher'lar + scheduler durumu.
- `badi agent run <isim>` — manual calistirma (gelistirme icin).
- `badi agent install <isim> [--scheduler launchd|systemd|cron] [--dry-run]` — en uygun OS scheduler'ina kayit.
- `badi agent uninstall <isim>` — scheduler kaydini kaldir (watcher `.md` kalir).
- `badi agent tail <isim> [-n N]` — raporun son N satiri.
- `badi agent status [--since 24h|7d] [--format text|json]` — tum watcher'lardan son N saatlik ozet.
- `badi agent remove <isim>` — tam temizlik (scheduler + watcher dosya).

### 5 yerlesik watch tipi

| Tip | Ne kontrol eder |
|-----|-----------------|
| `git` | `git log` (`last-N-commits` / `since:<ref>` / `all`), regex pattern eslesmesi |
| `shell` | Rastgele komut + `alert_on: exit-nonzero / stdout-match:<re> / stderr-match:<re>` + timeout |
| `file` | Dosya degisimi (mtime+size) ve `package.json` dependency-added/removed |
| `log` | Offset takibi ile tail, `new-entry` veya `pattern-match:<re>` |
| `http` | HEAD/GET + SSRF guard, `status-nonok`, `latency>Ns`, `body-match:<re>` (`|` ile kompozit) |

### 3 OS scheduler adapter'i

- **launchd** (macOS) — `~/Library/LaunchAgents/com.badi.watcher.<isim>.plist` + `launchctl bootstrap/bootout`.
- **systemd** (Linux) — `~/.config/systemd/user/badi-watcher-<isim>.{service,timer}` + `systemctl --user enable --now`.
- **cron** (universal fallback) — marked satirlar kullanicinin crontab'inda.

`pickScheduler()` platforma gore secer; `--scheduler` bayragi override eder; `--dry-run` plani + tam unit icerigi diske yazmadan gosterir.

### /start entegrasyonu

`/start` artik gunluk brifingten once `badi agent status --since 24h` cagiriyor. Son 24 saatte uyari varsa Brifing blogunda "Watcher" satirina ekleniyor, Claude uyari ozetini soruyor.

### Yerlesik template'lar

- `.claude/watchers/project-health.md` — git + npm test + package.json + failures log (15 dk).
- `.claude/watchers/deploy-watchdog.md` — http health + deploy error log (5 dk, varsayilan `active: false` — URL'i doldurup true yap).

### Teknik
- Yeni `lib/watchers/{index,parse}.js` + `lib/watchers/types/{git,shell,file,log,http}.js`.
- Yeni `lib/schedulers/{index,launchd,systemd,cron}.js`.
- Yeni `lib/commands/agent.js` + `bin/badi.js` entegrasyonu.
- `tests/watcher.test.js` icinde 38 yeni test (parse 13, types 10, schedulers 5, runWatcher e2e 2, agent CLI 6 + vb.).
- Toplam suite: **304/304 yesil** (266 → 304).

### Guvenlik notlari
- `type: shell` watcher'lar rastgele komut calistirir. Install akisi TTY modunda uyari yazar. `.claude/watchers/*.md` dosyalari guvenilir kabul edilmeli — 3. parti watcher'i korukoru kurma.
- `http` tipi `validateUrl()` (helpers.js) ile SSRF guard'dan geciyor — localhost / private IP bloklu.
- Scheduler unit dosyalari kullanici scope'unda kurulur (sudo gerekmez). `cron` sadece kullanici crontab'ini duzenler.

## [1.12.1] - 2026-04-24

Release sonrasi code review hotfix'i. v1.12.0 incelemesindeki 10 bulgunun hepsi tek PR'da kapandi.

### Duzeltildi — Yuksek

- **Test izolasyonu** — `preferences.js` artik `BADI_PREFS_HOME` (base dizin) ve `BADI_PREFS_PATH` (tam override) env var'larini okuyor. Onceden test harness'i tarafindan gecen env var no-op idi; `--no-save`'i unutan bir test gercek `~/.config/badi/preferences.json`'a yazardi.
- **Non-TTY sessiz kayit** — `badi init`, `--harness` bayragi yoksa ve headless calistirilmissa artik `defaultHarness` preferences'a yazmiyor. CI pipeline'lari yanlislikla bir harness secimi sabitleyemez.

### Duzeltildi — Orta

- **Cursor icerik donusumu** — Her Cursor hedefli dosya (`.cursor/commands/*.md` ve `.cursor/rules/badi-main.mdc`) artik Claude-specific path referanslari (`.claude/hooks/`, subagent, skill) hakkinda uyari iceren bir preface ile baslar. Govde 1:1 korunur; preface idempotent (install'u tekrar calistirinca cift eklenmez).
- **Interaktif menu test kapsami** — `parseMenuAnswer()` `selectHarnessInteractive()`'den saf fonksiyon olarak ayrildi ve export edildi. 9 offline test: sayi / id / Enter / gecersiz / sinir disi / negatif / bilinmeyen-id.

### Duzeltildi — Dusuk

- **Cursor rule header** — gereksiz `globs: **/*` satiri kaldirildi (`alwaysApply: true` varken anlamsiz).
- **`setPreference` dogrulamasi** — `defaultHarness` degerleri diske yazilmadan once harness registry'sine karsi dogrulaniyor.
- **Case-insensitive `--harness`** — `badi init --harness CURSOR` / `Gemini` / `ALL` artik dogru cozuluyor.
- **Kirilgan test assertion'lari** — `>10` / `>30` gibi sabit esikler gercek kaynak sayilariyla degistirildi (`readdirSync(SRC/commands).length`, `pass + warn + fail === checks.length`).
- **Cursor dizin sayimi** — `.cursor/` icin cift `result.created++` kaldirildi; install ozeti gercek dosya/dizin olusum sayilarini yansitiyor.

### Teknik
- `lib/preferences.js` — env-var destegi + `VALIDATORS` registry'si.
- `lib/commands/init.js` — `parseMenuAnswer` export edildi; `selectHarnessInteractive` artik parsing'i delege ediyor; non-TTY dali `saveDefault`'u kapatiyor.
- `lib/harnesses/cursor.js` — `transformCommand()` export; rule header kisaldi; `.cursor/` olusum sayimi duzeltildi.
- `lib/harnesses/index.js` — `resolveHarnesses` lookup'tan once inputu lowercase yapiyor.
- `tests/harness.test.js` — 15 yeni test (case-insensitive resolve, preface idempotency, rule header sekli, `parseMenuAnswer` 9 durum, env-var izolasyonu 2 durum). Toplam: 266/266 yesil.

## [1.12.0] - 2026-04-24

### Eklenen — Multi-harness destegi (issue #54)

Badi artik birden fazla LLM CLI'si ile calisabilir. `badi init` ile Claude Code, Cursor veya Gemini CLI icin dosyalar uretilebilir.

- **Interaktif secim menusu** — `badi init` argumansiz calistirinca harness secim menusu gosterir.
- **`--harness <id>`** — non-interactive kurulum: `claude`, `cursor`, `gemini`, `all`, veya virgul-ayrimli (`claude,cursor`).
- **Harness-aware update/doctor** — `badi update` ve `badi doctor` kurulu harness'i otomatik tespit edip hedef alir.
- **Preferences** — `~/.config/badi/preferences.json` icinde `defaultHarness` (bir sonraki `badi init` varsayilan olarak onu onerir). `--no-save` ile opt-out.

### Harness matrisi

| Harness | Kurallar | Komutlar | MCP | Subagents | Hooks | Skills |
|---------|:--------:|:--------:|:---:|:---------:|:-----:|:------:|
| Claude Code | `CLAUDE.md` | 77 | `.mcp.json` | 21 | 12 | 23 |
| Cursor | `.cursor/rules/badi-main.mdc` | 77 | `.cursor/mcp.json` | — | — | — |
| Gemini CLI | `GEMINI.md` (birlesik) | inline | `.gemini/settings.json` | — | — | — |

Cursor'da 12 hook + 23 skill, Gemini'de ek olarak 21 subagent + 77 slash komut desteklenmiyor — `badi init` ciktisinda `skippedComponents` raporunda gorunur.

### Teknik
- Yeni `lib/harnesses/` dizini: `claude.js`, `cursor.js`, `gemini.js`, `index.js` (registry + `resolveHarnesses` + `detectHarness`).
- Yeni `lib/preferences.js` — `~/.config/badi/preferences.json` read/write.
- `lib/commands/init.js`, `update.js`, `doctor.js` — adapter registry uzerinden dispatch edecek sekilde refactor. Baska harness yoksa Claude-only davranis korunuyor.
- `tests/harness.test.js` icinde 44 yeni test (7 suite: registry, 3 adapter, init/update/doctor CLI akislari). Toplam suite: 251/251 yesil.

## [1.11.0] - 2026-04-22

### Eklenen — Icerik Turleri
- **`badi icerik newsletter [konu]`** — haftalik e-posta bulteni sablonu (A/B konu satiri, on izleme, hook, CTA, footer, HTML config).
- **`badi icerik podcast [konu]`** — episode notu + show notes iskelesi (hook, dakika bazli akis, transkript iskelesi, platform metadata, sosyal klip onerileri).
- **`badi icerik thread [konu]`** — 10-postluk X/LinkedIn thread (hook → problem → hikaye → 3 anahtar nokta → karsi arguman → ders → uygulama → CTA + engagement stratejisi).
- **`badi icerik case-study [konu]`** — musteri basari hikayesi: one-liner, manset metrik, problem/cozum/sonuc tablosu, testimonial, dagitim plani.
- Dort tur de `--lang tr,en` ile TR+EN destekliyor.

### Eklenen — ASO Genislemeleri
- **`badi aso playstore <app-id>`** — mevcut `lookupPlayStore` scraper'i ile Google Play audit.
- **`badi aso reviews <app-id>`** — iTunes RSS'den gercek yorumlari ceker, anahtar kelime tabanli sentiment siniflandirma (pozitif / negatif / bug / feature_request / notr) yapar, en kritik 5 + en cok istenen 5 ozelligi listeler.
- **`badi aso screenshots <app-id>`** — uygulamaya ozel varlik dokumunu: yonelim dagilimi, cozunurluk dagilimi, ornek URL'ler, oneriler. Eski `badi aso screenshots` (id'siz) genel boyut rehberi olarak kaliyor.

### Eklenen — SEO Genislemeleri
- **`badi seo backlinks <domain>`** — en iyi cabali ucretsiz yaklasim. DuckDuckGo mention araması (site-disla filtresi) + Wayback Machine CDX snapshot varligi birlesimi. Tam backlink profili degil, yonsel veri oldugu net belirtilir.
- **`badi seo rank <domain> <anahtar-kelime>`** — DuckDuckGo organik rank kontrolu (ilk ~30 sonuc), domain bulununca pozisyonu isaretler.
- **`badi seo compare <url1> <url2>`** — yan yana SEO audit karsilastirmasi: HTTPS, title/meta uzunluklari, OG taglar, canonical, baslik yapisi, gorsel alt kapsami, kelime sayisi, schema, HTML boyutu, script sayisi, compression.

### Eklenen — Mobile Genislemeleri
- **`badi mobile crash-setup <fw> <provider>`** — React Native, Flutter, iOS ve Android icin Sentry veya Crashlytics kurulum iskelesi, yapistir-calistir config snippet'leriyle.
- **`badi mobile deeplink [domain|scheme://]`** — URL scheme'leri (RFC 3986) dogrular, `apple-app-site-association` + `assetlinks.json` dosyalarini ceker, appID, package name, SHA256 fingerprint on-eki ve test URL komutlarini raporlar.
- **`badi mobile ota [codepush|expo]`** — App Center CodePush (emeklilik uyarisi ile) ve Expo EAS Update icin adim adim OTA kurulum (configure → release → rollback).

### Eklenen — Publish Orkestratoru
- **`badi publish`** — tek komutla tum surum akisini calistirir: temiz git kontrolu → branch dogrulama → CHANGELOG kapisi → `package.json` version bump (varsa `package-lock.json` dahil) → commit → tag → main + tag push → `gh release create --generate-notes` → `npm publish --access public`.
- Bayraklar: `--version patch|minor|major`, `--dry-run`, `--skip-npm`, `--skip-github`, `--skip-changelog`, `-m/--message`.
- **`badi publish check`** — on-kontrol: git temizligi, branch, paket metadata, CHANGELOG, `gh` CLI, `npm whoami`.

### Teknik
- `lib/templates/tr.js` + `lib/templates/en.js` — her iki dilde 4 yeni template fonksiyonu (newsletter, podcast, thread, caseStudy).
- `lib/aso-helpers.js` — yeni export'lar: `fetchAppStoreReviews`, `analyzeSentiment`, `parseScreenshotUrl`.
- `lib/commands/seo.js` — DuckDuckGo artik POST + browser UA ile cagriliyor (GET shell sayfasi donduruyordu).
- `lib/commands/publish.js` — yeni ~330 satirlik orkestratör modul.
- icerik, aso, seo, mobile, publish test dosyalarina 27 yeni test eklendi (toplam 202/202 yesil).
- Yeni calisma-zamani bagimliligi yok.

## [1.10.0] - 2026-04-22

### Eklenen — Frontend Taste (Premium UI Skill'leri)
- **9 yerlesik tasarim varyanti** `.claude/skills/frontend-taste/` altinda — Claude Code'un jenerik "AI gibi goruken" UI uretmesini engeller:
  - `default` (design-taste-frontend) — genel amacli; DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY kadranlari
  - `gpt-taste` — sert editoryal, AIDA yapisi, zorunlu GSAP ScrollTriggers
  - `minimalist` (minimalist-ui) — Notion / Linear editoryal hissi
  - `brutalist` (industrial-brutalist-ui) — Isvicre tipografisi + ham grid
  - `soft` (high-end-visual-design) — ustun ajans hissi, spring motion
  - `redesign` (redesign-existing-projects) — mevcut UI'i denetle + duzelt
  - `output` (full-output-enforcement) — anti-truncation, diger varyantlarla istiflenir
  - `stitch` (stitch-design-taste) — Google Stitch icin `DESIGN.md` ureticisi
  - `images-first` (image-taste-frontend) — referans gorselli workflow
- **`badi taste` CLI** — varyantlari listele, incele, prompt al, durum kontrolu
  - `badi taste` — 9 varyanti acikamalariyla listele
  - `badi taste show <id>` — bir varyantin tam SKILL.md'sini yazdir
  - `badi taste prompt <id>` — Claude Code icin tetikleme ornegi goster
  - `badi taste status` — 9/9 varyantin kurulu oldugunu dogrula
- Claude Code'ta prompt icinde varyant adini gecirerek tetiklenir (ornek: "frontend-taste/brutalist skill'i kullan.")

### Teknik
- `lib/commands/taste.js` — yeni komut modulu (~170 satir)
- `bin/badi.js` — yardim ve komut haritasi guncellendi
- Yeni bagimlilik yok; skill'ler mevcut `badi init` / `badi update` akisiyla kopyalanir
- `package.json` version: 1.10.0

## [1.9.0] - 2026-04-21

### Eklenen — Global Dokumantasyon + Yerlesik Skill
- **Ingilizce dokumantasyon birincil olarak**: `README.md` ve `CHANGELOG.md` artik Ingilizce (npm global kesfi icin)
- **Turkce dokumantasyon korundu**: `README.tr.md` ve `CHANGELOG.tr.md` — dil secici linkli
- **Mobile App Store Screenshots Skill**: `.claude/skills/mobile/app-store-screenshots/` yerlesik skill
  - Claude Code'a "App Store screenshot olustur" dediginde otomatik tetiklenir
  - Next.js iskelesi + html-to-image ile tum Apple/Google cozunurluklerinde export
  - `badi init` ile otomatik kurulur (ek komut gerekmez)
- `badi mobile assets screenshots` cikisi skill'i referansliyor

### Teknik
- Yeni dosyalar: `README.tr.md`, `CHANGELOG.tr.md` `files` listesinde
- `package.json` version: 1.9.0
- CLI hala TR (backward compatible) — full i18n v1.10.0 roadmap'inde

## [1.8.2] - 2026-04-19

### Eklenen
- **`badi update --force`** — Slash/ajan/hook dosyalarini ZORLA guncelle (eski surumden kalan iceriklerin uzerine yazar)
- User dosyalari korunur: memory.md, knowledge-base.md, workspace/, plugins/, logs/, backups/
- Guncelleme ozet mesaji netlesti — ustune yazilan vs korunan dosyalar ayri gosteriliyor
- Yeni dosya eklenmediyse kullanici `--force` onerisi goruyor

### Onceki davranis
`badi update` sadece YENI dosyalari ekliyordu, mevcut slash/ajan icerigini guncellemiyordu.
Artik `--force` ile tam guncelleme mumkun (kullanici ozellestirmeleri sadece memory/workspace gibi alanlarda korunur).

### Kullanim
```bash
badi update              # Guvenli — sadece eksikler
badi update --force      # Tam — tum icerik guncellenir (memory/workspace haric)
badi update --dry-run    # On izleme
```

## [1.8.1] - 2026-04-19

### Iyilestirilen
- `badi doctor` sorun tespitinde daha rehberli cozum onerileri gosteriyor
- README'ye "Sorun Giderme" bolumu eklendi — yaygin hata mesajlari + cozumleri
- Hook eksik hatasi (`guard-bash.sh: No such file or directory`) icin acik rehberlik

## [1.8.0] - 2026-04-19

### Eklenen — AI/LLM + DevOps

**badi ai (5 alt komut):**
- `ai token` — .claude/ token kullanim analizi (kategori bazli + en buyuk dosyalar)
- `ai prompt-test` — Slash/ajan dosyalari regression test
- `ai memory-diff` — memory.md + knowledge-base limit kontrol
- `ai review` — Staged diff Claude API ile kod review (Haiku 4.5)
- `ai translate [file] --to [lang]` — Markdown cevirisi

**badi dev (5 alt komut):**
- `dev deps` — Bagimlilik guncelleme analizi (patch/minor/major)
- `dev deps --apply-patch` — Otomatik patch guncelleme
- `dev bundle` — Bundle size + framework tespit + en buyuk assetler
- `dev docker-lint` — Dockerfile best practice (FROM/USER/HEALTHCHECK vs)
- `dev env-check` — .env dosyasi dogrulama (eksik/fazla/placeholder)
- `dev api-test [url]` — HTTP endpoint tester (method/body/header/expect)

**Slash komutlari (10 yeni):**
- `/ai-token`, `/ai-review`, `/ai-translate`, `/prompt-test`, `/memory-diff`
- `/deps-update`, `/bundle-analyze`, `/docker-lint`, `/env-check`, `/api-test`

### Teknik
- `lib/commands/ai.js` — Claude API entegrasyonu (ANTHROPIC_API_KEY)
- `lib/commands/dev.js` — npm/yarn/pnpm detect + native tooling
- 11 yeni test (toplam 169)
- Toplam **76 slash komut** (66 + 10)

## [1.7.0] - 2026-04-19

### Eklenen — Eksik Slash Komutlari
CLI komutu var ama slash yoktu — 9 yeni `.claude/commands/`:
- `/wp` — WordPress site yonetimi (v1.4+)
- `/seo` — SEO denetim (v1.4+)
- `/aso` — App Store Optimization (v1.5+)
- `/mobile` — Mobil proje yonetim (v1.5+)
- `/stats` — Kullanim analitikleri (v1.1+)
- `/schedule` — Zamanlanmis hatirlaticilar (v1.2+)
- `/icerik-ara` — Arsiv arama (v1.2+)
- `/icerik-sablon` — Sablon mirasi (v1.2+)
- `/icerik-perf` — Icerik performans (v1.1+)

### Degisen — Mevcut Slash Komut Entegrasyonlari
Mevcut komutlara v1.6 CLI arac entegrasyonu eklendi:
- `/health` — `badi secret-scan`, `ssl`, `dns`, `lighthouse`, `a11y`
- `/security-scan` — `badi secret-scan` on calistirma
- `/audit` — T4 seviyesinde Badi CLI suite
- `/deploy` — Pre-deploy `secret-scan --git` (kritik ise engelle)
- `/perf-check` — `badi lighthouse` production metric
- `/changelog` — `badi changelog --write` hizli uretim
- `/release` — 4 komutluk workflow (scan/changelog/check/release)

### Sonuc
- **66 slash komutu** (57 + 9)
- **21 CLI komutu** (hepsinin slash karsiligi var)
- **12 hook** (tumu aktif)
- Katmanli mimari: CLI -> Slash -> Ajan

## [1.6.0] - 2026-04-19

### Eklenen — Domain Saglik + Guvenlik + Git Workflow

- **badi ssl [domain]** — SSL sertifika analizi (expire, TLS surumu, cipher gucu)
- **badi dns [domain]** — DNS kayit denetimi (A/AAAA/MX/TXT/SPF/DMARC/CAA) + email guvenlik skoru
- **badi whois [domain]** — Domain tescil + expire + transfer lock
- **badi lighthouse [url]** — PageSpeed Insights uzerinden Core Web Vitals + Perf/A11y/SEO/BP
- **badi secret-scan** — 17 pattern (AWS/GCP/GitHub/OpenAI/Stripe/npm/DB URI/private keys), `--git` ile history tarama
- **badi a11y [url]** — WCAG 2.1 accessibility audit (axe-core)
- **badi commit** — Conventional commit yardimi + format dogrulama (`--check`, `--message`)
- **badi changelog** — Git log'dan gruplu CHANGELOG.md uretimi (`--from`, `--to`, `--version`, `--write`)

### Eklenen — Slash Komutlar (.claude/commands/)
- `/ssl-check` — Badi CLI + yorumlama rehberi
- `/dns-audit` — DNS + email guvenlik analizi
- `/whois` — Domain saglik
- `/lighthouse` — Performance/A11y/SEO audit
- `/secret-scan` — Sir tarama + aksiyon plani
- `/a11y-audit` — WCAG uyum + manuel test hatirlatmasi
- `/conv-commit` — Staged change analiz + commit
- `/changelog-gen` — Release workflow

### Teknik
- `lib/commands/domain.js` — SSL (TLS socket), DNS (node:dns), WHOIS (TCP socket)
- `lib/commands/lighthouse.js` — PSI API entegrasyonu
- `lib/commands/secret-scan.js` — 17 regex pattern, false-positive filter
- `lib/commands/a11y.js` — PSI accessibility kategorisi
- `lib/commands/commit.js` — Conventional format regex, git log parse
- 15 yeni test (toplam 158)

## [1.5.0] - 2026-04-18

### Eklenen — Mobil ve ASO

- **badi aso** — App Store Optimization komut seti (closes #47)
  - `audit` — iOS app listing denetimi, skor hesaplama
  - `keywords` — Title/subtitle/description keyword analizi
  - `metadata` — iOS/Android karakter limit rehberi
  - `review` — Review response sablonlari
  - `compete` — Iki app karsilastirma + ortak/farkli keywordler
  - `screenshots` — iOS/Android boyut rehberi
  - `search` — iTunes API ile app arama
- **badi mobile** — Mobil proje yasam dongusu (closes #49, #50, #51)
  - `init` — React Native, Flutter, Expo, Swift, Kotlin template
  - `version bump` — iOS/Android/Flutter version sync (package.json + Info.plist + build.gradle + pubspec.yaml)
  - `build` — iOS/Android release build (RN + Flutter)
  - `release` — TestFlight, Play Internal, App Store, Play rehberleri
  - `assets icon/splash/screenshots` — Boyut ve tasarim rehberleri
- **badi icerik release-notes** — App Store/Play Store release notes (closes #48)
  - `--platform ios|android` — 4000/500 karakter limit
  - `--lang tr,en` — Paralel uretim
- **badi icerik post --platform** — Mobil platform variantlari (closes #53)
  - `appstore`, `playstore`, `mobile` CTA bloklari

### Teknik
- `lib/aso-helpers.js` — iTunes Lookup/Search + Play Store scrape
- `lib/commands/aso.js` — 7 alt komut
- `lib/commands/mobile.js` — 5 alt komut grubu
- 28 yeni test (toplam 143)

## [1.4.3] - 2026-04-18

### Degisen
- Harici repo referanslari temizlendi (52 dosya)
- README, SECURITY, CHANGELOG'da harici linkler kaldirildi
- `.claude/skills/security-check/` altindaki 49 SKILL.md dosyasinda metadata sadelestirildi
- Badi odakli metadata (author, homepage, organization alanlari kaldirildi)

## [1.4.2] - 2026-04-17

### Performans
- **Startup suresi %96 azaldi** (813ms → 26ms) — lazy command loading
- `bin/badi.js` artik komutlari dinamik import ediyor — sadece calisan komut yukleniyor
- Template lazy loading: TR/EN sablonlar (~800 satir) sadece sablon uretiminde yukleniyor
- `levenshteinDistance` O(m\*n) bellek → O(n) bellek (tek satir DP)
- Erken cikis optimizasyonu (boy farki kontrolu)

### Olcumler
| Komut | Once | Sonra | Iyilesme |
|-------|------|-------|----------|
| `badi --version` | 813ms | 26ms | %97 |
| `badi list --agents` | ~800ms | 29ms | %96 |

## [1.4.1] - 2026-04-17

### Duzeltilen
- **Guvenlik**: SEO komutlarinda SSRF korumasi eklendi (localhost, private IP, non-http engellendi)
- **Guvenlik**: WordPress `appPassword` base64 obfuscate + `wp-sites.json` dosyasina 0600 mode
- **Bug**: `seo sitemap` operator precedence hatasi (404'te bile sitemap bulundu sanirdi)
- `wp update` komutlarinda timeout 120s'ye uzatildi (buyuk sitelerde yetersiz kaliyordu)
- WP test cleanup iyilestirmesi

## [1.4.0] - 2026-04-17

### Eklenen
- **badi wp** — WordPress site yonetimi (dijital ajans ozelligi)
  - `wp add/list/remove` — site konfigurasyonu (WP-CLI veya REST API)
  - `wp status` — WP surumu, aktif tema, eklenti durumu
  - `wp plugins/themes` — detayli eklenti ve tema listesi
  - `wp update` — core/plugins/themes toplu guncelleme
  - `wp security` — 6 nokta guvenlik taramasi
- **badi seo** — SEO denetim ve analiz
  - `seo audit` — 20+ kontrol noktasi, skor hesaplama
  - `seo meta` — meta tag analizi ve eksik tag tespiti
  - `seo sitemap` — robots.txt + sitemap.xml dogrulama
  - `seo speed` — TTFB, HTML boyutu, kaynak analizi, compression
- 10 yeni test (toplam 115)

### Duzeltilen
- CI test script uyumluluk (tests/ → tests/*.test.js)

## [1.3.2] - 2026-04-16

### Duzeltilen
- **KRITIK**: Command injection — execSync yerine execFileSync (plugin.js)
- **KRITIK**: guard-bash.sh pipe zincirleme hatasi (proje disi yazma tespiti calismiyordu)
- VERSION artik package.json'dan okunuyor (tek kaynak, senkron hatasi onlendi)
- Habit streak hesaplama mantik hatasi (stats.js)
- CSV export formula injection korunmasi (stats.js)
- Schedule wrap-around gun araligi (sat-sun, fri-mon artik calisiyor)
- Chalk fallback Proxy tabanli (tum zincir kombinasyonlari destekleniyor)
- perf add atomik append (race condition onlendi)
- session-reset.sh macOS uyumsuz -printf kaldirildi
- dependency-audit.sh cross-platform date + pnpm destegi eklendi
- `badi list` artik kullanicinin projesini listeliyor (PKG_ROOT degil)
- `badi update` CLAUDE.md eksikse ekliyor
- `badi icerik ac --open` ile editor'de dosya aciyor
- checkDuplicates uyari kodu exit(2) (hata degil uyari)
- Unused imports temizlendi (helpers.js)
- Schedule parseTimeSpec gecersiz saat validasyonu (0-23:0-59)

### Eklenen
- GitHub Actions CI workflow (Node 18/20/22 x ubuntu/macos)
- GitHub Actions publish workflow (npm provenance)
- Dependabot haftalik npm + actions guncelleme
- FUNDING.yml (GitHub Sponsors + Buy Me a Coffee)
- npm downloads + CI status badge README'de
- v1.0.0, v1.1.0, v1.2.0, v1.3.0 GitHub Releases

## [1.3.1] - 2026-04-13

### Eklenen
- 48 guvenlik skill entegrasyonu
- OWASP Top 10 tam kapsam: SQLi, XSS, CSRF, SSRF, RCE, XXE ve daha fazlasi
- 7 dil bazli guvenlik tarayicisi: Go, TypeScript, Python, PHP, Rust, Java, C#
- 3000+ guvenlik kontrol maddesi
- 4-fazli guvenlik pipeline: Kesfet → Tara → Dogrula → Raporla
- Confidence scoring ile false positive azaltma

## [1.3.0] - 2026-04-12

### Degisen
- bin/badi.js 3812 satirdan 135 satira dusuruldu (15 ESM modul)
- CLAUDE.md 6.8KB'dan 1.2KB'a sadelelestirildi (%82 azalma)
- Skills 676KB'dan 256KB'a optimize edildi (%62 azalma)
- Commands 264KB'dan 236KB'a optimize edildi
- track-usage.sh matcher daraltildi (tum araclar → Bash|Write|Edit)
- dependency-audit.sh'e 24 saat cache eklendi
- Hook'lara akilli filtreleme eklendi (test/tmp dosyalari atlanir)
- Log dosyalarina rotasyon eklendi (usage 1000, incident/failure 500 satir)

## [1.2.0] - 2026-04-12

### Eklenen
- `badi icerik ara` — arsiv arama + benzerlik tespiti + --force
- `--lang tr,en` — coklu dil icerik uretimi (TR/EN paralel)
- `badi icerik sablon` — sablon mirasi sistemi (olustur/list/sil + --sablon)
- `badi schedule` — zamanlanmis hatirlaticilar (add/list/remove/check)
- EN sablonlar: 6 icerik turu icin Ingilizce versiyonlar
- Levenshtein + Jaccard benzerlik algoritmalari
- Frontmatter parse destegi
- preferences.json ile varsayilan dil ayari
- 33 yeni test (toplam 105)

## [1.1.0] - 2026-04-12

### Eklenen
- `badi stats` — kullanim istatistikleri (bar chart, trend, habit streak, CSV export)
- `badi completion bash|zsh|fish` — kabuk tamamlama scripti uretimi
- `badi icerik perf` — icerik performans takibi (add/list/trend/roi/platform)
- Update notifier — npm registry kontrolu, 24 saat cache
- track-usage.sh hook — PostToolUse ile kullanim loglama
- 24 yeni test (toplam 72)

## [1.0.0] - 2026-04-09

### Eklenen
- 21 uzman ajan (guvenlik, performans, test, API, mimari, icerik, proje planlama)
- 50 is akisi komutu (oturum, kalite, dagitim, strateji, icerik)
- 12 guvenlik hook'u (guard-bash, branch-guard, backup, completeness-gate)
- 21 beceri kategorisi (1000+ prosedur)
- CLI: init, update, doctor, list, plugin alt komutlari
- Icerik uretim motoru: post, karousel, video, gorsel, takvim, marka
- Plugin sistemi
- 6 katmanli bellek mimarisi
- 48 test
