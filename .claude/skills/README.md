# Aktif Skills (Opt-in)

Bu dizin **kullanıcı tarafından seçilen** skill'leri içerir. Claude Code yalnızca burada bulunanları yükler.

## Neden bos?

v1.17.0 ile birlikte skill'ler **opt-in** modeline gecti. Tüm 23 kategori `.claude/skills-vault/` altinda saklanir, kullanici istedigini buraya tasir.

Token tasarrufu: 23 skill auto-load → 0 (kullanici secimi). Tipik kazanim ~10-15k token/her tur.

## Kullanim

```bash
badi skills available           # Vault'taki tum skill'leri listele
badi skills add seo marketing   # Iki skill'i aktif et
badi skills list                # Aktif skill'leri goster
badi skills remove seo          # Aktif skill'i kaldir
badi skills clear               # Hepsini deaktive et
```

`badi skills` argumansiz calistirilirsa durum tablosu gosterir.
