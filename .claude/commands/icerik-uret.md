Sosyal medya icerik uretme komutu. Belirtilen platform ve tur icin hazir kullanilabilir post, caption, gorsel brief ve hashtag uretir.

# Gerekli Araclar
- Read (marka sesi, onceki icerikler, proje baglami)
- Write (icerik dosyasi)
- Grep (onceki icerik taramasi)
- Glob (kaynak dosya bulma)
- Bash (tarih ve dizin islemleri)

# Prosedur (6 Adim)

### Adim 1: Girdi Topla
Kullanicidan su bilgileri al:

- **Platform**: Instagram / Twitter-X / LinkedIn / TikTok / YouTube / Facebook / Hepsi
- **Icerik Turu**:
  - Bilgilendirici (ipucu, liste, nasil yapilir)
  - Ilham verici (motivasyon, basari hikayesi)
  - Eglenceli (meme, trend, challenge)
  - Satis odakli (urun tanitim, indirim, lansman)
  - Topluluk (soru-cevap, anket, perde arkasi)
  - Egitici (tutorial, adim adim, karousel egitim)
  - Haber/Duyuru (yenilik, guncelleme, etkinlik)
- **Konu/Mesaj**: Ne hakkinda icerik uretilecek? (detay ver)
- **Ton**: Samimi / Profesyonel / Eglenceli / Ilham verici / Provokatif / Minimal
- **Gorsel**: Gorsel brief de isteniyor mu? (evet/hayir)
- **Dil**: Turkce / Ingilizce / Her ikisi
- **Adet**: Kac farkli varyasyon? (varsayilan: 3)
- **Ozel Not**: Belirli bir CTA, hashtag veya kisitlama var mi?

### Adim 2: Marka Baglamini Yukle
Varsa su dosyalari oku ve icerige yansit:

**Zorunlu Kontroller:**
- `.claude/workspace/marka-sesi.md` — Marka tonu, hitap sekli, emoji politikasi
- `memory.md` — Mevcut kampanya, lansman veya proje bilgisi

**Opsiyonel Kontroller:**
- `.claude/workspace/icerikler/` — Son 5 icerik (tekrar onleme)
- `.claude/workspace/takvim/` — Mevcut icerik takvimi (zamanlama uyumu)
- `knowledge-base.md` — Kacinilmasi gereken ifadeler, marka kurallari

Marka sesi dosyasi yoksa kullaniciya `/marka-sesi` komutunu oncelikle calistirmasini oner ama zorunlu tutma.

### Adim 3: Platform Kurallarini Uygula
Her platform icin teknik sinirlari ve en iyi uygulamalari takip et:

**Instagram:**
- Post: Maks 2200 karakter, ilk 125 karakter kritik (kesilme noktasi)
- Hashtag: 20-30 arasi, nist+genel karisimi, ilk yoruma da koyulabilir
- Gorsel: 1080x1080 (kare) veya 1080x1350 (dikey, daha fazla alan kaplar)
- Hook: Ilk cumle merak uyandirmali veya deger vaadi vermeli
- CTA: Kaydet, paylas, yoruma yaz, linke tikla

**Twitter/X:**
- Maks 280 karakter (thread icin her tweet ayri)
- Thread yapisi: 1/ ana mesaj, 2-N/ destekleyici icgoru, son tweet CTA
- Hashtag: 1-3 arasi (fazlasi spam gorunur)
- Gorsel: 1600x900 (tek gorsel dikkat cekmede etkili)
- Hook: Cesur iddia, istatistik veya soru

**LinkedIn:**
- Maks 3000 karakter, ilk 210 karakter "daha fazla" oncesi gorunur
- Ton: Profesyonel ama insani, kisisel deneyim paylasimi
- Hashtag: 3-5 arasi, sektore ozel
- Gorsel: 1200x627, infografik ve veri gorselleri yuksek etkilesim
- Hook: Kisisel hikaye, sasirtici istatistik, kontrovarsiyel gorus

**TikTok:**
- Caption: Maks 2200 karakter, kisa tutulmali
- Video oncelikli platform, metin destekleyici
- Hashtag: 3-5 trend + nis hashtag
- Hook: Ilk 3 saniye icin merak kancasi
- Trend sesleri ve formatlarini onerilere dahil et

**YouTube:**
- Baslik: Maks 100 karakter, anahtar kelime icermeli
- Aciklama: 5000 karakter, ilk 2-3 satir SEO kritik
- Etiketler: 10-15 arasi
- Thumbnail metin onerisi

**Facebook:**
- Post: 63,206 karakter limit ama optimal 40-80 kelime
- Soru sormak etkilesimi artirir
- Link paylasimlarinda aciklama kisa ve net

### Adim 4: Icerik Varyasyonlari Olustur
Her varyasyon farkli bir yaklasim kullanmali:

**Varyasyon A — Dogrudan Deger:**
- Net, acik mesaj
- Hemen faydayi goster
- "Iste X yapmanin Y yolu..."

