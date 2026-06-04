# Proje Bellegi

## Mevcut Durum
- Proje: Badi - Claude Code Is Akisi Yonetim Sistemi
- npm: @fatihkan/badi **v1.32.0** (yayinda, 04.06.2026) — English-only goc TAMAM + sanal eng ekibi
- **English-only goc tamamlandi**: CLI cikti (2p-2s) + komut grammar (icerik->content, tasarim->design, BREAKING #227) + slash komutlar (icerik-*->content-*, BREAKING #228). Kalan yalniz ic/gorunmez: kaynak dosya adlari, workspace veri dizinleri (takvim/, gorseller/, marka-sesi.md), completion.js "Kullanim" yorumlari
- **Sanal eng ekibi (v1.32+)**: product-strategist/engineering-manager/release-manager/qa-lead ajanlari + /ceo-review /eng-review /qa /ship + /team orkestratoru (kapi zinciri: strateji->plan->build->QA->ship)
- Ajan: 26 (22+4) · Komut: 82 (77+5) · Skill: 62 · Harness: 5 · Hook: 14
- Tests: 1155 yesil · biome 2.4.16 clean · doctor healthy
- Dagitim: npm (✅ 1.32.0) + marketplace (✅ senkron) + Homebrew + Scoop (⏳) + GH Actions templates
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
- agent-frontmatter.test.js: ajan sayisi (26) + READ_ONLY/PRODUCER setleri hardcoded — yeni ajan eklerken guncelle
- claude.js doctor'daki hardcoded ajan listesi eski 21'de (drift, yeni 5 ajan kontrol edilmiyor — bilinen)

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
- **Kucuk leftover (gorunmez/ic)**: /icerik-notlari dangling slash ref (dosyasi yok, pre-existing) · completion.js "Kullanim" script yorumlari · README Version History 1.28-1.31 satirlari eksik (pre-existing doc-debt) · template.js 2 TR yorum
- **Surface-B-sonrasi tutarlilik**: claude.js doctor ajan listesi 21'de kaldi (26 olmali)

## Son Kararlar (son ~2 hafta — eskiler `memory-archive.md`)
- 2026-06-03/04: **v1.32.0 yayinlandi** (10 PR: #221-#230). (1) i18n 2p-2s ile lib-seviyesi
  English-only bitti; aso-helpers stopword'leri kasitli Turkce kaldi (strateji kapisi yakaladi).
  (2) gstack incelemesinden sanal eng ekibi: 4 yonetimsel ajan + 5 komut (#224).
  (3) /ceo-review->BUILD NOW (adoption ~0, "rename while young") -> CLI grammar (#227) +
  slash komutlar content- oneki (#228), ikisi de BREAKING ama kullanici karari ile MINOR bump.
  (4) QA kapisi kritik regresyon yakaladi: /marka-sesi ref-sweep'i workspace DOSYA yolunu
  bozmustu (content-brand-voice.md) -> geri alindi; marka-sesi.md veri dosyasi Turkce kalir.
  (5) biome 2.4.16 migrate+reformat (#229). (6) Release: branch release/v1.32.0 + PR #230,
  npm publish kullanici, tag+GH release Claude. Test 1130 -> 1155.
- 2026-05-28/29 (bakim+review+audit; PR #199/#200/#201): cli.hooks-node sandbox fix;
  lint 19->0; sayim drift -> kanonik; CHANGELOG security tasima; #200 manifest re-sync;
  #201 T3 denetim (3 ORTA + 4 DUSUK TaskBoard'da). Test 1130 yesil.
- 2026-05-22 (Cuma): v1.31.0 — Anthropic 2.1.126-147 uyum. badi security, /review parity,
  marketplace lastUpdated, GH Action scaffold, hook isolation audit. Test 1074 -> 1130.

## Yan Repo
- **badi-skills** v1.0.0 — CI `lib/skills/schema.js`'i ana repo'dan curl ile cekiyor

## Engeller
- (henuz yok)
