import type { ReactNode } from 'react';
import type { GameManifest } from '@aprumo/protocol';
import { Badge, Card } from '@aprumo/ui';
import { GAMES, SUPPORT_RESOURCES } from '../../game-host/registry';
import { ArtListener, ArtMatch, ArtSchedule, ArtTokens, ArtTurns } from '../public/Landing';

const ART: Record<string, ReactNode> = {
  'encontre-o-igual': <ArtMatch />,
  'escolha-pela-instrucao': <ArtListener />,
  'minha-vez-sua-vez': <ArtTurns />,
  'quadro-de-fichas': <ArtTokens />,
  'agenda-visual': <ArtSchedule />,
};
const REPERTOIRE: Record<string, string> = { matching: 'pareamento', listener: 'ouvinte', tact: 'tato', social: 'social', play: 'brincar' };
const PLAY: Record<string, string> = { constructive: 'construtivo', functional: 'funcional', reciprocal: 'recíproco / turnos' };
const PURPOSE: Record<string, string> = { teaching: 'ensino', probe: 'sonda', reinforcer: 'reforçador', regulation: 'regulação', support: 'apoio' };
const months = (m: number) => (m < 24 ? `${m} m` : `${Math.floor(m / 12)} a`);

function ResourceCard({ m }: { m: GameManifest }) {
  const c = m.clinical;
  return (
    <Card as="article" bodyClassName="ap-stack">
      <div style={{ margin: '-1.25rem -1.25rem 0', aspectRatio: '16 / 8', overflow: 'hidden', borderRadius: '16px 16px 0 0' }} aria-hidden="true">{ART[m.appId]}</div>
      <div className="ap-row" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 'var(--ap-text-lg)' }}>{m.name}</h2>
        <span className="ap-xs ap-muted">v{m.version}</span>
      </div>
      <p className="ap-small ap-muted">{m.summary}</p>
      <div className="ap-row" style={{ gap: '0.35rem' }}>
        {c.purposes.map((p) => <Badge key={p}>{PURPOSE[p] ?? p}</Badge>)}
        {c.repertoires.map((r) => <Badge key={r} tone="info">{REPERTOIRE[r] ?? r}</Badge>)}
      </div>
      <dl className="ap-xs" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.3rem 0.8rem', margin: 0 }}>
        {m.kind === 'game' && (<>
          <dt className="ap-muted">Unidade</dt><dd style={{ margin: 0 }}>{c.trialUnit}</dd>
          <dt className="ap-muted">Resposta correta</dt><dd style={{ margin: 0 }}>{c.correctResponse}</dd>
          <dt className="ap-muted">Pontuação</dt><dd style={{ margin: 0 }}>{c.autoScoring.length ? `automática (${c.autoScoring.map((r) => REPERTOIRE[r] ?? r).join(', ')})` : '—'}{c.therapistScoring.length ? ` · pelo profissional (${c.therapistScoring.map((r) => REPERTOIRE[r] ?? r).join(', ')})` : ''}</dd>
          <dt className="ap-muted">Nível de brincar</dt><dd style={{ margin: 0 }}>{PLAY[c.playLevel] ?? c.playLevel}</dd>
        </>)}
        <dt className="ap-muted">Modelos</dt><dd style={{ margin: 0 }}>ABA: {c.models.ABA === 'not-indicated' ? 'não indicado' : c.models.ABA} · Denver: {c.models.DENVER === 'not-indicated' ? 'não indicado' : c.models.DENVER}</dd>
        <dt className="ap-muted">Idade</dt><dd style={{ margin: 0 }}>{months(c.ageRangeMonths[0])} a {months(c.ageRangeMonths[1])}{c.requiresAdult ? ' · sempre com adulto' : ''}</dd>
        <dt className="ap-muted">Pré-requisitos</dt><dd style={{ margin: 0 }}>{c.prerequisites.join(', ').replaceAll('-', ' ')}</dd>
        <dt className="ap-muted">Sensorial</dt><dd style={{ margin: 0 }}>sem flashes · movimento {c.sensory.motionReducible ? 'ajustável' : 'fixo'} · som {c.sensory.sound === 'adjustable' ? 'ajustável' : c.sensory.sound}</dd>
      </dl>
    </Card>
  );
}

export default function Library() {
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Recursos</h1>
          <p>Encontre o recurso pelo que ele ensina. Cada um declara um manifesto clínico; desempenho em jogo nunca é teste, QI ou diagnóstico.</p>
        </div>
      </div>
      <h2 style={{ fontSize: 'var(--ap-text-xl)' }}>Jogos de ensino</h2>
      <div className="grid-3">{Object.values(GAMES).map((g) => <ResourceCard key={g.manifest.appId} m={g.manifest} />)}</div>
      <h2 style={{ fontSize: 'var(--ap-text-xl)' }}>Recursos de apoio</h2>
      <div className="grid-3">{SUPPORT_RESOURCES.map((m) => <ResourceCard key={m.appId} m={m} />)}</div>
    </>
  );
}
