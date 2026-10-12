import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import type { PuzzleTheme } from '../types/puzzle';

interface CelebrationOverlayProps {
  theme: PuzzleTheme;
  k: number;
  totalPieces: number;
  onNext: () => void;
  onReplay: () => void;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  theme,
  k,
  totalPieces,
  onNext,
  onReplay,
}) => {
  useEffect(() => {
    // Gentle celebration burst (calm colors, non-overstimulating)
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#2D6A4F', '#0E8388', '#F4A261', '#E9C46A'],
      disableForReducedMotion: true,
    });
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(30, 37, 43, 0.45)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        animation: 'fadeIn 0.25s ease-out',
      }}
      id="celebration-overlay"
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '28px',
          padding: '32px 36px',
          maxWidth: '480px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 20px 45px rgba(0,0,0,0.25)',
          border: '4px solid var(--buriti)',
          animation: 'scaleUp 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
        }}
      >
        {/* Animated Trophy badge */}
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            backgroundColor: 'rgba(244, 162, 97, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--buriti)',
            animation: 'gentleWiggle 2s infinite ease-in-out',
          }}
        >
          <Trophy size={48} />
        </div>

        <div>
          <h2
            style={{
              fontFamily: 'var(--font-hud)',
              fontSize: '1.8rem',
              fontWeight: 800,
              color: 'var(--tinta)',
              margin: '0 0 6px 0',
            }}
          >
            Encaixe Perfeito!
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-corpo)',
              fontSize: '1rem',
              color: 'var(--tinta-60)',
              margin: 0,
            }}
          >
            Você completou o quebra-cabeça <strong>{theme.name}</strong>!
          </p>
        </div>

        {/* Natural reinforcement visual widget */}
        <div
          style={{
            background: 'var(--fundo)',
            borderRadius: '16px',
            padding: '12px 18px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            border: '1.5px solid var(--tinta-15)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--tinta-60)', fontFamily: 'var(--font-hud)' }}>
              Passos da Cadeia
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--vitoria-regia)' }}>
              {k} de {totalPieces}
            </div>
          </div>
          <div style={{ height: '32px', width: '1px', background: 'var(--tinta-15)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--tinta-60)', fontFamily: 'var(--font-hud)' }}>
              Reforço Natural
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--buriti)', fontWeight: 700 }}>
              <Sparkles size={16} /> A cena ganhou vida!
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            width: '100%',
            marginTop: '8px',
          }}
        >
          <button
            onClick={onReplay}
            style={{
              flex: 1,
              height: '54px',
              borderRadius: '14px',
              border: '2px solid var(--tinta-15)',
              background: '#FFFFFF',
              color: 'var(--tinta)',
              fontFamily: 'var(--font-hud)',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <RotateCcw size={18} /> Jogar Novamente
          </button>

          <button
            onClick={onNext}
            style={{
              flex: 1.3,
              height: '54px',
              borderRadius: '14px',
              border: 'none',
              background: 'var(--vitoria-regia)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-hud)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(45, 106, 79, 0.35)',
            }}
            id="btn-next-puzzle"
          >
            <span>Próximo Passo</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
