Specification conformance command. Audits the current code against SPECIFICATION.md, detecting feature gaps and scope drift.

# Gerekli Araclar
- Read (SPECIFICATION.md, kaynak kodlar)
- Grep (ozellik arama)
- Glob (dosya tarama)
- Agent (auditor ajani)
- Bash (test calistirma)

# Prosedur (5 Adim)

### Adim 1: Spesifikasyonu Yukle
- `docs/SPECIFICATION.md` dosyasini oku
- Temel ozellikleri (Must Have) cikar
- Kabul kriterlerini listele
- Kapsam disi (Non-Goals) maddelerini belirle

### Adim 2: Kod Tabani Taramas
Her "Must Have" ozellik icin:
- Ilgili kod dosyalarini ara (fonksiyon, rota, bilesen)
- Kabul kriterinin karsilanip karsilanmadigini degerlendir
- Test kapsamini kontrol et

### Adim 3: Sapma Tespiti
**Eksik Ozellikler:**
- Spesifikasyonda olan ama kodda bulunamayan ozellikler

**Kapsam Kaymasi:**
- Kodda olan ama spesifikasyonda OLMAYAN ozellikler
- Kapsam disi (Non-Goals) olarak belirtilmis ama uygulanmis seyler

**Kismi Uygulamalar:**
- Baslanan ama tamamlanmamis ozellikler
- Kabul kriterini karsilamayan uygulamalar

### Adim 4: Uyum Raporu Olustur
Her ozellik icin durum:
- **TAMAMLANDI** — Kabul kriterleri karsilandi
- **KISMI** — Baslandi ama tamamlanmadi
- **EKSIK** — Henuz uygulanmadi
- **SAPMA** — Spesifikasyondan farkli uygulanmis

### Adim 5: Aksiyon Onerileri
- Oncelikli eksik ozellik listesi
- Kapsam kaymasi duzeltme onerileri
- TaskBoard.md guncelleme (eksikler icin yeni gorev)

# Cikti Formati
```
=== BADI SPESIFIKASYON UYUM KONTROLU ===
Spesifikasyon: docs/SPECIFICATION.md
Tarih: [tarih]

Uyum Orani: [yuzde]%

Must Have: [tamamlanan]/[toplam]
Should Have: [tamamlanan]/[toplam]
Could Have: [tamamlanan]/[toplam]

EKSIK Ozellikler:
- [ozellik adi] — [durum]

SAPMA Tespitleri:
- [sapma aciklamasi]

KAPSAM KAYMASI:
- [non-goal olarak belirtilmis ama uygulanmis]

Sonraki: [oncelikli aksiyon]
=========================================
```
