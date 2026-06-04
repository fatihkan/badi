Badi/.claude/ token usage analysis command. Categorized token counts, largest files, optimization suggestions.

# Gerekli Araclar
- Bash (badi ai token)

# Prosedur

### Adim 1: Calistir
```bash
badi ai token
```

### Adim 2: Sonuclari Yorumla

Kategori bazli dokum:
- **agents** — Ajan tanimlari
- **commands** — Slash komutlar
- **hooks** — Shell hook'lari
- **skills** — Beceri kutuphanesi (genelde en buyuk)
- **references** — Proje rehberleri
- **memory/workspace** — Proje notlari

Toplam token esigi:
- `< 80K` — Saglikli
- `80-150K` — Izleme gerekli
- `> 150K` — Optimizasyon zorunlu

### Adim 3: Optimizasyon Onerileri

Toplam yuksekse:
1. **Buyuk SKILL.md'leri bol** — `references/` alt dizinine cekme
2. **Unused commandlari kaldir** — Kullanilmayan slash komut
3. **CLAUDE.md minimize** — 1.2KB hedef
4. **Log rotation** — .claude/logs/ otomatik sinir

### Adim 4: Takip

Haftalik kontrol:
- `/ai-token` her Pazartesi sabahi
- Trendi izle (her hafta 10%+ artis varsa inceleme)

# Ornek

```
/ai-token
```
