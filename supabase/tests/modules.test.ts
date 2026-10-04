import { beforeAll, describe, expect, it } from 'vitest';
import { U, asAdmin, asUser, createDb, type Db } from './harness';

const G = {
  maeTeo: '00000000-0000-4000-8000-0000000000e1',
  paiOutro: '00000000-0000-4000-8000-0000000000e2',
} as const;

let db: Db;
let org: string;
let caseTeo: string;
let caseBebe: string;
let childTeo: string;
let targetId: string;
let session: string;
let promptInd: string;

const one = <T,>(rows: T[]) => rows[0] as T;

beforeAll(async () => {
  db = await createDb();
  await asAdmin(db, `insert into auth.users (id) values ($1),($2),($3),($4)`, [U.anaSupervisor, U.beto, G.maeTeo, G.paiOutro]);
  org = one(await asAdmin<{ id: string }>(db, `insert into organizations (name) values ('Clínica') returning id`)).id;
  await asAdmin(db, `insert into organization_memberships (organization_id, user_id, role) values ($1,$2,'professional'),($1,$3,'professional')`, [org, U.anaSupervisor, U.beto]);

  caseTeo = one(await asUser<{ id: string }>(db, U.anaSupervisor, `select create_case($1,'Criança Um','Teo','2022-01-01','Mãe do Teo','mãe','v1') as id`, [org])).id;
  caseBebe = one(await asUser<{ id: string }>(db, U.anaSupervisor, `select create_case($1,'Criança Dois','Bia',(current_date - interval '18 months')::date,'Pai da Bia','pai','v1') as id`, [org])).id;
  childTeo = one(await asAdmin<{ child_id: string }>(db, `select child_id from cases where id = $1`, [caseTeo])).child_id;
  // Responsável do Teo ganha conta; o pai da Bia também (para testar isolamento entre famílias).
  await asAdmin(db, `update guardians set user_id = $1 where full_name = 'Mãe do Teo'`, [G.maeTeo]);
  await asAdmin(db, `update guardians set user_id = $1 where full_name = 'Pai da Bia'`, [G.paiOutro]);
  await asAdmin(db, `insert into case_team_members (case_id, user_id, role) values ($1,$2,'implementer')`, [caseTeo, U.beto]);

  const plan = one(await asAdmin<{ id: string }>(db, `insert into intervention_plans (case_id, model, status) values ($1,'ABA','active') returning id`, [caseTeo])).id;
  await asAdmin(db, `insert into intervention_plans (case_id, model, status) values ($1,'DENVER','active')`, [caseBebe]);
  const h = one(await asAdmin<{ id: string }>(db, `insert into prompt_hierarchies (organization_id, name, kind) values ($1,'LTM','least_to_most') returning id`, [org])).id;
  promptInd = one(await asAdmin<{ id: string }>(db, `insert into prompt_levels (hierarchy_id, position, code, label, intrusiveness) values ($1,0,'IND','Ind',0) returning id`, [h])).id;
  await asAdmin(db, `insert into prompt_levels (hierarchy_id, position, code, label, intrusiveness) values ($1,1,'GES','Ges',0.25)`, [h]);
  const mc = one(await asAdmin<{ id: string }>(db, `insert into mastery_criteria (organization_id, name) values ($1,'P') returning id`, [org])).id;
  const goal = one(await asAdmin<{ id: string }>(db, `insert into plan_goals (plan_id, domain, description) values ($1,'Linguagem','Ouvinte') returning id`, [plan])).id;
  const prog = one(await asAdmin<{ id: string }>(db,
    `insert into programs (plan_id, goal_id, name, repertoire, procedure, operational_definition, sd_description, prompt_hierarchy_id, error_correction, default_mastery_id)
     values ($1,$2,'Ouvinte','listener','DTT','def','sd',$3,'corr',$4) returning id`, [plan, goal, h, mc])).id;
  targetId = one(await asAdmin<{ id: string }>(db, `insert into targets (program_id, name, mastery_criteria_id, current_phase) values ($1,'bola',$2,'baseline') returning id`, [prog, mc])).id;
  session = one(await asUser<{ id: string }>(db, U.beto,
    `insert into sessions (case_id, plan_id, model, setting, implementer_id, status, started_at, screen_seconds) values ($1,$2,'ABA','clinic',$3,'active',now(),4200) returning id`,
    [caseTeo, plan, U.beto])).id;
  const rec = (id: string, response: string, prompt: string) => ({
    target_id: targetId, phase: 'baseline', trial_index: 0, response, prompt_level_id: prompt, channel: 'table',
    client_event_id: id, recorded_at: new Date().toISOString(),
  });
  const ges = one(await asAdmin<{ id: string }>(db, `select id from prompt_levels where code = 'GES'`)).id;
  await asUser(db, U.beto, `select * from ingest_trial_records($1, $2::jsonb)`, [session, JSON.stringify([
    rec('e1', 'correct', promptInd), rec('e2', 'correct', ges), rec('e3', 'incorrect', promptInd), rec('e4', 'correct', promptInd),
  ])]);
});

