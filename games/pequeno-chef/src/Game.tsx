import { useEffect, useMemo, useRef, useState } from 'react';
import { playTones, speak, useGameClient, useMotion } from '@aprumo/game-sdk';
import { CulinaryArt } from './Art';
import { CHEF_RECIPES, planChefTrials, type PlannedChefTrial } from './logic';
import { manifest } from './manifest';
import './game.css';

// Paleta de efeitos sonoros culinários calmos
const SOUND_EFFECTS = {
  plop: [
    { freq: 440, dur: 0.08, type: 'sine' as const },
    { freq: 659.25, dur: 0.14, type: 'triangle' as const, delay: 0.06 },
  ],
  slice: [
    { freq: 880, dur: 0.04, type: 'sawtooth' as const },
    { freq: 1174.66, dur: 0.08, type: 'sine' as const, delay: 0.04 },
  ],
  stir: [
    { freq: 392, dur: 0.1, type: 'sine' as const },
    { freq: 523.25, dur: 0.12, type: 'sine' as const, delay: 0.08 },
    { freq: 659.25, dur: 0.16, type: 'triangle' as const, delay: 0.16 },
  ],
  pour: [
    { freq: 587.33, dur: 0.12, type: 'sine' as const },
    { freq: 523.25, dur: 0.14, type: 'sine' as const, delay: 0.08 },
    { freq: 440, dur: 0.18, type: 'sine' as const, delay: 0.16 },
  ],
  sizzle: [
    { freq: 659.25, dur: 0.08, type: 'triangle' as const },
    { freq: 783.99, dur: 0.12, type: 'triangle' as const, delay: 0.06 },
    { freq: 1046.5, dur: 0.25, type: 'sine' as const, delay: 0.14 },
  ],
  blender: [
    { freq: 261.63, dur: 0.1, type: 'triangle' as const },
    { freq: 329.63, dur: 0.12, type: 'triangle' as const, delay: 0.08 },
    { freq: 440, dur: 0.18, type: 'sine' as const, delay: 0.16 },
    { freq: 523.25, dur: 0.3, type: 'sine' as const, delay: 0.24 },
  ],
  correct: [
    { freq: 523.25, dur: 0.1, type: 'sine' as const },
    { freq: 659.25, dur: 0.12, type: 'triangle' as const, delay: 0.09 },
    { freq: 783.99, dur: 0.25, type: 'sine' as const, delay: 0.18 },
  ],
  gentle_bump: [{ freq: 220, dur: 0.12, type: 'sine' as const }],
  celebration: [
    { freq: 523.25, dur: 0.14, type: 'sine' as const },
    { freq: 659.25, dur: 0.14, type: 'triangle' as const, delay: 0.12 },
    { freq: 783.99, dur: 0.18, type: 'triangle' as const, delay: 0.24 },
    { freq: 1046.5, dur: 0.35, type: 'sine' as const, delay: 0.38 },
  ],
};

