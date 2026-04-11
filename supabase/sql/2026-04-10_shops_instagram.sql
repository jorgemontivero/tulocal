-- Opcional: ejecutar en SQL Editor de Supabase.
-- Username de Instagram (sin URL; el prefijo se muestra solo en el formulario).

alter table public.shops
  add column if not exists instagram_username text;
