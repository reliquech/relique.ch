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
  with age_buckets as (
    select *
    from (values
      ('0-7 days', 1),
      ('8-30 days', 2),
      ('31-60 days', 3),
      ('61+ days', 4)
    ) as t(bucket, sort_order)
  ),
  deals_cte as (
    select
      value,
      case
        when (current_date - created_at::date) <= 7 then '0-7 days'
        when (current_date - created_at::date) <= 30 then '8-30 days'
        when (current_date - created_at::date) <= 60 then '31-60 days'
        else '61+ days'
      end as bucket
    from public.deals
    where status = 'open'
      and created_at::date between start_date and end_date
  ),
  agg as (
    select
      bucket,
      count(*) as deal_count,
      coalesce(sum(value), 0) as total_value
    from deals_cte
    group by bucket
  )
  select
    b.bucket,
    coalesce(a.deal_count, 0) as deal_count,
    coalesce(a.total_value, 0) as total_value
  from age_buckets b
  left join agg a on a.bucket = b.bucket
  order by b.sort_order;
$$;
