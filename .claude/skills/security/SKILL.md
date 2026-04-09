# Guvenlik Becerileri

Bu dosya, siber guvenlik, uyumluluk, erisim kontrolu, uygulama guvenligi ve tehdit yonetimi alanlarindaki tum becerileri icerir.

---

### guvenlik-acigi-degerlendirmesi

Sistem ve uygulamalardaki guvenlik aciklarini sistematik olarak tespit eder ve onceliklendirir.

**Adimlar:**
1. Degerlendirme kapsamini ve varlik envanterini belirle.
2. Otomatik tarama araclari ve manuel inceleme yontemlerini uygula.
3. Tespit edilen aciklari ciddiyet ve etkiye gore siniflandir.
4. Duzeltme oncelikleri ve zaman cizelgesiyle aksiyon plani olustur.

**Cikti Formati:** Guvenlik acigi raporu (varlik listesi, acik envanteri, ciddiyet siniflamas, duzeltme plani).

---

### penetrasyon-test-plani

Penetrasyon testi kapsamini, metodolojisini ve yurutme planini olusturur.

**Adimlar:**
1. Test kapsamini, sinirlarini ve kurallarini belirle.
2. Test metodolojisi sec (OWASP, PTES, NIST).
3. Test asamalarini ve zaman cizelgesini planla.
4. Raporlama formati ve bulgu siniflandirma kriterlerini tanimla.

**Cikti Formati:** Pentest plani (kapsam dokumani, metodoloji, zaman cizelgesi, raporlama sablonu).

---

### guvenlik-denetim-kontrol-listesi

Kapsamli guvenlik denetimi icin kontrol listesi olusturur ve denetim surecini yonetir.

**Adimlar:**
1. Denetim kapsamini ve uygulanacak standardi belirle.
2. Kontrol noktalarini kategorize et (ag, uygulama, veri, fiziksel).
3. Her kontrol noktasi icin dogrulama yontemi ve kanit gereksinimini tanimla.
4. Denetim bulgularini raporla ve duzeltme takvimi olustur.

**Cikti Formati:** Denetim kontrol listesi (kategori bazli kontroller, dogrulama yontemleri, bulgu raporu, duzeltme plani).

---

### uyumluluk-haritalama

Yasal ve sektorel uyumluluk gereksinimlerini teknik kontrollere haritalayarak uyum saglar.

**Adimlar:**
1. Gecerli uyumluluk cercevelerini belirle (KVKK, GDPR, SOC2, ISO 27001).
2. Gereksinim maddelerini teknik kontrollere esle.
3. Mevcut uyumluluk durumunu denetle ve boslukları tespit et.
4. Uyumluluk yol haritasi ve sureklilk izleme plani olustur.

**Cikti Formati:** Uyumluluk haritasi (gereksinim-kontrol eslesmesi, bosluk analizi, yol haritasi, izleme plani).

---

### erisim-kontrol-tasarimi

En az yetki ilkesine dayali erisim kontrol modeli ve politikalari tasarlar.

**Adimlar:**
1. Erisim kontrol modelini sec (RBAC, ABAC, PBAC).
2. Rol tanimlari, izin matrisi ve yetki hiyerarsisini olustur.
3. Erisim talep, onay ve gozden gecirme sureclerini tanimla.
4. Erisim denetimi ve periyodik gozden gecirme mekanizmasini kur.

**Cikti Formati:** Erisim kontrol plani (model secimi, rol matrisi, surec akislari, denetim takvimi).

---

### sifreleme-stratejisi

Veri sifreleme stratejisi olusturarak dinlenme ve aktarim halindeki verileri korur.

**Adimlar:**
1. Sifrelenecek veri siniflarini ve depolama konumlarini belirle.
2. Sifreleme algoritmalari ve anahtar uzunluklarini sec.
3. Anahtar yonetim yasam dongusunu tasarla (olusturma, rotasyon, yok etme).
4. Sifreleme uygulamasini dogrula ve performans etkisini test et.

**Cikti Formati:** Sifreleme stratejisi (veri siniflandirmasi, algoritma secimi, anahtar yonetim plani, test sonuclari).

---

### olay-mudahale-plani

Siber guvenlik olaylarinda mudahale surecini tanimlayan kapsamli plan olusturur.

