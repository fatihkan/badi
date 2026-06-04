Badi session start command. Runs new-project onboarding or a daily kickoff.

# Gerekli Araclar
- Bash (dosya sistemi erisimi)
- Read (bellek ve baglam dosyalari)
- Glob (proje yapisi taramasi)
- Grep (kod arama)
- Write (gunluk not olusturma)

# Mod Secimi

Kullaniciya sor: "Yeni proje alistirmasi mi, gunluk baslatma mi?"

---

## A) Yeni Proje Alistirmasi

### Adim 1: Proje Yapi Taramasi
- Kok dizindeki tum dosya ve klasorleri tara
- `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod` gibi manifest dosyalarini bul
- `.env.example`, `docker-compose.yml`, `Makefile` gibi altyapi dosyalarini tespit et

### Adim 2: Teknoloji Yigini Tespiti
- Programlama dilleri ve versiyonlari
- Framework ve kutuphaneler
- Veritabani ve dis servisler
- CI/CD ve deploy altyapisi
- Test araclari

### Adim 3: Baglam Sorulari (4 Soru)
Kullaniciya su sorulari yonelt:
1. "Bu projenin temel amaci ve hedef kullanicisi kim?"
2. "Su anki en onemli onceliginiz nedir?"
3. "Bilmem gereken teknik kisitlamalar veya kararlar var mi?"
4. "Calisma tarzinizla ilgili tercihleriniz nelerdir? (commit stili, branch stratejisi, test beklentileri)"

### Adim 4: Bellek Olusturma
Toplanan bilgilerle `memory.md` dosyasini olustur veya guncelle:
- Proje ozeti
- Teknoloji yigini
- Kullanici tercihleri
- Onemli dosya yollari
- Mimari notlar

### Adim 5: Skill Onerisi
Projeye uygun Badi komutlarini oner:
- Hangi komutlar bu proje icin en faydali olacak
- Onerilen gunluk is akisi
- Ozel komut ihtiyaclari varsa belirt

---

## B) Gunluk Baslatma

### Adim 1: Tarih Al
- Bugunku tarihi `GGAAYY` formatinda belirle (ornek: 090426)

### Adim 2: Baglam Yukle
- `memory.md` dosyasini oku
- `knowledge-base.md` varsa oku
- Son oturum notlarini kontrol et

### Adim 3: Gunluk Not Olustur
`daily-notes/GGAAYY.md` dosyasini olustur:
```markdown
# Gunluk Not - [GG.AA.YYYY]

## Odak Alanlari
- [ ] ...

## Notlar
...

## Kararlar
...

## Yarinki Isler
...
```

### Adim 4: Gorev Panosu Incele
- Acik gorevleri listele
- Gecen oturumdan kalan isleri kontrol et
- Tamamlanmis ama kapatilmamis gorevleri tespit et

### Adim 5: Arka Plan Watcher Ozeti (v1.13+)
- `badi agent status --since 24h` calistir (varsa; hata dondurse sessiz gec)
- Cikti `!! N uyari` iceriyorsa brifing'e "Watcher uyarilari" bolumu ekle
- Kullaniciya sor: "Bu uyarilara bakalim mi?"

### Adim 6: Oncelikleri Dogrula
Kullaniciya sor:
- "Bugunku oncelikler dogru mu?"
- "Degisiklik veya ekleme var mi?"

### Adim 7: Brifing
Kisa bir ozet sun:
```
=== BADI GUNLUK BRIFING ===
Tarih: [tarih]
Acik Gorevler: [sayi]
Bugunku Odak: [oncelikler]
Devam Eden: [onceki oturumdan kalanlar]
Watcher: [24h icinde N uyari | hepsi OK | watcher yok]
Dikkat: [onemli notlar veya uyarilar]
===========================
```

# Cikti Formati
- Mod A: Proje profili + bellek dosyasi + skill onerileri
- Mod B: Gunluk brifing + not dosyasi + oncelik listesi
