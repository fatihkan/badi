# DevOps Becerileri

Bu dosya, CI/CD, container yonetimi, bulut mimarisi, izleme, guvenlik ve altyapi otomasyonu alanlarindaki tum becerileri icerir.

---

### ci-cd-tasarimi

Surekli entegrasyon ve surekli dagitim (CI/CD) pipeline mimarisini tasarlar ve uygular.

**Adimlar:**
1. Mevcut gelistirme is akisini ve dagitim surecini analiz et.
2. Pipeline asamalarini tanimla (build, test, analiz, dagitim).
3. Arac secimi yap (Jenkins, GitLab CI, GitHub Actions, CircleCI).
4. Pipeline konfigurasyonunu olustur ve test et.

**Cikti Formati:** CI/CD tasarim dokumani (pipeline diyagrami, asama tanimlari, arac secimi, konfigurasyon dosyalari).

---

### pipeline-optimizasyonu

Mevcut CI/CD pipeline performansini analiz ederek hiz ve guvenilirlik optimizasyonu yapar.

**Adimlar:**
1. Pipeline calisma suresi ve basarisizlik oranini olc.
2. Darbogazlari tespit et (yavas adimlar, gereksiz islemler).
3. Paralelizasyon, onbellekleme ve artimli build stratejileri uygula.
4. Optimize edilmis pipeline performansini izle ve kiyasla.

**Cikti Formati:** Optimizasyon raporu (mevcut metrikler, darbogazlar, uygulanan iyilestirmeler, yeni metrikler).

---

### container-orkestrasyonu

Container'lari olcekli ortamlarda yonetmek icin orkestrasyon stratejisi ve altyapisi kurar.

**Adimlar:**
1. Orkestrasyon ihtiyaclarini ve is yukunu degerlendir.
2. Orkestrasyon platformu sec (Kubernetes, Docker Swarm, ECS).
3. Cluster mimarisi, ag ve depolama yapilandirmasini tasarla.
4. Deployment stratejileri ve otomasyon kurallarini uygula.

**Cikti Formati:** Orkestrasyon plani (platform secimi, cluster mimarisi, ag topolojisi, deployment stratejisi).

---

### kubernetes-yonetimi

Kubernetes cluster kurulumu, yapilandirmasi ve gunluk operasyonlarini yonetir.

**Adimlar:**
1. Cluster mimarisi ve node boyutlandirmasini planla.
2. Namespace, RBAC ve kaynak kotalarini yapilandir.
3. Workload deployment, service ve ingress tanimlarini olustur.
4. Izleme, log toplama ve alarm yapilandirmasini kur.

**Cikti Formati:** K8s yonetim rehberi (cluster yapisi, RBAC politikalari, manifest dosyalari, izleme paneli).

---

### docker-en-iyi-uygulamalar

Docker image olusturma, boyut optimizasyonu ve guvenlik en iyi uygulamalarini uygular.

**Adimlar:**
1. Dockerfile en iyi uygulamalarini denetle (multi-stage, katman sirasi).
2. Image boyut optimizasyonu yap (gereksiz bagimliliklari kaldir).
3. Guvenlik taramasi ve zafiyet kontrolu uygula.
4. Image versiyonlama ve registry yonetim stratejisi olustur.

**Cikti Formati:** Docker rehberi (Dockerfile sablonlari, optimizasyon kontrol listesi, guvenlik politikasi, registry stratejisi).

---

### altyapi-kod-olarak

Infrastructure as Code (IaC) yaklasimiyla altyapi yonetimini kod tabanli hale getirir.

**Adimlar:**
1. IaC arac secimi yap (Terraform, Pulumi, CloudFormation).
2. Altyapi modulleri ve katman yapisini tasarla.
3. Ortam yonetimi (dev, staging, prod) ve degisken stratejisini belirle.
4. IaC CI/CD pipeline entegrasyonu ve state yonetimini kur.

**Cikti Formati:** IaC plani (arac secimi, modul yapisi, ortam stratejisi, pipeline entegrasyonu).

---

### terraform-moduller

Yeniden kullanilabilir Terraform modulleri tasarlayarak altyapi standardizasyonu saglar.

**Adimlar:**
1. Modul ihtiyaclarini belirle ve sinirlari tanimla.
2. Modul arayuzunu tasarla (input, output, varsayilan degerler).
3. Modul testlerini ve dokumantasyonunu olustur.
4. Modul registry ve versiyon yonetim stratejisini kur.

