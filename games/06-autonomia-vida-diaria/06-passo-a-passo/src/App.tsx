import React, { useState } from 'react';
import type { Routine, SequenceVariant, AbaSequenceTrial, TaskAnalysisRecord } from './types/routine';
import { DEFAULT_ROUTINES } from './data/defaultRoutines';
import { sound } from './utils/sound';

import { SequenceGame } from './components/SequenceGame';
import { RoutinePlayer } from './components/RoutinePlayer';
import { PhysicalPrintableSchedule } from './components/PhysicalPrintableSchedule';
import { RoutineEditor } from './components/RoutineEditor';
import { TaskAnalysisDashboard } from './components/TaskAnalysisDashboard';

import {
  ListOrdered,
  Smartphone,
  Printer,
  PlusCircle,
  BarChart3,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const App: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>(DEFAULT_ROUTINES);
  const [activeRoutineId, setActiveRoutineId] = useState<string>(DEFAULT_ROUTINES[0].id);
  const [activeMode, setActiveMode] = useState<'jogo' | 'roteiro' | 'metricas'>('jogo');
  const [sequenceVariant, setSequenceVariant] = useState<SequenceVariant>('ordenar_tudo');

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState<boolean>(false);

  // Audio mute
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Telemetry & Records
  const [trials, setTrials] = useState<AbaSequenceTrial[]>([]);
  const [records, setRecords] = useState<TaskAnalysisRecord[]>([]);

  const activeRoutine = routines.find((r) => r.id === activeRoutineId) || routines[0];

  const handleEmitTrial = (trial: AbaSequenceTrial) => {
    setTrials((prev) => [...prev, trial]);
  };

  const handleRecordStep = (record: TaskAnalysisRecord) => {
    setRecords((prev) => [...prev, record]);
  };

  const handleSaveNewRoutine = (newRoutine: Routine) => {
    setRoutines((prev) => [...prev, newRoutine]);
    setActiveRoutineId(newRoutine.id);
  };

  const toggleMute = () => {
    sound.isMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--fundo)',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          backgroundColor: '#FFFFFF',
          borderBottom: '2px solid var(--tinta-15)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--vitoria-regia), var(--igarape))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 10px rgba(45, 106, 79, 0.3)',
            }}
          >
            <ListOrdered size={24} />
          </div>

          <div>
            <h1
              style={{
                fontFamily: 'var(--font-hud)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--tinta)',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              ABA-05 · Passo a Passo
              <span className="badge" style={{ backgroundColor: 'rgba(45, 106, 79, 0.12)', color: 'var(--vitoria-regia)' }}>
                {activeRoutine.steps.length} Passos
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--tinta-60)', fontFamily: 'var(--font-corpo)' }}>
              Sequenciamento de Atividades de Vida Diária & Análise de Tarefas
            </p>
          </div>
        </div>

        {/* Routine Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={activeRoutineId}
            onChange={(e) => setActiveRoutineId(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '10px',
              border: '1.5px solid var(--tinta-15)',
              backgroundColor: '#FFFFFF',
              fontFamily: 'var(--font-hud)',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: 'var(--tinta)',
              cursor: 'pointer',
            }}
          >
            {routines.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.steps.length} passos)
              </option>
            ))}
          </select>

          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', border: '1.5px solid var(--tinta-15)', borderRadius: '10px', overflow: 'hidden' }}>
            <button
              onClick={() => setActiveMode('jogo')}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: activeMode === 'jogo' ? 'var(--vitoria-regia)' : '#FFFFFF',
                color: activeMode === 'jogo' ? '#FFFFFF' : 'var(--tinta-60)',
                fontFamily: 'var(--font-hud)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              id="tab-mode-game"
            >
              <ListOrdered size={14} /> Modo Jogo
            </button>

            <button
              onClick={() => setActiveMode('roteiro')}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: activeMode === 'roteiro' ? 'var(--vitoria-regia)' : '#FFFFFF',
                color: activeMode === 'roteiro' ? '#FFFFFF' : 'var(--tinta-60)',
                fontFamily: 'var(--font-hud)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              id="tab-mode-routine"
            >
              <Smartphone size={14} /> Roteiro AVD Real
            </button>

            <button
              onClick={() => setActiveMode('metricas')}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: activeMode === 'metricas' ? 'var(--vitoria-regia)' : '#FFFFFF',
                color: activeMode === 'metricas' ? '#FFFFFF' : 'var(--tinta-60)',
                fontFamily: 'var(--font-hud)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              id="tab-mode-metrics"
            >
              <BarChart3 size={14} /> Métricas
            </button>
          </div>

          {/* Quick Actions */}
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="btn-tab"
            style={{ padding: '6px 10px' }}
            title="Imprimir roteiro visual plastificado (Ponte para o Físico)"
            id="btn-print-schedule"
          >
            <Printer size={16} />
          </button>

          <button
            onClick={() => setIsEditorModalOpen(true)}
            className="btn-tab"
            style={{ padding: '6px 10px' }}
            title="Criar nova rotina personalizada no editor"
            id="btn-open-editor"
          >
            <PlusCircle size={16} />
          </button>

          <button onClick={toggleMute} className="btn-tab" style={{ padding: '6px 10px' }}>
            {isMuted ? <VolumeX size={16} color="#E63946" /> : <Volume2 size={16} color="var(--vitoria-regia)" />}
          </button>
        </div>
      </header>

      {/* Main Content Stage */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          gap: '20px',
        }}
      >
        {/* Game Variant Selector if in Modo Jogo */}
        {activeMode === 'jogo' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--tinta-60)', fontFamily: 'var(--font-hud)' }}>
              Variante de Jogo:
            </span>
            <button
              onClick={() => setSequenceVariant('ordenar_tudo')}
              className={`btn-tab ${sequenceVariant === 'ordenar_tudo' ? 'active' : ''}`}
            >
              Ordenar Tudo
            </button>
            <button
              onClick={() => setSequenceVariant('passo_faltante')}
              className={`btn-tab ${sequenceVariant === 'passo_faltante' ? 'active' : ''}`}
            >
              Passo Faltante
            </button>
            <button
              onClick={() => setSequenceVariant('passo_fora_ordem')}
              className={`btn-tab ${sequenceVariant === 'passo_fora_ordem' ? 'active' : ''}`}
            >
              Passo Trocado
            </button>
          </div>
        )}

        {/* View Component */}
        {activeMode === 'jogo' && (
          <SequenceGame
            routine={activeRoutine}
            variant={sequenceVariant}
            onEmitTrial={handleEmitTrial}
            onCompleteSequence={() => {}}
          />
        )}

        {activeMode === 'roteiro' && (
          <RoutinePlayer
            routine={activeRoutine}
            onRecordStep={handleRecordStep}
            onFinishRoutine={() => {}}
          />
        )}

        {activeMode === 'metricas' && (
          <TaskAnalysisDashboard
            records={records}
            trials={trials}
            routine={activeRoutine}
          />
        )}
      </main>

      {/* Printable Schedule Modal (Section 10) */}
      <PhysicalPrintableSchedule
        routine={activeRoutine}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

      {/* Routine Supervisor Editor Modal */}
      <RoutineEditor
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        onSaveRoutine={handleSaveNewRoutine}
      />
    </div>
  );
};

export default App;
