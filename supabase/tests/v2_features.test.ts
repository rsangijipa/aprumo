import { beforeAll, describe, expect, it } from 'vitest';
import { U, asAdmin, asUser, createDb, type Db } from './harness';

let db: Db;
let orgId: string;
let demoOrgId: string;
let caseId: string;
let activePlanId: string;

const one = <T,>(rows: T[]) => rows[0] as T;

beforeAll(async () => {
  db = await createDb();
  await asAdmin(db, `insert into auth.users (id) values ($1),($2)`, [U.anaSupervisor, U.beto]);

  // Cria organização real
  orgId = one(await asAdmin<{ id: string }>(db, `insert into organizations (name) values ('Clínica Padrão') returning id`)).id;
  await asAdmin(db, `insert into organization_memberships (organization_id, user_id, role) values ($1,$2,'org_admin')`, [orgId, U.anaSupervisor]);
  await asAdmin(db, `insert into organization_memberships (organization_id, user_id, role) values ($1,$2,'professional')`, [orgId, U.beto]);

  // Cria organização demo
  demoOrgId = one(await asAdmin<{ id: string }>(db, `insert into organizations (name, is_demo) values ('Org Demonstração', true) returning id`)).id;

  // Cria caso real com plano ativo
  caseId = one(await asUser<{ id: string }>(db, U.anaSupervisor,
    `select create_case($1,'Criança V2','Lucas','2020-05-10','Mãe Lucas','mãe','v1') as id`, [orgId])).id;

  activePlanId = one(await asAdmin<{ id: string }>(db,
    `insert into intervention_plans (case_id, model, version, status) values ($1,'ABA',1,'active') returning id`, [caseId])).id;

  const h = one(await asAdmin<{ id: string }>(db, `insert into prompt_hierarchies (organization_id, name, kind) values ($1,'LTM','least_to_most') returning id`, [orgId])).id;
  const mc = one(await asAdmin<{ id: string }>(db, `insert into mastery_criteria (organization_id, name) values ($1,'MC1') returning id`, [orgId])).id;
  const goal = one(await asAdmin<{ id: string }>(db, `insert into plan_goals (plan_id, domain, description) values ($1,'Comunicação','Ouvinte') returning id`, [activePlanId])).id;
  const prog = one(await asAdmin<{ id: string }>(db,
    `insert into programs (plan_id, goal_id, name, repertoire, procedure, operational_definition, sd_description, prompt_hierarchy_id, error_correction, default_mastery_id)
     values ($1,$2,'Ouvinte Objeto','listener','DTT','def','sd',$3,'corr',$4) returning id`, [activePlanId, goal, h, mc])).id;
  await asAdmin(db, `insert into targets (program_id, name, mastery_criteria_id, current_phase) values ($1,'bola',$2,'acquisition')`, [prog, mc]);
});

describe('0008: Padrões da organização (organization_defaults)', () => {
  it('cria automaticamente defaults ao criar organização', async () => {
    const defaults = await asUser<{ organization_id: string; denver_interval_minutes: number; default_mastery_criterion: { min_independent_pct: number } }>(
      db, U.anaSupervisor,
      `select organization_id, denver_interval_minutes, default_mastery_criterion from organization_defaults where organization_id = $1`,
      [orgId]
    );
    expect(defaults.length).toBe(1);
    expect(defaults[0].denver_interval_minutes).toBe(15);
    expect(defaults[0].default_mastery_criterion.min_independent_pct).toBe(90);
  });

  it('permite que org_admin atualize os defaults', async () => {
    await asUser(db, U.anaSupervisor,
      `update organization_defaults set denver_interval_minutes = 20 where organization_id = $1`, [orgId]);
    const updated = one(await asAdmin<{ denver_interval_minutes: number }>(db,
      `select denver_interval_minutes from organization_defaults where organization_id = $1`, [orgId]));
    expect(updated.denver_interval_minutes).toBe(20);
  });
});

describe('0009: Flag de demonstração (is_demo)', () => {
  it('herda is_demo = true da organização de demonstração', async () => {
    const demoCase = one(await asAdmin<{ id: string; is_demo: boolean }>(db,
      `insert into cases (organization_id, child_id, responsible_professional_id)
       values ($1, (select id from children limit 1), $2) returning id, is_demo`,
      [demoOrgId, U.anaSupervisor]
    ));
    expect(demoCase.is_demo).toBe(true);
  });

  it('view real_cases exclui casos de demonstração', async () => {
    const realCases = await asUser<{ id: string }>(db, U.anaSupervisor,
      `select id from real_cases where organization_id = $1`, [orgId]);
    expect(realCases.some(c => c.id === caseId)).toBe(true);

    const demoInReal = await asAdmin<{ id: string }>(db,
      `select id from real_cases where organization_id = $1`, [demoOrgId]);
    expect(demoInReal.length).toBe(0);
  });
});

