-- Plan interno "black" (sin límite de publicaciones en la app).
-- Requiere PostgreSQL 15+ (IF NOT EXISTS en ADD VALUE). Si falla, ejecutá:
--   alter type public.plan_type add value 'black';
-- una sola vez.

alter type public.plan_type add value if not exists 'black';
