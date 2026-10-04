import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { playTones, useGameClient, useMotion } from '@aprumo/game-sdk';
import type { PromptSource } from '@aprumo/protocol';
import { initialTurns, reduceTurns, type TurnEvent, type TurnState, type TurnTrial } from './logic';
import { manifest } from './manifest';
import './game.css';

/** Timbres próprios: "toc" de madeira e "plim" de troca de vez. */
const KNOCK = [{ freq: 196, dur: 0.07, type: 'square' as const }, { freq: 392, dur: 0.05, type: 'triangle' as const, delay: 0.01 }];
const SWITCH = [{ freq: 523, dur: 0.12, type: 'sine' as const }, { freq: 659, dur: 0.18, type: 'sine' as const, delay: 0.1 }];
const TILT = [-1.5, 1, -0.5, 1.5, -1, 0.5];

type Action = TurnEvent | { type: 'RESET'; turns: number; now: number };
interface Wrapped { s: TurnState; last?: { trial?: TurnTrial; interrupted?: boolean; seq: number } }

function reducer(w: Wrapped, a: Action): Wrapped {
  if (a.type === 'RESET') return { s: initialTurns(a.turns, a.now) };
  const r = reduceTurns(w.s, a);
  return { s: r.state, last: { trial: r.trial, interrupted: r.interrupted, seq: (w.last?.seq ?? 0) + 1 } };
}

