# Proje Bellegi

## Mevcut Durum
- Proje: Badi - Claude Code Is Akisi Yonetim Sistemi
- npm: @fatihkan/badi **v1.34.0** (yayinda, 06.06.2026) — harness-uyumlu guvenlik artifact zinciri (THREAT_MODEL.md → VULN-FINDINGS.json → TRIAGE.json; security-check ailesine fold-in) + `badi security pipeline` CLI
- **English-only goc DOGRULANDI (05.06)**: bagimsiz adversarial audit 7 turda `VERIFIED CLEAN` (171→0, PR #248-257). Kasitli TR kalanlar: stopword Set'leri, icerik-helpers normalize tablosu, workspace veri yollari (takvim/, gorseller/, marka-sesi.md), CHANGELOG version-history girdileri
- **Sanal eng ekibi (v1.32+)**: product-strategist/engineering-manager/release-manager/qa-lead ajanlari + /ceo-review /eng-review /qa /ship + /team orkestratoru (kapi zinciri: strateji->plan->build->QA->ship)
- **Advisory uclu (v1.33, atoms.dev bosluk-doldurma)**: market-researcher / seo-strategist / data-analyst (read-only, ads-strategist kalibi)
- Ajan: 30 · Komut: 84 · Skill: 62 · Harness: 5 · Hook: 14 (13 varsayilan + skill-router opt-in)
- Tests: 1191 yesil · biome 2.4.16 clean · doctor healthy
- Dagitim: npm (✅ 1.34.0) + marketplace (✅ senkron) + Homebrew + Scoop (⏳) + GH Actions templates
- Yan repo: badi-skills v1.0.0 · Engines: Node >=20.11.0
- Self-telemetry: badi.command.* lokal JSONL, BADI_TELEMETRY=off
- Auto-router: prompt -> skill+command injection (dinamik, slash adlarini hardcode etmez — rename'de kirilmadi)
- Windows compat: phase 5 (VM smoke) bekliyor

## Mimari Notlar
- **Token-only rename pattern (v1.32)**: kullanici-yuzeyi token'lari degisir, ic fonksiyon/dosya/dizin adlari kalir (runBasla, basla.js, takvim/). template.js'de token->dir map (visual->gorseller). ~300 referansli rename'i guvenli kildi
- `lib/commands/icerik/` 13 modul (v1.13.1) — mobile.js 1226 / seo.js 1071 / aso.js 820 ayni pattern adayi
- `lib/commands/plugin/` 8 dosya split (v1.30+) · `lib/harnesses/_single-file.js` factory (v1.30+)
- `lib/commands/release.js` CHECKS array — 9 pure check; `runSyncManifest` subcommand
- `lib/data/marketplace-manifest.js` — pure generator; komutlar dir+count ile referansli (isimle DEGIL) -> komut rename manifest'i etkilemez
- `lib/observability/event-emitter.js` — badi.* closed list + plugin namespace
- `lib/skills/schema.js` — badi-skills CI curl ediyor; canonical `lib/frontmatter.js`
- `lib/aso-helpers.js` stopword Set'i KASITLI Turkce (keyword-analiz verisi, UI degil — cevirme!)
- agent-frontmatter.test.js: ajan sayisi (30) + READ_ONLY/PRODUCER setleri hardcoded — yeni ajan eklerken guncelle
- harnesses/claude.js doctor ajan listesi 30'a guncellendi (05.06 hijyen PR) — yeni ajan eklerken burayi da guncelle

## Kesin Kurallar
- **Harici proje atifi yok** — README/CHANGELOG/source/PR'da random 3rd-party repo adi olmaz (kurumsal markalar haric)
- **Branch-guard** — main'a dogrudan commit yasak (pre-commit hook engeller), hep feature branch
- **Yerel-saat tarih kiyasi** — `startOfToday` lokal; toISOString UTC kiyasi yapilmaz
- **TLS strict-first** — `rejectUnauthorized: true` default
- **HTML parsing icin parser** — regex-HTML yasak; `node-html-parser`
- **Workflow permissions** — her workflow'da `permissions:` zorunlu
- **URL host kontrolu** — `new URL(x).hostname === "github.com"`; `.includes()` yasak
- **`console.log(a, b, c)` newline koymaz** — coklu satir = ayri cagri
- **zsh word-split yok** — script'lerde unquoted `$VAR` bolunmez; coklu-dosya perl/sed icin acik glob/dizi kullan (3 sessiz-basarisizlik dersi, 04.06)
- **`badi commands profile` non-TTY'de `--yes` ister** (`--force` degil); test-kaynakli profil mutasyonunu commit oncesi `profile all --yes` ile geri yukle

## Acik Konular
- **Kullanici-aksiyonu**: #33 awesome-claude-code basvuru · #126 Windows VM smoke
- **Scope-acik MVP**: #11 badi gh (P3) · #12 badi kb (P3)
- **P3/P4**: #9 serve · #10 marketplace · #52 mobile crash · #13/#14/#15
- **11.06 tam-proje degerlendirmesi (3 mercek)**: CEO "feature freeze — dagitim+guvenilirlik
  dongusu, hedef ILK ORGANIK DIS SINYAL"; ENG "kod saglam, drift'in koku release kapisinda
  docs-sync eksigi"; QA "CLEAN WITH RISKS, 1.34.0 yayinda kalabilir". Hijyen turu basladi.

## Son Kararlar (son ~2 hafta — eskiler `memory-archive.md`)
- 2026-06-06: **v1.34.0 yayinlandi** (#271-#273) — Anthropic defending-code-reference-harness
  (Apache-2.0) artifact kontrati security-check ailesine FOLD-IN (yeni kategori YOK, 62 sabit;
  sc-verifier zaten agentic triage'di — eksik olan dosya kontratiydi). Upstream gercek ad:
  TRIAGE.json (TRIAGE-REPORT degil). Interop dis-yonlu + AD-duzeyinde (durust cerceve).
  `badi security pipeline [--json]`: salt-okunur zincir durumu, mtime staleness, exit 0.
  SUREC: 6-boyut adversarial plan-dogrulamasi NO_GO verdi — 3 blocker build ONCESI
  (insan plani sc-verifier duplikasyonunu kacirmisti, red-team yakaladi); 4-lens diff
  review +5 onayli bulgu pre-commit. KURAL ADAYI: buyuk plan = once adversarial workflow.
  Vault ic gercekleri: commands-vault→commands otomatik senkron YOK (ikisini de edit'le);
  `skills add` aktif skill'in ustune yazmaz (retrofit = remove+add). Yeni borclar backlog'da:
  vault frontmatter 37/62 fail (CI gezmez), README.tr tablo drift'i, dist/scoop bayat (1.30.1),
  INDEX.md 25-vs-21.
- 2026-06-05 (ogleden sonra): **v1.33.2 yayinlandi** (#261-#267) + **awesome-claude-code
  BASVURUSU CANLI** (hesreallyhim/awesome-claude-code#1955, validation ✅, maintainer
  kuyrugu — #1955'e AI yorumu YASAK, cooldown riski; tum etkilesim kullanicidan).
  (1) Maintainer'in evaluate-repository prompt'u bagimsiz ajanla on-kosuldu: 7.5/10
  "Recommend with caveats"; ilk 3 bulgu #264'te kapatildi (dep-audit network disclosure +
  BADI_NO_DEP_AUDIT opt-out + regresyon testi → 1185 test; SECURITY.md 1.33.x/14/62;
  "251 tests"→1184). (2) Bulunurluk: npm keywords +6 (chatgpt/codex/openai/copilot/
  ai-cli/coding-assistant, #263) + GitHub topics swap (aninda canli). (3) Hafif kalan
  bulgular kapandi (#267): .mcp.json context7@3.1.0 pin, track-usage exit_code null-honest,
  **awesome-ai-devtools PR'i da ACILDI** (jamesmurdza/awesome-ai-devtools#615 — orada
  insan-eli sarti yok). LinkedIn + X (tek tweet) PAYLASILDI; NotebookLM infografik prompt'u
  teslim (kaydedilmedi). awesome-nodejs uygun degil (≥100 yildiz). Yan bulgu: branch-guard
  hook cwd-farkindaligi yok — /tmp clone'a commit'i ve heredoc icindeki komut metnini
  blokladi (TaskBoard P4).
- 2026-06-05: **v1.33.0 + v1.33.1 yayinlandi** (PR #248-#260). (1) English-only bagimsiz
  adversarial audit ile VERIFIED CLEAN — 7 tur gerekti (171→0); kok ders: grep-hedefli ceviri
  satir kacirir, TAM DOSYA okuma + repo-wide ASCII-TR grep + bagimsiz audit sart.
  (2) atoms.dev kiyasindan 3 advisory ajan: market-researcher/seo-strategist/data-analyst (27→30).
  (3) v1.33.1: `badi skills auto on` olu hook fix (bash .sh → node .mjs, v1.22'den beri bozuktu;
  testi bug'i pinliyordu — test de sertlestirildi). (4) Hijyen PR: --help events/security
  ayni-satir bug + eksik bolumler (commands/schedule/agent/transcript/gh-kb/ai-dev) +
  command-index 4 profil + doctor ajan listesi 30 + README history eksik satirlar.
- 2026-06-03/04: v1.32.0 (#221-#230) — sanal eng ekibi + CLI grammar/content- oneki
  (BREAKING ama MINOR, kullanici karari). Detay: memory-archive.md. Test 1130->1155.
- 2026-05-22..29: v1.31.0 + bakim turu. Detay: memory-archive.md. Test 1074->1130.

## Yan Repo
- **badi-skills** v1.0.0 — CI `lib/skills/schema.js`'i ana repo'dan curl ile cekiyor

## Engeller
- (henuz yok)