**Cikti Formati:** Terraform modul paketi (modul kodu, degisken tanimlari, test dosyalari, kullanim rehberi).

---

### ansible-playbook

Ansible playbook'lar ile sunucu yapilandirma ve uygulama dagitim otomasyonu olusturur.

**Adimlar:**
1. Otomasyon hedeflerini ve kapsami belirle.
2. Role yapisi ve playbook organizasyonunu tasarla.
3. Playbook, handler ve template dosyalarini olustur.
4. Idempotent calismayi dogrula ve testleri yap.

**Cikti Formati:** Ansible paketi (playbook dosyalari, role yapisi, envanter sablonu, test sonuclari).

---

### bulut-mimarisi

Olceklenebilir, guvenli ve maliyet-etkin bulut mimarisi tasarlar.

**Adimlar:**
1. Is gereksinimlerini ve teknik kisitlari belirle.
2. Bulut hizmet modelini sec (IaaS, PaaS, SaaS, FaaS).
3. Mimari diyagrami ve bileslen iliskilerini tasarla.
4. Yuksek erisilebilirlik, felaket kurtarma ve guvenlik kontrollerini ekle.

**Cikti Formati:** Bulut mimarisi dokumani (mimari diyagram, bilesen listesi, guvenlik kontrolleri, maliyet tahmini).

---

### aws-optimizasyonu

AWS hizmetlerinin maliyet, performans ve guvenlik optimizasyonunu yapar.

**Adimlar:**
1. Mevcut AWS kaynak kullanimini ve maliyetlerini analiz et.
2. Boyut dogru ayarlama (right-sizing) ve rezervasyon firsatlarini belirle.
3. Kullanilmayan kaynaklar ve gereksiz harcamalari tespit et.
4. Maliyet azaltma ve performans iyilestirme aksiyonlarini uygula.

**Cikti Formati:** AWS optimizasyon raporu (maliyet analizi, tasarruf firsatlari, aksiyon listesi, beklenen etki).

---

### azure-yonetimi

Microsoft Azure platformundaki kaynaklari etkili yonetir ve optimize eder.

**Adimlar:**
1. Azure kaynak grubu ve abonelik yapisini duzenle.
2. Azure Policy ve RBAC yaplandirmasini olustur.
3. Izleme, alarm ve maliyet yonetimi araclarini yapilandir.
4. Azure best practice ve guvenlik benchmark uyumunu denetle.

**Cikti Formati:** Azure yonetim rehberi (kaynak yapisi, policy tanimlari, izleme paneli, uyumluluk raporu).

---

### gcp-mimarisi

Google Cloud Platform uzerinde olceklenebilir ve maliyet-etkin mimari tasarlar.

**Adimlar:**
1. GCP hizmet secimi ve proje yaplandirmasini olustur.
2. VPC, IAM ve guvenlik kontrollerini yapilandir.
3. Compute, storage ve veri tabanli hizmetleri optimize et.
4. GCP Operations Suite ile izleme ve log yonetimini kur.

**Cikti Formati:** GCP mimarisi dokumani (mimari diyagram, hizmet listesi, guvenlik kontrolleri, maliyet analizi).

---

### coklu-bulut

Birden fazla bulut saglayicisi ile coklu bulut (multi-cloud) stratejisi tasarlar.

**Adimlar:**
1. Coklu bulut ihtiyacini ve hedeflerini degerlendir.
2. Is yuklerinin bulut saglayicilara dagitimini planla.
3. Bulutlar arasi ag baglantisi ve veri senkronizasyonunu tasarla.
4. Yonetim araclari ve maliyet izleme stratejisini olustur.

**Cikti Formati:** Coklu bulut stratejisi (is yuku dagitimi, ag mimarisi, yonetim araclari, maliyet karsilastirmasi).

---

### sunucusuz-mimari

Serverless mimarisi ile olceklenebilir ve maliyet-etkin uygulamalar tasarlar.

**Adimlar:**
1. Serverless'a uygun is yuklerini belirle.
2. Fonksiyon tasarimi, tetikleyiciler ve olay akislarini planla.
3. Soguk baslama, zaman asimi ve bellek optimizasyonu yap.
4. Izleme, hata yonetimi ve maliyet kontrolu mekanizmalari kur.

