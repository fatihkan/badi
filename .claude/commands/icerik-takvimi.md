Icerik takvimi olusturma komutu. Haftalik veya aylik sosyal medya icerik plani, temalar, platformlar ve zamanlama ile birlikte olusturur.

# Gerekli Araclar
- Read (marka sesi, mevcut takvim, proje baglami)
- Write (takvim dosyasi)
- Grep (onceki icerik taramasi)
- ...

# Prosedur (6 Adim)

### Adim 1: Takvim Parametreleri
Kullanicidan su bilgileri al:

- **Donem:** Bu hafta / Gelecek hafta / Bu ay / Gelecek ay / Ozel aralik
- **Platformlar:** Hangi platformlara icerik uretilecek?
  - [ ] Instagram (Post, Story, Reel)
  - [ ] Twitter/X
  - [ ] LinkedIn
  - [ ] TikTok
  - ...
- **Siklik:** Her platform icin haftalik kac icerik?
  - Instagram Post: [sayi] / hafta
  - Instagram Story: [sayi] / hafta
  - Instagram Reel: [sayi] / hafta
  - Twitter: [sayi] / hafta
  - ...
- **Temalar/Konular:** Odak alanlari neler?
  - Ana tema (bu donem icin)
  - Kampanya veya lansman (varsa)
  - Mevsimsel/takvimsel icerikler
  - Evergreen (her zaman gecerli) konular
- **Hedef:** Takipci buyume / Etkilesim / Satis / Marka bilinirlik / Web trafigi
- **Kaynaklar:** Mevcut icerik var mi?
  - Blog yazilari
  - Urun gorselleri
  - Musteri yorumlari/referanslari
  - Etkinlik takvimi
  - ...
- **Ozel Gunler:** Donem icindeki onemli tarihler
  - Milli/dini bayramlar
  - Sektor etkinlikleri
  - Marka yildonumleri
  - Urun lansmanilari

### Adim 2: Tema Haritasi Olustur
Haftanin her gunu icin tematik cerceve belirle:

**Ornek Tema Haritasi (uyarlanabilir):**

| Gun | Tema | Icerik Turu | Enerji |
|-----|------|-------------|--------|
| Pazartesi | Motivasyon/Hafta Basli | Ilham verici, hedef | Yuksek |
| Sali | Egitici/Ipucu | Tutorial, nasil yapilir | Orta |
| Carsamba | Perde Arkasi/Topluluk | Gunluk rutin, ekip, surec | Samimi |
| Persembe | Urun/Hizmet | Tanitim, ozellik, demo | Satis |
| Cuma | Eglence/Trend | Meme, challenge, trend ses | Eglenceli |
| Cumartesi | UGC/Sosyal Kanit | Musteri hikayesi, referans | Guvenilir |
| Pazar | Ilham/Yansitma | Haftalik ozet, gelecek hafta teaser | Dusunceli |

Bu haritayi kullanicinin sektorune ve hedeflerine gore uyarla:
- E-ticaret: Persembe → Yeni urun, Cuma → Flash indirim
- SaaS: Sali → Ozellik spotlight, Persembe → Kullanim ipucu
- Kisisel marka: Pazartesi → Dusunce liderligi, Carsamba → Kisisel hikaye
- ...

### Adim 3: Icerik Matrisini Doldur
Her gun ve platform icin detayli plan:

| Tarih | Gun | Platform | Format | Tema | Konu Ozeti | CTA | Durum |
|-------|-----|----------|--------|------|-----------|-----|-------|
| [tarih] | Pzt | IG Post | Karousel (5) | Egitici | [konu] | Kaydet | Planli |
| [tarih] | Pzt | Twitter | Thread (5) | Egitici | [konu] | RT | Planli |
| [tarih] | Pzt | IG Story | Anket | Topluluk | [soru] | Oy ver | Planli |
| [tarih] | Sal | IG Reel | 30s video | Ipucu | [konu] | Takip et | Planli |
| [tarih] | Sal | LinkedIn | Post | Dusunce | [konu] | Yorum yap | Planli |
| ... | ... | ... | ... | ... | ... | ... | ... |

Her icerik icin format secimi:
- **Tek gorsel:** Hizli mesaj, alistilar, duyuru
- **Karousel:** Egitici, liste, adim adim kilavuz
- **Video/Reel:** Demo, ipucu, trend, perde arkasi
- ...

### Adim 4: Her Icerik Icin Kisa Brief
Matristeki her icerik icin ozet brief yaz:

```
[kisaltildi]
```

### Adim 5: Ozel Gun ve Kampanya Entegrasyonu
Donem icindeki ozel tarihleri iceri entegre et:

**Takvim Isaretleri:**
- [tarih]: [ozel gun] — [planlanan ozel icerik]
- [tarih]: [kampanya baslangici] — [hazirlik gereksinimleri]
- [tarih]: [kampanya bitisi] — [ozet/sonuc paylasimi]

**Kampanya Icerikleri (varsa):**
- Kampanya oncesi teaser: [tarih araligisi]
- Lansman gunu: [tarih] — [ozel icerik plani]
- Kampanya suresi: [tarih araligi] — [gunluk icerik akisi]
- ...

**Sezonsal Firsatlar:**
- Mevsim degisikligi temalari
- Bayram ve tatil icerikleri
- Sektor ozel etkinlikler
- ...

### Adim 6: Kaydet ve Izleme Yapisinii Olustur
Takvimi dosyaya kaydet ve performans takibi icin hazirla:

1. `.claude/workspace/takvim/` dizinini kontrol et, yoksa olustur
2. `[YYYY-MM]-icerik-takvimi.md` dosya adi olustur
3. Her icerik satirina performans kolonlari ekle (sonradan doldurulmak uzere):
   - Etkilesim (begen, yorum, paylas)
   - Erisim
   - Tiklama
   - Donusum
   - Not

# Cikti Formati
```
[kisaltildi]
```

# Icerik Dagiliim Rehberi (80/20 Kurali)
| Tur | Oran | Amac |
|-----|------|------|
| Deger (egitici, ilham, eglence) | %80 | Guven ve otorite insaa |
| Satis (tanitim, CTA, teklif) | %20 | Donusum ve gelir |

Icerik formati dagilimi:
| Format | Onerilen Oran | Neden |
|--------|--------------|-------|
| Karousel | %30 | En yuksek kaydetme orani |
| Reel/Video | %30 | En yuksek erisim |
| Tek gorsel | %20 | Hizli tuketim, marka bilinirlik |
| Story | %15 | Gunluk etkilesim, yakinlik |
| Canli yayin | %5 | Derin baglantti, soru-cevap |

# Ipuclari
- Takvimi esnek tut — gundeme gore %20 spontane icerik payi birak
- Her haftanin en az 1 icerigi "kaydet" odakli olmali (egitici/liste)
- Platformlar arasi icerik uyarlama yap, birebir kopyalama
- ...
