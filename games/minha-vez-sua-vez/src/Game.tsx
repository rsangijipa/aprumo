import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { installAudioUnlock, playCue, playTones, useGameClient, useMotion } from '@aprumo/game-sdk';
import type { PromptSource } from '@aprumo/protocol';
import {
  initialTurns, partnerKindFrom, reduceTurns, remainingMs, turnDetail, turnLabel,
  type PartnerKind, type TurnEvent, type TurnState, type TurnTrial,
} from './logic';
import { manifest } from './manifest';
import './game.css';

/** Timbre próprio: "toc" de madeira macio. A troca de vez usa o cue neutro de transição do SDK. */
const KNOCK = [{ freq: 196, dur: 0.07, type: 'triangle' as const }, { freq: 392, dur: 0.05, type: 'triangle' as const, delay: 0.01 }];
const TILT = [-1.5, 1, -0.5, 1.5, -1, 0.5];
const PARTNER_NAME: Record<PartnerKind, string> = { adulto: 'Adulto', colega: 'Colega' };

type Action = TurnEvent | { type: 'RESET'; turns: number; now: number };
interface Wrapped { s: TurnState; last?: { trial?: TurnTrial; offTurn?: boolean; seq: number } }

function reducer(w: Wrapped, a: Action): Wrapped {
  if (a.type === 'RESET') return { s: initialTurns(a.turns, a.now) };
  const r = reduceTurns(w.s, a);
  return { s: r.state, last: { trial: r.trial, offTurn: r.offTurn, seq: (w.last?.seq ?? 0) + 1 } };
}

