/**
 * Página que roda DENTRO do iframe da atividade. Não importa nada da área profissional:
 * conhece apenas o SDK, o protocolo e o código do jogo pedido.
 */
import { StrictMode, useEffect, useState, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import { GAMES } from './registry';

function GameRoot() {
  const appId = new URLSearchParams(location.search).get('app') ?? '';
  const [Game, setGame] = useState<ComponentType | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const entry = GAMES[appId];
    if (!entry) return setError(true);
    entry.load().then((G) => setGame(() => G)).catch(() => setError(true));
  }, [appId]);

  if (error) return <p style={{ fontFamily: 'system-ui', padding: 24 }}>Atividade indisponível.</p>;
  return Game ? <Game /> : null;
}

document.documentElement.style.background = '#222';
document.body.style.margin = '0';
createRoot(document.getElementById('game')!).render(
  <StrictMode>
    <GameRoot />
  </StrictMode>,
);
