# VirtualShop — Makefile raíz
#
# Orquesta las 3 apps del monorepo (api, web, cms) para desarrollo local y
# despliegue a Cloudflare. Pensado para correr desde una terminal simple
# (incluye Termux en Android) sin herramientas de escritorio adicionales.
#
# Uso rápido:
#   make help          -> lista todos los comandos
#   make install        -> instala dependencias
#   make env             -> crea los .env/.dev.vars locales
#   make api / web / cms -> levanta cada app (todo lo necesario en un comando)
#   make dev              -> levanta las 3 apps juntas
#
# Despliegue (ver README.md para la guía completa paso a paso):
#   make cf-login -> db-create -> r2-create -> secrets -> db-migrate-remote -> deploy-api

# En Windows, make usa cmd.exe por defecto sin importar desde qué terminal se
# invoque (PowerShell, cmd o Git Bash). Forzamos el bash real de Git for Windows
# para que las recetas (cp, test, trap, etc.) funcionen igual en todos lados.
ifeq ($(OS),Windows_NT)
	SHELL := C:/Program Files/Git/bin/bash.exe
else
	SHELL := /bin/bash
endif
.ONESHELL:
.SHELLFLAGS := -eu -o pipefail -c
MAKEFLAGS += --no-print-directory

API_DIR := apps/api
WEB_DIR := apps/web
CMS_DIR := apps/cms

.DEFAULT_GOAL := help

.PHONY: help install env \
	api web cms dev \
	db-migrate-local db-seed-local create-owner \
	typecheck lint format build clean \
	cf-login db-create r2-create secrets db-migrate-remote create-owner-remote \
	deploy-api build-web build-cms deploy

