# Badi - Is Akisi Yonetim Sistemi

> Claude Code icin yapilandirilmis operasyon yonetimi. 22 ajan, 83 komut, 13 hook, 50 opt-in skill kategorisi. v1.20+ prompt-aware skill router; v1.25+ pentest-* ailesi (25 kategori, advisory/defensive); v1.26+ profil bazli komut yonetimi (core/dev/content/pentest) + komut routing.

## Bellek Kurallari

| Katman | Dosya | Sinir |
|--------|-------|-------|
| Oturum | `.claude/memory.md` | 100 satir, astiginda `/clear` |
| Bilgi Tabani | `.claude/knowledge-base.md` | 200 satir, Auditor onayiyla |
| Gorev Panosu | `.claude/workspace/TaskBoard.md` | Sinir yok |
| Skills Vault | `.claude/skills-vault/` | 50 kategori (25 genel + 25 pentest-*), yuklenmez (opt-in) |
| Aktif Skills | `.claude/skills/` | Kullanici secimi (`badi skills`) |
| Commands Vault | `.claude/commands-vault/` | 77 komut canonical (v1.26+), yuklenmez |
| Aktif Commands | `.claude/commands/` | Profile gore filtrelenir (`badi commands profile`) |

- `knowledge-base.md` icinde TBD/TODO/FIXME **YASAK**
- Bilgi girislerinde kaynak zorunlu: `[Kaynak: ...]`
- `settings.json` gecerli JSON olmali, hook'lar calistirilabilir olmali

## Gunluk Akis

```
Sabah: /start | Ogle: /sync | Aksam: /wrap-up | Gerektiginde: /audit, /review, /unstick
```

## CLI

```bash
badi init | update | doctor | list | plugin | icerik | stats | completion | schedule
badi skills [available|list|add|remove|clear]    # Opt-in skill yonetimi (v1.17+)
badi list --agents|--commands|--hooks|--skills    # Detayli bilesen listesi
badi icerik [post|karousel|video|gorsel|takvim|marka|ara|sablon|perf] [--lang tr,en]
badi schedule [add|list|remove|check]
```

## Baglam Sagligi

- Token limiti yaklastiginda `/clear` oner
- `memory.md` > 80 satir: konsolidasyon uyarisi
- Sikistirma: `pre-compact-handoff.sh` → compact → `post-compact-resume.sh`
