/**
 * Repositório do app. No modo demonstração os dados vivem em memória (nunca em localStorage)
 * e cada registro clínico passa pela outbox cifrada, exatamente como em produção.
 * Com VITE_SUPABASE_URL configurado, o `sender` passa a chamar a RPC ingest_trial_records.
 */
import { useRef, useSyncExternalStore } from 'react';
import {
  DEFAULT_MASTERY,
  ageInMonths,
  evaluateRules,
  screenPolicyFor,
  summarizeByTargetSession,
  type DecisionAlert,
  type TargetSessionSummary,
} from '@aprumo/clinical-core';
import { Outbox, type OutboxRecord } from '@aprumo/offline';
import type { SessionConfig } from '@aprumo/protocol';
import * as seed from './seed';
import { isSupabaseConfigured, supabaseSender } from './supabase';
import type {
  BehaviorDefinition,
  ChildSpace,
  BehaviorEvent,
  CaseRecord,
  Child,
  Competency,
  DenverCycle,
  DenverObjective,
  DenverStepScoreRecord,
  FidelityObservation,
  Goal,
  Guardian,
  Invite,
  IoaSession,
  ManagementPlan,
  PreferenceAssessment,
  PrerequisiteProbe,
  PrerequisiteSkill,
  Professional,
  Program,
  Reinforcer,
  SupervisionLog,
  UiSettings,
  ClinicalDocument,
  DocumentKind,
  DocumentSnapshot,
  Guidance,
  HomeTask,
  HomeTaskRecord,
  SocialValidity,
  DismissedAlert,
  Fact,
  SessionRecord,
  Target,
  TimelineEvent,
} from './types';

export interface State {
  sessions: SessionRecord[];
  facts: Fact[];
  targets: Target[];
  behaviorEvents: BehaviorEvent[];
  timeline: TimelineEvent[];
  dismissed: DismissedAlert[];
  tokenDeliveries: Array<{ id: string; sessionId: string; at: string }>;
  pendingSync: number;
  online: boolean;
  activeRun: ActiveRun | null;
  homeTasks: HomeTask[];
  homeRecords: HomeTaskRecord[];
  guidance: Guidance[];
  socialValidity: SocialValidity[];
  documents: ClinicalDocument[];
  professionals: Professional[];
  children: Child[];
  cases: CaseRecord[];
  guardians: Guardian[];
  goals: Goal[];
  programs: Program[];
  reinforcers: Reinforcer[];
  behaviorDefinitions: BehaviorDefinition[];
  denverObjectives: DenverObjective[];
  denverCycles: DenverCycle[];
  denverStepScores: DenverStepScoreRecord[];
  prerequisiteProbes: PrerequisiteProbe[];
  preferenceAssessments: PreferenceAssessment[];
  fidelity: FidelityObservation[];
  ioa: IoaSession[];
  supervisionLogs: SupervisionLog[];
  competencies: Competency[];
  invites: Invite[];
  settings: UiSettings;
  childSpaces: ChildSpace[];
  /** Tempo de tela fora de sessão (espaço da criança), por caso e dia: caseId:AAAA-MM-DD. */
  childScreen: Record<string, number>;
}

/** Atividade em tela aberta pelo profissional para a criança (não persiste fora da sessão). */
export interface ActiveRun {
  sessionId: string;
  appId: string;
  config: SessionConfig;
  schedule: Array<{ id: string; picto: string; label: string }>;
  tokenBoard: null | { theme: string; required: number; rewardLabel: string; rewardCategory: string; accessSec: number; autoOnIndependent: boolean };
  maxBlockMinutes: number;
}

let state: State = {
  sessions: seed.sessions,
  facts: seed.facts,
  targets: seed.targets,
  behaviorEvents: seed.behaviorEvents,
  timeline: seed.timeline,
  dismissed: [],
  tokenDeliveries: [],
  pendingSync: 0,
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
  activeRun: null,
  homeTasks: seed.homeTasks,
  homeRecords: seed.homeTaskRecords,
  guidance: seed.guidance,
  socialValidity: [],
  documents: seed.documents,
  professionals: seed.professionals,
  children: seed.children,
  cases: seed.cases,
  guardians: seed.guardians,
  goals: seed.goals,
  programs: seed.programs,
  reinforcers: seed.reinforcers,
  behaviorDefinitions: seed.behaviorDefinitions,
  denverObjectives: seed.denverObjectives,
  denverCycles: seed.denverCycles,
  denverStepScores: [],
  prerequisiteProbes: seed.prerequisiteProbes,
  preferenceAssessments: seed.preferenceAssessments,
  fidelity: seed.fidelityObservations,
  ioa: seed.ioaSessions,
  supervisionLogs: seed.supervisionLogs,
  competencies: seed.competencies,
  invites: [],
  settings: { theme: 'light', legibleFont: false, compactDensity: false },
  childSpaces: seed.childSpaces,
  childScreen: {},
};

const listeners = new Set<() => void>();
const set = (patch: Partial<State> | ((s: State) => Partial<State>)) => {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => Object.is(x, b[i]));
  return false;
}

/**
 * Seletores podem derivar arrays novos (ex.: `.filter`). Para não causar renderização infinita no
 * useSyncExternalStore, devolvemos o resultado anterior quando ele é rasamente igual.
 */
export function useStore<T>(selector: (s: State) => T): T {
  const last = useRef<{ v: T } | null>(null);
  const get = () => {
    const v = selector(state);
    if (last.current && shallowEqual(last.current.v, v)) return last.current.v;
    last.current = { v };
    return v;
  };
  return useSyncExternalStore(subscribe, get, get);
}
export const getState = () => state;

