-- Aprumo · 0003 · Bibliotecas e plano individual (ABA ou Denver, nunca híbrido).

create type public.intervention_model as enum ('ABA', 'DENVER');
create type public.target_phase as enum ('baseline', 'acquisition', 'maintenance', 'generalization', 'mastered', 'review', 'suspended');
create type public.repertoire as enum ('mand', 'tact', 'echoic', 'intraverbal', 'listener', 'imitation', 'matching', 'social', 'play', 'adl', 'academic', 'alternative_behavior');

-- ---------------------------------------------------------------- bibliotecas
create table public.prompt_hierarchies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  name text not null,
  kind text not null check (kind in ('most_to_least', 'least_to_most', 'time_delay')),
  created_at timestamptz not null default now()
);

create table public.prompt_levels (
  id uuid primary key default gen_random_uuid(),
  hierarchy_id uuid not null references public.prompt_hierarchies(id) on delete cascade,
  position int not null,
  code text not null check (code ~ '^[A-Z0-9_]{1,16}$'),
  label text not null,
  intrusiveness numeric(3,2) not null check (intrusiveness between 0 and 1),
  unique (hierarchy_id, position),
  unique (hierarchy_id, code)
);

-- Critério versionado: alterar cria nova linha; sessões antigas guardam a versão usada.
create table public.mastery_criteria (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  name text not null,
  version int not null default 1,
  min_independent_pct numeric(5,2) not null default 90 check (min_independent_pct between 0 and 100),
  sessions_required int not null default 2 check (sessions_required >= 1),
  consecutive boolean not null default true,
  min_opportunities_per_session int not null default 10,
  min_implementers int not null default 1,
  min_settings int not null default 1,
  maintenance_probe_weeks int[] not null default '{1,2,4}',
  maintenance_min_pct numeric(5,2) not null default 80,
  created_at timestamptz not null default now()
);
create trigger mastery_criteria_immutable before update or delete on public.mastery_criteria
  for each row execute function app.forbid_mutation();

create table public.stimulus_sets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  name text not null,
  kind text not null default 'picture'
);

create table public.stimuli (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.stimulus_sets(id) on delete cascade,
  label text not null,
  art_key text,               -- acervo compartilhado (packages/stimuli)
  media_path text,            -- storage, para fotos próprias
  source text not null default 'aprumo',
  license text not null default 'proprietary-aprumo',
  is_child_specific boolean not null default false,
  consent_id uuid references public.consents(id),
  check (art_key is not null or media_path is not null)
);

create table public.behavior_definitions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  version int not null default 1,
  name text not null,
  topography text not null,
  examples text[] not null default '{}',
  non_examples text[] not null default '{}',
  onset text not null,
  offset_rule text not null,
  measure text not null check (measure in ('frequency', 'duration', 'latency', 'partial_interval', 'whole_interval', 'momentary')),
  measure_params jsonb not null default '{}'::jsonb,
  hypothesized_function text check (hypothesized_function in ('attention', 'escape', 'tangible', 'automatic', 'unknown')),
  risk boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- plano
create table public.intervention_plans (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  model public.intervention_model not null,
  version int not null default 1,
  status text not null default 'draft' check (status in ('draft', 'active', 'closed')),
  starts_on date,
  review_on date,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  supersedes_plan_id uuid references public.intervention_plans(id),
  transition_reason text,
  created_at timestamptz not null default now()
);
create unique index plans_one_active_per_case on public.intervention_plans (case_id) where status = 'active';

create function app.lock_plan_model() returns trigger language plpgsql as $$
begin
  if old.status <> 'draft' and new.model is distinct from old.model then
    raise exception 'model is immutable after approval; close the plan and open a new one';
  end if;
  if old.status = 'closed' and new.status <> 'closed' then
    raise exception 'a closed plan cannot be reopened';
  end if;
  return new;
end $$;
create trigger plans_lock_model before update on public.intervention_plans
  for each row execute function app.lock_plan_model();

create function app.plan_model(p_plan uuid) returns public.intervention_model
language sql stable security definer set search_path = '' as $$
  select model from public.intervention_plans where id = p_plan;
