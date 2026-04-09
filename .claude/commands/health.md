Sistem sagligi kontrolu. Bagimliliklari, guvenligi ve performansi uclu tarama ile denetler.

# Gerekli Araclar
- Bash (npm audit, sistem komutlari)
- Read (konfigur asyon dosyalari)
- Glob (proje dosya taramasi)
- Grep (kalip arama)
- Agent (security-scanner: guvenlik taramasi, performance-profiler: performans analizi)

# Calisma Zamanlamas i
Bu komut ozellikle Pazartesi sabahlarinda `/start` sonrasinda calistirilmasi onerilir.
Haftalik rutin olarak saglik kontrolu yapilmasi projeyi saglkli tutar.

---

## Kontrol 1: Bagimlilik Denetimi

### Adim 1: Paket Yoneticisini Tespit Et
- `package.json` varsa npm/yarn/pnpm kullan
- `Cargo.toml` varsa cargo kullan
- `pyproject.toml` veya `requirements.txt` varsa pip kullan

### Adim 2: Audit Taramas i Calistir
- npm projelerinde `npm audit --json` calistir
- Sonuclari ciddiyet seviyesine gore siniflandir (critical, high, moderate, low)
- Guncellenmesi gereken paketleri listele

### Adim 3: Bagimlilik Durum Degerlendirmesi
- YESIL: Kritik veya yuksek seviye acik yok
- SARI: Sadece moderate seviye aciklar var
- KIRMIZI: Critical veya high seviye aciklar mevcut

---

## Kontrol 2: Guvenlik Taramasi

### Adim 4: Security-Scanner Ajanini Cagir
Agent aracini kullanarak security-scanner ajanini calistir:
- Sabit kodlu sirlar icin kod taramasi yap (.env, API anahtarlari, tokenlar)
- Guvenlik basliklarini kontrol et (CORS, CSP, X-Frame-Options)
- Auth konfigurasyonunu incele
- Bilinen guvenlik acigi kaliplarini ara (SQL injection, XSS vektorleri)

### Adim 5: Guvenlik Durum Degerlendirmesi
- YESIL: Bilinen guvenlik sorunu yok
- SARI: Dusuk riskli bulgular veya iyilestirme onerileri var
- KIRMIZI: Kritik guvenlik acigi tespit edildi

---

## Kontrol 3: Performans Analizi

### Adim 6: Performance-Profiler Ajanini Cagir
Agent aracini kullanarak performance-profiler ajanini calistir:
- Build/paket boyutlarini olc
- Karmasik fonksiyonlari tespit et (yuksek siklomatik karmasiklik)
- Gereksiz bagimliliklari bul
- Onbellek stratejilerini degerlendir

### Adim 7: Performans Durum Degerlendirmesi
- YESIL: Performans metrikleri kabul edilebilir sinirlar icinde
- SARI: Iyilestirme firsatlari mevcut ama kritik degil
- KIRMIZI: Ciddi performans sorunlari tespit edildi

---

## Birlestirmis Saglik Rapor Karti

### Adim 8: Rapor Olustur
Asagidaki formatta birlestirilmis rapor sun:

```
╔══════════════════════════════════════════╗
║        BADI SISTEM SAGLIK RAPORU         ║
║        Tarih: [GG.AA.YYYY]              ║
╠══════════════════════════════════════════╣
║                                          ║
║  Bagimlilik Denetimi:  [YESIL/SARI/KIR] ║
║  > [kisa aciklama]                       ║
║                                          ║
║  Guvenlik Taramasi:    [YESIL/SARI/KIR] ║
║  > [kisa aciklama]                       ║
║                                          ║
║  Performans Analizi:   [YESIL/SARI/KIR] ║
║  > [kisa aciklama]                       ║
║                                          ║
╠══════════════════════════════════════════╣
║  Genel Durum: [SAGLIKLI / DIKKAT / ACIL]║
║                                          ║
║  Onerilen Aksiyonlar:                    ║
║  1. [varsa en onemli aksiyon]            ║
║  2. [varsa ikinci aksiyon]               ║
║  3. [varsa ucuncu aksiyon]               ║
╚══════════════════════════════════════════╝
```

### Adim 9: Genel Durum Belirleme
- SAGLIKLI: Tum kategoriler YESIL
- DIKKAT: En az bir kategori SARI, hicbiri KIRMIZI degil
- ACIL: En az bir kategori KIRMIZI

### Adim 10: Takip Onerileri
- KIRMIZI durumlar icin acil gorev olusturmayi oner
- SARI durumlar icin haftalik plana eklemeyi oner
- Bir sonraki saglik kontrolu tarihini hatrlat
