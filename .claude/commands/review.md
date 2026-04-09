Derin kod incelemesi komutu. Guvenlik, performans ve mimari boyutlariyla kapsamli kod analizi yapar.

# Gerekli Araclar
- Read (kod okuma)
- Grep (kalip arama)
- Glob (dosya taramasi)
- Bash (git diff, analiz araclari)

# Prosedur (4 Adim)

### Adim 1: Kapsam Tanimla
Incelenecek kodu belirle:
- **PR/Commit:** `git diff` ciktisini al (branch veya commit hash ile)
- **Dosya:** Belirli dosya veya dosyalar
- **Modul:** Bir ozellik veya modul dizini
- **Degisiklik Kumesi:** Son N commitin degisiklikleri

Kapsam bilgisini kaydet:
- Dosya sayisi
- Degisen satir sayisi (eklenen/silinen)
- Etkilenen moduller

### Adim 2: Kod Oku
- Tum degisiklikleri dikkatli oku
- Baglam icin cevredeki kodu da incele
- Ilgili test dosyalarini bul ve oku
- Etkilenen API'leri veya arayuzleri kontrol et

### Adim 3: Paralel Analiz (3 Kanal)

**Kanal A: Guvenlik Analizi**
- Girdi dogrulama eksiklikleri
- SQL/NoSQL injection riskleri
- XSS ve CSRF aciklari
- Hassas veri sizintisi (loglamada, hata mesajlarinda)
- Yetkilendirme kontrolleri
- Kriptografik zayifliklar
- Bagimlilik guvenlik aciklari
- Hardcoded sirlar veya anahtarlar

**Kanal B: Performans Analizi**
- N+1 sorgu kaliplari
- Gereksiz hesaplamalar veya donguler
- Bellek sizintisi riskleri
- Indeks kullanimi (veritabani sorgulari)
- Onbellekleme firsatlari
- Asenkron islem gereksinimleri
- Buyuk veri kumesi islemleri
- API cagri optimizasyonlari

**Kanal C: Mimari Analizi**
- SOLID ilkeleriyle uyum
- Katman ayrimina saygi (separation of concerns)
- Bagimlilik yonu (dependency inversion)
- Kod tekrari (DRY ihlalleri)
- Isimlendirme tutarliligi
- Hata yonetimi stratejisi
- Test edilebilirlik
- Genisletilebilirlik ve bakim kolayligi

### Adim 4: Bulgulari Siniflandir

Her bulguyu su seviyelere ata:

**KRITIK** - Mutlaka duzeltilmeli (merge engelleyici)
- Guvenlik aciklari
- Veri kaybi/bozulma riski
- Uretim ortamini kiracak hatalar

**YUKSEK** - Merge oncesi cozulmesi onerilen
- Performans sorunlari
- Hata yonetimi eksiklikleri
- Test kapsami boslugu (kritik yollar)

**ORTA** - Iyilestirme firsati
- Kod kalitesi
- Okunabilirlik
- Minor refactoring

**DUSUK** - Oneri niteliginde
- Stil tercihleri
- Dokumantasyon iyilestirmeleri
- Gelecek refactoring firsatlari

# Cikti Formati
```
=== BADI KOD INCELEMESI ===
Tarih: [tarih]
Kapsam: [belirtilen kapsam]
Dosya Sayisi: [sayi]
Degisen Satir: +[eklenen] / -[silinen]

## Genel Degerlendirme
[1-2 cumle ozet]
Onay Durumu: ONAYLANDI / DEGISIKLIK GEREKLI / REDDEDILDI

## Kritik Bulgular ([sayi])
### [Bulgu Basligi]
- Dosya: [yol:satir]
- Sorun: [aciklama]
- Oneri: [cozum]

## Yuksek Oncelikli ([sayi])
...

## Orta Oncelikli ([sayi])
...

## Dusuk Oncelikli ([sayi])
...

## Olumlu Gozlemler
- [iyi yapilmis seyler]

## Ozet
- Kritik: [sayi] | Yuksek: [sayi] | Orta: [sayi] | Dusuk: [sayi]
==============================
```
