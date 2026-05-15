Teknik borc haritalama komutu. Kod tabanindaki teknik borcu sistematik olarak tespit eder ve onceliklendirir.

# Gerekli Araclar
- Grep (kod taramasi)
- Glob (dosya bulma)
- Read (dosya okuma)
- Bash (karmasiklik analizi, git blame)
- Write (rapor yazimi)

# Prosedur (4 Adim)

### Adim 1: Kapsam Belirle
Kullaniciya sor:
- **Tum proje:** Komple kod tabanini tara
- **Modul:** Belirli bir modul veya dizin
- **Katman:** Belirli bir katman (API, UI, veritabani, vb.)

Kapsam bilgisini kaydet:
- Taranacak dizinler
- Dahil edilecek dosya turleri
- Haric tutulacak dizinler (node_modules, vendor, dist, build, vb.)

### Adim 2: 3 Paralel Tarama

**Tarama A: TODO/FIXME Envanteri**
- `TODO` etiketlerini tara ve kategorilere ayir
- `FIXME` etiketlerini tara (acil mudahale gerektiren)
- `HACK` etiketlerini tara (gecici cozumler)
- `WORKAROUND` etiketlerini tara (bilinen sorun gecici cozumleri)
- `DEPRECATED` etiketlerini tara (kullanilmamasi gereken)
- `XXX` ve `BUG` etiketlerini tara
- Her bulgu icin dosya yolu, satir numarasi ve baglamini kaydet
- Git blame ile yaslarini tespit et ve eski olanlari vurgula

**Tarama B: Karmasiklik Analizi**
- 500+ satirlik dosyalari tespit et (asiri buyuk)
- 100+ satirlik fonksiyonlari bul (asiri uzun)
- 3+ seviye ic ice gecen kosullari bul (derin nesting)
- Cok fazla import/bagimlilik iceren dosyalar
- Tekrarlayan kod bloklari (copy-paste tespiti)
- 5+ parametreli fonksiyonlar
- Derin miras hiyerarsileri (3+ seviye)
- God class/God function tespiiti

**Tarama C: Eskime ve Kullanilmama Tespiti**
- Kullanilmayan export/fonksiyonlar
- Deprecated API kullanimi (dil ve framework bazli)
- Guncelligini yitirmis bagimliliklar
- Uyumsuz versiyon eslemeleri
- Kaldirilmis veya desteklenmeyen kutuphaneler
- Eski konfigur asyon formatlari
- Yoruma alinmis kod bloklari (zombi kod)
- Olmeyen feature flag'ler

### Adim 3: Skorlama
Her teknik borc maddesi icin skor hesapla:

**Etki Skoru (1-5):**
- 5: Uretim kesintisi riski, guvenlik acigi
- 4: Performans degradasyonu, veri tutarsizligi
- 3: Gelistirme hizini onemli olcude yavaslatir
- 2: Kod okunabilirligini ve bakim kolayligini azaltir
- 1: Kozmetik sorun, minor tutarsizlik

**Efor Skoru (1-5):**
- 1: Hizli duzeltme (< 1 saat)
- 2: Kisa gorev (1-4 saat)
- 3: Yarim gunluk is (4-8 saat)
- 4: Tam gunluk is (1-2 gun)
- 5: Cok gunluk refactoring (3+ gun)

**Oncelik Hesabi:** Etki / Efor = Oncelik Skoru
- **Yuksek oncelik:** skor >= 2.0 (yuksek etki, dusuk efor = hemen yap)
- **Orta oncelik:** skor 1.0 - 1.99 (sprint icinde planla)
- **Dusuk oncelik:** skor < 1.0 (arka planda birak)

### Adim 4: Markdown Rapor Olustur

# Cikti Formati
```markdown
# Teknik Borc Haritasi - [tarih]

## Ozet Istatistikler
- Toplam Borc Maddesi: [sayi]
- Kritik (Yuksek Oncelik): [sayi]
- Orta Oncelik: [sayi]
- Dusuk Oncelik: [sayi]
- Tahmini Toplam Efor: [saat/gun]
- En Borclu Modul: [modul adi]

## TODO/FIXME Envanteri
| # | Dosya | Satir | Tur | Yas | Etki | Efor | Oncelik | Aciklama |
|---|-------|-------|-----|-----|------|------|---------|----------|
| 1 | ... | ... | TODO | ... | ... | ... | ... | ... |

## Karmasiklik Sicak Noktalari
| # | Dosya | Satir Sayisi | Karmasiklik | Etki | Efor | Sorun |
|---|-------|-------------|-------------|------|------|-------|
| 1 | ... | ... | ... | ... | ... | ... |

## Eskimis Bilesenler
| # | Bilesen | Tur | Risk | Efor | Oneri |
|---|---------|-----|------|------|-------|
| 1 | ... | ... | ... | ... | ... |

## Oncelikli Eylem Plani
### Hemen Yapilmali (Oncelik >= 2.0)
1. [madde] - Etki: [skor] / Efor: [skor] = Oncelik: [skor]

### Sprint Ici (Oncelik 1.0 - 1.99)
1. [madde]

### Arka Plan (Oncelik < 1.0)
1. [madde]

## Trend Analizi
[onceki taramalarla karsilastirma, borc artisi/azalisi]

## Takip Metrikleri
[sonraki tarama icin temel degerler]
```
