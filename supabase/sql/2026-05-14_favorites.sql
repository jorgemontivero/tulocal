create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  shop_id uuid not null references shops(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, shop_id)
);

alter table favorites enable row level security;

create policy "users manage own favorites"
  on favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index favorites_user_id_idx on favorites(user_id);
