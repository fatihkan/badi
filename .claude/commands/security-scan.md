Guvenlik taramasi. Kod tabani ve bagimliliklarda guvenlik aciklari arar ve ciddiyet siralmasili rapor olusturur.

# Gerekli Araclar
- Bash (npm audit, bagimlilik taramasi)
- Read (konfigur asyon dosyalari)
- Grep (kod kalip taramasi)
- Glob (dosya tespiti)
- Agent (security-scanner: detayli guvenlik analizi)

# Ajan Delegasyonu
Bu komut ana tarama isini security-scanner ajanina devreder.
Ajan bulunamazsa, asagidaki adimlari dogrudan uygula.

---

## Bolum 1: Bagimlilik Acigi Taramas i

### Adim 1: Paket Yoneticisi Tespiti ve Audit
- npm: `npm audit --json` calistir
- yarn: `yarn audit --json` calistir
- pip: `pip audit` veya `safety check` calistir
- cargo: `cargo audit` calistir (mevcutsa)

### Adim 2: Acik Siniflandirmasi
Her bulunan acik icin kaydet:
- Paket adi ve versiyonu
- CVE numarasi (varsa)
- Ciddiyet seviyesi: KRITIK / YUKSEK / ORTA / DUSUK
- Duzeltme mevcut mu (hangi versiyona guncellenecek)
- Geciici cozum var mi

### Adim 3: Bagiml ilik Zinciri Analizi
- Dogrudan bagimlilik mi yoksa gecisli bagimlilik mi belirle
- Gecisli bagimliliklarda hangi ust paketin getirdigini goster
- Lock dosyasinin guncel oldugunu dogrula

---

## Bolum 2: Kod Kalip Analizi

### Adim 4: Sabit Kodlu Sir Taramas i
Asagidaki kaliplari kodda ara:
- API anahtarlari: `api[_-]?key\s*[:=]`
- Tokenlar: `token\s*[:=]\s*['"][A-Za-z0-9]`
- Sifreler: `password\s*[:=]\s*['"]`
- Gizli anahtarlar: `secret\s*[:=]\s*['"]`
- Veritabani baglanti dizeleri: `(mongodb|postgres|mysql):\/\/`
- AWS kimlik bilgileri: `AKIA[0-9A-Z]{16}`
- Private key bloklari: `BEGIN (RSA|DSA|EC) PRIVATE KEY`

### Adim 5: Enjeksiyon Vektoru Taramas i
- SQL enjeksiyonu: Ham sorgu birlestireleri, parametresiz sorgular
- XSS: `innerHTML`, `dangerouslySetInnerHTML`, filtresiz kullanici girdisi
- Komut enjeksiyonu: `exec()`, `eval()`, `child_process` kullanimi
- Yol gecisi: Dogrulanmamis dosya yolu birlestirmesi
- SSRF: Kullanici kontrollü URL'lere yapilan HTTP istekleri

### Adim 6: Kimlik Dogrulama ve Yetkilendirme Kaliplari
- JWT implementasyonunu incele (algoritma sabitleme, sure asimi)
- Sifre hashleme yontemi kontrol et (bcrypt/argon2 mi, MD5/SHA1 mi)
- Rate limiting uygulamasi var mi kontrol et
- CSRF korumasinin etkin oldugunu dogrula

---

## Bolum 3: Konfigur asyon Incelemesi

### Adim 7: CORS Politikasi
- CORS konfigurasyonunu bul ve oku
- Wildcard origin (`*`) kullanimi var mi kontrol et
- Izin verilen originlerin kabul edilebilir oldugunu dogrula
- Credentials ile wildcard birlikte kullanilmis mi kontrol et

### Adim 8: Guvenlik Basliklari
Asagidaki basliklarin konfigur e edildigini kontrol et:
- Content-Security-Policy (CSP)
- X-Content-Type-Options: nosniff
- X-Frame-Options veya frame-ancestors
- Strict-Transport-Security (HSTS)
- X-XSS-Protection
- Referrer-Policy

### Adim 9: Auth Konfigurasyonu
- Oturum yonetimi konfigurasyonunu incele
- Cookie ayarlari: secure, httpOnly, sameSite
- Token surelerini degerlendir
- Sifre politikasi gereksinimlerini kontrol et

---

## Bolum 4: Bulgular Raporu

### Adim 10: Ciddiyet Siralamas i
Tum bulgulari su siralama ile raporla:

```
╔════════════════════════════════════════════════╗
║         GUVENLIK TARAMASI RAPORU               ║
║         Tarih: [GG.AA.YYYY]                   ║
╠════════════════════════════════════════════════╣
║                                                ║
║  KRITIK  ([sayi] bulgu)                        ║
║  ----------------------------------------      ║
║  [K1] [aciklama] - [dosya:satir]               ║
║  [K2] [aciklama] - [dosya:satir]               ║
║                                                ║
║  YUKSEK  ([sayi] bulgu)                        ║
║  ----------------------------------------      ║
║  [Y1] [aciklama] - [dosya:satir]               ║
║                                                ║
║  ORTA    ([sayi] bulgu)                        ║
║  ----------------------------------------      ║
║  [O1] [aciklama] - [dosya:satir]               ║
║                                                ║
║  DUSUK   ([sayi] bulgu)                        ║
║  ----------------------------------------      ║
║  [D1] [aciklama] - [dosya:satir]               ║
║                                                ║
╠════════════════════════════════════════════════╣
║  Toplam: [sayi] bulgu                          ║
║  Acil Aksiyon Gerektiren: [sayi]               ║
║  Onerilen Duzeltme Suresi: [tahmin]            ║
╚════════════════════════════════════════════════╝
```

### Adim 11: Duzeltme Onerileri
Her bulgu icin:
- Sorunun kisa aciklamasi
- Onerien duzeltme yontemi
- Ornek kod veya konfigur asyon degisikligi
- Referans baglanti (OWASP, CWE numarasi vb.)
