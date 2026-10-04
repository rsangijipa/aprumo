-- Aprumo · 0004 · Sessão, registros brutos imutáveis, eventos digitais, ingestão idempotente,
-- quarentena e sessão infantil por token.

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  plan_id uuid not null references public.intervention_plans(id),
  model public.intervention_model not null,
  setting text not null check (setting in ('clinic', 'home', 'school', 'community', 'telehealth')),
  implementer_id uuid not null references auth.users(id),
  supervisor_present boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed', 'cancelled')),
  started_at timestamptz,
  ended_at timestamptz,
  screen_seconds int not null default 0 check (screen_seconds >= 0),
  created_at timestamptz not null default now()
);

create function app.session_model_matches_plan() returns trigger language plpgsql as $$
declare v_plan public.intervention_plans;
begin
  select * into v_plan from public.intervention_plans where id = new.plan_id;
  if v_plan.case_id <> new.case_id then raise exception 'plan does not belong to case'; end if;
  if v_plan.status <> 'active' then raise exception 'sessions require an active plan'; end if;
  if new.model <> v_plan.model then raise exception 'session model must match plan model'; end if;
  return new;
end $$;
create trigger sessions_model before insert on public.sessions
  for each row execute function app.session_model_matches_plan();

-- Sessão concluída não volta a ser editada (exceto pelo próprio fluxo de encerramento).
create function app.lock_completed_session() returns trigger language plpgsql as $$
begin
  if old.status in ('completed', 'cancelled') then
    raise exception 'session is closed; use an addendum';
  end if;
  if new.model is distinct from old.model or new.plan_id is distinct from old.plan_id then
    raise exception 'session model and plan are immutable';
  end if;
  return new;
end $$;
create trigger sessions_lock before update on public.sessions
  for each row execute function app.lock_completed_session();

create function app.session_case(p_session uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select case_id from public.sessions where id = p_session;
$$;
create function app.session_model(p_session uuid) returns public.intervention_model
language sql stable security definer set search_path = '' as $$
  select model from public.sessions where id = p_session;
$$;
create function app.session_open(p_session uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select status in ('draft', 'active', 'paused') from public.sessions where id = p_session;
$$;

create table public.session_blocks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  position int not null,
  kind text not null check (kind in ('DTT', 'NET', 'chain', 'digital', 'denver_routine', 'break', 'behavior')),
  config jsonb not null default '{}'::jsonb,
  unique (session_id, position)
);

-- ---------------------------------------------------------------- registros ABA
create table public.trial_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id),
  block_id uuid references public.session_blocks(id),
  target_id uuid not null references public.targets(id),
  phase public.target_phase not null,
  stimulus_id uuid references public.stimuli(id),
  trial_index int not null check (trial_index >= 0),
  response text not null check (response in ('correct', 'incorrect', 'no_response')),
  prompt_level_id uuid not null references public.prompt_levels(id),
  prompt_source text not null default 'therapist' check (prompt_source in ('none', 'therapist', 'built_in')),
  latency_ms int check (latency_ms >= 0),
  channel text not null check (channel in ('table', 'digital', 'natural', 'home')),
  probe boolean not null default false,
  presented uuid[],
  position_of_target int,
  selected_position int,
  activity_run_id uuid,
  client_event_id text not null,
  recorded_at timestamptz not null,
  received_at timestamptz not null default now(),
  recorded_by uuid not null default auth.uid() references auth.users(id),
  unique (session_id, client_event_id)
);

create table public.opportunity_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id),
  target_id uuid not null references public.targets(id),
  phase public.target_phase not null,
  initiated_by text not null check (initiated_by in ('child', 'adult')),
  response text not null check (response in ('correct', 'incorrect', 'no_response')),
  prompt_level_id uuid not null references public.prompt_levels(id),
  context text,
  client_event_id text not null,
  recorded_at timestamptz not null,
  received_at timestamptz not null default now(),
  recorded_by uuid not null default auth.uid() references auth.users(id),
  unique (session_id, client_event_id)
);

create table public.chain_step_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id),
  target_id uuid not null references public.targets(id),
  step_order int not null,
  prompt_level_id uuid not null references public.prompt_levels(id),
  attempt int not null default 1,
  client_event_id text not null,
  recorded_at timestamptz not null,
  recorded_by uuid not null default auth.uid() references auth.users(id),
  unique (session_id, client_event_id)
);

