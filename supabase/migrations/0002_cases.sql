-- Aprumo · 0002 · Criança, caso, equipe por caso, responsáveis, consentimentos, prontuário.
-- Acesso clínico decorre do vínculo com o caso, nunca do cargo administrativo.

create table public.children (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  full_name text not null,
  preferred_name text not null check (length(preferred_name) between 1 and 40),
  birth_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger children_touch before update on public.children
  for each row execute function app.touch_updated_at();

create table public.cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  child_id uuid not null references public.children(id),
  status text not null default 'active' check (status in ('active', 'paused', 'closed')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  closing_reason text,
  responsible_professional_id uuid not null references auth.users(id),
  retention_until date,       -- 20 anos após o último registro (Lei 13.787/2018)
  check ((status = 'closed') = (closed_at is not null))
);
-- Um único caso ativo por criança por organização.
create unique index cases_one_active_per_child on public.cases (organization_id, child_id)
  where status <> 'closed';

create table public.case_team_members (
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  role public.case_role not null,
  active boolean not null default true,
  added_by uuid references auth.users(id),
  added_at timestamptz not null default now(),
  primary key (case_id, user_id, role)
);

create function app.has_case_role(p_case uuid, p_roles public.case_role[]) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.case_team_members t
    join public.cases c on c.id = t.case_id
    where t.case_id = p_case and t.user_id = auth.uid() and t.active
      and t.role = any (p_roles)
      and app.is_org_member(c.organization_id)
  );
$$;

