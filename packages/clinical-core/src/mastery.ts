import type { MasteryCriteria, TargetSessionSummary } from './types';

export interface MasteryEvaluation {
  met: boolean;
  /** Sessões que contam para o critério (nível e mínimo de oportunidades atingidos). */
  qualifyingSessions: number;
  sessionsRequired: number;
  /** Explicação legível, exibida junto do alerta. */
  explanation: string;
  /** Regra e versão sempre visíveis (release gate). */
  criteria: { id: string; version: number };
}

/**
 * Avalia o critério de domínio sobre as sessões de aquisição (não sondas) de um alvo.
 * Critério tem duas dimensões: nível e frequência (Fuller e Fienup, 2018).
 */
export function evaluateMastery(
  summaries: readonly TargetSessionSummary[],
  c: MasteryCriteria,
): MasteryEvaluation {
  const teaching = summaries.filter((s) => s.phase === 'acquisition' && !s.probe);
  const qualifies = (s: TargetSessionSummary) =>
    s.opportunities >= c.minOpportunitiesPerSession &&
    s.pctIndependent != null &&
    s.pctIndependent >= c.minIndependentPct;

  let window: TargetSessionSummary[];
  if (c.consecutive) {
    window = [];
    for (let i = teaching.length - 1; i >= 0 && qualifies(teaching[i]!); i--) window.unshift(teaching[i]!);
  } else {
    window = teaching.filter(qualifies);
  }
  const used = window.slice(-c.sessionsRequired);
  const implementers = new Set(used.map((s) => s.implementerId)).size;
  const settings = new Set(used.map((s) => s.setting)).size;

  const enoughSessions = window.length >= c.sessionsRequired;
  const met = enoughSessions && implementers >= c.minImplementers && settings >= c.minSettings;

  const parts = [
    `${Math.min(window.length, c.sessionsRequired)}/${c.sessionsRequired} sessões${
      c.consecutive ? ' consecutivas' : ''
    } com ≥ ${c.minIndependentPct}% independente e ≥ ${c.minOpportunitiesPerSession} oportunidades`,
  ];
  if (c.minImplementers > 1) parts.push(`${implementers}/${c.minImplementers} aplicadores`);
  if (c.minSettings > 1) parts.push(`${settings}/${c.minSettings} ambientes`);

  return {
    met,
    qualifyingSessions: window.length,
    sessionsRequired: c.sessionsRequired,
    explanation: parts.join(' · '),
    criteria: { id: c.id, version: c.version },
  };
}
