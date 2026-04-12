import { slugify, getDateString } from "../icerik-helpers.js";

export function contentTemplates() {
	return {
		post: (konu) => `# Sosyal Medya Post — ${konu}

**Tarih:** ${getDateString()}
**Platform:** [Instagram / Twitter-X / LinkedIn / TikTok / Facebook]
**Tur:** [Bilgilendirici / Ilham / Eglence / Satis / Topluluk / Egitici]
**Ton:** [Samimi / Profesyonel / Eglenceli / Ilham verici]

---

## VARYASYON A — Dogrudan Deger

[Hook — ilk 1-2 satir, dikkat cekici]

[Govde — ana mesaj]

[CTA — net cagri]

**Hashtag:** #hashtag1 #hashtag2 #hashtag3

---

## VARYASYON B — Hikaye Anlatimi

[Kisisel deneyim veya senaryo ile basla]

[Duygu baglantisi kur]

[CTA]

**Hashtag:** #hashtag1 #hashtag2 #hashtag3

---

## VARYASYON C — Soru/Merak

[Sasirtici soru veya iddia]

[Merak boslugu ac]

[CTA]

**Hashtag:** #hashtag1 #hashtag2 #hashtag3

---

## GORSEL NOTU
- Boyut: [1080x1080 / 1080x1350 / 1920x1080]
- Stil: [minimalist / fotografik / tipografik]
- Renk: [marka renkleri veya palet]

## ZAMANLAMA
- Onerilen gun: [gun]
- Onerilen saat: [saat]
- Sebep: [neden bu zaman]

## META
- Dosya: ${getDateString()}-${slugify(konu)}.md
- Marka sesi: .claude/workspace/marka-sesi.md (varsa)
`,

		karousel: (konu) => `# Karousel Icerik — ${konu}

**Tarih:** ${getDateString()}
**Platform:** [Instagram / LinkedIn]
**Amac:** [Egitici / Hikaye / Liste / Karsilastirma / Adim adim]
**Kare Sayisi:** 7
**Gorsel Stil:** [Minimalist / Renkli / Fotografik / Tipografik]

---

## KARE 1: KAPAK
**Baslik:** [buyuk, dikkat cekici baslik]
**Alt Baslik:** [varsa]
**Gorsel:** [arka plan + ana gorsel aciklamasi]
**Amac:** Dikkat yakalamak, kaydirmaya tesvik

---

## KARE 2: [baslik]
**Baslik:** [metin]
**Govde:**
- Madde 1
- Madde 2
- Madde 3

**Gorsel:** [arka plan + oge]
**Gecis:** [sonraki kareye gecis hissi]

---

## KARE 3: [baslik]
**Baslik:** [metin]
**Govde:** [icerik]
**Gorsel:** [arka plan + oge]

---

## KARE 4: [baslik]
**Baslik:** [metin]
**Govde:** [icerik]
**Gorsel:** [arka plan + oge]

---

## KARE 5: [baslik]
**Baslik:** [metin]
**Govde:** [icerik]
**Gorsel:** [arka plan + oge]

---

## KARE 6: [baslik]
**Baslik:** [metin]
**Govde:** [icerik]
**Gorsel:** [arka plan + oge]

---

## KARE 7: SON KARE — CTA
**Baslik:** [kapanis mesaji]
**CTA:** [net aksiyon: Kaydet / Paylas / Takip et / Yorum yap]
**Gorsel:** [arka plan + marka ogeleri]

---

## CAPTION
[Hazir caption metni — kopyala yapistir]

**Hook:** [ilk satir]
**Hashtag:** #hashtag1 #hashtag2 #hashtag3
**CTA:** [caption icindeki cagri]

## TASARIM NOTLARI
- Renk Paleti: [#hex kodlari]
- Baslik Font: [font adi]
- Govde Font: [font adi]
- Logo Konumu: [kapak + son kare / her karede]
- Kare Numarasi: [1/7, 2/7... formati]

## META
- Dosya: ${getDateString()}-karousel-${slugify(konu)}.md
`,

		video: (konu) => `# Video Senaryo — ${konu}

**Tarih:** ${getDateString()}
**Platform:** [Instagram Reels / YouTube Shorts / TikTok / YouTube]
**Sure:** [15s / 30s / 60s / 3-10dk]
**Tur:** [Egitici / Eglence / Tanitim / Hikaye / Trend]
**Konusmaci:** [Yuz / Seslendirme / Metin+Gorsel / Ekran Kaydi]

---

## HOOK (0-3s)
**GORUNTU:** [ilk kare detayi — ekranda ne var]
**SES:** "[soylenen ilk cumle]"
**METIN:** [ekran ustu yazi]
**AMAC:** [neden bu hook calisir]

---

## SAHNE 1 — Baglam (3s-Xs)
**GORUNTU:** [kamera acisi, hareket, obje]
**SES:** "[konusma metni]"
**METIN:** [ekran yazisi]
**GECIS:** [sonraki sahneye nasil gecilecek]

---

## SAHNE 2 — Ana Icerik (Xs-Ys)
**GORUNTU:** [detay]
**SES:** "[konusma]"
**METIN:** [ekran yazisi]
**GECIS:** [gecis tipi]

---

## SAHNE 3 — Detay/Ornek (Ys-Zs)
**GORUNTU:** [detay]
**SES:** "[konusma]"
**METIN:** [ekran yazisi]
**GECIS:** [gecis tipi]

---

## KAPANISIS — CTA (son 3-5s)
**GORUNTU:** [son kare]
**SES:** "[CTA metni]"
**METIN:** [ekran yazisi — CTA]

---

## CAPTION
[Video altina yazilacak aciklama]

**Hashtag:** #hashtag1 #hashtag2 #hashtag3
**Mention:** @hesap1 @hesap2
**CTA:** [yorum yap / kaydet / takip et]

## POST-PRODUKSIYON
- **Muzik:** [trend ses / orijinal / arka plan]
- **Filtre/LUT:** [renk gradasyonu notu]
- **Gecis Efektleri:** [whip pan / kesme / fade]
- **Hiz:** [yavaslatma / hizlandirma noktalari]
- **Altyazi:** [acik / kapali] — [font onerisi]

## THUMBNAIL (YouTube icin)
- **Metin:** [baslik — max 5-6 kelime]
- **Gorsel:** [ana obje/kisi]
- **Renk:** [kontrast vurgusu]

## META
- Dosya: ${getDateString()}-${slugify(konu)}.md
- Tahmini Cekim: [dakika]
- Tahmini Kurgu: [dakika]
- Gerekli Ekipman: [telefon / kamera / mikrofon / isik]
`,

		gorsel: (konu) => `# Gorsel Brief — ${konu}

**Tarih:** ${getDateString()}
**Kullanim:** [Post / Story / Karousel / Thumbnail / Banner / Reklam]
**Platform:** [Instagram / Twitter / LinkedIn / YouTube / Facebook]
**Stil:** [Fotografik / Minimalist / Illustrasyon / Tipografik / 3D]

---

## GORSEL ACIKLAMASI
[Detayli kompozisyon, objeler, atmosfer]

## TEKNIK OZELLIKLER
- **Boyut:** [genislik]x[yukseklik] px
- **En-Boy:** [1:1 / 4:5 / 9:16 / 16:9]
- **Format:** [PNG / JPG / SVG]

## RENK PALETI
- **Birincil:** #______ — [isim/kullanim]
- **Ikincil:** #______ — [isim/kullanim]
- **Vurgu:** #______ — [CTA butonu]
- **Arka Plan:** #______
- **Metin:** #______

## TIPOGRAFI
- **Baslik:** [font] / [boyut]px / [kalinlik] / [#renk]
- **Alt Baslik:** [font] / [boyut]px / [#renk]
- **CTA:** [font] / [boyut]px / BG:[#hex] FG:[#hex]

## KOMPOZISYON
- **Odak Noktasi:** [orta / uc'te bir / alt / ust]
- **Bos Alan:** [yogun / orta / ferah]
- **Simetri:** [simetrik / asimetrik]

---

## AI PROMPTLAR

### Midjourney
\`\`\`
/imagine [detayli aciklama], [stil], [atmosfer], [kompozisyon] --ar [oran] --v 6.1 --style raw
\`\`\`

### DALL-E
\`\`\`
[Detayli dogal dil aciklamasi, stil ve atmosfer dahil]
\`\`\`

### Flux / Stable Diffusion
\`\`\`
[pozitif prompt], [stil etiketleri]
Negative: [istenmeyen ogeler]
\`\`\`

## CANVA / FIGMA NOTU
- **Sablon:** [kategori]
- **Katman Sirasi:** arka plan > gorsel > metin > logo
- **Elemanlar:** [ikon / sekil / foto]

## META
- Dosya: ${getDateString()}-${slugify(konu)}-brief.md
`,

		takvim: (donem) => `# Icerik Takvimi — ${donem}

**Tarih:** ${getDateString()}
**Donem:** ${donem}
**Platformlar:** [Instagram, Twitter, LinkedIn, TikTok, YouTube]
**Toplam Icerik:** [sayi]

---

## TEMA HARITASI

| Gun | Tema | Format | Enerji |
|-----|------|--------|--------|
| Pzt | Motivasyon / Hafta Basli | Post | Yuksek |
| Sal | Egitici / Ipucu | Karousel | Orta |
| Car | Perde Arkasi / Topluluk | Story | Samimi |
| Per | Urun / Hizmet | Reel | Satis |
| Cum | Eglence / Trend | Reel | Eglenceli |
| Cts | UGC / Sosyal Kanit | Post | Guvenilir |
| Paz | Ilham / Ozet | Karousel | Dusunceli |

---

## HAFTA 1

| Tarih | Platform | Format | Konu | CTA | Saat | Durum |
|-------|----------|--------|------|-----|------|-------|
| | IG Post | | | | | Planli |
| | Twitter | | | | | Planli |
| | LinkedIn | | | | | Planli |
| | IG Reel | | | | | Planli |
| | TikTok | | | | | Planli |

## HAFTA 2

| Tarih | Platform | Format | Konu | CTA | Saat | Durum |
|-------|----------|--------|------|-----|------|-------|
| | | | | | | Planli |

## HAFTA 3

| Tarih | Platform | Format | Konu | CTA | Saat | Durum |
|-------|----------|--------|------|-----|------|-------|
| | | | | | | Planli |

## HAFTA 4

| Tarih | Platform | Format | Konu | CTA | Saat | Durum |
|-------|----------|--------|------|-----|------|-------|
| | | | | | | Planli |

---

## OZEL GUNLER

| Tarih | Etkinlik | Planlanan Icerik | Platform |
|-------|----------|------------------|----------|
| | | | |

## KAMPANYALAR

| Baslangic | Bitis | Kampanya | Icerik Sayisi |
|-----------|-------|----------|---------------|
| | | | |

---

## PERFORMANS TAKIBI
(sonradan doldur)

| Tarih | Platform | Etkilesim | Erisim | Tiklama | Not |
|-------|----------|-----------|--------|---------|-----|
| | | | | | |

## NOTLAR
- Genel strateji: [not]
- Onceki donem ogrenimleri: [not]

## META
- Dosya: ${getDateString()}-takvim-${slugify(donem)}.md
`,

		marka: () => `# Marka Sesi Rehberi

**Marka:** [marka adi]
**Tarih:** ${getDateString()}
**Versiyon:** v1.0

---

## KISILIK
- **3 Sifat:** [sifat1], [sifat2], [sifat3]
- **Insan Karsiligi:** [yas, meslek, kisilik tanimi]
- **Kahraman:** [Biz / Musteri / Topluluk]
- **Uyandirilan Duygu:** [guven / heyecan / huzur / ilham]

## FARKLILIK
- **Rakiplerden Farki:** [tek cumle]
- **Tercih Edilme Sebebi:** [musteri geri bildirimi]

---

## TON SPEKTRUMU (1-10)

| Eksen | Konum | Not |
|-------|-------|-----|
| Resmi <-> Samimi | [1-10] | |
| Ciddi <-> Eglenceli | [1-10] | |
| Teknik <-> Sade | [1-10] | |
| Guvenli <-> Cesur | [1-10] | |
| Kisa <-> Detayli | [1-10] | |
| Sakin <-> Enerjik | [1-10] | |
| Ogrenici <-> Ogreten | [1-10] | |

---

## DIL KURALLARI

### Hitap
- **Sekil:** [sen / siz]
- **Cokluk:** [biz / marka adi / ben]

### Kullanilacak Kelimeler
- [kelime1]
- [kelime2]
- [kelime3]

### Kacinilacak Kelimeler
- [klise1 — ornek: "dunya lideri"]
- [klise2]
- [rakip terimleri]

### Emoji Politikasi
| Platform | Kullanim | Tercih Edilen |
|----------|----------|---------------|
| Instagram | Serbest | |
| Twitter/X | Orta | |
| LinkedIn | Kisitli | |
| TikTok | Serbest | |

### Noktalama
- Unlem: [serbest / sinirli / yok]
- Buyuk harf vurgu: [evet / hayir]
- Hashtag stili: [#kelimekelime / #Kelimekelime]

---

## PLATFORM TONLARI

### Instagram
[ton kaymasi ve ozel notlar]

### Twitter/X
[ton kaymasi ve ozel notlar]

### LinkedIn
[ton kaymasi ve ozel notlar]

### TikTok
[ton kaymasi ve ozel notlar]

### YouTube
[ton kaymasi ve ozel notlar]

---

## ORNEKLER

### Iyi Ornek Post
\`\`\`
[marka sesine tam uyan ornek]
\`\`\`
**Neden iyi:** [aciklama]

### Kotu Ornek Post
\`\`\`
[marka sesine uymayan ornek]
\`\`\`
**Neden kotu:** [aciklama]

---

## KONTROL LISTESI
- [ ] Hitap sekli dogru mu?
- [ ] Emoji politikasina uyuyor mu?
- [ ] Kacinilacak kelimeler icermiyor mu?
- [ ] Platform tonuna uygun mu?
- [ ] Marka kisiligini yansitiyor mu?
- [ ] CTA marka sesine uygun mu?

## META
- **Dosya:** marka-sesi.md
- **Sonraki Guncelleme:** 3 ayda bir veya buyuk degisiklik
- **Tum icerik komutlari bu dosyayi okur.**
`,
	};
}

