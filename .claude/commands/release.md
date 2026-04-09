Surum notlari olusturma komutu. Degisiklikleri 3 farkli hedef kitleye uygun formatta derler.

# Gerekli Araclar
- Bash (git log, git tag, diff)
- Read (commit mesajlari, PR aciklamalari)
- Grep (degisiklik taramasi)
- Write (surum notu dosyalari)

# Prosedur (5 Adim)

### Adim 1: Aralik Belirle
- Son release tag'ini bul: `git describe --tags --abbrev=0`
- Mevcut HEAD ile arasindaki farki hesapla
- Commit araligini belirle: `git log [son-tag]..HEAD`
- Etkilenen dosya ve modulleri listele

### Adim 2: Veri Topla
Her commit icin bilgi derle:
- Commit mesaji ve aciklamasi
- Iliskili PR numaralari
- Degisen dosyalar ve satirlar
- Yazar bilgisi
- Iliskili issue veya gorev numaralari

### Adim 3: Degisiklikleri Siniflandir
Conventional Commits veya proje kuralina gore kategorilere ayir:

**Yeni Ozellikler (feat):**
- Yeni eklenen islevler
- Yeni API endpointleri
- Yeni kullanici arayuzu bilesenleri

**Hata Duzeltmleri (fix):**
- Cozulen hatalar
- Performans duzeltmleri
- Guvenlik yamalari

**Kirilma Degisiklikleri (BREAKING):**
- API degisiklikleri
- Veritabani sema degisiklikleri
- Konfigur asyon degisiklikleri
- Kaldirilmis ozellikler

**Iyilestirmeler (improve):**
- Performans iyilestirmeleri
- UX iyilestirmeleri
- Kod kalitesi iyilestirmeleri

**Altyapi (infra):**
- CI/CD degisiklikleri
- Bagimlilik guncellemeleri
- Dokumantasyon

### Adim 4: 3 Versiyon Yaz

**Versiyon A: Teknik Surum Notu**
- Tam degisiklik listesi kategorilere gore
- Kirilma degisiklikleri ve migrasyon talimatai
- API degisiklikleri detayi
- Bilinen sorunlar
- Commit hashleri ve PR referanslari

**Versiyon B: Pazarlama Surum Notu**
- Kullanici odakli dilde yeni ozellikler
- Fayda ve deger vurgusu
- Ekran goruntuleri veya gorseller icin yer tutucular
- Cagri aksiyonu (call to action)

**Versiyon C: Yonetici Ozeti**
- 3-5 maddelik ust duzey ozet
- Is etkisi vurgusu
- Risk ve dikkat gerektiren maddeler
- Sonraki surum planina bakis

### Adim 5: Dosyalari Kaydet
`releases/` dizini altinda kaydet:
- `releases/v[VERSIYON]-teknik.md`
- `releases/v[VERSIYON]-pazarlama.md`
- `releases/v[VERSIYON]-yonetici.md`

# Cikti Formati
```
=== BADI SURUM NOTLARI ===
Versiyon: v[VERSIYON]
Onceki: v[ONCEKI]
Aralik: [commit sayisi] commit

Degisiklik Ozeti:
- Yeni Ozellik: [sayi]
- Hata Duzeltme: [sayi]
- Kirilma Degisikligi: [sayi]
- Iyilestirme: [sayi]
- Altyapi: [sayi]

Olusturulan Dosyalar:
1. releases/v[VERSIYON]-teknik.md
2. releases/v[VERSIYON]-pazarlama.md
3. releases/v[VERSIYON]-yonetici.md
============================
```
