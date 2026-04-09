Proje alistirma komutu. Yeni bir projeye hizli ve kapsamli adapte olmak icin kullanilir.

# Gerekli Araclar
- Glob (dosya yapisi taramasi)
- Read (dosya okuma)
- Grep (kod arama)
- Bash (git gecmisi, bagimliliklar)
- Write (alistirma raporu)

# Prosedur (6 Adim)

### Adim 1: Proje Dogrulama
- Proje kok dizinini dogrula
- `README.md`, `CONTRIBUTING.md`, `CHANGELOG.md` var mi kontrol et
- Lisans dosyasini kontrol et
- `.gitignore` ve `.editorconfig` incele

### Adim 2: 3 Paralel Tarama

**Tarama A: Yapi Analizi**
- Dizin agacini cikar (2 seviye derinlik)
- Kaynak kod dizinlerini belirle (src, lib, app, vb.)
- Test dizinlerini bul (test, __tests__, spec, vb.)
- Konfigur asyon dosyalarini listele
- CI/CD dosyalarini bul (.github, .gitlab-ci, Jenkinsfile, vb.)
- Docker dosyalarini tespit et

**Tarama B: Teknoloji Tespiti**
- Manifest dosyalarini oku (package.json, Cargo.toml, pyproject.toml, go.mod, vb.)
- Framework ve kutuphaneleri listele
- Versiyon bilgilerini topla
- Gelistirme araclarini belirle (linter, formatter, bundler)
- Veritabani teknolojisini tespit et (migration dosyalari, ORM konfigurasyon)

**Tarama C: Dokumantasyon Taramasi**
- Tum markdown dosyalarini bul
- API dokumantasyonunu ara (OpenAPI, Swagger, vb.)
- Yorum yogunlugu analizi (JSDoc, docstring, vb.)
- Ortam degiskeni dokumantasyonu (.env.example)
- Mimari karar kayitlari (ADR) var mi?

### Adim 3: Bagimlilik Analizi
- Dogrudan bagimliliklari listele
- Gelistirme bagimliliklerini ayir
- Guncelligini yitirmis bagimliliklari tespit et
- Guvenlik uyarilari kontrol et (npm audit, cargo audit, vb.)
- Bagimlilik grafigi cikart (ana moduller arasi iliskiler)

### Adim 4: Kod Kaliplari
Kullanilan kaliplari tespit et:
- Mimari kalip (MVC, MVVM, Clean Architecture, Hexagonal, vb.)
- Hata yonetimi yaklasimlari (try-catch kaliplari, Result tipi, vb.)
- Loglama stratejisi
- Test stratejisi (unit, integration, e2e oranlari)
- Isimlendirme konvansiyonlari
- Import/export kaliplari
- State yonetimi yaklasimlari

### Adim 5: Git Arkeolojisi
- En cok degisen dosyalari bul (son 3 ay)
- Ana katkilcilari belirle
- Branch stratejisini analiz et (main, develop, feature, vb.)
- Commit mesaj formatini tespit et (conventional commits, vb.)
- Son release tarihini ve versiyonu bul
- Merge/rebase stratejisini belirle

### Adim 6: ONBOARDING.md Olustur
```markdown
# Proje Alistirma Kilavuzu

## Proje Ozeti
[projenin ne yaptigi, 2-3 cumle]

## Teknoloji Yigini
| Kategori | Teknoloji | Versiyon |
|----------|-----------|----------|
| Dil | ... | ... |
| Framework | ... | ... |
| Veritabani | ... | ... |
| Test | ... | ... |

## Dizin Yapisi
```
[agac gorunumu]
```

## Baslangic Komutlari
```bash
# Kurulum
[kurulum komutlari]

# Calistirma
[calistirma komutlari]

# Test
[test komutlari]
```

## Onemli Dosyalar
- [dosya]: [aciklama]
- [dosya]: [aciklama]

## Mimari Notlar
[mimari kaliplar ve kararlar]

## Kod Konvansiyonlari
[isimlendirme, format, commit mesaji kurallari]

## Bilinen Sorunlar / Teknik Borc
[tespit edilen sorunlar]

## Bagimlilik Notlari
[dikkat edilmesi gereken bagimliliklar]
```

# Cikti Formati
- `ONBOARDING.md` dosyasi (detayli alistirma kilavuzu)
- Guncellenmis `memory.md` (proje bilgileri)
- Terminal ozeti (temel bulgular)
