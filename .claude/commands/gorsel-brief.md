Gorsel brief olusturma komutu. Sosyal medya gorselleri, bannerlar ve video kareleri icin detayli tasarim talimatlar, renk paletleri ve AI gorsel promptlari uretir.

# Gerekli Araclar
- Read (marka rehberi, onceki gorseller, proje baglami)
- Write (brief dosyasi)
- Grep (marka renk/font referanslari)
- Glob (mevcut gorsel brief arsivi)
- Bash (tarih ve dizin islemleri)

# Prosedur (6 Adim)

### Adim 1: Gorsel Ihtiyacini Tanimla
Kullanicidan su bilgileri al:

- **Kullanim Alani:**
  - Post gorseli (tek kare)
  - Story / Reel kapak
  - Karousel (coklu kare — kac kare?)
  - YouTube thumbnail
  - Banner / Cover (Facebook, LinkedIn, Twitter)
  - Reklam gorseli (Meta Ads, Google Ads)
  - Blog baslik gorseli
  - E-posta baslik gorseli
  - Infografik
  - Pinterest pin

- **Platform:** Instagram / Twitter / LinkedIn / YouTube / Facebook / Pinterest / Blog / E-posta / Reklam / Diger

- **Icerik:** Gorselde ne olmali?
  - Ana mesaj veya baslik
  - Urun, kisi, sahne veya soyut konsept
  - Marka ogeleri (logo, slogan)
  - Veri veya istatistik (infografik icin)

- **Stil Tercihi:**
  - Fotografik (gercek foto estetigi)
  - Minimalist (sade, bosluklu, modern)
  - Illustrasyon (cizim, vektor)
  - 3D Render (boyutlu objeler)
  - Collage (karisik medya)
  - Tipografik (yazi odakli)
  - Gradient (renk gecisli arka plan)
  - Flat Design (duz, golgesiz)
  - Retro / Vintage
  - Neon / Cyberpunk

- **Renk Tercihi:** Marka renkleri / Belirli palet / Serbest / Mevsimsel
- **Metin:** Gorselde yazi olacak mi? (baslik, alt baslik, CTA, istatistik)
- **Ton:** Ciddi / Eglenceli / Luks / Teknik / Sicak / Soguk

### Adim 2: Marka Rehberini Yukle
Varsa marka dosyalarindan bilgi cikar:

- `.claude/workspace/marka-sesi.md` — Marka renkleri, fontlar, stil
- Onceki gorsel briefler — `.claude/workspace/gorseller/` dizini
- Marka logosu ve kullanim kurallari

Marka rehberi yoksa:
- Kullanicidan temel bilgileri al (birincil renk, font tercihi)
- Veya serbest tasarim modunda devam et

### Adim 3: Boyut ve Teknik Ozellikler
Platforma gore otomatik boyut belirle:

| Kullanim | Boyut (px) | En-Boy Orani | Dosya Formati |
|----------|-----------|-------------|---------------|
| Instagram Kare | 1080x1080 | 1:1 | PNG/JPG |
| Instagram Dikey | 1080x1350 | 4:5 | PNG/JPG |
| Instagram Story/Reel | 1080x1920 | 9:16 | PNG/JPG |
| Twitter/X Post | 1600x900 | 16:9 | PNG/JPG |
| LinkedIn Post | 1200x627 | 1.91:1 | PNG/JPG |
| LinkedIn Banner | 1584x396 | 4:1 | PNG/JPG |
| Facebook Post | 1200x630 | 1.91:1 | PNG/JPG |
| Facebook Cover | 820x312 | 2.63:1 | PNG/JPG |
| YouTube Thumbnail | 1280x720 | 16:9 | PNG/JPG |
| YouTube Banner | 2560x1440 | 16:9 | PNG |
| Pinterest Pin | 1000x1500 | 2:3 | PNG/JPG |
| Blog Header | 1200x628 | 1.91:1 | PNG/JPG |
| E-posta Header | 600x200 | 3:1 | PNG/JPG |
| Meta Ads (kare) | 1080x1080 | 1:1 | PNG/JPG |
| Meta Ads (dikey) | 1080x1350 | 4:5 | PNG/JPG |
| Google Ads Banner | 1200x628 | 1.91:1 | PNG/JPG |

### Adim 4: Detayli Gorsel Brief Olustur
Her gorsel icin su bolumleri yaz:

