create table if not exists public.emergencies (
 id uuid primary key, category text not null, description text not null,
 location text not null, severity text not null check (severity in ('low','moderate','high','critical')),
 status text not null default 'awaiting' check (status in ('awaiting','responding','resolved')),
 "createdAt" timestamptz not null default now(), "respondedAt" timestamptz,
 "resolvedAt" timestamptz, responder text, "responderId" uuid
);
alter table public.emergencies enable row level security;
revoke all on public.emergencies from anon, authenticated;
grant all on public.emergencies to service_role;
create index if not exists emergencies_created_at on public.emergencies ("createdAt" desc);
