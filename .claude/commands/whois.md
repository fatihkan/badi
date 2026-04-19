Domain WHOIS bilgisi komutu. Tescil tarihi, expire, registrar, transfer lock durumu kontrolu.

# Gerekli Araclar
- Bash (badi whois komutu cagirisi)

# Prosedur

### Adim 1: Badi CLI Calistir
```bash
badi whois [domain]
```

### Adim 2: Sonucu Yorumla

Onemli alanlar:
- **Registrar**: Domain saglayicisi
- **Creation Date**: Ilk tescil
- **Expiration Date**: Yenileme zamani
- **Domain Status**: Transfer Lock, Update Lock durumlari
- **Name Servers**: DNS yonetim

### Adim 3: Uyarilar

- **Expire < 30 gun**: "Acil yenileme gerekli"
- **Expire 30-90 gun**: "Yenileme planlayin"
- **Transfer Lock yok**: "Domain hijacking'e karsi lock'u acin"
- **Update Lock yok**: "Kritik domain icin lock oneriyorum"

### Adim 4: Kapsamli Domain Saglik Kontrolu

Kullaniciya su uclu kontrolu oner:
- `/whois [domain]` — zaten yapildi
- `/dns-audit [domain]` — DNS ve email guvenlik
- `/ssl-check [domain]` — SSL sertifika

Ya da tek komutla hepsini yap: "Domain saglik kontrolunu yapabilirim, 3 komut calistirmami ister misin?"

# Ornek
```
/whois example.com
```
