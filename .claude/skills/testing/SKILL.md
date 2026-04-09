# Test Becerileri

Bu dosya, yazilim testi stratejisi, test otomasyonu, performans testi, guvenlik testi ve kalite guvence alanlarindaki tum becerileri icerir.

---

### test-strateji-tasarimi

Proje icin kapsamli test stratejisi olusturarak kalite hedeflerini ve test yaklasimini belirler.

**Adimlar:**
1. Proje risklerini ve kalite hedeflerini degerlendir.
2. Test seviyelerini, turlerini ve kapsamini tanimla.
3. Test ortami, arac ve kaynak planlamasini yap.
4. Test basari kriterlerini ve raporlama yapisini belirle.

**Cikti Formati:** Test strateji dokumani (risk analizi, test seviyeleri, kapsam matrisi, kaynak plani, basari kriterleri).

---

### birim-test-yazimi

Unit test'leri etkili yazma teknikleri ve en iyi uygulamalar ile kod kalitesini arttirir.

**Adimlar:**
1. Test edilecek birimleri ve kritik isllevleri belirle.
2. Test senaryolarini olustur (pozitif, negatif, sinir deger).
3. Mock, stub ve fake nesneleri kullanarak bagimliliklari izole et.
4. Test kapsam oranini olc ve eksik alanlari tamamla.

**Cikti Formati:** Unit test paketi (test dosyalari, kapsam raporu, mock yapisi, test kalip rehberi).

---

### entegrasyon-testi

Bilesenleer arasi entegrasyon noktalarini test ederek uyumlulugunus dogrular.

**Adimlar:**
1. Entegrasyon noktalarini ve veri akislarini haritala.
2. Entegrasyon test senaryolari ve test verisi hazirla.
3. Testleri entegrasyon ortaminda calistir ve sonuclari kaydet.
4. Entegrasyon hatalarini analiz et ve duzeltme onerilerini raporla.

**Cikti Formati:** Entegrasyon test raporu (entegrasyon haritasi, senaryo listesi, test sonuclari, hata analizi).

---

### uctan-uca-test

Uygulamayi kullanici perspektifinden uctan uca test ederek is akislarini dogrular.

**Adimlar:**
1. Kritik kullanici yolculuklarini ve is akislarini belirle.
2. E2E test senaryolari ve test verisi seti olustur.
3. Test otomasyonu framework'u ile testleri implement et.
4. Test kararliligi ve bakimi icin strateji olustur.

**Cikti Formati:** E2E test paketi (senaryo listesi, otomasyon kodlari, test verisi, kararlilik raporu).

---

### test-otomasyon-cercevesi

Test otomasyon altyapisini tasarlayarak tekrarlanabilir ve surebilir test sureci kurar.

**Adimlar:**
1. Otomasyon ihtiyaclarini ve uygun framework'u sec.
2. Proje yapisi, sayfa nesneleri ve yardimci katmanlari tasarla.
3. CI/CD pipeline entegrasyonu ve paralel test calistirma yapisini kur.
4. Raporlama, hata ayiklama ve test bakimi sureclerini olustur.

**Cikti Formati:** Otomasyon cercevesi (framework yapisi, mimari diyagram, pipeline entegrasyonu, raporlama ornegi).

---

### tdd-uygulamasi

Test Driven Development metodolojisini projeye uygulayarak kod kalitesini arttirir.

**Adimlar:**
1. TDD dongusunu (Red-Green-Refactor) ekibe tanit.
2. Ilk testi yaz ve basarisiz oldugunu dogrula.
3. Minimum kodu yazarak testi gecir.
4. Kodu refactor et ve donguyu tekrarla.

**Cikti Formati:** TDD uygulama rehberi (dongu adimlari, ornek senaryolar, refactoring kontrol listesi, ekip pratikleri).

---

### bdd-senaryolari

Behavior Driven Development ile is gereksinimllerini test senaryolarina donusturur.

**Adimlar:**
1. Kullanici hikayeleri ile Given-When-Then formatinda senaryolar yaz.
2. Gherkin dilinde feature dosyalari olustur.
3. Adim tanimlarini (step definitions) implement et.
4. Is analistleri ile senaryo gozden gecirme ve dogrulama yap.

**Cikti Formati:** BDD paketi (feature dosyalari, adim tanimlari, senaryo haritasi, dogrulama raporu).