create function app.is_case_member(p_case uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select app.has_case_role(p_case, array['responsible','supervisor','implementer','observer']::public.case_role[]);
$$;

create function app.is_case_lead(p_case uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select app.has_case_role(p_case, array['responsible','supervisor']::public.case_role[]);
$$;

create function app.can_see_child(p_child uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.cases c where c.child_id = p_child and app.is_case_member(c.id));
$$;

-- ---------------------------------------------------------------- responsáveis
create table public.guardians (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  user_id uuid references auth.users(id),
  full_name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table public.guardian_links (
  guardian_id uuid not null references public.guardians(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  relationship text not null,
  legal_guardian boolean not null default true,
  primary key (guardian_id, child_id)
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id),
  guardian_id uuid not null references public.guardians(id),
  purpose text not null check (purpose in ('service_record', 'child_portal', 'media_capture', 'school_sharing', 'research')),
  legal_basis text not null,
  term_version text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  collected_by uuid references auth.users(id),
  ip inet
);
-- Consentimento não é editado: revogação é o único update permitido.
create function app.consent_only_revoke() returns trigger language plpgsql as $$
begin
  if (to_jsonb(new) - 'revoked_at') is distinct from (to_jsonb(old) - 'revoked_at') or old.revoked_at is not null then
    raise exception 'consents are immutable except for a single revocation';
  end if;
  return new;
end $$;
create trigger consents_only_revoke before update on public.consents
  for each row execute function app.consent_only_revoke();
create trigger consents_no_delete before delete on public.consents
  for each row execute function app.forbid_mutation();

-- ---------------------------------------------------------------- prontuário
create table public.anamnesis (
  case_id uuid primary key references public.cases(id),
  data jsonb not null default '{}'::jsonb,
  sensory_profile jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table public.case_timeline_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  occurred_at timestamptz not null default now(),
  kind text not null check (kind in ('plan_approved', 'plan_closed', 'model_transition', 'phase_change', 'context', 'session_closed', 'document', 'consent')),
  title text not null,
  detail jsonb not null default '{}'::jsonb,
  author_id uuid references auth.users(id)
);
create trigger timeline_append_only before update or delete on public.case_timeline_events
  for each row execute function app.forbid_mutation();

create table public.record_addenda (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  resource_type text not null,
  resource_id uuid not null,
  reason text not null check (length(reason) >= 5),
  content text not null,
  author_id uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);
create trigger addenda_append_only before update or delete on public.record_addenda
  for each row execute function app.forbid_mutation();

-- Prontuário não é apagado durante o prazo de guarda.
create function app.forbid_case_delete() returns trigger language plpgsql as $$
begin
  raise exception 'clinical records are retained (minimum 20 years); close the case instead';
end $$;
create trigger cases_no_delete before delete on public.cases
  for each row execute function app.forbid_case_delete();
create trigger children_no_delete before delete on public.children
  for each row execute function app.forbid_case_delete();

-- Criação transacional: criança + caso + vínculo do responsável técnico + consentimento base.
create function public.create_case(
  p_org uuid, p_full_name text, p_preferred_name text, p_birth_date date,
  p_guardian_name text, p_guardian_relationship text, p_consent_term_version text
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_child uuid; v_case uuid; v_guardian uuid;
begin
  if not app.is_org_member(p_org) then
    raise exception 'not a member of organization' using errcode = '42501';
  end if;
  insert into public.children (organization_id, full_name, preferred_name, birth_date)
    values (p_org, p_full_name, p_preferred_name, p_birth_date) returning id into v_child;
  insert into public.cases (organization_id, child_id, responsible_professional_id)
    values (p_org, v_child, auth.uid()) returning id into v_case;
  insert into public.case_team_members (case_id, user_id, role, added_by)
    values (v_case, auth.uid(), 'responsible', auth.uid());
  insert into public.guardians (organization_id, full_name) values (p_org, p_guardian_name)
    returning id into v_guardian;
  insert into public.guardian_links (guardian_id, child_id, relationship) values (v_guardian, v_child, p_guardian_relationship);
  insert into public.consents (child_id, guardian_id, purpose, legal_basis, term_version, collected_by)
    values (v_child, v_guardian, 'service_record', 'LGPD art. 11, II, f — tutela da saúde', p_consent_term_version, auth.uid());
  insert into public.audit_log (actor_id, organization_id, case_id, action, resource_type, resource_id)
    values (auth.uid(), p_org, v_case, 'create', 'case', v_case::text);
  return v_case;
end $$;

-- ---------------------------------------------------------------- RLS
alter table public.children enable row level security;
alter table public.cases enable row level security;
alter table public.case_team_members enable row level security;
alter table public.guardians enable row level security;
alter table public.guardian_links enable row level security;
alter table public.consents enable row level security;
alter table public.anamnesis enable row level security;
alter table public.case_timeline_events enable row level security;
alter table public.record_addenda enable row level security;

create policy children_select on public.children for select to authenticated using (app.can_see_child(id));
create policy children_update on public.children for update to authenticated
  using (exists (select 1 from public.cases c where c.child_id = id and app.is_case_lead(c.id)));

create policy cases_select on public.cases for select to authenticated using (app.is_case_member(id));
create policy cases_update on public.cases for update to authenticated
  using (app.has_case_role(id, array['responsible']::public.case_role[]));

create policy team_select on public.case_team_members for select to authenticated using (app.is_case_member(case_id));
create policy team_write on public.case_team_members for all to authenticated
  using (app.has_case_role(case_id, array['responsible']::public.case_role[]))
  with check (app.has_case_role(case_id, array['responsible']::public.case_role[]));

create policy guardians_select on public.guardians for select to authenticated
  using (exists (select 1 from public.guardian_links l where l.guardian_id = id and app.can_see_child(l.child_id)));
create policy guardian_links_select on public.guardian_links for select to authenticated using (app.can_see_child(child_id));
create policy consents_select on public.consents for select to authenticated using (app.can_see_child(child_id));
create policy consents_revoke on public.consents for update to authenticated
  using (exists (select 1 from public.cases c where c.child_id = consents.child_id and app.is_case_lead(c.id)));

create policy anamnesis_select on public.anamnesis for select to authenticated using (app.is_case_member(case_id));
create policy anamnesis_write on public.anamnesis for all to authenticated
  using (app.is_case_lead(case_id)) with check (app.is_case_lead(case_id));

create policy timeline_select on public.case_timeline_events for select to authenticated using (app.is_case_member(case_id));
create policy timeline_insert on public.case_timeline_events for insert to authenticated
  with check (app.is_case_member(case_id) and author_id = auth.uid());

create policy addenda_select on public.record_addenda for select to authenticated using (app.is_case_member(case_id));
create policy addenda_insert on public.record_addenda for insert to authenticated
  with check (app.is_case_member(case_id) and author_id = auth.uid());

-- Auditoria visível ao responsável técnico/supervisor do caso.
create policy audit_select_case_lead on public.audit_log for select to authenticated
  using (case_id is not null and app.is_case_lead(case_id));

grant select, update on public.children, public.cases to authenticated;
grant select, insert, update, delete on public.case_team_members to authenticated;
grant select on public.guardians, public.guardian_links to authenticated;
grant select, update on public.consents to authenticated;
grant select, insert, update on public.anamnesis to authenticated;
grant select, insert on public.case_timeline_events, public.record_addenda to authenticated;
grant execute on function public.create_case(uuid, text, text, date, text, text, text) to authenticated;
