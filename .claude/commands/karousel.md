Karousel (coklu kare) icerik olusturma komutu. Instagram, LinkedIn ve diger platformlar icin egitici veya hikaye anlatimli karousel icerikleri uretir.

# Gerekli Araclar
- Read (marka sesi, konu bilgisi, onceki icerikler)
- Write (karousel dosyasi)
- Grep (ilgili icerik arama)
- Glob (kaynak ve arsiv taramasi)
- Bash (tarih ve dizin islemleri)

# Prosedur (6 Adim)

### Adim 1: Karousel Bilgileri
Kullanicidan su bilgileri al:

- **Platform:** Instagram / LinkedIn / Twitter (thread uyarlama) / Facebook / Diger
- **Konu:** Ne hakkinda? (detay ver)
- **Amac:**
  - Egitici (ogreeten, ipucu, adim adim)
  - Hikaye (kisisel deneyim, musteri hikayesi)
  - Liste (X sey, X neden, X hata)
  - Karsilastirma (A vs B, oncesi/sonrasi)
  - Adim adim kilavuz (tutorial)
  - Infografik (veri odakli)
  - Soru-Cevap (SSS formati)
  - Alistilar/Motivasyon (ilham verici seri)
- **Kare Sayisi:** 5-10 arasi (varsayilan: 7)
- **Ton:** Samimi / Profesyonel / Eglenceli / Ilham verici / Teknik
- **Gorsel Stil:**
  - Temiz/Minimalist (cok beyaz alan)
  - Renkli/Bold (canli renkler, buyuk tipografi)
  - Fotografik (fotograf arka plan, metin overlay)
  - Illustratif (cizim, ikon agirlikli)
  - Gradient (renk gecisli arka planlar)
  - Marka sablonu (mevcut tasarim dili)

### Adim 2: Akis Yapisi Tasarla
Karousel turune gore en uygun akisi sec:

**Egitici Akis:**
```
Kare 1: KAPAK — Dikkat cekici baslik + "Kaydet!" CTA
Kare 2: GIRIS — Problem veya baglam
Kare 3-N: ICERIK — Her karede 1 ipucu/adim
Son Kare: OZET + CTA — "Takip et", "Kaydet", "Paylas"
```

**Hikaye Akisi:**
```
Kare 1: KAPAK — Merak uyandiran baslik
Kare 2: BASLANGIC — Durum/problem tanimala
Kare 3-N: GELISISME — Hikayenin akisi
Son-1 Kare: SONUC — Ders/cikartilan anlam
Son Kare: CTA — "Sana da oldu mu? Yorum yap"
```

**Liste Akisi:**
```
Kare 1: KAPAK — "[Sayi] [konu]" basligi
Kare 2-N: MADDELER — Her karede 1-2 madde
Son Kare: BONUS + CTA — Ekstra ipucu + "Kaydet"
```

**Karsilastirma Akisi:**
```
Kare 1: KAPAK — "A vs B" veya "Yapma / Yap"
Kare 2-N: KARSILASTIRMA — Sol/sag veya oncesi/sonrasi
Son Kare: SONUC + CTA
```

**Soru-Cevap Akisi:**
```
Kare 1: KAPAK — "En cok sorulan X soru"
Kare 2-N: SORU+CEVAP — Her karede 1 soru ve cevabi
Son Kare: CTA — "Baska sorun var mi? DM at"
```

### Adim 3: Her Kare Icin Detayli Icerik
Her kare icin su bolumleri yaz:

**Metin Icerigi:**
- **Baslik:** Kisa, okunabilir, vurgulu (maks 8 kelime)
- **Govde:** 2-4 cumle veya 3-5 madde (okunabilir boyut)
- **Vurgu:** Onemli kelime/cumle (bold veya renk ile)
- **Numara/Sira:** Karenin sira numarasi (gorsel rehberlik)

**Tasarim Notlari:**
- Arka plan rengi veya gorseli
- Metin konumu (ust/orta/alt, sol/sag/orta)
- Font boyutu hiyerarsisi (baslik > govde > not)
- Ikon veya gorsel oge (varsa)
- Bos alan kullanimi

**Okunabilirlik Kontrolleri:**
- Baslik: 2 saniyede okunabilir mi?
- Govde: 5 saniyede okunabilir mi?
- Kontrast: Metin arka plandan okunabilir mi?
- Kare basi tek mesaj: 1 kare = 1 fikir

### Adim 4: Gorsel Tutarlilik Plani
Karousel boyunca tasarim tutarliligi sagla:

**Tutarlilik Elemanlari:**
- Arka plan: Tum karelerde ayni palet (hafif varyasyon kabul)
- Font: Ayni font ailesi, ayni boyut hiyerarsisi
- Renk: Birincil + ikincil + vurgu rengi tutarli
- Logo: Ayni konum ve boyut (her karede veya kapak+son)
- Cerceve/kenar: Ayni cerceve stili (varsa)
- Kare numarasi: Ayni konum ve format (1/7, 2/7... veya sadece ikon)
- Gecis hissi: Okuyucunun "kaydir" motivasyonu (ok, kesik metin, merak)

