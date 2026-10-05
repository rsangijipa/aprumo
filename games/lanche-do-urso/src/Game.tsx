import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from 'react';
import {
  installAudioUnlock, playTones, speak, stopAllSounds, useGameClient, useMotion, type Tone,
} from '@aprumo/game-sdk';
import {
  ACTIONS, CHARACTERS, FALLBACK_TARGET, HELPS, INITIAL_CHAR, LULLABY_NOTES, NEED_FOR, PLACES, REACTION_LINE,
  REST_AFTER_MS, SCENE, ZONES, ZONE_GEOMETRY, ZONE_LABEL,
  extendChain, helpToRecord, needLine, nextPhase, objectById, planMissions, react, requestLine, resolveAction,
  resolveMotion, resolveSettings, satisfiesRequest, settle, stepFall, subject, summarize, triggerNeed, zoneAt,
  type ActionId, type ChainStep, type CharModel, type CharState, type CharacterId, type Episode, type Help,
  type Location, type NeedState, type ObjectId, type Phase, type PlaceId, type Reaction, type ZoneId,
} from './logic';
import { Backdrop, Character, CharacterThumb, Foreground, ItemIcon, Patterns, PlaceThumb } from './Art';
import { manifest } from './manifest';
import './game.css';

const LEVEL_ID = 'faz-de-conta';
type Screen = 'opening' | 'play' | 'done';
type InputMode = 'drag' | 'tap' | 'keyboard' | 'therapist';

const soft = (freq: number, delay = 0, extra: Partial<Tone> = {}): Tone => ({
  freq, dur: 0.12, type: 'sine', delay, attack: 0.02, decay: 0.08, sustain: 0.4, release: 0.18, gain: 0.45, ...extra,
});
/** Sons calmos associados a cada ação ("nham", "glu glu", "ué?" sem tom de erro). */
const REACTION_TONES: Record<Reaction, Tone[]> = {
  comer: [soft(220), soft(196, 0.22)],
  beber: [soft(330, 0, { slideTo: 262 }), soft(330, 0.2, { slideTo: 262 })],
  limpar: [soft(392), soft(440, 0.14)],
  banho: [soft(440), soft(494, 0.12), soft(440, 0.24)],
  cobrir: [soft(262, 0, { dur: 0.3 }), soft(196, 0.32, { dur: 0.4 })],
  pentear: [soft(349), soft(392, 0.16)],
  ue: [soft(262), soft(330, 0.18)],
};
const OPS_TONES = [soft(392, 0, { slideTo: 220, dur: 0.3 })];
const LULLABY: Tone[] = LULLABY_NOTES.map((f, i) => soft(f, i * 0.48, { dur: 0.34, gain: 0.35 }));
const NEED_BUTTONS: Array<{ id: NeedState; label: string }> = [
  { id: 'fome', label: 'Fome' }, { id: 'sede', label: 'Sede' }, { id: 'sono', label: 'Sono' }, { id: 'sujo', label: 'Sujo' },
];
/** Raio visual dos anéis de zona (o snap usa ZONE_GEOMETRY.r; o toque usa a mesma geometria). */
const RING: Record<ZoneId, number> = { cabeca: 40, rosto: 34, boca: 30, corpo: 66 };
const PHASE_LABEL: Record<Phase, string> = { abertura: 'Abertura', tema: 'Hora do lanche', elaboracao: 'Elaboração', fechamento: 'Fechamento' };

