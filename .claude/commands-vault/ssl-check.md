SSL sertifika analizi komutu. Domain icin sertifika gecerliligi, TLS surumu, cipher gucu kontrolu yapar.

# Gerekli Araclar
- Bash (badi ssl komutu cagirisi)

# Prosedur

### Adim 1: Domain Kontrolu
Kullanicidan domain al. Argumansiz cagirildiysa hangi domaini test etmek istedigini sor.

### Adim 2: Badi CLI Calistir
```bash
badi ssl [domain]
```

Ornek:
```bash
badi ssl example.com
badi ssl github.com
```

### Adim 3: Sonucu Yorumla
Ciktiyi kullaniciya aktarirken dikkat edilecek noktalar:

- **Expire < 30 gun**: Kullaniciyi uyar, yenileme planlamasi oner
- **TLS < 1.2**: Guvenlik acigi, yukseltme zorunlu
- **Zayif cipher (RC4, 3DES, MD5)**: Guncelleme oner
- **SAN kontrol**: Kullaniciya domain listesi goster

### Adim 4: Takip Adimlari Oner

Duruma gore:
- Expire yakinsa: "Let's Encrypt otomatik yenileme scripti yazalim mi?"
- Zayif cipher varsa: "Nginx/Apache config ornegi gerekiyor mu?"
- OK durumunda: "`badi dns [domain]` ile DNS kontrolu yapmak ister misiniz?"

# Ornek Kullanim

```
Kullanici: /ssl-check example.com
Asistan: [badi ssl example.com calistirir, ciktiyi ozetler]
```