describe('0010: Versionamento de planos (create_plan_revision e approve_plan_revision)', () => {
  it('cria revisão draft clonando metas, programas e alvos com source_id', async () => {
    const newDraftId = one(await asUser<{ create_plan_revision: string }>(
      db, U.anaSupervisor,
      `select create_plan_revision($1) as create_plan_revision`,
      [activePlanId]
    )).create_plan_revision;

    expect(newDraftId).toBeDefined();

    const newPlan = one(await asAdmin<{ version: number; status: string; supersedes_plan_id: string }>(
      db, `select version, status, supersedes_plan_id from intervention_plans where id = $1`, [newDraftId]
    ));
    expect(newPlan.version).toBe(2);
    expect(newPlan.status).toBe('draft');
    expect(newPlan.supersedes_plan_id).toBe(activePlanId);

    // Verifica se os alvos foram clonados com source_id
    const targets = await asAdmin<{ name: string; source_id: string }>(
      db, `select t.name, t.source_id from targets t
           join programs p on p.id = t.program_id
           where p.plan_id = $1`, [newDraftId]
    );
    expect(targets.length).toBe(1);
    expect(targets[0].name).toBe('bola');
    expect(targets[0].source_id).toBeDefined();

    // Aprova a revisão
    await asUser(db, U.anaSupervisor, `select approve_plan_revision($1)`, [newDraftId]);

    const oldPlanAfter = one(await asAdmin<{ status: string }>(
      db, `select status from intervention_plans where id = $1`, [activePlanId]
    ));
    expect(oldPlanAfter.status).toBe('closed');

    const newPlanAfter = one(await asAdmin<{ status: string }>(
      db, `select status from intervention_plans where id = $1`, [newDraftId]
    ));
    expect(newPlanAfter.status).toBe('active');
  });
});

