-- Captura de leads de visitantes (formulario promo).
-- Ejecutar en Supabase SQL Editor (requiere que is_app_admin() ya exista).

create table if not exists public.visitor_leads (
  id             uuid        primary key default gen_random_uuid(),
  name           text        not null,
  contact_method text        not null check (contact_method in ('whatsapp', 'email')),
  contact_value  text        not null,
  age_range      text,
  gender         text,
  wants_promos   boolean     not null default true,
  source         text,
  created_at     timestamptz not null default now()
);

alter table public.visitor_leads enable row level security;

-- Cualquier visitante (anónimo o autenticado) puede insertar.
drop policy if exists "visitor_leads_public_insert" on public.visitor_leads;
create policy "visitor_leads_public_insert"
  on public.visitor_leads
  for insert
  to anon, authenticated
  with check (true);

-- Solo administradores pueden leer.
drop policy if exists "visitor_leads_admin_select" on public.visitor_leads;
create policy "visitor_leads_admin_select"
  on public.visitor_leads
  for select
  to authenticated
  using (public.is_app_admin());
