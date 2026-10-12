import React from 'react';
import { motion } from 'motion/react';
import type { PromptType } from '../types';

interface PromptOverlayProps {
  promptType: PromptType;
  promptIntensity: number;
  sampleElement: HTMLElement | null;
  targetElement: HTMLElement | null;
}

export const PromptOverlay: React.FC<PromptOverlayProps> = ({
  promptType,
  promptIntensity,
  sampleElement,
  targetElement
}) => {
  if (promptType !== 'GEST' || !sampleElement || !targetElement) {
    return null;
  }

  const sampleRect = sampleElement.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();

  const startX = sampleRect.left + sampleRect.width / 2;
  const startY = sampleRect.top + sampleRect.height / 2;

  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top + targetRect.height / 2;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    >
      <motion.div
        initial={{
          x: startX,
          y: startY,
          opacity: 0,
          scale: 0.8
        }}
        animate={{
          x: [startX, endX, endX, startX],
          y: [startY, endY, endY, startY],
          opacity: [0, 0.95 * promptIntensity, 0.95 * promptIntensity, 0],
          scale: [0.8, 1.1, 1.1, 0.8]
        }}
        transition={{
          duration: 2.2,
          repeat: 2,
          ease: 'easeInOut'
        }}
        style={{
          position: 'absolute',
          top: -24,
          left: -24,
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.25))'
        }}
      >
        {/* Animated Pointing Finger Hand SVG */}
        <svg
          viewBox="0 0 64 64"
          width="48"
          height="48"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="rotate(-30 32 32)">
            {/* Hand base */}
            <circle cx="32" cy="38" r="16" fill="#F4A261" />
            {/* Pointing index finger */}
            <rect x="27" y="10" width="10" height="28" rx="5" fill="#E76F51" />
            {/* Thumb */}
            <rect x="16" y="32" width="12" height="10" rx="5" fill="#F4A261" />
            {/* Gentle highlight */}
            <line x1="32" y1="14" x2="32" y2="30" stroke="#FFF" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
          </g>
        </svg>
      </motion.div>
    </div>
  );
};
