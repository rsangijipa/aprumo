import React, { useState } from 'react';
import type {
  AbaTrialSort,
  ClassificationRule,
  GameMode,
  IndependentTaskStats,
  SensoryProfile
} from '../types';
import {
  Volume2,
  VolumeX,
  Activity,
  ClipboardList,
  RotateCcw
} from 'lucide-react';

interface SortHUDProps {
  mode: GameMode;
  rule: ClassificationRule;
  sensoryProfile: SensoryProfile;
  history: AbaTrialSort[];
  taskStats: IndependentTaskStats;
  isMuted: boolean;
  onSetMode: (mode: GameMode) => void;
  onSwitchRule: (rule: ClassificationRule) => void;
  onSetSensoryProfile: (profile: SensoryProfile) => void;
  onToggleMute: () => void;
  onRecordAdultPrompt: () => void;
  onRecordOffTaskPause: () => void;
  onOpenPhysicalBridge: () => void;
  onRestart: () => void;
}

export const SortHUD: React.FC<SortHUDProps> = ({
  mode,
  rule,
  sensoryProfile,
  history,
  taskStats,
  isMuted,
  onSetMode,
  onSwitchRule,
  onSetSensoryProfile,
  onToggleMute,
  onRecordAdultPrompt,
  onRecordOffTaskPause,
  onOpenPhysicalBridge,
  onRestart
}) => {
  const [isClinicOpen, setIsClinicOpen] = useState(false);

  // Compute metrics
  const total = history.length;
  const correct = history.filter(t => t.result === 'independent_correct').length;
  const accuracyPct = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Rule switch probe analysis
  const ruleSwitchProbes = history.filter(t => t.gameSpecific.ruleSwitchProbe);
  const switchCorrect = ruleSwitchProbes.filter(t => t.result === 'independent_correct').length;
  const switchPct = ruleSwitchProbes.length > 0 ? Math.round((switchCorrect / ruleSwitchProbes.length) * 100) : null;

  return (
    <header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1.5px solid var(--tinta-15)',
        padding: '10px 20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {/* Title & Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: 800, color: 'var(--vitoria-regia)', fontSize: '1.1rem' }}>
                Cada Um no Seu Pote
              </span>
              <span className="badge" style={{ backgroundColor: 'rgba(45, 106, 79, 0.15)', color: 'var(--vitoria-regia)' }}>
                ABA-02
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--tinta-60)', fontWeight: 600 }}>
              Classificação por Atributo · Regra Atual: <strong style={{ textTransform: 'capitalize', color: 'var(--tinta)' }}>{rule}</strong>
            </div>
          </div>

          <span className="badge" style={{ backgroundColor: 'var(--fundo)', color: 'var(--tinta)' }}>
            {mode === 'tentativa_discreta' ? 'Tentativa Discreta' : 'Tarefa Independente'}
          </span>
        </div>

        {/* Live Counters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem' }}>
          {mode === 'tentativa_discreta' ? (
            <>
              <div>Tentativas: <strong>{total}</strong></div>
              <div>Acertos: <strong style={{ color: 'var(--vitoria-regia)' }}>{accuracyPct}%</strong></div>
              {switchPct !== null && (
                <div title="Acerto na primeira tentativa logo após a troca de regra">
                  Sondagem Troca: <strong>{switchPct}%</strong>
                </div>
              )}
            </>
          ) : (
            <>
              <div>Itens: <strong>{taskStats.itemsCorrect + taskStats.errorsCount}/{taskStats.itemsTotal}</strong></div>
              <div>Dicas do Adulto: <strong>{taskStats.adultPrompts}</strong></div>
              <div>Pausas ≥10s: <strong>{taskStats.offTaskPauses}</strong></div>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn-tab" onClick={onToggleMute} title="Som">
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button className="btn-tab" onClick={onRestart} title="Reiniciar Sessão">
            <RotateCcw size={15} />
          </button>

          <button
            className={`btn-tab ${isClinicOpen ? 'active' : ''}`}
            onClick={() => setIsClinicOpen(!isClinicOpen)}
          >
            <Activity size={16} />
            {isClinicOpen ? 'Fechar Painel' : 'Painel Clínico'}
          </button>
        </div>
      </div>

      {/* Expanded Clinical Supervisor Drawer */}
      {isClinicOpen && (
        <div
          style={{
            marginTop: '14px',
            paddingTop: '14px',
            borderTop: '1px solid var(--tinta-15)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            fontSize: '0.82rem'
          }}
        >
          {/* Col 1: Configuração de Regras */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: 'var(--vitoria-regia)' }}>Regra de Classificação</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(['cor', 'forma', 'tamanho', 'categoria'] as ClassificationRule[]).map(r => (
                <button
                  key={r}
                  onClick={() => onSwitchRule(r)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--tinta-30)',
                    backgroundColor: rule === r ? 'var(--vitoria-regia)' : '#FFF',
                    color: rule === r ? '#FFF' : 'var(--tinta)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    textTransform: 'capitalize'
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            <div style={{ marginTop: '8px' }}>
              <span style={{ fontWeight: 700 }}>Modo de Ensino:</span>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <button
                  onClick={() => onSetMode('tentativa_discreta')}
                  className={`btn-tab ${mode === 'tentativa_discreta' ? 'active' : ''}`}
                  style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                >
                  Tentativa Discreta
                </button>
                <button
                  onClick={() => onSetMode('tarefa_independente')}
                  className={`btn-tab ${mode === 'tarefa_independente' ? 'active' : ''}`}
                  style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                >
                  Tarefa Independente
                </button>
              </div>
            </div>
          </div>

          {/* Col 2: Perfil Sensorial & Dicas no Modo Independente */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: 'var(--vitoria-regia)' }}>Ajustes Sensoriais & Dicas</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Perfil Sensorial:</span>
              <select
                value={sensoryProfile}
                onChange={e => onSetSensoryProfile(e.target.value as SensoryProfile)}
                style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--tinta-30)' }}
              >
                <option value="padrao">Padrão (Física com Arremesso)</option>
                <option value="baixo">Baixo Sensorial (Sem Arremesso/Quique)</option>
              </select>
            </div>

            {mode === 'tarefa_independente' && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  onClick={onRecordAdultPrompt}
                  className="btn-tab"
                  style={{ fontSize: '0.75rem', padding: '5px 8px', flex: 1 }}
                >
                  +1 Dica do Adulto
                </button>
                <button
                  onClick={onRecordOffTaskPause}
                  className="btn-tab"
                  style={{ fontSize: '0.75rem', padding: '5px 8px', flex: 1 }}
                >
                  +1 Pausa ≥10s
                </button>
              </div>
            )}
          </div>

          {/* Col 3: Domínio & Ponte para o Físico */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: 'var(--vitoria-regia)' }}>Ponte para o Físico</span>
            <p style={{ color: 'var(--tinta-60)', fontSize: '0.78rem' }}>
              Após o domínio digital, valide com potes reais e itens físicos novos na mesa.
            </p>
            <button
              className="btn-primary"
              style={{ backgroundColor: 'var(--vitoria-regia)', fontSize: '0.8rem', padding: '8px 12px', justifyContent: 'center' }}
              onClick={onOpenPhysicalBridge}
            >
              <ClipboardList size={15} />
              Protocolo Físico (Seção 10)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
