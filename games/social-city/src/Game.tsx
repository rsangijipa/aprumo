import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { playTones, speak, useGameClient, useMotion } from '@aprumo/game-sdk';
import { CharacterPortrait } from './Art';
import { planSocialCityTrials, type PlannedSocialCityTrial, type SocialChoice } from './logic';
import { manifest } from './manifest';
import { SocialCityRenderer, type Character3D } from './renderer3d';
import './game.css';

// Efeitos sonoros procedurais para ambiente social e tomadas de decisão
const SOUND_EFFECTS = {
  step: [{ freq: 180, dur: 0.04, type: 'triangle' as const }],
  interact: [
    { freq: 440, dur: 0.08, type: 'sine' as const },
    { freq: 554.37, dur: 0.12, type: 'sine' as const, delay: 0.06 },
  ],
  assertive: [
    { freq: 523.25, dur: 0.1, type: 'sine' as const },
    { freq: 659.25, dur: 0.12, type: 'triangle' as const, delay: 0.08 },
    { freq: 783.99, dur: 0.15, type: 'sine' as const, delay: 0.16 },
    { freq: 1046.5, dur: 0.28, type: 'sine' as const, delay: 0.24 },
  ],
  coaching: [
    { freq: 392, dur: 0.12, type: 'sine' as const },
    { freq: 440, dur: 0.16, type: 'sine' as const, delay: 0.08 },
    { freq: 349.23, dur: 0.22, type: 'triangle' as const, delay: 0.16 },
  ],
  celebration: [
    { freq: 523.25, dur: 0.12, type: 'sine' as const },
    { freq: 659.25, dur: 0.12, type: 'triangle' as const, delay: 0.1 },
    { freq: 783.99, dur: 0.16, type: 'triangle' as const, delay: 0.2 },
    { freq: 1046.5, dur: 0.35, type: 'sine' as const, delay: 0.32 },
  ],
};

const NPC_POSITIONS: Record<string, { x: number; z: number; bodyColor: string; hairColor: string }> = {
  sofia: { x: -6, z: -4, bodyColor: '#319795', hairColor: '#744210' },
  marcos: { x: 6, z: 5, bodyColor: '#2b6cb0', hairColor: '#2d3748' },
  clara: { x: 0, z: 1, bodyColor: '#805ad5', hairColor: '#d69e2e' },
  lucia: { x: 7, z: -4, bodyColor: '#276749', hairColor: '#a0aec0' },
};

