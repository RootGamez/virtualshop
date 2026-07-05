-- Seed mínimo para desarrollo local.
-- El password_hash de abajo corresponde a la contraseña "changeme123" (PBKDF2, ver src/lib/password.ts).
-- Generar hashes reales con: pnpm --filter @virtualshop/api exec tsx scripts/hash-password.ts <password>

INSERT INTO whatsapp_config (phone_number, message_template)
VALUES ('5215500000000', 'Hola 👋 Me interesa este producto: *[nombre]* — Precio: [precio]. [link]');

INSERT INTO landing_config (section_key, content, display_order, is_active) VALUES
  ('hero', '{"title":"JAW Project","subtitle":"Ropa importada con otro flow","ctaLabel":"Ver catálogo"}', 0, 1),
  ('about', '{"title":"Sobre nosotros","body":"Contenido editable desde el CMS."}', 1, 1),
  ('social', '{"instagram":"","tiktok":"","facebook":""}', 2, 1);

INSERT INTO categories (name, slug, display_order) VALUES
  ('Playeras', 'playeras', 0),
  ('Pantalones', 'pantalones', 1),
  ('Accesorios', 'accesorios', 2);
