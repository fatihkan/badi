# Veri Analitigi Becerileri

Bu dosya, veri toplama, analiz, gorselestirme, makine ogrenmesi, is zekasi ve veri muhendisligi alanlarindaki tum becerileri icerir.

---

### veri-strateji-tasarimi

Organizasyon icin kapsamli veri stratejisi olusturarak veri odakli karar almayi saglar.

**Adimlar:**
1. Is hedeflerini ve veri ihtiyaclarini belirle.
2. Veri toplama kaynaklarini, yontemlerini ve akislarini planla.
3. Veri yonetisim cercevesini ve veri kalite standartlarini olustur.
4. Veri külturu ve okur yazarlik gelistirme planini hazirla.

**Cikti Formati:** Veri strateji dokumani (is-veri eslesmesi, kaynak haritasi, yonetisim cercevesi, kultur plani).

---

### veri-toplama-tasarimi

Veri toplama mekanizmalarini tasarlayarak dogru ve eksiksiz veri akisi saglar.

**Adimlar:**
1. Ihtiyac duyulan veri noktalarini ve kaynaklarini belirle.
2. Veri toplama yontemlerini sec (SDK, API, piksel, form, IoT).
3. Veri semasi, dogrulama kurallari ve kalite kontrollerini tanimla.
4. Veri toplama otomasyonu ve izleme mekanizmasini kur.

**Cikti Formati:** Veri toplama plani (veri katalogu, kaynak-yontem eslesmesi, sema tanimlari, kalite kontrolleri).

---

### olay-izleme-tasarimi

Uygulama ve web sitesi olay izleme (event tracking) altyapisini tasarlar.

**Adimlar:**
1. Izlenecek olaylari ve ozelliklerini taksonomik olarak tanimla.
2. Olay isimlendirme konvansiyonu ve standartlarini olustur.
3. Olay izleme planini (tracking plan) dokumante et.
4. Izleme dogrulama ve kalite guvence surecini kur.

**Cikti Formati:** Olay izleme plani (olay katalogu, isimlendirme standardi, ozellik tanimlari, dogrulama kontrol listesi).

---

### veri-ambari-tasarimi

Veri ambari (data warehouse) mimarisini tasarlayarak analitik altyapisini kurar.

**Adimlar:**
1. Veri ambari gereksinimlerini ve kullanim senaryolarini belirle.
2. Mimari yaklasimi sec (Kimball, Inmon, Data Vault).
3. Boyut ve olcü tablolarini, sema yapisini tasarla.
4. ETL/ELT surecleri ve veri yenileme stratejisini olustur.

**Cikti Formati:** Veri ambari tasarimi (mimari diyagram, sema tanimlari, ETL akislari, yenileme takvimi).

---

### etl-pipeline-tasarimi

ETL/ELT veri pipeline'larini tasarlayarak veri donusumu ve yukleme surecini otomatiklestirir.

**Adimlar:**
1. Kaynak sistemleri ve veri akislarini haritala.
2. Donusum kurallarini ve is mantikalarini tanimla.
3. Pipeline aracini sec ve akisi implement et (Airflow, dbt, Fivetran).
4. Pipeline izleme, hata yonetimi ve yeniden deneme mekanizmasi kur.

**Cikti Formati:** ETL pipeline plani (kaynak-hedef haritasi, donusum kurallari, pipeline kodu, izleme paneli).

---

### veri-golu-mimarisi

Data lake mimarisi tasarlayarak yapisal ve yapisal olmayan verilerin depolanmasini saglar.

**Adimlar:**
1. Veri golu gereksinimlerini ve veri turlerini belirle.
2. Depolama katmanlari (raw, curated, analytics) yapisini tasarla.
3. Veri kataloglama, erisim kontrolu ve yonetisim kurallarini olustur.
4. Sorgu motoru ve analiz araclari entegrasyonunu planla.

**Cikti Formati:** Veri golu plani (mimari diyagram, katman yapisi, yonetisim kurallari, entegrasyon listesi).

---

### sql-analiz-sorulari

Is sorularina yanit veren SQL analiz sorgulari yazar ve optimize eder.

**Adimlar:**
1. Is sorusunu anla ve gerekli veri kaynaklarini belirle.
2. SQL sorgusunu yaz ve sonuclari dogrula.
3. Sorgu performansini analiz et ve optimize et.
4. Sorguyu dokumante et ve yeniden kullanilabilir hale getir.

