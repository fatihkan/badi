Project briefing command. Turns raw project ideas into structured, actionable briefs.

# Gerekli Araclar
- Read (mevcut proje bilgileri)
- Write (brifing dosyasi)
- Grep (benzer proje arama)
- Glob (kaynak tarama)

# Prosedur (7 Adim)

### Adim 1: Fikir Yakala
Kullanicidan su bilgileri topla (yapilandirilmamis bile olsa kabul et):
- **Problem:** Hangi sorunu cozuyoruz?
- **Cozum:** Nasil cozmeyi planliyoruz?
- **Kullanicilar:** Kim kullanacak? (birincil ve ikincil hedef kitle)
- **Basari Kriteri:** Basariyi nasil olcecegiz?
- **Motivasyon:** Neden simdi? Tetikleyen olay nedir?

Fikir ne kadar ham olursa olsun, yapilandirilmis formata donustur.

### Adim 2: Kapsam Tanimla
Net sinirlar ciz:

**Dahil Olanlar:**
- Birinci fazda teslim edilecek ozellikler
- Temel kullanici akislari
- Minimum teknik gereksinimler

**Haric Tutulanlar:**
- Bilinçli olarak kapsam disinda birakilan ozellikler
- Gelecek fazlara ertelenen isler
- Sorumluluk sinirlari

**Varsayimlar:**
- Teknik varsayimlar (altyapi, erisim, vb.)
- Is varsayimlari (butce, zaman, kaynak)
- Kullanici varsayimlari (beceri seviyesi, erisim, vb.)

### Adim 3: Kullanici Hikayeleri (MoSCoW)
5-10 kullanici hikayesi yaz, her biri icin:
- Format: "Bir [rol] olarak, [amac] istiyorum, boylece [fayda]."
- Kabul kriterleri (2-4 madde)
- MoSCoW onceligi:
  - **Must (Olmali):** Olmadan urun calisamaz
  - **Should (Olmali):** Onemli ama ilk surumde olmasa da olur
  - **Could (Olabilir):** Guzel olur ama oncelikli degil
  - **Won't (Olmayacak):** Bu fazda bilinçli olarak yapilmayacak

### Adim 4: Teknik Degerlendirme
- **Teknoloji Yigini:** Onerilen diller, frameworkler, araclar
- **Entegrasyonlar:** Ucuncu parti servisler ve API'ler
- **Veri Gereksinimleri:** Veritabani, depolama, veri akisi
- **Altyapi:** Hosting, CI/CD, izleme
- **Kisitlamalar:** Performans gereksinimleri, uyumluluk, olcek
- **Teknik Borc Riski:** Bilinen kisa yollar veya gecici cozumler
- **Build vs Buy Analizi:** Hangi bilesenleri gelistirmeli, hangilerini hazir kullanmali?

### Adim 5: Risk Tespiti
Risk matrisi olustur:

| Risk | Olasilik (1-5) | Etki (1-5) | Risk Skoru | Azaltma Stratejisi |
|------|----------------|------------|------------|-------------------|
| [risk tanimi] | [deger] | [deger] | [OxE] | [strateji] |

Risk kategorileri:
- Teknik riskler (karmasiklik, bilinmeyen teknoloji)
- Kaynak riskleri (zaman, butce, yetenek)
- Dis bagimlilik riskleri (ucuncu parti, API)
- Pazar riskleri (talep, rekabet)

### Adim 6: Zaman Tahmini
Faz bazli tahmin tablosu:

| Faz | Aciklama | Tahmini Sure | Onkosusllar |
|-----|----------|-------------|-------------|
| Arastirma | ... | ... | ... |
| Tasarim | ... | ... | ... |
| Gelistirme | ... | ... | ... |
| Test | ... | ... | ... |
| Lansman | ... | ... | ... |

Not: Tahminlere %20 tampon ekle.
Toplam tahmini sure ve bitiris tarihi belirt.

### Adim 7: Brifing Dosyasi Olustur
`briefs/[proje-adi]-brief.md` dosyasina kaydet.

# Cikti Formati
```
=== BADI PROJE BRIFINGI ===
Proje: [proje adi]
Tarih: [tarih]
Durum: TASLAK

Ozet: [tek paragraf]
Oncelik: [YUKSEK/ORTA/DUSUK]
Tahmini Sure: [sure]
Risk Seviyesi: [YUKSEK/ORTA/DUSUK]

Must Have: [sayi] hikaye
Should Have: [sayi] hikaye
Could Have: [sayi] hikaye
Won't Have: [sayi] hikaye

Dosya: briefs/[proje-adi]-brief.md
============================
```
