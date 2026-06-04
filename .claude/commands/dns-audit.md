DNS record audit command. Checks A/AAAA/MX/TXT/SPF/DMARC/CAA records and scores email security.

# Gerekli Araclar
- Bash (badi dns komutu cagirisi)

# Prosedur

### Adim 1: Domain Al
Kullanicidan domain alinir. Argumansiz cagirildi ise sorarak alinir.

### Adim 2: Badi CLI Calistir
```bash
badi dns [domain]
```

### Adim 3: Sonucu Yorumla

Cikti su alanlari icerir:
- **A/AAAA**: IPv4/IPv6 kayitlari
- **MX**: Mail server'lar (priority bazli)
- **NS**: Name server'lar
- **TXT/SPF/DMARC**: Email guvenlik
- **CAA**: Cert authority kisitlamasi
- **SOA**: Zone authority bilgisi

### Adim 4: Email Guvenlik Onerileri

Eksik kayitlara gore:
- **SPF yoksa**: "SPF kaydi ekleyelim mi? Ornek: `v=spf1 include:_spf.google.com ~all`"
- **DMARC yoksa**: "DMARC policy oneriyorum: `v=DMARC1; p=quarantine; rua=mailto:dmarc@...`"
- **CAA yoksa**: "CAA kaydi saldiriya karsi koruma saglar. Let's Encrypt icin: `0 issue \"letsencrypt.org\"`"

### Adim 5: Takip Komutlari

- Guvenlik eksikligi varsa: `/ssl-check [domain]` oner
- WHOIS bilgisi icin: `/whois [domain]` oner

# Ornek
```
/dns-audit example.com
```
