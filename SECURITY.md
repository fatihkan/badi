# Guvenlik Politikasi

## Desteklenen Surumler

| Surum | Destek |
|-------|--------|
| 1.3.x | Aktif |
| < 1.3 | Desteklenmiyor |

## Guvenlik Ozellikleri

Badi asagidaki guvenlik katmanlarini icerir:

- **12 Hook** — guard-bash (tehlikeli komut engelleme), branch-guard (dal koruma), backup-before-write, completeness-gate (gizli bilgi tespiti)
- **48 Security Skill** — OWASP Top 10, 7 dil bazli tarayici, dependency audit, secret scanning
- **Log Rotasyonu** — Sinirsiz buyumeyi onler
- **Dependency Audit** — Her oturumda npm audit (24h cache)

## Guvenlik Acigi Bildirimi

Bir guvenlik acigi bulduysaniz:

1. **GitHub Security Advisory** kullanin (tercihli): [Yeni advisory olustur](https://github.com/fatihkan/badi/security/advisories/new)
2. **E-posta**: GitHub profilindeki iletisim bilgisi

**Lutfen public issue olarak ACMAYIN.**

## Gerekli Bilgiler

- Etkilenen dosya/akis
- Teknik aciklama
- Yeniden uretme adimlari
- Etki degerlendirmesi (CVSS tercihli)

## Yanit Sureci

| Asama | Sure |
|-------|------|
| Ilk teyit | 3 is gunu |
| Teknik degerlendirme | 7 is gunu |
| Yama yayini | 14 is gunu |

## Sorumlu Aciklama

Duzeltme yayinlanana kadar kamuya aciklama yapmayin.
