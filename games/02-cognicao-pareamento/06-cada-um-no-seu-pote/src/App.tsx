import React, { useState, useEffect, useRef } from 'react';
import { createActor } from 'xstate';
import confetti from 'canvas-confetti';
import { useGameClient } from '@aprumo/game-sdk';
import { manifest } from './manifest';
import { cadaUmNoSeuPoteMachine } from './engine-aba/machine';
import { PhaserHost } from './scene/PhaserHost';
import { SortHUD } from './scene/SortHUD';
import { PhysicalBridgeModal } from './scene/PhysicalBridgeModal';
import { soundManager } from './audio/soundManager';
import type {
  BinDefinition,
  ClassificationRule,
  GameMode,
  SensoryProfile,
  SortItem
} from './types';

export const App: React.FC = () => {
  const actorRef = useRef(createActor(cadaUmNoSeuPoteMachine));
  const [snapshot, setSnapshot] = useState(() => actorRef.current.getSnapshot());

  const [isPhysicalBridgeOpen, setIsPhysicalBridgeOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

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

    // Start first trial
    actor.send({ type: 'START_TRIAL' });

    return () => {
      subscription.unsubscribe();
      actor.stop();
    };
  }, []);

  const { context, value: stateValue } = snapshot;

  // Manage SD vocalization
  useEffect(() => {
    if (stateValue === 'presentingSD') {
      soundManager.playSD('Coloca com os iguais').then(() => {
        actorRef.current.send({ type: 'SD_FINISHED' });
      });
    } else if (stateValue === 'reinforcing') {
      try {
        confetti({
          particleCount: 20,
          spread: 50,
          origin: { y: 0.3 },
          colors: ['#2D6A4F', '#52B788', '#FFB703', '#F4A261'],
          disableForReducedMotion: true
        });
      } catch (e) {
        // Safe fallback
      }

      const timer = setTimeout(() => {
        actorRef.current.send({ type: 'REINFORCING_DONE' });
      }, 1200);
      return () => clearTimeout(timer);
    } else if (stateValue === 'errorReturn') {
      const timer = setTimeout(() => {
        actorRef.current.send({ type: 'ERROR_RETURN_DONE' });
      }, 800);
      return () => clearTimeout(timer);
    } else if (stateValue === 'idle') {
      const timer = setTimeout(() => {
        actorRef.current.send({ type: 'START_TRIAL' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [stateValue]);

  useEffect(() => {
    if (!context.currentItem) return;
    const presented = context.bins.map((b) => b.id);
    const targetBinIndex = context.bins.findIndex((b) => b.attributeValue === context.currentItem?.attributeValue);
    client.levelStarted({
      levelId: `rule-${context.rule}`,
      levelIndex: ['cor', 'forma', 'tamanho', 'categoria', 'funcao'].indexOf(context.rule),
      fieldSize: context.bins.length,
    });
    client.trialStarted({
      targetId: context.currentItem.id,
      trialIndex: context.history.length,
      presented,
    });
    client.stimulusPresented({
      targetId: context.currentItem.id,
      trialIndex: context.history.length,
      presented,
      positionOfTarget: targetBinIndex >= 0 ? targetBinIndex : 0,
      modality: 'visual_auditory',
    });
  }, [client, context.currentItem?.id, context.rule, context.bins.length]);

  // Telemetry drop handler from Matter.js world
  const handleItemEnterBin = (item: SortItem, bin: BinDefinition, throwVelocity: number) => {
    const isCorrect = bin.attributeValue === item.attributeValue;
    const presented = context.bins.map((b) => b.id);
    const targetBinIndex = context.bins.findIndex((b) => b.attributeValue === item.attributeValue);
    const selectedBinIndex = context.bins.findIndex((b) => b.id === bin.id);

    client.responseRecorded({
      targetId: item.id,
      stimulusId: item.id,
      trialIndex: context.history.length,
      presented,
      positionOfTarget: targetBinIndex >= 0 ? targetBinIndex : 0,
      selected: bin.id,
      selectedPosition: selectedBinIndex >= 0 ? selectedBinIndex : 0,
      response: isCorrect ? 'correct' : 'incorrect',
      latencyMs: Math.max(10, Math.round(throwVelocity > 0 ? 1000 / throwVelocity : 1200)),
      promptLevel: context.activePrompt ?? 'none',
      promptSource: context.activePrompt !== 'none' ? 'built_in' : 'none',
      detail: { rule: context.rule, throwVelocity, bin: bin.label },
    });

    actorRef.current.send({
      type: 'ITEM_DROPPED_IN_BIN',
      item,
      bin,
      throwVelocity
    });
  };

  const handleItemReturnToTray = (_item: SortItem) => {
    // Returned to tray (Section 7: "não é erro")
  };

  const handleSetMode = (mode: GameMode) => {
    actorRef.current.send({ type: 'SET_MODE', mode });
    actorRef.current.send({ type: 'START_TRIAL' });
  };

  const handleSwitchRule = (newRule: ClassificationRule) => {
    actorRef.current.send({ type: 'SWITCH_RULE', newRule });
    actorRef.current.send({ type: 'START_TRIAL' });
  };

  const handleSetSensoryProfile = (profile: SensoryProfile) => {
    actorRef.current.send({ type: 'SET_SENSORY_PROFILE', profile });
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  const handleRecordAdultPrompt = () => {
    if (context.currentItem) {
      client.promptPresented({
        targetId: context.currentItem.id,
        trialIndex: context.history.length,
        level: 'verbal',
        source: 'therapist',
        latencyMs: 1000,
      });
    }
    actorRef.current.send({ type: 'RECORD_ADULT_PROMPT' });
  };

  const handleRecordOffTaskPause = () => {
    client.paused('off_task');
    actorRef.current.send({ type: 'RECORD_OFF_TASK_PAUSE' });
  };

  const handleRestart = () => {
    actorRef.current.send({ type: 'START_TRIAL' });
  };

  if (ended) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: '#1c2f28', color: '#fff', fontFamily: 'system-ui' }}>
        <h2>Sessão concluída!</h2>
        <p>Você guardou todos os objetos nos potes certos.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', position: 'relative' }}>
      {paused && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: 'system-ui' }}>
          <h2>Atividade pausada pelo mediador</h2>
        </div>
      )}
      {/* Top Clinical & Status HUD */}
      <SortHUD
        mode={context.mode}
        rule={context.rule}
        sensoryProfile={context.sensoryProfile}
        history={context.history}
        taskStats={context.taskStats}
        isMuted={isMuted}
        onSetMode={handleSetMode}
        onSwitchRule={handleSwitchRule}
        onSetSensoryProfile={handleSetSensoryProfile}
        onToggleMute={handleToggleMute}
        onRecordAdultPrompt={handleRecordAdultPrompt}
        onRecordOffTaskPause={handleRecordOffTaskPause}
        onOpenPhysicalBridge={() => setIsPhysicalBridgeOpen(true)}
        onRestart={handleRestart}
      />

      {/* Physics World Area */}
      <main style={{ flex: 1, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PhaserHost
          bins={context.bins}
          currentItem={context.currentItem}
          itemsQueue={context.itemsQueue}
          sensoryProfile={context.sensoryProfile}
          onItemEnterBin={handleItemEnterBin}
          onItemReturnToTray={handleItemReturnToTray}
        />
      </main>

      {/* Section 10 Physical Bridge Modal */}
      <PhysicalBridgeModal
        isOpen={isPhysicalBridgeOpen}
        onClose={() => setIsPhysicalBridgeOpen(false)}
        rule={context.rule}
      />
    </div>
  );
};

export default App;
