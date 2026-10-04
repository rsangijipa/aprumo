import { useEffect, useMemo, useRef, useState } from 'react';
import { playTones, speak, useGameClient, useMotion } from '@aprumo/game-sdk';
import { IndependenceArt } from './Art';
import { INDEPENDENCE_MISSIONS, planMissionTrials, type PlannedMissionTrial } from './logic';
import { manifest } from './manifest';
import './game.css';

const SOUNDS = {
  zip: [
    { freq: 440, dur: 0.08, type: 'sawtooth' as const },
    { freq: 880, dur: 0.12, type: 'triangle' as const, delay: 0.06 },
  ],
  cash: [
    { freq: 783.99, dur: 0.1, type: 'sine' as const },
    { freq: 1046.5, dur: 0.2, type: 'sine' as const, delay: 0.08 },
  ],
  card: [
    { freq: 880, dur: 0.06, type: 'sine' as const },
    { freq: 1174.66, dur: 0.14, type: 'sine' as const, delay: 0.08 },
  ],
  water: [
    { freq: 523.25, dur: 0.1, type: 'sine' as const },
    { freq: 659.25, dur: 0.12, type: 'triangle' as const, delay: 0.08 },
  ],
  door: [
    { freq: 392, dur: 0.1, type: 'triangle' as const },
    { freq: 523.25, dur: 0.16, type: 'sine' as const, delay: 0.08 },
  ],
  chime: [
    { freq: 587.33, dur: 0.1, type: 'sine' as const },
    { freq: 783.99, dur: 0.18, type: 'triangle' as const, delay: 0.08 },
  ],
  gentle_bump: [{ freq: 220, dur: 0.12, type: 'sine' as const }],
  celebration: [
    { freq: 523.25, dur: 0.14, type: 'sine' as const },
    { freq: 659.25, dur: 0.14, type: 'triangle' as const, delay: 0.12 },
    { freq: 783.99, dur: 0.18, type: 'triangle' as const, delay: 0.24 },
    { freq: 1046.5, dur: 0.35, type: 'sine' as const, delay: 0.38 },
  ],
};

