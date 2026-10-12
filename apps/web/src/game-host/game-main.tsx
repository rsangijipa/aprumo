/** Hospedeiro universal da atividade: acolhimento narrado antes da primeira tentativa.
 * A conexão do acolhimento é encerrada ANTES de montar o jogo, impedindo que tempo de
 * instrução seja registrado como latência da primeira tentativa. O jogo envia novo APP_READY.
 */
import { StrictMode, useEffect, useMemo, useState, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { createGameClient, speak, stopAllSounds } from '@aprumo/game-sdk';
import type { SoundLevel } from '@aprumo/game-sdk';
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import { GAMES } from './registry';
import { GAME_INTRODUCTIONS } from './narration';
import './intro.css';
import './game-theme.css';

function GameRoot() {
  const appId = new URLSearchParams(location.search).get('app') ?? '';
  const entry = GAMES[appId];
  const script = GAME_INTRODUCTIONS[appId];
  const [Game, setGame] = useState<ComponentType | null>(null);
  const [error, setError] = useState(false);
  const [started, setStarted] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [sound, setSound] = useState<SoundLevel>('low');
  const [reading, setReading] = useState(false);
  const introClient = useMemo(() => entry ? createGameClient({ appId, appVersion: entry.manifest.version }) : null, [appId, entry]);

  useEffect(() => {
    if (!appId) return;
    document.body.dataset.app = appId;
    const parkGames = [
      'mutirao-do-parque', 'bolhas-magicas', 'rampa-maluca', 'fazendinha-sonora',
      'danca-do-congelar', 'social-city'
    ];
    const playroomGames = [
      'lanche-do-urso', 'minimundos', 'pequeno-chef', 'historia-ordem',
      'circuito-executivo', 'passo-a-passo', 'quadro-de-conquistas', 'torre-derruba',
      'mercadinho-da-esquina', 'escape-room-kids'
    ];
    if (parkGames.includes(appId)) {
      document.body.dataset.bg = 'park';
    } else if (playroomGames.includes(appId)) {
      document.body.dataset.bg = 'playroom';
    } else {
      document.body.dataset.bg = 'table';
    }
  }, [appId]);

  useEffect(() => {
    if (!introClient || started) return;
    const unlisten = introClient.onConfig((config) => {
      setConfigured(true);
      setSound(config.adaptation.sound);
    });
    introClient.connect();
    return () => { unlisten(); introClient.dispose(); stopAllSounds(); };
  }, [introClient, started]);

  useEffect(() => {
    if (!entry || !started) return;
    let active = true;
    entry.load().then((loaded) => { if (active) setGame(() => loaded); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [entry, started]);

  const readExplanation = () => {
    if (!script || !configured || sound === 'off') return;
    if (reading) { stopAllSounds(); setReading(false); return; }
    setReading(true);
    void speak(`${script.world}. ${script.mission} ${script.howToPlay}`, sound, 0.88)
      .finally(() => setReading(false));
  };
  const begin = () => { stopAllSounds(); setReading(false); setStarted(true); };

  if (!entry || error) return <p style={{ fontFamily: 'system-ui', padding: 24, color: '#fff' }}>Atividade indisponível.</p>;
  if (!started) return (
    <main className="ap-game-intro">
      <section className="ap-game-intro__panel" aria-labelledby="ap-intro-title">
        <span className="ap-game-intro__eyebrow">Vamos conhecer a atividade</span>
        <h1 id="ap-intro-title" className="ap-game-intro__title">{entry.manifest.name}</h1>
        <p className="ap-game-intro__mission">{script?.mission ?? 'Vamos descobrir como jogar!'}</p>
        <p className="ap-game-intro__instructions">{script?.howToPlay ?? entry.manifest.summary}</p>
        <div className="ap-game-intro__buttons">
          <button type="button" className="ap-game-intro__button" onClick={readExplanation}
            disabled={!configured || sound === 'off'} aria-label={reading ? 'Parar leitura' : 'Ouvir como jogar'}>
            {reading ? '■ Parar leitura' : '🔊 Ouvir como jogar'}
          </button>
          <button type="button" className="ap-game-intro__button ap-game-intro__button--primary"
            onClick={begin} disabled={!configured}>
            ▶ Começar a jogar
          </button>
        </div>
        <p className="ap-game-intro__note" role="status">
          {!configured ? 'Preparando a atividade…' : sound === 'off' ? 'Som desativado no perfil: siga as instruções escritas.' : 'A voz é opcional. Você pode ouvir novamente antes de começar.'}
        </p>
        {script?.therapistTip && <details className="ap-game-intro__tip"><summary>Orientação para o profissional ou responsável</summary><p>{script.therapistTip}</p></details>}
      </section>
    </main>
  );
  return Game ? <Game /> : <p className="ap-game-intro ap-game-intro__note">Abrindo o jogo…</p>;
}

document.documentElement.style.background = '#f4f8f5';
document.body.style.margin = '0';
createRoot(document.getElementById('game')!).render(<StrictMode><GameRoot /></StrictMode>);