**Cikti Formati:** SQL analiz paketi (sorgu, sonuc ornegi, performans metrikleri, dokumantasyon).

---

### dashboard-tasarimi

Is kullanicilari icin etkili ve aksiyona donusturulebilir dashboard'lar tasarlar.

**Adimlar:**
1. Dashboard hedef kitlesini ve karar ihtiyaclarini belirle.
2. Gosterilecek metrikleri, KPI'lari ve gorsel tipleri sec.
3. Dashboard yerlesimi, filtreleme ve detaya dalma yapisini tasarla.
4. Dashboard performansini optimize et ve kullanici geri bildirimi topla.

**Cikti Formati:** Dashboard tasarim dokumani (metrik listesi, gorsel secimi, wireframe, etkileisim tasarimi).

---

### veri-gorsellestirme

Veriyi anlasilir ve etkili gorsellerle sunmak icin grafik turu secimi ve tasarim ilkeleri uygular.

**Adimlar:**
1. Iletilmek istenen mesaj ve veri turunu belirle.
2. Uygun grafik turunu sec (cubuk, cizgi, pasta, dagslim, harita).
3. Gorsel tasarim ilkellerini uygula (renk, etiket, olcek, baslik).
4. Gorseli hedef kitleye uygun olarak duzenle ve sunuma hazirla.

**Cikti Formati:** Gorselestirme paketi (grafik turleri, tasarim rehberi, renk paleti, sunum sablonu).

---

### kohort-analizi

Kullanici kohortlari uzerinde zaman bazli davranis analizleri yaparak trendleri ortaya cikarir.

**Adimlar:**
1. Kohort tanimini ve gruplama kriterini belirle (kayit tarihi, ilk satin alma).
2. Izlenecek metrikleri tanimla (tutma, gelir, etkilesim).
3. Kohort matrisi olustur ve donem bazli analiz yap.
4. Kohortlar arasi farkliliklari yorumla ve aksiyona donustur.

**Cikti Formati:** Kohort analizi raporu (kohort matrisi, trend grafikleri, icgorular, aksiyon onerileri).

---

### huni-analizi

Kullanici donusum hunisini analiz ederek kayip noktalarini ve optimizasyon firsatlarini belirler.

**Adimlar:**
1. Huni adimlarini ve donusum tanimlarini belirle.
2. Her adimda kayip oranlarini hesapla.
3. Segment bazli huni karsilastirmasi yap.
4. Kayip noktalarinda iyilestirme hipotezleri olustur.

**Cikti Formati:** Huni analizi raporu (adim metrikleri, kayip oranlari, segment karsilastirmasi, iyilestirme hipotezleri).

---

### segmentasyon-analizi

Kullanicilari veya musterileri anlamli gruplara ayiran segmentasyon analizi yapar.

**Adimlar:**
1. Segmentasyon amacini ve degiskenlerini belirle.
2. Segmentasyon yontemi sec (RFM, davranissal, demografik, kumeleme).
3. Segmentleri olustur ve profilleeini tanimla.
4. Segment bazli strateji ve aksiyon onerileri gelistir.

**Cikti Formati:** Segmentasyon raporu (segment profilleri, boyut dagilimi, davranis farkliliklari, strateji onerileri).

---

### a-b-test-analizi

A/B test sonuclarini istatistiksel olarak analiz ederek guvenilir kararlara yonlendirir.

**Adimlar:**
1. Test hipotezini, metrikleri ve basari kriterlerini dogrula.
2. Orneklem buyuklugu ve test suresi yeterliligini kontrol et.
3. Istatistiksel anlamlilik testi yap (t-test, chi-square, bootstrap).
4. Sonuclari yorumla ve uygulama onerisi sun.

**Cikti Formati:** A/B test analiz raporu (hipotez, orneklem, istatistiksel sonuclar, guven araligi, oneri).

---

### tahminleme-modeli

Gecmis veriye dayali tahminleme modelleri olusturarak gelecek trendleri ongoru eder.

**Adimlar:**
1. Tahmin hedefini ve kullanilacak degiskenleri belirle.
2. Veri hazirlik ve ozellik muhendisligi yap.
3. Model sec, egit ve degerlendir (regresyon, zaman serisi, ML).
4. Model performansini ve tahmin guvenilirligini raporla.

