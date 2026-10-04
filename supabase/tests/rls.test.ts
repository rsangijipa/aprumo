import { beforeAll, describe, expect, it } from 'vitest';
import { U, asAdmin, asUser, createDb, type Db } from './harness';

let db: Db;
let orgA: string;
let orgB: string;
let caseAba: string;
let caseOtherOrg: string;
let planAba: string;
let targetId: string;
let promptInd: string;
let sessionAba: string;

const one = <T,>(rows: T[]) => rows[0] as T;

beforeAll(async () => {
  db = await createDb();
  await asAdmin(db, `insert into auth.users (id) values ($1),($2),($3),($4)`, [U.anaSupervisor, U.beto, U.carlaOtherOrg, U.diegoAdmin]);
  orgA = one(await asAdmin<{ id: string }>(db, `insert into organizations (name) values ('Clínica A') returning id`)).id;
  orgB = one(await asAdmin<{ id: string }>(db, `insert into organizations (name) values ('Clínica B') returning id`)).id;
  await asAdmin(db, `insert into organization_memberships (organization_id, user_id, role) values
    ($1,$2,'professional'),($1,$3,'professional'),($1,$4,'org_admin'),($5,$6,'professional')`,
    [orgA, U.anaSupervisor, U.beto, U.diegoAdmin, orgB, U.carlaOtherOrg]);

  caseAba = one(await asUser<{ id: string }>(db, U.anaSupervisor,
    `select create_case($1,'Criança Teste Um','Teo','2022-03-10','Responsável Um','mãe','v1') as id`, [orgA])).id;
  caseOtherOrg = one(await asUser<{ id: string }>(db, U.carlaOtherOrg,
    `select create_case($1,'Criança Teste Dois','Lia','2021-01-01','Responsável Dois','pai','v1') as id`, [orgB])).id;

  // Plano ABA aprovado com um alvo; Beto entra como aplicador.
  await asAdmin(db, `insert into case_team_members (case_id, user_id, role) values ($1,$2,'implementer')`, [caseAba, U.beto]);
  planAba = one(await asAdmin<{ id: string }>(db,
    `insert into intervention_plans (case_id, model, status) values ($1,'ABA','active') returning id`, [caseAba])).id;
  const h = one(await asAdmin<{ id: string }>(db,
    `insert into prompt_hierarchies (organization_id, name, kind) values ($1,'LTM','least_to_most') returning id`, [orgA])).id;
  promptInd = one(await asAdmin<{ id: string }>(db,
    `insert into prompt_levels (hierarchy_id, position, code, label, intrusiveness) values ($1,0,'IND','Independente',0) returning id`, [h])).id;
  const mc = one(await asAdmin<{ id: string }>(db, `insert into mastery_criteria (organization_id, name) values ($1,'Padrão') returning id`, [orgA])).id;
  const goal = one(await asAdmin<{ id: string }>(db, `insert into plan_goals (plan_id, domain, description) values ($1,'Linguagem receptiva','Ouvinte') returning id`, [planAba])).id;
  const prog = one(await asAdmin<{ id: string }>(db,
    `insert into programs (plan_id, goal_id, name, repertoire, procedure, operational_definition, sd_description, prompt_hierarchy_id, error_correction, default_mastery_id)
     values ($1,$2,'Ouvinte — objetos','listener','DTT','Toca a figura nomeada','"Toque na X"',$3,'Reapresentar com dica',$4) returning id`,
    [planAba, goal, h, mc])).id;
  targetId = one(await asAdmin<{ id: string }>(db,
    `insert into targets (program_id, name, mastery_criteria_id) values ($1,'bola',$2) returning id`, [prog, mc])).id;
  sessionAba = one(await asUser<{ id: string }>(db, U.beto,
    `insert into sessions (case_id, plan_id, model, setting, implementer_id, status) values ($1,$2,'ABA','clinic',$3,'active') returning id`,
    [caseAba, planAba, U.beto])).id;
});

describe('isolamento', () => {
  it('profissional de outra organização não lê nem enumera o caso', async () => {
    expect(await asUser(db, U.carlaOtherOrg, `select id from cases where id = $1`, [caseAba])).toHaveLength(0);
    expect(await asUser(db, U.carlaOtherOrg, `select id from children`)).toHaveLength(1);
  });

  it('administrador da organização sem vínculo com o caso não vê conteúdo clínico', async () => {
    expect(await asUser(db, U.diegoAdmin, `select id from cases`)).toHaveLength(0);
    expect(await asUser(db, U.diegoAdmin, `select id from children`)).toHaveLength(0);
  });

  it('membro do caso enxerga o caso; nenhum caso da outra organização', async () => {
    const rows = await asUser<{ id: string }>(db, U.anaSupervisor, `select id from cases`);
    expect(rows.map((r) => r.id)).toEqual([caseAba]);
    expect(rows.map((r) => r.id)).not.toContain(caseOtherOrg);
  });

  it('anon não acessa nada', async () => {
    await db.exec(`set role anon`);
    await expect(db.query(`select * from cases`)).rejects.toThrow();
    await db.exec(`reset role`);
  });
});

