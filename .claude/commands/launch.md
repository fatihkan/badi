Product launch plan command. Creates a comprehensive plan for a new product or feature launch.

# Gerekli Araclar
- Read (proje verileri)
- Grep (pazar arastirmasi verileri)
- Write (plan dosyasi)
- Bash (mevcut proje analizi)
- Glob (kaynak taramasi)

# Prosedur (7 Adim)

### Adim 1: Urun Ozeti
Kullanicidan su bilgileri al:
- Urun/ozellik adi
- Tek cumlelik deger onerisi
- Hedef kitle tanimlamasi
- Lansman tarihi veya zaman dilimi
- Basari metrikleri (KPI)

Ozeti olustur:
- Problem tanimi (hangi sorunu cozuyor?)
- Cozum tanimi (nasil cozuyor?)
- Benzersiz deger onerisi (neden bu cozum?)
- Hedef pazar buyuklugu tahmini

### Adim 2: Rekabet Arastirmasi
Rekabet ortamini analiz et:
- Dogrudan rakipler (ayni sorunu cozenler, 3-5 adet)
- Dolayli rakipler (alternatif cozumler)
- Her rakip icin: guclu yonler, zayif yonler, fiyatlandirma
- Pazar boslugu analizi
- Farklilastirma firsatlari
- Rakip konumlandirma matrisi

### Adim 3: Konumlandirma
- Hedef kitle segmentasyonu (birincil, ikincil persona)
- Benzersiz satis onerisi (USP) tanimi
- Mesajlasma cercevesi:
  - Baslik (headline)
  - Alt baslik (subheadline)
  - 3 temel fayda maddesi
  - Sosyal kanit stratejisi (referans, istatistik, logo)
- Ton ve ses (marka uyumlu)
- Anahtar kelimeler ve SEO stratejisi

### Adim 4: Fiyat Analizi
- Maliyet tabani hesabi
- Rakip fiyatlandirma karsilastirmasi
- Deger bazli fiyatlandirma onerisi
- Fiyat katmanlari (uygunsa):
  - Ucretsiz / Freemium
  - Baslangic
  - Profesyonel
  - Kurumsal
- Tanitim fiyati stratejisi
- Gelir projeksiyonu (3-6-12 ay)

### Adim 5: Landing Page Taslagi
Donusum odakli sayfa yapisi tasarla:
- **Hero Bolumu:** Baslik + deger onerisi + birincil CTA + gorsel yer tutucu
- **Problem/Cozum:** Kullanicinin acisini tanimla, cozumu goster
- **Ozellikler:** 3-6 temel ozellik, faydalarla birlikte
- **Nasil Calisir:** 3-4 adimli gorsel akis
- **Sosyal Kanit:** Referanslar, musteri logolari, istatistikler
- **Fiyatlandirma:** Karsilastirmali tablo
- **SSS:** 5-8 sik sorulan soru
- **Son CTA:** Guclu kapansis mesaji + aksiyon butonu
- **Teknik:** SEO meta taglari, OG image, yapisal veri

### Adim 6: Go-to-Market Kontrol Listesi

**Lansman Oncesi (-2 hafta):**
- [ ] Landing page gelistirme ve test
- [ ] E-posta listesi segmentasyonu ve hazirligi
- [ ] Sosyal medya icerik takvimi olusturma
- [ ] Basin bulteni taslagi ve dagitim listesi
- [ ] Beta test grubu geri bildirim toplama
- [ ] Destek dokumantasyonu (SSS, kilavuzlar)
- [ ] Analitik ve izleme kurulumu (GA, Mixpanel, vb.)
- [ ] A/B test planlari

**Lansman Gunu:**
- [ ] Landing page yayina alma
- [ ] E-posta kampanyasi gonderimi (saat bazli)
- [ ] Sosyal medya paylasim plani (platform bazli, saat bazli)
- [ ] Product Hunt / Hacker News gonderisi (uygunsa)
- [ ] Topluluk duyurulari (Discord, Slack, forum)
- [ ] Canli destek ekibi hazir
- [ ] Gercek zamanli metrik takibi

**Lansman Sonrasi (+2 hafta):**
- [ ] Gunluk metrik takibi ve raporlama
- [ ] Kullanici geri bildirimi toplama ve analiz
- [ ] Hata ve sorun takibi (oncelikli duzeltme)
- [ ] Icerik pazarlamasi (blog, video, podcast)
- [ ] Performans optimizasyonu (sayfa hizi, donusum)
- [ ] Retrospektif ve ogrenimler raporu

### Adim 7: Plan Dosyasi Olustur
`launch-plan-[urun-adi].md` dosyasini olustur:
- Tum adimlarin ciktisini tek dokumanda birlesir
- Tarihli kontrol listesi ile takip edilebilir format
- Sorumluluk atamalari icin bos alanlar

# Cikti Formati
```
=== BADI LANSMAN PLANI ===
Urun: [urun adi]
Hedef Tarih: [tarih]
Durum: TASLAK

Olusturulan: launch-plan-[urun-adi].md

Icindekiler:
1. Urun Ozeti ve Deger Onerisi
2. Rekabet Analizi Matrisi
3. Konumlandirma ve Mesajlasma
4. Fiyatlandirma Stratejisi
5. Landing Page Taslagi
6. Go-to-Market Kontrol Listesi
7. Basari Metrikleri ve KPI
===========================
```
