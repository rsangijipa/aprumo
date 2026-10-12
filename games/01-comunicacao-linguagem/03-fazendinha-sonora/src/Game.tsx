import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { installAudioUnlock, playCue, playTones, speak, useGameClient, useMotion } from '@aprumo/game-sdk';
import {
  ANIMAL_SONG, ANIMAL_SOUNDS, CLOSED, HIDING_LABEL, REST_AFTER_MS, RESPONSE_TYPES, SPRING_DAMPING, TURN_MS, VARIATION_LABEL,
  animalById, episodeRecord, flapAngle, flapBox, flapReduce, nextVariation, resolveMotion, resolveSettings, soundDuration,
  springStep, swappedAnimal, targetForEpisode, whereIs,
  type AnimalId, type Book, type FlapAction, type FlapDef, type FlapState, type ResponseType, type Variation,
} from './logic';
import { AnimalArt, BookCover, HidingArt, PointerHand, SceneArt } from './Art';
import { manifest } from './manifest';
import './game.css';

type Phase = 'abertura' | 'leitura' | 'fechamento';
interface EpisodeMeta {
  pointerUsed: boolean;
  expectant: boolean;
  variations: Variation[];
  soundRepeats: number;
  openedAt: number | null;
  childInitiated: boolean;
  logged: number;
}
const freshMeta = (): EpisodeMeta => ({ pointerUsed: false, expectant: false, variations: [], soundRepeats: 0, openedAt: null, childInitiated: false, logged: 0 });
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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

/* ------------------------------------------------------------------ componentes */

function Flap(props: {
  def: FlapDef;
  state: FlapState;
  angle: number;
  focused: boolean;
  actKey: number | null;
  onChildTap: () => void;
}) {
  const { def, state, angle, focused, actKey, onChildTap } = props;
  const box = flapBox(def);
  const animal = animalById(def.animal)!;
  const style: CSSProperties = { left: `${box.x - box.w / 2}%`, top: `${box.y - box.h / 2}%`, width: `${box.w}%`, height: `${box.h}%` };
  return (
    <div className="fs-slot" style={style} data-open={state.open} data-focus={focused} data-request={state.requestPending} data-hide={def.hide}>
      <AnimalReveal id={def.animal} baby={!!def.baby} revealed={state.open} actKey={actKey} />
      <div className="fs-flap" style={{ transform: `rotateX(${angle.toFixed(2)}deg)` }}>
        <div key={state.wiggle} className={state.wiggle ? 'fs-flap__front is-wiggle' : 'fs-flap__front'}>
          <HidingArt hide={def.hide} />
        </div>
        <div className="fs-flap__back" />
      </div>
      <button
        type="button"
        className="fs-slot__hit"
        aria-label={state.open ? `${cap(def.baby ? animal.baby : animal.name)} (${HIDING_LABEL[def.hide]})` : `Aba: ${HIDING_LABEL[def.hide]}`}
        onClick={onChildTap}
      />
    </div>
  );
}

function AnimalReveal({ id, baby, revealed, actKey }: { id: AnimalId; baby: boolean; revealed: boolean; actKey: number | null }) {
  return (
    <div className="fs-animal" data-revealed={revealed}>
      <div key={actKey ?? 'idle'} className={actKey != null ? 'fs-animal__body is-acting' : 'fs-animal__body'}>
        <AnimalArt id={id} baby={baby} />
      </div>
    </div>
  );
}

function AdultPointerHand({ def }: { def: FlapDef }) {
  const b = flapBox(def);
  return (
    <div className="fs-hand" style={{ left: `${Math.min(92, b.x + b.w / 2 - 3)}%`, top: `${Math.min(88, b.y + b.h / 2 - 6)}%` }}>
      <PointerHand />
    </div>
  );
}