export default function PequenoChef() {
  const { client, config, paused, ended } = useGameClient(manifest.appId, manifest.version);
  const motion = useMotion(config);

  const [recipeIdx, setRecipeIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [assembledItems, setAssembledItems] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const trialStartRef = useRef<number>(Date.now());
  const busyRef = useRef(false);
  const promptTimerRef = useRef<number | null>(null);

  const currentRecipe = CHEF_RECIPES[recipeIdx]!;
  const trials: PlannedChefTrial[] = useMemo(() => {
    return config ? planChefTrials(config, recipeIdx) : [];
  }, [config, recipeIdx]);

  const currentTrial = trials[stepIdx];
  const sound = config?.adaptation.sound ?? 'normal';
  const scale = config?.adaptation.touchScale ?? 1;

  // Iniciar sessão
  useEffect(() => {
    if (!config) return;
    client.gameStarted(manifest.version);
  }, [config, client]);

  // Ciclo de início de tentativa
  useEffect(() => {
    if (!config || !currentTrial || done) return;

    trialStartRef.current = Date.now();
    setShowPrompt(false);

    client.trialStarted({
      trialIndex: stepIdx,
      targetId: currentTrial.targetItem.stimulusId,
      presented: currentTrial.options.map((o) => o.stimulusId),
    });

    client.stimulusPresented({
      trialIndex: stepIdx,
      targetId: currentTrial.targetItem.stimulusId,
      presented: currentTrial.options.map((o) => o.stimulusId),
      positionOfTarget: currentTrial.positionOfTarget,
    });

    // Narração de apoio auditivo
    void speak(currentTrial.instruction, sound);

    // Dica embutida após tempo limite
    const promptAfterMs = config.adaptation.builtInPromptAfterMs ?? 8000;
    if (promptAfterMs > 0) {
      if (promptTimerRef.current) window.clearTimeout(promptTimerRef.current);
      promptTimerRef.current = window.setTimeout(() => {
        setShowPrompt(true);
        client.promptPresented({
          trialIndex: stepIdx,
          targetId: currentTrial.targetItem.stimulusId,
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
    return <div className="chef" aria-busy="true" />;
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

      // Tocar som temático do preparo
      const effect = SOUND_EFFECTS[currentTrial.soundType] ?? SOUND_EFFECTS.correct;
      playTones(effect, sound);

      // Adicionar à montagem visual
      const nextItems = [...assembledItems, selected.art];
      setAssembledItems(nextItems);

      client.responseRecorded({
        trialIndex: stepIdx,
        targetId: currentTrial.targetItem.stimulusId,
        stimulusId: currentTrial.targetItem.stimulusId,
        presented: currentTrial.options.map((o) => o.stimulusId),
        positionOfTarget: currentTrial.positionOfTarget,
        selected: selected.stimulusId,
        selectedPosition: pos,
        response: 'correct',
        latencyMs,
        promptLevel: showPrompt ? 'gesture' : 'independent',
        promptSource: showPrompt ? 'built_in' : 'none',
      });

      const delay = motion === 'static' ? 400 : 900;
      window.setTimeout(() => {
        if (stepIdx + 1 < trials.length) {
          setStepIdx((s) => s + 1);
          busyRef.current = false;
        } else {
          setDone(true);
          playTones(SOUND_EFFECTS.celebration, sound);
          void speak('Muito bem, Chefinho! A receita ficou pronta e deliciosa!', sound);
          client.gameCompleted(trials.length);
        }
      }, delay);
    } else {
      playTones(SOUND_EFFECTS.gentle_bump, sound);
      client.responseRecorded({
        trialIndex: stepIdx,
        targetId: currentTrial.targetItem.stimulusId,
        stimulusId: currentTrial.targetItem.stimulusId,
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

  const switchRecipe = (idx: number) => {
    setRecipeIdx(idx);
    setStepIdx(0);
    setAssembledItems([]);
    setDone(false);
    busyRef.current = false;
  };

  return (
    <div
      className="chef"
      data-palette={config.adaptation.palette}
      data-motion={motion}
      style={{ ['--chef-scale' as string]: scale }}
    >
      {/* Barra superior de receitas */}
      <header className="chef-header">
        <div className="chef-recipes-tabs" role="tablist" aria-label="Receitas disponíveis">
          {CHEF_RECIPES.map((r, i) => (
            <button
              key={r.id}
              role="tab"
              aria-selected={recipeIdx === i}
              className="chef-recipe-tab"
              onClick={() => switchRecipe(i)}
            >
              <span className="chef-recipe-icon">{r.icon}</span>
              <span className="chef-recipe-title">{r.title}</span>
            </button>
          ))}
        </div>

        <div className="chef-step-pill" aria-label={`Passo ${stepIdx + 1} de ${trials.length}`}>
          <span>Passo {stepIdx + 1} de {trials.length}</span>
        </div>
      </header>

      {/* Instrução visual e auditiva */}
      <div className="chef-instruction-box">
        <div className="chef-instruction-text">{currentTrial.instruction}</div>
        <div className="chef-sensory-note">
          <span>Sensorial: {currentTrial.targetItem.sensoryNote}</span>
        </div>
      </div>

      {/* Bancada culinária com recipiente temático */}
      <div className="chef-stage">
        <div className="chef-countertop">
          <VesselDisplay
            vessel={currentTrial.vessel}
            items={assembledItems}
            accentColor={currentRecipe.accentColor}
            scale={scale}
          />
        </div>
      </div>

      {/* Cartões de seleção de ingredientes */}
      <div className="chef-options-row" role="group" aria-label="Ingredientes e utensílios disponíveis">
        {currentTrial.options.map((opt, pos) => {
          const isTarget = pos === currentTrial.positionOfTarget;
          const highlight = showPrompt && isTarget;
          return (
            <button
              key={`${stepIdx}-${opt.stimulusId}-${pos}`}
              className={`chef-option-btn ${highlight ? 'chef-option-btn--highlight' : ''}`}
              onClick={() => handleSelectOption(pos)}
              aria-label={opt.label}
            >
              <div className="chef-art-wrapper">
                <CulinaryArt id={opt.art} size={54} />
              </div>
              <span className="chef-opt-title">{opt.label}</span>
              <span className="chef-opt-sensory">{opt.sensoryNote}</span>
            </button>
          );
        })}
      </div>

      {/* Pausa ou encerramento */}
      {(paused || ended) && !done && (
        <div className="chef-modal-overlay" role="status">
          <div className="chef-modal-card">
            <h3>Pausa na Cozinha</h3>
            <p>Respire fundo e retorne quando quiser continuar cozinhando!</p>
          </div>
        </div>
      )}

      {/* Sucesso e conclusão da receita */}
      {done && (
        <div className="chef-modal-overlay" role="status">
          <div className="chef-modal-card chef-celebration-card">
            <div className="chef-celebration-badge">⭐ Parabéns, Chefinho! ⭐</div>
            <div className="chef-celebration-vessel">
              <VesselDisplay
                vessel={currentTrial.vessel}
                items={assembledItems}
                accentColor={currentRecipe.accentColor}
                scale={scale * 1.15}
              />
            </div>
            <h2>{currentRecipe.title} Concluída!</h2>
            <p>Você seguiu todos os passos com muita atenção e autonomia.</p>
            <div className="chef-celebration-actions">
              <button
                className="chef-btn-primary"
                onClick={() => switchRecipe((recipeIdx + 1) % CHEF_RECIPES.length)}
              >
                Próxima Receita ({CHEF_RECIPES[(recipeIdx + 1) % CHEF_RECIPES.length]!.title})
              </button>
              <button
                className="chef-btn-secondary"
                onClick={() => switchRecipe(recipeIdx)}
              >
                Fazer de Novo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VesselDisplay({
  vessel,
  items,
  accentColor,
  scale,
}: {
  vessel: 'bowl' | 'plate' | 'tray' | 'blender';
  items: string[];
  accentColor: string;
  scale: number;
}) {
  switch (vessel) {
    case 'plate':
      return (
        <div className="vessel-plate-wrap" style={{ transform: `scale(${scale})` }}>
          <div className="vessel-plate">
            <div className="vessel-contents plate-contents">
              {items.map((art, i) => (
                <div
                  key={`${art}-${i}`}
                  className="vessel-item plate-layer"
                  style={{ top: `${15 + i * 14}px`, zIndex: i + 1 }}
                >
                  <CulinaryArt id={art} size={42} />
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'tray':
      return (
        <div className="vessel-tray-wrap" style={{ transform: `scale(${scale})` }}>
          <div className="vessel-tray">
            <div className="vessel-contents tray-contents">
              {items.map((art, i) => (
                <div key={`${art}-${i}`} className="vessel-item tray-item" style={{ animationDelay: `${i * 0.08}s` }}>
                  <CulinaryArt id={art} size={38} />
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'blender':
      return (
        <div className="vessel-blender-wrap" style={{ transform: `scale(${scale})` }}>
          <div className="vessel-blender-pitcher">
            <div className="vessel-blender-liquid" style={{ height: `${Math.min(100, (items.length / 5) * 100)}%` }} />
            <div className="vessel-contents blender-contents">
              {items.map((art, i) => (
                <div key={`${art}-${i}`} className="vessel-item blender-item" style={{ animationDelay: `${i * 0.06}s` }}>
                  <CulinaryArt id={art} size={32} />
                </div>
              ))}
            </div>
          </div>
          <div className="vessel-blender-base">
            <div className="blender-dial" />
          </div>
        </div>
      );

    case 'bowl':
    default:
      return (
        <div className="vessel-bowl-wrap" style={{ transform: `scale(${scale})` }}>
          <div className="vessel-bowl-rim" style={{ borderColor: accentColor }} />
          <div className="vessel-bowl" style={{ borderBottomColor: accentColor }}>
            <div className="vessel-contents bowl-contents">
              {items.map((art, i) => (
                <div key={`${art}-${i}`} className="vessel-item bowl-item" style={{ animationDelay: `${i * 0.08}s` }}>
                  <CulinaryArt id={art} size={36} />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
  }
}
