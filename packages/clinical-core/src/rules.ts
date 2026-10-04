/**
 * Motor de regras de decisão R1–R15.
 * Cada regra propõe; quem decide é o supervisor (princípio P3). Nenhuma regra altera o plano.
 */
import { evaluateMastery } from './mastery';
import { linearTrend, mean, sd } from './stats';
import type { Channel, MasteryCriteria, Phase, TargetSessionSummary, TrialFact } from './types';

export type RuleId =
  | 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'R6' | 'R7' | 'R8'
  | 'R9' | 'R10' | 'R11' | 'R12' | 'R13' | 'R14' | 'R15';

export type Severity = 'priority' | 'attention' | 'info';

export interface DecisionAlert {
  ruleId: RuleId;
  severity: Severity;
  subjectId: string;
  subjectName: string;
  title: string;
  /** Evidência numérica com tamanho de amostra. */
  evidence: string;
  suggestedAction: string;
  basis: string;
}

export interface RuleParams {
  stagnationSessions: number;
  promptDependencyPct: number;
  promptDependencySessions: number;
  fadingPct: number;
  generalizationGapDays: number;
  channelDiscrepancyPts: number;
  positionBiasPct: number;
  positionBiasTrials: number;
  implementerDiscrepancyPts: number;
  satiationDropPct: number;
  minWeeklyOpportunities: number;
  denverStagnantSessions: number;
  denverCycleWarningDays: number;
}

export const DEFAULT_RULE_PARAMS: RuleParams = {
  stagnationSessions: 6,
  promptDependencyPct: 70,
  promptDependencySessions: 4,
  fadingPct: 80,
  generalizationGapDays: 14,
  channelDiscrepancyPts: 30,
  positionBiasPct: 60,
  positionBiasTrials: 20,
  implementerDiscrepancyPts: 25,
  satiationDropPct: 50,
  minWeeklyOpportunities: 10,
  denverStagnantSessions: 4,
  denverCycleWarningDays: 14,
};

export interface TargetInput {
  targetId: string;
  name: string;
  phase: Phase;
  teachingChannel: Channel;
  criteria: MasteryCriteria;
  /** Resumos por sessão, em ordem cronológica. */
  summaries: TargetSessionSummary[];
  /** Fatos brutos recentes (necessário para viés de posição). */
  recentTrials: TrialFact[];
}

export interface ReinforcerInput {
  reinforcerId: string;
  name: string;
  /** Proporção de escolha/uso por sessão (0–1), cronológica. */
  choiceRates: number[];
}

export interface BehaviorInput {
  definitionId: string;
  name: string;
  /** Valor da medida definida por sessão (taxa, duração ou % intervalos), cronológico. */
  values: number[];
  riskEpisodeInLastSession: boolean;
}

export interface DenverStepInput {
  stepId: string;
  name: string;
  /** Proporção de intervalos com desempenho por sessão, cronológica. */
  proportions: number[];
}

export interface RuleContext {
  now: Date;
  params?: Partial<RuleParams>;
  targets?: TargetInput[];
  reinforcers?: ReinforcerInput[];
  behaviors?: BehaviorInput[];
  screenTime?: { minutesToday: number; limitMinutes: number };
  denverSteps?: DenverStepInput[];
  denverCycle?: { cycleId: string; endsOn: Date };
}

const DAY = 86_400_000;
const fmt = (n: number) => `${Math.round(n)}%`;
const num = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

