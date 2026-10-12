import React from 'react';
import type { PuzzleTheme, PlacedPieceState, PromptLevel } from '../types/puzzle';
import { PuzzlePiece } from './PuzzlePiece';

interface PuzzleBoardProps {
  theme: PuzzleTheme;
  placedPieces: PlacedPieceState[];
  activePrompt: PromptLevel;
  targetPieceId: string | null;
  onCavityClick?: (pieceId: string) => void;
  scale?: number;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  theme,
  placedPieces,
  activePrompt,
  targetPieceId,
  onCavityClick,
  scale = 1,
}) => {
  const placedMap = new Map(placedPieces.map((p) => [p.pieceId, p]));

  return (
    <div
      style={{
        position: 'relative',
        width: theme.boardWidth * scale,
        height: theme.boardHeight * scale,
        borderRadius: '24px',
        backgroundColor: '#EAD7B5',
        backgroundImage: `
          radial-gradient(#D6BE93 15%, transparent 16%),
          linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)
        `,
        backgroundSize: '60px 60px, 120px 120px',
        boxShadow: `
          0 16px 36px rgba(45, 30, 15, 0.22),
          inset 0 2px 4px rgba(255, 255, 255, 0.7),
          inset 0 -4px 8px rgba(90, 60, 30, 0.25)
        `,
        border: '6px solid #C4A47C',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
      id="puzzle-board-container"
    >
      {/* Wood grain overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.12,
          pointerEvents: 'none',
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(90,50,20,0.4) 19px, transparent 20px)',
        }}
      />

      {/* Board title / subtle wood branding stamp */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          right: 20,
          fontFamily: 'var(--font-hud)',
          fontWeight: 800,
          fontSize: '0.82rem',
          color: 'rgba(90, 60, 30, 0.45)',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          pointerEvents: 'none',
        }}
      >
        PsicoPlay · {theme.name}
      </div>

      {/* Render Cavities (Base board layer) */}
      <svg
        width={theme.boardWidth * scale}
        height={theme.boardHeight * scale}
        viewBox={`0 0 ${theme.boardWidth} ${theme.boardHeight}`}
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          {/* Inner shadow filter for 4px cavity depth */}
          <filter id="cavity-depth-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feOffset dx="0" dy="4" />
            <feGaussianBlur stdDeviation="3.5" result="offset-blur" />
            <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
            <feFlood floodColor="rgba(45, 25, 10, 0.65)" result="color" />
            <feComposite operator="in" in="color" in2="inverse" result="shadow" />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
        </defs>

        {theme.pieces.map((piece) => {
          const placed = placedMap.get(piece.id);
          const isTargetPrompt = activePrompt === 'VIS' && targetPieceId === piece.id && !placed?.isPlaced;

          // Cavity position
          const x = piece.targetX - piece.width / 2;
          const y = piece.targetY - piece.height / 2;

          return (
            <g
              key={`cavity-${piece.id}`}
              transform={`translate(${x}, ${y})`}
              onClick={() => onCavityClick?.(piece.id)}
              style={{ cursor: placed?.isPlaced ? 'default' : 'pointer' }}
            >
              {/* Cavity recess shape with 4px inner depth */}
              <svg viewBox={piece.viewBox} width={piece.width} height={piece.height}>
                {/* Dark wood bottom of cavity */}
                <path
                  d={piece.pathD}
                  fill="#CDB596"
                  stroke="#A88B68"
                  strokeWidth="3"
                  filter="url(#cavity-depth-filter)"
                />

                {/* Subtle silhouette guide on cavity base */}
                <path
                  d={piece.pathD}
                  fill="none"
                  stroke="rgba(80, 50, 20, 0.35)"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />

                {/* Small peg indent in cavity bottom */}
                <circle
                  cx={piece.pegPosition.x}
                  cy={piece.pegPosition.y}
                  r="10"
                  fill="#A88B68"
                  stroke="rgba(40,20,10,0.4)"
                  strokeWidth="1.5"
                />

                {/* Visual prompt glow (VIS) */}
                {isTargetPrompt && (
                  <path
                    d={piece.pathD}
                    fill="none"
                    stroke="#F4A261"
                    strokeWidth="8"
                    strokeLinejoin="round"
                    style={{
                      animation: 'pulse 1s infinite alternate',
                    }}
                  />
                )}
              </svg>
            </g>
          );
        })}
      </svg>

      {/* Render Placed Pieces layer */}
      {theme.pieces.map((piece) => {
        const placed = placedMap.get(piece.id);
        if (!placed?.isPlaced) return null;

        const x = (piece.targetX - piece.width / 2) * scale;
        const y = (piece.targetY - piece.height / 2) * scale;

        return (
          <div
            key={`placed-${piece.id}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              pointerEvents: 'none',
              animation: 'settleSnap 0.24s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
            }}
          >
            <PuzzlePiece
              piece={piece}
              currentAngle={placed.currentAngle}
              scale={scale}
              showPeg={true}
              showRotateHint={false}
            />
          </div>
        );
      })}

      {/* Gestural Prompt Animation (GEST) */}
      {activePrompt === 'GEST' && targetPieceId && (
        <div
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            animation: 'ghostGlide 2s infinite ease-in-out',
            transform: `translate(${
              (theme.pieces.find((p) => p.id === targetPieceId)?.targetX || 200) * scale - 25
            }px, ${
              (theme.pieces.find((p) => p.id === targetPieceId)?.targetY || 150) * scale - 25
            }px)`,
          }}
        >
          <div
            style={{
              fontSize: '36px',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))',
            }}
          >
            👉
          </div>
          <span
            style={{
              background: 'var(--igarape)',
              color: '#FFFFFF',
              padding: '4px 10px',
              borderRadius: '8px',
              fontFamily: 'var(--font-hud)',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            Encaixe aqui!
          </span>
        </div>
      )}
    </div>
  );
};
