-- Shops: hasta 3 flyers promocionales para planes oro/black.
-- Ejecutar en SQL Editor de Supabase.

alter table public.shops
  add column if not exists flyer_urls jsonb not null default '[]'::jsonb;

comment on column public.shops.flyer_urls is
  'Array JSON de URLs públicas para carrusel (máx. 3). Visible para planes oro/black.';
