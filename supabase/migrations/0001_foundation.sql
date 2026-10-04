-- Aprumo · 0001 · Fundação: organizações, membros, perfis, consentimentos, auditoria.
-- Regra: toda tabela nasce com RLS habilitada e grants explícitos.

create schema if not exists app;
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create type public.org_role as enum ('org_admin', 'professional');
create type public.case_role as enum ('responsible', 'supervisor', 'implementer', 'observer');

-- Bloqueia UPDATE/DELETE em tabelas de registro (prova documental; correções são adendos).
create function app.forbid_mutation() returns trigger
language plpgsql as $$
begin
  raise exception '% is append-only: use an addendum instead', tg_table_name
    using errcode = 'P0001';
end $$;

create function app.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------- organizações
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 2 and 120),
  region text not null default 'sa-east-1',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger organizations_touch before update on public.organizations
  for each row execute function app.touch_updated_at();

create table public.organization_memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.org_role not null,
  status text not null default 'active' check (status in ('invited', 'active', 'suspended')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.professional_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  display_name text,
  council text,               -- ex.: CRP
  council_number text,        -- número de registro no conselho
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger professional_profiles_touch before update on public.professional_profiles
  for each row execute function app.touch_updated_at();

-- Helpers de autorização: security definer com search_path vazio.
create function app.is_org_member(p_org uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_memberships m
    where m.organization_id = p_org and m.user_id = auth.uid() and m.status = 'active'
  );
$$;

create function app.is_org_admin(p_org uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.organization_memberships m
    where m.organization_id = p_org and m.user_id = auth.uid()
      and m.status = 'active' and m.role = 'org_admin'
  );
$$;

-- ---------------------------------------------------------------- auditoria
create table public.audit_log (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_id uuid,
  organization_id uuid,
  case_id uuid,
  action text not null check (action in ('read', 'create', 'update', 'addendum', 'export', 'phase_change', 'model_transition', 'login', 'permission_change')),
  resource_type text not null,
  resource_id text,
  device text,                -- minimizado: tipo de aparelho, nunca fingerprint
  detail jsonb not null default '{}'::jsonb
);
create trigger audit_log_append_only before update or delete on public.audit_log
  for each row execute function app.forbid_mutation();
create index audit_log_case_idx on public.audit_log (case_id, occurred_at desc);

-- Registro de leitura chamado pelo cliente ao abrir prontuário, nota ou documento.
create function public.audit_read(p_case uuid, p_resource_type text, p_resource_id text, p_device text default null)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_log (actor_id, case_id, action, resource_type, resource_id, device)
  values (auth.uid(), p_case, 'read', p_resource_type, p_resource_id, p_device);
end $$;

-- ---------------------------------------------------------------- RLS
alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.audit_log enable row level security;

create policy org_select on public.organizations for select to authenticated
  using (app.is_org_member(id));
create policy org_update on public.organizations for update to authenticated
  using (app.is_org_admin(id)) with check (app.is_org_admin(id));

create policy membership_select on public.organization_memberships for select to authenticated
  using (user_id = auth.uid() or app.is_org_admin(organization_id));
create policy membership_admin_write on public.organization_memberships for all to authenticated
  using (app.is_org_admin(organization_id)) with check (app.is_org_admin(organization_id));

create policy profile_select on public.professional_profiles for select to authenticated
  using (
    user_id = auth.uid() or exists (
      select 1 from public.organization_memberships a
      join public.organization_memberships b on a.organization_id = b.organization_id
      where a.user_id = auth.uid() and b.user_id = professional_profiles.user_id and a.status = 'active'
    )
  );
create policy profile_self_write on public.professional_profiles for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Auditoria: escrita só por funções security definer; leitura definida em 0002 (por caso).

grant usage on schema app to authenticated;
grant select, update on public.organizations to authenticated;
grant select, insert, update, delete on public.organization_memberships to authenticated;
grant select, insert, update on public.professional_profiles to authenticated;
grant select on public.audit_log to authenticated;
grant execute on function public.audit_read(uuid, text, text, text) to authenticated;
revoke all on all tables in schema public from anon;
