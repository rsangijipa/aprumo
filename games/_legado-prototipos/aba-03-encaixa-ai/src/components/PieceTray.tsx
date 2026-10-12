import React from 'react';
import type { PuzzlePieceDef, PromptLevel } from '../types/puzzle';
import { PuzzlePiece } from './PuzzlePiece';
import { RotateCw, Sparkles } from 'lucide-react';

interface PieceTrayProps {
  pieces: PuzzlePieceDef[];
  selectedPieceId: string | null;
  activePrompt: PromptLevel;
  targetPieceId: string | null;
  allowRotation: boolean;
  pieceAngles: Record<string, number>;
  onSelectPiece: (pieceId: string) => void;
  onRotatePiece: (pieceId: string) => void;
  onStartDrag: (piece: PuzzlePieceDef, event: React.PointerEvent) => void;
  isLeftHanded?: boolean;
}

export const PieceTray: React.FC<PieceTrayProps> = ({
  pieces,
  selectedPieceId,
  activePrompt,
  targetPieceId,
  allowRotation,
  pieceAngles,
  onSelectPiece,
  onRotatePiece,
  onStartDrag,
  isLeftHanded = false,
}) => {
  const selectedPiece = pieces.find((p) => p.id === selectedPieceId);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '240px',
        minWidth: '220px',
        maxHeight: '520px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '16px',
        boxShadow: '0 10px 25px rgba(30, 37, 43, 0.08)',
        border: '2px solid var(--tinta-15)',
        order: isLeftHanded ? 2 : 1, // Tray left or right based on dominant hand
        gap: '12px',
      }}
      id="piece-tray"
    >
      {/* Tray Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1.5px solid var(--tinta-15)',
          paddingBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={18} color="var(--buriti)" />
          <span
            style={{
              fontFamily: 'var(--font-hud)',
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'var(--tinta)',
            }}
          >
            Bandeja ({pieces.length})
          </span>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--tinta-60)',
            fontFamily: 'var(--font-hud)',
          }}
        >
          {isLeftHanded ? 'Mão Esquerda' : 'Mão Direita'}
        </span>
      </div>

      {/* Pieces Container (scrollable if many pieces) */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          padding: '8px 4px',
        }}
      >
        {pieces.length === 0 ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: 'var(--tinta-60)',
              fontFamily: 'var(--font-corpo)',
              fontSize: '0.85rem',
              padding: '20px',
            }}
          >
            Todas as peças foram encaixadas! 🎉
          </div>
        ) : (
          pieces.map((piece) => {
            const isSelected = selectedPieceId === piece.id;
            const isPosPrompt = activePrompt === 'POS' && targetPieceId === piece.id;
            const currentAngle = pieceAngles[piece.id] || 0;

            return (
              <div
                key={`tray-item-${piece.id}`}
                onPointerDown={(e) => {
                  onSelectPiece(piece.id);
                  onStartDrag(piece, e);
                }}
                style={{
                  position: 'relative',
                  padding: '8px',
                  borderRadius: '16px',
                  backgroundColor: isSelected ? 'rgba(244, 162, 97, 0.12)' : 'transparent',
                  border: isSelected
                    ? '2px dashed var(--buriti)'
                    : isPosPrompt
                    ? '2px solid var(--vitoria-regia)'
                    : '2px solid transparent',
                  animation: isPosPrompt ? 'bouncePulse 1s infinite alternate' : 'none',
                  cursor: 'grab',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  width: '100%',
                }}
              >
                <PuzzlePiece
                  piece={piece}
                  currentAngle={currentAngle}
                  isSelected={isSelected}
                  isInTray={true}
                  scale={0.85}
                  showRotateHint={activePrompt === 'ROTATION' && isSelected}
                  onRotate={() => onRotatePiece(piece.id)}
                />

                <span
                  style={{
                    marginTop: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--tinta)',
                    textAlign: 'center',
                    fontFamily: 'var(--font-corpo)',
                  }}
                >
                  {piece.name}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Large Rotate 90° Touch Button (>= 64px touch target for tablet accessibility) */}
      {allowRotation && (
        <button
          onClick={() => {
            if (selectedPiece) {
              onRotatePiece(selectedPiece.id);
            }
          }}
          disabled={!selectedPiece}
          style={{
            height: '64px',
            minHeight: '64px',
            borderRadius: '16px',
            background: selectedPiece ? 'var(--vitoria-regia)' : 'var(--tinta-15)',
            color: selectedPiece ? '#FFFFFF' : 'var(--tinta-60)',
            border: 'none',
            fontFamily: 'var(--font-hud)',
            fontWeight: 700,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: selectedPiece ? 'pointer' : 'not-allowed',
            boxShadow: selectedPiece ? '0 4px 14px rgba(45, 106, 79, 0.35)' : 'none',
            transition: 'transform 0.15s ease, background 0.2s ease',
          }}
          title="Girar peça selecionada em 90 graus"
          id="btn-rotate-90"
        >
          <RotateCw size={24} />
          <span>Girar 90°</span>
        </button>
      )}
    </div>
  );
};