/* ------------------------------------------------------------ outbox / sync */
export const outbox = typeof indexedDB !== 'undefined' ? new Outbox() : null;
outbox?.subscribe((n) => {
  set({ pendingSync: n });
  // Qualquer registro novo tenta sincronizar na hora; sem conexão, fica na fila cifrada.
  if (n > 0) void syncNow();
});

/** Modo demonstração: o "servidor" aceita e devolve os ids, simulando latência de rede. */
async function demoSender(_stream: string, records: OutboxRecord[]): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 450));
  if (!navigator.onLine) return [];
  return records.map((r) => r.clientEventId);
}

let syncing = false;
export async function syncNow() {
  if (!outbox || syncing || !navigator.onLine) return;
  syncing = true;
  try {
    await outbox.drain(isSupabaseConfigured ? supabaseSender : demoSender);
  } finally {
    syncing = false;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    set({ online: true });
    void syncNow();
  });
  window.addEventListener('offline', () => set({ online: false }));
  window.setInterval(() => void syncNow(), 8000);
}

const uid = (p: string) => `${p}-${crypto.randomUUID()}`;

/* ------------------------------------------------------------ ações */
export const actions = {
  startSession(caseId: string, setting: SessionRecord['setting'] = 'clinic'): SessionRecord {
    const c = state.cases.find((x) => x.id === caseId)!;
    if (c.planStatus !== 'active') throw new Error('O plano precisa estar aprovado para iniciar uma sessão.');
    const s: SessionRecord = {
      id: uid('s'), caseId, model: c.model, setting, implementerId: seed.CURRENT_USER_ID,
      startedAt: new Date().toISOString(), endedAt: null, status: 'active', clinicalNote: null, screenSeconds: 0,
    };
    set((st) => ({ sessions: [...st.sessions, s] }));
    return s;
  },

  /** `clientEventId` permite usar o eventId do jogo: reenvios não duplicam a tentativa. */
  async recordTrial(f: Omit<Fact, 'id' | 'sessionAt' | 'implementerId' | 'setting'>, clientEventId?: string) {
    const session = state.sessions.find((s) => s.id === f.sessionId)!;
    if (session.model !== 'ABA') throw new Error('Tentativas só podem ser registradas em sessões ABA.');
    if (session.status !== 'active') throw new Error('Sessão encerrada.');
    if (clientEventId && state.facts.some((x) => x.id === clientEventId)) return state.facts.find((x) => x.id === clientEventId)!;
    const fact: Fact = { ...f, id: clientEventId ?? uid('f'), sessionAt: session.startedAt, implementerId: session.implementerId, setting: session.setting };
    // Retorno imediato na tela; a gravação cifrada na outbox vem logo em seguida.
    set((st) => ({ facts: [...st.facts, fact] }));
    await outbox?.enqueue({ clientEventId: fact.id, stream: session.id, kind: 'trial', createdAt: new Date().toISOString(), payload: fact });
    void syncNow();
    return fact;
  },

  async recordBehavior(sessionId: string, definitionId: string, antecedent?: string, consequence?: string) {
    const ev: BehaviorEvent = { id: uid('be'), sessionId, definitionId, at: new Date().toISOString(), antecedent, consequence };
    set((st) => ({ behaviorEvents: [...st.behaviorEvents, ev] }));
    await outbox?.enqueue({ clientEventId: ev.id, stream: sessionId, kind: 'behavior', createdAt: ev.at, payload: ev });
    void syncNow();
  },

  async recordToken(sessionId: string) {
    const ev = { id: uid('tk'), sessionId, at: new Date().toISOString() };
    await outbox?.enqueue({ clientEventId: ev.id, stream: sessionId, kind: 'token', createdAt: ev.at, payload: ev });
    set((st) => ({ tokenDeliveries: [...st.tokenDeliveries, ev] }));
  },

  async recordDigitalEvent(sessionId: string, event: { eventId: string; type: string }) {
    await outbox?.enqueue({ clientEventId: event.eventId, stream: sessionId, kind: `event:${event.type}`, createdAt: new Date().toISOString(), payload: event });
  },

  addScreenTime(sessionId: string, seconds: number) {
    set((st) => ({ sessions: st.sessions.map((s) => (s.id === sessionId ? { ...s, screenSeconds: s.screenSeconds + seconds } : s)) }));
  },

  async retractTrial(sessionId: string, trialId: string, reason = 'desfazer pelo aplicador (erro de toque)') {
    set((st) => ({ facts: st.facts.filter((f) => f.id !== trialId) }));
    await outbox?.enqueue({
      clientEventId: uid('ret'),
      stream: sessionId,
      kind: 'retraction',
      createdAt: new Date().toISOString(),
      payload: { session_id: sessionId, trial_client_event_id: trialId, reason },
    });
    void syncNow();
  },

  pauseSession(sessionId: string, reason?: string) {
    set((st) => ({
      sessions: st.sessions.map((s) => (s.id === sessionId ? { ...s, status: 'paused', pauseReason: reason } : s)),
    }));
  },

  resumeSession(sessionId: string) {
    set((st) => ({
      sessions: st.sessions.map((s) => (s.id === sessionId ? { ...s, status: 'active', pauseReason: undefined } : s)),
    }));
  },

  async recordDenverStepScore(
    sessionId: string,
    stepId: string,
    intervalIndex: number,
    value: 'pass' | 'partial' | 'fail',
    routine?: string | null,
  ) {
    const s = state.sessions.find((x) => x.id === sessionId);
    if (!s) throw new Error('Sessão não encontrada');
    const rec: DenverStepScoreRecord = {
      id: uid('dss'),
      sessionId,
      stepId,
      intervalIndex,
      value,
      routine: routine ?? null,
      recordedAt: new Date().toISOString(),
    };

    set((st) => {
      const nextScores = [...st.denverStepScores, rec];
      // Recalcula proporção da sessão
      const sessionScores = nextScores.filter((x) => x.sessionId === sessionId && x.stepId === stepId);
      const totalIntervals = sessionScores.length;
      const passCount = sessionScores.filter((x) => x.value === 'pass').length;
      const partialCount = sessionScores.filter((x) => x.value === 'partial').length;
      const sessionProportion = totalIntervals > 0 ? (passCount + partialCount * 0.5) / totalIntervals : 0;

      const updatedObjectives = st.denverObjectives.map((obj) => ({
        ...obj,
        steps: obj.steps.map((stItem) => {
          if (stItem.id !== stepId) return stItem;
          const newProportions = [...stItem.proportions];
          if (newProportions.length === 0) {
            newProportions.push(sessionProportion);
          } else {
            newProportions[newProportions.length - 1] = sessionProportion;
          }
          return {
            ...stItem,
            proportions: newProportions,
          };
        }),
      }));

      return {
        denverStepScores: nextScores,
        denverObjectives: updatedObjectives,
      };
    });

    await outbox?.enqueue({
      clientEventId: rec.id,
      stream: sessionId,
      kind: 'denver_step_score',
      createdAt: rec.recordedAt,
      payload: rec,
    });
    void syncNow();
  },

  revisePlan(caseId: string): string {
    const c = state.cases.find((x) => x.id === caseId);
    if (!c) throw new Error('Caso não encontrado');
    const newVersion = (c.planVersion ?? 1) + 1;
    set((st) => ({
      cases: st.cases.map((x) => (x.id === caseId ? { ...x, planVersion: newVersion, planStatus: 'draft' } : x)),
      timeline: [
        ...st.timeline,
        {
          id: uid('tl'),
          caseId,
          at: new Date().toISOString(),
          kind: 'context',
          title: `Nova versão do plano (v${newVersion}) em rascunho`,
        },
      ],
    }));
    return `plan-v${newVersion}`;
  },

  approvePlanRevision(caseId: string) {
    const c = state.cases.find((x) => x.id === caseId);
    if (!c) throw new Error('Caso não encontrado');
    set((st) => ({
      cases: st.cases.map((x) =>
        x.id === caseId
          ? {
              ...x,
              planStatus: 'active',
              planApprovedAt: new Date().toISOString(),
            }
          : x,
      ),
      timeline: [
        ...st.timeline,
        {
          id: uid('tl'),
          caseId,
          at: new Date().toISOString(),
          kind: 'plan_approved',
          title: `Plano v${c.planVersion} aprovado pela supervisão`,
        },
      ],
    }));
  },

  completeSession(sessionId: string, note: string) {
    if (note.trim().length < 10) throw new Error('A nota clínica é obrigatória (mínimo de 10 caracteres).');
    const s = state.sessions.find((x) => x.id === sessionId)!;
    set((st) => ({
      sessions: st.sessions.map((x) => (x.id === sessionId ? { ...x, status: 'completed', endedAt: new Date().toISOString(), clinicalNote: note } : x)),
      timeline: [...st.timeline, { id: uid('tl'), caseId: s.caseId, at: new Date().toISOString(), kind: 'session_closed', title: 'Sessão encerrada com nota clínica' }],
    }));
  },

  /** Equivale à RPC change_target_phase: exige justificativa e grava na linha do tempo. */
  changePhase(targetId: string, phase: Target['phase'], reason: string, ruleId?: string) {
    if (reason.trim().length < 5) throw new Error('Justificativa obrigatória.');
    const t = state.targets.find((x) => x.id === targetId)!;
    set((st) => ({
      targets: st.targets.map((x) => (x.id === targetId ? { ...x, phase, phaseChangedAt: new Date().toISOString() } : x)),
      timeline: [
        ...st.timeline,
        {
          id: uid('tl'), caseId: t.caseId, at: new Date().toISOString(), kind: 'phase_change',
          title: `“${t.name}” → ${phaseName[phase]}`, detail: `${reason}${ruleId ? ` (alerta ${ruleId})` : ''}`,
        },
      ],
    }));
  },

  launchRun(run: ActiveRun) {
    set({ activeRun: run });
  },
  endRun() {
    set({ activeRun: null });
  },

  dismissAlert(key: string, reason: string) {
    set((st) => ({ dismissed: [...st.dismissed, { key, at: new Date().toISOString(), reason }] }));
  },

  /* ---------------------------------------------------------- família */
  addHomeTask(t: Omit<HomeTask, 'id' | 'createdAt' | 'active'>) {
    set((st) => ({ homeTasks: [...st.homeTasks, { ...t, id: uid('ht'), createdAt: new Date().toISOString(), active: true }] }));
  },

  async recordHome(r: Omit<HomeTaskRecord, 'id' | 'recordedAt'>) {
    if (r.successes > r.opportunities) throw new Error('Acertos não podem passar do número de oportunidades.');
    const rec: HomeTaskRecord = { ...r, id: uid('htr'), recordedAt: new Date().toISOString() };
    set((st) => ({ homeRecords: [...st.homeRecords, rec] }));
    await outbox?.enqueue({ clientEventId: rec.id, stream: `home:${r.taskId}`, kind: 'home_task_record', createdAt: rec.recordedAt, payload: rec });
  },

  publishGuidance(caseId: string, title: string, body: string) {
    if (title.trim().length < 3 || body.trim().length < 10) throw new Error('Título e texto são obrigatórios.');
    const g: Guidance = { id: uid('gu'), caseId, title, body, authorId: seed.CURRENT_USER_ID, publishedAt: new Date().toISOString(), readBy: [] };
    set((st) => ({ guidance: [...st.guidance, g] }));
  },

  markGuidanceRead(id: string, guardianId: string) {
    set((st) => ({ guidance: st.guidance.map((g) => (g.id === id && !g.readBy.includes(guardianId) ? { ...g, readBy: [...g.readBy, guardianId] } : g)) }));
  },

  answerSocialValidity(v: Omit<SocialValidity, 'id' | 'answeredAt'>) {
    set((st) => ({ socialValidity: [...st.socialValidity, { ...v, id: uid('sv'), answeredAt: new Date().toISOString() }] }));
  },

  /* ---------------------------------------------------------- documentos */
  createDocument(caseId: string, kind: DocumentKind, title: string, periodDays = 30): string {
    const doc: ClinicalDocument = {
      id: uid('doc'), caseId, kind, title, sharedWithFamily: kind === 'family_summary',
      versions: [{ version: 1, status: 'draft', snapshot: buildSnapshot(caseId, periodDays), analysis: '', authorId: seed.CURRENT_USER_ID, council: null, createdAt: new Date().toISOString(), hash: '' }],
    };
    set((st) => ({ documents: [...st.documents, doc] }));
    return doc.id;
  },

  /** Equivale à RPC save_document_version: cada versão é imutável; a final exige registro no conselho. */
  async saveDocumentVersion(docId: string, analysis: string, final: boolean, council: string | null) {
    if (final && (!council || council.trim().length < 3)) throw new Error('O documento final exige o número de registro no conselho.');
    if (final && analysis.trim().length < 20) throw new Error('A análise do profissional é obrigatória no documento final.');
    const doc = state.documents.find((d) => d.id === docId)!;
    const last = doc.versions.at(-1)!;
    const hash = await sha256(JSON.stringify(last.snapshot) + analysis);
    const v = { version: last.version + 1, status: final ? 'final' : 'draft', snapshot: last.snapshot, analysis, authorId: seed.CURRENT_USER_ID, council: final ? council : null, createdAt: new Date().toISOString(), hash } as const;
    set((st) => ({
      documents: st.documents.map((d) => (d.id === docId ? { ...d, versions: [...d.versions, v] } : d)),
      timeline: final ? [...st.timeline, { id: uid('tl'), caseId: doc.caseId, at: v.createdAt, kind: 'context', title: `Documento finalizado: ${doc.title}` }] : st.timeline,
    }));
  },

  setDocumentShared(docId: string, shared: boolean) {
    set((st) => ({ documents: st.documents.map((d) => (d.id === docId ? { ...d, sharedWithFamily: shared } : d)) }));
  },

  /* ---------------------------------------------------------- caso e plano */
  /** Equivale à RPC create_case: criança + caso + vínculo do responsável técnico + consentimento base. */
  createCase(input: {
    fullName: string;
    preferredName: string;
    birthDate: string;
    model: 'ABA' | 'DENVER';
    guardianName: string;
    guardianRelationship: string;
    consents: { childPortal: boolean; media: boolean; school: boolean; research: boolean };
    implementerIds: string[];
    interests: string[];
    restrictions: string[];
  }): string {
    if (input.preferredName.trim().length < 1 || input.fullName.trim().length < 3) throw new Error('Nome completo e nome de preferência são obrigatórios.');
    if (!input.birthDate) throw new Error('A data de nascimento é obrigatória.');
    if (input.guardianName.trim().length < 3) throw new Error('Informe o responsável legal.');
    const now = new Date().toISOString();
    const child: Child = {
      id: uid('ch'), preferredName: input.preferredName.trim(), fullName: input.fullName.trim(), birthDate: input.birthDate,
      hue: Math.floor(Math.random() * 360), accessCode: newAccessCode(input.preferredName),
    };
    const caseId = uid('case');
    const c: CaseRecord = {
      id: caseId, childId: child.id, model: input.model, status: 'active', openedAt: now, planVersion: 1, planStatus: 'draft',
      planApprovedAt: now, planReviewOn: new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10),
      team: [
        { professionalId: seed.CURRENT_USER_ID, role: 'responsible' },
        ...input.implementerIds.map((id) => ({ professionalId: id, role: 'implementer' as const })),
      ],
      // Perfil sensorial começa calmo e reduzido: estímulo é acrescentado quando ajuda.
      adaptation: { ...seed.cases[0]!.adaptation, motion: 'reduced', sound: 'low', feedback: 'subtle', palette: 'calm', maxChoices: 2, builtInPromptAfterMs: null, touchScale: 1 },
      interests: input.interests, restrictions: input.restrictions, tokenTheme: 'estrela',
      releasedApps: input.consents.childPortal ? ['prancha', 'calma'] : [],
    };
    const guardian: Guardian = { id: uid('gd'), name: input.guardianName.trim(), relationship: input.guardianRelationship, childId: child.id };
    const consentLabels = [
      'Prestação do serviço e prontuário',
      input.consents.childPortal && 'Uso do ambiente infantil',
      input.consents.media && 'Fotos e vídeos para estímulos personalizados',
      input.consents.school && 'Compartilhamento com a escola',
      input.consents.research && 'Uso de dados desidentificados em pesquisa',
    ].filter(Boolean);
    set((st) => ({
      children: [...st.children, child],
      cases: [...st.cases, c],
      guardians: [...st.guardians, guardian],
      denverCycles:
        input.model === 'DENVER'
          ? [...st.denverCycles, { id: uid('dc'), caseId, startsOn: now.slice(0, 10), endsOn: new Date(Date.now() + 84 * 86_400_000).toISOString().slice(0, 10) }]
          : st.denverCycles,
      timeline: [
        ...st.timeline,
        { id: uid('tl'), caseId, at: now, kind: 'consent', title: 'Consentimentos registrados', detail: consentLabels.join(' · ') },
        { id: uid('tl'), caseId, at: now, kind: 'context', title: `Caso aberto em ${input.model === 'ABA' ? 'ABA' : 'Modelo Denver'}` },
      ],
    }));
    return caseId;
  },

  /** Aprovação do plano pela supervisão: só então sessões podem ser aplicadas. */
  approvePlan(caseId: string) {
    const c = state.cases.find((x) => x.id === caseId)!;
    const hasContent =
      c.model === 'ABA' ? state.targets.some((t) => t.caseId === caseId) : state.denverObjectives.some((o) => o.caseId === caseId && o.steps.length > 0);
    if (!hasContent) throw new Error(c.model === 'ABA' ? 'Inclua ao menos um alvo antes de aprovar.' : 'Inclua ao menos um objetivo com passos antes de aprovar.');
    const now = new Date().toISOString();
    set((st) => ({
      cases: st.cases.map((x) => (x.id === caseId ? { ...x, planStatus: 'active', planApprovedAt: now } : x)),
      timeline: [...st.timeline, { id: uid('tl'), caseId, at: now, kind: 'plan_approved', title: `Plano ${c.model === 'ABA' ? 'ABA' : 'Denver'} v${c.planVersion} aprovado` }],
    }));
  },

  addGoal(caseId: string, domain: string, description: string): string {
    if (domain.trim().length < 2 || description.trim().length < 5) throw new Error('Domínio e descrição são obrigatórios.');
    const g: Goal = { id: uid('g'), caseId, domain: domain.trim(), description: description.trim() };
    set((st) => ({ goals: [...st.goals, g] }));
    return g.id;
  },

  addProgram(p: Omit<Program, 'id'>): string {
    if (p.name.trim().length < 3) throw new Error('Dê um nome ao programa.');
    if (p.operationalDefinition.trim().length < 10) throw new Error('A definição operacional é obrigatória.');
    if (p.sdTemplate.trim().length < 2) throw new Error('Descreva a instrução (SD).');
    if (p.errorCorrection.trim().length < 5) throw new Error('Descreva a correção de erro.');
    const prog: Program = { ...p, id: uid('p') };
    set((st) => ({ programs: [...st.programs, prog] }));
    return prog.id;
  },

  /** Todo alvo novo começa em linha de base (sondas sem dica antes do ensino). */
  addTarget(programId: string, name: string, art: string, teachingChannel: Target['teachingChannel']) {
    if (name.trim().length < 1) throw new Error('Dê um nome ao alvo.');
    const p = state.programs.find((x) => x.id === programId)!;
    const t: Target = {
      id: uid('t'), programId, caseId: p.caseId, name: name.trim(), art, phase: 'baseline', teachingChannel,
      phaseChangedAt: new Date().toISOString(), defaultPrompt: 'IND',
    };
    set((st) => ({ targets: [...st.targets, t] }));
  },

  addDenverObjective(caseId: string, domain: string, level: number, description: string, steps: string[]) {
    const clean = steps.map((x) => x.trim()).filter(Boolean);
    if (description.trim().length < 10) throw new Error('Descreva o objetivo de forma observável.');
    if (clean.length === 0) throw new Error('Inclua ao menos um passo de aprendizagem.');
    const o: DenverObjective = {
      id: uid('do'), caseId, domain, level, description: description.trim(),
      steps: clean.map((d, i) => ({ id: uid('ds'), description: d, status: i === 0 ? 'acquisition' : 'not_started', proportions: [] })),
    };
    set((st) => ({ denverObjectives: [...st.denverObjectives, o] }));
  },

  /** Domínio de passo Denver: decisão da supervisão com justificativa; o próximo passo entra em aquisição. */
  masterDenverStep(objectiveId: string, stepId: string, reason: string) {
    if (reason.trim().length < 5) throw new Error('Justificativa obrigatória.');
    const o = state.denverObjectives.find((x) => x.id === objectiveId)!;
    const idx = o.steps.findIndex((x) => x.id === stepId);
    set((st) => ({
      denverObjectives: st.denverObjectives.map((x) =>
        x.id !== objectiveId
          ? x
          : {
              ...x,
              steps: x.steps.map((step, i) =>
                i === idx ? { ...step, status: 'mastered' as const } : i === idx + 1 && step.status === 'not_started' ? { ...step, status: 'acquisition' as const } : step,
              ),
            },
      ),
      timeline: [...st.timeline, { id: uid('tl'), caseId: o.caseId, at: new Date().toISOString(), kind: 'phase_change', title: `Passo dominado: ${o.steps[idx]!.description}`, detail: reason }],
    }));
  },

  updateCaseProfile(caseId: string, patch: Partial<Pick<CaseRecord, 'adaptation' | 'interests' | 'restrictions' | 'tokenTheme'>>) {
    set((st) => ({ cases: st.cases.map((c) => (c.id === caseId ? { ...c, ...patch } : c)) }));
  },

  /* ---------------------------------------------------------- reforçadores */
  addReinforcer(caseId: string, name: string, category: Reinforcer['category']) {
    if (name.trim().length < 2) throw new Error('Dê um nome ao item.');
    const r: Reinforcer = {
      id: uid('r'), caseId, name: name.trim(), category,
      rank: state.reinforcers.filter((x) => x.caseId === caseId).length + 1, assessedAt: '', choiceRates: [],
    };
    set((st) => ({ reinforcers: [...st.reinforcers, r] }));
  },

  /** MSWO digital com figuras exige sondas de pareamento e identificação de figuras (Morris e Vollmer, 2020). */
  canRunDigitalMswo(caseId: string): boolean {
    const passed = (skill: PrerequisiteSkill) => state.prerequisiteProbes.some((p) => p.caseId === caseId && p.skill === skill && p.passed);
    return passed('pareia-figura-identica') && passed('identifica-figura-nomeada');
  },

  recordPreferenceAssessment(caseId: string, method: PreferenceAssessment['method'], format: PreferenceAssessment['format'], ranking: string[]) {
    if (method === 'mswo' && format === 'digital' && !actions.canRunDigitalMswo(caseId)) {
      throw new Error('O MSWO digital com figuras exige as sondas de pareamento e de identificação de figuras. Use o formato presencial, com objetos.');
    }
    if (ranking.length < 2) throw new Error('A avaliação precisa de ao menos 2 itens.');
    const at = new Date().toISOString();
    const a: PreferenceAssessment = {
      id: uid('pa'), caseId, method, format, ranking, at, by: seed.CURRENT_USER_ID,
      validUntil: new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10),
    };
    set((st) => ({
      preferenceAssessments: [...st.preferenceAssessments, a],
      reinforcers: st.reinforcers.map((r) => {
        const i = ranking.indexOf(r.id);
        return r.caseId !== caseId || i < 0 ? r : { ...r, rank: i + 1, assessedAt: at, choiceRates: [...r.choiceRates, 1 - i / ranking.length].slice(-6) };
      }),
    }));
  },

  recordPrerequisite(caseId: string, skill: PrerequisiteSkill, passed: boolean) {
    set((st) => ({ prerequisiteProbes: [...st.prerequisiteProbes, { id: uid('pp'), caseId, skill, passed, at: new Date().toISOString(), by: seed.CURRENT_USER_ID }] }));
  },

  /* ---------------------------------------------------------- comportamento */
  addBehaviorDefinition(d: Omit<BehaviorDefinition, 'id'>) {
    if (d.name.trim().length < 3 || d.topography.trim().length < 10) {
      throw new Error('Nome e definição topográfica são obrigatórios: sem definição não há medida.');
    }
    set((st) => ({ behaviorDefinitions: [...st.behaviorDefinitions, { ...d, id: uid('bd') }] }));
  },

  updateManagementPlan(definitionId: string, plan: ManagementPlan) {
    set((st) => ({ behaviorDefinitions: st.behaviorDefinitions.map((d) => (d.id === definitionId ? { ...d, plan } : d)) }));
  },

  /* ---------------------------------------------------------- supervisão */
  addFidelityObservation(o: Omit<FidelityObservation, 'id' | 'at' | 'observerId'>) {
    if (!o.components.some((c) => c.observed > 0)) throw new Error('Registre ao menos um componente observado.');
    if (o.components.some((c) => c.correct > c.observed)) throw new Error('Corretos não podem passar do observado.');
    set((st) => ({ fidelity: [...st.fidelity, { ...o, id: uid('fo'), at: new Date().toISOString(), observerId: seed.CURRENT_USER_ID }] }));
  },

  addIoa(i: Omit<IoaSession, 'id' | 'at'>) {
    if (i.a.length === 0 || i.a.length !== i.b.length) throw new Error('Os dois observadores precisam registrar o mesmo número de tentativas.');
    if (i.observerA === i.observerB) throw new Error('A concordância exige dois observadores diferentes.');
    set((st) => ({ ioa: [...st.ioa, { ...i, id: uid('ioa'), at: new Date().toISOString() }] }));
  },

  addSupervisionLog(l: Omit<SupervisionLog, 'id' | 'at' | 'supervisorId'>) {
    if (l.minutes <= 0) throw new Error('Informe a duração.');
    set((st) => ({ supervisionLogs: [...st.supervisionLogs, { ...l, id: uid('sl'), at: new Date().toISOString(), supervisorId: seed.CURRENT_USER_ID }] }));
  },

  setCompetency(professionalId: string, procedure: Competency['procedure'], status: Competency['status']) {
    set((st) => ({
      competencies: [
        ...st.competencies.filter((c) => !(c.professionalId === professionalId && c.procedure === procedure)),
        { professionalId, procedure, status, at: new Date().toISOString() },
      ],
    }));
  },

  /* ---------------------------------------------------------- equipe e preferências */
  invite(email: string, name: string, role: Invite['role']) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('E-mail inválido.');
    if (name.trim().length < 3) throw new Error('Informe o nome.');
    set((st) => ({ invites: [...st.invites, { id: uid('inv'), email, name, role, at: new Date().toISOString() }] }));
  },

  /** Vínculo por caso: é ele que dá acesso clínico, nunca o cargo administrativo. */
  setCaseMember(caseId: string, professionalId: string, role: CaseRecord['team'][number]['role'] | null) {
    set((st) => ({
      cases: st.cases.map((c) =>
        c.id !== caseId
          ? c
          : {
              ...c,
              team: role
                ? [...c.team.filter((m) => m.professionalId !== professionalId), { professionalId, role }]
                : c.team.filter((m) => m.professionalId !== professionalId || m.role === 'responsible'),
            },
      ),
    }));
  },

  updateSettings(patch: Partial<UiSettings>) {
    set((st) => ({ settings: { ...st.settings, ...patch } }));
  },
  /* ---------------------------------------------------------- espaço da criança */
  setReleasedApps(caseId: string, apps: string[]) {
    set((st) => ({ cases: st.cases.map((c) => (c.id === caseId ? { ...c, releasedApps: apps } : c)) }));
  },

  updateChildSpace(childId: string, patch: Partial<Omit<ChildSpace, 'childId'>>) {
    const cur = childSpaceOf(childId);
    set((st) => ({ childSpaces: [...st.childSpaces.filter((x) => x.childId !== childId), { ...cur, ...patch }] }));
  },

  /** Treino livre: estrelas de esforço (3 ao concluir, 1 por tentativa de ao menos 30 s). Nunca por acerto. */
  recordPractice(childId: string, appId: string, seconds: number, completed: boolean): number {
    const cur = childSpaceOf(childId);
    const earned = completed ? 3 : seconds >= 30 ? 1 : 0;
    actions.updateChildSpace(childId, {
      stars: { ...cur.stars, [appId]: (cur.stars[appId] ?? 0) + earned },
      plays: [...cur.plays, { appId, at: new Date().toISOString(), seconds, completed }],
    });
    return earned;
  },

  /** A criança escolhe a figurinha: o que se entrega é conhecido e escolhido (ECA Digital, sem sorteio). */
  unlockSticker(childId: string, stickerId: string) {
    const cur = childSpaceOf(childId);
    if (cur.stickers.includes(stickerId)) return;
    if (cur.stickers.length >= stickerSlots(cur)) throw new Error('Junte mais estrelas para escolher outra figurinha.');
    actions.updateChildSpace(childId, { stickers: [...cur.stickers, stickerId] });
  },

  addChildScreenTime(caseId: string, seconds: number) {
    const key = caseId + ':' + new Date().toISOString().slice(0, 10);
    set((st) => ({ childScreen: { ...st.childScreen, [key]: (st.childScreen[key] ?? 0) + seconds } }));
  },
};

