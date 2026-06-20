# Degisiklik Gunlugu

> **Dil / Language:** [English](CHANGELOG.md) · **Turkce**

Bu proje [Keep a Changelog](https://keepachangelog.com/tr/1.0.0/) formatini ve [Semantik Versiyonlama](https://semver.org/lang/tr/) standardini takip eder.

## [Unreleased]

### Degisti — ic refactor (v1.35.0 hardening, PR-B)

- **Semver helper'lari `lib/helpers.js`'te birlestirildi.** `parseVersion`
  (eskiden `lib/data/plugin-manifest.js`), `release.js` + `mobile.js`'te birebir
  kopya `bumpVersion` ve `update-check.js`'teki ad-hoc `semverGt` split'i artik
  tek strict 3-part implementasyonu paylasiyor (eski konumlardan re-export
  ediliyor, importer'lar etkilenmiyor). `bumpVersion` artik parse edilemeyen
  version'da sessizce `1.2.NaN` uretmek yerine HATA atiyor; `semverGt`
  prerelease takilarini tolere ediyor ve bozuk girdide muhafazakar.

### Degisti — doctor & release-gate saglamlastirma (v1.35.0 hardening, PR-A)

- **`doctor` beklenen hook'lari `settings.json`'dan turetir** (hardcoded liste yerine)
  — hook ekleme/cikarma artik burada elle duzenleme istemiyor (52→53 elle-bump derdi).
  Yeni export pure helper: `hookFilesFromSettings`.
- **`release check` artik README suite sayisini da dogruluyor** ("N tests across M suites"
  satiri), sadece test sayisini degil — `parseTestSummary` `suites` parse ediyor,
  `ctx.actualSuites` olarak iletiliyor.
- **`release check --skip-test` artik UYARIYOR** — docs-sync reality kontrolu atlandi
  (README sayilari sadece ic-tutarlilik icin dogrulandi, canli suite'e karsi degil);
  temiz reality-dogrulanmis pass raporlamak yerine.
- **Yeni vault guard testi:** `INDEX.md`'nin ilan ettigi kategori sayilari diskteki
  kategorilerle esmeli (25-vs-21 drift sinifini yakalar).

### Duzeltildi — release araclari

- `dist/scoop/badi.json` v1.34.2 version bump'indan sonra bayat indirme `url`'i tasiyordu
  (`badi-1.34.1.tgz`) — dosya ayni anda iki version iddia ediyordu. 1.34.2'ye duzeltildi ve
  yeni bir `release check` kapisi (`checkScoopManifest`) scoop `version` ile `url`'in
  uyustugunu dogruluyor ki bu drift bir daha sessizce tekrarlamasin.

### Degisti — gelistirme araclari

- `@biomejs/biome` 2.4.16 → 2.5.0 (dev-dependency). Config 2.5.0 semasina tasindi;
  yeni lint kurallarina uyarlandi: `release.js` `findIndex(x => x === v)` →
  `indexOf(v)` (`useIndexOf`) ve `assets/` (statik OG/sosyal gorseller) linter'dan
  dislandi ki SVG asset'leri lint kapisina takilmasin. Lint temiz kaliyor.

## [1.34.2] - 2026-06-20

### Duzeltildi — Claude bir alt-dizinden baslatilinca hook'lar kiriliyordu

Uretilen `.claude/settings.json`, 14 hook'un tamamini **goreli** komutla
yaziyordu (`node .claude/hooks/X.mjs`). Goreli yol, hook calistigi andaki
calisma dizinine (cwd) gore cozulur — proje koksune gore degil. Bu yuzden
Claude Code'u badi-yonetimli bir projenin herhangi bir **alt dizininden**
(orn. bir monorepo icindeki alt-paket) baslatinca her hook
`Error: Cannot find module '.../<altdizin>/.claude/hooks/X.mjs'` ile
basarisiz oluyordu — hook dosyasi proje kokunde duruyor, goreli yol oraya
ulasamiyor.

- **Her hook `$CLAUDE_PROJECT_DIR`'e sabitlendi** (`settings.json` template'inde
  `node "$CLAUDE_PROJECT_DIR/.claude/hooks/X.mjs"`) — cwd ne olursa olsun hook'lar
  cozulur. `statusline.js` ve plugin-variant manifest (`$CLAUDE_PLUGIN_ROOT`)
  zaten bunu yapiyordu.
- **`badi skills auto on`** skill-router hook'unu artik ayni `$CLAUDE_PROJECT_DIR`
  sabitlemesiyle yaziyor.
- **Yeni doctor kontrolu** — "hook commands are project-root anchored": bir
  `settings.json` hala goreli hook yolu tasiyorsa uyarir (eski badi ile yapilan
  kurulumlari, alt-dizinde kirilmadan once yakalar).
- **Migrasyon:** mevcut kurulumlar `badi update` ile bu fix'i alir.

Test: 1269 → 1274 (+5: `findRelativeHookCommands` ureticisi + shipped template'in
tam sabitli oldugu). Doctor: 52 → 53 kontrol.

## [1.34.1] - 2026-06-14

### Duzeltildi — hijyen turunun oz-incelemesi (#275-#277 cok-ajanli code review)

Ayni-gun merge'unun recall-modlu cok-ajanli incelemesi, hijyen PR'larinin kendi
soktugu iki regresyonu + yeni kapinin tasarim acigini yakaladi:

- **docs-sync kapisi, durdurmak icin var oldugu drift'i yakalamiyordu.** Uc README
  test-sayisi yuzeyini yalnizca BIRBIRIYLE kiyasliyordu, gercek suite ile asla. #275
  bunlari 1191 yapti; #276 sonra 64 test ekledi (→1260) — README yine bayatti ama
  checkDocsSync yine geciyordu. Artik checkNpmTest gercek pass sayisini ctx.actualTests'e
  besliyor; kapi gerceklikle uyusmayan her yuzeyde fail veriyor + suite kosup hicbir
  yuzey parse edilemezse fail eden bir taban var. README sayilari 1269'a duzeltildi.
- **Bos bir aktif skill her npm kullanicisina shiplenmis.** .claude/skills/expo-app-config/
  SKILL.md (255 satir) — #275'te untrack edilip #276'nin git add -A'si ile calisma
  agacindan (kullanici-yerel durum) tekrar staged olmus — package.json files[] ile
  npm'e gitmis. Tekrar untrack edildi; yeni .gitignore kurali (.claude/skills/*/)
  bir git add -A'nin tekrar sizdirmasini imkansiz kiliyor.
- **SECURITY.md surum kontrolu artik satir-farkinda.** Onceden Unsupported/EOL olarak
  listelenen bir surumde bile gecen ciplak sec.includes("1.34.x") substring'iydi;
  artik minor'un active/supported isaretli bir satirda gorunmesini sart kosuyor.
- README.tr.md: bayat "915 Onaylanmis Test (51 test)" satiri (rozet #277'de zaten
  kaldirilmisti) kanonik Ingilizce sayiya yonlendiren bir isaretle degistirildi.

### Duzeltildi — docs guvenilirligi + vault dogrulamasi (v1.34 sonrasi hijyen turu)

Uc-mercekli proje incelemesi (urun / muhendislik / QA, taze kanit uzerinde) kodu
saglikli ama pazarlama yuzeylerini her release'de bir surum geride buldu.

- README.md: test sayisi 1191'e esitlendi (rozet 1161, ozellik tablosu 1161, dev
  bolumu 1184 diyordu — ayni sayfada uc celiskili deger); harness tablosu subagent
  27 → 30; moduler-mimari satiri 22 → 36 komut modulu; dizin-yapisi blogu gercek
  agaca gore yeniden yazildi (14 hook, commands-vault, skills-vault); Homebrew/Scoop
  kurulum satirlari "Planlandi"ya indirildi (tap/bucket repolari henuz yok — eski
  satirlar Windows kullanicisina olu kurulum komutu veriyordu).
- SECURITY.md: desteklenen surumler 1.33.x → 1.34.x.
- dist/scoop/badi.json: 1.30.1 donemi aciklama ("22 AI agents, 77 commands") →
  guncel 30/84/62; version/url 1.34.0'a cekildi (CI aciklamayi yayina AYNEN kopyalar).
- .claude/skills-vault/INDEX.md: disk'ten yeniden uretildi — onceden 25 kategori
  iddia edip 21 satir gosteriyordu; artik 62'nin tamami listede (25 genel +
  25 pentest-* + 12 expo-*), pentest/expo aileleri ilk kez kendi indekslerinde gorunur.
- Yeni release kapisi **docs-sync** (`badi release check` icinde `checkDocsSync`):
  README test-sayisi ic tutarliligi + harness-tablosu subagent sayisi vs disk +
  SECURITY.md surum kapsami. Kok neden duzeltmesi — v1.32/33/34'un ucu de bayat sayi
  shipledi cunku docs'u gerceklikle kiyaslayan kapi yoktu.
- Vault dogrulamasi: 37 pentest-*/expo-* SKILL.md dosyasina `metadata.homepage`
  eklendi (37/62 kategori `validateSkillFile`'dan kaliyordu; bundler sessizce
  otomatik dolduruyordu); yeni vault-gezen test ucuncu sessiz tekrari engeller.
  `badi doctor` artik 14. hook'u da dogrular (`inject-active-plan.mjs` listede yoktu).
- memory.md konsolide edildi (98 → butce alti; eski girdiler memory-archive.md'ye).
- README.tr.md: arsiv-goruntusu banner'i eklendi (TR + EN) — kanonik Ingilizce
  README'ye yonlendirir; bayat statik test rozeti kaldirildi (dinamik npm
  rozetleri kalir). English-only goc takip issue'sunun (#207) son acik ucunu
  kapatir — tam TR senkronu ancak talep olusursa. CHANGELOG.tr.md kasitli
  Turkce varyant olarak aktif bakimda kalir.

## [1.34.0] - 2026-06-06

### Eklendi — harness uyumlu guvenlik artifact zinciri (security-check v1.2.0)

`security-check` skill ailesi fazlarini artik dosya kontratlariyla zincirliyor;
artifact adlari Anthropic'in [defending-code-reference-harness](https://github.com/anthropics/defending-code-reference-harness)
projesiyle (Apache-2.0) uyumlu: `THREAT_MODEL.md → VULN-FINDINGS.json/.md → TRIAGE.json/.md`.