**Cikti Formati:** Tahminleme raporu (model secimi, performans metrikleri, tahmin sonuclari, guven araliklari).

---

### musteri-yasam-boyu-degeri

Musteri yasam boyu degerini (LTV/CLV) hesaplayan model ve analiz olusturur.

**Adimlar:**
1. LTV hesaplama yontemi sec (tarihi, tahmine dayali, kohorta dayali).
2. Gerekli verileri topla ve hazirla (gelir, maliyet, tutma).
3. LTV hesaplamasini yap ve segment bazli kirilim olustur.
4. LTV icgorullerini pazarlama ve is stratejisine entegre et.

**Cikti Formati:** LTV analiz raporu (hesaplama yontemi, segment bazli LTV, trend analizi, strateji onerileri).

---

### kayip-analizi

Musteri/kullanici kaybini (churn) analiz ederek kayip nedenlerini ve onleme stratejilerini belirler.

**Adimlar:**
1. Kayip tanimini ve olcum yontemini belirle.
2. Kayip oranlarini hesapla ve trend analizini yap.
3. Kayip risk faktorlerini ve onculerini tespit et.
4. Kayip onleme stratejileri ve erken uyari sistemi olustur.

**Cikti Formati:** Kayip analizi raporu (kayip oranlari, risk faktorleri, oncu gostergeler, onleme stratejisi).

---

### rfm-analizi

RFM (Recency, Frequency, Monetary) analizi ile musterileri segmentlere ayirarak pazarlama stratejisi belirler.

**Adimlar:**
1. RFM degiskenlerini hesapla ve puanlama yap.
2. RFM segmentlerini olustur ve isimllendir (sampiyon, risk altinda vb.).
3. Segment bazli musteri profillerini analiz et.
4. Her segment icin ozel pazarlama stratejisi oner.

**Cikti Formati:** RFM raporu (puan dagilimi, segment tanimlari, musteri profilleri, strateji matrisi).

---

### atribusyon-modelleme

Pazarlama kanallarinin donusum uzerindeki etkisini olcen atribusyon modeli olusturur.

**Adimlar:**
1. Atribusyon modelini sec (son tiklama, ilk tiklama, dogrusal, zaman azalan, veri odakli).
2. Donusum yollarini topla ve analiz et.
3. Kanal bazli atribusyon hesaplamasini yap.
4. Model sonuclarini butce dagitim kararlarina yansit.

**Cikti Formati:** Atribusyon raporu (model secimi, kanal bazli katki, donusum yolu analizi, butce onerileri).

---

### pazar-sepeti-analizi

Birliktelik kurallari analiizi ile urun satin alma kaliplarini kesfeder.

**Adimlar:**
1. Islem verilerini hazirla ve formatla.
2. Birliktelik kurallari madenciligi yap (Apriori, FP-Growth).
3. Destek, guven ve lift metriklerini hesapla ve yorumla.
4. Urun onerisi ve capraz satis stratejilerine donustur.

**Cikti Formati:** Pazar sepeti raporu (birliktelik kurallari, metrikler, urun esleri, strateji onerileri).

---

### anomali-tespiti

Verilerdeki normal disi kaliplari ve anomalileri otomatik tespit eden sistem kurar.

**Adimlar:**
1. Normal davranis baseline'ini tanimla.
2. Anomali tespit yontemi sec (istatistiksel, ML tabanli, kural tabanli).
3. Tespit mekanizmasini implement et ve ayarla.
4. Alarm sistemi ve anomali inceleme surecini olustur.

**Cikti Formati:** Anomali tespit plani (baseline tanimi, yontem secimi, esik degerleri, alarm yapisi).

---

### duygu-analizi-nlp

Metin verilerinde duygu analizi yaparak musteri goruslerini ve pazar algisini olcer.

**Adimlar:**
1. Analiz kaynakkllarini ve metin verilerini topla.
2. NLP model veya API sec ve yapilandir.
3. Duygu siniflandirmasi yap (pozitif, negatif, notr, karma).
4. Sonuclari zamansal ve tematik olarak analiz et.

**Cikti Formati:** Duygu analizi raporu (kaynak dagilimi, duygu oranlari, tema analizi, trend grafikleri).

---

### veri-kalite-yonetimi