**Adimlar:**
1. Olay siniflandirma ve siddet seviyeleri matrisini tanimla.
2. Mudahale takim rolleri ve iletisim zincirini belirle.
3. Olay asama prosedurlerini yaz (tespit, sinirlandirma, yok etme, kurtarma).
4. Olay sonrasi analiz ve ders cikarma surecini tasarla.

**Cikti Formati:** Olay mudahale plani (siniflandirma matrisi, ekip yapisi, asama proseduru, post-mortem sablonu).

---

### tehdit-modelleme

Tehdit modelleme metodolojisi uygulayarak potansiyel saldiri vektorlerini belirler.

**Adimlar:**
1. Sistem mimarisini ve veri akislarini diyagramla.
2. STRIDE veya benzer cerceve ile tehditleri tanimla.
3. Her tehdid icin olasilik ve etki degerlendirmesi yap.
4. Azaltma stratejileri ve guvenlik kontrollerini onceliklendir.

**Cikti Formati:** Tehdit modeli (mimari diyagram, tehdit katalogu, risk matrisi, azaltma onerileri).

---

### guvenlik-egitim-plani

Organizasyon icin guvenlik farkindalik ve yetkinlik egitim programi tasarlar.

**Adimlar:**
1. Hedef kitleleri ve egitim ihtiyaclarini belirle (genel, teknik, yonetim).
2. Egitim modulleri, icerik ve materyallerini olustur.
3. Egitim takvimi, dagitim yontemi ve degerlendirme kriterlerini planla.
4. Egitim etkililigini olc ve surekli guncelle.

**Cikti Formati:** Egitim plani (modul listesi, icerik taslagi, takvim, degerlendirme kriterleri, etki olcumu).

---

### api-guvenlik-incelemesi

API guvenligini kapsamli olarak denetleyerek aciklari ve riskleri tespit eder.

**Adimlar:**
1. API envanterini cikar ve kimlik dogrulama yontemlerini incele.
2. Yetkilendirme, girdi dogrulama ve cikti kodlama kontrollerini test et.
3. Rate limiting, veri sizintisi ve hata yonetimini denetle.
4. API guvenlik kontrol listesine gore bulgu ve onerileri raporla.

**Cikti Formati:** API guvenlik raporu (API envanteri, test sonuclari, bulgu listesi, duzeltme onerileri).

---

### sifir-guven-mimarisi

Zero Trust mimarisi ilkelerini uygulayarak ag guvenligi yaklasimini donusturur.

**Adimlar:**
1. Zero Trust olgunluk degerlendirmesi yap.
2. Kimlik merkezli erisim kontrolu ve mikro-segmentasyon planla.
3. Surekli dogrulama ve en az yetki mekanizmalarini tasarla.
4. Asama bazli uygulama yol haritasi ve metriklerini olustur.

**Cikti Formati:** Zero Trust plani (olgunluk degerlendirmesi, mimari tasarim, uygulama yol haritasi, basari metrikleri).

---

### veri-siniflandirma

Organizasyonel verileri hassasiyet seviyelerine gore siniflandirma politikasi olusturur.

**Adimlar:**
1. Veri siniflandirma katmanlarini tanimla (genel, dahili, gizli, cok gizli).
2. Her katman icin isleme, depolama ve paylasim kurallarini belirle.
3. Veri siniflandirma rehberi ve etiketleme proseduru olustur.
4. Siniflandirma uyumunu izleme ve denetim mekanizmasini kur.

**Cikti Formati:** Veri siniflandirma politikasi (katman tanimlari, isleme kurallari, etiketleme rehberi, denetim sureci).

---

### gizlilik-etki-degerlendirmesi

Kisisel verilerin islenmesine yonelik gizlilik etki degerlendirmesi (DPIA) yapar.

**Adimlar:**
1. Kisisel veri isleme faaliyetlerini ve amaclarini tanimla.
2. Gizlilik risklerini ve olasi etkileri degerlendir.
3. Risk azaltma onlemleri ve teknik kontrolleri belirle.
4. DPIA raporunu hazirlayarak gerekli onaylari al.

**Cikti Formati:** DPIA raporu (isleme faaliyetleri, risk degerlendirmesi, azaltma onlemleri, onay durumu).

---

### guvenlik-politika-yazimi

Organizasyonel bilgi guvenligi politikalarini yazar ve gunceller.

**Adimlar:**
1. Politika kapsamini ve hedef kitlesini belirle.
2. Politika maddelerini standartlara uygun olarak yaz.
3. Ilgili prosedur ve yonergeleri olustur.
4. Politika onay, dagitim ve gozden gecirme surecini tanimla.

