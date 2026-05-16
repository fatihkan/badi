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
