Acil duzeltme is akisi. Produksiyon hatalari icin hizli ve guvenli yama sureci yonetir.

# Gerekli Araclar
- Bash (git islemleri, test calistirma)
- Read (hata gunlukleri, stack trace analizi)
- Write (duzeltme dosyalari)
- Grep (hata kaynak tespiti)
- Glob (ilgili dosya taramasi)
- Agent (auditor: hizli T1 denetim)

# Kapsam Korumasi
ONEMLI: Bu is akisi sadece acil duzeltme icindir. Kapsam kaymasi kesinlikle reddedilir.
Eger duzeltme sirasinda baska bir iyilestirme firsati gorulurse, not olarak kaydet ama UYGULAMADAN devam et.

---

## Adim 1: Hotfix Dali Olustur

### 1a: Mevcut Durumu Kontrol Et
- `git status` ile temiz calisma dizini dogrula
- Kaydedilmemis degisiklikler varsa stash'le

### 1b: Dal Olustur
- Ana dali tespit et: `main` veya `master`
- `git checkout -b hotfix/[kisa-aciklama] [ana-dal]` komutuyla dal olustur
- Dal adlandirmasi: `hotfix/fix-login-crash`, `hotfix/patch-api-timeout` gibi aciklayici isimler kullan

---

## Adim 2: Hatayi Izole Et

### 2a: Hata Bilgilerini Topla
- Kullanicidan hata gunlugunu veya stack trace'i iste
- Varsa hata raporunu oku
- Hatanin tekrarlanma kosullarini belirle

### 2b: Kaynak Tespiti
- Stack trace'deki dosya ve satir numaralarini takip et
- Grep ile hata mesajini kod tabaninda ara
- Hatanin ilk kez ne zaman ortaya ciktigini git log ile kontrol et
- `git bisect` onerisinde bulun (gerekirse)

### 2c: Etki Analizi
- Hatadan etkilenen modulleri belirle
- Iliskili testlerin mevcut durumunu kontrol et

---

## Adim 3: Minimal Duzeltme Uygula

### 3a: Kapsam Kontrolu
- Duzeltme sadece hatanin kök nedenini hedeflemeli
- Refactoring YAPMA
- Yeni ozellik EKLEME
- Iliskisiz kod DEGISTIRME
- Her degisiklik icin sor: "Bu degisiklik hatanin cozumu icin zorunlu mu?"

### 3b: Duzeltmeyi Yaz
- Mumkun olan en kucuk degisikligi yap
- Degisikligin neden yapildigini yorum olarak ekle
- Yan etkileri minimize et

---

## Adim 4: Hedefli Testleri Calistir

### 4a: Mevcut Testleri Calistir
- Hatanin iliskili oldugu modülun testlerini calistir
- Regresyon testi olarak tum ilgili test suite'ini calistir
- Test sonuclarini raporla

### 4b: Duzeltme Dogrulama Testi
- Hatanin artik olusmadigini dogrulayan bir test yazilmasini oner
- Eger mevcut test hatanin kapsaminda degilse, yeni test ekle

---

## Adim 5: Geri Alma Plani Olustur

### 5a: Revert Komutu Hazirla
- `git revert` komutunu onceden hazirla ve kullaniciya sun:
```
# Geri alma komutu (gerekirse hemen calistirilabilir):
git revert [commit-hash] --no-edit
```

### 5b: Geri Alma Senaryosu
- Hangi kosullarda geri alma yapilmasi gerektigini belirt
- Geri almanin yan etkilerini acikla
- Alternatif geri alma stratejilerini listele

---

## Adim 6: PR Olustur

### 6a: Degisiklikleri Kaydet
- `git add` ile sadece duzeltme dosyalarini ekle
- Commit mesaji formati: `[HOTFIX] [kisa aciklama]`
- Ornek: `[HOTFIX] Fix null pointer in user auth flow`

### 6b: Auditor Denetimi
- Agent(auditor) ile hizli T1 denetim baslat
- Duzeltmenin kapsam disina cikmis olmadigini dogrula
- Guvenlik etkisi degerlendirmesi yap

### 6c: Pull Request Olustur
- PR basligina `[HOTFIX]` on eki ekle
- PR aciklamasina su bilgileri ekle:
  - Hatanin aciklamasi
  - Kok neden analizi
  - Yapilan duzeltme
  - Test sonuclari
  - Geri alma plani

# Cikti Formati
```
=== HOTFIX OZET ===
Dal: hotfix/[isim]
Hata: [kisa aciklama]
Kok Neden: [neden]
Duzeltme: [ne yapildi]
Degisiklik: [dosya sayisi] dosya, [satir sayisi] satir
Testler: [GECTI/BASARISIZ]
Geri Alma: git revert [hash]
PR: [PR URL]
===================
```
