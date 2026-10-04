/**
 * Motor de tentativas para jogos de SELEÇÃO. Cuida apenas do que precisa ser idêntico entre jogos
 * (o dado): latência, dica embutida, dica do profissional, sem resposta, correção de erro e emissão
 * dos eventos do protocolo. Visual, ritmo e interação continuam sendo de cada jogo.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { InputMode, PromptSource, SessionConfig, StimulusRef, TargetConfig, TrialResponse } from '@aprumo/protocol';
import type { GameClient } from './client';

export interface SelectionTrial {
  index: number;
  target: TargetConfig;
  options: StimulusRef[];
  positionOfTarget: number;
}

export type Stage = 'awaiting' | 'feedback' | 'correction' | 'done';

export interface TrialRunnerState<T extends SelectionTrial> {
  trial: T | undefined;
  stage: Stage;
  /** Dica visual ativa (embutida ou correção de erro). */
  hint: boolean;
  lastOutcome: TrialResponse | null;
  lastSelected: number | null;
  completed: number;
  total: number;
}

export function useTrialRunner<T extends SelectionTrial>(opts: {
  client: GameClient;
  config: SessionConfig | null;
  trials: T[];
  paused: boolean;
  latencyMaxMs: number;
  feedbackMs?: number;
  /** Detalhes próprios do jogo anexados ao TRIAL_COMPLETED. */
  detail?: () => Record<string, unknown>;
  onTrialStart?: (t: T) => void;
  /** Enquanto false, a tentativa não começa (ex.: instrução falada em andamento). Latência conta a partir daqui. */
  gate?: boolean;
  /**
   * Emite os eventos opcionais do ciclo universal (STIMULUS_PRESENTED, RESPONSE_STARTED,
   * REINFORCER_PRESENTED). Padrão: true. Use false para manter só os eventos legados.
   */
  runtimeEvents?: boolean;
}) {
  const runtime = opts.runtimeEvents !== false;
  const { client, config, trials, paused, latencyMaxMs, feedbackMs = 1100 } = opts;
  const [i, setI] = useState(0);
  const [stage, setStage] = useState<Stage>('awaiting');
  const [hint, setHint] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<TrialResponse | null>(null);
  const [lastSelected, setLastSelected] = useState<number | null>(null);

  const t0 = useRef(0);
  const prompt = useRef<{ level: string; source: PromptSource }>({ level: 'IND', source: 'none' });
  /** Temporizadores da tentativa (dica embutida, tempo-limite): cancelados ao fim da tentativa. */
  const timers = useRef<number[]>([]);
  /** Temporizador de transição (feedback → próxima): sobrevive à mudança de estágio. */
  const transition = useRef<number | null>(null);
  const pausedAt = useRef<number | null>(null);
  /** RESPONSE_STARTED é emitido no máximo uma vez por tentativa (primeiro gesto). */
  const responseStarted = useRef(false);
  const detailRef = useRef(opts.detail);
  detailRef.current = opts.detail;
  const onStartRef = useRef(opts.onTrialStart);
  onStartRef.current = opts.onTrialStart;

  const trial = trials[i];
  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  const scheduleAdvance = (ms: number) => {
    if (transition.current != null) window.clearTimeout(transition.current);
    transition.current = window.setTimeout(() => {
      transition.current = null;
      advanceRef.current();
    }, ms);
  };
  useEffect(() => () => { if (transition.current != null) window.clearTimeout(transition.current); }, []);

  const finish = useCallback(
    (response: TrialResponse, selected: number | null) => {
      if (!trial || !config) return;
      clear();
      const latency = response === 'no_response' ? null : Math.round(performance.now() - t0.current);
      client.emit('TRIAL_COMPLETED', {
        targetId: trial.target.targetId,
        stimulusId: trial.target.stimulus.stimulusId,
        trialIndex: trial.index,
        presented: trial.options.map((o) => o.stimulusId),
        positionOfTarget: trial.positionOfTarget,
        selected: selected == null ? null : trial.options[selected]!.stimulusId,
        selectedPosition: selected,
        response,
        latencyMs: latency,
        promptLevel: prompt.current.level,
        promptSource: prompt.current.source,
        detail: detailRef.current?.() ?? {},
      });
      setLastOutcome(response);
      setLastSelected(selected);
      if (response === 'correct') {
        client.emit('REWARD_TRIGGERED', { kind: 'visual', contingentOn: trial.target.targetId });
        if (runtime) {
          client.emit('REINFORCER_PRESENTED', {
            kind: 'visual',
            contingentOn: trial.target.targetId,
            intensity: config.adaptation.feedback === 'festive' ? 'festive' : 'subtle',
          });
        }
        setStage('feedback');
        scheduleAdvance(feedbackMs);
      } else {
        // Correção de erro: a dica aparece e a criança completa o pareamento, sem nova pontuação.
        setHint(true);
        setStage('correction');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trial, config, client, feedbackMs, runtime],
  );

  const iRef = useRef(0);
  iRef.current = i;
  // Efeitos colaterais fora do updater de estado (o StrictMode executa updaters duas vezes).
  const advance = useCallback(() => {
    clear();
    setHint(false);
    setLastSelected(null);
    const next = iRef.current + 1;
    iRef.current = next;
    setI(next);
    if (next >= trials.length) {
      setStage('done');
      client.emit('SESSION_COMPLETED', { trialsCompleted: trials.length });
    } else setStage('awaiting');
  }, [trials.length, client]);
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  // Início de cada tentativa.
  useEffect(() => {
    if (!trial || !config || stage !== 'awaiting' || paused || opts.gate === false) return;
    t0.current = performance.now();
    prompt.current = { level: 'IND', source: 'none' };
    responseStarted.current = false;
    const presented = trial.options.map((o) => o.stimulusId);
    client.emit('TRIAL_STARTED', { targetId: trial.target.targetId, trialIndex: trial.index, presented });
    if (runtime) {
      client.emit('STIMULUS_PRESENTED', {
        targetId: trial.target.targetId, trialIndex: trial.index, presented, positionOfTarget: trial.positionOfTarget,
      });
    }
    onStartRef.current?.(trial);
    const builtIn = config.adaptation.builtInPromptAfterMs;
    if (builtIn != null && builtIn < latencyMaxMs) {
      timers.current.push(
        window.setTimeout(() => {
          const level = trial.target.promptHierarchy[1]?.code ?? 'GES';
          if (prompt.current.source === 'none') prompt.current = { level, source: 'built_in' };
          setHint(true);
          client.emit('PROMPT_USED', { targetId: trial.target.targetId, trialIndex: trial.index, level, source: 'built_in', latencyMs: builtIn });
        }, builtIn),
      );
    }
    if (trial.target.scoring === 'auto') {
      timers.current.push(window.setTimeout(() => finish('no_response', null), latencyMaxMs));
    }
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, stage === 'awaiting', config, paused, opts.gate]);

  // Pausa: registra a duração para não contaminar a latência.
  useEffect(() => {
    if (paused) {
      pausedAt.current = performance.now();
      clear();
      client.emit('SESSION_PAUSED', { reason: null });
    } else if (pausedAt.current != null) {
      pausedAt.current = null;
      client.emit('SESSION_RESUMED', {});
    }
  }, [paused, client]);

  // Comandos do profissional.
  useEffect(
    () =>
      client.onCommand((c) => {
        if (!trial) return;
        if (c.kind === 'SET_PROMPT') {
          prompt.current = { level: c.level, source: c.level === 'IND' ? 'none' : 'therapist' };
          if (c.level !== 'IND') {
            client.emit('PROMPT_USED', {
              targetId: trial.target.targetId, trialIndex: trial.index, level: c.level, source: 'therapist',
              latencyMs: Math.round(performance.now() - t0.current),
            });
          }
        }
        if (c.kind === 'SCORE_TRIAL' && stage === 'awaiting') finish(c.response, null);
      }),
    [client, trial, stage, finish],
  );

  /**
   * Primeiro gesto de resposta (ex.: começou a arrastar). Emite RESPONSE_STARTED com a latência
   * uma única vez por tentativa; `select` chama automaticamente se o jogo não chamou antes.
   */
  const markResponseStart = useCallback(
    (position: number | null = null, inputMode: InputMode = 'tap') => {
      if (!runtime || !trial || !config || paused || stage !== 'awaiting' || responseStarted.current) return;
      responseStarted.current = true;
      client.emit('RESPONSE_STARTED', {
        targetId: trial.target.targetId,
        trialIndex: trial.index,
        latencyMs: Math.max(0, Math.round(performance.now() - t0.current)),
        position,
        inputMode,
      });
    },
    [runtime, trial, config, paused, stage, client],
  );

  const select = useCallback(
    (position: number): TrialResponse | 'ignored' => {
      if (!trial || paused) return 'ignored';
      if (stage === 'awaiting' && trial.target.scoring === 'auto') {
        markResponseStart(position);
        const r: TrialResponse = position === trial.positionOfTarget ? 'correct' : 'incorrect';
        finish(r, position);
        return r;
      }
      if (stage === 'correction' && position === trial.positionOfTarget) {
        setLastOutcome('correct');
        setLastSelected(position);
        setStage('feedback');
        scheduleAdvance(feedbackMs);
        return 'correct';
      }
      return 'ignored';
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trial, paused, stage, finish, feedbackMs, markResponseStart],
  );

  const state: TrialRunnerState<T> = { trial, stage, hint, lastOutcome, lastSelected, completed: Math.min(i, trials.length), total: trials.length };
  return { ...state, select, markResponseStart };
}
