/**
 * Lógica de Escolha pela Instrução (resposta de ouvinte).
 * Diferente do pareamento: o campo mínimo é 2 (sem campo de 1, que não exige discriminação
 * auditiva) e distratores de categorias diferentes têm prioridade, para reduzir confusão
 * semântica no início do ensino.
 */
import { counterbalancedPositions, seededRandom, shuffle } from '@aprumo/game-sdk';
import type { SessionConfig, StimulusRef, TargetConfig } from '@aprumo/protocol';
import { STIMULUS_ART, instructionFor } from '@aprumo/stimuli';

export interface ListenerTrial {
  index: number;
  target: TargetConfig;
  options: StimulusRef[];
  positionOfTarget: number;
  instruction: string;
}

const category = (s: StimulusRef) => STIMULUS_ART[s.art]?.category ?? 'outros';

export function fieldFor(target: TargetConfig, maxChoices: number): number {
  return Math.max(2, Math.min(target.fieldSize, maxChoices, target.distractors.length + 1));
}

export function planListenerTrials(config: SessionConfig): ListenerTrial[] {
  const rnd = seededRandom(config.clinical.seed ^ 0x5eed);
  const out: ListenerTrial[] = [];
  const groups = config.clinical.targets.map((target) => {
    const field = fieldFor(target, config.adaptation.maxChoices);
    const positions = counterbalancedPositions(config.clinical.trialsPerTarget, field, rnd);
    const targetCat = category(target.stimulus);
    const ordered = [
      ...shuffle(target.distractors.filter((d) => category(d) !== targetCat), rnd),
      ...shuffle(target.distractors.filter((d) => category(d) === targetCat), rnd),
    ];
    return positions.map((pos, k) => {
      // Rotaciona os distratores para que nenhum fique sempre ao lado do alvo.
      const rotated = [...ordered.slice(k % Math.max(1, ordered.length)), ...ordered.slice(0, k % Math.max(1, ordered.length))];
      const options = rotated.slice(0, field - 1);
      options.splice(pos, 0, target.stimulus);
      return { target, options, positionOfTarget: pos, instruction: instructionFor(target.stimulus.art, target.stimulus.label) };
    });
  });
  const queue = config.clinical.interleave ? shuffle(groups.flat(), rnd) : groups.flat();
  queue.forEach((t, index) => out.push({ ...t, index }));
  return out;
}
