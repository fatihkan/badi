# Yazilim Gelistirme Becerileri

> 98 yapilandirilmis prosedur

## Beceri Listesi

### frontend-gelistirme

Modern frontend uygulama gelistirme becerisi. React, Vue, Angular gibi cercevelerle performansli ve kullanici dostu web uygulamalari olusturur.

1. Proje gereksinimlerini analiz et, teknoloji yiginini sec
2. Proje yapisini olustur, bilesen mimarisini tasarla
3. Bilesen gelistirme, durum yonetimi ve API entegrasyonu yap
4. Test, performans optimizasyonu ve dagitim hazirla

**Cikti Formati:** Frontend uygulamasi, bilesen kitapligi, test suite

---

### backend-gelistirme

Sunucu tarafli uygulama gelistirme becerisi. API tasarimi, veritabani entegrasyonu ve is mantigi ile saglam backend sistemleri olusturur.

1. API tasarimini yap, endpoint'leri ve veri modelini tanimla
2. Sunucu mimarisini olustur (katmanli, mikro servis, monolitik)
3. Is mantigi, veritabani islemleri ve kimlik dogrulama katmanini gelistir
4. API testi, dokumantasyon ve dagitim yapilandirmasini tamamla

**Cikti Formati:** Backend uygulamasi, API dokumantasyonu, test suite

---

### rest-api-tasarimi

RESTful API tasarlama ve dokumante etme becerisi. Kaynak modelleme, HTTP metotlari ve hata yonetimi ile standartlara uygun API'ler olusturur.

1. Kaynak modelini ve URL yapisini tanimla
2. HTTP metotlari, durum kodlari ve yanit formatlarini belirle
3. Kimlik dogrulama, yetkilendirme ve rate limiting ekle
4. OpenAPI/Swagger dokumantasyonunu olustur

**Cikti Formati:** API spesifikasyonu, OpenAPI dosyasi, ornek istekler

---

### graphql-api

GraphQL API tasarlama ve gelistirme becerisi. Sema tanimlama, resolver'lar ve performans optimizasyonu ile esnek veri sorgulama katmani olusturur.

1. GraphQL semasini (type, query, mutation, subscription) tanimla
2. Resolver'lari ve veri kaynagi baglantillarini gelistir
3. N+1 sorgu optimizasyonu ve onbellekleme ekle
4. GraphQL playground ve dokumantasyonu yapilandir

**Cikti Formati:** GraphQL semasi, resolver'lar, dokumantasyon

---

### veritabani-tasarimi

Veritabani sema ve mimari tasarlama becerisi. Iliskisel ve NoSQL veritabanlari icin normalizasyon, indeksleme ve performans optimizasyonu yapar.

1. Veri modelini ve iliskileri tanimla (ER diyagrami)
2. Tablo, sutun ve kisitlamalari olustur
3. Indeksleme stratejisi ve sorgu optimizasyonu uygula
4. Yedekleme, goc ve performans test planini hazirla

**Cikti Formati:** ER diyagrami, DDL betikleri, indeks stratejisi

---

### mikro-servis-mimari

Mikro servis mimarisi tasarlama ve uygulama becerisi. Servis ayrimi, iletisim kaliplari ve orkestrasyon ile olceklenebilir sistemler kurar.

1. Servis sinirlarini ve baglam haritasini belirle (DDD)
2. Servisler arasi iletisim modelini sec (sync/async, REST/gRPC/mesaj kuyrugu)
3. Servisleri gelistir, API gateway ve servis kesfini yapilandir
4. Dagitik izleme, loglama ve dayaniklilik kaliplarini ekle

**Cikti Formati:** Mimari diyagram, servis tanimlari, dagitim yapilandirmasi

---

### ci-cd-pipeline

Surekli entegrasyon ve surekli dagitim pipeline'i kurma becerisi. Otomatik build, test ve dagitim adimlari ile hizli ve guvenli yazilim tesliimi saglar.

1. Pipeline asamallarini tanimla (build, test, lint, dagitim)
2. CI/CD aracini sec (GitHub Actions, GitLab CI, Jenkins) ve yapilandir
3. Ortam yapilandirmalarini ve dagitim stratejilerini tanimla
4. Pipeline izleme, bildirim ve geri dondum mekanizmalarini ekle

**Cikti Formati:** Pipeline yapilandirmasi, dagitim stratejisi, izleme plani

---

### docker-container

Docker container'lari ile uygulama paketleme ve dagitim becerisi. Dockerfile olusturma, imaj optimizasyonu ve container orkestrasyon yapar.

1. Dockerfile olustur, cok asamali build stratejisi uygula
2. Container imajini optimize et (boyut, guvenlik, katman)
3. Docker Compose ile gelistirme ortamini yapilandir
4. Container saglik kontrolu, loglama ve agayar yapilandirmasini tamamla

**Cikti Formati:** Dockerfile, docker-compose.yml, dagitim kilavuzu

---

### kubernetes-yonetimi

Kubernetes cluster yonetimi ve uygulama dagitimi becerisi. Pod, servis, deployment ve ingress yapilandirmalarilyla container orkestrasyon saglar.

1. Kubernetes kaynaklarini (deployment, service, ingress) tanimla
2. Helm chart veya Kustomize ile yapilandirma yonetimini kur
3. Otomatik olcekleme, kaynak limitleri ve saglik kontrollerini ayarla
4. Izleme, loglama ve felaket kurtarma planini olustur

**Cikti Formati:** K8s manifest dosyalari, Helm chart, operasyon kilavuzu

---

### git-is-akisi

Git versiyon kontrol is akisi tasarlama becerisi. Dallanma stratejisi, inceleme sureci ve birlestirme politikalari ile etkili takim is birligi saglar.

1. Dallanma modelini sec (GitFlow, GitHub Flow, trunk-based)
2. Dal isimlendirme ve commit mesaj kurallarini tanimla
3. Pull request inceleme ve birlestirme politikalarini olustur
4. CI entegrasyonu ve otomatik kontrolleri yapilandir

**Cikti Formati:** Git is akisi kilavuzu, dal politikasi, PR sablonu

---

### kod-inceleme

Kod inceleme sureci tasarlama ve uygulama becerisi. Inceleme kontrol listesi, geri bildirim kaliplari ve kalite standartlari ile etkili kod incelemeleri yapar.

1. Kod inceleme kriterlerini ve kontrol listesini olustur
2. Geri bildirim verme standartlarini ve ton kurallarini belirle
3. Inceleme surecini ve SLA'larini tanimla
4. Inceleme metriklerini izle ve sureci iyilestir

**Cikti Formati:** Inceleme kilavuzu, kontrol listesi, metrik tablosu

---

### birim-test

Birim test yazma ve yonetme becerisi. Test stratejisi, test kaliplari ve kapsam olcumu ile guvenilir test suite olusturur.

1. Test stratejisini ve kapsam hedeflerini belirle
2. Test dosya yapisi ve isimlendirme standartlarini olustur
3. Birim testleri yaz (AAA patterni: Arrange, Act, Assert)
4. Kapsam raporunu olustur ve eksik alanlari tamamla

**Cikti Formati:** Test dosyalari, kapsam raporu, test kilavuzu

---

### entegrasyon-testi

Entegrasyon testi tasarlama ve uygulama becerisi. Bilesenler arasi etkilesim, API ve veritabani testleri ile sistem butünlügünü dogrulamar.