describe('0011: Sessão infantil segura (open_child_session, resolve_child_session, revoke_child_session)', () => {
  it('abre sessão com terapeuta autenticado e resolve via anon usando apenas o token', async () => {
    // Cria sessão ativa para o teste
    const sessId = one(await asUser<{ id: string }>(
      db, U.anaSupervisor,
      `insert into sessions (case_id, plan_id, model, setting, implementer_id, status)
       values ($1, (select id from intervention_plans where case_id = $1 and status = 'active'), 'ABA', 'clinic', $2, 'active')
       returning id`,
      [caseId, U.anaSupervisor]
    )).id;

    // Adulto autenticado abre a sessão da criança
    const token = one(await asUser<{ open_child_session: string }>(
      db, U.anaSupervisor,
      `select open_child_session($1, '{"high_contrast": true}'::jsonb, array['encontre-o-igual']) as open_child_session`,
      [sessId]
    )).open_child_session;

    expect(token).toBeDefined();
    expect(token.length).toBe(64); // hex sha256 length

    // Aparelho da criança resolve a sessão (executando como anon / sem auth.uid)
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false); set role anon;`);
    const resolvedRows = (await db.query<{ resolve_child_session: { valid: boolean; preferred_name: string; allowed_apps: string[] } }>(
      `select resolve_child_session($1) as resolve_child_session`, [token]
    )).rows;
    const resolved = resolvedRows[0].resolve_child_session;

    expect(resolved.valid).toBe(true);
    expect(resolved.preferred_name).toBe('Lucas');
    expect(resolved.allowed_apps).toContain('encontre-o-igual');

    // Ao sair com PIN do adulto, o token é revogado
    await db.query(`select revoke_child_session($1)`, [token]);

    const resolvedAfterRevoke = (await db.query<{ resolve_child_session: { valid: boolean; reason: string } }>(
      `select resolve_child_session($1) as resolve_child_session`, [token]
    )).rows[0].resolve_child_session;

    expect(resolvedAfterRevoke.valid).toBe(false);
    expect(resolvedAfterRevoke.reason).toBe('revoked');
    await db.exec(`reset role;`);
  });
});

describe('0012: Retratação de tentativa (desfazer)', () => {
  it('exclui tentativa retratada da view fact_trials', async () => {
    const sessId = one(await asUser<{ id: string }>(
      db, U.anaSupervisor,
      `insert into sessions (case_id, plan_id, model, setting, implementer_id, status)
       values ($1, (select id from intervention_plans where case_id = $1 and status = 'active'), 'ABA', 'clinic', $2, 'active')
       returning id`,
      [caseId, U.anaSupervisor]
    )).id;

    const target = one(await asAdmin<{ id: string }>(db, `select id from targets limit 1`)).id;
    const h = one(await asAdmin<{ id: string }>(db, `select id from prompt_hierarchies limit 1`)).id;
    const prompt = one(await asAdmin<{ id: string }>(db,
      `insert into prompt_levels (hierarchy_id, position, code, label, intrusiveness)
       values ($1, 0, 'IND_TEST', 'Ind', 0) returning id`, [h])).id;

    // Registra uma tentativa
    await asUser(db, U.anaSupervisor,
      `insert into trial_records (session_id, target_id, phase, trial_index, response, prompt_level_id, channel, client_event_id, recorded_at)
       values ($1, $2, 'acquisition', 1, 'correct', $3, 'table', 'trial-undo-1', now())`,
      [sessId, target, prompt]
    );

    const beforeRetract = await asUser<{ id: string }>(db, U.anaSupervisor,
      `select id from fact_trials where session_id = $1`, [sessId]);
    expect(beforeRetract.length).toBe(1);

    // Retrata a tentativa (desfazer)
    await asUser(db, U.anaSupervisor,
      `insert into trial_retractions (session_id, trial_client_event_id, reason)
       values ($1, 'trial-undo-1', 'toque acidental do aplicador')`,
      [sessId]
    );

    const afterRetract = await asUser<{ id: string }>(db, U.anaSupervisor,
      `select id from fact_trials where session_id = $1`, [sessId]);
    expect(afterRetract.length).toBe(0);
  });
});

describe('0013: Projeção de passos Denver (fact_denver_step_session)', () => {
  it('calcula porcentagens de acerto e parcial por passo Denver', async () => {
    // Cria caso Denver
    const caseDenver = one(await asUser<{ id: string }>(
      db, U.anaSupervisor,
      `select create_case($1,'Criança Denver','Davi','2023-01-01','Mãe Davi','mãe','v1') as id`, [orgId]
    )).id;

    const planDenver = one(await asAdmin<{ id: string }>(
      db, `insert into intervention_plans (case_id, model, status) values ($1, 'DENVER', 'active') returning id`, [caseDenver]
    )).id;

    const sessDenver = one(await asUser<{ id: string }>(
      db, U.anaSupervisor,
      `insert into sessions (case_id, plan_id, model, setting, implementer_id, status)
       values ($1, $2, 'DENVER', 'clinic', $3, 'active') returning id`,
      [caseDenver, planDenver, U.anaSupervisor]
    )).id;

    const cycleDenver = one(await asAdmin<{ id: string }>(
      db, `insert into denver_cycles (plan_id, starts_on, ends_on) values ($1, current_date, current_date + 84) returning id`, [planDenver]
    )).id;

    const objDenver = one(await asAdmin<{ id: string }>(
      db, `insert into denver_objectives (cycle_id, domain, level, description, mastery_rule) values ($1, 'Brincar', 1, 'Brinca com objetos', '80%') returning id`, [cycleDenver]
    )).id;

    const stepDenver = one(await asAdmin<{ id: string }>(
      db, `insert into denver_steps (objective_id, position, description) values ($1, 1, 'Passo 1') returning id`, [objDenver]
    )).id;

    // Pontua 4 intervalos: 2 pass, 1 partial, 1 fail
    await asUser(db, U.anaSupervisor,
      `insert into denver_step_scores (session_id, step_id, interval_index, score, client_event_id, recorded_at)
       values ($1, $2, 0, 'pass', 'd1', now()),
              ($1, $2, 1, 'pass', 'd2', now()),
              ($1, $2, 2, 'partial', 'd3', now()),
              ($1, $2, 3, 'fail', 'd4', now())`,
      [sessDenver, stepDenver]
    );

    const factDenver = await asUser<{ total_intervals: number; pass_intervals: number; partial_intervals: number; pass_pct: number; pass_or_partial_pct: number }>(
      db, U.anaSupervisor,
      `select total_intervals::int, pass_intervals::int, partial_intervals::int, pass_pct::float, pass_or_partial_pct::float
       from fact_denver_step_session where session_id = $1`, [sessDenver]
    );

    expect(factDenver.length).toBe(1);
    expect(factDenver[0].total_intervals).toBe(4);
    expect(factDenver[0].pass_intervals).toBe(2);
    expect(factDenver[0].partial_intervals).toBe(1);
    expect(factDenver[0].pass_pct).toBe(50.0);
    expect(factDenver[0].pass_or_partial_pct).toBe(75.0);
  });
});

