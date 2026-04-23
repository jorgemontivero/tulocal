-- B2C email capture en visitor_leads.
-- Compatible con instalaciones nuevas y bases ya existentes.

create table if not exists public.visitor_leads (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  source text not null default 'unknown',
  created_at timestamptz not null default now()
);

alter table public.visitor_leads
  add column if not exists email text;

-- Backfill: reutiliza contact_value cuando el lead ya era de tipo email.
update public.visitor_leads
set email = lower(btrim(contact_value))
where email is null
  and contact_method = 'email'
  and contact_value is not null
  and btrim(contact_value) <> '';

-- Normaliza source para evitar nulos/blancos.
update public.visitor_leads
set source = 'unknown'
where source is null or btrim(source) = '';

alter table public.visitor_leads
  alter column source set default 'unknown',
  alter column source set not null;

create unique index if not exists uq_visitor_leads_email_lower
  on public.visitor_leads (lower(email))
  where email is not null;
