# Badi

Claude Code kullanicilari icin profesyonel is akisi yonetim sistemi. Gunluk islerinizi yapilandirin, uretkenliginizi arttirin, kaliteyi koruyun.

## Ozellikler

- **21 Uzman Ajan** — Guvenlik, performans, kod inceleme, refactoring, mimari, icerik uretimi, proje planlama
- **45 Is Akisi Komutu** — Oturum yonetimi, dagitim, kalite kontrol, strateji, yazilim muhendisligi, icerik uretimi, proje mimarisi
- **11 Guvenlik Hook'u** — Otomatik yedekleme, tehlikeli komut engelleme, dal korumasi
- **21 Beceri Kategorisi** — 1000+ yapilandirilmis operasyonel prosedur
- **6 Katmanli Bellek** — Oturumlar arasi baglam koruma
- **Plugin Sistemi** — Ucuncu parti skill/agent/komut destegi
- **Dashboard** — Gunluk istatistik ve uretkenlik takibi

## Kurulum

```bash
# Hizli kurulum
npx @fatihkan/badi init

# veya global kurulum
npm i -g @fatihkan/badi
badi init
```

## Kullanim

```bash
# Oturum baslat
/start

# Oturum ortasinda senkronize et
/sync

# Kalite denetimi
/audit

# Kod incelemesi
/review

# Gun sonu
/wrap-up
```

## CLI Komutlari

```bash
badi init [--target DIR] [--force] [--dry-run]   # Proje yapilandir
badi update [--target DIR]                        # Guncelle (ozellestirmeleri korur)
badi doctor [--target DIR]                        # Kurulum dogrula
badi list [--agents|--commands|--hooks|--skills]   # Bilesen listele
badi plugin [install|remove|list]                  # Plugin yonet
```

## Dizin Yapisi

```
.claude/
  agents/       21 uzman ajan tanimi
  commands/     45 is akisi komutu
  references/   8 proje planlama rehberi
  hooks/        11 guvenlik ve otomasyon hook'u
  skills/       21 kategori, 1000+ beceri
  workspace/    Gorev panosu ve gunluk notlar
  plugins/      Ucuncu parti eklentiler
  settings.json Hook konfigurasyonu
  memory.md     Aktif oturum bellegi
```

## Ajanlar

| Ajan | Rol |
|------|-----|
| auditor | Kalite guvence kapisi |
| security-scanner | Guvenlik acigi tespiti |
| performance-profiler | Performans analizi |
| test-strategist | Test strateji planlama |
| api-designer | API tasarim |
| migration-pilot | Goc planlama |
| archaeologist | Kod gecmisi arastirmasi |
| error-whisperer | Hata teshis |
| coach | Veri odakli kocluk |
| debt-collector | Teknik borc tarama |
| onboarding-sherpa | Proje alistirma |
| pr-ghostwriter | PR dokumantasyonu |
| rubber-duck | Dusunce partneri |
| unsticker | Tikaniklik cozme |
| yak-shave-detector | Kapsam kaymasi tespiti |
| code-generator | Kod iskele ve sablon uretimi |
| refactoring-advisor | Refactoring danismanligi |
| architecture-advisor | Mimari tasarim ve ADR |
| content-creator | Sosyal medya icerik uretimi |
| visual-director | Gorsel brief ve AI prompt |
| project-architect | Proje planlama ve 5 dokuman uretimi |

## Gelistirme

```bash
npm install
npm test
npm run lint
npm run format
```

## Lisans

MIT - Fatih Kan