Veri kalitesini olcen, izleyen ve iyilestiren sistematik surecler olusturur.

**Adimlar:**
1. Veri kalite boyutlarini tanimla (eksiksizlik, dogruluk, tutarlilik, zamanllik).
2. Kalite olcum metrikleri ve esik degerlerini belirle.
3. Otomatik veri kalite kontrolu ve alarm mekanizmasini kur.
4. Veri kalite iyilestirme sureci ve sorumluluk matrisini olustur.

**Cikti Formati:** Veri kalite plani (boyut tanimlari, metrikler, izleme paneli, iyilestirme sureci).

---

### veri-yonetisimi

Organizasyonel veri yonetisim (data governance) cercevesini olusturarak veri varliklarini yonetir.

**Adimlar:**
1. Veri yonetisim rollerini ve sorumluluklarini tanimla.
2. Veri politikalari, standartlari ve prosedurlerini olustur.
3. Veri katalog, sozluk ve soy haritasi (lineage) altyapisini kur.
4. Veri yonetisim olgunluk degerlendirmesi ve yol haritasi hazirla.

**Cikti Formati:** Veri yonetisim cercevesi (roller, politikalar, katalog yapisi, olgunluk degerlendirmesi).

---

### veri-katalogu

Veri katalogu olusturarak organizasyondaki veri varliklarini kesfedilebilir hale getirir.

**Adimlar:**
1. Veri kaynaklarini ve varliklarini envantere al.
2. Meta veri standartlarini ve etiketleme kurallarini belirle.
3. Veri katalog aracini sec ve yapilandir.
4. Veri kesfini ve self-servis erisimi aktifllestir.

**Cikti Formati:** Veri katalogu plani (varlik envanteri, meta veri standartlari, arac secimi, erisim rehberi).

---

### veri-gizliligi-uyumu

Veri analitik sureclerinde gizlilik ve uyumluluk gereksinimlerini saglar.

**Adimlar:**
1. Kisisel veri isleme envanterini cikar.
2. Gizlilik gereksinimlerini analitik sureclere esle (KVKK, GDPR).
3. Anonimlesstirme, pseudonimlesstirme ve maskeleme kontrollerini uygula.
4. Gizlilik uyumlu analitik sureclerini dokumante et ve denetle.

**Cikti Formati:** Veri gizliligi plani (isleme envanteri, kontrol matrisi, anonimlesstirme rehberi, denetim sureci).

---

### is-zekasi-platformu

Is zekasi (BI) platform secimi ve yapilandirmasini yaparak self-servis analitik saglar.

**Adimlar:**
1. BI gereksinimlerini ve kullanici profillerini belirle.
2. BI platformunu sec ve degerlendir (Tableau, Power BI, Looker, Metabase).
3. Veri modeli, semantik katman ve erisim kontrollerini yapilandir.
4. Kullanici egitimi ve benimseme planini olustur.

**Cikti Formati:** BI platform plani (gereksinimler, platform secimi, veri modeli, egitim plani).

---

### otomatik-raporlama

Periyodik raporlari otomatik olusturup dagtitan raporlama sistemi kurar.

**Adimlar:**
1. Rapor turlerini, alicilarini ve sikligini belirle.
2. Rapor sablonlarini ve veri kaynaklarini tanimla.
3. Otoomatik rapor olusturma ve dagitim is akisini kur.
4. Rapor kalite kontrolu ve hata izleme mekanizmasini olustur.

**Cikti Formati:** Otomatik raporlama plani (rapor katalogu, sablon dosyalari, otomasyon yapisi, kalite kontrol).

---

### kpi-tanimlama

Is hedeflerine uygun KPI'lar tanimlayarak performans izleme cercevesi olusturur.

**Adimlar:**
1. Is hedeflerini ve stratejik oncelikleri belirle.
2. Her hedef icin SMART KPI'lar tanimla.
3. KPI hesaplama yontemlerini ve veri kaynaklarini dokumante et.
4. KPI izleme sikligi ve raporlama yapisini olustur.

**Cikti Formati:** KPI cercevesi (hedef-KPI eslesmesi, hesaplama tanimlari, veri kaynaklari, izleme paneli).

---

### istatistiksel-analiz

Istatistiksel yontemler ile veri setlerinden anlamli icgorular cikarir.