1. Entegrasyon test senaryolarini ve kapsamini tanimla
2. Test ortami ve test verisi hazirlik stratejisini olustur
3. Entegrasyon testlerini yaz ve CI pipeline'ina ekle
4. Test sonuclarini raporla ve basarisiz testleri analiz et

**Cikti Formati:** Entegrasyon testleri, test verileri, CI yapilandirmasi

---

### performans-optimizasyonu

Uygulama performans analizi ve optimizasyon becerisi. Profilleme, darbogazs tespiti ve optimizasyon teknikleri ile uygulama hizini arttirir.

1. Performans metriklerini olc ve darbogazlari tespirt et
2. Profilleme araclari ile kaynak kullanim analizini yap
3. Optimizasyon stratejisini belirle ve uygula (onbellekleme, sorgu, algoritma)
4. Optimizasyon oncesi/sonrasi karsilastirma raporunu olustur

**Cikti Formati:** Performans raporu, optimizasyon onerileri, benchmark sonuclari

---

### guvenlik-kodlama

Guvenli kodlama pratikleri uygulama becerisi. OWASP Top 10, girdi dogrulama ve yetkilendirme kaliplari ile guvenli yazilim gelistirir.

1. Guvenlik gereksinimlerini ve tehdit modelini belirle
2. Guvenli kodlama standartlarini tanimla ve egitiml ver
3. Statik analiz araclariyla guvenlik taramasi yap
4. Guvenlik testi ve penetrasyon testi sonuclarini degerlendir

**Cikti Formati:** Guvenlik kilavuzu, tarama raporu, duzeltme listesi

---

### api-entegrasyon

Ucuncu parti API'leri entegre etme becerisi. Kimlik dogrulama, hata yonetimi ve veri donusumu ile güvenilir dis servis entegrasyonlari yapar.

1. API dokumantasyonunu incele ve entegrasyon gereksinimlerini belirle
2. API istemci katmanini gelistir (kimlik dogrulama, hata yonetimi)
3. Veri donusum ve haritalama mantigi olustur
4. Entegrasyon testi yap ve izleme mekanizmasini kur

**Cikti Formati:** Entegrasyon kodu, test suite, izleme yapilandirmasi

---

### veritabani-goc

Veritabani sema degisikliklerini yonetme becerisi. Goc dosyalari, versiyon kontrol ve geri dondurmem ile güvenli veritabani evrimi saglar.

1. Goc stratejisini ve aracini sec (Flyway, Alembic, Prisma migrate)
2. Goc dosyalarini olustur ve versiyon kontrol altina al
3. Goc oncesi yedek al, goc islemini calistir ve dogrula
4. Geri dondurme plani hazirla ve uretim goc prosedurunu dokumante et

**Cikti Formati:** Goc dosyalari, goc proseduru, geri dondurme plani

---

### hata-yonetimi

Uygulama hata yonetimi stratejisi tasarlama becerisi. Hata siniflandirma, loglama ve kullanici bilgilendirme ile saglamm hata islelme mekanizmalari kurar.

1. Hata kategorilerini ve yonetim stratejisini tanimla
2. Merkezi hata yakalama ve islemem mekanizmasini gelistir
3. Hata loglama, izleme ve bildirim sistemini kur
4. Kullanici dostu hata mesajlari ve geri dondurme mantigi ekle

**Cikti Formati:** Hata yonetim katmani, loglama yapilandirmasi, hata katalogu

---

### onbellekleme-stratejisi

Uygulama onbellekleme stratejisi tasarlama becerisi. Redis, CDN ve uygulama ici onbellek ile yanit surelerini azaltir ve sunucu yukunu hafifletir.

1. Onbellekleme ihtiyaclarini ve veri erisim kaliplarini analiz et
2. Onbellek katmanlarini belirle (CDN, uygulama, veritabani)
3. Onbellek gecersiz kilma stratejisini (TTL, event-based) olustur
4. Onbellek isabet oranini izle ve stratejiyi optimize et

**Cikti Formati:** Onbellekleme yapilandirmasi, strateji dokumani, izleme metrikleri

---

### websocket-gelistirme

Gercek zamanli WebSocket iletisimi gelistirme becerisi. Cift yonlu baglanti, oda yonetimi ve mesaj protokolu ile canli veri akisi saglar.

1. WebSocket kullanim senaryolarini ve mesaj protokolunu tanimla
2. Sunucu ve istemci WebSocket katmanini gelistir
3. Oda yonetimi, kimlik dogrulama ve yeniden baglanti mantigi ekle
4. Baglanti izleme ve yuk dengeleme stratejisini olustur

**Cikti Formati:** WebSocket uygulamasi, mesaj protokolu, izleme mekanizmasi

---

### oturum-yonetimi

Kullanici oturm ve kimlik dogrulama sistemi gelistirme becerisi. JWT, OAuth ve oturum yonetim kaliplari ile guvenli kimlik dogrulama saglar.

1. Kimlik dogrulama stratejisini sec (JWT, session, OAuth 2.0)
2. Oturum olusturma, yenileme ve sonlandirma mantigi gelistir
3. Guvenlik onlemlerini ekle (CSRF, XSS koruma, guvenli cerez)
4. Oturum izleme ve suresi dolmus oturum yonetimini yapilandir

**Cikti Formati:** Kimlik dogrulama sistemi, guvenlik yapilandirmasi, test suite

---

### dosya-yukleme-sistemi

Dosya yukleme ve yonetim sistemi gelistirme becerisi. Boyut siniri, tip dogrulama, depolama ve CDN entegrasyonu ile guvenli dosya isleme saglar.

1. Dosya yukleme gereksinimlerini (tur, boyut, depolama) tanimla
2. Yukleme API'sini gelistir, dogrulama ve guvenlik kontrollerini ekle
3. Depolama cozumunu sec (S3, GCS, yerel) ve entegrasyonu yap
4. Dosya islleme pipeline'ini (boyutlandirma, dönusum) ve CDN yapilandirmasini olustur

**Cikti Formati:** Dosya yukleme API'si, depolama yapilandirmasi, islem pipeline'i

---

### arama-motoru-entegrasyonu

Uygulama ici arama islevseligi gelistirme becerisi. Elasticsearch, Algolia veya Meilisearch ile hizli ve ilgili arama sonuclari saglar.

1. Arama gereksinimlerini (tam metin, facet, otomatik tamamlama) tanimla
2. Arama motorunu sec ve indeksleme stratejisini belirle
3. Arama API'sini gelistir, siralama ve filtreleme mantigi ekle
4. Arama kalitesini olc ve relevans ayarlamasini optimize et

**Cikti Formati:** Arama API'si, indeks yapilandirmasi, relevans raporu

---

### bildirim-sistemi

Uygulama bildirim sistemi gelistirme becerisi. E-posta, push, SMS ve in-app bildirimler ile cok kanalli bildirim altyapisi kurar.

1. Bildirim kanallarini, turlerini ve tetikleyicileri tanimla
2. Bildirim servisi ve sablon motorunu gelistir
3. Kanal entegrasyonlarini (e-posta, push, SMS) yapilandir
4. Kullanici tercih yonetimi ve bildirim izleme mekanizmasi ekle

**Cikti Formati:** Bildirim servisi, sablon sistemi, tercih yonetimi

---

### odeme-entegrasyonu

