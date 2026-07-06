-- Seguridad de cuentas:
-- token_version invalida los JWT emitidos antes de un cambio de contraseña
-- (el middleware compara la versión del token contra esta columna);
-- last_login_at deja rastro del último acceso para que el owner audite cuentas.
ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN last_login_at TEXT;
