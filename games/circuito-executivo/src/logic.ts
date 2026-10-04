/**
 * Aprumo — Circuito Executivo
 * Lógica clínica para Funções Executivas: Go/No-Go, Troca de Regra e Memória Operacional
 */

import type { SessionConfig } from '@aprumo/protocol';

export type ExecutiveChallengeType = 'gonogo' | 'ruleshift' | 'workingmemory';

export interface GoNoGoTrial {
  id: string;
  type: 'go' | 'nogo';
  targetSymbol: string;
  displayDurationMs: number;
}

export interface RuleShiftTrial {
  id: string;
  card: { color: 'blue' | 'orange'; shape: 'circle' | 'square' };
  activeRule: 'color' | 'shape';
  options: Array<{ id: string; color: 'blue' | 'orange'; shape: 'circle' | 'square'; label: string }>;
  correctOptionId: string;
}

export interface MemorySequenceTrial {
  id: string;
  sequence: number[]; // indices de 0 a 3
  sequenceLength: number;
}

export const GONOGO_PRESETS: GoNoGoTrial[] = [
  { id: 'gn-1', type: 'go', targetSymbol: '⭐', displayDurationMs: 1400 },
  { id: 'gn-2', type: 'go', targetSymbol: '⭐', displayDurationMs: 1400 },
  { id: 'gn-3', type: 'nogo', targetSymbol: '🛑', displayDurationMs: 1400 },
  { id: 'gn-4', type: 'go', targetSymbol: '⭐', displayDurationMs: 1300 },
  { id: 'gn-5', type: 'nogo', targetSymbol: '🛑', displayDurationMs: 1300 },
  { id: 'gn-6', type: 'go', targetSymbol: '⭐', displayDurationMs: 1200 },
];

export const RULE_SHIFT_PRESETS: RuleShiftTrial[] = [
  {
    id: 'rs-1',
    card: { color: 'blue', shape: 'circle' },
    activeRule: 'color',
    options: [
      { id: 'opt-blue', color: 'blue', shape: 'square', label: 'Azul' },
      { id: 'opt-orange', color: 'orange', shape: 'circle', label: 'Laranja' },
    ],
    correctOptionId: 'opt-blue',
  },
  {
    id: 'rs-2',
    card: { color: 'orange', shape: 'square' },
    activeRule: 'color',
    options: [
      { id: 'opt-blue', color: 'blue', shape: 'square', label: 'Azul' },
      { id: 'opt-orange', color: 'orange', shape: 'circle', label: 'Laranja' },
    ],
    correctOptionId: 'opt-orange',
  },
  {
    id: 'rs-3', // AQUI A REGRA MUDA PARA FORMA!
    card: { color: 'orange', shape: 'square' },
    activeRule: 'shape',
    options: [
      { id: 'opt-blue', color: 'blue', shape: 'square', label: 'Quadrado' },
      { id: 'opt-orange', color: 'orange', shape: 'circle', label: 'Círculo' },
    ],
    correctOptionId: 'opt-blue', // pois o card é quadrado
  },
  {
    id: 'rs-4',
    card: { color: 'blue', shape: 'circle' },
    activeRule: 'shape',
    options: [
      { id: 'opt-blue', color: 'blue', shape: 'square', label: 'Quadrado' },
      { id: 'opt-orange', color: 'orange', shape: 'circle', label: 'Círculo' },
    ],
    correctOptionId: 'opt-orange', // pois o card é círculo
  },
];

export const MEMORY_PRESETS: MemorySequenceTrial[] = [
  { id: 'mem-1', sequence: [0, 2], sequenceLength: 2 },
  { id: 'mem-2', sequence: [1, 3, 0], sequenceLength: 3 },
  { id: 'mem-3', sequence: [2, 0, 1, 3], sequenceLength: 4 },
];

export function evaluateGoNoGo(
  trialType: 'go' | 'nogo',
  didTap: boolean,
): { outcome: 'hit' | 'miss' | 'false_alarm' | 'correct_inhibition'; isCorrect: boolean } {
  if (trialType === 'go') {
    if (didTap) return { outcome: 'hit', isCorrect: true };
    return { outcome: 'miss', isCorrect: false };
  }

  // trialType === 'nogo'
  if (didTap) return { outcome: 'false_alarm', isCorrect: false };
  return { outcome: 'correct_inhibition', isCorrect: true };
}

export function evaluateSequence(
  expected: number[],
  input: number[],
): { isCorrect: boolean; isComplete: boolean } {
  if (input.length === 0) return { isCorrect: true, isComplete: false };

  for (let i = 0; i < input.length; i++) {
    if (input[i] !== expected[i]) {
      return { isCorrect: false, isComplete: false };
    }
  }

  const isComplete = input.length === expected.length;
  return { isCorrect: true, isComplete };
}

export function planExecutiveTrials(
  challenge: ExecutiveChallengeType,
  _config?: SessionConfig | null,
) {
  if (challenge === 'gonogo') return GONOGO_PRESETS;
  if (challenge === 'ruleshift') return RULE_SHIFT_PRESETS;
  return MEMORY_PRESETS;
}
