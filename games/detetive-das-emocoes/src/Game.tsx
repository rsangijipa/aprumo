import { useEffect, useMemo, useRef, useState } from 'react';
import { playTones, speak, useGameClient } from '@aprumo/game-sdk';
import {
  planDetectiveTrials,
  evaluateChoice,
  type DetectiveCase,
} from './logic';
import { manifest } from './manifest';
import { DetectiveBadge, CaseAvatar } from './Art';
import './game.css';

const TONES_CORRECT = [
  { freq: 523.25, dur: 0.12, type: 'sine' as const },
  { freq: 659.25, dur: 0.12, delay: 0.08, type: 'sine' as const },
  { freq: 783.99, dur: 0.25, delay: 0.16, type: 'sine' as const },
];

const TONES_PLAUSIBLE = [
  { freq: 440, dur: 0.12, type: 'sine' as const },
  { freq: 554.37, dur: 0.18, delay: 0.08, type: 'sine' as const },
];

const TONES_TRY_AGAIN = [{ freq: 330, dur: 0.15, type: 'sine' as const }];

export default function DetetiveDasEmocoes() {
  const { client, config } = useGameClient(manifest.appId, manifest.version);
  const cases = useMemo(() => planDetectiveTrials(config), [config]);

  const [caseIndex, setCaseIndex] = useState(0);
  const [unlockedClues, setUnlockedClues] = useState(1); // 1 = Face, 2 = Contexto, 3 = Fala
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; isPlausible: boolean; explanation: string } | null>(null);
  const [solvedCount, setSolvedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const trialStartRef = useRef<number>(Date.now());
  const currentCase: DetectiveCase | undefined = cases[caseIndex];

  // Início da sessão
  useEffect(() => {
    if (config) {
      client.gameStarted(manifest.version);
    }
  }, [config, client]);

  // Início de cada tentativa
  useEffect(() => {
    if (config && currentCase) {
      const presented = currentCase.choices.map((c) => c.id);
      const targetPos = currentCase.choices.findIndex((c) => c.isCorrect);
      client.trialStarted({
        trialIndex: caseIndex,
        targetId: currentCase.id,
        presented,
      });
      client.stimulusPresented({
        trialIndex: caseIndex,
        targetId: currentCase.id,
        presented,
        positionOfTarget: targetPos >= 0 ? targetPos : null,
      });
      trialStartRef.current = Date.now();
      setUnlockedClues(1);
      setSelectedChoiceId(null);
      setFeedback(null);
    }
  }, [config, client, currentCase, caseIndex]);

  if (!config || !currentCase) {
    if (isFinished) {
      return (
        <main className="det-root" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <DetectiveBadge />
          <h2 style={{ fontSize: '2rem', margin: '1rem 0 0.5rem', color: 'var(--ap-sage-900)' }}>
            Parabéns, Mestre Detetive! 🕵️‍♂️
          </h2>
          <p style={{ fontSize: '1.1rem', maxWidth: '480px', color: 'var(--ap-text-muted)' }}>
            Você desvendou todos os casos da sessão, investigando as pistas faciais, o contexto e o tom de voz com grande sensibilidade social!
          </p>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ap-primary)', margin: '1rem 0' }}>
            {solvedCount} de {cases.length} Casos Resolvidos
          </div>
          <button
            type="button"
            className="det-choice-btn"
            style={{ justifySelf: 'center' }}
            onClick={() => {
              setCaseIndex(0);
              setSolvedCount(0);
              setIsFinished(false);
            }}
          >
            🔄 Investigar Novamente
          </button>
        </main>
      );
    }
    return <main className="det-root" aria-busy="true"><p>Carregando dossiê...</p></main>;
  }

  const handleRevealClue = () => {
    if (unlockedClues < currentCase.clues.length) {
      const nextCount = unlockedClues + 1;
      setUnlockedClues(nextCount);
      const clue = currentCase.clues[nextCount - 1]!;
      void speak(`${clue.label}: ${clue.detail}`, 'normal');
    }
  };

  const handleSelectChoice = (choiceId: string) => {
    if (feedback?.isCorrect) return; // Já resolveu o caso

    setSelectedChoiceId(choiceId);
    const latencyMs = Date.now() - trialStartRef.current;
    const result = evaluateChoice(currentCase.id, choiceId);
    setFeedback(result);

    if (result.isCorrect) {
      playTones(TONES_CORRECT, 'normal');
      setSolvedCount((c) => c + 1);
      const targetPos = currentCase.choices.findIndex((c) => c.isCorrect);
      const selectedPos = currentCase.choices.findIndex((c) => c.id === choiceId);
      client.responseRecorded({
        trialIndex: caseIndex,
        targetId: currentCase.id,
        stimulusId: choiceId,
        presented: currentCase.choices.map((c) => c.id),
        positionOfTarget: targetPos >= 0 ? targetPos : null,
        selected: choiceId,
        selectedPosition: selectedPos >= 0 ? selectedPos : null,
        response: 'correct',
        latencyMs,
        promptLevel: 'independent',
        promptSource: 'none',
        detail: { cluesRevealed: unlockedClues, scenario: currentCase.scenarioTitle },
      });
      client.reinforcerPresented({ kind: 'animation', contingentOn: currentCase.id, intensity: 'subtle' });
      void speak(result.explanation, 'normal');
    } else if (result.isPlausible) {
      playTones(TONES_PLAUSIBLE, 'normal');
      void speak(result.explanation, 'normal');
    } else {
      playTones(TONES_TRY_AGAIN, 'normal');
      void speak(result.explanation, 'normal');
    }
  };

  const handleNextCase = () => {
    if (caseIndex < cases.length - 1) {
      setCaseIndex((idx) => idx + 1);
    } else {
      setIsFinished(true);
      client.levelCompleted({
        levelId: 'detetive-nivel-1',
        levelIndex: 0,
        trialsCompleted: cases.length,
        correct: solvedCount + 1,
        outcome: 'completed',
      });
      client.gameCompleted(cases.length);
    }
  };

  return (
    <main className="det-root">
      {/* Cabeçalho */}
      <header className="det-header">
        <div className="det-title-box">
          <DetectiveBadge />
          <div>
            <h1 className="det-title">Detetive das Emoções</h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--ap-text-muted)', fontWeight: 600 }}>
              Caso #{caseIndex + 1} de {cases.length} · Teoria da Mente & Cognição Social
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void speak(`${currentCase.characterName}. ${currentCase.scenarioTitle}. Como será que ele está se sentindo?`, 'normal')}
          style={{
            background: 'transparent',
            border: '1px solid var(--ap-border)',
            borderRadius: '10px',
            padding: '0.4rem 0.8rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
          aria-label="Ouvir descrição do caso"
        >
          🔊 Ouvir Caso
        </button>
      </header>

      {/* Cartão do Dossiê do Caso */}
      <section className="det-case-card">
        <div className="det-case-top">
          <CaseAvatar characterId={currentCase.id} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--ap-primary)', letterSpacing: '0.05em' }}>
              DOSSIÊ DO PERSONAGEM: {currentCase.characterName.toUpperCase()}
            </span>
            <h2 style={{ margin: '0.25rem 0 0.5rem', fontSize: '1.35rem', color: 'var(--ap-sage-900)' }}>
              {currentCase.scenarioTitle}
            </h2>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--ap-text-muted)' }}>
              Analise as pistas abaixo e descubra qual emoção ou intenção melhor explica o comportamento de {currentCase.characterName}:
            </p>
          </div>
        </div>

        {/* Pistas Investigativas (com esvanecimento progressivo) */}
        <div className="det-clues-section">
          {currentCase.clues.slice(0, unlockedClues).map((clue, idx) => (
            <div key={idx} className="det-clues-section">
              <div className="det-clue-item">
                <span style={{ fontSize: '1.4rem' }}>{clue.icon}</span>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--ap-primary)' }}>
                    Pista {idx + 1} ({clue.label}):
                  </strong>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--ap-text)' }}>
                    {clue.detail}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {unlockedClues < currentCase.clues.length && (
            <button
              type="button"
              onClick={handleRevealClue}
              style={{
                alignSelf: 'flex-start',
                background: 'var(--ap-surface-hover, #f1f5f9)',
                border: '1px dashed var(--ap-border-strong)',
                borderRadius: '12px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--ap-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              🔍 Revelar Mais uma Pista ({currentCase.clues[unlockedClues]?.label})
            </button>
          )}
        </div>
      </section>

      {/* Grade de Escolha de Emoções */}
      <h3 style={{ fontSize: '1.05rem', margin: '0 0 0.75rem', color: 'var(--ap-text)' }}>
        Qual sentimento as pistas revelam?
      </h3>

      <div className="det-choices-grid">
        {currentCase.choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id;
          let extraClass = '';
          if (isSelected && feedback) {
            if (feedback.isCorrect) extraClass = 'selected-correct';
            else if (feedback.isPlausible) extraClass = 'selected-plausible';
            else extraClass = 'selected-incorrect';
          }

          return (
            <button
              key={choice.id}
              type="button"
              className={`det-choice-btn ${extraClass}`}
              onClick={() => handleSelectChoice(choice.id)}
              aria-pressed={isSelected}
            >
              <span style={{ fontSize: '2rem' }}>{choice.emoji}</span>
              <span>{choice.label}</span>
            </button>
          );
        })}
      </div>

      {/* Banner de Feedback e Continuação */}
      {feedback && (
        <div className={`det-feedback-banner ${feedback.isCorrect ? 'correct' : feedback.isPlausible ? 'plausible' : 'incorrect'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>
              {feedback.isCorrect ? '🏆' : feedback.isPlausible ? '💡' : '🔎'}
            </span>
            <span>{feedback.explanation}</span>
          </div>

          {feedback.isCorrect && (
            <button
              type="button"
              onClick={handleNextCase}
              style={{
                background: 'var(--ap-primary, #3f6b67)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.65rem 1.25rem',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.95rem',
                flexShrink: 0,
              }}
            >
              {caseIndex === cases.length - 1 ? 'Concluir Dossiê ➔' : 'Próximo Caso ➔'}
            </button>
          )}
        </div>
      )}
    </main>
  );
}

export { DetetiveDasEmocoes as Game };
