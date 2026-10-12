/**
 * Escada de fases (níveis) adaptativa e pura. Cada jogo define o que é um nível
 * (mais cartas, sequência maior, menos dica...); aqui fica só a regra de subir/descer.
 *
 * Regra padrão (escada "2 para cima, 2 para baixo", comum em ensino sem erro):
 *  - `upAfter` acertos independentes seguidos → sobe um nível;
 *  - `downAfter` erros seguidos → desce um nível (nunca abaixo de 0);
 *  - acertos com dica não sobem nem descem (mantêm o nível e zeram a sequência de erros).
 * O teto respeita o que a adaptação clínica permite (ex.: maxChoices) — o jogo passa `maxLevel`.
 */

export type LadderOutcome = 'independent' | 'prompted' | 'error';

export interface LadderState {
  level: number;
  maxLevel: number;
  streak: number;
  errors: number;
  /** Última mudança de nível (para animar "Fase 3!" ou a volta suave). */
  moved: 'up' | 'down' | null;
  /** Histórico curto, útil para o detail dos eventos. */
  history: LadderOutcome[];
}

export interface LadderRules {
  upAfter?: number;
  downAfter?: number;
}

export function createLadder(maxLevel: number, startLevel = 0): LadderState {
  const max = Math.max(0, Math.floor(maxLevel));
  return { level: Math.min(Math.max(0, startLevel), max), maxLevel: max, streak: 0, errors: 0, moved: null, history: [] };
}

export function stepLadder(s: LadderState, outcome: LadderOutcome, rules: LadderRules = {}): LadderState {
  const upAfter = rules.upAfter ?? 2;
  const downAfter = rules.downAfter ?? 2;
  const history = [...s.history, outcome].slice(-12);
  if (outcome === 'independent') {
    const streak = s.streak + 1;
    if (streak >= upAfter && s.level < s.maxLevel) {
      return { ...s, level: s.level + 1, streak: 0, errors: 0, moved: 'up', history };
    }
    return { ...s, streak, errors: 0, moved: null, history };
  }
  if (outcome === 'prompted') return { ...s, streak: 0, errors: 0, moved: null, history };
  const errors = s.errors + 1;
  if (errors >= downAfter && s.level > 0) {
    return { ...s, level: s.level - 1, streak: 0, errors: 0, moved: 'down', history };
  }
  return { ...s, streak: 0, errors, moved: null, history };
}

/** Converte a resposta pontuada do protocolo em desfecho da escada. */
export function ladderOutcome(response: 'correct' | 'incorrect' | 'no_response', prompted: boolean): LadderOutcome {
  if (response !== 'correct') return 'error';
  return prompted ? 'prompted' : 'independent';
}

/**
 * Lista linear de fases fixas (sem adaptação): útil para jogos com "mundos" em sequência.
 * Retorna o índice da fase para a tentativa `trialIndex` dado quantas tentativas cada fase tem.
 */
export function phaseForTrial(trialIndex: number, trialsPerPhase: number, phases: number): number {
  if (phases <= 1 || trialsPerPhase <= 0) return 0;
  return Math.min(phases - 1, Math.floor(trialIndex / trialsPerPhase));
}