**Adimlar:**
1. Arastirma sorusunu tanimla ve uygun istatistiksel yontemi sec.
2. Veriyi hazirla ve tanimlayici istatistikleri olustur.
3. Cikarimsala istatistik testlerini uygula (hipotez, korelasyon, regresyon).
4. Sonuclari yorumla ve is baglaminda anlamlandir.

**Cikti Formati:** Istatistiksel analiz raporu (tanimlayici istatistikler, test sonuclari, gorselestirmeler, yorumlar).

---

### zaman-serisi-analizi

Zaman serileri verilerini analiz ederek trend, mevsimsellik ve tahmin modelleri olusturur.

**Adimlar:**
1. Zaman serisi veriosini incele ve bilesenlerini ayrrstir.
2. Duragan, trend ve mevsimsellik analizini yap.
3. Tahmin modeli sec ve uygula (ARIMA, Prophet, exponential smoothing).
4. Model performansini degerlendir ve tahmin guven araligini raporla.

**Cikti Formati:** Zaman serisi raporu (bilesen analizi, model karsilastirmasi, tahmin sonuclari, guven araliklari).

---

### veri-muhendisligi-altyapisi

Veri muhendisligi altyapisini tasarlayarak olceklenebilir veri isleme kapasitesi olusturur.

**Adimlar:**
1. Veri isleme gereksinimlerini ve hacim tahminlerini belirle.
2. Veri isleme mimarisini sec (batch, streaming, lambda, kappa).
3. Arac ve platform secimlerini yap (Spark, Flink, Kafka, BigQuery).
4. Altyapi provizyon, izleme ve maliyet yonetim planini olustur.

**Cikti Formati:** Veri muhendisligi plani (mimari diyagram, arac secimi, kapasite planlama, maliyet tahmini).

---

### gercek-zamanli-analitik

Gercek zamanli veri akisini ve analizini saglayan streaming analitik altyapisi kurar.

**Adimlar:**
1. Gercek zamanli analitik kullanim senaryolarini belirle.
2. Streaming veri pipeline'i tasarla (Kafka, Kinesis, Pub/Sub).
3. Gercek zamanli isleme ve analiz katmanini kur.
4. Gercek zamanli dashboard ve alarm mekanizmasini olustur.

**Cikti Formati:** Streaming analitik plani (senaryolar, pipeline mimarisi, isleme katmani, alarm yapisi).

---

### makine-ogrenmesi-projesi

Makine ogrenmesi projesini basindan sonuna yoneten is akisi ve metodoloji olusturur.

**Adimlar:**
1. ML problem tanimini ve basari metriklerini belirle.
2. Veri toplama, temizleme ve ozellik muhendisligi yap.
3. Model secimi, egitim ve hiperparametre ayarlamasi yap.
4. Model degerlendirmesi, dogrulama ve dagitim planini olustur.

**Cikti Formati:** ML proje plani (problem tanimi, veri pipeline, model karsilastirmasi, dagitim stratejisi).

---

### ozellik-muhendisligi

Makine ogrenmesi modelleri icin etkili ozellikler olusturma sureci tasarlar.

**Adimlar:**
1. Ham veri kaynaklarini ve potansiyel ozellikleri belirle.
2. Ozellik donusumleri ve turetme yontemlerini uygula.
3. Ozellik secimi ve onem siralmasini yap.
4. Ozellik deposu (feature store) ve versiyon yonetimini kur.

**Cikti Formati:** Ozellik muhendisligi plani (ozellik katalogu, donusum kurallari, secim sonuclari, depo yapisi).

---

### model-degerlendirme

ML model performansini kapsamli olarak degerlendiren metrik ve yontemler uygular.

**Adimlar:**
1. Degerlendirme metriklerini problem turune gore sec.
2. Capraz dogrulama ve holdout set stratejisini uygula.
3. Hata analizi ve model davranis incelemesi yap.
4. Model karsilastirma raporu ve secim gerekcessini olustur.

**Cikti Formati:** Model degerlendirme raporu (metrik sonuclari, karsilastirma tablosu, hata analizi, secim gerekcessi).

---

### model-dagitimi

ML modelini uretim ortamina dagitarak surekli tahmin hizmeti saglar.

