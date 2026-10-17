-- ==============================================================================
-- OpportunityKit Complete Database Schema
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jmesdefkitbarhejxuvn/sql/new
-- ==============================================================================

-- 1. Enable required extensions
create extension if not exists pgcrypto;

-- 2. Profiles Table
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  degree text,
  branch text,
  academic_year text,
  cgpa numeric,
  cgpa_scale numeric not null default 10 check (cgpa_scale > 0),
  marks_percentage numeric check (marks_percentage is null or (marks_percentage >= 0 and marks_percentage <= 100)),
  annual_income numeric check (annual_income is null or annual_income >= 0),
  skills text[] not null default '{}',
  skill_gaps text[] not null default '{}',
  documents text[] not null default '{}',
  location text,
  work_authorization boolean,
  team_size integer check (team_size is null or team_size between 1 and 100),
  github_url text,
  portfolio_url text,
  resume_path text,
  availability_weeks numeric,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cgpa_in_scale check (cgpa is null or (cgpa >= 0 and cgpa <= cgpa_scale))
);

-- 3. Opportunities Table
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled opportunity',
  type text not null check (type in ('internship','scholarship','competition','hackathon','other')),
  source_url text,
  raw_text text not null,
  deadline timestamptz,
  extraction_provider text,
  extraction_model text,
  extracted_at timestamptz,
  status text not null default 'draft' check (status in ('draft','review','audited','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Requirements Table
create table if not exists public.requirements (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  label text not null,
  operator text not null,
  expected_value jsonb,
  required boolean not null default true,
  source_text text,
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  needs_review boolean not null default true,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 5. Audit Results Table (Deterministic Engine Results)
create table if not exists public.audit_results (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  requirement_id uuid not null references public.requirements(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('MATCH','MISMATCH','MISSING_INFO')),
  reason_code text,
  explanation text not null,
  evaluated_profile_value jsonb,
  next_action text,
  engine_version text not null default '1.0.0',
  evaluated_at timestamptz not null default now(),
  unique (requirement_id)
);

-- 6. Action Items Table (Deadline-aware plan)
create table if not exists public.action_items (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'general',
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  due_at timestamptz,
  status text not null default 'open' check (status in ('open','in_progress','done','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Rate Limiter Table
create table if not exists public.extraction_rate_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0)
);

-- 8. Performance Indexes
create index if not exists opportunities_owner_deadline_idx on public.opportunities(owner_id, deadline);
create index if not exists requirements_opportunity_idx on public.requirements(opportunity_id, sort_order);
create index if not exists audit_results_owner_opportunity_idx on public.audit_results(owner_id, opportunity_id);
create index if not exists action_items_owner_status_due_idx on public.action_items(owner_id, status, due_at);

-- 9. Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.opportunities enable row level security;
alter table public.requirements enable row level security;
alter table public.audit_results enable row level security;
alter table public.action_items enable row level security;
alter table public.extraction_rate_limits enable row level security;

-- 10. Rate Limiting Function
create or replace function public.consume_extraction_rate_limit(p_limit integer default 20)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_count integer;
begin
  if v_user_id is null or p_limit < 1 then
    return false;
  end if;

  insert into public.extraction_rate_limits (user_id, window_started_at, request_count)
  values (v_user_id, now(), 1)
  on conflict (user_id) do update
  set request_count = case
        when public.extraction_rate_limits.window_started_at <= now() - interval '1 hour' then 1
        else public.extraction_rate_limits.request_count + 1
      end,
      window_started_at = case
        when public.extraction_rate_limits.window_started_at <= now() - interval '1 hour' then now()
        else public.extraction_rate_limits.window_started_at
      end
  returning request_count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_extraction_rate_limit(integer) from public, anon;
grant execute on function public.consume_extraction_rate_limit(integer) to authenticated;

-- 11. Row Level Security Policies
-- Profiles:
drop policy if exists "profiles own row select" on public.profiles;
create policy "profiles own row select" on public.profiles for select to authenticated using (auth.uid() = user_id);
drop policy if exists "profiles own row insert" on public.profiles;
create policy "profiles own row insert" on public.profiles for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "profiles own row update" on public.profiles;
create policy "profiles own row update" on public.profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Opportunities:
drop policy if exists "opportunities own rows" on public.opportunities;
create policy "opportunities own rows" on public.opportunities for all to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Requirements:
drop policy if exists "requirements own rows" on public.requirements;
create policy "requirements own rows" on public.requirements for all to authenticated
  using (auth.uid() = owner_id and exists (
    select 1 from public.opportunities o where o.id = public.requirements.opportunity_id and o.owner_id = auth.uid()
  ))
  with check (auth.uid() = owner_id and exists (
    select 1 from public.opportunities o where o.id = public.requirements.opportunity_id and o.owner_id = auth.uid()
  ));

-- Audit Results:
drop policy if exists "audit results own rows" on public.audit_results;
create policy "audit results own rows" on public.audit_results for all to authenticated
  using (auth.uid() = owner_id and exists (
    select 1 from public.opportunities o where o.id = public.audit_results.opportunity_id and o.owner_id = auth.uid()
  ) and exists (
    select 1 from public.requirements r where r.id = public.audit_results.requirement_id and r.opportunity_id = public.audit_results.opportunity_id and r.owner_id = auth.uid()
  ))
  with check (auth.uid() = owner_id and exists (
    select 1 from public.opportunities o where o.id = public.audit_results.opportunity_id and o.owner_id = auth.uid()
  ) and exists (
    select 1 from public.requirements r where r.id = public.audit_results.requirement_id and r.opportunity_id = public.audit_results.opportunity_id and r.owner_id = auth.uid()
  ));

-- Action Items:
drop policy if exists "action items own rows" on public.action_items;
create policy "action items own rows" on public.action_items for all to authenticated
  using (auth.uid() = owner_id and exists (
    select 1 from public.opportunities o where o.id = public.action_items.opportunity_id and o.owner_id = auth.uid()
  ))
  with check (auth.uid() = owner_id and exists (
    select 1 from public.opportunities o where o.id = public.action_items.opportunity_id and o.owner_id = auth.uid()
  ));
