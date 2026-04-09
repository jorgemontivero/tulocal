-- Ejecutar en SQL Editor de Supabase.
-- Agrega las columnas necesarias para el dashboard vendedor.

alter table public.shops
  add column if not exists category text,
  add column if not exists whatsapp text,
  add column if not exists vendor_id uuid;

-- Vincula el local al usuario autenticado.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'shops_vendor_id_fkey'
  ) then
    alter table public.shops
      add constraint shops_vendor_id_fkey
      foreign key (vendor_id)
      references auth.users(id)
      on delete cascade;
  end if;
end $$;

create index if not exists idx_shops_vendor_id on public.shops(vendor_id);