Odeme sistemi entegrasyonu geclistirme becerisi. Stripe, PayPal ve yerel odeme yontemleri ile guvenli odeme isleme altyapisi kurar.

1. Odeme gereksinimlerini ve saglayici secimini yap
2. Odeme API entegrasyonunu gelistir (odeme, iade, abonelik)
3. Webhook isleyicileri ve idempotentlik mantigi ekle
4. PCI uyumluluk, guvenlik ve test senaryolarini tamamla

**Cikti Formati:** Odeme entegrasyonu, webhook isleyici, guvenlik dokumantasyonu

---

### e-posta-servisi

E-posta gonderim servisi gelistirme becerisi. Transaksiyonel ve pazarlama e-postalari icin guvenilir e-posta altyapisi kurar.

1. E-posta servis saglayicisini sec (SendGrid, SES, Postmark)
2. E-posta sablon sistemi ve gonderim API'sini gelistir
3. SPF, DKIM ve DMARC yapilandirmasini tamamla
4. Gonderim izleme, hata yonetimi ve itibar yonetimi mekanizmasi kur

**Cikti Formati:** E-posta servisi, sablon sistemi, DNS yapilandirmasi

---

### log-yonetimi

Uygulama log yonetim sistemi tasarlama becerisi. Yapilandirilmis loglama, toplama ve analiz ile etkili hata ayiklama ve izleme saglar.

1. Log seviyelerini, formatini ve standartlarini tanimla
2. Merkezi log toplama aracini sec (ELK, Grafana Loki) ve yapilandir
3. Yapilandirilmis loglama kitapligini entegre et
4. Log alarmlari, dashboard'lar ve tutma politikasini olustur

**Cikti Formati:** Loglama yapilandirmasi, dashboard, alarm kurallari

---

### izleme-ve-alarm

Uygulama ve altyapi izleme sistemi kurma becerisi. Metrik toplama, gorsellesirme ve alarm mekanizmalari ile proaktif sorun tespiti saglar.

1. Izlenecek metrikleri ve esik degerlerini tanimla
2. Izleme aracini sec (Prometheus, Datadog, New Relic) ve yapilandir
3. Dashboard'lar ve gorsellesirmeleri olustur
4. Alarm kurallari, bildirim kanallari ve eskalasyon surecini tanimla

**Cikti Formati:** Izleme yapilandirmasi, dashboard, alarm politikasi

---

### kod-kalite-araci

Kod kalite arac ve surec kurulumu becerisi. Linter, formatter ve statik analiz araclari ile tutarli ve kaliteli kod tabani saglar.

1. Kod kalite araclarini sec (ESLint, Prettier, SonarQube)
2. Kural setlerini tanimla ve yapilandirma dosyalarini olustur
3. Pre-commit hook'lari ve CI entegrasyonunu kur
4. Kod kalite metriklerini izle ve trend raporlarini olustur

**Cikti Formati:** Lint/format yapilandirmasi, CI pipeline, kalite raporu

---

### teknik-borc-yonetimi

Teknik borcu belirleme, onceliklendirme ve azaltma becerisi. Kod saglik metrikleri ve refactoring stratejisi ile surdurulebilir kod tabani yonetir.

1. Teknik borc kaynaklarini tara ve envanter cikar
2. Her borc kalemi icin etki ve efor degerlendirmesi yap
3. Onceliklendirme yap ve refactoring yol haritasi olustur
4. Teknik borc azaltma ilerlemesini izle ve raporla

**Cikti Formati:** Teknik borc envanteri, oncelik matrisi, yol haritasi

---

### monorepo-yonetimi

Monorepo yapiis tasarlama ve yonetme becerisi. Paylasilam bagimlliklar, workspace'ler ve secici build stratejileri ile verimli monorepo operasyonu saglar.

1. Monorepo yapisini ve workspace organizasyonunu tanimla
2. Paket yonetici yapilandirmasini olustur (pnpm, Turborepo, Nx)
3. Payalsim paketler ve bagimlilik yonetim stratejisini belirle
4. Secici build, test ve dagitim pipeline'larini yapilandir

**Cikti Formati:** Monorepo yapisi, workspace yapilandirmasi, pipeline

---

### state-yonetimi

Uygulama durum yonetimi stratejisi tasarlama becerisi. Yerel ve global durum, sunucu durumu ve URL durumu ile etkili veri yonetimi saglar.

1. Durum turlerini ve yonetim ihtiyaclarini analiz et
2. Durum yonetim cozumunu sec (Redux, Zustand, Pinia, Context)
3. Durum yapisi, aksiyonlar ve selector'lari olustur
4. Durum yonetim test stratejisini tanimla ve dokumante et

**Cikti Formati:** Durum yonetimi, test dosyalari, mimari dokumantasyon

---

### serverless-gelistirme

Serverless mimari ile uygulama gelistirme becerisi. AWS Lambda, Vercel Functions veya Cloudflare Workers ile sunucu yonetimi gerektirmeyen uygulamalar olusturur.

1. Serverless kullanim senaryosunu ve saglayiciyi sec
2. Fonksiyon yapisini, tetikleyicileri ve ortam degiskenlerini tanimla
3. Fonksiyonlari gelistir, yerel test ortamini kur
4. Dagitim, izleme ve maliyet optimizasyonunu yapilandir

**Cikti Formati:** Serverless fonksiyonlar, yapilandirma, dagitim pipeline'i

---

### progressive-web-app

Progressive Web App (PWA) gelistirme becerisi. Service worker, cevrimdisi destek ve push bildirim ile yerele benzer web uygulamalari olusturur.

1. PWA gereksinimlerini ve ozellliklerini tanimla
2. Service worker ve onbellekleme stratejisini gelistir
3. Web manifest, kurulum deneyimi ve cevrimdisi modu yapilandir
4. PWA denetimini (Lighthouse) yap ve optimizasyon onerileri uygula

**Cikti Formati:** PWA uygulamasi, service worker, Lighthouse raporu

---

### accessibility-gelistirme

Web erisilebilirlik gelistirme becerisi. ARIA rolleri, klavye navigasyonu ve ekran okuyucu uyumlulugu ile herkes icin eriselebilir uygulamalar gelisitrir.

1. Erislebilirlik standartlarini ve hedef seviyeyi belirle (WCAG)
2. Semantik HTML, ARIA rolleri ve ozelliklerini uygula
3. Klavye navigasyonu ve odak yonetimini gelistir
4. Erisilebilirlik testleri yap (axe, WAVE) ve duzeltmeleri tamamla

**Cikti Formati:** Erisiilebilir bilesen kitapligi, test raporu, kontrol listesi

---

### internasyonalizasyon

Cok dilli uygulama gelistirme (i18n) becerisi. Dil dosyalari, format lokalizasyonu ve RTL destegi ile uluslararasi kullanim icin uygun uygulamalar olusturur.

1. Desteklenecek dilleri ve lokalizasyon gereksinimlerini tanimla
2. i18n kutuphanesini sec (i18next, react-intl) ve yapilandir
3. Ceviri dosyalarini olustur, tarih/sayi/para formatlarini ayarla
4. RTL destegi ve cok dilli test senaryolarini tamamla

**Cikti Formati:** i18n yapilandirmasi, ceviri dosyalari, test raporu

---

### web-performans

Web uygulama performans optimizasyonu becerisi. Core Web Vitals, yukleme hizi ve calisma zamanli performans ile hizli web deneyimleri saglar.

