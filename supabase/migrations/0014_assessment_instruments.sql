-- Aprumo · 0014 · Instrumentos de avaliação, escores licenciados, sondas de linha de base e avaliação funcional descritiva (Doc B M3, §7.3; Doc A §29).

create table public.instruments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id), -- null = instrumento padrão de catálogo
  code text not null unique,
  name text not null,
  publisher text,
  satepsi_status text not null default 'not_applicable' check (satepsi_status in ('favorable', 'unfavorable', 'not_applicable')),
  license_model text not null default 'public_domain' check (license_model in ('per_org', 'per_application', 'public_domain')),
  min_age_months int check (min_age_months is null or min_age_months >= 0),
  max_age_months int check (max_age_months is null or max_age_months >= min_age_months),
  scoring_function_version text not null default '1.0',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.instrument_scores (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  instrument_id uuid not null references public.instruments(id),
  evaluator_id uuid not null references auth.users(id),
  evaluation_date date not null,
  raw_scores jsonb not null default '{}'::jsonb,
  standard_scores jsonb not null default '{}'::jsonb,
  percentile numeric check (percentile is null or (percentile >= 0 and percentile <= 100)),
  interpretation text,
  license_serial text,
  created_at timestamptz not null default now()
);
create trigger instrument_scores_no_mutation before update or delete on public.instrument_scores
  for each row execute function app.forbid_mutation();

create table public.baseline_probes (
  id uuid primary key default gen_random_uuid(),
  target_id uuid not null references public.targets(id),
  session_id uuid references public.sessions(id),
  probe_number int not null check (probe_number >= 1),
  correct boolean not null,
  prompt_level text not null default 'none',
  notes text,
  recorded_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);
create trigger baseline_probes_no_mutation before update or delete on public.baseline_probes
  for each row execute function app.forbid_mutation();

create table public.functional_assessments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  assessor_id uuid not null references auth.users(id),
  date date not null,
  target_behaviors text[] not null default '{}',
  scatterplot_data jsonb not null default '{}'::jsonb,
  interview_notes text,
  hypotheses jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.instruments enable row level security;
alter table public.instrument_scores enable row level security;
alter table public.baseline_probes enable row level security;
alter table public.functional_assessments enable row level security;

create policy instruments_select on public.instruments for select to authenticated
  using (organization_id is null or app.is_org_member(organization_id));

create policy instrument_scores_select on public.instrument_scores for select to authenticated
  using (app.is_case_member(case_id));
create policy instrument_scores_insert on public.instrument_scores for insert to authenticated
  with check (app.is_case_lead(case_id) and evaluator_id = auth.uid());

create policy baseline_probes_select on public.baseline_probes for select to authenticated
  using (exists (
    select 1 from public.targets t
    join public.programs p on p.id = t.program_id
    join public.intervention_plans pl on pl.id = p.plan_id
    where t.id = baseline_probes.target_id and app.is_case_member(pl.case_id)
  ));
create policy baseline_probes_insert on public.baseline_probes for insert to authenticated
  with check (exists (
    select 1 from public.targets t
    join public.programs p on p.id = t.program_id
    join public.intervention_plans pl on pl.id = p.plan_id
    where t.id = baseline_probes.target_id and app.is_case_member(pl.case_id)
  ));

create policy functional_assessments_select on public.functional_assessments for select to authenticated
  using (app.is_case_member(case_id));
create policy functional_assessments_insert on public.functional_assessments for insert to authenticated
  with check (app.is_case_lead(case_id) and assessor_id = auth.uid());

grant select on public.instruments to authenticated;
grant select, insert on public.instrument_scores, public.baseline_probes, public.functional_assessments to authenticated;
