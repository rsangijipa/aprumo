import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { installAudioUnlock, playCue, playTones, seededRandom, speak, useAnnounce, useGameClient, useMotion } from '@aprumo/game-sdk';
import type { PromptSource } from '@aprumo/protocol';
import { AnimalArt, Barn, CardBack } from './Art';
import { animalMotif, buildBoard, evaluatePair, levelOutcome, partnerPos, planLevels, type MemoryCard, type MemoryLevel } from './logic';
import { manifest } from './manifest';
import './game.css';

const FLIP = [{ freq: 880, dur: 0.04, type: 'sine' as const, attack: 0.004, decay: 0.03, sustain: 0.3, release: 0.05, gain: 0.5 }];

/** Milissegundos desde `t` (latência), nunca negativo. */
const since = (t: number) => Math.max(0, Math.round(performance.now() - t));

type Stage = 'intro' | 'preview' | 'play' | 'resolving' | 'between' | 'done';

export default function MemoriaBichos() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);
  const levels = useMemo(() => (config ? planLevels(config) : []), [config]);
  const sound = config?.adaptation.sound ?? 'low';
  const feedback = config?.adaptation.feedback ?? 'subtle';

  const [levelIdx, setLevelIdx] = useState(0);
  const [board, setBoard] = useState<MemoryCard[]>([]);
  const [stage, setStage] = useState<Stage>('intro');
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [flying, setFlying] = useState<string | null>(null);
  const [shake, setShake] = useState<number[]>([]);
  const [peek, setPeek] = useState<number | null>(null);
  const [focus, setFocus] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [live, announce] = useAnnounce();

  const rnd = useRef(seededRandom(1));
  const seen = useRef(new Set<number>());
  const trialIdx = useRef(0);
  const t0 = useRef(0);
  const responded = useRef(false);
  const prompt = useRef<{ level: string; source: PromptSource }>({ level: 'IND', source: 'none' });
  const mistakes = useRef(0);
  const correct = useRef(0);
  const repeated = useRef(false);
  const startedRun = useRef<string | null>(null);
  const timers = useRef<number[]>([]);
  const cardEls = useRef<(HTMLButtonElement | null)[]>([]);
  const barnRef = useRef<HTMLDivElement>(null);

  const level: MemoryLevel | undefined = levels[levelIdx];
  const targetId = config?.clinical.targets[0]?.targetId ?? 'memoria-bichos';
  const slow = motion === 'static' ? 0.4 : motion === 'reduced' ? 0.8 : 1;

  useEffect(() => installAudioUnlock(), []);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const beginTrial = useCallback(
    (b: MemoryCard[]) => {
      t0.current = performance.now();
      responded.current = false;
      prompt.current = { level: 'IND', source: 'none' };
      setPeek(null);
      const presented = b.map((c) => c.id);
      client.trialStarted({ targetId, trialIndex: trialIdx.current, presented });
      client.stimulusPresented({ targetId, trialIndex: trialIdx.current, presented, positionOfTarget: null, modality: 'visual' });
    },
    [client, targetId],
  );

  const startLevel = useCallback(
    (idx: number, again = false) => {
      const lv = levels[idx];
      if (!lv) return;
      const b = buildBoard(lv, rnd.current);
      seen.current = new Set();
      mistakes.current = 0;
      correct.current = 0;
      cardEls.current = [];
      setLevelIdx(idx);
      setBoard(b);
      setOpen([]);
      setMatched([]);
      setFocus(0);
      setStage('intro');
      client.levelStarted({ levelId: lv.id, levelIndex: idx, fieldSize: Math.min(12, lv.pairs * 2), trialsPlanned: lv.pairs, difficulty: again ? 'repeat' : `${lv.pairs}-pares` });
      const intro = again ? `Vamos de novo com ${lv.pairs} pares. Olhe bem!` : `Fase ${idx + 1}: ${lv.pairs} pares de bichinhos.`;
      announce(intro);
      void speak(again ? 'Vamos de novo! Olhe bem onde cada bichinho está.' : 'Encontre os bichinhos iguais!', sound);
      const preview = again ? Math.max(lv.previewMs, 2000) : lv.previewMs;
      later(() => {
        if (preview > 0) {
          setStage('preview');
          announce('Espiada: memorize onde estão os bichos.');
          later(() => {
            setStage('play');
            beginTrial(b);
          }, preview);
        } else {
          setStage('play');
          beginTrial(b);
        }
      }, motion === 'static' ? 700 : 1500);
    },
    [levels, client, sound, motion, beginTrial, announce],
  );

  useEffect(() => {
    if (!config || startedRun.current === config.runId) return;
    startedRun.current = config.runId;
    rnd.current = seededRandom(config.clinical.seed + 11);
    client.gameStarted(manifest.version);
    startLevel(0);
  }, [config, client, startLevel]);

  // Pausa: não contamina a latência.
  const pausedAt = useRef<number | null>(null);
  useEffect(() => {
    if (!config) return;
    if (paused) {
      pausedAt.current = performance.now();
      client.paused();
    } else if (pausedAt.current != null) {
      t0.current += performance.now() - pausedAt.current;
      pausedAt.current = null;
      client.resumed();
    }
  }, [paused, client, config]);

  // Dica PEEK: com uma carta aberta e sem a segunda, o par certo "balança".
  const showPeek = useCallback(
    (source: Exclude<PromptSource, 'none'>, level: string) => {
      if (open.length !== 1) return;
      const p = partnerPos(board, open[0]!);
      if (p < 0) return;
      setPeek(p);
      if (prompt.current.source === 'none' || source === 'therapist') prompt.current = { level, source };
      client.promptPresented({ targetId, trialIndex: trialIdx.current, level, source, latencyMs: since(t0.current) });
    },
    [open, board, client, targetId],
  );

  useEffect(() => {
    if (!config || stage !== 'play' || paused || open.length !== 1) return;
    const after = config.adaptation.builtInPromptAfterMs;
    if (after == null) return;
    const id = window.setTimeout(() => showPeek('built_in', config.clinical.targets[0]?.promptHierarchy[1]?.code ?? 'PEEK'), after);
    return () => window.clearTimeout(id);
  }, [config, stage, paused, open, showPeek]);

  useEffect(
    () =>
      client.onCommand((c) => {
        if (c.kind !== 'SET_PROMPT') return;
        if (c.level === 'IND') {
          prompt.current = { level: 'IND', source: 'none' };
          return;
        }
        prompt.current = { level: c.level, source: 'therapist' };
        showPeek('therapist', c.level);
      }),
    [client, showPeek],
  );

  const finishLevel = useCallback(() => {
    if (!level || !config) return;
    const outcome = levelOutcome(mistakes.current, level.pairs, repeated.current);
    client.levelCompleted({ levelId: level.id, levelIndex: levelIdx, trialsCompleted: correct.current + mistakes.current, correct: correct.current, outcome });
    client.reinforcerPresented({ kind: 'animation', contingentOn: level.id, intensity: feedback === 'festive' ? 'festive' : 'subtle' });
    if (feedback !== 'none') playCue('reinforce', sound);
    setStage('between');
    if (outcome === 'repeated') {
      repeated.current = true;
      later(() => startLevel(levelIdx, true), 1800 * slow + 400);
      return;
    }
    repeated.current = false;
    if (levelIdx + 1 >= levels.length) {
      later(() => {
        setStage('done');
        announce('Você encontrou todos os bichinhos!');
        if (feedback !== 'none') playCue('complete', sound);
        void speak('Muito bem! Todos os bichinhos estão no celeiro!', sound);
        client.gameCompleted(trialIdx.current);
      }, 900);
    } else {
      later(() => startLevel(levelIdx + 1), 1800 * slow + 400);
    }
  }, [level, config, levelIdx, levels.length, client, feedback, sound, startLevel, slow, announce]);

  const flip = (pos: number) => {
    if (!config || paused || stage !== 'play') return;
    const card = board[pos];
    if (!card || open.includes(pos) || matched.includes(card.pairKey) || open.length >= 2) return;
    setFocus(pos);
    playTones(FLIP, sound);
    playCue('tap', sound);
    if (open.length === 0) {
      if (!responded.current) {
        responded.current = true;
        client.responseStarted({ targetId, trialIndex: trialIdx.current, latencyMs: since(t0.current), position: pos, inputMode: 'tap' });
      }
      seen.current.add(pos);
      setOpen([pos]);
      announce(`${card.label}. Onde está o outro?`);
      return;
    }
    const first = open[0]!;
    const res = evaluatePair(board, first, pos, seen.current);
    seen.current.add(pos);
    setOpen([first, pos]);
    setPeek(null);
    setStage('resolving');
    const latency = since(t0.current);
    client.responseRecorded({
      targetId,
      stimulusId: board[first]!.pairKey,
      trialIndex: trialIdx.current,
      presented: board.map((c) => c.id),
      positionOfTarget: res.positionOfTarget,
      selected: card.id,
      selectedPosition: pos,
      response: res.match ? 'correct' : 'incorrect',
      latencyMs: latency,
      promptLevel: prompt.current.level,
      promptSource: prompt.current.source,
      detail: { level: levelIdx, pairs: level?.pairs, firstPosition: first, knownMiss: res.knownMiss, revisit: res.revisit, cardsSeen: seen.current.size },
    });
    trialIdx.current += 1;

    if (res.match) {
      correct.current += 1;
      const motif = animalMotif(card.art).map((freq, i) => ({ freq, dur: 0.14, delay: 0.12 + i * 0.13, type: 'triangle' as const, attack: 0.02, decay: 0.08, sustain: 0.5, release: 0.2 }));
      if (feedback !== 'none') {
        playCue('correct', sound);
        playTones(motif, sound);
      }
      client.emit('REWARD_TRIGGERED', { kind: 'visual', contingentOn: targetId });
      announce(`Achou! ${card.label}. ${matched.length + 1} de ${level?.pairs ?? 0} pares.`);
      // O par voa para o celeiro (vetor calculado do centro da carta ao celeiro).
      const barn = barnRef.current?.getBoundingClientRect();
      for (const p of [first, pos]) {
        const el = cardEls.current[p];
        if (el && barn) {
          const r = el.getBoundingClientRect();
          el.style.setProperty('--mdb-dx', `${barn.left + barn.width / 2 - (r.left + r.width / 2)}px`);
          el.style.setProperty('--mdb-dy', `${barn.top + barn.height / 2 - (r.top + r.height / 2)}px`);
        }
      }
      later(() => setFlying(card.pairKey), 650 * slow);
      later(() => {
        const nextMatched = [...matched, card.pairKey];
        setMatched(nextMatched);
        setFound((f) => (f.includes(card.pairKey) ? f : [...f, card.pairKey]));
        setFlying(null);
        setOpen([]);
        if (nextMatched.length >= (level?.pairs ?? 0)) finishLevel();
        else {
          setStage('play');
          beginTrial(board);
        }
      }, 650 * slow + (motion === 'static' ? 200 : 700));
    } else {
      mistakes.current += 1;
      playCue('retry', sound);
      announce('Não são iguais. Vamos virar de volta.');
      later(() => setShake([first, pos]), 350 * slow);
      later(
        () => {
          setShake([]);
          setOpen([]);
          setStage('play');
          beginTrial(board);
        },
        Math.max(900, 1300 * slow),
      );
    }
  };

  const onGridKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!level) return;
    const n = board.length;
    const cols = level.cols;
    let next = focus;
    if (e.key === 'ArrowRight') next = Math.min(n - 1, focus + 1);
    else if (e.key === 'ArrowLeft') next = Math.max(0, focus - 1);
    else if (e.key === 'ArrowDown') next = Math.min(n - 1, focus + cols);
    else if (e.key === 'ArrowUp') next = Math.max(0, focus - cols);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = n - 1;
    else return;
    e.preventDefault();
    setFocus(next);
    cardEls.current[next]?.focus();
  };

  if (!config || !level) return <div className="mdb" aria-busy="true" />;
  const rows = Math.ceil(board.length / level.cols);

  return (
    <div
      className="mdb"
      data-palette={config.adaptation.palette}
      data-motion={motion}
      data-stage={stage}
      style={{ ['--mdb-scale' as string]: config.adaptation.touchScale, ['--mdb-cols' as string]: level.cols, ['--mdb-rows' as string]: rows }}
    >
      <header className="mdb-head">
        <ol className="mdb-levels" aria-label="Fases">
          {levels.map((l, i) => (
            <li key={l.id} data-state={i < levelIdx || stage === 'done' ? 'done' : i === levelIdx ? 'now' : 'next'} aria-label={`Fase ${i + 1}: ${l.pairs} pares`}>
              {l.pairs}
            </li>
          ))}
        </ol>
        <div className="mdb-title">{stage === 'preview' ? 'Olhe bem onde cada bicho está!' : 'Encontre os bichinhos iguais!'}</div>
      </header>

      <div className="mdb-board">
        <div className="mdb-grid" role="group" aria-label={`Tabuleiro com ${board.length} cartas, ${level.cols} por linha. Use as setas para andar.`}>
          {board.map((card, pos) => {
            const isMatched = matched.includes(card.pairKey);
            const faceUp = stage === 'preview' || open.includes(pos) || isMatched || flying === card.pairKey;
            const label = isMatched ? `Carta ${pos + 1}: ${card.label}, encontrado` : faceUp ? `Carta ${pos + 1}: ${card.label}` : `Carta ${pos + 1}, virada para baixo`;
            return (
              <button
                key={`${level.id}-${card.id}`}
                ref={(el) => {
                  cardEls.current[pos] = el;
                }}
                type="button"
                className="mdb-card"
                tabIndex={pos === focus ? 0 : -1}
                data-up={faceUp}
                data-matched={isMatched}
                data-flying={flying === card.pairKey}
                data-shake={shake.includes(pos)}
                data-peek={peek === pos}
                data-pair={open.length === 2 && open.includes(pos) ? 'open' : undefined}
                style={{ ['--mdb-i' as string]: pos }}
                disabled={isMatched}
                onClick={() => flip(pos)}
                onKeyDown={onGridKey}
                aria-label={label}
              >
                <span className="mdb-card__inner">
                  <span className="mdb-card__back">
                    <CardBack />
                  </span>
                  <span className="mdb-card__face">
                    <AnimalArt animal={card.art} title={card.label} />
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <footer className="mdb-foot">
        <div className="mdb-barn" ref={barnRef}>
          <Barn />
        </div>
        <div className="mdb-shelf" aria-label={`Bichos no celeiro: ${found.length}`}>
          {found.map((a) => (
            <span key={a} className="mdb-shelf__item">
              <AnimalArt animal={a} />
            </span>
          ))}
        </div>
        <div className="mdb-score" role="progressbar" aria-label="Pares nesta fase" aria-valuemin={0} aria-valuemax={level.pairs} aria-valuenow={matched.length}>
          {matched.length}/{level.pairs}
        </div>
      </footer>

      <p className="mdb-sr" aria-live="polite">{live}</p>

      {(stage === 'intro' || stage === 'between') && (
        <div className="mdb-banner" aria-hidden="true">
          {stage === 'intro' ? (
            <>
              <strong>Fase {levelIdx + 1}</strong>
              <span>{level.pairs} pares</span>
            </>
          ) : (
            <span>Muito bem!</span>
          )}
        </div>
      )}

      {(paused || ended) && stage !== 'done' && (
        <div className="mdb-overlay" role="status">
          <div className="mdb-overlay__badge">Pausa</div>
        </div>
      )}
      {stage === 'done' && (
        <div className="mdb-overlay mdb-overlay--done" role="status">
          <div className="mdb-overlay__badge">
            <div className="mdb-parade">
              {found.slice(0, 8).map((a) => (
                <span key={a}>
                  <AnimalArt animal={a} />
                </span>
              ))}
            </div>
            <span>Todos no celeiro!</span>
          </div>
        </div>
      )}
    </div>
  );
}
