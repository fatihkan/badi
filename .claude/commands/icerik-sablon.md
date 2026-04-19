Icerik sablon mirasi komutu. Tekrarlayan icerik turleri icin ozel sablon olusturma ve miras zinciri yonetimi.

# Gerekli Araclar
- Bash (badi icerik sablon)

# Prosedur

### Adim 1: Mevcut Sablonlar

```bash
badi icerik sablon list
```

Yerlesik sablonlar (standart): post, karousel, video, gorsel, takvim, marka.
Ozel sablonlar `.claude/workspace/sablonlar/` altinda.

### Adim 2: Ozel Sablon Olustur

```bash
badi icerik sablon olustur saas-lansmani --extends post --description "SaaS urun lansmani"
```

Parametreler:
- `isim` — Sablon adi (slug)
- `--extends` — Yerlesik sablon (post/karousel/video/gorsel/takvim)
- `--description` — Kisa aciklama (opsiyonel)

Olusturulan dosya `.claude/workspace/sablonlar/[isim].md` — frontmatter + ozel bolumler.

### Adim 3: Sablonu Duzenle

Olusan dosyayi ac ve ozel bolumler ekle:
```markdown
---
name: saas-lansmani
extends: post
description: SaaS urun lansmani
---

## Ozel: Onizleme Linki
[Ucretsiz deneme URL'si]

## Ozel: Teknik Detay
[Stack, entegrasyonlar, fiyatlama]
```

### Adim 4: Sablonu Kullan

```bash
badi icerik post "Yeni CRM Lansman" --sablon saas-lansmani
```

Yerlesik sablon + ozel sablon birlestirilir (H2 baslik eslestirme ile).

### Adim 5: Sablon Sil

```bash
badi icerik sablon sil saas-lansmani
```

### Adim 6: Kullanim Senaryolari

- **Marka kategorileri**: Urun lansmani, etkinlik duyurusu, case study, customer story
- **Icerik serileri**: Pazartesi motivasyon, Persembe tutorial
- **Platform ozelleri**: LinkedIn vs Twitter ayri tonda
- **Musteri sablonlari**: Her musteri icin ayri ton/stil

# Ornek

```
/icerik-sablon list
/icerik-sablon olustur linkedin-insight --extends post
/icerik-uret "AI trendi" --sablon linkedin-insight
```
