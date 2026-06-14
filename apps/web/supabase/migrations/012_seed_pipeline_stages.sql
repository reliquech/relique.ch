-- =============================================================================
-- Seed default pipeline stages (run only when table is empty)
-- =============================================================================

insert into public.pipeline_stages (name, position, color, is_default)
select v.name, v.position, v.color, v.is_default
from (values
  ('New', 1, '#0055FF', true),
  ('Qualified', 2, '#00CCFF', false),
  ('Proposal', 3, '#10B981', false),
  ('Negotiation', 4, '#F59E0B', false),
  ('Won', 5, '#10B981', false),
  ('Lost', 6, '#EF4444', false)
) as v(name, position, color, is_default)
where not exists (select 1 from public.pipeline_stages limit 1);
