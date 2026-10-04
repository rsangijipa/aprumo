import { useState } from 'react';
import { Button, Badge } from '@aprumo/ui';
import { speak, playTones } from '@aprumo/game-sdk';
import {
  type PromptLevel,
  type ChainingMode,
  PROMPT_HIERARCHY,
  TASK_PRESETS,
  calculateIndependencePercentage,
  findTargetStepIndex,
  isTaskFullyIndependent,
} from './taskAnalysis';

export function TaskAnalysisStudio() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('lavar-maos');
  const activePreset = TASK_PRESETS.find((p) => p.id === selectedPresetId) ?? TASK_PRESETS[0]!;

  const [mode, setMode] = useState<ChainingMode>(activePreset.defaultMode);
  const [scores, setScores] = useState<Record<number, PromptLevel>>({
    0: 'I',
    1: 'I',
    2: 'DV',
    3: 'DG',
    4: 'I',
    5: 'DV',
    6: 'I',
  });

  const totalSteps = activePreset.steps.length;
  const indepPct = calculateIndependencePercentage(scores, totalSteps);
  const targetStepIdx = findTargetStepIndex(mode, scores, totalSteps);
  const isComplete = isTaskFullyIndependent(scores, totalSteps);

  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = TASK_PRESETS.find((x) => x.id === presetId);
    if (p) {
      setMode(p.defaultMode);
      // Reset scores with baseline
      const newScores: Record<number, PromptLevel> = {};
      p.steps.forEach((_, idx) => {
        newScores[idx] = idx === 0 ? 'DV' : 'DFP';
      });
      setScores(newScores);
    }
  };

  const handleScoreChange = (stepIdx: number, level: PromptLevel) => {
    setScores((prev) => ({ ...prev, [stepIdx]: level }));

    if (level === 'I') {
      playTones([
        { freq: 523.25, dur: 0.1, type: 'sine' },
        { freq: 659.25, dur: 0.15, delay: 0.08, type: 'sine' },
      ], 'normal');
    } else {
      playTones([{ freq: 440, dur: 0.08, type: 'sine' }], 'normal');
    }
  };

  const handleHearStep = (text: string) => {
    void speak(text, 'normal');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Barra de Seleção de Tarefa e Modo */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {TASK_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className="rs-tab-pill"
              aria-pressed={selectedPresetId === p.id}
              onClick={() => handlePresetChange(p.id)}
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Seletor de Modo de Encadeamento */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="ap-xs ap-muted" style={{ fontWeight: 700 }}>MODO:</span>
          {(
            [
              ['forward', 'Para Frente (Forward)'],
              ['backward', 'Para Trás (Backward)'],
              ['total-task', 'Tarefa Inteira (Total)'],
            ] as const
          ).map(([m, label]) => (
            <button
              key={m}
              type="button"
              className="rs-tab-pill"
              style={{ fontSize: '11px', padding: '0.3rem 0.6rem' }}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Painel de Metas e % de Autonomia */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 1.25rem',
          background: 'var(--ap-surface-sunken)',
          borderRadius: '16px',
          border: '1px solid var(--ap-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {activePreset.assetUrl && (
            <img
              src={activePreset.assetUrl}
              alt={activePreset.title}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                objectFit: 'contain',
                background: 'var(--ap-surface)',
                border: '1px solid var(--ap-border)',
                padding: '4px',
                flexShrink: 0,
              }}
            />
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: 'var(--ap-text-md)' }}>{activePreset.title}</strong>
              <Badge tone={isComplete ? 'success' : 'info'}>
                {isComplete ? '🎉 100% Independente' : `${indepPct}% Autonomia`}
              </Badge>
            </div>
            <p className="ap-xs ap-muted" style={{ margin: '0.2rem 0 0' }}>
              {mode === 'forward' && 'Ensino sequencial do primeiro ao último passo. Passo atual é o foco da dica.'}
              {mode === 'backward' && 'Terapeuta apoia etapas iniciais; a criança realiza o último passo com reforço terminal.'}
              {mode === 'total-task' && 'Oportunidade em todos os passos com níveis de dica adaptativos por etapa.'}
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: isComplete ? 'var(--ap-success)' : 'var(--ap-primary)' }}>
            {indepPct}%
          </div>
          <span className="ap-xs ap-muted">
            {Object.values(scores).filter((v) => v === 'I').length} de {totalSteps} passos 'I'
          </span>
        </div>
      </div>

      {/* Legenda de Níveis de Ajuda */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <span className="ap-xs ap-muted" style={{ fontWeight: 700 }}>LEGENDA DE DICAS:</span>
        {PROMPT_HIERARCHY.map((ph) => (
          <span
            key={ph.code}
            style={{
              fontSize: '11px',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid var(--ap-border)',
              background: 'var(--ap-surface)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
            title={ph.description}
          >
            <strong style={{ color: ph.color }}>{ph.code}</strong> = {ph.label}
          </span>
        ))}
      </div>

      {/* Lista de Passos da Análise de Tarefa */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {activePreset.steps.map((step, idx) => {
          const isTarget = targetStepIdx === idx;
          const currentScore = scores[idx] ?? 'DV';

          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '14px',
                border: isTarget ? '2px solid var(--ap-primary)' : '1px solid var(--ap-border)',
                background: isTarget ? 'var(--ap-primary-soft, rgba(63, 107, 103, 0.08))' : 'var(--ap-surface)',
                boxShadow: isTarget ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                <span style={{ fontSize: '1.4rem' }}>{step.visualHint ?? '🔹'}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: 'var(--ap-text-sm)' }}>
                      {idx + 1}. {step.instruction}
                    </span>
                    {isTarget && (
                      <Badge tone="info">
                        🎯 Passo-Alvo
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => handleHearStep(step.instruction)}
                  title="Ouvir instrução"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '0.3rem',
                    marginRight: '0.4rem',
                  }}
                  aria-label={`Ouvir ${step.instruction}`}
                >
                  🔊
                </button>

                {PROMPT_HIERARCHY.map((ph) => {
                  const isSelected = currentScore === ph.code;
                  return (
                    <button
                      key={ph.code}
                      type="button"
                      onClick={() => handleScoreChange(idx, ph.code)}
                      style={{
                        padding: '0.35rem 0.55rem',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: isSelected ? `2px solid ${ph.color}` : '1px solid var(--ap-border)',
                        background: isSelected ? ph.color : 'var(--ap-surface)',
                        color: isSelected ? '#ffffff' : 'var(--ap-text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                        minWidth: '36px',
                        minHeight: '36px',
                      }}
                      title={`${ph.code} - ${ph.label}`}
                    >
                      {ph.code}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ações Inferiores */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const reset: Record<number, PromptLevel> = {};
            activePreset.steps.forEach((_, i) => {
              reset[i] = 'DV';
            });
            setScores(reset);
          }}
        >
          Reiniciar Registros
        </Button>

        <span className="ap-xs ap-muted">
          Recomendação: Transitar nível de dica após 3 sessões consecutivas com acerto no passo-alvo.
        </span>
      </div>
    </div>
  );
}
