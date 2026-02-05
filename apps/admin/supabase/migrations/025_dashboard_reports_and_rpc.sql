-- =============================================================================
-- Dashboard: saved reports table + crm_stage_velocity, crm_funnel_by_source
-- =============================================================================

create table if not exists public.dashboard_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  filters jsonb not null default '{}',
  chart_options jsonb not null default '{}',
  is_default boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index dashboard_reports_user_id_idx on public.dashboard_reports(user_id);
alter table public.dashboard_reports enable row level security;

create trigger set_dashboard_reports_updated_at
  before update on public.dashboard_reports
  for each row
  execute function public.handle_updated_at();

create policy "Users can manage own dashboard_reports"
  on public.dashboard_reports for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.crm_stage_velocity(start_date date, end_date date)
returns table (
  stage_id uuid,
  stage_name text,
  deal_count bigint,
  avg_days_in_stage numeric
)
language sql stable as $$
  select
    ps.id as stage_id,
    ps.name as stage_name,
    count(d.id)::bigint as deal_count,
    coalesce(avg(extract(day from (least(coalesce(d.closed_at, now()), (end_date + interval '1 day')::timestamp) - d.created_at))), 0)::numeric as avg_days_in_stage
  from public.pipeline_stages ps
  left join public.deals d on d.pipeline_stage_id = ps.id
    and d.created_at::date between start_date and end_date
  group by ps.id, ps.name, ps.position
  order by ps.position;
$$;

create or replace function public.crm_funnel_by_source(start_date date, end_date date)
returns table (
  source text,
  leads_count bigint,
  deals_count bigint,
  won_count bigint
)
language sql stable as $$
  select
    coalesce(nullif(l.source, ''), 'Unknown') as source,
    count(distinct l.id)::bigint as leads_count,
    count(distinct d.id)::bigint as deals_count,
    count(distinct d.id) filter (where d.status = 'won')::bigint as won_count
  from public.leads l
  left join public.deals d on d.lead_id = l.id
    and d.created_at::date between start_date and end_date
  where l.created_at::date between start_date and end_date
  group by coalesce(nullif(l.source, ''), 'Unknown')
  order by leads_count desc;
$$;
