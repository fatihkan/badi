# Badi - Is Akisi Yonetim Sistemi

> Claude Code icin yapilandirilmis operasyon yonetimi. 27 ajan, 84 komut, 14 hook, 62 opt-in skill kategorisi. v1.20+ prompt-aware skill router; v1.25+ pentest-* ailesi (25 kategori, advisory/defensive); v1.26+ profil bazli komut yonetimi (core/dev/content/pentest) + komut routing; v1.27+ expo-* ailesi (12 kategori, Expo + React Native mobile dev lifecycle); v1.32+ sanal eng ekibi (product-strategist, engineering-manager, release-manager, qa-lead + /ceo-review, /eng-review, /qa, /ship) + /team orkestratoru; v1.33+ reklam review (ads-strategist ajani + /meta-review + /ads-review, advisory-only).

## Bellek Kurallari

| Katman | Dosya | Sinir |
|--------|-------|-------|
| Oturum | `.claude/memory.md` | 100 satir, astiginda `/clear` |
| Bilgi Tabani | `.claude/knowledge-base.md` | 200 satir, Auditor onayiyla |
| Gorev Panosu | `.claude/workspace/TaskBoard.md` | Sinir yok |
| Skills Vault | `.claude/skills-vault/` | 62 kategori (25 genel + 25 pentest-* + 12 expo-*), yuklenmez (opt-in) |
| Aktif Skills | `.claude/skills/` | Kullanici secimi (`badi skills`) |
| Commands Vault | `.claude/commands-vault/` | 84 komut canonical (v1.26+), yuklenmez |
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
badi content [post|karousel|video|visual|calendar|brand|search|template|perf] [--lang tr,en]
badi schedule [add|list|remove|check]
```

## Baglam Sagligi

- Token limiti yaklastiginda `/clear` oner
- `memory.md` > 80 satir: konsolidasyon uyarisi
- Sikistirma: `pre-compact-handoff.sh` → compact → `post-compact-resume.sh`
