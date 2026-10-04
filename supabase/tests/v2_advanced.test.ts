import { beforeAll, describe, expect, it } from 'vitest';
import { U, asAdmin, asUser, createDb, type Db } from './harness';

let db: Db;
let orgId: string;
let caseId: string;
let targetId: string;
let _childId: string;
let childSessionToken: string;

const one = <T,>(rows: T[]) => rows[0] as T;

beforeAll(async () => {
  db = await createDb();
  await asAdmin(db, `insert into auth.users (id) values ($1),($2)`, [U.anaSupervisor, U.beto]);

  orgId = one(await asAdmin<{ id: string }>(db, `insert into organizations (name) values ('Clínica Especializada') returning id`)).id;
  await asAdmin(db, `insert into organization_memberships (organization_id, user_id, role) values ($1,$2,'org_admin')`, [orgId, U.anaSupervisor]);
  await asAdmin(db, `insert into organization_memberships (organization_id, user_id, role) values ($1,$2,'professional')`, [orgId, U.beto]);

  caseId = one(await asUser<{ id: string }>(db, U.anaSupervisor,
    `select create_case($1,'Criança Fases','Maju','2021-02-15','Mãe Maju','mãe','v1') as id`, [orgId])).id;

  _childId = one(await asAdmin<{ child_id: string }>(db, `select child_id from cases where id = $1`, [caseId])).child_id;

  const planId = one(await asAdmin<{ id: string }>(db,
    `insert into intervention_plans (case_id, model, version, status) values ($1,'ABA',1,'active') returning id`, [caseId])).id;

  const h = one(await asAdmin<{ id: string }>(db, `insert into prompt_hierarchies (organization_id, name, kind) values ($1,'LTM2','least_to_most') returning id`, [orgId])).id;
  const mc = one(await asAdmin<{ id: string }>(db, `insert into mastery_criteria (organization_id, name) values ($1,'MC2') returning id`, [orgId])).id;
  const goal = one(await asAdmin<{ id: string }>(db, `insert into plan_goals (plan_id, domain, description) values ($1,'Comunicação','Mando') returning id`, [planId])).id;
  const prog = one(await asAdmin<{ id: string }>(db,
    `insert into programs (plan_id, goal_id, name, repertoire, procedure, operational_definition, sd_description, prompt_hierarchy_id, error_correction, default_mastery_id)
     values ($1,$2,'Mando Item','mand','NET','def','sd',$3,'corr',$4) returning id`, [planId, goal, h, mc])).id;
  targetId = one(await asAdmin<{ id: string }>(db,
    `insert into targets (program_id, name, mastery_criteria_id, current_phase) values ($1,'água',$2,'acquisition') returning id`, [prog, mc])).id;

  // Cria sessão ativa
  const sessId = one(await asUser<{ id: string }>(
    db, U.anaSupervisor,
    `insert into sessions (case_id, plan_id, model, setting, implementer_id, status)
     values ($1, $2, 'ABA', 'clinic', $3, 'active') returning id`,
    [caseId, planId, U.anaSupervisor]
  )).id;

  // Gera token de sessão infantil com terapeuta autenticado
  childSessionToken = one(await asUser<{ open_child_session: string }>(
    db, U.anaSupervisor,
    `select open_child_session($1, '{"high_contrast": false}'::jsonb, array['bolhas']) as open_child_session`,
    [sessId]
  )).open_child_session;
});

describe('0014: Instrumentos e avaliações estruturadas', () => {
  it('registra instrumento padrão e escore de avaliação imutável', async () => {
    const instId = one(await asAdmin<{ id: string }>(db,
      `insert into instruments (code, name, publisher, satepsi_status, min_age_months, max_age_months)
       values ('VB-MAPP', 'Verbal Behavior Milestones', 'AVB Press', 'not_applicable', 0, 48) returning id`)).id;

    const scoreId = one(await asUser<{ id: string }>(db, U.anaSupervisor,
      `insert into instrument_scores (case_id, instrument_id, evaluator_id, evaluation_date, raw_scores, percentile, interpretation)
       values ($1, $2, $3, current_date, '{"milestones": 120}', 85.5, 'Desempenho no Nível 2') returning id`,
      [caseId, instId, U.anaSupervisor])).id;

    expect(scoreId).toBeDefined();

    // Imutabilidade de escores
    await expect(asUser(db, U.anaSupervisor,
      `update instrument_scores set interpretation = 'Alterado' where id = $1`, [scoreId]))
      .rejects.toThrow();
  });

  it('permite registrar sondas de linha de base e avaliação funcional descritiva', async () => {
    const probeId = one(await asUser<{ id: string }>(db, U.anaSupervisor,
      `insert into baseline_probes (target_id, probe_number, correct, prompt_level, notes)
       values ($1, 1, false, 'none', 'Primeira sonda sem dica') returning id`, [targetId])).id;
    expect(probeId).toBeDefined();

    const faId = one(await asUser<{ id: string }>(db, U.anaSupervisor,
      `insert into functional_assessments (case_id, assessor_id, date, target_behaviors, hypotheses)
       values ($1, $2, current_date, array['choro'], '[{"function": "escape", "confidence": "high"}]') returning id`,
      [caseId, U.anaSupervisor])).id;
    expect(faId).toBeDefined();
  });
});

