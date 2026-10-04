-- Aprumo · 0016 · Espaço da criança: estado lúdico e telemetria de treino livre (Doc B §10.7, M13; Plano V2 F5).
-- Registros de prática livre (practice_runs) são exclusivamente recreativos e não possuem target_id clínico.

create table public.child_space_state (
  child_id uuid primary key references public.children(id),
  daily_screen_time_used_seconds int not null default 0 check (daily_screen_time_used_seconds >= 0),
  screen_time_reset_date date not null default current_date,
  stars_earned int not null default 0 check (stars_earned >= 0),
  tokens_balance int not null default 0 check (tokens_balance >= 0),
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.practice_runs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id),
  app_id text not null,
  duration_seconds int not null check (duration_seconds >= 0),
  stars_awarded int not null default 0 check (stars_awarded >= 0),
  telemetry jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create trigger practice_runs_no_mutation before update or delete on public.practice_runs
  for each row execute function app.forbid_mutation();

-- RLS
alter table public.child_space_state enable row level security;
alter table public.practice_runs enable row level security;

create policy child_space_state_select on public.child_space_state for select to authenticated
  using (exists (
    select 1 from public.cases c
    where c.child_id = child_space_state.child_id and app.is_case_member(c.id)
  ));

create policy practice_runs_select on public.practice_runs for select to authenticated
  using (exists (
    select 1 from public.cases c
    where c.child_id = practice_runs.child_id and app.is_case_member(c.id)
  ));

-- RPC segura para obter estado da sessão infantil via token temporário
create or replace function public.get_child_space_state(p_token text)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_hash bytea;
  v_child_id uuid;
  v_state record;
  v_case record;
  v_max_screen_minutes int;
begin
  if p_token is null or length(trim(p_token)) < 8 then
    raise exception 'invalid child session token' using errcode = '42501';
  end if;

  v_hash := extensions.digest(p_token, 'sha256');

  select cs.child_id into v_child_id
  from public.child_sessions cs
  where cs.token_hash = v_hash
    and cs.expires_at > now()
    and cs.revoked_at is null;

  if not found then
    raise exception 'child session expired or invalid' using errcode = '42501';
  end if;

  -- Garante registro de estado
  insert into public.child_space_state (child_id)
  values (v_child_id)
  on conflict (child_id) do nothing;

  -- Reseta tempo de tela se mudou o dia
  update public.child_space_state
     set daily_screen_time_used_seconds = 0,
         screen_time_reset_date = current_date
   where child_id = v_child_id and screen_time_reset_date <> current_date;

  select * into v_state from public.child_space_state where child_id = v_child_id;

  select c.organization_id into v_case
  from public.cases c
  where c.child_id = v_child_id and c.status = 'active'
  limit 1;

  select coalesce((od.screen_time_limits->>'under_11_years')::int, 60) into v_max_screen_minutes
  from public.organization_defaults od
  where od.organization_id = v_case.organization_id;

  if v_max_screen_minutes is null then
    v_max_screen_minutes := 60;
  end if;

  return jsonb_build_object(
    'starsEarned', v_state.stars_earned,
    'tokensBalance', v_state.tokens_balance,
    'dailyScreenTimeUsedSeconds', v_state.daily_screen_time_used_seconds,
    'screenTimeLimitMinutes', v_max_screen_minutes,
    'preferences', v_state.preferences
  );
end $$;

-- RPC segura para registrar prática lúdica através do token da criança
create or replace function public.record_practice_run(
  p_token text,
  p_app_id text,
  p_duration_seconds int,
  p_stars int,
  p_telemetry jsonb default '{}'::jsonb
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_hash bytea;
  v_child_id uuid;
  v_run_id uuid;
begin
  if p_token is null or length(trim(p_token)) < 8 then
    raise exception 'invalid child session token' using errcode = '42501';
  end if;

  v_hash := extensions.digest(p_token, 'sha256');

  select cs.child_id into v_child_id
  from public.child_sessions cs
  where cs.token_hash = v_hash
    and cs.expires_at > now()
    and cs.revoked_at is null;

  if not found then
    raise exception 'child session expired or invalid' using errcode = '42501';
  end if;

  -- Garante estado
  insert into public.child_space_state (child_id)
  values (v_child_id)
  on conflict (child_id) do nothing;

  -- Reseta dia se necessário e adiciona tempo e estrelas
  update public.child_space_state
     set daily_screen_time_used_seconds = case
           when screen_time_reset_date = current_date then daily_screen_time_used_seconds + coalesce(p_duration_seconds, 0)
           else coalesce(p_duration_seconds, 0)
         end,
         screen_time_reset_date = current_date,
         stars_earned = stars_earned + coalesce(p_stars, 0),
         updated_at = now()
   where child_id = v_child_id;

  insert into public.practice_runs (child_id, app_id, duration_seconds, stars_awarded, telemetry)
  values (v_child_id, p_app_id, coalesce(p_duration_seconds, 0), coalesce(p_stars, 0), coalesce(p_telemetry, '{}'::jsonb))
  returning id into v_run_id;

  return v_run_id;
end $$;

grant execute on function public.get_child_space_state(text) to anon, authenticated;
grant execute on function public.record_practice_run(text, text, int, int, jsonb) to anon, authenticated;
