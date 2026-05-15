Memory ve knowledge-base limit kontrolu + global proje karsilastirmasi.

# Gerekli Araclar
- Bash (badi ai memory-diff)

# Prosedur

### Adim 1: Calistir
```bash
badi ai memory-diff
```

### Adim 2: Sonuclari Yorumla

Uc bolum:
1. **memory.md** — Oturum bellek, 100 satir limiti
2. **knowledge-base.md** — Bilgi tabani, 200 satir limiti + TBD yasak
3. **Global projects** — Baska projelerdeki MEMORY.md karsilastirmasi

### Adim 3: Eylemler

**memory.md > 80 satir:**
- `/clear` ile sifirla + onemlileri knowledge-base'e tasi

**knowledge-base.md'de TBD/TODO:**
- YASAK (CLAUDE.md kurali)
- Iceriği tamamla veya kaldir
- Kaynak eklenmediyse `[Kaynak: ...]` zorunlu

**knowledge-base.md > 200 satir:**
- Auditor onayiyla konsolidasyon
- Eski/alakasiz kisimlari archive/knowledge-archive.md'ye tasi

### Adim 4: Haftalik Rutin

Her Pazartesi `/ai-memory-diff` calistir, memory sagliguni kontrol et.

# Bellek Kurallari (CLAUDE.md)

| Katman | Sinir | Aksiyon |
|--------|-------|---------|
| memory.md | 100 satir | /clear |
| knowledge-base.md | 200 satir | Auditor onayi |
| TaskBoard.md | Sinirsiz | - |

# Ornek

```
/memory-diff
```
