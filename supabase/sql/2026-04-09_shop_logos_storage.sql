-- Bucket publico para logos de comercios.
insert into storage.buckets (id, name, public)
values ('shop-logos', 'shop-logos', true)
on conflict (id) do update set public = true;

-- Lectura publica de objetos del bucket.
drop policy if exists "shop_logos_public_read" on storage.objects;
create policy "shop_logos_public_read"
on storage.objects
for select
to public
using (bucket_id = 'shop-logos');

-- Subida solo por usuarios autenticados en su propia carpeta: {uid}/archivo.ext
drop policy if exists "shop_logos_owner_insert" on storage.objects;
create policy "shop_logos_owner_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'shop-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Actualizacion solo del duenio de la carpeta.
drop policy if exists "shop_logos_owner_update" on storage.objects;
create policy "shop_logos_owner_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'shop-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'shop-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Borrado solo del duenio de la carpeta.
drop policy if exists "shop_logos_owner_delete" on storage.objects;
create policy "shop_logos_owner_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'shop-logos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
