Karousel (coklu kare) icerik olusturma komutu. Instagram, LinkedIn ve diger platformlar icin egitici veya hikaye anlatimli karousel icerikleri uretir.

# Gerekli Araclar
- Read (marka sesi, konu, onceki icerikler) -- Write (karousel dosyasi) -- Grep (ilgili icerik) -- ...

# Prosedur (6 Adim)

## 1. Karousel Bilgileri
- **Platform:** Instagram / LinkedIn / Twitter (thread uyarlama) / Facebook / Diger
- **Konu:** detay
- **Amac:** Egitici (ipucu, adim) / Hikaye (deneyim, musteri) / Liste (X sey, X neden, X hata) / Karsilastirma (A vs B, oncesi/sonrasi) / ...
- **Kare Sayisi:** 5-10 (varsayilan 7)
- **Ton:** Samimi / Profesyonel / Eglenceli / Ilham / Teknik
- **Gorsel Stil:** Temiz/Minimalist (beyaz alan) / Renkli-Bold (canli, buyuk tipografi) / Fotografik (foto + overlay) / Illustratif (cizim, ikon) / ...

## 2. Akis Yapisi

**Egitici:** `Kare 1: KAPAK (dikkat + "Kaydet!" CTA) | Kare 2: GIRIS (problem/baglam) | Kare 3-N: ICERIK (her karede 1 ipucu) | Son: OZET + CTA (Takip/Kaydet/Paylas)`

**Hikaye:** `Kare 1: KAPAK (merak) | Kare 2: BASLANGIC (durum/problem) | Kare 3-N: GELISIM | Son-1: SONUC (ders) | Son: CTA ("Sana da oldu mu?")`

**Liste:** `Kare 1: KAPAK ("[Sayi] [konu]") | Kare 2-N: MADDELER (1-2 madde/kare) | Son: BONUS + CTA (Kaydet)`

**Karsilastirma:** `Kare 1: KAPAK ("A vs B" / "Yapma/Yap") | Kare 2-N: sol-sag veya oncesi-sonrasi | Son: SONUC + CTA`

**Soru-Cevap:** `Kare 1: KAPAK ("En cok sorulan X soru") | Kare 2-N: 1 soru+cevap/kare | Son: CTA ("DM at")`

## 3. Her Kare Icerigi
- **Metin:** Baslik (kisa, vurgulu, maks 8 kelime) -- Govde (2-4 cumle veya 3-5 madde) -- Vurgu (bold/renk) -- ...
- **Tasarim:** Arka plan rengi/gorseli -- metin konumu (ust/orta/alt, sol/sag/orta) -- font boyut hiyerarsisi (baslik>govde>not) -- ...
- **Okunabilirlik:** Baslik 2s okunabilir mi -- govde 5s -- metin/arka plan kontrasti -- ...

## 4. Gorsel Tutarlilik
- **Tutarli ogeler:** ayni renk paleti (hafif varyasyon OK) -- ayni font ailesi + hiyerarsi -- birincil/ikincil/vurgu rengi tutarli -- ...
- **Kaydirma motivasyonu:** "Ama en onemlisi..." (kesilme) -- ok isareti (→/↓) -- sayfa numarasi -- ...

## 5. Caption ve Gorsel Brief
**Caption:** ilk satir hook (kesilme noktasi oncesi) -- govde destekleyici bilgi -- CTA (Kaydet/Etiketle/Yorum) -- ...

**Her Kare Brief:**
```
Kare [no]: arka plan [renk/gorsel/gradient] -- metin "[baslik]" + "[govde]" -- konum [ust-orta/orta/alt] -- ...
```

**Canva/Figma:** sablon boyutu (1080x1080 veya 1080x1350) -- katman sirasi (arka plan → gorsel → metin → logo → numara) -- font (baslik + govde) -- ...

## 6. Kaydet ve Paketle
1. `.claude/workspace/icerikler/` kontrol
2. `[YYYY-MM-DD]-karousel-[konu-kebab].md` kaydet
3. Kullaniciya ozet sun

# Cikti Formati
```
[kisaltildi]
```

# Karousel En Iyi Uygulamalar
| Kural | Aciklama |
|-------|----------|
| 1 Kare = 1 Fikir | Her kare tek mesaj |
| Ilk kare = %80 basari | Kapak kaydirmayi belirler |
| 7 kare ideal | 5'ten az sigi, 10'dan fazla yorucu |
| Kaydir motivasyonu | Her kare sonrakini merak ettirsin |
| Son kare = CTA | Kaydet, paylas, takip et |
| Tutarli tasarim | Ayni renk/font/yapi |
| Okunabilirlik | 3 saniyede okunabilir miktar |
| Bos alan | Sikis yok, nefes alani |

# Karousel Turleri ve Performans
| Tur | Kaydetme | Paylasma | Etkilesim | En Uygun Platform |
|-----|---------|---------|-----------|-------------------|
| Egitici | Cok yuksek | Yuksek | Orta | Instagram, LinkedIn |
| Liste | Yuksek | Orta | Orta | Instagram |
| Hikaye | Orta | Yuksek | Cok yuksek | Instagram, LinkedIn |
| Karsilastirma | Yuksek | Orta | Orta | Instagram, Twitter |
| Adim adim | Cok yuksek | Yuksek | Orta | Instagram, LinkedIn |
| Motivasyon | Orta | Cok yuksek | Dusuk | Instagram |