**Varyasyon B — Hikaye Anlatimi:**
- Kisisel deneyim veya senaryo ile basla
- Duygu baglantisi kur
- "Gecen hafta X yasadim ve..."

**Varyasyon C — Soru/Merak:**
- Soru veya sasirtici iddia ile ac
- Okuyucuyu icerge cekmek icin merak boslugu birak
- "Cogu kisi X'i yanlis yapiyor. Iste nedeni..."

Her varyasyon icin:
- Tam metin (kopyala-yapistir hazir)
- Platform spesifik hashtag listesi
- CTA (call-to-action) onerisi
- Emoji kullanimi (marka sesine uygun)

### Adim 5: Gorsel Brief (Istenildiyse)
Gorsel brief istendiyse her varyasyon icin:

- **Gorsel Aciklamasi:** Ne gosterilmeli? (obje, sahne, duygu)
- **Boyut:** Platform bazli (1080x1080, 1080x1350, 1920x1080 vb.)
- **Stil:** Fotografik / Minimalist / Illustrasyon / Tipografik / Collage
- **Renk:** Marka renkleri veya onerilen palet (hex kodlari)
- **Metin:** Gorsel ustune yazilacak baslik/alt baslik (varsa)
- **AI Prompt:** Midjourney veya DALL-E icin kullanima hazir prompt

### Adim 6: Paketle ve Kaydet
Tum ciktiyi duzgun formatla ve kaydet:

1. `.claude/workspace/icerikler/` dizinini kontrol et, yoksa olustur
2. `[YYYY-MM-DD]-[konu-kebab].md` dosya adini olustur
3. Tum varyasyonlari, gorsel briefleri ve metadata'yi tek dosyaya yaz
4. Kullaniciya ozet sun

# Cikti Formati
```
=== BADI ICERIK URETIMI ===
Platform: [platform(lar)]
Konu: [konu]
Tur: [icerik turu]
Ton: [secilen ton]
Tarih: [tarih]

-------------------------------------------
VARYASYON A — Dogrudan Deger
-------------------------------------------
[Hazir post metni — kopyala yapistir]

Hashtag: [platform bazli hashtag listesi]
CTA: [cagri metni]
Zamanlama: [onerilen gun ve saat + neden]

-------------------------------------------
VARYASYON B — Hikaye Anlatimi
-------------------------------------------
[Hazir post metni — kopyala yapistir]

Hashtag: [hashtag listesi]
CTA: [cagri metni]
Zamanlama: [onerilen gun ve saat]

-------------------------------------------
VARYASYON C — Soru/Merak
-------------------------------------------
[Hazir post metni — kopyala yapistir]

Hashtag: [hashtag listesi]
CTA: [cagri metni]
Zamanlama: [onerilen gun ve saat]

-------------------------------------------
GORSEL BRIEF (varsa)
-------------------------------------------
Boyut: [genislik x yukseklik]
Stil: [stil]
Aciklama: [detayli gorsel aciklama]
Metin: [gorsel ustundeki yazi]
Renk: [#hex kodlari]

AI Prompt (Midjourney):
[kullanima hazir prompt]

AI Prompt (DALL-E):
[kullanima hazir prompt]

-------------------------------------------
META
-------------------------------------------
Dosya: .claude/workspace/icerikler/[dosya-adi].md
Marka Sesi: [uygulandi / marka-sesi.md bulunamadi]
Onceki Icerik Kontrolu: [tekrar yok / uyari]
=============================
```

# Zamanlama Rehberi
| Platform | En Iyi Gunler | En Iyi Saatler | Neden |
|----------|--------------|----------------|-------|
| Instagram | Sal, Per | 11:00-13:00, 19:00-21:00 | Oglen molasi ve aksam bos zamani |
| Twitter/X | Pzt, Car | 09:00-11:00, 13:00-15:00 | Is basi ve oglen sonrasi |
| LinkedIn | Sal, Car, Per | 08:00-10:00, 17:00-18:00 | Is basi ve is cikisi |
| TikTok | Crs, Cum | 19:00-23:00 | Aksam bos zamani |
| YouTube | Cum, Cts | 14:00-16:00 | Hafta sonu izleme zamani |
| Facebook | Car, Per | 12:00-15:00 | Oglen ve ogleden sonra |

Not: Bu genel veriler, spesifik hedef kitleye gore degisiklik gosterebilir. Analitik verileri varsa onlara oncelik ver.

# Ipuclari
- Tek seferde birden fazla platform icin icerik uretirken, her platforma ozel uyarla — ayni metni kopyalama
- Hashtag stratejisinde %30 buyuk (100K+), %50 orta (10K-100K), %20 nis (<10K) karmasimi kullan
- Her 5. icerikten biri "satis odakli" olmali, gerisi deger saglamali (80/20 kurali)
- Emoji kullanimi marka sesine gore: kurumsal markalarda az, kisisel markalarda serbest
- Her icerik bir tek amaca hizmet etmeli: bilgi ver, ilham ver, satisa yonelt veya etkilesim iste
