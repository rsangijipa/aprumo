-- Aprumo · 0008 · Padrões por organização (critérios, hierarquias, limites de tela, Denver).

create table public.organization_defaults (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  default_mastery_criterion jsonb not null default '{
    "min_independent_pct": 90,
    "sessions_required": 2,
    "consecutive": true,
    "min_opportunities_per_session": 10,
    "min_implementers": 1,
    "min_settings": 1,
    "maintenance_probe_weeks": [1, 2, 4],
    "maintenance_min_pct": 80
  }'::jsonb,
  default_prompt_hierarchy jsonb not null default '[
    {"code": "IND", "label": "Independente", "intrusiveness": 0.0},
    {"code": "GES", "label": "Gestual", "intrusiveness": 0.25},
    {"code": "MOD", "label": "Modelo", "intrusiveness": 0.5},
    {"code": "FP", "label": "Física Parcial", "intrusiveness": 0.75},
    {"code": "FT", "label": "Física Total", "intrusiveness": 1.0}
  ]'::jsonb,
  screen_time_limits jsonb not null default '{
    "under_24_months": 0,
    "under_11_years": 60,
    "older": 120
  }'::jsonb,
  denver_interval_minutes int not null default 15 check (denver_interval_minutes between 5 and 30),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger organization_defaults_touch before update on public.organization_defaults
  for each row execute function app.touch_updated_at();

-- Cria automaticamente os padrões ao criar organização
create function app.create_org_defaults() returns trigger language plpgsql as $$
begin
  insert into public.organization_defaults (organization_id)
  values (new.id)
  on conflict (organization_id) do nothing;
  return new;
end $$;

create trigger org_defaults_auto_create after insert on public.organizations
  for each row execute function app.create_org_defaults();

-- ---------------------------------------------------------------- RLS
alter table public.organization_defaults enable row level security;

create policy org_defaults_select on public.organization_defaults for select to authenticated
  using (app.is_org_member(organization_id));

create policy org_defaults_write on public.organization_defaults for all to authenticated
  using (app.is_org_admin(organization_id))
  with check (app.is_org_admin(organization_id));

grant select, insert, update on public.organization_defaults to authenticated;
