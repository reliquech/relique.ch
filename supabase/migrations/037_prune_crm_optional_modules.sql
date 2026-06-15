-- =============================================================================
-- 037_prune_crm_optional_modules.sql
-- Phase 9: Remove optional CRM modules (Tasks, Automations, Pipeline, Custom Fields)
--
-- Brownfield: Apply via Supabase SQL Editor or `supabase db push` on existing DBs.
-- Fresh installs use 000_baseline.sql (already pruned).
-- =============================================================================

-- Drop FK column first
alter table public.deals drop column if exists pipeline_stage_id;

-- Drop dependent tables (order: values → fields → tasks → alert_rules → stages)
drop table if exists public.crm_custom_field_values;
drop table if exists public.crm_custom_fields;
drop table if exists public.tasks;
drop table if exists public.alert_rules;
drop table if exists public.pipeline_stages;

-- Rewrite dashboard RPC: group by deal status instead of pipeline stages
create or replace function public.crm_stage_velocity(start_date date, end_date date)
returns table (stage_id uuid, stage_name text, deal_count bigint, avg_days_in_stage numeric)
language sql stable as $$
  select
    null::uuid,
    d.status,
    count(*)::bigint,
    coalesce(
      avg(
        extract(
          day from (
            least(coalesce(d.closed_at, now()), (end_date + interval '1 day')::timestamp)
            - d.created_at
          )
        )
      ),
      0
    )::numeric
  from public.deals d
  where d.created_at::date between start_date and end_date
  group by d.status;
$$;
