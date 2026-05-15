Dockerfile best practice kontrolu. Guvenlik, boyut, reproducibility uyarilari.

# Gerekli Araclar
- Bash (badi dev docker-lint)

# Prosedur

### Adim 1: Kontrol
```bash
badi dev docker-lint
```

### Adim 2: Kontrol Edilenler

**FROM:**
- `:latest` yerine versiyon sabitleme (guvenlik + reproducibility)
- Alpine/distroless tercihi onerisi

**USER:**
- USER direktifi yoksa root olarak calisir (guvenlik riski)
- Non-root user olusturulmasi onerilir

**HEALTHCHECK:**
- Orchestration icin zorunlu
- HTTP endpoint veya komut

**RUN apt-get:**
- `update` + `install` ayni RUN'da (cache busting)
- `--no-install-recommends` (boyut)
- `rm -rf /var/lib/apt/lists/*` (temizlik)

**ADD vs COPY:**
- ADD tar ozelligi harici kullanilmamali
- Local dosyalar icin COPY

**Izinler:**
- `chmod 777` yasak
- 755 veya daha sıkı

**Port:**
- EXPOSE < 1024 root gerektirir

**.dockerignore:**
- Mevcut olmali (node_modules, .git vs)

### Adim 3: Ileri Araclar

Detayli analiz icin:
```bash
brew install hadolint
hadolint Dockerfile
```

### Adim 4: Yaygin Fix'ler

```dockerfile
# ONCE
FROM node:latest
RUN apt-get update
RUN apt-get install -y python3

# SONRA
FROM node:20-alpine
RUN apt-get update && apt-get install -y --no-install-recommends python3 \
    && rm -rf /var/lib/apt/lists/*
USER node
HEALTHCHECK --interval=30s CMD curl -f http://localhost:3000/health || exit 1
```

# Ornek

```
/docker-lint
```
