API documentation generation. Scans route definitions and produces structured API docs.

# Gerekli Araclar
- Bash (dosya sistemi) -- Read (kaynak kod) -- Grep (route/endpoint) -- Glob (dosya tespiti) -- Write (dok dosyasi) -- Agent (api-designer: detayli API analiz)

# Ajan Delegasyonu
Ana is api-designer ajanina devredilir. Ajan yoksa asagidaki adimlari dogrudan uygula.

## 1. Framework Tespiti
**1a — Proje yapisi:** `package.json` framework bagimliligi -- desteklenen: Express (`express`, `app.get/post/put/delete`), Fastify (`fastify`, `fastify.route`), NestJS (`@nestjs/core`, `@Controller`, `@Get/@Post`), Koa (`koa-router`, `router.get/post`), Next.js API (`pages/api/` veya `app/api/`), Django/Flask/FastAPI

**1b — Route dosyalari:** framework'e gore tipik konumlar -- `routes/`, `controllers/`, `api/`, `endpoints/` -- middleware dosyalari

## 2. Endpoint Cikartma
**2a — Route taramasi (grep):**
- Express: `router\.(get|post|put|patch|delete)\(`
- NestJS: `@(Get|Post|Put|Patch|Delete)\(`
- Next.js: `export (async )?function (GET|POST|PUT|DELETE)`
- Her esleme: dosya yolu + satir no + tam route ifadesi

**2b — Endpoint bilgisi:** HTTP metod (GET/POST/PUT/PATCH/DELETE) -- URL yolu (path parametre dahil) -- middleware zinciri (auth, validation, rate-limit) -- controller fonksiyon adi

**2c — Parametre:** URL (`:id`, `[slug]`) -- query (koddan cikar) -- body (TS tip, Zod, Joi) -- header (Authorization, Content-Type, vb.)

## 3. Yanit Sekilleri
**3a — Tip tespiti:** TS interface/type -- DTO siniflari -- ornek yanit nesneleri -- hata yanit formati

**3b — Durum kodlari:** her endpoint'in dondurdugu HTTP kodlari -- basarili (200, 201, 204) -- hata (400, 401, 403, 404, 500) -- ozel hata yanitlari

## 4. OpenAPI/Swagger Iskeleti
**4a — OpenAPI 3.0:**
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

**4b — Sema:** tespit edilen modeller icin OpenAPI sema -- `$ref` ile tekrar kullanilabilir -- enum degerleri

## 5. Belgelenmemis Endpoint
**5a — Mevcut dok karsilastir:** mevcut API dok dosyasi -- Swagger/OpenAPI dosyasi -- README API bolumleri

**5b — Eksik rapor:** belgelenmemis endpoint listesi -- eksik parametre aciklamasi -- yanit ornegi olmayan endpoint

## 6. Cikti
**6a — Markdown:**
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

**6b — OpenAPI YAML (istege bagli):** kullaniciya sor -- onayla `openapi.yaml` yaz -- gecerlilik dogrula

**6c — Ozet rapor:**
```
=== API DOKUMANTASYON OZETI ===
Framework: [tespit]
Toplam Endpoint: [sayi]
  GET/POST/PUT/DELETE: [sayilar]
Belgelenmemis: [sayi]
Dosyalar: [olusturulan liste]
===============================
```
