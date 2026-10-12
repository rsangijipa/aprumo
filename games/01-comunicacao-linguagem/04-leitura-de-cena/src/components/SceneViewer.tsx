import React from 'react';
import type { SocialScene, CueHotspot } from '../types/scene';
import { Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface SceneViewerProps {
  scene: SocialScene;
  activeModule: string;
  foundCues: string[];
  onSelectCue?: (cue: CueHotspot) => void;
}

export const SceneViewer: React.FC<SceneViewerProps> = ({
  scene,
  activeModule,
  foundCues,
  onSelectCue,
}) => {
  const isCueModule = activeModule === 'E2';

  const handleSpeak = () => {
    soundManager.speak(scene.spokenText);
  };

  return (
    <div className="scene-viewer-card">
      <div className="scene-header">
        <div className="scene-badge-row">
          <span className="context-tag">Contexto: {scene.context.toUpperCase()}</span>
          <span className="age-tag">{scene.targetAge === 'infantil' ? 'Infantil' : 'Adolescente'}</span>
          <span className="intensity-tag">Intensidade: {'★'.repeat(scene.intensity)}</span>
        </div>
        <h2 className="scene-title">{scene.title}</h2>
      </div>

      {/* Visual illustration viewport */}
      <div className="scene-stage-container">
        {/* SVG Illustrated Backdrop */}
        <svg viewBox="0 0 800 480" className="scene-illustration" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="bg-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#dbeafe" />
              <stop offset="60%" stopColor="#bfdbfe" />
              <stop offset="100%" stopColor="#93c5fd" />
            </linearGradient>
            <linearGradient id="floor-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fdba74" />
            </linearGradient>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Room Background */}
          <rect x="0" y="0" width="800" height="340" fill="url(#bg-grad)" />
          <rect x="0" y="340" width="800" height="140" fill="url(#floor-grad)" />

          {/* Window / Architecture elements */}
          <rect x="60" y="40" width="140" height="180" rx="12" fill="#ffffff" opacity="0.6" />
          <line x1="130" y1="40" x2="130" y2="220" stroke="#93c5fd" strokeWidth="4" />
          <line x1="60" y1="130" x2="200" y2="130" stroke="#93c5fd" strokeWidth="4" />

          {/* Table / Furniture */}
          <ellipse cx="400" cy="380" rx="220" ry="40" fill="#78350f" opacity="0.15" />
          <path d="M 280 340 L 520 340 L 560 410 L 240 410 Z" fill="#b45309" filter="url(#shadow)" />
          <rect x="270" y="410" width="20" height="50" fill="#92400e" />
          <rect x="510" y="410" width="20" height="50" fill="#92400e" />

          {/* Character Silhouette & Stylized Expression */}
          <g transform="translate(350, 150)" filter="url(#shadow)">
            {/* Body */}
            <path
              d="M 10 130 C 10 100, 90 100, 90 130 L 95 210 L 5 210 Z"
              fill={scene.emotion === 'raiva' ? '#ef4444' : scene.emotion === 'alegria' ? '#10b981' : '#3b82f6'}
              opacity="0.85"
            />
            {/* Neck */}
            <rect x="42" y="90" width="16" height="20" fill="#d97706" opacity="0.4" />
            {/* Head */}
            <circle cx="50" cy="55" r="42" fill="#fed7aa" stroke="#f59e0b" strokeWidth="3" />
            {/* Hair */}
            <path d="M 12 50 C 15 15, 85 15, 88 50 C 80 40, 60 30, 50 35 C 40 30, 20 40, 12 50 Z" fill="#451a03" />

            {/* Eyes */}
            <circle cx="36" cy="52" r="5" fill="#1e293b" />
            <circle cx="64" cy="52" r="5" fill="#1e293b" />
            <circle cx="38" cy="50" r="1.5" fill="#ffffff" />
            <circle cx="66" cy="50" r="1.5" fill="#ffffff" />

            {/* Eyebrows matching emotion */}
            {scene.emotion === 'raiva' && (
              <>
                <line x1="28" y1="40" x2="44" y2="46" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
                <line x1="72" y1="40" x2="56" y2="46" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
              </>
            )}
            {scene.emotion === 'tristeza' && (
              <>
                <line x1="28" y1="45" x2="44" y2="40" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
                <line x1="72" y1="45" x2="56" y2="40" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
              </>
            )}
            {(scene.emotion === 'alegria' || scene.emotion === 'calma') && (
              <>
                <path d="M 28 42 Q 36 38 44 42" stroke="#451a03" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M 56 42 Q 64 38 72 42" stroke="#451a03" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            )}
            {scene.emotion === 'surpresa' && (
              <>
                <path d="M 28 38 Q 36 32 44 38" stroke="#451a03" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M 56 38 Q 64 32 72 38" stroke="#451a03" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            )}

            {/* Mouth */}
            {scene.emotion === 'alegria' && (
              <path d="M 34 68 Q 50 86 66 68" stroke="#dc2626" strokeWidth="4" fill="#ffffff" strokeLinecap="round" />
            )}
            {scene.emotion === 'tristeza' && (
              <path d="M 36 78 Q 50 66 64 78" stroke="#991b1b" strokeWidth="4" fill="none" strokeLinecap="round" />
            )}
            {scene.emotion === 'raiva' && (
              <line x1="36" y1="74" x2="64" y2="72" stroke="#991b1b" strokeWidth="4" strokeLinecap="round" />
            )}
            {scene.emotion === 'surpresa' && (
              <ellipse cx="50" cy="74" rx="8" ry="12" fill="#991b1b" />
            )}
            {(scene.emotion === 'frustracao' || scene.emotion === 'ansiedade') && (
              <path d="M 36 75 Q 45 78 52 73 Q 60 70 64 75" stroke="#991b1b" strokeWidth="3" fill="none" strokeLinecap="round" />
            )}
            {scene.emotion === 'calma' && (
              <path d="M 38 70 Q 50 76 62 70" stroke="#b91c1c" strokeWidth="3" fill="none" strokeLinecap="round" />
            )}
          </g>

          {/* Situational context props (books, spilled items, phone) */}
          {scene.id === 'cena-lapis-chao' && (
            <g transform="translate(260, 360)">
              <rect x="0" y="0" width="70" height="30" rx="6" fill="#e11d48" transform="rotate(-15)" />
              <line x1="20" y1="10" x2="60" y2="40" stroke="#eab308" strokeWidth="5" strokeLinecap="round" />
              <line x1="-15" y1="20" x2="30" y2="35" stroke="#3b82f6" strokeWidth="5" strokeLinecap="round" />
              <line x1="45" y1="25" x2="90" y2="15" stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
            </g>
          )}

          {scene.id === 'cena-nota-ciencias' && (
            <g transform="translate(480, 260)">
              <rect x="0" y="0" width="70" height="90" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
              <text x="35" y="45" fontSize="24" textAnchor="middle" fill="#16a34a" fontWeight="bold">10</text>
              <text x="35" y="70" fontSize="11" textAnchor="middle" fill="#64748b">CIÊNCIAS</text>
              <polygon points="50,220 70,180 90,220" fill="#f59e0b" />
            </g>
          )}

          {scene.id === 'cena-esbarrao-corredor' && (
            <g transform="translate(240, 360)">
              <rect x="10" y="0" width="55" height="35" rx="3" fill="#3b82f6" stroke="#1d4ed8" />
              <rect x="30" y="10" width="55" height="35" rx="3" fill="#f43f5e" stroke="#be123c" />
              <line x1="20" y1="-10" x2="40" y2="-5" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 2" />
            </g>
          )}

          {scene.id === 'cena-mensagem-celular' && (
            <g transform="translate(480, 250)">
              <rect x="0" y="0" width="50" height="90" rx="10" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
              <rect x="5" y="10" width="40" height="70" rx="4" fill="#f8fafc" />
              <circle cx="25" cy="84" r="3" fill="#cbd5e1" />
              <rect x="8" y="20" width="25" height="8" rx="2" fill="#3b82f6" />
              <rect x="15" y="32" width="26" height="8" rx="2" fill="#e2e8f0" />
            </g>
          )}

          {scene.id === 'cena-jogo-tabuleiro' && (
            <g transform="translate(320, 330)">
              <rect x="0" y="0" width="160" height="60" rx="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="3" />
              <circle cx="30" cy="30" r="12" fill="#ef4444" />
              <circle cx="80" cy="30" r="12" fill="#3b82f6" />
              <circle cx="130" cy="30" r="12" fill="#10b981" />
              <rect x="70" y="15" width="20" height="20" rx="3" fill="#ffffff" stroke="#334155" />
            </g>
          )}
        </svg>

        {/* Hotspot overlays for Cues (E2 Module and general inspection) */}
        <div className="hotspots-layer">
          {scene.cues.map((cue) => {
            const isFound = foundCues.includes(cue.cueId);
            return (
              <button
                key={cue.cueId}
                type="button"
                className={`cue-pin ${isCueModule ? 'active-cue-pin' : ''} ${isFound ? 'found-pin' : ''}`}
                style={{ left: `${cue.xPct}%`, top: `${cue.yPct}%` }}
                onClick={() => onSelectCue?.(cue)}
                title={cue.label}
              >
                {isFound ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <span className="pin-pulse">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </span>
                )}
                <span className="cue-tooltip">{cue.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description & Spoken Dialogue Banner with Accessible Audio */}
      <div className="scene-speech-box">
        <div className="character-desc">
          <strong>Cenário:</strong> {scene.characterDescription}
        </div>
        <div className="dialog-row">
          <button
            type="button"
            className="speech-btn"
            onClick={handleSpeak}
            title="Ouvir a fala do personagem"
          >
            <Volume2 className="w-6 h-6 text-indigo-600" />
            <span>Ouvir fala</span>
          </button>
          <div className="subtitle-display" aria-live="polite">
            <span className="subtitle-label">Legenda obrigatória:</span>
            <p className="subtitle-text">{scene.subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