---

### api-testi

API endpoint'lerini fonksiyonel, performans ve guvenlik acisindan test eder.

**Adimlar:**
1. API endpoint envanterini cikar ve test onceliklerini belirle.
2. Pozitif, negatif ve sinir deger test senaryolari olustur.
3. Test aracini sec (Postman, REST Assured, karate) ve testleri implement et.
4. API sozlesme dogrulama ve regresyon test otomasyonunu kur.

**Cikti Formati:** API test paketi (endpoint listesi, test koleksiyonu, otomasyon kodlari, sonuc raporu).

---

### performans-test-plani

Uygulama performansini olcen kapsamli test plani olusturur ve uygular.

**Adimlar:**
1. Performans gereksinimlerini ve SLA hedeflerini tanimla.
2. Yuk profilleri, senaryo ve test verisi hazirla.
3. Performans test aracini sec ve ortamini yapilandir.
4. Testleri calistir, darbogazlari analiz et ve optimizasyon oner.

**Cikti Formati:** Performans test raporu (SLA hedefleri, yuk profilleri, test sonuclari, darbogaz analizi, oneriler).

---

### yuk-testi-tasarimi

Yuk testi senaryolari tasarlayarak sistem kapasite sinirlarini belirler.

**Adimlar:**
1. Beklenen kullanici yuku ve trafik kaliplarini modelleye.
2. Kademeli yuk artis senaryolari olustur.
3. Izlenecek metrikleri ve esik degerlerini tanimla.
4. Kapasite siniri ve olceklendirme onerileri raporla.

**Cikti Formati:** Yuk testi raporu (yuk modeli, senaryo tanimlari, kapasite sinirlari, olceklendirme onerileri).

---

### stres-testi-planlama

Stres testi ile sistemin sinir kosullarindaki davranisini ve kurtarma kapasitesini test eder.

**Adimlar:**
1. Stres senaryolari ve kopma noktasi hipotezlerini tanimla.
2. Normal kapasitenin uzerinde yuk profillerini olustur.
3. Sistem davranisini, hata oranlari ve kurtarma suresini gozlemle.
4. Dayaniklilik iyilestirme onerileri sun.

**Cikti Formati:** Stres testi raporu (senaryo tanimlari, kopma noktasi, kurtarma metrikleri, iyilestirme plani).

---

### guvenlik-testi

Uygulama guvenlik testleri planlayarak zafiyetleri tespit eder.

**Adimlar:**
1. Guvenlik test kapsamini ve oncelikli risk alanlarini belirle.
2. OWASP kontrol listesi bazli test senaryolari olustur.
3. Otomatik tarama ve manuel guvenlik testlerini gerceklestir.
4. Bulguları siniflandir ve duzeltme oncelikleri belirle.

**Cikti Formati:** Guvenlik test raporu (kapsam, test senaryolari, bulgu listesi, ciddiyet siniflari, duzeltme plani).

---

### mobil-test-stratejisi

Mobil uygulamalar icin kapsamli test stratejisi ve otomasyon plani olusturur.

**Adimlar:**
1. Hedef cihaz ve OS versiyon matrisini belirle.
2. Fonksiyonel, uyumluluk ve performans test kapsamini tanimla.
3. Mobil test otomasyon aracini sec (Appium, XCUITest, Espresso).
4. Cihaz ciftligi/bulut test platformu entegrasyonunu kur.

**Cikti Formati:** Mobil test plani (cihaz matrisi, test kapsamii, otomasyon framework, platform entegrasyonu).

---

### regresyon-test-seti

Regresyon test seti olusturarak yazilim degisikliklerinin mevcut islevleri bozmadignii dogrular.

**Adimlar:**
1. Kritik is akislari ve yuksek riskli alanlari belirle.
2. Regresyon test senaryolarini onceliklendir ve otomasyon adaylarini sec.
3. Regresyon test otomasyonunu implement et.
4. Her surumde regresyon calistirma ve sonuc analizi surecini kur.

**Cikti Formati:** Regresyon test paketi (senaryo listesi, otomasyon kodlari, calistirma takvimi, sonuc sablonu).

---

### test-verisi-yonetimi

Test verisi olusturma, maskeleme ve yonetim stratejisi gelistirir.

