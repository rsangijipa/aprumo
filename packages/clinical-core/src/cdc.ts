import { binomialCriticalCount, linearTrend, mean, sd } from './stats';

export type CdcResult =
  | { applicable: false; reason: string }
  | {
      applicable: true;
      systematic: boolean;
      pointsBeyond: number;
      required: number;
      n: number;
      /** Linhas projetadas sobre a fase de intervenção (para desenhar no gráfico). */
      meanLine: number[];
      trendLine: number[];
    };

/**
 * Critério duplo conservador (Fisher, Kelley e Lomas, 2003).
 * Projeta média e tendência da fase A sobre a fase B, deslocadas 0,25 DP na direção
 * esperada, conta pontos de B além de ambas e compara com o teste binomial (p = 0,5).
 * Apoio à análise visual — nunca substitui a decisão do supervisor.
 */
export function conservativeDualCriterion(
  phaseA: readonly number[],
  phaseB: readonly number[],
  direction: 'increase' | 'decrease' = 'increase',
): CdcResult {
  if (phaseA.length < 5 || phaseB.length < 5) {
    return { applicable: false, reason: 'Dados insuficientes para o método (mínimo de 5 pontos por fase).' };
  }
  const shift = 0.25 * sd(phaseA) * (direction === 'increase' ? 1 : -1);
  const m = mean(phaseA) + shift;
  const t = linearTrend(phaseA);
  const meanLine = phaseB.map(() => m);
  const trendLine = phaseB.map((_, i) => t.intercept + t.slope * (phaseA.length + i) + shift);
  const beyond = phaseB.filter((y, i) =>
    direction === 'increase'
      ? y > meanLine[i]! && y > trendLine[i]!
      : y < meanLine[i]! && y < trendLine[i]!,
  ).length;
  const required = binomialCriticalCount(phaseB.length);
  return {
    applicable: true,
    systematic: beyond >= required,
    pointsBeyond: beyond,
    required,
    n: phaseB.length,
    meanLine,
    trendLine,
  };
}
