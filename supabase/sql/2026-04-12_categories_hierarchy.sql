-- Jerarquía de categorías (3 niveles: business_type → categoría → subcategoría)
-- Ejecutá en Supabase SQL Editor si aún no aplicaste estos objetos.

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_type text not null check (business_type in ('producto', 'servicio')),
  created_at timestamptz not null default now(),
  unique (name, business_type)
);

create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (category_id, name)
);

create index if not exists idx_subcategories_category_id on public.subcategories (category_id);
create index if not exists idx_categories_business_type on public.categories (business_type);

alter table public.shops
  add column if not exists business_type text check (business_type in ('producto', 'servicio'));

alter table public.shops
  add column if not exists category_id uuid references public.categories (id);

alter table public.shops
  add column if not exists subcategory_id uuid references public.subcategories (id);

-- Lectura pública para listados y formularios
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;

drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public" on public.categories for select using (true);

drop policy if exists "subcategories_select_public" on public.subcategories;
create policy "subcategories_select_public" on public.subcategories for select using (true);
