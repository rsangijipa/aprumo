/**
 * Dança do Congelar — controle inibitório motor (go/no-go) com música.
 * Cada janela de "congela" é uma tentativa. Correto = nenhum toque depois do tempo de reação
 * (graça de 400 ms para a criança perceber a parada). Nas fases com pista de cor, a folha verde
 * pede o oposto (continuar dançando): é uma tentativa "go".
 *
 * Fases:
 *   1. Estátua curta  — congela 2,5–3,5 s.
 *   2. Estátua longa  — congela 4–6 s, dança mais imprevisível.
 *   3. Pegadinha      — distrações passam durante o congela (borboleta, balão).
 *   4. Gelo ou folha? — a pista visual decide: floco = congela; folha = continua dançando.
 */
import { seededRandom } from '@aprumo/game-sdk';

export type FreezePhase = 'countdown' | 'dancing' | 'freezing' | 'evaluated' | 'finished';
export type CueKind = 'freeze' | 'go';

export interface DanceLevel {
  id: string;
  title: string;
  danceMs: [number, number];
  windowMs: [number, number];
  distractors: boolean;
  goTrials: boolean;
  bpm: number;
}

export const DANCE_LEVELS: DanceLevel[] = [
  { id: 'estatua-curta', title: 'Estátua curta', danceMs: [4500, 6500], windowMs: [2500, 3500], distractors: false, goTrials: false, bpm: 100 },
  { id: 'estatua-longa', title: 'Estátua longa', danceMs: [3500, 8000], windowMs: [4000, 6000], distractors: false, goTrials: false, bpm: 112 },
  { id: 'pegadinha', title: 'Pegadinha', danceMs: [3500, 7500], windowMs: [4000, 5500], distractors: true, goTrials: false, bpm: 116 },
  { id: 'gelo-ou-folha', title: 'Gelo ou folha?', danceMs: [3500, 7000], windowMs: [3000, 4500], distractors: true, goTrials: true, bpm: 120 },
];

/** Tempo de reação tolerado depois do sinal (toques antes disso não contam como impulso). */
export const GRACE_MS = 400;

export interface PlannedRound {
  index: number;
  level: number;
  cue: CueKind;
  danceMs: number;
  windowMs: number;
  /** Instantes (ms dentro da janela) em que passa uma distração. */
  distractorAt: number[];
}

/**
 * Plano da sessão: `rounds` rodadas divididas igualmente pelas fases (a partir de `params.startLevel`).
 * Nas fases com pista de cor, ~1/3 das rodadas são "go" (nunca duas seguidas).
 */
export function planRounds(rounds: number, seed: number, startLevel = 0): PlannedRound[] {
  const rnd = seededRandom(seed);
  const levels = DANCE_LEVELS.length - startLevel;
  const per = Math.max(1, Math.ceil(rounds / levels));
  const between = (a: number, b: number) => Math.round(a + rnd() * (b - a));
  const out: PlannedRound[] = [];
  for (let i = 0; i < rounds; i++) {
    const level = Math.min(DANCE_LEVELS.length - 1, startLevel + Math.floor(i / per));
    const L = DANCE_LEVELS[level]!;
    const prevGo = out[i - 1]?.cue === 'go';
    const cue: CueKind = L.goTrials && !prevGo && rnd() < 0.34 ? 'go' : 'freeze';
    const windowMs = between(L.windowMs[0], L.windowMs[1]);
    out.push({
      index: i,
      level,
      cue,
      danceMs: between(L.danceMs[0], L.danceMs[1]),
      windowMs,
      distractorAt: L.distractors ? [between(700, windowMs * 0.5), between(windowMs * 0.55, windowMs - 500)] : [],
    });
  }
  return out;
}

export interface FreezeEvaluation {
  passed: boolean;
  scoreDelta: number;
  message: string;
  rating: 'perfect' | 'good' | 'impulsive';
}

/**
 * Avalia a janela de congelamento. Só a estátua perfeita (0 toques após a graça) é "correta" no dado;
 * 1–2 toques ainda recebem mensagem acolhedora ("quase!") mas não contam como acerto.
 */
export function evaluateFreezePerformance(impulsiveTaps: number, _freezeDurationMs: number): FreezeEvaluation {
  if (impulsiveTaps === 0) return { passed: true, scoreDelta: 100, message: 'Estátua perfeita de gelo!', rating: 'perfect' };
  if (impulsiveTaps <= 2) return { passed: false, scoreDelta: 50, message: 'Quase! O gelo rachou um pouquinho.', rating: 'good' };
  return { passed: false, scoreDelta: 10, message: 'O gelo derreteu! Na próxima, fique bem paradinho.', rating: 'impulsive' };
}

/** Tentativa "go" (folha verde): correto se a criança CONTINUA dançando (≥ 1 toque na janela). */
export function evaluateGoWindow(taps: number): FreezeEvaluation {
  return taps > 0
    ? { passed: true, scoreDelta: 100, message: 'Isso! A folha diz: continue dançando!', rating: 'perfect' }
    : { passed: false, scoreDelta: 0, message: 'A folha verde era para dançar! Vamos de novo.', rating: 'impulsive' };
}

/** Separa toques dentro da graça (reação normal) dos toques impulsivos. */
export function classifyTaps(tapTimesMs: number[], grace = GRACE_MS): { impulsive: number; firstImpulsiveMs: number | null } {
  const late = tapTimesMs.filter((t) => t >= grace);
  return { impulsive: late.length, firstImpulsiveMs: late.length ? Math.round(late[0]!) : null };
}

/* ------------------------------------------------------------ música (sem arquivos) */

/** Pentatônica alegre (sem semitons). */
export const DANCE_PENTATONIC_FREQS = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25];

/** Melodia de 16 passos (índices na pentatônica; -1 = pausa) e linha de baixo de 4 tempos. */
export const MELODY = [0, 2, 4, 2, 5, 4, 2, -1, 3, 4, 5, 4, 2, 1, 0, -1];
export const BASS = [130.81, 130.81, 196.0, 174.61];

export function getDanceBeatTone(step: number): { freq: number; dur: number; type: OscillatorType } {
  const idx = MELODY[step % MELODY.length]!;
  const freq = DANCE_PENTATONIC_FREQS[Math.max(0, idx)] ?? 261.63;
  return { freq, dur: 0.16, type: 'triangle' };
}

/** Duração (ms) de um passo de colcheia para o BPM. */
export const stepMs = (bpm: number) => Math.round(60000 / bpm / 2);

/** Compatibilidade com a API antiga. */
export function computeDanceDuration(roundIndex: number): number {
  const offsets = [6000, 7500, 5200, 8000, 6800, 5500];
  return offsets[roundIndex % offsets.length] ?? 6000;
}
export function computeFreezeDuration(roundIndex: number): number {
  const offsets = [3800, 4500, 3500, 5200, 4200, 4800];
  return offsets[roundIndex % offsets.length] ?? 4000;
}

export function startLevelFrom(params: Record<string, unknown>): number {
  const v = params.startLevel;
  return typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(DANCE_LEVELS.length - 1, Math.floor(v))) : 0;
}
