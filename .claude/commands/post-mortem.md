Post-incident analysis (post-mortem) command. Documents root-cause analysis of production incidents and major failures.

# Gerekli Araclar
- Read (log dosyalari, olay kayitlari)
- Write (post-mortem raporu)
- Grep (hata kalip arama)
- Bash (git log, zaman damgasi analizi)

# Prosedur (6 Adim)

### Adim 1: Olay Ozetini Topla
- Olay ne zaman basladi? (ilk tespit)
- Olay ne zaman cozuldu? (tam kurtarma)
- Etki alani: Kac kullanici / hangi servisler etkilendi?
- Ciddiyet: KRITIK / YUKSEK / ORTA / DUSUK

### Adim 2: Zaman Cizelgesini Olustur
Dakika dakika olay kronolojisi:
```
[HH:MM] Ilk alarm / tespit
[HH:MM] Mudahale basladi
[HH:MM] Kok neden belirlendi
[HH:MM] Duzeltme uygulandi
[HH:MM] Dogrulama tamamlandi
[HH:MM] Tam kurtarma
```

### Adim 3: Kok Neden Analizi
5 Neden teknigini uygula:
1. Neden oldu? -> ...
2. Bu neden oldu? -> ...
3. Bu neden oldu? -> ...
4. Bu neden oldu? -> ...
5. Bu neden oldu? -> (kok neden)

Teknik kok neden + organizasyonel kok neden ayri belirle.

### Adim 4: Iyi Giden / Kotu Giden Analizi
**Iyi Giden:**
- Hizli tespit edilen seyler
- Etkili mudahaleler
- Iyi calisan sistemler

**Kotu Giden:**
- Gec fark edilen sorunlar
- Yanlis yonlendirmeler
- Eksik alarm/izleme

**Sansli Olan:**
- Daha kotuye gidebilecek ama gitmemis durumlar

### Adim 5: Aksiyon Maddeleri
Her madde icin: sahip, oncelik, hedef tarih
- **Hemen** (bu hafta): Acil duzeltmeler
- **Kisa Vadeli** (bu sprint): Onleyici tedbirler
- **Uzun Vadeli** (bu cayrek): Yapisal iyilestirmeler

### Adim 6: Rapor Olustur ve Kaydet
`post-mortems/[tarih]-[olay-adi].md` dosyasina kaydet.

# Cikti Formati
```
=== BADI POST-MORTEM ===
Olay: [olay adi]
Tarih: [tarih]
Ciddiyet: [seviye]
Etki Suresi: [dakika/saat]
Kok Neden: [tek cumle ozet]
Aksiyon: [sayi] madde
Dosya: post-mortems/[tarih]-[olay-adi].md
========================
```

# Not
- Suclamayan, ogrenme odakli dil kullan
- "Kim" degil "ne" ve "neden" sorusu sor
- Her post-mortem sonrasi knowledge-base.md'ye aday goster