describe('modelo único por caso (P1)', () => {
  it('rejeita programa ABA em plano Denver', async () => {
    const caseD = one(await asUser<{ id: string }>(db, U.anaSupervisor,
      `select create_case($1,'Criança Teste Três','Bia','2024-01-01','Resp','mãe','v1') as id`, [orgA])).id;
    const planD = one(await asAdmin<{ id: string }>(db,
      `insert into intervention_plans (case_id, model, status) values ($1,'DENVER','active') returning id`, [caseD])).id;
    await expect(asAdmin(db, `insert into plan_goals (plan_id, domain, description) values ($1,'x','y')`, [planD]))
      .rejects.toThrow(/only accepts ABA/);
  });

  it('não permite trocar o modelo de um plano aprovado', async () => {
    await expect(asAdmin(db, `update intervention_plans set model = 'DENVER' where id = $1`, [planAba]))
      .rejects.toThrow(/immutable/);
  });

  it('rejeita registro Denver em sessão ABA', async () => {
    await expect(asUser(db, U.beto,
      `insert into denver_routine_records (session_id, routine_type, started_at, initiated_by, client_event_id)
       values ($1,'book',now(),'child','r1')`, [sessionAba])).rejects.toThrow(/only valid in DENVER/);
  });
});

describe('registros clínicos', () => {
  const rec = (id: string) => ({
    target_id: targetId, phase: 'acquisition', trial_index: 0, response: 'correct',
    prompt_level_id: promptInd, channel: 'table', client_event_id: id, recorded_at: new Date().toISOString(),
  });

  it('ingestão é idempotente e devolve ACK dos já persistidos', async () => {
    const batch = JSON.stringify([rec('evt-0001'), rec('evt-0002')]);
    const first = await asUser<{ ingest_trial_records: string }>(db, U.beto, `select * from ingest_trial_records($1, $2::jsonb)`, [sessionAba, batch]);
    const retry = await asUser<{ ingest_trial_records: string }>(db, U.beto, `select * from ingest_trial_records($1, $2::jsonb)`, [sessionAba, batch]);
    expect(first).toHaveLength(2);
    expect(retry).toHaveLength(2);
    const count = await asAdmin<{ n: number }>(db, `select count(*)::int as n from trial_records where session_id = $1`, [sessionAba]);
    expect(count[0]!.n).toBe(2);
  });

  it('registros são imutáveis', async () => {
    await expect(asAdmin(db, `update trial_records set response = 'incorrect'`)).rejects.toThrow(/append-only/);
    await expect(asAdmin(db, `delete from trial_records`)).rejects.toThrow(/append-only/);
  });

  it('profissional sem vínculo não registra na sessão', async () => {
    await expect(asUser(db, U.anaSupervisor, `select * from ingest_trial_records($1, $2::jsonb)`,
      [sessionAba, JSON.stringify([rec('evt-9999')])])).rejects.toThrow();
  });

  it('fase só muda pela função, com justificativa e pela supervisão', async () => {
    await expect(asAdmin(db, `update targets set current_phase = 'acquisition' where id = $1`, [targetId]))
      .rejects.toThrow(/change_target_phase/);
    await expect(asUser(db, U.beto, `select change_target_phase($1,'acquisition','Linha de base concluída')`, [targetId]))
      .rejects.toThrow(/only supervision/);
    await asUser(db, U.anaSupervisor, `select change_target_phase($1,'acquisition','Linha de base concluída')`, [targetId]);
    const t = await asAdmin<{ current_phase: string }>(db, `select current_phase from targets where id = $1`, [targetId]);
    expect(t[0]!.current_phase).toBe('acquisition');
    const tl = await asAdmin(db, `select 1 from case_timeline_events where kind = 'phase_change'`);
    expect(tl).toHaveLength(1);
  });

  it('sessão só fecha com nota clínica', async () => {
    await expect(asUser(db, U.beto, `select complete_session($1,'ok')`, [sessionAba])).rejects.toThrow(/clinical note/);
  });

  it('caso não pode ser apagado (guarda de prontuário)', async () => {
    await expect(asAdmin(db, `delete from cases where id = $1`, [caseAba])).rejects.toThrow(/retained/);
  });
});