**Cikti Formati:** Guvenlik politikasi (politika dokumani, iliskili prosedurler, dagitim plani, gozden gecirme takvimi).

---

### waf-yapilandirma-guvenlik

Web Application Firewall'u guvenlik odakli yapilandirarak web uygulamalarini korur.

**Adimlar:**
1. Web uygulama tehdit profilini ve koruma gereksinimlerini belirle.
2. WAF kural setlerini yapilandir (OWASP CRS, ozel kurallar).
3. False positive/negative ayarlamasi ve kural ince ayari yap.
4. WAF loglarini analiz et ve tehdit istihbarati ile zenginlestir.

**Cikti Formati:** WAF guvenlik plani (kural setleri, ozel kurallar, ayarlama notlari, log analiz rehberi).

---

### ddos-azaltma

DDoS saldirilarina karsi azaltma stratejisi ve prosedurlerini olusturur.

**Adimlar:**
1. DDoS saldiri vektorlerini ve risk profilini degerlendir.
2. Cok katmanli koruma mimarisini tasarla.
3. Saldiri tespit ve otomatik azaltma mekanizmalarini kur.
4. DDoS mudahale proseduru ve iletisim planini olustur.

**Cikti Formati:** DDoS azaltma plani (risk profili, koruma mimarisi, otomasyon kurallari, mudahale proseduru).

---

### tedarik-zinciri-guvenlik

Yazilim tedarik zinciri guvenligi stratejisi olusturarak ucuncu parti riskleri yonetir.

**Adimlar:**
1. Bagimlilk envanterini cikar ve ucuncu parti bilesenlerini listele.
2. Tedarik zinciri risk degerlendirmesi yap (SBOM analizi).
3. Bagimlilk zafiyet tarama ve guncelleme politikasini olustur.
4. Tedarik zinciri guvenlik izleme ve alarm mekanizmasini kur.

**Cikti Formati:** Tedarik zinciri guvenlik plani (SBOM, risk degerlendirmesi, guncelleme politikasi, izleme paneli).

---

### container-guvenlik

Container ve container orchestration ortamlarinin guvenligini saglar.

**Adimlar:**
1. Container image guvenlik taramasi ve politikasini olustur.
2. Runtime guvenlik kontrolleri ve izleme mekanizmasini kur.
3. Container ag guvenligi ve segmentasyonunu yapilandir.
4. Container supply chain guvenligi ve imzalama surecini uygula.

**Cikti Formati:** Container guvenlik plani (image politikasi, runtime kontrolleri, ag kurallari, imzalama sureci).

---

### bulut-guvenlik-durumu

Cloud Security Posture Management (CSPM) ile bulut ortaminin guvenlik durusunu denetler.

**Adimlar:**
1. Bulut ortami guvenlik baseline'ini belirle.
2. CSPM araci yapilandir ve otomatik tarama olustur.
3. Sapmalari tespit et ve duzeltme onceliklerini belirle.
4. Surekli uyumluluk izleme ve raporlama paneli kur.

**Cikti Formati:** CSPM raporu (baseline tanimlari, sapma listesi, duzeltme onerileri, uyumluluk paneli).

---

### jwt-uygulamasi

JSON Web Token (JWT) tabanli kimlik dogrulama ve yetkilendirme uygulamasini guvenli tasarlar.

**Adimlar:**
1. JWT token yapisi, claims ve imzalama algoritmasini belirle.
2. Token yasam suresi, yenileme ve iptal mekanizmasini tasarla.
3. Guvenli depolama ve iletim uygulamalarini implement et.
4. JWT ile ilgili yaygn saldirilara karsi koruma kontrollerini uygula.

**Cikti Formati:** JWT uygulama rehberi (token yapisi, yasam dongusu, guvenlik kontrolleri, kod ornekleri).

---

### oauth-tasarimi

OAuth 2.0 yetkilendirme akislarnini guvenli tasarlar ve uygular.

**Adimlar:**
1. Uygun OAuth akisini sec (Authorization Code, PKCE, Client Credentials).
2. Scope tanimlari ve izin modelini olustur.
3. Token yonetimi ve guvenlik kontrollerini tasarla.
4. OAuth uygulamasini guvenlik test senaryolari ile dogrula.

**Cikti Formati:** OAuth tasarim dokumani (akis diyagrami, scope tanimlari, guvenlik kontrolleri, test senaryolari).

