-- Admin: permitir eliminar publicaciones de cualquier comercio.
-- Ejecutar en SQL Editor de Supabase.

drop policy if exists "listings_admin_delete_all" on public.listings;
create policy "listings_admin_delete_all"
on public.listings for delete to authenticated
using (
  exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
);
