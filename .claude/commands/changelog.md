Otomatik degisiklik gunlugu olusturma. Commit gecmisinden yapilandirilmis changelog uretir.

## Badi CLI Komutu (v1.6+)
Hizli uretim icin:
```bash
badi changelog                    # Son tag'den HEAD'e onizleme
badi changelog --from v1.0.0      # Belirli tag'den
badi changelog --write --version 1.6.0  # CHANGELOG.md'ye yaz
```

CLI conventional commit tipleriyle otomatik gruplar. Asagidaki manuel adimlar karmasik durumlar icin (non-conventional commit'ler, breaking change isaretleme vb.).

# Gerekli Araclar
- Bash (git log, git tag, git diff)
- Read (mevcut CHANGELOG.md)
- Write (changelog dosyasi olusturma/guncelleme)
- Grep (commit mesaji arama)

# Format Standardi
Bu komut Keep-a-Changelog (keepachangelog.com) formatini kullanir.
Conventional Commits (feat:, fix:, breaking:, vb.) mesajlari otomatik kategorize edilir.

---

## Adim 1: Surum Araligini Belirle

### 1a: Son Etiketi Bul
- `git tag --sort=-version:refname` ile en son etiketi bul
- Etiket yoksa ilk commit'i baslangic noktasi olarak kullan
- Kullanicidan ozel aralik belirtmesini iste (istege bagli)

### 1b: Aralik Dogrulama
- Baslangic noktasi: [son etiket] veya [belirtilen commit]
- Bitis noktasi: HEAD (veya belirtilen commit)
- Aralikdaki toplam commit sayisini goster
- `git log [baslangic]..HEAD --oneline` ile on izleme sun

---

## Adim 2: Commit Mesajlarini Parse Et

### 2a: Commit Listesini Al
- `git log [aralik] --format="%H|%s|%an|%ad" --date=short` calistir
- Her commit icin: hash, mesaj, yazar, tarih bilgisi topla
- Merge commit'leri ayir (istege bagli dahil et veya haric tut)

### 2b: Conventional Commits Ayristirmasi
Asagidaki on ekleri tani:
- `feat:` veya `feature:` -> Ozellikler
- `fix:` veya `bugfix:` -> Duzeltmeler
- `breaking:` veya `BREAKING CHANGE:` -> Kirilma Degisiklikleri
- `refactor:` -> Yeniden Duzenleme
- `docs:` -> Dokumantasyon
- `perf:` -> Performans
- `test:` -> Test
- `chore:` veya `ci:` -> Bakim

### 2c: Conventional Olmayan Mesajlar
- On eki olmayan commit'leri iceriklerne gore siniflandir
- Siniflandirilamazsa "Diger" kategorisine ekle
- Kullaniciya belirsiz commit'ler icin kategori sormay teklif et

---

## Adim 3: Kategorize Et

### 3a: Ana Kategoriler
Bulgulari su siralamayla grupla:
1. **Kirilma Degisiklikleri** (BREAKING CHANGES) - En uste, dikkat cekici
2. **Ozellikler** (Features) - Yeni islevsellik
3. **Duzeltmeler** (Bug Fixes) - Hata giderimleri
4. **Performans** (Performance) - Performans iyilestirmeleri
5. **Yeniden Duzenleme** (Refactoring) - Kod yapisi degisiklikleri
6. **Dokumantasyon** (Documentation) - Belge degisiklikleri
7. **Test** - Test degisiklikleri
8. **Bakim** (Chores) - Yardimci degisiklikler

### 3b: Kapsam Bilgisi
- Eger commit mesajinda kapsam varsa (ornek: `feat(auth):`) grupla
- Kapsam bilgisini changelog girisi icinde goster

---

## Adim 4: Markdown Olustur

### 4a: Changelog Formati
Keep-a-Changelog formatinda olustur:

```markdown
# Degisiklik Gunlugu

## [Yayinlanmamis] - YYYY-AA-GG

### Kirilma Degisiklikleri
- **[kapsam]** Degisiklik aciklamasi ([hash])

### Ozellikler
- **[kapsam]** Yeni ozellik aciklamasi ([hash])

### Duzeltmeler
- Hata duzeltme aciklamasi ([hash])

### Yeniden Duzenleme
- Refactoring aciklamasi ([hash])

### Dokumantasyon
- Dokumantasyon degisikligi ([hash])
```

### 4b: Ek Bilgiler
- Katki saglayanlari listele (yazarlar)
- Toplam commit sayisini ekle
- Karsilastirma baglantisi ekle: `[Yayinlanmamis]: [repo-url]/compare/[etiket]...HEAD`

---

## Adim 5: CHANGELOG.md Guncelle (Istege Bagli)

### 5a: Mevcut Dosya Kontrolu
- `CHANGELOG.md` mevcut mu kontrol et
- Mevcutsa icerigi oku ve format uyumunu dogrula

### 5b: Kullanici Onay
- Olusturulan changelog icerigini on izleme olarak goster
- Kullaniciya sor: "CHANGELOG.md dosyasini guncelleyeyim mi?"
- Onay alinrsa, yeni girisleri dosyanin ustune ekle (mevcut icerigi koru)

### 5c: Dosya Yazimi
- Yeni bolumu mevcut icergin ustune ekle
- Baslik formatini koru
- Tarih ve surum bilgisini dogru formatta ekle

---

## Cikti Formati

### Adim 6: Ozet Rapor
```
=== CHANGELOG OZETI ===
Aralik: [baslangic] -> [bitis]
Toplam Commit: [sayi]
Kategoriler:
  Ozellikler:            [sayi]
  Duzeltmeler:           [sayi]
  Kirilma Degisiklikleri:[sayi]
  Yeniden Duzenleme:     [sayi]
  Dokumantasyon:         [sayi]
  Diger:                 [sayi]
Katki Saglayanlar: [yazar listesi]
CHANGELOG.md: [GUNCELLENDI / GUNCELLENMEDI]
========================
```
