Slash komut ve ajan dosyalari icin regression test. Format ve icerik dogrulamasi.

# Gerekli Araclar
- Bash (badi ai prompt-test)

# Prosedur

### Adim 1: Calistir
```bash
badi ai prompt-test
```

### Adim 2: Kontroller

Her `.claude/commands/*.md` ve `.claude/agents/*.md` icin:

1. **Bos/cok kisa dosya** — 50 karakter altinda uyari
2. **Ajan frontmatter** — `---` + `name:` + `description:` zorunlu
3. **TODO/FIXME/TBD** — production icin isaret
4. **Uzun satir** — 500+ karakter formatting bozulmasi

### Adim 3: Aksiyonlar

Bulgularina gore:
- Bos dosya: icerik ekle veya sil
- Frontmatter eksik: ekle
- TODO: tamamla veya sil
- Uzun satir: yeniden format

### Adim 4: CI Entegrasyonu

GitHub Actions'a ekle:
```yaml
- name: Prompt Regression
  run: badi ai prompt-test
```

Exit code olmadigindan asagidaki ile zorla:
```bash
badi ai prompt-test | grep -q "temiz" || exit 1
```

# Ornek

```
/prompt-test
```
