Icerik uretim seansini kapanma komutu. Gun sonunda uretilenleri ozetler, yarin icin hazirlik yapar ve ogrenilenleri not eder.

# Gerekli Araclar
- Read (bugunun icerikleri, notlar)
- Glob (bugun olusturulan dosyalar)
- Grep (placeholder kontrolu)
- Write (gunluk not guncelleme)
- Bash (tarih ve dosya listeleme)

# Prosedur (6 Adim)

### Adim 1: Bugun Uretilenleri Topla
`.claude/workspace/` altindaki bugun tarihli dosyalari bul:
- `icerikler/` — Post ve karousel
- `senaryolar/` — Video
- `gorseller/` — Gorsel brief
- `takvim/` — Takvim guncellemeleri

Her dosya icin:
- Dosya adi
- Icerik turu
- Tamamlanmis mi? (placeholder var mi?)
- Hangi platform icin?

### Adim 2: Tamamlanmislik Kontrolu
Her taslakta placeholder isaretleri ara:
- `[...]` (kose parantezli yer tutucular)
- `TODO`, `TBD`, `FIXME`
- Bos bolumler

**Tamamlanan**: Placeholder yok, yayina hazir
**Kismi**: Bazi yerler dolu, bazilar eksik
**Taslak**: Cogu yer bos

### Adim 3: Yayinlama Planlamasi
Tamamlanan icerikler icin yayinlama zamani onerisi:
- Platform bazli optimal saatler
- Tema uyumu (gun/saat)
- Takvime ekleme onerisi

```
[Icerik] -> [Platform] -> [Gun] [Saat]
```

### Adim 4: Yarin Icin Hazirlik
Yarina hazirlik notu olustur:
- **Yarin ne var?** Takvimden kontrol et
- **Tamamlanmayan taslak var mi?** Yarinin ilk isi olsun
- **Devam eden diziler var mi?** (karousel serisi, video serisi)
- **Trend firsat var mi?** (guncel olay, ozel gun)

### Adim 5: Ogrenilenler ve Notlar
Bugun cikan icgoruleri not et:
- **Ne iyi gitti?** (kolay yaratilan icerikler)
- **Ne zor geldi?** (takildigin yerler)
- **Yeni fikir dogdugu var mi?** (gelecek kullanim icin)
- **Marka sesinde duzeltme gerekli mi?**

Ogrenilenler `knowledge-nominations.md` dosyasina aday olarak eklenebilir.

### Adim 6: Seans Notunu Kapat
`.claude/workspace/icerik-notlari/[tarih].md` dosyasini guncelle:

```markdown
# Icerik Notlari — [tarih]

## Bugunki Oncelik
[sabah belirlenen oncelik]

## Tamamlananlar
- [x] [icerik 1] — [platform]
- [x] [icerik 2] — [platform]

## Kismi Tamamlananlar
- [ ] [icerik 3] — [neyin eksik]

## Fikirler / Notlar
- [yeni fikir]
- [ogrenilen]

## Yarin Icin
- [ ] [oncelik 1]
- [ ] [oncelik 2]

## Performans Notlari
[varsa rakamlar]
```

# Cikti Formati
```
=== BADI ICERIK KAPANIS ===
Tarih: [tarih]
Sure: [tahmini calisma suresi]

-------------------------------------------
BUGUN URETILENLER
-------------------------------------------
Tamamlanan: [sayi]
Kismi: [sayi]
Taslak: [sayi]
Toplam: [sayi]

-------------------------------------------
DETAY LISTE
-------------------------------------------
TAMAMLANAN:
  + [dosya 1] ([platform])
  + [dosya 2] ([platform])

KISMI:
  ~ [dosya 3] ([eksik neleri])

-------------------------------------------
YAYINLAMA ONERILERI
-------------------------------------------
| Icerik | Platform | Onerilen Zaman |
|--------|----------|----------------|

-------------------------------------------
YARIN IÇIN
-------------------------------------------
Oncelikler:
1. [kismi tamamlanan bitir]
2. [takvim planli icerik]
3. [yeni fikir]

-------------------------------------------
OGRENILENLER
-------------------------------------------
- [not 1]
- [not 2]

-------------------------------------------
SEANS NOTU
-------------------------------------------
Dosya: .claude/workspace/icerik-notlari/[tarih].md
============================
```

# Ne Zaman Kullanilir
- Her gun icerik uretimi bitince (aksam rituelu)
- Batch uretim seansi sonunda
- Hafta sonu haftalik kapanis icin
