Professional report command. Turns raw data and findings into professional, audience-appropriate reports.

# Gerekli Araclar
- Read (veri kaynaklari)
- Write (rapor dosyasi)
- Grep (veri taramasi)
- Glob (kaynak bulma)
- Bash (veri isleme)

# Prosedur (5 Adim)

### Adim 1: Girdileri Netlestir
Kullanicidan su bilgileri al:

- **Konu:** Rapor ne hakkinda?
- **Veri Kaynaklari:** Hangi veriler kullanilacak? (dosyalar, metrikler, analizler)
- **Hedef Kitle:** Kim okuyacak? (Yonetici / Teknik / Musteri)
- **Amac:** Rapor ne icin kullanilacak? (karar destek, bilgilendirme, ikna)
- **Format Tercihi:** Varsayilan: profesyonel, net, jargonsuz
- **Uzunluk:** Kisa (1-2 sayfa) / Standart (3-5 sayfa) / Detayli (5+ sayfa)
- **Aciliyet:** Normal / Acil (hizli taslak)

### Adim 2: Kaynak Toplama
Tum ilgili verileri derle:

- **Nicel Veriler:** Metrikler, istatistikler, olcumler
- **Nitel Veriler:** Gozlemler, geri bildirimler, degerlendirmeler
- **Trendler:** Zaman serisi verileri, degisim oranlari
- **Karsilastirmalar:** Hedefler vs gerceklesenler, onceki donem vs mevcut
- **Anomaliler:** Normal disi durumlar ve aciklamalari
- **Dissal Faktorler:** Sonuclari etkileyen dis etkenler

Eksik veri varsa kullaniciya bildir ve ya topla ya da varsayim belirt.

### Adim 3: Hedef Kitleye Gore Yapilandir

**Tip A: Yonetici Raporu**
- Sonuc once, detay sonra (piramit yapisi)
- Madde isaretleri ve kisa paragraflar
- Karar metrikleri ve KPI'lar on planda
- Maksimum 2 sayfa ana govde
- Gorsel ozetler (tablo ve grafik aciklamalari)
- Net oneriler ve sonraki adimlar
- Jargon yok, is dili kullan

**Tip B: Teknik Rapor**
- Metodoloji ve veri kaynaklari detayli
- Teknik terminoloji serbest
- Veri tablolari ve detayli analizler
- Uyarilar ve sinirliliklar bolumu
- Kaynak referanslari ve atiflar
- Yeniden uretilebilirlik bilgisi
- Ek (appendix) bolumleri

**Tip C: Musteri Raporu**
- Sonuclar ve ROI vurgusu
- Baglamsal rakamlar (yuzde, karsilastirmali)
- Gorsel formatlar (tablo, liste, on plana cikarilmis metrikler)
- Basarilar ve deger gosterimi
- Anlasilir dil, teknik detay minimum
- Sonraki adimlar ve beklentiler
- Profesyonel ve guven veren ton

### Adim 4: Rapor Yaz
Secilen tipe gore raporu olustur:

```markdown
# [Rapor Basligi]
**Tarih:** [tarih]
**Hazirlayan:** [isim]
**Donem:** [kapsam]
**Gizlilik:** [seviye]

## Yonetici Ozeti
[2-3 paragraf: temel bulgular, sonuclar, oneriler]

## Temel Bulgular
### Bulgu 1: [baslik]
[detay, veri destegi, etki]

### Bulgu 2: [baslik]
[detay, veri destegi, etki]

### Bulgu 3: [baslik]
[detay, veri destegi, etki]

## Detayli Analiz
[konu bazli derinlemesine inceleme]

## Veriler ve Metrikler
| Metrik | Onceki | Mevcut | Degisim | Hedef |
|--------|--------|--------|---------|-------|
| ... | ... | ... | ... | ... |

## Oneriler
### Kisa Vadeli
1. [oneri ve beklenen etki]

### Orta Vadeli
1. [oneri ve beklenen etki]

### Uzun Vadeli
1. [oneri ve beklenen etki]

## Sonraki Adimlar
1. [adim, sorumluluk, tarih]
2. [adim, sorumluluk, tarih]

## Ekler
[ek tablolar, ham veriler, metodoloji detaylari]
```

### Adim 5: Kalite Kontrol
Raporu su kriterlerle degerlendir:

**Icerik Kontrolu:**
- [ ] Her iddia veri ile desteklenmis mi?
- [ ] Varsayimlar acikca belirtilmis mi?
- [ ] Sinirliliklar not edilmis mi?
- [ ] Oneriler uygulanabilir ve somut mu?

**Format Kontrolu:**
- [ ] Hedef kitleye uygun dil kullanilmis mi?
- [ ] Yapi mantiksal sirayla akmis mi?
- [ ] Tablolar ve listeler dogru formatli mi?
- [ ] Baslik hiyerarsisi tutarli mi?

**Tutarlilik Kontrolu:**
- [ ] Rakamlar tutarli mi? (yuzde, toplam, detay)
- [ ] Ozet ile detay uyumlu mu?
- [ ] Oneriler bulgularla desteklenmis mi?
- [ ] Onceki raporlarla celisiyor mu?

**Son Kontrol:**
- [ ] Yazim ve dilbilgisi kontrol edildi mi?
- [ ] Hassas bilgi uygun isaretlenmis mi?
- [ ] Tarih ve donem bilgileri dogru mu?

# Cikti Formati
```
=== BADI RAPOR ===
Baslik: [rapor basligi]
Tip: [Yonetici/Teknik/Musteri]
Uzunluk: [sayfa sayisi]
Tarih: [tarih]

Temel Bulgular: [sayi]
Oneriler: [sayi]
Kalite Skoru: [yuzde]%

Dosya: [dosya yolu]
==================
```