describe('reforçadores e tela', () => {
  it('MSWO digital exige sondas de pareamento e identificação de figuras', async () => {
    await expect(asUser(db, U.beto, `insert into preference_assessments (case_id, method, format) values ($1,'mswo','digital')`, [caseTeo]))
      .rejects.toThrow(/digital MSWO requires/);
    await asUser(db, U.beto, `insert into digital_prerequisite_probes (case_id, skill, passed) values ($1,'pareia-figura-identica',true),($1,'identifica-figura-nomeada',true)`, [caseTeo]);
    await asUser(db, U.beto, `insert into preference_assessments (case_id, method, format) values ($1,'mswo','digital')`, [caseTeo]);
  });

  it('livro de tela aplica o limite da faixa etária e aponta excesso', async () => {
    const rows = await asUser<{ minutes: number; limit_minutes: number; excess_minutes: number }>(db, U.anaSupervisor,
      `select minutes::int, limit_minutes, excess_minutes::int from screen_time_ledger where child_id = $1`, [childTeo]);
    expect(rows[0]).toEqual({ minutes: 70, limit_minutes: 60, excess_minutes: 10 });
  });

  it('portal infantil não abre abaixo de 24 meses', async () => {
    const plan = one(await asAdmin<{ id: string }>(db, `select id from intervention_plans where case_id = $1`, [caseBebe])).id;
    const s = one(await asUser<{ id: string }>(db, U.anaSupervisor,
      `insert into sessions (case_id, plan_id, model, setting, implementer_id, status) values ($1,$2,'DENVER','clinic',$3,'active') returning id`,
      [caseBebe, plan, U.anaSupervisor])).id;
    await expect(asUser(db, U.anaSupervisor, `select open_child_session($1, '{}'::jsonb, array['encontre-o-igual'])`, [s]))
      .rejects.toThrow(/under 24 months/);
  });
});

describe('projeções e alertas', () => {
  it('acerto com dica não conta como independente na projeção', async () => {
    const r = one(await asUser<{ opportunities: number; correct_independent: number; correct_prompted: number; pct_independent: string }>(db, U.anaSupervisor,
      `select opportunities::int, correct_independent::int, correct_prompted::int, pct_independent::text from fact_target_session where target_id = $1`, [targetId]));
    expect(r).toEqual({ opportunities: 4, correct_independent: 2, correct_prompted: 1, pct_independent: '50.00' });
  });

  it('alerta só é decidido pela supervisão, com justificativa, e não é reaberto', async () => {
    const id = one(await asAdmin<{ id: string }>(db,
      `insert into decision_alerts (case_id, rule_id, severity, subject_id, subject_name, title, evidence, suggested_action, basis, engine_version)
       values ($1,'R1','priority',$2,'bola','Critério atingido','2/2','Confirmar','Fuller e Fienup','1.0') returning id`, [caseTeo, targetId])).id;
    await expect(asUser(db, U.beto, `select decide_alert($1,'accepted','ok confirmado')`, [id])).rejects.toThrow(/only supervision/);
    await expect(asUser(db, U.anaSupervisor, `select decide_alert($1,'accepted','ok')`, [id])).rejects.toThrow(/justification/);
    await asUser(db, U.anaSupervisor, `select decide_alert($1,'accepted','Critério confirmado com estímulos novos')`, [id]);
    await expect(asUser(db, U.anaSupervisor, `select decide_alert($1,'dismissed','mudei de ideia')`, [id])).rejects.toThrow(/already decided/);
    await expect(asAdmin(db, `update decision_alerts set evidence = 'x' where id = $1`, [id])).rejects.toThrow(/immutable/);
  });
});

