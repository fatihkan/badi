Architecture Decision Record (ADR) command. Documents architectural decisions in a structured format.

# Gerekli Araclar
- Read (mevcut ADR'ler)
- Write (yeni ADR dosyasi)
- Grep (iliskili karar arama)
- Agent (architecture-advisor ajani)

# Prosedur (5 Adim)

### Adim 1: Karar Baglamini Topla
Kullanicidan:
- Karar gerektiren durum nedir?
- Hangi kisitlamalar var? (zaman, butce, teknik)
- Kim etkilenecek?

### Adim 2: Alternatifleri Degerlendir
Architecture-advisor ajanina devret:
- Mevcut mimarivi analiz et
- En az 3 alternatif belirle
- Her alternatif icin artilari/eksileri listele
- Trade-off analizi yap

### Adim 3: Karari Belgele
ADR formatinda yaz:
```markdown
# ADR-[numara]: [Baslik]
Tarih: [tarih]
Durum: KABUL EDILDI

## Baglam
[Karari gerektiren durum, kisitlamalar, paydas ihtiyaclari]

## Karar
[Secilen yaklasim ve gerekcesi]

## Degerendirilen Alternatifler
### Alternatif A: [isim]
- Artilari: ...
- Eksileri: ...
- Neden secilmedi: ...

### Alternatif B: [isim]
...

## Sonuclar
### Pozitif
- ...
### Negatif
- ...
### Notr
- ...

## Iliskili Kararlar
- ADR-XX: [iliskili karar]
```

### Adim 4: Kaydet
- `docs/adr/` dizinine kaydet (yoksa olustur)
- ADR numarasini sirali ata
- INDEX.md'yi guncelle (varsa)

### Adim 5: Iliskili Dokumanlari Guncelle
- CLAUDE.md veya knowledge-base.md'ye referans ekle (uygunsa)
- Iliskili ADR'lere capraz referans ekle

# Cikti Formati
```
=== BADI ADR ===
Numara: ADR-[numara]
Baslik: [karar basligi]
Durum: KABUL EDILDI
Dosya: docs/adr/[numara]-[baslik].md
================
```
