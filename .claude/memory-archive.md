# Proje Bellegi - Arsiv

> Memory.md 100 satir limitini gecince eskiyen detaylar buraya tasinir.
> Konsolidasyon: 16.05.2026.

## Karar Gecmisi (2026-04)

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

## Karar Gecmisi (2026-05 erken)

- 2026-05-11: v1.22.1 yayinlandi — Windows compat phase 2/3/4
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
- 2026-05-14: Triaj seansi. 67 olu branch silindi (48 local + 19
  origin, hepsi squash-merged). knowledge-graph.html artigi
  silindi (gitignore'da). Phase 2 #84-#87 stale referansi temizlendi.
- 2026-05-14 (ek seans): v1.24.0 yayinlandi (#152). 'badi skills'
  ailesine 'detect' + 'auto-install' eklendi — install-time
  stack-aware curation. 35+ teknoloji STACK_MAP, 5 sinyal turu
  (packages, configFiles/Dirs, fileExtensions, manifestKeys, scripts).
  /review #152 -> 8/8 bulgu kapatildi tek PR'da. Test 727 -> 768.
- 2026-05-15: pentest-* skill ailesi eklendi (25 kategori, advisory/
  defensive). Engagement disiplin modeli — scope-guard, OPSEC tagging
  (QUIET/MODERATE/LOUD), hard refusal listesi Badi opt-in vault
  formatinda. Live exploit/payload/C2 HARIC tutuldu. Vault 25 -> 50.
- 2026-05-15 (ek seans): v1.26.0 yayinlandi — profil bazli komut
  yonetimi + prompt-aware komut routing. 77 komut 4 profile etiketli.
  `.claude/commands-vault/` canonical store. Hook hem skills hem
  commands router'i cagiriyor. Test 774 -> 805. Olcum dogrulamasi:
  `badi ai token` POTANSIYEL tavan raporluyor, gercek per-turn yuk
  daha dusuk.

## Karar Gecmisi (2026-05 orta)

- 2026-05-15 (gec seans): v1.27.0 — expo-* skill ailesi (12 kategori) +
  #162 hook defensive fail-safe handler (13 hook hardened). Vault 50 -> 62.
  Test 805 -> 868.
- 2026-05-16: v1.27.1 — doc-only patch (PR #164/#165). Help completeness:
  `badi commands/skills --help` eksik flag'ler, top-level `badi --help`
  newline bug (console.log 3-arg). README drift fix.
- 2026-05-16 (wrap-up): Tier 1 quality pass — lint auto-fix, memory
  konsolidasyon (175 -> ~95), 15 komutta help-drift audit.
- 2026-05-16 (max-effort): v1.28.0 — secret-scan sertlestirme. K1 (JSON
  exit-code) + K2 (dedup collision) + Y1/Y2 + O2-O5 + D1-D4. 6 yeni flag
  (--exit-code/--max-commits/--max-files/--ignore/--ignore-file/--patterns).
  Test 868 -> 915. Davranis: JSON modu kritik bulguda exit 1.
- 2026-05-16 (ek seans): v1.28.1 — (1) help-doctor detektoru (PR #170):
  parser-context vs console.log help; `badi doctor help --strict --format
  json`. Allowlist `_why:` zorunlu. (2) 6 security finding (PR #171): Y1
  skills path traversal, O1 plugin git arg injection, O2 test SAMPLES
  split-string, O3a/O3b scope guard, D1. Test 915 -> 934.
- 2026-05-16 (gec seans): v1.29 observability — `~/.claude/projects/*.jsonl`
  transcript okur (privacy-preserving). `badi stats/search/session/plan/
  plugin show/list --mcp`. Reader: `lib/data/transcript-reader.js`. 934 -> 967.
- 2026-05-19: v1.29.0 npm yayinlandi. 2 chore PR (#174/#175). NOT: v1.28.1
  security hardening section'i CHANGELOG'da [1.29.0] altinda gozukuyordu —
  2026-05-28 bakim turunda [1.28.1]'e tasindi.
- 2026-05-19 (gece): v1.30.1 — multi-channel dist + marketplace sync + 9
  review bulgu. .claude-plugin/*.json stale idi -> senkron. `badi release
  sync-manifest` + checkMarketplaceManifest. dist/homebrew + scoop +
  dist-publish.yml opt-in. Test 1054 -> 1074.
- 2026-05-19 (ayni gun gec): v1.30.0 — 5-feature bundle + 11 review hotfix.
  windsurf+agents harness (5), `badi release check`, plan inject hook,
  plugin apiVersion+graph+doctor, `badi events`. Refactor: harness factory
  551->339, plugin.js 437->8 dosya, release.js CHECKS array. Test 967 -> 1054.
- 2026-06-03/04: v1.32.0 (10 PR #221-#230) — i18n 2p-2s lib English-only;
  sanal eng ekibi (4 ajan + /team, gstack'ten); CLI grammar (#227) + content-
  oneki (#228) BREAKING ama MINOR (kullanici karari, adoption ~0); QA kapisi
  /marka-sesi workspace-yolu regresyonunu yakaladi; biome 2.4.16. Test 1130->1155.
- 2026-05-22..29: v1.31.0 (Anthropic 2.1.126-147 uyum, badi security, /review
  parity, hook isolation audit) + bakim turu (#199-#201; lint 19->0, manifest
  re-sync, T3 denetim). Test 1074 -> 1130.
