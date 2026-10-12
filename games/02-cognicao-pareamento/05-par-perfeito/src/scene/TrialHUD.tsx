import React, { useState } from 'react';
import type {
  AbaTrial,
  InteractionMode,
  LocutorId,
  PromptType,
  TrialConfig
} from '../types';
import {
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Activity,
  ClipboardList
} from 'lucide-react';

interface TrialHUDProps {
  currentTrial: TrialConfig | null;
  history: AbaTrial[];
  level: number;
  interactionMode: InteractionMode;
  isMuted: boolean;
  activeLocutor: LocutorId;
  promptOverride: PromptType | null;
  outsideDropsCount: number;
  onSetLevel: (level: number) => void;
  onSetMode: (mode: InteractionMode) => void;
  onToggleMute: () => void;
  onSetLocutor: (locutor: LocutorId) => void;
  onSetPromptOverride: (prompt: PromptType) => void;
  onOpenPhysicalBridge: () => void;
  isClinicMode: boolean;
  onToggleClinicMode: () => void;
}

export const TrialHUD: React.FC<TrialHUDProps> = ({
  currentTrial,
  history,
  level,
  interactionMode,
  isMuted,
  activeLocutor,
  promptOverride,
  outsideDropsCount,
  onSetLevel,
  onSetMode,
  onToggleMute,
  onSetLocutor,
  onSetPromptOverride,
  onOpenPhysicalBridge,
  isClinicMode,
  onToggleClinicMode
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Metrics computation
  const totalTrials = history.length;
  const independentWins = history.filter(t => t.result === 'independent_correct').length;
  const promptedWins = history.filter(t => t.result === 'prompted_correct').length;
  const errors = history.filter(t => t.result === 'incorrect' || t.result === 'timeout').length;
  const indepPercent = totalTrials > 0 ? Math.round((independentWins / totalTrials) * 100) : 0;

  // Cold probe trials
  const coldProbeTrials = history.filter(t => t.isColdProbe);
  const coldProbeWins = coldProbeTrials.filter(t => t.result === 'independent_correct').length;
  const coldProbePercent = coldProbeTrials.length > 0 ? Math.round((coldProbeWins / coldProbeTrials.length) * 100) : 0;

  // Average latency
  const avgLatency = totalTrials > 0
    ? Math.round(history.reduce((acc, t) => acc + t.latencyMs, 0) / totalTrials)
    : 0;

  // Last trial latency
  const lastTrial = history[history.length - 1];
  const lastLatency = lastTrial ? `${lastTrial.latencyMs} ms` : '—';

  // Positional bias mapping (slot 0..5 count of incorrect drops)
  const positionBias = history.reduce((acc, t) => {
    if (t.result === 'incorrect') {
      const pos = t.targetPosition;
      acc[pos] = (acc[pos] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  return (
    <header className="hud-panel" style={{ width: '100%', padding: '8px 18px' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        {/* Game Title & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--igarape)' }}>Par Perfeito</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--tinta-60)', backgroundColor: 'var(--tinta-15)', padding: '2px 6px', borderRadius: '6px' }}>
              ABA-01
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <span className="badge badge-vitoria">Nível {level}</span>
            {currentTrial?.isColdProbe && (
              <span className="badge badge-acai" title="Sondagem Fria: sem dicas digitais">
                Sondagem Fria
              </span>
            )}
          </div>
        </div>

        {/* Quick summary stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.86rem' }}>
          <div>
            <span style={{ color: 'var(--tinta-60)' }}>Tentativas: </span>
            <strong>{totalTrials}/10</strong>
          </div>
          <div>
            <span style={{ color: 'var(--tinta-60)' }}>Indep: </span>
            <strong style={{ color: indepPercent >= 80 ? 'var(--vitoria-regia)' : 'inherit' }}>
              {indepPercent}%
            </strong>
          </div>
          <div style={{ display: 'none' }} className="d-md-block">
            <span style={{ color: 'var(--tinta-60)' }}>Latência: </span>
            <strong>{lastLatency}</strong>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Mode Switcher */}
          <button
            className="btn-outline"
            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
            onClick={() => onSetMode(interactionMode === 'drag' ? 'tap' : 'drag')}
            title="Alternar entre modo Arrasto e modo Toque"
          >
            {interactionMode === 'drag' ? '🖐️ Arrasto' : '👆 Toque'}
          </button>

          {/* Sound Toggle */}
          <button
            className="btn-outline"
            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
            onClick={onToggleMute}
            title={isMuted ? 'Desmutar som' : 'Mutar som'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Clinic HUD Toggle */}
          <button
            className={isClinicMode ? 'btn-igarape' : 'btn-outline'}
            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
            onClick={onToggleClinicMode}
            title="Alternar Painel do Aplicador / Supervisor"
          >
            <Activity size={16} />
            {isClinicMode ? 'Painel Clínico' : 'Modo Criança'}
          </button>

          {isClinicMode && (
            <button
              className="btn-outline"
              style={{ padding: '6px 8px' }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Clinical Supervisor Drawer */}
      {isClinicMode && isExpanded && (
        <div
          style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--tinta-15)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            fontSize: '0.82rem'
          }}
        >
          {/* Column 1: Configs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: 'var(--igarape)' }}>Parâmetros do Programa ABA</span>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Nível da Progressão:</span>
              <select
                value={level}
                onChange={e => onSetLevel(Number(e.target.value))}
                style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--tinta-30)' }}
              >
                <option value={1}>1: Campo 1 (Sem Erro)</option>
                <option value={2}>2: Campo 2 (Dif. Alta)</option>
                <option value={3}>3: Campo 3 (Foto/Ilust)</option>
                <option value={4}>4: Campo 3-4 (Semelhante)</option>
                <option value={5}>5: Campo 4-6 (Não Idêntico)</option>
                <option value={6}>6: Campo 6 (Foto ↔ Picto)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Hierarquia de Dica:</span>
              <select
                value={promptOverride || 'none'}
                onChange={e => onSetPromptOverride(e.target.value as PromptType)}
                style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--tinta-30)' }}
              >
                <option value="none">Auto / Sem Dica</option>
                <option value="VIS">VIS (Pulso Visual)</option>
                <option value="GEST">GEST (Apontar Gestual)</option>
                <option value="POS">POS (Proximidade 15%)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Locutor do SD:</span>
              <select
                value={activeLocutor}
                onChange={e => onSetLocutor(e.target.value as LocutorId)}
                style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--tinta-30)' }}
              >
                <option value="locutor_1">Locutor 1 (Feminina)</option>
                <option value="locutor_2">Locutor 2 (Masculina)</option>
                <option value="locutor_3">Locutor 3 (Amigável)</option>
              </select>
            </div>
          </div>

          {/* Column 2: Latency & Telemetry */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontWeight: 700, color: 'var(--igarape)' }}>Métricas & Telemetria</span>
            <div>Latência Média: <strong>{avgLatency} ms</strong> (fim SD → drop)</div>
            <div>Última Latência: <strong>{lastLatency}</strong></div>
            <div>Soltadas Fora: <strong>{outsideDropsCount}</strong> (motor fino / sem erro)</div>
            <div>Sondagem Fria: <strong>{coldProbePercent}%</strong> ({coldProbeWins}/{coldProbeTrials.length})</div>
            <div>Acertos c/ Dica: <strong>{promptedWins}</strong> | Incorretos: <strong>{errors}</strong></div>
          </div>

          {/* Column 3: Positional Bias & Mastery Bridge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: 'var(--igarape)' }}>Viés Posicional & Domínio</span>
            <div style={{ fontSize: '0.78rem', color: 'var(--tinta-60)' }}>
              Erros por posição: {Object.keys(positionBias).length > 0 ? (
                Object.entries(positionBias).map(([pos, count]) => `P${Number(pos) + 1}: ${count}x`).join(', ')
              ) : 'Nenhum erro registrado'}
            </div>

            <button
              className="btn-igarape"
              style={{ marginTop: 'auto', padding: '8px 12px', fontSize: '0.8rem', justifyContent: 'center' }}
              onClick={onOpenPhysicalBridge}
            >
              <ClipboardList size={15} />
              Ponte para o Físico (Seção 10)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
