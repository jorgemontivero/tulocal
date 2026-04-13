-- FIX DEFINITIVO: ejecutar en Supabase SQL Editor (una sola vez).
-- Corrige: recursión en RLS de profiles, acceso admin, y filas sin aprobar.

-- ============================================================
-- A) Función helper (SECURITY DEFINER evita recursión en policies)
-- ============================================================
create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_app_admin() from public;
grant execute on function public.is_app_admin() to authenticated;

-- ============================================================
-- B) Perfiles: lectura propia + lectura global solo admin (sin subquery recursiva)
-- ============================================================
alter table public.profiles enable row level security;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read"
on public.profiles for select to authenticated
using (id = auth.uid());

drop policy if exists "profiles_admin_read_all" on public.profiles;
create policy "profiles_admin_read_all"
on public.profiles for select to authenticated
using (public.is_app_admin());

-- ============================================================
-- C) Shops / listings / analytics: políticas admin con is_app_admin()
-- ============================================================
drop policy if exists "shops_admin_read_all" on public.shops;
create policy "shops_admin_read_all"
on public.shops for select to authenticated
using (public.is_app_admin());

drop policy if exists "shops_admin_update_all" on public.shops;
create policy "shops_admin_update_all"
on public.shops for update to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

drop policy if exists "listings_admin_read_all" on public.listings;
create policy "listings_admin_read_all"
on public.listings for select to authenticated
using (public.is_app_admin());

drop policy if exists "listings_admin_update_all" on public.listings;
create policy "listings_admin_update_all"
on public.listings for update to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

drop policy if exists "shop_events_admin_read_all" on public.shop_events;
create policy "shop_events_admin_read_all"
on public.shop_events for select to authenticated
using (public.is_app_admin());

drop policy if exists "search_logs_admin_read_all" on public.search_logs;
create policy "search_logs_admin_read_all"
on public.search_logs for select to authenticated
using (public.is_app_admin());

-- ============================================================
-- D) Asegurar que todo lo existente sea visible en la web pública
-- ============================================================
update public.shops set status = 'approved' where status = 'pending';
update public.listings set status = 'approved' where status = 'pending';

-- ============================================================
-- E) (Opcional) Trigger: crear fila en profiles al registrarse.
-- Si falla por permisos, creá el perfil a mano en Table Editor o ejecutá:
--
-- insert into public.profiles (id, full_name, role)
-- select id, split_part(email,'@',1), 'vendor' from auth.users
-- where id not in (select id from public.profiles);
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fn text;
begin
  fn := trim(
    both ' ' from coalesce(new.raw_user_meta_data->>'nombre', '') || ' ' ||
    coalesce(new.raw_user_meta_data->>'apellido', '')
  );
  insert into public.profiles (id, full_name, role)
  values (new.id, nullif(fn, ''), 'vendor')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- F) Asegurar fila en profiles para tu usuario admin (ajustá el email)
-- Sin fila en profiles, is_app_admin() es false y el panel no carga datos.
-- ============================================================
-- insert into public.profiles (id, full_name, role)
-- select u.id, u.email, 'admin'
-- from auth.users u
-- where u.email = 'admin@tulocal.com.ar'
-- on conflict (id) do update set role = excluded.role;
