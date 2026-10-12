/**
 * História em Ordem — sequenciamento temporal e causalidade.
 * Fases por tamanho da história (3 → 4 → 5 etapas) com escada adaptativa: 2 acertos independentes
 * seguidos sobem, 2 erros seguidos descem. Correção sem erro: depois de uma montagem errada, as cartas
 * já no lugar certo travam e só as outras voltam (a tentativa não é pontuada de novo).
 */
import { createLadder, seededRandom, shuffle, stepLadder, type LadderState } from '@aprumo/game-sdk';
import type { SessionConfig } from '@aprumo/protocol';

export interface StoryStep {
  id: string;
  stepNumber: number;
  label: string;
  /** Cena ilustrada (Scenes.tsx). */
  scene: string;
  /** Mantido por compatibilidade com versões que usavam emoji. */
  icon: string;
  art?: string;
}

export interface StorySequence {
  id: string;
  title: string;
  steps: StoryStep[];
}

const story = (id: string, title: string, labels: string[], icons: string[]): StorySequence => ({
  id,
  title,
  steps: labels.map((label, i) => ({ id: `${id}-${i + 1}`, stepNumber: i + 1, label, scene: `${id}-${i + 1}`, icon: icons[i] ?? '•' })),
});

export const STORIES: StorySequence[] = [
  story('planta', 'Como a plantinha cresce?', ['Plantar a semente', 'Regar com água', 'A flor nasceu!'], ['🌱', '💧', '🌸']),
  story('banana', 'Hora de comer a fruta!', ['Pegar a banana', 'Descascar', 'Comer o lanche'], ['🍌', '👐', '😋']),
  story('torre', 'Construindo a torre', ['Um bloco', 'Mais um bloco em cima', 'A torre ficou pronta!'], ['🟥', '🟨', '🚩']),
  story('maos', 'Lavando as mãos', ['Mãos sujinhas', 'Passar sabão', 'Enxaguar na água', 'Secar na toalha'], ['🤲', '🧼', '🚰', '🧻']),
  story('bolo', 'Fazendo um bolo', ['Separar os ingredientes', 'Misturar tudo', 'Assar no forno', 'Bolo pronto!'], ['🥚', '🥣', '🔥', '🎂']),
  story('borboleta', 'A lagarta e a borboleta', ['Ovinhos na folha', 'Nasceu a lagarta', 'Virou casulo', 'Saiu a borboleta!'], ['🥚', '🐛', '🫘', '🦋']),
  story('manha', 'A manhã antes da escola', ['Acordar', 'Escovar os dentes', 'Vestir a roupa', 'Tomar café', 'Ir para a escola'], ['🛏️', '🪥', '👕', '🥣', '🏫']),
  story('castelo', 'Castelo de areia', ['Pegar balde e pá', 'Encher de areia', 'Virar o balde', 'Tirar o balde', 'Enfeitar o castelo'], ['🪣', '⛏️', '🔄', '🏰', '🚩']),
  story('sorvete', 'Hora do sorvete', ['Achar o carrinho', 'Pagar o sorvete', 'Ganhar o sorvete', 'Tomar o sorvete', 'Acabou! Que delícia'], ['🛒', '🪙', '🍦', '😋', '😊']),
];

/** Níveis por número de etapas. */
export const LEVEL_STEPS = [3, 4, 5];
export const storiesForLevel = (level: number) => STORIES.filter((s) => s.steps.length === LEVEL_STEPS[level]);

export interface PlannedStoryTrial {
  index: number;
  story: StorySequence;
  shuffledSteps: StoryStep[];
}

/** Total de histórias da sessão (cada uma é uma tentativa). */
export function sessionLength(config: Pick<SessionConfig, 'clinical'>): number {
  return Math.max(3, Math.min(10, config.clinical.trialsPerTarget + 2));
}

export function startLevelFrom(params: Record<string, unknown>): number {
  const s = params.startSteps;
  const idx = typeof s === 'number' ? LEVEL_STEPS.indexOf(Math.floor(s)) : -1;
  return idx >= 0 ? idx : 0;
}

/** Embaralha garantindo que a ordem apresentada nunca já seja a correta. */
export function shuffleSteps(steps: StoryStep[], rnd: () => number): StoryStep[] {
  for (let k = 0; k < 8; k++) {
    const s = shuffle(steps, rnd);
    if (s.some((x, i) => x.stepNumber !== i + 1)) return s;
  }
  return [...steps].reverse();
}

/**
 * Escolhe a próxima história de um nível sem repetir enquanto houver inéditas.
 * `used` guarda ids já apresentados na sessão.
 */
export function nextStory(level: number, used: ReadonlySet<string>, rnd: () => number): StorySequence {
  const pool = storiesForLevel(level);
  const fresh = pool.filter((s) => !used.has(s.id));
  const pick = (fresh.length ? fresh : pool)[Math.floor(rnd() * (fresh.length || pool.length))];
  return pick ?? STORIES[0]!;
}

/** Compatibilidade: plano fixo (uma história de cada nível de 3 etapas). */
export function planStoryTrials(config: SessionConfig): PlannedStoryTrial[] {
  const rnd = seededRandom(config.clinical.seed);
  return storiesForLevel(0).map((s, index) => ({ index, story: s, shuffledSteps: shuffleSteps(s.steps, rnd) }));
}

export interface OrderCheck {
  correct: boolean;
  /** Para cada slot: a carta está na posição certa? */
  slots: boolean[];
  /** Quantas etapas iniciais estão certas em sequência. */
  correctPrefix: number;
}

export function checkOrder(placed: StoryStep[]): OrderCheck {
  const slots = placed.map((s, i) => s.stepNumber === i + 1);
  let correctPrefix = 0;
  while (correctPrefix < slots.length && slots[correctPrefix]) correctPrefix++;
  return { correct: slots.every(Boolean), slots, correctPrefix };
}

/** Próxima etapa que falta no lugar (para a dica numérica). */
export function nextMissingStep(slots: (StoryStep | null)[]): number {
  for (let i = 0; i < slots.length; i++) if (slots[i]?.stepNumber !== i + 1) return i + 1;
  return slots.length;
}

export const createStoryLadder = (start: number): LadderState => createLadder(LEVEL_STEPS.length - 1, start);
export const stepStoryLadder = stepLadder;
