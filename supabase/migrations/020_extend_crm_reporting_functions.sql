-- =============================================================================
-- CRM Reporting Extensions (funnel, lead source, deal aging)
-- =============================================================================

create or replace function public.crm_funnel_summary(start_date date, end_date date)
returns table (
  leads_created bigint,
  deals_created bigint,
  deals_won bigint
)
language sql
stable
as $$
  select
    (select count(*) from public.leads
      where created_at::date between start_date and end_date) as leads_created,
    (select count(*) from public.deals
      where created_at::date between start_date and end_date) as deals_created,
    (select count(*) from public.deals
      where status = 'won'
        and (coalesce(closed_at, updated_at))::date between start_date and end_date) as deals_won;
$$;

create or replace function public.crm_lead_source_performance(start_date date, end_date date)
returns table (
  source text,
  lead_count bigint,
  converted_count bigint
)
language sql
stable
as $$
  select
    coalesce(nullif(source, ''), 'Unknown') as source,
    count(*) as lead_count,
    count(*) filter (where converted_customer_id is not null) as converted_count
  from public.leads
  where created_at::date between start_date and end_date
  group by 1
  order by lead_count desc;
$$;

create or replace function public.crm_deal_aging(start_date date, end_date date)
returns table (
  bucket text,
  deal_count bigint,
  total_value numeric
)
language sql
stable
as $$
  with deals_cte as (
    select
      id,
      value,
      created_at::date as created_date,
      (current_date - created_at::date) as age_days
    from public.deals
    where status = 'open'
      and created_at::date between start_date and end_date
  )
  select
    case
      when age_days <= 7 then '0-7 days'
      when age_days <= 30 then '8-30 days'
      when age_days <= 60 then '31-60 days'
      else '61+ days'
    end as bucket,
    count(*) as deal_count,
    coalesce(sum(value), 0) as total_value
  from deals_cte
  group by 1
  order by
    case
      when bucket = '0-7 days' then 1
      when bucket = '8-30 days' then 2
      when bucket = '31-60 days' then 3
      else 4
    end;
$$;
