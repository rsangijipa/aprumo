import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useParams } from 'react-router';
import { Button, Dialog, IconPlay, ModelBadge, Segmented } from '@aprumo/ui';
import { actions, db, formatAge, useStore } from '../../data/store';
import type { SessionRecord } from '../../data/types';
import { Avatar } from './shared';

const TABS = [
  ['', 'Visão geral'],
  ['plano', 'Plano'],
  ['dados', 'Dados'],
  ['sessoes', 'Sessões'],
  ['comportamento', 'Comportamento'],
  ['reforcadores', 'Reforçadores'],
  ['perfil', 'Perfil'],
  ['familia', 'Família'],
  ['documentos', 'Documentos'],
] as const;

export default function CaseLayout() {
  const { caseId } = useParams();
  const c = useStore((s) => s.cases.find((x) => x.id === caseId));
  const activeSession = useStore((s) => s.sessions.find((x) => x.caseId === caseId && x.status === 'active'));
  const nav = useNavigate();
  const [starting, setStarting] = useState(false);
  const [setting, setSetting] = useState<SessionRecord['setting']>('clinic');
  const [error, setError] = useState<string | null>(null);

  // Auditoria de leitura: abrir o prontuário gera registro (em produção, RPC audit_read).
  useEffect(() => {
    if (c) console.info('[auditoria] leitura do caso', c.id);
  }, [c?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!c) return <p>Caso não encontrado, ou você não tem vínculo com ele.</p>;
  const child = db.childOf(c);
  const policy = db.screenPolicy(child.birthDate);
  const draft = c.planStatus === 'draft';

  return (
    <>
      <header className="case-header">
        <Avatar child={child} size="lg" />
        <div className="case-header__info">
          <div className="ap-row" style={{ gap: '0.6rem' }}>
            <h1>{child.preferredName}</h1>
            <ModelBadge model={c.model} />
            {draft && <span className="ap-badge ap-badge--warning">plano em rascunho</span>}
          </div>
          <p className="ap-small ap-muted">
            {formatAge(child.birthDate)} · Plano {c.model === 'ABA' ? 'ABA' : 'Denver'} v{c.planVersion}
            {!draft && <>, revisão em {new Date(c.planReviewOn).toLocaleDateString('pt-BR')}</>}
            {!policy.childPortalAllowed && ' · sem ambiente infantil (menos de 24 meses)'}
          </p>
        </div>
        {activeSession ? (
          <Button variant="primary" size="lg" icon={<IconPlay />} onClick={() => nav(`/app/sessao/${activeSession.id}`)}>Continuar sessão</Button>
        ) : (
          <Button variant="primary" size="lg" icon={<IconPlay />} disabled={draft} title={draft ? 'Aprove o plano para iniciar sessões' : undefined} onClick={() => setStarting(true)}>
            Iniciar sessão
          </Button>
        )}
      </header>

      <nav className="case-tabs" aria-label="Seções do caso">
        {TABS.map(([to, label]) => <NavLink key={to} to={to} end={to === ''}>{label}</NavLink>)}
      </nav>

      <Outlet />

      <Dialog
        open={starting}
        onClose={() => setStarting(false)}
        title={`Nova sessão ${c.model === 'ABA' ? 'ABA' : 'Denver'}`}
        description={`Segue o plano vigente (${c.model === 'ABA' ? 'tentativas, oportunidades e comportamento' : 'rotinas de atividade conjunta, com registro por intervalo'}). Funciona sem internet.`}
        footer={
          <>
            <Button onClick={() => setStarting(false)}>Cancelar</Button>
            <Button
              variant="primary"
              icon={<IconPlay />}
              onClick={() => {
                try {
                  const s = actions.startSession(c.id, setting);
                  nav(`/app/sessao/${s.id}`);
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Começar
            </Button>
          </>
        }
      >
        <div className="ap-field">
          <span className="ap-label">Onde a sessão acontece</span>
          <Segmented
            label="Ambiente"
            value={setting}
            onChange={setSetting}
            options={[
              { value: 'clinic', label: 'Clínica' },
              { value: 'home', label: 'Casa' },
              { value: 'school', label: 'Escola' },
              { value: 'community', label: 'Comunidade' },
            ]}
          />
          <span className="ap-hint">O ambiente é usado para diferenciar ensino de generalização nos gráficos.</span>
        </div>
        {error && <p role="alert" className="ap-error">{error}</p>}
      </Dialog>
    </>
  );
}
