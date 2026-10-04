-- Aprumo · 0005 · Reforçadores, avaliação de preferência, entregas, economia de fichas e tempo de tela.

create table public.reinforcers (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  name text not null,
  category text not null check (category in ('tangible', 'edible', 'activity', 'social', 'digital')),
  notes text,
  restrictions text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Avaliação de preferência: MSWO, pareada ou operante livre, presencial ou digital.
create table public.preference_assessments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  method text not null check (method in ('mswo', 'paired', 'free_operant')),
  format text not null check (format in ('in_person', 'digital')),
  conducted_by uuid not null default auth.uid() references auth.users(id),
  conducted_at timestamptz not null default now(),
  valid_until date not null default (current_date + 7),
  notes text
);

create table public.preference_results (
  assessment_id uuid not null references public.preference_assessments(id) on delete cascade,
  reinforcer_id uuid not null references public.reinforcers(id),
  rank int not null check (rank >= 1),
  selection_pct numeric(5,2),
  primary key (assessment_id, reinforcer_id)
);
create trigger preference_results_append_only before update or delete on public.preference_results
  for each row execute function app.forbid_mutation();

-- Pré-requisito para MSWO digital com figuras (Morris e Vollmer, 2020): sonda de pareamento e
-- identificação de figuras registrada para a criança.
create table public.digital_prerequisite_probes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  skill text not null check (skill in ('tolera-tablet', 'toca-alvo-intencional', 'pareia-figura-identica', 'identifica-figura-nomeada')),
  passed boolean not null,
  probed_at timestamptz not null default now(),
  probed_by uuid not null default auth.uid() references auth.users(id)
);

create function app.require_digital_mswo_prerequisite() returns trigger language plpgsql as $$
begin
  if new.method = 'mswo' and new.format = 'digital' and not exists (
    select 1 from public.digital_prerequisite_probes p
    where p.case_id = new.case_id and p.passed
      and p.skill in ('pareia-figura-identica', 'identifica-figura-nomeada')
    group by p.case_id having count(distinct p.skill) = 2
  ) then
    raise exception 'digital MSWO requires passed picture matching and identification probes';
  end if;
  return new;
end $$;
create trigger preference_digital_prereq before insert on public.preference_assessments
  for each row execute function app.require_digital_mswo_prerequisite();

-- Entregas na sessão (detecção de saciação, R10).
create table public.reinforcer_deliveries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id),
  reinforcer_id uuid not null references public.reinforcers(id),
  delivered_at timestamptz not null,
  contingent_on_target uuid references public.targets(id),
  client_event_id text not null,
  recorded_by uuid not null default auth.uid() references auth.users(id),
  unique (session_id, client_event_id)
);
create trigger reinforcer_deliveries_append_only before update or delete on public.reinforcer_deliveries
  for each row execute function app.forbid_mutation();

-- Fichas: só existe entrega. Não há tabela nem função de remoção (P7).
create table public.token_deliveries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id),
  board_key text not null,
  token_index int not null check (token_index >= 0),
  tokens_required int not null check (tokens_required between 1 and 20),
  delivered_at timestamptz not null,
  client_event_id text not null,
  recorded_by uuid not null default auth.uid() references auth.users(id),
  unique (session_id, client_event_id)
);
create trigger token_deliveries_append_only before update or delete on public.token_deliveries
  for each row execute function app.forbid_mutation();

-- ---------------------------------------------------------------- tempo de tela
-- Limite padrão por faixa etária (SBP, 2024). Abaixo de 24 meses: zero.
create function app.screen_limit_minutes(p_birth date, p_on date default current_date) returns int
language sql immutable as $$
  select case
    when (extract(year from age(p_on, p_birth)) * 12 + extract(month from age(p_on, p_birth))) < 24 then 0
    when (extract(year from age(p_on, p_birth)) * 12 + extract(month from age(p_on, p_birth))) < 132 then 60
    else 120
  end;
$$;

-- Projeção criança × dia: minutos de tela por finalidade e limite aplicável.
create view public.screen_time_ledger with (security_invoker = true) as
select c.child_id,
       (s.started_at at time zone 'America/Sao_Paulo')::date as day,
       sum(s.screen_seconds) / 60 as minutes,
       app.screen_limit_minutes(ch.birth_date, (s.started_at at time zone 'America/Sao_Paulo')::date) as limit_minutes,
       greatest(0, sum(s.screen_seconds) / 60 - app.screen_limit_minutes(ch.birth_date, (s.started_at at time zone 'America/Sao_Paulo')::date)) as excess_minutes
from public.sessions s
join public.cases c on c.id = s.case_id
join public.children ch on ch.id = c.child_id
where s.started_at is not null
group by c.child_id, ch.birth_date, (s.started_at at time zone 'America/Sao_Paulo')::date;

-- Abrir sessão infantil exige idade ≥ 24 meses.
create function app.child_portal_age_guard() returns trigger language plpgsql as $$
declare v_birth date;
begin
  select birth_date into v_birth from public.children where id = new.child_id;
  if app.screen_limit_minutes(v_birth) = 0 then
    raise exception 'child portal is not offered under 24 months';
  end if;
  return new;
end $$;
create trigger child_sessions_age_guard before insert on public.child_sessions
  for each row execute function app.child_portal_age_guard();

-- ---------------------------------------------------------------- RLS
alter table public.reinforcers enable row level security;
alter table public.preference_assessments enable row level security;
alter table public.preference_results enable row level security;
alter table public.digital_prerequisite_probes enable row level security;
alter table public.reinforcer_deliveries enable row level security;
alter table public.token_deliveries enable row level security;

create policy reinforcers_select on public.reinforcers for select to authenticated using (app.is_case_member(case_id));
create policy reinforcers_write on public.reinforcers for all to authenticated
  using (app.is_case_lead(case_id)) with check (app.is_case_lead(case_id));

create policy pa_select on public.preference_assessments for select to authenticated using (app.is_case_member(case_id));
create policy pa_insert on public.preference_assessments for insert to authenticated
  with check (conducted_by = auth.uid() and app.has_case_role(case_id, array['responsible','supervisor','implementer']::public.case_role[]));
create policy pr_select on public.preference_results for select to authenticated
  using (exists (select 1 from public.preference_assessments a where a.id = assessment_id and app.is_case_member(a.case_id)));
create policy pr_insert on public.preference_results for insert to authenticated
  with check (exists (select 1 from public.preference_assessments a where a.id = assessment_id and a.conducted_by = auth.uid()));

create policy dpp_select on public.digital_prerequisite_probes for select to authenticated using (app.is_case_member(case_id));
create policy dpp_insert on public.digital_prerequisite_probes for insert to authenticated
  with check (probed_by = auth.uid() and app.has_case_role(case_id, array['responsible','supervisor','implementer']::public.case_role[]));

do $$
declare t text;
begin
  foreach t in array array['reinforcer_deliveries','token_deliveries'] loop
    execute format('create policy %1$s_select on public.%1$s for select to authenticated using (app.is_case_member(app.session_case(session_id)))', t);
    execute format('create policy %1$s_insert on public.%1$s for insert to authenticated with check (recorded_by = auth.uid() and exists (select 1 from public.sessions s where s.id = session_id and s.implementer_id = auth.uid() and s.status in (''draft'',''active'',''paused'')))', t);
    execute format('grant select, insert on public.%1$s to authenticated', t);
  end loop;
end $$;

grant select, insert, update on public.reinforcers to authenticated;
grant select, insert on public.preference_assessments, public.preference_results, public.digital_prerequisite_probes to authenticated;
grant select on public.screen_time_ledger to authenticated;
