Is akisini komuta donusturme komutu. Tekrarlayan manuel is akislarini yeniden kullanilabilir Badi komutlarina cevirir.

# Gerekli Araclar
- Read (mevcut komutlar) -- Write (yeni komut) -- Glob (mevcut komut listesi) -- Grep (kalip/referans)

# Prosedur (7 Adim)

## 1. Isimlendir
- Arguman verilmisse onu kullan -- verilmemisse aciklamadan turet
- Kurallar: kebab-case (`hata-takip`, `sprint-plan`) -- kisa-akilda kalici (1-3 kelime) -- eylem yansitan (fiil/fiil-nesne) -- mevcutla cakismayan

Cakisma kontrolu: `.claude/commands/` tara -- ayni/benzer var mi -- alternatif oner.

## 2. Is Akisini Yakala
Her adim icin: ne yapiliyor (eylem) -- nerede (dosya/dizin/sistem) -- neden (amac/baglam) -- girdiler -- ciktilar -- basari kriteri -- hata durumu

Kronolojik sira + numaralandir.

## 3. Kaliplari Tespit Et
- **Paralellik:** bagimsiz adimlar -- paralel alt gorevler
- **Kullanici giris:** insan karari -- onay bekleme -- veri alinacak noktalar
- **Kosullu dallanma:** "Eger X ise Y, degilse Z" -- opsiyonel adim -- hata yonlendirme
- **Arac gereksinimi:** Claude araclar (Read, Write, Bash, Grep, ...) -- dis arac (git, npm, docker, ...)
- **Mevcut skill eslesmesi:** parcalari mevcut komutla ortusuyor mu -- alt adim olarak cagrilabilir mi

## 4. Arguman Belirle
Her calistirmada degisen girdileri tanimla:
- Hangi degerler degisecek -- varsayilanlar -- zorunlu/opsiyonel ayrim -- `argument-hint` aciklamasi

```
Arguman: [proje-adi]  Varsayilan: mevcut dizin  Aciklama: "Playbook olusturulacak projenin adi"
```

## 5. Komut Dosyasi
`.claude/commands/[isim].md` standart formatta olustur:

```markdown
[Tek satirlik aciklama]

# Gerekli Araclar
- [Arac 1] ([ne icin])
- [Arac 2] ([ne icin])

# Prosedur ([adim sayisi] Adim)

### Adim 1: [Ad]
[talimat]

### Adim 2: [Ad]
[talimat]

# Cikti Formati
```
[sablon]
```
```

Kurallar: Turkce yaz, acik-net -- her adim kendi basina anlasilir -- arac kullanimi acik -- hata durumlari -- net cikti formati.

## 6. Dogrula ve Iyilestir
Kullaniciya sun: is akisini dogru yansitiyor mu -- eksik/yanlis adim -- ek kosul/ozel durum -- duzenlemeleri uygula -- nihai onay.

Teknik: referans araclar gecerli -- dosya yollari -- markdown -- cikti formati tutarli.

## 7. Indekse Ekle
`command-index.md` (varsa): yeni komutu uygun kategoriye -- aciklama satiri -- iliskili komutlara capraz referans

`| /[isim] | [kisa aciklama] | [kategori] |`

# Cikti Formati
```
=== BADI PLAYBOOK ===
Komut: /[isim]
Dosya: .claude/commands/[isim].md
Adim Sayisi: [sayi]
Arac Sayisi: [sayi]
Arguman: [aciklama veya "yok"]

Durum: OLUSTURULDU
Indeks: GUNCELLENDI / INDEKS YOK

> "[isim]" komutu `/[isim]` olarak kaydedildi.
> Bu is akisini tekrarlamak icin istediginiz zaman calistirin.
======================
```

# Ipuclari
- Basit is akislarini gereksiz karmasiklastirma -- 3-7 adim ideal (10'u gecme) -- her komut tek amac (tek sorumluluk) -- karmasik akislari boyle -- mevcut komutlari alt adim referans et
