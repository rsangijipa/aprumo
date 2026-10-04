-- Aprumo · 0015 · Adiar alertas e versionamento de motor (Doc B §8.4; Doc A §31; Plano V2 F4).

alter table public.decision_alerts
  add column if not exists snoozed_until timestamptz;

-- Atualiza restrição de status para incluir 'snoozed'
do $$
declare r record;
begin
  for r in (
    select conname
    from pg_constraint
    where conrelid = 'public.decision_alerts'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%status%'
  ) loop
    execute 'alter table public.decision_alerts drop constraint ' || quote_ident(r.conname);
  end loop;
end $$;

alter table public.decision_alerts
  add constraint decision_alerts_status_check
  check (status in ('open', 'accepted', 'dismissed', 'snoozed'));

alter table public.decision_alerts
  add constraint decision_alerts_snooze_valid
  check (status <> 'snoozed' or (snoozed_until is not null and snoozed_until > created_at));

-- Atualiza gatilho de guarda de imutabilidade para permitir 'snoozed_until'
create or replace function app.guard_alert_update() returns trigger language plpgsql as $$
begin
  if (to_jsonb(new) - array['status','decided_by','decided_at','decision_reason','snoozed_until']) is distinct from
     (to_jsonb(old) - array['status','decided_by','decided_at','decision_reason','snoozed_until']) then
    raise exception 'alert content is immutable';
  end if;
  return new;
end $$;

-- RPC para adiar alerta com justificativa e data de reavaliação
create or replace function public.snooze_alert(p_alert uuid, p_until timestamptz, p_reason text) returns void
language plpgsql security definer set search_path = '' as $$
declare v public.decision_alerts;
begin
  select * into v from public.decision_alerts where id = p_alert for update;
  if not found or not app.is_case_lead(v.case_id) then
    raise exception 'only supervision can snooze alerts' using errcode = '42501';
  end if;
  if v.status not in ('open', 'snoozed') then
    raise exception 'only open or snoozed alerts can be snoozed';
  end if;
  if p_until is null or p_until <= now() then
    raise exception 'snooze date must be in the future';
  end if;
  if p_reason is null or length(trim(p_reason)) < 5 then
    raise exception 'a justification is required';
  end if;

  update public.decision_alerts
     set status = 'snoozed',
         snoozed_until = p_until,
         decided_by = auth.uid(),
         decided_at = now(),
         decision_reason = p_reason
   where id = p_alert;

  insert into public.audit_log (actor_id, case_id, action, resource_type, resource_id, detail)
  values (auth.uid(), v.case_id, 'update', 'decision_alert', p_alert::text,
          jsonb_build_object('status', 'snoozed', 'snoozed_until', p_until, 'rule', v.rule_id));
end $$;

grant execute on function public.snooze_alert(uuid, timestamptz, text) to authenticated;
