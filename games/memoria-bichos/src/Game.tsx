import { useEffect, useMemo, useRef, useState } from 'react';
import { playTones, useGameClient, useMotion } from '@aprumo/game-sdk';
import { StimulusArt } from '@aprumo/stimuli';
import { isMatch, type MemoryCard, planMemoryBoard } from './logic';
import { manifest } from './manifest';
import './game.css';

const FLIP = [{ freq: 900, dur: 0.04, type: 'sine' as const }];
const MATCH = [
  { freq: 523.25, dur: 0.12, type: 'triangle' as const },
  { freq: 659.25, dur: 0.12, type: 'triangle' as const, delay: 0.1 },
  { freq: 783.99, dur: 0.22, type: 'triangle' as const, delay: 0.2 },
];
const MISS = [{ freq: 280, dur: 0.14, type: 'sine' as const }];

export default function MemoriaBichos() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);
  const cards = useMemo(() => (config ? planMemoryBoard(config) : []), [config]);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const trialStartRef = useRef<number>(Date.now());
  const busyRef = useRef(false);

  const sound = config?.adaptation.sound ?? 'low';
  const totalPairs = cards.length / 2;

  useEffect(() => {
    if (config) {
      client.emit('SESSION_STARTED', { configVersion: manifest.version });
      client.emit('TRIAL_STARTED', { trialIndex: 0, targetId: 'memoria-1', presented: cards.map((c) => c.pairKey) });
      trialStartRef.current = Date.now();
    }
  }, [config, client, cards]);

  if (!config) return <div className="mdb" aria-busy="true" />;
  const scale = config.adaptation.touchScale;

  const onCardClick = (card: MemoryCard) => {
    if (busyRef.current || flipped.includes(card.id) || matched.includes(card.pairKey)) {
      return;
    }

    playTones(FLIP, sound);
    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      busyRef.current = true;
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId)!;
      const secondCard = cards.find((c) => c.id === secondId)!;
      const latencyMs = Date.now() - trialStartRef.current;

      if (isMatch(firstCard, secondCard)) {
        playTones(MATCH, sound);
        const newMatched = [...matched, firstCard.pairKey];
        setMatched(newMatched);
        setFlipped([]);
        busyRef.current = false;

        client.emit('TRIAL_COMPLETED', {
          trialIndex: newMatched.length - 1,
          targetId: firstCard.pairKey,
          stimulusId: firstCard.pairKey,
          presented: cards.map((c) => c.pairKey),
          positionOfTarget: 0,
          selected: firstCard.pairKey,
          selectedPosition: 0,
          response: 'correct',
          latencyMs,
          promptLevel: 'IND',
          promptSource: 'none',
          detail: {},
        });

        if (newMatched.length === totalPairs) {
          setDone(true);
          client.emit('REWARD_TRIGGERED', { kind: 'visual', contingentOn: 'todos-pares' });
          client.emit('SESSION_COMPLETED', {
            trialsCompleted: totalPairs,
          });
        } else {
          trialStartRef.current = Date.now();
          client.emit('TRIAL_STARTED', { trialIndex: newMatched.length, targetId: `memoria-${newMatched.length + 1}`, presented: cards.map((c) => c.pairKey) });
        }
      } else {
        playTones(MISS, sound);
        client.emit('TRIAL_COMPLETED', {
          trialIndex: matched.length,
          targetId: firstCard.pairKey,
          stimulusId: secondCard.pairKey,
          presented: cards.map((c) => c.pairKey),
          positionOfTarget: 0,
          selected: secondCard.pairKey,
          selectedPosition: 1,
          response: 'incorrect',
          latencyMs,
          promptLevel: 'IND',
          promptSource: 'none',
          detail: {},
        });

        window.setTimeout(() => {
          setFlipped([]);
          busyRef.current = false;
          trialStartRef.current = Date.now();
        }, motion === 'static' ? 400 : 800);
      }
    }
  };

  return (
    <div className="mdb" data-palette={config.adaptation.palette} data-motion={motion} style={{ ['--mdb-scale' as string]: scale }}>
      <div className="mdb-title">Encontre os bichinhos iguais!</div>

      <div className="mdb-grid" data-cols={totalPairs > 2 ? '3' : '2'} role="group" aria-label="Tabuleiro de cartas de memória">
        {cards.map((card) => {
          const isCardFlipped = flipped.includes(card.id) || matched.includes(card.pairKey);
          const isCardMatched = matched.includes(card.pairKey);

          return (
            <button
              key={card.id}
              className="mdb-card-btn"
              data-flipped={isCardFlipped}
              data-matched={isCardMatched}
              onClick={() => onCardClick(card)}
              aria-label={isCardFlipped ? card.label : 'Carta virada para baixo'}
            >
              <div className="mdb-card-inner">
                <div className="mdb-card-front" aria-hidden="true">🐾</div>
                <div className="mdb-card-back">
                  <div className="mdb-card-icon">
                    <StimulusArt art={card.art} label={card.label} />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mdb-score">
        <span>Pares encontrados: {matched.length} de {totalPairs}</span>
      </div>

      {(paused || ended) && !done && (
        <div className="mdb-overlay" role="status">
          <div className="mdb-overlay__badge">
            <span>Pausa</span>
          </div>
        </div>
      )}

      {done && (
        <div className="mdb-overlay" role="status">
          <div className="mdb-overlay__badge">
            <span>Muito bem! Você achou todos os pares!</span>
          </div>
        </div>
      )}
    </div>
  );
}
