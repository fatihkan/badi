Icerik takvimi olusturma komutu. Haftalik veya aylik sosyal medya icerik plani, temalar, platformlar ve zamanlama ile birlikte olusturur.

# Gerekli Araclar
- Read (marka sesi, onceki icerikler, hedefler)
- Write (takvim dosyasi)
- Agent (content-creator ajani)

# Prosedur (5 Adim)

### Adim 1: Takvim Parametreleri
Kullanicidan:
- **Donem**: Bu hafta / Gelecek hafta / Bu ay / Ozel aralik
- **Platformlar**: Hangi platformlara icerik uretilecek?
- **Siklik**: Gunde kac post? Haftada kac video?
- **Temalar/Konular**: Odak alanlari, kampanyalar, ozel gunler
- **Hedef**: Takipci buyume / Etkilesim / Satis / Marka bilinirlik
- **Kaynalik**: Mevcut icerik var mi? (blog, urun, etkinlik)

### Adim 2: Tema Haritasi Olustur
Haftanin/ayin temalarini belirle:
- **Pazartesi**: Motivasyon / Hafta baslangici
- **Sali**: Egitici icerik / Ipucu
- **Carsamba**: Perde arkasi / Topluluk
- **Persembe**: Urun/Hizmet tanitimi
- **Cuma**: Eglence / Trend
- **Cumartesi**: UGC / Topluluk
- **Pazar**: Ilham / Haftalik ozet

(Kullanicinin sektorune gore uyarla)

### Adim 3: Icerik Matrisini Doldur
Her gun icin:
| Tarih | Platform | Tur | Konu | Format | Durum |
|-------|----------|-----|------|--------|-------|
| [tarih] | Instagram | Karousel | [konu] | 5 kare | Planli |
| [tarih] | Twitter/X | Thread | [konu] | 5 tweet | Planli |
| [tarih] | TikTok | Reel | [konu] | 30s video | Planli |

### Adim 4: Her Icerik Icin Ozet Brief
Her planli icerik icin kisa brief:
- Mesaj ozeti (1-2 cumle)
- Gorsel/video turu
- CTA (cagri)
- Hashtag grubu
- Ozel not (trend ses, ozel gun vb.)

### Adim 5: Kaydet ve Izle
- `.claude/workspace/takvim/[ay]-icerik-takvimi.md` dosyasina kaydet
- Onemli tarihleri isaretle (ozel gunler, kampanya tarihleri)
- Performans izleme kolonlarini ekle (sonradan doldurulmak uzere)

# Cikti Formati
```
=== BADI ICERIK TAKVIMI ===
Donem: [baslangic] - [bitis]
Platformlar: [liste]
Toplam Icerik: [sayi]

--- HAFTA 1 ---
| Gun | Platform | Format | Konu | Durum |
|-----|----------|--------|------|-------|
| Pzt | IG Post | Karousel | ... | Planli |
| Sal | Twitter | Thread | ... | Planli |
| ...

--- OZEL GUNLER ---
[tarih]: [ozel gun/etkinlik] - [planlanan icerik]

--- NOTLAR ---
[genel strateji notlari]

Dosya: .claude/workspace/takvim/[dosya]
=============================
```
