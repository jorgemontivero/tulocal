-- Endurece integridad de visitor_leads para analítica y calidad de datos.

-- Si existieran registros legacy sin source, se normalizan antes de NOT NULL.
update public.visitor_leads
set source = 'unknown'
where source is null or btrim(source) = '';

alter table public.visitor_leads
  alter column source set not null;

alter table public.visitor_leads
  drop constraint if exists visitor_leads_age_range_check,
  add constraint visitor_leads_age_range_check
    check (age_range is null or age_range in ('18-24', '25-34', '35-44', '45+'));

alter table public.visitor_leads
  drop constraint if exists visitor_leads_gender_check,
  add constraint visitor_leads_gender_check
    check (
      gender is null
      or gender in ('masculino', 'femenino', 'otro', 'prefiero no decirlo')
    );
