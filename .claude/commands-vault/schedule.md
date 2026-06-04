Scheduled command reminders. Shell-based reminder system for daily/weekly recurring tasks.

# Gerekli Araclar
- Bash (badi schedule)

# Prosedur

### Adim 1: Mevcut Hatirlaticilar

```bash
badi schedule list
```

### Adim 2: Yeni Hatirlatici Ekle

```bash
# Is gunu her sabah
badi schedule add "icerik basla" --at "09:00" --days "mon-fri"

# Haftalik (Pazar aksam)
badi schedule add "icerik plan" --at "20:00" --days "sun"

# Gunluk
badi schedule add "wrap-up" --at "18:00" --days "daily"
```

Gun araligi: pzt/sal/car/per/cum/cts/paz (TR) veya mon/tue/wed/thu/fri/sat/sun (EN).
Wrap-around destekli: sat-sun, fri-mon.

### Adim 3: Shell Entegrasyonu (ilk kurulum)

`~/.zshrc` veya `~/.bashrc`'ye ekle:
```bash
command -v badi &>/dev/null && badi schedule check 2>/dev/null
```

Her shell baslangicinda zamani gelen hatirlaticilari gosterir (60dk toleransli).

### Adim 4: Silme

```bash
badi schedule list            # ID'leri gor
badi schedule remove [id]     # Sil
```

### Adim 5: Kontrol

```bash
badi schedule check           # Zamani gelenleri goster
```

# Ornek Rutinler

```bash
# Is gunu sabahlari (09:00): icerik uretim oturumu
badi schedule add "icerik basla" --at "09:00" --days "mon-fri"

# Hafta sonu disi 18:00: gun sonu ozeti
badi schedule add "wrap-up" --at "18:00" --days "mon-fri"

# Haftalik: Pazar aksam icerik planlama
badi schedule add "icerik plan" --at "20:00" --days "sun"

# Her Pazartesi: haftalik saglik
badi schedule add "health" --at "09:30" --days "mon"

# Her ay baslangici: denetim
badi schedule add "audit" --at "10:00" --days "mon"
```

# Ornek Kullanim

```
/schedule list
/schedule add "content review" --at "16:00" --days "fri"
```
