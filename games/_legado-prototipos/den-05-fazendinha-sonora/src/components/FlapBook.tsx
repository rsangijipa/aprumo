import React from 'react';
import type { BookPage, FlapData } from '../types/book';
import { Volume2, Sparkles, Hand } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface FlapBookProps {
  page: BookPage;
  totalPages: number;
  showAdultPointer: boolean;
  activeFlapId: string | null;
  onChildTouchFlap: (flap: FlapData) => void;
  onAdultSelectFlap: (flap: FlapData) => void;
}

export const FlapBook: React.FC<FlapBookProps> = ({
  page,
  totalPages,
  showAdultPointer,
  activeFlapId,
  onChildTouchFlap,
  onAdultSelectFlap,
}) => {
  const handleSpeakPrompt = () => {
    soundManager.speakPrompt(page.promptText);
  };

  return (
    <div className="flap-book-viewport">
      {/* Book Spread Board */}
      <div className="book-spread-card">
        {/* Header Ribbon */}
        <div className="page-header-ribbon">
          <div className="flex items-center gap-2">
            <h2 className="page-title">{page.title}</h2>
            <span className="page-badge">Página {page.pageNumber} de {totalPages}</span>
          </div>

          <div className="prompt-speech-row">
            <button
              type="button"
              className="speech-prompt-btn"
              onClick={handleSpeakPrompt}
              title="Ouvir a pergunta do livro"
            >
              <Volume2 className="w-5 h-5 text-emerald-700" />
              <span>Ouvir</span>
            </button>
            <p className="page-prompt-text">{page.promptText}</p>
          </div>
        </div>

        {/* Illustrated Double Page Scenery */}
        <div className="page-canvas-stage">
          <svg viewBox="0 0 800 480" className="page-scenery-svg" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="scenery-sky" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="60%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
              <linearGradient id="grass-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#86efac" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
              <filter id="paper-drop" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="2" dy="5" stdDeviation="4" floodOpacity="0.2" />
              </filter>
            </defs>

            {/* Sky & Sun */}
            <rect x="0" y="0" width="800" height="320" fill="url(#scenery-sky)" />
            <circle cx="100" cy="80" r="40" fill="#fde047" opacity="0.8" />

            {/* Rolling Hills & Meadow */}
            <path d="M 0 280 Q 200 220 400 270 T 800 240 L 800 480 L 0 480 Z" fill="url(#grass-grad)" />

            {/* Scenery specific props */}
            {page.scenery === 'lagoa' && (
              <ellipse cx="400" cy="400" rx="280" ry="70" fill="#38bdf8" stroke="#0284c7" strokeWidth="4" />
            )}

            {page.scenery === 'curral' && (
              <g stroke="#92400e" strokeWidth="6" opacity="0.6">
                <line x1="40" y1="360" x2="760" y2="360" />
                <line x1="40" y1="410" x2="760" y2="410" />
                <line x1="160" y1="330" x2="160" y2="440" />
                <line x1="380" y1="330" x2="380" y2="440" />
                <line x1="600" y1="330" x2="600" y2="440" />
              </g>
            )}

            {page.scenery === 'selva' && (
              <g fill="#15803d" opacity="0.75">
                <circle cx="700" cy="180" r="90" />
                <circle cx="630" cy="220" r="70" />
                <rect x="670" y="240" width="35" height="150" fill="#78350f" />
              </g>
            )}
          </svg>

          {/* Interactive Flaps (Lift-the-flap) */}
          <div className="flaps-layer">
            {page.flaps.map((flap) => {
              const isSelected = activeFlapId === flap.id;

              return (
                <div
                  key={flap.id}
                  className={`flap-container ${flap.isOpen ? 'flap-opened' : ''} ${flap.isShaking ? 'flap-shaking' : ''} ${isSelected ? 'active-target' : ''}`}
                  style={{
                    left: `${flap.xPct}%`,
                    top: `${flap.yPct}%`,
                    width: `${flap.widthPct}%`,
                    height: `${flap.heightPct}%`,
                  }}
                  onClick={() => onAdultSelectFlap(flap)}
                >
                  {/* Underneath: The Revealed Animal */}
                  <div className="animal-underneath-card">
                    <span className="animal-emoji-bounce" role="img" aria-label={flap.animalName}>
                      {flap.animalEmoji}
                    </span>
                    <div className="animal-info-pill">
                      <strong className="text-slate-800 text-sm block">{flap.animalName}</strong>
                      <span className="onomatopoeia-tag">{flap.onomatopoeia}</span>
                    </div>
                  </div>

                  {/* Overneath: The Liftable Paper Flap */}
                  <button
                    type="button"
                    className="paper-flap-cover"
                    style={{ backgroundColor: flap.coverColor }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // INVIOLABLE RULE: Child touch causes gentle shake only, NEVER plays sound nor opens
                      onChildTouchFlap(flap);
                    }}
                    title={flap.coverLabel}
                  >
                    <div className="paper-fold-crease" />
                    <span className="flap-label-text">{flap.coverLabel}</span>
                    <span className="touch-sparkle">
                      <Sparkles className="w-4 h-4 text-amber-200 inline" />
                    </span>
                  </button>

                  {/* Adult Pointer Hand (Teaching Following the Point) */}
                  {showAdultPointer && isSelected && (
                    <div className="adult-pointer-hand animate-bounce">
                      <Hand className="w-12 h-12 text-rose-600 fill-rose-500 drop-shadow-lg transform -rotate-45" />
                      <span className="pointer-label">Olhe aqui!</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
