import type { TrialFact } from '@aprumo/clinical-core';
import type { Adaptation, PromptLevelRef, Repertoire } from '@aprumo/protocol';

export type Model = 'ABA' | 'DENVER';
export type CaseRole = 'responsible' | 'supervisor' | 'implementer' | 'observer';

export interface Professional {
  id: string;
  name: string;
  shortName: string;
  role: string;
  council?: string;
}

export interface Child {
  id: string;
  preferredName: string;
  fullName: string;
  birthDate: string;
  /** Tom do avatar abstrato (sem foto). */
  hue: number;
  /** Código de identificação do cadastro. Identifica a criança; não é senha: um adulto abre o espaço. */
  accessCode: string;
}

export interface CaseRecord {
  id: string;
  childId: string;
  model: Model;
  status: 'active' | 'paused' | 'closed';
  openedAt: string;
  planVersion: number;
  /** Rascunho até a aprovação da supervisão; sessões só com plano vigente. */
  planStatus: 'draft' | 'active';
  planApprovedAt: string;
  planReviewOn: string;
  team: Array<{ professionalId: string; role: CaseRole }>;
  adaptation: Adaptation;
  interests: string[];
  restrictions: string[];
  /** Tema das fichas preferido (interesse restrito como reforçador). */
  tokenTheme: string;
  /** Jogos e recursos liberados no espaço da criança (o resto não aparece para ela). */
  releasedApps: string[];
  /** Indica caso de demonstração/treinamento (isolado de dados reais). */
  isDemo?: boolean;
}

export interface PromptHierarchy {
  id: string;
  name: string;
  kind: 'least_to_most' | 'most_to_least' | 'time_delay';
  levels: PromptLevelRef[];
}

export interface Goal {
  id: string;
  caseId: string;
  domain: string;
  description: string;
}

export interface Program {
  id: string;
  caseId: string;
  goalId: string;
  name: string;
  repertoire: Repertoire;
  procedure: 'DTT' | 'NET' | 'chaining' | 'fluency';
  operationalDefinition: string;
  sdTemplate: string;
  errorCorrection: string;
  promptHierarchyId: string;
  masteryPct: number;
  /** Jogos compatíveis declarados nos manifestos. */
  compatibleApps: string[];
}

export interface Target {
  id: string;
  programId: string;
  caseId: string;
  name: string;
  art: string;
  phase: TrialFact['phase'];
  teachingChannel: 'table' | 'digital' | 'natural';
  phaseChangedAt: string;
  defaultPrompt: string;
}

export interface SessionRecord {
  id: string;
  caseId: string;
  model: Model;
  setting: TrialFact['setting'];
  implementerId: string;
  startedAt: string;
  endedAt: string | null;
  status: 'active' | 'paused' | 'completed';
  clinicalNote: string | null;
  screenSeconds: number;
  pauseReason?: string;
}

export interface Fact extends TrialFact {
  id: string;
  art?: string;
}

export interface BehaviorDefinition {
  id: string;
  caseId: string;
  name: string;
  topography: string;
  measure: 'frequency' | 'duration' | 'partial_interval';
  risk: boolean;
  examples?: string[];
  nonExamples?: string[];
  hypothesizedFunction?: 'attention' | 'escape' | 'tangible' | 'automatic' | 'unknown';
  plan?: ManagementPlan;
}

/** Plano de manejo: exibido na tela de aplicação quando o comportamento é registrado. */
export interface ManagementPlan {
  antecedentStrategies: string;
  replacementBehavior: string;
  consequences: string;
  safetyProtocol?: string;
}

export interface BehaviorEvent {
  id: string;
  sessionId: string;
  definitionId: string;
  at: string;
  antecedent?: string;
  consequence?: string;
}

export interface Reinforcer {
  id: string;
  caseId: string;
  name: string;
  category: 'tangível' | 'atividade' | 'social' | 'digital' | 'comestível';
  /** Hierarquia da última avaliação de preferência (1 = maior). */
  rank: number;
  assessedAt: string;
  choiceRates: number[];
}

export interface DenverObjective {
  id: string;
  caseId: string;
  domain: string;
  level: number;
  description: string;
  steps: Array<{ id: string; description: string; status: 'not_started' | 'acquisition' | 'mastered'; proportions: number[] }>;
}

export interface DenverStepScoreRecord {
  id: string;
  sessionId: string;
  stepId: string;
  intervalIndex: number;
  value: 'pass' | 'partial' | 'fail';
  routine: string | null;
  recordedAt: string;
}

export interface DenverCycle {
  id: string;
  caseId: string;
  startsOn: string;
  endsOn: string;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  at: string;
  kind: 'plan_approved' | 'phase_change' | 'context' | 'session_closed' | 'consent' | 'model_transition';
  title: string;
  detail?: string;
}

export interface DismissedAlert {
  key: string;
  at: string;
  reason: string;
}

