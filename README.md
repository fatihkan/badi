# Badi

Claude Code kullanicilari icin profesyonel is akisi yonetim sistemi. Gunluk islerinizi yapilandirin, uretkenliginizi arttirin, icerik uretin, kaliteyi koruyun.

## Ozellikler

- **21 Uzman Ajan** — Guvenlik, performans, kod inceleme, refactoring, mimari, icerik uretimi, proje planlama
- **45 Is Akisi Komutu** — Oturum yonetimi, dagitim, kalite kontrol, strateji, yazilim muhendisligi, icerik uretimi, proje mimarisi
- **11 Guvenlik Hook'u** — Otomatik yedekleme, tehlikeli komut engelleme, dal korumasi
- **21 Beceri Kategorisi** — 1000+ yapilandirilmis operasyonel prosedur
- **6 Katmanli Bellek** — Oturumlar arasi baglam koruma
- **Plugin Sistemi** — Ucuncu parti skill/agent/komut destegi
- **Icerik Uretim Araclari** — Sosyal medya, gorsel brief, video senaryo, takvim
- **Dashboard** — Gunluk istatistik ve uretkenlik takibi

## Kurulum

```bash
# Hizli kurulum
npx @fatihkan/badi init

# veya global kurulum
npm i -g @fatihkan/badi
badi init
```

## CLI Komutlari

### Proje Yonetimi

```bash
badi init [--target DIR] [--force] [--dry-run]    # Proje yapilandir
badi update [--target DIR]                         # Guncelle (ozellestirmeleri korur)
badi doctor [--target DIR]                         # Kurulum dogrula
badi list [--agents|--commands|--hooks|--skills]    # Bilesen listele
badi plugin [install|remove|list]                   # Plugin yonet
badi --version                                      # Surum bilgisi
badi --help                                         # Yardim
```

### Icerik Uretimi (Hizli Sablonlar)

Sosyal medya icin hazir sablonlar terminal'den tek komutla olusturulur. Her sablon `.claude/workspace/` altinda dogru dizine yazilir:

```bash
# Sosyal medya post sablonu (3 varyasyon, hashtag, zamanlama)
badi icerik post "yeni urun lansman"

# Karousel (coklu kare) sablonu (7 kare, tasarim notlari)
badi icerik karousel "5 uretkenlik ipucu"

# Video senaryo (hook, sahneler, post-produksiyon)
badi icerik video "30 saniye tutorial"

# Gorsel brief (AI prompt, renk paleti, tipografi)
badi icerik gorsel "sabah rutini post"

# Icerik takvimi (tema haritasi, 4 hafta)
badi icerik takvim "2026-04"

# Marka sesi rehberi (tum icerik komutlari okur)
badi icerik marka

# Uretilen tum icerikleri listele
badi icerik list
```

**Uretilen dosyalar:**
- Post/karousel → `.claude/workspace/icerikler/YYYY-MM-DD-konu.md`
- Video senaryo → `.claude/workspace/senaryolar/YYYY-MM-DD-konu.md`
- Gorsel brief → `.claude/workspace/gorseller/YYYY-MM-DD-konu-brief.md`
- Icerik takvimi → `.claude/workspace/takvim/YYYY-MM-DD-takvim-donem.md`
- Marka sesi → `.claude/workspace/marka-sesi.md`

### Claude Code Slash Komutlari

Terminal sablonlari hizli baslangic icin. Tam interaktif is akisi icin Claude Code icinde slash komutlar kullanin:

```
/start           # Oturum baslat
/sync            # Baglam yenile
/audit           # Kalite denetimi
/review          # Kod incelemesi
/wrap-up         # Gun sonu

/icerik-uret     # Interaktif icerik uretme
/gorsel-brief    # Gorsel yonetmenlik
/video-senaryo   # Video senaryo
/icerik-takvimi  # Icerik planlama
/marka-sesi      # Marka sesi tanimlama
/karousel        # Karousel olusturma

/architect       # Proje planlama (5 dokuman)
/spec-check      # Spesifikasyon uyum kontrolu
/scaffold        # Kod iskele
/refactor        # Yeniden duzenleme plani
/adr             # Mimari karar kaydi

/dashboard       # Gunluk istatistik paneli
/health          # Sistem saglik kontrolu
/doctor          # Konfigurasyon dogrulamas
```

Tam komut listesi icin `.claude/command-index.md` dosyasina bakin.

## Dizin Yapisi

```
.claude/
  agents/       21 uzman ajan tanimi
  commands/     45 is akisi komutu
  references/    8 proje planlama rehberi (design patterns, tech stack, vb.)
  hooks/        11 guvenlik ve otomasyon hook'u
  skills/       21 kategori, 1000+ beceri
  workspace/    Gorev panosu, gunluk notlar, uretilen icerikler
    icerikler/   Post ve karousel sablonlari
    senaryolar/  Video senaryolari
    gorseller/   Gorsel briefler
    takvim/      Icerik takvimleri
    marka-sesi.md
  plugins/      Ucuncu parti eklentiler
  settings.json  Hook konfigurasyonu
  memory.md      Aktif oturum bellegi
  knowledge-base.md
  command-index.md
```

## Ajanlar

### Yazilim Muhendisligi
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
| debt-collector | Teknik borc tarama |
| code-generator | Kod iskele ve sablon uretimi |
| refactoring-advisor | Refactoring danismanligi |
| architecture-advisor | Mimari tasarim ve ADR |
| project-architect | Proje planlama ve 5 dokuman uretimi |

### Icerik Uretimi
| Ajan | Rol |
|------|-----|
| content-creator | Sosyal medya icerik uretimi |
| visual-director | Gorsel brief ve AI prompt |

### Destek ve Kocluk
| Ajan | Rol |
|------|-----|
| coach | Veri odakli kocluk |
| onboarding-sherpa | Proje alistirma |
| pr-ghostwriter | PR dokumantasyonu |
| rubber-duck | Dusunce partneri |
| unsticker | Tikaniklik cozme |
| yak-shave-detector | Kapsam kaymasi tespiti |

## Icerik Uretim Is Akisi

```bash
# 1. Once marka sesini tanimla (bir kere)
badi icerik marka
# .claude/workspace/marka-sesi.md acilip doldurulur

# 2. Aylik icerik takvimi olustur
badi icerik takvim "2026-04"

# 3. Her icerik icin hizli sablon
badi icerik post "pazartesi motivasyon"
badi icerik karousel "5 urun ipucu"
badi icerik video "15 saniye hook"
badi icerik gorsel "urun tanitim"

# 4. Uretilenleri gor
badi icerik list

# 5. Detayli icerik uretimi icin Claude Code'da
#    /icerik-uret, /karousel, /video-senaryo slash komutlarini kullan
```

## Gelistirme

```bash
npm install
npm test        # 39 test
npm run lint
npm run format
```

## Testler

- **39 test** — CLI, hooks, icerik uretimi, doctor, update, list, plugin
- Tum testler Node.js native test runner kullanir
- Hicbir dis test bagimliligi yok

## Surum

v1.0.0 — Ilk genel surum

## Lisans

MIT - Fatih Kan

## Katkida Bulunma

`CONTRIBUTING.md` dosyasina bakiniz.
