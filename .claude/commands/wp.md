WordPress site management command. Site status, plugin/theme management, security scan, and bulk updates.

# Gerekli Araclar
- Bash (badi wp komutlari)

# Prosedur

### Adim 1: Site Kaydi Kontrolu
```bash
badi wp list
```
Kullanicinin kayitli siteleri varsa goster, yoksa ekleme onerisi yap:
```bash
badi wp add [alias] [url] --method [wp-cli|rest]
```

### Adim 2: Site Durumu
```bash
badi wp status [alias]
```
Gosterir:
- WordPress surumu
- Aktif tema
- Eklenti sayisi + guncelleme bekleyen
- Core guncelleme durumu

### Adim 3: Detayli Inceleme (istege bagli)

```bash
badi wp plugins [alias]       # Eklenti listesi
badi wp themes [alias]        # Tema listesi
```

### Adim 4: Guvenlik Taramasi
```bash
badi wp security [alias]
```
6 nokta kontrolu:
- WP Core guncelligi
- Eklenti guncellemeleri
- Pasif eklenti (kaldirilabilir)
- WP_DEBUG kapali mi
- DISALLOW_FILE_EDIT tanimli mi
- `admin` kullanicisi ve admin sayisi

### Adim 5: Toplu Guncelleme (Dikkatli!)
```bash
badi wp update [alias] all                  # Core + plugin + theme (120s timeout)
badi wp update [alias] core                 # Sadece core
badi wp update [alias] plugins              # Sadece plugins
badi wp update [alias] themes               # Sadece themes
badi wp update [alias] [plugin-name]        # Belirli eklenti
```

**Staging'de test et, production icin backup al.**

### Adim 6: Takip Aksiyonlari

Guvenlik sorunu varsa:
- `/secret-scan` — uygulama tarafinda da sir ara
- `/ssl-check [domain]` — SSL durumu
- `/dns-audit [domain]` — Email guvenlik

# Baglanti Yontemleri

| Method | Senaryo |
|--------|---------|
| `--method wp-cli --path /var/www/` | Lokal WordPress kurulumu |
| `--method wp-cli --ssh user@host` | SSH + remote WP-CLI |
| `--method rest` | REST API (interactive password'li kisitli) |

Application password icin: WP Admin → Users → Profile → Application Passwords

# Ornek Kullanim

```
Kullanici: /wp
Asistan: Kayitli WP siteleriniz: [list]
         Hangisinde calismak istersiniz?

Kullanici: blog
Asistan: [badi wp status blog calistirir]
         [Sonuclari yorumlar, guvenlik taramasi onerir]
```
