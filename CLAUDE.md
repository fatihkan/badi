# Badi - Profesyonel Is Akisi Yonetim Sistemi

> Claude Code kullanicilari icin yapılandırılmis operasyon yonetimi, kalici bellek, uzman ajanlar ve yeniden kullanilabilir beceriler.

---

## Bellek Mimarisi (6 Katman)

| Katman | Dosya | Sinir | Amac |
|--------|-------|-------|------|
| Aktif Oturum | `.claude/memory.md` | 100 satir | Mevcut oturum baglami |
| Bilgi Tabani | `.claude/knowledge-base.md` | 200 satir | Dogrulanmis kurallar |
| Bilgi Adayliklari | `.claude/knowledge-nominations.md` | Sinir yok | Bekleyen ogrenimler |
| Gunluk Notlar | `.claude/workspace/GGAAYY.md` | Gunluk | Oturum kayitlari |
| Ajan Bellegi | `.claude/agent-memory/` | Ajana ozel | Kalici ajan bilgisi |
| Gorev Panosu | `.claude/workspace/TaskBoard.md` | Sinir yok | Is takibi |

### Kurallar
- `memory.md` 100 satiri astiginda `/clear` calistir
- `knowledge-base.md` yalnizca Denetci (Auditor) onayiyla guncellenir
- Bilgi tabani girislerinde kaynak zorunludur: `[Kaynak: ...]`
- TBD/TODO/FIXME bilgi tabaninda YASAKTIR

---

## Uzman Ajanlar (20)

### Teshis Ajanlari
| Ajan | Rol | Model |
|------|-----|-------|
| `archaeologist` | Kod gecmisi arastirmacisi | Sonnet |
| `error-whisperer` | Hata teshis ve cozum | Sonnet |
| `unsticker` | Tikaniklik kok neden analizi | Sonnet |
| `yak-shave-detector` | Kapsam kaymasi dedektoru | Haiku |

### Kalite Ajanlari
| Ajan | Rol | Model |
|------|-----|-------|
| `auditor` | Kalite guvence kapisi | Sonnet |
| `coach` | Veri odakli kocluk | Sonnet |
| `debt-collector` | Teknik borc tarama | Sonnet |

### Uzmanlik Ajanlari
| Ajan | Rol | Model |
|------|-----|-------|
| `security-scanner` | Guvenlik acigi tespiti | Sonnet |
| `performance-profiler` | Performans darbogaz analizi | Sonnet |
| `test-strategist` | Test strateji planlama | Sonnet |
| `api-designer` | API tasarim ve dokumantasyon | Sonnet |
| `migration-pilot` | Goc planlama ve risk analizi | Sonnet |
| `code-generator` | Kod iskele ve sablon uretimi | Sonnet |
| `refactoring-advisor` | Kod kalitesi ve refactoring danismanligi | Sonnet |
| `architecture-advisor` | Mimari tasarim, ADR, tasarim kaliplari | Sonnet |

### Icerik Uretim Ajanlari
| Ajan | Rol | Model |
|------|-----|-------|
| `content-creator` | Sosyal medya icerik uretimi | Sonnet |
| `visual-director` | Gorsel brief ve AI prompt olusturma | Sonnet |

### Destek Ajanlari
| Ajan | Rol | Model |
|------|-----|-------|
| `onboarding-sherpa` | Kod tabani rehberi | Sonnet |
| `pr-ghostwriter` | PR/commit dokumantasyonu | Sonnet |
| `rubber-duck` | Sokratik sorgulama partneri | Sonnet |

---

## Komut Katalogu (43)

### Oturum Yonetimi
`/start` `/sync` `/clear` `/wrap-up`

### Kalite Kontrol
`/audit` `/review` `/doctor`

### Dagitim ve Surum
`/release` `/launch` `/deploy` `/hotfix` `/changelog`

### Koordinasyon
`/standup` `/retro` `/onboard` `/handoff`

### Analiz ve Strateji
`/debt-map` `/competitive-intel` `/drift-detect` `/system-audit` `/brief` `/proposal`

### Destek ve Kocluk
`/coach` `/unstick` `/report` `/playbook`

### Guvenlik ve Performans
`/health` `/security-scan` `/perf-check` `/api-doc` `/docs-audit`

### Yazilim Muhendisligi
`/scaffold` `/refactor` `/adr` `/post-mortem`

