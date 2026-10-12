import { useState, useEffect, useRef } from 'react';
import type { BookConfig, FlapData, TeachingEpisode, BookSessionMetrics, ResponseType, PromptLevel } from './types/book';
import { PRESET_BOOKS } from './data/presetBooks';
import { soundManager } from './utils/sound';
import { FlapBook } from './components/FlapBook';
import { AdultControlStrip } from './components/AdultControlStrip';
import { EpisodeQuickLog } from './components/EpisodeQuickLog';
import { BookBuilderModal } from './components/BookBuilderModal';
import { TherapistDashboard } from './components/TherapistDashboard';
import { ClosingModal } from './components/ClosingModal';
import { BookOpen, Sparkles, Clock, Volume2, VolumeX } from 'lucide-react';

export function App() {
  const [currentBook, setCurrentBook] = useState<BookConfig>(PRESET_BOOKS[0]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [activeFlapId, setActiveFlapId] = useState<string | null>(null);

  // Adult control states
  const [showAdultPointer, setShowAdultPointer] = useState<boolean>(false);
  const [isExpectantPause, setIsExpectantPause] = useState<boolean>(false);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);

  // Inactivity tracking (20s rest rule)
  const [isResting, setIsResting] = useState<boolean>(false);
  const lastInteractionRef = useRef<number>(Date.now());

  // Clinical data & episodes
  const [episodes, setEpisodes] = useState<TeachingEpisode[]>([]);
  const [metrics, setMetrics] = useState<BookSessionMetrics>({
    flapsRevealed: 0,
    onomatopoeiasImitated: 0,
    pointingToShowCount: 0,
    pointingToMandCount: 0,
    followingPointerCount: 0,
  });

  // Modals
  const [isBookBuilderOpen, setIsBookBuilderOpen] = useState<boolean>(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
  const [isClosingOpen, setIsClosingOpen] = useState<boolean>(false);

  const currentPage = currentBook.pages[currentPageIndex] || currentBook.pages[0];
  const activeFlap = currentPage.flaps.find((f) => f.id === activeFlapId) || currentPage.flaps[0] || null;

  // Track user activity for 20s rest
  const registerActivity = () => {
    lastInteractionRef.current = Date.now();
    if (isResting) {
      setIsResting(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastInteractionRef.current > 20000 && !isResting) {
        setIsResting(true);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isResting]);

  // Set default active flap on page change
  useEffect(() => {
    if (currentPage && currentPage.flaps.length > 0) {
      setActiveFlapId(currentPage.flaps[0].id);
    }
  }, [currentPageIndex, currentBook]);

  // INVIOLABLE RULE: Child touch on flap makes flap shake, NEVER plays sound or opens
  const handleChildTouchFlap = (flap: FlapData) => {
    registerActivity();
    setActiveFlapId(flap.id);
    soundManager.playPaperRustle();

    // Trigger visual shake
    setCurrentBook((prev) => {
      const updatedPages = prev.pages.map((p) => {
        if (p.pageNumber !== currentPage.pageNumber) return p;
        return {
          ...p,
          flaps: p.flaps.map((f) => {
            if (f.id === flap.id) {
              return { ...f, isShaking: true };
            }
            return f;
          }),
        };
      });
      return { ...prev, pages: updatedPages };
    });

    // Reset shake after animation
    setTimeout(() => {
      setCurrentBook((prev) => {
        const updatedPages = prev.pages.map((p) => {
          if (p.pageNumber !== currentPage.pageNumber) return p;
          return {
            ...p,
            flaps: p.flaps.map((f) => (f.id === flap.id ? { ...f, isShaking: false } : f)),
          };
        });
        return { ...prev, pages: updatedPages };
      });
    }, 600);
  };

  // Adult selects flap
  const handleAdultSelectFlap = (flap: FlapData) => {
    registerActivity();
    setActiveFlapId(flap.id);
    soundManager.playClick();
  };

  // Adult reveals flap: opens flap, plays onomatopoeia sound
  const handleRevealFlap = () => {
    registerActivity();
    if (!activeFlap) return;

    if (!activeFlap.isOpen) {
      setCurrentBook((prev) => {
        const updatedPages = prev.pages.map((p) => {
          if (p.pageNumber !== currentPage.pageNumber) return p;
          return {
            ...p,
            flaps: p.flaps.map((f) => (f.id === activeFlap.id ? { ...f, isOpen: true } : f)),
          };
        });
        return { ...prev, pages: updatedPages };
      });

      setMetrics((m) => ({ ...m, flapsRevealed: m.flapsRevealed + 1 }));
    }

    soundManager.playOnomatopoeia(activeFlap.onomatopoeia, activeFlap.animalName);
  };

  // Adult repeats sound
  const handleRepeatSound = () => {
    registerActivity();
    if (!activeFlap) return;
    soundManager.playOnomatopoeia(activeFlap.onomatopoeia, activeFlap.animalName);
  };

  // Toggle Adult Pointer Hand
  const handleTogglePointer = () => {
    registerActivity();
    setShowAdultPointer((prev) => !prev);
    soundManager.playClick();
    if (!showAdultPointer) {
      setMetrics((m) => ({ ...m, followingPointerCount: m.followingPointerCount + 1 }));
    }
  };

  // Trigger Expectant Pause
  const handleTriggerExpectantPause = () => {
    registerActivity();
    setIsExpectantPause(true);
    soundManager.playClick();
    setTimeout(() => {
      setIsExpectantPause(false);
    }, 4000);
  };

  // Playful Variation
  const handlePlayfulVariation = () => {
    registerActivity();
    if (!activeFlap) return;
    const jokeTexts = [
      `A ${activeFlap.animalName} faz miau miau? Não, faz ${activeFlap.onomatopoeia}!`,
      `Cadê o filhotinho da ${activeFlap.animalName}? Achou!`,
      `Todo mundo cantando junto com a ${activeFlap.animalName}!`,
    ];
    const chosenJoke = jokeTexts[Math.floor(Math.random() * jokeTexts.length)];
    soundManager.speakPrompt(chosenJoke);
  };

  // Page turns
  const handlePrevPage = () => {
    registerActivity();
    if (currentPageIndex > 0) {
      soundManager.playPageTurn();
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    registerActivity();
    if (currentPageIndex < currentBook.pages.length - 1) {
      soundManager.playPageTurn();
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  // Quick logging of teaching episode
  const handleLogEpisode = (data: {
    responseType: ResponseType;
    promptLevel: PromptLevel;
    echoOfAdult: boolean;
  }) => {
    registerActivity();
    const newEpisode: TeachingEpisode = {
      episodeId: `ep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      page: currentPage.pageNumber,
      animal: activeFlap ? activeFlap.animalId : 'vaca',
      responseType: data.responseType,
      promptLevel: data.promptLevel,
      echoOfAdult: data.echoOfAdult,
    };

    setEpisodes((prev) => [newEpisode, ...prev]);

    setMetrics((prev) => {
      const updated = { ...prev };
      if (data.responseType === 'apontar-mostrar') updated.pointingToShowCount += 1;
      if (data.responseType === 'apontar-pedir') updated.pointingToMandCount += 1;
      if (data.responseType === 'seguir-apontar') updated.followingPointerCount += 1;
      if (data.responseType === 'onomatopeia' && data.echoOfAdult) updated.onomatopoeiasImitated += 1;
      return updated;
    });
  };

  // Book Selection
  const handleSelectBook = (book: BookConfig) => {
    registerActivity();
    setCurrentBook(book);
    setCurrentPageIndex(0);
    setIsBookBuilderOpen(false);
  };

  // Toggle Speech
  const handleToggleSpeech = () => {
    setSpeechEnabled((prev) => {
      const next = !prev;
      soundManager.speechEnabled = next;
      return next;
    });
  };

  return (
    <div className="app-container" onPointerDown={registerActivity}>
      {/* 20-second Inactivity Rest Banner */}
      {isResting && (
        <div className="inactivity-rest-banner">
          <Clock className="w-4 h-4 animate-spin text-amber-700" />
          <span>Pausa de Repouso Sensorial (20s de silêncio) • Toque para continuar a rotina</span>
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="brand-row">
          <span className="brand-icon" role="img" aria-label="Livro">📖</span>
          <div>
            <h1 className="brand-title">Fazendinha Sonora</h1>
            <p className="brand-subtitle">DEN-05 • Livro com Abas e Sons (Modelo Denver ESDM)</p>
          </div>
        </div>

        <div className="header-badges">
          <span className="header-pill header-pill-active flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{currentBook.title}</span>
          </span>

          <button
            type="button"
            className="speech-prompt-btn"
            onClick={handleToggleSpeech}
            title={speechEnabled ? 'Desativar voz sintetizada' : 'Ativar voz sintetizada'}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span>{speechEnabled ? 'Voz Ativa' : 'Voz Muda'}</span>
          </button>
        </div>
      </header>

      {/* Main Book Workspace */}
      <main className="book-workspace">
        {isExpectantPause && (
          <div className="absolute top-4 bg-orange-500 text-white font-bold px-4 py-2 rounded-full shadow-lg z-20 animate-pulse flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Pausa Expectante: Olhe nos olhos e espere o gesto da criança!</span>
          </div>
        )}

        <FlapBook
          page={currentPage}
          totalPages={currentBook.pages.length}
          showAdultPointer={showAdultPointer}
          activeFlapId={activeFlapId}
          onChildTouchFlap={handleChildTouchFlap}
          onAdultSelectFlap={handleAdultSelectFlap}
        />
      </main>

      {/* Quick Log Bar for ESDM Data Recording */}
      <EpisodeQuickLog
        currentPage={currentPage.pageNumber}
        currentAnimal={activeFlap ? activeFlap.animalId : 'vaca'}
        totalLogged={episodes.length}
        onLogEpisode={handleLogEpisode}
      />

      {/* Adult Control Strip at Bottom */}
      <AdultControlStrip
        canReveal={Boolean(activeFlap)}
        isFlapOpen={activeFlap ? activeFlap.isOpen : false}
        showAdultPointer={showAdultPointer}
        isExpectantPause={isExpectantPause}
        currentPage={currentPageIndex + 1}
        totalPages={currentBook.pages.length}
        onRevealFlap={handleRevealFlap}
        onRepeatSound={handleRepeatSound}
        onTogglePointer={handleTogglePointer}
        onTriggerExpectantPause={handleTriggerExpectantPause}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        onPlayfulVariation={handlePlayfulVariation}
        onOpenBookBuilder={() => setIsBookBuilderOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onCloseSession={() => setIsClosingOpen(true)}
      />

      {/* Modals */}
      {isBookBuilderOpen && (
        <BookBuilderModal
          currentBook={currentBook}
          onSelectBook={handleSelectBook}
          onClose={() => setIsBookBuilderOpen(false)}
        />
      )}

      {isDashboardOpen && (
        <TherapistDashboard
          episodes={episodes}
          onClose={() => setIsDashboardOpen(false)}
        />
      )}

      {isClosingOpen && (
        <ClosingModal
          metrics={metrics}
          onRestart={() => {
            setIsClosingOpen(false);
            setCurrentPageIndex(0);
          }}
          onClose={() => setIsClosingOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
