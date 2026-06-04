Documentation audit command. Evaluates completeness, freshness, and quality of technical documentation.

# Gerekli Araclar
- Read (dokumantasyon dosyalari)
- Grep (referans taramasi)
- Glob (dosya bulma)
- Bash (git log, dosya tarihleri)

# Prosedur (5 Adim)

### Adim 1: Dokumantasyon Envanteri
Tum dokumantasyon dosyalarini tara:
- README.md dosyalari (kok + alt dizinler)
- API dokumantasyonu
- Mimari dokumantasyon (ADR'ler dahil)
- Kullanici kilavuzlari
- Gelistirici kilavuzlari
- Kurulum/baslatma talimatlari
- CHANGELOG, CONTRIBUTING, SECURITY
- Kod ici yorumlar (JSDoc, docstring vb.)

### Adim 2: Tamllik Kontrolu
Her dokuman icin kontrol et:
- [ ] Guncel mi? (son degisiklik tarihi vs ilgili kod degisikligi)
- [ ] Referans edilen dosya/fonksiyonlar hala mevcut mu?
- [ ] Kurulum adimlari calisir durumda mi?
- [ ] Kod ornekleri guncel mi?
- [ ] Kirik linkler var mi?
- [ ] Eksik bolumler var mi?

### Adim 3: Kapsam Boslugu Analizi
Belgelenmemis alanlari tespit et:
- Dokumantasyonu olmayan public API'ler
- README'si olmayan onemli dizinler
- Aciklamasi olmayan konfigur  asyon dosyalari
- Belgelenmemis ortam degiskenleri
- Eksik hata kodu aciklamalari

### Adim 4: Kalite Degerlendirmesi
- Tutarli format ve ton kullaniliyor mu?
- Hedef kitle icin uygun seviye mi?
- Kod ornekleri calisir durumda mi?
- Gorseller/diyagramlar guncel mi?

### Adim 5: Rapor ve Aksiyon Plani
Bulgulari onceliklendir:
- **KRITIK**: Yanlis/yaniltici bilgi
- **YUKSEK**: Tamamen eksik dokumantasyon
- **ORTA**: Guncel olmayan icerik
- **DUSUK**: Iyilestirilebilir format/stil

# Cikti Formati
```
=== BADI DOKUMANTASYON DENETIMI ===
Taranan Dosya: [sayi]
Kapsam Skoru: [yuzde]%

KRITIK: [sayi] bulgu
YUKSEK: [sayi] bulgu
ORTA: [sayi] bulgu
DUSUK: [sayi] bulgu

En Acil: [ilk 3 aksiyon]
===================================
```
