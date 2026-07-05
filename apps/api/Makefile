# @virtualshop/api — Makefile local (wrapper liviano).
# Si estás parado en la raíz del monorepo, usá el Makefile raíz en su lugar
# (make api, make db-migrate-local, etc.) — este es para cuando tu editor
# móvil solo tiene abierta esta carpeta.

SHELL := /bin/bash
.ONESHELL:
.SHELLFLAGS := -eu -o pipefail -c
MAKEFLAGS += --no-print-directory

.DEFAULT_GOAL := help

.PHONY: help dev deploy migrate-local seed-local migrate-remote create-owner create-owner-remote cf-login db-create r2-create secrets typecheck

help: ## Muestra esta ayuda
	grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'

dev: migrate-local ## Aplica migraciones locales y levanta wrangler dev (:8787)
	pnpm dev

typecheck: ## tsc --noEmit
	pnpm typecheck

migrate-local: ## Aplica las migraciones de D1 en local
	pnpm wrangler d1 migrations apply virtualshop-db --local

seed-local: ## Carga datos de ejemplo en D1 local
	pnpm wrangler d1 execute virtualshop-db --local --file=./seed.sql

create-owner: ## Uso: make create-owner EMAIL=x PASSWORD=y NAME="Z"
	test -n "$(EMAIL)" && test -n "$(PASSWORD)" && test -n "$(NAME)" || { echo 'Uso: make create-owner EMAIL=owner@x.com PASSWORD=algo NAME="Nombre"'; exit 1; }
	SQL=$$(pnpm exec tsx scripts/create-owner.ts "$(EMAIL)" "$(PASSWORD)" "$(NAME)" | tail -1)
	pnpm wrangler d1 execute virtualshop-db --local --command "$$SQL"

cf-login: ## Inicia sesión en Cloudflare
	pnpm wrangler login

db-create: ## Crea la D1 de producción "jaw-project" (si no existe; el id va en [env.production] de wrangler.toml)
	pnpm wrangler d1 create jaw-project

r2-create: ## Crea el bucket R2 de producción "jaw-project" (si no existe)
	pnpm wrangler r2 bucket create jaw-project

secrets: ## Configura JWT_SECRET de producción
	pnpm wrangler secret put JWT_SECRET --env production

migrate-remote: ## Aplica migraciones en D1 de producción (jaw-project)
	pnpm wrangler d1 migrations apply jaw-project --env production --remote

create-owner-remote: ## Uso: make create-owner-remote EMAIL=x PASSWORD=y NAME="Z"
	test -n "$(EMAIL)" && test -n "$(PASSWORD)" && test -n "$(NAME)" || { echo 'Uso: make create-owner-remote EMAIL=owner@x.com PASSWORD=algo NAME="Nombre"'; exit 1; }
	SQL=$$(pnpm exec tsx scripts/create-owner.ts "$(EMAIL)" "$(PASSWORD)" "$(NAME)" | tail -1)
	pnpm wrangler d1 execute jaw-project --env production --remote --command "$$SQL"

deploy: ## Despliega el Worker de producción a Cloudflare (wrangler deploy --env production)
	pnpm deploy
