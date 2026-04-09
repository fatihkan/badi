.PHONY: help install test test-watch lint lint-fix format format-check check clean pack init doctor list

help: ## Bu yardim mesajini goster
	@echo ""
	@echo "  Badi - Claude Code Is Akisi Yonetim Sistemi"
	@echo ""
	@echo "  Kullanim: make <hedef>"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

install: ## Bagimliliklari yukle
	npm install

test: ## Testleri calistir
	npm test

test-watch: ## Testleri izleme modunda calistir
	npm run test:watch

lint: ## Kod kalitesini kontrol et
	npm run lint

lint-fix: ## Kod kalite sorunlarini duzelt
	npm run lint:fix

format: ## Kodu formatla
	npm run format

format-check: ## Format kontrolu yap
	npm run format:check

check: ## Tam dogrulama (lint + format + markdown)
	npm run check

clean: ## node_modules ve kilit dosyalarini temizle
	rm -rf node_modules package-lock.json bun.lock

pack: ## npm paket icerigini onizle
	npm pack --dry-run

init: ## Kuru calistirma ile baslatma onizlemesi
	node bin/badi.js init --dry-run

doctor: ## Badi kurulumunu dogrula
	node bin/badi.js doctor

list: ## Mevcut bilesenleri listele
	node bin/badi.js list