---

### saml-entegrasyonu

SAML tabanli tek oturum acma (SSO) entegrasyonunu yapilandirir ve guvence altina alir.

**Adimlar:**
1. SAML mimari rollerini (IdP, SP) ve gereksinimlerini belirle.
2. Meta veri degisimi ve guven iliskisi yapilandirmasini yap.
3. Assertion dogrulama ve oturum yonetimini implement et.
4. SAML guvenlik kontrolleri ve imzalama yapilandirmasini test et.

**Cikti Formati:** SAML entegrasyon rehberi (mimari diyagram, yapilandirma adimlari, guvenlik kontrolleri, test plani).

---

### mfa-stratejisi

Cok faktorlu kimlik dogrulama (MFA) stratejisi tasarlayarak hesap guvenligi arttirir.

**Adimlar:**
1. MFA gereksinimlerini ve kapsami belirle (kullanici, admin, ayricalikli).
2. MFA yontemlerini sec (TOTP, FIDO2, SMS, biyometrik).
3. Kayit, kurtarma ve yedek mekanizmalarini tasarla.
4. MFA benimseme ve uyumluluk metriklerini izle.

**Cikti Formati:** MFA stratejisi (kapsam, yontem secimi, kayit sureci, kurtarma mekanizmasi, metrikler).

---

### parola-politikasi

Guclu parola politikasi olusturarak kimlik dogrulama guvenligi saglar.

**Adimlar:**
1. Parola karmasiklik, uzunluk ve gecmis gereksinimlerini belirle.
2. Parola depolama ve hashing stratejisini tanimla (bcrypt, Argon2).
3. Hesap kilitleme, sifre sifirlama ve ihlal kontrolu mekanizmalari kur.
4. Parola yoneticisi kullanimi ve egitim planini olustur.

**Cikti Formati:** Parola politikasi (gereksinimler, teknik standartlar, kilitleme kurallari, egitim materyali).

---

### sertifika-yonetimi-guvenlik

Dijital sertifika yasam dongusu yonetimini guvenlik perspektifinden planlar.

**Adimlar:**
1. Sertifika envanterini cikar ve siniflandir.
2. Sertifika edinme, yenileme ve iptal prosedurlerini tanimla.
3. Sertifika izleme ve otomatik uyari mekanizmasini kur.
4. Sertifika guvenlik standartlarini ve uyumlulugunu denetle.

**Cikti Formati:** Sertifika yonetim plani (envanter, prosedurler, izleme yapisi, uyumluluk kontrol listesi).

---

### log-denetimi

Guvenlik log'larini denetleyerek anormallikleri ve guvenlik olaylarini tespit eder.

**Adimlar:**
1. Denetlenecek log kaynaklarini ve kritik olaylari belirle.
2. Log toplama, normallaestirme ve merkezi depolama yapisini kur.
3. Korelasyon kurallari ve anomali tespit mekanizmalarini tanimla.
4. Log denetim raporu ve olay eskalasyon surecini olustur.

**Cikti Formati:** Log denetim plani (log kaynaklari, korelasyon kurallari, anomali kaliplari, raporlama sablonu).

---

### siem-yapilandirma

Security Information and Event Management (SIEM) sistemi yapilandirir ve optimize eder.

**Adimlar:**
1. SIEM araci sec ve veri kaynagi entegrasyonlarini planla.
2. Log toplama, normallaestirme ve indeksleme yapisini kur.
3. Korelasyon kurallari, alarm ve dashboard'lar olustur.
4. SIEM performans optimizasyonu ve veri tutma politikasini uygula.

**Cikti Formati:** SIEM plani (arac secimi, veri kaynaklari, korelasyon kurallari, dashboard tasarimi, tutma politikasi).

---

### soar-otomasyon

Security Orchestration, Automation and Response (SOAR) ile guvenlik operasyonlarini otomatiklestirir.

**Adimlar:**
1. Otomatiklestirilecek guvenlik sureclerini ve kullanim senaryolarini belirle.
2. Playbook'lar ve otomasyon akislari tasarla.
3. Entegrasyon baglantilari ve aksiyon kurallarini yapilandir.
4. SOAR etkinligini olc ve playbook'lari surekli iyilestir.

**Cikti Formati:** SOAR plani (senaryo listesi, playbook tanimlari, entegrasyon haritasi, etkinlik metrikleri).

---

