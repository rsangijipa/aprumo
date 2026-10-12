import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'motion/react';
import type { StimulusLayer, TargetItem } from '../types';

interface SampleCardProps {
  target: TargetItem;
  layer: StimulusLayer;
  isReturningNeutral?: boolean;
  isTapModeActive?: boolean;
  isTapSelected?: boolean;
  onTap?: () => void;
  disabled?: boolean;
}

export const SampleCard: React.FC<SampleCardProps> = ({
  target,
  layer,
  isReturningNeutral = false,
  isTapModeActive = false,
  isTapSelected = false,
  onTap,
  disabled = false
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: 'sample-model-card',
    disabled: disabled || isTapModeActive,
    data: {
      targetId: target.id
    }
  });

  const imageSrc = target.layers[layer] || target.layers.foto;

  // Position transform during drag
  const dragTransformStyle: React.CSSProperties = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 100
      }
    : {};

  return (
    <motion.div
      ref={setNodeRef}
      id="sample-model-card"
      data-testid="sample-model-card"
      {...(!disabled && !isTapModeActive ? listeners : {})}
      {...(!disabled && !isTapModeActive ? attributes : {})}
      className={`card-base sample-card ${isDragging ? 'is-dragging' : ''} ${isReturningNeutral ? 'is-returning-neutral' : ''} ${isTapSelected ? 'tap-mode-selected' : ''}`}
      animate={{
        scale: isDragging ? 1.08 : isTapSelected ? 1.05 : 1,
        opacity: isReturningNeutral ? 0.5 : 1
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25
      }}
      style={{
        ...dragTransformStyle,
        backgroundColor: layer === 'foto' ? 'var(--fundo-card)' : 'var(--fundo-card-ilustracao)',
        pointerEvents: disabled ? 'none' : 'auto',
        cursor: disabled ? 'default' : 'grab',
        touchAction: 'none'
      }}
      onClick={() => {
        if (onTap && !disabled) {
          onTap();
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
          fontWeight: 700,
          color: 'var(--igarape)',
          marginTop: '4px',
          textAlign: 'center',
          lineHeight: 1.1
        }}
      >
        {target.name}
      </span>
    </motion.div>
  );
};
