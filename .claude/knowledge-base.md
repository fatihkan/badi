# Bilgi Tabani

> Tum ajanlar bu dosyayi oturum basinda okur.
> Yalnizca Denetci (Auditor) onayladiginda yazilir.
> Kaynagi belirtilmeyen kayit girilmez.

## Kaynak Hiyerarsisi
1. **Kullanici mudahalesi** — tarihli, en yuksek oncelik
2. **Ampirik** — denenerek dogrulanan kural
3. **Agent cikarimi** — ajanin gozlemledigini Denetci onayladi

---

## Kesin Kurallar
<!-- Kullanici tarafindan dogrudan belirlenmis kurallar -->

## Platform ve Arac Kurallari
<!-- Arac/platform ile ilgili ogrenilen kurallar -->

## Proje Kaliplari
<!-- Projede tekrar eden yapi/kaliplar -->

### Skill ailesi eklemede "advisory/defensive" siniri
Pentest, security, exploit gibi alanlarda yeni skill ailesi eklerken
Badi yalnizca **advisory/defensive** kapsamla sinirli kalir. Live exploit
execution, payload crafting, C2 operation, weaponization gibi aktif
saldiri yetenekleri vault'a EKLENMEZ — bunlar icin yetkili pentest tool
kullanilir. Skill icerigi: scope-deklare disiplini, OPSEC tagging,
metodoloji, output analizi, raporlama, detection rule yazimi.
[Kaynak: 2026-05-15 pentest-* aile karari]

### `badi ai token` POTANSIYEL raporlar, gercek per-turn yuk degil
Claude Code `.claude/commands/*.md`'yi sadece slash invocation'da yukler;
sistem prompt'una sadece kisa aciklama girer. `.claude/agents/*.md` Agent
tool cagrildiginda yuklenir. `.claude/references/`, `.claude/memory.md`,
`.claude/knowledge-base.md` Claude Code tarafindan otomatik yuklenmez.
Buna gore "88K token kullaniliyor" ifadesi yanltir — bu POTANSIYEL tavan,
gercek baseline ~3-5K (CLAUDE.md + komut/agent advertisement). Token
optimizasyonu uc katmanda planlanmali: baseline (sistem prompt'taki
aciklamalar), invocation cost (komut gövdesi), DX (menu kalabaligi).
[Kaynak: 2026-05-15 v1.26 olcum dogrulamasi]

### STACK_MAP entry kalibi: tek tespit, cok skill
`lib/skills/stack-map.js` icinde bir entry birden cok skill onerebilir.
Komponent / aile bazli skill curation icin: ana tespit dosyasi
(scope.md, findings.db gibi) -> 4-5 skill paketi oneren tek entry yaz.
Bu, kullanicinin `badi skills auto-install` ile bir hamlede ilgili
tum kategorileri aktive etmesini saglar.
[Kaynak: 2026-05-15 pentest-engagement entry tasarimi]

## Bilinen Hata Kaliplari
<!-- Daha once karsilasilan ve cozulen hatalar -->