**Adimlar:**
1. Test verisi gereksinimlerini ve veri tiplerini belirle.
2. Test verisi olusturma yontemlerini sec (sentetik, maskelenmis, alt kume).
3. Veri gizliligi ve KVKK uyumlu maskeleme kurallarini uygula.
4. Test verisi yasam dongusu yonetim surecini kur.

**Cikti Formati:** Test verisi plani (gereksinimler, olusturma yontemleri, maskeleme kurallari, yasam dongusu rehberi).

---

### test-ortami-yonetimi

Test ortamlarini verimli yonetme, provizyon ve bakim stratejisi gelisitirir.

**Adimlar:**
1. Test ortami ihtiyaclarini ve konfigurasyonlarini tanimla.
2. Ortam provizyon ve temizleme otomasyonunu kur.
3. Ortam paylasiim, kilit ve rezervasyon surecini olustur.
4. Ortam saglik izleme ve sorun giderme proseduru tanimla.

**Cikti Formati:** Ortam yonetim plani (ortam listesi, provizyon otomasyonu, paylasim politikasi, sorun giderme rehberi).

---

### kesifsel-test

Exploratory testing teknikleri ile yapisal testlerin kaciracagi hatalari kesfeder.

**Adimlar:**
1. Kesifsel test oturumu hedefleri ve kapsamini belirle.
2. Test turu ve zamanlama (session-based) yapisini tanimla.
3. Oturum sirasinda bulgulari ve gozlemleri kaydet.
4. Kesif bulgularini raporla ve regresyon setine eklenmesi gerekenleri belirle.

**Cikti Formati:** Kesifsel test raporu (oturum ozeti, bulgu listesi, ekran goruntuleri, regresyon adaylari).

---

### erisilebilirlik-testi

Uygulamanin erisilebilirlik standartlarina (WCAG) uyumunu test eder.

**Adimlar:**
1. Uygulanacak erisilebilirlik standardi ve seviyesini belirle (WCAG 2.1 AA).
2. Otomatik erisilebilirlik tarama araclari ile kontrol yap.
3. Manuel erisilebilirlik testleri gerceklestir (klavye, ekran okuyucu).
4. Bulguları siniflandir ve duzeltme oncelikleri belirle.

**Cikti Formati:** Erisilebilirlik test raporu (standart, otomatik tarama sonuclari, manuel test bulguları, duzeltme plani).

---

### gorsel-regresyon-testi

UI degisikliklerinin gorsel tutarliligi bozmadignii otomatik olarak dogrular.

**Adimlar:**
1. Gorsel regresyon test aracini sec (Percy, BackstopJS, Chromatic).
2. Temel gorsel referanslari olustur.
3. CI/CD pipeline entegrasyonu ile otomatik gorsel karsilastirma kur.
4. Gorsel farkliliklari inceleme ve onay surecini tanimla.

**Cikti Formati:** Gorsel regresyon plani (arac secimi, referans yonetimi, pipeline entegrasyonu, inceleme sureci).

---

### test-kapsam-analizi

Kod kapsam analizini yaparak test yeterlilgini degerlendirir ve eksikleri belirler.

**Adimlar:**
1. Kapsam olcum aracini yapilandir ve metrikleri belirle.
2. Satir, dal ve fonksiyon kapsam oranlarini olc.
3. Dusuk kapsamlii kritik alanlari belirle ve onceliklendir.
4. Kapsam hedeflerini tanimla ve iyilestirme plani olustur.

**Cikti Formati:** Kapsam analiz raporu (kapsam oranlari, dusuk kapsamli alanlar, hedefler, iyilestirme plani).

---

### hata-raporlama

Etkili hata raporlama standartlari ve sureci olusturarak hata cozumunu hizlandirir.

**Adimlar:**
1. Hata rapor sablonu ve zorunlu alanları tanimla.
2. Hata siniflandirma ve onceliklendirme kriterlerini belirle.
3. Hata yasam dongusu ve cozum is akisini olustur.
4. Hata metriklerini izle ve trend analizi yap.

**Cikti Formati:** Hata raporlama rehberi (rapor sablonu, siniflandirma matrisi, is akisi diyagrami, metrik paneli).

---

### test-yonetim-araci

Test yonetim aracini yapilandirarak test surec verimliligini arttirir.

