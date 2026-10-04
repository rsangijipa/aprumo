import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { conservativeDualCriterion, generalizationIndex, median, mean } from '@aprumo/clinical-core';
import { StimulusArt } from '@aprumo/stimuli';
import { Card, PhaseBadge, TargetChart, type CdcOverlay } from '@aprumo/ui';
import { db, summariesFor, useStore } from '../../data/store';

export default function CaseData() {
  const { caseId = '' } = useParams();
  const c = db.caseById(caseId)!;
  return c.model === 'ABA' ? <AbaData caseId={caseId} /> : <DenverData caseId={caseId} />;
}

function AbaData({ caseId }: { caseId: string }) {
  const st = useStore((s) => s);
  const targets = st.targets.filter((t) => t.caseId === caseId);
  const [selected, setSelected] = useState(targets[0]?.id ?? '');
  const [showCdc, setShowCdc] = useState(false);
  const t = targets.find((x) => x.id === selected)!;
  const p = db.programOf(t);
  const summaries = summariesFor(st.facts, t.id);
  const markers = st.timeline.filter((e) => e.caseId === caseId && e.kind === 'context').map((e) => ({ at: e.at, label: e.title }));

  const cdc: CdcOverlay | null = useMemo(() => {
    if (!showCdc) return null;
    const teaching = summaries.filter((s) => !s.probe);
    const phases = [...new Set(teaching.map((s) => s.phase))];
    if (phases.length < 2) return null;
    const a = teaching.filter((s) => s.phase === phases[phases.length - 2]);
    const b = teaching.filter((s) => s.phase === phases[phases.length - 1]);
    const r = conservativeDualCriterion(a.map((s) => s.pctIndependent ?? 0), b.map((s) => s.pctIndependent ?? 0));
    if (!r.applicable) return null;
    return {
      startIndex: summaries.indexOf(b[0]!),
      meanLine: r.meanLine,
      trendLine: r.trendLine,
      systematic: r.systematic,
      label: `${r.systematic ? 'mudança sistemática' : 'sem evidência de mudança sistemática'} (${r.pointsBeyond}/${r.n} pontos; necessário ${r.required})`,
    };
  }, [showCdc, summaries]);

  const cdcNote = useMemo(() => {
    const teaching = summaries.filter((s) => !s.probe);
    const phases = [...new Set(teaching.map((s) => s.phase))];
    if (phases.length < 2) return 'Requer duas fases adjacentes.';
    const a = teaching.filter((s) => s.phase === phases[phases.length - 2]).length;
    const b = teaching.filter((s) => s.phase === phases[phases.length - 1]).length;
    return a < 5 || b < 5 ? `Dados insuficientes para o método (fases com ${a} e ${b} pontos; mínimo 5).` : null;
  }, [summaries]);

  const last = summaries.filter((s) => !s.probe).at(-1);
  const inPhase = summaries.filter((s) => s.phase === t.phase && !s.probe).length;
  const latencies = summaries.map((s) => s.medianLatencyMs).filter((x): x is number => x != null);
  const gi = generalizationIndex(summaries, t.teachingChannel);
  const recent = st.facts.filter((f) => f.targetId === t.id && f.selectedPosition != null).slice(-20);
  const positionShare = [0, 1, 2].map((pos) => (recent.length ? recent.filter((f) => f.selectedPosition === pos).length / recent.length : 0));

  return (
    <div className="grid-side">
      <Card title="Alvos">
        <div className="ap-stack" style={{ gap: '0.25rem', margin: '-0.5rem' }}>
          {targets.map((x) => (
            <button key={x.id} className="target-pick" aria-current={x.id === selected} onClick={() => setSelected(x.id)}>
              <span className="target-pick__thumb"><StimulusArt art={x.art} label={x.name} /></span>
              <span style={{ minWidth: 0 }}>
                <span className="ap-small" style={{ fontWeight: 700, display: 'block' }}>{x.name}</span>
                <span className="ap-xs ap-muted">{db.programOf(x).name}</span>
              </span>
              <PhaseBadge phase={x.phase} />
            </button>
          ))}
        </div>
      </Card>

      <div className="pro-page">
        <Card
          title={<>{p.name} — {t.name}</>}
          actions={
            <label className="ap-row ap-small" style={{ gap: '0.4rem', cursor: 'pointer' }} title={cdcNote ?? undefined}>
              <input type="checkbox" checked={showCdc} disabled={!!cdcNote} onChange={(e) => setShowCdc(e.target.checked)} />
              Análise visual assistida (CDC)
            </label>
          }
        >
          <TargetChart
            title={`Percentual de respostas independentes — ${t.name}`}
            points={summaries.map((s) => ({ sessionAt: s.sessionAt, phase: s.phase, pctIndependent: s.pctIndependent, pctPrompted: s.pctPrompted, opportunities: s.opportunities, channel: s.channel, probe: s.probe }))}
            criterionPct={p.masteryPct}
            markers={markers}
            cdc={cdc}
          />
          {cdcNote && <p className="ap-xs ap-muted" style={{ marginTop: '0.5rem' }}>CDC: {cdcNote}</p>}
          {cdc && (
            <p className="ap-xs ap-muted" style={{ marginTop: '0.5rem' }}>
              Critério duplo conservador (Fisher, Kelley e Lomas, 2003): média e tendência da fase anterior, deslocadas 0,25 DP, projetadas sobre a fase atual;
              teste binomial sobre os pontos acima de ambas. É apoio à análise visual, não substitui a decisão do supervisor.
            </p>
          )}
        </Card>

        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <Card><div className="stat"><span className="stat__value">{last?.pctIndependent != null ? `${Math.round(last.pctIndependent)}%` : '—'}</span><span className="stat__label">Independente na última sessão (n = {last?.opportunities ?? 0})</span></div></Card>
          <Card><div className="stat"><span className="stat__value">{inPhase}</span><span className="stat__label">Sessões na fase atual</span></div></Card>
          <Card><div className="stat"><span className="stat__value">{latencies.length ? `${(median(latencies) / 1000).toFixed(1)} s` : '—'}</span><span className="stat__label">Latência mediana (acertos)</span></div></Card>
          <Card><div className="stat"><span className="stat__value">{last?.meanPromptLevel != null ? last.meanPromptLevel.toFixed(2) : '—'}</span><span className="stat__label">Nível médio de dica (0 = indep., 1 = máx.)</span></div></Card>
          <Card><div className="stat"><span className="stat__value">{gi != null ? gi.toFixed(2) : '—'}</span><span className="stat__label">Índice de generalização {gi == null && '(requer ≥ 2 sondas fora do canal)'}</span></div></Card>
        </div>

        {recent.length >= 10 && (
          <Card title="Distribuição de escolhas por posição (últimas tentativas de seleção)">
            <div className="ap-row" style={{ gap: '1.25rem', alignItems: 'flex-end' }}>
              {positionShare.map((v, i) => (
                <div key={i} style={{ display: 'grid', justifyItems: 'center', gap: 6 }}>
                  <div style={{ width: 56, height: 110, background: 'var(--ap-surface-sunken)', borderRadius: 8, display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                    <div style={{ width: '100%', height: `${v * 100}%`, background: v >= 0.6 ? 'var(--ap-warning)' : 'var(--ap-sage-500)' }} />
                  </div>
                  <span className="ap-xs ap-tabular">{Math.round(v * 100)}%</span>
                  <span className="ap-xs ap-muted">posição {i + 1}</span>
                </div>
              ))}
              <p className="ap-xs ap-muted" style={{ maxWidth: 300 }}>
                Em tarefas de seleção, a posição do alvo é contrabalanceada. Concentração ≥ 60% numa posição sugere controle por posição (regra R8). n = {recent.length}.
              </p>
            </div>
          </Card>
        )}

        <BehaviorCard caseId={caseId} />
      </div>
    </div>
  );
}

function BehaviorCard({ caseId }: { caseId: string }) {
  const st = useStore((s) => s);
  const defs = db.behaviorDefinitions.filter((d) => d.caseId === caseId);
  const sessions = st.sessions.filter((s) => s.caseId === caseId).sort((a, b) => a.startedAt.localeCompare(b.startedAt)).slice(-16);
  if (!defs.length) return null;
  return (
    <Card title="Comportamento-problema · frequência por sessão">
      {defs.map((d) => {
        const values = sessions.map((s) => st.behaviorEvents.filter((e) => e.sessionId === s.id && e.definitionId === d.id).length);
        const max = Math.max(4, ...values);
        const avg = mean(values.slice(0, -1));
        return (
          <div key={d.id} className="ap-stack" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
            <div className="ap-row" style={{ justifyContent: 'space-between' }}>
              <strong className="ap-small">{d.name}{d.risk && <span className="ap-badge ap-badge--danger" style={{ marginLeft: 8 }}>risco</span>}</strong>
              <span className="ap-xs ap-muted">{d.topography}</span>
            </div>
            <div className="ap-row" style={{ alignItems: 'flex-end', gap: 4, height: 80 }} role="img" aria-label={`${d.name}: ${values.join(', ')} ocorrências nas últimas ${values.length} sessões`}>
              {values.map((v, i) => (
                <div key={i} title={`${new Date(sessions[i]!.startedAt).toLocaleDateString('pt-BR')}: ${v}`} style={{ flex: 1, height: `${(v / max) * 100}%`, minHeight: 2, background: i === values.length - 1 && v > avg * 2 ? 'var(--ap-danger)' : 'var(--ap-sage-300)', borderRadius: 3 }} />
              ))}
            </div>
            <span className="ap-xs ap-muted">Média das sessões anteriores: {Number.isNaN(avg) ? '—' : avg.toFixed(1)} · registro descritivo; a função do comportamento é hipótese da equipe, nunca inferida automaticamente.</span>
          </div>
        );
      })}
    </Card>
  );
}

function DenverData({ caseId }: { caseId: string }) {
  const objectives = db.denverObjectives.filter((o) => o.caseId === caseId);
  return (
    <div className="grid-2">
      {objectives.map((o) => (
        <Card key={o.id} title={`${o.domain} · nível ${o.level}`}>
          <p className="ap-small ap-muted" style={{ marginBottom: '1rem' }}>{o.description}</p>
          {o.steps.filter((s) => s.proportions.length).map((s) => (
            <div key={s.id} style={{ marginBottom: '1rem' }}>
              <div className="ap-row" style={{ justifyContent: 'space-between' }}>
                <span className="ap-small" style={{ fontWeight: 650 }}>{s.description}</span>
                <span className="ap-xs ap-muted">{{ mastered: 'dominado', acquisition: 'em aquisição', not_started: '—' }[s.status]}</span>
              </div>
              <div className="ap-row" style={{ alignItems: 'flex-end', gap: 6, height: 64, marginTop: 6 }} role="img" aria-label={`Proporção de intervalos com desempenho: ${s.proportions.map((p) => Math.round(p * 100) + '%').join(', ')}`}>
                {s.proportions.map((p, i) => (
                  <div key={i} style={{ flex: 1, height: `${p * 100}%`, minHeight: 2, background: 'var(--ap-model-denver)', opacity: 0.35 + (i / s.proportions.length) * 0.65, borderRadius: 3 }} />
                ))}
              </div>
            </div>
          ))}
          <p className="ap-xs ap-muted">Unidade própria do modelo: proporção de intervalos com desempenho por passo. Nunca convertida em percentual de tentativas.</p>
        </Card>
      ))}
    </div>
  );
}
