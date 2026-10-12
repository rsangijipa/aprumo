import type {
  BoardState,
  TokenEvent,
  TokenPhase,
  TokenSource,
  ReinforcerOption,
  TeenGoal,
} from '../types/tokens';

export class TokenService {
  private state: BoardState;
  private events: TokenEvent[] = [];
  private processedIdempotencyKeys = new Set<string>();
  private listeners: Array<(state: BoardState, lastEvent?: TokenEvent) => void> = [];

  constructor(initialPhase: TokenPhase = 'inicial') {
    const defaultSlots = initialPhase === 'pareamento' ? 1 : initialPhase === 'inicial' ? 3 : 5;
    this.state = {
      boardId: `board-${Date.now()}`,
      phase: initialPhase,
      targetSlots: defaultSlots,
      currentTokens: 0,
      selectedReinforcer: null,
      activeTokenThemeId: 'buriti-estrela',
      pairingSuccessCount: 0,
      responseCostEnabled: false,
      responseCostJustification: '',
      isCompleted: false,
      timerActive: false,
      timerSecondsRemaining: 120,
      timerTotalDuration: 120,
    };
  }

  public getState(): BoardState {
    return { ...this.state };
  }

  public getEvents(): TokenEvent[] {
    return [...this.events];
  }

  public subscribe(fn: (state: BoardState, lastEvent?: TokenEvent) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify(lastEvent?: TokenEvent) {
    const current = this.getState();
    this.listeners.forEach((l) => l(current, lastEvent));
  }

  public selectReinforcer(reinforcer: ReinforcerOption): void {
    this.state = {
      ...this.state,
      selectedReinforcer: reinforcer,
      timerSecondsRemaining: reinforcer.durationSeconds,
      timerTotalDuration: reinforcer.durationSeconds,
    };
    this.notify();
  }

  public setPhase(phase: TokenPhase): { success: boolean; message: string } {
    if (this.state.phase === 'pareamento' && phase !== 'pareamento' && this.state.pairingSuccessCount < 5) {
      return {
        success: false,
        message: 'Fase de pareamento obrigatória: requer 5 trocas bem-sucedidas antes de avançar para N > 1.',
      };
    }

    let defaultSlots = 5;
    if (phase === 'pareamento') defaultSlots = 1;
    else if (phase === 'inicial') defaultSlots = 3;
    else if (phase === 'intermediaria') defaultSlots = 5;
    else if (phase === 'avancada') defaultSlots = 8;
    else if (phase === 'adolescente') defaultSlots = 10;

    this.state = {
      ...this.state,
      phase,
      targetSlots: defaultSlots,
      currentTokens: 0,
      isCompleted: false,
    };

    this.notify();
    return { success: true, message: `Fase alterada para ${phase}.` };
  }

  public setTargetSlots(slots: number): { success: boolean; message: string } {
    if (this.state.phase === 'pareamento' && slots > 1) {
      return {
        success: false,
        message: 'Na fase de pareamento, o número de fichas (N) deve ser estritamente 1 para troca imediata.',
      };
    }

    const safeSlots = Math.max(1, Math.min(15, slots));
    this.state = {
      ...this.state,
      targetSlots: safeSlots,
      currentTokens: Math.min(this.state.currentTokens, safeSlots),
    };
    this.notify();
    return { success: true, message: `Quadro ajustado para ${safeSlots} fichas.` };
  }

  /**
   * Awards tokens with idempotency protection to avoid duplicate events from network retries.
   */
  public award(
    behaviorId: string,
    behaviorDescription: string,
    source: TokenSource = 'jogo',
    count: number = 1,
    idempotencyKey?: string
  ): { success: boolean; event: TokenEvent | null; isDuplicate: boolean } {
    const key = idempotencyKey || `key-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    if (this.processedIdempotencyKeys.has(key)) {
      const existing = this.events.find((e) => e.idempotencyKey === key) || null;
      return { success: true, event: existing, isDuplicate: true };
    }

    this.processedIdempotencyKeys.add(key);

    const event: TokenEvent = {
      eventId: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      idempotencyKey: key,
      boardId: this.state.boardId,
      source,
      behaviorId,
      behaviorDescription,
      count,
      timestamp: Date.now(),
      isCostOfResponse: false,
    };

    this.events.push(event);

    const nextTokens = Math.min(this.state.targetSlots, this.state.currentTokens + count);
    const isCompleted = nextTokens >= this.state.targetSlots;

    this.state = {
      ...this.state,
      currentTokens: nextTokens,
      isCompleted,
    };

    this.notify(event);
    return { success: true, event, isDuplicate: false };
  }

  /**
   * Response cost: strictly requires enabled flag and written clinical justification.
   */
  public applyResponseCost(
    amount: number,
    justification: string
  ): { success: boolean; message: string; event?: TokenEvent } {
    if (!this.state.responseCostEnabled) {
      return {
        success: false,
        message: 'Custo de resposta (retirada de fichas) está desligado por padrão no protocolo ABA.',
      };
    }

    if (!justification || justification.trim().length < 8) {
      return {
        success: false,
        message: 'Custo de resposta exige justificativa clínica detalhada registrada pelo supervisor.',
      };
    }

    const deducted = Math.min(this.state.currentTokens, amount);
    const nextTokens = Math.max(0, this.state.currentTokens - deducted);

    const event: TokenEvent = {
      eventId: `ev-cost-${Date.now()}`,
      idempotencyKey: `cost-${Date.now()}`,
      boardId: this.state.boardId,
      source: 'clinic',
      behaviorId: 'custo-resposta',
      behaviorDescription: `Custo de resposta: retirada de ${deducted} fichas`,
      count: -deducted,
      timestamp: Date.now(),
      isCostOfResponse: true,
      justification,
    };

    this.events.push(event);

    this.state = {
      ...this.state,
      currentTokens: nextTokens,
      isCompleted: false,
    };

    this.notify(event);
    return {
      success: true,
      message: `${deducted} fichas retiradas com justificativa clínica arquivada.`,
      event,
    };
  }

  public setResponseCostConfig(enabled: boolean, justification?: string): void {
    this.state = {
      ...this.state,
      responseCostEnabled: enabled,
      responseCostJustification: justification || '',
    };
    this.notify();
  }

  public startReinforcementTimer(): void {
    if (!this.state.isCompleted) return;
    this.state = {
      ...this.state,
      timerActive: true,
      timerSecondsRemaining: this.state.timerTotalDuration,
    };
    this.notify();
  }

  public tickTimer(seconds: number = 1): boolean {
    if (!this.state.timerActive) return false;

    const remaining = Math.max(0, this.state.timerSecondsRemaining - seconds);
    const finished = remaining === 0;

    this.state = {
      ...this.state,
      timerSecondsRemaining: remaining,
      timerActive: !finished,
    };

    this.notify();
    return finished;
  }

  public completeExchange(): void {
    const isPairing = this.state.phase === 'pareamento';
    const nextPairingCount = isPairing ? this.state.pairingSuccessCount + 1 : this.state.pairingSuccessCount;

    this.state = {
      ...this.state,
      currentTokens: 0,
      isCompleted: false,
      timerActive: false,
      selectedReinforcer: null, // Forces new choice to prevent satiation
      pairingSuccessCount: nextPairingCount,
    };

    this.notify();
  }

  public setTokenTheme(themeId: string): void {
    this.state = {
      ...this.state,
      activeTokenThemeId: themeId,
    };
    this.notify();
  }

  /**
   * Calculates concordance between adolescent's self-monitoring and therapist's evaluation.
   */
  public static calculateConcordance(goals: TeenGoal[]): number {
    const evaluated = goals.filter((g) => g.therapistConfirmed !== undefined);
    if (evaluated.length === 0) return 100;

    const concordant = evaluated.filter((g) => g.selfReported === g.therapistConfirmed).length;
    return Math.round((concordant / evaluated.length) * 100);
  }
}
