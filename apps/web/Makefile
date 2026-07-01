# @virtualshop/web — Makefile local (wrapper liviano).
SHELL := /bin/bash
.ONESHELL:
.SHELLFLAGS := -eu -o pipefail -c
MAKEFLAGS += --no-print-directory
.DEFAULT_GOAL := help

.PHONY: help dev build preview typecheck env

help: ## Muestra esta ayuda
	grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

env: ## Crea .env a partir de .env.example si no existe
	test -f .env || cp .env.example .env

dev: env ## Levanta vite dev (:5173)
	pnpm dev

build: ## Compila para producción (dist/)
	pnpm build

preview: build ## Compila y sirve el build de producción localmente
	pnpm preview

typecheck: ## tsc --noEmit
	pnpm typecheck