function useSystemReducedMotion() {
  const [v, setV] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const h = () => setV(mq.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return v;
}

export default function LancheDoUrso() {
  const { client, config, paused, ended, lastCommand } = useGameClient(manifest.appId, manifest.version);
  const sdkMotion = useMotion(config);
  const sysReduced = useSystemReducedMotion();
  const settings = useMemo(() => (config ? resolveSettings(config) : null), [config]);
  const motion = settings ? resolveMotion(settings, sdkMotion, sysReduced) : 'static';
  const plan = useMemo(() => (config && settings?.mode === 'mission' ? planMissions(config, settings) : []), [config, settings]);
  const sound = config?.adaptation.sound ?? 'low';
  const mission = settings?.mode === 'mission';

  const [screen, setScreen] = useState<Screen>('opening');
  const [character, setCharacter] = useState<CharacterId | null>(null);
  const [place, setPlace] = useState<PlaceId | null>(null);
  const [phase, setPhase] = useState<Phase>('abertura');
  const [model, setModel] = useState<CharModel>(INITIAL_CHAR);
  const [active, setActive] = useState<CharState | null>(null);
  const [holding, setHolding] = useState<{ id: ObjectId; zone: ZoneId } | null>(null);
  const [pretend, setPretend] = useState(false);
  const [cup, setCup] = useState<{ tipped: boolean; dropY: number | null }>({ tipped: false, dropY: null });
  const [selected, setSelected] = useState<ObjectId | null>(null);
  const [drag, setDrag] = useState<{ id: ObjectId; x: number; y: number; zone: ZoneId | null } | null>(null);
  const [caption, setCaption] = useState('');
  const [voice, setVoice] = useState(true);
  const [rest, setRest] = useState(false);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [trialIdx, setTrialIdx] = useState(0);
  const [requestOn, setRequestOn] = useState(false);
  const [regAction, setRegAction] = useState<ActionId | null>(null);
  const [regLoc, setRegLoc] = useState<Location | null>(null);
  const [regHelp, setRegHelp] = useState<Help>('independent');

  const initRef = useRef(false);
  const startedRef = useRef(false);
  const doneRef = useRef(false);
  const chainRef = useRef<ChainStep[]>([]);
  const freeIdxRef = useRef(0);
  const completedRef = useRef(0);
  const correctRef = useRef(0);
  const presentedRef = useRef(false);
  const presentedAtRef = useRef(0);
  const attemptsRef = useRef(0);
  const othersRef = useRef<string[]>([]);
  const promptRef = useRef<string | null>(null);
  const expectantRef = useRef(false);
  const idleRef = useRef<number | null>(null);
  const reactRef = useRef<number | null>(null);
  const rafRef = useRef(0);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const downRef = useRef<{ id: ObjectId; x: number; y: number; dragging: boolean } | null>(null);
  const suppressClickRef = useRef(false);

  const trial = plan[trialIdx];
  const targetId = (config?.clinical.targets[0] ?? FALLBACK_TARGET).targetId;
  const blocked = paused || ended || screen !== 'play';

  useEffect(() => installAudioUnlock(), []);
  useEffect(() => () => {
    if (idleRef.current != null) window.clearTimeout(idleRef.current);
    if (reactRef.current != null) window.clearTimeout(reactRef.current);
    cancelAnimationFrame(rafRef.current);
  }, []);

  // Configuração inicial: personagem/lugar predefinidos pulam a abertura.
  useEffect(() => {
    if (!settings || initRef.current) return;
    initRef.current = true;
    setVoice(settings.voice);
    if (settings.character) setCharacter(settings.character);
    if (settings.place) setPlace(settings.place);
    if (settings.character && settings.place) { setScreen('play'); setPhase('tema'); }
  }, [settings]);

  // Início da sessão (protegido contra o duplo efeito do StrictMode).
  useEffect(() => {
    if (!config || !settings || startedRef.current) return;
    startedRef.current = true;
    client.gameStarted(manifest.version);
    client.levelStarted({ levelId: LEVEL_ID, levelIndex: 0, fieldSize: 1, trialsPlanned: plan.length, difficulty: settings.mode });
  }, [config, settings, plan, client]);

  /* ---------------------------------------------------------------- utilidades */

  const fx = (tones: Tone[]) => { if (settings?.sensory !== 'minimal') playTones(tones, sound); };
  const say = (text: string) => {
    setCaption(text);
    if (voice) void speak(text, sound);
  };
  const reactMs = motion === 'static' ? 900 : motion === 'reduced' ? 1700 : 1300;

  /** Qualquer interação reinicia a contagem; após 20 s o personagem repousa. */
  const touch = () => {
    setRest(false);
    if (idleRef.current != null) window.clearTimeout(idleRef.current);
    idleRef.current = window.setTimeout(() => {
      setRest(true);
      setActive(null);
      setHolding(null);
      setModel((m) => settle(m));
      chainRef.current = [];
      expectantRef.current = false;
      stopAllSounds();
    }, REST_AFTER_MS);
  };

  const ctx = (extra: Record<string, unknown>) => ({
    ...extra,
    phase,
    character,
    place,
    pretendActive: pretend,
    afterExpectantPause: expectantRef.current,
    motion,
    sensory: settings?.sensory,
    characterVoice: voice,
  });

  const gameSpecific = (g: {
    action: ActionId | null; object: ObjectId | null; target: ZoneId | null; substitution: boolean; location: Location; sequenceLength: number;
  }) => g;

  /* ---------------------------------------------------------------- modo missão */

  const ensurePresented = () => {
    if (!trial || presentedRef.current) return;
    presentedRef.current = true;
    client.trialStarted({ targetId: trial.target.targetId, trialIndex: trial.trialIndex, presented: [trial.request] });
    client.stimulusPresented({
      targetId: trial.target.targetId, trialIndex: trial.trialIndex, presented: [trial.request], positionOfTarget: null,
      modality: voice ? 'visual_auditory' : 'visual', instructionId: `pedido-${trial.request}`,
    });
    presentedAtRef.current = performance.now();
    attemptsRef.current = 0;
    othersRef.current = [];
  };

  const presentRequest = () => {
    if (blocked || !trial || requestOn || !character) return;
    touch();
    ensurePresented();
    setRequestOn(true);
    const need = NEED_FOR[trial.request];
    setModel((m) => (need ? triggerNeed(m, need) : { ...m, state: 'esperando', covered: false }));
    setRegAction(trial.request);
    setRegLoc(null);
    say(requestLine(character, trial.request));
  };

  const completeMission = (r: {
    help: Help; location: Location; action: ActionId | null; object: ObjectId | null; zone: ZoneId | null;
    substitution: boolean; sequenceLength: number; inputMode: InputMode;
  }) => {
    if (!trial || doneRef.current) return;
    ensurePresented();
    const base = { targetId: trial.target.targetId, trialIndex: trial.trialIndex };
    const rec = helpToRecord(r.help, trial.target.promptHierarchy);
    if (r.help === 'independent' && promptRef.current) { rec.promptLevel = promptRef.current; rec.promptSource = 'therapist'; }
    const lat = Math.max(0, Math.round(performance.now() - presentedAtRef.current));
    if (rec.promptSource === 'therapist') client.promptPresented({ ...base, level: rec.promptLevel, source: 'therapist', latencyMs: lat });
    const onScreen = r.inputMode !== 'therapist';
    client.responseRecorded({
      ...base,
      stimulusId: trial.request,
      presented: [trial.request],
      positionOfTarget: null,
      selected: r.action,
      selectedPosition: null,
      response: rec.response,
      latencyMs: onScreen ? lat : null,
      promptLevel: rec.promptLevel,
      promptSource: rec.promptSource,
      ...(onScreen ? { attempts: attemptsRef.current + 1 } : {}),
      detail: ctx({
        gameSpecific: gameSpecific({ action: r.action, object: r.object, target: r.zone, substitution: r.substitution, location: r.location, sequenceLength: r.sequenceLength }),
        scoring: onScreen ? 'mission' : 'therapist',
        request: trial.request,
        help: r.help,
        otherActions: othersRef.current,
        inputMode: r.inputMode,
      }),
    });
    completedRef.current += 1;
    if (rec.response === 'correct') correctRef.current += 1;
    presentedRef.current = false;
    promptRef.current = null;
    expectantRef.current = false;
    setRequestOn(false);
    setRegLoc(null);
    setRegHelp('independent');
    if (trialIdx + 1 >= plan.length) {
      reactRef.current = window.setTimeout(() => finish(), reactMs);
    } else {
      setTrialIdx((i) => i + 1);
    }
  };

  /* ---------------------------------------------------------------- ações na tela */

  const perform = (objectId: ObjectId, zone: ZoneId, inputMode: InputMode) => {
    if (blocked || !character) return;
    touch();
    const r = resolveAction(objectId, zone, pretend);
    const tr = react(model, r.reaction);
    if (reactRef.current != null) window.clearTimeout(reactRef.current);
    setActive(tr.active);
    setHolding({ id: objectId, zone });
    setModel(tr.after);
    reactRef.current = window.setTimeout(() => { setActive(null); setHolding(null); }, reactMs);
    fx(REACTION_TONES[r.reaction]);
    const obj = objectById(objectId)!;
    say(r.substitution ? `Faz de conta: o bloco virou pão! ${REACTION_LINE[r.reaction]}` : REACTION_LINE[r.reaction]);

    let seq = 0;
    if (r.conventional && r.action) {
      chainRef.current = extendChain(chainRef.current, r.action, Date.now());
      seq = chainRef.current.length;
    }
    setPhase((p) => nextPhase(p, { action: r.action }));
    setEpisodes((e) => [...e, { action: r.action, substitution: r.substitution, location: 'tela', sequenceLength: seq, conventional: r.conventional }]);
    if (tr.satisfied) {
      client.reinforcerPresented({ kind: 'animation', contingentOn: trial?.target.targetId ?? targetId, intensity: settings?.sensory === 'rich' ? 'festive' : 'subtle' });
    }

    const g = gameSpecific({ action: r.action, object: objectId, target: zone, substitution: r.substitution, location: 'tela', sequenceLength: seq });
    if (!mission) {
      // Modo livre: não há resposta errada; cada ação vira um episódio não pontuado.
      const idx = freeIdxRef.current++;
      client.trialStarted({ targetId, trialIndex: idx, presented: [objectId] });
      client.stimulusPresented({ targetId, trialIndex: idx, presented: [objectId], positionOfTarget: null, modality: 'visual', instructionId: 'brincar-livre' });
      client.responseRecorded({
        targetId, stimulusId: objectId, trialIndex: idx, presented: [objectId], positionOfTarget: null,
        selected: objectId, selectedPosition: null, response: 'correct', latencyMs: null, promptLevel: 'IND', promptSource: 'none',
        detail: ctx({ gameSpecific: g, scoring: 'free', scored: false, conventional: r.conventional, reaction: r.reaction, objectKind: obj.kind, inputMode }),
      });
      expectantRef.current = false;
      return;
    }
    if (trial && requestOn && satisfiesRequest(trial.request, r.action)) {
      if (trial.target.scoring === 'auto') {
        completeMission({ help: 'independent', location: 'tela', action: r.action, object: objectId, zone, substitution: r.substitution, sequenceLength: seq, inputMode });
      } else {
        setRegAction(r.action);
        setRegLoc('tela');
        setCaption('Para o adulto: registre como a criança fez.');
      }
    } else if (requestOn) {
      attemptsRef.current += 1;
      othersRef.current = [...othersRef.current, `${objectId}@${zone}`];
    }
  };

  /** Registro do adulto (campo "onde" obrigatório). */
  const register = () => {
    if (blocked || !regAction || !regLoc) return;
    touch();
    chainRef.current = extendChain(chainRef.current, regAction, Date.now());
    const seq = chainRef.current.length;
    const g = gameSpecific({ action: regAction, object: null, target: null, substitution: false, location: regLoc, sequenceLength: seq });
    setEpisodes((e) => [...e, { action: regAction, substitution: false, location: regLoc, sequenceLength: seq, conventional: true }]);
    setPhase((p) => nextPhase(p, { action: regAction }));
    if (mission && trial) {
      completeMission({ help: regHelp, location: regLoc, action: regHelp === 'none' ? null : regAction, object: null, zone: null, substitution: false, sequenceLength: seq, inputMode: 'therapist' });
    } else {
      const idx = freeIdxRef.current++;
      const help: Help = regHelp === 'none' ? 'independent' : regHelp;
      const rec = helpToRecord(help, config?.clinical.targets[0]?.promptHierarchy);
      client.trialStarted({ targetId, trialIndex: idx, presented: [regAction] });
      client.stimulusPresented({ targetId, trialIndex: idx, presented: [regAction], positionOfTarget: null, modality: 'visual', instructionId: 'registro-adulto' });
      if (rec.promptSource === 'therapist') client.promptPresented({ targetId, trialIndex: idx, level: rec.promptLevel, source: 'therapist', latencyMs: 0 });
      client.responseRecorded({
        targetId, stimulusId: regAction, trialIndex: idx, presented: [regAction], positionOfTarget: null,
        selected: regAction, selectedPosition: null, response: rec.response, latencyMs: null,
        promptLevel: rec.promptLevel, promptSource: rec.promptSource,
        detail: ctx({ gameSpecific: g, scoring: 'therapist', help, inputMode: 'therapist' }),
      });
      expectantRef.current = false;
      setRegLoc(null);
      setRegHelp('independent');
    }
    setCaption(`Registrado: ${ACTIONS.find((a) => a.id === regAction)!.label.toLowerCase()} — ${regLoc === 'tela' ? 'na tela' : 'no brinquedo real'}.`);
  };

  // Comandos do hospedeiro: nível de dica e pontuação do profissional.
  const cmdRef = useRef<typeof lastCommand>(null);
  useEffect(() => {
    if (!lastCommand || cmdRef.current === lastCommand) return;
    cmdRef.current = lastCommand;
    if (lastCommand.kind === 'SET_PROMPT') promptRef.current = lastCommand.level;
    if (lastCommand.kind === 'SCORE_TRIAL' && mission && trial && !blocked) {
      completeMission({
        help: lastCommand.response === 'correct' ? 'independent' : 'none', location: regLoc ?? 'tela',
        action: lastCommand.response === 'correct' ? trial.request : null, object: null, zone: null,
        substitution: false, sequenceLength: chainRef.current.length, inputMode: 'therapist',
      });
    }
  }, [lastCommand]);

  /* ---------------------------------------------------------------- controles do adulto */

  const fireNeed = (n: NeedState) => {
    if (blocked || !character) return;
    touch();
    setModel((m) => triggerNeed(m, n));
    if (n === 'sono') fx(LULLABY);
    say(needLine(character, n));
  };

  const expectant = () => {
    if (blocked) return;
    touch();
    expectantRef.current = true;
    setActive(null);
    setModel((m) => ({ ...m, state: 'esperando', covered: false }));
    setCaption('Pausa expectante: espere a criança agir.');
  };

  const variation = (v: 'pretend' | 'ops' | 'banho' | 'dormir') => {
    if (blocked || !character) return;
    touch();
    setPhase((p) => nextPhase(p, { variation: true }));
    if (v === 'pretend') {
      const on = !pretend;
      setPretend(on);
      say(on ? 'Faz de conta! O bloco pode virar pão.' : 'O bloco voltou a ser bloco.');
    } else if (v === 'ops') {
      setActive('surpresa');
      fx(OPS_TONES);
      say('Ops! Derrubou o copo.');
      setCup({ tipped: true, dropY: motion === 'static' ? null : 330 });
      if (motion !== 'static') {
        let body = { y: 330, vy: 0, resting: false };
        let last = performance.now();
        const tick = (t: number) => {
          body = stepFall(body, t - last, 352);
          last = t;
          setCup({ tipped: true, dropY: body.resting ? null : body.y });
          if (!body.resting) rafRef.current = requestAnimationFrame(tick);
        };
        cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(tick);
      }
      if (reactRef.current != null) window.clearTimeout(reactRef.current);
      reactRef.current = window.setTimeout(() => { setActive(null); setModel((m) => triggerNeed(m, 'sujo')); }, reactMs);
    } else if (v === 'banho') {
      setPlace('banheira');
      setModel((m) => triggerNeed(m, 'sujo'));
      say('Hora do banho!');
    } else {
      setPlace('cama');
      setModel((m) => triggerNeed(m, 'sono'));
      fx(LULLABY);
      say(`Hora de dormir. ${needLine(character, 'sono')}`);
    }
  };

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (idleRef.current != null) window.clearTimeout(idleRef.current);
    setScreen('done');
    setPhase('fechamento');
    setSelected(null);
    setActive(null);
    setHolding(null);
    setModel({ state: 'dormindo', need: null, covered: true });
    fx(LULLABY);
    if (character) say(`${subject(character)} foi dormir. Tchau! Acabou.`);
    if (ended) return;
    const count = mission ? completedRef.current : freeIdxRef.current;
    const allDone = mission && completedRef.current >= plan.length;
    client.levelCompleted({ levelId: LEVEL_ID, levelIndex: 0, trialsCompleted: count, correct: mission ? correctRef.current : count, outcome: allDone ? 'completed' : 'stopped' });
    client.gameCompleted(count);
  };

  /* ---------------------------------------------------------------- arrastar / tocar */

  const zoneFromClient = (cx: number, cy: number): ZoneId | null => {
    const el = sceneRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    return zoneAt({ x: ((cx - r.left) / r.width) * SCENE, y: ((cy - r.top) / r.height) * SCENE });
  };

  const onItemDown = (e: RPointerEvent<HTMLButtonElement>, id: ObjectId) => {
    if (blocked) return;
    downRef.current = { id, x: e.clientX, y: e.clientY, dragging: false };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* sem captura */ }
  };
  const onItemMove = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = downRef.current;
    if (!d) return;
    if (!d.dragging && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8) { d.dragging = true; setSelected(null); touch(); }
    if (d.dragging) setDrag({ id: d.id, x: e.clientX, y: e.clientY, zone: zoneFromClient(e.clientX, e.clientY) });
  };
  const onItemUp = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = downRef.current;
    downRef.current = null;
    if (!d?.dragging) return;
    suppressClickRef.current = true;
    setDrag(null);
    const z = zoneFromClient(e.clientX, e.clientY);
    if (z) perform(d.id, z, 'drag');
  };
  const onItemCancel = () => { downRef.current = null; setDrag(null); };
  const onItemClick = (id: ObjectId) => {
    if (suppressClickRef.current) { suppressClickRef.current = false; return; }
    if (blocked) return;
    touch();
    const next = selected === id ? null : id;
    setSelected(next);
    if (next) say(objectById(next)!.label);
  };
  const onZone = (zone: ZoneId, keyboard: boolean) => {
    if (blocked) return;
    if (!selected) { setCaption('Escolha um objeto na cesta primeiro.'); return; }
    perform(selected, zone, keyboard ? 'keyboard' : 'tap');
    setSelected(null);
  };

  /* ---------------------------------------------------------------- abertura */

  const begin = () => {
    if (!character || !place || paused || ended) return;
    touch();
    setScreen('play');
    setPhase((p) => (p === 'abertura' ? 'tema' : p));
    say(`Vamos brincar com ${subject(character).toLowerCase()}! Hora do lanche.`);
  };

  if (!config || !settings) return <div className="lu" aria-busy="true" />;

  const style = { '--lu-scale': String(config.adaptation.touchScale) } as CSSProperties;
  const shownState: CharState = active ?? model.state;
  const sum = summarize(episodes);

  return (
    // Esc em qualquer ponto cancela a seleção/arraste; os controles focáveis ficam dentro.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="lu"
      style={style}
      data-palette={config.adaptation.palette}
      data-motion={motion}
      data-sensory={settings.sensory}
      data-rest={rest || undefined}
      data-screen={screen}
      onKeyDown={(e) => { if (e.key === 'Escape') { setSelected(null); setDrag(null); } }}
    >
      <header className="lu-top">
        <span className="lu-phase" aria-live="polite">
          {mission && screen === 'play' && trial ? `Pedido ${trialIdx + 1} de ${plan.length} · ` : ''}
          {PHASE_LABEL[phase]}
        </span>
        {pretend && <span className="lu-tag">Faz de conta</span>}
      </header>

      {screen === 'opening' ? (
        <main className="lu-opening">
          <h1 className="lu-title">Hora do Lanche</h1>
          <fieldset className="lu-choice">
            <legend>Quem vai brincar?</legend>
            <div className="lu-choice__row">
              {CHARACTERS.map((c) => (
                <button key={c.id} type="button" className="lu-card" aria-pressed={character === c.id} onClick={() => { setCharacter(c.id); say(c.label); }}>
                  <CharacterThumb character={c.id} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="lu-choice">
            <legend>Onde?</legend>
            <div className="lu-choice__row">
              {PLACES.map((p) => (
                <button key={p.id} type="button" className="lu-card" aria-pressed={place === p.id} onClick={() => { setPlace(p.id); say(p.label); }}>
                  <PlaceThumb place={p.id} />
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <button type="button" className="lu-go" onClick={begin} disabled={!character || !place || paused || ended}>
            Vamos brincar!
          </button>
        </main>
      ) : (
        <main className="lu-play">
          {/* Toque por coordenada é atalho de ponteiro; teclado e leitor de tela usam os botões de zona abaixo. */}
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            className="lu-scene"
            ref={sceneRef}
            data-selecting={!!selected || !!drag || undefined}
            onClick={(e) => {
              if (screen !== 'play') return;
              const z = zoneFromClient(e.clientX, e.clientY);
              if (z) onZone(z, false);
            }}
          >
            <svg viewBox={`0 0 ${SCENE} ${SCENE}`} className="lu-svg" role="img" aria-label={`${character ? subject(character) : ''}: ${shownState}`}>
              <Patterns />
              <Backdrop place={place ?? 'mesa'} />
              {character && (
                <Character
                  character={character}
                  state={shownState}
                  covered={model.covered}
                  dirty={model.need === 'sujo'}
                  holding={holding}
                />
              )}
              <Foreground place={place ?? 'mesa'} cup={cup} />
            </svg>
            {screen === 'play' &&
              ZONES.map((z) => {
                const g = ZONE_GEOMETRY[z];
                const r = RING[z];
                return (
                  <button
                    key={z}
                    type="button"
                    className="lu-zone"
                    data-hot={drag?.zone === z || undefined}
                    style={{ left: `${((g.x - r) / SCENE) * 100}%`, top: `${((g.y - r) / SCENE) * 100}%`, width: `${((2 * r) / SCENE) * 100}%`, height: `${((2 * r) / SCENE) * 100}%` }}
                    aria-label={selected ? `Levar ${objectById(selected)!.label.toLowerCase()} até: ${ZONE_LABEL[z]}` : ZONE_LABEL[z]}
                    onClick={(e) => { e.stopPropagation(); onZone(z, true); }}
                    disabled={blocked}
                  />
                );
              })}
          </div>
          <p className="lu-caption" role="status" aria-live="polite">{caption}</p>
          {screen === 'play' && (
            <ul className="lu-basket" aria-label="Cesta de objetos">
              {settings.items.map((id) => {
                const o = objectById(id)!;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className="lu-item"
                      data-kind={o.kind}
                      aria-pressed={selected === id}
                      aria-label={o.label}
                      onPointerDown={(e) => onItemDown(e, id)}
                      onPointerMove={onItemMove}
                      onPointerUp={onItemUp}
                      onPointerCancel={onItemCancel}
                      onClick={() => onItemClick(id)}
                      disabled={blocked}
                    >
                      <ItemIcon id={id} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {screen === 'done' && (
            <section className="lu-summary" aria-label="Resumo para o adulto">
              <h2>Resumo da brincadeira</h2>
              <dl>
                <div><dt>Episódios</dt><dd>{sum.episodes}</dd></div>
                <div><dt>Ações diferentes</dt><dd>{sum.diversity}</dd></div>
                <div><dt>Sequência média</dt><dd>{sum.meanSequence}</dd></div>
                <div><dt>Substituições</dt><dd>{sum.substitutions}</dd></div>
                <div><dt>No brinquedo real</dt><dd>{Math.round(sum.realToyRatio * 100)}%</dd></div>
              </dl>
            </section>
          )}
        </main>
      )}

      {screen === 'play' && (
        <section className="lu-adult" aria-label="Controles do adulto">
          <details open>
            <summary>Controles do adulto</summary>
            <div className="lu-adult__group" role="group" aria-label="Estado do personagem">
              {mission && trial && (
                <button type="button" className="lu-btn lu-btn--main" onClick={presentRequest} disabled={blocked || requestOn}>
                  {requestOn ? 'Esperando a criança…' : `Pedir: ${ACTIONS.find((a) => a.id === trial.request)!.label}`}
                </button>
              )}
              {NEED_BUTTONS.map((n) => (
                <button key={n.id} type="button" className="lu-btn" onClick={() => fireNeed(n.id)} disabled={blocked}>{n.label}</button>
              ))}
              <button type="button" className="lu-btn" onClick={expectant} disabled={blocked}>Pausa expectante</button>
            </div>
            <div className="lu-adult__group" role="group" aria-label="Variações">
              <button type="button" className="lu-btn" aria-pressed={pretend} onClick={() => variation('pretend')} disabled={blocked}>Faz de conta</button>
              <button type="button" className="lu-btn" onClick={() => variation('ops')} disabled={blocked || place !== 'mesa' || cup.tipped}>Ops! (copo)</button>
              <button type="button" className="lu-btn" onClick={() => variation('banho')} disabled={blocked}>Banho</button>
              <button type="button" className="lu-btn" onClick={() => variation('dormir')} disabled={blocked}>Dormir</button>
            </div>
            <div className="lu-adult__reg" role="group" aria-label="Liberar e registrar">
              <div className="lu-adult__group">
                {ACTIONS.map((a) => (
                  <button key={a.id} type="button" className="lu-chip" aria-pressed={regAction === a.id} onClick={() => setRegAction(a.id)} disabled={blocked}>{a.label}</button>
                ))}
              </div>
              <div className="lu-adult__group" role="radiogroup" aria-label="Onde (obrigatório)">
                <span className="lu-adult__label">Onde:</span>
                {(['tela', 'brinquedo-real'] as const).map((l) => (
                  <button key={l} type="button" role="radio" className="lu-chip" aria-checked={regLoc === l} onClick={() => setRegLoc(l)} disabled={blocked}>
                    {l === 'tela' ? 'Tela' : 'Brinquedo real'}
                  </button>
                ))}
              </div>
              <div className="lu-adult__group" role="radiogroup" aria-label="Ajuda">
                <span className="lu-adult__label">Ajuda:</span>
                {HELPS.filter((h) => mission || h.id !== 'none').map((h) => (
                  <button key={h.id} type="button" role="radio" className="lu-chip" aria-checked={regHelp === h.id} onClick={() => setRegHelp(h.id)} disabled={blocked}>{h.label}</button>
                ))}
                <button type="button" className="lu-btn lu-btn--main" onClick={register} disabled={blocked || !regAction || !regLoc}>Registrar</button>
              </div>
            </div>
            <div className="lu-adult__group">
              <button type="button" className="lu-btn" aria-pressed={voice} onClick={() => setVoice((v) => !v)}>Voz do personagem</button>
              <button type="button" className="lu-btn" onClick={() => setScreen('opening')} disabled={blocked}>Escolha</button>
              <button type="button" className="lu-btn lu-btn--end" onClick={finish} disabled={paused || ended}>Encerrar</button>
            </div>
          </details>
        </section>
      )}

      {drag && (
        <div className="lu-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          <ItemIcon id={drag.id} />
        </div>
      )}

      {(paused || ended) && (
        <div className="lu-overlay" role="status">
          <span className="lu-overlay__badge">{ended ? 'Sessão encerrada' : 'Pausa'}</span>
        </div>
      )}
    </div>
  );
}
