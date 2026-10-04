-- Aprumo · 0007 · Família (portal do responsável, generalização em casa, validação social) e documentos.
-- Princípio: a família vê relatório em linguagem acessível, nunca o prontuário nem notas internas.

create function app.is_guardian_of(p_child uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.guardians g
    join public.guardian_links l on l.guardian_id = g.id
    where g.user_id = auth.uid() and l.child_id = p_child
      and exists (
        select 1 from public.consents c
        where c.child_id = p_child and c.guardian_id = g.id and c.purpose = 'service_record' and c.revoked_at is null
      )
  );
$$;

create function app.case_child(p_case uuid) returns uuid
language sql stable security definer set search_path = '' as $$
  select child_id from public.cases where id = p_case;
$$;

-- Responsável vê só a identificação mínima da própria criança.
create policy children_select_guardian on public.children for select to authenticated using (app.is_guardian_of(id));

-- ---------------------------------------------------------------- tarefas de generalização
create table public.home_tasks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  target_id uuid references public.targets(id),
  title text not null,
  instructions text not null,
  frequency text not null,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  active boolean not null default true
);

-- Registro da família: fonte sempre explícita, separado da observação direta da equipe.
create table public.home_task_records (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.home_tasks(id),
  occurred_on date not null,
  opportunities int not null check (opportunities between 0 and 100),
  successes int not null check (successes >= 0),
  note text,
  source text not null default 'guardian_report' check (source = 'guardian_report'),
  recorded_by uuid not null default auth.uid() references auth.users(id),
  recorded_at timestamptz not null default now(),
  client_event_id text not null unique,
  check (successes <= opportunities)
);
create trigger home_task_records_append_only before update or delete on public.home_task_records
  for each row execute function app.forbid_mutation();

create table public.family_guidance (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  version int not null default 1,
  title text not null,
  body text not null,
  author_id uuid not null default auth.uid() references auth.users(id),
  published_at timestamptz not null default now()
);
create trigger family_guidance_append_only before update or delete on public.family_guidance
  for each row execute function app.forbid_mutation();

create table public.guidance_reads (
  guidance_id uuid not null references public.family_guidance(id),
  user_id uuid not null default auth.uid() references auth.users(id),
  read_at timestamptz not null default now(),
  primary key (guidance_id, user_id)
);

create table public.social_validity_responses (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  respondent_id uuid not null default auth.uid() references auth.users(id),
  goals_importance int not null check (goals_importance between 1 and 5),
  procedures_acceptability int not null check (procedures_acceptability between 1 and 5),
  satisfaction int not null check (satisfaction between 1 and 5),
  comment text,
  answered_at timestamptz not null default now()
);

-- Progresso em linguagem acessível: só alvos, fase e tendência. Nunca notas, comportamento ou outras crianças.
create function public.family_progress(p_child uuid)
returns table (target_name text, program_name text, phase text, last_pct_independent numeric, sessions_last_30d bigint)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not app.is_guardian_of(p_child) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return query
  select t.name, p.name,
         case t.current_phase
           when 'baseline' then 'Começando a observar'
           when 'acquisition' then 'Aprendendo'
           when 'maintenance' then 'Aprendido — mantendo'
           when 'generalization' then 'Usando em outros lugares'
           when 'mastered' then 'Conquistado'
           else 'Em ajuste pela equipe'
         end,
         (select f.pct_independent from public.fact_target_session f
           where f.target_id = t.id and not f.probe order by f.session_at desc limit 1),
         (select count(distinct f.session_id) from public.fact_target_session f
           where f.target_id = t.id and f.session_at > now() - interval '30 days')
  from public.targets t
  join public.programs p on p.id = t.program_id
  join public.intervention_plans pl on pl.id = p.plan_id and pl.status = 'active'
  join public.cases c on c.id = pl.case_id and c.child_id = p_child
  where t.status = 'active';
end $$;

-- ---------------------------------------------------------------- documentos (Res. CFP 06/2019)
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  kind text not null check (kind in ('progress_report', 'school_report', 'declaration', 'session_summary', 'family_summary')),
  title text not null,
  shared_with_family boolean not null default false,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

-- Cada versão é imutável. Finalizar gera versão assinada com hash; reedição = nova versão.
create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id),
  version int not null,
  status text not null check (status in ('draft', 'final')),
  content text not null,
  data_snapshot jsonb not null default '{}'::jsonb,
  author_id uuid not null default auth.uid() references auth.users(id),
  council_registration text,
  content_hash text not null,
  created_at timestamptz not null default now(),
  unique (document_id, version)
);
create trigger document_versions_append_only before update or delete on public.document_versions
  for each row execute function app.forbid_mutation();