- `sc-orchestrator` (v1.1.0): Faz 2 artik proje kokune `VULN-FINDINGS.json/.md`
  yazarak kapaniyor — upstream uyumlu alan adlari ve sema sekli (`F-NNN` id'ler,
  buyuk harf `HIGH|MEDIUM|LOW` severity); `confidence`/`confidence_reason` uretici
  asamasinda kasitli olarak `null` (upstream `confidence`'i second-opinion skorlamayla
  0.0-1.0 float doldurur; badi tum guven degerlendirmesini 0-10 olcekli verify
  asamasina birakir).
- `sc-verifier` (v1.1.0): yeni Adim 10 `TRIAGE.json/.md` uretir (karar eslemesi
  `TRUE_POSITIVE`/`FALSE_POSITIVE`/`CANNOT_VERIFY`, `verify_verdict`, dedupe
  baglari, 0-10 guven skoru).
- `pentest-threat-model`: yeni dosya cikti konvansiyonu — proje kokune numarali
  bolumlerle `THREAT_MODEL.md`; bolum 3-4 pipeline'in okudugu kapsam kontrati.
- README (EN + TR): "Harness Uyumlu Artifact Zinciri" kullanim bolumu — hizli
  baslangic, tek-yonlu interop cercevesi ve v1.34 oncesi aktiflestirenler icin
  yeniden aktiflestirme notu (`badi skills add` aktif skill'in uzerine yazmaz).
- `.gitignore`: uretilen `VULN-FINDINGS.*` / `TRIAGE.*` ignore edildi
  (`THREAT_MODEL.md` commit'li kalir — kalici tasarim dokumani).
- README.tr.md baslik sayilari duzeltildi (22/77/13 → 30/84/14); tam TR parite
  taramasi ayrica takip ediliyor.
- Provenance: artifact adi/alan kontrati Apache-2.0 upstream'den uyarlandi; skill
  metni ve sc-* dogrulama metodolojisi badi icin bagimsiz yazildi (MIT). Bilincli
  ertelenen: advisory `patch` asamasi (guvenlik ailesinin yazma-yok kontratiyla
  celisiyor) ve upstream otonom pipeline'i (gVisor + ASAN).
- Yeni CLI alt komutu **`badi security pipeline [--json]`** — artifact zincirinin
  salt-okunur durumu: asama basina var/eksik/bayat (mtime tabanli: upstream alt
  akistan yeniyse = bayat), onerilen sonraki adim ve triage ad-ayrimi notu
  (`badi security triage` = deterministik severity filtresi; `sc-verifier` =
  `TRIAGE.json` yazan agentic dogrulama). Her zaman exit 0 — bilgilendirme amacli,
  CI kapisi degil. Test: 1185 → 1191.

## [1.33.2] - 2026-06-05

### Duzeltilen — ag seffafligi: dependency-audit hook'unun registry cagrisi artik beyan ediliyor ve kapatilabilir

Bagimsiz bir `evaluate-repository` oz-degerlendirmesi (awesome-claude-code maintainer'inin birebir degerlendirme prompt'u ile kosuldu), `dependency-audit.mjs`'in her SessionStart'ta `npm/yarn/pnpm audit` calistirdigini — Badi'nin yaptigi tek otomatik ag cagrisi — ama README "Network Usage" tablosunun bunu atladigini ve "arka planda hicbir sey gonderilmez" dedigini buldu.

- README "Network Usage" tablosu: SessionStart dependency-audit hook'u icin yeni satir; giris cumlesi tek otomatik cagriyi isimlendirecek sekilde duzeltildi.
- Yeni **`BADI_NO_DEP_AUDIT=1`** ortam degiskeni opt-out'u — hook, cache yazimi veya registry cagrisindan once cikar. Regresyon testi eklendi.
- `SECURITY.md` tazelendi: desteklenen surum `1.3.x` → `1.33.x`, `12 Hook` → `14 Hook`, `48 Guvenlik Skill'i` → `62 opt-in skill kategorisi` (25 advisory `pentest-*` dahil); dependency-audit satiri artik ag cagrisini + opt-out'u belirtiyor.
- README gelistirme bolumundeki bayat `251 test` (v1.12 donemi) → `219 suite'te 1184 test` (ayni duzeltme README.tr.md'de; v1.12.0 surum-gecmisi satiri o gun dogru olan 251'i korur).

### Degisen — bulunurluk

- npm `keywords`: bitisik ekosistem aramalarinda cikmak icin `chatgpt`, `codex`, `openai`, `copilot`, `ai-cli`, `coding-assistant` eklendi (20 → 26); mevcutlarin hepsi korundu. GitHub topic'leri ayni geciste guncellendi.
- `badi --help`: `events`/`security`'nin tek satira basilmasi duzeltildi; eksik bolumler eklendi (Commands Profile, Schedule, Agent/Watcher, Transcript & Plan, GitHub & KB, AI/Dev alt komutlari); `commands` aciklamasi artik `pentest` profilini listeliyor.
- `.claude/command-index.md`: baslik 4 profile duzeltildi (pentest rezerve); `badi commands` alt bilgisi `pentest` listeliyor.
- `badi doctor` (claude harness): hardcoded ajan kontrol listesi 21 → 30 — v1.18'den beri eklenen 9 ajan artik dogrulaniyor.
- README Surum Gecmisi: eksik `v1.19.0`, `v1.28.0`, `v1.29.0`, `v1.30.x`, `v1.31.0` satirlari eklendi; `badi market wishlist` iddiasi v1.20.0 satirindan dogru evi v1.19.0'a tasindi.

Test: 1184 → 1185.

## [1.33.1] - 2026-06-05

### Duzeltilen — `badi skills auto on` olu bir hook kaydediyordu

Prompt-aware auto-router opt-in'i bozuktu: `badi skills auto on`, `settings.json`'a `bash .claude/hooks/skill-router.sh` yaziyordu; ama hook'lar v1.22'de `.sh → .mjs` (Node) tasinmisti — `skill-router.sh` yok ve `.mjs` dosyasi `bash` ile calismaz. Auto-router'i acan her kullanici sessizce hic calismayan bir hook aliyordu. (`lib/commands/skills.js`'deki bu kayit, v1.22 migration'inin atladigi tek yerdi; bir test de bozuk `.sh` string'ini pinledigi icin fark edilmedi.)

- `badi skills auto on` artik `node .claude/hooks/skill-router.mjs` kaydediyor (matcher `""`, `timeout: 5000`), `inject-active-plan` UserPromptSubmit hook'uyla ayni; on/off algilamasi da guncellendi.
- Test guclendirildi: komutun `node ...skill-router.mjs` oldugunu assert eder, `bash` / `.sh` formunu reddeder (bu bug'i yakalayacak regresyon korumasi).
- Baglam: 14 hook dosyasi shiplenir; 13'u varsayilan `settings.json`'a baglidir, `skill-router` opt-in 14.'sidir — yani belgelenen "14 hook" sayisi dogru.

## [1.33.0] - 2026-06-05

English-only goc en derine kadar iniyor — ve bagimsiz dogrulaniyor. v1.32 CLI grammar'ini yeniden adlandirmisti; **v1.33 60+ yuzeyde kalan her govdeyi, yorumu ve string'i ceviriyor ve 7 turluk adversarial cok-ajanli denetimle sifir kalinti oldugunu kanitliyor.** Ayrica 3 yeni advisory ajan filoyu 30'a cikariyor.

### Eklenen — arastirma / SEO / veri advisory ajanlari (atoms.dev bosluk-doldurma)

Mevcut yetenegi odaklanmis, izole baglamlara saran 3 adanmis advisory subagent (`security-scanner` / `performance-profiler` deseni). atoms.dev ajan listesine karsi bosluk analizi: bu 3 rolun badi'de araci vardi ama adanmis ajani yoktu; diger 5 rol zaten kapaliydi.

- `market-researcher` — talep/nis kesfi, rakip + pazar sinyalleri, insa etmeden ONCE firsat boyutlandirma (`product-strategist` ile `ads-strategist` arasindaki boslugu doldurur). WebSearch/WebFetch + App Store pazar araci.
- `seo-strategist` — SEO denetim + keyword/mimari strateji + organik buyume plani; `/seo` komutu ve `seo` / `seo-crawl-budget` skill'lerini tek subagent olarak sahiplenir.
- `data-analyst` — veri seti analizi → buyume icgorusu; `data-analytics` skill'ini (62 prosedur) sarar.
- Ucu de READ_ONLY/advisory (`disallowedTools: [Write, Edit, NotebookEdit]`). Filo: 27 → 30 ajan.

### Eklenen — ads-strategist ajani + /meta-review + /ads-review (advisory paid-ads katmani)

Proje-farkindali reklam stratejisi review'u (/ceo-review deseni): badi projeyi taniyor; bu baglami + canli pazar arastirmasini platforma ozel reklam stratejisine ve lansman-hazirlik verdiktine cevirir (READY TO LAUNCH / FIX FIRST / DON'T ADVERTISE YET).

- Yeni ajan `ads-strategist` (READ_ONLY, advisory; WebSearch/WebFetch'li ilk ajan).
- `/meta-review` (Meta: kitle, CBO/ABO funnel, creative acilari, policy riski) ve `/ads-review` (Google Ads: keyword evreni, Search/PMax, RSA, Quality Score, conversion tracking) — content profili.
- Kesin sinir: advisory-only — reklam API'si yok, kimlik bilgisi yok, harcama otomasyonu yok. Filo: 26 → 27 ajan, 82 → 84 komut.

### Degisen — English-only goc govde seviyesinde tamamlandi + VERIFIED CLEAN

v1.32 CLI-grammar yeniden adlandirmasiydi; v1.33 kalan her Turkce *govdeyi* cevirip kanitlayarak isi bitiriyor. Ceviri fazlar halinde yapildi (ajan/hook/CLAUDE.md govdeleri, 84 komut govdesi, 59 SKILL.md govdesi, lib yorum/hata/CLI string'leri, test basliklari/mesajlari/yorumlari, CHANGELOG, TaskBoard alt-sistemi) — ardindan bagimsiz adversarial cok-ajanli denetim **7 kez** kosup `VERIFIED CLEAN` (sifir kalinti, yuksek guven) dedi. Her tur ya daha derin bir katman ya hic taranmamis yeni bir yuzey buldu; kalinti 171 → 55 → 6 → 4 → 7 → watchers → 0.

- 84 slash-komut aciklama satiri + tum ajan `description:` alani Ingilizce; `.claude/command-index.md` yeniden uretildi (50 Turkce girdide bayatti → 84 Ingilizce girdi, profil gruplu).
- Cevrilen govdeler: 30 ajan, 14 hook (runtime block/inject/incident mesajlari dahil), CLAUDE.md, 84 komut, 59 SKILL.md (genel 22 / pentest 25 / expo 12), `lib/**` yorum + hata mesaji + CLI cikti (completion scriptleri, update banner), uretilen `.windsurfrules` / `GEMINI.md` / `AGENTS.md` header'lari, 62 test dosyasi (baslik + assert mesaji + yorum), `dist/` dagitim template'leri, `.claude/watchers/` tanimlari, demo/meta dosyalari.
- Kasitli Turkce yalniz data/kullanici katmaninda: tokenizer stopword Set'leri, `icerik-helpers` TR→ASCII normalize tablosu, ic identifier'lar, `README.tr.md` / `CHANGELOG.tr.md`, kullanici bellegi, SKILL.md `Triggers on:` iki-dilli routing keyword'leri, historical CHANGELOG version-history kayitlari.
- README/docs guncellik: sayimlar artik 30 ajan / 84 komut / 14 hook / 62 skill kategorisi (README, manifestler, docs, `package.json`).

### Duzeltilen — yeni kurulumlar icin temiz Ingilizce seed template'leri (maintainer-data sizintisi yok)

`badi init`, maintainer'in kendi `.claude/memory.md`, `knowledge-base.md` ve `workspace/TaskBoard.md` dosyalarini (Turkce, ic issue referanslariyla) her yeni projeye kopyaliyordu; `package.json` `files[]` bunlari npm tarball'inda shipliyordu.

- Yeni `lib/seed/` temiz, bos Ingilizce template'ler tutar; `seedUserFiles()` kurulumda bunlari yazar, mevcut kullanici verisini asla ezmez.
- `copyRecursive` `exclude` opsiyonu kazandi; maintainer'in calisan `.claude/` verisi artik kopyalanmiyor; `package.json` `files[]` artik `memory.md` / `knowledge-base.md` / `knowledge-nominations.md` / `workspace/` shiplemiyor.
- Gercek bir `npm pack` tarball kurulumuyla uctan uca dogrulandi: yeni kullanici bos Ingilizce memory/KB/TaskBoard alir, maintainer verisinin hicbirini almaz.

## [1.32.0] - 2026-06-03

> **English-only goc tamamlandi + sanal muhendislik ekibi.** Kullanicinin gordugu/yazdigi tum CLI yuzeyi — komut ciktisi, komut grammar'i ve Claude Code slash komutlari — artik Ingilizce. "Sanal eng ekibi" ilhamiyla yonetimsel bir ajan katmani (`/ceo-review`, `/eng-review`, `/qa`, `/ship`, `/team`) eklendi.

### Eklenen — Sanal muhendislik ekibi (yonetimsel ajan katmani)

- **4 ajan:** `product-strategist` (CEO mercegi), `engineering-manager`, `release-manager`, `qa-lead`.
- **5 komut:** `/ceo-review`, `/eng-review`, `/qa`, `/ship` ve `/team` — tum ekibi uctan uca kapi zinciri olarak yuruten orkestrator (strateji → plan → build → QA → ship).
- Filo: **22 → 26 ajan**, **77 → 82 komut**.

### Degisen (BREAKING) — Ingilizce komut grammar'i

- Ust seviye: `badi icerik` → **`badi content`**, `badi tasarim` → **`badi design`**.
- `content` alt komutlari: `basla`→`start`, `durum`→`status`, `fikir`→`idea`, `kapat`→`close`, `ac`→`open`, `ara`→`search`, `sablon`→`template` (`olustur`/`sil` → `create`/`delete`), `gorsel`→`visual`, `takvim`→`calendar`, `marka`→`brand`.
- Bayraklar: `--sablon`→`--template`, `--tur`→`--type`, `--son`→`--last`, `--ornek`→`--example`; fikir tipi `genel`→`general`.
- `karousel` → **`carousel`** (her yerde).
- **Breaking:** eski Turkce komut/bayraklar reddedilir. Ic kaynak dosya adlari, fonksiyon adlari ve workspace veri dizinleri (`takvim/`, `gorseller/`, `marka-sesi.md`) degismez (kullaniciya gorunmez).

### Degisen (BREAKING) — Ingilizce slash komutlar

- 14 Turkce isimli slash komut `content-` onekiyle yeniden adlandirildi: `/icerik-uret`→`/content-generate`, `/gorsel-brief`→`/content-visual-brief`, `/marka-sesi`→`/content-brand-voice`, `/video-senaryo`→`/content-video-script`, `/karousel`→`/content-carousel`, vb. (tamami icin EN changelog).

### Degisen — Ingilizce-only CLI ciktisi (i18n faz 2p–2s)

- `list`, `plan`, plugin alt komutlari; `events` + `mcp`; `bin/badi.js` (`--help` + dispatch/hata); paylasilan lib helper'lari, harness adapter'lari, data manifestleri — ciktilar, doctor etiketleri ve yorumlar cevrildi.
- **Bilerek Turkce birakildi:** `aso-helpers.js` stopword listesi (keyword-analizi verisi, UI degil).

### Degisen — arac zinciri

- `@biomejs/biome` 2.4.15 → 2.4.16 (config yeni semaya tasindi, kod yeniden formatlandi).
- `actions/checkout` 4 → 6 (CI).

---

_Asagidaki girdiler onceden `[Unreleased]` altindaydi ve 1.32.0 ile cikar:_

### Degisen — `badi icerik` English-only (TR content kaldirildi · English-only goc faz 1)

İcerik uretimi artik **yalniz English**. Tam English-only goc'un ilk fazi:
- `lib/templates/tr.js` kaldirildi; `en.js` tek content template.
- `--lang` artik **no-op** (geriye-uyum icin yutulur ama her zaman EN uretir); `tr`/`tr,en` destegi yok.
- Uretilen dosyalarda dil suffix'i yok (`-en`/`-tr` kalkti); marka sesi `marka-sesi.md`.
- `release-notes` + `marka` ciktilari English (header/body/footer cevrildi).
- 3 icerik testi en-only'ye guncellendi.

**Breaking**: `badi icerik ... --lang tr` artik TR uretmez (English uretir).

### Eklenen — `badi release check` lint gate (denetim O1)

`badi release check` artik `biome check` (lint) asamasi calistirir — lint hatasi publish'i **bloklar** (level: fail), `--skip-lint` ile atlanabilir. Sebep: lint/format CI-release'de gate edilmiyordu ve rot birikiyordu (bakim turunda 19 birikmis hata bundan cikti). Yeni `checkLint` `CHECKS` array'ine eklendi; `--skip-lint` help + parser'da belgeli (help-doctor temiz).

### Duzeltilen — `badi publish` workflow otomatik manifest sync (#196)

`badi publish --version <bump>` artik package.json bump sonrasi `.claude-plugin/{plugin,marketplace}.json` dosyalarini otomatik yeniden uretip ayni commit'e ekler. v1.30.1 ve v1.31.0 publish'lerinde manifest stale kaliyordu, manuel `badi release sync-manifest` gerekiyordu — bu donem kapaniyor.

- Yeni adim: **5. Plugin Manifest Sync** (version bump → manifest sync → tek commit)
- Yeni flag: `--skip-manifest-sync` (escape hatch, manuel sync icin)
- `lastUpdated` salt-bilgi (marketplace "son guncelleme" gosterimi); `isManifestStale` artik onu **dislar** (stale-lik yapisal-only) — toISOString format/an farki yanlis stale uretmez (review K1 fix)
- `.claude-plugin/` dizini yoksa adim sessizce atlanir
- Yardim metni + adim listesi guncellendi (1-10)

**Bilinen sorun (v1.30.1 + v1.31.0 publish)**: Bu surumlerden once `chore(release)` commit'i sadece `package.json` bump'lar, manifest stale kaliyor. Hotfix manuel `badi release sync-manifest` + ayri commit ile yapildi (v1.31.0: PR #195).

## [1.31.0] - 2026-05-22

> Anthropic Claude Code 2.1.126-2.1.147 (1-22 Mayis 2026) uyum surumu. `/security-review` (2.1.140+ built-in slash) koprusu, `/code-review` (2.1.147+) feature-parity, hook terminal-isolation audit (2.1.139+), marketplace manifest `lastUpdated` (2.1.144+) ve Anthropic'in resmi `claude-code-security-review` action'ini wrap eden GitHub Action sablonu eklendi.

### Eklenen — Guvenlik orkestrasyonu (`badi security`)

Yeni CLI komut, Anthropic native `/security-review` (Claude Code 2.1.140+ built-in) ile badi'nin deterministic baseline + CI scaffold'unu koprular:

```bash
badi security baseline [--json]      # secret-scan + npm audit deterministic taban
badi security triage [report]        # /security-review raporu severity'ye gore filtrele
badi security init --ci [--force]    # GitHub Action scaffold
```

Badi yapmaz: AI semantic vulnerability hunt — bunu Anthropic native `/security-review` yapar. Badi koprusu: deterministic baseline + post-scan triage + CI orkestrasyon.

Skill/slash cross-ref: `security-scan.md`, `secret-scan.md`, `security-check/SKILL.md` artik `/security-review` native komutunu entry point gosteriyor.

### Eklenen — `/review` parity (Anthropic `/code-review` 2.1.147+)

`.claude/commands-vault/review.md` argument formati:
- `effort`: `low | medium (default) | high`
- `--comment`: aktif PR'a inline yorum (gh CLI)
- `--correctness-only`: yalniz correctness bug'larina odaklan
- Auto PR context: `gh pr view` ile tespit

Badi `/review` Anthropic `/code-review`'un **superset**'i: 3 kanal + TR + classification + effort + --comment + --correctness-only.

### Eklenen — Plugin marketplace `lastUpdated` (Anthropic 2.1.144+)

`lib/data/marketplace-manifest.js`:
- `lastPackageJsonCommitDate()` — son version bump tarihi (ISO 8601)
- Anthropic Claude Code 2.1.144+ `/plugin` Browse pane'inde son guncelleme tarihi gozukur

**Stale-check semantigi**: `lastUpdated` `package.json` commit'ine bagli, her commit'te degismez — yalniz version bump sonrasi. `release check` noisy stale uretmez.

`badi release sync-manifest` otomatik gunceller.

### Duzeltilen — v1.31.0 internal review hotfix (13 bulgu)

PR #193 internal `/review` 13 bulgu tespit etti, ayni release'de hepsi kapatildi:

- **K1**: `badi security baseline` secret-scan'i calistirmiyordu — `secret-scan.js`'e CLI entry point eklendi
- **K2**: `runTriage` regex word-boundary yok — `\b(...)\b` + markdown heading parsing
- **Y1**: action `@main` floating ref — SHA-pinned (supply chain hardening)
- **Y2**: `runBaseline` dead ternary kaldirildi
- **Y3**: cwd-relative path — `projectRoot()` helper'i
- **O1-O4**: baseline integration testi, parse warning, full-flow fixture, slash command Claude-interprets notu
- **D1**: dependency-audit inject rate limit (1 saat)
- **D2**: `docs/enterprise.md` dead link → `server-managed-settings`
- **D3**: TaskBoard 5 issue tasindi
- **D4**: Bu changelog entry

### Eklenen — GitHub Action scaffold (`dist/github-actions/security-review.yml`)

- Anthropic resmi `anthropics/claude-code-security-review` action wrap
- `permissions: pull-requests: write, contents: read`
- `ANTHROPIC_API_KEY` secret ref
- Default exclude: `node_modules, coverage, dist, _bootstrap, .claude/skills-vault, .claude/commands-vault`
- `pull_request` head SHA (prompt injection hardening)

Kurulum: `badi security init --ci`.

### Duzeltilen — Hook terminal-isolation (Anthropic 2.1.139+)

Claude Code 2.1.139 hook'lari terminal access olmadan calistirmaya basladi. Badi'nin 15 hook'u audit edildi:
- Kategori 1 (JSON protocol / log-only): 13 hook — guvenli
- Kategori 2 (plain text stdout): 2 hook — **FIX** (`dependency-audit.mjs`, `post-compact-resume.mjs` → `writeContextInjection()`)
- Kategori 3 (terminal manipulation): 0 hook

Bu fix v1.31.0 oncesinde de teknik olarak yanlisi: Kategori 2 ciktilar Claude'un contextine girmiyor, terminal'e dusuyordu. Artik gercekten inject ediliyor.

### Eklenen — Dokumantasyon

- `docs/enterprise.md` — Anthropic managed-settings uyum rehberi
- `docs/hooks/isolation-audit.md` — 15 hook kategorize raporu
- README "Security Notes (v1.31.0+)" — `--dangerously-skip-permissions` uyari + crossref'ler

### Eklenen — Testler

54 yeni test (1074 → 1128):
- `tests/hooks-isolation.test.js` (45): her hook JSON-only stdout + ANSI escape yok + stderr bos
- `tests/security.test.js` (6): `badi security baseline/triage/init`
- `tests/marketplace-manifest.test.js` (+3): `lastUpdated` + scaffold

### Kapatilan

#188 (security-review entegrasyon), #189 (/review parity), #190 (marketplace lastUpdated), #191 (CI scaffold), #192 (hook isolation audit).

## [1.30.1] - 2026-05-19

> npm yayini oncesi review-tabanli iyilestirmeler dahildir (asagida `### Iyilestirmeler (PR #185 sonrasi ic review)` bolumune bakin). 9 review bulgusu ayni surumde kapali.

### Eklendi — Coklu kanal dagitim mirror'lari

Badi artik **2 canli kanal + 2 hazirlik asamasinda kanal** (`dist/` icinde iskelet, tap/bucket repo'lari beklemede):

```bash
npm i -g @fatihkan/badi                                       # birincil (canonical) ✅ canli
/plugin install fatihkan/badi                                 # Claude Code marketplace ✅ canli
brew tap fatihkan/badi && brew install badi                   # Homebrew (macOS/Linux) ⏳ yakinda
scoop bucket add badi <repo> && scoop install badi            # Scoop (Windows) ⏳ yakinda
```

Homebrew tap (`fatihkan/homebrew-badi`) ve Scoop bucket (`fatihkan/scoop-bucket`) repo'lari **henuz acilmadi**; bu surum manifest iskeletlerini ve CI workflow'unu icerir. O repo'lar olusturulana kadar npm veya Claude Code marketplace kullanin.

- **`.claude-plugin/plugin.json` + `marketplace.json`** v1.30.0 gercegine senkronlandi (v1.16.5'ten beri stale — 21 → 22 ajan, .sh → .mjs hook'lar, `./.claude/skills-vault` isaret eden `skills` alani eklendi, yeni plan-inject hook icin UserPromptSubmit hook bloku eklendi).
- **`dist/homebrew/badi.rb`** — npm-backed Homebrew formula iskeleti. Sha256 npm publish sonrasi release workflow tarafindan doldurulur.
- **`dist/scoop/badi.json`** — Scoop manifest iskeleti, `autoupdate` blogu npm registry'ye isaret eder.
- **`dist/README.md`** — Ayri `homebrew-badi` tap ve `scoop-bucket` mirror repo'lari icin kurulum rehberi.
- **`.github/workflows/dist-publish.yml`** — Opt-in workflow (sadece `workflow_dispatch`, otomatik trigger yok); `DIST_PUBLISH_TOKEN` secret tanimlandiginda npm tarball'i indirir, sha256 hesaplar, formula'lari tap/bucket repo'larina push eder. Badi'nin "auto-CI yok" politikasiyla uyumlu.

### Eklendi — `badi release sync-manifest`

```bash
badi release sync-manifest          # .claude-plugin/*.json'larini package.json + .claude/'den yeniden uret
badi release sync-manifest --dry-run # neyin yazilacagini goster, dosyaya dokunma
```

`package.json` okur + `.claude/{agents,commands,hooks,skills-vault}` dolasir; stabil, deterministik plugin manifest'leri uretir. Alfabetik agent listesi → her calistirmada saglam git diff'i.

Yeni `release check` dogrulamasi drift'i acikca gosterir:

```
XX  .claude-plugin/plugin.json mevcut       (badi release sync-manifest ile uret)
!!  .claude-plugin/plugin.json guncel       (stale — badi release sync-manifest)
```

Stale-bloku sayesinde her npm publish, package ile gercekten eslesen marketplace metadata'siyla yayinlanir.

### Modul ekleri

- `lib/data/marketplace-manifest.js` — generator + staleness checker (`buildPluginManifest`, `buildMarketplaceManifest`, `collectAgents`, `countHooks`, `countCommands`, `countSkillCategories`, `isManifestStale`, `writeManifests`). Pure functions; deterministic output.
- `lib/commands/release.js` — `checkMarketplaceManifest` `CHECKS` array'ine eklendi; `runSyncManifest` yeni subcommand olarak eklendi.

### Iyilestirmeler (PR #185 sonrasi ic review)

Yayin oncesi hotfix — 9 review bulgu kapali:

**Guvenlik**
- **K1** — Workflow'da `${{ inputs.version }}` ve `${{ steps.X.outputs.* }}` artik shell script'lerine direkt akmiyor. Tum kullanici-kontrolu degerler `env:` blogu uzerinden gecirilip shell icinde `$VAR` olarak quoted referansla kullaniliyor. `workflow_dispatch` inputs uzerinden shell injection'a karsi koruma (collaborator hesabi compromise olsa bile). Ayrica version semver dogrulamasindan geciyor.
- **Y1** — Git operasyonlari `DIST_PUBLISH_TOKEN`'i clone URL'ine gomerken (`https://x-access-token:$TOKEN@...`) artik `http.https://github.com/.extraHeader` ile `Authorization: Basic <base64(x-access-token:$TOKEN)>` header'i injekte ediyor. Token git URL'lerinde, hata log'larinda, process listing'lerde gozukmuyor.
- **O2** — Bot commit'leri artik GitHub Actions standart kimligini kullaniyor (`github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>` — verified-bot uygun) eskiden `noreply@github.com` jenerikti.

**Dogruluk**
- **O3** — Marketplace manifest staleness kontrolu artik `JSON.stringify` yerine recursive `deepEqualJson` kullaniyor. Elle duzenlenmis veya farkli formatlanmis JSON dosyalari ayni semantic icerige sahipse "stale" raporlanmiyor. Generator ciktisi hala deterministik; bu sadece kullanici-kaynakli key sirasi degisikliklerinde olusan false-positive'i temizliyor.
- **D2** — Scoop installer script'i `npm install` basarisizliginda (`$LASTEXITCODE -ne 0`) ve install sonrasi `badi` binary'si bulunamadiginda `throw` ediyor. Eskiden `Write-Error` kullanilyordu — exit kodunu degistirmiyordu, Scoop basarili olarak gosteriyordu.

**Dokuman**
- **Y2** — `README.md` install matrix'ine **Status** kolonu eklendi. Homebrew ve Scoop satirlari mirror repo'lari (`fatihkan/homebrew-badi`, `fatihkan/scoop-bucket`) olusturulana kadar `⏳ Coming soon (tap/bucket repo setup pending)` gosteriyor. CHANGELOG girdisi de in-progress durumunu notlandiriyor.

**Kalite**
- **O1** — `lib/data/marketplace-manifest.js`'den kullanilmayan `statSync` import'u kaldirildi.
- **D1** — `.gitignore` artik proje kokunde `.DS_Store` (macOS) ve `Thumbs.db` (Windows) kapsiyor. Yeni track edilen `dist/` dizinlerine OS metadata sizinmasi engellenir.
- **D3** — Workflow header'i implicit `python3` runtime bagimliligini dokumante ediyor (`ubuntu-latest` default'undan gelir).

### Test

1054 → **1074** (+20):
- `tests/marketplace-manifest.test.js` — generator unit (11) + disk stale tespiti (1) + dist skeleton + hardened workflow regex assertion'lari + `deepEqualJson` (6)

### Bu surumde olmayan dagitim kanallari

- AUR (Arch User Repository) — community-driven, in-repo PKGBUILD yok.
- deb / rpm — npm-backed CLI icin asiri masraf.
- Cargo / Go modules — uygulanamaz.

## [1.30.0] - 2026-05-19

> npm yayini oncesi review-tabanli iyilestirmeler dahildir (asagida `### Iyilestirmeler (PR #182 sonrasi ic review)` bolumune bakin). 11 review bulgusu ayni surumde kapali; kullanicilar her zaman cilali surumu gorur.

### Eklendi — ajan-bagimsiz baglam ihraci (`init` / `update`)

Iki yeni harness adapteri Badi'nin coklu ajan menzilini genisletir. Canonical
CLAUDE.md + memory + knowledge-base icerigi su ciktilara derlenebilir:

- **Windsurf** — `.windsurfrules` tek dosya kurali. Detect:
  `existsSync(".windsurfrules")`. Kullanim: `badi init --harness windsurf`.
- **AGENTS.md (Generic)** — OpenAI Codex CLI, Aider ve proje seviyesi
  AGENTS.md okuyan herhangi bir arac icin notr fallback. Kullanim:
  `badi init --harness agents`.

Birlestirme: `badi init --harness all` artik 5 cikti yazar (Claude Code,
Cursor, Gemini, Windsurf, AGENTS.md). Diger harness'lar (Claude/Cursor/Gemini)
onceki surumlerde mevcuttu; bu surum eksik iki tanesini ekler.

### Eklendi — `badi release check` pre-flight verifier

State degistirmeden publish hazirligi denetleyen yeni bagimsiz komut.
7-9 kontrol yapar: git temizligi, branch, `package.json` mevcudiyeti,
CHANGELOG.md + CHANGELOG.tr.md version girdisi, `npm test` cikis kodu,
`gh` CLI mevcudiyeti, `npm pack --dry-run` tarball boyutu.

```bash
badi release check                       # tam kontrol (npm test dahil)
badi release check --bump minor          # package.json'dan hedef surum hesapla
badi release check --version 1.30.0      # spesifik surum kontrolu
badi release check --strict              # uyari → hata (CI modu)
badi release check --skip-test           # hizli kontrol, npm test atla
```

Publish-gec-feedback dongusunu (kirli tree / eksik CHANGELOG / kirik test)
"badi publish sirasinda kesfedildi"den "publish'tan once yakalandi"ya
indirir.

### Eklendi — `inject-active-plan` hook (UserPromptSubmit)

Yeni hook `.claude/hooks/inject-active-plan.mjs`. `.claude/settings.json`'da
UserPromptSubmit hook olarak kayitli. Her kullanici prompt'unda:

1. `.claude/plans/<slug>.approved` marker'larini tarar
2. Her onayli plan'in `.md` icerigini okur
3. Claude context'ine `<active-plan slug="X" state="approved">…</active-plan>`
   bloklari olarak en fazla 5 plan inject eder
4. Sert sinir: injection basina toplam 200KB

Pending/denied planlar inject edilmez. Onayli plan yoksa no-op. Bu
`badi plan approve`'u aktif Claude context'ine baglar — plan sadece
gate'lenmez, her prompt'ta hatirlatilir.

### Eklendi — plugin manifest `apiVersion` + bagimlilik agaci

`badi-plugin.json` ileri-uyumluluk icin `badi` alani kazandi:

```json
{
  "name": "my-plugin",
  "version": "0.3.0",
  "badi": {
    "apiVersion": "1.x",
    "dependsOn": ["other-plugin@>=0.2"]
  }
}
```

Range soz dizimi: `*`, `X.x`, `X.Y.x`, `X.Y.Z`, `>=X.Y[.Z]`. Yokken default:
`1.x` (mevcut plugin'leri kapsar). Install sirasinda uyumsuz apiVersion
uyari uretir (bloklamaz — empirik uyum kati gate yerine tercih edildi).

Iki yeni subcommand:

- **`badi plugin doctor`** — tum yuklu plugin'leri denetler: manifest
  gecerligi, apiVersion uyumu, eksik/version-uyumsuz dep'ler. Herhangi
  bir sorunda exit 1 (CI uyumlu).
- **`badi plugin graph`** — topolojik sirayla load duzenini yazdirir:
  ```
  ├─ base-plugin v1.0.0
  └─ derived-plugin v0.3.0 ← base-plugin
  ```

Icerik: yeni `lib/data/plugin-manifest.js` (`parseRange`,
`validateManifest`, `checkApiCompat`, `topoSort`, `findUnsatisfied`).
`topoSort` icinde cycle algilama acik hata firlatir.

### Eklendi — `badi events` self-telemetry

Badi artik Claude Code transcript'lerini okumakla birlikte kendi tipli
event'lerini de yayinlar. Her CLI cagrisi su event'leri uretir:

- `badi.command.started` (cmd, args_count)
- `badi.command.completed` (cmd, duration_ms, exit_code: 0)
- `badi.command.failed` (cmd, duration_ms, error_message, exit_code: 1)

Event'ler `~/.claude/projects/<project>/badi-events.jsonl` dizinine yazilir
(Badi'nin stats/session icin zaten okudugu dizin). **Privacy:**

- Append-only JSONL, **sadece lokal** — network call yok
- Whitelist'lenmis event tipleri (`ALLOWED_TYPES`); bilinmeyen tipler droppe
- Arg degerleri DEPOLANMAZ (sadece `args_count`), kazara sir sizmasi yok
- String alanlar 200 karakter, array'ler 50 elemanla sinirli
- `BADI_TELEMETRY=off` (veya `0`/`false`) emission'i tamamen kapatir

Yeni reader komutu:

```bash
badi events list [--limit N]            # son N event
badi events stats                       # komut bazli sayim + ortalama sure + fail sayisi
badi events tail                        # list --limit 10
badi events status                      # telemetry on/off + log boyutu
badi events path                        # log dosyasi yolu
```

Filtreler: `--since DATE`, `--until DATE`, `--cmd <ad>`, `--type
<badi.command.completed>`.

Hot-reload pattern: pure-function emitter (`emit(type, data)`) → dosya
append; reader (`readEvents()`) → parse + reverse. `bin/badi.js`
dispatcher'a baglandi; her komut komut-bazli degisiklik gerekmeden ayni
sekilde instrument edilir.

### Iyilestirmeler (PR #182 sonrasi ic review)

Yayin oncesi hotfix — `/review` sonucu 11 bulgu ayni surumde kapali:

**Performans / observability**
- **B2** — Plan inject hook context budget 200KB'den (~%25 context) **50KB default + 3 plan default**'a indirildi. `BADI_PLAN_INJECT_MAX_BYTES` / `BADI_PLAN_INJECT_MAX_PLANS` env ile ozellestirilebilir. `BADI_PLAN_INJECT_OFF=1` ile tamamen kapali.
- **B4** — `badi events list` artik tail-reader (`readEventsTail`) kullaniyor — son K byte'i fd-bazli `readSync` ile okur, O(N) yerine O(K). Filtre kullanildiginda (`--since/--until/--cmd/--type`) tam okuyusa duser.
- **C6** — Dispatcher `process.on("exit", code => emit(...))` kullaniyor; bu sayede `process.exit(1)` cikislari da `badi.command.failed` event'i yayinlar (eskiden sadece `started` log'a dusuyordu).

**Dogruluk**
- **B3** — `runNpmTest` regex'i TAP `^# pass N$` / `^# fail N$` formatina anchor edildi — test adlarinda veya timing'lerde "passed" / "failed" gecmesi artik yanlis sayim yapmaz.
- **A3** — Plan injection plan body'sinde `</active-plan>` literal'lerini escape eder — plan icerigi bu tag'i icerirse XML-ish wrapper erken kapanmaz.

**Diagnostic netligi**
- **A2/B1** — `parseRange` artik `{ matcher, recognized }` doner. `checkApiCompat` apiVersion formati taninmadiysa `warning` alani uretir. `badi plugin doctor` bu uyariyi gosterir ve issue olarak sayar (eskiden permissive fallback bilinmeyen formatlari sessizce gecirip operatoru yaniltiyordu).

**Mimari (davranis degisikligi yok)**
- **C1** — Tek-dosya harness factory'si `lib/harnesses/_single-file.js`. `gemini/windsurf/agents` bunu kullanacak sekilde refactor edildi. **551 → 339 satir (−%38)**; yeni tek-dosya harness eklemek ~26 satir, eskiden ~170 satirdi.
- **C2** — `runReleaseCheck` 113-satir monolitik prosedurden `CHECKS` dizisine (pure-function array) refactor edildi. Her check bagimsiz unit-test edilebilir; plugin'ler `CHECKS.push(...)` ile kontrol ekleyebilir.
- **C3** — `lib/commands/plugin.js` (437 satir) `lib/commands/plugin/{install,remove,list,show,doctor,graph,help,_shared}.js`'e split edildi (`icerik/` pattern'i).
- **C5** — `ALLOWED_TYPES` whitelist'i artik `plugin.<sahip>.<event>` namespace'i de kabul ediyor (regex `/^plugin\.[a-z0-9-]+\.[a-z0-9.-]+$/`); core'a dokunmadan plugin'lerin kendi event'lerini yayinlamasi mumkun. `badi.*` kapali liste olarak kaliyor.

**Plan inject hook env override'lari**
- `BADI_PLAN_INJECT_MAX_BYTES` — total injection cap (default 50KB; min 1KB)
- `BADI_PLAN_INJECT_MAX_PLANS` — en fazla N plan inject (default 3; min 1)
- `BADI_PLAN_INJECT_OFF` — `1`/`true`/`off` ile hook tamamen kapali
- `BADI_HOOK_DEBUG=1` — `[plan-inject]` stderr trace

### Test

967 → **1054** (+87 yeni feature set + iyilestirmeler genelinde):
- `tests/harness-extras.test.js` (10) — windsurf/agents harness
- `tests/cli.release.test.js` (3) — release help / subcommand routing
- `tests/cli.events.test.js` (6) — events status/list/path CLI
- `tests/plugin-manifest.test.js` (24) — parseRange/validateManifest/
  checkApiCompat/topoSort/findUnsatisfied
- `tests/event-emitter.test.js` (4) — ALLOWED_TYPES, emit safety
- `tests/cli.plugin-doctor.test.js` (4) — split sonrasi doctor + apiVersion taninmadi uyarisi
- `tests/release-checks.test.js` (9) — CHECKS array, ayri check fonksiyonlari, bumpVersion
- `tests/event-emitter-extras.test.js` (13) — isAllowedType, plugin.* wildcard, readEventsTail, parseRange recognized
- `tests/harness-factory.test.js` (7) — buildSingleFileHarness, extraWriter, detect, force semantigi

Mevcut test guncellemeleri: harness registry test'i artik 5 id bekler
(eskiden 3), hooks fail-safe test'i 14 hook bekler (eskiden 13).

## [1.29.0] - 2026-05-19

### Eklendi — observability v1.29 (Claude Code transcript bazli)

Bes+ yeni komut/flag, `~/.claude/projects/*.jsonl` transcript'lerini direk
okur. Hicbir veri makineden cikmaz.

- **`badi stats --session [--limit N]`** — son N session: id (8 karakter),
  proje, branch, model sinifi, sure, prompt sayisi, tool sayisi, $maliyet.
- **`badi stats --models`** — model bazli session sayisi + USD breakdown +
  global cache hit rate.
- **`badi stats --cost`** — tum transcript USD toplam + ilk 10 proje.
- **`badi stats --since DATE --until DATE`** — ISO/YYYY-MM-DD tarih
  araligi (`--session`/`--models`/`--cost` icin gecerli).
- **`badi stats --branch <ad>`** — transcript'in `gitBranch` alani ile
  git branch filtresi.
- **`badi search "<sorgu>"`** — tum transcript'lerde multi-token AND
  arama (user prompt + last-prompt event). `--since/--until/--branch/--limit`.
- **`badi session <id-veya-prefix>`** — tek session detayi: baslik
  (model/token/maliyet/sure), tool dagilimi, dokunulan dosyalar,
  kronolojik timeline (prompt + tool_use + thinking). `--full` tam
  timeline, `--tools` / `--files` odakli gorunumler.
- **`badi plan list/new/show/status/approve/deny/reset`** — lokal
  dosya-bazli plan onay akisi. Marker'lar
  `.claude/plans/<slug>.{approved,denied}`.
  `badi plan status <slug> --format json` sadece approved ise exit 0
  (hook-dostu). Slug `/^[a-z0-9][a-z0-9-]{0,63}$/` ile dogrulanir.
- **`badi plugin show <ad>`** — manifest detayi: version, aciklama,
  ajan/komut/hook/skill sayisi + tam isim listesi.
- **`badi list --mcp`** — tum transcript'lerde MCP server cagri toplami;
  server bazli cagri + unique tool sayisi.

Icerik: yeni `lib/data/transcript-reader.js` (parseSession,
parseSessionWithEvents, applyFilters, MODEL_PRICING, costForUsage,
findSession, formatDuration, shortSessionId). Opus/Sonnet/Haiku 4.x icin
fiyat tablosu, bilinmeyen variant'lar icin family-name fallback.

Test: 934 → **967** (+33 — `tests/transcript-reader.test.js`,
`tests/cli.plan.test.js`, `tests/cli.observability.test.js`).

## [1.28.1] - 2026-05-16

### Eklendi — help-doctor: otomatik drift dedektoru

`lib/commands/*.js` dosyalarinin tamamini tarayan ve parser'in kabul
ettigi her subcommand (`case "x":`, `args[0] === "x"`) ve flag'i
(`args.includes("--x")`, `a === "--x"`) kullaniciya gosterilen help
metninde gozukmesini dogrulayan regression testi. v1.27.1 tipindeki
drift'i (commands --help'te route flag'lerinin eksik olmasi) PR
zamaninda yakalar, release sonrasinda degil.

- `lib/help-doctor.js` — saf `detectDrift(filePath)` / `auditFiles(files)` /
  `loadAllowlist(path)` yardimcilari. console.log-bazli help cikarimi
  inline help, ayri `showHelp()` fonksiyonlari ve `commit.js` gibi cok
  export'lu dosyalari (`runCommit` + `runChangelog`) handle eder.
- `tests/help-doctor.test.js` — 8 test: tam repo audit + 5 detector
  unit + allowlist schema dogrulamasi. `npm test`'e kayitli; drift
  varsa CI kirik dondurur.
- `.claude/help-doctor.allow.json` — false-positive allowlist'i,
  zorunlu `_why:` aciklamasi ile. Top-level help'te belgelenen
  flag'ler (init/update/doctor/list) ve internal alias'lar
  (market `full`) icin kullanilir.
- `badi doctor help` — ayni audit'i interaktif calistiran yeni CLI
  subcommand'i. CI parse icin `--format json`, herhangi bir drift'te
  exit 1 icin `--strict`.

### Duzeltildi — yeni dedektorun cikardigi drift

- `lib/commands/market.js` — `--days`, `--query`, `--json` flag'leri
  `Secenekler:` blok'una eklendi (parser kabul ediyordu ama dokuman yoktu).
- `lib/commands/stats.js` — `--week` flag'i help'e eklendi (default
  davranisti ama explicit form belgesizdi).
- `lib/commands/publish.js` — `--source` flag'i skill-bundle help'ine
  eklendi (kod yolunda vardi, help metninde yoktu).

### Duzeltildi — guvenlik sertlestirme (`/security-scan` 6 bulgu)

v1.28.0 uzerinde `/security-scan` calistirildi: 1 YUKSEK + 3 ORTA + 2
DUSUK bulgu cikti. Hepsi bu surumde kapali.

#### Y1 — `badi skills add/remove <name>` path traversal

`name` argumani CLI'dan dogrudan `join(vault, name)` ve `join(active, name)`
icine akiyordu, dogrulama yoktu. Empirik dogrulandi: `badi skills add
../../<existing-dir>` `copySkill`'e ulasti cunku `isSkillCategory` resolved
yolu var olarak gordu. Saldirgan bir script keyfi dizinleri
`.claude/skills/`'e kopyalayip iceriklerini bir sonraki Claude Code
oturumuna sızdırabilirdi.

Fix: her isim `/^[a-z0-9][a-z0-9-]*$/` patten'inden (`isValidSkillName`,
export edildi) gecer. `/`, `\`, `..`, basta `.`, veya buyuk harf iceren
adlar `copySkill`, `removeSkill` ve `isSkillCategory`'de reddedilir.

#### O1 — `badi plugin install <source>` git argument injection

`git clone --depth 1 <source> <dest>` cagrisinda `-` ile baslayan herhangi
bir `source` git tarafindan flag olarak yorumlaniyordu. Vektor:
`--upload-pack=<command>` (git option injection) veya `-u <command>` keyfi
komut yurutebilirdi.

Fix: kosulsuz `source.startsWith("-")` reject + git argv'sine `--` ayraci
(defense-in-depth): `["clone", "--depth", "1", "--", source, dest]`.

#### O2 — `tests/cli.secret-scan.test.js` fixture'lari kendi tarayicisini tetikledi

`private-key`, `mongodb-uri` ve `postgres-uri` icin canonical sample
stringleri ham literal olarak depolaniyordu; `badi secret-scan` repo
working tree'de 3 self-finding dondurdu. CI gurultusu, gercek sizinti
maskeleme riski.

Fix: uc sample concat'a cevrildi (`"mongo" + "db://..."` vb.). Runtime
davranisi ayni; statik kaynak literal pattern'i artik icermez.

#### O3a — `badi tasarim export --write <path>` proje-koku scope yok

Kullanici `--write` yolu resolve sonrasi containment kontrol edilmiyordu;
proje koku disina yazma mumkundu.

#### O3b — `badi secret-scan --ignore-file <path>` / `--patterns <path>`

Ayni siniftan. Bir guvenlik araci keyfi mutlak yollari sessizce
okumamali.

Iki sinif icin: yeni `assertWithinProject(baseDir, candidate, flag)` /
`isWithinProject` yardimcisi. Yolu resolve eder, `relative()` `..` veya
`/` ile baslarsa hata atar.

#### D1 — `npm audit`: 3 moderate (yalniz dev bagimliligi)

3 moderate uyari `esbuild`'de (transitively `vite` → `vitepress`). Hepsi
dev-only — docs site build icin kullanilir, npm tuketicilerine
gonderilmez. `fixAvailable: false` upstream. Burada belgelenmis,
herhangi bir kod degisikligi yok; `vitepress` zincirinde fix gelince
cozulecek.

### Eklendi — `tests/security-hardening.test.js`

11 yeni regression testi: `isValidSkillName` positive/negative, CLI
path-traversal reject, plugin `--` flag reject, tasarim `--write` scope
guard, secret-scan `--ignore-file`/`--patterns` scope guard ve O2
meta-check (`badi secret-scan` repo'da 0 finding).

### Istatistik

- Test: 915 → 934 (+19: +8 help-doctor, +11 guvenlik sertlestirme)
- help-doctor: ilk calistirmada 16 dosyada drift → 2 gercek fix + 5
  allowlist girisi (her birinde `_why:`); 0 aciklanamayan drift.
- guvenlik sertlestirme: 5 dosya degisti (skills.js, plugin.js,
  tasarim.js, secret-scan.js, test fixture); fix sonrasi audit 0/0
  KRITIK/YUKSEK, ORTA→1, DUSUK→1 (npm audit dev-only)

## [1.28.0] - 2026-05-16

### Duzeltildi — secret-scan: kritik CI silent-pass

`/review` denetimi sonrasi yapilan empirik probe'lar (sandbox proje icine
planted sirlar) ile secret-scan'da bes gercek bug bulundu. Iki tanesi
merge-blocker kritik; bu duzeltmeler olmadan `badi secret-scan --format
json` calistiran bir CI pipeline'i sizdirilmis sirlara ragmen **yesil
gecerdi**.

**K1 — JSON modu kritik bulgularda exit 0 dondurmaya devam etti.** JSON
ciktisi yolu `process.exit(1)` cagrisindan once `return` ediyordu. Empirik
dogrulandi: Anthropic key planted → text mode `exit 1`, JSON mode `exit 0`.
`if ! badi secret-scan --format json` kosulu olan CI'lar KRITIK bulguya
ragmen success aldi.

**K2 — Dedup anahtari ayni masked prefix/suffix paylasan farkli sirlari
collapse etti.** Ilk/son 4 karakteri ayni olan iki gercek OpenAI key tek
bulguya dustu; ikinci sizinti sessizce silindi. `/tmp/badi-probe` icinde
empirik dogrulandi. Dedup anahtari artik dosya yolu + ham match icerir.

**Y1 — `statSync` sembolik link'leri takip etti** — cycle riski
(`node_modules/.cache -> ../`) ve proje-disi path traversal. Symlink'ler
artik `entry.isSymbolicLink()` early-continue ile kosulsuz atlanir; sayim
JSON ciktisinda `scanned.symlinksSkipped` olarak gozukur.

**Y2 — `github-classic` regex `[a-f0-9]{40}` her SHA-1 hash'e match etti.**
Kod yorumlarindaki her git commit hash'i DUSUK false-positive tetikledi.
GitHub classic token'lari 2021'de deprecate edildi; fine-grained
`github_pat_[A-Za-z0-9_]{82}` formati ile KRITIK seviyede degistirildi.

**Y3 — Test kapsami** 4'ten 51 teste cikti: K1/K2 regression guard,
symlink handling, `--git` history scan, her PATTERNS girdisi icin canonical
sample, dedup-collision empirik reproduction.

### Eklendi — secret-scan: yapilandirilabilirlik + seffaflik

- `--exit-code <critical|strict|never>` — acik CI sozlesmesi:
  - `critical` (default): KRITIK + YUKSEK → exit 1 (eski davranis, artik JSON'da da)
  - `strict`: herhangi bir bulgu → exit 1
  - `never`: rapor ver ama her zaman exit 0
- `--max-commits N` — git tarihce siniri (default 100). Kesim oldugunda
  stderr'e uyari basar (eskiden sessizdi).
- `--max-files N` — dosya tarama siniri (default 5000).
- `--ignore id1,id2,...` — virgul-ayrik pattern-id allowlist.
- `--ignore-file <yol>` — `.secretignore` formatinda dosyadan pattern-id
  yukle (CWD'deki `.secretignore` otomatik kesfedilir).
- `--patterns <yol>` — kurum'a ozel custom pattern'leri JSON'dan yukle
  (yerlesik 17 pattern ile birlestirilir).
- JSON ciktisi `scanned.totalCommits`, `scanned.truncated`,
  `scanned.symlinksSkipped` alanlarini ekledi.
- `--help` cikis kodlarini, her flag'i, kapsam-disi unsurlari (stash,
  reflog, packed-refs) belgeler.

### Degisti — secret-scan: ic yeniden duzenleme

- Pattern registry `lib/data/secret-patterns.js`'e externalize (canonical),
  yeniden kullanim + gelecekte kullanici ozelestirmesi mumkun.
- `runSecretScan` saf yardimcilara bolundu (`scanContent`, `dedupFindings`,
  `applyIgnore`, `groupBySeverity`, `computeExitCode`, `printText`,
  `printJson`, `parseArgs`) — dogrudan unit test icin export edildi.
- `MAX_FILE_SIZE_BYTES`, `MAX_COMMITS_DEFAULT`, `GIT_SHOW_MAX_BUFFER` gibi
  magic number'lar isimli sabite cevrildi.

### Degisti — `/security-scan` slash komutu

- Tipografi drift'i duzeltildi (`Bagiml ilik`, `konfigur asyon`, `Taramas i` vb.).
- Yeni flag'leri + CI exit-code sozlesmesini + kapsam-disi unsurlari belgeler.
- `/secret-scan` slash komutu benzer sekilde guncellendi.

### Kirici?

Bu teknik olarak additive bir surum — text mode exit-code davranisi
degismedi (KRITIK/YUKSEK → 1, default). **JSON modu always-0'dan text mode
ile ayni davranisa gecer**. Bug'a guvenen bir CI pipeline'i bu surumde
bulgu cikartmaya baslayacaktir; eski always-0 davranisi icin
`--exit-code never` kullanin.

### Istatistik

- Test: 868 → 915 (+47 secret-scan testi; yeni suite'te toplam 51)
- `lib/` icinde 4 dosya degisti; 1 yeni (`lib/data/secret-patterns.js`)
- `.claude/commands/` icinde 1 dosya degisti

## [1.27.1] - 2026-05-16

### Duzeltildi — CLI yuzeylerinde help eksikligi

`badi <cmd> --help` ciktilarinin derin denetimi uc tur eksiklik ortaya
cikardi; hepsi kapatildi.

- **Top-level `badi --help`**: `aso` / `market` / `tasarim` satirlari
  tek birlesik satir olarak basiliyordu cunku `console.log` tek cagriya
  uc argumanla veriliyordu (bosluk koyar, newline koymaz). Uc ayri
  cagriya bolundu. (`bin/badi.js`)
- **`badi commands --help`** (v1.26+): `route "<prompt>"` alt komutu,
  stdin formu, profil flag'leri (`--yes` / `--dry-run` / `--force` /
  `--verbose`) ve route flag'leri (`--top N` / `--inject` / `--json`)
  help metninde yoktu — sadece switch statement biliyordu. Help metni
  artik kodun kabul ettiklerini yansitir, bes ornek calistirma ve
  profil degisikliginde kullanici komutlarinin korundugu notu eklendi.
  (`lib/commands/commands.js`)
- **`badi skills --help`** (v1.20+): `--top N` ve `--json` route
  flag'leri belgesizdi; kategoriler dipnotu "v1.25 / 50 kategori"de
  donuktu — v1.27 artik 62 kategori (25 genel + 25 `pentest-*` + 12
  `expo-*`). Ikisi de guncellendi. (`lib/commands/skills.js`)

Davranis degisikligi yok — bu doc-string duzeltmeleri. Gercek alt-komut
ve flag parsing zaten calisiyordu; sadece help metni geride kalmis. Test:
868 hala yesil.

### Degisti — README drift

1.27 release notes tablosu test sayisini `805 → 815` olarak listelemisti
(typo — gercek sayi 868'e zipladi cunku PR #163'te 53 hook fail-safe
resilience testi eklendi). README hero satirlari hala "50 opt-in skill
kategorisi" ve "805 onaylanmis test" diyordu. `README.md` + `README.tr.md`
icindeki dort yer duzeltildi. Yeni "Profil Bazli Komutlar + Komut Router"
alt bolumu eklendi — `badi commands profile/route` uctan uca belgelenmis
oldu (v1.26 release dedicated bir README bolumu olmadan cikmisti).

## [1.27.0] - 2026-05-15

### Eklendi — expo-* skill ailesi (12 kategori, advisory)

Mobile development yasam dongusu skill ailesi: Expo + React Native cross-
platform workflow — proje kurulumdan App Store / Play Store release'e
kadar. 12 yeni opt-in kategori `expo-*` namespace altinda.

**Kapsam**: advisory only. Badi yapilandirma + komut sirasi + trade-off
rehberlik eder; gercek build/submit/update komutlarini kullanici calistirir.

#### Kategoriler (12)

- `expo-orchestrator` — workflow secimi (managed/bare/dev-client), proje
  kurulum, paket secimi, EAS hesap baglanti, release planlama, alt
  skill'lere yonlendirme.
- `expo-router` — file-based routing (`app/` dizini), `_layout.tsx`,
  dinamik route, parallel route, deep linking, prefetch, tab/stack/drawer.
- `expo-eas-build` — `eas.json` profilleri, credentials (iOS provisioning
  + push cert; Android keystore + service account), build cache, secrets.
- `expo-eas-submit` — App Store Connect + Google Play submit, metadata,
  build artifact secimi, review notlari, phased release.
- `expo-eas-update` — OTA update, channels, runtime versions, branch
  yonetimi, rollback stratejisi, embedded vs OTA payload.
- `expo-config-plugin` — `withInfoPlist`, `withAndroidManifest`,
  `withDangerousMod`, mod compose, plugin testing.
- `expo-prebuild` — managed → bare gecisi, `npx expo prebuild`,
  ios/android dizini sahipligi, `.easignore`, native upgrade disiplini.
- `expo-modules` — Expo Modules API (Swift/Kotlin), `expo-module-scripts`,
  `requireNativeModule`, async function, view modul.
- `expo-dev-client` — setup, build profili, custom dev menu, runtime
  version uyumu, EAS Update entegrasyonu.
- `expo-notifications` — push token, FCM + APNs credentials, kategoriler,
  action button, scheduled notifications, channels, permission akisi.
- `expo-app-config` — `app.json` vs `app.config.ts`, env vars + EAS
  Secrets, variantlar, plugin chain, slug/scheme/bundle/version disiplini.
- `expo-troubleshooting` — Metro cache, version mismatch
  (`expo install --check`, `expo-doctor`), Pod install hatalari, Gradle
  daemon, native module conflicts, EAS log okuma.

### Degisti

- `lib/skills/stack-map.js` — mevcut `expo` entry'si `expo-orchestrator` +
  `expo-app-config` + `expo-troubleshooting` onerecek sekilde genisledi.
  6 yeni detection entry: `expo-eas` (eas.json), `expo-router`,
  `expo-modules`, `expo-notifications`, `expo-dev-client`,
  `expo-config-plugin`.

### Duzeltildi — hook defensive fail-safe (#162)

Tum 13 `.claude/hooks/*.mjs` dosyasi artik top-level
`uncaughtException` + `unhandledRejection` handler kaydeder; runtime
hatasinda zorla `exit(0)` doner. Claude Code session'i artik gecici
hook hatalari icin "Failed with non-blocking status code" uyarisi
gostermez. Hata mesajlarini stderr'a goruntulemek icin
`BADI_HOOK_DEBUG=1` env ile calistir.

Bu fix Node v25.x'te Stop hook async invocation'inda goruldu raporlanan
modul cozumleme hatasini yumusatir. Not: bu fix runtime hata
toparlanmasini guclendirir ama entry-point yukleme hatalarini (orn.
eksik dosya) yakalayamaz; hook dosyalarinin var oldugunu dogrulamak
icin `badi doctor` calistir.

### Testler

- Test sayisi: **805 → 868 (+63)**, hepsi yesil.
- Yeni `describe("detectStack: expo-* family (v1.27)")` blok 10 test.
- Yeni `tests/hooks-failsafe.test.js`: her hook icin bos/bozuk/gecerli
  stdin'de exit 0 dogrulamasi + marker kontrolu (53 test).

### Vault

- Toplam opt-in kategori: **50 → 62**.

## [1.26.0] - 2026-05-15

### Eklendi — Profil bazli komut yonetimi + prompt-aware komut routing

Token verimliligi ve DX hijyeni release'i. Badi'nin 77 slash komutunu
prompt-aware ve profil etiketli hale getiren uc entegre degisiklik.

#### A. Session profilleri (commands-vault)

- `.claude/commands-vault/` paralel canonical komut deposu.
- `badi commands migrate` mevcut `.claude/commands/`'i vault'a kopyalar.
- `badi commands profile <core|dev|content|pentest|all>` aktif profili
  degistirir. Profil disindaki komutlari `.claude/commands/`'tan kaldirir
  (vault dokunulmaz); geri donmek icin `badi commands profile all`.
- 77 komut dort profile etiketli:
  - **core** (21): oturum, olcum, audit — her zaman aktif.
  - **dev** (39): gelistirme, devops, security, audit araclari.
  - **content** (17): sosyal medya, marka, icerik takvimi.
  - **pentest** (0): yetkili pentest engagement (gelecek).
- Kullanici tanimli komutlara (COMMAND_PROFILES'ta olmayan) dokunulmaz.

#### B. Top 10 komut slim

En sisman 10 komut mekanik refactor ile %30 azaltildi, bilgi kaybi yok:

- `gorsel-brief`, `video-senaryo`, `icerik-takvimi`, `system-audit`,
  `karousel`, `icerik-uret`, `marka-sesi`, `api-doc`, `playbook`,
  `project-architect`.

#### C. Prompt-aware komut routing

- `badi commands route "<prompt>"` keyword match ile komut skorlar.
- `--inject` flag'i hafif ipucu blob'u uretir (komut adi + 1 satir
  aciklama; match basina ~30-50 token, full SKILL.md gövdesinin ~1.3K
  ile karsilastir).
- `UserPromptSubmit` hook'u (`.claude/hooks/skill-router.mjs`) artik
  hem `skills route` hem `commands route` cagiriyor. Sonuc: prompt'ta
  bir konu gectiginde (orn. "deploy", "Instagram post") Badi ilgili
  komut(lar)i sessizce oneriyor, tam govdesini yuklemiyor.

### Notlar — Token ekonomisi duzeltmesi

`badi ai token` POTANSIYEL tavani raporlar (tum dosya boyutlari toplami),
gercek per-turn yuklenen token degil. Claude Code `.claude/commands/`'i
sadece slash invocation'da yukler; sistem prompt'una sadece kisa
aciklamalar girer. v1.26 ikisini de optimize ediyor:
- **Baseline**: profile switch kullanici disi komut aciklamalarini cikarir.
- **Invocation**: top 10 komut gövdesi %30 daha kucuk.
- **DX**: `/` menusu daha az kalabalik; sadece ilgili komutlar onerilir.

### Testler

- Test sayisi: **774 → 805 (+31)**, hepsi yesil.

## [1.25.0] - 2026-05-15

### Eklendi — pentest-* skill ailesi (25 kategori, advisory/defensive)

Yetkili penetration testing engagement disiplini icin **25 yeni opt-in
skill kategorisi**. Recon'dan rapor'a kadar tum engagement akisi:
scope declaration, OPSEC tagging, evidence chain of custody, MITRE
ATT&CK mapping, CVSS scoring, remediation roadmap.

**Onemli**: bu aile **advisory/defensive only** — live exploit yok,
payload crafting yok, C2 operasyon yok. Metodoloji, analiz, planning,
detection rule yazimi, raporlama dahildir. Aktif exploit icin baska
yetkili pentest tool kullanin.

Aile, [pentest-ai-agents] (MIT) projesinin engagement-disiplin modelini
(scope-guard, OPSEC tagging QUIET/MODERATE/LOUD, hard refusal listesi)
Badi opt-in skill vault formatina uyarlar.

[pentest-ai-agents]: https://github.com/0xSteph/pentest-ai-agents

#### Kategoriler (25)

**Orkestrasyon + planlama**: `pentest-orchestrator`, `pentest-engagement`,
`pentest-threat-model`, `pentest-opsec-evidence`

**Recon + degerlendirme**: `pentest-recon`, `pentest-bugbounty`,
`pentest-ctf`

**Domain metodoloji** (advisory): `pentest-web`, `pentest-api`,
`pentest-bizlogic`, `pentest-ad`, `pentest-cloud`, `pentest-mobile`,
`pentest-wireless`, `pentest-cicd`, `pentest-social`, `pentest-llm`,
`pentest-privesc`, `pentest-credentials`

**Defansif muhendislik**: `pentest-detection`, `pentest-forensics`,
`pentest-malware`, `pentest-stig`

**Zincir + rapor**: `pentest-exploit-chain`, `pentest-report`

#### Stack tespit entegrasyonu

`lib/skills/stack-map.js`'e 3 yeni entry — pentest engagement
artifact'lari icin:

- `pentest-engagement` — `scope.md` / `scope.txt` / `roe.md` /
  `findings.db` / `targets.txt` / `engagements/` / `evidence/` →
  orchestrator + engagement + report + threat-model + opsec-evidence
- `pentest-recon-output` — `.nmap` / `.gnmap` / `.nessus` uzantilari →
  orchestrator + recon
- `pentest-web-tooling` — `nuclei.yaml` / `nuclei-templates/` /
  `burp-project.json` → orchestrator + web + api + recon

Pentest engagement dizini icinde `badi skills detect` calistir, aile
manuel konfig olmadan oneriliyor.

#### Testler

`tests/stack-detector.test.js`'e 6 yeni test (scope file, engagements
dir, findings.db, .nmap output, nuclei config, negatif kontrol).

#### Vault buyuklugu

Vault 25 → 50 kategori. Tum `pentest-*` opt-in modelinde — aktive
edilene kadar sifir token maliyeti (`badi skills add pentest-<ad>` veya
`badi skills auto-install`).

## [1.24.0] - 2026-05-14

### Eklendi — `badi skills detect` + `badi skills auto-install` (#152)

[midudev/autoskills](https://github.com/midudev/autoskills)'ten esinlenen
**stack-bilen skill curation**. `badi skills` ailesi altinda iki yeni
alt-komut:

- `badi skills detect` — proje koku taranir (package.json deps, config
  dosyalari, dosya uzantilari, manifest anahtarlari, npm scripts),
  onerilen skill kategorileri listelenir. Read-only.
- `badi skills auto-install [--yes|--dry-run]` — detect + interaktif
  onay + opt-in aktivasyon. Idempotent; sadece zaten aktif olmayan
  kategorileri kopyalar.

Mimari notu: Badi'de zaten runtime auto-router var (`lib/skills-router.js`,
v1.20+) — her prompt'a gore skill secer. Bu surum onun karsiligi olarak
**install-time** katmani ekler. Auto-router "bu prompt'a hangi skill
uyuyor?" sorusuna cevap verir; `auto-install` ise "bu proje icin hangi
skill'leri kurulu tutmaliyim?" sorusuna. Iki katman bagimsiz.

Desteklenen stack'ler (35+): React, Vue, Svelte, Angular, Next.js, Nuxt,
Astro, Remix, Tailwind, shadcn/ui, React Native, Expo, Flutter, Swift,
Kotlin, Express, Hono, NestJS, Fastify, TypeScript, Go, Rust, Python,
Ruby, Prisma, Drizzle, Supabase, Stripe, Clerk, Better Auth, Vitest,
Jest, Playwright, Cypress, Docker, Terraform, GitHub Actions, Vercel
AI SDK, OpenAI, Anthropic, LangChain, Shopify, WooCommerce, Resend,
Nodemailer, Remotion.

### Guvenlik/UX sertlestirme — review bulgulari (#152)

PR icindeki `/review` 8 bulgu cikardi, hepsi merge oncesi kapatildi:

- Non-TTY `auto-install` `--yes` olmadan `exit 1` doner (eskiden sessiz
  `0` idi — CI bypass riski)
- "Stack tespit edildi ama vault'ta uygun kategori yok" ayri bir mesaj
  gosterir (eskiden yaniltici "tum skill'ler zaten aktif" diyordu)
- `configDirs` yeni alan, `configFiles`'tan ayri; root dizin eslesmesi
  `isDirectory()`, dosya eslesmesi `isFile()` ister (eskiden permissive
  `readdirSync`)
- `prisma` ve `.github` `configFiles`'tan (yanlis) `configDirs`'e tasindi
- `detectStack` `readdirSync(root)`'u cagri basina bir kez cache'ler
  (kural basina degil — ~80 → 1 syscall)
- Bos `Enter` artik otomatik onay yok; prompt `[e/H]` (default explicit
  no)
- Swift/Kotlin tespiti `.swift`/`.kt` root dosyasinin otesinde
  Podfile/Package.swift/AndroidManifest.xml + `ios/`/`android/` dizin

### Test

- Toplam: 727 → 768 (+41 yesil)
- `tests/stack-detector.test.js` (32 test) — birim: globToRegex,
  readPackageJson, matchAnyFile, evaluateDetect, detectStack 10 stack
  senaryosu + idempotency + configDirs/configFiles kind dogrulamasi
- `tests/cli.skills.auto.test.js` (9 test) — subprocess: detect,
  dry-run, --yes, idempotency, non-TTY exit-1, --yes+--dry-run,
  no-vault-match, help

## [1.23.0] - 2026-05-11

### Guvenlik — XSS guard + tooltip DOM API `badi kb graph` (#149)

`renderHtml` `JSON.stringify` ciktisini dogrudan inline `<script>` bloguna
gomuyordu. Bir markdown H1 basligi `</script>` icerirse script tag erken
kapanip DOM-XSS olusturabilirdi. Artik `<` karakteri Unicode escape ile
gizleniyor ve hover tooltip `innerHTML` yerine `textContent` + DOM API
kullaniyor. Regression test eklendi.

### Performans — `buildGraph` O(n²) → O(1) link cozumu (#149)

`resolveLink` her link icin tum dosya listesini tariyordu (`includes` +
per-call `basename` map). 1000+ dosyali workspace'lerde gorunur gecikme
yaratiyordu. `buildGraph` simdi basta `Set<file>` + `Map<basename → paths>`
on-hesaplamasi yapiyor, sabit zamanli lookup. Ayni pass'te `safeRead`
sonuclari da cache'leniyor — her dosya 2 kez yerine 1 kez okunuyor.

### Degistirildi — Review sertlestirmeleri (#149)

#147 review'sundan kucuk takipler:

- `gh` `spawnSync` `maxBuffer` 50 MB'a yukseltildi (default 1 MB idi)
- `detectRepo` tek regex'e indirildi, 6 variant testi eklendi
- `extractLinks` URL icinde nested paren tolere ediyor
  (`[w](https://x.com/Foo_(bar))` artik tek link)
- `subSync` dry-run notu header altina alindi
- `subSync` repo fallback string'i: `(otomatik tespit basarisiz)`

### Eklendi — `badi kb` bilgi grafigi (#12 MVP)

Yeni `badi kb` alt-komut ailesi. `.claude/` icindeki markdown link ve
wikilink desenlerinden yonlu graf insa eder:

- `badi kb graph` — `.claude/workspace/knowledge-graph.html` self-
  contained dosya uretir; vanilla SVG force-directed layout
  (drag-to-pin, mouse-wheel zoom, pan, hover tooltip). **Sifir CDN
  bagimliligi** — offline calisir.
- `badi kb backlinks <dosya>` — bir dosyaya gelen referanslar
- `badi kb orphans` — referans almayan dosyalar
- `badi kb stats` — toplam + en cok referanslanan + tur dagilimi

Wikilink (`[[dosya]]`, `[[dosya|alias]]`) ve markdown link
(`[m](./yol.md)`) yakalanir. Eksternal URL'ler (`https:`, `mailto:`,
`tel:`, `#`) ve anchor'lar atlanir. 11 dosya turu icin renk paleti
(memory, knowledge, workspace, agent, command, skill, output-style,
agent-memory, daily, adr, other).

Atlanan dizinler: `skills-vault`, `backups`, `node_modules`, `.git`,
`logs`. `knowledge-graph.html` git-ignored.

#12 scope'unda gelecek: `--topic` filtresi, `--open` tarayicida
otomatik ac, `--strict` kirik-link exit, incremental cache.

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
