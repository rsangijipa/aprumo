import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  Badge,
  Button,
  Dialog,
  EmptyState,
  IconClock,
  IconPlay,
  Segmented,
  StatusBadge,
} from '@aprumo/ui';
import { db, useStore } from '../../data/store';
import type { SessionRecord } from '../../data/types';

const SETTING: Record<string, string> = {
  clinic: 'Clínica',
  home: 'Casa',
  school: 'Escola',
  community: 'Comunidade',
  telehealth: 'Teleatendimento',
};

export default function CaseSessions() {
  const { caseId = '' } = useParams();
  const st = useStore((s) => s);
  const [filterSetting, setFilterSetting] = useState<string>('all');
  const [inspectSession, setInspectSession] = useState<SessionRecord | null>(null);

  const sessions = useMemo(() => {
    return st.sessions
      .filter((s) => s.caseId === caseId)
      .filter((s) => filterSetting === 'all' || s.setting === filterSetting)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }, [st.sessions, caseId, filterSetting]);

  return (
    <div className="ap-stack" style={{ gap: '1.25rem' }}>
      <div className="ap-row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 'var(--ap-text-xl)', margin: 0 }}>Histórico de Sessões</h2>
          <p className="ap-small ap-muted" style={{ margin: '0.2rem 0 0 0' }}>
            Registro cronológico das aplicações clínicas, tentativas, notas e tempo de tela.
          </p>
        </div>

        <Segmented
          label="Filtrar por ambiente"
          value={filterSetting}
          onChange={setFilterSetting}
          options={[
            { value: 'all', label: 'Todos os ambientes' },
            { value: 'clinic', label: 'Clínica' },
            { value: 'home', label: 'Casa' },
            { value: 'school', label: 'Escola' },
          ]}
        />
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          icon={<IconClock style={{ width: 44, height: 44, color: 'var(--ap-sage-300)' }} />}
          title="Nenhuma sessão encontrada"
        >
          <p className="ap-muted ap-small">
            Nenhuma sessão registrada com os filtros atuais. Use o botão "Iniciar sessão" no topo para abrir um novo atendimento.
          </p>
        </EmptyState>
      ) : (
        <div className="ap-stack" style={{ gap: '0.85rem' }}>
          {sessions.map((s) => {
            const facts = st.facts.filter((f) => f.sessionId === s.id);
            const targetsWorked = new Set(facts.map((f) => f.targetId));
            const implementer = db.professional(s.implementerId);
            const durationMins = s.endedAt
              ? Math.max(1, Math.round((Date.parse(s.endedAt) - Date.parse(s.startedAt)) / 60000))
              : null;

            return (
              <article key={s.id} className="ap-card" style={{ padding: '1rem 1.25rem' }}>
                <div className="ap-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div className="ap-stack" style={{ gap: '0.3rem' }}>
                    <div className="ap-row" style={{ gap: '0.5rem', alignItems: 'center' }}>
                      <strong style={{ fontSize: 'var(--ap-text-md)' }}>
                        {new Date(s.startedAt).toLocaleDateString('pt-BR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </strong>
                      <span className="ap-small ap-muted">
                        às {new Date(s.startedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <StatusBadge status={s.status} />
                      <Badge>{SETTING[s.setting] ?? s.setting}</Badge>
                    </div>

                    <div className="ap-row ap-small ap-muted" style={{ gap: '1rem' }}>
                      <span>Aplicador: <strong>{implementer?.name ?? 'Profissional'}</strong></span>
                      {durationMins && <span>Duração: <strong>{durationMins} min</strong></span>}
                      <span>Tela: <strong>{Math.round(s.screenSeconds / 60)} min</strong></span>
                      <span>Alvos: <strong>{targetsWorked.size}</strong></span>
                      <span>Tentativas: <strong>{facts.length}</strong></span>
                    </div>
                  </div>

                  <div className="ap-row" style={{ gap: '0.5rem' }}>
                    {s.status === 'active' ? (
                      <Link to={`/app/sessao/${s.id}`} className="ap-btn ap-btn--primary ap-btn--sm">
                        <IconPlay style={{ width: 14 }} /> Continuar sessão
                      </Link>
                    ) : (
                      <Button size="sm" onClick={() => setInspectSession(s)}>
                        Ver detalhes
                      </Button>
                    )}
                  </div>
                </div>

                {s.clinicalNote && (
                  <p
                    className="ap-small"
                    style={{
                      margin: '0.75rem 0 0 0',
                      padding: '0.5rem 0.75rem',
                      background: 'var(--ap-surface-sunken)',
                      borderRadius: 'var(--ap-radius-sm)',
                      borderLeft: '3px solid var(--ap-sage-500)',
                    }}
                  >
                    <strong>Nota clínica:</strong> {s.clinicalNote}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes da Sessão */}
      <Dialog
        open={!!inspectSession}
        onClose={() => setInspectSession(null)}
        title={inspectSession ? `Detalhes da Sessão — ${new Date(inspectSession.startedAt).toLocaleDateString('pt-BR')}` : ''}
      >
        {inspectSession && (
          <div className="ap-stack" style={{ gap: '1rem' }}>
            <div className="review">
              <dt>Data e Hora</dt>
              <dd>{new Date(inspectSession.startedAt).toLocaleString('pt-BR')}</dd>
              <dt>Ambiente</dt>
              <dd>{SETTING[inspectSession.setting]}</dd>
              <dt>Aplicador</dt>
              <dd>{db.professional(inspectSession.implementerId)?.name}</dd>
              <dt>Status</dt>
              <dd><StatusBadge status={inspectSession.status} /></dd>
              <dt>Tempo de Tela</dt>
              <dd>{Math.round(inspectSession.screenSeconds / 60)} minutos</dd>
            </div>

            <div>
              <h3 style={{ fontSize: 'var(--ap-text-md)', margin: '0 0 0.5rem 0' }}>Alvos e Tentativas Registradas</h3>
              <ul className="ap-stack" style={{ listStyle: 'none', margin: 0, padding: 0, gap: '0.5rem' }}>
                {Array.from(new Set(st.facts.filter((f) => f.sessionId === inspectSession.id).map((f) => f.targetId))).map((tid) => {
                  const target = st.targets.find((t) => t.id === tid);
                  const targetFacts = st.facts.filter((f) => f.sessionId === inspectSession.id && f.targetId === tid);
                  const indCount = targetFacts.filter((f) => (f.promptCode === 'IND' || f.promptIntrusiveness === 0) && f.response === 'correct').length;

                  return (
                    <li key={tid} className="ap-card ap-row" style={{ padding: '0.65rem 0.85rem', justifyContent: 'space-between' }}>
                      <div>
                        <strong>{target?.name ?? 'Alvo'}</strong>
                        <div className="ap-xs ap-muted">Fase: {target?.phase}</div>
                      </div>
                      <div className="ap-tabular ap-small">
                        <strong>{indCount}/{targetFacts.length}</strong> independentes ({targetFacts.length > 0 ? Math.round((indCount / targetFacts.length) * 100) : 0}%)
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
