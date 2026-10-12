import React from 'react';
import type { PuzzlePieceDef } from '../types/puzzle';

interface PuzzlePieceProps {
  piece: PuzzlePieceDef;
  currentAngle?: number;
  isDragging?: boolean;
  isSelected?: boolean;
  isInTray?: boolean;
  showRotateHint?: boolean;
  showPeg?: boolean;
  scale?: number;
  onClick?: () => void;
  onRotate?: () => void;
  style?: React.CSSProperties;
}

export const PuzzlePiece: React.FC<PuzzlePieceProps> = ({
  piece,
  currentAngle = 0,
  isDragging = false,
  isSelected = false,
  isInTray = false,
  showRotateHint = false,
  showPeg = true,
  scale = 1,
  onClick,
  onRotate,
  style,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        width: piece.width * scale,
        height: piece.height * scale,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `rotate(${currentAngle}deg) scale(${isDragging ? 1.06 : 1})`,
        transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.2)',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none',
        filter: isDragging
          ? 'drop-shadow(0 14px 22px rgba(0,0,0,0.35))'
          : isSelected
          ? 'drop-shadow(0 0 10px rgba(244, 162, 97, 0.85)) drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
          : 'drop-shadow(0 4px 8px rgba(0,0,0,0.18))',
        ...style,
      }}
      title={`${piece.name} - Toque para selecionar / arrastar`}
      role="button"
      tabIndex={0}
    >
      {/* SVG Shape with wooden bevel & vibrant colors */}
      <svg
        viewBox={piece.viewBox}
        width="100%"
        height="100%"
        style={{
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <filter id={`wood-bevel-${piece.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#FFFFFF" floodOpacity="0.45" />
            <feDropShadow dx="0" dy="-2" stdDeviation="2" floodColor="#000000" floodOpacity="0.35" />
          </filter>
          <radialGradient id={`peg-grad-${piece.id}`} cx="38%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFE0B2" />
            <stop offset="45%" stopColor="#D4A373" />
            <stop offset="85%" stopColor="#8D5B29" />
            <stop offset="100%" stopColor="#5D3A1A" />
          </radialGradient>
        </defs>

        {/* Piece base path */}
        <path
          d={piece.pathD}
          fill={piece.color}
          stroke={piece.accentColor || '#FFFFFF'}
          strokeWidth="3.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter={`url(#wood-bevel-${piece.id})`}
        />

        {/* Tactile 3D Wooden Peg (Pino de Madeira para Preensão) */}
        {showPeg && (
          <g transform={`translate(${piece.pegPosition.x}, ${piece.pegPosition.y})`}>
            {/* Peg shadow on piece */}
            <ellipse cx="0" cy="5" rx="14" ry="7" fill="rgba(0,0,0,0.28)" />
            {/* Peg cylindrical base */}
            <circle cx="0" cy="0" r="14" fill={`url(#peg-grad-${piece.id})`} stroke="#4A2E12" strokeWidth="1.2" />
            {/* Peg top cap highlight */}
            <circle cx="-3" cy="-3" r="6" fill="#FFF3E0" opacity="0.65" />
            {/* Grip ring texture */}
            <circle cx="0" cy="0" r="9" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" strokeDasharray="2,2" />
          </g>
        )}
      </svg>

      {/* Rotation hint curved arrow (prompt ROTATION) */}
      {showRotateHint && (
        <div
          style={{
            position: 'absolute',
            top: -24,
            right: -24,
            background: 'var(--buriti)',
            color: '#FFFFFF',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
            fontSize: '18px',
            animation: 'pulse 1.2s infinite',
            zIndex: 10,
          }}
          title="Dica de rotação: gire a peça!"
        >
          ↻
        </div>
      )}

      {/* Quick rotate touch button on tray piece if selected */}
      {isSelected && isInTray && onRotate && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRotate();
          }}
          style={{
            position: 'absolute',
            bottom: -14,
            right: -14,
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'var(--vitoria-regia)',
            color: '#FFFFFF',
            border: '2px solid #FFFFFF',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            cursor: 'pointer',
            zIndex: 20,
          }}
          title="Girar peça 90°"
          aria-label="Girar peça 90°"
        >
          ↻
        </button>
      )}
    </div>
  );
};
