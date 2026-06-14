-- =============================================================================
-- CRM Reporting Functions (Dashboard)
-- =============================================================================

create or replace function public.crm_dashboard_summary(start_date date, end_date date)
returns table (
  new_customers bigint,
  new_leads bigint,
  new_messages bigint,
  open_deals bigint,
  won_deals bigint,
  lost_deals bigint,
  pipeline_value numeric,
  pipeline_open_value numeric
) language sql stable as $$
  with customers_cte as (
    select count(*) as count
    from public.customers
    where created_at >= start_date
      and created_at < (end_date + interval '1 day')
  ),
  leads_cte as (
    select count(*) as count
    from public.leads
    where created_at >= start_date
      and created_at < (end_date + interval '1 day')
  ),
  messages_cte as (
    select count(*) as count
    from public.messages
    where created_at >= start_date
      and created_at < (end_date + interval '1 day')
  ),
  deals_cte as (
    select
      coalesce(sum(case when status = 'open' then 1 else 0 end), 0) as open_deals,
      coalesce(sum(case when status = 'won' then 1 else 0 end), 0) as won_deals,
      coalesce(sum(case when status = 'lost' then 1 else 0 end), 0) as lost_deals,
      coalesce(sum(value), 0) as pipeline_value,
      coalesce(sum(case when status = 'open' then value else 0 end), 0) as pipeline_open_value
    from public.deals
    where created_at >= start_date
      and created_at < (end_date + interval '1 day')
  )
  select
    customers_cte.count,
    leads_cte.count,
    messages_cte.count,
    deals_cte.open_deals,
    deals_cte.won_deals,
    deals_cte.lost_deals,
    deals_cte.pipeline_value,
    deals_cte.pipeline_open_value
  from customers_cte, leads_cte, messages_cte, deals_cte;
$$;

create or replace function public.crm_activity_series(start_date date, end_date date)
returns table (
  date date,
  new_leads bigint,
  new_deals bigint,
  new_messages bigint
) language sql stable as $$
  with dates as (
    select generate_series(start_date, end_date, interval '1 day')::date as date
  ),
  leads_cte as (
    select created_at::date as date, count(*) as count
    from public.leads
    where created_at >= start_date
      and created_at < (end_date + interval '1 day')
    group by 1
  ),
  deals_cte as (
    select created_at::date as date, count(*) as count
    from public.deals
    where created_at >= start_date
      and created_at < (end_date + interval '1 day')
    group by 1
  ),
  messages_cte as (
    select created_at::date as date, count(*) as count
    from public.messages
    where created_at >= start_date
      and created_at < (end_date + interval '1 day')
    group by 1
  )
  select
    d.date,
    coalesce(l.count, 0) as new_leads,
    coalesce(de.count, 0) as new_deals,
    coalesce(m.count, 0) as new_messages
  from dates d
  left join leads_cte l on l.date = d.date
  left join deals_cte de on de.date = d.date
  left join messages_cte m on m.date = d.date
  order by d.date;
$$;
