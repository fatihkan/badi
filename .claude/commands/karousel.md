Karousel (coklu kare) icerik olusturma komutu. Instagram, LinkedIn ve diger platformlar icin egitici veya hikaye anlatimli karousel icerikleri uretir.

# Gerekli Araclar
- Read (marka sesi, konu bilgisi)
- Write (karousel dosyasi)
- Agent (content-creator, visual-director ajanlari)

# Prosedur (5 Adim)

### Adim 1: Karousel Bilgileri
Kullanicidan:
- **Platform**: Instagram / LinkedIn / Twitter (thread) / Diger
- **Konu**: Ne hakkinda?
- **Amac**: Egitici / Hikaye / Liste / Karsilastirma / Adim adim / Infografik
- **Kare Sayisi**: 5-10 arasi (varsayilan: 7)
- **Ton**: Samimi / Profesyonel / Eglenceli

### Adim 2: Akis Yapisi Tasarla
Standart karousel akisi:
```
Kare 1: KAPAK — Dikkat cekici baslik + gorsel
Kare 2: PROBLEM/SORU — Neden onemli?
Kare 3-N: ICERIK — Ana bilgi/adimlar
Son Kare: CTA — "Kaydet", "Paylas", "Takip et"
```

### Adim 3: Her Kare Icin Icerik Yaz
Her kare icin:
- **Baslik**: (kisa, okunabilir)
- **Govde Metni**: (2-4 cumle veya madde)
- **Gorsel Notu**: (arka plan, ikon, resim onerisi)
- **Tasarim Notu**: (renk, font boyutu, yerlesim)

### Adim 4: Gorsel Briefleri Olustur
Visual-director ajanina devret:
- Her kare icin ayri gorsel brief
- Tutarli tasarim dili (ayni palet, font, stil)
- AI gorsel prompt'lari (istenirse)

### Adim 5: Caption ve Kaydet
- Kare altina yazilacak caption metni
- Hashtag listesi
- Zamanlama onerisi
- `.claude/workspace/icerikler/[tarih]-karousel-[konu].md` dosyasina kaydet

# Cikti Formati
```
=== BADI KAROUSEL ===
Platform: [platform]
Konu: [konu]
Kare Sayisi: [sayi]

--- KARE 1: KAPAK ---
Baslik: [metin]
Gorsel: [aciklama]
AI Prompt: [prompt]

--- KARE 2 ---
Baslik: [metin]
Govde: [metin]
Gorsel: [aciklama]

... [diger kareler]

--- SON KARE: CTA ---
Metin: [cagri]
Gorsel: [aciklama]

--- CAPTION ---
[hazir caption metni]

--- HASHTAG ---
[hashtag listesi]

Dosya: .claude/workspace/icerikler/[dosya]
======================
```