**Cikti Formati:** Serverless mimari plani (fonksiyon listesi, olay akislari, optimizasyon ayarlari, maliyet tahmini).

---

### mikroservis-dagitimi

Mikroservis mimarisinde dagitim stratejileri ve orkestrasyonu yonetir.

**Adimlar:**
1. Servis bagimliliklari ve dagitim sirasini haritala.
2. Bagimsiz dagitim pipeline'larini yapilandir.
3. Servisler arasi iletisim ve versiyon uyumunu yonet.
4. Geri alma (rollback) stratejisi ve saglik kontrollerini kur.

**Cikti Formati:** Dagitim plani (bagimllik haritasi, pipeline yapilandirmasi, rollback proseduru, saglik kontrolleri).

---

### servis-mesh

Service mesh altyapisi kurarak mikroservisler arasi iletisimi, guvenligi ve gozlemlenebilirligi saglar.

**Adimlar:**
1. Service mesh ihtiyacini ve uygun araci degerlendir (Istio, Linkerd).
2. Sidecar proxy yaplandirmasini ve trafik kurallarini tasarla.
3. mTLS, rate limiting ve circuit breaker politikalarini uygula.
4. Service mesh izleme ve hata ayiklama araclarini kur.

**Cikti Formati:** Service mesh plani (arac secimi, trafik kurallari, guvenlik politikalari, izleme paneli).

---

### api-gateway

API Gateway yapilandirmasi ile API trafik yonetimi, guvenlik ve rate limiting uygular.

**Adimlar:**
1. API Gateway ihtiyaclarini ve trafik kaliplarini analiz et.
2. Yonlendirme kurallari, donsusumler ve versiyonlama stratejisini tasarla.
3. Kimlik dogrulama, yetkilendirme ve rate limiting politikalarini uygula.
4. API izleme, log ve analitik yapilandirmasini kur.

**Cikti Formati:** API Gateway plani (yonlendirme tablosu, guvenlik politikalari, rate limit ayarlari, izleme paneli).

---

### load-balancing

Yuk dengeleme stratejisi tasarlayarak trafigi sunucular arasinda optimal dagitir.

**Adimlar:**
1. Trafik kaliplarini ve kapasite gereksinimlerini analiz et.
2. Yuk dengeleme algoritmasini ve turunuu sec (L4/L7, global/bolgesel).
3. Saglik kontrolleri, oturum yapiskanlligi ve SSL sonlandirma yapilandir.
4. Yuk dengeleme performansini izle ve failover senaryolarini test et.

**Cikti Formati:** Load balancing plani (mimari, algoritma, saglik kontrolleri, failover proseduru, performans metrikleri).

---

### otomatik-olceklendirme

Otoomatik olceklendirme (auto-scaling) politikalari tasarlayarak kaynak verimliligi saglar.

**Adimlar:**
1. Olceklendirme ihtiyaclarini ve is yuku kaliplarini analiz et.
2. Olceklendirme metriklerini ve esik degerlerini belirle.
3. Yatay ve dikey olceklendirme politikalarini yapilandir.
4. Olceklendirme davranisini test et ve ince ayar yap.

**Cikti Formati:** Olceklendirme plani (metrikler, esik degerleri, politika tanimlari, test sonuclari).

---

### izleme-strateji

Kapsamli altyapi ve uygulama izleme stratejisi tasarlar ve uygular.

**Adimlar:**
1. Izleme gereksinimlerini ve katmanlarini belirle (altyapi, uygulama, is).
2. Metrik, log ve trace toplama stratejisini tasarla.
3. Dashboard, alarm ve bildirim yapilandirmasini olustur.
4. Izleme verileri ile olay yonetim surecini entegre et.

**Cikti Formati:** Izleme stratejisi (katman haritasi, metrik tanimlari, dashboard tasarimi, alarm kurallari).

---

### prometheus-grafana

Prometheus ile metrik toplama ve Grafana ile gorselllestirme altyapisini kurar.

**Adimlar:**
1. Prometheus scrape hedeflerini ve metrik kaynaklarini yapilandir.
2. PromQL ile kritik sorgulari ve alarm kurallarini olustur.
3. Grafana dashboard'lar ile metrik gorselllestirme panelleri tasarla.
4. Alertmanager ile bildirim kanallarini ve eskalasyon kurallarini kur.