### guvenlik-izleme

7/24 guvenlik izleme stratejisi tasarlayarak tehdit tespit kapasitesi olusturur.

**Adimlar:**
1. Izleme kapsamini ve kritik varliklari belirle.
2. Izleme araclari ve veri kaynaklarini entegre et.
3. Tehdit tespit kurallari ve alarm esiklerini tanimla.
4. SOC sureci, vardiya yapisi ve eskalasyon prosedurunu olustur.

**Cikti Formati:** Guvenlik izleme plani (kapsam, arac listesi, tespit kurallari, SOC sureci).

---

### zafiyet-tarama

Duzenli zafiyet tarama programi olusturarak guvenlik aciklarini proaktif olarak tespit eder.

**Adimlar:**
1. Tarama kapsamini, sikligini ve araci belirle.
2. Tarama politikasi ve istisna yonetim surecini olustur.
3. Otomatik tarama zamanlamasi ve bildirim yapisini kur.
4. Bulgu triaj, onceliklendirme ve duzeltme takip surecini tanimla.

**Cikti Formati:** Zafiyet tarama programi (kapsam, takvim, politika, triaj sureci, raporlama sablonu).

---

### yama-yonetimi

Yazilim ve sistem yamalarini zamaninda ve guvenli sekilde uygulama sureci olusturur.

**Adimlar:**
1. Varlik envanteri ve yama kaynaklarini belirle.
2. Yama siniflandirma ve onceliklendirme kriterlerini tanimla.
3. Test, onay ve dagitim is akisini olustur.
4. Yama uyumluluk izleme ve raporlama paneli kur.

**Cikti Formati:** Yama yonetim plani (envanter, siniflandirma, dagitim sureci, uyumluluk raporu).

---

### ag-segmentasyonu

Ag segmentasyonu ile saldiri yuzeyini kuculterek yanal hareketi sinirlar.

**Adimlar:**
1. Ag topolojisini ve veri akislarini haritala.
2. Segmentasyon stratejisi ve bolgee tanimllarini olustur.
3. VLAN, firewall ve mikro-segmentasyon kurallarini uygula.
4. Segmentasyon etkinligini test et ve izleme kurallarini olustur.

**Cikti Formati:** Ag segmentasyon plani (bolge tanimlari, erisim kurallari, uygulama adimlari, test sonuclari).

---

### vpn-yapilandirma

VPN altyapisini guvenli yapilandirarak uzaktan erisim ve site-to-site baglantiyi saglar.

**Adimlar:**
1. VPN turunu ve protokolunu sec (IPSec, WireGuard, OpenVPN).
2. VPN sunucu ve istemci yapilandirmasini olustur.
3. Kimlik dogrulama, sifreleme ve erisim kontrollerini yapilandir.
4. VPN performans, guvenlik ve log izleme mekanizmasini kur.

**Cikti Formati:** VPN plani (protokol secimi, yapilandirma dosyalari, erisim politikalari, izleme kurallari).

---

### guvenlik-duvar-kurallari

Firewall kural setini en iyi uygulamalara gore tasarlar ve yonetir.

**Adimlar:**
1. Mevcut firewall kural setini denetle ve temizle.
2. En az yetki ilkesine gore kural tanimllarini olustur.
3. Kural siralama, gruplama ve dokumantasyon standartlarini uygula.
4. Periyodik kural gozden gecirme ve temizlik surecini kur.

**Cikti Formati:** Firewall kural seti (kural tablosu, dokumantasyon, gozden gecirme takvimi, degisiklik sureci).

---

### endpoint-koruma

Son nokta (endpoint) guvenlik stratejisi olusturarak cihazlari korur.

**Adimlar:**
1. Endpoint envanterni cikar ve risk profilini degerlendir.
2. EDR/EPP cozumu sec ve dagitim planini olustur.
3. Politikalar, kural setleri ve karantina prosedurlerini yapilandir.
4. Endpoint guvenlik izleme ve olay yanit surecini kur.

**Cikti Formati:** Endpoint koruma plani (envanter, cozum secimi, politikalar, izleme paneli, yanit proseduru).

---

### mobil-guvenlik

Mobil cihaz ve uygulama guvenligi stratejisi olusturur.

**Adimlar:**
1. Mobil cihaz ve uygulama kullanim politikasini belirle.
2. MDM/MAM cozumu sec ve yapilandir.
3. Mobil uygulama guvenlik gereksinimlerini tanimla.
4. Mobil tehdit izleme ve olay yanit surecini kur.