/* ------------------------------------------------------------ família */
export interface Guardian {
  id: string;
  name: string;
  relationship: string;
  childId: string;
}

export interface HomeTask {
  id: string;
  caseId: string;
  targetId: string | null;
  title: string;
  instructions: string;
  frequency: string;
  active: boolean;
  createdAt: string;
}

/** Registro da família: fonte sempre "relato do responsável", separado da observação da equipe. */
export interface HomeTaskRecord {
  id: string;
  taskId: string;
  occurredOn: string;
  opportunities: number;
  successes: number;
  note?: string;
  guardianId: string;
  recordedAt: string;
}

export interface Guidance {
  id: string;
  caseId: string;
  title: string;
  body: string;
  authorId: string;
  publishedAt: string;
  readBy: string[];
  objective?: string;
  strategy?: string;
  avoid?: string;
  practiceTip?: string;
  frequency?: string;
}

export interface SocialValidity {
  id: string;
  caseId: string;
  guardianId: string;
  goalsImportance: number;
  proceduresAcceptability: number;
  satisfaction: number;
  comment?: string;
  answeredAt: string;
}

/* ------------------------------------------------------------ documentos */
export type DocumentKind = 'progress_report' | 'family_summary' | 'school_report' | 'declaration';

export interface DocumentVersion {
  version: number;
  status: 'draft' | 'final';
  /** Dados objetivos preenchidos pelo sistema (período, alvos, resultados). */
  snapshot: DocumentSnapshot;
  /** Análise redigida pelo profissional. */
  analysis: string;
  authorId: string;
  council: string | null;
  createdAt: string;
  hash: string;
}

export interface DocumentSnapshot {
  periodFrom: string;
  periodTo: string;
  sessions: number;
  targets: Array<{ name: string; program: string; phase: string; lastPct: number | null; n: number; firstPct: number | null }>;
}

export interface ClinicalDocument {
  id: string;
  caseId: string;
  kind: DocumentKind;
  title: string;
  sharedWithFamily: boolean;
  versions: DocumentVersion[];
}

/* ------------------------------------------------------------ avaliação */
export type PrerequisiteSkill = 'tolera-tablet' | 'toca-alvo-intencional' | 'pareia-figura-identica' | 'identifica-figura-nomeada';

export interface PrerequisiteProbe {
  id: string;
  caseId: string;
  skill: PrerequisiteSkill;
  passed: boolean;
  at: string;
  by: string;
}

export interface PreferenceAssessment {
  id: string;
  caseId: string;
  method: 'mswo' | 'paired' | 'free_operant';
  format: 'in_person' | 'digital';
  /** Ids na ordem de escolha (MSWO) ou ordenados por % de seleção. */
  ranking: string[];
  at: string;
  by: string;
  validUntil: string;
}

/* ------------------------------------------------------------ supervisão */
export interface FidelityObservation {
  id: string;
  caseId: string;
  programId: string;
  implementerId: string;
  observerId: string;
  at: string;
  mode: 'live' | 'video';
  components: Array<{ name: string; observed: number; correct: number }>;
  notes: string;
}

export interface IoaSession {
  id: string;
  caseId: string;
  targetId: string;
  observerA: string;
  observerB: string;
  at: string;
  /** Registros tentativa a tentativa de cada observador ('+', '-', '0'). */
  a: string[];
  b: string[];
}

export interface SupervisionLog {
  id: string;
  implementerId: string;
  caseId: string | null;
  supervisorId: string;
  at: string;
  minutes: number;
  kind: 'direct' | 'indirect';
  notes: string;
}

export interface Competency {
  professionalId: string;
  procedure: 'DTT' | 'NET' | 'chaining' | 'fluency' | 'denver_routine' | 'behavior_recording';
  status: 'in_training' | 'competent';
  at: string;
}

export interface Invite {
  id: string;
  email: string;
  name: string;
  role: 'org_admin' | 'professional';
  at: string;
}

export interface UiSettings {
  theme: 'light' | 'dark';
  legibleFont: boolean;
  compactDensity: boolean;
}

/* ------------------------------------------------------------ espaço da criança */
export type ChildTheme = 'sol' | 'mar' | 'floresta' | 'noite';

/** Preferências e progresso pessoal. Sem comparação com outras crianças, sem sorteio, sem sequência punitiva. */
export interface ChildSpace {
  childId: string;
  avatar: string;
  theme: ChildTheme;
  sound: boolean;
  /** Estrelas de esforço por jogo: contam atividades concluídas, nunca acertos. */
  stars: Record<string, number>;
  /** Figurinhas desbloqueadas, escolhidas pela própria criança. */
  stickers: string[];
  /** Treino livre: telemetria lúdica, fora dos gráficos clínicos (P2). */
  plays: Array<{ appId: string; at: string; seconds: number; completed: boolean }>;
}
