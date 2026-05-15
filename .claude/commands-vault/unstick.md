Tikaniklik cozme komutu. Takili kaldiginda yapisal bir yaklasimla hizli cozum bulur.

# Gerekli Araclar
- Read (kod ve baglam okuma)
- Grep (hata ve kalip arama)
- Glob (dosya bulma)
- Bash (test calistirma, hata ayiklama)

# Baslangic Formati
Kullanicidan: "[Y] nedeniyle [X]'de takildim"
Ornek: "CORS hatasi nedeniyle API entegrasyonunda takildim"

# Prosedur (5 Adim)

### Adim 1: Engeli Yakala
Kullanicidan su bilgileri topla:
- **Ne:** Hangi gorevde/islemde takili? (X)
- **Neden:** Engelin dograsi/sebebi nedir? (Y)
- **Denenenler:** Simdiye kadar ne denendi?
- **Hata Mesaji:** Varsa gercek hata ciktisi
- **Beklenen Sonuc:** Ne olmasini bekliyordu?
- **Gerceklesen:** Bunun yerine ne oldu?
- **Ortam:** Hangi ortamda? (yerel, staging, production)

### Adim 2: Siniflandir
Engeli 5 kategoriden birine ata:

**A) Bilgi Eksikligi**
- Eksik veri, dokumantasyon veya API bilgisi
- Cozum: Ilgili kaynakllari bul ve incele
- Araclar: Grep, Read, dokumantasyon taramasi

**B) Karar Felci**
- Birden fazla secenek arasinda takili kalma
- Cozum: Secenekleri karsilastirmali analiz et, artilari/eksileri listele
- Yaklasim: "Geri donulebilir mi?" sorusuyla basla, geri donulebilirce en basitini sec

**C) Dongusel Hata Ayiklama**
- Ayni hataya tekrar tekrar dusme
- Cozum: Varsayimlari sorgula, sorun alanini daralt
- Yaklasim: Ikili arama (binary search) - sorunun nerede oldugunu sistematik daralt

**D) Kapsam Karisikligi**
- Ne yapilacagi belirsiz, gereksinimler muglak
- Cozum: Gereksinimleri netlestir, en kucuk ise yarar parcayi belirle
- Yaklasim: "Yapilabilecek en kucuk sey nedir?" sorusu

**E) Ortam Sorunlari**
- Yapilandirma, bagimlilik, erisim, versiyon uyumsuzlugu
- Cozum: Ortam kontrolu, bagimlilik dogrulamasi
- Yaklasim: Temiz ortamda tekrarlama, izolasyon testi

### Adim 3: Analizci Ajanini Etkinlestir
Siniflandirmaya gore analiz baslat:

**Bilgi toplama:**
- Ilgili kodu oku ve baglamini anla
- Hata mesajini arastir
- Benzer sorunlarin cozumlerini ara
- Dokumantasyonu kontrol et

**Kok neden analizi:**
- 5 Neden teknigini uygula (Why-Why-Why)
- Varsayim listesi cikar ve her birini dogrula
- Sorun alanini en dar hale getir
- Yeniden uretilip uretilemeyecigini kontrol et

**Cozum uretimi:**
- En az 2, en fazla 4 cozum onerisi sun
- Her oneri icin: ne yapilacak, risk seviyesi, tahmini sure
- En hizli sonuc verecek oneriyi isaretle (quick win)

### Adim 4: Oneriyi Uygula
En uygun oneriyi sec ve hemen uygula:
- Oneriyi adim adim yap
- Her adimda sonucu dogrula
- Islemezse sonraki oneriye gec
- Tum oneriler basarisiz olursa, yeni bilgiyle Adim 3'e don

### Adim 5: Cozumu Belgele
Cozumu kalici hale getir:

**Gunluk Nota Ekle:**
```markdown
## Tikaniklik Cozumu - [saat]
- **Engel:** [X] - [Y]
- **Kategori:** [A-E]
- **Kok Neden:** [gercek sebep]
- **Cozum:** [uygulanan cozum]
- **Sure:** [harcanan sure]
- **Ogrenin:** [cikarilan ders]
```

**Tekrar Kontrolu:**
- Bu sorun daha once yasandi mi? (tekrarlayan kalip kontrolu)
- Tekrarliyorsa, kalici cozum icin `knowledge-base.md`'ye ekle
- Otomasyon firsati var mi? (hook veya script ile onlenebilir mi?)

# Cikti Formati
```
=== BADI TIKANIKLIK COZUMU ===
Engel: [X] - [Y]
Kategori: [A-E]: [kategori adi]
Sure: [cozum suresi]

Kok Neden: [aciklama]
Uygulanan Cozum: [ne yapildi]
Sonuc: COZULDU / KISMI / DEVAM EDIYOR

Ogrenin: [cikarilan ders]
Tekrar Riski: DUSUK / ORTA / YUKSEK
[Yuksekse: Kalici cozum onerisi]
===============================
```

# Hizli Ipuclari
- Bazi tikanikliklar 5 dakika mola ile cozulur - bunu da oner
- "Geri donulebilir mi?" sorusu karar felcini kirder
- Hata mesajini kelimesi kelimesine aramak cogu zaman cozumu bulur
- Sorunu baskasina aciklamak (rubber duck debugging) tek basina cozebilir