1. Performans olcumlerini yap (Lighthouse, WebPageTest)
2. Performans darbogazlarini analiz et (JS bundle, gorsel, font, API)
3. Optimizasyon stratejilerini uygula (code splitting, lazy loading, sıkistirma)
4. Performans butcesi olustur ve surekli izleme mekanizmasi kur

**Cikti Formati:** Performans raporu, optimizasyon listesi, izleme dashboard'u

---

### test-stratejisi

Kapsamli test stratejisi tasarlama becerisi. Test piramidi, otomasyon seviyesi ve arac secimi ile etkili kalite guvence sureci olusturur.

1. Test kapsamini, hedeflerini ve piramit yapisini tanimla
2. Her test katmani icin arac ve yaklasimlari sec
3. Test yazim standartlari ve adlandirma kurallarini belirle
4. Test otomasyon pipeline'ini kur ve kapsam raporlama mekanizmasini olustur

**Cikti Formati:** Test strateji dokumani, arac listesi, pipeline yapilandirmasi

---

### veritabani-optimizasyonu

Veritabani sorgu ve performans optimizasyonu becerisi. Yavas sorgu analizi, indeks optimizasyonu ve sema iyilestirme ile veritabani performansini arttirir.

1. Yavas sorglulari tespit et ve sorgu planlairni analiz et
2. Indeks kullanim analizini yap ve eksik/gereksiz indeksleri belirle
3. Sorgu yeniden yazimi ve sema optimizasyonlari uygula
4. Optimizasyon oncesi/sonrasi performans karsilastirmasi yap

**Cikti Formati:** Sorgu optimizasyon raporu, indeks onerileri, benchmark

---

### devops-pratikleri

DevOps kulturunu ve pratiklerini uygulama becerisi. Altyapi kodu (IaC), otomasyon ve isbirligi ile hizli ve guvenilir yazilim teslimi saglar.

1. DevOps olgunluk degerlendirmesi yap ve iyilestirme alanlarini belirle
2. Altyapi kodunu (Terraform, Pulumi, CDK) olustur
3. Otomasyon pipeline'larini ve ortam yonetimini yapilandir
4. Izleme, alarm ve olay mudahale sureclerini kur

**Cikti Formati:** IaC dosyalari, pipeline, izleme yapilandirmasi

---

### refactoring

Kod refactoring stratejisi ve uygulamasi becerisi. Kod kokularinin tespiti, refactoring kaliplari ve guvenli donusum ile kod kalitesini arttirir.

1. Kod kokularini ve refactoring adaylarini tespit et
2. Refactoring stratejisini ve onceliklendirmesini belirle
3. Test kapsamini dogrula ve refactoring islemlerini gerceklestir
4. Refactoring sonrasi regresyon testi yap ve dokumante et

**Cikti Formati:** Refactored kod, degisiklik ozeti, test raporu

---

### yazilim-mimari

Yazilim mimarisi tasarlama becerisi. Mimari kaliplar, bilesen yapisi ve teknik kararlar ile saglam ve surudrülebilir sistemler tasarlar.

1. Is gereksinimlerini ve kalite ozelliklerini analiz et
2. Mimari kalıbı sec (katmanli, event-driven, CQRS, hexagonal)
3. Bilesen yapisi, bagimlilik kuralları ve iletisim kaliplarini tanimla
4. Mimari karar kayitlarini (ADR) dokumante et ve ekiple incele

**Cikti Formati:** Mimari diyagram, ADR'ler, bilesen spesifikasyonu

---

### mobile-backend

Mobil uygulama backend servisleri gelistirme becerisi. Push bildirim, cevrimdisi senkronizasyon ve mobil-spesifik API'ler ile mobil destek altyapisi kurar.

1. Mobil backend gereksinimlerini ve API kontratini tanimla
2. Mobil-optimize API'ler gelistir (sayfalama, parcali yanit)
3. Push bildirim ve cevrimdisi veri senkronizasyonu ekle
4. Mobil API versiyonlama ve geri uyumluluk stratejisini belirle

**Cikti Formati:** Mobil API'ler, push servisi, senkronizasyon mantigi

---

### task-kuyruk-sistemi

Arka plan gorev kuyrugu sistemi gelistirme becerisi. Asenkron is isleme, onceliklendirme ve yeniden deneme mekanizmalari ile guvenilir gorev isleme saglar.

1. Gorev turlerini, onceliklerini ve isleme gereksinimlerini tanimla
2. Kuyruk sistemini sec (BullMQ, Celery, SQS) ve yapilandir
3. Gorev isleyicileri gelistir, hata yonetimi ve yeniden deneme mantigi ekle
4. Kuyruk izleme, dashboard ve alarm mekanizmasi olustur

**Cikti Formati:** Kuyruk sistemi, gorev isleyiciler, izleme dashboard'u

---

### event-driven-mimari

Olay guddumlu mimari tasarlama becerisi. Olay yayinlama, abonelik ve isleme kaliplari ile gevseek bagli ve olceklenebilir sistemler olusturur.

1. Olay turlerini, sema ve olay akislarini tanimla
2. Olay altyapisini sec (Kafka, RabbitMQ, EventBridge) ve yapilandir
3. Olay uretici ve tuketici bilesenlerini gelistir
4. Olay izleme, siralama garantisi ve idempotentlik mekanizmalarini ekle

**Cikti Formati:** Olay semasi, altyapi yapilandirmasi, izleme mekanizmasi

---

### api-versiyonlama

API versiyonlama stratejisi tasarlama becerisi. Geri uyumluluk, kullanim disi birakma surecleri ve goc kilavuzlari ile surdurulebilir API evrimi saglar.

1. Versiyonlama stratejisini sec (URL, header, query param)
2. Geri uyumluluk kurallarini ve breaking change kriterlerini tanimla
3. Kullanim disi birakma sureci ve bildirim mekanizmasini olustur
4. Versiyon goc kilavuzu ve SDK guncelleme stratejisini hazirla

**Cikti Formati:** Versiyonlama kilavuzu, goc dokumani, kullanim disi birakma politikasi

---

### veritabani-replikasyonu

Veritabani replikasyon ve yuksek erisilebirlik becerisi. Master-slave, multi-master ve read replica yapilandirmalari ile veri dayanikliligi saglar.

1. Replikasyon gereksinimlerini ve topolojiyi belirle
2. Replikasyon yapilandirmasini olustur ve test et
3. Yuk dengeleme ve okuma/yazma yonlendirme mantigi kur
4. Replikasyon izleme, gecikme alarmi ve felaket kurtarma plani olustur

**Cikti Formati:** Replikasyon yapilandirmasi, izleme, felaket kurtarma plani

---

### api-gateway

API gateway tasarlama ve yapilandirma becerisi. Yonlendirme, kimlik dogrulama, rate limiting ve transformasyon ile merkezi API yonetimi saglar.

1. API gateway gereksinimlerini ve mimarisini tanimla
2. Gateway aracini sec (Kong, AWS API Gateway, nginx) ve yapilandir
3. Yonlendirme, kimlik dogrulama ve rate limiting kurallarini olustur
4. Gateway izleme, loglama ve performans optimizasyonunu tamamla

**Cikti Formati:** Gateway yapilandirmasi, yonlendirme kurallari, izleme

---

### feature-flag