**Cikti Formati:** Mobil guvenlik plani (politikalar, MDM yapilndirmasi, uygulama gereksinimleri, izleme yapisi).

---

### web-uygulama-guvenlik

Web uygulamalarinin guvenligini kapsamli olarak degerlendirir ve iyilestirir.

**Adimlar:**
1. OWASP Top 10 ve ilgili riskleri uygulama baglaminda degerlendir.
2. Statik ve dinamik guvenlik analizi araclari ile tarama yap.
3. Manuel guvenlik inceleme ve kod denetimi gerceklestir.
4. Bulguları oncelliklendir ve duzeltme plani olustur.

**Cikti Formati:** Web uygulama guvenlik raporu (risk degerlendirmesi, tarama sonuclari, bulgu listesi, duzeltme plani).

---

### xss-onleme

Cross-Site Scripting (XSS) saldirilarina karsi koruma stratejisi ve uygulama kontrolleri gelistirir.

**Adimlar:**
1. XSS saldiri vektorlerini ve riskli noktalari tespit et.
2. Girdi dogrulama ve cikti kodlama kontrollerini uygula.
3. Content Security Policy (CSP) yapilandirmasini olustur.
4. XSS test senaryolari ile korumayi dogrula.

**Cikti Formati:** XSS koruma rehberi (risk noktalari, kodlama standartlari, CSP yapilndirmasi, test senaryolari).

---

### sql-enjeksiyon-onleme

SQL Injection saldirilarina karsi koruma stratejisi uygular.

**Adimlar:**
1. SQL injection'a acik noktalari tespit et.
2. Parametrik sorgular ve ORM kullanimi ile gucli koruma uygula.
3. Veritabani erisim katmaninda en az yetki ilkesini uygula.
4. SQL injection test senaryolari ile korumayi dogrula.

**Cikti Formati:** SQL injection koruma rehberi (risk noktalari, kodlama standartlari, veritabani politikasi, test senaryolari).

---

### csrf-koruma

Cross-Site Request Forgery (CSRF) saldirilarina karsi koruma mekanizmalari uygular.

**Adimlar:**
1. CSRF'ye acik islemleri ve formlari tespit et.
2. Anti-CSRF token mekanizmasini implement et.
3. SameSite cookie ozelligi ve ek koruma katmanlarini yapilandir.
4. CSRF koruma test senaryolari ile dogrulama yap.

**Cikti Formati:** CSRF koruma rehberi (risk analizi, token uygulamasi, cookie ayarlari, test senaryolari).

---

### dosya-yukleme-guvenlik

Dosya yukleme islevselliginin guvenligini saglayarak zararli dosya yuklemelerini onler.

**Adimlar:**
1. Dosya yukleme gereksinimlerini ve risk profilini belirle.
2. Dosya tipi, boyut ve icerik dogrulama kontrollerini uygula.
3. Guvenli depolama, yeniden adlandirma ve erisim kontrollerini tasarla.
4. Antivirus tarama ve sandbox analiz entegrasyonunu kur.

**Cikti Formati:** Dosya yukleme guvenlik rehberi (dogrulama kurallari, depolama politikasi, tarama yapisi, test senaryolari).

---

### session-yonetimi

Oturum yonetimi guvenligini saglayarak oturum ele gecirme saldirilarina karsi koruma uygular.

**Adimlar:**
1. Oturum olusturma, surelendirme ve sonlandirma politikasini belirle.
2. Oturum ID ozelliklerini guvenli yapilandir (uzunluk, rastgelelik, httpOnly).
3. Oturum sabitleme ve yeniden olusturma kontrollerini uygula.
4. Esit zamanli oturum ve anormal oturum davranisi izleme kur.

**Cikti Formati:** Oturum yonetim rehberi (politikalar, yapilandirma, kontrol listesi, izleme kurallari).

---

### rate-limiting-guvenlik

Rate limiting uygulamasi ile brute force ve kotu amacli trafigi sinirlar.

**Adimlar:**
1. Rate limiting gereksinimlerini ve endpoint onceliklerini belirle.
2. Istek limitleri, pencere buyuklugu ve anahtar stratejisini tanimla.
3. Rate limiting uygulamasini yapilandir (API Gateway, uygulama katmani).
4. Limit asim yanitlari, izleme ve uyarlama surecini olustur.

