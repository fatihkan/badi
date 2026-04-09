FROM node:20-slim

WORKDIR /app

COPY . .

RUN npm install -g .

LABEL org.opencontainers.image.source="https://github.com/fatihkan/badi"
LABEL org.opencontainers.image.description="Badi CLI ve proje sablon paketi"
LABEL org.opencontainers.image.licenses="MIT"

ENTRYPOINT ["badi"]
