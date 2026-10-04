-- Aprumo · 0017 · Comunicação com a família: convites, mensagens, vídeos de orientação e resumos semanais (Doc B M11, §10.8, §10.10; Plano V2 F6).

create table public.family_invites (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  token_hash text not null unique,
  email text not null,
  relationship text not null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  sender_id uuid not null default auth.uid() references auth.users(id),
  sender_role text not null check (sender_role in ('professional', 'family')),
  scope text not null check (scope in ('clinical', 'administrative')),
  body text not null check (length(trim(body)) > 0),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create trigger messages_no_mutation before update or delete on public.messages
  for each row execute function app.forbid_mutation();

create table public.family_videos (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  title text not null,
  description text,
  storage_path text not null,
  model text not null check (model in ('aba', 'denver', 'both')),
  uploaded_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.weekly_summaries (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  week_start date not null,
  week_end date not null,
  content text not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'sent')),
  approved_by uuid references auth.users(id),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.family_invites enable row level security;
alter table public.messages enable row level security;
alter table public.family_videos enable row level security;
alter table public.weekly_summaries enable row level security;

create policy family_invites_select on public.family_invites for select to authenticated
  using (app.is_case_lead(case_id));
create policy family_invites_insert on public.family_invites for insert to authenticated
  with check (app.is_case_lead(case_id));

create policy messages_select on public.messages for select to authenticated
  using (app.is_case_member(case_id) or app.is_guardian_of(app.case_child(case_id)));
create policy messages_insert on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid() and (
      (sender_role = 'professional' and app.is_case_member(case_id)) or
      (sender_role = 'family' and app.is_guardian_of(app.case_child(case_id)))
    )
  );

create policy family_videos_select on public.family_videos for select to authenticated
  using (app.is_case_member(case_id) or app.is_guardian_of(app.case_child(case_id)));
create policy family_videos_insert on public.family_videos for insert to authenticated
  with check (app.is_case_lead(case_id));

create policy weekly_summaries_select on public.weekly_summaries for select to authenticated
  using (app.is_case_member(case_id) or (status = 'sent' and app.is_guardian_of(app.case_child(case_id))));
create policy weekly_summaries_write on public.weekly_summaries for all to authenticated
  using (app.is_case_lead(case_id)) with check (app.is_case_lead(case_id));

grant select, insert on public.family_invites to authenticated;
grant select, insert on public.messages to authenticated;
grant select, insert on public.family_videos to authenticated;
grant select, insert, update on public.weekly_summaries to authenticated;