**Adimlar:**
1. Dagitim yaklasimini sec (REST API, batch, edge, streaming).
2. Model paketleme ve konteynerizasyon islemini yap.
3. Model sunucu altyapisini kur ve performansini test et.
4. Model izleme, versiyon yonetimi ve geri alma mekanizmasini olustur.

**Cikti Formati:** Model dagitim plani (yaklasim secimi, altyapi, performans metrikleri, izleme paneli).

---

### model-izleme

Uretim ortamindaki ML model performansini surekli izleyerek bozulmalari tespit eder.

**Adimlar:**
1. Izlenecek model metrikleri ve veri drift gostergelerini belirle.
2. Model izleme altyapisini ve dashboard'u kur.
3. Performans dusus ve drift alarm esiklerini tanimla.
4. Yeniden egitim tetikleyicileri ve otomasyon kurallarini olustur.

**Cikti Formati:** Model izleme plani (metrik tanimlari, izleme altyapisi, alarm kurallari, yeniden egitim sureci).

---

### deneysel-tasarim

Veri odakli deney tasarimi yaparak dogru nedensellik cikarimlarini saglar.

**Adimlar:**
1. Deney hipotezini ve degiskenleri tanimla.
2. Orneklem buyuklugu ve deney suresini hesapla.
3. Kontrol ve deney grubu atama stratejisini belirle.
4. Deney sonuclarini istatistiksel guc analizi ile degerlendir.

**Cikti Formati:** Deney tasarimi (hipotez, degiskenler, orneklem hesaplama, analiz plani, sonuc sablonu).

---

### veri-hikayecilik

Veri analizlerini ikna edici hikayeler seklinde sunarak aksiyona yonlendirir.

**Adimlar:**
1. Hedef kitleyi ve iletilecek ana mesaji belirle.
2. Veri bulgularini mantiksal hikaye akisina donustur.
3. Etkili gorsellestirmeler ve anlatim teknikleri kullan.
4. Aksiyon cagrisi ile hikayelyi sonuclandir.

**Cikti Formati:** Veri hikayesi (hikaye taslagi, gorsel akis, sunum dosyasi, aksiyon onerileri).

---

### self-servis-analitik

Teknik olmayan kullanicilarin kendi analizlerini yapabilecegi self-servis altyapi kurar.

**Adimlar:**
1. Self-servis kullanici profillerini ve ihtiyaclarini belirle.
2. Veri semantik katmani ve is terimleri sozlugunu olustur.
3. Self-servis araclari yapilandir ve erisim kontrollerini kur.
4. Kullanici egitimi ve destek mekanizmasini olustur.

**Cikti Formati:** Self-servis plani (kullanici profilleri, semantik katman, arac yapilndirmasi, egitim materyali).

---

### veri-modelleme

Analitik amacli veri modellerini tasarlayarak sorgu performansi ve kullanim kolayligi saglar.

**Adimlar:**
1. Is gereksinimlerini ve sorgu kaliplarini analiz et.
2. Modelleme yaklasimini sec (yildiz, kartanesi, genis tablo).
3. Boyut, olcü ve iliskileri tanimla.
4. Model performansini test et ve optimize et.

**Cikti Formati:** Veri modeli (ER diyagrami, tablo tanimlari, iliskii haritasi, performans metrikleri).

---

### dbt-donusumleri

dbt ile veri ambarinda donusum katmanini olusturarak analitik hazir veri saglar.

**Adimlar:**
1. dbt proje yapisi ve model organizasyonunu tasarla.
2. Staging, intermediate ve mart katmanlarini olustur.
3. Test, dokumantasyon ve snapshot yapilandirmalarini yap.
4. dbt CI/CD pipeline entegrasyonunu kur.

**Cikti Formati:** dbt projesi (model yapisi, test tanimlari, dokumantasyon, pipeline entegrasyonu).

---

### python-veri-analizi

Python ile veri analizi yaparak icgoru uretemek icin kod ve is akislari olusturur.

**Adimlar:**
1. Analiz ortamini ve kutuphaneeleri yapilandir (pandas, numpy, matplotlib).
2. Veri yukleme, temizleme ve donusum islemlerini yap.
3. Kesifsel veri analizi (EDA) ve gorselestirmeler olustur.
4. Analiz sonuclarini raporla ve tekrarlanabilir hale getir.

**Cikti Formati:** Python analiz paketi (Jupyter notebook, veri hazirlik kodlari, gorselestirmeler, bulgular).

