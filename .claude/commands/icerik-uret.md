Sosyal medya icerik uretme komutu. Belirtilen platform ve tur icin hazir kullanilabilir post, caption, gorsel brief ve hashtag uretir.

# Gerekli Araclar
- Read (marka sesi, onceki icerikler)
- Write (icerik dosyasi)
- Agent (content-creator ajani)

# Prosedur (5 Adim)

### Adim 1: Girdi Topla
Kullanicidan:
- **Platform**: Instagram / Twitter / LinkedIn / TikTok / YouTube / Hepsi
- **Icerik Turu**: Bilgilendirici / Ilham / Eglence / Satis / Topluluk / Egitici
- **Konu/Mesaj**: Ne hakkinda icerik uretilecek?
- **Ton**: Samimi / Profesyonel / Eglenceli / Ilham verici / Provokatif
- **Gorsel**: Gorsel brief de isteniyor mu?
- **Dil**: Turkce / Ingilizce / Her ikisi

### Adim 2: Marka Baglamini Oku
Varsa su dosyalari kontrol et:
- `.claude/workspace/marka-sesi.md` — Marka tonu ve stili
- `.claude/workspace/icerik-gecmisi.md` — Onceki icerikler
- `memory.md` — Mevcut kampanya/proje bilgisi

### Adim 3: Content-Creator Ajanina Devret
Ajana ilet:
- Platform ve icerik turu
- Konu ve ton
- Marka baglami
- Karakter sinirlari

### Adim 4: Varyasyonlar Olustur
Her platform icin en az 2 varyasyon:
- **A versiyon**: Dogrudan, net mesaj
- **B versiyon**: Hikaye anlatimi veya soru ile baslayan

### Adim 5: Paketle ve Kaydet
Icerik paketini olustur:
- Hazir metin (kopyala-yapistir)
- Gorsel brief (istenildiyse)
- Hashtag listesi
- Yayinlama zamanlama onerisi
- `.claude/workspace/icerikler/[tarih]-[konu].md` dosyasina kaydet

# Cikti Formati
```
=== BADI ICERIK URETIMI ===
Platform: [platform]
Konu: [konu]
Tur: [icerik turu]

--- POST A ---
[hazir metin]

Hashtag: [hashtag listesi]
Zamanlama: [onerilen gun ve saat]

--- POST B (varyasyon) ---
[alternatif metin]

--- GORSEL BRIEF ---
[gorsel aciklama + AI prompt]

Dosya: .claude/workspace/icerikler/[tarih]-[konu].md
=============================
```
