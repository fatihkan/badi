Markdown dosya cevirisi. Claude API ile teknik/icerik cevirisi (markdown yapisini bozmadan).

# Gerekli Araclar
- Bash (badi ai translate)

# On Kosul

ANTHROPIC_API_KEY gerekli.

# Prosedur

### Adim 1: Kaynak Dosya
Markdown dosya yolu (ornek: `docs/guide.md`, `blog/post-tr.md`).

### Adim 2: Cevir
```bash
badi ai translate [file.md]                  # Varsayilan EN
badi ai translate [file.md] --to en          # Ingilizce
badi ai translate [file.md] --to de          # Almanca
badi ai translate [file.md] --to fr          # Fransizca
badi ai translate [file.md] --to es          # Ispanyolca
```

### Adim 3: Cikti

Kaynak dosya yaninde `-[lang]` suffixli yeni dosya:
- `guide.md` -> `guide-en.md`

### Adim 4: Kullanim Durumlari

- **Icerik pazarlama**: TR post -> EN, EN post -> TR
- **Teknik dokuman**: README.md -> README-en.md
- **App Store**: release-notes-tr.md -> release-notes-en.md
- **Blog**: coklu dil destegi

### Adim 5: Markdown Korumasi

AI sunlari korur:
- Kod blogu (```...```)
- Link yapisi
- Baslik hiyerarsisi (##, ###)
- Liste formati
- Hashtag'ler (lokalizasyon yapilir)

### Adim 6: Alternatif

Mevcut icerik motoru `--lang tr,en` ile paralel uretim de yapiyor:
```bash
badi icerik post "konu" --lang tr,en
```

Ayni zamanda uretim icin daha hizli; sonradan cevirmek icin `ai translate`.

# Maliyet

- ~5K char icerik: ~$0.003-0.005 per ceviri

# Ornek

```
/ai-translate blog/yazi-tr.md --to en
/ai-translate docs/guide.md --to de
```
