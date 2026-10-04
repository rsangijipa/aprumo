/**
 * Espaço da criança ou do adolescente. Aberto por um adulto já autenticado: pelo portal da família
 * (cartão "Abrir o espaço de …") ou pela ficha do caso no painel profissional. Sem código nem PIN na entrada.
 * Gamificação saudável (P7, ECA Digital): estrelas de esforço, álbum com figurinhas visíveis e escolhidas,
 * conquistas pessoais. Sem ranking, sem sorteio, sem sequência de dias, sem notificações.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { HoldRing, useHoldPress } from '../child/useHoldPress';
import { useLocation, useNavigate, useParams } from 'react-router';
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import { speak } from '@aprumo/game-sdk';
import { TokenArt, type TokenTheme } from '@aprumo/resource-quadro-de-fichas';
import { STIMULUS_ART, StimulusArt } from '@aprumo/stimuli';
import {
  STARS_PER_STICKER,
  actions,
  childSpaceOf,
  db,
  screenMinutesToday,
  stickerSlots,
  totalStars,
  useStore,
} from '../../data/store';
import type { ChildTheme } from '../../data/types';
import { GAMES } from '../../game-host/registry';
import {
  ArtListener,
  ArtMatch,
  ArtTurns,
  ArtDetective,
  ArtExecutive,
  ArtMiniWorlds,
  ArtChef,
  ArtIndependence,
  ArtSocialCity,
  ArtCategory,
  ArtAnimalMemory,
  ArtStoryOrder,
  ArtCauseEffect,
  ArtMagicMirror,
  ArtSharedAttention,
} from '../public/Landing';
import { AVATARS, Avatar, FEELINGS, Feeling, NEEDS, Need } from './art';
import './space.css';

const GAME_ART: Record<string, ReactNode> = {
  'encontre-o-igual': <ArtMatch />,
  'escolha-pela-instrucao': <ArtListener />,
  'minha-vez-sua-vez': <ArtTurns />,
  'organize-categoria': <ArtCategory />,
  'memoria-bichos': <ArtAnimalMemory />,
  'historia-ordem': <ArtStoryOrder />,
  'pequeno-chef': <ArtChef />,
  'missao-independencia': <ArtIndependence />,
  'causa-efeito': <ArtCauseEffect />,
  'espelho-magico': <ArtMagicMirror />,
  'olha-comigo': <ArtSharedAttention />,
  'detetive-das-emocoes': <ArtDetective />,
  'circuito-executivo': <ArtExecutive />,
  'minimundos': <ArtMiniWorlds />,
  'social-city': <ArtSocialCity />,
};
const GAME_KID_NAME: Record<string, string> = {
  'encontre-o-igual': 'Encontre o igual',
  'escolha-pela-instrucao': 'Escute e toque',
  'minha-vez-sua-vez': 'Minha vez, sua vez',
  'organize-categoria': 'Organize as Coisas',
  'memoria-bichos': 'Memória dos Bichos',
  'historia-ordem': 'História em Ordem',
  'pequeno-chef': 'Pequeno Chef',
  'missao-independencia': 'Missão Independência',
  'causa-efeito': 'Botão Mágico',
  'espelho-magico': 'Espelho Mágico',
  'olha-comigo': 'Olha comigo',
  'detetive-das-emocoes': 'Detetive das Emoções',
  'circuito-executivo': 'Circuito Divertido',
  'minimundos': 'MiniMundos',
  'social-city': 'Social City 3D',
};
const TOKEN_STICKERS: TokenTheme[] = ['trem', 'estrela', 'dinossauro', 'coracao', 'folha'];
export const STICKERS = [...TOKEN_STICKERS, 'bola', 'carro', 'peixe', 'flor', 'aviao', 'casa', 'uva', 'gato', 'cachorro', 'livro', 'maca'];

export function Sticker({ id }: { id: string }) {
  return (TOKEN_STICKERS as string[]).includes(id) ? <TokenArt theme={id as TokenTheme} /> : <StimulusArt art={id} label={STIMULUS_ART[id]?.label} />;
}

type Tab = 'inicio' | 'jogar' | 'album' | 'prancha' | 'calma';

/**
 * Para onde a saída leva: a área do adulto que abriu o espaço. O portal da família envia
 * `state.returnTo`; guardamos na sessão para sobreviver às idas e voltas dos jogos. Sem origem
 * conhecida (entrada pela ficha do caso), volta ao perfil do caso no painel profissional, que exige login.
 */
