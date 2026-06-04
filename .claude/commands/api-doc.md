API documentation generation. Scans route definitions and produces structured API docs.

# Required Tools
- Bash (filesystem) -- Read (source code) -- Grep (routes/endpoints) -- Glob (file detection) -- Write (doc file) -- Agent (api-designer: detailed API analysis)

# Agent Delegation
The main work is delegated to the api-designer agent. If the agent is unavailable, apply the steps below directly.

## 1. Framework Detection
**1a — Project structure:** `package.json` framework dependency -- supported: Express (`express`, `app.get/post/put/delete`), Fastify (`fastify`, `fastify.route`), NestJS (`@nestjs/core`, `@Controller`, `@Get/@Post`), Koa (`koa-router`, `router.get/post`), Next.js API (`pages/api/` or `app/api/`), Django/Flask/FastAPI

**1b — Route files:** typical locations per framework -- `routes/`, `controllers/`, `api/`, `endpoints/` -- middleware files

## 2. Endpoint Extraction
**2a — Route scan (grep):**
- Express: `router\.(get|post|put|patch|delete)\(`
- NestJS: `@(Get|Post|Put|Patch|Delete)\(`
- Next.js: `export (async )?function (GET|POST|PUT|DELETE)`
- Per match: file path + line number + the full route expression

**2b — Endpoint info:** HTTP method (GET/POST/PUT/PATCH/DELETE) -- URL path (including path params) -- middleware chain (auth, validation, rate-limit) -- controller function name

**2c — Parameters:** URL (`:id`, `[slug]`) -- query (extract from code) -- body (TS types, Zod, Joi) -- headers (Authorization, Content-Type, etc.)

## 3. Response Shapes
**3a — Type detection:** TS interfaces/types -- DTO classes -- sample response objects -- error response format

**3b — Status codes:** the HTTP codes each endpoint returns -- success (200, 201, 204) -- errors (400, 401, 403, 404, 500) -- custom error responses

## 4. OpenAPI/Swagger Skeleton
**4a — OpenAPI 3.0:**
```yaml
openapi: "3.0.0"
info:
  title: "[Project Name] API"
  version: "[version]"
  description: "[description]"
paths:
  /api/[resource]:
    get:
      summary: "[description]"
      parameters: [...]
      responses:
        "200":
          description: "[description]"
          content:
            application/json:
              schema: [...]
```

**4b — Schemas:** OpenAPI schemas for the detected models -- reusable via `$ref` -- enum values

## 5. Undocumented Endpoints
**5a — Compare with existing docs:** the existing API doc file -- a Swagger/OpenAPI file -- README API sections

**5b — Gap report:** undocumented endpoint list -- missing parameter descriptions -- endpoints without response examples

## 6. Output
**6a — Markdown:**
```markdown
## [HTTP Method] [Path]
[Description]

**Authorization:** [Required/Not required] [Type]

**Parameters:**
| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| id   | path | string | Yes | The resource identifier |

**Request Body:**
```json
{ "field": "type - description" }
```

**Success Response (200):**
```json
{ "example": "response" }
```

**Error Responses:**
- `401` - Authorization error
- `404` - Resource not found
```

**6b — OpenAPI YAML (optional):** ask the user -- on approval write `openapi.yaml` -- validate it

**6c — Summary report:**
```
=== API DOCUMENTATION SUMMARY ===
Framework: [detected]
Total Endpoints: [count]
  GET/POST/PUT/DELETE: [counts]
Undocumented: [count]
Files: [created list]
===============================
```
