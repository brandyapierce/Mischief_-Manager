-- Mischief Manager backend schema (Supabase / Postgres)
-- Paste this into the Supabase SQL Editor (Project -> SQL Editor -> New query) and run it once.
-- Mirrors the current localStorage shapes in frontend/src/data/appStore.js so the
-- frontend data layer can be swapped without redesigning the UI components.

create extension if not exists "pgcrypto";

-- Staff directory. id matches auth.users.id once real auth is wired in Phase 2.
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null check (role in ('employee', 'volunteer', 'trainee', 'manager', 'director')),
  initials text,
  phone text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Zones. Checklist arrays stay as JSONB for the first migration since each zone's
-- cleaning/feeding-drop tasks have different custom fields (seedLevel, naReason, etc.).
-- These can be normalized into their own tables in a later phase if needed.
create table if not exists zones (
  id text primary key,
  name text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  cleaning jsonb not null default '[]'::jsonb,
  feeding_drop jsonb not null default '[]'::jsonb,
  signed_in_users jsonb not null default '[]'::jsonb,
  cleaning_initials text,
  signed_by text,
  signoff_notes text,
  urgent_tasks int not null default 0,
  last_activity_at timestamptz,
  last_status_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists animals (
  id text primary key,
  name text not null,
  species text,
  zone text not null,
  status text not null default 'active',
  priority text default 'normal',
  care jsonb not null default '{}'::jsonb,
  care_tasks jsonb not null default '[]'::jsonb,
  last_updated_at timestamptz not null default now()
);

-- Append-only activity log shown in the Tasks view and manager overview.
create table if not exists task_activity (
  id text primary key,
  checklist_task_id text,
  title text not null,
  priority text default 'normal',
  zone text not null,
  initials text,
  notes text,
  na_reason text,
  state text not null,
  display_note text,
  seed_level text,
  refill_instructions text,
  completed_by uuid references profiles(id),
  completed_by_name text,
  completed_at timestamptz not null default now(),
  workday_date date,
  approval_required boolean not null default false,
  approval_status text default 'not_required',
  review_notes text,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists approvals (
  id text primary key,
  task_id text references task_activity(id),
  checklist_task_id text,
  name text not null,
  zone text not null,
  zone_id text,
  title text,
  notes text,
  submitted_by uuid references profiles(id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references profiles(id),
  reviewed_by_name text,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now()
);

create table if not exists zone_sessions (
  id text primary key,
  user_id uuid references profiles(id),
  user_name text,
  initials text,
  zone_id text not null references zones(id),
  zone_name text,
  workday_date date,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

-- Assignments: which staff member is assigned to which zone. Composite key so
-- toggling an assignment is a single upsert.
create table if not exists assignments (
  user_id uuid not null references profiles(id) on delete cascade,
  zone_name text not null,
  assigned boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (user_id, zone_name)
);

create index if not exists idx_task_activity_zone on task_activity(zone);
create index if not exists idx_task_activity_completed_by on task_activity(completed_by);
create index if not exists idx_zone_sessions_zone on zone_sessions(zone_id);
create index if not exists idx_zone_sessions_active on zone_sessions(zone_id) where ended_at is null;
create index if not exists idx_approvals_status on approvals(status);

-- Row Level Security: enable now, add real policies once auth.uid()-based roles exist.
alter table profiles enable row level security;
alter table zones enable row level security;
alter table animals enable row level security;
alter table task_activity enable row level security;
alter table approvals enable row level security;
alter table zone_sessions enable row level security;
alter table assignments enable row level security;

-- Placeholder policies for Phase 1 (read/write allowed to any authenticated user).
-- Tighten these in Phase 5 once roles are enforced server-side (e.g. only
-- manager/director can update `assignments`, only managers can close zones).
create policy "authenticated read profiles" on profiles for select using (auth.role() = 'authenticated');
create policy "authenticated read zones" on zones for select using (auth.role() = 'authenticated');
create policy "authenticated write zones" on zones for all using (auth.role() = 'authenticated');
create policy "authenticated read animals" on animals for select using (auth.role() = 'authenticated');
create policy "authenticated write animals" on animals for all using (auth.role() = 'authenticated');
create policy "authenticated read task_activity" on task_activity for select using (auth.role() = 'authenticated');
create policy "authenticated write task_activity" on task_activity for all using (auth.role() = 'authenticated');
create policy "authenticated read approvals" on approvals for select using (auth.role() = 'authenticated');
create policy "authenticated write approvals" on approvals for all using (auth.role() = 'authenticated');
create policy "authenticated read zone_sessions" on zone_sessions for select using (auth.role() = 'authenticated');
create policy "authenticated write zone_sessions" on zone_sessions for all using (auth.role() = 'authenticated');
create policy "authenticated read assignments" on assignments for select using (auth.role() = 'authenticated');
create policy "authenticated write assignments" on assignments for all using (auth.role() = 'authenticated');
