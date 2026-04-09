Plugin yonetim komutu. Badi sistemine eklenti yukler, kaldirir ve listeler.

# Gerekli Araclar
- Bash (git clone, npm install, dosya kopyalama)
- Read (manifest dosyalari, mevcut konfigur asyon)
- Write (konfigur asyon guncelleme, dosya olusturma)
- Glob (dosya taramasi)
- Grep (referans arama)

# Alt Komutlar
Bu komut uc alt komut icerir:
- `install <kaynak>` - Yeni plugin yukle
- `remove <isim>` - Plugin kaldir
- `list` - Yuklu pluginleri listele

Kullanici alt komutu belirtmediyse hangisini istedigini sor.

---

## Alt Komut: install <kaynak>

### Adim 1: Kaynak Tipi Tespiti
- Git URL ise (`.git` ile bitiyor veya `github.com` iceriyor): Git kaynak
- npm paket adi ise: npm kaynak
- Yerel dizin yolu ise: Yerel kaynak
- Kaynak tipi belirlenemezse kullaniciya sor

### Adim 2: Plugin Indirme
**Git kaynagi icin:**
- Gecici dizine `git clone [URL]` yap
- `badi-plugin.json` manifest dosyasini kontrol et
- Manifest yoksa HATA ver ve dur

**npm kaynagi icin:**
- `npm pack [paket]` ile paketi indir
- Paketi gecici dizine ac
- `badi-plugin.json` manifest dosyasini kontrol et

**Yerel kaynak icin:**
- Belirtilen dizinde `badi-plugin.json` varligini dogrula

### Adim 3: Manifest Okuma ve Dogrulama
`badi-plugin.json` dosyasini oku ve dogrula:
```json
{
  "name": "plugin-adi",
  "version": "1.0.0",
  "description": "Plugin aciklamasi",
  "author": "Yazar adi",
  "agents": ["agent1.md", "agent2.md"],
  "commands": ["command1.md", "command2.md"],
  "skills": ["skill1.md"],
  "hooks": {
    "pre-commit": "hooks/pre-commit.sh",
    "post-save": "hooks/post-save.sh"
  }
}
```
Zorunlu alanlar: `name`, `version`
Gecersiz manifest icin HATA ver ve dur.

### Adim 4: Catisma Kontrolu
- Ayni isimde yuklu plugin var mi kontrol et
- Eklenen komutlarin mevcut komutlarla catisip catismadigini dogrula
- Agent isim catismalarini kontrol et
- Catisma varsa kullaniciyi bilgilendir ve onay iste

### Adim 5: Dosyalari Kopyala
- `.claude/plugins/[plugin-adi]/` dizinini olustur
- Manifest dosyasini kopyala
- Agent dosyalarini `.claude/agents/` altina kopyala
- Komut dosyalarini `.claude/commands/` altina kopyala
- Skill dosyalarini `.claude/skills/` altina kopyala
- Hook dosyalarini `.claude/hooks/` altina kopyala ve calistirma izni ver

### Adim 6: Index Guncelleme
- `command-index.md` dosyasina yeni komutlari `[Plugin]` etiketi ile ekle
- Ornek format: `| /plugin-komut | Aciklama [Plugin: plugin-adi] |`
- settings.json'a yeni hook referanslarini ekle (gerekirse)

### Adim 7: Kurulum Dogrulama
- Tum dosyalarin basariyla kopyalandigini dogrula
- `/doctor` calistirmayi oner
- Kurulum ozeti goster

---

## Alt Komut: remove <isim>

### Adim 8: Plugin Tespiti
- `.claude/plugins/[isim]/` dizininin var oldugunu dogrula
- `badi-plugin.json` manifestini oku
- Plugin yoksa HATA ver

### Adim 9: Kaldirilacak Dosyalari Belirle
- Manifeste gore hangi dosyalarin plugin tarafindan ekledigini tespit et
- Diger pluginlerle paylasilan dosyalari KORUMA (kaldirma)
- Kullaniciya kaldirilacak dosya listesini goster ve onay iste

### Adim 10: Dosyalari Kaldir
- Plugin agent dosyalarini sil
- Plugin komut dosyalarini sil
- Plugin skill dosyalarini sil
- Plugin hook dosyalarini sil
- Plugin dizinini sil: `.claude/plugins/[isim]/`
- `command-index.md`'den `[Plugin: isim]` etiketli satirlari kaldir
- settings.json'dan ilgili hook referanslarini kaldir

### Adim 11: Kaldirma Dogrulama
- Tum dosyalarin basariyla silindgini dogrula
- Kirik referans birakilmadigini kontrol et
- Kaldirma ozeti goster

---

## Alt Komut: list

### Adim 12: Yuklu Pluginleri Tara
- `.claude/plugins/` dizinini tara
- Her alt dizindeki `badi-plugin.json` dosyasini oku

### Adim 13: Plugin Listesi Olustur
```
╔═════════════════════════════════════════════════╗
║         BADI YUKLU PLUGINLER                    ║
╠═════════════════════════════════════════════════╣
║                                                 ║
║  [plugin-adi] v[surum]                          ║
║  > [aciklama]                                   ║
║  > Icerik: [s] agent, [s] komut, [s] skill      ║
║  > Yazar: [yazar]                               ║
║  > Kaynak: [git url veya npm paketi]            ║
║  ─────────────────────────────────────────      ║
║  [plugin-adi-2] v[surum]                        ║
║  > [aciklama]                                   ║
║  > Icerik: [s] agent, [s] komut, [s] skill      ║
║  > Yazar: [yazar]                               ║
║  > Kaynak: [git url veya npm paketi]            ║
║                                                 ║
╠═════════════════════════════════════════════════╣
║  Toplam: [sayi] plugin yuklu                    ║
║  Toplam Eklenen: [s] agent, [s] komut, [s] skill║
╚═════════════════════════════════════════════════╝
```

### Adim 14: Plugin Yoksa
- `.claude/plugins/` dizini yoksa veya bossa bilgilendir
- Plugin yukleme komutu ornegi goster:
  ```
  /plugin install https://github.com/user/badi-plugin-ornek.git
  /plugin install badi-plugin-ornek
  ```