**Adimlar:**
1. Test yonetim araci sec (TestRail, Zephyr, qTest, Xray).
2. Proje yapisi, test plani ve senaryo organizasyonunu kur.
3. CI/CD ve hata izleme sistemi entegrasyonlarini yap.
4. Raporlama ve dashboard'lari yapilandir.

**Cikti Formati:** Test yonetim plani (arac secimi, proje yapisi, entegrasyonlar, raporlama paneli).

---

### mutation-testi

Mutation testing ile test suitinin hata yakalama kapasitesini degerlendirir.

**Adimlar:**
1. Mutation test aracini sec ve yapilandir (PIT, Stryker, mutmut).
2. Mutasyon operatorlerini ve hedef modulleri belirle.
3. Mutation testini calistir ve sonuclari analiz et.
4. Hayatta kalan mutantlari tespit ederek test iyilestirmelerini yap.

**Cikti Formati:** Mutation test raporu (mutation skoru, hayatta kalan mutantlar, zayif test alanlari, iyilestirme listesi).

---

### sozlesme-testi

Servisler arasi API sozlesmelerini test ederek entegrasyon uyumsuzluklarini onler.

**Adimlar:**
1. Sozlesme test aracini sec (Pact, Spring Cloud Contract).
2. Tuketici tarafli sozlesmerleri tanimla.
3. Saglayici tarafli dogrulama testlerini implement et.
4. Sozlesme testlerini CI/CD pipeline'a entegre et.

**Cikti Formati:** Sozlesme test paketi (tuketici sozlesmeleri, saglayici testleri, pipeline entegrasyonu, uyumsuzluk raporu).

---

### kaos-testi

Kaos testi ile uygulamanin beklenmedik kosullardaki davranisini test eder.

**Adimlar:**
1. Kaos test hipotezleri ve hata enjeksiyon senaryolari olustur.
2. Kontrol ortaminda hata enjeksiyon aracini yapilandir.
3. Kaos deneylerini gerceklestir ve sistem tepkisini gozlemle.
4. Bulguları raporla ve dayaniklilik iyilestirmeleri oner.

**Cikti Formati:** Kaos test raporu (hipotezler, deney sonuclari, sistem davranisi, dayaniklilik onerileri).

---

### kullanilabilirlik-testi-plani

Kullanici deneyimini test etmek icin kullanilabilirlik testi plani olusturur.

**Adimlar:**
1. Test hedeflerini ve arastirma sorularini belirle.
2. Test senaryolari, gorevler ve katilimci profilini tanimla.
3. Test ortami, kayit ekipmani ve moderator rehberini hazirla.
4. Analiz yontemi ve raporlama cercevesini olustur.

**Cikti Formati:** Kullanilabilirlik test plani (gorev listesi, katilimci profili, moderator rehberi, raporlama sablonu).

---

### cross-browser-testi

Uygulamanin farkli tarayicilarda tutarli calistigini dogrulayan test stratejisi olusturur.

**Adimlar:**
1. Hedef tarayici ve versiyon matrisini belirle.
2. Test senaryolari ve kontrol noktalarini tanimla.
3. Cross-browser test aracini sec (BrowserStack, Sauce Labs, Playwright).
4. Otomatik cross-browser test calistirma ve raporlama kur.

**Cikti Formati:** Cross-browser test plani (tarayici matrisi, test senaryolari, otomasyon yapisi, sonuc raporu).

---

### veritabani-testi

Veritabani islemlerinin dogrulugunu, butunlugunu ve performansini test eder.

**Adimlar:**
1. Veritabani test kapsamini belirle (CRUD, is kurallari, bagimlilklar).
2. Veri butunlugu ve constraint dogrulama senaryolari olustur.
3. Veritabani performans ve sorgu optimizasyon testleri yap.
4. Veri goc ve yedekten geri yukleme testlerini planla.

**Cikti Formati:** Veritabani test raporu (test kapsamii, senaryo sonuclari, performans metrikleri, veri butunlugu analizi).

---

### test-pipeline-entegrasyonu

Test otomasyonunu CI/CD pipeline'a entegre ederek surekli test altyapisi kurar.