-- ---------------------------------------------------------------- registros Denver
create table public.denver_routine_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id),
  routine_type text not null check (routine_type in ('sensory_social', 'object', 'snack', 'book', 'motor', 'self_care')),
  theme text,
  started_at timestamptz not null,
  ended_at timestamptz,
  initiated_by text not null check (initiated_by in ('child', 'adult')),
  phases_observed text[] not null default '{}',
  client_event_id text not null,
  recorded_by uuid not null default auth.uid() references auth.users(id),
  unique (session_id, client_event_id)
);

create table public.denver_step_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id),
  routine_record_id uuid references public.denver_routine_records(id),
  step_id uuid not null references public.denver_steps(id),
  interval_index int not null check (interval_index >= 0),
  score text not null check (score in ('pass', 'partial', 'fail')),
  prompt_note text,
  client_event_id text not null,
  recorded_at timestamptz not null,
  recorded_by uuid not null default auth.uid() references auth.users(id),
  unique (session_id, client_event_id)
);

-- ---------------------------------------------------------------- comportamento e notas
create table public.behavior_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id),
  behavior_definition_id uuid not null references public.behavior_definitions(id),
  kind text not null check (kind in ('occurrence', 'start', 'end', 'interval')),
  occurred_at timestamptz not null,
  duration_s numeric,
  interval_index int,
  antecedent text,
  consequence text,
  activity text,
  demand_present boolean,
  risk_episode boolean not null default false,
  client_event_id text not null,
  recorded_by uuid not null default auth.uid() references auth.users(id),
  unique (session_id, client_event_id)
);

create table public.session_notes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id),
  author_id uuid not null default auth.uid() references auth.users(id),
  kind text not null check (kind in ('clinical', 'quick')),
  content text not null check (length(content) >= 1),
  created_at timestamptz not null default now()
);

-- Imposição do modelo único nos registros (P1).
create function app.record_requires_model() returns trigger language plpgsql as $$
declare v_expected public.intervention_model := tg_argv[0]::public.intervention_model;
begin
  if app.session_model(new.session_id) <> v_expected then
    raise exception '% records are only valid in % sessions', tg_table_name, v_expected;
  end if;
  if not app.session_open(new.session_id) then
    raise exception 'session is closed';
  end if;
  return new;
end $$;
create trigger trial_requires_aba before insert on public.trial_records
  for each row execute function app.record_requires_model('ABA');
create trigger opportunity_requires_aba before insert on public.opportunity_records
  for each row execute function app.record_requires_model('ABA');
create trigger chain_requires_aba before insert on public.chain_step_records
  for each row execute function app.record_requires_model('ABA');
create trigger routine_requires_denver before insert on public.denver_routine_records
  for each row execute function app.record_requires_model('DENVER');
create trigger step_score_requires_denver before insert on public.denver_step_scores
  for each row execute function app.record_requires_model('DENVER');

-- Imutabilidade.
create trigger trial_records_append_only before update or delete on public.trial_records for each row execute function app.forbid_mutation();
create trigger opportunity_records_append_only before update or delete on public.opportunity_records for each row execute function app.forbid_mutation();
create trigger chain_step_records_append_only before update or delete on public.chain_step_records for each row execute function app.forbid_mutation();
create trigger denver_step_scores_append_only before update or delete on public.denver_step_scores for each row execute function app.forbid_mutation();
create trigger behavior_events_append_only before update or delete on public.behavior_events for each row execute function app.forbid_mutation();
create trigger session_notes_append_only before update or delete on public.session_notes for each row execute function app.forbid_mutation();

-- Nota clínica obrigatória para encerrar sessão.
create function public.complete_session(p_session uuid, p_clinical_note text) returns void
language plpgsql security invoker set search_path = '' as $$
declare v_case uuid := app.session_case(p_session);
begin
  if p_clinical_note is null or length(trim(p_clinical_note)) < 10 then
    raise exception 'a clinical note is required to close the session';
  end if;
  insert into public.session_notes (session_id, kind, content) values (p_session, 'clinical', p_clinical_note);
  update public.sessions set status = 'completed', ended_at = coalesce(ended_at, now()) where id = p_session;
  insert into public.case_timeline_events (case_id, kind, title, detail, author_id)
  values (v_case, 'session_closed', 'Sessão encerrada', jsonb_build_object('session_id', p_session), auth.uid());
