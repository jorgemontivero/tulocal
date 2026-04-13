-- DEPRECADO: usá en su lugar `2026-04-14_fix_profiles_and_admin_rls.sql`
-- (evita recursión en RLS y define is_app_admin correctamente).
--
-- FIX: Ejecutar DESPUÉS de 2026-04-13_admin_dashboard.sql
-- Resuelve 3 problemas:
--   1. Categorías no cargan en Home (shops con status='pending' no son visibles)
--   2. "No pudimos cargar resultados" (misma causa)
--   3. /admin redirige al home (profiles no tiene policy de auto-lectura)
-- Ejecutar en SQL Editor de Supabase.

-- ============================================================
-- 1. Profiles: cada usuario puede leer su propio perfil
-- (sin esto, el admin layout no puede verificar el rol)
-- ============================================================
alter table public.profiles enable row level security;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read"
on public.profiles for select to authenticated
using (id = auth.uid());

-- ============================================================
-- 2. Admin puede leer TODOS los perfiles
-- ============================================================
drop policy if exists "profiles_admin_read_all" on public.profiles;
create policy "profiles_admin_read_all"
on public.profiles for select to authenticated
using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- ============================================================
-- 3. Admin puede leer/actualizar TODOS los shops
-- ============================================================
drop policy if exists "shops_admin_read_all" on public.shops;
create policy "shops_admin_read_all"
on public.shops for select to authenticated
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "shops_admin_update_all" on public.shops;
create policy "shops_admin_update_all"
on public.shops for update to authenticated
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
)
with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================================
-- 4. Admin puede leer/actualizar TODOS los listings
-- ============================================================
drop policy if exists "listings_admin_read_all" on public.listings;
create policy "listings_admin_read_all"
on public.listings for select to authenticated
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "listings_admin_update_all" on public.listings;
create policy "listings_admin_update_all"
on public.listings for update to authenticated
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
)
with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================================
-- 5. Admin puede leer analytics
-- ============================================================
drop policy if exists "shop_events_admin_read_all" on public.shop_events;
create policy "shop_events_admin_read_all"
on public.shop_events for select to authenticated
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

drop policy if exists "search_logs_admin_read_all" on public.search_logs;
create policy "search_logs_admin_read_all"
on public.search_logs for select to authenticated
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================================
-- 6. Aprobar TODOS los shops y listings existentes
-- (la migración los dejó en 'pending', haciéndolos invisibles)
-- ============================================================
update public.shops set status = 'approved' where status = 'pending';
update public.listings set status = 'approved' where status = 'pending';