function Bubble({ def, children, kind }: { def: FlapDef; children: ReactNode; kind: 'wait' | 'say' }) {
  const b = flapBox(def);
  const top = Math.max(2, b.y - b.h / 2 - 11);
  return (
    <div className="fs-bubble" data-kind={kind} style={{ left: `${Math.min(80, Math.max(20, b.x))}%`, top: `${top}%` }} role="status">
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ jogo */

export default function FazendinhaSonora() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const sdkMotion = useMotion(config);
  const sysReduced = useSystemReducedMotion();
  const settings = useMemo(() => (config ? resolveSettings(config) : null), [config]);
  const motion = settings ? resolveMotion(settings, sdkMotion, sysReduced) : 'static';
  const sound = config?.adaptation.sound ?? 'low';

  const [phase, setPhase] = useState<Phase>('abertura');
  const [book, setBook] = useState<Book | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [flaps, setFlaps] = useState<Record<string, FlapState>>({});
  const [angles, setAngles] = useState<Record<string, number>>({});
  const [focusId, setFocusId] = useState<string | null>(null);
  const [pointerOn, setPointerOn] = useState(false);
  const [expectant, setExpectant] = useState(false);
  const [caption, setCaption] = useState<{ flapId: string; text: string; key: number; act: boolean } | null>(null);
  const [echo, setEcho] = useState(false);
  const [gaze, setGaze] = useState(false);
  const [lastLog, setLastLog] = useState<string | null>(null);
  const [resting, setResting] = useState(false);
  const [turning, setTurning] = useState<'next' | 'prev' | null>(null);
  const [stripOpen, setStripOpen] = useState(true);
  const [waving, setWaving] = useState(0);

  const startedRef = useRef(false);
  const flapsRef = useRef(flaps);
  const metaRef = useRef<Record<string, EpisodeMeta>>({});
  const springRef = useRef<Record<string, { x: number; v: number }>>({});
  const trialRef = useRef(0);
  const correctRef = useRef(0);
  const variationCountRef = useRef(0);
  const lastActivityRef = useRef(performance.now());
  const timersRef = useRef<number[]>([]);
  const captionKeyRef = useRef(0);

  const page = book?.pages[pageIndex] ?? null;
  const focus = page?.flaps.find((x) => x.id === focusId) ?? null;
  const focusState = focus ? flaps[focus.id] ?? CLOSED : CLOSED;
  const busy = paused || ended || turning != null || phase !== 'leitura';

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);
  useEffect(() => installAudioUnlock(), []);
  useEffect(() => () => { for (const t of timersRef.current) window.clearTimeout(t); }, []);

  // Início da sessão (protegido contra o duplo efeito do StrictMode).
  useEffect(() => {
    if (!config || startedRef.current) return;
    startedRef.current = true;
    client.gameStarted(manifest.version);
  }, [config, client]);

  /* ---------------------------------------------------------------- som */

  const playAnimal = useCallback(
    (id: AnimalId, spoken?: string) => {
      const tones = ANIMAL_SOUNDS[id];
      playTones(tones, sound);
      const text = spoken ?? animalById(id)!.sound;
      if (settings?.voice) later(() => void speak(text, sound, 0.85), Math.round(soundDuration(tones) * 1000) + 150);
    },
    [sound, settings, later],
  );

  /* ---------------------------------------------------------------- abas */

  const apply = useCallback(
    (def: FlapDef, action: FlapAction) => {
      const cur = flapsRef.current[def.id] ?? CLOSED;
      const { state, effects } = flapReduce(cur, action);
      const next = { ...flapsRef.current, [def.id]: state };
      flapsRef.current = next;
      setFlaps(next);
      const meta = (metaRef.current[def.id] ??= freshMeta());
      if (effects.includes('reveal')) {
        meta.openedAt ??= performance.now();
        if (settings?.sensory !== 'minimal') playCue('tap', sound);
      }
      if (effects.includes('sound')) playAnimal(def.animal);
      return state;
    },
    [settings, sound, playAnimal],
  );

  const enterPage = useCallback((b: Book, index: number) => {
    const p = b.pages[index]!;
    const fresh: Record<string, FlapState> = {};
    for (const fl of p.flaps) {
      fresh[fl.id] = CLOSED;
      metaRef.current[fl.id] = freshMeta();
      springRef.current[fl.id] = { x: 0, v: 0 };
    }
    flapsRef.current = fresh;
    setFlaps(fresh);
    setAngles({});
    setPageIndex(index);
    setFocusId(p.flaps[0]?.id ?? null);
    setPointerOn(false);
    setExpectant(false);
    setCaption(null);
    setEcho(false);
    setGaze(false);
    setLastLog(null);
  }, []);

  // Mola da dobra: acompanha o controle do adulto quadro a quadro (estático = sem animação).
  useEffect(() => {
    if (phase !== 'leitura' || !page) return;
    let raf = 0;
    let last: number | null = null;
    const tick = (ts: number) => {
      const dt = last == null ? 1 / 60 : (ts - last) / 1000;
      last = ts;
      let changed = false;
      const out: Record<string, number> = {};
      for (const fl of page.flaps) {
        const target = (flapsRef.current[fl.id] ?? CLOSED).progress;
        const s = (springRef.current[fl.id] ??= { x: 0, v: 0 });
        if (motion === 'static') { s.x = target; s.v = 0; }
        else if (Math.abs(s.x - target) > 0.0005 || Math.abs(s.v) > 0.0005) {
          [s.x, s.v] = springStep(s.x, s.v, target, dt, 180, SPRING_DAMPING[motion]);
        } else { s.x = target; s.v = 0; }
        out[fl.id] = flapAngle(s.x);
      }
      setAngles((prev) => {
        for (const k of Object.keys(out)) if (Math.abs((prev[k] ?? -1) - out[k]!) > 0.05) changed = true;
        return changed ? out : prev;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, page, motion]);

  // Repouso após 20 s sem interação (nenhuma página passa sozinha).
  useEffect(() => {
    if (phase !== 'leitura') return;
    const id = window.setInterval(() => {
      if (!paused && performance.now() - lastActivityRef.current >= REST_AFTER_MS) setResting(true);
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, paused]);

  const onActivity = useCallback(
    (e: PointerEvent | KeyboardEvent) => {
      lastActivityRef.current = performance.now();
      // Toque no véu de repouso só acorda (tratado no próprio véu); demais interações do adulto também acordam.
      if (resting && !(e.target instanceof Element && e.target.closest('.fs-rest'))) setResting(false);
    },
    [resting],
  );

  /* ---------------------------------------------------------------- ações */

  const chooseBook = useCallback(
    (b: Book) => {
      if (paused || ended) return;
      setBook(b);
      setPhase('leitura');
      enterPage(b, 0);
      client.levelStarted({
        levelId: b.id,
        levelIndex: 0,
        fieldSize: Math.max(1, ...b.pages.map((p) => p.flaps.length)),
        difficulty: settings?.requestMode ? 'pedido' : 'tema',
      });
    },
    [paused, ended, enterPage, client, settings],
  );

  const childTap = useCallback(
    (def: FlapDef) => {
      if (busy || resting) return;
      const cur = flapsRef.current[def.id] ?? CLOSED;
      const meta = (metaRef.current[def.id] ??= freshMeta());
      if (!cur.open) meta.childInitiated = true;
      if (pointerOn) meta.pointerUsed = true;
      apply(def, { type: 'child_tap', requestMode: !!settings?.requestMode });
      setFocusId(def.id);
    },
    [busy, resting, apply, settings, pointerOn],
  );

  const selectFocus = useCallback(
    (def: FlapDef) => {
      setFocusId(def.id);
      setCaption(null);
      if (pointerOn) (metaRef.current[def.id] ??= freshMeta()).pointerUsed = true;
      if (expectant) (metaRef.current[def.id] ??= freshMeta()).expectant = true;
    },
    [pointerOn, expectant],
  );

  const togglePointer = useCallback(() => {
    if (!focus) return;
    setPointerOn((on) => {
      if (!on) (metaRef.current[focus.id] ??= freshMeta()).pointerUsed = true;
      return !on;
    });
  }, [focus]);

  const toggleExpectant = useCallback(() => {
    if (!focus) return;
    setExpectant((on) => {
      if (!on) (metaRef.current[focus.id] ??= freshMeta()).expectant = true;
      return !on;
    });
  }, [focus]);

  const repeatSound = useCallback(() => {
    if (busy || !focus || !focusState.open) return;
    (metaRef.current[focus.id] ??= freshMeta()).soundRepeats += 1;
    playAnimal(focus.animal);
  }, [busy, focus, focusState.open, playAnimal]);

  const release = useCallback(() => {
    if (busy || !focus) return;
    setExpectant(false);
    apply(focus, { type: focusState.requestPending ? 'validate_request' : 'liberar' });
  }, [busy, focus, focusState.requestPending, apply]);

  const vary = useCallback(() => {
    if (busy || !focus || !focusState.open) return;
    const kind = nextVariation(variationCountRef.current++);
    (metaRef.current[focus.id] ??= freshMeta()).variations.push(kind);
    const a = animalById(focus.animal)!;
    const who = focus.baby ? `O ${a.baby}` : `${cap(a.article)} ${a.name}`;
    const key = ++captionKeyRef.current;
    if (kind === 'acao') {
      setCaption({ flapId: focus.id, text: `${who} ${a.action}!`, key, act: true });
    } else if (kind === 'som-trocado') {
      const other = swappedAnimal(focus.animal);
      const wrong = other.sound.replace('!', '');
      setCaption({ flapId: focus.id, text: `${who} faz "${wrong}"?`, key, act: false });
      playAnimal(other.id, `${wrong}?`);
    } else if (kind === 'esconde') {
      apply(focus, { type: 'hide' });
      setCaption({ flapId: focus.id, text: whereIs(a, !!focus.baby), key, act: false });
      later(() => {
        if (!(focus.id in flapsRef.current)) return;
        apply(focus, { type: 'liberar' });
        setCaption({ flapId: focus.id, text: 'Achou!', key: ++captionKeyRef.current, act: false });
      }, 1600);
    } else {
      playTones(ANIMAL_SONG, sound);
      setCaption({ flapId: focus.id, text: '♪ Seu Lobato tinha um sítio… ♪', key, act: true });
    }
  }, [busy, focus, focusState.open, apply, playAnimal, later, sound]);

  const closeBook = useCallback(() => {
    if (phase !== 'leitura' || !book) return;
    setPhase('fechamento');
    setResting(false);
    client.levelCompleted({ levelId: book.id, levelIndex: 0, trialsCompleted: trialRef.current, correct: correctRef.current, outcome: 'completed' });
    client.gameCompleted(trialRef.current);
    if (settings?.sensory !== 'minimal') playCue('complete', sound);
  }, [phase, book, client, settings, sound]);

  const turn = useCallback(
    (dir: 'next' | 'prev') => {
      if (busy || !book) return;
      const to = pageIndex + (dir === 'next' ? 1 : -1);
      if (to < 0) return;
      if (to >= book.pages.length) return closeBook();
      const ms = TURN_MS[motion];
      if (!ms) return enterPage(book, to);
      setTurning(dir);
      if (settings?.sensory !== 'minimal') playCue('tap', sound);
      later(() => {
        enterPage(book, to);
        setTurning(null);
      }, ms);
    },
    [busy, book, pageIndex, closeBook, motion, enterPage, later, settings, sound],
  );

  const record = useCallback(
    (type: ResponseType) => {
      if (busy || !focus || !page || !book || !config) return;
      const meta = (metaRef.current[focus.id] ??= freshMeta());
      const st = flapsRef.current[focus.id] ?? CLOSED;
      const target = targetForEpisode(config.clinical.targets, type, echo);
      const rec = episodeRecord({ responseType: type, echoOfAdult: echo, pointerHandUsed: meta.pointerUsed }, target.promptHierarchy);
      const trialIndex = trialRef.current++;
      const presented = page.flaps.map((x) => x.animal);
      const lat = meta.openedAt != null ? Math.max(0, Math.round(performance.now() - meta.openedAt)) : null;
      const base = { targetId: target.targetId, trialIndex };
      client.trialStarted({ ...base, presented });
      if (rec.promptSource === 'therapist') client.promptPresented({ ...base, level: rec.promptLevel, source: 'therapist', latencyMs: lat ?? 0 });
      client.responseRecorded({
        ...base,
        stimulusId: focus.animal,
        presented,
        positionOfTarget: page.flaps.indexOf(focus),
        selected: null,
        selectedPosition: null,
        response: rec.response,
        latencyMs: null,
        promptLevel: rec.promptLevel,
        promptSource: rec.promptSource,
        detail: {
          gameSpecific: { page: pageIndex + 1, animal: focus.animal, responseType: type, echoOfAdult: echo },
          bookId: book.id,
          pageId: page.id,
          pageKind: page.kind,
          flapId: focus.id,
          hide: focus.hide,
          baby: !!focus.baby,
          revealed: st.open,
          revealMode: st.revealMode,
          childInitiated: meta.childInitiated,
          childTaps: st.childTaps,
          pointerHandUsed: meta.pointerUsed,
          expectantPause: meta.expectant,
          gazeShift: gaze,
          soundRepeats: meta.soundRepeats,
          variations: [...meta.variations],
          phase: meta.variations.length ? 'elaboracao' : 'tema',
          episodeInFlap: meta.logged + 1,
          requestMode: !!settings?.requestMode,
          motion,
          sensory: settings?.sensory,
          inputMode: 'therapist',
          recordLatencyMs: lat,
        },
      });
      meta.logged += 1;
      if (rec.response === 'correct') correctRef.current += 1;
      setEcho(false);
      setGaze(false);
      setLastLog(RESPONSE_TYPES.find((r) => r.id === type)!.label);
    },
    [busy, focus, page, book, config, echo, gaze, client, pageIndex, settings, motion],
  );

  const sayBye = useCallback(() => {
    setWaving((w) => w + 1);
    if (settings?.voice) void speak('Tchau, bichinhos!', sound, 0.85);
  }, [settings, sound]);

  if (!config || !settings) return <div className="fs" aria-busy="true" />;

  const style = { '--fs-scale': String(config.adaptation.touchScale) } as CSSProperties;
  const plain = settings.sensory === 'minimal';
  const phaseLabel =
    phase === 'abertura' ? 'Abertura' : phase === 'fechamento' ? 'Fechamento'
      : focus && (metaRef.current[focus.id]?.variations.length ?? 0) > 0 ? 'Elaboração' : 'Tema';
  const pageBanner = page?.kind === 'todos' ? 'Todo mundo junto!' : page?.kind === 'filhote' ? 'Cadê o filhote?' : null;
  const bookAnimals = book ? [...new Set(book.pages.flatMap((p) => p.flaps.map((x) => x.animal)))].slice(0, 6) : [];

  return (
    <div
      className="fs"
      style={style}
      data-palette={config.adaptation.palette}
      data-motion={motion}
      data-sensory={settings.sensory}
      data-phase={phase}
      data-resting={resting}
      onPointerDownCapture={onActivity}
      onKeyDownCapture={onActivity}
    >
      <header className="fs-top">
        <span className="fs-title">{book ? book.title : 'Fazendinha Sonora'}</span>
        <span className="fs-chip" aria-live="polite">{phaseLabel}</span>
        {phase === 'leitura' && book && <span className="fs-chip">Página {pageIndex + 1} de {book.pages.length}</span>}
        {phase === 'leitura' && pageBanner && <span className="fs-chip fs-chip--special">{pageBanner}</span>}
      </header>

      <main className="fs-stage">
        {phase === 'abertura' && (
          <section className="fs-open" aria-label="Escolha do livro">
            <p className="fs-open__ask">Qual livro vamos ler?</p>
            <div className="fs-open__books">
              {settings.books.map((b) => (
                <button key={b.id} type="button" className="fs-cover" onClick={() => chooseBook(b)} disabled={paused || ended}>
                  <BookCover book={b} />
                  <span className="fs-cover__title">{b.title}</span>
                </button>
              ))}
            </div>
            {settings.bookErrors.length > 0 && (
              <p className="fs-note">Para o adulto: um livro personalizado tinha erros e foi ignorado ({settings.bookErrors[0]}).</p>
            )}
          </section>
        )}

        {phase === 'leitura' && book && page && (
          <div className="fs-book" data-turning={turning ?? undefined}>
            <div className="fs-spread" key={page.id}>
              <SceneArt scene={book.scene} plain={plain} />
              <div className="fs-crease" aria-hidden="true" />
              {page.flaps.map((def) => (
                <Flap
                  key={def.id}
                  def={def}
                  state={flaps[def.id] ?? CLOSED}
                  angle={angles[def.id] ?? 0}
                  focused={def.id === focusId}
                  actKey={caption?.act && caption.flapId === def.id ? caption.key : null}
                  onChildTap={() => childTap(def)}
                />
              ))}
              {pointerOn && focus && <AdultPointerHand def={focus} />}
              {expectant && focus && !focusState.open && <Bubble def={focus} kind="wait"><span className="fs-dots"><i /><i /><i /></span></Bubble>}
              {caption && focus && caption.flapId === focus.id && <Bubble key={caption.key} def={focus} kind="say">{caption.text}</Bubble>}
            </div>
            {turning && <div className="fs-turnsheet" data-dir={turning} aria-hidden="true" />}
            {resting && (
              <button type="button" className="fs-rest" onClick={() => setResting(false)}>
                <span role="status">Descansando… toque para continuar</span>
              </button>
            )}
          </div>
        )}

        {phase === 'fechamento' && book && (
          <section className="fs-close" aria-label="Fechamento">
            <div className="fs-close__book"><BookCover book={book} /></div>
            <p className="fs-close__text" role="status">O livro acabou!</p>
            <ul className="fs-close__animals" aria-label="Tchau aos animais">
              {bookAnimals.map((id, i) => (
                <li key={`${id}-${waving}`} className={waving ? 'is-waving' : undefined} style={{ animationDelay: `${i * 120}ms` }}>
                  <AnimalArt id={id} />
                </li>
              ))}
            </ul>
            <button type="button" className="fs-btn fs-btn--soft" onClick={sayBye} disabled={paused || ended}>Tchau, bichinhos!</button>
          </section>
        )}
      </main>

      {phase === 'leitura' && page && (
        <section className="fs-adult" aria-label="Controles do adulto" data-open={stripOpen}>
          <div className="fs-adult__row">
            <span className="fs-adult__title">Adulto</span>
            <div className="fs-flapchips" role="group" aria-label="Aba em foco">
              {page.flaps.map((def) => {
                const st = flaps[def.id] ?? CLOSED;
                return (
                  <button
                    key={def.id}
                    type="button"
                    className="fs-flapchip"
                    aria-pressed={def.id === focusId}
                    data-open={st.open}
                    data-request={st.requestPending}
                    onClick={() => selectFocus(def)}
                  >
                    {HIDING_LABEL[def.hide]} · {def.baby ? animalById(def.animal)!.baby : animalById(def.animal)!.name}
                  </button>
                );
              })}
            </div>
            <button type="button" className="fs-btn fs-btn--ghost" onClick={() => setStripOpen((o) => !o)} aria-expanded={stripOpen}>
              {stripOpen ? 'Ocultar' : 'Controles'}
            </button>
          </div>

          {stripOpen && (
            <>
              <div className="fs-adult__row">
                <label className="fs-reveal">
                  <span className="fs-reveal__label">Revelar devagar</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round(focusState.progress * 100)}
                    disabled={busy || !focus}
                    onChange={(e) => focus && apply(focus, { type: 'adult_drag', progress: Number(e.currentTarget.value) / 100 })}
                    onPointerUp={() => focus && apply(focus, { type: 'adult_release' })}
                    onKeyUp={() => focus && apply(focus, { type: 'adult_release' })}
                    aria-valuetext={`${Math.round(focusState.progress * 100)}% aberta`}
                  />
                </label>
                <button type="button" className="fs-btn" data-accent={focusState.requestPending} onClick={release} disabled={busy || !focus || (focusState.open && !focusState.requestPending)}>
                  {focusState.requestPending ? 'Pediu! Validar e abrir' : 'Liberar + registrar'}
                </button>
              </div>
              <div className="fs-adult__row fs-adult__tools">
                <button type="button" className="fs-btn" onClick={repeatSound} disabled={busy || !focusState.open}>Repetir som</button>
                <button type="button" className="fs-btn" aria-pressed={pointerOn} onClick={togglePointer} disabled={busy || !focus}>Mão apontando</button>
                <button type="button" className="fs-btn" aria-pressed={expectant} onClick={toggleExpectant} disabled={busy || !focus || focusState.open}>Pausa expectante</button>
                <button type="button" className="fs-btn" onClick={vary} disabled={busy || !focusState.open} title={VARIATION_LABEL[nextVariation(variationCountRef.current)]}>
                  Variação: {VARIATION_LABEL[nextVariation(variationCountRef.current)]}
                </button>
                <span className="fs-spacer" />
                <button type="button" className="fs-btn" onClick={() => turn('prev')} disabled={busy || pageIndex === 0} aria-label="Página anterior">‹ Página</button>
                <button type="button" className="fs-btn" onClick={() => turn('next')} disabled={busy} aria-label="Virar página">
                  {book && pageIndex + 1 >= book.pages.length ? 'Fechar livro' : 'Página ›'}
                </button>
                <button type="button" className="fs-btn fs-btn--ghost" onClick={closeBook} disabled={busy}>Encerrar</button>
              </div>

              {focus && (focusState.open || focusState.requestPending || (metaRef.current[focus.id]?.childInitiated ?? false)) && (
                <div className="fs-log" role="group" aria-label="Registro rápido do episódio">
                  <div className="fs-log__head">
                    <span className="fs-log__title">Registrar episódio: o que a criança fez?</span>
                    <button type="button" className="fs-toggle" aria-pressed={echo} onClick={() => setEcho((v) => !v)}>Eco do adulto</button>
                    <button type="button" className="fs-toggle" aria-pressed={gaze} onClick={() => setGaze((v) => !v)}>Alternou o olhar</button>
                    {lastLog && <span className="fs-log__done" role="status">Registrado: {lastLog}</span>}
                  </div>
                  <div className="fs-log__grid">
                    {RESPONSE_TYPES.map((r) => (
                      <button key={r.id} type="button" className="fs-resp" data-type={r.id} onClick={() => record(r.id)} disabled={busy}>
                        <span className="fs-resp__label">{r.label}</span>
                        <span className="fs-resp__hint">{r.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {(paused || ended) && (
        <div className="fs-overlay" role="status">
          <span className="fs-overlay__badge">{ended ? 'Sessão encerrada' : 'Pausa'}</span>
        </div>
      )}
    </div>
  );
}