function* targetRules(t: TargetInput, p: RuleParams, now: Date): Generator<DecisionAlert> {
  const base = { subjectId: t.targetId, subjectName: t.name };
  const teaching = t.summaries.filter((s) => !s.probe && s.pctIndependent != null);
  const acq = teaching.filter((s) => s.phase === 'acquisition');

  if (t.phase === 'acquisition') {
    // R1 — critério atingido
    const m = evaluateMastery(t.summaries, t.criteria);
    if (m.met) {
      yield {
        ...base, ruleId: 'R1', severity: 'priority',
        title: 'Critério de domínio atingido',
        evidence: `${m.explanation} (critério ${m.criteria.id} v${m.criteria.version})`,
        suggestedAction: 'Confirmar domínio e iniciar manutenção e generalização.',
        basis: 'Critério com nível e frequência (Fuller e Fienup, 2018).',
      };
    }

    // R2 — estagnação
    const lastN = acq.slice(-p.stagnationSessions);
    if (!m.met && lastN.length >= p.stagnationSessions) {
      const ys = lastN.map((s) => s.pctIndependent!);
      const { slope } = linearTrend(ys);
      if (slope <= 0 && ys[ys.length - 1]! < t.criteria.minIndependentPct) {
        yield {
          ...base, ruleId: 'R2', severity: 'attention',
          title: 'Sem progresso em aquisição',
          evidence: `${lastN.length} sessões sem tendência ascendente (inclinação ${slope.toFixed(2)} pts/sessão); última ${fmt(ys.at(-1)!)}.`,
          suggestedAction: 'Revisar estímulos, procedimento de dica, reforçador ou pré-requisitos.',
          basis: 'Decisão baseada em dados: mudar o procedimento quando o desempenho não progride.',
        };
      }
    }

    // R3 — dependência de dica
    const lastP = acq.slice(-p.promptDependencySessions);
    if (
      lastP.length >= p.promptDependencySessions &&
      lastP.every((s) => (s.pctPrompted ?? 0) >= p.promptDependencyPct) &&
      lastP[lastP.length - 1]!.meanPromptLevel! >= lastP[0]!.meanPromptLevel!
    ) {
      yield {
        ...base, ruleId: 'R3', severity: 'attention',
        title: 'Possível dependência de dica',
        evidence: `≥ ${p.promptDependencyPct}% de acertos com dica em ${lastP.length} sessões, sem redução do nível médio de dica.`,
        suggestedAction: 'Ajustar o esvanecimento (por exemplo, atraso progressivo).',
        basis: 'Esvanecimento deve ser planejado desde o início.',
      };
    }

    // R4 — sugestão de esvanecimento
    const last2 = acq.slice(-2);
    if (
      !m.met && last2.length === 2 &&
      last2.every((s) => s.opportunities > 0 && ((s.correctIndependent + s.correctPrompted) / s.opportunities) * 100 >= p.fadingPct) &&
      last2.every((s) => (s.meanPromptLevel ?? 0) > 0)
    ) {
      yield {
        ...base, ruleId: 'R4', severity: 'info',
        title: 'Pronto para reduzir a dica',
        evidence: `2 sessões consecutivas com ≥ ${p.fadingPct}% de acerto no nível de dica atual.`,
        suggestedAction: 'Reduzir o nível de dica padrão do alvo.',
        basis: 'Transferência de controle de estímulo.',
      };
    }
  }

  // R5 — regressão em manutenção
  if (t.phase === 'maintenance') {
    const probe = t.summaries.filter((s) => s.probe && s.pctIndependent != null).at(-1);
    if (probe && probe.pctIndependent! < t.criteria.maintenanceMinPct) {
      yield {
        ...base, ruleId: 'R5', severity: 'priority',
        title: 'Queda em sonda de manutenção',
        evidence: `Sonda de ${probe.sessionAt.slice(0, 10)}: ${fmt(probe.pctIndependent!)} (mínimo ${t.criteria.maintenanceMinPct}%, n = ${probe.opportunities}).`,
        suggestedAction: 'Reabrir a aquisição com ensino de reforço.',
        basis: 'Generalidade no tempo (Baer, Wolf e Risley, 1968).',
      };
    }
  }

  // R6 — lacuna de generalização
  if (t.teachingChannel === 'digital' && (t.phase === 'maintenance' || t.phase === 'generalization' || t.phase === 'mastered')) {
    const offScreen = t.summaries.filter(
      (s) => s.channel !== 'digital' && now.getTime() - Date.parse(s.sessionAt) <= p.generalizationGapDays * DAY,
    );
    if (offScreen.length === 0) {
      yield {
        ...base, ruleId: 'R6', severity: 'attention',
        title: 'Generalização fora da tela não verificada',
        evidence: `Nenhuma sonda fora do canal digital nos últimos ${p.generalizationGapDays} dias.`,
        suggestedAction: 'Programar sonda com outro material, pessoa ou ambiente.',
        basis: 'Generalização não pode ser presumida (P8).',
      };
    }
  }

  // R7 — discrepância entre canais
  const digital = teaching.filter((s) => s.channel === 'digital').slice(-3);
  const table = teaching.filter((s) => s.channel === 'table').slice(-3);
  if (digital.length === 3 && table.length === 3) {
    const diff = mean(digital.map((s) => s.pctIndependent!)) - mean(table.map((s) => s.pctIndependent!));
    if (Math.abs(diff) >= p.channelDiscrepancyPts) {
      yield {
        ...base, ruleId: 'R7', severity: 'attention',
        title: 'Desempenho diferente entre jogo e mesa',
        evidence: `Diferença de ${Math.round(Math.abs(diff))} pontos (${diff > 0 ? 'jogo acima' : 'mesa acima'}) nas últimas 3 sessões de cada canal.`,
        suggestedAction: 'Investigar controle por características irrelevantes do jogo.',
        basis: 'Controle de estímulo restrito ao formato.',
      };
    }
  }

  // R8 — viés de posição
  const sel = t.recentTrials
    .filter((x) => x.selectedPosition != null && x.fieldSize != null && x.fieldSize > 1)
    .slice(-p.positionBiasTrials);
  if (sel.length >= p.positionBiasTrials) {
    const counts = new Map<number, number>();
    for (const x of sel) counts.set(x.selectedPosition!, (counts.get(x.selectedPosition!) ?? 0) + 1);
    const [pos, count] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]!;
    const share = (count / sel.length) * 100;
    if (share >= p.positionBiasPct) {
      yield {
        ...base, ruleId: 'R8', severity: 'attention',
        title: 'Escolhas concentradas em uma posição',
        evidence: `${fmt(share)} das últimas ${sel.length} escolhas na posição ${pos + 1}, independentemente da posição do alvo.`,
        suggestedAction: 'Revisar a aleatorização e a correção de erro.',
        basis: 'Controle por posição em vez de pelo estímulo.',
      };
    }
  }

  // R9 — discrepância entre aplicadores
  const byImpl = new Map<string, number[]>();
  for (const s of teaching) byImpl.set(s.implementerId, [...(byImpl.get(s.implementerId) ?? []), s.pctIndependent!]);
  const eligible = [...byImpl.entries()].filter(([, v]) => v.length >= 3).map(([k, v]) => [k, mean(v.slice(-3))] as const);
  if (eligible.length >= 2) {
    const vals = eligible.map(([, v]) => v);
    const spread = Math.max(...vals) - Math.min(...vals);
    if (spread >= p.implementerDiscrepancyPts) {
      yield {
        ...base, ruleId: 'R9', severity: 'attention',
        title: 'Diferença entre aplicadores',
        evidence: `${Math.round(spread)} pontos entre aplicadores (≥ 3 sessões de cada).`,
        suggestedAction: 'Agendar observação de fidelidade.',
        basis: 'Fidelidade de procedimento.',
      };
    }
  }

  // R12 — oportunidades insuficientes na semana
  if (t.phase === 'acquisition' || t.phase === 'baseline') {
    const weekly = t.summaries
      .filter((s) => now.getTime() - Date.parse(s.sessionAt) <= 7 * DAY)
      .reduce((acc, s) => acc + s.opportunities, 0);
    if (weekly < p.minWeeklyOpportunities) {
      yield {
        ...base, ruleId: 'R12', severity: 'info',
        title: 'Poucas oportunidades nesta semana',
        evidence: `${weekly} oportunidades nos últimos 7 dias (mínimo ${p.minWeeklyOpportunities}).`,
        suggestedAction: 'Priorizar este alvo na próxima sessão.',
        basis: 'Densidade de ensino.',
      };
    }
  }
}

