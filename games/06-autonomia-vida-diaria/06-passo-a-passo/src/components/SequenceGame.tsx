import React, { useState, useEffect } from 'react';
import type { Routine, TaskAnalysisStep, SequenceVariant, AbaSequenceTrial } from '../types/routine';
import { sound } from '../utils/sound';
import { Play, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SequenceGameProps {
  routine: Routine;
  variant: SequenceVariant;
  onEmitTrial: (trial: AbaSequenceTrial) => void;
  onCompleteSequence: () => void;
}

export const SequenceGame: React.FC<SequenceGameProps> = ({
  routine,
  variant,
  onEmitTrial,
  onCompleteSequence,
}) => {
  const [placedSlots, setPlacedSlots] = useState<(TaskAnalysisStep | null)[]>([]);
  const [shuffledCards, setShuffledCards] = useState<TaskAnalysisStep[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [playbackStepIndex, setPlaybackStepIndex] = useState<number | null>(null);

  // Initialize variant
  useEffect(() => {
    const steps = routine.steps;
    const total = steps.length;

    if (variant === 'ordenar_tudo') {
      setPlacedSlots(Array(total).fill(null));
      // Shuffle cards
      setShuffledCards([...steps].sort(() => Math.random() - 0.5));
    } else if (variant === 'passo_faltante') {
      // Pick a random missing index
      const missingIdx = Math.floor(Math.random() * total);
      const initialSlots = steps.map((s, idx) => (idx === missingIdx ? null : s));
      setPlacedSlots(initialSlots);
      setShuffledCards([steps[missingIdx]]);
    } else {
      // passo_fora_ordem: swap two steps
      const idxA = 1;
      const idxB = Math.min(total - 1, 3);
      const swapped = [...steps];
      const temp = swapped[idxA];
      swapped[idxA] = swapped[idxB];
      swapped[idxB] = temp;
      setPlacedSlots(swapped);
      setShuffledCards([]);
    }

    setSelectedCardId(null);
    setIsCompleted(false);
    setPlaybackStepIndex(null);
  }, [routine, variant]);

  // Handle card placement on a track slot
  const handleSlotClick = (slotIndex: number) => {
    if (!selectedCardId || isCompleted) return;
    const card = shuffledCards.find((c) => c.stepId === selectedCardId);
    if (!card) return;

    const expectedStep = routine.steps[slotIndex];
    const isCorrect = card.stepId === expectedStep.stepId;

    // Emit AbaTrial
    const trial: AbaSequenceTrial = {
      trialId: `trial-seq-${Date.now()}`,
      timestamp: Date.now(),
      routineId: routine.id,
      variant,
      cardId: card.stepId,
      slotIndex,
      sequenceLength: routine.steps.length,
      isCorrect,
    };
    onEmitTrial(trial);

    if (isCorrect) {
      sound.playSnapPop();
      const nextSlots = [...placedSlots];
      nextSlots[slotIndex] = card;
      setPlacedSlots(nextSlots);
      setShuffledCards((prev) => prev.filter((c) => c.stepId !== card.stepId));
      setSelectedCardId(null);

      // Check if all slots filled
      if (nextSlots.every((s) => s !== null)) {
        handleAllPlaced();
      }
    } else {
      // Incorrect slot: return smoothly to bottom without buzzer
      setSelectedCardId(null);
    }
  };

  const handleAllPlaced = () => {
    setIsCompleted(true);
    sound.playCelebration();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#2D6A4F', '#0E8388', '#F4A261'],
      disableForReducedMotion: true,
    });
    onCompleteSequence();

    // Start video-modeling animation playback
    startVideoModeling();
  };

  // Video Modeling animated playback of the completed routine
  const startVideoModeling = () => {
    let current = 0;
    setPlaybackStepIndex(0);
    const interval = setInterval(() => {
      current += 1;
      if (current >= routine.steps.length) {
        clearInterval(interval);
        setPlaybackStepIndex(null);
      } else {
        setPlaybackStepIndex(current);
        sound.speakInstruction(routine.steps[current].title);
      }
    }, 1800);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '28px',
        width: '100%',
        maxWidth: '960px',
      }}
      id="sequence-game"
    >
      {/* Top Track (Trilha Numerada) */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(30, 37, 43, 0.08)',
          border: '2px solid var(--tinta-15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--igarape)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Trilha da Rotina (O que vem primeiro?)
            </span>
            <h3 style={{ margin: '2px 0 0 0', fontFamily: 'var(--font-hud)', fontSize: '1.3rem', fontWeight: 800 }}>
              {routine.name}
            </h3>
          </div>

          {isCompleted && (
            <button
              onClick={startVideoModeling}
              className="btn-tab active"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Play size={16} /> Ver Vídeo-Modelação
            </button>
          )}
        </div>

        {/* Numbered Slots */}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            overflowX: 'auto',
            paddingBottom: '8px',
          }}
        >
          {placedSlots.map((step, idx) => {
            const isHighlighted = playbackStepIndex === idx;

            return (
              <button
                type="button"
                key={`slot-${idx}`}
                onClick={() => handleSlotClick(idx)}
                aria-label={step ? `Passo ${idx + 1}: ${step.title}` : `Espaço vazio para o Passo ${idx + 1}`}
                style={{
                  minWidth: '130px',
                  width: '130px',
                  height: '165px',
                  borderRadius: '18px',
                  backgroundColor: step ? '#FFFFFF' : 'rgba(148, 163, 184, 0.08)',
                  border: isHighlighted
                    ? '3px solid var(--buriti)'
                    : step
                    ? '2px solid var(--vitoria-regia)'
                    : '2px dashed var(--neutro)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 8px',
                  cursor: step ? 'default' : selectedCardId ? 'pointer' : 'default',
                  position: 'relative',
                  transform: isHighlighted ? 'scale(1.06)' : 'scale(1)',
                  boxShadow: isHighlighted ? '0 8px 20px rgba(244, 162, 97, 0.4)' : step ? '0 4px 10px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.25s ease',
                  textAlign: 'inherit',
                  font: 'inherit',
                }}
              >
                {/* Step Number Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '10px',
                    backgroundColor: step ? 'var(--vitoria-regia)' : 'var(--neutro)',
                    color: '#FFFFFF',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-hud)',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                  }}
                >
                  {idx + 1}
                </div>

                {step ? (
                  <>
                    <div style={{ fontSize: '42px', marginTop: '14px' }}>{step.iconEmoji}</div>
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--tinta)',
                        lineHeight: '1.2',
                        fontFamily: 'var(--font-corpo)',
                      }}
                    >
                      {step.title}
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--neutro)',
                      fontSize: '0.82rem',
                      fontFamily: 'var(--font-hud)',
                      textAlign: 'center',
                    }}
                  >
                    Passo {idx + 1}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Shuffled Cards Area */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '20px 24px',
          boxShadow: '0 6px 20px rgba(30, 37, 43, 0.06)',
          border: '2px solid var(--tinta-15)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--tinta-60)', fontFamily: 'var(--font-hud)' }}>
            Cartões para Encaixar ({shuffledCards.length} restantes): Toque no cartão e depois no espaço da trilha
          </span>

          <button
            onClick={() => sound.speakInstruction('Arruma a ordem da rotina!')}
            className="btn-tab"
            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
          >
            🔊 Ouvir Instrução
          </button>
        </div>

        {shuffledCards.length === 0 && isCompleted ? (
          <div
            style={{
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              color: 'var(--vitoria-regia)',
              fontWeight: 700,
              fontSize: '1.05rem',
            }}
          >
            <CheckCircle2 size={24} />
            Sequência ordenada com perfeição! Parabéns!
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {shuffledCards.map((card) => {
              const isSelected = selectedCardId === card.stepId;

              return (
                <button
                  key={card.stepId}
                  onClick={() => {
                    setSelectedCardId(isSelected ? null : card.stepId);
                    sound.speakInstruction(card.title);
                  }}
                  style={{
                    width: '130px',
                    height: '160px',
                    borderRadius: '18px',
                    backgroundColor: '#FFFFFF',
                    border: isSelected ? '3px solid var(--buriti)' : '2px solid var(--tinta-15)',
                    padding: '12px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 8px 18px rgba(244, 162, 97, 0.4)' : '0 4px 10px rgba(0,0,0,0.06)',
                    transform: isSelected ? 'translateY(-6px)' : 'none',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <div style={{ fontSize: '42px' }}>{card.iconEmoji}</div>
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--tinta)',
                      lineHeight: '1.2',
                    }}
                  >
                    {card.title}
                  </div>
                  <div
                    style={{
                      fontSize: '0.68rem',
                      color: 'var(--tinta-60)',
                      textAlign: 'center',
                      lineHeight: '1.2',
                    }}
                  >
                    {card.shortInstruction}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
