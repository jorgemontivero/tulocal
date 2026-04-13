-- Admin RLS policies + profiles self-read.
-- Run AFTER 2026-04-13_admin_dashboard.sql.
-- Ejecutar en SQL Editor de Supabase.

-- ============================================================
-- 0. Profiles: every user can read their OWN profile
-- ============================================================
alter table public.profiles enable row level security;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read"
on public.profiles for select to authenticated
using (id = auth.uid());

-- Shops: admin can read all
drop policy if exists "shops_admin_read_all" on public.shops;
create policy "shops_admin_read_all"
on public.shops for select to authenticated
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Shops: admin can update all
drop policy if exists "shops_admin_update_all" on public.shops;
create policy "shops_admin_update_all"
on public.shops for update to authenticated
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
)
with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Listings: admin can read all
drop policy if exists "listings_admin_read_all" on public.listings;
create policy "listings_admin_read_all"
on public.listings for select to authenticated
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Listings: admin can update all
drop policy if exists "listings_admin_update_all" on public.listings;
create policy "listings_admin_update_all"
on public.listings for update to authenticated
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
)
with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Shop events: admin can read all
drop policy if exists "shop_events_admin_read_all" on public.shop_events;
create policy "shop_events_admin_read_all"
on public.shop_events for select to authenticated
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Search logs: admin can read all
drop policy if exists "search_logs_admin_read_all" on public.search_logs;
create policy "search_logs_admin_read_all"
on public.search_logs for select to authenticated
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Profiles: admin can read all profiles
drop policy if exists "profiles_admin_read_all" on public.profiles;
create policy "profiles_admin_read_all"
on public.profiles for select to authenticated
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