export default function MinhaVezSuaVez() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);
  const target = config?.clinical.targets[0];
  const turns = config?.clinical.trialsPerTarget ?? 5;
  const partner = partnerKindFrom(config?.params ?? {});
  const [{ s, last }, dispatch] = useReducer(reducer, { s: initialTurns(turns, 0) });
  const [hint, setHint] = useState(false);
  const [softSignal, setSoftSignal] = useState(0);
  const prompt = useRef<{ level: string; source: PromptSource }>({ level: 'IND', source: 'none' });
  const responded = useRef(false);
  const correct = useRef(0);
  const pausedAt = useRef<number | null>(null);
  const sound = config?.adaptation.sound ?? 'low';

  useEffect(() => installAudioUnlock(), []);

  useEffect(() => {
    if (!config) return;
    dispatch({ type: 'RESET', turns: config.clinical.trialsPerTarget, now: performance.now() });
    correct.current = 0;
    client.gameStarted(manifest.version);
    client.levelStarted({ levelId: `torre-${partnerKindFrom(config.params)}`, levelIndex: 0, fieldSize: 1, trialsPlanned: config.clinical.trialsPerTarget, difficulty: partnerKindFrom(config.params) });
  }, [config, client]);

  // Pausa: o tempo pausado não conta como espera nem como latência.
  useEffect(() => {
    if (!config) return;
    if (paused) {
      pausedAt.current = performance.now();
      client.paused();
    } else if (pausedAt.current != null) {
      dispatch({ type: 'RESUME', pausedMs: performance.now() - pausedAt.current });
      pausedAt.current = null;
      client.resumed();
    }
  }, [paused, client, config]);

  // Início da vez da criança: TRIAL_STARTED + STIMULUS_PRESENTED (uma vez), dica embutida e tempo-limite.
  const startedTurn = useRef(-1);
  useEffect(() => {
    if (!config || !target || s.whose !== 'child' || s.done || paused || s.scored) return;
    if (startedTurn.current !== s.childTurnsScored) {
      startedTurn.current = s.childTurnsScored;
      prompt.current = { level: 'IND', source: 'none' };
      responded.current = false;
      setHint(false);
      client.trialStarted({ targetId: target.targetId, trialIndex: s.childTurnsScored, presented: [] });
      client.stimulusPresented({ targetId: target.targetId, trialIndex: s.childTurnsScored, presented: [], positionOfTarget: null });
    }
    const timers: number[] = [];
    const now = performance.now();
    const builtIn = config.adaptation.builtInPromptAfterMs;
    if (builtIn != null && builtIn < manifest.clinical.latencyMaxMs && prompt.current.source === 'none') {
      timers.push(window.setTimeout(() => {
        const level = target.promptHierarchy[1]?.code ?? 'GES';
        if (prompt.current.source === 'none') prompt.current = { level, source: 'built_in' };
        setHint(true);
        client.promptPresented({ targetId: target.targetId, trialIndex: s.childTurnsScored, level, source: 'built_in', latencyMs: builtIn });
      }, remainingMs(builtIn, s, now)));
    }
    timers.push(window.setTimeout(() => dispatch({ type: 'CHILD_TIMEOUT', now: performance.now() }), remainingMs(manifest.clinical.latencyMaxMs, s, now)));
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.whose, s.childTurnsScored, s.done, s.scored, s.turnStartedAt, paused, config]);

  // Emissão das tentativas produzidas pelo redutor (fora do reducer: efeito colateral).
  useEffect(() => {
    if (!last || !target || !config) return;
    if (last.offTurn) setSoftSignal((n) => n + 1);
    if (last.trial) {
      const t = last.trial;
      client.responseRecorded({
        targetId: target.targetId, stimulusId: target.stimulus.stimulusId, trialIndex: t.trialIndex,
        presented: [], positionOfTarget: null, selected: null, selectedPosition: null,
        response: t.response, latencyMs: t.latencyMs == null ? null : Math.max(0, Math.round(t.latencyMs)),
        promptLevel: prompt.current.level, promptSource: prompt.current.source,
        detail: turnDetail(t, partner),
      });
      if (t.response === 'correct') {
        correct.current += 1;
        client.emit('REWARD_TRIGGERED', { kind: 'visual', contingentOn: target.targetId });
        client.reinforcerPresented({ kind: 'social', contingentOn: target.targetId, intensity: config.adaptation.feedback === 'festive' ? 'festive' : 'subtle' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [last?.seq]);

  useEffect(() => {
    if (!s.done || !config) return;
    client.levelCompleted({ levelId: `torre-${partner}`, levelIndex: 0, trialsCompleted: s.childTurnsScored, correct: correct.current, outcome: 'completed' });
    client.gameCompleted(s.childTurnsScored);
    if (config.adaptation.feedback !== 'none') playCue('complete', sound);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.done]);

  useEffect(() => {
    if (!s.tower.length) return;
    playTones(KNOCK, sound);
    if (s.done) return;
    const t = window.setTimeout(() => playCue('transition', sound), 380);
    return () => window.clearTimeout(t);
  }, [s.tower.length, s.done, sound]);

  useEffect(
    () =>
      client.onCommand((c) => {
        if (c.kind === 'SET_PROMPT' && target) {
          prompt.current = { level: c.level, source: c.level === 'IND' ? 'none' : 'therapist' };
          if (c.level !== 'IND') client.promptPresented({ targetId: target.targetId, trialIndex: s.childTurnsScored, level: c.level, source: 'therapist', latencyMs: Math.max(0, Math.round(performance.now() - s.turnStartedAt)) });
        }
      }),
    [client, target, s.childTurnsScored, s.turnStartedAt],
  );

  const blockH = useMemo(() => {
    const total = turns * 2;
    return Math.max(18, Math.min(56, Math.floor((window.innerHeight * 0.5) / total)));
  }, [turns]);

  if (!config || !target) return <div className="mv" aria-busy="true" />;
  const childName = config.childDisplayName;
  const partnerName = PARTNER_NAME[partner];
  const label = turnLabel(s);

  const onChild = () => {
    if (paused || s.done) return;
    const now = performance.now();
    if (s.whose === 'child' && !s.scored && !responded.current) {
      responded.current = true;
      client.responseStarted({ targetId: target.targetId, trialIndex: s.childTurnsScored, latencyMs: Math.max(0, Math.round(now - s.turnStartedAt)), position: null, inputMode: 'tap' });
    }
    dispatch({ type: 'CHILD_TOUCH', now });
  };
  const onPartner = () => {
    if (paused || s.done) return;
    dispatch({ type: 'PARTNER_PLACE', now: performance.now() });
  };

  return (
    <div
      className="mv"
      data-whose={s.whose}
      data-done={s.done}
      data-partner={partner}
      data-palette={config.adaptation.palette}
      data-motion={motion}
      style={{ ['--mv-block-h' as string]: `${blockH}px`, ['--mv-scale' as string]: config.adaptation.touchScale }}
    >
      <div className="mv-rail">
        <div className="mv-baton" role="status" aria-live="polite" aria-label={s.done ? 'Pronto!' : s.whose === 'child' ? `Minha vez: ${childName}` : `Sua vez: ${partnerName}`}>
          <span className="mv-baton__avatar" aria-hidden="true">
            {s.whose === 'child' || s.done ? <Figure kind="crianca" /> : <Figure kind={partner} />}
          </span>
          <span className="mv-baton__text">
            <strong>{label}</strong>
            {!s.done && <small>{s.whose === 'child' ? childName : partnerName}</small>}
          </span>
        </div>
      </div>

      {/* Lado da criança */}
      <div className="mv-side mv-side--child" data-active={s.whose === 'child' && !s.done}>
        <div className="mv-who"><Figure kind="crianca" />{childName}</div>
        <button className="mv-basket" data-hint={hint && s.whose === 'child'} aria-label={`Cesta de ${childName}: colocar um bloco`} onClick={onChild} style={{ ['--mv-c' as string]: 'var(--mv-child)' }}>
          {Array.from({ length: Math.max(0, turns - s.tower.filter((x) => x === 'child').length) }).slice(0, 6).map((_, k) => <i key={k} />)}
          {softSignal > 0 && s.whose === 'partner' && (
            // Sinal suave de "espera" (mão aberta + ampulheta do parceiro), sem som e sem punição.
            <span className="mv-wait" key={softSignal} aria-hidden="true">
              <svg viewBox="0 0 64 64"><path d="M20 34V16a4 4 0 0 1 8 0v14V10a4 4 0 0 1 8 0v20V14a4 4 0 0 1 8 0v20-8a4 4 0 0 1 8 0v14c0 10-8 18-18 18h-2c-8 0-13-4-17-10l-8-12a4 4 0 0 1 6-5z" fill="var(--mv-ink)" /></svg>
            </span>
          )}
        </button>
      </div>

      {/* Torre */}
      <div className="mv-center">
        <div className="mv-tower" aria-label={`Torre com ${s.tower.length} blocos`} role="img">
          {s.tower.map((w, k) => <div key={k} className="mv-block" data-who={w} style={{ ['--i' as string]: k % 6, ['--r' as string]: `${TILT[k % TILT.length]}deg` }} />)}
          {s.done && (
            <svg className="mv-flag" width="44" height="54" viewBox="0 0 44 54" aria-hidden="true"><path d="M8 4v50" stroke="var(--mv-ink)" strokeWidth="4" strokeLinecap="round" /><path d="M10 6h28l-7 9 7 9H10z" fill="var(--mv-glow)" /></svg>
          )}
        </div>
        <div className="mv-plate" />
      </div>

      {/* Lado do parceiro (adulto ou colega) */}
      <div className="mv-side mv-side--partner" data-active={s.whose === 'partner' && !s.done}>
        <div className="mv-who"><Figure kind={partner} />{partnerName}</div>
        <button className="mv-basket" aria-label={`Cesta de ${partnerName}: colocar um bloco`} onClick={onPartner} style={{ ['--mv-c' as string]: 'var(--mv-partner)' }}>
          {Array.from({ length: Math.max(0, turns - s.tower.filter((x) => x === 'partner').length) }).slice(0, 6).map((_, k) => <i key={k} />)}
        </button>
      </div>

      {(paused || ended) && !s.done && (
        <div className="mv-overlay" role="status"><div>
          <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="rgb(255 255 255 / .2)" /><rect x="33" y="28" width="11" height="44" rx="4" fill="#fff" /><rect x="56" y="28" width="11" height="44" rx="4" fill="#fff" /></svg>
          <span>Pausa</span>
        </div></div>
      )}
    </div>
  );
}

/** Figuras neutras (sem rosto detalhado, sem gênero): criança, adulto (mais alto) e colega (do tamanho da criança). */
function Figure({ kind }: { kind: 'crianca' | PartnerKind }) {
  const color = kind === 'crianca' ? 'var(--mv-child)' : 'var(--mv-partner)';
  if (kind === 'adulto') {
    return (
      <svg viewBox="0 0 60 70" aria-hidden="true">
        <circle cx="30" cy="14" r="11" fill={color} />
        <path d="M8 68c0-20 10-40 22-40s22 20 22 40z" fill={color} opacity="0.85" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 60 70" aria-hidden="true">
      <circle cx="30" cy="24" r="13" fill={color} />
      <path d="M12 68c0-14 8-26 18-26s18 12 18 26z" fill={color} opacity="0.85" />
      {kind === 'colega' && <circle cx="44" cy="14" r="5" fill={color} opacity="0.7" />}
    </svg>
  );
}
