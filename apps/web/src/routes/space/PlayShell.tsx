/**
 * Jogo em treino livre no espaço da criança. O mesmo jogo isolado em iframe e o mesmo protocolo,
 * mas os eventos ficam fora do registro clínico (não há profissional aplicando a sessão).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import { attachGameHost } from '@aprumo/game-sdk';
import { actions, childSpaceOf, db, screenMinutesToday, useStore } from '../../data/store';
import { buildPracticeConfig } from '../../game-host/config';
import { GAMES } from '../../game-host/registry';
import { HoldToExit, StarIcon } from './ChildSpace';
import './space.css';

export default function PlayShell() {
  const { childId = '', appId = '' } = useParams();
  const nav = useNavigate();
  const st = useStore((s) => s);
  const child = st.children.find((c) => c.id === childId);
  const c = st.cases.find((x) => x.childId === childId && x.status === 'active');
  const space = st.childSpaces.find((x) => x.childId === childId) ?? childSpaceOf(childId);
  const frame = useRef<HTMLIFrameElement>(null);
  const started = useRef(Date.now());
  const [result, setResult] = useState<{ stars: number; completed: boolean } | null>(null);
  const [round, setRound] = useState(0);
  const config = useMemo(() => (c && GAMES[appId] ? buildPracticeConfig(c, appId) : null), [c, appId, round]); // eslint-disable-line react-hooks/exhaustive-deps

  // Para um primeiro momento, todos os games registrados estão disponíveis no modo mock/treino
  const allowed = !!c && !!GAMES[appId];
  const policy = child ? db.screenPolicy(child.birthDate) : null;
  const overLimit = !!c && !!policy && screenMinutesToday(st, c.id) >= policy.dailyLimitMinutes;

  useEffect(() => {
    if (!config || !frame.current || !allowed) return;
    started.current = Date.now();
    const host = attachGameHost({
      frame: frame.current,
      expectedOrigin: window.location.origin,
      config,
      // Treino livre: nada vai para a outbox clínica.
      persist: async () => {},
      quarantine: (_raw, reason) => console.warn('[treino] evento inválido', reason),
      onEvent: (ev) => {
        if (ev.type === 'SESSION_COMPLETED') {
          const secs = Math.round((Date.now() - started.current) / 1000);
          setResult({ stars: actions.recordPractice(childId, appId, secs, true), completed: true });
        }
      },
    });
    return () => host.dispose();
  }, [config, allowed, childId, appId]);

  // Tempo de tela conta durante o jogo.
  useEffect(() => {
    if (!c) return;
    const id = window.setInterval(() => actions.addChildScreenTime(c.id, 15), 15_000);
    return () => window.clearInterval(id);
  }, [c]);

  const leave = () => {
    if (!result) {
      const secs = Math.round((Date.now() - started.current) / 1000);
      actions.recordPractice(childId, appId, secs, false);
    }
    nav(`/espaco/${childId}`);
  };

  if (!child || !c || !allowed) {
    return <main className="cs-missing"><p>Este jogo não está liberado.</p><button className="cs-btn" onClick={() => nav(`/espaco/${childId}`)}>Voltar</button></main>;
  }

  return (
    <div className="cs cs-play" data-theme={space.theme} data-age={db.ageMonths(child.birthDate) >= 144 ? 'teen' : 'kid'}>
      <div className="cs-play__bar">
        <HoldToExit onExit={leave} label="Segure para voltar" />
        <strong>{GAMES[appId]!.manifest.name}</strong>
        <span className="cs-stars"><StarIcon /> {space.stars[appId] ?? 0}</span>
      </div>
      <div className="cs-play__stage">
        {overLimit ? (
          <div className="cs-play__done"><p className="cs-title">Hora de descansar a tela!</p><button className="cs-btn cs-btn--primary" onClick={() => nav(`/espaco/${childId}`)}>Voltar</button></div>
        ) : (
          <iframe key={config?.runId} ref={frame} title={GAMES[appId]!.manifest.name} src={`/game.html?app=${encodeURIComponent(appId)}`} allow="autoplay" />
        )}
        {result && (
          <div className="cs-play__done" role="status">
            <div className="cs-celebrate" aria-hidden="true">{Array.from({ length: result.stars }, (_, i) => <span key={i} style={{ animationDelay: `${i * 160}ms` }}><StarIcon /></span>)}</div>
            <p className="cs-title">{result.stars > 0 ? `Você terminou! +${result.stars} estrelas` : 'Muito bem!'}</p>
            <div className="cs-row">
              <button className="cs-btn" onClick={() => { setResult(null); setRound((r) => r + 1); }}>Jogar de novo</button>
              <button className="cs-btn cs-btn--primary" onClick={() => nav(`/espaco/${childId}`)}>Voltar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