**Adimlar:**
1. Pipeline asamalarina gore test turlerini esle (unit, integration, E2E).
2. Test calistirma, raporlama ve basarisizlik politikalarini tanimla.
3. Paralel test calistirma ve test bolme stratejisini uygula.
4. Test sonuc bildirimi ve trend izleme mekanizmasini kur.

**Cikti Formati:** Pipeline entegrasyon plani (asama-test eslesmesi, yapilandirma dosyalari, politikalar, izleme paneli).

---

### test-metrik-raporlama

Test sureci metriklerini izleyen ve raporlayan sistem kurar.

**Adimlar:**
1. Izlenecek test metriklerini tanimla (kapsam, gecme orani, sure, hata yogunlugu).
2. Metrik toplama ve hesaplama yontemlerini belirle.
3. Dashboard ve raporlama sablonlarini olustur.
4. Metrik trendlerini analiz et ve kalite iyilestirme aksiyonlari oner.

**Cikti Formati:** Test metrik raporu (metrik tanimlari, dashboard tasarimi, trend analizi, aksiyon onerileri).

---

### test-tasarimi-teknikleri

Sistematik test tasarimi teknikleri ile etkili test senaryolari olusturur.

**Adimlar:**
1. Uygulanacak test tasarim tekniklerini belirle (denklik sinifi, sinir deger, karar tablosu).
2. Gereksinimleri test tekniklerine esleyerek senaryo olustur.
3. Test senaryolarini optimize ederek minimum senaryo ile maksimum kapsam sagla.
4. Tasarlanan senaryolari gozden gecir ve eksikleri tamamla.

**Cikti Formati:** Test tasarim paketi (teknik secimi, senaryo listesi, kapsam matrisi, gozden gecirme notlari).

---

### smoke-test-seti

Temel islevlerin calistigini hizlica dogrulayan smoke test seti olusturur.

**Adimlar:**
1. Kritik is akislari ve temel islevleri belirle.
2. Minimum smoke test senaryo setini olustur.
3. Otomatik smoke test calistirmasini yapilandir.
4. Dagitim sonrasi otomatik smoke test tetiklemesini kur.

**Cikti Formati:** Smoke test paketi (senaryo listesi, otomasyon kodlari, calistirma yapilandirmasi, sonuc sablonu).

---

### kabul-testi

Is gereksinimlerinin karsilandignii dogrulayan kullanici kabul testi sureci tasarlar.

**Adimlar:**
1. Kabul kriterlerini is gereksinimleerinden cikar.
2. Kabul test senaryolari ve test verisi hazirla.
3. Kullanici kabul test sureci ve takvimini planla.
4. Kabul testi sonuclarini raporla ve gecis/red karari icin surecni olustur.

**Cikti Formati:** Kabul test plani (kabul kriterleri, senaryo listesi, test takvimi, karar sablonu).

---

### test-otomasyon-stratejisi

Test otomasyon piramidi ve otomasyon kapsamini stratejik olarak planlar.

**Adimlar:**
1. Test piramidi katmanlarini ve dagilimini belirle (unit > integration > E2E).
2. Otomasyon adayi senaryolari sec ve onceliklendir.
3. Otomasyon araclari ve framework secimini yap.
4. Otomasyon yol haritasi ve ROI beklentilerini olustur.

**Cikti Formati:** Otomasyon stratejisi (piramit dagilimi, aday listesi, arac secimi, yol haritasi, ROI analizi).

---

### continuous-testing

Surekli test pratiklerini gelistirme surecine entegre ederek kalite geri bildirimini hizlandirir.

**Adimlar:**
1. Gelistirme asamasinda test geri bildirim dongulerini tanimla.
2. Pre-commit hook, PR gate ve pipeline test kontrollerini kur.
3. Test sonuc bildirim ve aksiyonlama surecini otomatiklestir.
4. Surekli test olgunlugunu izle ve iyilestir.

**Cikti Formati:** Continuous testing plani (geri bildirim dongleri, kontrol noktalari, otomasyon yapisi, olgunluk degerlendirmesi).

---

### test-kalite-metrikleri

Test suitinin kendisinin kalitesini degerlendin metrikler ve analizler uygular.

**Adimlar:**
1. Test kalite metriklerini tanimla (deterministiklik, hiz, bagimsizlik).
2. Flaky test tespit ve izleme mekanizmasini kur.
3. Test bakimi maliyetini ve verimliligini olc.
4. Test suitini iyilestirme aksiyonlari planla.

