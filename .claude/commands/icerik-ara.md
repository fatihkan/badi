Icerik arsiv arama komutu. Uretilen tum iceriklerde anahtar kelime arama, benzerlik tespiti ve filtreleme.

# Gerekli Araclar
- Bash (badi icerik ara)

# Prosedur

### Adim 1: Arama Sorgusunu Al

Kullanici sorguyu verir (konu, kelime, hashtag). Kelime yoksa en son icerikleri goster.

### Adim 2: Arama Calistir

```bash
badi icerik ara "uretkenlik"
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
badi icerik ara [sorgu] --platform instagram   # Platform filtresi
badi icerik ara [sorgu] --tur post             # Tur filtresi
badi icerik ara [sorgu] --son 30               # Son 30 gun
badi icerik ara [sorgu] --hashtag urkentlik    # Hashtag
badi icerik ara [sorgu] --format json          # JSON cikti
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
- Hic bulunamadiysa: "`/icerik-uret` ile yeni olusturalim mi?"
- Eski icerik guncellenebilir: "Bu konuyu guncellemek ister misiniz?"

# Ornek

```
/icerik-ara "produktivite"
/icerik-ara "AI" --platform linkedin --son 7
/icerik-ara "tutorial" --tur video
```
