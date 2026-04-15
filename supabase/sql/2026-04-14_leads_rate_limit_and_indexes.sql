-- Mejora de performance + anti-spam para visitor_leads.

-- Índices para consultas analíticas y filtros frecuentes.
create index if not exists idx_visitor_leads_created_at
  on public.visitor_leads (created_at desc);

create index if not exists idx_visitor_leads_source
  on public.visitor_leads (source);

create index if not exists idx_visitor_leads_contact_method
  on public.visitor_leads (contact_method);

-- Tabla de rate-limit por IP (ventana móvil simple).
create table if not exists public.lead_rate_limits (
  client_ip text primary key,
  hits integer not null default 0 check (hits >= 0),
  window_started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lead_rate_limits enable row level security;

-- Sin policies directas: acceso sólo por función SECURITY DEFINER.

create or replace function public.check_and_touch_lead_rate_limit(
  p_client_ip text,
  p_max_hits integer default 5,
  p_window_seconds integer default 600
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_row public.lead_rate_limits%rowtype;
begin
  if p_client_ip is null or btrim(p_client_ip) = '' then
    return true;
  end if;

  if p_max_hits < 1 then
    p_max_hits := 1;
  end if;
  if p_window_seconds < 1 then
    p_window_seconds := 1;
  end if;

  insert into public.lead_rate_limits (client_ip, hits, window_started_at, updated_at)
  values (p_client_ip, 1, v_now, v_now)
  on conflict (client_ip) do nothing;

  select *
  into v_row
  from public.lead_rate_limits
  where client_ip = p_client_ip
  for update;

  if v_row.window_started_at <= v_now - make_interval(secs => p_window_seconds) then
    update public.lead_rate_limits
    set hits = 1,
        window_started_at = v_now,
        updated_at = v_now
    where client_ip = p_client_ip;
    return true;
  end if;

  if v_row.hits >= p_max_hits then
    update public.lead_rate_limits
    set updated_at = v_now
    where client_ip = p_client_ip;
    return false;
  end if;

  update public.lead_rate_limits
  set hits = v_row.hits + 1,
      updated_at = v_now
  where client_ip = p_client_ip;

  return true;
end;
$$;

revoke all on function public.check_and_touch_lead_rate_limit(text, integer, integer) from public;
grant execute on function public.check_and_touch_lead_rate_limit(text, integer, integer) to anon, authenticated;
