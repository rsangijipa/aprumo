-- Aprumo · 0018 · Administração, segurança, conformidade LGPD/CFP e modelos CFP 06/2019 (Doc B M12, M14, §10.11, §12.5; Plano V2 F6, F8).

create table public.units (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  name text not null,
  code text,
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.instrument_licenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  instrument_id uuid not null references public.instruments(id),
  license_key text not null,
  total_credits int check (total_credits is null or total_credits > 0),
  used_credits int not null default 0 check (used_credits >= 0),
  valid_until date,
  created_at timestamptz not null default now(),
  check (total_credits is null or used_credits <= total_credits)
);

create table public.security_incidents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  title text not null,
  description text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  reported_at timestamptz not null default now(),
  reported_by uuid not null default auth.uid() references auth.users(id),
  resolved_at timestamptz,
  resolution_notes text
);

create table public.data_subject_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  requester_name text not null,
  requester_email text not null,
  request_type text not null check (request_type in ('access', 'rectification', 'deletion', 'portability', 'consent_revocation')),
  legal_deadline_at date not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'rejected')),
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

-- Atualiza restrição de tipos de documentos para cobrir todos os modelos da Res. CFP 06/2019
do $$
declare r record;
begin
  for r in (
    select conname
    from pg_constraint
    where conrelid = 'public.documents'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%kind%'
  ) loop
    execute 'alter table public.documents drop constraint ' || quote_ident(r.conname);
  end loop;
end $$;

alter table public.documents
  add constraint documents_kind_cfp_check
  check (kind in (
    'progress_report',            -- Relatório de progresso / multiprofissional
    'school_report',              -- Relatório escolar
    'declaration',                -- Declaração (CFP 06/2019 Art. 9)
    'session_summary',            -- Resumo de sessão
    'family_summary',             -- Resumo para a família
    'psychological_evaluation',   -- Laudo psicológico (CFP 06/2019 Art. 13)
    'expert_opinion',             -- Parecer psicológico (CFP 06/2019 Art. 14)
    'certificate'                 -- Atestado psicológico (CFP 06/2019 Art. 10)
  ));

create table public.progressive_login_locks (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  failed_attempts int not null default 0 check (failed_attempts >= 0),
  locked_until timestamptz,
  last_attempt_at timestamptz not null default now()
);

-- Registra tentativa de login e aplica bloqueio progressivo por IP/conta
create or replace function public.record_login_attempt(p_email text, p_success boolean)
returns boolean -- retorna true se login permitido/sucedido, false se bloqueado
language plpgsql security definer set search_path = '' as $$
declare
  v_rec record;
  v_next_attempts int;
  v_lock_duration interval;
begin
  p_email := lower(trim(p_email));
  select * into v_rec from public.progressive_login_locks where email = p_email;

  if p_success then
    if v_rec.email is not null then
      update public.progressive_login_locks
         set failed_attempts = 0, locked_until = null, last_attempt_at = now()
       where email = p_email;
    end if;
    return true;
  end if;

  if v_rec.locked_until is not null and v_rec.locked_until > now() then
    return false;
  end if;

  v_next_attempts := coalesce(v_rec.failed_attempts, 0) + 1;
  v_lock_duration := case
    when v_next_attempts >= 10 then interval '2 hours'
    when v_next_attempts >= 7  then interval '30 minutes'
    when v_next_attempts >= 5  then interval '5 minutes'
    else null
  end;

  insert into public.progressive_login_locks (email, failed_attempts, locked_until, last_attempt_at)
  values (p_email, v_next_attempts, case when v_lock_duration is not null then now() + v_lock_duration else null end, now())
  on conflict (email) do update
    set failed_attempts = v_next_attempts,
        locked_until = case when v_lock_duration is not null then now() + v_lock_duration else null end,
        last_attempt_at = now();

  return v_lock_duration is null;
end $$;

-- RLS
alter table public.units enable row level security;
alter table public.instrument_licenses enable row level security;
alter table public.security_incidents enable row level security;
alter table public.data_subject_requests enable row level security;
alter table public.progressive_login_locks enable row level security;

create policy units_select on public.units for select to authenticated
  using (app.is_org_member(organization_id));
create policy units_admin on public.units for all to authenticated
  using (app.is_org_admin(organization_id)) with check (app.is_org_admin(organization_id));

create policy licenses_select on public.instrument_licenses for select to authenticated
  using (app.is_org_member(organization_id));
create policy licenses_admin on public.instrument_licenses for all to authenticated
  using (app.is_org_admin(organization_id)) with check (app.is_org_admin(organization_id));

create policy security_incidents_policy on public.security_incidents for all to authenticated
  using (app.is_org_admin(organization_id)) with check (app.is_org_admin(organization_id));

create policy data_subject_requests_policy on public.data_subject_requests for all to authenticated
  using (app.is_org_admin(organization_id)) with check (app.is_org_admin(organization_id));

grant select, insert, update, delete on public.units to authenticated;
grant select, insert, update, delete on public.instrument_licenses to authenticated;
grant select, insert, update on public.security_incidents, public.data_subject_requests to authenticated;
grant execute on function public.record_login_attempt(text, boolean) to anon, authenticated;
