-- RealTrack — initial schema + Row-Level Security
-- Run this in the Supabase SQL editor (or `supabase db push`). It creates the
-- per-user, per-project data model from docs/DATA-MODEL.md and enforces the
-- privacy requirement (HANDOFF §1) at the database: every row is owned by a
-- user and RLS restricts ALL access to that owner.
--
-- owner_id defaults to auth.uid(), so the client never sets it — inserts are
-- automatically attributed to the signed-in user and pass the RLS check.

create extension if not exists pgcrypto;

-- ── projects ─────────────────────────────────────────────────────────
create table if not exists public.projects (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name               text not null,
  short              text,
  code               text,
  address            text,
  status             text not null default 'Planning',
  percent            int  not null default 0 check (percent between 0 and 100),
  phase_label        text,
  start_date         date,
  target_date        date,
  contingency_total  numeric not null default 0,
  contingency_used   numeric not null default 0,
  created_at         timestamptz not null default now()
);

-- ── child tables (each carries project_id + owner_id) ────────────────
create table if not exists public.tasks (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references public.projects (id) on delete cascade,
  owner_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title           text not null,
  due             text,
  owner           text,
  urgent          boolean not null default false,
  done            boolean not null default false,
  completed_label text,
  position        int not null default 0,
  created_at      timestamptz not null default now()
);

create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null,
  type        text not null,
  date        text,
  amount      text,
  file_path   text,           -- object path in the private 'files' bucket
  badge       jsonb,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.schedule_phases (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  status      text not null default 'upcoming',
  percent     int default 0,
  date        text,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.budget_categories (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  budget      numeric not null default 0,
  spent       numeric not null default 0,
  active      boolean not null default false,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.vendors (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  owner_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null,
  trade       text,
  status      text,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);

-- ── indexes ──────────────────────────────────────────────────────────
create index if not exists idx_projects_owner            on public.projects (owner_id);
create index if not exists idx_tasks_project             on public.tasks (project_id);
create index if not exists idx_documents_project         on public.documents (project_id);
create index if not exists idx_schedule_phases_project   on public.schedule_phases (project_id);
create index if not exists idx_budget_categories_project on public.budget_categories (project_id);
create index if not exists idx_vendors_project           on public.vendors (project_id);

-- ── Row-Level Security ───────────────────────────────────────────────
-- Enable RLS and add one policy per table: a user may read/write only their
-- own rows. This is the mechanism for "one user can never read another's
-- data" (HANDOFF §1), and it extends to invite-based sharing in v3 by adding
-- a project_members table + an OR clause here.
do $$
declare t text;
begin
  foreach t in array array['projects','tasks','documents','schedule_phases','budget_categories','vendors']
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "owner_all" on public.%I;', t);
    execute format($f$
      create policy "owner_all" on public.%I
        for all
        using (owner_id = auth.uid())
        with check (owner_id = auth.uid());
    $f$, t);
  end loop;
end $$;
