/**
 * Ambiente da criança. Sempre aberto por um adulto, a partir de uma sessão.
 * Não há catálogo navegável, ranking, loja nem notificações.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import { attachGameHost, playTones, type GameHost } from '@aprumo/game-sdk';
import type { EventEnvelope, TrialCompletedPayload } from '@aprumo/protocol';
import { TokenBoard, type TokenTheme } from '@aprumo/resource-quadro-de-fichas';
import { VisualSchedule, type PictoKey } from '@aprumo/resource-agenda-visual';
import { actions, db, getState, useStore } from '../../data/store';
import './child.css';
import { HoldRing, useHoldPress } from './useHoldPress';

/** Retrato (celular ou tablet na vertical): o quadro de fichas desce para baixo da atividade. */
function usePortrait() {
  const [portrait, setPortrait] = useState(() => window.matchMedia('(orientation: portrait)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    const on = () => setPortrait(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return portrait;
}

export default function ChildShell() {
  const { sessionId = '' } = useParams();
  const nav = useNavigate();
  const run = useStore((s) => (s.activeRun?.sessionId === sessionId ? s.activeRun : null));
  const frame = useRef<HTMLIFrameElement>(null);
  const host = useRef<GameHost | null>(null);
  const [adultOpen, setAdultOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [prompt, setPrompt] = useState('IND');
  const [earned, setEarned] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [trials, setTrials] = useState({ n: 0, ind: 0 });
  const [activityDone, setActivityDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const hold = useHoldPress(() => setAdultOpen(true));
  const portrait = usePortrait();

  const goBack = useCallback(() => {
    host.current?.send({ kind: 'END', reason: 'adult' });
    const targetId = getState().activeRun?.config.clinical.targets[0]?.targetId;
    actions.endRun();
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    nav(`/app/sessao/${sessionId}${targetId ? `?alvo=${encodeURIComponent(targetId)}` : ''}`);
  }, [nav, sessionId]);

  // Conecta o hospedeiro ao iframe: valida origem, persiste na outbox e só então confirma.
  useEffect(() => {
    if (!run || !frame.current) return;
    const tokenOnIndependent = run.tokenBoard?.autoOnIndependent;
    host.current = attachGameHost({
      frame: frame.current,
      expectedOrigin: window.location.origin,
      config: run.config,
      quarantine: (raw, reason) => console.warn('[quarentena]', reason, raw),
      persist: async (ev: EventEnvelope) => {
        if (ev.type === 'TRIAL_COMPLETED') {
          const p = ev.payload as TrialCompletedPayload;
          const target = getState().targets.find((t) => t.id === p.targetId);
          const h = target ? db.hierarchy(db.programOf(target).promptHierarchyId) : null;
          const level = h?.levels.find((l) => l.code === p.promptLevel);
          await actions.recordTrial(
            {
              targetId: p.targetId, sessionId, phase: target?.phase ?? 'acquisition', response: p.response,
              promptIntrusiveness: p.promptLevel === 'IND' ? 0 : level?.intrusiveness ?? 0.25, promptCode: p.promptLevel,
              latencyMs: p.latencyMs, channel: 'digital', positionOfTarget: p.positionOfTarget, selectedPosition: p.selectedPosition,
              fieldSize: p.presented.length || null, probe: false, art: target?.art,
            },
            ev.eventId,
          );
        } else {
          await actions.recordDigitalEvent(sessionId, { eventId: ev.eventId, type: ev.type });
        }
      },
      onEvent: (ev) => {
        if (ev.type === 'TRIAL_COMPLETED') {
          const p = ev.payload as TrialCompletedPayload;
          const independent = p.response === 'correct' && p.promptLevel === 'IND';
          setTrials((t) => ({ n: t.n + 1, ind: t.ind + (independent ? 1 : 0) }));
          setPrompt('IND');
          // Contingência configurada: ficha a cada resposta correta independente.
          if (independent && tokenOnIndependent) deliverToken();
        }
        if (ev.type === 'SESSION_COMPLETED') {
          setActivityDone(true);
          setStepIndex((i) => Math.max(i, 1));
          playTones([
            { freq: 440, dur: 0.12, type: 'sine' },
            { freq: 554.37, dur: 0.12, delay: 0.08, type: 'sine' },
            { freq: 659.25, dur: 0.25, delay: 0.16, type: 'sine' },
          ], run?.config.adaptation.sound === 'off' ? 'off' : 'normal');
        }
      },
    });
    return () => host.current?.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run?.config.runId]);

  // Tempo de tela: soma no medidor diário e encerra o bloco no limite da faixa etária.
  useEffect(() => {
    if (!run || paused) return;
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [run, paused]);
  useEffect(() => {
    if (elapsed > 0 && elapsed % 15 === 0) actions.addScreenTime(sessionId, 15);
  }, [elapsed, sessionId]);
  const limitSec = (run?.maxBlockMinutes ?? 10) * 60;
  const overBlock = elapsed >= limitSec;
  useEffect(() => {
    if (overBlock) host.current?.send({ kind: 'PAUSE' });
  }, [overBlock]);

  // Ficha nunca é retirada: só existe entrega. Efeito colateral fora do updater (StrictMode).
  const earnedRef = useRef(0);
  earnedRef.current = earned;
  const deliverToken = useCallback(() => {
    if (!run?.tokenBoard || earnedRef.current >= run.tokenBoard.required) return;
    earnedRef.current += 1;
    setEarned(earnedRef.current);
    void actions.recordToken(sessionId);
    playTones([
      { freq: 587.33, dur: 0.08, type: 'sine' },
      { freq: 880, dur: 0.15, delay: 0.06, type: 'sine' },
    ], run?.config.adaptation.sound === 'off' ? 'off' : 'normal');
  }, [run, sessionId]);

  if (!run) {
    return (
      <div className="kid" style={{ placeItems: 'center', display: 'grid' }}>
        <div style={{ textAlign: 'center', fontFamily: 'system-ui' }}>
          <p>Nenhuma atividade aberta para esta sessão.</p>
          <button className="ap-btn" onClick={() => nav(`/app/sessao/${sessionId}`)}>Voltar ao registro</button>
        </div>
      </div>
    );
  }

  const a = run.config.adaptation;
  const motion = a.motion;
  const send = (m: Parameters<GameHost['send']>[0]) => host.current?.send(m);
  const hierarchy = run.config.clinical.targets[0]?.promptHierarchy ?? [];
  const therapistScoring = run.config.clinical.targets.some((t) => t.scoring === 'therapist');

  return (
    <div className="kid" data-palette={a.palette}>
      <div className="kid-top">
        <VisualSchedule
          items={run.schedule.map((s) => ({ id: s.id, picto: s.picto as PictoKey, label: s.label }))}
          current={stepIndex}
          warning={!overBlock && limitSec - elapsed <= 60}
          motion={motion}
          palette={a.palette}
        />
      </div>

      <div className="kid-stage">
        <button
          className="kid-corner"
          type="button"
          aria-label="Controles do adulto: mantenha pressionado por 1,2 segundo (ou segure Enter/Espaço)"
          data-holding={hold.holding}
          {...hold.bind}
        >
          <HoldRing holding={hold.holding} ms={hold.ms} size={40} color="rgb(0 0 0 / .55)" className="kid-corner__ring" />
        </button>
        <iframe
          ref={frame}
          title="Atividade"
          src={`/game.html?app=${encodeURIComponent(run.appId)}`}
          allow="autoplay"
          referrerPolicy="no-referrer"
        />
        {overBlock && (
          <div className="kid-limit" role="status">
            <div>
              <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" fill="#fff" stroke="#3f6b67" strokeWidth="6" /><path d="M50 26v26l16 10" stroke="#3f6b67" strokeWidth="7" strokeLinecap="round" fill="none" /></svg>
              <p style={{ fontSize: 28 }}>Hora de descansar a tela</p>
            </div>
          </div>
        )}
      </div>

      {run.tokenBoard && (
        <div className="kid-rail">
          <TokenBoard
            theme={run.tokenBoard.theme as TokenTheme}
            required={run.tokenBoard.required}
            earned={earned}
            reward={{ label: run.tokenBoard.rewardLabel, category: run.tokenBoard.rewardCategory }}
            accessSec={run.tokenBoard.accessSec}
            motion={motion}
            palette={a.palette}
            layout={portrait ? 'full' : 'rail'}
            onExchangeStart={() => { send({ kind: 'PAUSE' }); setStepIndex((i) => Math.max(i, 1)); }}
            onExchangeEnd={() => { setEarned(0); setStepIndex(activityDone ? 2 : 0); if (!paused) send({ kind: 'RESUME' }); }}
          />
        </div>
      )}

      {adultOpen && (
        <>
          <button type="button" className="adult-scrim" aria-label="Fechar controles do adulto" onClick={() => setAdultOpen(false)} />
          <aside className="adult" aria-label="Controles do adulto">
            <h2>Controles do adulto</h2>
            <p className="adult-stat">
              {trials.n} tentativa(s) · {trials.n ? Math.round((trials.ind / trials.n) * 100) : 0}% independentes · tela {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')} de {run.maxBlockMinutes}:00
            </p>
            <div>
              <h3 className="adult-stat" style={{ fontWeight: 700, marginBottom: 6 }}>Dica na tentativa atual</h3>
              <div className="adult-prompts">
                {hierarchy.map((l) => (
                  <button key={l.code} aria-pressed={prompt === l.code} title={l.label} onClick={() => { setPrompt(l.code); send({ kind: 'SET_PROMPT', level: l.code }); }}>{l.code}</button>
                ))}
              </div>
            </div>
            {therapistScoring && (
              <div className="adult-row">
                <button className="ap-btn ap-btn--primary" onClick={() => send({ kind: 'SCORE_TRIAL', response: 'correct' })}>Correta</button>
                <button className="ap-btn" onClick={() => send({ kind: 'SCORE_TRIAL', response: 'incorrect' })}>Incorreta</button>
                <button className="ap-btn" onClick={() => send({ kind: 'SCORE_TRIAL', response: 'no_response' })}>Sem resposta</button>
              </div>
            )}
            {run.tokenBoard && <button className="ap-btn" onClick={deliverToken}>Entregar ficha ({earned}/{run.tokenBoard.required})</button>}
            <div className="adult-row">
              <button className="ap-btn" onClick={() => { const p = !paused; setPaused(p); send({ kind: p ? 'PAUSE' : 'RESUME' }); }}>{paused ? 'Retomar' : 'Pausar'}</button>
              <button className="ap-btn ap-btn--primary" onClick={goBack}>Voltar ao registro</button>
            </div>
            <button className="ap-btn ap-btn--ghost" onClick={() => setAdultOpen(false)}>Fechar painel</button>
          </aside>
        </>
      )}
    </div>
  );
}
