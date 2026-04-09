-- Crea perfil automaticamente cuando el usuario confirma su email.
-- Pegá este SQL en el SQL Editor de Supabase.

create or replace function public.handle_new_user_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    insert into public.profiles (id, full_name, role, created_at)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'full_name', null),
      coalesce(new.raw_user_meta_data ->> 'role', 'usuario'),
      now()
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_confirmed on auth.users;

create trigger on_auth_user_confirmed
after update of email_confirmed_at on auth.users
for each row
execute function public.handle_new_user_confirmed();

-- Backfill opcional para usuarios ya confirmados sin perfil:
insert into public.profiles (id, full_name, role, created_at)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', null),
  coalesce(u.raw_user_meta_data ->> 'role', 'usuario'),
  now()
from auth.users u
left join public.profiles p on p.id = u.id
where u.email_confirmed_at is not null
  and p.id is null;