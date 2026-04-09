Gorsel brief olusturma komutu. Sosyal medya gorselleri, banner'lar ve video kareleri icin detayli tasarim talimatlar ve AI gorsel prompt'lari uretir.

# Gerekli Araclar
- Read (marka rehberi, onceki gorseller)
- Write (brief dosyasi)
- Agent (visual-director ajani)

# Prosedur (5 Adim)

### Adim 1: Gorsel Ihtiyacini Tanimla
Kullanicidan:
- **Kullanim Alani**: Post gorseli / Story / Karousel / Thumbnail / Banner / Reklam
- **Platform**: Instagram / Twitter / LinkedIn / YouTube / Facebook / Pinterest
- **Icerik**: Gorselde ne olmali? (mesaj, urun, kisi, sahne)
- **Stil Tercihi**: Fotografik / Illustrasyon / Minimalist / 3D / Collage / Tipografik
- **Renk Tercihi**: Marka renkleri / Belirli palet / Serbest
- **Metin**: Gorselde yazi olacak mi? (baslik, alt baslik, CTA)

### Adim 2: Visual-Director Ajanina Devret
Ajana ilet:
- Gorsel spesifikasyonlari
- Marka rehberi (varsa)
- Referans gorseller (varsa)
- Platform boyut gereksinimleri

### Adim 3: Detayli Brief Olustur
Her gorsel icin:
- Kompozisyon aciklamasi (ne nerede duracak)
- Renk paleti (hex kodlariyla)
- Tipografi onerisi
- Arka plan detayi
- Isik ve atmosfer

### Adim 4: AI Prompt'lari Uret
Farkli araclar icin optimize edilmis prompt'lar:
- **Midjourney**: `/imagine` formatinda, stil parametreleri ile
- **DALL-E**: Dogal dil aciklamasi, detayli
- **Flux/Stable Diffusion**: Teknik parametreler dahil
- **Canva**: Sablon ve eleman onerileri

### Adim 5: Kaydet
`.claude/workspace/gorseller/[tarih]-[konu]-brief.md` dosyasina kaydet.

# Cikti Formati
```
=== BADI GORSEL BRIEF ===
Kullanim: [alan]
Platform: [platform]
Boyut: [genislik x yukseklik]

--- BRIEF ---
[Detayli gorsel aciklamasi]

--- RENK PALETI ---
Birincil: [#hex] [isim]
Ikincil: [#hex] [isim]
Vurgu: [#hex] [isim]
Arka plan: [#hex]

--- TIPOGRAFI ---
Baslik: [font], [boyut], [renk]
Govde: [font], [boyut], [renk]

--- AI PROMPTLAR ---
Midjourney: [prompt]
DALL-E: [prompt]

--- CANVA NOTU ---
[Tasarimci icin ek talimatlar]

Dosya: .claude/workspace/gorseller/[dosya]
==========================
```