end $$;

-- ---------------------------------------------------------------- eventos digitais
create table public.app_registry (
  app_id text not null,
  version text not null,
  manifest jsonb not null,
  status text not null default 'review' check (status in ('review', 'published', 'blocked')),
  published_at timestamptz,
  primary key (app_id, version)
);

create table public.activity_runs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id),
  block_id uuid references public.session_blocks(id),
  app_id text not null,
  app_version text not null,
  config jsonb not null,
  status text not null default 'running' check (status in ('running', 'completed', 'aborted')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  foreign key (app_id, app_version) references public.app_registry(app_id, version)
);

create table public.clinical_events (
  id bigint generated always as identity primary key,
  activity_run_id uuid not null references public.activity_runs(id),
  event_id text not null,
  sequence int not null,
  type text not null,
  protocol_version text not null,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  payload jsonb not null,
  unique (activity_run_id, event_id)
);
create trigger clinical_events_append_only before update or delete on public.clinical_events
  for each row execute function app.forbid_mutation();

create table public.event_quarantine (
  id bigint generated always as identity primary key,
  activity_run_id uuid,
  app_id text,
  app_version text,
  raw jsonb not null,
  reason text not null,
  received_at timestamptz not null default now()
);

create function app.run_session(p_run uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select session_id from public.activity_runs where id = p_run;
$$;

-- Ingestão idempotente de tentativas (mesa ou digital). Retorna os client_event_id persistidos,
-- incluindo os que já existiam: o cliente só remove da outbox o que recebeu de volta.
create function public.ingest_trial_records(p_session uuid, p_records jsonb)
returns setof text
language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.trial_records (
    session_id, block_id, target_id, phase, stimulus_id, trial_index, response, prompt_level_id,
    prompt_source, latency_ms, channel, probe, position_of_target, selected_position,
    activity_run_id, client_event_id, recorded_at
  )
  select p_session, (r->>'block_id')::uuid, (r->>'target_id')::uuid, (r->>'phase')::public.target_phase,
         (r->>'stimulus_id')::uuid, (r->>'trial_index')::int, r->>'response', (r->>'prompt_level_id')::uuid,
         coalesce(r->>'prompt_source', 'therapist'), (r->>'latency_ms')::int, r->>'channel',
         coalesce((r->>'probe')::boolean, false), (r->>'position_of_target')::int, (r->>'selected_position')::int,
         (r->>'activity_run_id')::uuid, r->>'client_event_id', (r->>'recorded_at')::timestamptz
  from jsonb_array_elements(p_records) r
  on conflict (session_id, client_event_id) do nothing;

  return query
    select t.client_event_id from public.trial_records t
    where t.session_id = p_session
      and t.client_event_id in (select r->>'client_event_id' from jsonb_array_elements(p_records) r);
end $$;

-- ---------------------------------------------------------------- sessão infantil
create table public.child_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id),
  child_id uuid not null references public.children(id),
  token_hash bytea not null unique,
  adaptation jsonb not null,
  allowed_apps text[] not null,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  check (expires_at <= created_at + interval '4 hours')
);

-- Retorna o token em claro uma única vez; só o hash é armazenado.
create function public.open_child_session(p_session uuid, p_adaptation jsonb, p_apps text[], p_minutes int default 45)
returns text
language plpgsql security definer set search_path = '' as $$
declare v_token text := encode(extensions.gen_random_bytes(32), 'hex'); v_child uuid; v_case uuid := app.session_case(p_session);
begin
  if not app.has_case_role(v_case, array['responsible','supervisor','implementer']::public.case_role[]) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  select child_id into v_child from public.cases where id = v_case;
  insert into public.child_sessions (session_id, child_id, token_hash, adaptation, allowed_apps, created_by, expires_at)
  values (p_session, v_child, extensions.digest(v_token, 'sha256'), p_adaptation, p_apps, auth.uid(),
          now() + make_interval(mins => least(greatest(p_minutes, 5), 240)));
  return v_token;
end $$;

