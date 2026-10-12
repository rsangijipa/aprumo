import { useState } from 'react';
import { SCENE_BANK } from './data/sceneBank';
import type {
  SceneModule,
  EmotionType,
  CueHotspot,
  AbaSceneTrial,
  FeelingsThermometerState,
} from './types/scene';
import { SceneViewer } from './components/SceneViewer';
import { EmotionOptions } from './components/EmotionOptions';
import { WhyReasonChooser } from './components/WhyReasonChooser';
import { ResponseChooser } from './components/ResponseChooser';
import { FeelingsThermometer } from './components/FeelingsThermometer';
import { TherapistModal } from './components/TherapistModal';
import { soundManager } from './utils/sound';
import confetti from 'canvas-confetti';
import { Eye, HeartHandshake, HelpCircle, Sparkles, Smile, ClipboardList, CheckCircle } from 'lucide-react';

export function App() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [activeModule, setActiveModule] = useState<SceneModule>('E1');

  // Trial choices state
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [foundCues, setFoundCues] = useState<string[]>([]);
  const [selectedWhyId, setSelectedWhyId] = useState<string | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [rehearsalStatus, setRehearsalStatus] = useState<'sem-ajuda' | 'com-ajuda' | 'nao-executou' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // ABA History & Private Self-Reports
  const [trials, setTrials] = useState<AbaSceneTrial[]>([]);
  const [selfReports, setSelfReports] = useState<FeelingsThermometerState[]>([]);
  const [isTherapistOpen, setIsTherapistOpen] = useState(false);

  const currentScene = SCENE_BANK[sceneIndex];

  const handleNextScene = (index: number) => {
    soundManager.playClick();
    setSceneIndex(index);
    resetTrialState();
  };

  const handleModuleSwitch = (mod: SceneModule) => {
    soundManager.playClick();
    setActiveModule(mod);
    resetTrialState();
  };

  const resetTrialState = () => {
    setSelectedEmotion(null);
    setFoundCues([]);
    setSelectedWhyId(null);
    setSelectedActionId(null);
    setRehearsalStatus(null);
    setShowFeedback(false);
  };

  // E1: Emotion Selection
  const handleSelectEmotion = (emotion: EmotionType) => {
    setSelectedEmotion(emotion);
    setShowFeedback(true);
    const isSuccess = emotion === currentScene.emotion;

    if (isSuccess) {
      soundManager.playSuccess();
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    } else {
      soundManager.playGentleTryAgain();
    }

    const newTrial: AbaSceneTrial = {
      trialId: `trial-${Date.now()}`,
      timestamp: Date.now(),
      module: 'E1',
      sceneId: currentScene.id,
      emotion: currentScene.emotion,
      intensity: currentScene.intensity,
      cuesSelected: foundCues,
      cuesExpected: currentScene.cues.map((c) => c.cueId),
      isSuccess,
    };
    setTrials((prev) => [newTrial, ...prev]);
  };

  // E2: Cue Hotspot Click
  const handleSelectCue = (cue: CueHotspot) => {
    if (!foundCues.includes(cue.cueId)) {
      soundManager.playCueFound();
      const updated = [...foundCues, cue.cueId];
      setFoundCues(updated);

      if (updated.length === currentScene.cues.length) {
        soundManager.playSuccess();
        confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
      }

      const newTrial: AbaSceneTrial = {
        trialId: `trial-${Date.now()}`,
        timestamp: Date.now(),
        module: 'E2',
        sceneId: currentScene.id,
        emotion: currentScene.emotion,
        intensity: currentScene.intensity,
        cuesSelected: updated,
        cuesExpected: currentScene.cues.map((c) => c.cueId),
        isSuccess: true,
      };
      setTrials((prev) => [newTrial, ...prev]);
    }
  };

  // E3: Why Reason Selection
  const handleSelectWhy = (whyId: string) => {
    setSelectedWhyId(whyId);
    setShowFeedback(true);
    const chosen = currentScene.whyReasonOptions.find((w) => w.id === whyId);
    const isSuccess = chosen?.isCorrect ?? false;

    if (isSuccess) {
      soundManager.playSuccess();
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    } else {
      soundManager.playGentleTryAgain();
    }

    const newTrial: AbaSceneTrial = {
      trialId: `trial-${Date.now()}`,
      timestamp: Date.now(),
      module: 'E3',
      sceneId: currentScene.id,
      emotion: currentScene.emotion,
      intensity: currentScene.intensity,
      cuesSelected: foundCues,
      cuesExpected: currentScene.cues.map((c) => c.cueId),
      isSuccess,
    };
    setTrials((prev) => [newTrial, ...prev]);
  };

  // E4: Action Selection
  const handleSelectAction = (actionId: string) => {
    setSelectedActionId(actionId);
    setShowFeedback(true);
    const action = currentScene.actionOptions.find((a) => a.id === actionId);
    const isAcceptable = action?.isAcceptable ?? false;

    if (isAcceptable) {
      soundManager.playSuccess();
      confetti({ particleCount: 35, spread: 65, origin: { y: 0.6 } });
    } else {
      soundManager.playGentleTryAgain();
    }

    const newTrial: AbaSceneTrial = {
      trialId: `trial-${Date.now()}`,
      timestamp: Date.now(),
      module: 'E4',
      sceneId: currentScene.id,
      emotion: currentScene.emotion,
      intensity: currentScene.intensity,
      cuesSelected: foundCues,
      cuesExpected: currentScene.cues.map((c) => c.cueId),
      responseOptionId: actionId,
      isAcceptable,
      isSuccess: isAcceptable,
    };
    setTrials((prev) => [newTrial, ...prev]);
  };

  // E4 Role-play rating
  const handleSetRehearsal = (status: 'sem-ajuda' | 'com-ajuda' | 'nao-executou') => {
    soundManager.playClick();
    setRehearsalStatus(status);
    if (trials.length > 0 && trials[0].module === 'E4') {
      const updatedFirst = { ...trials[0], rehearsalResult: status };
      setTrials([updatedFirst, ...trials.slice(1)]);
    }
  };

  // E5 Self-report saving
  const handleSaveSelfReport = (state: FeelingsThermometerState) => {
    setSelfReports((prev) => [state, ...prev]);
  };

  return (
    <div className="aba07-app">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand-section">
            <div className="app-icon-wrap">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h1 className="app-heading">ABA-07: Leitura de Cena</h1>
              <p className="app-subtitle">Habilidades Sociais, Atenção Compartilhada & Regulação Emocional</p>
            </div>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="clinical-btn"
              onClick={() => setIsTherapistOpen(true)}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Painel Clínico ({trials.length})</span>
            </button>
          </div>
        </div>
      </header>

      {/* Module Navigation Tabs */}
      <nav className="module-nav-bar" aria-label="Módulos da Atividade ABA">
        <button
          type="button"
          className={`module-nav-btn ${activeModule === 'E1' ? 'active' : ''}`}
          onClick={() => handleModuleSwitch('E1')}
        >
          <Smile className="w-4 h-4 inline mr-1" />
          E1: Identificar Emoção
        </button>
        <button
          type="button"
          className={`module-nav-btn ${activeModule === 'E2' ? 'active' : ''}`}
          onClick={() => handleModuleSwitch('E2')}
        >
          <Eye className="w-4 h-4 inline mr-1" />
          E2: Pistas Sociais ({foundCues.length}/{currentScene.cues.length})
        </button>
        <button
          type="button"
          className={`module-nav-btn ${activeModule === 'E3' ? 'active' : ''}`}
          onClick={() => handleModuleSwitch('E3')}
        >
          <HelpCircle className="w-4 h-4 inline mr-1" />
          E3: Por que aconteceu?
        </button>
        <button
          type="button"
          className={`module-nav-btn ${activeModule === 'E4' ? 'active' : ''}`}
          onClick={() => handleModuleSwitch('E4')}
        >
          <HeartHandshake className="w-4 h-4 inline mr-1" />
          E4: O que fazer? (Ensaio)
        </button>
        <button
          type="button"
          className={`module-nav-btn ${activeModule === 'E5' ? 'active' : ''}`}
          onClick={() => handleModuleSwitch('E5')}
        >
          <Sparkles className="w-4 h-4 inline mr-1" />
          E5: Meu Termômetro Privado
        </button>
      </nav>

      {/* Scene Selector */}
      <section className="scene-selector-bar">
        <span className="scene-select-label">Escolher Situação:</span>
        <div className="scene-chips">
          {SCENE_BANK.map((scene, idx) => (
            <button
              key={scene.id}
              type="button"
              className={`scene-chip-btn ${idx === sceneIndex ? 'active' : ''}`}
              onClick={() => handleNextScene(idx)}
            >
              {idx + 1}. {scene.title}
            </button>
          ))}
        </div>
      </section>

      {/* Main Grid: Scene on Left, Active Interactive Module on Right */}
      <main className="app-main">
        <SceneViewer
          scene={currentScene}
          activeModule={activeModule}
          foundCues={foundCues}
          onSelectCue={handleSelectCue}
        />

        <section className="active-module-container">
          {activeModule === 'E1' && (
            <EmotionOptions
              currentEmotion={currentScene.emotion}
              onSelectEmotion={handleSelectEmotion}
              selectedEmotion={selectedEmotion}
              showFeedback={showFeedback}
            />
          )}

          {activeModule === 'E2' && (
            <div className="module-section-box">
              <div className="module-title-row">
                <span className="module-tag">Módulo E2</span>
                <h3 className="module-heading">Encontre as Pistas Sociais na Cena</h3>
              </div>
              <p className="module-instructions">
                Toque nos pontos brilhantes dentro do desenho (rosto, corpo, ambiente ou fala) para descobrir como o personagem está se comunicando:
              </p>
              <div className="cues-summary-list">
                {currentScene.cues.map((c) => {
                  const isFound = foundCues.includes(c.cueId);
                  return (
                    <div key={c.cueId} className={`cue-check-item ${isFound ? 'found' : ''}`}>
                      <CheckCircle className={`w-5 h-5 ${isFound ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <div className="cue-info">
                        <strong>{c.label}</strong>
                        <span className="cue-type-tag">Tipo: {c.type}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeModule === 'E3' && (
            <WhyReasonChooser
              options={currentScene.whyReasonOptions}
              onSelectOption={handleSelectWhy}
              selectedOptionId={selectedWhyId}
              showFeedback={showFeedback}
            />
          )}

          {activeModule === 'E4' && (
            <ResponseChooser
              actionOptions={currentScene.actionOptions}
              selectedActionId={selectedActionId}
              onSelectAction={handleSelectAction}
              showFeedback={showFeedback}
              rehearsalStatus={rehearsalStatus}
              onSetRehearsal={handleSetRehearsal}
            />
          )}

          {activeModule === 'E5' && (
            <FeelingsThermometer
              onSaveSelfReport={handleSaveSelfReport}
              lastState={selfReports[0]}
            />
          )}
        </section>
      </main>

      {/* Therapist Clinical Panel */}
      <TherapistModal
        isOpen={isTherapistOpen}
        onClose={() => setIsTherapistOpen(false)}
        trials={trials}
        selfReports={selfReports}
      />
    </div>
  );
}

export default App;