help: ## Muestra esta ayuda
	grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-24s\033[0m %s\n", $$1, $$2}'

install: ## Instala todas las dependencias del monorepo (pnpm)
	pnpm install

env: ## Crea los .env / .dev.vars locales a partir de los .example (si no existen)
	test -f $(API_DIR)/.dev.vars || cp $(API_DIR)/.dev.vars.example $(API_DIR)/.dev.vars
	test -f $(WEB_DIR)/.env || cp $(WEB_DIR)/.env.example $(WEB_DIR)/.env
	test -f $(CMS_DIR)/.env || cp $(CMS_DIR)/.env.example $(CMS_DIR)/.env
	echo "Listo. Revisá $(API_DIR)/.dev.vars y poné un JWT_SECRET real (no el de ejemplo)."

## --- Desarrollo local: un comando por app, hace todo lo necesario ---

api: env db-migrate-local ## Levanta la API completa (migraciones + wrangler dev en :8787)
	cd $(API_DIR) && pnpm dev

web: env ## Levanta la tienda pública (vite dev en :5173)
	cd $(WEB_DIR) && pnpm dev

cms: env ## Levanta el panel de administración (vite dev en :5174)
	cd $(CMS_DIR) && pnpm dev

dev: env db-migrate-local ## Levanta api + web + cms juntos (Ctrl+C corta las 3)
	echo "Iniciando api (:8787), web (:5173) y cms (:5174)... Ctrl+C para cortar todo."
	trap 'kill 0' EXIT INT TERM
	(cd $(API_DIR) && pnpm dev) &
	(cd $(WEB_DIR) && pnpm dev) &
	(cd $(CMS_DIR) && pnpm dev) &
	wait

## --- Base de datos local (D1 vía Miniflare) ---

db-migrate-local: ## Aplica las migraciones de D1 en local (idempotente)
	cd $(API_DIR) && pnpm wrangler d1 migrations apply virtualshop-db --local

db-seed-local: ## Carga datos de ejemplo (categorías, whatsapp_config, landing) en D1 local
	cd $(API_DIR) && pnpm wrangler d1 execute virtualshop-db --local --file=./seed.sql

create-owner: ## Crea el usuario owner en D1 local. Uso: make create-owner EMAIL=x PASSWORD=y NAME="Z"
	test -n "$(EMAIL)" && test -n "$(PASSWORD)" && test -n "$(NAME)" || { echo 'Uso: make create-owner EMAIL=owner@x.com PASSWORD=algo NAME="Nombre"'; exit 1; }
	cd $(API_DIR)
	SQL=$$(pnpm exec tsx scripts/create-owner.ts "$(EMAIL)" "$(PASSWORD)" "$(NAME)" | tail -1)
	pnpm wrangler d1 execute virtualshop-db --local --command "$$SQL"
	echo "Owner creado: $(EMAIL)"

## --- Calidad ---

typecheck: ## Corre tsc --noEmit en todos los paquetes
	pnpm typecheck

lint: ## Corre eslint en todo el repo
	pnpm lint

format: ## Aplica prettier --write en todo el repo
	pnpm format

build: ## Compila todas las apps (build de cada package.json que lo tenga)
	pnpm build

clean: ## Borra node_modules, dist y .wrangler de todo el monorepo
	find . -name node_modules -type d -prune -exec rm -rf {} +
	find . -name dist -type d -prune -exec rm -rf {} +
	find . -name .wrangler -type d -prune -exec rm -rf {} +
	echo "Limpio. Corré 'make install' de nuevo antes de levantar algo."

## --- Despliegue a Cloudflare (producción) ---

cf-login: ## Inicia sesión en tu cuenta de Cloudflare (abre el navegador)
	cd $(API_DIR) && pnpm wrangler login

db-create: ## Crea la base D1 de producción y actualiza wrangler.toml automáticamente
	cd $(API_DIR)
	OUTPUT=$$(pnpm wrangler d1 create virtualshop-db)
	echo "$$OUTPUT"
	DB_ID=$$(echo "$$OUTPUT" | grep -oE '"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"' | head -1 | tr -d '"')
	if [ -n "$$DB_ID" ]; then \
	  sed -i.bak "s/database_id = \"REPLACE_WITH_D1_DATABASE_ID\"/database_id = \"$$DB_ID\"/" wrangler.toml; \
	  rm -f wrangler.toml.bak; \
	  echo "wrangler.toml actualizado con database_id=$$DB_ID"; \
	else \
	  echo "No se pudo detectar el database_id automáticamente. Copialo a mano en wrangler.toml"; \
	fi

r2-create: ## Crea el bucket R2 de producción
	cd $(API_DIR) && pnpm wrangler r2 bucket create virtualshop-media

secrets: ## Configura el JWT_SECRET de producción (prompt interactivo)
	cd $(API_DIR) && pnpm wrangler secret put JWT_SECRET

db-migrate-remote: ## Aplica las migraciones en la base D1 de producción
	cd $(API_DIR) && pnpm wrangler d1 migrations apply virtualshop-db --remote

create-owner-remote: ## Crea el owner en producción. Uso: make create-owner-remote EMAIL=x PASSWORD=y NAME="Z"
	test -n "$(EMAIL)" && test -n "$(PASSWORD)" && test -n "$(NAME)" || { echo 'Uso: make create-owner-remote EMAIL=owner@x.com PASSWORD=algo NAME="Nombre"'; exit 1; }
	cd $(API_DIR)
	SQL=$$(pnpm exec tsx scripts/create-owner.ts "$(EMAIL)" "$(PASSWORD)" "$(NAME)" | tail -1)
	pnpm wrangler d1 execute virtualshop-db --remote --command "$$SQL"
	echo "Owner creado en producción: $(EMAIL)"

deploy-api: ## Despliega el Worker (API) a Cloudflare
	cd $(API_DIR) && pnpm deploy

build-web: ## Compila la tienda pública para producción (dist/)
	cd $(WEB_DIR) && pnpm build

build-cms: ## Compila el panel admin para producción (dist/)
	cd $(CMS_DIR) && pn