**Kompozisyon:**
- Ana odak noktasi nerede? (orta, uc'te bir, alt/ust)
- Gorsel hiyerarsi (en onemli oge en buyuk)
- Bos alan (negative space) kullanimi
- Simetri veya asimetri tercihi

**Renk Paleti:**
- Birincil renk: [#hex] — [kullanim: arka plan / vurgu]
- Ikincil renk: [#hex] — [kullanim]
- Vurgu rengi: [#hex] — [CTA butonu, onemli metin]
- Arka plan: [#hex veya gradient tanimi]
- Metin rengi: [#hex] — [kontrast orani notu]

**Tipografi (metin varsa):**
- Baslik: [font onerisi], [boyut], [kalinlik], [renk]
- Alt baslik: [font], [boyut], [kalinlik], [renk]
- Govde: [font], [boyut], [renk]
- CTA: [font], [boyut], [arka plan rengi], [metin rengi]

**Arka Plan:**
- Duz renk / Gradient / Fotograf / Doku / Soyut
- Detayli aciklama

**Objeler ve Elemanlar:**
- Ana obje (urun, kisi, ikon vb.)
- Destekleyici elemanlar (serit, cerceve, ok, badge)
- Logo konumu ve boyutu
- Dekoratif ogeler (nokta, cizgi, sekil)

### Adim 5: AI Gorsel Promptlari Olustur
Her gorsel icin 3 farkli AI araci icin prompt yaz:

**Midjourney Prompt:**
```
/imagine [ana aciklama], [stil], [atmosfer], [teknik detay] --ar [en-boy] --v 6.1 --style raw
```
Kurallar:
- Ingilizce yaz (en iyi sonuc)
- Stil parametreleri: `--style raw` (dogal), `--stylize 50-200`
- Cozunurluk: `--ar 1:1`, `--ar 4:5`, `--ar 16:9` vb.
- Kalite: `--q 2` (yuksek detay)
- Negatif prompt: `--no [istenmeyen oge]`

**DALL-E Prompt:**
```
[Detayli dogal dil aciklamasi, stil ve atmosfer dahil]
```
Kurallar:
- Turkce veya Ingilizce
- Net, betimleyici cumleler
- Stil ve duygu acikca belirt
- Boyut: 1024x1024, 1792x1024, veya 1024x1792

**Flux/Stable Diffusion Prompt:**
```
[pozitif prompt], [stil etiketleri], [teknik parametreler]
Negative: [istenmeyen ogeler]
```
Kurallar:
- Etiket bazli (virgulla ayrilmis)
- Steps: 30-50, CFG: 7-12
- Sampler: DPM++ 2M Karras

### Adim 6: Canva/Figma Notu ve Kaydet
Tasarimci araci icin ek talimatlar:

**Canva Notu:**
- Onerilen sablon kategorisi
- Kullanilacak oge turleri (metin kutusu, sekil, ikon)
- Katman sirasi (arka plan → objeler → metin → logo)

**Figma Notu:**
- Frame boyutu
- Auto layout onerileri
- Bilesen yapisi

Kaydet: `.claude/workspace/gorseller/[YYYY-MM-DD]-[konu]-brief.md`

# Cikti Formati
```
=== BADI GORSEL BRIEF ===
Kullanim: [alan]
Platform: [platform]
Boyut: [genislik x yukseklik px]
Stil: [stil adi]
Tarih: [tarih]

-------------------------------------------
GORSEL ACIKLAMASI
-------------------------------------------
[Detayli kompozisyon, objeler, atmosfer aciklamasi]

-------------------------------------------
RENK PALETI
-------------------------------------------
Birincil:  [#hex] ██ [isim/kullanim]
Ikincil:   [#hex] ██ [isim/kullanim]
Vurgu:     [#hex] ██ [isim/kullanim]
Arka plan: [#hex] ██
Metin:     [#hex] ██

-------------------------------------------
TIPOGRAFI
-------------------------------------------
Baslik: [font] / [boyut]px / [kalinlik] / [#renk]
Alt baslik: [font] / [boyut]px / [#renk]
CTA: [font] / [boyut]px / BG:[#hex] FG:[#hex]

-------------------------------------------
AI PROMPTLAR
-------------------------------------------

Midjourney:
/imagine [prompt] --ar [oran] --v 6.1 --style raw

DALL-E:
[prompt]

Flux:
[prompt]
Negative: [negative prompt]

-------------------------------------------
CANVA/FIGMA NOTU
-------------------------------------------
[tasarimci icin ek talimatlar]

-------------------------------------------
META
-------------------------------------------
Dosya: .claude/workspace/gorseller/[dosya-adi].md
Marka Uyumu: [evet — marka-sesi.md kullanildi / hayir — serbest]
==========================
```

# Stil Referans Tablosu
| Stil | Ornek Kullanim | Uygun Platformlar | Ton |
|------|---------------|-------------------|-----|
| Minimalist | Tech urun, SaaS | LinkedIn, Twitter | Profesyonel |
| Fotografik | Yasam tarz, gida, seyahat | Instagram, Pinterest | Sicak |
| Illustrasyon | Egitim, cocuk, eglence | Instagram, Blog | Eglenceli |
| Tipografik | Motivasyon, alistilar | Instagram, Twitter | Ilham |
| 3D Render | Teknoloji, oyun | Instagram, YouTube | Modern |
| Gradient | App tanitim, dijital | LinkedIn, Twitter | Modern |
| Flat Design | Infografik, sunum | LinkedIn, Blog | Net |
| Retro | Nostalji, moda, muzik | Instagram, Pinterest | Yaratici |
| Neon | Gece hayati, oyun, muzik | Instagram, TikTok | Enerjik |
| Collage | Moda, sanat, etkinlik | Instagram, Pinterest | Yaratici |