**Cikti Formati:** Test kalite raporu (metrik sonuclari, flaky test listesi, bakimi maliyeti, iyilestirme plani).

---

### shift-left-testing

Test aktivitelerini gelistirme surecinin basina tasiyarak hatalarin erken tespitini saglar.

**Adimlar:**
1. Erken test firsatlarini belirle (gereksinim inceleme, tasarim inceleme).
2. Gelistirici test uygulamalarini gucllendir (TDD, pair testing).
3. Statik analiz ve erken geri bildirim araclarini entegre et.
4. Shift-left olgunlugunu olc ve iyilestir.

**Cikti Formati:** Shift-left plani (erken test aktiviteleri, arac entegrasyonu, gelistirici rehberi, olgunluk metrikleri).

---

### test-veri-fabrikasi

Test verisi olusturma fabrikasi kurarak test senaryolari icin tutarli ve zengin veri saglar.

**Adimlar:**
1. Veri modellerini ve iliskileri tanimla.
2. Factory/builder kaliplari ile veri olusturma katmanini implement et.
3. Senaryo bazli veri setleri ve fixture'lar olustur.
4. Test verisi temizleme ve izolasyon stratejisini kur.

**Cikti Formati:** Veri fabrikasi paketi (veri modelleri, factory kodlari, fixture setleri, temizleme stratejisi).

---

### test-dokumantasyonu

Test sureclerini, senaryolari ve sonuclari etkili dokumante eden yapilar olusturur.

**Adimlar:**
1. Test dokumantasyon standartlarini ve sablonlarini belirle.
2. Test plani, senaryo ve sonuc dokumanlarini olustur.
3. Test bilgi tabanini ve senaryo kutuphanesini duzenle.
4. Dokumanfasyon guncelleme ve gozden gecirme surecini kur.

**Cikti Formati:** Test dokumanstasyon paketi (sablonlar, bilgi tabani yapisi, guncelleme takvimi, gozden gecirme sureci).

---

### test-konteynerizasyonu

Test ortamlarini container'lar ile standartlastirarak tekrarlanabilir test altyapisi kurar.

**Adimlar:**
1. Test ortami container imajlarini tanimla ve olustur.
2. Docker Compose ile test stack'ini yapilandir.
3. CI/CD pipeline'da container bazli test calistirma kur.
4. Test container yasam dongusu ve temizlik otomasyonunu olustur.

