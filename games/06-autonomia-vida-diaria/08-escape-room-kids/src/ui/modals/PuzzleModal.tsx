// ==========================================================================
// ESCAPE ROOM KIDS — INTERACTIVE PUZZLE MINI-GAMES MODAL
// Symbol Lock, Gear Train, Laser Mirror, Book Order, Constellation, Bells, Balance, Water, Colors
// ==========================================================================

import React, { useState } from 'react';
import { useGameStore } from '../../state/gameStore';
import { soundManager } from '../../audio/soundManager';
import { X as _X, CheckCircle as _CC, RotateCw as _RC, Volume2 as _V2, ArrowUpDown as _AUD } from 'lucide-react';

const X = _X as any;
const CheckCircle = _CC as any;
const RotateCw = _RC as any;
const Volume2 = _V2 as any;
const ArrowUpDown = _AUD as any;

export const PuzzleModal: React.FC = () => {
  const {
    activePuzzle,
    closePuzzle,
    solvePuzzle,
    inventory,
    showToast,
  } = useGameStore();

  if (!activePuzzle) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
        animation: 'popIn 200ms ease-out',
      }}
      onClick={closePuzzle}
    >
      <div
        className="clay-card"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid var(--color-border)',
            paddingBottom: '12px',
            marginBottom: '16px',
          }}
        >
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: '#0F172A' }}>
              {activePuzzle.title}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginTop: '2px' }}>
              {activePuzzle.description}
            </p>
          </div>
          <button
            onClick={closePuzzle}
            className="clay-btn clay-btn-glass"
            style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', padding: 0 }}
            aria-label="Fechar Enigma"
          >
            <X size={20} />
          </button>
        </div>

        {/* Puzzle Mini-Game Dispatcher */}
        <div style={{ padding: '8px 0', minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {activePuzzle.type === 'symbolLock' && <SymbolLockGame onSolve={() => solvePuzzle(activePuzzle.id)} />}
          {activePuzzle.type === 'gearTrain' && <GearTrainGame onSolve={() => solvePuzzle(activePuzzle.id)} />}
          {activePuzzle.type === 'lightBeam' && <LightBeamGame onSolve={() => solvePuzzle(activePuzzle.id)} />}
          {activePuzzle.type === 'bookOrder' && <BookOrderGame onSolve={() => solvePuzzle(activePuzzle.id)} />}
          {activePuzzle.type === 'constellation' && <ConstellationGame onSolve={() => solvePuzzle(activePuzzle.id)} />}
          {activePuzzle.type === 'soundSequence' && <SoundSequenceGame onSolve={() => solvePuzzle(activePuzzle.id)} />}
          {activePuzzle.type === 'weightBalance' && <WeightBalanceGame onSolve={() => solvePuzzle(activePuzzle.id)} />}
          {activePuzzle.type === 'waterCircuit' && <WaterCircuitGame onSolve={() => solvePuzzle(activePuzzle.id)} />}
          {activePuzzle.type === 'colorMixing' && <ColorMixingGame onSolve={() => solvePuzzle(activePuzzle.id)} />}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 1. SYMBOL LOCK MINI-GAME
// ==========================================
const SymbolLockGame: React.FC<{ onSolve: () => void }> = ({ onSolve }) => {
  const symbols = ['🔨 Martelo', '⚙️ Engrenagem', '🔧 Chave', '⭐ Estrela', '🗝️ Chave Antiga'];
  const [dials, setDials] = useState([0, 2, 4]);
  const [solved, setSolved] = useState(false);

  const rotate = (index: number) => {
    soundManager.playGearClick();
    const updated = [...dials];
    updated[index] = ((updated[index] ?? 0) + 1) % symbols.length;
    setDials(updated);

    // Target solution: Martelo (0), Engrenagem (1), Chave (2)
    if (updated[0] === 0 && updated[1] === 1 && updated[2] === 2) {
      setSolved(true);
      setTimeout(onSolve, 600);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        {dials.map((dialIdx, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => rotate(i)}
              className="clay-btn clay-btn-glass"
              style={{
                width: '120px',
                height: '80px',
                fontSize: '1rem',
                flexDirection: 'column',
                borderRadius: '16px',
                border: dialIdx === i ? '3px solid #10B981' : '3px solid #E2E8F0',
                background: '#F8FAFC',
              }}
            >
              <span>{symbols[dialIdx]}</span>
              <RotateCw size={16} color="#64748B" />
            </button>
          </div>
        ))}
      </div>
      {solved && (
        <div style={{ color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
          <CheckCircle size={22} />
          <span>Combinação Correta! O baú se abriu!</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. GEAR TRAIN MINI-GAME
// ==========================================
const GearTrainGame: React.FC<{ onSolve: () => void }> = ({ onSolve }) => {
  const { inventory } = useGameStore();
  const hasBrassGear = inventory.some((i) => i.id === 'gear_brass');
  const [placed, setPlaced] = useState(false);

  const handlePlace = () => {
    if (!hasBrassGear) {
      soundManager.playClick(300);
      return;
    }
    soundManager.playGearClick();
    setPlaced(true);
    setTimeout(onSolve, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="inventory-slot active" style={{ width: '80px', height: '80px' }}>
          <span style={{ fontSize: '24px' }}>⚙️</span>
        </div>
        <span style={{ fontSize: '20px', color: '#F59E0B' }}>➔</span>
        <div className="inventory-slot active" style={{ width: '90px', height: '90px' }}>
          <span style={{ fontSize: '32px' }}>⚙️</span>
        </div>
        <span style={{ fontSize: '20px', color: '#F59E0B' }}>➔</span>
        <div
          onClick={handlePlace}
          className={`inventory-slot ${placed ? 'active' : ''}`}
          style={{
            width: '110px',
            height: '110px',
            border: placed ? '3px solid #10B981' : '3px dashed #F59E0B',
            cursor: hasBrassGear ? 'pointer' : 'default',
          }}
        >
          {placed ? (
            <span style={{ fontSize: '42px' }}>⚙️</span>
          ) : (
            <span style={{ fontSize: '13px', textAlign: 'center', color: '#94A3B8', padding: '6px' }}>
              {hasBrassGear ? 'Clique para Encaixar a Engrenagem de Bronze!' : 'Falta a Engrenagem de Bronze (encontre no baú)'}
            </span>
          )}
        </div>
      </div>
      {placed && (
        <div style={{ color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={20} />
          <span>O dínamo começou a girar a toda velocidade!</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. LIGHT BEAM MINI-GAME
// ==========================================
const LightBeamGame: React.FC<{ onSolve: () => void }> = ({ onSolve }) => {
  const [mirror1, setMirror1] = useState(0); // 0, 90, 180, 270
  const [mirror2, setMirror2] = useState(0);

  const rotate1 = () => {
    soundManager.playClick();
    const next = (mirror1 + 90) % 360;
    setMirror1(next);
    checkSolution(next, mirror2);
  };

  const rotate2 = () => {
    soundManager.playClick();
    const next = (mirror2 + 90) % 360;
    setMirror2(next);
    checkSolution(mirror1, next);
  };

  const checkSolution = (m1: number, m2: number) => {
    if (m1 === 90 && m2 === 180) {
      setTimeout(onSolve, 600);
    }
  };

  const isAligned = mirror1 === 90 && mirror2 === 180;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <button
          onClick={rotate1}
          className="clay-btn clay-btn-glass"
          style={{ width: '120px', height: '90px', flexDirection: 'column', borderRadius: '16px' }}
        >
          <span style={{ fontSize: '24px', transform: `rotate(${mirror1}deg)`, transition: 'transform 200ms ease' }}>
            🪞
          </span>
          <span style={{ fontSize: '12px' }}>Espelho 1 ({mirror1}°)</span>
        </button>

        <span style={{ fontSize: '24px', color: isAligned ? '#10B981' : '#38BDF8' }}>
          {isAligned ? '⚡═══⚡' : '░░░░░'}
        </span>

        <button
          onClick={rotate2}
          className="clay-btn clay-btn-glass"
          style={{ width: '120px', height: '90px', flexDirection: 'column', borderRadius: '16px' }}
        >
          <span style={{ fontSize: '24px', transform: `rotate(${mirror2}deg)`, transition: 'transform 200ms ease' }}>
            🪞
          </span>
          <span style={{ fontSize: '12px' }}>Espelho 2 ({mirror2}°)</span>
        </button>
      </div>

      {isAligned ? (
        <div style={{ color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={20} />
          <span>Feixe Alinhado! A Mola Relojoeira caiu no pedestal!</span>
        </div>
      ) : (
        <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
          Gire os espelhos para desviar a luz até o receptor solar
        </span>
      )}
    </div>
  );
};

// ==========================================
// 4. BOOK ORDER MINI-GAME
// ==========================================
const BookOrderGame: React.FC<{ onSolve: () => void }> = ({ onSolve }) => {
  const [books, setBooks] = useState([
    { id: 'b3', name: 'Tomo da Terra', color: '#10B981' },
    { id: 'b1', name: 'Tomo do Fogo', color: '#EF4444' },
    { id: 'b4', name: 'Tomo do Sol', color: '#FBBF24' },
    { id: 'b2', name: 'Tomo da Água', color: '#3B82F6' },
  ]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleClick = (idx: number) => {
    soundManager.playWoodSlide();
    if (selectedIdx === null) {
      setSelectedIdx(idx);
    } else {
      const updated = [...books];
      const temp = updated[selectedIdx]!;
      updated[selectedIdx] = updated[idx]!;
      updated[idx] = temp;
      setBooks(updated);
      setSelectedIdx(null);

      // Target order: b1, b2, b3, b4
      if (
        updated[0]?.id === 'b1' &&
        updated[1]?.id === 'b2' &&
        updated[2]?.id === 'b3' &&
        updated[3]?.id === 'b4'
      ) {
        setTimeout(onSolve, 600);
      }
    }
  };

  const isSolved =
    books[0]?.id === 'b1' &&
    books[1]?.id === 'b2' &&
    books[2]?.id === 'b3' &&
    books[3]?.id === 'b4';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        {books.map((b, i) => (
          <button
            key={b.id}
            onClick={() => handleClick(i)}
            className="clay-btn"
            style={{
              width: '90px',
              height: '110px',
              backgroundColor: b.color,
              color: '#FFFFFF',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '10px 4px',
              border: selectedIdx === i ? '4px solid #F59E0B' : '3px solid rgba(255,255,255,0.8)',
              transform: selectedIdx === i ? 'translateY(-6px)' : 'none',
            }}
          >
            <span style={{ fontSize: '20px' }}>📖</span>
            <span style={{ fontSize: '11px', textAlign: 'center', fontWeight: 700 }}>{b.name}</span>
            <ArrowUpDown size={14} />
          </button>
        ))}
      </div>
      <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
        {isSolved ? 'Ordem elemental perfeita! O Disco de Astrolábio apareceu!' : 'Clique em dois livros para trocar suas posições (Fogo, Água, Terra, Sol)'}
      </span>
    </div>
  );
};

// ==========================================
// 5. CONSTELLATION MINI-GAME
// ==========================================
const ConstellationGame: React.FC<{ onSolve: () => void }> = ({ onSolve }) => {
  const [angle, setAngle] = useState(0);

  const rotateGlobe = (deltaAngle: number) => {
    soundManager.playGearClick();
    const next = (angle + deltaAngle + 360) % 360;
    setAngle(next);
    if (next === 180) {
      setTimeout(onSolve, 600);
    }
  };

  const isAligned = angle === 180;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
      <div
        style={{
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #312E81, #0F172A)',
          border: isAligned ? '4px solid #10B981' : '4px solid #F59E0B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotate(${angle}deg)`,
          transition: 'transform 250ms ease',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        }}
      >
        <span style={{ fontSize: '50px' }}>🦅</span>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <button onClick={() => rotateGlobe(-45)} className="clay-btn clay-btn-glass">
          ⟲ Girar Esquerda
        </button>
        <button onClick={() => rotateGlobe(45)} className="clay-btn clay-btn-glass">
          Girada Direita ⟳
        </button>
      </div>

      <span style={{ fontSize: '0.85rem', color: isAligned ? '#10B981' : '#64748B', fontWeight: isAligned ? 700 : 400 }}>
        {isAligned ? 'Constelação da Fênix Alinhada! A Lupa dos Arcanos foi revelada!' : 'Alinhe a Constelação da Fênix com o topo celestial'}
      </span>
    </div>
  );
};

// ==========================================
// 6. SOUND SEQUENCE MINI-GAME
// ==========================================
const SoundSequenceGame: React.FC<{ onSolve: () => void }> = ({ onSolve }) => {
  const bells = [
    { id: 1, note: 'Dó', color: '#38BDF8', freq: 523.25 },
    { id: 2, note: 'Mi', color: '#34D399', freq: 659.25 },
    { id: 3, note: 'Sol', color: '#FBBF24', freq: 783.99 },
    { id: 4, note: 'Lá', color: '#C084FC', freq: 880.00 },
  ];

  const targetSequence = [1, 3, 2, 4];
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);

  const handleRing = (id: number, freq: number) => {
    soundManager.playChime(freq);
    const updated = [...playerSeq, id];
    setPlayerSeq(updated);

    // Check if matches target so far
    for (let i = 0; i < updated.length; i++) {
      if (updated[i] !== targetSequence[i]) {
        // Wrong note, gentle reset
        setTimeout(() => setPlayerSeq([]), 400);
        return;
      }
    }

    if (updated.length === targetSequence.length) {
      setTimeout(onSolve, 600);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '14px' }}>
        {bells.map((bell) => (
          <button
            key={bell.id}
            onClick={() => handleRing(bell.id, bell.freq)}
            className="clay-btn"
            style={{
              width: '80px',
              height: '100px',
              backgroundColor: bell.color,
              color: '#FFFFFF',
              flexDirection: 'column',
              borderRadius: '20px',
            }}
          >
            <Volume2 size={24} />
            <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{bell.note}</span>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.9rem', color: '#64748B' }}>Notas tocadas:</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: playerSeq.length > idx ? '#10B981' : '#E2E8F0',
                transition: 'background 200ms ease',
              }}
            />
          ))}
        </div>
      </div>
      <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
        Toque a melodia indicada na partitura: Dó ➔ Sol ➔ Mi ➔ Lá
      </span>
    </div>
  );
};

// ==========================================
// 7. WEIGHT BALANCE MINI-GAME
// ==========================================
const WeightBalanceGame: React.FC<{ onSolve: () => void }> = ({ onSolve }) => {
  const [leftPan, setLeftPan] = useState<number[]>([3]); // Solar Acorn = 3
  const [rightPan, setRightPan] = useState<number[]>([1]); // Moon Seed = 1
  const [pool, setPool] = useState<number[]>([2]); // Crystal Berry = 2

  const leftWeight = leftPan.reduce((a, b) => a + b, 0);
  const rightWeight = rightPan.reduce((a, b) => a + b, 0);
  const isBalanced = leftWeight === rightWeight && leftWeight > 0;

  const movePoolToRight = (weight: number) => {
    soundManager.playClick();
    setPool(pool.filter((w) => w !== weight));
    const nextRight = [...rightPan, weight];
    setRightPan(nextRight);

    if (leftWeight === nextRight.reduce((a, b) => a + b, 0)) {
      setTimeout(onSolve, 600);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Left Pan */}
        <div className="clay-card" style={{ padding: '12px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Prato Esquerdo</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D97706' }}>🌰 Bolota ({leftWeight}kg)</div>
        </div>

        <span style={{ fontSize: '24px', fontWeight: 800, color: isBalanced ? '#10B981' : '#EF4444' }}>
          {isBalanced ? '⚖️ Equilibrado!' : leftWeight > rightWeight ? '⚖️ ⤹' : '⚖️ ⤸'}
        </span>

        {/* Right Pan */}
        <div className="clay-card" style={{ padding: '12px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Prato Direito</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>
            {rightPan.map((w) => (w === 1 ? '🌙(1kg) ' : '💎(2kg) '))} ({rightWeight}kg)
          </div>
        </div>
      </div>

      {pool.length > 0 && (
        <div style={{ display: 'flex', gap: '10px' }}>
          {pool.map((w) => (
            <button
              key={w}
              onClick={() => movePoolToRight(w)}
              className="clay-btn clay-btn-accent"
              style={{ fontSize: '0.9rem' }}
            >
              Adicionar Fruta de Cristal (2kg) ao Prato Direito
            </button>
          ))}
        </div>
      )}

      {isBalanced && (
        <div style={{ color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={20} />
          <span>Equilíbrio Perfeito! O compartimento liberou a Lente Solar!</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 8. WATER CIRCUIT MINI-GAME
// ==========================================
const WaterCircuitGame: React.FC<{ onSolve: () => void }> = ({ onSolve }) => {
  const [valves, setValves] = useState([0, 90, 0, 90]);

  const rotate = (idx: number) => {
    soundManager.playGearClick();
    const updated = [...valves];
    updated[idx] = ((updated[idx] ?? 0) + 90) % 360;
    setValves(updated);

    // Target alignment: 0 (horizontal), 0 (horizontal), 0, 0
    if (updated.every((v) => v === 0 || v === 180)) {
      setTimeout(onSolve, 600);
    }
  };

  const isConnected = valves.every((v) => v === 0 || v === 180);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '16px' }}>
        {valves.map((deg, i) => (
          <button
            key={i}
            onClick={() => rotate(i)}
            className="clay-btn clay-btn-glass"
            style={{
              width: '90px',
              height: '90px',
              flexDirection: 'column',
              border: deg === 0 || deg === 180 ? '3px solid #0284C7' : '3px solid #E2E8F0',
            }}
          >
            <span style={{ fontSize: '32px', transform: `rotate(${deg}deg)`, transition: 'transform 200ms ease' }}>
              💧═
            </span>
            <span style={{ fontSize: '11px' }}>Válvula {i + 1}</span>
          </button>
        ))}
      </div>
      <span style={{ fontSize: '0.85rem', color: isConnected ? '#10B981' : '#64748B', fontWeight: isConnected ? 700 : 400 }}>
        {isConnected ? 'Água fluindo para o canteiro! O Bulbo Dourado brotou!' : 'Gire as 4 válvulas para alinhar o canal de água (posição horizontal)'}
      </span>
    </div>
  );
};

// ==========================================
// 9. COLOR MIXING MINI-GAME
// ==========================================
const ColorMixingGame: React.FC<{ onSolve: () => void }> = ({ onSolve }) => {
  const [yellowActive, setYellowActive] = useState(false);
  const [blueActive, setBlueActive] = useState(false);

  const toggleYellow = () => {
    soundManager.playClick();
    const next = !yellowActive;
    setYellowActive(next);
    if (next && blueActive) setTimeout(onSolve, 600);
  };

  const toggleBlue = () => {
    soundManager.playClick();
    const next = !blueActive;
    setBlueActive(next);
    if (next && yellowActive) setTimeout(onSolve, 600);
  };

  const isEmerald = yellowActive && blueActive;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button
          onClick={toggleYellow}
          className={`clay-btn ${yellowActive ? 'clay-btn-accent' : 'clay-btn-glass'}`}
        >
          🟡 Filtro Amarelo
        </button>

        <span style={{ fontSize: '24px' }}>+</span>

        <button
          onClick={toggleBlue}
          className={`clay-btn ${blueActive ? 'clay-btn-primary' : 'clay-btn-glass'}`}
        >
          🔵 Filtro Azul
        </button>

        <span style={{ fontSize: '24px' }}>=</span>

        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: isEmerald ? '#10B981' : yellowActive ? '#FBBF24' : blueActive ? '#3B82F6' : '#94A3B8',
            boxShadow: isEmerald ? '0 0 20px #10B981' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '22px',
          }}
        >
          {isEmerald ? '🌱' : '☀️'}
        </div>
      </div>

      <span style={{ fontSize: '0.85rem', color: isEmerald ? '#10B981' : '#64748B', fontWeight: isEmerald ? 700 : 400 }}>
        {isEmerald ? 'Raio Esmeralda Ativado! O mecanismo do portão despertou!' : 'Combine a luz solar amarela com o cristal azul para despertar a planta'}
      </span>
    </div>
  );
};
