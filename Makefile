.PHONY: help install test test-watch lint lint-fix format format-check check clean pack init doctor list

help: ## Show this help message
	@echo ""
	@echo "  Badi - Claude Code Workflow Management System"
	@echo ""
	@echo "  Usage: make <target>"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

install: ## Install dependencies
	npm install

test: ## Run the tests
	npm test

test-watch: ## Run the tests in watch mode
	npm run test:watch

lint: ## Check code quality
	npm run lint

lint-fix: ## Fix code quality issues
	npm run lint:fix

format: ## Format the code
	npm run format

format-check: ## Check formatting
	npm run format:check

check: ## Full validation (lint + format + markdown)
	npm run check

clean: ## Remove node_modules and lock files
	rm -rf node_modules package-lock.json bun.lock

pack: ## Preview the npm package contents
	npm pack --dry-run

init: ## Preview initialization with a dry run
	node bin/badi.js init --dry-run

doctor: ## Validate the Badi installation
	node bin/badi.js doctor

list: ## List available components
	node bin/badi.js list