const returnKey = (childId: string) => `aprumo:espaco-volta:${childId}`;
function useReturnTo(childId: string, caseId: string | undefined): string {
  const { state } = useLocation();
  const fromState = (state as { returnTo?: unknown } | null)?.returnTo;
  const safe = (v: unknown): v is string => typeof v === 'string' && v.startsWith('/') && !v.startsWith('//');
  let stored: string | null = null;
  try {
    if (safe(fromState)) sessionStorage.setItem(returnKey(childId), fromState);
    stored = sessionStorage.getItem(returnKey(childId));
  } catch { /* armazenamento indisponível: segue com o fallback */ }
  if (safe(fromState)) return fromState;
  if (safe(stored)) return stored;
  return caseId ? `/app/casos/${caseId}/perfil` : '/entrar';
}

export default function ChildSpace() {
  const { childId = '' } = useParams();
  const nav = useNavigate();
  const st = useStore((s) => s);
  const child = st.children.find((c) => c.id === childId);
  const c = st.cases.find((x) => x.childId === childId && x.status === 'active');
  const space = st.childSpaces.find((x) => x.childId === childId) ?? childSpaceOf(childId);
  const [tab, setTabState] = useState<Tab>('inicio');
  const setTab = (t: Tab) => { setTabState(t); window.scrollTo({ top: 0 }); };
  const [settingsOpen, setSettingsOpen] = useState(false);
  const months = child ? db.ageMonths(child.birthDate) : 72;
  const defaultMode: AgeMode = months < 48 ? 'sensory' : months < 108 ? 'kid' : months < 156 ? 'goals' : 'teen';
  const [ageMode, setAgeMode] = useState<AgeMode>(defaultMode);
  const returnTo = useReturnTo(childId, c?.id);

  // Todo uso do espaço é tempo de tela: soma no medidor diário (SBP).
  useEffect(() => {
    if (!c) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') actions.addChildScreenTime(c.id, 15);
    }, 15_000);
    return () => window.clearInterval(id);
  }, [c]);

  if (!child || !c) return <main className="cs-missing"><p>Não encontramos este espaço. Ele pode ter sido desativado pela equipe.</p><button className="cs-btn" onClick={() => nav(returnTo)}>Voltar</button></main>;

  const teen = ageMode === 'teen' || ageMode === 'goals';
  const policy = db.screenPolicy(child.birthDate);
  const used = screenMinutesToday(st, c.id);
  const limitReached = used >= policy.dailyLimitMinutes;
  const released = c.releasedApps;
  // Para um primeiro momento, todos os games do catálogo ficam disponíveis para a criança e adolescentes nos dados mock
  const allGameKeys = Object.keys(GAMES);
  const games = Array.from(new Set([...allGameKeys, ...released.filter((a) => GAMES[a])]));
  const stars = totalStars(space);
  const T = TEXT[ageMode];

  return (
    <div className="cs" data-theme={space.theme} data-age={ageMode}>
      <header className="cs-top">
        <button className="cs-avatar-btn" onClick={() => setSettingsOpen(true)} aria-label="Mudar meu avatar e cores">
          <Avatar id={space.avatar} size={56} />
        </button>
        <div className="cs-hello">
          <span>{T.hello}</span>
          <strong>{child.preferredName}</strong>
        </div>
        <span className="cs-stars" aria-label={`${stars} estrelas`}><StarIcon /> {stars}</span>
        <HoldToExit onExit={() => nav(returnTo)} label={T.exit} />
      </header>

      <main className="cs-main">
        {tab === 'inicio' && (
          <Home childId={childId} caseId={c.id} teen={teen} used={used} limit={policy.dailyLimitMinutes} games={games} limitReached={limitReached} go={setTab} onPlay={(a) => nav(`/espaco/${childId}/jogar/${a}`)} />
        )}
        {tab === 'jogar' && <Games childId={childId} games={games} teen={teen} limitReached={limitReached} onPlay={(a) => nav(`/espaco/${childId}/jogar/${a}`)} />}
        {tab === 'album' && <Album childId={childId} teen={teen} />}
        {tab === 'prancha' && <Board sound={space.sound} teen={teen} />}
        {tab === 'calma' && <Calm sound={space.sound} teen={teen} />}
      </main>

      <nav className="cs-nav" aria-label="Menu">
        {(
          [
            ['inicio', T.tabHome, <HomeIcon key="h" />],
            ['jogar', T.tabPlay, <PlayIcon key="p" />],
            ['album', T.tabAlbum, <AlbumIcon key="a" />],
            ...(released.includes('prancha') ? [['prancha', T.tabBoard, <BoardIcon key="b" />] as const] : []),
            ...(released.includes('calma') ? [['calma', T.tabCalm, <CalmIcon key="c" />] as const] : []),
          ] as Array<readonly [Tab, string, ReactNode]>
        ).map(([id, label, icon]) => (
          <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {settingsOpen && (
        <SpaceSettings
          childId={childId}
          teen={teen}
          ageMode={ageMode}
          onSelectAgeMode={setAgeMode}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export type AgeMode = 'sensory' | 'kid' | 'goals' | 'teen';

const TEXT: Record<AgeMode, {
  hello: string; exit: string; tabHome: string; tabPlay: string; tabAlbum: string; tabBoard: string; tabCalm: string;
  today: string; screen: string; rest: string;
  know: string; learning: string; album: string; next: (n: number) => string;
  choose: string; play: string;
}> = {
  sensory: {
    hello: 'Olá,', exit: 'Segurar para sair', tabHome: 'Início', tabPlay: 'Jogar', tabAlbum: 'Figuras', tabBoard: 'Voz', tabCalm: 'Calma',
    today: 'Vamos brincar?', screen: 'Tempo de tela', rest: 'Hora de descansar os olhinhos! Que tal um abraço ou água?',
    know: 'Já sei fazer', learning: 'Estou aprendendo', album: 'Minhas Figuras', next: (n: number) => `Mais ${n} para outra figura!`,
    choose: 'Escolher figura', play: 'Tocar',
  },
  kid: {
    hello: 'Oi,', exit: 'Segure para sair', tabHome: 'Início', tabPlay: 'Jogar', tabAlbum: 'Álbum', tabBoard: 'Falar', tabCalm: 'Calma',
    today: 'O que vamos fazer hoje?', screen: 'Tempo de tela de hoje', rest: 'Hora de descansar a tela! Que tal brincar com alguém?',
    know: 'Coisas que eu já sei', learning: 'Estou aprendendo', album: 'Meu álbum', next: (n: number) => `Faltam ${n} estrelas para a próxima figurinha`,
    choose: 'Escolha sua figurinha!', play: 'Jogar',
  },
  goals: {
    hello: 'Olá,', exit: 'Segure para sair', tabHome: 'Metas', tabPlay: 'Desafios', tabAlbum: 'Insígnias', tabBoard: 'Comunicar', tabCalm: 'Pausa',
    today: 'Suas Metas de Hoje', screen: 'Tempo de tela de hoje', rest: 'Tempo de tela atingido. Ótimo momento para uma atividade física ou livro.',
    know: 'Habilidades dominadas', learning: 'Desafios em treino', album: 'Coleção de Insígnias', next: (n: number) => `${n} estrelas para a próxima conquista`,
    choose: 'Escolher nova insígnia', play: 'Iniciar desafio',
  },
  teen: {
    hello: 'E aí,', exit: 'Segure para sair', tabHome: 'Painel', tabPlay: 'Atividades', tabAlbum: 'Coleção', tabBoard: 'Comunicar', tabCalm: 'Pausa',
    today: 'Seu painel', screen: 'Tela hoje', rest: 'Limite de tela de hoje atingido. Bom momento para uma pausa fora da tela.',
    know: 'Habilidades conquistadas', learning: 'Em treino', album: 'Coleção', next: (n: number) => `${n} estrelas para o próximo item`,
    choose: 'Escolher item da coleção', play: 'Abrir',
  },
};

/* ================================================================ início */
function Home({ childId, caseId, teen, used, limit, games, limitReached, go, onPlay }: {
  childId: string; caseId: string; teen: boolean; used: number; limit: number; games: string[]; limitReached: boolean; go: (t: Tab) => void; onPlay: (a: string) => void;
}) {
  const st = useStore((s) => s);
  const space = st.childSpaces.find((x) => x.childId === childId) ?? childSpaceOf(childId);
  const T = teen ? TEXT.teen : TEXT.kid;
  const targets = st.targets.filter((t) => t.caseId === caseId);
  const known = targets.filter((t) => ['maintenance', 'generalization', 'mastered'].includes(t.phase));
  const learning = targets.filter((t) => t.phase === 'acquisition');
  const stars = totalStars(space);
  const toNext = STARS_PER_STICKER - (stars % STARS_PER_STICKER);
  const canChoose = space.stickers.length < stickerSlots(space);
  const pct = Math.min(100, (used / Math.max(1, limit)) * 100);

  return (
    <div className="cs-stack">
      <h1 className="cs-title">{T.today}</h1>

      <section className="cs-card cs-screen" aria-label={T.screen}>
        <div className="cs-screen__head"><SunIcon /> <strong>{T.screen}</strong> <span>{used} de {limit} min</span></div>
        <div className="cs-screen__bar"><i style={{ width: `${pct}%` }} data-full={limitReached} /></div>
        {limitReached && <p className="cs-note">{T.rest}</p>}
      </section>

      {games.length > 0 && (
        <section className="cs-row-scroll" aria-label="Jogos">
          {games.map((g) => (
            <GameTile key={g} appId={g} stars={space.stars[g] ?? 0} locked={limitReached} teen={teen} onPlay={() => onPlay(g)} compact />
          ))}
        </section>
      )}

      <div className="cs-grid2">
        <button className="cs-card cs-album-teaser" onClick={() => go('album')}>
          <div className="cs-album-teaser__stickers">
            {space.stickers.slice(-3).map((s) => <span key={s}><Sticker id={s} /></span>)}
            {space.stickers.length === 0 && <span className="cs-empty-sticker" />}
          </div>
          <strong>{T.album}</strong>
          <span>{canChoose ? T.choose : T.next(toNext)}</span>
        </button>

        <section className="cs-card cs-learned">
          <strong>{T.know}</strong>
          {known.length === 0 ? <span className="cs-note">Logo aparecem aqui!</span> : (
            <ul>{known.map((t) => <li key={t.id}><span className="cs-learned__art"><StimulusArt art={t.art} label={t.name} /></span>{t.name}<CheckIcon /></li>)}</ul>
          )}
          {learning.length > 0 && <><strong className="cs-sub">{T.learning}</strong><p className="cs-note">{learning.map((t) => t.name).join(' · ')}</p></>}
        </section>
      </div>
    </div>
  );
}

function GameTile({ appId, stars, locked, teen, onPlay, compact }: { appId: string; stars: number; locked: boolean; teen: boolean; onPlay: () => void; compact?: boolean }) {
  const name = teen ? GAMES[appId]!.manifest.name : GAME_KID_NAME[appId] ?? GAMES[appId]!.manifest.name;
  return (
    <button className="cs-game" data-compact={compact} disabled={locked} onClick={onPlay} aria-label={`${name}${locked ? ' (tela descansando)' : ''}`}>
      <span className="cs-game__art" aria-hidden="true">{GAME_ART[appId]}</span>
      <span className="cs-game__body">
        <strong>{name}</strong>
        <span className="cs-game__stars"><StarIcon /> {stars}</span>
      </span>
      {locked && <span className="cs-game__lock" aria-hidden="true"><MoonIcon /></span>}
    </button>
  );
}

/* ================================================================ jogos */
function Games({ childId, games, teen, limitReached, onPlay }: { childId: string; games: string[]; teen: boolean; limitReached: boolean; onPlay: (a: string) => void }) {
  const space = useStore((s) => s.childSpaces.find((x) => x.childId === childId)) ?? childSpaceOf(childId);
  return (
    <div className="cs-stack">
      <h1 className="cs-title">{teen ? 'Atividades' : 'Vamos jogar?'}</h1>
      {limitReached && <p className="cs-card cs-note">{(teen ? TEXT.teen : TEXT.kid).rest}</p>}
      {games.length === 0 ? <p className="cs-card cs-note">Nenhum jogo liberado ainda. A sua equipe libera os jogos aqui.</p> : (
        <div className="cs-games">
          {games.map((g) => <GameTile key={g} appId={g} stars={space.stars[g] ?? 0} locked={limitReached} teen={teen} onPlay={() => onPlay(g)} />)}
        </div>
      )}
      <p className="cs-note cs-center">{teen ? 'Cada atividade concluída vale 3 estrelas.' : 'Terminou um jogo? Ganha 3 estrelas!'}</p>
    </div>
  );
}

/* ================================================================ álbum */
function Album({ childId, teen }: { childId: string; teen: boolean }) {
  const space = useStore((s) => s.childSpaces.find((x) => x.childId === childId)) ?? childSpaceOf(childId);
  const [choosing, setChoosing] = useState(false);
  const stars = totalStars(space);
  const slots = stickerSlots(space);
  const free = slots - space.stickers.length;
  const toNext = STARS_PER_STICKER - (stars % STARS_PER_STICKER);
  const T = teen ? TEXT.teen : TEXT.kid;

  return (
    <div className="cs-stack">
      <h1 className="cs-title">{T.album}</h1>
      <section className="cs-card cs-album-head">
        <div className="cs-progress-ring" style={{ ['--p' as string]: `${((stars % STARS_PER_STICKER) / STARS_PER_STICKER) * 100}%` }}><StarIcon /></div>
        <div>
          <strong>{space.stickers.length} de {STICKERS.length}</strong>
          <p className="cs-note">{free > 0 ? (teen ? `Você pode escolher ${free} item.` : `Você pode escolher ${free} figurinha${free > 1 ? 's' : ''}!`) : T.next(toNext)}</p>
        </div>
        {free > 0 && <button className="cs-btn cs-btn--primary" onClick={() => setChoosing(true)}>{T.choose}</button>}
      </section>
      <div className="cs-album">
        {STICKERS.map((s) => {
          const has = space.stickers.includes(s);
          return (
            <div key={s} className="cs-sticker" data-has={has} aria-label={has ? `figurinha ${s}` : `figurinha ${s} ainda não escolhida`}>
              <Sticker id={s} />
            </div>
          );
        })}
      </div>
      <p className="cs-note cs-center">Todas as figurinhas aparecem aqui desde o começo. Você escolhe a próxima!</p>

      {choosing && (
        <div className="cs-sheet" role="dialog" aria-modal="true" aria-label={T.choose}>
          <div className="cs-sheet__panel">
            <h2>{T.choose}</h2>
            <div className="cs-album">
              {STICKERS.filter((s) => !space.stickers.includes(s)).map((s) => (
                <button key={s} className="cs-sticker cs-sticker--pick" onClick={() => { actions.unlockSticker(childId, s); setChoosing(false); }} aria-label={`Escolher ${s}`}>
                  <Sticker id={s} />
                </button>
              ))}
            </div>
            <button className="cs-btn" onClick={() => setChoosing(false)}>Depois</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================ prancha de comunicação */
function Board({ sound, teen }: { sound: boolean; teen: boolean }) {
  const [group, setGroup] = useState<'quero' | 'sinto'>('quero');
  const [strip, setStrip] = useState<Array<{ id: string; kind: 'need' | 'feel' }>>([]);
  const sentence = strip.map((x) => (x.kind === 'need' ? NEEDS[x.id]!.say : FEELINGS[x.id]!.say)).join(', ');
  const say = (text: string) => void speak(text, sound ? 'normal' : 'off');
  const full = () => (group === 'quero' && strip.every((x) => x.kind === 'need') && strip.length ? `Eu quero ${sentence}` : sentence);

  return (
    <div className="cs-stack">
      <h1 className="cs-title">{teen ? 'Comunicar' : 'Eu quero falar'}</h1>
      <section className="cs-strip" aria-label="Frase">
        <div className="cs-strip__items">
          {strip.length === 0 && <span className="cs-note">Toque nas figuras para montar a frase</span>}
          {strip.map((x, i) => <span key={i} className="cs-strip__item">{x.kind === 'need' ? <Need id={x.id} /> : <Feeling id={x.id} />}</span>)}
        </div>
        <button className="cs-btn cs-btn--primary" disabled={!strip.length} onClick={() => say(full())}><SpeakIcon /> Falar</button>
        <button className="cs-btn" disabled={!strip.length} onClick={() => setStrip([])} aria-label="Apagar frase">Apagar</button>
      </section>
      <div className="cs-seg" role="tablist">
        <button role="tab" aria-selected={group === 'quero'} onClick={() => setGroup('quero')}>Eu quero</button>
        <button role="tab" aria-selected={group === 'sinto'} onClick={() => setGroup('sinto')}>Eu sinto</button>
      </div>
      <div className="cs-board">
        {group === 'quero'
          ? Object.entries(NEEDS).map(([id, n]) => (
              <button key={id} className="cs-board__cell" onClick={() => { setStrip((s) => [...s, { id, kind: 'need' }]); say(n.say); }}>
                <Need id={id} /><span>{n.label}</span>
              </button>
            ))
          : Object.entries(FEELINGS).map(([id, f]) => (
              <button key={id} className="cs-board__cell" onClick={() => { setStrip((s) => [...s, { id, kind: 'feel' }]); say(f.say); }}>
                <Feeling id={id} /><span>{f.label}</span>
              </button>
            ))}
      </div>
      <p className="cs-note cs-center">A prancha funciona mesmo quando o tempo de tela acaba: comunicar não é tempo de jogo.</p>
    </div>
  );
}

/* ================================================================ cantinho da calma */
function Calm({ sound, teen }: { sound: boolean; teen: boolean }) {
  const [breathing, setBreathing] = useState(false);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!breathing) return;
    const id = window.setInterval(() => {
      setPhase((p) => (p === 'in' ? 'out' : 'in'));
      setCount((n) => n + 1);
    }, 4000);
    return () => window.clearInterval(id);
  }, [breathing]);
  useEffect(() => {
    if (count >= 12) setBreathing(false); // 6 respirações completas
  }, [count]);

  const strategies = [
    { id: 'respirar', label: 'Respirar devagar', icon: <CalmIcon />, act: () => { setCount(0); setPhase('in'); setBreathing(true); } },
    { id: 'contar', label: 'Contar até 5', icon: <span className="cs-big-num">5</span>, act: () => void speak('Um. Dois. Três. Quatro. Cinco.', sound ? 'low' : 'off', 0.6) },
    { id: 'apertar', label: teen ? 'Apertar a bolinha' : 'Apertar a almofada', icon: <span className="cs-big-num">✊</span>, act: () => void speak('Aperta forte... e solta.', sound ? 'low' : 'off', 0.7) },
    { id: 'pausa', label: 'Pedir uma pausa', icon: <Need id="pausa" />, act: () => void speak('Eu quero uma pausa', sound ? 'normal' : 'off') },
  ];

  return (
    <div className="cs-stack">
      <h1 className="cs-title">{teen ? 'Pausa' : 'Cantinho da calma'}</h1>
      <section className="cs-card cs-breath">
        <div className="cs-balloon" data-phase={breathing ? phase : 'idle'} aria-hidden="true" />
        <p className="cs-breath__text" aria-live="polite">{breathing ? (phase === 'in' ? 'Puxa o ar…' : 'Solta devagar…') : 'Toque em “Respirar devagar”'}</p>
      </section>
      <div className="cs-strategies">
        {strategies.map((s) => (
          <button key={s.id} className="cs-strategy" onClick={s.act}>{s.icon}<span>{s.label}</span></button>
        ))}
      </div>
      <p className="cs-note cs-center">Cada pessoa tem o seu jeito de se acalmar. A equipe ajuda a escolher o que funciona para você.</p>
    </div>
  );
}

/* ================================================================ configurações da criança */
function SpaceSettings({
  childId,
  teen,
  ageMode,
  onSelectAgeMode,
  onClose,
}: {
  childId: string;
  teen: boolean;
  ageMode: AgeMode;
  onSelectAgeMode: (m: AgeMode) => void;
  onClose: () => void;
}) {
  const space = useStore((s) => s.childSpaces.find((x) => x.childId === childId)) ?? childSpaceOf(childId);
  const avatars = Object.entries(AVATARS).filter(([, a]) => !!a.teen === teen);
  const themes: Array<[ChildTheme, string]> = [['sol', 'Sol'], ['mar', 'Mar'], ['floresta', 'Floresta'], ['noite', 'Noite']];
  return (
    <div className="cs-sheet" role="dialog" aria-modal="true" aria-label="Meu jeito">
      <div className="cs-sheet__panel">
        <h2>{teen ? 'Personalizar' : 'Do meu jeito'}</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--cs-muted)' }}>Faixa Etária Adaptativa:</span>
          <div className="cs-pick-row" style={{ flexWrap: 'wrap' }}>
            {([['sensory', '2–4 Sensorial'], ['kid', '5–8 Lúdico'], ['goals', '9–12 Metas'], ['teen', '13+ Adolescente']] as const).map(([m, label]) => (
              <button key={m} className="cs-btn" aria-pressed={ageMode === m} onClick={() => onSelectAgeMode(m)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="cs-pick-row">
          {avatars.map(([id]) => (
            <button key={id} aria-pressed={space.avatar === id} onClick={() => actions.updateChildSpace(childId, { avatar: id })}><Avatar id={id} size={60} /></button>
          ))}
        </div>
        <div className="cs-pick-row">
          {themes.map(([id, label]) => (
            <button key={id} className="cs-theme-swatch" data-swatch={id} aria-pressed={space.theme === id} onClick={() => actions.updateChildSpace(childId, { theme: id })}>{label}</button>
          ))}
        </div>
        <button className="cs-btn" aria-pressed={space.sound} onClick={() => actions.updateChildSpace(childId, { sound: !space.sound })}>
          <SpeakIcon /> {space.sound ? 'Som ligado' : 'Som desligado'}
        </button>
        <button className="cs-btn cs-btn--primary" onClick={onClose}>Pronto</button>
      </div>
    </div>
  );
}

/* ================================================================ sair com toque longo */
/**
 * Saída do espaço (ou do jogo de volta ao espaço): só a pressão prolongada de 1,2 s (useHoldPress).
 *
 * Decisão sobre PIN: removido. O PIN antigo era fixo ("1234") e aparecia na própria mensagem de erro,
 * então não protegia nada e só somava etapas para o adulto. A pressão prolongada já impede a saída
 * acidental pela criança (toque simples e leitor de tela não saem), e o destino da saída é a área do
 * adulto que abriu o espaço (portal da família ou ficha do caso), que já exige login próprio.
 * Quando houver PIN definido pelo responsável no back-end, ele deve entrar aqui, uma única vez, na saída
 * para a área adulta (nunca na volta do jogo para o espaço).
 */
export function HoldToExit({ onExit, label }: { onExit: () => void; label: string }) {
  const hold = useHoldPress(onExit);

  return (
    <button
      type="button"
      className="cs-exit"
      data-holding={hold.holding}
      {...hold.bind}
      aria-label={`${label}: mantenha pressionado por 1,2 segundo (ou segure Enter ou Espaço)`}
    >
      <span className="cs-exit__icon">
        <HoldRing holding={hold.holding} ms={hold.ms} size={40} className="cs-exit__ring" />
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M14 4.5H6.5v15H14M10.5 12H20M16.5 8.5 20 12l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="cs-exit__label">{label}</span>
    </button>
  );
}

/* ================================================================ ícones grandes e cheios (toque) */
const I = (d: ReactNode) => <svg viewBox="0 0 24 24" aria-hidden="true">{d}</svg>;
export const StarIcon = () => I(<path d="M12 2.8l2.8 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17l-5.6 3 1.1-6.2L2.9 9.4l6.3-.9z" fill="#ffc533" stroke="#d99a00" strokeWidth="1.2" strokeLinejoin="round" />);
const HomeIcon = () => I(<path d="M3.5 11 12 4l8.5 7v9h-6v-6h-5v6h-6z" fill="currentColor" />);
const PlayIcon = () => I(<><rect x="2.5" y="6" width="19" height="12" rx="6" fill="currentColor" /><path d="M7 10v4M5 12h4" stroke="var(--cs-bg)" strokeWidth="2" strokeLinecap="round" /><circle cx="16" cy="11" r="1.3" fill="var(--cs-bg)" /><circle cx="18" cy="13.5" r="1.3" fill="var(--cs-bg)" /></>);
const AlbumIcon = () => I(<><rect x="4" y="3" width="16" height="18" rx="3" fill="currentColor" /><path d="M12 8.2l1.4 2.8 3 .4-2.2 2.1.5 3-2.7-1.4-2.7 1.4.5-3-2.2-2.1 3-.4z" fill="var(--cs-bg)" /></>);
const BoardIcon = () => I(<><path d="M4 5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-9l-5 4v-4H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="currentColor" /><circle cx="8" cy="11" r="1.4" fill="var(--cs-bg)" /><circle cx="12" cy="11" r="1.4" fill="var(--cs-bg)" /><circle cx="16" cy="11" r="1.4" fill="var(--cs-bg)" /></>);
const CalmIcon = () => I(<><circle cx="12" cy="10" r="7" fill="currentColor" /><path d="M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M9 9.5q3 3 6 0" stroke="var(--cs-bg)" strokeWidth="1.6" fill="none" strokeLinecap="round" /></>);
const SunIcon = () => I(<><circle cx="12" cy="12" r="5" fill="#ffc533" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" stroke="#ffc533" strokeWidth="2" strokeLinecap="round" /></>);
const MoonIcon = () => I(<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" fill="currentColor" />);
const CheckIcon = () => I(<path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />);
const SpeakIcon = () => I(<><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" /><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>);
