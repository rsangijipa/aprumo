import React, { useState, useEffect, useRef } from 'react';
import { createActor } from 'xstate';
import { useGameClient } from '@aprumo/game-sdk';
import { manifest } from './manifest';
import { parPerfeitoMachine } from './engine-aba/machine';
import { MatchBoard } from './scene/MatchBoard';
import { TrialHUD } from './scene/TrialHUD';
import { PhysicalBridgeModal } from './scene/PhysicalBridgeModal';
import { soundManager } from './audio/soundManager';
import type { InteractionMode, LocutorId, PromptType, TargetItem } from './types';
import { TARGETS_BY_ID } from './assets/targets';
import { RotateCcw, Award, BarChart3, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const actorRef = useRef(createActor(parPerfeitoMachine));
  const [snapshot, setSnapshot] = useState(() => actorRef.current.getSnapshot());

  // Local UI states
  const [isClinicMode, setIsClinicMode] = useState<boolean>(false);
  const [isPhysicalBridgeOpen, setIsPhysicalBridgeOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [activeLocutor, setActiveLocutor] = useState<LocutorId>(soundManager.getLocutor());
  const [outsideDropsCount, setOutsideDropsCount] = useState<number>(0);

  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);

  useEffect(() => {
    if (config?.adaptation?.sound) {
      soundManager.setSound(config.adaptation.sound);
      setIsMuted(config.adaptation.sound === 'off');
    }
  }, [config]);

  useEffect(() => {
    client.gameStarted(manifest.version);
  }, [client]);

  // Subscribe to XState actor on mount
  useEffect(() => {
    const actor = actorRef.current;
    actor.start();
    const subscription = actor.subscribe(newSnapshot => {
      setSnapshot(newSnapshot);
    });

    // Auto start first trial
    actor.send({ type: 'START_TRIAL' });

    return () => {
      subscription.unsubscribe();
      actor.stop();
    };
  }, []);

  const { context, value: stateValue } = snapshot;
  const currentTrial = context.currentTrial;

  // Manage Timers and Audio Lifecycle based on stateValue
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const actor = actorRef.current;

    if (stateValue === 'presentingSD') {
      // Play vocal SD
      soundManager.playSD('Junta igual').then(durationMs => {
        actor.send({ type: 'SD_FINISHED', durationMs });
      });
    } else if (stateValue === 'awaitingResponse') {
      // 1. Prompt delay timer (3.5s without response -> prompt due)
      const promptDelay = setTimeout(() => {
        actor.send({ type: 'PROMPT_DUE' });
      }, currentTrial?.promptDelayMs || 3500);

      // 2. Timeout timer (8.0s without response -> timeout error correction)
      const timeout = setTimeout(() => {
        actor.send({ type: 'TIMEOUT' });
      }, currentTrial?.timeoutMs || 8000);

      return () => {
        clearTimeout(promptDelay);
        clearTimeout(timeout);
      };
    } else if (stateValue === 'prompting') {
      // Prompt active for 2.4 seconds, then completes
      timer = setTimeout(() => {
        actor.send({ type: 'PROMPT_COMPLETED' });
      }, 2400);
    } else if (stateValue === 'reinforcing') {
      // Reinforcement praise & glow for 1.2s
      timer = setTimeout(() => {
        actor.send({ type: 'REINFORCING_DONE' });
      }, 1200);
    } else if (stateValue === 'errorCorrection') {
      // 1s neutral screen (Section 4.1 rule 6)
      timer = setTimeout(() => {
        actor.send({ type: 'ERROR_CORRECTION_DONE' });
      }, 1000);
    } else if (stateValue === 'iti') {
      // Inter-Trial Interval (1.2s)
      timer = setTimeout(() => {
        actor.send({ type: 'ITI_DONE' });
      }, 1200);
    } else if (stateValue === 'idle') {
      // Start next trial immediately
      timer = setTimeout(() => {
        actor.send({ type: 'START_TRIAL' });
      }, 200);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [stateValue, currentTrial?.trialNumber, currentTrial?.promptDelayMs, currentTrial?.timeoutMs]);

  useEffect(() => {
    if (!currentTrial) return;
    const presented = currentTrial.comparisonSlots.map((s) => s.target.id);
    const targetSlotIndex = currentTrial.comparisonSlots.findIndex((s) => s.isCorrect);
    client.levelStarted({
      levelId: `level-${currentTrial.level}`,
      levelIndex: currentTrial.level,
      fieldSize: currentTrial.comparisonSlots.length,
    });
    client.trialStarted({
      targetId: currentTrial.target.id,
      trialIndex: currentTrial.trialNumber - 1,
      presented,
    });
    client.stimulusPresented({
      targetId: currentTrial.target.id,
      trialIndex: currentTrial.trialNumber - 1,
      presented,
      positionOfTarget: targetSlotIndex >= 0 ? targetSlotIndex : 0,
      modality: 'visual_auditory',
    });
  }, [client, currentTrial?.trialNumber, currentTrial?.target.id, currentTrial?.level]);

  // Telemetry handlers
  const handleDropCorrect = (dragPathLength: number, dropDistancePx: number, mode: InteractionMode) => {
    if (currentTrial) {
      const presented = currentTrial.comparisonSlots.map((s) => s.target.id);
      const targetSlotIndex = currentTrial.comparisonSlots.findIndex((s) => s.isCorrect);
      client.responseRecorded({
        targetId: currentTrial.target.id,
        stimulusId: currentTrial.target.id,
        trialIndex: currentTrial.trialNumber - 1,
        presented,
        positionOfTarget: targetSlotIndex >= 0 ? targetSlotIndex : 0,
        selected: currentTrial.target.id,
        selectedPosition: targetSlotIndex >= 0 ? targetSlotIndex : 0,
        response: 'correct',
        latencyMs: Math.max(10, Math.round(dragPathLength > 0 ? dragPathLength * 2 : 1200)),
        promptLevel: currentTrial.promptType,
        promptSource: currentTrial.promptType === 'none' ? 'none' : 'built_in',
        detail: { dragPathLength, dropDistancePx, mode },
      });
    }
    actorRef.current.send({
      type: 'DROP_ON_CORRECT',
      dragPathLength,
      dropDistancePx,
      mode
    });
  };

  const handleDropWrong = (slotIndex: number, dragPathLength: number, dropDistancePx: number, mode: InteractionMode) => {
    if (currentTrial) {
      const presented = currentTrial.comparisonSlots.map((s) => s.target.id);
      const targetSlotIndex = currentTrial.comparisonSlots.findIndex((s) => s.isCorrect);
      const wrongTarget = currentTrial.comparisonSlots[slotIndex]?.target.id ?? null;
      client.responseRecorded({
        targetId: currentTrial.target.id,
        stimulusId: currentTrial.target.id,
        trialIndex: currentTrial.trialNumber - 1,
        presented,
        positionOfTarget: targetSlotIndex >= 0 ? targetSlotIndex : 0,
        selected: wrongTarget,
        selectedPosition: slotIndex,
        response: 'incorrect',
        latencyMs: Math.max(10, Math.round(dragPathLength > 0 ? dragPathLength * 2 : 1200)),
        promptLevel: currentTrial.promptType,
        promptSource: currentTrial.promptType === 'none' ? 'none' : 'built_in',
        detail: { slotIndex, dragPathLength, dropDistancePx, mode },
      });
    }
    actorRef.current.send({
      type: 'DROP_ON_WRONG',
      slotIndex,
      dragPathLength,
      dropDistancePx,
      mode
    });
  };

  const handleOutsideDrop = () => {
    // Soltar fora NÃO registra erro (seção 4.1 rule 3). Modelo volta com mola.
    setOutsideDropsCount(prev => prev + 1);
  };

  // HUD Actions
  const handleSetLevel = (lvl: number) => {
    actorRef.current.send({ type: 'SET_LEVEL', level: lvl });
  };

  const handleSetMode = (mode: InteractionMode) => {
    actorRef.current.send({ type: 'SET_MODE', mode });
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const handleSetLocutor = (locutor: LocutorId) => {
    setActiveLocutor(locutor);
    soundManager.setLocutor(locutor);
  };

  const handleSetPromptOverride = (prompt: PromptType) => {
    actorRef.current.send({ type: 'SET_PROMPT_OVERRIDE', prompt });
  };

  // Derive mastered target items from history
  const masteredTargetItems: TargetItem[] = Array.from(
    new Set(
      context.trialsHistory
        .filter(t => t.result === 'independent_correct')
        .map(t => t.targetId)
    )
  )
    .map(id => TARGETS_BY_ID.get(id))
    .filter((t): t is TargetItem => !!t);

  // If session ended, display clinical summary
  if (stateValue === 'sessionEnd') {
    const total = context.trialsHistory.length;
    const independent = context.trialsHistory.filter(t => t.result === 'independent_correct').length;
    const prompted = context.trialsHistory.filter(t => t.result === 'prompted_correct').length;
    const errors = context.trialsHistory.filter(t => t.result === 'incorrect' || t.result === 'timeout').length;
    const indepPct = total > 0 ? Math.round((independent / total) * 100) : 0;
    const avgLat = total > 0 ? Math.round(context.trialsHistory.reduce((a, b) => a + b.latencyMs, 0) / total) : 0;

    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div
          style={{
            maxWidth: '650px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '36px',
            boxShadow: 'var(--sombra-papel-elevado)',
            border: '2px solid var(--tinta-15)',
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '50%', backgroundColor: 'rgba(14, 131, 136, 0.1)', color: 'var(--igarape)', marginBottom: '16px' }}>
            <Award size={48} />
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--tinta)', marginBottom: '8px' }}>
            Sessão de Treino Concluída!
          </h1>
          <p style={{ color: 'var(--tinta-60)', fontSize: '0.95rem', marginBottom: '24px' }}>
            Programa ABA-01 · Pareamento ao Modelo (MTS) · Nível {context.level}
          </p>

          {/* Supervisor Alert */}
          {context.supervisorAlert && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(244, 162, 97, 0.15)',
                color: '#c9621b',
                marginBottom: '20px',
                textAlign: 'left',
                fontSize: '0.9rem'
              }}
            >
              <AlertCircle size={20} />
              <span>{context.supervisorAlert}</span>
            </div>
          )}

          {/* Metrics Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '28px'
            }}
          >
            <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'var(--fundo)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--tinta-60)', marginBottom: '4px' }}>% Independente</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: indepPct >= 80 ? 'var(--vitoria-regia)' : 'var(--tinta)' }}>
                {indepPct}%
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'var(--fundo)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--tinta-60)', marginBottom: '4px' }}>Latência Média</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--tinta)' }}>
                {avgLat} ms
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'var(--fundo)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--tinta-60)', marginBottom: '4px' }}>Alvos Dominados</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--igarape)' }}>
                {masteredTargetItems.length}
              </div>
            </div>
          </div>

          {/* Breakdown List */}
          <div style={{ textAlign: 'left', backgroundColor: 'var(--fundo)', padding: '16px', borderRadius: '16px', marginBottom: '28px', fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--tinta-15)' }}>
              <span>Acertos Independentes:</span>
              <strong>{independent} / {total}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--tinta-15)' }}>
              <span>Acertos com Dica:</span>
              <strong>{prompted}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--tinta-15)' }}>
              <span>Erros / Correções de Erro:</span>
              <strong>{errors}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span>Soltadas Fora (indicador motor):</span>
              <strong>{outsideDropsCount}x</strong>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              className="btn-outline"
              onClick={() => setIsPhysicalBridgeOpen(true)}
            >
              <BarChart3 size={18} />
              Ponte para o Físico
            </button>
            <button
              className="btn-igarape"
              onClick={() => actorRef.current.send({ type: 'START_TRIAL' })}
            >
              <RotateCcw size={18} />
              Nova Sessão (10 Tentativas)
            </button>
          </div>
        </div>

        {/* Modal */}
        <PhysicalBridgeModal
          isOpen={isPhysicalBridgeOpen}
          onClose={() => setIsPhysicalBridgeOpen(false)}
          masteredTargets={masteredTargetItems}
        />
      </div>
    );
  }

  if (ended) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: '#1c2f28', color: '#fff', fontFamily: 'system-ui' }}>
        <h2>Sessão concluída!</h2>
        <p>Você completou o pareamento das figuras.</p>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ position: 'relative' }}>
      {paused && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: 'system-ui' }}>
          <h2>Atividade pausada pelo mediador</h2>
        </div>
      )}
      {/* Top HUD */}
      <TrialHUD
        currentTrial={currentTrial}
        history={context.trialsHistory}
        level={context.level}
        interactionMode={context.interactionMode}
        isMuted={isMuted}
        activeLocutor={activeLocutor}
        promptOverride={context.promptOverride}
        outsideDropsCount={outsideDropsCount}
        onSetLevel={handleSetLevel}
        onSetMode={handleSetMode}
        onToggleMute={handleToggleMute}
        onSetLocutor={handleSetLocutor}
        onSetPromptOverride={handleSetPromptOverride}
        onOpenPhysicalBridge={() => setIsPhysicalBridgeOpen(true)}
        isClinicMode={isClinicMode}
        onToggleClinicMode={() => setIsClinicMode(!isClinicMode)}
      />

      {/* MTS Playing Arena */}
      <MatchBoard
        currentTrial={currentTrial}
        stateValue={stateValue as string}
        interactionMode={context.interactionMode}
        onDropCorrect={handleDropCorrect}
        onDropWrong={handleDropWrong}
        onOutsideDrop={handleOutsideDrop}
        activePrompt={context.activePrompt}
        promptIntensity={context.promptIntensity}
      />

      {/* Physical Probe Bridge Modal (Section 10) */}
      <PhysicalBridgeModal
        isOpen={isPhysicalBridgeOpen}
        onClose={() => setIsPhysicalBridgeOpen(false)}
        masteredTargets={masteredTargetItems}
      />
    </div>
  );
};

export default App;