**Cikti Formati:** Prometheus-Grafana paketi (scrape config, alert rules, dashboard JSON, bildirim ayarlari).

---

### log-toplama

Merkezi log toplama, isleme ve analiz altyapisi kurar.

**Adimlar:**
1. Log kaynaklarini ve format standardini belirle.
2. Log toplama ajanlarini ve pipeline'i yapilandir.
3. Log depolama, indeksleme ve tutma politikalarini olustur.
4. Log arama, analiz ve alarm araclarini kur.

**Cikti Formati:** Log toplama plani (kaynak listesi, pipeline mimarisi, tutma politikasi, arama rehberi).

---

### elk-stack

Elasticsearch, Logstash, Kibana (ELK) stack ile log yonetim altyapisi kurar.

**Adimlar:**
1. Elasticsearch cluster boyutlandirmasi ve index stratejisini planla.
2. Logstash pipeline ve filtre yapilandirmalarini olustur.
3. Kibana dashboard ve gorselllestirme panellerini tasarla.
4. Index lifecycle management ve performans optimizasyonu yap.

**Cikti Formati:** ELK stack plani (cluster yapilandirmasi, pipeline config, dashboard tasarimi, ILM politikasi).

---

### alarm-tasarimi

Anlamli ve aksiyona donusturulebilir alarm sistemi tasarlar.

**Adimlar:**
1. Kritik metrikleri ve alarm gereksinimlerini belirle.
2. Alarm esiklerini, gruplamalarini ve oncelik seviyelerini tanimla.
3. Bildirim kanallarini ve eskalasyon kurallarini yapilandir.
4. Alarm gurultusu azaltma ve alarm kalitesini surekli iyilestir.

**Cikti Formati:** Alarm tasarim dokumani (alarm katalogu, esik degerleri, eskalasyon matrisi, gurultu azaltma kurallari).

---

### olay-yonetimi

IT olay yonetim surecini tasarlayarak kesinti surelerini minimize eder.

**Adimlar:**
1. Olay siddet seviyelerini ve oncelik matrisini tanimla.
2. Olay tespit, bildirme ve ilk mudahale surecini olustur.
3. Eskalasyon, iletisim ve durum guncelleme prosedurlerini belirle.
4. Olay sonrasi analiz (post-mortem) sablonu ve sureci kur.

**Cikti Formati:** Olay yonetim plani (siddet matrisi, mudahale proseduru, iletisim sablonlari, post-mortem sablonu).

---

### on-call-rotasyonu

Nobetci muhendis rotasyon sistemi tasarlayarak 7/24 destek saglar.

**Adimlar:**
1. On-call kapsamini, beklentilerini ve kompanzasyonu belirle.
2. Rotasyon takvimi ve vardiya yapisini olustur.
3. Eskalasyon politikasi ve yedek nobet planini tanimla.
4. On-call yukunu izle ve takim sagligini koru.

**Cikti Formati:** On-call plani (rotasyon takvimi, eskalasyon politikasi, beklentiler dokumani, yuk analizi).

---

### runbook-olusturma

Tekrarlanabilir operasyonel gorevler icin adim adim runbook dokumanlari olusturur.

**Adimlar:**
1. Runbook gerektiren islemleri ve senaryolari listele.
2. Her senaryo icin adim adim talimatlar, komutlar ve kontrol noktalari yaz.
3. Hata durumlari ve geri alma prosedurlerini ekle.
4. Runbook'lari test et ve duzenli gunceleme takvimi olustur.

