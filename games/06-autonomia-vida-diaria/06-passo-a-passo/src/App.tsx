import React, { useState, useEffect } from 'react';
import { useGameClient } from '@aprumo/game-sdk';
import { manifest } from './manifest';
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
  const { client, config, paused: hostPaused, ended } = useGameClient(manifest.appId, manifest.version);
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

  useEffect(() => {
    client.gameStarted(manifest.version);
    client.levelStarted({
      levelId: activeRoutine.id,
      levelIndex: 0,
      trialsPlanned: activeRoutine.steps.length,
    });
    client.trialStarted({
      targetId: activeRoutine.steps[0]?.stepId || 'inicio',
      trialIndex: 0,
      presented: activeRoutine.steps.map((s) => s.stepId),
    });
    client.stimulusPresented({
      targetId: activeRoutine.steps[0]?.stepId || 'inicio',
      trialIndex: 0,
      presented: activeRoutine.steps.map((s) => s.stepId),
      positionOfTarget: 0,
      modality: 'visual_auditory',
    });
  }, [client, activeRoutine]);

  useEffect(() => {
    const soundPref = config?.adaptation?.sound;
    if (soundPref === 'off') {
      sound.setVolume(0);
    } else if (soundPref === 'low') {
      sound.setVolume(0.35);
    } else {
      sound.setVolume(1.0);
    }
  }, [config]);

  const handleEmitTrial = (trial: AbaSequenceTrial) => {
    setTrials((prev) => [...prev, trial]);
    client.responseRecorded({
      targetId: trial.cardId,
      stimulusId: trial.cardId,
      trialIndex: trials.length,
      presented: [trial.cardId],
      positionOfTarget: trial.slotIndex,
      selected: trial.cardId,
      selectedPosition: trial.slotIndex,
      response: trial.isCorrect ? 'correct' : 'incorrect',
      latencyMs: 1500,
      promptLevel: 'none',
      promptSource: 'none',
      detail: {
        routineId: trial.routineId,
        variant: trial.variant,
        slotIndex: trial.slotIndex,
        sequenceLength: trial.sequenceLength,
      },
    });

    if (trial.isCorrect) {
      client.reinforcerPresented({
        kind: 'visual',
        reinforcerId: 'passo-acertado',
        contingentOn: 'ordenacao-correta',
        intensity: 'subtle',
      });
      client.levelCompleted({
        levelId: trial.routineId,
        levelIndex: 0,
        trialsCompleted: trials.length + 1,
        correct: trials.length + 1,
        outcome: 'completed',
      });
    }
  };

  const handleRecordStep = (record: TaskAnalysisRecord) => {
    setRecords((prev) => [...prev, record]);
    client.responseRecorded({
      targetId: record.stepId,
      stimulusId: record.stepId,
      trialIndex: records.length,
      presented: [record.stepId],
      positionOfTarget: record.stepOrder - 1,
      selected: record.stepId,
      selectedPosition: record.stepOrder - 1,
      response: record.promptLevel === 'IND' ? 'correct' : 'incorrect',
      latencyMs: record.durationMs,
      promptLevel: record.promptLevel,
      promptSource: 'therapist',
      detail: {
        setting: record.setting,
        stepOrder: record.stepOrder,
      },
    });
  };

  const handleSaveNewRoutine = (newRoutine: Routine) => {
    setRoutines((prev) => [...prev, newRoutine]);
    setActiveRoutineId(newRoutine.id);
  };

  const toggleMute = () => {
    sound.isMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (ended) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', backgroundColor: '#F8F9FA', color: '#212529', fontFamily: 'system-ui' }}>
        <h2>Passo a Passo Concluído!</h2>
        <p>A análise de tarefas e sequenciamento da rotina foram finalizados com êxito.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--fundo)',
        position: 'relative',
      }}
    >
      {hostPaused && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: 'system-ui' }}>
          <h2>Atividade pausada pelo mediador</h2>
        </div>
      )}
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
