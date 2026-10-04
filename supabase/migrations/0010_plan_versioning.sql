-- Aprumo · 0010 · Versionamento imutável de planos de intervenção (PEI).
-- Editar um plano ativo gera uma nova versão em rascunho. A aprovação da nova encerra a anterior.

alter table public.plan_goals
  add column if not exists source_id uuid references public.plan_goals(id);

alter table public.programs
  add column if not exists source_id uuid references public.programs(id);

alter table public.targets
  add column if not exists source_id uuid references public.targets(id);

-- Cria uma nova versão em rascunho clonando a estrutura do plano ativo atual
create function public.create_plan_revision(p_plan_id uuid)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_old_plan public.intervention_plans%rowtype;
  v_new_plan_id uuid;
  v_goal record;
  v_new_goal_id uuid;
  v_prog record;
  v_new_prog_id uuid;
  v_tgt record;
begin
  select * into v_old_plan from public.intervention_plans where id = p_plan_id;
  if not found then
    raise exception 'plan not found' using errcode = 'P0002';
  end if;

  if not app.is_case_lead(v_old_plan.case_id) then
    raise exception 'permission denied: case lead required to revise plan' using errcode = '42501';
  end if;

  if v_old_plan.status <> 'active' then
    raise exception 'only active plans can be revised into a new version' using errcode = 'P0001';
  end if;

  -- 1. Insere o novo plano como rascunho incrementando a versão
  insert into public.intervention_plans (
    case_id, model, version, status, starts_on, review_on, supersedes_plan_id
  ) values (
    v_old_plan.case_id,
    v_old_plan.model,
    v_old_plan.version + 1,
    'draft',
    current_date,
    v_old_plan.review_on,
    v_old_plan.id
  ) returning id into v_new_plan_id;

  -- 2. Clona objetivos, programas e alvos preservando a linhagem (source_id)
  for v_goal in (select * from public.plan_goals where plan_id = p_plan_id) loop
    insert into public.plan_goals (
      plan_id, domain, description, priority, status, source_id
    ) values (
      v_new_plan_id, v_goal.domain, v_goal.description, v_goal.priority, v_goal.status, v_goal.id
    ) returning id into v_new_goal_id;

    for v_prog in (select * from public.programs where goal_id = v_goal.id) loop
      insert into public.programs (
        plan_id, goal_id, name, repertoire, procedure, operational_definition,
        sd_description, prompt_hierarchy_id, error_correction, default_mastery_id,
        reinforcement_schedule, source_id
      ) values (
        v_new_plan_id, v_new_goal_id, v_prog.name, v_prog.repertoire, v_prog.procedure,
        v_prog.operational_definition, v_prog.sd_description, v_prog.prompt_hierarchy_id,
        v_prog.error_correction, v_prog.default_mastery_id, v_prog.reinforcement_schedule,
        v_prog.id
      ) returning id into v_new_prog_id;

      for v_tgt in (select * from public.targets where program_id = v_prog.id) loop
        insert into public.targets (
          program_id, name, stimulus_set_id, stimulus_id, mastery_criteria_id,
          current_phase, teaching_channel, status, source_id
        ) values (
          v_new_prog_id, v_tgt.name, v_tgt.stimulus_set_id, v_tgt.stimulus_id,
          v_tgt.mastery_criteria_id, v_tgt.current_phase, v_tgt.teaching_channel,
          v_tgt.status, v_tgt.id
        );
      end loop;
    end loop;
  end loop;

  return v_new_plan_id;
end $$;

-- Aprova uma revisão de plano: fecha a versão anterior e ativa a nova
create function public.approve_plan_revision(p_draft_plan_id uuid)
returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  v_draft public.intervention_plans%rowtype;
begin
  select * into v_draft from public.intervention_plans where id = p_draft_plan_id;
  if not found then
    raise exception 'draft plan not found' using errcode = 'P0002';
  end if;

  if not app.is_case_lead(v_draft.case_id) then
    raise exception 'permission denied: case lead required' using errcode = '42501';
  end if;

  if v_draft.status <> 'draft' then
    raise exception 'plan is not in draft status' using errcode = 'P0001';
  end if;

  -- Se substitui um plano anterior, encerra o anterior
  if v_draft.supersedes_plan_id is not null then
    update public.intervention_plans
    set status = 'closed',
        transition_reason = coalesce(transition_reason, 'superseded by v' || v_draft.version)
    where id = v_draft.supersedes_plan_id and status = 'active';
  end if;

  -- Ativa a nova versão
  update public.intervention_plans
  set status = 'active',
      approved_by = auth.uid(),
      approved_at = now()
  where id = p_draft_plan_id;

  return true;
end $$;

grant execute on function public.create_plan_revision to authenticated;
grant execute on function public.approve_plan_revision to authenticated;