export default function SocialCityGame() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);

  const [trialIdx, setTrialIdx] = useState(0);
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 6 });
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<SocialChoice | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<SocialCityRenderer | null>(null);
  const trialStartRef = useRef<number>(Date.now());
  const promptTimerRef = useRef<number | null>(null);
  const playerPosRef = useRef(playerPos);
  playerPosRef.current = playerPos;

  const trials: PlannedSocialCityTrial[] = useMemo(() => {
    return config ? planSocialCityTrials(config) : [];
  }, [config]);

  const currentTrial = trials[trialIdx];
  const sound = config?.adaptation.sound ?? 'normal';

  // Iniciar sessão no SDK
  useEffect(() => {
    if (!config) return;
    client.gameStarted(manifest.version);
  }, [config, client]);

  // Inicializar Canvas e loop 3D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderer = new SocialCityRenderer(ctx, canvas.clientWidth, canvas.clientHeight);
    rendererRef.current = renderer;

    let animId: number;

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      renderer.resize(rect.width, rect.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const loop = () => {
      const p = playerPosRef.current;
      // Câmera segue o jogador suavemente
      const cam = renderer.camera;
      cam.targetX = p.x;
      cam.targetZ = p.z;
      cam.x += (p.x * 0.4 - cam.x) * 0.08;
      cam.z += (p.z + 11 - cam.z) * 0.08;

      const currentScenarioNpcId = currentTrial?.scenario.npc.avatarId;

      // Monta lista de personagens para desenho 3D
      const characters: Character3D[] = [
        {
          id: 'player',
          name: config?.childDisplayName || 'Você',
          x: p.x,
          z: p.z,
          angle: 0,
          bodyColor: '#3182ce',
          hairColor: '#2d3748',
          isPlayer: true,
        },
      ];

      for (const [avatarId, npcData] of Object.entries(NPC_POSITIONS)) {
        const hasQuest = !done && currentScenarioNpcId === avatarId;
        characters.push({
          id: avatarId,
          name: avatarId.charAt(0).toUpperCase() + avatarId.slice(1),
          x: npcData.x,
          z: npcData.z,
          angle: 0,
          bodyColor: npcData.bodyColor,
          hairColor: npcData.hairColor,
          hasQuest,
        });
      }

      renderer.render(characters, currentTrial?.scenario.position3D);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentTrial, done, config?.childDisplayName]);

  // Movimentação do jogador com limites da cidade
  const movePlayer = useCallback((dx: number, dz: number) => {
    setPlayerPos((prev) => {
      const nextX = Math.max(-12, Math.min(12, prev.x + dx));
      const nextZ = Math.max(-10, Math.min(11, prev.z + dz));
      return { x: nextX, z: nextZ };
    });
    if (sound !== 'off') {
      void playTones(SOUND_EFFECTS.step, sound);
    }
  }, [sound]);

  // Distância até o NPC do cenário ativo
  const distanceToTarget = useMemo(() => {
    if (!currentTrial) return 999;
    const targetPos = currentTrial.scenario.position3D;
    const dx = playerPos.x - targetPos[0];
    const dz = playerPos.z - targetPos[2];
    return Math.hypot(dx, dz);
  }, [currentTrial, playerPos]);

  const canInteract = distanceToTarget <= 3.6;

  // Abrir diálogo com o NPC
  const handleOpenDialogue = useCallback(() => {
    if (!currentTrial || isDialogueOpen || done) return;

    setIsDialogueOpen(true);
    setSelectedChoice(null);
    setShowPrompt(false);
    trialStartRef.current = Date.now();

    if (sound !== 'off') {
      void playTones(SOUND_EFFECTS.interact, sound);
    }

    client.trialStarted({
      trialIndex: trialIdx,
      targetId: currentTrial.targetChoice.stimulusId,
      presented: currentTrial.options.map((o) => o.stimulusId),
    });

    client.stimulusPresented({
      trialIndex: trialIdx,
      targetId: currentTrial.targetChoice.stimulusId,
      presented: currentTrial.options.map((o) => o.stimulusId),
      positionOfTarget: currentTrial.positionOfTarget,
    });

    void speak(currentTrial.scenario.npcDialogue, sound);

    // Dica embutida após tempo limite de resposta
    const promptAfterMs = config?.adaptation.builtInPromptAfterMs ?? 10000;
    if (promptAfterMs > 0) {
      if (promptTimerRef.current) window.clearTimeout(promptTimerRef.current);
      promptTimerRef.current = window.setTimeout(() => {
        setShowPrompt(true);
        client.promptPresented({
          trialIndex: trialIdx,
          targetId: currentTrial.targetChoice.stimulusId,
          level: 'visual-highlight',
          source: 'built_in',
          latencyMs: promptAfterMs,
        });
      }, promptAfterMs);
    }
  }, [currentTrial, isDialogueOpen, done, sound, client, trialIdx, config?.adaptation.builtInPromptAfterMs]);

  // Teclado para movimentação e interação
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (paused || ended || done) return;

      if (isDialogueOpen) {
        // Atalhos 1-4 no diálogo
        if (['1', '2', '3', '4'].includes(e.key) && !selectedChoice && currentTrial) {
          const optIdx = parseInt(e.key, 10) - 1;
          const choice = currentTrial.options[optIdx];
          if (choice) {
            handleSelectChoice(choice, optIdx);
          }
        }
        return;
      }

      const speed = 0.8;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          movePlayer(0, -speed);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movePlayer(0, speed);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePlayer(-speed, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePlayer(speed, 0);
          break;
        case ' ':
        case 'Enter':
          if (canInteract) {
            handleOpenDialogue();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paused, ended, done, isDialogueOpen, selectedChoice, currentTrial, canInteract, handleOpenDialogue, movePlayer]);

  // Teletransporte para conveniência / acessibilidade motora
  const handleTeleportToTarget = () => {
    if (!currentTrial) return;
    const targetPos = currentTrial.scenario.position3D;
    setPlayerPos({ x: targetPos[0] + 0.8, z: targetPos[2] + 1.2 });
  };

  // Seleção de resposta na interação social
  const handleSelectChoice = (choice: SocialChoice, index: number) => {
    if (!currentTrial || selectedChoice) return;

    if (promptTimerRef.current) {
      window.clearTimeout(promptTimerRef.current);
      promptTimerRef.current = null;
    }

    const latencyMs = Date.now() - trialStartRef.current;
    const isOptimal = choice.isOptimal;

    client.responseRecorded({
      trialIndex: trialIdx,
      targetId: currentTrial.targetChoice.stimulusId,
      stimulusId: choice.stimulusId,
      presented: currentTrial.options.map((o) => o.stimulusId),
      positionOfTarget: currentTrial.positionOfTarget,
      selected: choice.stimulusId,
      selectedPosition: index,
      response: isOptimal ? 'correct' : 'incorrect',
      latencyMs,
      promptLevel: showPrompt ? 'visual-highlight' : 'none',
      promptSource: 'none',
    });

    setSelectedChoice(choice);
    setScore((s) => s + choice.score);

    if (sound !== 'off') {
      if (isOptimal) {
        void playTones(SOUND_EFFECTS.assertive, sound);
      } else {
        void playTones(SOUND_EFFECTS.coaching, sound);
      }
    }

    void speak(choice.clinicalFeedback, sound);
  };

  // Prosseguir para o próximo cenário após ler o feedback
  const handleNextScenario = () => {
    setIsDialogueOpen(false);
    setSelectedChoice(null);
    setShowPrompt(false);

    if (trialIdx + 1 >= trials.length) {
      setDone(true);
      client.gameCompleted(trials.length);
      if (sound !== 'off') {
        void playTones(SOUND_EFFECTS.celebration, sound);
      }
    } else {
      setTrialIdx((prev) => prev + 1);
    }
  };

  return (
    <div className="sc-container" data-testid="social-city-container">
      <canvas ref={canvasRef} className="sc-canvas" />

      {/* HUD Superior */}
      <header className="sc-hud-top" role="banner">
        <div className="sc-location-pill">
          <span>📍</span>
          <span>{currentTrial?.scenario.locationName ?? 'Praça Central'}</span>
        </div>

        <div className="sc-hud-controls-hint">
          <span>Mover: [WASD / Setas] ou Toque • Falar: [Espaço]</span>
        </div>

        <div className="sc-score-badge">
          <span>⭐ Pontos: {score}</span>
        </div>
      </header>

      {/* Botão de Atalho para Aproximação / Interação */}
      {!isDialogueOpen && !done && (
        <div className="sc-interact-prompt">
          {canInteract ? (
            <button
              type="button"
              className="sc-interact-btn"
              onClick={handleOpenDialogue}
              aria-label={`Conversar com ${currentTrial?.scenario.npc.name}`}
            >
              <span>💬</span>
              <span>Falar com {currentTrial?.scenario.npc.name}</span>
            </button>
          ) : (
            <button
              type="button"
              className="sc-interact-btn"
              style={{ background: '#4a5568' }}
              onClick={handleTeleportToTarget}
              aria-label={`Ir até ${currentTrial?.scenario.npc.name}`}
            >
              <span>🚶</span>
              <span>Ir até {currentTrial?.scenario.npc.name}</span>
            </button>
          )}
        </div>
      )}

      {/* Controles de Toque (D-Pad Virtual na esquerda) */}
      {!isDialogueOpen && !done && (
        <nav className="sc-touch-controls" aria-label="Controles de Navegação 3D">
          <div />
          <button
            type="button"
            className="sc-dpad-btn"
            onClick={() => movePlayer(0, -1)}
            aria-label="Andar para frente"
          >
            ▲
          </button>
          <div />
          <button
            type="button"
            className="sc-dpad-btn"
            onClick={() => movePlayer(-1, 0)}
            aria-label="Andar para a esquerda"
          >
            ◄
          </button>
          <button
            type="button"
            className="sc-dpad-btn"
            onClick={() => movePlayer(0, 1)}
            aria-label="Andar para trás"
          >
            ▼
          </button>
          <button
            type="button"
            className="sc-dpad-btn"
            onClick={() => movePlayer(1, 0)}
            aria-label="Andar para a direita"
          >
            ►
          </button>
        </nav>
      )}

      {/* Modal de Diálogo e Decisão Social */}
      {isDialogueOpen && currentTrial && (
        <div className="sc-dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="sc-dialog-title">
          <div className="sc-dialog-card">
            {currentTrial.scenario.locationId === 'cafeteria' && (
              <div style={{ borderRadius: '16px 16px 0 0', overflow: 'hidden', maxHeight: '100px', borderBottom: '1px solid #334155' }}>
                <img
                  src="/assets/environment_teen_cafe.svg"
                  alt="Ambiente: Cafeteria da Praça"
                  style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}
            <div className="sc-dialog-head">
              <CharacterPortrait id={currentTrial.scenario.npc.avatarId} size={52} />
              <div className="sc-npc-meta">
                <span id="sc-dialog-title" className="sc-npc-name">
                  {currentTrial.scenario.npc.name}
                </span>
                <span className="sc-npc-role">{currentTrial.scenario.npc.role}</span>
              </div>
            </div>

            <div className="sc-dialog-body">
              <div className="sc-context-hint">
                <strong>Situação:</strong> {currentTrial.scenario.contextSummary}
              </div>

              <div className="sc-speech-bubble" aria-live="polite">
                "{currentTrial.scenario.npcDialogue}"
              </div>

              {!selectedChoice ? (
                <div className="sc-choices-grid" role="group" aria-label="Opções de resposta social">
                  {currentTrial.options.map((choice, i) => {
                    const isHinted = showPrompt && choice.isOptimal;
                    return (
                      <button
                        key={choice.stimulusId}
                        type="button"
                        className={`sc-choice-btn ${isHinted ? 'sc-choice-btn--highlight' : ''}`}
                        onClick={() => handleSelectChoice(choice, i)}
                      >
                        <strong>{i + 1}. </strong>
                        {choice.text}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="sc-feedback-box" role="alert">
                  <div
                    className={`sc-feedback-tag ${
                      selectedChoice.isOptimal ? 'sc-feedback-tag--optimal' : 'sc-feedback-tag--other'
                    }`}
                  >
                    <span>{selectedChoice.isOptimal ? '🌟 Escolha Assertiva (+100 pts)' : '💡 Ponto de Reflexão'}</span>
                  </div>
                  <p className="sc-feedback-text">{selectedChoice.clinicalFeedback}</p>
                  <button type="button" className="sc-continue-btn" onClick={handleNextScenario}>
                    Continuar Cidade ➔
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Conclusão da Sessão */}
      {done && (
        <div className="sc-dialog-overlay" role="dialog" aria-modal="true">
          <div className="sc-dialog-card sc-celebration-card">
            <div className="sc-celebration-badge">🏆 Cidade Concluída com Sucesso!</div>
            <h2>Excelente Comunicação Social!</h2>
            <p>
              Você explorou a cidade e praticou comunicação assertiva, respeito aos limites e
              interações autônomas do dia a dia.
            </p>
            <div className="sc-score-badge" style={{ fontSize: '1.25rem', padding: '0.8rem 1.6rem' }}>
              Pontuação Final: {score} pontos
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
