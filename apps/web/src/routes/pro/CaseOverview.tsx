import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { DEFAULT_MASTERY, evaluateMastery } from '@aprumo/clinical-core';
import { StimulusArt } from '@aprumo/stimuli';
import { Card, PhaseBadge } from '@aprumo/ui';
import { alertsForCase, db, summariesFor, useStore } from '../../data/store';
import { AlertList } from './shared';

export default function CaseOverview() {
  const { caseId = '' } = useParams();
  const c = db.caseById(caseId)!;
  const st = useStore((s) => s);
  const alerts = useMemo(() => alertsForCase(st, caseId), [st, caseId]);
  const targets = st.targets.filter((t) => t.caseId === caseId);
  const child = db.childOf(c);
  const policy = db.screenPolicy(child.birthDate);
  const todayScreen = Math.round(
    st.sessions.filter((s) => s.caseId === caseId && s.startedAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).reduce((a, s) => a + s.screenSeconds, 0) / 60,
  );
  const timeline = st.timeline.filter((t) => t.caseId === caseId).sort((a, b) => b.at.localeCompare(a.at));
  const reinforcers = db.reinforcers.filter((r) => r.caseId === caseId).sort((a, b) => a.rank - b.rank);

  return (
    <div className="grid-main">
      <div className="pro-page pro-page--top">
        <Card title="Decisões e alertas" bodyClassName="pro-card-flush">
          <AlertList alerts={alerts} />
        </Card>

        {c.model === 'ABA' ? (
          <Card title="Alvos ativos" actions={<Link className="ap-small" to="dados">Ver gráficos</Link>}>
            {targets.map((t) => {
              const p = db.programOf(t);
              const s = summariesFor(st.facts, t.id);
              const m = evaluateMastery(s, { ...DEFAULT_MASTERY, minIndependentPct: p.masteryPct });
              const last = s.filter((x) => !x.probe).at(-1);
              return (
                <div className="target-row" key={t.id}>
                  <div className="target-thumb"><StimulusArt art={t.art} label={t.name} /></div>
                  <div className="pro-min0">
                    <div className="pro-strong">{t.name}</div>
                    <div className="ap-xs ap-muted">{p.name} · {t.teachingChannel === 'digital' ? 'ensinado em jogo' : t.teachingChannel === 'natural' ? 'ensino natural' : 'mesa'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="ap-small ap-tabular" style={{ fontWeight: 700 }}>
                      {last?.pctIndependent != null ? `${Math.round(last.pctIndependent)}%` : '—'}
                      <span className="ap-xs ap-muted" style={{ fontWeight: 500 }}> indep. (n={last?.opportunities ?? 0})</span>
                    </div>
                    {t.phase === 'acquisition' && (
                      <div className="ap-row" style={{ gap: '0.4rem', justifyContent: 'flex-end' }} title={m.explanation}>
                        <div className="progress" aria-hidden="true"><span style={{ width: `${(Math.min(m.qualifyingSessions, m.sessionsRequired) / m.sessionsRequired) * 100}%` }} /></div>
                        <span className="ap-xs ap-muted ap-tabular">{Math.min(m.qualifyingSessions, m.sessionsRequired)}/{m.sessionsRequired}</span>
                      </div>
                    )}
                  </div>
                  <PhaseBadge phase={t.phase} />
                </div>
              );
            })}
          </Card>
        ) : (
          <Card title="Objetivos do ciclo trimestral" actions={<Link className="ap-small" to="plano">Ver plano</Link>}>
            <div className="ap-stack">
              {db.denverObjectives.filter((o) => o.caseId === caseId).map((o) => (
                <div key={o.id}>
                  <div className="ap-row" style={{ justifyContent: 'space-between' }}>
                    <strong className="ap-small">{o.domain} · nível {o.level}</strong>
                    <span className="ap-xs ap-muted">{o.steps.filter((s) => s.status === 'mastered').length}/{o.steps.length} passos dominados</span>
                  </div>
                  <p className="ap-small ap-muted">{o.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div className="pro-page pro-page--top">
        <Card title="Tempo de tela hoje">
          {policy.childPortalAllowed ? (
            <div className="ap-stack" style={{ gap: '0.5rem' }}>
              <div className="ap-row" style={{ justifyContent: 'space-between' }}>
                <span className="stat__value" style={{ fontSize: 'var(--ap-text-xl)' }}>{todayScreen} <span className="ap-small ap-muted">de {policy.dailyLimitMinutes} min</span></span>
                <span className="ap-xs ap-muted">blocos de até {policy.maxBlockMinutes} min</span>
              </div>
              <div className="progress progress--full"><span style={{ width: `${Math.min(100, (todayScreen / policy.dailyLimitMinutes) * 100)}%` }} /></div>
              <p className="ap-xs ap-muted">Limite padrão pela faixa etária (SBP, 2024). Sempre com adulto presente.</p>
            </div>
          ) : (
            <p className="ap-small">Abaixo de 24 meses o portal infantil não é oferecido. O Aprumo é usado pelo adulto para planejar, registrar e orientar a família.</p>
          )}
        </Card>

        <Card title="Reforçadores" actions={<span className="ap-xs ap-muted">avaliação de {reinforcers[0] ? new Date(reinforcers[0].assessedAt).toLocaleDateString('pt-BR') : '—'}</span>}>
          <ol className="ap-stack" style={{ margin: 0, paddingLeft: '1.2rem', gap: '0.4rem' }}>
            {reinforcers.map((r) => (
              <li key={r.id} className="ap-small"><strong>{r.name}</strong> <span className="ap-xs ap-muted">· {r.category}</span></li>
            ))}
          </ol>
          {c.restrictions.length > 0 && <p className="ap-xs" style={{ marginTop: '0.75rem', color: 'var(--ap-warning)' }}>Restrições: {c.restrictions.join('; ')}</p>}
        </Card>

        <Card title="Perfil sensorial e interesses">
          <dl className="ap-small pro-dl">
            <dt className="ap-muted">Movimento</dt><dd>{{ full: 'completo', reduced: 'reduzido', static: 'estático' }[c.adaptation.motion]}</dd>
            <dt className="ap-muted">Som</dt><dd>{{ off: 'desligado', low: 'baixo', normal: 'normal' }[c.adaptation.sound]}</dd>
            <dt className="ap-muted">Retorno de acerto</dt><dd>{{ none: 'nenhum', subtle: 'discreto', festive: 'festivo' }[c.adaptation.feedback]}</dd>
            <dt className="ap-muted">Opções por tela</dt><dd>até {c.adaptation.maxChoices}</dd>
            <dt className="ap-muted">Interesses</dt><dd>{c.interests.join(', ')}</dd>
          </dl>
        </Card>

        <Card title="Linha do tempo">
          <ul className="timeline">
            {timeline.slice(0, 8).map((t) => (
              <li key={t.id}>
                <div>
                  <div className="ap-small pro-strong">{t.title}</div>
                  {t.detail && <div className="ap-xs ap-muted">{t.detail}</div>}
                  <div className="ap-xs ap-muted">{new Date(t.at).toLocaleDateString('pt-BR')}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