$$;
create function app.plan_case(p_plan uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select case_id from public.intervention_plans where id = p_plan;
$$;

-- ABA ---------------------------------------------------------------
create table public.plan_goals (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.intervention_plans(id),
  domain text not null,
  description text not null,
  priority int not null default 2 check (priority between 1 and 3),
  status text not null default 'active' check (status in ('active', 'achieved', 'paused', 'closed'))
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.intervention_plans(id),
  goal_id uuid not null references public.plan_goals(id),
  name text not null,
  repertoire public.repertoire not null,
  procedure text not null check (procedure in ('DTT', 'NET', 'chaining', 'fluency')),
  operational_definition text not null,
  sd_description text not null,
  prompt_hierarchy_id uuid not null references public.prompt_hierarchies(id),
  error_correction text not null,
  default_mastery_id uuid not null references public.mastery_criteria(id),
  reinforcement_schedule text not null default 'CRF'
);

create table public.targets (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id),
  name text not null,
  stimulus_set_id uuid references public.stimulus_sets(id),
  stimulus_id uuid references public.stimuli(id),
  mastery_criteria_id uuid not null references public.mastery_criteria(id),
  current_phase public.target_phase not null default 'baseline',
  phase_changed_at timestamptz not null default now(),
  phase_changed_by uuid references auth.users(id),
  teaching_channel text not null default 'table' check (teaching_channel in ('table', 'digital', 'natural')),
  status text not null default 'active' check (status in ('active', 'archived'))
);

-- Denver -------------------------------------------------------------
create table public.denver_cycles (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.intervention_plans(id),
  starts_on date not null,
  ends_on date not null,
  curriculum_assessment_ref text,
  check (ends_on > starts_on)
);

create table public.denver_objectives (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.denver_cycles(id),
  domain text not null,
  level int not null check (level between 1 and 4),
  description text not null,     -- redigido pelo profissional; textos da Lista só com licença
  mastery_rule text not null,
  status text not null default 'active' check (status in ('active', 'mastered', 'paused'))
);

create table public.denver_steps (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid not null references public.denver_objectives(id),
  position int not null,
  description text not null,
  status text not null default 'not_started' check (status in ('not_started', 'acquisition', 'mastered')),
  mastered_at timestamptz,
  unique (objective_id, position)
);

-- Garante que tabelas ABA só recebem planos ABA e Denver só planos Denver.
create function app.require_plan_model() returns trigger language plpgsql as $$
declare v_plan uuid; v_expected public.intervention_model := tg_argv[0]::public.intervention_model;
begin
  if tg_table_name = 'denver_objectives' then
    select plan_id into v_plan from public.denver_cycles where id = new.cycle_id;
  else
    v_plan := new.plan_id;
  end if;
  if app.plan_model(v_plan) <> v_expected then
    raise exception '% only accepts % plans', tg_table_name, v_expected;
  end if;
  return new;
end $$;
create trigger plan_goals_aba before insert or update on public.plan_goals
  for each row execute function app.require_plan_model('ABA');
create trigger programs_aba before insert or update on public.programs
  for each row execute function app.require_plan_model('ABA');
create trigger denver_cycles_denver before insert or update on public.denver_cycles
  for each row execute function app.require_plan_model('DENVER');
create trigger denver_objectives_denver before insert or update on public.denver_objectives
  for each row execute function app.require_plan_model('DENVER');

-- Fase só muda pela função, nunca por update direto.
create function app.guard_target_phase() returns trigger language plpgsql as $$
begin
  if new.current_phase is distinct from old.current_phase
     and coalesce(current_setting('aprumo.phase_change', true), '') <> 'on' then
    raise exception 'use change_target_phase() to change a target phase';
  end if;
  return new;
end $$;
create trigger targets_guard_phase before update on public.targets
  for each row execute function app.guard_target_phase();

