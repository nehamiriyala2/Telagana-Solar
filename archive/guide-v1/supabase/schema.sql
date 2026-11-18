-- Telangana Solar: editable content store.
-- One JSON document per collection keeps the admin panel simple and lets
-- non-developers edit schemes, installers, wattages, tariffs and districts.
-- Every scheme/tariff document carries `verified` and `lastVerified`.

create table if not exists public.content (
  collection text primary key check (collection in
    ('districts','appliances','schemes','installers','tariffs','assumptions')),
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.content_history (
  id bigint generated always as identity primary key,
  collection text not null,
  data jsonb not null,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users(id)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  district text not null,
  monthly_bill integer,
  solar_type text,
  installer_id text,
  locale text default 'en',
  source text
);

create table if not exists public.admins (user_id uuid primary key references auth.users(id));

alter table public.content enable row level security;
alter table public.content_history enable row level security;
alter table public.leads enable row level security;

-- Public can read content; only admins write.
create policy "content readable" on public.content for select using (true);
create policy "content admin write" on public.content for all
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Anyone can submit a lead; only admins read them.
create policy "lead insert" on public.leads for insert with check (true);
create policy "lead admin read" on public.leads for select
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create or replace function public.log_content_change() returns trigger language plpgsql as $$
begin
  insert into public.content_history(collection, data, changed_by) values (old.collection, old.data, auth.uid());
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists content_history_trg on public.content;
create trigger content_history_trg before update on public.content
  for each row execute function public.log_content_change();