### Icerik Uretimi ve Sosyal Medya
`/icerik-uret` `/gorsel-brief` `/video-senaryo` `/icerik-takvimi` `/marka-sesi` `/karousel`

### Dashboard ve Plugin
`/dashboard` `/plugin`

---

## Hook Sistemi (11)

### PreToolUse (Calistirmadan Once)
| Hook | Tetikleyici | Tur |
|------|-------------|-----|
| `guard-bash.sh` | Bash | Senkron - 3 katmanli guvenlik |
| `branch-guard.sh` | Bash (git commit/push) | Senkron - dal korumasi |
| `backup-before-write.sh` | Write/Edit | Asenkron - otomatik yedek |
| `completeness-gate.sh` | Write/Edit | Senkron - icerik dogrulama |

### PostToolUse (Calistirdiktan Sonra)
| Hook | Tetikleyici | Tur |
|------|-------------|-----|
| `log-changes.sh` | Write/Edit | Asenkron - denetim izi |

### PostToolUseFailure (Hata Sonrasi)
| Hook | Tetikleyici | Tur |
|------|-------------|-----|
| `log-failures.sh` | Tum hatalar | Asenkron - hata kategorizasyonu |

### Yasam Dongusu
| Hook | Olay | Tur |
|------|------|-----|
| `session-reset.sh` | Yeni oturum | Senkron - temizlik |
| `dependency-audit.sh` | Yeni oturum | Senkron - bagimlilik taramas |
| `pre-compact-handoff.sh` | Sikistirma oncesi | Senkron - durum kaydi |
| `post-compact-resume.sh` | Devam eden oturum | Senkron - baglam geri yukleme |
| `log-stop-verdict.sh` | Durus karari | Asenkron - karar kaydi |

---

## Beceri Kutuphanesi (21 Kategori)

| Kategori | Aciklama |
|----------|----------|
| ai-automation | Yapay zeka ve otomasyon |
| consulting | Danismanlik |
| content | Icerik uretimi |
| customer-success | Musteri basarisi |
| design | Tasarim |
| development | Yazilim gelistirme |
| ecommerce | E-ticaret |
| email | E-posta pazarlama |
| finance | Finans |
| marketing | Pazarlama |
| product | Urun yonetimi |
| productivity | Uretkenlik |
| sales | Satis |
| seo | Arama motoru optimizasyonu |
| social-media | Sosyal medya |
| startup | Girisimcilik |
| **devops** | DevOps ve altyapi (YENI) |
| **security** | Guvenlik yonetimi (YENI) |
| **testing** | Test ve QA (YENI) |
| **mobile** | Mobil gelistirme (YENI) |
| **data-analytics** | Veri analitigi (YENI) |

---

## Plugin Sistemi

Plugin'ler `.claude/plugins/` altinda barinir. Her plugin bir `badi-plugin.json` manifest dosyasi icerir.

```
badi plugin install <git-url|npm-paket>
badi plugin remove <isim>
badi plugin list
```

---

## Baglam Sagligi Yonetimi

### Otomatik Sinyaller
- Token kullanimi limiteYakklastiginda: `/clear` oner
- `memory.md` > 80 satir: konsolidasyon uyarisi
- 2+ engel karari: kalite kapisi etkinlestir

### Sikistirma Dongusu
1. `pre-compact-handoff.sh` durumu kaydeder
2. Sikistirma gerceklesir
3. `post-compact-resume.sh` baglami geri yukler
4. Yarida kalan islemler devam eder

### Butunluk Kapisilari
- `knowledge-base.md` icinde TBD/TODO YASAK
- Agent tanimlarinda tamamlanmamis isaretler YASAK
- `settings.json` gecerli JSON olmalidir
- Hook scriptleri calistirilabilir olmalidir

---

## Gunluk Is Akisi

```
Sabah:   /start  -> Oncelikleri belirle
Ogle:    /sync   -> Baglam yenile
Aksam:   /wrap-up -> Ozet ve yarin plani
Gerektiginde: /audit, /review, /unstick, /dashboard
```

---

## CLI Komutlari

```bash
badi init [--target DIR] [--force] [--dry-run]  # Proje yapilandir
badi update [--target DIR] [--dry-run]           # Konfigu rasyon guncelle
badi doctor [--target DIR]                       # Kurulum dogrula
badi list [--agents|--commands|--hooks|--skills]  # Bilesen listele
badi plugin [install|remove|list]                 # Plugin yonet
```