-- ---------------------------------------------------------------- RLS
alter table public.sessions enable row level security;
alter table public.session_blocks enable row level security;
alter table public.trial_records enable row level security;
alter table public.opportunity_records enable row level security;
alter table public.chain_step_records enable row level security;
alter table public.denver_routine_records enable row level security;
alter table public.denver_step_scores enable row level security;
alter table public.behavior_events enable row level security;
alter table public.session_notes enable row level security;
alter table public.app_registry enable row level security;
alter table public.activity_runs enable row level security;
alter table public.clinical_events enable row level security;
alter table public.event_quarantine enable row level security;
alter table public.child_sessions enable row level security;

create policy sessions_select on public.sessions for select to authenticated using (app.is_case_member(case_id));
create policy sessions_insert on public.sessions for insert to authenticated
  with check (implementer_id = auth.uid()
    and app.has_case_role(case_id, array['responsible','supervisor','implementer']::public.case_role[]));
create policy sessions_update on public.sessions for update to authenticated
  using (implementer_id = auth.uid() or app.is_case_lead(case_id));

create policy blocks_select on public.session_blocks for select to authenticated using (app.is_case_member(app.session_case(session_id)));
create policy blocks_write on public.session_blocks for all to authenticated
  using (exists (select 1 from public.sessions s where s.id = session_id and (s.implementer_id = auth.uid() or app.is_case_lead(s.case_id))))
  with check (exists (select 1 from public.sessions s where s.id = session_id and (s.implementer_id = auth.uid() or app.is_case_lead(s.case_id))));

-- Registros: leitura pelo time do caso; escrita só pelo aplicador da própria sessão.
do $$
declare t text;
begin
  foreach t in array array['trial_records','opportunity_records','chain_step_records','denver_routine_records','denver_step_scores','behavior_events'] loop
    execute format('create policy %1$s_select on public.%1$s for select to authenticated using (app.is_case_member(app.session_case(session_id)))', t);
    execute format('create policy %1$s_insert on public.%1$s for insert to authenticated with check (recorded_by = auth.uid() and exists (select 1 from public.sessions s where s.id = session_id and s.implementer_id = auth.uid()))', t);
    execute format('grant select, insert on public.%1$s to authenticated', t);
  end loop;
end $$;

create policy notes_select on public.session_notes for select to authenticated using (app.is_case_member(app.session_case(session_id)));
create policy notes_insert on public.session_notes for insert to authenticated
  with check (author_id = auth.uid() and app.is_case_member(app.session_case(session_id)));

create policy registry_select on public.app_registry for select to authenticated using (true);

create policy runs_select on public.activity_runs for select to authenticated using (app.is_case_member(app.session_case(session_id)));
create policy runs_write on public.activity_runs for all to authenticated
  using (exists (select 1 from public.sessions s where s.id = session_id and s.implementer_id = auth.uid()))
  with check (exists (select 1 from public.sessions s where s.id = session_id and s.implementer_id = auth.uid()));

create policy events_select on public.clinical_events for select to authenticated
  using (app.is_case_member(app.session_case(app.run_session(activity_run_id))));
create policy events_insert on public.clinical_events for insert to authenticated
  with check (exists (select 1 from public.activity_runs r join public.sessions s on s.id = r.session_id
                      where r.id = activity_run_id and s.implementer_id = auth.uid()));

create policy quarantine_insert on public.event_quarantine for insert to authenticated with check (true);

create policy child_sessions_select on public.child_sessions for select to authenticated
  using (app.is_case_member(app.session_case(session_id)));
create policy child_sessions_revoke on public.child_sessions for update to authenticated
  using (created_by = auth.uid() or app.is_case_lead(app.session_case(session_id)));

grant select, insert, update on public.sessions, public.session_blocks, public.activity_runs to authenticated;
grant select, insert on public.session_notes, public.clinical_events to authenticated;
grant select on public.app_registry to authenticated;
grant insert on public.event_quarantine to authenticated;
grant select, update on public.child_sessions to authenticated;
grant execute on function public.ingest_trial_records(uuid, jsonb) to authenticated;
grant execute on function public.complete_session(uuid, text) to authenticated;
grant execute on function public.open_child_session(uuid, jsonb, text[], int) to authenticated;
