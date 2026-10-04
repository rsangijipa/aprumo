import { useState } from 'react';
import { Button, Badge } from '@aprumo/ui';
import { speak, playTones } from '@aprumo/game-sdk';
import { SOCIAL_STORIES, type SocialStory, type StorySlide } from './socialStory';

function LeoAvatar({ mood }: { mood: StorySlide['characterMood'] }) {
  // Expressive soft-styled vector avatar for consistent character presentation (Léo)
  const mouthPaths: Record<StorySlide['characterMood'], string> = {
    neutral: 'M 40 68 Q 50 68 60 68',
    calm: 'M 40 66 Q 50 71 60 66',
    waiting: 'M 42 67 Q 50 67 58 67',
    proud: 'M 38 65 Q 50 76 62 65',
    happy: 'M 36 64 Q 50 78 64 64',
    listening: 'M 42 66 Q 50 72 58 66',
  };

  const eyebrowPaths: Record<StorySlide['characterMood'], { left: string; right: string }> = {
    neutral: { left: 'M 32 38 Q 40 37 46 39', right: 'M 54 39 Q 60 37 68 38' },
    calm: { left: 'M 32 39 Q 40 38 46 40', right: 'M 54 40 Q 60 38 68 39' },
    waiting: { left: 'M 33 39 Q 40 38 46 38', right: 'M 54 38 Q 60 38 67 39' },
    proud: { left: 'M 32 37 Q 40 35 46 37', right: 'M 54 37 Q 60 35 68 37' },
    happy: { left: 'M 32 36 Q 40 34 46 37', right: 'M 54 37 Q 60 34 68 36' },
    listening: { left: 'M 33 36 Q 40 34 46 37', right: 'M 54 38 Q 60 39 67 40' },
  };

  return (
    <svg viewBox="0 0 100 100" width="90" height="90" aria-label="Avatar de Léo" style={{ overflow: 'visible' }}>
      {/* Sombra de contato */}
      <ellipse cx="50" cy="94" rx="34" ry="6" fill="rgba(0,0,0,0.06)" />

      {/* Camiseta Verde Sálvia */}
      <path d="M 24 88 Q 50 82 76 88 L 84 100 L 16 100 Z" fill="#3f6b67" />
      <path d="M 38 84 Q 50 92 62 84 Z" fill="#faf9f6" />

      {/* Rosto */}
      <circle cx="50" cy="52" r="32" fill="#fed7aa" />

      {/* Cabelo macio castanho */}
      <path
        d="M 20 44 C 18 24, 34 16, 50 16 C 66 16, 82 24, 80 44 C 76 34, 66 26, 50 26 C 34 26, 24 34, 20 44 Z"
        fill="#78350f"
      />
      <path d="M 28 32 C 34 22, 48 20, 56 24 C 44 24, 36 28, 28 32 Z" fill="#92400e" />

      {/* Sobrancelhas */}
      <path d={eyebrowPaths[mood].left} stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d={eyebrowPaths[mood].right} stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Olhos expressivos com brilho */}
      <ellipse cx="38" cy="48" rx="4" ry="5.5" fill="#1e293b" />
      <circle cx="36.5" cy="46" r="1.5" fill="#ffffff" />

      <ellipse cx="62" cy="48" rx="4" ry="5.5" fill="#1e293b" />
      <circle cx="60.5" cy="46" r="1.5" fill="#ffffff" />

      {/* Bochechas coradas */}
      <circle cx="30" cy="56" r="4.5" fill="#fca5a5" opacity="0.5" />
      <circle cx="70" cy="56" r="4.5" fill="#fca5a5" opacity="0.5" />

      {/* Nariz sutil */}
      <path d="M 48 54 Q 50 56 52 54" stroke="#d97706" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Boca com expressão */}
      <path d={mouthPaths[mood]} stroke="#78350f" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function SocialStoryStudio() {
  const [activeStoryId, setActiveStoryId] = useState<string>('esperar-minha-vez');
  const [slideIndex, setSlideIndex] = useState<number>(0);
  const [inQuiz, setInQuiz] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const activeStory = SOCIAL_STORIES.find((s) => s.id === activeStoryId) ?? SOCIAL_STORIES[0]!;
  const currentSlide = activeStory.slides[slideIndex]!;
  const totalSlides = activeStory.slides.length;

  const handleSelectStory = (id: string) => {
    setActiveStoryId(id);
    setSlideIndex(0);
    setInQuiz(false);
    setSelectedAnswer(null);
  };

  const handleHearNarration = () => {
    if (inQuiz) {
      void speak(activeStory.comprehension.question, 'normal');
    } else {
      void speak(`${currentSlide.title}. ${currentSlide.text}`, 'normal');
    }
  };

  const handleNext = () => {
    if (slideIndex < totalSlides - 1) {
      setSlideIndex((prev) => prev + 1);
    } else {
      setInQuiz(true);
      setSelectedAnswer(null);
    }
  };

  const handlePrevious = () => {
    if (inQuiz) {
      setInQuiz(false);
    } else if (slideIndex > 0) {
      setSlideIndex((prev) => prev - 1);
    }
  };

  const handleSelectAnswer = (idx: number) => {
    setSelectedAnswer(idx);
    const isCorrect = idx === activeStory.comprehension.correctIndex;
    if (isCorrect) {
      playTones([
        { freq: 523.25, dur: 0.12, type: 'sine' },
        { freq: 659.25, dur: 0.12, delay: 0.1, type: 'sine' },
        { freq: 783.99, dur: 0.25, delay: 0.2, type: 'sine' },
      ], 'normal');
      void speak(`Correto! ${activeStory.comprehension.explanation}`, 'normal');
    } else {
      playTones([{ freq: 330, dur: 0.15, type: 'sine' }], 'normal');
      void speak('Tente de novo. Vamos escolher a melhor atitude juntos!', 'normal');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
      {/* Abas das Histórias */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
        {SOCIAL_STORIES.map((s) => (
          <button
            key={s.id}
            type="button"
            className="rs-tab-pill"
            aria-pressed={activeStoryId === s.id}
            onClick={() => handleSelectStory(s.id)}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Cartão de Exibição da História */}
      {!inQuiz ? (
        <div
          style={{
            background: 'var(--ap-surface-sunken)',
            border: '2px solid var(--ap-border-strong)',
            borderRadius: '24px',
            padding: '2rem 1.5rem',
            width: '100%',
            maxWidth: '580px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1.25rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          {/* Ilustração e Avatar de Léo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
            <LeoAvatar mood={currentSlide.characterMood} />
            <div style={{ fontSize: '54px' }}>{currentSlide.emoji}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="ap-xs ap-muted" style={{ fontWeight: 800, letterSpacing: '0.05em' }}>
              ETAPA {slideIndex + 1} DE {totalSlides}
            </span>
            <h3 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--ap-text)' }}>
              {currentSlide.title}
            </h3>
            <p
              style={{
                fontSize: '1.15rem',
                lineHeight: 1.6,
                color: 'var(--ap-text)',
                margin: 0,
                maxWidth: '460px',
              }}
            >
              {currentSlide.text}
            </p>
          </div>
        </div>
      ) : (
        /* Fase de Verificação de Compreensão */
        <div
          style={{
            background: 'var(--ap-surface-sunken)',
            border: '2px solid var(--ap-primary)',
            borderRadius: '24px',
            padding: '2rem 1.5rem',
            width: '100%',
            maxWidth: '580px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <LeoAvatar mood="proud" />
            <Badge tone="info">🧠 Checagem de Compreensão</Badge>
          </div>

          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--ap-text)' }}>
            {activeStory.comprehension.question}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
            {activeStory.comprehension.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === activeStory.comprehension.correctIndex;
              let bg = 'var(--ap-surface)';
              let border = '1px solid var(--ap-border)';
              let color = 'var(--ap-text)';

              if (isSelected) {
                if (isCorrect) {
                  bg = 'var(--ap-success-soft, #e8f5e9)';
                  border = '2px solid var(--ap-success)';
                  color = '#1b5e20';
                } else {
                  bg = 'var(--ap-danger-soft, #ffebee)';
                  border = '2px solid var(--ap-danger)';
                  color = '#b71c1c';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectAnswer(idx)}
                  style={{
                    padding: '0.9rem 1rem',
                    borderRadius: '14px',
                    border,
                    background: bg,
                    color,
                    cursor: 'pointer',
                    fontSize: 'var(--ap-text-sm)',
                    fontWeight: 600,
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {selectedAnswer === activeStory.comprehension.correctIndex && (
            <div
              style={{
                background: 'var(--ap-success-soft, #e8f5e9)',
                color: '#1b5e20',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                fontSize: 'var(--ap-text-sm)',
                fontWeight: 700,
              }}
            >
              🎉 {activeStory.comprehension.explanation}
            </div>
          )}
        </div>
      )}

      {/* Controles de Navegação e Narração */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="ghost" disabled={slideIndex === 0 && !inQuiz} onClick={handlePrevious}>
          Anterior
        </Button>

        <Button variant="primary" onClick={handleHearNarration}>
          🔊 Ouvir Narração
        </Button>

        {!inQuiz ? (
          <Button variant="default" onClick={handleNext}>
            {slideIndex === totalSlides - 1 ? 'Checagem de Compreensão ➔' : 'Próxima ➔'}
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() => {
              setSlideIndex(0);
              setInQuiz(false);
              setSelectedAnswer(null);
            }}
          >
            Recomeçar História
          </Button>
        )}
      </div>
    </div>
  );
}
