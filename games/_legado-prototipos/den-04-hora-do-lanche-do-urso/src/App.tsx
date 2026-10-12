import { useState, useEffect } from 'react';
import { PRETEND_ITEMS } from './data/pretendItems';
import { soundManager } from './utils/sound';
import type {
  CharacterType,
  CharacterState,
  ScenePlace,
  PretendItem,
  ActionZone,
  ActionLocation,
  PromptLevel,
  TeachingEpisode,
  PretendSessionMetrics,
} from './types/pretend';
import { PretendStage } from './components/PretendStage';
import { ItemsTray } from './components/ItemsTray';
import { AdultControlStrip } from './components/AdultControlStrip';
import { EpisodeQuickLog } from './components/EpisodeQuickLog';
import { ClosingModal } from './components/ClosingModal';
import { TherapistDashboard } from './components/TherapistDashboard';
import confetti from 'canvas-confetti';
import { Clock, Heart } from 'lucide-react';

export function App() {
  const [character] = useState<CharacterType>('urso');
  const [place, setPlace] = useState<ScenePlace>('cozinha');
  const [characterState, setCharacterState] = useState<CharacterState>('fome');
  const [selectedItem, setSelectedItem] = useState<PretendItem | null>(PRETEND_ITEMS[0]); // default banana
  const [isSubstitutionActive, setIsSubstitutionActive] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  // Quick Log & Modal Overlays
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ item: PretendItem; zone: ActionZone } | null>(null);
  const [isClosingOpen, setIsClosingOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Metrics & Sequences
  const [sequenceCount, setSequenceCount] = useState(0);
  const [metrics, setMetrics] = useState<PretendSessionMetrics>({
    totalActions: 0,
    realToyActionsCount: 0,
    screenActionsCount: 0,
    substitutionsCount: 0,
    maxSequenceLength: 0,
  });
  const [episodes, setEpisodes] = useState<TeachingEpisode[]>([]);
  const [durationSeconds, setDurationSeconds] = useState(0);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setDurationSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Handle interacting with an action zone on character
  const handleZoneInteract = (zone: ActionZone) => {
    if (!selectedItem) {
      soundManager.playUe();
      return;
    }

    const isSymbolic = selectedItem.id === 'bloco_neutro';
    if (isSymbolic && !isSubstitutionActive) {
      soundManager.playUe();
      soundManager.speak('Hum... um bloco de madeira? O mediador precisa ativar o faz-de-conta!');
      return;
    }

    const isCompatible = selectedItem.compatibleZones.includes(zone);

    if (isCompatible) {
      // Execute compatible pretend action
      if (selectedItem.soundType === 'munch') {
        setCharacterState('comendo');
        soundManager.playMunch();
        soundManager.speak(selectedItem.speechText);
        setTimeout(() => setCharacterState('satisfeito'), 2200);
      } else if (selectedItem.soundType === 'drink') {
        setCharacterState('bebendo');
        soundManager.playDrink();
        soundManager.speak(selectedItem.speechText);
        setTimeout(() => setCharacterState('satisfeito'), 2200);
      } else if (selectedItem.soundType === 'wipe') {
        setCharacterState('limpando');
        soundManager.playWipe();
        soundManager.speak(selectedItem.speechText);
        setTimeout(() => setCharacterState('satisfeito'), 1800);
      } else if (selectedItem.soundType === 'sleep') {
        setPlace('quarto');
        setCharacterState('dormindo');
        soundManager.playLullaby();
        soundManager.speak(selectedItem.speechText);
      }

      setSequenceCount((prev) => prev + 1);
    } else {
      // Non-conventional placement (e.g. spoon on head): friendly "Ué?" reaction without punishment
      setCharacterState('ue');
      soundManager.playUe();
      soundManager.speak(`Ué? ${selectedItem.name} na ${zone}? Que engraçado!`);
      setTimeout(() => setCharacterState('neutro'), 2000);
    }

    // Open quick log asking location (screen vs real toy)
    setPendingAction({ item: selectedItem, zone });
    setIsQuickLogOpen(true);
  };

  // Quick Log Save with Location
  const handleSaveEpisode = (location: ActionLocation, promptLevel: PromptLevel) => {
    if (!pendingAction) return;

    const isSub = pendingAction.item.id === 'bloco_neutro';
    const newSeq = sequenceCount;

    setMetrics((m) => ({
      totalActions: m.totalActions + 1,
      realToyActionsCount: location === 'brinquedo-real' ? m.realToyActionsCount + 1 : m.realToyActionsCount,
      screenActionsCount: location === 'tela' ? m.screenActionsCount + 1 : m.screenActionsCount,
      substitutionsCount: isSub ? m.substitutionsCount + 1 : m.substitutionsCount,
      maxSequenceLength: Math.max(m.maxSequenceLength, newSeq),
    }));

    if (location === 'brinquedo-real') {
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
    }

    const ep: TeachingEpisode = {
      episodeId: `ep-${Date.now()}`,
      timestamp: Date.now(),
      character,
      action: `${pendingAction.item.name} na ${pendingAction.zone}`,
      item: pendingAction.item.id,
      zone: pendingAction.zone,
      isSubstitution: isSub,
      location,
      promptLevel,
      sequenceLength: newSeq,
    };
    setEpisodes((prev) => [ep, ...prev]);
    setPendingAction(null);
  };

  // Adult control triggers
  const handleTriggerState = (st: CharacterState) => {
    setCharacterState(st);
    soundManager.playClick();
    if (st === 'fome') soundManager.speak('Hum... que fominha! O urso quer comer!');
    if (st === 'sede') soundManager.speak('Ufa! O urso está com muita sede!');
    if (st === 'sono') soundManager.speak('Yaaawn... que soninho gostoso!');
    if (st === 'sujo') soundManager.speak('Ops! O rostinho do urso ficou sujo!');
  };

  const handleToggleSubstitution = () => {
    const next = !isSubstitutionActive;
    setIsSubstitutionActive(next);
    soundManager.playClick();
    if (next) {
      soundManager.speak('Modo faz-de-conta ativado! O bloco agora vale como pão!');
    }
  };

  const handleToggleSpeech = () => {
    const next = !speechEnabled;
    setSpeechEnabled(next);
    soundManager.speechEnabled = next;
    soundManager.playClick();
  };

  const handleTogglePause = () => {
    setCharacterState('fome');
    soundManager.playClick();
  };

  const handleRestartRoutine = () => {
    setIsClosingOpen(false);
    setCharacterState('fome');
    setPlace('cozinha');
    setSequenceCount(0);
    setSelectedItem(PRETEND_ITEMS[0]);
  };

  return (
    <div className="den04-app">
      {/* Top Header */}
      <header className="top-info-bar">
        <div className="routine-badge">
          <span>DEN-04: Hora do Lanche do Urso</span>
          <span className="text-slate-400">|</span>
          <span className="flex items-center gap-1 text-slate-600">
            <Clock className="w-4 h-4" />
            {Math.floor(durationSeconds / 60)}m {durationSeconds % 60}s
          </span>
          <span className="text-slate-400">|</span>
          <span className="mirror-mode-tag">
            <Heart className="w-3.5 h-3.5 inline mr-1 text-rose-500" />
            Formato Espelho Ativo
          </span>
        </div>
      </header>

      {/* Main Interactive Stage */}
      <main className="stage-wrapper">
        <PretendStage
          character={character}
          state={characterState}
          place={place}
          selectedItem={selectedItem}
          onZoneInteract={handleZoneInteract}
        />
      </main>

      {/* Bottom Items Tray */}
      <ItemsTray
        selectedItem={selectedItem}
        onSelectItem={(item) => setSelectedItem(item)}
        isSubstitutionActive={isSubstitutionActive}
      />

      {/* Adult Control Strip */}
      <AdultControlStrip
        character={character}
        state={characterState}
        isSubstitutionActive={isSubstitutionActive}
        speechEnabled={speechEnabled}
        onTriggerState={handleTriggerState}
        onToggleSubstitution={handleToggleSubstitution}
        onToggleSpeech={handleToggleSpeech}
        onTogglePause={handleTogglePause}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onCloseRoutine={() => setIsClosingOpen(true)}
      />

      {/* Quick Episode Log */}
      <EpisodeQuickLog
        isOpen={isQuickLogOpen}
        actionSummary={pendingAction ? `${pendingAction.item.name} na ${pendingAction.zone}` : ''}
        onSaveEpisode={handleSaveEpisode}
        onClose={() => setIsQuickLogOpen(false)}
      />

      {/* Closing Modal with Mirror Bridge */}
      <ClosingModal
        isOpen={isClosingOpen}
        onRestartRoutine={handleRestartRoutine}
        onCloseModal={() => setIsClosingOpen(false)}
      />

      {/* Therapist Dashboard */}
      <TherapistDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        metrics={metrics}
        episodes={episodes}
        durationSeconds={durationSeconds}
      />
    </div>
  );
}

export default App;
