create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  title text not null,
  description text,
  price numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

alter table public.listings enable row level security;

drop policy if exists "listings_public_read" on public.listings;
create policy "listings_public_read"
on public.listings
for select
to public
using (true);

drop policy if exists "listings_owner_insert" on public.listings;
create policy "listings_owner_insert"
on public.listings
for insert
to authenticated
with check (
  exists (
    select 1
    from public.shops s
    where s.id = listings.shop_id
      and s.vendor_id = auth.uid()
  )
);

drop policy if exists "listings_owner_update" on public.listings;
create policy "listings_owner_update"
on public.listings
for update
to authenticated
using (
  exists (
    select 1
    from public.shops s
    where s.id = listings.shop_id
      and s.vendor_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.shops s
    where s.id = listings.shop_id
      and s.vendor_id = auth.uid()
  )
);

drop policy if exists "listings_owner_delete" on public.listings;
create policy "listings_owner_delete"
on public.listings
for delete
to authenticated
using (
  exists (
    select 1
    from public.shops s
    where s.id = listings.shop_id
      and s.vendor_id = auth.uid()
  )
);