export function evaluateRules(ctx: RuleContext): DecisionAlert[] {
  const p = { ...DEFAULT_RULE_PARAMS, ...ctx.params };
  const out: DecisionAlert[] = [];
  for (const t of ctx.targets ?? []) out.push(...targetRules(t, p, ctx.now));

  // R10 — saciação
  for (const r of ctx.reinforcers ?? []) {
    const last = r.choiceRates.slice(-4);
    if (last.length === 4 && last[0]! > 0 && (1 - last[3]! / last[0]!) * 100 >= p.satiationDropPct) {
      out.push({
        ruleId: 'R10', severity: 'info', subjectId: r.reinforcerId, subjectName: r.name,
        title: 'Possível saciação de reforçador',
        evidence: `Taxa de escolha caiu de ${fmt(last[0]! * 100)} para ${fmt(last[3]! * 100)} em 3 sessões.`,
        suggestedAction: 'Refazer avaliação de preferência e rodiziar itens.',
        basis: 'Operações motivadoras.',
      });
    }
  }

  // R11 — aumento de comportamento-problema
  for (const b of ctx.behaviors ?? []) {
    const prev = b.values.slice(-11, -1);
    const last = b.values.at(-1);
    const spike = last != null && prev.length >= 10 && last > mean(prev) + 2 * sd(prev);
    if (spike || b.riskEpisodeInLastSession) {
      out.push({
        ruleId: 'R11', severity: 'priority', subjectId: b.definitionId, subjectName: b.name,
        title: b.riskEpisodeInLastSession ? 'Episódio de risco registrado' : 'Aumento de comportamento-problema',
        evidence: spike
          ? `Última sessão: ${num(last!)} (medida definida), acima de média + 2 DP das 10 anteriores (${num(mean(prev))} ± ${num(sd(prev))}).`
          : 'Episódio marcado como de risco na última sessão.',
        suggestedAction: 'Revisar o plano de manejo e registrar no prontuário.',
        basis: 'Monitoramento contínuo do plano de manejo.',
      });
    }
  }

  // R13 — excesso de tela
  if (ctx.screenTime && ctx.screenTime.minutesToday > ctx.screenTime.limitMinutes) {
    out.push({
      ruleId: 'R13', severity: 'attention', subjectId: 'screen', subjectName: 'Tempo de tela',
      title: 'Limite diário de tela ultrapassado',
      evidence: `${ctx.screenTime.minutesToday} min hoje (limite ${ctx.screenTime.limitMinutes} min para a faixa etária).`,
      suggestedAction: 'Bloquear atividade de tela adicional hoje, salvo liberação justificada.',
      basis: 'Recomendações da SBP (2024).',
    });
  }

  // R14 — Denver: passo estagnado
  for (const s of ctx.denverSteps ?? []) {
    const last = s.proportions.slice(-p.denverStagnantSessions);
    if (last.length >= p.denverStagnantSessions && linearTrend(last).slope <= 0) {
      out.push({
        ruleId: 'R14', severity: 'attention', subjectId: s.stepId, subjectName: s.name,
        title: 'Passo de aprendizagem sem avanço',
        evidence: `${last.length} sessões sem aumento da proporção de intervalos com desempenho.`,
        suggestedAction: 'Dividir o passo ou revisar as rotinas em que é trabalhado.',
        basis: 'Revisão do passo de aprendizagem (ESDM).',
      });
    }
  }

  // R15 — Denver: ciclo vencendo
  if (ctx.denverCycle) {
    const days = Math.ceil((ctx.denverCycle.endsOn.getTime() - ctx.now.getTime()) / DAY);
    if (days >= 0 && days <= p.denverCycleWarningDays) {
      out.push({
        ruleId: 'R15', severity: 'info', subjectId: ctx.denverCycle.cycleId, subjectName: 'Ciclo trimestral',
        title: 'Ciclo trimestral perto do fim',
        evidence: `Faltam ${days} dias para o fim do ciclo.`,
        suggestedAction: 'Agendar reavaliação e planejamento do próximo ciclo.',
        basis: 'Ciclo de revisão do currículo (ESDM).',
      });
    }
  }

  const order: Record<Severity, number> = { priority: 0, attention: 1, info: 2 };
  return out.sort((a, b) => order[a.severity] - order[b.severity]);
}
