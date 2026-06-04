Content archive search command. Keyword search, similarity detection, and filtering across all generated content.

# Gerekli Araclar
- Bash (badi content search)

# Prosedur

### Adim 1: Arama Sorgusunu Al

Kullanici sorguyu verir (konu, kelime, hashtag). Kelime yoksa en son icerikleri goster.

### Adim 2: Arama Calistir

```bash
badi content search "uretkenlik"
```

Aranacak alanlar:
- `.claude/workspace/icerikler/` (post, karousel)
- `.claude/workspace/senaryolar/` (video)
- `.claude/workspace/gorseller/` (gorsel brief)
- `.claude/workspace/takvim/` (takvim)
- `.claude/workspace/sablonlar/` (custom sablon)
- `marka-sesi.md` (marka sesi)

### Adim 3: Filtreler

```bash
badi content search [sorgu] --platform instagram   # Platform filtresi
badi content search [sorgu] --tur post             # Tur filtresi
badi content search [sorgu] --son 30               # Son 30 gun
badi content search [sorgu] --hashtag urkentlik    # Hashtag
badi content search [sorgu] --format json          # JSON cikti
```

### Adim 4: Sonuc Yorumu

Her sonuc icin:
- Skor (keyword frekans + guncellik bonusu)
- Dizin (icerikler, senaryolar, vs)
- Snippet (eslesen satirin kisa hali)

### Adim 5: Benzerlik Uyarisi

Kullanici yeni icerik olusturacaksa, ayni konuda %60+ benzerlik varsa uyari. `--force` ile atlanabilir.

### Adim 6: Takip Aksiyonlari

- Tekrarlayan konu tespit: "Farkli acidan yaklasim onerisi verelim mi?"
- Hic bulunamadiysa: "`/content-generate` ile yeni olusturalim mi?"
- Eski icerik guncellenebilir: "Bu konuyu guncellemek ister misiniz?"

# Ornek

```
/content-search "produktivite"
/content-search "AI" --platform linkedin --son 7
/content-search "tutorial" --tur video
```
