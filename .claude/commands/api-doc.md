API dokumantasyonu olusturma. Route tanimlarini tarar ve yapilandirilmis API belgeleri uretir.

# Gerekli Araclar
- Bash (dosya sistemi islemleri)
- Read (kaynak kod dosyalari)
- Grep (route ve endpoint taramasi)
- Glob (dosya tespiti)
- Write (dokumantasyon dosyasi olusturma)
- Agent (api-designer: detayli API tasarim analizi)

# Ajan Delegasyonu
Bu komut ana analiz isini api-designer ajanina devreder.
Ajan bulunamazsa, asagidaki adimlari dogrudan uygula.

---

## Adim 1: Framework Tespiti

### 1a: Proje Yapisini Tara
- `package.json` icinde framework bagimliligini kontrol et
- Desteklenen frameworkler:
  - Express.js: `express` paketi, `app.get/post/put/delete` kaliplari
  - Fastify: `fastify` paketi, `fastify.route` kaliplari
  - NestJS: `@nestjs/core`, `@Controller`, `@Get/@Post` dekoratöleri
  - Koa: `koa-router`, `router.get/post` kaliplari
  - Next.js API: `pages/api/` veya `app/api/` dizin yapisi
  - Django/Flask/FastAPI: Python web frameworkleri

### 1b: Route Dosyalarini Bul
- Framework'e gore tipik route dosya konumlarini tara
- `routes/`, `controllers/`, `api/`, `endpoints/` dizinlerini kontrol et
- Middleware dosyalarini tespit et

---

## Adim 2: Endpoint Cikartma

### 2a: Route Tanimlrini Tara
Framework'e uygun kaliplari grep ile ara:
- Express: `router\.(get|post|put|patch|delete)\(`
- NestJS: `@(Get|Post|Put|Patch|Delete)\(`
- Next.js: `export (async )?function (GET|POST|PUT|DELETE)`
- Her esleme icin dosya yolu, satir numarasi ve tam route ifadesini kaydet

### 2b: Endpoint Bilgisi Cikart
Her endpoint icin asagidaki bilgileri topla:
- HTTP metodu (GET, POST, PUT, PATCH, DELETE)
- URL yolu (path parametreleri dahil)
- Middleware zincirleri (auth, validation, rate-limit)
- Controller fonksiyon adi

### 2c: Parametre Analizi
- URL parametreleri: `:id`, `[slug]` gibi dinamik segmentler
- Query parametreleri: koddan cikartilan sorgu parametreleri
- Request body: TypeScript tip tanimlari, Zod semalari, Joi dogrulamalari
- Baslik (header) gereksinimleri: Authorization, Content-Type, vb.

---

## Adim 3: Yanit Sekilleri

### 3a: Yanit Tipi Tespiti
- TypeScript interface/type tanimlarini bul
- DTO (Data Transfer Object) siniflarini tara
- Ornek yanit nesnelerini koddan cikar
- Hata yanit formatlarini tespit et

### 3b: Durum Kodlari
- Her endpoint'in dondurdugu HTTP durum kodlarini belirle
- Basarili yanitlar: 200, 201, 204
- Hata yanitlari: 400, 401, 403, 404, 500
- Ozel hata yanitlari varsa ekle

---

## Adim 4: OpenAPI/Swagger Iskeleti

### 4a: OpenAPI 3.0 Yapisi Olustur
```yaml
openapi: "3.0.0"
info:
  title: "[Proje Adi] API"
  version: "[surum]"
  description: "[aciklama]"
paths:
  /api/[kaynak]:
    get:
      summary: "[aciklama]"
      parameters: [...]
      responses:
        "200":
          description: "[aciklama]"
          content:
            application/json:
              schema: [...]
```

### 4b: Sema Tanimlari
- Tespit edilen veri modelleri icin OpenAPI sema olustur
- `$ref` ile tekrar kullanilabilir sema referanslari yap
- Enum degerlerini belirle ve ekle

---

## Adim 5: Belgelenmemis Endpoint Tespiti

### 5a: Mevcut Dokumantasyonla Karsilastir
- Mevcut API dokumantasyonu dosyasini ara (eger varsa)
- Swagger/OpenAPI dosyasi mevcutsa oku
- README icindeki API bolumlerini kontrol et

### 5b: Eksik Belge Raporu
- Belgelenmemis endpoint'leri listele
- Eksik parametre aciklamalarini isaretl
- Yanit ornegi olmayan endpoint'leri belirt

---

## Adim 6: Cikti Olustur

### 6a: Markdown API Dokumantasyonu
Her endpoint icin:
```markdown
## [HTTP Metodu] [Yol]
[Aciklama]

**Yetkilendirme:** [Gerekli/Gereksiz] [Tip]

**Parametreler:**
| Isim | Konum | Tip | Zorunlu | Aciklama |
|------|--------|-----|---------|----------|
| id   | path   | string | Evet | Kaynak kimlik numarasi |

**Istek Govdesi:**
```json
{ "alan": "tip - aciklama" }
```

**Basarili Yanit (200):**
```json
{ "ornek": "yanit" }
```

**Hata Yanitlari:**
- `401` - Yetkilendirme hatasi
- `404` - Kaynak bulunamadi
```

### 6b: OpenAPI YAML (Istege Bagli)
- Kullaniciya sor: "OpenAPI YAML dosyasi da olusturayim mi?"
- Onay alinirsa `openapi.yaml` dosyasini yaz
- Dogrulama: Olusturulan YAML'in gecerli oldugunu kontrol et

### 6c: Ozet Rapor
```
=== API DOKUMANTASYON OZETI ===
Framework: [tespit edilen framework]
Toplam Endpoint: [sayi]
  GET:    [sayi]
  POST:   [sayi]
  PUT:    [sayi]
  DELETE: [sayi]
Belgelenmemis: [sayi] endpoint
Dosyalar: [olusturulan dosya listesi]
===============================
```
