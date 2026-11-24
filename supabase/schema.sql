
create table if not exists public.leads (
  id uuid primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('plan_request','subsidy_check','calculator_report','contact','whatsapp_click','quote')),
  name text,
  phone text,                 -- +91XXXXXXXXXX
  location text,              -- district slug or free text
  property_type text check (property_type in ('home','farm','business')),
  monthly_bill integer,
  message text,
  slot_date date,             -- preferred contact date (optional, currently unused)
  slot_time text,             -- preferred contact time (HH:MM, optional)
  calc jsonb,                 -- calculator result attached to the lead
  package_id text,
  tags text[] not null default '{}',   -- e.g. {Home, Hot, site visit}
  temperature text check (temperature in ('hot','warm')),
  source_page text,
  locale text default 'en',
  status text not null default 'new' check (status in ('new','called','converted','lost','event')),
  called_at timestamptz,
  reminder_sent_at timestamptz
);

create index if not exists leads_status_created_idx on public.leads (status, created_at);
create index if not exists leads_created_idx on public.leads (created_at desc);

alter table public.leads enable row level security;
-- No policies on purpose: only the service role (server) can read/write.

-- Handy view for the team: open leads, hottest first.
create or replace view public.open_leads as
  select created_at, name, phone, location, property_type, monthly_bill, temperature, tags, slot_date, slot_time, source_page
  from public.leads
  where status = 'new'
  order by (temperature = 'hot') desc, created_at desc;
