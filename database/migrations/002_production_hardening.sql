-- Additive upgrade for projects that already applied 001_initial_schema.sql.
alter table public.profiles
  add column if not exists marks_percentage numeric check (marks_percentage is null or (marks_percentage >= 0 and marks_percentage <= 100)),
  add column if not exists annual_income numeric check (annual_income is null or annual_income >= 0),
  add column if not exists skill_gaps text[] not null default '{}',
  add column if not exists documents text[] not null default '{}',
  add column if not exists location text,
  add column if not exists work_authorization boolean,
  add column if not exists team_size integer check (team_size is null or team_size between 1 and 100);

create table if not exists public.extraction_rate_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0)
);
alter table public.extraction_rate_limits enable row level security;

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

drop policy if exists "requirements own rows" on public.requirements;
create policy "requirements own rows" on public.requirements for all to authenticated
  using (auth.uid() = owner_id and exists (
    select 1 from public.opportunities o where o.id = public.requirements.opportunity_id and o.owner_id = auth.uid()
  ))
  with check (auth.uid() = owner_id and exists (
    select 1 from public.opportunities o where o.id = public.requirements.opportunity_id and o.owner_id = auth.uid()
  ));

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

drop policy if exists "action items own rows" on public.action_items;
create policy "action items own rows" on public.action_items for all to authenticated
  using (auth.uid() = owner_id and exists (
    select 1 from public.opportunities o where o.id = public.action_items.opportunity_id and o.owner_id = auth.uid()
  ))
  with check (auth.uid() = owner_id and exists (
    select 1 from public.opportunities o where o.id = public.action_items.opportunity_id and o.owner_id = auth.uid()
  ));
