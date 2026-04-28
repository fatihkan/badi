# Badi - Is Akisi Yonetim Sistemi

> Claude Code icin yapilandirilmis operasyon yonetimi. 21 ajan, 77 komut, 12 hook, 23 beceri kategorisi.

## Bellek Kurallari

| Katman | Dosya | Sinir |
|--------|-------|-------|
| Oturum | `.claude/memory.md` | 100 satir, astiginda `/clear` |
| Bilgi Tabani | `.claude/knowledge-base.md` | 200 satir, Auditor onayiyla |
| Gorev Panosu | `.claude/workspace/TaskBoard.md` | Sinir yok |

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
badi list --agents|--commands|--hooks|--skills    # Detayli bilesen listesi
badi icerik [post|karousel|video|gorsel|takvim|marka|ara|sablon|perf] [--lang tr,en]
badi schedule [add|list|remove|check]
```

## Baglam Sagligi

- Token limiti yaklastiginda `/clear` oner
- `memory.md` > 80 satir: konsolidasyon uyarisi
- Sikistirma: `pre-compact-handoff.sh` → compact → `post-compact-resume.sh`
