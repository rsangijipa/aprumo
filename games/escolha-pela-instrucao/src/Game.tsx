import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { installAudioUnlock, playCue, playTones, speak, useGameClient, useMotion } from '@aprumo/game-sdk';
import { StimulusArt } from '@aprumo/stimuli';
import { RELATIONS, RELATION_PHRASE, hintFocus, levelFrom, missionField, planMission, type MissionItem, type Toy } from './logic';
import { manifest } from './manifest';
import { useMission } from './useMission';
import './game.css';

/** Timbre próprio: "sininho" de palco. */
const BELL = [{ freq: 784, dur: 0.35, type: 'sine' as const }, { freq: 1175, dur: 0.45, type: 'sine' as const, delay: 0.12 }];
const TOY_FILL: Record<Toy['color'], string> = { vermelho: '#d9534f', azul: '#3f7fd1', amarelo: '#f2c230', verde: '#4fa36b' };

export default function MissaoInstrucao() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);
  const trials = useMemo(() => (config ? planMission(config) : []), [config]);
  const [speaking, setSpeaking] = useState(false);
  const [gate, setGate] = useState(false);
  const [nudge, setNudge] = useState<string | null>(null);
  const repeats = useRef(0);
  const sound = config?.adaptation.sound ?? 'low';

  const run = useMission({
    client, config, trials, paused, gate,
    latencyPerStepMs: manifest.clinical.latencyMaxMs,
    feedbackMs: motion === 'static' ? 700 : 1300,
    repeats: () => repeats.current,
  });
  const trial = run.trial;

  useEffect(() => installAudioUnlock(), []);

  const say = useCallback(
    async (text: string) => {
      setSpeaking(true);
      // Sem som configurado, a instrução é dada pelo adulto; o jogo só aguarda um instante.
      if (sound === 'off') await new Promise((r) => setTimeout(r, 1200));
      else await speak(text, sound, 0.85);
      setSpeaking(false);
    },
    [sound],
  );

  // Cada tentativa começa com a instrução; a latência conta a partir do fim da fala.
  const lastIndex = useRef(-1);
  useEffect(() => {
    if (!trial || run.stage !== 'awaiting' || paused || lastIndex.current === trial.index) return;
    lastIndex.current = trial.index;
    repeats.current = 0;
    setGate(false);
    const timer = window.setTimeout(() => void say(trial.instruction).then(() => setGate(true)), 450);
    return () => window.clearTimeout(timer);
  }, [trial, run.stage, paused, say]);

  // Na correção, a instrução é repetida com calma enquanto a luz guia.
  useEffect(() => {
    if (run.stage === 'correction' && trial) void say(trial.instruction);
  }, [run.stage, trial, say]);

  useEffect(() => {
    if (!config) return;
    const spec = levelFrom(config.params);
    client.gameStarted(manifest.version);
    client.levelStarted({
      levelId: `nivel-${spec.level}`, levelIndex: spec.level - 1, trialsPlanned: planMission(config).length,
      fieldSize: spec.level === 1 ? undefined : missionField(spec, config.adaptation.maxChoices),
      difficulty: `${spec.steps}-etapa${spec.steps > 1 ? 's' : ''}${spec.attributes ? '+atributos' : ''}${spec.relations ? '+relacoes' : ''}`,
    });
  }, [config, client]);

  useEffect(() => {
    if (run.stage === 'feedback' && config?.adaptation.feedback !== 'none') playTones(BELL, sound);
  }, [run.stage, config, sound]);

  if (!config) return <div className="epi" aria-busy="true" />;

  const p = run.progress;
  const focus = trial && run.hint ? hintFocus(trial, p) : { item: null, zone: null };
  const step = trial?.steps[p.step];
  const awaitingZone = !!step && step.kind === 'place' && p.selected != null;
  const live = run.stage === 'awaiting' || run.stage === 'correction';

  const onTap = (key: string, tap: Parameters<typeof run.tap>[0]) => {
    if (!gate && run.stage === 'awaiting') return; // ainda falando
    if (run.tap(tap)) playCue('tap', sound);
    else if (live) {
      // Toque sem efeito: só um balanço leve, sem som de erro.
      setNudge(key);
      window.setTimeout(() => setNudge(null), 520);
    }
  };

  return (
    <div className="epi" data-palette={config.adaptation.palette} data-motion={motion} data-level={trial?.level ?? 1} style={{ ['--epi-scale' as string]: config.adaptation.touchScale }}>
      <div className="epi-top">
        <button
          className="epi-speaker"
          data-speaking={speaking}
          aria-label={trial ? `Ouvir de novo: ${trial.instruction}` : 'Ouvir instrução'}
          onClick={() => {
            if (!trial || speaking) return;
            repeats.current += 1;
            void say(trial.instruction);
          }}
        >
          <svg viewBox="0 0 64 48" aria-hidden="true">
            <path d="M6 18h10l14-12v36L16 30H6z" fill="#5a3a12" />
            <path className="wave" d="M38 16c4 4 4 12 0 16" fill="none" stroke="#5a3a12" strokeWidth="4" strokeLinecap="round" />
            <path className="wave wave--2" d="M46 9c8 8 8 22 0 30" fill="none" stroke="#5a3a12" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <span className="epi-speaker__label">Ouvir de novo</span>
        </button>
        {trial && trial.steps.length > 1 && (
          <ol className="epi-steps" aria-label="Etapas da missão">
            {trial.steps.map((s, k) => (
              <li key={k} data-state={k < p.step ? 'done' : k === p.step && live ? 'now' : 'next'}>
                <span className="sr">{s.text}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="epi-stage" data-dest={trial?.hasDestination ?? false}>
        <div className="epi-beams" aria-hidden="true">
          {trial?.items.map((it, pos) => <div key={it.id} className="epi-beam" data-on={focus.item === pos} data-dim={run.hint && focus.item != null && focus.item !== pos} />)}
        </div>
        <div className="epi-shelf" role="group" aria-label="Estante de brinquedos">
          {trial?.items.map((it, pos) => {
            const placed = p.placed.some((x) => x.item === pos);
            const state =
              placed ? 'gone'
              : run.stage === 'feedback' && trial.steps.some((s) => s.item === pos) ? 'hop'
              : nudge === `i${pos}` ? 'tilt'
              : p.selected === pos ? 'picked'
              : focus.item != null && focus.item !== pos ? 'dim'
              : 'idle';
            return (
              <button
                key={`${trial.index}-${it.id}`}
                className="epi-niche"
                data-state={state}
                data-touched={p.touched.includes(pos)}
                aria-pressed={p.selected === pos}
                aria-label={it.label}
                disabled={placed}
                onClick={() => onTap(`i${pos}`, { type: 'item', index: pos })}
              >
                <span className="epi-lantern" aria-hidden="true" />
                <span className="epi-item"><ItemArt item={it} /></span>
              </button>
            );
          })}
        </div>

        {trial?.hasDestination && (
          <div className="epi-dest" role="group" aria-label="Caixa" data-ready={awaitingZone}>
            {RELATIONS.map((rel) => {
              const here = p.placed.filter((x) => x.relation === rel);
              return (
                <button
                  key={rel}
                  className={`epi-zone epi-zone--${rel}`}
                  data-focus={focus.zone === rel}
                  data-dim={focus.zone != null && focus.zone !== rel}
                  data-state={nudge === rel ? 'tilt' : 'idle'}
                  aria-label={RELATION_PHRASE[rel]}
                  onClick={() => onTap(rel, { type: 'zone', relation: rel })}
                >
                  {rel === 'dentro' && <BoxArt />}
                  <span className="epi-zone__items">
                    {here.map((x) => <span key={x.item} className="epi-zone__toy"><ItemArt item={trial.items[x.item]!} /></span>)}
                  </span>
                </button>
              );
            })}
            <span className="epi-dest__stand" aria-hidden="true" />
          </div>
        )}
      </div>

      <p className="epi-caption" aria-live="polite">{trial && run.stage !== 'done' ? trial.instruction : ''}</p>
      <div className="epi-progress" aria-hidden="true">
        {trials.map((t, k) => <i key={t.index} data-done={k < run.completed} />)}
      </div>

      {(paused || ended) && run.stage !== 'done' && (
        <div className="epi-overlay" role="status"><div>
          <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="rgb(255 255 255 / .12)" /><rect x="33" y="28" width="11" height="44" rx="4" fill="#fff" /><rect x="56" y="28" width="11" height="44" rx="4" fill="#fff" /></svg>
          <span>Pausa</span>
        </div></div>
      )}
      {run.stage === 'done' && (
        <div className="epi-overlay" role="status"><div>
          <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#f2b84b" /><path d="m30 52 13 13 27-29" fill="none" stroke="#2c2540" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span>Missão cumprida!</span>
        </div></div>
      )}
    </div>
  );
}

function ItemArt({ item }: { item: MissionItem }) {
  if (item.art) return <StimulusArt art={item.art} label={item.label} />;
  return <ToyArt toy={item.toy!} label={item.label} />;
}

/** Brinquedos próprios (massinha: formas redondas, contorno espesso, sombra suave). */
function ToyArt({ toy, label }: { toy: Toy; label: string }) {
  const fill = TOY_FILL[toy.color];
  const s = toy.size === 'grande' ? 1 : 0.6;
  const shape =
    toy.kind === 'bola' ? <><circle cx="60" cy="60" r="44" fill={fill} /><path d="M24 52c20 10 52 10 72 0" fill="none" stroke="rgb(255 255 255 / .55)" strokeWidth="7" strokeLinecap="round" /></>
    : toy.kind === 'cubo' ? <><rect x="18" y="18" width="84" height="84" rx="16" fill={fill} /><rect x="30" y="30" width="34" height="34" rx="8" fill="rgb(255 255 255 / .3)" /></>
    : toy.kind === 'estrela' ? <path d="M60 12l13 29 31 3-23 21 7 31-28-16-28 16 7-31-23-21 31-3z" fill={fill} strokeLinejoin="round" stroke={fill} strokeWidth="8" />
    : <><path d="M14 60c14-22 44-30 66-14l20-14v56l-20-14c-22 16-52 8-66-14z" fill={fill} /><circle cx="36" cy="54" r="5" fill="#2c2540" /></>;
  return (
    <svg viewBox="0 0 120 120" width="100%" height="100%" role="img" aria-label={label}>
      <ellipse cx="60" cy={60 + 50 * s} rx={38 * s} ry={6 * s} fill="rgb(0 0 0 / .18)" />
      <g transform={`translate(${60 - 60 * s} ${60 - 60 * s}) scale(${s})`} stroke="rgb(0 0 0 / .18)" strokeWidth="3">{shape}</g>
    </svg>
  );
}

function BoxArt() {
  return (
    <svg className="epi-box" viewBox="0 0 160 110" aria-hidden="true" preserveAspectRatio="none">
      <path d="M10 24h140l-10 82H20z" fill="var(--epi-box)" />
      <path d="M10 24h140l-10 82H20z" fill="none" stroke="var(--epi-box-dark)" strokeWidth="6" strokeLinejoin="round" />
      <path d="M4 14h152v14H4z" fill="var(--epi-box-dark)" />
    </svg>
  );
}

