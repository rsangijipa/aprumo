/**
 * Motor de tentativas da Missão Instrução. Igual ao trialRunner do SDK no que é dado (latência,
 * dica embutida, dica/pontuação do profissional, sem resposta, correção de erro sem nova pontuação,
 * pausa sem contaminar a latência), mas a resposta é uma SEQUÊNCIA de etapas (toque / item → lugar).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameClient } from '@aprumo/game-sdk';
import type { PromptSource, SessionConfig, TrialResponse } from '@aprumo/protocol';
import { applyTap, initialProgress, missionDetail, scoreMission, type MissionTrial, type Progress, type Tap } from './logic';

export type Stage = 'awaiting' | 'feedback' | 'correction' | 'done';

export function useMission(opts: {
  client: GameClient;
  config: SessionConfig | null;
  trials: MissionTrial[];
  paused: boolean;
  /** Enquanto false (instrução falada), a tentativa não começa; a latência conta a partir daqui. */
  gate: boolean;
  /** Tempo-limite por etapa. */
  latencyPerStepMs: number;
  feedbackMs: number;
  repeats: () => number;
}) {
  const { client, config, trials, paused, gate, latencyPerStepMs, feedbackMs } = opts;
  const [i, setI] = useState(0);
  const [stage, setStage] = useState<Stage>('awaiting');
  const [hint, setHint] = useState(false);
  const [progress, setProgress] = useState<Progress>(() => initialProgress(0));
  const trial = trials[i];

  const t0 = useRef(0);
  const started = useRef(-1);
  const responded = useRef(false);
  const prompt = useRef<{ level: string; source: PromptSource }>({ level: 'IND', source: 'none' });
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const repeatsRef = useRef(opts.repeats);
  repeatsRef.current = opts.repeats;
  const correct = useRef(0);
  const timers = useRef<number[]>([]);
  const advanceTimer = useRef<number | null>(null);
  const pausedAt = useRef<number | null>(null);
  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => () => { if (advanceTimer.current != null) window.clearTimeout(advanceTimer.current); }, []);

  const advance = useCallback(() => {
    clear();
    setHint(false);
    const next = i + 1;
    setI(next);
    setProgress(initialProgress(performance.now()));
    if (next >= trials.length) {
      setStage('done');
      const lvl = trials[0]?.level ?? 1;
      client.levelCompleted({ levelId: `nivel-${lvl}`, levelIndex: lvl - 1, trialsCompleted: trials.length, correct: correct.current, outcome: 'completed' });
      client.gameCompleted(trials.length);
    } else setStage('awaiting');
  }, [i, trials, client]);
  const advanceRef = useRef(advance);
  advanceRef.current = advance;
  const scheduleAdvance = () => {
    if (advanceTimer.current != null) window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      advanceTimer.current = null;
      advanceRef.current();
    }, feedbackMs);
  };

  const finish = useCallback(
    (forced: TrialResponse | null, p: Progress) => {
      if (!trial || !config) return;
      clear();
      const score = scoreMission(trial, p.results);
      const response: TrialResponse = forced ?? score.response;
      client.responseRecorded({
        targetId: trial.target.targetId,
        stimulusId: trial.items[trial.positionOfTarget]!.id,
        trialIndex: trial.index,
        presented: trial.items.map((it) => it.id),
        positionOfTarget: trial.positionOfTarget,
        selected: forced ? null : score.selected,
        selectedPosition: forced ? null : score.selectedPosition,
        response,
        latencyMs: response === 'no_response' ? null : Math.max(0, Math.round(performance.now() - t0.current)),
        promptLevel: prompt.current.level,
        promptSource: prompt.current.source,
        detail: missionDetail(trial, p.results, repeatsRef.current()),
      });
      if (response === 'correct') {
        correct.current += 1;
        client.emit('REWARD_TRIGGERED', { kind: 'visual', contingentOn: trial.target.targetId });
        client.reinforcerPresented({ kind: 'visual', contingentOn: trial.target.targetId, intensity: config.adaptation.feedback === 'festive' ? 'festive' : 'subtle' });
        setStage('feedback');
        scheduleAdvance();
      } else {
        // Correção de erro: tabuleiro volta ao início, a luz guia cada etapa; não há nova pontuação.
        setProgress(initialProgress(performance.now()));
        setHint(true);
        setStage('correction');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trial, config, client, feedbackMs],
  );
  const finishRef = useRef(finish);
  finishRef.current = finish;

  // Início (e retomada) da tentativa.
  useEffect(() => {
    if (!trial || !config || stage !== 'awaiting' || paused || !gate) return;
    if (started.current !== i) {
      started.current = i;
      const now = performance.now();
      t0.current = now;
      responded.current = false;
      prompt.current = { level: 'IND', source: 'none' };
      setProgress(initialProgress(now));
      const presented = trial.items.map((it) => it.id);
      client.trialStarted({ targetId: trial.target.targetId, trialIndex: trial.index, presented });
      client.stimulusPresented({ targetId: trial.target.targetId, trialIndex: trial.index, presented, positionOfTarget: trial.positionOfTarget });
    }
    const elapsed = performance.now() - t0.current;
    const builtIn = config.adaptation.builtInPromptAfterMs;
    const limit = latencyPerStepMs * trial.steps.length;
    if (builtIn != null && builtIn < limit && prompt.current.source === 'none') {
      timers.current.push(window.setTimeout(() => {
        const level = trial.target.promptHierarchy[1]?.code ?? 'GES';
        if (prompt.current.source === 'none') prompt.current = { level, source: 'built_in' };
        setHint(true);
        client.promptPresented({ targetId: trial.target.targetId, trialIndex: trial.index, level, source: 'built_in', latencyMs: builtIn });
      }, Math.max(0, builtIn - elapsed)));
    }
    if (trial.target.scoring === 'auto') {
      timers.current.push(window.setTimeout(() => finishRef.current('no_response', progressRef.current), Math.max(0, limit - elapsed)));
    }
    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, stage, config, paused, gate]);

  // Pausa: o tempo pausado não entra na latência (total nem por etapa).
  useEffect(() => {
    if (paused) {
      pausedAt.current = performance.now();
      clear();
      client.paused();
    } else if (pausedAt.current != null) {
      const d = performance.now() - pausedAt.current;
      pausedAt.current = null;
      t0.current += d;
      setProgress((p) => ({ ...p, lastAt: p.lastAt + d }));
      client.resumed();
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
            setHint(true);
            client.promptPresented({ targetId: trial.target.targetId, trialIndex: trial.index, level: c.level, source: 'therapist', latencyMs: Math.max(0, Math.round(performance.now() - t0.current)) });
          }
        }
        if (c.kind === 'SCORE_TRIAL' && stage === 'awaiting') finish(c.response, progressRef.current);
      }),
    [client, trial, stage, finish],
  );

  /** Primeiro gesto de resposta da tentativa (RESPONSE_STARTED, uma vez). */
  const markResponseStart = useCallback(
    (position: number | null) => {
      if (!trial || paused || stage !== 'awaiting' || responded.current || started.current !== i) return;
      responded.current = true;
      client.responseStarted({ targetId: trial.target.targetId, trialIndex: trial.index, latencyMs: Math.max(0, Math.round(performance.now() - t0.current)), position, inputMode: 'tap' });
    },
    [trial, paused, stage, client, i],
  );

  /** Toque da criança. Retorna se foi aceito (para o retorno sonoro/visual suave). */
  const tap = useCallback(
    (t: Tap): boolean => {
      if (!trial || paused || !gate || (stage !== 'awaiting' && stage !== 'correction')) return false;
      if (stage === 'awaiting') markResponseStart(t.type === 'item' ? t.index : null);
      const r = applyTap(trial, progressRef.current, t, performance.now(), stage === 'correction');
      if (!r.accepted) return false;
      progressRef.current = r.progress;
      setProgress(r.progress);
      if (r.progress.done) {
        if (stage === 'awaiting' && trial.target.scoring === 'auto') finish(null, r.progress);
        else if (stage === 'correction') {
          setStage('feedback');
          scheduleAdvance();
        }
      }
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trial, paused, gate, stage, markResponseStart, finish],
  );

  return { trial, stage, hint, progress, tap, completed: Math.min(i, trials.length), total: trials.length };
}
