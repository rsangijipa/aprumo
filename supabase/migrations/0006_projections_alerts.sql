-- Aprumo · 0006 · Projeções (derivadas e reconstruíveis) e alertas de decisão.
-- Os registros brutos nunca mudam; tudo aqui pode ser recalculado.

-- Uma linha por tentativa/oportunidade, de qualquer canal, com dica normalizada (0 = independente).
create view public.fact_trials with (security_invoker = true) as
select tr.id, tr.session_id, s.case_id, tr.target_id, tr.phase, tr.response, tr.channel, tr.probe,
       pl.code as prompt_code, pl.intrusiveness as prompt_intrusiveness,
       tr.latency_ms, tr.position_of_target, tr.selected_position, tr.recorded_at,
       s.started_at as session_at, s.setting, s.implementer_id
from public.trial_records tr
join public.sessions s on s.id = tr.session_id
join public.prompt_levels pl on pl.id = tr.prompt_level_id
union all
select o.id, o.session_id, s.case_id, o.target_id, o.phase, o.response, 'natural', false,
       pl.code, pl.intrusiveness, null, null, null, o.recorded_at,
       s.started_at, s.setting, s.implementer_id
from public.opportunity_records o
join public.sessions s on s.id = o.session_id
join public.prompt_levels pl on pl.id = o.prompt_level_id;

-- Alvo × sessão. Acerto com dica NUNCA conta como independente; percentuais nulos sem amostra.
create view public.fact_target_session with (security_invoker = true) as
select target_id, session_id, case_id, min(session_at) as session_at, min(phase::text) as phase, bool_and(probe) as probe,
       count(*) as opportunities,
       count(*) filter (where response = 'correct' and prompt_intrusiveness = 0) as correct_independent,
       count(*) filter (where response = 'correct' and prompt_intrusiveness > 0) as correct_prompted,
       count(*) filter (where response = 'incorrect') as incorrect,
       count(*) filter (where response = 'no_response') as no_response,
       round(100.0 * count(*) filter (where response = 'correct' and prompt_intrusiveness = 0) / nullif(count(*), 0), 2) as pct_independent,
       round(100.0 * count(*) filter (where response = 'correct' and prompt_intrusiveness > 0) / nullif(count(*), 0), 2) as pct_prompted,
       round(avg(prompt_intrusiveness), 3) as mean_prompt_level,
       percentile_cont(0.5) within group (order by latency_ms) filter (where response = 'correct' and latency_ms is not null) as median_latency_ms,
       mode() within group (order by channel) as channel
from public.fact_trials
group by target_id, session_id, case_id;

-- Comportamento × sessão (frequência; outras medidas usam a definição).
create view public.fact_behavior_session with (security_invoker = true) as
select be.behavior_definition_id, be.session_id, s.case_id, s.started_at as session_at,
       count(*) filter (where be.kind = 'occurrence') as occurrences,
       sum(be.duration_s) as total_duration_s,
       bool_or(be.risk_episode) as risk_episode
from public.behavior_events be
join public.sessions s on s.id = be.session_id
group by be.behavior_definition_id, be.session_id, s.case_id, s.started_at;

-- ---------------------------------------------------------------- alertas
-- Gerados pelo motor de regras (clinical-core, executado no servidor após cada sincronização).
create table public.decision_alerts (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  rule_id text not null check (rule_id ~ '^R([1-9]|1[0-5])$'),
  severity text not null check (severity in ('priority', 'attention', 'info')),
  subject_id text not null,
  subject_name text not null,
  title text not null,
  evidence text not null,
  suggested_action text not null,
  basis text not null,
  rule_params jsonb not null default '{}'::jsonb,
  engine_version text not null,
  created_at timestamptz not null default now(),
  status text not null default 'open' check (status in ('open', 'accepted', 'dismissed')),
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  decision_reason text,
  check ((status = 'open') = (decided_at is null))
);
-- Um alerta aberto por regra e sujeito.
create unique index decision_alerts_one_open on public.decision_alerts (case_id, rule_id, subject_id) where status = 'open';

-- Decisão do supervisor sobre o alerta: sempre com justificativa, nunca automática (P3).
create function public.decide_alert(p_alert uuid, p_status text, p_reason text) returns void
language plpgsql security definer set search_path = '' as $$
declare v public.decision_alerts;
begin
  select * into v from public.decision_alerts where id = p_alert for update;
  if not found or not app.is_case_lead(v.case_id) then
    raise exception 'only supervision can decide on alerts' using errcode = '42501';
  end if;
  if v.status <> 'open' then raise exception 'alert already decided'; end if;
  if p_status not in ('accepted', 'dismissed') then raise exception 'invalid status'; end if;
  if p_reason is null or length(trim(p_reason)) < 5 then raise exception 'a justification is required'; end if;
  update public.decision_alerts
     set status = p_status, decided_by = auth.uid(), decided_at = now(), decision_reason = p_reason
   where id = p_alert;
  insert into public.audit_log (actor_id, case_id, action, resource_type, resource_id, detail)
  values (auth.uid(), v.case_id, 'update', 'decision_alert', p_alert::text, jsonb_build_object('status', p_status, 'rule', v.rule_id));
end $$;

-- Alertas não são editados nem apagados fora de decide_alert (trilha para calibrar as regras).
create function app.guard_alert_update() returns trigger language plpgsql as $$
begin
  if (to_jsonb(new) - array['status','decided_by','decided_at','decision_reason']) is distinct from
     (to_jsonb(old) - array['status','decided_by','decided_at','decision_reason']) then
    raise exception 'alert content is immutable';
  end if;
  return new;
end $$;
create trigger decision_alerts_guard before update on public.decision_alerts
  for each row execute function app.guard_alert_update();
create trigger decision_alerts_no_delete before delete on public.decision_alerts
  for each row execute function app.forbid_mutation();

alter table public.decision_alerts enable row level security;
create policy alerts_select on public.decision_alerts for select to authenticated using (app.is_case_member(case_id));
-- Inserção só pelo motor (service role); nenhum usuário cria alerta manualmente.

grant select on public.fact_trials, public.fact_target_session, public.fact_behavior_session to authenticated;
grant select on public.decision_alerts to authenticated;
grant execute on function public.decide_alert(uuid, text, text) to authenticated;
