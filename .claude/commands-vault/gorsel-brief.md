Gorsel brief olusturma komutu. Sosyal medya gorselleri, bannerlar ve video kareleri icin detayli tasarim talimatlar, renk paletleri ve AI gorsel promptlari uretir.

# Gerekli Araclar
- Read (marka rehberi, onceki gorseller, proje baglami) -- Write (brief dosyasi) -- Grep (marka renk/font referanslari) -- ...

# Prosedur (6 Adim)

## 1. Gorsel Ihtiyacini Tanimla
Kullanicidan al:
- **Kullanim Alani:** Post (tek kare) / Story / Reel kapak / Karousel (kac kare?) / YouTube thumbnail / ...
- **Platform:** Instagram / Twitter / LinkedIn / YouTube / Facebook / Pinterest / Blog / E-posta / Reklam / Diger
- **Icerik:** Ana mesaj/baslik, urun/kisi/sahne/soyut konsept, marka ogeleri (logo/slogan), veri/istatistik (infografik)
- **Stil:** Fotografik / Minimalist / Illustrasyon / 3D Render / ...
- **Renk:** Marka / Belirli palet / Serbest / Mevsimsel
- **Metin:** Yazi olacak mi? (baslik, alt baslik, CTA, istatistik)
- **Ton:** Ciddi / Eglenceli / Luks / Teknik / Sicak / Soguk

## 2. Marka Rehberini Yukle
- `.claude/workspace/marka-sesi.md` — renkler, fontlar, stil
- `.claude/workspace/gorseller/` — onceki briefler
- Marka logosu ve kullanim kurallari

Yoksa: kullanicidan temel bilgi (birincil renk, font) al veya serbest tasarim modu.

## 3. Boyut ve Teknik Ozellikler
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

## 4. Detayli Brief
- **Kompozisyon:** ana odak (orta/uc'te bir/alt-ust) -- gorsel hiyerarsi -- bos alan kullanimi -- ...
- **Renk Paleti:** birincil [#hex] (arka plan/vurgu) -- ikincil [#hex] -- vurgu [#hex] (CTA, onemli metin) -- ...
- **Tipografi (metin varsa):** baslik [font/boyut/kalinlik/renk] -- alt baslik [...] -- govde [...] -- ...
- **Arka Plan:** duz/gradient/fotograf/doku/soyut + detayli aciklama
- **Objeler:** ana obje (urun/kisi/ikon) -- destekleyici (serit, cerceve, ok, badge) -- logo konum/boyut -- ...

## 5. AI Promptlari (3 arac)
**Midjourney:** `/imagine [aciklama], [stil], [atmosfer], [teknik] --ar [oran] --v 6.1 --style raw`
- Ingilizce -- `--style raw`, `--stylize 50-200` -- `--ar 1:1/4:5/16:9` -- ...

**DALL-E:** `[Detayli dogal dil aciklamasi, stil ve atmosfer dahil]`
- TR/EN -- net betimleyici cumleler -- stil ve duygu acik -- ...

**Flux/Stable Diffusion:** `[pozitif prompt], [stil etiketleri], [teknik]` + `Negative: [istenmeyen]`
- Etiket bazli (virgulle) -- Steps: 30-50, CFG: 7-12 -- Sampler: DPM++ 2M Karras

## 6. Canva/Figma Notu ve Kaydet
- **Canva:** sablon kategorisi -- oge turleri (metin/sekil/ikon) -- katman sirasi (arka plan → objeler → metin → logo)
- **Figma:** frame boyutu -- auto layout -- bilesen yapisi

Kaydet: `.claude/workspace/gorseller/[YYYY-MM-DD]-[konu]-brief.md`

# Cikti Formati
```
[kisaltildi]
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