**Kaydirma Motivasyonu:**
Her karenin sonu sonraki kareyi merak ettirmeli:
- "Ama en onemlisi..." (kesilme)
- Ok isareti (→ veya ↓)
- Sayfa numarasi gostergesi
- Yarim bakan gorsel/metin
- "Sonraki karede..." ifadesi

### Adim 5: Caption ve Gorsel Brief
Karousel altindaki metin ve gorsel talimatlar:

**Caption Metni:**
- Ilk satir: Hook (kesilme noktasi oncesi gorunecek)
- Govde: Karousel icerigini destekleyen ek bilgi
- CTA: "Kaydet", "Arkadasini etiketle", "Yorum yap"
- Hashtag: Platform bazli optimize edilmis liste
- Emoji: Marka sesine uygun kullanim

**Her Kare Icin Gorsel Brief:**
```
Kare [numara]:
- Arka plan: [renk/gorsel/gradient]
- Metin: "[baslik]" + "[govde]"
- Metin konumu: [ust-orta / orta / alt]
- Ek oge: [ikon, gorsel, numara]
- AI Prompt: [Midjourney/DALL-E prompt — sadece gorsel gerekiyorsa]
```

**Canva/Figma Talimat:**
- Sablon boyutu: [1080x1080 veya 1080x1350]
- Katman sirasi: arka plan → gorsel → metin → logo → numara
- Font onerileri: [baslik fontu] + [govde fontu]
- Disa aktarma: PNG, sRGB, 72dpi (web)

### Adim 6: Kaydet ve Paketle
Tum ciktiyi duzenle ve kaydet:

1. `.claude/workspace/icerikler/` dizinini kontrol et
2. `[YYYY-MM-DD]-karousel-[konu-kebab].md` dosyasina kaydet
3. Kullaniciya ozet sun

# Cikti Formati
```
=== BADI KAROUSEL ===
Platform: [platform]
Konu: [konu]
Amac: [tur]
Kare Sayisi: [sayi]
Gorsel Stil: [stil]
Tarih: [tarih]

-------------------------------------------
KARE 1: KAPAK
-------------------------------------------
Baslik: [metin — buyuk, dikkat cekici]
Alt Baslik: [varsa]
Gorsel: [arka plan + oge aciklamasi]
Tasarim: [renk, font, konum]
Amac: Dikkat yakalamak, kaydirmaya tesvik

-------------------------------------------
KARE 2: [baslik]
-------------------------------------------
Baslik: [metin]
Govde: [metin — 2-4 cumle veya maddeler]
Gorsel: [arka plan + oge]
Gecis: [sonraki kareye motivasyon — ok, kesilme vb.]

-------------------------------------------
KARE 3: [baslik]
-------------------------------------------
...

-------------------------------------------
KARE [N]: [baslik]
-------------------------------------------
...

-------------------------------------------
SON KARE: CTA
-------------------------------------------
Baslik: [kapanid mesaji]
CTA: [net aksiyon cagrisi]
Gorsel: [arka plan + marka ogeleri]

-------------------------------------------
CAPTION
-------------------------------------------
[Hazir caption metni — kopyala yapistir]

Hook: [ilk satir]
Hashtag: [hashtag listesi]
CTA: [caption icindeki cagri]

-------------------------------------------
GORSEL BRIEF OZETI
-------------------------------------------
Boyut: [genislik x yukseklik]
Stil: [stil]
Renk Paleti: [#hex kodlari]
Font: Baslik: [font] / Govde: [font]
Tutarlilik: [logo konumu, numara formati]

-------------------------------------------
META
-------------------------------------------
Dosya: .claude/workspace/icerikler/[dosya-adi].md
Marka Sesi: [uygulandii / uygulanmadi]
Tahmini Tasarim Suresi: [dakika]
======================
```

# Karousel En Iyi Uygulamalar
| Kural | Aciklama |
|-------|----------|
| 1 Kare = 1 Fikir | Her kare tek mesaj tasimali |
| Ilk kare = %80 basari | Kapak kaydirma kararini belirler |
| 7 kare ideal | 5'ten az sigi, 10'dan fazla yorucu |
| Kaydir motivasyonu | Her karenin sonu sonrakini merak ettirmeli |
| Son kare = CTA | Kaydet, paylas, takip et — net aksiyon |
| Tutarli tasarim | Ayni renk, font, yapi — profesyonel gorunum |
| Okunabilirlik | 3 saniyede okunabilir metin miktari |
| Bos alan | Sikis kaldirma, nefes alani birak |

# Karousel Turleri ve Performans
| Tur | Kaydetme | Paylasma | Etkilesim | En Uygun Platform |
|-----|---------|---------|-----------|-------------------|
| Egitici | Cok yuksek | Yuksek | Orta | Instagram, LinkedIn |
| Liste | Yuksek | Orta | Orta | Instagram |
| Hikaye | Orta | Yuksek | Cok yuksek | Instagram, LinkedIn |
| Karsilastirma | Yuksek | Orta | Orta | Instagram, Twitter |
| Adim adim | Cok yuksek | Yuksek | Orta | Instagram, LinkedIn |
| Motivasyon | Orta | Cok yuksek | Dusuk | Instagram |
