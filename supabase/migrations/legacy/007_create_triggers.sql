-- Create function to log audit events
create or replace function public.log_audit_event()
returns trigger as $$
begin
  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  ) values (
    auth.uid(),
    tg_op, -- INSERT, UPDATE, DELETE
    tg_table_name,
    coalesce(new.id::text, old.id::text),
    jsonb_build_object(
      'table', tg_table_name,
      'operation', tg_op,
      'old', to_jsonb(old),
      'new', to_jsonb(new)
    )
  );
  
  if tg_op = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$ language plpgsql security definer;

-- Note: Triggers are optional and can be heavy on high-traffic tables
-- Consider using application-level logging instead for better control
-- Uncomment to enable automatic audit logging:

-- create trigger marketplace_items_audit_trigger
--   after insert or update or delete on public.marketplace_items
--   for each row
--   execute function public.log_audit_event();

-- create trigger consigned_items_audit_trigger
--   after insert or update or delete on public.consigned_items
--   for each row
--   execute function public.log_audit_event();