describe('família', () => {
  it('responsável vê progresso acessível da própria criança, nunca notas internas', async () => {
    await asUser(db, U.beto, `insert into session_notes (session_id, kind, content) values ($1,'clinical','Observação interna da equipe')`, [session]);
    const progress = await asUser<{ target_name: string; phase: string }>(db, G.maeTeo, `select target_name, phase from family_progress($1)`, [childTeo]);
    expect(progress).toEqual([{ target_name: 'bola', phase: 'Começando a observar' }]);
    expect(await asUser(db, G.maeTeo, `select * from session_notes`)).toHaveLength(0);
    expect(await asUser(db, G.maeTeo, `select * from trial_records`)).toHaveLength(0);
    expect(await asUser(db, G.maeTeo, `select * from cases`)).toHaveLength(0);
  });

  it('responsável de outra criança não acessa', async () => {
    await expect(asUser(db, G.paiOutro, `select * from family_progress($1)`, [childTeo])).rejects.toThrow(/not allowed/);
    expect(await asUser(db, G.paiOutro, `select id from children where id = $1`, [childTeo])).toHaveLength(0);
  });

  it('registro da família em tarefa de casa, com fonte explícita e sem edição', async () => {
    const task = one(await asUser<{ id: string }>(db, U.anaSupervisor,
      `insert into home_tasks (case_id, target_id, title, instructions, frequency) values ($1,$2,'Pedir no lanche','3 oportunidades','diária') returning id`, [caseTeo, targetId])).id;
    await asUser(db, G.maeTeo, `insert into home_task_records (task_id, occurred_on, opportunities, successes, client_event_id) values ($1,current_date,3,2,'h1')`, [task]);
    await expect(asUser(db, G.paiOutro, `insert into home_task_records (task_id, occurred_on, opportunities, successes, client_event_id) values ($1,current_date,3,3,'h2')`, [task])).rejects.toThrow();
    const seen = await asUser<{ source: string }>(db, U.anaSupervisor, `select source from home_task_records`);
    expect(seen).toEqual([{ source: 'guardian_report' }]);
    await expect(asAdmin(db, `update home_task_records set successes = 3`)).rejects.toThrow(/append-only/);
  });

  it('revogar o consentimento de prontuário corta o acesso do responsável', async () => {
    const childBia = one(await asAdmin<{ child_id: string }>(db, `select child_id from cases where id = $1`, [caseBebe])).child_id;
    expect(await asUser(db, G.paiOutro, `select id from children where id = $1`, [childBia])).toHaveLength(1);
    await asAdmin(db, `update consents set revoked_at = now() where child_id = $1`, [childBia]);
    expect(await asUser(db, G.paiOutro, `select id from children where id = $1`, [childBia])).toHaveLength(0);
  });
});

describe('documentos', () => {
  it('versão final exige registro no conselho, é imutável e só ela chega à família', async () => {
    const doc = one(await asUser<{ id: string }>(db, U.anaSupervisor,
      `insert into documents (case_id, kind, title, shared_with_family) values ($1,'family_summary','Resumo para a família',true) returning id`, [caseTeo])).id;
    await asUser(db, U.anaSupervisor, `select save_document_version($1,'Rascunho','{}'::jsonb,false)`, [doc]);
    await expect(asUser(db, U.anaSupervisor, `select save_document_version($1,'Final','{}'::jsonb,true)`, [doc])).rejects.toThrow(/council registration/);
    await asUser(db, U.anaSupervisor, `select save_document_version($1,'Texto final','{"periodo":"set/2026"}'::jsonb,true,'CRP 06/00000')`, [doc]);
    const fam = await asUser<{ status: string; version: number }>(db, G.maeTeo, `select status, version from document_versions where document_id = $1`, [doc]);
    expect(fam).toEqual([{ status: 'final', version: 2 }]);
    await expect(asAdmin(db, `update document_versions set content = 'x'`)).rejects.toThrow(/append-only/);
    await expect(asUser(db, U.beto, `select save_document_version($1,'x','{}'::jsonb,false)`, [doc])).rejects.toThrow(/only supervision/);
  });
});
