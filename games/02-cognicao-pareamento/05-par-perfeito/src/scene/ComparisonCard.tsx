import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { ComparisonSlot } from '../types';

interface ComparisonCardProps {
  slot: ComparisonSlot;
  isMatched: boolean;
  isVisPromptActive: boolean;
  promptIntensity: number;
  isPosPromptActive: boolean;
  onTapCard?: (slot: ComparisonSlot) => void;
  isTapModeActive?: boolean;
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  slot,
  isMatched,
  isVisPromptActive,
  promptIntensity,
  isPosPromptActive,
  onTapCard,
  isTapModeActive: _isTapModeActive = false
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `comparison-slot-${slot.slotIndex}`,
    data: {
      slotIndex: slot.slotIndex,
      isCorrect: slot.isCorrect
    }
  });

  const { target, layer, opacity } = slot;
  const imageSrc = target.layers[layer] || target.layers.foto;

  // POS prompt: card positioned 15% closer downwards towards sample
  const posStyle: React.CSSProperties = isPosPromptActive && slot.isCorrect
    ? { transform: 'translateY(28px)', transition: 'transform 0.4s ease' }
    : {};

  // VIS prompt pulse scale faded according to promptIntensity (1.00 -> 1.04 down to 1.01)
  const pulseScale = 1.0 + (0.04 * promptIntensity);

  return (
    <div
      ref={setNodeRef}
      id={`slot-${slot.slotIndex}`}
      data-testid={`comparison-slot-${slot.slotIndex}`}
      className={`card-base comparison-card ${isVisPromptActive && slot.isCorrect ? 'vis-prompt-active' : ''} ${isMatched ? 'matched-glow' : ''} ${isOver ? 'scale-105' : ''}`}
      style={{
        opacity,
        backgroundColor: layer === 'foto' ? 'var(--fundo-card)' : 'var(--fundo-card-ilustracao)',
        cursor: 'pointer',
        touchAction: 'manipulation',
        '--pulse-scale': pulseScale,
        ...posStyle
      } as React.CSSProperties}
      onClick={() => {
        if (onTapCard) {
          onTapCard(slot);
        }
      }}
    >
      <img
        src={imageSrc}
        alt={target.name}
        style={{
          width: '85%',
          height: '85%',
          objectFit: 'contain',
          pointerEvents: 'none'
        }}
        draggable={false}
      />
      <span
        style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--tinta)',
          marginTop: '4px',
          opacity: 0.9,
          textAlign: 'center',
          lineHeight: 1.1
        }}
      >
        {target.name}
      </span>
    </div>
  );
};
