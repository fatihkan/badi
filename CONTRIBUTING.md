# Katki Rehberi

Badi'ye katki yapmak istediginiz icin tesekkurler!

## Hizli Baslangic

```bash
git clone https://github.com/fatihkan/badi.git
cd badi
npm install
npm test        # 105 testin gectigini dogrula
npm link        # Global olarak test et
```

## Nasil Katki Yapilir

1. Repoyu fork'layin
2. Feature branch olusturun: `git checkout -b feature/ozellik-adi`
3. Degisikliklerinizi yapin
4. Testleri calistirin: `npm test`
5. Commit: `git commit -m "feat: aciklama"`
6. Push: `git push origin feature/ozellik-adi`
7. PR acin

## Proje Yapisi

```
bin/badi.js          Giris noktasi (thin entry point)
lib/                 ESM modulleri
  cli.js             Paylasilan araclar (chalk, figlet, VERSION)
  helpers.js         Yardimci fonksiyonlar
  update-check.js    Surum kontrol
  icerik-helpers.js  Icerik yardimcilari
  commands/          Komut modulleri (init, update, doctor, list, plugin, completion, schedule, stats, icerik)
  templates/         TR/EN sablon uretecleri
.claude/
  agents/            Ajan tanimlari (.md)
  commands/          Slash komutlar (.md)
  hooks/             Shell hook scriptleri (.sh)
  skills/            Beceri kutuphanesi
tests/               Node.js native test runner
```

## Commit Mesaji Formati

```
feat: yeni ozellik
fix: hata duzeltme
perf: performans iyilestirme
refactor: kod yeniden duzenleme
docs: dokumantasyon
test: test ekleme/guncelleme
chore: bakim isleri
```

## PR Kontrol Listesi

- [ ] `npm test` — 105 test geciyor
- [ ] `npm run lint` — Biome hata vermiyor
- [ ] Yeni ozellik icin test yazildi
- [ ] Turkce icerik kalitesi korundu
- [ ] Hassas veri commit edilmedi (.env, credentials)
- [ ] CHANGELOG.md guncellendi (ozellik eklemeleri icin)

## Yeni Ajan Ekleme

`.claude/agents/ajan-adi.md` dosyasi olustur:

```markdown
---
name: ajan-adi
description: Kisa aciklama
model: sonnet
tools: [Read, Grep, Glob, Bash]
---

Detayli ajan talimatlari...
```

## Yeni Komut Ekleme

`.claude/commands/komut-adi.md` dosyasi olustur. Ilk satir komut aciklamasi olmali.

## Yeni Hook Ekleme

1. `.claude/hooks/hook-adi.sh` olustur (chmod +x)
2. `.claude/settings.json`'a kaydet
3. `lib/commands/doctor.js`'deki `expectedHooks` listesine ekle

## Sorular?

Issue acin veya PR uzerinden tartisalim.