create function app.target_case(p_target uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select pl.case_id from public.targets t
  join public.programs p on p.id = t.program_id
  join public.intervention_plans pl on pl.id = p.plan_id
  where t.id = p_target;
$$;

create function public.change_target_phase(p_target uuid, p_new public.target_phase, p_reason text, p_alert_rule text default null)
returns void
language plpgsql security definer set search_path = '' as $$
declare v_case uuid := app.target_case(p_target); v_old public.target_phase;
begin
  if not app.is_case_lead(v_case) then
    raise exception 'only supervision can change a target phase' using errcode = '42501';
  end if;
  if p_reason is null or length(trim(p_reason)) < 5 then
    raise exception 'a justification is required';
  end if;
  select current_phase into v_old from public.targets where id = p_target for update;
  perform set_config('aprumo.phase_change', 'on', true);
  update public.targets
     set current_phase = p_new, phase_changed_at = now(), phase_changed_by = auth.uid()
   where id = p_target;
  perform set_config('aprumo.phase_change', 'off', true);
  insert into public.case_timeline_events (case_id, kind, title, detail, author_id)
  values (v_case, 'phase_change', 'Mudança de fase',
          jsonb_build_object('target_id', p_target, 'from', v_old, 'to', p_new, 'reason', p_reason, 'alert_rule', p_alert_rule),
          auth.uid());
  insert into public.audit_log (actor_id, case_id, action, resource_type, resource_id, detail)
  values (auth.uid(), v_case, 'phase_change', 'target', p_target::text, jsonb_build_object('from', v_old, 'to', p_new));
end $$;

-- Troca de modelo: encerra o plano vigente e abre rascunho com nova linha de base.
create function public.transition_case_model(p_case uuid, p_new public.intervention_model, p_reason text)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_old public.intervention_plans; v_new uuid;
begin
  if not app.has_case_role(p_case, array['responsible']::public.case_role[]) then
    raise exception 'only the responsible professional can change the model' using errcode = '42501';
  end if;
  if p_reason is null or length(trim(p_reason)) < 10 then
    raise exception 'a clinical justification is required';
  end if;
  select * into v_old from public.intervention_plans where case_id = p_case and status = 'active' for update;
  if found then
    update public.intervention_plans set status = 'closed' where id = v_old.id;
  end if;
  insert into public.intervention_plans (case_id, model, version, supersedes_plan_id, transition_reason)
  values (p_case, p_new, coalesce(v_old.version, 0) + 1, v_old.id, p_reason)
  returning id into v_new;
  insert into public.case_timeline_events (case_id, kind, title, detail, author_id)
  values (p_case, 'model_transition', 'Transição de modelo',
          jsonb_build_object('from', v_old.model, 'to', p_new, 'reason', p_reason), auth.uid());
  insert into public.audit_log (actor_id, case_id, action, resource_type, resource_id)
  values (auth.uid(), p_case, 'model_transition', 'intervention_plan', v_new::text);
  return v_new;
end $$;

-- ---------------------------------------------------------------- RLS
alter table public.prompt_hierarchies enable row level security;
alter table public.prompt_levels enable row level security;
alter table public.mastery_criteria enable row level security;
alter table public.stimulus_sets enable row level security;
alter table public.stimuli enable row level security;
alter table public.behavior_definitions enable row level security;
alter table public.intervention_plans enable row level security;
alter table public.plan_goals enable row level security;
alter table public.programs enable row level security;
alter table public.targets enable row level security;
alter table public.denver_cycles enable row level security;
alter table public.denver_objectives enable row level security;
alter table public.denver_steps enable row level security;

-- Bibliotecas: leitura por membros da organização; escrita por membros (sem dado de caso).
create policy ph_rw on public.prompt_hierarchies for all to authenticated
  using (app.is_org_member(organization_id)) with check (app.is_org_member(organization_id));
create policy pl_rw on public.prompt_levels for all to authenticated
  using (exists (select 1 from public.prompt_hierarchies h where h.id = hierarchy_id and app.is_org_member(h.organization_id)))
  with check (exists (select 1 from public.prompt_hierarchies h where h.id = hierarchy_id and app.is_org_member(h.organization_id)));
create policy mc_select on public.mastery_criteria for select to authenticated using (app.is_org_member(organization_id));
create policy mc_insert on public.mastery_criteria for insert to authenticated with check (app.is_org_member(organization_id));
create policy ss_rw on public.stimulus_sets for all to authenticated
  using (app.is_org_member(organization_id)) with check (app.is_org_member(organization_id));
create policy st_rw on public.stimuli for all to authenticated
  using (exists (select 1 from public.stimulus_sets s where s.id = set_id and app.is_org_member(s.organization_id)))
  with check (exists (select 1 from public.stimulus_sets s where s.id = set_id and app.is_org_member(s.organization_id)));

create policy bd_select on public.behavior_definitions for select to authenticated using (app.is_case_member(case_id));
create policy bd_write on public.behavior_definitions for all to authenticated
  using (app.is_case_lead(case_id)) with check (app.is_case_lead(case_id));

create policy plans_select on public.intervention_plans for select to authenticated using (app.is_case_member(case_id));
create policy plans_write on public.intervention_plans for insert to authenticated with check (app.is_case_lead(case_id));
create policy plans_update on public.intervention_plans for update to authenticated using (app.is_case_lead(case_id));

create policy goals_select on public.plan_goals for select to authenticated using (app.is_case_member(app.plan_case(plan_id)));
create policy goals_write on public.plan_goals for all to authenticated
  using (app.is_case_lead(app.plan_case(plan_id))) with check (app.is_case_lead(app.plan_case(plan_id)));
create policy programs_select on public.programs for select to authenticated using (app.is_case_member(app.plan_case(plan_id)));
create policy programs_write on public.programs for all to authenticated
  using (app.is_case_lead(app.plan_case(plan_id))) with check (app.is_case_lead(app.plan_case(plan_id)));
create policy targets_select on public.targets for select to authenticated using (app.is_case_member(app.target_case(id)));
create policy targets_write on public.targets for insert to authenticated
  with check (exists (select 1 from public.programs p where p.id = program_id and app.is_case_lead(app.plan_case(p.plan_id))));
create policy targets_update on public.targets for update to authenticated using (app.is_case_lead(app.target_case(id)));

create policy dc_select on public.denver_cycles for select to authenticated using (app.is_case_member(app.plan_case(plan_id)));
create policy dc_write on public.denver_cycles for all to authenticated
  using (app.is_case_lead(app.plan_case(plan_id))) with check (app.is_case_lead(app.plan_case(plan_id)));
create policy do_select on public.denver_objectives for select to authenticated
  using (exists (select 1 from public.denver_cycles c where c.id = cycle_id and app.is_case_member(app.plan_case(c.plan_id))));
create policy do_write on public.denver_objectives for all to authenticated
  using (exists (select 1 from public.denver_cycles c where c.id = cycle_id and app.is_case_lead(app.plan_case(c.plan_id))))
  with check (exists (select 1 from public.denver_cycles c where c.id = cycle_id and app.is_case_lead(app.plan_case(c.plan_id))));
create policy ds_select on public.denver_steps for select to authenticated
  using (exists (select 1 from public.denver_objectives o join public.denver_cycles c on c.id = o.cycle_id
                 where o.id = objective_id and app.is_case_member(app.plan_case(c.plan_id))));
create policy ds_write on public.denver_steps for all to authenticated
  using (exists (select 1 from public.denver_objectives o join public.denver_cycles c on c.id = o.cycle_id
                 where o.id = objective_id and app.is_case_lead(app.plan_case(c.plan_id))))
  with check (exists (select 1 from public.denver_objectives o join public.denver_cycles c on c.id = o.cycle_id
                 where o.id = objective_id and app.is_case_lead(app.plan_case(c.plan_id))));

grant select, insert, update, delete on public.prompt_hierarchies, public.prompt_levels, public.stimulus_sets, public.stimuli to authenticated;
grant select, insert on public.mastery_criteria to authenticated;
grant select, insert, update on public.behavior_definitions, public.intervention_plans, public.plan_goals, public.programs,
  public.targets, public.denver_cycles, public.denver_objectives, public.denver_steps to authenticated;
grant delete on public.plan_goals, public.programs, public.denver_cycles, public.denver_objectives, public.denver_steps to authenticated;
grant execute on function public.change_target_phase(uuid, public.target_phase, text, text) to authenticated;
grant execute on function public.transition_case_model(uuid, public.intervention_model, text) to authenticated;
