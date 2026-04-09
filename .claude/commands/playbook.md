Is akisini komuta donusturme komutu. Tekrarlayan manuel is akislarini yeniden kullanilabilir Badi komutlarina cevirir.

# Gerekli Araclar
- Read (mevcut komutlari inceleme)
- Write (yeni komut dosyasi olusturma)
- Glob (mevcut komutlari listeleme)
- Grep (kalip ve referans taramasi)

# Prosedur (7 Adim)

### Adim 1: Isimlendir
Komut icin uygun bir isim belirle:
- Arguman olarak verilmisse onu kullan
- Verilmemisse, aciklamadan anlamli bir isim turet
- Isimlendirme kurallari:
  - Kucuk harf, tire ile ayirma (kebab-case): `hata-takip`, `sprint-plan`
  - Kisa ve akilda kalici (1-3 kelime)
  - Eylemi yansitan (fiil veya fiil-nesne)
  - Mevcut komutlarla cakismayan

Mevcut komutlari kontrol et:
- `.claude/commands/` dizinini tara
- Ayni veya benzer isimli komut var mi?
- Cakisma varsa alternatif oner

### Adim 2: Is Akisini Yakala
Kullanicidan is akisinin her adimini detayli al:

Her adim icin su bilgileri topla:
- **Ne yapiliyor?** (eylem aciklamasi)
- **Nerede yapiliyor?** (hangi dosya, dizin, sistem)
- **Neden yapiliyor?** (amac ve baglam)
- **Girdiler:** Bu adimin ihtiyac duydugu veriler
- **Ciktilar:** Bu adimin uretti  gi sonuclar
- **Basari Kriteri:** Adimin basarili sayilmasi icin ne olmali?
- **Hata Durumu:** Bir seyler yanlildiginda ne yapilmali?

Adimlari kronolojik siraya diz ve numaralandir.

### Adim 3: Kaliplari Tespit Et
Is akisinda tekrarlayan ve optimize edilebilir kaliplari bul:

**Paralellik Firsatlari:**
- Birbirinden bagimsiz adimlar (ayni anda calistirilabilir)
- Paralel calistirilabilecek alt gorevler

**Kullanici Giris Noktalari:**
- Insan karari gerektiren adimlar
- Onay beklemesi gereken anlar
- Kullanicidan veri alinmasi gereken noktalar

**Kosullu Dallanmalar:**
- "Eger X ise Y yap, degilse Z yap" kaliplari
- Opsiyonel adimlar
- Hata durumu yonlendirmeleri

**Arac Gereksinimleri:**
- Her adim icin gereken Claude araclar (Read, Write, Bash, Grep, vb.)
- Dis arac bagimliliklari (git, npm, docker, vb.)

**Mevcut Skill Eslesmesi:**
- Bu is akisinin parcalari mevcut bir komutla ortusuyor mu?
- Mevcut komutlar alt adim olarak cagrilabilir mi?

### Adim 4: Arguman Belirle
Her calistirmada degisen girdileri tanimla:

- Hangi degerler her seferinde farkli olacak?
- Varsayilan degerler neler olmali?
- Zorunlu ve opsiyonel argumanlari ayir
- `argument-hint` aciklamasi yaz (kullaniciya ne girmesi gerektigini soyleyen metin)

Ornek:
```
Arguman: [proje-adi]
Varsayilan: mevcut dizin adi
Aciklama: "Playbook olusturulacak projenin adi"
```

### Adim 5: Komut Dosyasi Olustur
`.claude/commands/[isim].md` dosyasini standart formatta olustur:

```markdown
[Tek satirlik aciklama. Ne yaptigini ozetleyen cumle.]

# Gerekli Araclar
- [Arac 1] ([ne icin kullanildigi])
- [Arac 2] ([ne icin kullanildigi])

# Prosedur ([toplam adim sayisi] Adim)

### Adim 1: [Adim Adi]
[detayli talimatlar]

### Adim 2: [Adim Adi]
[detayli talimatlar]

...

# Cikti Formati
```
[beklenen cikti sablonu]
```
```

Dosya icerigi icin kurallar:
- Turkcce yaz, acik ve net ifadeler kullan
- Her adim kendi basina anlasilir olmali
- Arac kullanimini acikca belirt
- Hata durumlarini ele al
- Cikti formatini net tanimla

### Adim 6: Dogrula ve Iyilestir
Olusturulan komutu kullaniciya sun:
- "Bu komut beklediginiz is akisini dogru yansityor mu?"
- Eksik veya yalnilis adim var mi?
- Ek kosullar veya ozel durumlar var mi?
- Duzenleme talepleri varsa uygula
- Nihai halini onayla

Teknik dogrulama:
- Referans edilen tum araclar gecerli mi?
- Dosya yollari dogru mu?
- Markdown formati hatasiz mi?
- Cikti formati tutarli mi?

### Adim 7: Indekse Ekle
`command-index.md` dosyasini guncelle (varsa):
- Yeni komutu uygun kategoriye ekle
- Aciklama satiri ekle
- Iliskili komutlara capraz referans ver

Guncelleme formati:
```markdown
| /[isim] | [kisa aciklama] | [kategori] |
```

# Cikti Formati
```
=== BADI PLAYBOOK ===
Komut: /[isim]
Dosya: .claude/commands/[isim].md
Adim Sayisi: [sayi]
Arac Sayisi: [sayi]
Arguman: [arguman aciklamasi veya "yok"]

Durum: OLUSTURULDU
Indeks: GUNCELLENDI / INDEKS YOK

> "[isim]" komutu `/[isim]` olarak kaydedildi.
> Bu is akisini tekrarlamak icin istediginiz zaman calistirin.
======================
```

# Ipuclari
- Basit is akislarini gereksiz yere karmasiklastirma
- 3-7 adim ideal uzunluk, 10'u gecmemeye calis
- Her komutu tek bir amaca odakla (tek sorumluluk)
- Karmasik is akislarini birden fazla komuta bol
- Mevcut komutlari alt adim olarak referans etmekten cekinme
