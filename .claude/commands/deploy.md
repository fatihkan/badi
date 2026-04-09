Dagitim kontrol listesi. Dagitim oncesi tum gereksinimleri dogrular ve hazirlik raporu olusturur.

# Gerekli Araclar
- Bash (git komutlari, test calistirma, ortam degiskeni kontrolu)
- Read (konfigur asyon dosyalari, changelog)
- Grep (kod ve konfigur asyon taramasi)
- Glob (dosya tespit)
- Write (dagitim manifesti olusturma)

# Onemli Not
Bu komut dagitimi kendisi YAPMAZ. Dagitima hazir olunup olunmadigini degerlendirir
ve nihai karari kullaniciya birakir.

---

## Bolum 1: On Dagitim Dogrulama

### Adim 1: Test Suite Kontrolu
- Tum test suite'ini calistir (veya son CI sonucunu kontrol et)
- Basarisiz test var mi belirle
- Test kapsam oranini raporla
- Sonuc: GECTI / BASARISIZ (basarisiz test sayisiyla birlikte)

### Adim 2: Kritik Denetim Bulgusu Kontrolu
- `audit-trail.md` dosyasini oku (mevcutsa)
- Son dagitimdan bu yana T0 (kritik) bulgu var mi kontrol et
- Cozulmemis guvenlik uyarilari var mi tara
- Sonuc: TEMIZ / ENGEL_VAR (detaylarla birlikte)

### Adim 3: Changelog Dogrulamas i
- `CHANGELOG.md` dosyasinin guncellenip guncellenmedigini kontrol et
- Son commit'ten bu yana changelog giris i eklenmi s mi dogrula
- Eksikse `/changelog` komutunun calistirilmasini oner
- Sonuc: GUNCEL / EKSIK

---

## Bolum 2: Ortam Degiskeni Dogrulamas i

### Adim 4: Env Dosyalari Karsilastirmasi
- `.env.example` veya `.env.template` dosyasini oku
- Tanimlanmasi gereken degiskenleri listele
- Produksiyon ortaminda eksik olabilecek degiskenleri tespit et

### Adim 5: Hassas Deger Kontrolu
- Kod icinde sabit kodlu ortam degeri olup olmadigini tara
- `TODO` veya `FIXME` iceren ortam referanslarini bul
- Debug modunun kapali oldugunu dogrula (NODE_ENV, DEBUG, vb.)
- Sonuc: GUVENLI / UYARI (bulgularla birlikte)

---

## Bolum 3: Veritabani Goc Durumu

### Adim 6: Migrasyon Kontrolu
- Bekleyen migrasyon dosyalarini tespit et
- Migrasyon sirasinin tutarli oldugunu dogrula
- Geri alinabilir migrasyonlarin rollback dosyalarinin varligini kontrol et
- Son uygulanan migrasyon ile mevcut migrasyon dosyalarini karsilastir

### Adim 7: Sema Uyumlulugu
- Kirilma potansiyeli olan sema degisikliklerini tespit et (sutun silme, tip degisikligi)
- Geriye uyumluluk risklerini belirt
- Sonuc: UYUMLU / RISKLI / UYGULANACAK_YOK

---

## Bolum 4: Dagitim Manifesti

### Adim 8: Degisiklik Ozeti Olustur
Son dagitimdan (son etiket veya belirtilen commit) bu yana:
- Degisen dosya sayisi: `git diff --stat [son-etiket]..HEAD`
- Yeni eklenen dosyalar
- Silinen dosyalar
- Degisen modullerin listesi
- Katki saglayan gelistiriciler

### Adim 9: Manifest Dosyasi Yaz
`deploy-manifest-[tarih].md` dosyasi olustur:
```markdown
# Dagitim Manifesti - [GG.AA.YYYY]

## Surum Bilgisi
- Onceki: [son etiket]
- Simdiki: [HEAD commit hash]
- Commit Sayisi: [sayi]

## Degisiklik Ozeti
- [kategori]: [aciklama]
...

## Veritabani Degisiklikleri
- [migrasyon adi]: [aciklama]
...

## Ortam Degiskeni Degisiklikleri
- [yeni/degisen degiskenler]
...
```

---

## Bolum 5: Dagitim Sonrasi Smoke Test Plani

### Adim 10: Test Plani Olustur
Degisikliklere gore smoke test kontrol listesi hazirla:
- Kritik kullanici yollari (login, ana islevler)
- Degisen API endpoint'leri
- Veritabani baglantisi dogrulama
- Dis servis entegrasyonlari
- Performans spot kontrolleri

---

## Cikti: Dagitim Hazirlik Raporu

### Adim 11: Nihai Degerlendirme
```
╔════════════════════════════════════════════╗
║       DAGITIM HAZIRLIK RAPORU              ║
║       Tarih: [GG.AA.YYYY]                 ║
╠════════════════════════════════════════════╣
║                                            ║
║  Testler:           [GECTI/BASARISIZ]      ║
║  Denetim Bulgusu:   [TEMIZ/ENGEL_VAR]     ║
║  Changelog:         [GUNCEL/EKSIK]         ║
║  Ortam Degiskeni:   [GUVENLI/UYARI]        ║
║  Veritabani Goc:    [UYUMLU/RISKLI]        ║
║                                            ║
╠════════════════════════════════════════════╣
║                                            ║
║  >>> ONERI: [GIT / GITME]  <<<             ║
║                                            ║
║  [GIT ise] Dagitima hazir.                 ║
║  [GITME ise] Engeller:                     ║
║    - [engel 1]                             ║
║    - [engel 2]                             ║
║                                            ║
╚════════════════════════════════════════════╝
```

### GIT/GITME Kriter Tablosu
- GIT: Tum kontroller GECTI/TEMIZ/GUNCEL/GUVENLI/UYUMLU
- GITME: Herhangi bir kontrol BASARISIZ/ENGEL_VAR/RISKLI
- Istisnai GIT: Sadece EKSIK changelog veya UYARI ortam degiskeni varsa, kullanici onayiyla GIT verilebilir
