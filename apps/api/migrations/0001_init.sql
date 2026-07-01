-- VirtualShop — esquema inicial (spec §5)

CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('owner', 'admin')),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE categories (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE products (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id    INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name           TEXT NOT NULL,
  description    TEXT NOT NULL DEFAULT '',
  slug           TEXT NOT NULL UNIQUE,
  price          REAL NOT NULL,
  discount_type  TEXT CHECK (discount_type IN ('percent', 'fixed') OR discount_type IS NULL),
  discount_value REAL,
  final_price    REAL NOT NULL,
  is_active      INTEGER NOT NULL DEFAULT 1,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE product_variants (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size       TEXT NOT NULL,
  color      TEXT NOT NULL,
  stock      INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (product_id, size, color)
);

CREATE TABLE product_media (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id    INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN ('image', 'video')),
  r2_key        TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE landing_config (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  section_key   TEXT NOT NULL UNIQUE,
  content       TEXT NOT NULL DEFAULT '{}', -- JSON
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE whatsapp_config (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  phone_number     TEXT NOT NULL,
  message_template TEXT NOT NULL DEFAULT 'Hola 👋 Me interesa este producto: *[nombre]* — Precio: [precio]. [link]',
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('view', 'order_click')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Índices recomendados (spec §5)
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_media_product_id ON product_media(product_id);
CREATE INDEX idx_events_product_id ON events(product_id);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_created_at ON events(created_at);
