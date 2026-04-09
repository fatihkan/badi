Badi konfigur asyon dogrulamas i. Tum Badi bilesenlrini kontrol eder ve tanisal rapor olusturur.

# Gerekli Araclar
- Bash (dosya izinleri, dizin yapisi kontrolu)
- Read (konfigur asyon ve manifest dosyalari)
- Glob (dosya var lk taramasi)
- Grep (referans dogrulama)

# Amac
Bu komut Badi sisteminin dogru yapilandirildigini dogrular.
Yeni kurulum sonrasi veya sorun yasandiginda calistirilmasi onerilir.

---

## Kontrol 1: Hook Scriptleri

### Adim 1: Hook Dosya Varligi
- `.claude/hooks/` dizinini tara
- Tum `.sh` ve `.js` dosyalarini listele
- Beklenen hook'larin mevcut oldugunu dogrula:
  - Pre-commit hook
  - Post-commit hook
  - Pre-push hook (varsa)
  - Ozel Badi hooklari

### Adim 2: Calistirma Izinleri
- Her hook dosyasinin calistirma iznini kontrol et (`chmod +x`)
- Izni olmayan dosyalar icin UYARI ver
- Shebang satiri (`#!/bin/bash` veya `#!/usr/bin/env node`) kontrolu yap
- Sonuc: GECTI / UYARI / BASARISIZ

---

## Kontrol 2: Settings.json Dogrulamas i

### Adim 3: Dosya Varligi ve Format
- `.claude/settings.json` dosyasinin varligini kontrol et
- JSON formatinin gecerli oldugunu dogrula (parse edilebilir mi)
- Bos veya eksik dosya icin BASARISIZ ver

### Adim 4: Hook Referanslari
- settings.json icindeki hook tanimlarini oku
- Her referans edilen hook dosyasinin fiziksel olarak var oldugunu dogrula
- Kirik referanslar (dosyasi olmayan hook tanimlari) icin BASARISIZ ver
- Kullanilmayan hook dosyalari (tanimda olmayan) icin UYARI ver
- Sonuc: GECTI / UYARI / BASARISIZ

---

## Kontrol 3: Agent Dosyalari

### Adim 5: Agent Dizini Taramasi
- `.claude/agents/` dizinini tara
- Tum `.md` dosyalarini listele

### Adim 6: Frontmatter Dogrulamas i
Her agent dosyasi icin:
- Dosyanin basinda gecerli frontmatter olup olmadigini kontrol et
- Gerekli alanlar: `name`, `description` (veya ilk satir aciklama)
- Arac (tools) tanimlarinin gecerli formatta oldugunu dogrula
- Bos veya hatali agent dosyalari icin UYARI ver
- Sonuc: GECTI / UYARI / BASARISIZ

---

## Kontrol 4: Command-Index Referanslari

### Adim 7: Index Dosyasini Oku
- `command-index.md` dosyasini bul ve oku
- Index'te listelenen tum komut referanslarini cikar

### Adim 8: Referans Eslestirme
- Her index girisinin `.claude/commands/` altinda karsilik gelen dosyasi var mi kontrol et
- commands/ altinda olan ama index'te olmayan dosyalari tespit et
- Index'te olan ama dosyasi olmayan kayiplari BASARISIZ olarak isaretl
- Eklenmemis dosyalari UYARI olarak isaretl
- Sonuc: GECTI / UYARI / BASARISIZ

---

## Kontrol 5: Bellek Dosyalari

### Adim 9: Bellek Dosya Boyutlari
- `memory.md` dosyasinin varligini kontrol et
- Dosya boyutunu olc
- Boyut limiti asiliyor mu kontrol et (oner: 50KB uzeri icin UYARI)
- `knowledge-base.md` icin ayni kontrolleri uygula
- Cok buyuk bellek dosyalari performansi olumsuz etkiler

### Adim 10: Bellek Icerigi Kontrolu
- memory.md icinde zorunlu bolumlerin varligini dogrula
- Bos veya yapilandirilmamis bellek dosyasi icin UYARI ver
- Sonuc: GECTI / UYARI / BASARISIZ

---

## Kontrol 6: Skill Dizin Yapisi

### Adim 11: Skills Dizini
- `.claude/skills/` dizinini kontrol et (mevcutsa)
- `INDEX.md` dosyasinin var oldugunu dogrula
- Her skill dosyasinin gecerli formatta oldugunu kontrol et
- Dizin yoksa veya bossa UYARI ver (zorunlu degil)
- Sonuc: GECTI / UYARI / ATLANIDI

---

## Tanisal Rapor

### Adim 12: Birlestirilmis Rapor Olustur
```
╔═══════════════════════════════════════════╗
║      BADI DOKTOR - TANISAL RAPOR          ║
║      Tarih: [GG.AA.YYYY]                 ║
╠═══════════════════════════════════════════╣
║                                           ║
║  Hook Scriptleri:    [GECTI/UYARI/BSRSZ] ║
║  > [detay]                                ║
║                                           ║
║  Settings.json:      [GECTI/UYARI/BSRSZ] ║
║  > [detay]                                ║
║                                           ║
║  Agent Dosyalari:    [GECTI/UYARI/BSRSZ] ║
║  > [detay]                                ║
║                                           ║
║  Command-Index:      [GECTI/UYARI/BSRSZ] ║
║  > [detay]                                ║
║                                           ║
║  Bellek Dosyalari:   [GECTI/UYARI/BSRSZ] ║
║  > [detay]                                ║
║                                           ║
║  Skill Dizini:       [GECTI/UYARI/ATLND] ║
║  > [detay]                                ║
║                                           ║
╠═══════════════════════════════════════════╣
║  Sonuc: [sayi] GECTI / [sayi] UYARI /    ║
║         [sayi] BASARISIZ                  ║
║                                           ║
║  [Tum kontroller GECTI ise]               ║
║  Badi sistemi saglikli calisyor.          ║
║                                           ║
║  [BASARISIZ varsa]                        ║
║  Duzeltme Gerektiren Sorunlar:            ║
║  1. [sorun ve cozum onerisi]              ║
║  2. [sorun ve cozum onerisi]              ║
╚═══════════════════════════════════════════╝
```
