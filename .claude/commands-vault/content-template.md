Icerik sablon mirasi komutu. Tekrarlayan icerik turleri icin ozel sablon olusturma ve miras zinciri yonetimi.

# Gerekli Araclar
- Bash (badi content template)

# Prosedur

### Adim 1: Mevcut Sablonlar

```bash
badi content template list
```

Yerlesik sablonlar (standart): post, karousel, video, gorsel, takvim, marka.
Ozel sablonlar `.claude/workspace/sablonlar/` altinda.

### Adim 2: Ozel Sablon Olustur

```bash
badi content template olustur saas-lansmani --extends post --description "SaaS urun lansmani"
```

Parametreler:
- `isim` — Sablon adi (slug)
- `--extends` — Yerlesik sablon (post/content-carousel/video/gorsel/takvim)
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
badi content post "Yeni CRM Lansman" --template saas-lansmani
```

Yerlesik sablon + ozel sablon birlestirilir (H2 baslik eslestirme ile).

### Adim 5: Sablon Sil

```bash
badi content template sil saas-lansmani
```

### Adim 6: Kullanim Senaryolari

- **Marka kategorileri**: Urun lansmani, etkinlik duyurusu, case study, customer story
- **Icerik serileri**: Pazartesi motivasyon, Persembe tutorial
- **Platform ozelleri**: LinkedIn vs Twitter ayri tonda
- **Musteri sablonlari**: Her musteri icin ayri ton/stil

# Ornek

```
/content-template list
/content-template olustur linkedin-insight --extends post
/content-generate "AI trendi" --template linkedin-insight
```