Ozellik bayrak (feature flag) sistemi tasarlama becerisi. Kontrollü yayinlama, A/B test ve acil kapatma ile guvenli ozellik yonetimi saglar.

1. Feature flag aracini sec (LaunchDarkly, Unleash, ozel) ve yapilandir
2. Flag tanimlama, segmentasyon ve kurrallarini olustur
3. Kod entegrasyonunu gerceklestir ve test et
4. Flag yasam dongusu yonetimi ve temizleme politikasi olustur

**Cikti Formati:** Feature flag sistemi, entegrasyon kilavuzu, yonetim politikasi

---

### e2e-test

Uclarasi (end-to-end) test otomasyon becerisi. Kullanici senaryolarini basindan sonuna test ederek sistem butunlugunu dogrular.

1. E2E test kapsamini ve kritik kullanici yolculuklarini tanimla
2. Test aracini sec (Playwright, Cypress) ve proje yapisini olustur
3. Test senaryolarini yaz, page object modelini uygula
4. CI pipeline'ina ekle ve test kararlilligini izle

**Cikti Formati:** E2E test suite, CI yapilandirmasi, test raporu

---

### oauth-entegrasyon

OAuth 2.0 ve sosyal giris entegrasyonu becerisi. Google, GitHub, Apple giris saglayicilari ile guvenli ucuncu parti kimlik dogrulama saglar.

1. OAuth saglayicillarini ve akis turlerini belirle (authorization code, PKCE)
2. OAuth istemci yapilandirmasi ve geri donus URL'lerini ayarla
3. Token yonetimi, yenileme ve profil senkronizasyonu gelistir
4. Guvenlik testi ve hata senaryolarini dogrula

**Cikti Formati:** OAuth entegrasyonu, token yonetimi, test senaryolari

---

### rate-limiting

API rate limiting ve kotlama sistemi gelistirme becerisi. Istek siniri, pencere stratejisi ve kullanici bazli kota ile API korumasii saglar.

1. Rate limit stratejisini (sabit pencere, kayan pencere, token bucket) sec
2. Limit kurallarini endpoint ve kullanici bazli tanimla
3. Rate limiting katmanini gelistir veya yapilandir
4. Limit asimi yanitlari, baslik bilgileri ve izleme mekanizmasini ekle

**Cikti Formati:** Rate limiting yapilandirmasi, kural seti, izleme raporu

---

### ssl-tls-yapilandirma

SSL/TLS sertifika yonetimi ve yapilandirma becerisi. Sertifika temini, yenileme ve guvenlik yapilandirmasi ile sifrelenmis iletisim saglar.

