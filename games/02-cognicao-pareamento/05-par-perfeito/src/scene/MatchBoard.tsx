import React, { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import type {
  DragEndEvent,
  DragMoveEvent
} from '@dnd-kit/core';
import confetti from 'canvas-confetti';
import { ComparisonCard } from './ComparisonCard';
import { SampleCard } from './SampleCard';
import { PromptOverlay } from './PromptOverlay';
import type { ComparisonSlot, InteractionMode, PromptType, TrialConfig } from '../types';

interface MatchBoardProps {
  currentTrial: TrialConfig | null;
  stateValue: string;
  interactionMode: InteractionMode;
  onDropCorrect: (dragPathLength: number, dropDistancePx: number, mode: InteractionMode) => void;
  onDropWrong: (slotIndex: number, dragPathLength: number, dropDistancePx: number, mode: InteractionMode) => void;
  onOutsideDrop: () => void;
  activePrompt: PromptType;
  promptIntensity: number;
}

export const MatchBoard: React.FC<MatchBoardProps> = ({
  currentTrial,
  stateValue,
  interactionMode,
  onDropCorrect,
  onDropWrong,
  onOutsideDrop,
  activePrompt,
  promptIntensity
}) => {
  // Drag telemetry tracking
  const [dragPathLength, setDragPathLength] = useState<number>(0);
  const lastCoordRef = useRef<{ x: number; y: number } | null>(null);

  // Visual state flags
  const [matchedSlotIndex, setMatchedSlotIndex] = useState<number | null>(null);
  const [isReturningNeutral, setIsReturningNeutral] = useState<boolean>(false);
  const [tapSelected, setTapSelected] = useState<boolean>(false);

  // References for prompt pointing overlay
  const sampleRef = useRef<HTMLDivElement | null>(null);
  const targetSlotRef = useRef<HTMLElement | null>(null);

  // Sensors with distance constraint (activationConstraint: distance 8px to prevent accidental taps)
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8
    }
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 0,
      tolerance: 8
    }
  });

  const sensors = useSensors(pointerSensor, touchSensor);

  // Reset local states on new trial
  useEffect(() => {
    setMatchedSlotIndex(null);
    setIsReturningNeutral(false);
    setTapSelected(false);
    setDragPathLength(0);
    lastCoordRef.current = null;
  }, [currentTrial?.trialNumber]);

  // Update target element ref for GEST overlay
  useEffect(() => {
    if (!currentTrial) return;
    const correctSlot = currentTrial.comparisonSlots.find(s => s.isCorrect);
    if (correctSlot) {
      targetSlotRef.current = document.getElementById(`slot-${correctSlot.slotIndex}`);
    }
    sampleRef.current = document.getElementById('sample-model-card') as HTMLDivElement | null;
  }, [currentTrial, stateValue]);

  // Handle Drag Start
  const handleDragStart = () => {
    lastCoordRef.current = null;
    setDragPathLength(0);
  };

  // Handle Drag Move (accumulate drag path length)
  const handleDragMove = (event: DragMoveEvent) => {
    const currentCoord = {
      x: event.delta.x,
      y: event.delta.y
    };

    if (lastCoordRef.current) {
      const dx = currentCoord.x - lastCoordRef.current.x;
      const dy = currentCoord.y - lastCoordRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      setDragPathLength(prev => prev + dist);
    }

    lastCoordRef.current = currentCoord;
  };

  // Handle Drag End
  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;

    // Check if dropped inside a droppable comparison card
    if (!over) {
      // Dropped OUTSIDE valid card:
      // Section 4.1 rule 3 & Section 12: "Soltar fora nunca gera registro de erro. Volta com mola."
      onOutsideDrop();
      return;
    }

    const slotIndex = over.data.current?.slotIndex as number;
    const isCorrect = over.data.current?.isCorrect as boolean;

    // Calculate approximate drop distance from card center
    const dropDistancePx = Math.round(
      Math.sqrt(event.delta.x * event.delta.x + event.delta.y * event.delta.y) * 0.1
    );

    if (isCorrect) {
      setMatchedSlotIndex(slotIndex);

      // Gentle celebratory particle burst
      try {
        confetti({
          particleCount: 25,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#0E8388', '#F4A261', '#52B788', '#FFB703'],
          disableForReducedMotion: true
        });
      } catch {
        // Safe fallback
      }

      onDropCorrect(dragPathLength, dropDistancePx, 'drag');
    } else {
      // Incorreto: desbota para neutro durante o retorno em 400ms
      setIsReturningNeutral(true);
      setTimeout(() => {
        setIsReturningNeutral(false);
      }, 400);

      onDropWrong(slotIndex, dragPathLength, dropDistancePx, 'drag');
    }
  };

  // Handle Tap Mode interactions
  const handleTapSample = () => {
    if (stateValue !== 'awaitingResponse' && stateValue !== 'prompting') return;
    setTapSelected(prev => !prev);
  };

  const handleTapComparisonCard = (slot: ComparisonSlot) => {
    if (stateValue !== 'awaitingResponse' && stateValue !== 'prompting') return;

    if (slot.isCorrect) {
      setMatchedSlotIndex(slot.slotIndex);
      onDropCorrect(0, 0, 'tap');
    } else {
      setIsReturningNeutral(true);
      setTimeout(() => {
        setIsReturningNeutral(false);
      }, 400);
      onDropWrong(slot.slotIndex, 0, 0, 'tap');
    }
  };

  const isAwaiting = stateValue === 'awaitingResponse' || stateValue === 'prompting';
  const isPresentingSD = stateValue === 'presentingSD';
  const isErrorCorrection = stateValue === 'errorCorrection';
  const isIti = stateValue === 'iti';

  if (!currentTrial || isIti) {
    return (
      <div className="arena-container" style={{ justifyContent: 'center' }}>
        <div style={{ color: 'var(--tinta-60)', fontSize: '1.1rem', fontWeight: 600 }}>
          {isIti ? 'Preparando próxima tentativa...' : 'Aguardando início...'}
        </div>
      </div>
    );
  }

  // If in neutral error correction screen (1s neutral screen per section 4.1 rule 6)
  if (isErrorCorrection) {
    return (
      <div className="arena-container" style={{ justifyContent: 'center' }}>
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 20,
            backgroundColor: 'var(--neutro-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--neutro-dark)',
            fontWeight: 600
          }}
        >
          ...
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <main className="arena-container">
        {/* Gestural Hand Prompt Overlay */}
        <PromptOverlay
          promptType={activePrompt}
          promptIntensity={promptIntensity}
          sampleElement={sampleRef.current}
          targetElement={targetSlotRef.current}
        />

        {/* Top: Comparison Field (1 to 6 cards) */}
        <section aria-label="Campo de Comparação" className="comparison-field-row">
          {currentTrial.comparisonSlots.map(slot => (
            <ComparisonCard
              key={slot.slotIndex}
              slot={slot}
              isMatched={matchedSlotIndex === slot.slotIndex}
              isVisPromptActive={activePrompt === 'VIS'}
              promptIntensity={promptIntensity}
              isPosPromptActive={activePrompt === 'POS'}
              isTapModeActive={interactionMode === 'tap'}
              onTapCard={handleTapComparisonCard}
            />
          ))}
        </section>

        {/* Instructional Prompt text banner during SD */}
        <div style={{ minHeight: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isPresentingSD && (
            <div
              style={{
                backgroundColor: 'rgba(14, 131, 136, 0.1)',
                color: 'var(--igarape)',
                padding: '6px 18px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '1.05rem',
                border: '1.5px solid var(--igarape)'
              }}
            >
              "Junta igual"
            </div>
          )}
          {interactionMode === 'tap' && isAwaiting && (
            <div style={{ color: 'var(--tinta-60)', fontSize: '0.9rem', fontWeight: 600 }}>
              Toque no modelo e depois no cartão igual
            </div>
          )}
        </div>

        {/* Bottom: Sample Card (Model Base) */}
        <section aria-label="Área do Modelo" className="sample-base-zone">
          <div className="sample-base-placeholder">
            <SampleCard
              target={currentTrial.target}
              layer={currentTrial.sampleLayer}
              isReturningNeutral={isReturningNeutral}
              isTapModeActive={interactionMode === 'tap'}
              isTapSelected={tapSelected}
              onTap={handleTapSample}
              disabled={!isAwaiting}
            />
          </div>
        </section>
      </main>
    </DndContext>
  );
};
