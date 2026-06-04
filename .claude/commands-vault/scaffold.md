Code scaffolding command. Analyzes project structure and generates consistent module, component, or API skeletons.

# Gerekli Araclar
- Read (mevcut kod kaliplari)
- Write (iskele dosyalari)
- Grep (kalip tarama)
- Glob (dosya yapisi analizi)
- Agent (code-generator ajani)

# Prosedur (5 Adim)

### Adim 1: Iskele Turunu Belirle
Kullanicidan ne olusturulacagini ogren:
- **Modul/Bilesen** — Yeni UI bileseni veya is mantigi modulu
- **API Endpoint** — Yeni REST/GraphQL endpoint seti
- **CRUD** — Model tanimindan tam CRUD islemleri
- **Test** — Mevcut kod icin test iskelesi
- **Migration** — Veritabani goc dosyasi
- **Middleware** — Ara katman iskelesi
- **Servis** — Yeni servis sinifi/modulu

### Adim 2: Proje Kaliplarini Analiz Et
Mevcut proje yapisini tara:
- Dizin yapisi ve isimlendirme kurallari
- Import/export kaliplari
- Hata yonetimi yaklasimi
- Test dosyasi konumlandirmasi
- Tip tanimi stilleri

### Adim 3: Code-Generator Ajanina Devret
Ajana su bilgileri ilet:
- Iskele turu ve hedef isim
- Tespit edilen proje kaliplari
- Referans alinacak mevcut dosyalar

### Adim 4: Dosyalari Olustur
Uretilen iskeleyi diske yaz:
- Yeni dosyalari olustur
- Gerekli index/barrel dosyalarini guncelle
- Import'lari ekle

### Adim 5: Dogrula
- Uretilen dosyalarin proje kalibina uyumunu kontrol et
- TypeScript/lint hatasi olmadigini dogrula
- Sonraki adimlari listele (TODO isaretli yerler)

# Cikti Formati
```
=== BADI ISKELE ===
Tur: [modul/api/crud/test/migration]
Isim: [bilesen adi]

Olusturulan Dosyalar:
  + [dosya yolu] (yeni)
  ~ [dosya yolu] (guncellendi)

Sonraki: TODO isaretli yerlere is mantigi ekleyin.
====================
```
