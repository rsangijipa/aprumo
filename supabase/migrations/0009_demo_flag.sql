-- Aprumo · 0009 · Flag de demonstração em organizações e casos.
-- Garante segregação total entre casos de teste/demonstração e a operação clínica real.

alter table public.organizations
  add column if not exists is_demo boolean not null default false;

alter table public.cases
  add column if not exists is_demo boolean not null default false;

-- Herda is_demo da organização se for inserido em organização de demonstração
create function app.inherit_demo_flag() returns trigger language plpgsql as $$
declare v_org_demo boolean;
begin
  select is_demo into v_org_demo from public.organizations where id = new.organization_id;
  if v_org_demo then
    new.is_demo := true;
  end if;
  return new;
end $$;

create trigger cases_inherit_demo before insert on public.cases
  for each row execute function app.inherit_demo_flag();

create function app.is_demo_case(p_case uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select is_demo from public.cases where id = p_case), false);
$$;

-- View de conveniência para painéis reais (exclui casos de demonstração)
create view public.real_cases with (security_invoker = true) as
  select c.*
  from public.cases c
  where not c.is_demo;

grant select on public.real_cases to authenticated;