---

### ab-test-platformu

Organizasyonel A/B test platformu ve sureci kurarak deney kulturunu gelisitirir.

**Adimlar:**
1. A/B test platform gereksinimllerini belirle.
2. Platform aracini sec ve yapilandir (Optimizely, GrowthBook, ozel).
3. Deney tasarimi, analiz ve karar alma surecini standartlastir.
4. Deney bilgi bankasi ve ogrenme paylasim mekanizmasini kur.

**Cikti Formati:** A/B test platform plani (gereksinimler, arac secimi, surec standartlari, bilgi bankasi yapisi).

---

### veri-ekibi-kurulumu

Veri analitik ekibini kurma, roller tanimlama ve calisma modelini tasarlama stratejisi olusturur.

**Adimlar:**
1. Veri ekibi rollerini ve yetkinliklerini tanimla (analist, muhendis, bilimci).
2. Ekip yapisi modelini sec (merkezi, yerlesik, hibrit).
3. Is birligi, iletisim ve proje yonetim sureclerini olustur.
4. Yetkinlik gelistirme ve kariyer patikasi planla.

**Cikti Formati:** Veri ekibi plani (rol tanimlari, yapii modeli, calisma surecleri, yetkinlik haritasi).

---

### metrik-agaci

Is metrikleri arasindaki iliskileri haritalayan metrik agaci (metric tree) olusturur.

**Adimlar:**
1. Ust duzey is metriklerini (gelir, kar, buyume) belirle.
2. Her metrigi alt bilesenlere ayristir.
3. Metrikleer arasi iliski ve nedensellik haritasini ciz.
4. Metrik agacini interaktif panel olarak gorsellistir.

**Cikti Formati:** Metrik agaci (hiyerarsi diyagrami, metrik tanimlari, iliski aciklamalari, izleme paneli).

---

### veri-migrsyonu

Veri kaynak sistemlerinden hedef sistemlere guvenli ve eksiksiz veri gocunu planlar.

**Adimlar:**
1. Kaynak ve hedef sistem analizi yap ve veri haritalamasi olustur.
2. Migrasyon stratejisi sec (big bang, kademeli, paralel calistirma).
3. Veri donusum kurallari ve dogrulama kontrollerini tanimla.
4. Migrasyon testi, rollback plani ve calistirma takvimini olustur.

**Cikti Formati:** Migrasyon plani (veri haritasi, strateji, donusum kurallari, test plani, calistirma takvimi).

---

### veri-okuryazarligi

Organizasyonda veri okuryazarligini gelistiren egitim ve kultur degisimi programi olusturur.

**Adimlar:**
1. Mevcut veri okuryazarlik seviyesini degerlendir.
2. Rol bazli veri okuryazarlik mufredat ve materyallerini hazirla.
3. Egitim programi ve atolye takvimini olustur.
4. Okuryazarlik ilerleme metriklerini izle ve program etkinligini olc.

**Cikti Formati:** Veri okuryazarlik programi (seviye degerlendirmesi, mufredat, egitim takvimi, etki metrikleri).

---

### elde-tutma-analizi

Kullanici elde tutma (retention) oranlarini cohort bazli analiz ederek kayip trendlerini ortaya cikarir.

**Adimlar:**
1. Elde tutma tanimini ve olcum donemlerini belirle.
2. Cohort bazli tutma egrileri olustur ve karsilastir.
3. Tutma uzerinde etkili faktorleri istatistiksel olarak analiz et.
4. Tutma iyilestirme firsatlarini ve aksiyon onerilerini raporla.

**Cikti Formati:** Elde tutma raporu (cohort egrileri, donem bazli oranlar, etkili faktorler, aksiyon onerileri).

---

### veri-pipeli-izleme

Veri pipeline'larinin sagligini ve veri kalitesini surekli izleyen sistem kurar.

**Adimlar:**
1. Izlenecek pipeline metrikleri ve kalite kontrollerini tanimla.
2. Pipeline calistirma durumu, sure ve hata izleme paneli kur.
3. Veri beklenti testleri (data expectations) ve alarm mekanizmasini olustur.
4. Pipeline olay yonetimi ve mudahale surecini tanimla.

**Cikti Formati:** Pipeline izleme plani (metrik tanimlari, izleme paneli, alarm kurallari, mudahale sureci).