1. Sertifika turunu sec (Let's Encrypt, ticari) ve temin sureci olustur
2. Web sunucu SSL yapilandirmasini olustur (nginx, Apache)
3. HSTS, sertifika sabitleme ve TLS versyon politikasini belirle
4. Otomatik yenileme ve sertifika izleme mekanizmasini kur

**Cikti Formati:** SSL yapilandirmasi, yenileme otomasyonu, guvenlik raporu

---

### multi-tenant-mimari

Cok kiraciili (multi-tenant) uygulama mimarisi tasarlama becerisi. Veri izolasyonu, kimlik yonetimi ve kiracii bazli yapilandirma ile SaaS uygulamalar olusturur.

1. Kiraciilik modelini sec (paylasilam DB, ayri sema, ayri DB)
2. Veri izolasyonu ve erisim kontrol mekanizmasini tasarla
3. Kiraci bazli yapilandirma ve ozellestirme altyapisini gelistir
4. Kiraci yonetim paneli ve izleme mekanizmasini olustur

**Cikti Formati:** Multi-tenant mimari, veri izolasyon katmani, yonetim paneli

---

### webhook-sistemi

Webhook tasarlama ve uygulama becerisi. Olay bildirimi, guvenlik dogrulama ve yeniden deneme mekanizmalari ile guvenilir webhook altyapisi olusturur.

1. Webhook olaylarini, yuk formatini ve guvenlik mekanizmasini tanimla
2. Webhook gonderim servisi, kuyruk ve yeniden deneme mantigi gelistir
3. Webhook alici dogrulama (imza, IP beyaz liste) mekanizmasi ekle
4. Webhook izleme, hata loglama ve yonetim paneli olustur

**Cikti Formati:** Webhook servisi, dokumantasyon, yonetim paneli

---

### cdn-yapilandirma

CDN yapilandirma ve optimizasyon becerisi. Statik icerik dagiitmi, onbellekleme kurallari ve guvenlik ayarlari ile hizli icerik teslimi saglar.

1. CDN saglayicisini sec (Cloudflare, CloudFront, Fastly)
2. Onbellek kurallari, TTL ve gecersiz kilma stratejisini tanimla
3. Ozel alan adi, SSL ve guvenlik ayarlarini yapilandir
4. CDN performansini izle ve isabet oranini optimize et

**Cikti Formati:** CDN yapilandirmasi, onbellek politikasi, performans raporu

---

### migration-stratejisi

Uygulama ve platform goc stratejisi tasarlama becerisi. Eski sistemden yeni sisteme guvenli ve kesintisiz gecis planlmasi yapar.

1. Mevcut sistemi analiz et, goc kapsamini ve riskleri belirle
2. Goc stratejisini sec (buyuk patlama, assamali, paralel calistirma)
3. Goc planini, zaman cizelgesini ve geri dondurme planini olustur
4. Goc oncesi test, uygulama ve son dogrulamayi tamamla

**Cikti Formati:** Goc plani, risk degerlendirmesi, test senaryolari

---

### teknik-dokumantasyon

Teknik dokumantasyon olusturma ve yonetme becerisi. Mimari belgeler, API referanslari ve gelistirici kilavuzlari ile bilgi paylasimi saglar.

1. Dokumantasyon kapsamini ve hedef okuyucuyu belirle
2. Dokumantasyon yapisini ve sablonlarini olustur
3. Icerik yaz, diyagramlar ve ornek kodlar ekle
4. Dokumantasyonu yayinla, guncelleme takvimi ve sahiplik tanimla

**Cikti Formati:** Teknik belgeler, API referansi, gelistirici kilavuzu

---

### disaster-recovery

Felaket kurtarma plani tasarlama becerisi. Yedekleme, geri yukleme ve is surekliligi stratejileri ile veri ve hizmet kaybi riskini minimize eder.

1. Kritik sistemleri, RTO ve RPO hedeflerini tanimla
2. Yedekleme stratejisi ve otomasyonunu olustur
3. Felaket senaryolari ve kurtarma prosedurlerini dokumante et
4. Felaket kurtarma tatbikati yap ve plani duzenli olarak guncelle

**Cikti Formati:** DR plani, yedekleme yapilandirmasi, tatbikat raporu

---

### load-testing

Yuk testi planlama ve yurutme becerisi. Kapasite, dayaniklilk ve stres testleri ile sistemin yuk altindaki davranisini olcer.

1. Yuk testi senaryolarini, hedef metrikleri ve kabul kriterlerini tanimla
2. Yuk testi aracini sec (k6, Locust, Artillery) ve test betiklerini yaz
3. Yuk testini calistir ve sonuclari topla
4. Sonuclari analiz et, darbogazlari belirle ve optimizasyon onerileri sun

**Cikti Formati:** Yuk testi raporu, performans metrikleri, optimizasyon onerileri

---

### error-tracking

Hata izleme sistemi kurma becerisi. Sentry, Bugsnag veya ozel cozumlerle uretim hatalarini yakalama, gruplama ve bildirim saglar.

1. Hata izleme aracini sec ve yapilandir
2. SDK entegrasyonunu ve hata raporlama kurasllarini olustur
3. Alarm kurallarini, bildirim kanallarini ve sahiplik atamasini tanimla
4. Hata onceliklendirme sureci ve cozum izleme mekanizmasini kur

**Cikti Formati:** Hata izleme yapilandirmasi, alarm kurallari, surec dokumani

---

### security-audit

Yazilim guvenlik denetimi becerisi. Kod taramasi, bagimlilik kontrolu ve penetrasyon testi ile guvenlik aciklari tespit eder ve duzeltir.

1. Guvenlik denetim kapsamini ve kontrol listesini olustur
2. Statik kod analizi ve bagimlilik guvenlik taramasini calistir
3. Gizli bilgi sizintisi ve yapilandirma hatalarini kontrol et
4. Bulguları raporla, oncelikledir ve duzeltme planini olustur

**Cikti Formati:** Guvenlik denetim raporu, bulgu listesi, duzeltme plani

---

### uygulama-olcekleme

Uygulama olcekleme stratejisi tasarlama becerisi. Yatay ve dikey olcekleme, otomatik olcekleme ve yuk dengeleme ile trafik artisina hazirlkli olmak saglar.

1. Mevcut kapasitenyi ve olcekleme ihtiyaclaarini degerlendir
2. Olcekleme stratejisini belirle (yatay, dikey, sunucusuz)
3. Otomatik olcekleme kurallarini ve yuk dengelemeyi yapilandir
4. Olcekleme testleri yap ve maliyet optimizasyonunu gerceklestir

**Cikti Formati:** Olcekleme yapilandirmasi, yuk dengeleme, maliyet analizi

---

### altyapi-kodlama

Altyapi kodu (Infrastructure as Code) ile bulut kaynaklarini yonetme becerisi. Terraform, Pulumi veya CDK ile tekrarlanabilir altyapi provizyon saglar.

1. Altyapi gereksinimlerini ve kaynak listesini tanimla
2. IaC aracini sec ve kaynak tanimlarini yaz
3. Ortam ayrimi (dev, staging, production) ve modulleme yap
4. IaC pipeline, durum yonetimi ve geri dondurme stratejisini olustur

**Cikti Formati:** IaC dosyalari, modul yapisi, pipeline yapilandirmasi

---

### veri-yedekleme

Veri yedekleme ve geri yukleme sistemi tasarlama becerisi. Otomatik yedekleme, depolama yonetimi ve geri yukleme testi ile veri guvenligi saglar.

1. Yedekleme kapsamini, sikligini ve tutma politikasini tanimla
2. Yedekleme otomasyonunu ve depolama yapilandirmasini olustur
3. Geri yukleme prosedurlerini dokumante et ve test et
4. Yedekleme izleme, alarm ve periyodik test takvimini kur

**Cikti Formati:** Yedekleme yapilandirmasi, geri yukleme proseduru, test raporu

---

### api-dokumantasyon-gelistirme

API dokumantasyon aracilari kurma ve yonetme becerisi. Swagger UI, Redoc veya ozel portal ile gelistirici dostu API belgeleri yayinlar.

1. API dokumantasyon aracini sec ve yapilandir
2. OpenAPI spesifikasyonunu olustur veya koddan uret
3. Ornek istek/yanit, kimlik dogrulama ve hata kodlarini dokumante et
4. Dokumantasyon portalini yayinla ve guncelleme sürecini otomatiklestir

**Cikti Formati:** API portali, OpenAPI spesifikasyonu, guncelleme pipeline'i

---

### dependency-yonetimi

Proje bagimlilik yonetimi becerisi. Bagimlilik guncelleme, guvenlik taramasi ve versiyon politikasi ile saglikli bagimlilik yonetimi saglar.

1. Bagimlilik envanterini cikar ve guncelleme durumunu degerlendir
2. Guvenlik acigi taramasi yap ve kritik guncellemeleri belirle
3. Bagimlilik guncelleme stratejisini ve otomasyonunu yapilandir (Dependabot, Renovate)
4. Guncelleme sonrasi test ve uyumluluk kontrolu yap

**Cikti Formati:** Bagimlilik raporu, guncelleme plani, guvenlik taramasi

---

### gelistirici-deneyimi

Gelistirici deneyimi (DX) iyilestirme becerisi. Aracc, surec ve dokumantasyon optimizasyonu ile gelistirici verimliligi ve memnuniyetini arttirir.

1. Mevcut gelistirici deneyimini degerlendir (anket, gorusme)
2. Aci noktalari ve iyilestirme firsatlarini tanimla
3. Arac, surec ve dokumantasyon iyilestirmelerini uygula
4. DX metriklerini izle ve surekli iyilestirme dongusu olustur

**Cikti Formati:** DX degerlendirme raporu, iyilestirme plani, metrik tablosu

---

### grpc-gelistirme

gRPC servis gelistirme becerisi. Protocol Buffer tanimlari, streaming ve hata yonetimi ile yuksek performansli RPC servisleri olusturur.

1. Servis tanimlarini .proto dosyasinda olustur
2. Sunucu ve istemci kodunu uret ve is mantigi ekle
3. Streaming (unary, server, client, bidirectional) kaliplarini uygula
4. gRPC interceptor, hata yonetimi ve izleme mekanizmasini ekle

**Cikti Formati:** Proto dosyalari, servis uygulamasi, istemci SDK

---

### graphql-subscription

GraphQL subscription ve gercek zamanli veri akisi gelistirme becerisi. WebSocket tabanli abonelikler ile canli veri guncelemeleri saglar.

1. Subscription turlerini ve olay tetikleyicilerini tanimla
2. Subscription resolver ve pub/sub mekanizmasini gelistir
3. WebSocket baglanti yonetimi ve kimlik dogrulama ekle
4. Subscription performans testi ve izleme mekanizmasini kur

**Cikti Formati:** Subscription semasi, pub/sub yapilandirmasi, test suite

---

### cqrs-mimari

CQRS (Command Query Responsibility Segregation) mimari kalibini uygulama becerisi. Okuma ve yazma islemlerini ayirarak olceklenebilirlik ve performans saglar.

1. Komut ve sorgu modellerini tanimla ve ayir
2. Komut isleyicilerini ve olay kaynaklarini gelistir
3. Okuma modellerini ve projeksiyon mekanizmasini olustur
4. Nihai tutarlilik ve olay deposu stratejisini yapilandir

**Cikti Formati:** CQRS mimari uygulamasi, olay deposu, okuma modeli

---

### saga-pattern

Dagitik islem yonetimi icin Saga kalibini uygulama becerisi. Mikro servisler arasi tutarlilik ve telafi islemleri ile veri butunlugu saglar.

1. Saga akisini ve katilimci servisleri tanimla
2. Telafi islemlerini (compensating transactions) tasarla
3. Saga orkestrator veya koreografi modelini uygula
4. Saga izleme, zaman asimi ve hata senaryolarini test et

**Cikti Formati:** Saga akis diyagrami, telafi mantigi, izleme mekanizmasi

---

### full-text-search

Tam metin arama sistemi gelistirme becerisi. Indeksleme, tokenizasyon ve relevans puanlama ile gelismis metin arama yetenklerli saglar.

1. Arama gereksinimlerini ve metin isleme pipeline'ini tanimla
2. Indeks yapisini, analizor ve tokenizer yapilandirmasini olustur
3. Arama sorgusu, filtreleme ve vurgulama ozelliklerini gelistir
4. Arama kalitesini olc ve relevans ayarlamasini optimize et

**Cikti Formati:** Arama sistemi, indeks yapilandirmasi, relevans metrikleri

---

### idempotentlik-tasarimi

API ve islem idempotentligi tasarlama becerisi. Tekrarlanan isteklerin guvenli sekilde islenmesini saglayarak veri tutarliligi korur.

1. Idempotentlik gerektiren islemleri ve API endpoint'leri belirle
2. Idempotentlik anahtari ve depolama mekanizmasini tasarla
3. Cift islem onleme ve tekrar deneme mantigi gelistir
4. Idempotentlik testleri yaz ve edge case senaryolarini dogrula

**Cikti Formati:** Idempotentlik katmani, test suite, tasarim dokumani

---

### circuit-breaker

Circuit breaker kalibini uygulama becerisi. Hata toleransi, gecici devre kesme ve otomatik kurtarma ile dayanikli servis cagrilari saglar.

1. Circuit breaker gereksinimlerini ve eisk degerlerini tanimla
2. Circuit breaker katmanini gelistir (acik, kapali, yari-acik durumlari)
3. Geri donus (fallback) stratejilerini tanimla ve uygula
4. Circuit breaker durumlarini izle ve alarm mekanizmasini kur

**Cikti Formati:** Circuit breaker uygulamasi, izleme dashboard'u, fallback mantigi

---

### database-connection-pooling

Veritabani baglanti havuzu yonetimi becerisi. Baglanti sayisi, zaman asimi ve saglik kontrolu ayarlariyla veritabani performansini optimize eder.

1. Baglanti havuzu gereksinimlerini ve mevcut kullanimi analiz et
2. Havuz boyutu, zaman asimi ve beklemem suresi parametrelerini ayarla
3. Baglanti saglik kontrolu ve otomatik yenileme mekanizmasini yapilandir
4. Baglanti havuzu metriklerini izle ve darbogazlari optimize et

**Cikti Formati:** Havuz yapilandirmasi, izleme metrikleri, optimizasyon raporu

---

### blue-green-deployment

Blue-green dagitim stratejisi uygulama becerisi. Sifir kesinti ile uretim guncellemesi ve aninda geri dondurme yetenlegi saglar.

1. Blue-green dagitim altyapisini tasarla
2. Trafik yonlendirme ve ortam gecis mekanizmasini yapilandir
3. Saglik kontrolu ve otomatik geri dondurme kurallarini olustur
4. Dagitim surecini test et ve operasyon kilavuzunu hazirla

**Cikti Formati:** Dagitim yapilandirmasi, trafik yonetimi, operasyon kilavuzu

---

### canary-release

Canary surum stratejisi uygulama becerisi. Kademeli trafik yonlendirme ve metrik izleme ile dusuk riskli uretim guncellemeleri saglar.

1. Canary surum stratejisini ve trafik yuzdesini tanimla
2. Kademeli trafik yonlendirme ve metrik izleme mekanizmasini kur
3. Basari kriterlerini ve otomatik geri dondurme kurallarini belirle
4. Canary sureci test et ve operasyon prosedurunu dokumante et

**Cikti Formati:** Canary yapilandirmasi, izleme metrikleri, prosedur dokumani

---

### tasarim-kaliplari-olusum
Creational tasarim kaliplarini uygulama becerisi. Factory Method, Abstract Factory, Builder, Singleton ve Prototype kaliplarini projede dogru yerlerde kullanmayi saglar.

1. Mevcut kodda nesne olusturma noktalarini tespit et
2. Uygun olusum kalibini sec (Factory, Builder, Singleton vb.)
3. Kalibi proje stiline uygun uygula, testlerini yaz
4. Kullanim orneklerini ve ne zaman tercih edilecegini belgele

**Cikti Formati:** Kalip uygulamasi, kullanim ornekleri, test dosyasi

---

### tasarim-kaliplari-yapisal
Structural tasarim kaliplarini uygulama becerisi. Adapter, Bridge, Composite, Decorator, Facade, Proxy kaliplarini var olan sistemlere entegre etmeyi saglar.

1. Yapisal sorunlari tespit et (uyumsuz arayuzler, karmasik alt sistemler)
2. Uygun yapisal kalibi sec ve trade-off analizini yap
3. Kalibi kademeli olarak uygula, mevcut testleri koruyarak
4. Entegrasyon orneklerini ve sinirlamalarini belgele

**Cikti Formati:** Kalip uygulamasi, entegrasyon kilavuzu, test

---

### tasarim-kaliplari-davranissal
Behavioral tasarim kaliplarini uygulama becerisi. Observer, Strategy, Command, State, Chain of Responsibility kaliplarini is mantigi icin kullanmayi saglar.

1. Karmasik kosul/durum yonetimi noktalarini tespit et
2. Uygun davranissal kalibi sec (Strategy, State, Observer vb.)
3. Kalibi uygula, eski kodu kademeli olarak refactor et
4. Genisletme noktalarini ve kullanim senaryolarini belgele

**Cikti Formati:** Kalip uygulamasi, genisletme kilavuzu, test

---

### ddd-tasarim
Domain-Driven Design kaliplarini uygulama becerisi. Aggregate, Entity, Value Object, Domain Event, Repository, Bounded Context kaliplarini is alanina uygun modellemede kullanir.

1. Is alanini bounded context'lere ayir, ubiquitous language olustur
2. Aggregate, Entity ve Value Object sinirlarini belirle
3. Domain Event ve Repository kaliplarini uygula
4. Context map olustur, anti-corruption layer'lari tanimla

**Cikti Formati:** Domain modeli, context map, aggregate tanimlari

---

### clean-architecture
Clean Architecture / Hexagonal Architecture uygulama becerisi. Katmanli mimari ile is mantigini altyapidan izole eder, test edilebilirligi arttirir.

1. Mevcut kodun bagimlilik yonunu analiz et
2. Domain, uygulama, altyapi ve sunum katmanlarini tanimla
3. Port ve adapter'lari olustur, bagimliliklari iceriden disariya cevir
4. Her katman icin test stratejisi belirle

**Cikti Formati:** Katman yapisi, port/adapter tanimlari, bagimlilik diyagrami

---

### kod-kokusu-tespiti
Sistematik kod kokusu tespit ve duzeltme becerisi. Martin Fowler'in katalogunu temel alarak uzun metod, buyuk sinif, kiskanclik gibi kokulari tespit eder.

1. Hedef kod uzerinde metrik analizi yap (satir sayisi, karmasiklik, bagimlilik)
2. Kod kokusu turunu belirle (Long Method, God Class, Feature Envy, Data Clumps vb.)
3. Uygun refactoring teknigini sec ve adim adim plan olustur
4. Her adimda testlerin gectigini dogrulayarak degisikligi uygula

**Cikti Formati:** Kod kokusu raporu, refactoring plani, once/sonra ornekleri

---

### guard-clause-refactoring
Guard clause ile ic ice kosul sadselestirme becerisi. Derin nesting'i early return kaliplariyla okunabilir hale getirir.

1. 3+ seviye ic ice kosul iceren fonksiyonlari tespit et
2. Her dallanma icin guard clause donusumu planla
3. Guard clause'lari sirali uygula, her adimda test et
4. Okunabilirlik iyilesmesini karsilastir

**Cikti Formati:** Refactor edilmis kod, once/sonra karsilastirma

---

### retry-ve-dayaniklilik
Retry, circuit breaker ve graceful degradation kaliplarini uygulama becerisi. Dagilmis sistemlerde hata toleransini arttirir.

1. Dis bagimlilik noktalarini ve hata modlarini tespit et
2. Her nokta icin strateji sec (retry with backoff, circuit breaker, bulkhead, fallback)
3. Konfigur  asyon parametrelerini belirle (timeout, retry sayisi, acik/kapali esik)
4. Izleme ve alarm entegrasyonunu kur, yuk altinda test et

**Cikti Formati:** Dayaniklilik yapilandirmasi, hata senaryolari, izleme metrikleri

---

### veritabani-sharding
Veritabani sharding stratejisi tasarlama becerisi. Buyuk veri setlerini yatay bolumleyerek olceklendirir.

1. Veri erisim kaliplarini ve hacmini analiz et
2. Shard anahtarini sec (tenant_id, region, hash vb.)
3. Sharding stratejisini belirle (range, hash, directory-based)
4. Cross-shard sorgular icin cozum ve migration planini hazirla

**Cikti Formati:** Sharding stratejisi, shard haritasi, migration plani

---

### event-sourcing-uygulama
Event sourcing mimarisini uygulama becerisi. Durum degisikliklerini olay akisi olarak kaydeder, zaman yolculugu ve denetim izi saglar.

1. Hangi aggregate'larin event sourcing'e uygun oldugunu belirle
2. Event store yapisini tanimla (event tipi, payload, versiyon)
3. Projection/read model olusturma mekanizmasini kur
4. Snapshot stratejisi ve olay evrimini (event versioning) planla

**Cikti Formati:** Event store semasi, projection tanimlari, snapshot stratejisi

---

### gozlemlenebilirlik-mimari
Metrics, traces ve logs'un korelasyonuyla tam gozlemlenebilirlik mimarisi kurma becerisi.

1. Uygulama icin 3 sutun'u tanimla: metrikler (Prometheus), izler (OpenTelemetry), loglar (ELK/Loki)
2. Enstrumantasyon stratejisi belirle (otomatik vs manuel)
3. Korelasyon kimligini (trace_id) tum katmanlarda tasima mekanizmasini kur
4. Dashboard, alarm kurallari ve runbook'lari olustur

**Cikti Formati:** Gozlemlenebilirlik mimarisi, dashboard tanimlari, alarm kurallari

---

### contract-testing
API sozlesme testi uygulama becerisi. Servisler arasi sozlesme uyumunu surekli dogrular, kirilma degisikliklerini erken yakalar.

1. Tuketici (consumer) ve saglayici (provider) servislerini belirle
2. Sozlesme tanimlarini yaz (Pact, Spring Cloud Contract vb.)
3. CI/CD pipeline'a sozlesme testlerini entegre et
4. Sozlesme kirilma durumunda alarm ve engelleme mekanizmasini kur

**Cikti Formati:** Sozlesme tanimlari, CI entegrasyonu, kirilma alarm yapilandirmasi

---

### mutation-testing
Mutation testing ile test kalitesini olcme becerisi. Testlerin gercekten hata yakalayip yakalamadini dogrular.

1. Mutation testing aracini kur (Stryker, PITest, mutmut vb.)
2. Kritik is mantigi modulleri icin mutation testlerini calistir
3. Hayatta kalan mutantlari analiz et (zayif test bolgeleri)
4. Eksik test senaryolarini ekle, mutation skor hedefini belirle

**Cikti Formati:** Mutation skoru raporu, zayif bolgeler, eklenen test listesi

---

### zero-downtime-deployment
Sifir kesinti ile dagitim stratejileri uygulama becerisi. Blue-green, canary, rolling update kaliplarini kapsar.

1. Mevcut dagitim surecini ve kesinti risklerini analiz et
2. Uygun strateji sec (blue-green, canary, rolling) ve altyapi gereksinimlerini belirle
3. Veritabani migrasyonlarini geriye uyumlu yapma planini olustur
4. Geri alma (rollback) prosedurunu olustur ve tatbikat yap

**Cikti Formati:** Dagitim stratejisi, rollback proseduru, kontrol listesi

---

### secret-management
Gizli bilgi yonetimi becerisi. API anahtarlari, sertifikalar ve parolalarin guvenli depolanmasi, dagitilmasi ve rotasyonunu kapsar.

1. Mevcut gizli bilgi kaynaklarini ve erisim noktalarini envanterle
2. Secret yonetim aracini sec (Vault, AWS Secrets Manager, doppler vb.)
3. Rotasyon politikasi ve otomatik rotasyon mekanizmasini kur
4. Erisim denetimi, audit log ve acil durum prosedurunu olustur

**Cikti Formati:** Secret envanteri, rotasyon politikasi, erisim matrisi, acil durum proseduru

---

### kod-uretimi-openapi
OpenAPI/Swagger semasindan kod uretimi becerisi. API istemci ve sunucu stublari, tip tanimlari ve validator'lar uretir.

1. OpenAPI semasini dogrula ve eksik tanimlari tamamla
2. Kod uretim aracini sec (openapi-generator, swagger-codegen, orval vb.)
3. Uretilen kodu proje stiline uyarlama konfigurasyonunu olustur
4. CI pipeline'a sema degisikliginde otomatik yeniden uretim adimi ekle

**Cikti Formati:** Kod uretim konfigurasyonu, uretilen dosya listesi, CI entegrasyonu

---

### adr-yazimi
Architecture Decision Record yazma becerisi. Onemli teknik kararlari baglamlari ve alternatifleriyle birlikte belgeler.

1. Karar baglamini ve kisitlamalari tanimla
2. En az 3 alternatif belirle, her birinin artilerini/eksilerini analiz et
3. ADR formatinda (baglam, karar, alternatifler, sonuclar) belgele
4. Iliskili ADR'lere capraz referans ekle, indeksi guncelle

**Cikti Formati:** ADR belgesi, alternatif analizi, indeks guncellemesi

---

### postmortem-yazimi
Olay sonrasi analiz raporu yazma becerisi. Suclamayan, ogrenme odakli dil ile kok neden analizi ve aksiyon maddelerini belgeler.

1. Olay zaman cizelgesini dakika dakika olustur
2. 5 Neden teknigi ile kok neden analizini yap
3. Iyi giden/kotu giden/sansli olan analizini tamamla
4. Somut aksiyon maddelerini sahip ve tarihle birlikte belgele

**Cikti Formati:** Post-mortem raporu, zaman cizelgesi, aksiyon listesi

---

### runbook-olusturma
Operasyonel runbook yazma becerisi. Tekrarlayan operasyon gorevleri ve olay mudahalesi icin adim adim kilavuzlar olusturur.

1. Operasyon senaryosunu ve tetikleyicisini tanimla
2. Adim adim proseduru yaz (her adimda beklenen cikti ve hata durumu)
3. Eskalasyon yolunu ve iletisim listesini ekle
4. Runbook'u test ortaminda tatbikat et ve guncellik takvimini belirle

**Cikti Formati:** Runbook belgesi, eskalasyon matrisi, tatbikat kaydi