**Cikti Formati:** Runbook koleksiyonu (senaryo bazli runbook'lar, komut referanslari, kontrol listeleri, guncelleme takvimi).

---

### kaos-muhendisligi

Chaos Engineering pratikleri ile sistem dayanikliligini test eder ve iyilestirir.

**Adimlar:**
1. Kaos deneyleri icin hipotezler ve kapsam belirle.
2. Kaos araci sec ve deney altyapisini kur (Chaos Monkey, Litmus).
3. Kontrolluu ortamda deneyler gerceklestir ve gozlemle.
4. Bulguları dokumante et ve dayaniklilik iyilestirmeleri uygula.

**Cikti Formati:** Kaos muhendisligi raporu (deney hipotezleri, sonuclar, tespit edilen zafiyetler, iyilestirme plani).

---

### felaket-kurtarma

Felaket kurtarma (disaster recovery) plani olusturarak is surekliligi saglar.

**Adimlar:**
1. RTO ve RPO hedeflerini is gereksinimleriyle belirle.
2. Kurtarma stratejisi ve altyapisini tasarla (aktif-aktif, aktif-pasif).
3. Failover ve failback prosedurlerini olustur.
4. DR tatbikatlarini planla ve duzenli olarak test et.

**Cikti Formati:** DR plani (RTO/RPO hedefleri, kurtarma proseduru, failover adimlari, tatbikat takvimi).

---

### yedekleme-strateji

Veri yedekleme stratejisi tasarlayarak veri kaybini onler.

**Adimlar:**
1. Yedekleme gereksinimlerini ve veri siniflandirmasini yap.
2. Yedekleme turlerini, sikligini ve tutma politikasini belirle.
3. Yedekleme otomasyonunu ve depolama cozumunu yapilandir.
4. Yedekten geri yukleme testlerini duzenli olarak gerceklestir.

**Cikti Formati:** Yedekleme plani (veri siniflandirmasi, yedekleme takvimi, tutma politikasi, test takvimi).

---

### guvenlik-sertlestirme

Sunucu ve altyapi guvenlik sertlestirme (hardening) prosedurlerini uygular.

**Adimlar:**
1. CIS benchmark veya ilgili standart bazli sertlestirme kontrol listesi olustur.
2. Gereksiz servisleri, portlari ve hesaplari devre disi birak.
3. Yama yonetimi, erissim kontrol ve log yapilandirmasini sertlestir.
4. Sertlestirme uyumunu otomatik denetleme ile surekli izle.

**Cikti Formati:** Sertlestirme rehberi (kontrol listesi, yapilandirma dosyalari, denetim scripti, uyumluluk raporu).

---

### gizli-bilgi-yonetimi

Sifreler, API anahtarlari ve sertifikalar gibi gizli bilgilerin guvenli yonetimini saglar.

**Adimlar:**
1. Gizli bilgi envanterni cikar ve siniflandir.
2. Secret management araci sec ve yapilandir (Vault, AWS Secrets Manager).
3. Erisim politikalari, rotasyon ve denetim kurallarini olustur.
4. Uygulama entegrasyonu ve gelistirici is akislarini duzenle.

**Cikti Formati:** Gizli bilgi yonetim plani (envanter, arac yapillandirmasi, erisim politikalari, rotasyon takvimi).

---

### sertifika-yonetimi

SSL/TLS sertifikalarinin yasam dongusu yonetimini otomatiklestirir.

**Adimlar:**
1. Mevcut sertifika envanterini cikar ve sureleri izle.
2. Otomatik yenileme ve dagitim surecini kur (Let's Encrypt, cert-manager).
3. Sertifika politikalari ve uyumluluk gereksinimlerini tanimla.
4. Sure biten sertifika alarm ve eskalasyon surecini olustur.

**Cikti Formati:** Sertifika yonetim plani (envanter, otomasyon yapisi, politikalar, alarm kurallari).

---

### ag-guvenlik

Ag mimarisi guvenligini tasarlayarak saldiri yuzeyini minimize eder.

**Adimlar:**
1. Ag topolojisini ve veri akislarini haritala.
2. Ag segmentasyonu ve erisim kontrollerini tasarla.
3. Firewall, IDS/IPS ve VPN yapilandirmalarini uygula.
4. Ag guvenlik izleme ve olay tespit mekanizmasini kur.

**Cikti Formati:** Ag guvenlik plani (topoloji diyagrami, segmentasyon kurallari, firewall politikalari, izleme yapisi).

---

### waf-yapilandirma

Web Application Firewall yapilandirmasi ile web uygulamalarini saldirilardan korur.

**Adimlar:**
1. WAF cozumu sec ve ilk yapilandirmayi yap.
2. OWASP kurallari ve ozel kural setlerini uygula.
3. False positive analizi yap ve kurallari ince ayarla.
4. WAF loglarini izle ve tehdit raporlarini olustur.

**Cikti Formati:** WAF plani (kural setleri, ayar dosyalari, false positive analizi, izleme paneli).

---

### ddos-koruma

DDoS saldirilarina karsi koruma stratejisi ve altyapisi olusturur.

**Adimlar:**
1. DDoS risk degerlendirmesi ve saldiri yuzey analizini yap.
2. Koruma katmanlarini tasarla (ag, uygulama, DNS).
3. DDoS azaltma hizmeti ve araclari yapilandir.
4. DDoS mudahale proseduru ve tatbikat planini olustur.

**Cikti Formati:** DDoS koruma plani (risk degerlendirmesi, koruma katmanlari, mudahale proseduru, tatbikat takvimi).

---

### mavi-yesil-dagitim

Blue-green deployment stratejisi ile sifir kesinti dagitim altyapisi kurar.

**Adimlar:**
1. Mavi ve yesil ortam altyapisini tasarla.
2. Trafik yonlendirme ve gecis mekanizmasini yapilandir.
3. Saglik kontrolleri ve otomatik geri alma kurallarini tanimla.
4. Dagitim proseduru ve test senaryolarini dokumante et.

**Cikti Formati:** Blue-green plani (ortam mimarisi, gecis proseduru, saglik kontrolleri, geri alma adimslari).

---

### kanarya-dagitimi

Canary deployment ile riskleri minimize ederek kademeli dagitim yapar.

**Adimlar:**
1. Canary dagitim yuzdesini ve kademeli artis planini belirle.
2. Canary metrikleri ve basari kriterlerini tanimla.
3. Otomatik ilerleme ve geri alma kurallarini yapilandir.
4. Canary dagitim izleme paneli ve alarm yapisini kur.

**Cikti Formati:** Canary plani (kademe tablosu, basari metrikleri, otomasyon kurallari, izleme paneli).

---

### feature-flag

Feature flag sistemi kurarak ozellik dagitimini kod dagitimlarindan ayirir.

**Adimlar:**
1. Feature flag araci sec ve entegre et (LaunchDarkly, Unleash, Flagsmith).
2. Flag tipleri ve yapilandirma standartlarini belirle.
3. Hedefleme kurallari ve kademeli yayilim stratejisini olustur.
4. Flag yasam dongusu yonetimi ve temizlik surecini kur.

**Cikti Formati:** Feature flag plani (arac secimi, flag standartlari, hedefleme kurallari, yasam dongusu rehberi).

---

### a-b-test-altyapisi

A/B test altyapisini tasarlayarak veri odakli karar alma kapasitesi olusturur.

**Adimlar:**
1. A/B test platform ve araci sec.
2. Trafik bolme, randomizasyon ve segmentasyon mekanizmasini kur.
3. Metrik toplama ve istatistiksel anlamlilik hesaplama altyapisini olustur.
4. Test yonetim sureci ve raporlama panelini tasarla.

**Cikti Formati:** A/B test altyapi plani (platform secimi, mimari, metrik toplama, raporlama paneli).

---

### performans-testi

Uygulama performans testleri tasarlayarak performans darbogazlarini tespit eder.

**Adimlar:**
1. Performans test senaryolari ve basari kriterlerini belirle.
2. Test aracini sec ve yapilandir (JMeter, Gatling, k6).
3. Testleri gerceklestir ve sonuclari topla.
4. Darbogazlari analiz et ve iyilestirme onerileri sun.

**Cikti Formati:** Performans test raporu (senaryo tanimlari, test sonuclari, darbogaz analizi, iyilestirme onerileri).

---

### yuk-testi

Yuk testi (load test) ile sistemin kapasite sinirlarini belirler.

**Adimlar:**
1. Beklenen trafik kaliplarini ve yuk profillerini modelleyin.
2. Yuk test senaryolarini ve kademeli artis planini olustur.
3. Testi uygula ve sistem davranisini izle.
4. Kapasite sinirlarini, kopma noktalarini ve olceklendirme ihtiyaclarini raporla.

**Cikti Formati:** Yuk testi raporu (yuk profili, sistem metrikleri, kapasite sinirlari, olceklendirme onerileri).

---

### stres-testi

Stres testi ile sistemin asiri yuk altindaki davranisini ve kurtarma kapasitesini test eder.

**Adimlar:**
1. Stres senaryolari ve beklenen kopma noktalarini tanimla.
2. Kademeli artan asiri yuk uygula.
3. Sistem davranisi, hata oranlari ve kurtarma suresini gozlemle.
4. Dayaniklilik zafiyetlerini tespit et ve iyilestirme onerileri sun.

**Cikti Formati:** Stres testi raporu (senaryo tanimlari, kopma noktasi, kurtarma suresi, iyilestirme plani).

---

### maliyet-optimizasyonu

Bulut ve altyapi maliyetlerini analiz ederek tasarruf firsatlarini belirler.

**Adimlar:**
1. Mevcut maliyet daguilimini ve trendlerini analiz et.
2. Kullanilmayan ve dusuk verimli kaynaklari tespit et.
3. Rezervasyon, spot instance ve olceklendirme optimizasyonlari planla.
4. Maliyet izleme, butce alarmlari ve raporlama sistemini kur.

**Cikti Formati:** Maliyet optimizasyon raporu (mevcut maliyet, tasarruf firsatlari, aksiyon plani, beklenen tasarruf).

---

### kaynak-boyutlandirma

Bulut kaynaklarini is yuku gereksinimlerine gore dogru boyutlandirir.

**Adimlar:**
1. Mevcut kaynak kullanim metriklerini topla ve analiz et.
2. Asiri ve eksik boyutlu kaynaklari tespit et.
3. Optimal boyut onerilerini hesapla.
4. Boyut degisikliklerini uygula ve etkiyi izle.

**Cikti Formati:** Boyutlandirma raporu (mevcut boyutlar, kullanim oranlari, onerilen boyutlar, beklenen tasarruf).

---

### spot-instance

Spot/preemptible instance kullanarak bulut maliyetlerini dusurur.

**Adimlar:**
1. Spot instance'a uygun is yuklerini belirle.
2. Spot stratejisi ve fiyat limiti belirle.
3. Spot kesinti yonetimi ve yedekleme mekanizmasini tasarla.
4. Spot kullanim oranini ve maliyet tasarrufunu izle.

**Cikti Formati:** Spot instance plani (uygun is yukleri, fiyat stratejisi, kesinti yonetimi, tasarruf raporu).

---

### cdn-yapilandirma

Content Delivery Network yapilandirmasi ile icerik dagitim performansini arttirir.

**Adimlar:**
1. CDN ihtiyaclarini ve icerik tiplerini belirle.
2. CDN saglayici sec ve alan adi yapilandirmasini yap.
3. Onbellekleme kurallari, TTL ve gecersizlestirme stratejisini olustur.
4. CDN performansini izle ve hit/miss oranlarini optimize et.

**Cikti Formati:** CDN plani (saglayici secimi, cache kurallari, performans metrikleri, optimizasyon rehberi).

---

### dns-yonetimi

DNS altyapisini guvenli ve yuksek performansli sekilde yonetir.

**Adimlar:**
1. DNS kayitlarini envanterle ve yapilandir.
2. DNS guvenlik onlemlerini uygula (DNSSEC, DNS filtering).
3. DNS failover ve yuk dengeleme stratejisini olustur.
4. DNS degisiklik yonetimi ve izleme surecini kur.

**Cikti Formati:** DNS yonetim plani (kayit envanteri, guvenlik ayarlari, failover yapisi, izleme kurallari).

---

### ssl-tls-yonetimi

SSL/TLS yapilandirmasi ve sertifika yonetimi ile guvenli iletisim saglar.

**Adimlar:**
1. TLS versiyon ve cipher suite politikasini belirle.
2. Sertifika edinme ve dagitim surecini otomatiklestir.
3. HSTS, OCSP stapling ve sertifika pinning yapilandirmasini yap.
4. SSL Labs testi ile guvenlik skorunu denetle ve iyilestir.

**Cikti Formati:** SSL/TLS plani (politika, otomasyon yapisi, yapilandirma dosyalari, guvenlik skoru).

---

### uyumluluk-otomasyonu

Yasal ve sektorel uyumluluk gereksinimlerini otomatik denetleme ile saglar.

**Adimlar:**
1. Uyumluluk gereksinimlerini belirle (SOC2, ISO 27001, KVKK).
2. Otoomatik uyumluluk tarama ve denetim araclari yapilandir.
3. Uyumluluk kontrol listesi ve kanit toplama surecini olustur.
4. Uyumluluk raporlama ve sapma yonetim surecini kur.

**Cikti Formati:** Uyumluluk otomasyon plani (gereksinim listesi, arac yapilandirmasi, kontrol listesi, raporlama paneli).
