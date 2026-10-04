/**
 * Lógica de Encontre o Igual (pareamento de idênticos).
 *  - Campo limitado pelo alvo e pelo perfil sensorial (maxChoices).
 *  - Posição do correto contrabalanceada por alvo: nunca 3× seguidas na mesma posição.
 *  - Distratores rodam de posição entre tentativas.
 *  - Semente reprodutível: a mesma configuração gera a mesma sequência (auditoria).
 */
import { counterbalancedPositions, seededRandom, shuffle } from '@aprumo/game-sdk';
import type { SessionConfig, StimulusRef, TargetConfig } from '@aprumo/protocol';

export interface PlannedTrial {
  index: number;
  target: TargetConfig;
  options: StimulusRef[];
  positionOfTarget: number;
}

export function planTrials(config: SessionConfig): PlannedTrial[] {
  const rnd = seededRandom(config.clinical.seed);
  const { trialsPerTarget, interleave } = config.clinical;
  const perTarget = config.clinical.targets.map((target) => {
    const field = Math.max(1, Math.min(target.fieldSize, config.adaptation.maxChoices, target.distractors.length + 1));
    const positions = counterbalancedPositions(trialsPerTarget, field, rnd);
    return positions.map((pos) => {
      const distractors = shuffle(target.distractors, rnd).slice(0, field - 1);
      const options = [...distractors];
      options.splice(pos, 0, target.stimulus);
      return { target, options, positionOfTarget: pos };
    });
  });
  const flat = interleave ? interleaveNoLongRuns(perTarget, rnd) : perTarget.flat();
  return flat.map((t, index) => ({ ...t, index }));
}

/** Intercala alvos evitando mais de 2 tentativas seguidas do mesmo alvo quando possível. */
function interleaveNoLongRuns<T extends { target: TargetConfig }>(groups: T[][], rnd: () => number): T[] {
  const pools = groups.map((g) => [...g]);
  const out: T[] = [];
  while (pools.some((p) => p.length)) {
    const last2 = out.slice(-2).map((t) => t.target.targetId);
    const blocked = last2.length === 2 && last2[0] === last2[1] ? last2[0] : undefined;
    const candidates = pools.map((p, i) => ({ p, i })).filter(({ p }) => p.length && p[0]!.target.targetId !== blocked);
    const pick = (candidates.length ? candidates : pools.map((p, i) => ({ p, i })).filter(({ p }) => p.length))[
      Math.floor(rnd() * (candidates.length || 1))
    ]!;
    out.push(pools[pick.i]!.shift()!);
  }
  return out;
}
