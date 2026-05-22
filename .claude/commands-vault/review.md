Derin kod incelemesi komutu. Guvenlik, performans ve mimari boyutlariyla kapsamli kod analizi yapar.

> **Argument formati (v1.31.0+)**: `/review [effort] [--comment] [--correctness-only]`
> - `effort`: `low` | `medium` (default) | `high` — analiz derinligi
> - `--comment`: bulgulari aktif PR'a inline yorum olarak post et (gh CLI gerekir)
> - `--correctness-only`: yalniz correctness bug'larina odaklan (mimari/perf/guvenlik kanallarini atla)

> **Anthropic native `/code-review` (Claude Code 2.1.147+) farki:**
> - `/code-review`: correctness bug + effort tuning + `--comment` (native English render)
> - `/review` (badi): yukaridakilerin **superset**'i — 3 kanal (guvenlik+perf+mimari) + TR rapor + classification
> - Kombine kullanim: `/code-review high --comment` (logic) sonra `/review high --comment` (mimari/perf/guvenlik)

# Gerekli Araclar
- Read (kod okuma)
- Grep (kalip arama)
- Glob (dosya taramasi)
- Bash (git diff, gh CLI inline PR comment, analiz araclari)

# Prosedur (4 Adim + opsiyonel PR Comment)

### Adim 0: Argument Parse + Effort & Mod Belirle (v1.31.0+)

Komut argumanlari:
- `effort` (positional): `low` | `medium` | `high`
  - `low`: yalniz KRITIK + YUKSEK bulgu; performans/mimari kanallarini hizli tara
  - `medium` (default): mevcut davranis — KRITIK + YUKSEK + ORTA siniflari
  - `high`: tum siniflar (KRITIK/YUKSEK/ORTA/DUSUK) + olumlu gozlemler + alternative cozumler
- `--comment`: Adim 5'i etkinlestir (PR inline comment)
- `--correctness-only`: Adim 3'te yalniz Kanal A guvenlik + correctness bug'larina odaklan, Kanal B (performans) + Kanal C (mimari) atla

### Adim 1: Kapsam Tanimla
Incelenecek kodu belirle:
- **Aktif PR (auto-detect)**: `gh pr view --json number,baseRefName,headRefName` ile mevcut branch'in PR'i tespit edilir. Varsa scope otomatik PR diff'i (`gh pr diff <num>`).
- **PR/Commit:** `git diff` ciktisini al (branch veya commit hash ile)
- **Dosya:** Belirli dosya veya dosyalar
- **Modul:** Bir ozellik veya modul dizini
- **Degisiklik Kumesi:** Son N commitin degisiklikleri

Kapsam bilgisini kaydet:
- Dosya sayisi
- Degisen satir sayisi (eklenen/silinen)
- Etkilenen moduller

### Adim 2: Kod Oku
- Tum degisiklikleri dikkatli oku
- Baglam icin cevredeki kodu da incele
- Ilgili test dosyalarini bul ve oku
- Etkilenen API'leri veya arayuzleri kontrol et

### Adim 3: Paralel Analiz (3 Kanal — `--correctness-only` ile Kanal B+C atlanir)

**Kanal A: Guvenlik Analizi**
- Girdi dogrulama eksiklikleri
- SQL/NoSQL injection riskleri
- XSS ve CSRF aciklari
- Hassas veri sizintisi (loglamada, hata mesajlarinda)
- Yetkilendirme kontrolleri
- Kriptografik zayifliklar
- Bagimlilik guvenlik aciklari
- Hardcoded sirlar veya anahtarlar

**Kanal B: Performans Analizi**
- N+1 sorgu kaliplari
- Gereksiz hesaplamalar veya donguler
- Bellek sizintisi riskleri
- Indeks kullanimi (veritabani sorgulari)
- Onbellekleme firsatlari
- Asenkron islem gereksinimleri
- Buyuk veri kumesi islemleri
- API cagri optimizasyonlari

**Kanal C: Mimari Analizi**
- SOLID ilkeleriyle uyum
- Katman ayrimina saygi (separation of concerns)
- Bagimlilik yonu (dependency inversion)
- Kod tekrari (DRY ihlalleri)
- Isimlendirme tutarliligi
- Hata yonetimi stratejisi
- Test edilebilirlik
- Genisletilebilirlik ve bakim kolayligi

### Adim 4: Bulgulari Siniflandir

Her bulguyu su seviyelere ata:

**KRITIK** - Mutlaka duzeltilmeli (merge engelleyici)
- Guvenlik aciklari
- Veri kaybi/bozulma riski
- Uretim ortamini kiracak hatalar

**YUKSEK** - Merge oncesi cozulmesi onerilen
- Performans sorunlari
- Hata yonetimi eksiklikleri
- Test kapsami boslugu (kritik yollar)

**ORTA** - Iyilestirme firsati
- Kod kalitesi
- Okunabilirlik
- Minor refactoring

**DUSUK** - Oneri niteliginde
- Stil tercihleri
- Dokumantasyon iyilestirmeleri
- Gelecek refactoring firsatlari

### Adim 5 (opsiyonel): PR Inline Comment (`--comment`)

`--comment` flag ile birlikte calistirildiginda, bulgular aktif PR'a inline yorum olarak post edilir. gh CLI gerekir.

**On kontroller:**
1. `gh` PATH'te mi: `which gh`
2. Aktif branch'in PR'i var mi: `gh pr view --json number,headRefName` (yoksa hata: "PR bulunamadi. /review --comment yalniz PR icindeyken calisir")
3. Yetki kontrolu: `gh auth status`

**Yorum yazimi (her KRITIK + YUKSEK bulgu icin):**
```bash
gh api repos/:owner/:repo/pulls/<num>/comments \
  --method POST \
  --field body="<bulgu_aciklamasi>" \
  --field path="<dosya_yolu>" \
  --field line=<satir_no> \
  --field side="RIGHT"
```

**Ozet yorum (PR description'a):**
```bash
gh pr comment <num> --body "$(badi review --format markdown-summary)"
```

Cikti: KRITIK N | YUKSEK N | ORTA N | DUSUK N + onerilen action (merge OK / revize / red).

# Cikti Formati
```
=== BADI KOD INCELEMESI ===
Tarih: [tarih]
Kapsam: [belirtilen kapsam]
Dosya Sayisi: [sayi]
Degisen Satir: +[eklenen] / -[silinen]

## Genel Degerlendirme
[1-2 cumle ozet]
Onay Durumu: ONAYLANDI / DEGISIKLIK GEREKLI / REDDEDILDI

## Kritik Bulgular ([sayi])
### [Bulgu Basligi]
- Dosya: [yol:satir]
- Sorun: [aciklama]
- Oneri: [cozum]

## Yuksek Oncelikli ([sayi])
...

## Orta Oncelikli ([sayi])
...

## Dusuk Oncelikli ([sayi])
...

## Olumlu Gozlemler
- [iyi yapilmis seyler]

## Ozet
- Kritik: [sayi] | Yuksek: [sayi] | Orta: [sayi] | Dusuk: [sayi]
==============================
```