create function public.save_document_version(p_document uuid, p_content text, p_snapshot jsonb, p_final boolean, p_council text default null)
returns int
language plpgsql security definer set search_path = '' as $$
declare v_case uuid; v_next int;
begin
  select case_id into v_case from public.documents where id = p_document;
  if not app.is_case_lead(v_case) then raise exception 'only supervision can author documents' using errcode = '42501'; end if;
  if p_final and (p_council is null or length(trim(p_council)) < 3) then
    raise exception 'a final document requires the professional council registration';
  end if;
  select coalesce(max(version), 0) + 1 into v_next from public.document_versions where document_id = p_document;
  insert into public.document_versions (document_id, version, status, content, data_snapshot, council_registration, content_hash)
  values (p_document, v_next, case when p_final then 'final' else 'draft' end, p_content, coalesce(p_snapshot, '{}'::jsonb), p_council,
          encode(extensions.digest(p_content || coalesce(p_snapshot::text, ''), 'sha256'), 'hex'));
  if p_final then
    insert into public.case_timeline_events (case_id, kind, title, detail, author_id)
    values (v_case, 'document', 'Documento finalizado', jsonb_build_object('document_id', p_document, 'version', v_next), auth.uid());
  end if;
  return v_next;
end $$;

-- ---------------------------------------------------------------- RLS
alter table public.home_tasks enable row level security;
alter table public.home_task_records enable row level security;
alter table public.family_guidance enable row level security;
alter table public.guidance_reads enable row level security;
alter table public.social_validity_responses enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;

create policy ht_select on public.home_tasks for select to authenticated
  using (app.is_case_member(case_id) or app.is_guardian_of(app.case_child(case_id)));
create policy ht_write on public.home_tasks for all to authenticated
  using (app.is_case_lead(case_id)) with check (app.is_case_lead(case_id));

create policy htr_select on public.home_task_records for select to authenticated
  using (exists (select 1 from public.home_tasks t where t.id = task_id
                 and (app.is_case_member(t.case_id) or (recorded_by = auth.uid() and app.is_guardian_of(app.case_child(t.case_id))))));
create policy htr_insert on public.home_task_records for insert to authenticated
  with check (recorded_by = auth.uid() and exists (select 1 from public.home_tasks t where t.id = task_id and t.active and app.is_guardian_of(app.case_child(t.case_id))));

create policy fg_select on public.family_guidance for select to authenticated
  using (app.is_case_member(case_id) or app.is_guardian_of(app.case_child(case_id)));
create policy fg_insert on public.family_guidance for insert to authenticated with check (app.is_case_lead(case_id) and author_id = auth.uid());
create policy gr_rw on public.guidance_reads for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy sv_select on public.social_validity_responses for select to authenticated
  using (app.is_case_member(case_id) or respondent_id = auth.uid());
create policy sv_insert on public.social_validity_responses for insert to authenticated
  with check (respondent_id = auth.uid() and app.is_guardian_of(app.case_child(case_id)));

create policy docs_select on public.documents for select to authenticated
  using (app.is_case_member(case_id) or (shared_with_family and app.is_guardian_of(app.case_child(case_id))));
create policy docs_insert on public.documents for insert to authenticated with check (app.is_case_lead(case_id) and created_by = auth.uid());
create policy docs_share on public.documents for update to authenticated using (app.is_case_lead(case_id));

-- Família lê só versões finais de documentos compartilhados.
create policy dv_select on public.document_versions for select to authenticated
  using (exists (select 1 from public.documents d where d.id = document_id
                 and (app.is_case_member(d.case_id) or (status = 'final' and d.shared_with_family and app.is_guardian_of(app.case_child(d.case_id))))));

grant select, insert, update on public.home_tasks to authenticated;
grant select, insert on public.home_task_records, public.family_guidance, public.social_validity_responses to authenticated;
grant select, insert, delete on public.guidance_reads to authenticated;
grant select, insert, update on public.documents to authenticated;
grant select on public.document_versions to authenticated;
grant execute on function public.family_progress(uuid) to authenticated;
grant execute on function public.save_document_version(uuid, text, jsonb, boolean, text) to authenticated;
