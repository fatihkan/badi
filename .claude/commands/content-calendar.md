Content calendar command. Creates a weekly or monthly social media content plan with themes, platforms, and timing.

# Gerekli Araclar
- Read (marka sesi, mevcut takvim, proje baglami) -- Write (takvim dosyasi) -- Grep (onceki icerik taramasi) -- ...

# Prosedur (6 Adim)

## 1. Takvim Parametreleri
- **Donem:** Bu hafta / Gelecek hafta / Bu ay / Gelecek ay / Ozel aralik
- **Platformlar:** [ ] Instagram (Post/Story/Reel) [ ] Twitter-X [ ] LinkedIn [ ] TikTok / ...
- **Siklik:** her platform icin haftalik kac icerik (IG Post/Story/Reel, Twitter, ...)
- **Temalar:** ana tema -- kampanya/lansman (varsa) -- mevsimsel -- evergreen
- **Hedef:** Buyume / Etkilesim / Satis / Bilinirlik / Trafik
- **Kaynaklar:** blog yazilari -- urun gorselleri -- musteri yorum/referans -- etkinlik takvimi -- ...
- **Ozel Gunler:** milli/dini bayramlar -- sektor etkinlikleri -- marka yildonumleri -- urun lansmanlari

## 2. Tema Haritasi
| Gun | Tema | Icerik Turu | Enerji |
|-----|------|-------------|--------|
| Pazartesi | Motivasyon/Hafta Basli | Ilham, hedef | Yuksek |
| Sali | Egitici/Ipucu | Tutorial, nasil yapilir | Orta |
| Carsamba | Perde Arkasi/Topluluk | Gunluk rutin, ekip, surec | Samimi |
| Persembe | Urun/Hizmet | Tanitim, ozellik, demo | Satis |
| Cuma | Eglence/Trend | Meme, challenge, trend ses | Eglenceli |
| Cumartesi | UGC/Sosyal Kanit | Musteri hikayesi, referans | Guvenilir |
| Pazar | Ilham/Yansitma | Haftalik ozet, gelecek teaser | Dusunceli |

Uyarlama:
- E-ticaret: Per → yeni urun, Cum → flash indirim
- SaaS: Sal → ozellik spotlight, Per → kullanim ipucu
- Kisisel marka: Pzt → dusunce liderligi, Car → kisisel hikaye -- ...

## 3. Icerik Matrisi
| Tarih | Gun | Platform | Format | Tema | Konu Ozeti | CTA | Durum |
|-------|-----|----------|--------|------|-----------|-----|-------|
| [tarih] | Pzt | IG Post | Karousel (5) | Egitici | [konu] | Kaydet | Planli |
| [tarih] | Pzt | Twitter | Thread (5) | Egitici | [konu] | RT | Planli |
| [tarih] | Pzt | IG Story | Anket | Topluluk | [soru] | Oy ver | Planli |
| [tarih] | Sal | IG Reel | 30s video | Ipucu | [konu] | Takip et | Planli |
| [tarih] | Sal | LinkedIn | Post | Dusunce | [konu] | Yorum yap | Planli |
| ... | ... | ... | ... | ... | ... | ... | ... |

Format secimi: tek gorsel (hizli mesaj, alistilar, duyuru) -- karousel (egitici, liste, adim) -- video/reel (demo, ipucu, trend, perde arkasi) -- ...

## 4. Her Icerik Icin Kisa Brief
```
[kisaltildi]
```

## 5. Ozel Gun ve Kampanya Entegrasyonu
**Takvim Isaretleri:** `[tarih]: [ozel gun] — [planlanan icerik]` / `[tarih]: [kampanya basla] — [hazirlik]` / `[tarih]: [kampanya bit] — [ozet]`

**Kampanya Icerikleri (varsa):** oncesi teaser (tarih araligi) -- lansman gunu (tarih + ozel plan) -- sure (tarih araligi + gunluk akis) -- ...

**Sezonsal:** mevsim degisikligi -- bayram/tatil -- sektor etkinlikleri -- ...

## 6. Kaydet ve Izleme
1. `.claude/workspace/takvim/` kontrol/olustur
2. `[YYYY-MM]-icerik-takvimi.md` olustur
3. Performans kolonlari ekle (sonradan doldurulacak): etkilesim (begeni/yorum/paylas), erisim, tiklama, donusum, not

# Cikti Formati
```
[kisaltildi]
```

# Icerik Dagiliim Rehberi (80/20)
| Tur | Oran | Amac |
|-----|------|------|
| Deger (egitici, ilham, eglence) | %80 | Guven ve otorite |
| Satis (tanitim, CTA, teklif) | %20 | Donusum ve gelir |

| Format | Oran | Neden |
|--------|------|-------|
| Karousel | %30 | En yuksek kaydetme |
| Reel/Video | %30 | En yuksek erisim |
| Tek gorsel | %20 | Hizli tuketim, bilinirlik |
| Story | %15 | Gunluk etkilesim, yakinlik |
| Canli yayin | %5 | Derin baglanti, Q&A |

# Ipuclari
- Esnek tut — gundeme gore %20 spontane pay -- her hafta en az 1 "kaydet" odakli (egitici/liste) -- platformlar arasi uyarlama yap, birebir kopyalama -- ...