/** Gera código de identificação legível: NOME-0000. */
function newAccessCode(name: string): string {
  const base = name.normalize('NFD').replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 6) || 'APR';
  let code = '';
  do code = base + '-' + String(Math.floor(1000 + Math.random() * 9000));
  while (state.children.some((c) => c.accessCode === code));
  return code;
}

export const STARS_PER_STICKER = 5;
export const totalStars = (cs: ChildSpace) => Object.values(cs.stars).reduce((a, b) => a + b, 0);
/** Quantas figurinhas a criança pode ter: uma a cada 5 estrelas (marcos conhecidos, sem sorteio). */
export const stickerSlots = (cs: ChildSpace) => Math.floor(totalStars(cs) / STARS_PER_STICKER);

export function childSpaceOf(childId: string): ChildSpace {
  return state.childSpaces.find((x) => x.childId === childId) ?? { childId, avatar: 'raposa', theme: 'sol', sound: true, stars: {}, stickers: [], plays: [] };
}

/** Busca pelo código do cadastro (sem diferenciar maiúsculas; hífen opcional). */
export function findChildByCode(code: string) {
  const norm = (x: string) => x.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const child = state.children.find((c) => norm(c.accessCode) === norm(code));
  const c = child ? state.cases.find((x) => x.childId === child.id && x.status === 'active') : undefined;
  return child && c ? { child, case: c } : null;
}