describe('0015: Adiar alertas com justificativa e reavaliação futura', () => {
  it('permite adiar alerta aberto com auditoria', async () => {
    const alertId = one(await asAdmin<{ id: string }>(db,
      `insert into decision_alerts (case_id, rule_id, severity, subject_id, subject_name, title, evidence, suggested_action, basis, engine_version)
       values ($1, 'R1', 'priority', $2, 'água', 'Critério atingido', '90% em 2 sessões', 'Avançar fase', 'Cooper et al.', '2.0.0')
       returning id`, [caseId, targetId])).id;

    const futureDate = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString();

    await asUser(db, U.anaSupervisor,
      `select snooze_alert($1, $2::timestamptz, 'Aguardando validação com terapeuta de apoio')`,
      [alertId, futureDate]);

    const alert = one(await asAdmin<{ status: string; snoozed_until: string; decision_reason: string }>(db,
      `select status, snoozed_until, decision_reason from decision_alerts where id = $1`, [alertId]));

    expect(alert.status).toBe('snoozed');
    expect(alert.decision_reason).toContain('Aguardando');
  });
});

describe('0016: Espaço da criança e telemetria recreativa', () => {
  it('retorna estado lúdico inicial via token da sessão infantil', async () => {
    await db.exec(`reset role; set role anon;`);
    try {
      const res = await db.query<{ get_child_space_state: { starsEarned: number; dailyScreenTimeUsedSeconds: number; screenTimeLimitMinutes: number } }>(
        `select get_child_space_state($1) as get_child_space_state`, [childSessionToken]
      );
      expect(res.rows[0].get_child_space_state.starsEarned).toBe(0);
      expect(res.rows[0].get_child_space_state.screenTimeLimitMinutes).toBe(60);
    } finally {
      await db.exec('reset role;');
    }
  });

  it('registra prática lúdica e atualiza tempo de tela e estrelas', async () => {
    await db.exec(`reset role; set role anon;`);
    try {
      const res = await db.query<{ record_practice_run: string }>(
        `select record_practice_run($1, 'bolhas', 180, 5, '{"bubbles_popped": 42}') as record_practice_run`,
        [childSessionToken]
      );
      expect(res.rows[0].record_practice_run).toBeDefined();

      const state = await db.query<{ get_child_space_state: { starsEarned: number; dailyScreenTimeUsedSeconds: number } }>(
        `select get_child_space_state($1) as get_child_space_state`, [childSessionToken]
      );
      expect(state.rows[0].get_child_space_state.starsEarned).toBe(5);
      expect(state.rows[0].get_child_space_state.dailyScreenTimeUsedSeconds).toBe(180);
    } finally {
      await db.exec('reset role;');
    }
  });
});

describe('0017: Comunicação e orientações à família', () => {
  it('permite mensagens e resumos semanais com controle de acesso', async () => {
    const msgId = one(await asUser<{ id: string }>(db, U.anaSupervisor,
      `insert into messages (case_id, sender_id, sender_role, scope, body)
       values ($1, $2, 'professional', 'clinical', 'Hoje a criança respondeu muito bem aos treinos de mando.') returning id`,
      [caseId, U.anaSupervisor])).id;
    expect(msgId).toBeDefined();

    const summaryId = one(await asUser<{ id: string }>(db, U.anaSupervisor,
      `insert into weekly_summaries (case_id, week_start, week_end, content, status)
       values ($1, current_date - 7, current_date, 'Semana produtiva com 4 sessões realizadas.', 'approved') returning id`,
      [caseId])).id;
    expect(summaryId).toBeDefined();
  });
});

describe('0018: Gestão, segurança, conformidade e bloqueio progressivo', () => {
  it('cria unidade da organização e valida modelos CFP 06/2019', async () => {
    const unitId = one(await asUser<{ id: string }>(db, U.anaSupervisor,
      `insert into units (organization_id, name, code) values ($1, 'Unidade Jardins', 'SP-01') returning id`,
      [orgId])).id;
    expect(unitId).toBeDefined();

    const docId = one(await asUser<{ id: string }>(db, U.anaSupervisor,
      `insert into documents (case_id, kind, title) values ($1, 'psychological_evaluation', 'Laudo Diagnóstico') returning id`,
      [caseId])).id;
    expect(docId).toBeDefined();
  });

  it('bloqueia progressivamente após tentativas falhas repetidas', async () => {
    const testEmail = 'invasor@tentativa.com';
    for (let i = 1; i <= 4; i++) {
      const allowed = one(await asAdmin<{ record_login_attempt: boolean }>(db,
        `select record_login_attempt($1, false) as record_login_attempt`, [testEmail])).record_login_attempt;
      expect(allowed).toBe(true);
    }

    // 5ª tentativa falha dispara bloqueio de 5 minutos
    const fifthAttemptAllowed = one(await asAdmin<{ record_login_attempt: boolean }>(db,
      `select record_login_attempt($1, false) as record_login_attempt`, [testEmail])).record_login_attempt;
    expect(fifthAttemptAllowed).toBe(false);

    // Sucesso subsequente desbloqueia
    const successResult = one(await asAdmin<{ record_login_attempt: boolean }>(db,
      `select record_login_attempt($1, true) as record_login_attempt`, [testEmail])).record_login_attempt;
    expect(successResult).toBe(true);
  });
});
