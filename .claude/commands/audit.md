Kalite denetimi komutu. Kod, yapi veya surec uzerinde sistematik denetim yapar.

## Badi CLI Komutlari (v1.6+)
Seviye T4 (Kapsamli) denetimde su CLI araclari calistirir:
- `badi secret-scan --git` — Sir taramasi + git history
- `badi lighthouse [url]` — Performance + Core Web Vitals
- `badi a11y [url]` — Accessibility (WCAG 2.1)
- `badi ssl/dns/whois [domain]` — Domain saglik (uretim varsa)
- `badi commit --check` — Son commit conventional format

# Gerekli Araclar
- Read (dosya okuma)
- Grep (kod taramasi)
- Glob (dosya bulma)
- Bash (analiz araclari)
- Write (rapor yazimi)

# Prosedur (5 Adim)

### Adim 1: Kapsam Belirle
Kullaniciya sor: "Denetim kapsamini secin:"
- **Dosya/Dizin:** Belirli bir dosya veya klasor
- **Modul:** Tum bir modul veya ozellik
- **Proje Geneli:** Tum kod tabani
- **Surec:** CI/CD, test, deploy surecleri

### Adim 2: Denetim Seviyesi Sec (T1-T4)

**T1 - Hizli Tarama (2-5 dk)**
- Sozdizimi ve format kontrolleri
- Bariz guvenlik sorunlari (hardcoded secrets, SQL injection)
- Eksik dosyalar veya kirik importlar
- Lint kurali ihlalleri

**T2 - Standart Denetim (5-15 dk)**
- T1 + kod kalite metrikleri
- Tekrarlanan kod (DRY ihlalleri)
- Isimlendirme tutarliligi
- Yorum ve dokumantasyon eksiklikleri
- Test kapsami analizi

**T3 - Derin Denetim (15-30 dk)**
- T2 + mimari uyum analizi
- Bagimlilik grafigi incelemesi
- Performans darbogazlari
- Hata yonetimi kaliplari
- Erisim kontrol ve yetkilendirme

**T4 - Kapsamli Denetim (30+ dk)**
- T3 + guvenlik taramasi (OWASP Top 10)
- Olceklenebilirlik degerlendirmesi
- Felaket kurtarma hazirlik durumu
- Uyumluluk kontrolleri (lisans, KVKK vb.)
- Teknik borc envanteri
- **Badi CLI Ekstralari**:
  - `badi secret-scan --git` — Sir + git history
  - `badi lighthouse [url]` — Performans + SEO + A11y + Best Practices
  - `badi a11y [url]` — WCAG 2.1 detay
  - `badi ssl/dns/whois [domain]` — Uretim domain saglik
  - `badi commit --check` — Commit format uyumu

### Adim 3: Denetim Ajani Devret
Secilen seviyeye gore denetimi baslat:
- Her kontrol maddesi icin GECTI / KALDI / UYARI durumu belirle
- Bulgulari topla ve siniflandir
- Kanit (kod satirlari, dosya yollari) ekle

### Adim 4: Sonuclari Isle
Bulgulari siniflandir:
- **KRITIK:** Hemen mudahale gerekli (guvenlik acigi, veri kaybi riski)
- **YUKSEK:** Kisa vadede cozulmeli (performans, hata yonetimi)
- **ORTA:** Planlanan sprintte ele alinmali (kod kalitesi)
- **DUSUK:** Iyilestirme firsati (refactoring, dokumantasyon)

### Adim 5: Gunlukleri Guncelle
- Denetim sonuclarini gunluk nota ekle
- Tespit edilen gorevleri gorev panosuna ekle
- `memory.md` dosyasina onemli bulgulari kaydet

# Cikti Formati
```
=== BADI DENETIM RAPORU ===
Tarih: [tarih]
Kapsam: [belirtilen kapsam]
Seviye: T[1-4]
Sure: [gecen sure]

## Ozet
- Toplam Kontrol: [sayi]
- Gecti: [sayi] | Kaldi: [sayi] | Uyari: [sayi]
- Genel Skor: [yuzde]%

## Kritik Bulgular
[varsa listele]

## Yuksek Oncelikli Bulgular
[listele]

## Orta Oncelikli Bulgular
[listele]

## Dusuk Oncelikli / Iyilestirme
[listele]

## Onerilen Aksiyonlar
1. [aksiyon]
2. [aksiyon]
...

## Sonraki Denetim Onerisi
Tarih: [onerilen tarih]
Kapsam: [onerilen kapsam]
=============================
```