/** Minutos de tela de hoje: sessões + espaço da criança. */
export function screenMinutesToday(st: State, caseId: string): number {
  const today = new Date().toISOString().slice(0, 10);
  const inSessions = st.sessions.filter((s) => s.caseId === caseId && s.startedAt.slice(0, 10) === today).reduce((a, s) => a + s.screenSeconds, 0);
  return Math.round((inSessions + (st.childScreen[caseId + ':' + today] ?? 0)) / 60);
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Dados objetivos do período, preenchidos pelo sistema. O profissional redige a análise. */
function buildSnapshot(caseId: string, periodDays: number): DocumentSnapshot {
  const to = new Date();
  const from = new Date(to.getTime() - periodDays * 86_400_000);
  const inPeriod = (iso: string) => Date.parse(iso) >= from.getTime();
  const targets = state.targets.filter((t) => t.caseId === caseId).map((t) => {
    const s = summariesFor(state.facts, t.id).filter((x) => inPeriod(x.sessionAt) && !x.probe);
    return {
      name: t.name, program: state.programs.find((p) => p.id === t.programId)!.name, phase: phaseName[t.phase] ?? t.phase,
      firstPct: s[0]?.pctIndependent ?? null, lastPct: s.at(-1)?.pctIndependent ?? null, n: s.reduce((a, x) => a + x.opportunities, 0),
    };
  });
  return {
    periodFrom: from.toISOString().slice(0, 10), periodTo: to.toISOString().slice(0, 10),
    sessions: state.sessions.filter((x) => x.caseId === caseId && x.status === 'completed' && inPeriod(x.startedAt)).length,
    targets,
  };
}

const phaseName: Record<string, string> = {
  baseline: 'Linha de base', acquisition: 'Aquisição', maintenance: 'Manutenção', generalization: 'Generalização',
  mastered: 'Concluído', review: 'Em revisão', suspended: 'Suspenso',
};

/* ------------------------------------------------------------ consultas */
export const db = {
  CURRENT_USER_ID: seed.CURRENT_USER_ID,
  hierarchies: seed.hierarchies,
  get professionals() { return state.professionals; },
  get children() { return state.children; },
  get cases() { return state.cases; },
  get guardians() { return state.guardians; },
  get goals() { return state.goals; },
  get programs() { return state.programs; },
  get reinforcers() { return state.reinforcers; },
  get behaviorDefinitions() { return state.behaviorDefinitions; },
  get denverObjectives() { return state.denverObjectives; },
  get denverCycles() { return state.denverCycles; },
  childOf: (c: CaseRecord) => state.children.find((ch) => ch.id === c.childId)!,
  caseById: (id: string) => state.cases.find((c) => c.id === id),
  professional: (id: string) => state.professionals.find((p) => p.id === id),
  hierarchy: (id: string) => seed.hierarchies.find((h) => h.id === id)!,
  programOf: (t: Target) => state.programs.find((p) => p.id === t.programId)!,
  ageMonths: (birthDate: string) => ageInMonths(new Date(birthDate)),
  screenPolicy: (birthDate: string) => screenPolicyFor(ageInMonths(new Date(birthDate))),
};

export function formatAge(birthDate: string): string {
  const m = ageInMonths(new Date(birthDate));
  if (m < 24) return `${m} meses`;
  const y = Math.floor(m / 12);
  const r = m % 12;
  return r ? `${y} a ${r} m` : `${y} anos`;
}

const summaryCache = new WeakMap<Fact[], Map<string, TargetSessionSummary[]>>();
export function summariesFor(facts: Fact[], targetId: string): TargetSessionSummary[] {
  let byTarget = summaryCache.get(facts);
  if (!byTarget) {
    byTarget = new Map();
    summaryCache.set(facts, byTarget);
  }
  let s = byTarget.get(targetId);
  if (!s) {
    s = summarizeByTargetSession(facts.filter((f) => f.targetId === targetId));
    byTarget.set(targetId, s);
  }
  return s;
}

export interface CaseAlert extends DecisionAlert {
  key: string;
  caseId: string;
}

/** Motor de regras sobre um caso. Executado no aparelho; em produção, também no servidor. */
export function alertsForCase(st: State, caseId: string): CaseAlert[] {
  const c = st.cases.find((x) => x.id === caseId)!;
  const child = st.children.find((ch) => ch.id === c.childId)!;
  const now = new Date();
  const out: DecisionAlert[] = [];

  if (c.model === 'ABA') {
    const targets = st.targets.filter((t) => t.caseId === caseId && t.phase !== 'suspended');
    const sessionsOfCase = st.sessions.filter((s) => s.caseId === caseId).sort((a, b) => a.startedAt.localeCompare(b.startedAt));
    const behaviorValues = st.behaviorDefinitions
      .filter((d) => d.caseId === caseId)
      .map((d) => {
        const values = sessionsOfCase
          .filter((s) => s.status === 'completed' || s.status === 'active')
          .map((s) => st.behaviorEvents.filter((e) => e.sessionId === s.id && e.definitionId === d.id).length);
        return { definitionId: d.id, name: d.name, values, riskEpisodeInLastSession: false };
      });

    out.push(
      ...evaluateRules({
        now,
        targets: targets.map((t) => {
          const p = st.programs.find((x) => x.id === t.programId)!;
          return {
            targetId: t.id,
            name: `${p.name} — ${t.name}`,
            phase: t.phase,
            teachingChannel: t.teachingChannel,
            criteria: { ...DEFAULT_MASTERY, minIndependentPct: p.masteryPct },
            summaries: summariesFor(st.facts, t.id),
            recentTrials: st.facts.filter((f) => f.targetId === t.id).slice(-40),
          };
        }),
        reinforcers: st.reinforcers.filter((r) => r.caseId === caseId).map((r) => ({ reinforcerId: r.id, name: r.name, choiceRates: r.choiceRates })),
        behaviors: behaviorValues,
        screenTime: { minutesToday: screenMinutesToday(st, caseId), limitMinutes: screenPolicyFor(ageInMonths(new Date(child.birthDate))).dailyLimitMinutes },
      }),
    );
  } else {
    const cycle = st.denverCycles.find((d) => d.caseId === caseId);
    out.push(
      ...evaluateRules({
        now,
        denverSteps: st.denverObjectives
          .filter((o) => o.caseId === caseId)
          .flatMap((o) => o.steps.filter((s) => s.status === 'acquisition').map((s) => ({ stepId: s.id, name: `${o.domain} — ${s.description}`, proportions: s.proportions }))),
        denverCycle: cycle ? { cycleId: cycle.id, endsOn: new Date(cycle.endsOn) } : undefined,
      }),
    );
  }

  return out
    .map((a) => ({ ...a, caseId, key: `${caseId}:${a.ruleId}:${a.subjectId}` }))
    .filter((a) => !st.dismissed.some((d) => d.key === a.key))
    // Alvo cuja fase já mudou após o alerta de domínio não precisa mais dele.
    .filter((a) => !(a.ruleId === 'R1' && st.targets.find((t) => t.id === a.subjectId)?.phase !== 'acquisition'));
}
