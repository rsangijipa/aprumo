-- Aprumo · 0012 · Runtime de sessões: Retratação (desfazer de tentativa), pausas e latência.
-- Preserva prova documental imutável enquanto exclui tentativas retratadas dos cálculos clínicos.

create table public.trial_retractions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id),
  trial_client_event_id text not null,
  trial_record_id uuid references public.trial_records(id),
  reason text not null default 'desfazer pelo aplicador (erro de toque)',
  retracted_at timestamptz not null default now(),
  retracted_by uuid not null default auth.uid() references auth.users(id),
  unique (session_id, trial_client_event_id)
);
create trigger trial_retractions_append_only before update or delete on public.trial_retractions
  for each row execute function app.forbid_mutation();

create table public.session_pauses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id),
  paused_at timestamptz not null default now(),
  resumed_at timestamptz,
  reason text,
  recorded_by uuid not null default auth.uid() references auth.users(id)
);

-- Atualiza fact_trials para excluir tentativas retratadas
create or replace view public.fact_trials with (security_invoker = true) as
select tr.id, tr.session_id, s.case_id, tr.target_id, tr.phase, tr.response, tr.channel, tr.probe,
       pl.code as prompt_code, pl.intrusiveness as prompt_intrusiveness,
       tr.latency_ms, tr.position_of_target, tr.selected_position, tr.recorded_at,
       s.started_at as session_at, s.setting, s.implementer_id
from public.trial_records tr
join public.sessions s on s.id = tr.session_id
join public.prompt_levels pl on pl.id = tr.prompt_level_id
where not exists (
  select 1 from public.trial_retractions ret
  where ret.session_id = tr.session_id and ret.trial_client_event_id = tr.client_event_id
)
union all
select o.id, o.session_id, s.case_id, o.target_id, o.phase, o.response, 'natural', false,
       pl.code, pl.intrusiveness, null, null, null, o.recorded_at,
       s.started_at, s.setting, s.implementer_id
from public.opportunity_records o
join public.sessions s on s.id = o.session_id
join public.prompt_levels pl on pl.id = o.prompt_level_id;

-- ---------------------------------------------------------------- RLS
alter table public.trial_retractions enable row level security;
alter table public.session_pauses enable row level security;

create policy trial_retractions_select on public.trial_retractions for select to authenticated
  using (app.is_case_member(app.session_case(session_id)));

create policy trial_retractions_insert on public.trial_retractions for insert to authenticated
  with check (retracted_by = auth.uid() and exists (
    select 1 from public.sessions s where s.id = session_id and s.implementer_id = auth.uid()
  ));

create policy session_pauses_select on public.session_pauses for select to authenticated
  using (app.is_case_member(app.session_case(session_id)));

create policy session_pauses_insert on public.session_pauses for insert to authenticated
  with check (recorded_by = auth.uid() and exists (
    select 1 from public.sessions s where s.id = session_id and s.implementer_id = auth.uid()
  ));

create policy session_pauses_update on public.session_pauses for update to authenticated
  using (recorded_by = auth.uid() and exists (
    select 1 from public.sessions s where s.id = session_id and s.implementer_id = auth.uid()
  ));

grant select, insert on public.trial_retractions to authenticated;
grant select, insert, update on public.session_pauses to authenticated;
