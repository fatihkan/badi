# Proje Bellegi

## Mevcut Durum
- Proje: Badi - Claude Code Is Akisi Yonetim Sistemi
- npm: @fatihkan/badi v1.23.0 (yayinda) — 11.05.2026
- Tests: 727 (Linux+macOS yesil; Windows non-blocking)
- Yan repo: github.com/fatihkan/badi-skills v1.0.0 (25 skill bundle)
- Engines: Node >=20.11.0
- CodeQL: tum workflow'lar kaldirildi (10.05.2026, afe099e) — local lint/test + manuel publish
- Skill kategorisi: 25
- Komut: 82 (v1.23: gh + kb eklendi; v1.22: outputstyle + statusline + mcp)
- Auto-router (v1.20+) aktif: prompt -> matched skill injection
- MCP server (v1.22): badi mcp serve, sifir disa bagimlilikli stdio JSON-RPC
- GitHub entegrasyon (v1.23, #11 MVP): 'badi gh sync' issue->TaskBoard
- Bilgi grafigi (v1.23, #12 MVP): 'badi kb graph/backlinks/orphans/stats',
  vanilla SVG, sifir CDN bagimliligi
- Windows compat (v1.22 + v1.22.1, #126):
  - phase 1 (v1.22): lib/platform.js + taskscheduler + CRLF parsers
  - phase 2 (v1.22.1): 13 bash hook -> Node.js (.mjs)
  - phase 3 (v1.22.1): ESM URL + chmod assertion fix
  - phase 4 (v1.22.1): README Windows install bolumu
  - phase 5 (pending): native Windows VM smoke test

## Mimari Notlar
- `lib/commands/icerik/` 13 alt-komut moduluyle bolundu (v1.13.1)
- `lib/skills/schema.js` — skill bundle frontmatter validator (v1.14.0).
  parseFrontmatter inline kopya tutuluyor — badi-skills CI tek dosya
  olarak curl ediyor; harici import = kirik bagimlilik. Canonical kopya
  `lib/frontmatter.js`'te (v1.16.2 sonrasi)
- `lib/frontmatter.js` — sifir-bagimlilikli parseFrontmatter (yeni)
- `lib/harnesses/skills-bundler.js` — `.claude/skills/` -> bundle compiler
- `lib/market-helpers.js` — App Store competitor discovery + complaint cat (v1.15.0)
- `lib/commands/tasarim.js` — `@google/design.md` wrapper (v1.16.0).
  v1.16.2'de subLint exit code dogrulandi + --write flag eklendi
- `lib/commands/seo.js` countWords — `node-html-parser` ile DOM bazli
  (regex sanitization CodeQL bypass-prone)
- `_bootstrap/badi-skills/` — bootstrap kit (separate repo'ya ait, generated
  skill output gitignored, badi-discipline tracked)

## Kesin Kurallar
- **Harici proje atifi yok** — README/CHANGELOG/source-comments/PR/issue/
  release notes'ta random 3rd-party repo veya marketplace adi olmayacak.
  Istisna: Google, Meta gibi kurumsal markalar.
- **Yerel-saat tarih kiyasi** — mtime karsilastirmasi yerel `startOfToday`
  ile, `toISOString()` UTC kiyasi yapilmaz.
- **Branch-guard** — main'a dogrudan commit yasak, hep feature branch.
- **Dependabot PR'lari** — Node 18 CI'dan cikinca rebase + merge calisti.
- **PR templating** — title/body'de specific 3rd-party adlar yerine notr
  ifade kullanilir.
- **TLS strict-first** — `tls.connect` cagrilarinda `rejectUnauthorized: true`
  default; sadece bilinen cert-verify hatalarinda (expired, hostname
  mismatch, self-signed) raporlama amaciyla insecure fallback. Asla
  kosulsuz `rejectUnauthorized: false` koyulmaz.
- **HTML parsing icin parser** — Sanitization veya word-extraction
  benzeri amaclarda regex bazli HTML parse YASAK. `node-html-parser`
  veya benzeri DOM tree kullan. CodeQL `js/incomplete-multi-character-
  sanitization` rule'u regex bypass'larini sürekli yakalar.
- **Workflow permissions** — Tum `.github/workflows/*.yml` dosyalarinda
  `permissions:` block'u zorunlu (minimum `contents: read`).
- **URL host kontrolu** — `source.includes("github.com")` benzeri
  substring check yasak. `new URL(source).hostname === "github.com"`
  kullan.

## Acik Konular
- Phase 2 backlog issue olarak acildi:
  - #84 — badi market Phase 2 (SensorTower / wishlist matrix /
    opportunity gaps)
  - #85 — badi tasarim Phase 2 (kurator agent / design-tokens skill /
    visual-director delegation)
- Upstream alpha paket bug'lari (Badi tarafinda fix yok):
  - #86 — @google/design.md@0.1.1 lint `raw.match` hatasi
  - #87 — @google/design.md@0.1.1 export bos token kategorileri
- /review takip issue'lari (11.05.2026):
  - #137 ✅ kapandi - parseFrontmatter (+12 test) + tasarim lint smoke (+4 test)
  - #138 ✅ kapandi - subLint refactor (resolveLintExit saf fn) + subExport --write guard
- v1.23 yeni feature issue'lari (MVP merge, scope acik kaldi):
  - #11 - badi gh: MVP 'sync' yayinda. Sonra: pr draft, release draft, 2-yonlu
  - #12 - badi kb: MVP graph/backlinks/orphans/stats yayinda. Sonra: --topic,
    --open, --strict, cache
  - #33 - awesome-claude-code: hazirlik dosyasi var, basvuru maintainer kurali
    geregi sadece web UI ile (CLI yasak, ban riski)
- #126 phase 5 (pending, kullanici): manuel Windows VM smoke test
- v2 fresh start (gelecek): clean git history, snapshot-based ship

## Son Kararlar
- 2026-04-26: Node 18'i CI matrisinden cikar (engines.node >=20.11.0)
- 2026-04-26: Harici proje atiflarini tum surface'tan strip et
- 2026-04-26: Kurumsal markalar (Google, Meta) external bagimlilik
  olarak OK
- 2026-04-26: `_bootstrap/badi-skills/skills/` (badi-discipline haric)
  main repo'da gitignored
- 2026-04-26: v2 ile fresh start, history rewrite yerine
- 2026-04-26 (ek seans): badi-skills CI fix — schema.js self-contained,
  parseFrontmatter inline. badi-skills repo workflow'u dokunulmadan
  yesile dondu (PR #80, #81)
- 2026-04-26 (ek seans): v1.16.1 -> v1.16.2 publish (v1.16.1 npm publish
  401 ile atlandi). Hotfix: subLint exit code, --write flag, help
  netlestirme (PR #83)
- 2026-04-26 (ek seans): 8 CodeQL alarmi tek PR'da kapatildi (PR #88).
  En cetrefilli kismi seo.js — uc kademe regex iyilestirmesi sonra
  `node-html-parser` library'sine tasinma. Karar: HTML processing
  icin regex degil parser kullan (yeni Kesin Kural)
- 2026-05-11: v1.22.1 yayinlandi - Windows compat phase 2/3/4
  (publish komutu --version flagsiz default patch ile calistigi
  icin 1.23.0 yerine 1.22.1 oldu, ileride minor icin yeni feature
  bekleyecek). #126 PR #131 ile otomatik kapandi
- 2026-05-11 (ayni gun ek seans): /review takip issue'lari acilip
  fix'lendi (#137 P1, #138 P2). Test 642 -> 668 (+26). subLint
  saf 'resolveLintExit(stdout,status)' fonksiyonu ile test
  edilebilir hale geldi, subExport --write artik hata/bos cikti
  durumunda dosyayi yazmiyor (empty-on-error guard)
- 2026-05-11 (gec seans): v1.23.0 yayinlandi. Iki yeni komut ailesi:
  'badi gh sync' (issue->TaskBoard) ve 'badi kb' (graph/backlinks/
  orphans/stats). Vanilla SVG bilgi grafigi sifir CDN bagimliligi
  ile. /review #147 -> 10/11 bulgu hotfix'lendi (#149): XSS escape
  (renderHtml), buildGraph O(n²)->O(1), spawnSync maxBuffer 50MB,
  detectRepo tek regex + 6 variant test, vb. Test 624 -> 727 (+103).
  Toplam 18 PR (#132-#150). Awesome-claude-code (#33) park'ta —
  maintainer 'web UI only, gh CLI yasak, ban riski' kurali

## Yan Repo
- **badi-skills** v1.0.0 — bundle generated by `badi publish --skill-bundle`
  - CI workflow `lib/skills/schema.js`'i ana repo'dan curl ile cekiyor
  - Schema drift'ini engelliyor

## Engeller
- (henuz yok)