**Cikti Formati:** Test container paketi (Dockerfile'lar, docker-compose, pipeline yapilandirmasi, yasam dongusu rehberi).

---

### property-based-testing

Property-based testing ile geleneksel test senaryolarinin kaciracagi edge case'leri kesfeder.

**Adimlar:**
1. Test edilecek ozellikleri (properties) ve degismezleri (invariants) tanimla.
2. Property test framework sec (QuickCheck, Hypothesis, fast-check).
3. Property testlerini implement et ve rastgele girdi olusturma stratejisini belirle.
4. Bulunan hatalari analiz et ve regresyon testine ekle.

**Cikti Formati:** Property test paketi (ozellik tanimlari, test kodlari, bulunan hatalar, regresyon eklemeleri).

---

### test-raporlama

Test sonuclarini etkili gorselestiren ve paydeslara sunan raporlama sistemi kurar.

**Adimlar:**
1. Raporlama hedef kitlesini ve ihtiyaclarini belirle.
2. Rapor sablonlari ve gorselestirme formatlarini olustur.
3. Otomatik rapor olusturma ve dagitim surecini kur.
4. Trend analizi ve karar destek metriklerini entegre et.

**Cikti Formati:** Test raporlama sistemi (rapor sablonlari, gorselestirmeler, otomasyon yapisi, trend paneli).

---

### risk-tabanli-test

Risk analizi temelinde test onceliklendirmesi yaparak en kritik alanlari once test eder.

**Adimlar:**
1. Ozellik ve bilesen bazli risk degerlendirmesi yap.
2. Risk skoru bazli test onceliklendirme matrisi olustur.
3. Test eforu dagitimini risk seviyesine gore planla.
4. Risk bazli test kapsamini gozden gecir ve guncelle.

**Cikti Formati:** Risk tabanli test plani (risk matrisi, oncelik sirasi, efor dagitimi, kapsam tablosu).

---

### test-taki-yonetimi

Test takiminin organizasyonu, yetkinlik gelistirmesi ve verimlilik stratejisi olusturur.

**Adimlar:**
1. Takim yapisi, roller ve sorumlulklari tanimla.
2. Yetkinlik matrisi ve egitim planini olustur.
3. Is dagitimi, kapasite planlama ve performans metriklerini belirle.
4. Takim iletisim, bilgi paylasimi ve surekli iyilestirme rutinlerini kur.

**Cikti Formati:** Takim yonetim plani (rol tanimlari, yetkinlik matrisi, egitim plani, performans metrikleri).

---

### test-surec-iyilestirme

Mevcut test sureclerini analiz ederek verimlilik ve etkinlik iyilestirmeleri uygular.

**Adimlar:**
1. Mevcut test sureclerini haritala ve darbogazlari tespit et.
2. Iyilestirme firsatlarini belirle ve onceliklendir.
3. Iyilestirme aksiyonlarini uygula ve etkisini olc.
4. Surekli iyilestirme dongusu ve olgunluk degerlendirmesini kur.

**Cikti Formati:** Surec iyilestirme raporu (mevcut durum haritasi, darbogaz analizi, aksiyon listesi, etki olcumu).

---

### test-araci-degerlendirme

Test araclari ve frameworklerini degerlendigirerek proje icin en uygun secimi yapar.

**Adimlar:**
1. Arac gereksinimlerini ve degerlendirme kriterlerini belirle.
2. Aday araclari arastir ve kisa listeye al.
3. POC (proof of concept) ile adaylari test et.
4. Karsilastirma matrisi olustur ve secim onerisini sun.

**Cikti Formati:** Arac degerlendirme raporu (gereksinimler, aday listesi, POC sonuclari, karsilastirma matrisi, oneri).

---

### test-cevre-izolasyonu

Test ortamlarini birbirinden izole ederek guvenilir test sonuclari saglar.

**Adimlar:**
1. Izolasyon gereksinimlerini ve bagimlilik haritasini belirle.
2. Ortam izolasyon stratejisini sec (container, namespace, mock).
3. Izolasyon yapilandirmasini implement et ve dogrula.
4. Izolasyon bozulmalari tespit ve duzeltme mekanizmasini kur.

**Cikti Formati:** Izolasyon plani (bagimlilik haritasi, strateji secimi, yapilandirma dosyalari, dogrulama testi).

---

### snapshot-testi

Cikti snapshot'larini kaydederek beklenmedik degisiklikleri otomatik tespit eder.

**Adimlar:**
1. Snapshot test aracini sec ve yapilandir (Jest snapshot, approval tests).
2. Kritik cikti noktalarinda snapshot testleri olustur.
3. Snapshot guncelleme ve inceleme surecini tanimla.
4. CI/CD pipeline'da snapshot dogrulama adimini ekle.

**Cikti Formati:** Snapshot test plani (arac secimi, test noktalari, guncelleme sureci, pipeline entegrasyonu).

---

### load-test-senaryolari

Farkli yuk kaliplari icin detayli test senaryolari tasarlar ve uygular.

**Adimlar:**
1. Yuk kaliplarini tanimla (ani artis, kademeli, dayaniklilik, pike).
2. Her kalip icin kullanici davranis senaryolari olustur.
3. Test verisi ve ortam gereksinimlerini hazirla.
4. Senaryo bazli sonuclari karsilastir ve kapasite plani olustur.

**Cikti Formati:** Yuk test senaryo paketi (kalip tanimlari, senaryo kodlari, ortam gereksinimleri, kapasite raporu).

---

### test-otomasyonu-bakimi

Mevcut test otomasyon kodlarinin bakilabilirligini ve kararlligini saglayan strateji uygular.

**Adimlar:**
1. Test kodu kalite metriklerini olc (kararsiz testler, calistirma suresi, bakim maliyeti).
2. Kararsiz (flaky) testleri tespit ve duzelt.
3. Test kodu refactoring ve sayfa nesnesi guncellemesi yap.
4. Test bakimi rutinleri ve sorumluluk matrisini olustur.

**Cikti Formati:** Bakim plani (kalite metrikleri, kararsiz test listesi, refactoring adimlari, rutin takvimi).