### GitHub squash merge "Closes" referansi her zaman calismaz
PR body'sindeki `Closes #X #Y #Z` referanslari squash merge sirasinda GitHub
tarafindan parse edilmedigi durumlar olur (3+ issue listesinde belirgin).
Tespit edilen: v1.30.0 PR #182 (#178-181 acik kaldi), v1.31.0 PR #193
(#189-191 acik kaldi — #188 ve #192 kapanmis, kararsiz davranis). Cozum:
yayindan sonra `gh issue list --state open` kontrolu + manuel
`gh issue close N` ile kapat. Wrap-up checklistine ekle.
[Kaynak: 2026-05-22 v1.31.0 yayin pattern tekrari]

### ESM module hem programatik hem CLI: import.meta.url tespiti
`lib/commands/X.js` hem `export function runX()` ile programatik hem de
`node lib/commands/X.js` ile CLI olarak calistirilmasi gerekiyorsa, dosya
sonuna su deyimi ekle:
```js
if (import.meta.url.startsWith("file:") && process.argv[1] &&
    import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  runX(process.argv.slice(2));
}
```
Yalniz `node lib/commands/X.js` ile cagrildiginda calisir, `import`
edildiginde no-op. v1.31.0 K1 hotfix bu pattern'i secret-scan'e uyguladi
(badi security baseline'in calismasi icin gerekti).
[Kaynak: 2026-05-22 v1.31.0 K1 hotfix]

### Hook komutlari $CLAUDE_PROJECT_DIR'e SABITLENMELI — goreli yol alt-dizinde kirilir
`settings.json`'da hook komutu goreli yazilirsa (`node .claude/hooks/X.mjs`),
Claude Code bunu hook calistigi andaki **cwd**'ye gore cozer, proje koksune
gore DEGIL. Claude bir badi projesinin **alt dizininden** baslatilinca (monorepo
alt-paketi gibi) her hook `Cannot find module '.../<altdizin>/.claude/hooks/X.mjs'`
ile patlar — dosya proje kokunde, goreli yol oraya ulasamaz. Cozum: tum hook
komutlarini `node "$CLAUDE_PROJECT_DIR/.claude/hooks/X.mjs"` ile yaz (plugin-variant:
`$CLAUDE_PLUGIN_ROOT`). statusline.js + marketplace-manifest.js zaten boyleydi;
ana settings template'i + skills.js skill-router geride kalmisti. Doctor'a
"project-root anchored" kontrolu eklendi (findRelativeHookCommands, pure+export).
Mevcut kurulumlar `badi update` ile fix'i alir.
[Kaynak: 2026-06-20 v1.34.2, e-meta/metaflow alt-dizin MODULE_NOT_FOUND raporu]

## Surec Kaliplari
<!-- Calistigi denenmis ve dogrulanmis surecler -->

### Internal /review hotfix BEFORE npm publish — 3 release tekrar
Pattern v1.30.0 (PR #183 11 bulgu), v1.30.1 (PR #186 9 bulgu), v1.31.0
(commit 6132e44 13 bulgu) ile **3 kez** ardarda calisti. Kanonik akis:
1. Feature PR ac (issue'lardan ureilen scope)
2. PR uzerine `/review` calistir (3 kanal: sec+perf+arch)
3. Bulgulari ayni release branch'inde hotfix commit ile kapat
4. Squash merge → main
5. `badi publish --version <bump>` → npm yayin
6. Release notes zenginlestir + memory marker chore PR

Avantaj: tek release'de hem feature hem cleanup, npm latest "bug-free"
versiyon olur. Dezavantaj: PR review yuku surekli ust uste binebilir.
[Kaynak: 2026-05-22 v1.31.0 ile 3. tekrar — pattern olgunlasmis]

### lastUpdated stale-check semantigi: per-commit DEGIL per-package.json
Marketplace manifest'te `lastUpdated` field eklerken, "her commit'te
degisir" yerine "package.json commit'inde degisir" davranisi tercih edilmeli
(`git log -1 --format=%cI -- package.json`). Sebep: release sync-manifest
calismadan onceki commit'lerde stale check noise olmaz; yalniz version
bump sonrasi manifest stale olur. v1.31.0'da uygulandi.
[Kaynak: 2026-05-22 marketplace-manifest.js lastPackageJsonCommitDate()]

### Hook output protocol 3-kategorize audit kalibi
Anthropic Claude Code 2.1.139 ile hook isolation gereksinimi geldi. Audit
calistirilirken her hook su 3 kategoriden birine atanir:
- Kategori 1: JSON output protocol (`writeDecision`, `writeContextInjection`)
  veya log-only — guvenli
- Kategori 2: Plain text stdout protokol ihlali — fix gerek (kayboluyor
  ya da terminal'e dusuyor)
- Kategori 3: ANSI escape / cursor manipulation — tehlikeli, derhal fix
Audit raporu `docs/hooks/isolation-audit.md` formatinda tutulur, her hook
icin tablo satir + fix kayit. v1.31.0'da 15 hook icin uygulandi.
[Kaynak: 2026-05-22 docs/hooks/isolation-audit.md]

### manifest lastUpdated artik stale-lik kapisi DEGIL (PR #197 ile cozuldu)
Eskiden `isManifestStale` `lastUpdated`'i de deep-equal kiyasliyordu; `lastUpdated`
`git log -1 --format=%cI -- package.json`'a bagli oldugu icin package.json'u
degistiren her commit (ozellikle squash) manifest'i yanlis "stale" gosteriyordu
(v1.30.1, v1.31.0/PR #195, #199->#200 ile 3 kez yasandi). Fix (PR #197):
`lastUpdated` salt-bilgi kabul edildi ve `isManifestStale` karsilastirmasindan
**dislandi** — stale-lik artik yapisal icerige (agent/komut/hook/aciklama) bakar.
Sonuc: package.json degisiklikleri (version bump dahil) ayri manifest-only sync
GEREKTIRMEZ; publish tek commit'te manifest yazabilir. lastUpdated yine "son
guncelleme" gosterimi icin yazilir (toISOString).
[Kaynak: 2026-05-29 PR #197 review K1/O1 fix; eski gotcha #199->#200]

### Lint/markdown CI-release'de gate degil — manuel calistir
`npm test` release/CI gate'idir ama `biome check` (lint/format) ve `remark`
(markdown) gate degil; rot birikir (bakim turunda 19 lint hatasi bundan cikti).
Kod degisikligi sonrasi `npm run lint` calistir, release oncesi temizle. Kalici
cozum: `release.js` CHECKS array'ine biome lint check eklenebilir (acik gorev O1).
[Kaynak: 2026-05-29 T3 denetim O1]

### Token-only rename: grammar degisir, ic adlar kalir
Kullanici-yuzeyi rename'lerinde (komut/alt-komut/flag) yalniz dispatch'teki
token string'leri degistir; fonksiyon adlari (runBasla), kaynak dosya adlari
(basla.js) ve workspace veri dizinleri (takvim/, gorseller/) AYNEN kalir —
gerekirse tek bir token->dir map (template.js: visual->gorseller). Bu, ~300
referansli v1.32 grammar rename'ini sifir veri-migrasyonuyla guvenli kildi.
Dikkat: veri DOSYASI adlari da korunur (marka-sesi.md) — ref-sweep regex'i
`/marka-sesi` slash-komut kalibini dosya YOLUNDA da eslestirebilir (path'te
de `/` var); workspace yollarini sweep'ten once dislamali ya da sonrasinda
`workspace/content-*` grep'iyle dogrulanmali (v1.32'de QA bu bozulmayi yakaladi).
[Kaynak: 2026-06-04 PR #227/#228 + marka-sesi path regresyonu]

### zsh: unquoted $VAR kelime-BOLMEZ — coklu-dosya komutlarinda acik glob
Bash'in aksine zsh, unquoted `$FILES` parametresini bosluk/newline'da bolmez;
`perl -i ... $FILES` tum listeyi TEK dosya adi sanip sessizce basarisiz olur
(exit 0 gorunebilir, hicbir dosya degismez). Cozum: acik glob argumanlari
(`lib/commands/icerik/*.js`), `${=VAR}` ya da xargs. v1.32 sweep'lerinde 3 kez
sessiz-basarisizlik yasandi; her sweep sonrasi dogrulama grep'i sart.
[Kaynak: 2026-06-04 v1.32 rename sweep'leri]

### /team kapi zinciri: strateji+QA kapilari somut hata yakaliyor
v1.32'nin 4 buyuk fazi /team ile yurudu (strateji->plan->build->QA->ship).
Somut kazanimlar: strateji kapisi aso-helpers Turkce stopword'lerinin VERI
oldugunu tespit edip ceviriyi engelledi; QA iterate-until-clean dongusu 78
lockstep test kirigini, marka-sesi path bozulmasini ve test-kaynakli profil
mutasyonunu (aktif 38'e dusmus -> profile all --yes ile 82'ye restore) yakaladi.
Komut grammar gibi genis-yuzeyli isler icin varsayilan calisma bicimi olmali.
[Kaynak: 2026-06-04 PR #224-#230 /team kosulari]

### Enjekte-edilen test degeri, bozuk uretici fonksiyonu GIZLER
docs-sync kapisi README sayisini ctx.actualTests'e karsi dogruluyordu; 4 unit
test actualTests'i ELLE enjekte ettigi icin yesildi — ama gercek uretici
(runNpmTest) hicbir zaman calismiyordu: TAP `# pass N` ariyordu, runner ise
SPEC `ℹ pass N` basiyor (node --test default reporter). t.passed hep null ->
kapi production'da OLU kod. Ders: bir tuketici-fonksiyonu test ederken degeri
enjekte ediyorsan, URETICIYI de ayri test et (parse/IO sinirini), yoksa yesil
suite kirigi gizler. Ek: test ciktisi parse eden kod iki reporter formatini
da okumali (parseTestSummary, glyph-agnostik anchor). Iki tur /code-review'in
ikincisi yakaladi — kendi fix'ini de denetle.
[Kaynak: 2026-06-14 PR #278 self-review, v1.34.1]