**Cikti Formati:** Rate limiting plani (endpoint listesi, limit tanimlari, uygulama rehberi, izleme paneli).

---

### cors-yapilandirma

Cross-Origin Resource Sharing (CORS) yapilandirmasini guvenli sekilde olusturur.

**Adimlar:**
1. Gecerli kaynak (origin) listesini ve izin verilen metodlari belirle.
2. CORS basliklarini en az yetki ilkesine gore yapilandir.
3. Preflight istek ve kimlik bilgisi paylasimi ayarlarini yap.
4. CORS yapilandirmasini test et ve yaygn hatalari kontrol et.

**Cikti Formati:** CORS yapilandirma rehberi (izin listesi, baslik ayarlari, test senaryolari, hata kontrol listesi).

---

### csp-baslik

Content Security Policy basligini yapilandirarak XSS ve veri enjeksiyon saldirilarina karsi koruma saglar.

**Adimlar:**
1. Uygulama kaynak gereksinimlerini analiz et.
2. CSP direktiflerini en katii politika ile baslayarak tanimla.
3. Report-only modda test et ve uyumsuzluklari duzelt.
4. CSP ihlal raporlarini izle ve politikayi sureklilkle iyilestir.

**Cikti Formati:** CSP plani (direktif tanimlari, uygulama adimlari, test sonuclari, ihlal izleme).

---

### hsts-yapilandirma

HTTP Strict Transport Security basligini yapilandirarak HTTPS zorlamasini saglar.

**Adimlar:**
1. HSTS gereksinimlerini ve alt alan kapsaminii belirle.
2. HSTS baslik parametrelerini yapilandir (max-age, includeSubDomains, preload).
3. HSTS preload listesine dahil olma sureclini planla.
4. HSTS etkisini test et ve potansiyel sorunlari degerlendir.

**Cikti Formati:** HSTS plani (baslik yapilandirmasi, preload sureci, test sonuclari, risk degerlendirmesi).

---

### guvenlik-basliklari

Tum HTTP guvenlik basliklarini kapsamli olarak yapilandirir.

**Adimlar:**
1. Gerekli guvenlik basliklarini listele ve onceliklendir.
2. Her baslik icin uygun degerleri belirle ve yapilandir.
3. Baslik yapilandirmasini guvenlik tarama araclariyla dogrula.
4. Baslik uyumunu surekli izle ve guncelle.

**Cikti Formati:** Guvenlik basliklari rehberi (baslik listesi, deger onerileri, yapilandirma ornekleri, dogrulama sonuclari).

---

### penetrasyon-raporu

Penetrasyon testi sonuclarini profesyonel rapor formatinda sunar.

**Adimlar:**
1. Yonetici ozeti ve test kapsamini yazz.
2. Bulguları ciddiyet seviyesine gore siniflandir ve detaylandir.
3. Her bulgu icin teknik kanit, etki analizi ve duzeltme onerisi yaz.
4. Oncelikli duzeltme yol haritasini olustur.

**Cikti Formati:** Penetrasyon test raporu (yonetici ozeti, bulgu detaylari, kanit ekran goruntuleri, duzeltme yol haritasi).

---

### guvenlik-farkindalik

Calisan guvenlik farkindalik programi tasarlayarak insan kaynakli riskleri azaltir.

**Adimlar:**
1. Farkindalik programi hedeflerini ve hedef kitlesini belirle.
2. Egitim modulleri olustur (phishing, parola, sosyal muhendislik, fiziksel).
3. Phishing simulasyonu ve farkindalik testleri planla.
4. Farkindalik seviyesini olc ve programi surekli iyilestir.

**Cikti Formati:** Farkindalik programi (modul icerikleri, test plani, simulasyon takvimi, olcum metrikleri).

---

### kvkk-uyumluluk

Kisisel Verilerin Korunmasi Kanunu (KVKK) uyumluluk surecini yonetir.

**Adimlar:**
1. Kisisel veri isleme envanterini cikar ve hukuki dayanaklari belirle.
2. VERBiS kaydini ve aydinlatma metinlerini hazirla.
3. Teknik ve idari tedbirleri uygulayarak uyumluluk kontrol listesi olustur.
4. Veri ihlali bildirim proseduru ve periyodik denetim planini kur.

**Cikti Formati:** KVKK uyumluluk paketi (veri envanteri, aydinlatma metinleri, tedbirler listesi, ihlal proseduru, denetim plani).
