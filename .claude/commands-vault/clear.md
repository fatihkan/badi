Context-clearing command. Provides a seamless transition across session boundaries. Target: under 30 seconds.

# Gerekli Araclar
- Read (baglam dosyalari)
- Write (devir notu ve bellek guncelleme)

# Prosedur (6 Adim)

### Adim 1: Kapilari Sifirla
- Aktif dosya izleme listesini temizle
- Gecici analiz sonuclarini sifirla
- Acik kalan paralel isleri kapat
- Oturum ici degiskenleri temizle

### Adim 2: Oturumu Ozetle (7 Bilesen)
Su 7 bileseni iceren bir ozet olustur:

1. **Aktif Gorev:** Su an uzerinde calisilan gorev nedir?
2. **Durum:** Hangi asamada? (baslangic/orta/tamamlandi/bloke)
3. **Son Eylem:** En son yapilan is neydi?
4. **Sonraki Adim:** Hemen yapilmasi gereken sey nedir?
5. **Acik Sorular:** Cevap bekleyen sorular var mi?
6. **Degisen Dosyalar:** Bu oturumda degistirilen dosyalar
7. **Onemli Baglam:** Sonraki oturumun bilmesi gereken kritik bilgi

### Adim 3: Devir Notu Yaz
`handoffs/handoff-[GGAAYY-SSDD].md` dosyasini olustur:
```markdown
# Devir Notu - [tarih saat]

## Aktif Gorev
[gorev aciklamasi]

## Mevcut Durum
[durum detayi]

## Son Eylemler
- [eylem listesi]

## Sonraki Adimlar
1. [adim]
2. [adim]

## Acik Sorular
- [sorular]

## Degisen Dosyalar
- [dosya listesi]

## Kritik Baglam
[kaybedilmemesi gereken bilgi]
```

### Adim 4: Bellegi Guncelle
`memory.md` dosyasinda:
- Son gorev durumunu guncelle
- Devir notu referansini ekle
- Zaman damgasini guncelle

### Adim 5: Ogrenimleri Tasi
Bu oturumda kazanilan ogrenimleri `knowledge-base.md` dosyasina aktar:
- Teknik bilgiler
- Proje kararlari
- Surec notlari

### Adim 6: Otomatik Devam
Sonraki oturumun baslangiç komutu icin hazirlık yap:
- Devir notunun yolunu belirt
- Oncelikli eylemleri vurgula
- Baslama onerisini sun

# Cikti Formati
```
=== BADI BAGLAM TEMIZLEME ===
Sure: [saniye]s
Devir Notu: handoffs/handoff-[tarih].md
Bellek: GUNCELLENDI
Ogrenimler: [sayi] madde aktarildi

Sonraki Oturum Icin:
> [tek satirlik baslama onerisi]
===============================
```

# Performans Hedefi
- Tum islem 30 saniye altinda tamamlanmali
- Bellek dosyasi 500 satiri gecmemeli
- Devir notu ozlu ve net olmali (gereksiz detay yok)
