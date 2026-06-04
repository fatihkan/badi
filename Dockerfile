FROM node:20-slim

WORKDIR /app

COPY . .

RUN npm install -g .

LABEL org.opencontainers.image.source="https://github.com/fatihkan/badi"
LABEL org.opencontainers.image.description="Badi CLI and project template package"
LABEL org.opencontainers.image.licenses="MIT"

ENTRYPOINT ["badi"]