export default function MinhaVezSuaVez() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);
  const target = config?.clinical.targets[0];
  const turns = config?.clinical.trialsPerTarget ?? 5;
  const [{ s, last }, dispatch] = useReducer(reducer, { s: initialTurns(turns, 0) });
  const [hint, setHint] = useState(false);
  const [waitFlash, setWaitFlash] = useState(0);
  const prompt = useRef<{ level: string; source: PromptSource }>({ level: 'IND', source: 'none' });
  const sound = config?.adaptation.sound ?? 'low';

  useEffect(() => {
    if (!config) return;
    dispatch({ type: 'RESET', turns: config.clinical.trialsPerTarget, now: performance.now() });
    client.emit('SESSION_STARTED', { configVersion: manifest.version });
  }, [config, client]);

  // Início da vez da criança: TRIAL_STARTED, dica embutida e tempo-limite.
  useEffect(() => {
    if (!config || !target || s.whose !== 'child' || s.done || paused || s.scored) return;
    prompt.current = { level: 'IND', source: 'none' };
    setHint(false);
    client.emit('TRIAL_STARTED', { targetId: target.targetId, trialIndex: s.childTurnsScored, presented: [] });
    const timers: number[] = [];
    const builtIn = config.adaptation.builtInPromptAfterMs;
    if (builtIn != null && builtIn < manifest.clinical.latencyMaxMs) {
      timers.push(window.setTimeout(() => {
        const level = target.promptHierarchy[1]?.code ?? 'GES';
        if (prompt.current.source === 'none') prompt.current = { level, source: 'built_in' };
        setHint(true);
        client.emit('PROMPT_USED', { targetId: target.targetId, trialIndex: s.childTurnsScored, level, source: 'built_in', latencyMs: builtIn });
      }, builtIn));
    }
    timers.push(window.setTimeout(() => dispatch({ type: 'CHILD_TIMEOUT', now: performance.now() }), manifest.clinical.latencyMaxMs));
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.whose, s.childTurnsScored, s.done, s.scored, paused, config]);

  // Emissão das tentativas produzidas pelo redutor (fora do reducer: efeito colateral).
  useEffect(() => {
    if (!last || !target) return;
    if (last.interrupted) setWaitFlash((n) => n + 1);
    if (last.trial) {
      const t = last.trial;
      client.emit('TRIAL_COMPLETED', {
        targetId: target.targetId, stimulusId: target.stimulus.stimulusId, trialIndex: t.trialIndex,
        presented: [], positionOfTarget: null, selected: null, selectedPosition: null,
        response: t.response, latencyMs: t.latencyMs == null ? null : Math.round(t.latencyMs),
        promptLevel: prompt.current.level, promptSource: prompt.current.source,
        detail: { interruptions: t.interruptions, partnerTurnMs: Math.round(t.waitMs) },
      });
      if (t.response === 'correct') client.emit('REWARD_TRIGGERED', { kind: 'visual', contingentOn: target.targetId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [last?.seq]);

  useEffect(() => {
    if (s.done && config) client.emit('SESSION_COMPLETED', { trialsCompleted: s.childTurnsScored });
  }, [s.done, client, config, s.childTurnsScored]);

  useEffect(() => {
    if (s.tower.length) playTones(KNOCK, sound);
    if (s.tower.length && !s.done) window.setTimeout(() => playTones(SWITCH, sound), 380);
  }, [s.tower.length, s.done, sound]);

  useEffect(
    () =>
      client.onCommand((c) => {
        if (c.kind === 'SET_PROMPT' && target) {
          prompt.current = { level: c.level, source: c.level === 'IND' ? 'none' : 'therapist' };
          if (c.level !== 'IND') client.emit('PROMPT_USED', { targetId: target.targetId, trialIndex: s.childTurnsScored, level: c.level, source: 'therapist', latencyMs: Math.round(performance.now() - s.turnStartedAt) });
        }
      }),
    [client, target, s.childTurnsScored, s.turnStartedAt],
  );

  const blockH = useMemo(() => {
    const total = turns * 2;
    return Math.max(18, Math.min(56, Math.floor((window.innerHeight * 0.55) / total)));
  }, [turns]);

  if (!config || !target) return <div className="mv" aria-busy="true" />;
  const childName = config.childDisplayName;
  const act = (e: TurnEvent['type']) => {
    if (paused || s.done) return;
    dispatch({ type: e, now: performance.now() } as TurnEvent);
  };

  return (
    <div className="mv" data-whose={s.whose} data-palette={config.adaptation.palette} data-motion={motion} style={{ ['--mv-block-h' as string]: `${blockH}px`, ['--mv-scale' as string]: config.adaptation.touchScale }}>
      <div className="mv-rail" aria-live="polite">
        <div className="mv-baton">
          <span className="mv-baton__ribbon" aria-hidden="true" />
          {s.done ? 'Pronto!' : s.whose === 'child' ? `Vez: ${childName}` : 'Vez: parceiro'}
        </div>
      </div>

      {/* Lado da criança */}
      <div className="mv-side mv-side--child" data-active={s.whose === 'child' && !s.done}>
        <div className="mv-who"><Figure color="var(--mv-child)" small />{childName}</div>
        <button className="mv-basket" data-hint={hint && s.whose === 'child'} aria-label={`Cesta de ${childName}: colocar um bloco`} onClick={() => act('CHILD_TOUCH')} style={{ ['--mv-c' as string]: 'var(--mv-child)' }}>
          {Array.from({ length: Math.max(0, turns - s.tower.filter((x) => x === 'child').length) }).slice(0, 6).map((_, k) => <i key={k} />)}
          {waitFlash > 0 && s.whose === 'partner' && (
            <span className="mv-wait" key={waitFlash} aria-hidden="true">
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

      {/* Lado do parceiro (adulto ou par) */}
      <div className="mv-side mv-side--partner" data-active={s.whose === 'partner' && !s.done}>
        <div className="mv-who"><Figure color="var(--mv-partner)" />Parceiro</div>
        <button className="mv-basket" aria-label="Cesta do parceiro: colocar um bloco" onClick={() => act('PARTNER_PLACE')} style={{ ['--mv-c' as string]: 'var(--mv-partner)' }}>
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

/** Figuras neutras (sem rosto detalhado, sem gênero) para "criança" e "parceiro". */
function Figure({ color, small }: { color: string; small?: boolean }) {
  return (
    <svg viewBox="0 0 60 70" aria-hidden="true">
      <circle cx="30" cy={small ? 20 : 16} r={small ? 12 : 13} fill={color} />
      <path d={small ? 'M12 66c0-14 8-24 18-24s18 10 18 24z' : 'M8 66c0-17 10-30 22-30s22 13 22 30z'} fill={color} opacity="0.85" />
    </svg>
  );
}
