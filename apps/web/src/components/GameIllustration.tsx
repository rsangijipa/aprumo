import { useState, type ReactNode } from 'react';

// Map of games with AI generated JPG covers
const JPG_GAMES = new Set([
  'banda-do-tico',
  'bolhas-magicas',
  'detetive-das-emocoes',
  'encaixa-ai',
  'encontre-o-igual',
  'escape-room-kids',
  'fazendinha-sonora',
  'lanche-do-urso',
  'leitura-de-cena',
  'mercadinho-da-esquina',
  'mutirao-do-parque',
  'rampa-maluca',
  'torre-derruba',
  'vida-online',
]);

export interface GameIllustrationProps {
  appId: string;
  name: string;
  className?: string;
  fallbackArt?: ReactNode;
  aspectRatio?: string;
  interactive?: boolean;
}

export function GameIllustration({
  appId,
  name,
  className = '',
  fallbackArt,
  aspectRatio = '16 / 9',
  interactive = false,
}: GameIllustrationProps) {
  const [errorCount, setErrorCount] = useState(0);

  // If it's a JPG game, try .jpg first; otherwise try .svg first
  const hasJpg = JPG_GAMES.has(appId);
  const primarySrc = hasJpg ? `/assets/games/${appId}.jpg` : `/assets/games/${appId}.svg`;
  const secondarySrc = hasJpg ? `/assets/games/${appId}.svg` : `/assets/games/${appId}.jpg`;

  const currentSrc = errorCount === 0 ? primarySrc : errorCount === 1 ? secondarySrc : null;

  return (
    <div
      className={`ap-game-illu ${interactive ? 'ap-game-illu--interactive' : ''} ${className}`}
      style={{
        aspectRatio,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--ap-sage-100, #e8f0eb) 0%, var(--ap-sage-200, #d5e4da) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-hidden="true"
    >
      {currentSrc ? (
        <img
          src={currentSrc}
          alt={`Ilustração do jogo ${name}`}
          loading="lazy"
          decoding="async"
          onError={() => setErrorCount((c) => c + 1)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)',
          }}
        />
      ) : fallbackArt ? (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {fallbackArt}
        </div>
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            color: '#ffffff',
            padding: '1rem',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🎮</span>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{name}</span>
        </div>
      )}
    </div>
  );
}
