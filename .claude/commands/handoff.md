Handoff briefing command. Enables a smooth transition to another developer or session.

# Gerekli Araclar
- Read (baglam, notlar, gorevler)
- Bash (git durumu)
- Write (teslim dosyasi)

# Prosedur (5 Adim)

### Adim 1: Baglam Toplama
Mevcut durumun tam resmini cikar:
- `memory.md` dosyasini oku
- Gunluk notlari incele
- Git durumunu kontrol et (branch, commit edilmemis degisiklikler)
- Gorev panosunu oku
- Onceki devir notlarini kontrol et

### Adim 2: Basarilari Belgele
Bu donemde tamamlanan isleri listele:
- Tamamlanan ozellikler ve iyilestirmeler
- Cozulen hatalar
- Tamamlanan arastirma veya analizler
- Alinan mimari kararlar ve gerekceleri
- Yapilan refactoring veya temizlik isleri

### Adim 3: On Kosullari Belirle
Alici icin gerekli bilgileri hazirla:
- Gelistirme ortami gereksinimleri
- Ozel konfigur asyon veya erisim ihtiyaclari
- Calistirilmasi gereken migration veya scriptler
- Ortam degiskenleri
- Ucuncu parti servis erisim bilgileri (sirlar haric)

### Adim 4: Alici Baglami Olustur
Devralan kisinin hemen ise baslamasi icin:
- Mevcut branch durumu ve nereye merge edilecegi
- Acik gorevler oncelik sirasina gore
- Bilinen sorunlar ve gecici cozumler (workaround)
- Bloke olan isler ve beklentiler
- Test durumu (gecen/kalan testler)
- Kritik son tarihler

### Adim 5: Teslim Dosyasi Olustur
`handoffs/handoff-[GGAAYY].md` dosyasini olustur:

```markdown
# Is Teslim Brifingi - [tarih]

## Proje Ozeti
[projenin mevcut hali, 2-3 cumle]

## Donem Ozeti
**Baslangic:** [tarih]
**Bitis:** [tarih]
**Odak Alani:** [ana calisma alani]

## Basarilar
- [tamamlanan isler listesi]

## Mevcut Durum

### Branch Durumu
- Aktif Branch: [branch adi]
- Base: [hedef branch]
- Commit Edilmemis Degisiklik: [var/yok]
- CI Durumu: [gecti/kaldi/bekliyor]

### Acik Gorevler (Oncelik Sirasina Gore)
1. **[YUKSEK]** [gorev aciklamasi]
   - Durum: [durum]
   - Sonraki adim: [adim]
2. **[ORTA]** [gorev aciklamasi]
   ...

### Bilinen Sorunlar
- [sorun]: [gecici cozum veya plan]

### Bloke Olan Isler
- [is]: [neden bloke, kimden/neden bekleniyor]

## On Kosullar
- [ortam gereksinimleri]
- [konfigur asyon adimlari]

## Kritik Tarihler
- [tarih]: [ne icin]

## Onemli Dosyalar
- [dosya yolu]: [neden onemli]

## Notlar ve Uyarilar
[dikkat edilmesi gereken ozel durumlar]

## Iletisim
[sorular icin iletisim bilgisi]
```

# Cikti Formati
- `handoffs/handoff-[GGAAYY].md` dosyasi
- Guncellenmis `memory.md` (teslim referansi)
- Terminal ozeti (teslim edilenlerin kisa listesi)
