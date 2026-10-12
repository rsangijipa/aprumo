import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TokenService } from './services/tokenService';
import type {
  BoardState,
  TokenEvent,
  ReinforcerOption,
  TeenGoal,
  PriceMenuItem,
  TokenPhase,
} from './types/tokens';
import {
  TOKEN_THEMES,
  DEFAULT_REINFORCERS,
  DEFAULT_TEEN_GOALS,
  DEFAULT_PRICE_MENU,
} from './data/defaults';
import { sound } from './utils/sound';

import { TokenBoard } from './components/TokenBoard';
import { ReinforcerPicker } from './components/ReinforcerPicker';
import { ReinforcementTimer } from './components/ReinforcementTimer';
import { TeenGoalsPanel } from './components/TeenGoalsPanel';
import { ClinicControlModal } from './components/ClinicControlModal';

import confetti from 'canvas-confetti';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Sliders,
  Users,
  Smile,
  ShieldCheck,
} from 'lucide-react';

export const App: React.FC = () => {
  const tokenService = useMemo(() => new TokenService('inicial'), []);
  const [boardState, setBoardState] = useState<BoardState>(tokenService.getState());
  const [events, setEvents] = useState<TokenEvent[]>(tokenService.getEvents());

  // Mode: 'child' vs 'teen'
  const [activeAudience, setActiveAudience] = useState<'child' | 'teen'>('child');
  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false);

  // Audio toggles
  const [isMuted, setIsMuted] = useState(false);
  const [isLowSensory, setIsLowSensory] = useState(false);

  // Teen goals & price menu state
  const [teenGoals, setTeenGoals] = useState<TeenGoal[]>(DEFAULT_TEEN_GOALS);
  const [teenPointsBalance, setTeenPointsBalance] = useState<number>(35);
  const [priceMenu] = useState<PriceMenuItem[]>(DEFAULT_PRICE_MENU);

  // Flying token animation indicator
  const prevTokensRef = useRef(boardState.currentTokens);

  useEffect(() => {
    const unsubscribe = tokenService.subscribe((newState, lastEvent) => {
      setBoardState(newState);
      if (lastEvent) {
        setEvents((prev) => [...prev, lastEvent]);
      }
    });

    return () => unsubscribe();
  }, [tokenService]);

  // Audio feedback when tokens increase
  useEffect(() => {
    if (boardState.currentTokens > prevTokensRef.current) {
      sound.playPlim();

      // Check if board just completed
      if (boardState.isCompleted) {
        sound.playFanfare();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#F4A261', '#2D6A4F', '#0E8388'],
          disableForReducedMotion: true,
        });

        // Auto-start reinforcement timer after a brief celebratory pause
        const timer = setTimeout(() => {
          tokenService.startReinforcementTimer();
        }, 1200);

        return () => clearTimeout(timer);
      }
    }
    prevTokensRef.current = boardState.currentTokens;
  }, [boardState.currentTokens, boardState.isCompleted, tokenService]);

  // Handle Token Delivery
  const handleAwardToken = (source: 'jogo' | 'clinic', description: string) => {
    tokenService.award('comportamento-alvo', description, source, 1);
  };

  // Handle Reinforcer Selection
  const handleSelectReinforcer = (reinforcer: ReinforcerOption) => {
    sound.playPlim();
    tokenService.selectReinforcer(reinforcer);
  };

  // Timer Tick
  const handleTimerTick = () => {
    tokenService.tickTimer(1);
  };

  // Timer Finished or "Voltar à Tarefa"
  const handleTimerFinish = () => {
    tokenService.completeExchange();
  };

  // Teenage Self-Monitoring Handlers
  const handleToggleSelfReport = (goalId: string) => {
    setTeenGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const nextVal = !g.selfReported;
          sound.playPlim();
          return { ...g, selfReported: nextVal };
        }
        return g;
      })
    );
  };

  const handleTherapistConfirm = (goalId: string, confirmed: boolean) => {
    setTeenGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          // If newly confirmed positive, award points to bank
          if (confirmed && g.therapistConfirmed !== true) {
            setTeenPointsBalance((pts) => pts + g.points);
            sound.playPlim();
          }
          return { ...g, therapistConfirmed: confirmed };
        }
        return g;
      })
    );
  };

  const handlePurchaseReward = (item: PriceMenuItem) => {
    if (teenPointsBalance >= item.cost) {
      setTeenPointsBalance((pts) => pts - item.cost);
      sound.playPlim();
      alert(`Parabéns! Você resgatou "${item.title}". Aproveite seu privilégio com o aplicador.`);
    }
  };

  const handleAddNewTeenGoal = (title: string, points: number, category: TeenGoal['category']) => {
    const newGoal: TeenGoal = {
      id: `goal-${Date.now()}`,
      title,
      description: 'Meta personalizada pactuada em sessão com o jovem.',
      points,
      selfReported: false,
      category,
    };
    setTeenGoals((prev) => [...prev, newGoal]);
    sound.playPlim();
  };

  // Audio mute toggling
  const toggleMute = () => {
    sound.isMuted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleLowSensory = () => {
    sound.isLowSensory = !isLowSensory;
    setIsLowSensory(!isLowSensory);
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
              background: 'linear-gradient(135deg, var(--buriti), var(--vitoria-regia))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 10px rgba(244, 162, 97, 0.3)',
            }}
          >
            <Sparkles size={24} />
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
              ABA-04 · Quadro de Conquistas
              <span
                className="badge"
                style={{
                  backgroundColor: 'rgba(244, 162, 97, 0.15)',
                  color: 'var(--buriti)',
                  textTransform: 'capitalize',
                }}
              >
                Fase {boardState.phase}
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--tinta-60)', fontFamily: 'var(--font-corpo)' }}>
              Economia de Fichas Generalizada & Automonitoramento (3–17 anos)
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Audience Switcher (Infantil vs Adolescente) */}
          <div
            style={{
              display: 'flex',
              border: '1.5px solid var(--tinta-15)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setActiveAudience('child')}
              style={{
                padding: '6px 14px',
                border: 'none',
                background: activeAudience === 'child' ? 'var(--vitoria-regia)' : '#FFFFFF',
                color: activeAudience === 'child' ? '#FFFFFF' : 'var(--tinta-60)',
                fontFamily: 'var(--font-hud)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              id="tab-mode-child"
            >
              <Smile size={16} /> Modo Infantil (3–11)
            </button>

            <button
              onClick={() => setActiveAudience('teen')}
              style={{
                padding: '6px 14px',
                border: 'none',
                background: activeAudience === 'teen' ? 'var(--vitoria-regia)' : '#FFFFFF',
                color: activeAudience === 'teen' ? '#FFFFFF' : 'var(--tinta-60)',
                fontFamily: 'var(--font-hud)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              id="tab-mode-teen"
            >
              <Users size={16} /> Modo Adolescente (12–17)
            </button>
          </div>

          {/* Low Sensory Profile Toggle */}
          <button
            onClick={toggleLowSensory}
            className={`btn-tab ${isLowSensory ? 'active' : ''}`}
            title="Perfil Sensorial Baixo: sons mais calmos e sem fanfarra"
          >
            <ShieldCheck size={16} />
            {isLowSensory ? 'Perfil Baixo Ativo' : 'Perfil Normal'}
          </button>

          {/* Mute button */}
          <button onClick={toggleMute} className="btn-tab" style={{ padding: '6px 10px' }}>
            {isMuted ? <VolumeX size={16} color="#E63946" /> : <Volume2 size={16} color="var(--vitoria-regia)" />}
          </button>

          {/* Clinic Supervisor Modal button */}
          <button
            onClick={() => setIsClinicModalOpen(true)}
            className="btn-tab"
            style={{
              padding: '6px 14px',
              background: 'rgba(14, 131, 136, 0.12)',
              color: 'var(--igarape)',
              border: '1.5px solid var(--igarape)',
            }}
            id="btn-open-clinic-modal"
          >
            <Sliders size={16} /> Supervisor Clínico
          </button>
        </div>
      </header>

      {/* Main Content Area */}
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
        {/* Child Mode Interface */}
        {activeAudience === 'child' && (
          <>
            {/* Step 1: Reinforcer Selection (before board starts, preventing satiation) */}
            {!boardState.selectedReinforcer && !boardState.timerActive && (
              <ReinforcerPicker
                options={DEFAULT_REINFORCERS}
                onSelect={handleSelectReinforcer}
              />
            )}

            {/* Step 2: Active Token Board */}
            {boardState.selectedReinforcer && !boardState.timerActive && (
              <TokenBoard
                state={boardState}
                themes={TOKEN_THEMES}
                onAwardToken={handleAwardToken}
                onChangeReinforcer={() => tokenService.selectReinforcer(null as unknown as ReinforcerOption)}
                onSelectTheme={(themeId) => tokenService.setTokenTheme(themeId)}
              />
            )}

            {/* Step 3: Reinforcement Timer */}
            {boardState.timerActive && boardState.selectedReinforcer && (
              <ReinforcementTimer
                reinforcer={boardState.selectedReinforcer}
                secondsRemaining={boardState.timerSecondsRemaining}
                totalDuration={boardState.timerTotalDuration}
                onFinish={handleTimerFinish}
                onTick={handleTimerTick}
              />
            )}
          </>
        )}

        {/* Teenager Mode: Painel de Metas */}
        {activeAudience === 'teen' && (
          <TeenGoalsPanel
            goals={teenGoals}
            priceMenu={priceMenu}
            pointsBalance={teenPointsBalance}
            onToggleSelfReport={handleToggleSelfReport}
            onTherapistConfirm={handleTherapistConfirm}
            onPurchaseReward={handlePurchaseReward}
            onAddNewGoal={handleAddNewTeenGoal}
          />
        )}
      </main>

      {/* Supervisor Clinic Modal */}
      <ClinicControlModal
        isOpen={isClinicModalOpen}
        onClose={() => setIsClinicModalOpen(false)}
        state={boardState}
        events={events}
        onSetPhase={(phase: TokenPhase) => tokenService.setPhase(phase)}
        onSetSlots={(slots: number) => tokenService.setTargetSlots(slots)}
        onToggleResponseCost={(enabled, justification) => tokenService.setResponseCostConfig(enabled, justification)}
        onApplyResponseCost={(amount, justification) => tokenService.applyResponseCost(amount, justification)}
        onSimulateClinicAward={() => tokenService.award('foco-mesa', 'Entrega remota via celular do aplicador', 'clinic', 1)}
      />
    </div>
  );
};

export default App;
