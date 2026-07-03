-- Secciones de merchandising del catálogo, configurables desde el CMS.
-- Viven en landing_config (mismo mecanismo de isActive/displayOrder/content).
INSERT OR IGNORE INTO landing_config (section_key, content, display_order, is_active) VALUES
  ('catalog_drops', '{"title":"Últimos drops","windowDays":14,"limit":8}', 0, 1),
  ('catalog_best_sellers', '{"title":"Más comprados","days":30,"limit":8}', 1, 1),
  ('catalog_low_stock', '{"title":"Se están acabando","threshold":5,"limit":8}', 2, 1);

-- Acelera el conteo de best-sellers (filtro por tipo + rango de fechas).
CREATE INDEX IF NOT EXISTS idx_events_type_created ON events(type, created_at);
