-- Listings: precio opcional, ofertas, destacados e imágenes múltiples.
-- Ejecutar en SQL Editor de Supabase.

alter table public.listings alter column price drop not null;

alter table public.listings
  add column if not exists discount_percentage smallint,
  add column if not exists is_promoted boolean not null default false,
  add column if not exists image_urls jsonb not null default '[]'::jsonb;

comment on column public.listings.price is 'Precio final en ARS; null o 0 muestra "Consultar" en la vitrina.';
comment on column public.listings.discount_percentage is 'Porcentaje de descuento (1-100) cuando aplica oferta.';
comment on column public.listings.image_urls is 'Array JSON de URLs públicas (máx. 4 imágenes).';
