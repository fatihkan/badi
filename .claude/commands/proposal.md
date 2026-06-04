Client proposal command. Builds a professional client proposal from project summaries. Valid for 30 days.

# Gerekli Araclar
- Read (proje verileri, mevcut brifing)
- Write (teklif dosyasi)
- Grep (benzer teklif arama)

# Prosedur (6 Adim)

### Adim 1: Genel Bakis
Kullanicidan su bilgileri al:
- **Musteri Adi:** Sirket veya kisi
- **Ihtiyaclar:** Musterinin belirttigi sorunlar ve istekler
- **Istenen Sonuclar:** Basari kriterleri ve beklentiler
- **Kisitlamalar:** Butce araligi, zaman kisiti, teknik sinirlar
- **Karar Verici:** Kim onaylayacak? Teknik mi, is mi?
- **Rekabet:** Baska teklifler de mi degerlendiriliyor?

Mevcut bir brifing varsa (`briefs/` dizininde), onu temel al.

### Adim 2: Kapsam Tanimla
Teslimatlari fazlara ayir:

**Faz 1: [isim]**
- Teslimatlar: [detayli liste]
- Beklenen ciktilar: [somut sonuclar]
- Sure: [tahmini]
- Bagimliliklar: [on kosullar]

**Faz 2: [isim]**
- ...

Her faz icin:
- Varsayimlar (ne saglanacak, ne bekleniyor)
- Kapsam disi birakilan maddeler (acikca belirt)
- Kabul kriterleri

### Adim 3: Zaman Cizelgesi
Fazlari takvim haftlarina esle:

| Hafta | Faz | Teslimatlar | Kilometre Tasi |
|-------|-----|-------------|----------------|
| 1-2 | Arastirma & Tasarim | ... | Tasarim Onayi |
| 3-5 | Gelistirme | ... | MVP Demo |
| 6 | Test & Iyilestirme | ... | QA Onayi |
| 7 | Lansman & Destek | ... | Canli Yayim |

- Her faz arasinda 2-3 gunluk inceleme tamponu birak
- Kilometre taslarini acikca isaretle
- Kritik yol analizini belirt

### Adim 4: Fiyatlandirma (2 Secenek)

**Secenek A: Tam Kapsam (Onerilen)**
| Kalem | Birim | Miktar | Birim Fiyat | Toplam |
|-------|-------|--------|-------------|--------|
| ... | ... | ... | ... | ... |
- Alt toplam: [tutar]
- KDV: [tutar]
- **Genel Toplam: [tutar]**

**Secenek B: MVP / Azaltilmis Kapsam**
| Kalem | Birim | Miktar | Birim Fiyat | Toplam |
|-------|-------|--------|-------------|--------|
| ... | ... | ... | ... | ... |
- **Genel Toplam: [tutar]**

**Opsiyonel Ek Hizmetler:**
- [hizmet]: [fiyat]
- [hizmet]: [fiyat]

### Adim 5: Sartlar ve Kosullar
Teklif sartlarini belirt:

- **Gecerlilik:** Bu teklif [tarih] tarihine kadar (30 gun) gecerlidir.
- **Odeme Takvimi:**
  - %30 sozlesme imzasinda (baslangic)
  - %40 MVP tesliminde (ara odeme)
  - %30 final teslimde ve kabul sonrasinda
- **Revizyon Politikasi:**
  - Her faz icin [sayi] tur revizyon dahildir
  - Ek revizyonlar saatlik ucretlendirilir
- **Fikri Mulkiyet:**
  - Tum ozel kod ve tasarimlar final odeemede musteriye devredilir
  - Ucuncu parti lisanslar musteriye bildirilir
- **Gizlilik:** Karsilikli gizlilik anlasmasi (NDA) uygulanir
- **Iptal Kosullari:**
  - Her iki taraf [sayi] gun onceden bildirimle iptal edebilir
  - Tamamlanan calisma icin odeme yapilir
- **Iletisim:** Haftalik ilerleme raporu + [aralikla] toplanti
- **Degisiklik Talepleri:** Kapsam disindaki talepler ayrica fiyatlandirilir

### Adim 6: Teklif Dosyasi Olustur
`proposals/[musteri-adi]-proposal.md` dosyasina kaydet.

# Cikti Yapisi
```markdown
# Proje Teklifi: [Proje Adi]
**Hazirlayan:** [isim]
**Musteri:** [musteri adi]
**Tarih:** [tarih]
**Gecerlilik:** [son tarih] (30 gun)

## 1. Yonetici Ozeti
[2-3 paragraf: sorun, cozum, deger]

## 2. Problem Anlayisi
[musterinin durumu ve ihtiyaclari]

## 3. Onerilen Yaklasim
[fazli cozum plani]

## 4. Kapsam ve Teslimatlar
[detayli kapsam tablosu]

## 5. Zaman Cizelgesi
[haftalik plan tablosu]

## 6. Yatirim
[2 secenekli fiyatlandirma]

## 7. Sartlar ve Kosullar
[yukaridaki sartlar]

## 8. Sonraki Adimlar
1. Teklifin incelenmesi
2. Soru-cevap toplantisi
3. Sozlesme imzasi
4. Baslangic toplantisi (kickoff)
```

# Cikti Formati
```
=== BADI MUSTERI TEKLIFI ===
Musteri: [musteri adi]
Tarih: [tarih]
Gecerlilik: 30 gun ([son tarih])

Faz Sayisi: [sayi]
Secenek A: [toplam tutar]
Secenek B: [toplam tutar]
Tahmini Sure: [hafta sayisi] hafta

Dosya: proposals/[musteri-adi]-proposal.md
=============================
```
