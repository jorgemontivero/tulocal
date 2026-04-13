-- ============================================================
-- Admin Dashboard: status, plan, featured + analytics tables
-- Ejecutar en SQL Editor de Supabase.
-- ============================================================

-- 1. Enums --------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'shop_status') then
    create type public.shop_status as enum ('pending', 'approved', 'blocked');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'plan_type') then
    create type public.plan_type as enum ('bronce', 'plata', 'oro');
  end if;
end $$;

-- 2. shops: status, plan_type, is_featured -------------------

alter table public.shops
  add column if not exists status      public.shop_status not null default 'pending',
  add column if not exists plan_type   public.plan_type   not null default 'bronce',
  add column if not exists is_featured boolean            not null default false;

create index if not exists idx_shops_status    on public.shops(status);
create index if not exists idx_shops_plan_type on public.shops(plan_type);

comment on column public.shops.status      is 'Estado de moderación: pending → approved / blocked.';
comment on column public.shops.plan_type   is 'Plan contratado del comercio.';
comment on column public.shops.is_featured is 'true = aparece como destacado en Home / resultados.';

-- 3. listings: status ----------------------------------------

alter table public.listings
  add column if not exists status public.shop_status not null default 'pending';

create index if not exists idx_listings_status on public.listings(status);

comment on column public.listings.status is 'Estado de moderación del producto/servicio.';

-- 4. Analytics: shop_events ----------------------------------
-- Registra eventos individuales (clic, búsqueda, vista de página)
-- para después agregar en vistas materializadas o queries.

create table if not exists public.shop_events (
  id         bigint generated always as identity primary key,
  shop_id    uuid        not null references public.shops(id) on delete cascade,
  event_type text        not null,   -- 'click', 'search_impression', 'page_view'
  meta       jsonb                default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_shop_events_shop_id    on public.shop_events(shop_id);
create index if not exists idx_shop_events_type       on public.shop_events(event_type);
create index if not exists idx_shop_events_created_at on public.shop_events(created_at desc);

alter table public.shop_events enable row level security;

drop policy if exists "shop_events_insert_anon" on public.shop_events;
create policy "shop_events_insert_anon"
on public.shop_events for insert to public
with check (true);

drop policy if exists "shop_events_read_owner" on public.shop_events;
create policy "shop_events_read_owner"
on public.shop_events for select to authenticated
using (
  exists (
    select 1 from public.shops s
    where s.id = shop_events.shop_id
      and s.vendor_id = auth.uid()
  )
);

comment on table  public.shop_events            is 'Eventos de analítica por local (clics, vistas, impresiones en búsqueda).';
comment on column public.shop_events.event_type is 'Tipo de evento: click | search_impression | page_view.';
comment on column public.shop_events.meta       is 'Datos extra del evento, ej: {"query":"pizza","category_id":"..."}';

-- 5. Tabla de búsquedas frecuentes ----------------------------

create table if not exists public.search_logs (
  id         bigint generated always as identity primary key,
  query      text        not null,
  results    int         not null default 0,
  filters    jsonb                default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_search_logs_query      on public.search_logs(query);
create index if not exists idx_search_logs_created_at on public.search_logs(created_at desc);

alter table public.search_logs enable row level security;

drop policy if exists "search_logs_insert_anon" on public.search_logs;
create policy "search_logs_insert_anon"
on public.search_logs for insert to public
with check (true);

comment on table  public.search_logs         is 'Log de cada búsqueda realizada en la plataforma.';
comment on column public.search_logs.query   is 'Texto buscado por el usuario.';
comment on column public.search_logs.results is 'Cantidad de resultados devueltos.';
comment on column public.search_logs.filters is 'Filtros activos al momento de la búsqueda: {type, cat, subcat}';

-- 6. Vistas de resumen para el Admin -------------------------

-- 6a. Clics y vistas totales por local
create or replace view public.v_shop_stats as
select
  s.id          as shop_id,
  s.name        as shop_name,
  s.status,
  s.plan_type,
  coalesce(sum(case when e.event_type = 'page_view'          then 1 else 0 end), 0) as total_views,
  coalesce(sum(case when e.event_type = 'click'              then 1 else 0 end), 0) as total_clicks,
  coalesce(sum(case when e.event_type = 'search_impression'  then 1 else 0 end), 0) as total_impressions
from public.shops s
left join public.shop_events e on e.shop_id = s.id
group by s.id, s.name, s.status, s.plan_type;

comment on view public.v_shop_stats is 'Resumen de métricas por local (vistas, clics, impresiones).';

-- 6b. Búsquedas más frecuentes (últimos 30 días)
create or replace view public.v_top_searches as
select
  lower(trim(query)) as search_term,
  count(*)           as total_searches,
  round(avg(results))as avg_results
from public.search_logs
where created_at >= now() - interval '30 days'
group by lower(trim(query))
order by total_searches desc
limit 100;

comment on view public.v_top_searches is 'Top 100 búsquedas de los últimos 30 días.';

-- 6c. Visitas por categoría
create or replace view public.v_category_views as
select
  s.category,
  count(e.id) as total_events
from public.shop_events e
join public.shops s on s.id = e.shop_id
where e.event_type = 'page_view'
group by s.category
order by total_events desc;

comment on view public.v_category_views is 'Total de vistas agrupadas por categoría de comercio.';

-- 7. Actualizar RLS de shops para filtrar solo approved -------
-- Las consultas públicas ahora solo ven locales aprobados.

drop policy if exists "shops_public_read" on public.shops;
create policy "shops_public_read"
on public.shops for select to public
using (status = 'approved');

-- Los vendedores siempre ven su propio local (cualquier status).
drop policy if exists "shops_owner_read" on public.shops;
create policy "shops_owner_read"
on public.shops for select to authenticated
using (vendor_id = auth.uid());

-- 8. Actualizar RLS de listings para filtrar solo approved ----

drop policy if exists "listings_public_read" on public.listings;
create policy "listings_public_read"
on public.listings for select to public
using (status = 'approved');

-- Los vendedores ven sus propios listings (cualquier status).
drop policy if exists "listings_owner_read" on public.listings;
create policy "listings_owner_read"
on public.listings for select to authenticated
using (
  exists (
    select 1 from public.shops s
    where s.id = listings.shop_id
      and s.vendor_id = auth.uid()
  )
);

-- 9. Aprobar datos existentes para que no desaparezcan ----------
update public.shops    set status = 'approved' where status = 'pending';
update public.listings set status = 'approved' where status = 'pending';
