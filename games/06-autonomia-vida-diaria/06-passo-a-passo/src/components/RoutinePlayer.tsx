import React, { useState } from 'react';
import type { Routine, PromptLevel, Setting, TaskAnalysisRecord } from '../types/routine';
import { groupMasteredSteps } from '../utils/chainAndGrouping';
import { sound } from '../utils/sound';
import { Volume2, Check, ArrowRight, ArrowLeft, Layers, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RoutinePlayerProps {
  routine: Routine;
  onRecordStep: (record: TaskAnalysisRecord) => void;
  onFinishRoutine: () => void;
}

export const RoutinePlayer: React.FC<RoutinePlayerProps> = ({
  routine,
  onRecordStep,
  onFinishRoutine,
}) => {
  const [useGrouping, setUseGrouping] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptLevel>('IND');
  const [setting, setSetting] = useState<Setting>('clinica');
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const steps = useGrouping ? groupMasteredSteps(routine.steps) : routine.steps;
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNextStep = () => {
    // Record step completion
    const durationMs = Date.now() - stepStartTime;
    const record: TaskAnalysisRecord = {
      recordId: `rec-${Date.now()}`,
      timestamp: Date.now(),
      routineId: routine.id,
      stepId: currentStep.stepId,
      stepOrder: currentStep.order,
      promptLevel: selectedPrompt,
      durationMs,
      setting,
      recordedBy: 'Aplicador ABA',
    };

    onRecordStep(record);
    sound.playSnapPop();

    if (isLastStep) {
      setIsCompleted(true);
      sound.playCelebration();
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#2D6A4F', '#0E8388', '#F4A261'],
      });
      onFinishRoutine();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
      setSelectedPrompt('IND');
      setStepStartTime(Date.now());

      // Read aloud next instruction
      const next = steps[currentStepIndex + 1];
      if (next) {
        sound.speakInstruction(next.title);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      setStepStartTime(Date.now());
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        maxWidth: '680px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '32px',
        padding: '28px',
        boxShadow: '0 16px 40px rgba(30, 37, 43, 0.1)',
        border: '3px solid var(--tinta-15)',
      }}
      id="routine-player"
    >
      {/* Top Setting & Grouping Header */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1.5px solid var(--tinta-15)',
          paddingBottom: '12px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} color="var(--igarape)" />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--tinta-60)', fontFamily: 'var(--font-hud)' }}>
            Ambiente:
          </span>
          {(['clinica', 'casa', 'escola'] as Setting[]).map((s) => (
            <button
              key={s}
              onClick={() => setSetting(s)}
              className={`btn-tab ${setting === s ? 'active' : ''}`}
              style={{ padding: '3px 8px', fontSize: '0.75rem', textTransform: 'capitalize' }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Grouping Toggle */}
        <button
          onClick={() => setUseGrouping(!useGrouping)}
          style={{
            padding: '4px 10px',
            borderRadius: '8px',
            border: '1.5px solid var(--tinta-15)',
            backgroundColor: useGrouping ? 'rgba(45, 106, 79, 0.12)' : '#FFFFFF',
            color: useGrouping ? 'var(--vitoria-regia)' : 'var(--tinta)',
            fontFamily: 'var(--font-hud)',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          title="Agrupa passos dominados adjacentes para esvanecer apoio visual"
        >
          <Layers size={14} />
          {useGrouping ? 'Passos Agrupados Ativos' : 'Agrupar Dominados'}
        </button>
      </div>

      {isCompleted ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '64px' }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--vitoria-regia)', margin: 0 }}>
            Rotina Concluída com Sucesso!
          </h2>
          <p style={{ margin: 0, color: 'var(--tinta-60)', fontSize: '0.95rem' }}>
            Todos os passos da análise de tarefas foram executados e registrados com precisão.
          </p>
          <button
            onClick={() => {
              setIsCompleted(false);
              setCurrentStepIndex(0);
              setStepStartTime(Date.now());
            }}
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: '1rem', marginTop: '12px' }}
          >
            Executar Rotina Novamente
          </button>
        </div>
      ) : (
        <>
          {/* Progress dots bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center' }}>
            {steps.map((s, idx) => (
              <div
                key={s.stepId}
                style={{
                  width: idx === currentStepIndex ? '28px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
                  backgroundColor: idx <= currentStepIndex ? 'var(--vitoria-regia)' : 'var(--tinta-15)',
                  transition: 'all 0.25s ease',
                }}
              />
            ))}
          </div>

          {/* Current Step Big Card */}
          <div
            style={{
              width: '100%',
              backgroundColor: 'var(--fundo)',
              borderRadius: '24px',
              padding: '28px 24px',
              border: '2px solid var(--tinta-15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--vitoria-regia)', fontFamily: 'var(--font-hud)', textTransform: 'uppercase' }}>
              Passo {currentStepIndex + 1} de {steps.length}
            </div>

            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '56px',
                border: `3px solid ${currentStep.color}`,
              }}
            >
              {currentStep.iconEmoji}
            </div>

            <div>
              <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--tinta)', margin: '0 0 6px 0' }}>
                {currentStep.title}
              </h2>
              <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--tinta)', fontFamily: 'var(--font-corpo)' }}>
                {currentStep.shortInstruction}
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--tinta-60)', lineHeight: '1.3' }}>
                {currentStep.detailDescription}
              </p>
            </div>

            {/* Read instruction aloud */}
            <button
              onClick={() => sound.speakInstruction(`${currentStep.title}. ${currentStep.shortInstruction}`)}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid var(--tinta-15)',
                padding: '6px 14px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--tinta-60)',
              }}
            >
              <Volume2 size={16} /> Ouvir Instrução
            </button>
          </div>

          {/* Supervisor Prompt Level Recorder */}
          <div
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              padding: '14px 18px',
              border: '1.5px solid var(--tinta-15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--tinta-60)', fontFamily: 'var(--font-hud)' }}>
                Nível de Ajuda Prestado (Registro ABA no Clinic):
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--vitoria-regia)' }}>
                {selectedPrompt === 'IND' ? 'Independente (100%)' : `Com Dica (${selectedPrompt})`}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(['IND', 'VERBAL', 'GEST', 'MOD', 'FP', 'FT'] as PromptLevel[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPrompt(p)}
                  className={`btn-tab ${selectedPrompt === p ? 'active' : ''}`}
                  style={{ flex: 1, minWidth: '70px', justifyContent: 'center', fontSize: '0.78rem', padding: '6px 4px' }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Big "Pronto!" Button (>= 96px touch target for wet/soapy hands in bathroom) */}
          <div style={{ width: '100%', display: 'flex', gap: '12px' }}>
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrevStep}
                style={{
                  width: '72px',
                  height: '96px',
                  borderRadius: '20px',
                  border: '2px solid var(--tinta-15)',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--tinta)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Voltar ao passo anterior"
              >
                <ArrowLeft size={24} />
              </button>
            )}

            <button
              onClick={handleNextStep}
              style={{
                flex: 1,
                height: '96px',
                borderRadius: '24px',
                border: 'none',
                backgroundColor: 'var(--vitoria-regia)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-hud)',
                fontWeight: 800,
                fontSize: '1.45rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 8px 24px rgba(45, 106, 79, 0.4)',
                touchAction: 'manipulation',
              }}
              id="btn-step-done-96px"
            >
              <Check size={32} />
              <span>{isLastStep ? 'Terminei a Rotina! 🎉' : 'Pronto! Próximo Passo'}</span>
              <ArrowRight size={24} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