export default function MissaoIndependencia() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);

  const [missionIdx, setMissionIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const trialStartRef = useRef<number>(Date.now());
  const busyRef = useRef(false);
  const promptTimerRef = useRef<number | null>(null);

  const currentMission = INDEPENDENCE_MISSIONS[missionIdx]!;
  const trials: PlannedMissionTrial[] = useMemo(() => {
    return config ? planMissionTrials(config, missionIdx) : [];
  }, [config, missionIdx]);

  const currentTrial = trials[stepIdx];
  const sound = config?.adaptation.sound ?? 'normal';
  const scale = config?.adaptation.touchScale ?? 1;

  // Iniciar sessão
  useEffect(() => {
    if (!config) return;
    client.gameStarted(manifest.version);
  }, [config, client]);

  // Início de cada tentativa
  useEffect(() => {
    if (!config || !currentTrial || done) return;

    trialStartRef.current = Date.now();
    setShowPrompt(false);

    client.trialStarted({
      trialIndex: stepIdx,
      targetId: currentTrial.targetStep.stimulusId,
      presented: currentTrial.options.map((o) => o.stimulusId),
    });

    client.stimulusPresented({
      trialIndex: stepIdx,
      targetId: currentTrial.targetStep.stimulusId,
      presented: currentTrial.options.map((o) => o.stimulusId),
      positionOfTarget: currentTrial.positionOfTarget,
    });

    void speak(currentTrial.instruction, sound);

    const promptAfterMs = config.adaptation.builtInPromptAfterMs ?? 8000;
    if (promptAfterMs > 0) {
      if (promptTimerRef.current) window.clearTimeout(promptTimerRef.current);
      promptTimerRef.current = window.setTimeout(() => {
        setShowPrompt(true);
        client.promptPresented({
          trialIndex: stepIdx,
          targetId: currentTrial.targetStep.stimulusId,
          level: 'gesture',
          source: 'built_in',
          latencyMs: promptAfterMs,
        });
      }, promptAfterMs);
    }

    return () => {
      if (promptTimerRef.current) window.clearTimeout(promptTimerRef.current);
    };
  }, [config, currentTrial, stepIdx, done, client, sound]);

  if (!config || !currentTrial) {
    return <div className="adl" aria-busy="true" />;
  }

  const handleSelectOption = (pos: number) => {
    if (busyRef.current || done) return;
    const selected = currentTrial.options[pos]!;
    const isTarget = pos === currentTrial.positionOfTarget;
    const latencyMs = Date.now() - trialStartRef.current;

    if (promptTimerRef.current) {
      window.clearTimeout(promptTimerRef.current);
      promptTimerRef.current = null;
    }

    if (isTarget) {
      busyRef.current = true;

      // Efeito sonoro do passo
      const snd = SOUNDS[currentTrial.soundType] ?? SOUNDS.chime;
      playTones(snd, sound);

      const nextSteps = [...completedSteps, selected.stimulusId];
      setCompletedSteps(nextSteps);

      client.responseRecorded({
        trialIndex: stepIdx,
        targetId: currentTrial.targetStep.stimulusId,
        stimulusId: currentTrial.targetStep.stimulusId,
        presented: currentTrial.options.map((o) => o.stimulusId),
        positionOfTarget: currentTrial.positionOfTarget,
        selected: selected.stimulusId,
        selectedPosition: pos,
        response: 'correct',
        latencyMs,
        promptLevel: showPrompt ? 'gesture' : 'independent',
        promptSource: showPrompt ? 'built_in' : 'none',
      });

      const delay = motion === 'static' ? 400 : 850;
      window.setTimeout(() => {
        if (stepIdx + 1 < trials.length) {
          setStepIdx((s) => s + 1);
          busyRef.current = false;
        } else {
          setDone(true);
          playTones(SOUNDS.celebration, sound);
          void speak('Parabéns! Missão cumprida com total independência!', sound);
          client.gameCompleted(trials.length);
        }
      }, delay);
    } else {
      playTones(SOUNDS.gentle_bump, sound);
      client.responseRecorded({
        trialIndex: stepIdx,
        targetId: currentTrial.targetStep.stimulusId,
        stimulusId: currentTrial.targetStep.stimulusId,
        presented: currentTrial.options.map((o) => o.stimulusId),
        positionOfTarget: currentTrial.positionOfTarget,
        selected: selected.stimulusId,
        selectedPosition: pos,
        response: 'incorrect',
        latencyMs,
        promptLevel: 'independent',
        promptSource: 'none',
      });
    }
  };

  const switchMission = (idx: number) => {
    setMissionIdx(idx);
    setStepIdx(0);
    setCompletedSteps([]);
    setDone(false);
    busyRef.current = false;
  };

  return (
    <div
      className="adl"
      data-palette={config.adaptation.palette}
      data-motion={motion}
      style={{ ['--adl-scale' as string]: scale }}
    >
      {/* Barra superior de missões */}
      <header className="adl-header">
        <div className="adl-mission-tabs" role="tablist" aria-label="Missões de autonomia">
          {INDEPENDENCE_MISSIONS.map((m, i) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={missionIdx === i}
              className="adl-mission-tab"
              onClick={() => switchMission(i)}
            >
              <span className="adl-tab-icon">{m.icon}</span>
              <span className="adl-tab-title">{m.title}</span>
            </button>
          ))}
        </div>

        <div className="adl-step-pill" aria-label={`Passo ${stepIdx + 1} de ${trials.length}`}>
          <span>Passo {stepIdx + 1} de {trials.length}</span>
        </div>
      </header>

      {/* Caixa de instrução da etapa */}
      <div className="adl-instruction-box">
        <div className="adl-instruction-title">{currentTrial.instruction}</div>
        <div className="adl-instruction-note">
          <span>{currentTrial.targetStep.sensoryNote}</span>
        </div>
      </div>

      {/* Checklist / Esteira da missão com vinheta visual */}
      <div className="adl-stage">
        <div className="adl-mission-card">
          <div className="adl-vignette">
            <MissionVignette context={currentTrial.context} completedCount={completedSteps.length} />
          </div>

          <div className="adl-checklist" role="region" aria-label="Passos da missão">
            {currentMission.steps.map((st, i) => {
              const isFinished = i < stepIdx;
              const isCurrent = i === stepIdx;
              return (
                <div
                  key={st.stimulusId}
                  className={`adl-check-item ${isFinished ? 'is-done' : isCurrent ? 'is-current' : 'is-upcoming'}`}
                >
                  <span className="adl-check-status">{isFinished ? '✓' : `${i + 1}`}</span>
                  <span className="adl-check-label">{st.label}</span>
                  <span className="adl-check-icon">{st.icon}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Opções de ação para escolha */}
      <div className="adl-options-row" role="group" aria-label="Opções para a próxima ação">
        {currentTrial.options.map((opt, pos) => {
          const isTarget = pos === currentTrial.positionOfTarget;
          const highlight = showPrompt && isTarget;
          return (
            <button
              key={`${stepIdx}-${opt.stimulusId}-${pos}`}
              className={`adl-option-card ${highlight ? 'adl-option-card--highlight' : ''}`}
              onClick={() => handleSelectOption(pos)}
              aria-label={opt.label}
            >
              <div className="adl-art-wrapper">
                <IndependenceArt id={opt.art} size={52} />
              </div>
              <span className="adl-opt-title">{opt.label}</span>
              <span className="adl-opt-desc">{opt.sensoryNote}</span>
            </button>
          );
        })}
      </div>

      {/* Modal de Pausa */}
      {(paused || ended) && !done && (
        <div className="adl-modal-overlay" role="status">
          <div className="adl-modal-card">
            <h3>Pausa na Atividade</h3>
            <p>Respire fundo e continue a missão quando estiver pronto.</p>
          </div>
        </div>
      )}

      {/* Modal de Conclusão da Missão */}
      {done && (
        <div className="adl-modal-overlay" role="status">
          <div className="adl-modal-card adl-celebration-card">
            <div className="adl-celebration-badge">⭐ Missão Cumprida com Sucesso! ⭐</div>
            <h2>{currentMission.title}</h2>
            <p>Você demonstrou grande autonomia e completou cada etapa com maestria!</p>
            <div className="adl-celebration-actions">
              <button
                className="adl-btn-primary"
                onClick={() => switchMission((missionIdx + 1) % INDEPENDENCE_MISSIONS.length)}
              >
                Próxima Missão ({INDEPENDENCE_MISSIONS[(missionIdx + 1) % INDEPENDENCE_MISSIONS.length]!.title})
              </button>
              <button
                className="adl-btn-secondary"
                onClick={() => switchMission(missionIdx)}
              >
                Repetir Missão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MissionVignette({
  context,
  completedCount,
}: {
  context: 'school' | 'market' | 'transit' | 'morning';
  completedCount: number;
}) {
  switch (context) {
    case 'school':
      return (
        <svg viewBox="0 0 160 100" className="vignette-svg">
          <rect width="160" height="100" rx="12" fill="#ebf8ff" />
          {/* Mesa e mochila */}
          <rect x="20" y="70" width="120" height="24" rx="4" fill="#cbd5e0" />
          <path d="M 60 30 C 60 20, 100 20, 100 30 L 105 72 L 55 72 Z" fill="#319795" stroke="#234e52" strokeWidth="2.5" />
          <line x1="80" y1="28" x2="80" y2="70" stroke="#ecc94b" strokeWidth="3" strokeDasharray="3 2" />
          {completedCount > 0 && <circle cx="68" cy="45" r="5" fill="#3182ce" />}
          {completedCount > 1 && <rect x="85" y="40" width="10" height="12" rx="2" fill="#dd6b20" />}
          {completedCount > 2 && <circle cx="106" cy="55" r="4" fill="#4fd1c5" />}
          {completedCount > 3 && <rect x="74" y="55" width="12" height="10" rx="2" fill="#e53e3e" />}
        </svg>
      );
    case 'market':
      return (
        <svg viewBox="0 0 160 100" className="vignette-svg">
          <rect width="160" height="100" rx="12" fill="#fefcbf" />
          {/* Prateleiras de mercado */}
          <rect x="20" y="20" width="60" height="70" rx="4" fill="#edf2f7" stroke="#cbd5e0" strokeWidth="2" />
          <line x1="20" y1="45" x2="80" y2="45" stroke="#cbd5e0" strokeWidth="2" />
          <line x1="20" y1="70" x2="80" y2="70" stroke="#cbd5e0" strokeWidth="2" />
          {/* Caixa registradora */}
          <rect x="95" y="45" width="45" height="45" rx="6" fill="#4a5568" stroke="#2d3748" strokeWidth="2" />
          <rect x="105" y="52" width="25" height="14" rx="2" fill="#48bb78" />
          <circle cx="118" cy="76" r="4" fill="#ecc94b" />
        </svg>
      );
    case 'transit':
      return (
        <svg viewBox="0 0 160 100" className="vignette-svg">
          <rect width="160" height="100" rx="12" fill="#e6fffa" />
          {/* Ponto e Ônibus */}
          <line x1="30" y1="20" x2="30" y2="85" stroke="#4a5568" strokeWidth="3" />
          <circle cx="30" cy="24" r="10" fill="#3182ce" />
          <rect x="55" y="28" width="85" height="52" rx="8" fill="#3182ce" stroke="#2b6cb0" strokeWidth="2" />
          <rect x="65" y="36" width="20" height="16" rx="2" fill="#ebf8ff" />
          <rect x="95" y="36" width="35" height="16" rx="2" fill="#ebf8ff" />
          <rect x="75" y="22" width="45" height="8" rx="2" fill="#1a202c" />
          <circle cx="75" cy="80" r="8" fill="#1a202c" />
          <circle cx="120" cy="80" r="8" fill="#1a202c" />
        </svg>
      );
    case 'morning':
      return (
        <svg viewBox="0 0 160 100" className="vignette-svg">
          <rect width="160" height="100" rx="12" fill="#feebc8" />
          {/* Janela com sol e porta */}
          <rect x="25" y="20" width="40" height="45" rx="3" fill="#bee3f8" stroke="#a0aec0" strokeWidth="2" />
          <line x1="45" y1="20" x2="45" y2="65" stroke="#a0aec0" strokeWidth="2" />
          <line x1="25" y1="42" x2="65" y2="42" stroke="#a0aec0" strokeWidth="2" />
          <circle cx="35" cy="32" r="6" fill="#ecc94b" />
          {/* Porta com maçaneta */}
          <rect x="90" y="20" width="45" height="70" rx="4" fill="#b7791f" stroke="#744210" strokeWidth="2" />
          <circle cx="125" cy="55" r="3" fill="#ecc94b" />
        </svg>
      );
  }
}
