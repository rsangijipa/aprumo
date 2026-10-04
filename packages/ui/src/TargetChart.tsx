import { useId, useMemo, useState, type ReactNode } from 'react';
import { PHASE_LABEL } from './components';

export interface ChartPoint {
  sessionAt: string;
  phase: string;
  pctIndependent: number | null;
  pctPrompted: number | null;
  opportunities: number;
  channel: string;
  probe?: boolean;
}

export interface ContextMarker {
  at: string;
  label: string;
}

export interface CdcOverlay {
  /** Índice do primeiro ponto da fase B dentro de `points`. */
  startIndex: number;
  meanLine: number[];
  trendLine: number[];
  systematic: boolean;
  label: string;
}

const W = 760;
const H = 300;
const M = { top: 22, right: 18, bottom: 40, left: 44 };
const iw = W - M.left - M.right;
const ih = H - M.top - M.bottom;
const CHANNEL_LABEL: Record<string, string> = { table: 'Mesa', digital: 'Jogo', natural: 'Natural', home: 'Casa' };

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

/**
 * Gráfico de alvo: % independente (linha principal) e % com dica (série separada),
 * linhas de mudança de fase, critério, marcadores de contexto e CDC sob demanda.
 * Sempre acompanhado de tabela alternativa de dados.
 */
export function TargetChart({
  title,
  points,
  criterionPct,
  markers = [],
  cdc,
}: {
  title: string;
  points: ChartPoint[];
  criterionPct?: number;
  markers?: ContextMarker[];
  cdc?: CdcOverlay | null;
}) {
  const id = useId();
  const [showTable, setShowTable] = useState(false);
  const n = points.length;
  const x = (i: number) => M.left + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v: number) => M.top + ih - (v / 100) * ih;

  const phaseChanges = useMemo(() => {
    const out: Array<{ i: number; phase: string }> = [];
    points.forEach((p, i) => {
      if (i === 0 || p.phase !== points[i - 1]!.phase) out.push({ i, phase: p.phase });
    });
    return out;
  }, [points]);

  /** Não liga pontos através de uma mudança de fase. */
  const segments = (key: 'pctIndependent' | 'pctPrompted') => {
    const segs: string[] = [];
    let cur = '';
    points.forEach((p, i) => {
      const v = p[key];
      const newPhase = i > 0 && p.phase !== points[i - 1]!.phase;
      if (v == null || newPhase || p.probe) {
        if (cur) segs.push(cur);
        cur = '';
      }
      if (v != null && !p.probe) cur += `${cur ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
    });
    if (cur) segs.push(cur);
    return segs;
  };

  const markerIndex = (at: string) => {
    const t = Date.parse(at);
    let best = -1;
    points.forEach((p, i) => {
      if (Date.parse(p.sessionAt) <= t) best = i;
    });
    return best;
  };

  if (n === 0) {
    return <p style={{ color: 'var(--ap-text-muted)' }}>Ainda não há sessões registradas para este alvo.</p>;
  }

  return (
    <figure style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${id}-t ${id}-d`} style={{ width: '100%', height: 'auto' }}>
        <title id={`${id}-t`}>{title}</title>
        <desc id={`${id}-d`}>
          {`${n} sessões. Última: ${points.at(-1)!.pctIndependent?.toFixed(0) ?? '—'}% independente. A tabela de dados está disponível abaixo.`}
        </desc>

        {/* grade */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={M.left} x2={W - M.right} y1={y(v)} y2={y(v)} stroke="var(--ap-chart-grid)" />
            <text x={M.left - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--ap-text-muted)" className="ap-tabular">
              {v}%
            </text>
          </g>
        ))}

        {/* faixas e linhas de fase */}
        {phaseChanges.map(({ i, phase }, k) => {
          const xs = i === 0 ? M.left : (x(i - 1) + x(i)) / 2;
          return (
            <g key={`${phase}-${i}`}>
              {k > 0 && <line x1={xs} x2={xs} y1={M.top - 6} y2={M.top + ih} stroke="var(--ap-text-subtle)" strokeDasharray="4 4" />}
              <text x={xs + 6} y={M.top - 8} fontSize="11" fontWeight="650" fill={`var(--ap-phase-${phase})`}>
                {PHASE_LABEL[phase] ?? phase}
              </text>
            </g>
          );
        })}

        {/* critério */}
        {criterionPct != null && (
          <g>
            <line x1={M.left} x2={W - M.right} y1={y(criterionPct)} y2={y(criterionPct)} stroke="var(--ap-chart-criterion)" strokeWidth="1.25" strokeDasharray="2 5" />
            <text x={W - M.right} y={y(criterionPct) - 5} textAnchor="end" fontSize="11" fill="var(--ap-chart-criterion)">
              critério {criterionPct}%
            </text>
          </g>
        )}

        {/* marcadores de contexto */}
        {markers.map((m) => {
          const i = markerIndex(m.at);
          if (i < 0) return null;
          return (
            <g key={m.at + m.label}>
              <line x1={x(i)} x2={x(i)} y1={M.top} y2={M.top + ih} stroke="var(--ap-accent)" strokeOpacity="0.5" />
              <circle cx={x(i)} cy={M.top + ih} r="4" fill="var(--ap-accent)" />
              <title>{m.label}</title>
            </g>
          );
        })}

        {/* CDC */}
        {cdc && (
          <g>
            <polyline
              points={cdc.meanLine.map((v, k) => `${x(cdc.startIndex + k)},${y(Math.max(0, Math.min(100, v)))}`).join(' ')}
              fill="none" stroke="var(--ap-info)" strokeWidth="1.25" strokeDasharray="6 3"
            />
            <polyline
              points={cdc.trendLine.map((v, k) => `${x(cdc.startIndex + k)},${y(Math.max(0, Math.min(100, v)))}`).join(' ')}
              fill="none" stroke="var(--ap-info)" strokeWidth="1.25"
            />
          </g>
        )}

        {/* séries */}
        {segments('pctPrompted').map((d) => (
          <path key={`p${d}`} d={d} fill="none" stroke="var(--ap-chart-prompted)" strokeWidth="1.75" strokeDasharray="5 4" />
        ))}
        {segments('pctIndependent').map((d) => (
          <path key={`i${d}`} d={d} fill="none" stroke="var(--ap-chart-independent)" strokeWidth="2.25" />
        ))}

        {points.map((p, i) => (
          <g key={p.sessionAt + i}>
            {p.pctPrompted != null && !p.probe && (
              <rect x={x(i) - 3.5} y={y(p.pctPrompted) - 3.5} width="7" height="7" fill="var(--ap-surface)" stroke="var(--ap-chart-prompted)" strokeWidth="1.5" />
            )}
            {p.pctIndependent != null && (
              p.probe ? (
                <path d={`M${x(i)},${y(p.pctIndependent) - 6}l6,6-6,6-6-6z`} fill="var(--ap-phase-generalization)" />
              ) : p.channel === 'digital' ? (
                <circle cx={x(i)} cy={y(p.pctIndependent)} r="4.5" fill="var(--ap-surface)" stroke="var(--ap-chart-independent)" strokeWidth="2" />
              ) : (
                <circle cx={x(i)} cy={y(p.pctIndependent)} r="4.5" fill="var(--ap-chart-independent)" />
              )
            )}
            <title>{`${fmtDate(p.sessionAt)} · ${CHANNEL_LABEL[p.channel] ?? p.channel} · ${p.pctIndependent?.toFixed(0) ?? '—'}% independente · n = ${p.opportunities}`}</title>
          </g>
        ))}

        {/* eixo x */}
        {points.map((p, i) =>
          n <= 14 || i % Math.ceil(n / 14) === 0 ? (
            <text key={`x${i}`} x={x(i)} y={H - M.bottom + 18} textAnchor="middle" fontSize="10.5" fill="var(--ap-text-muted)" className="ap-tabular">
              {fmtDate(p.sessionAt)}
            </text>
          ) : null,
        )}
      </svg>

      <figcaption style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', fontSize: 'var(--ap-text-xs)', color: 'var(--ap-text-muted)', marginTop: '0.5rem' }}>
        <Legend swatch={<circle cx="7" cy="7" r="4.5" fill="var(--ap-chart-independent)" />}>Independente (mesa)</Legend>
        <Legend swatch={<circle cx="7" cy="7" r="4" fill="none" stroke="var(--ap-chart-independent)" strokeWidth="2" />}>Independente (jogo)</Legend>
        <Legend swatch={<rect x="3.5" y="3.5" width="7" height="7" fill="none" stroke="var(--ap-chart-prompted)" strokeWidth="1.5" />}>Correta com dica</Legend>
        <Legend swatch={<path d="M7,1l6,6-6,6-6-6z" fill="var(--ap-phase-generalization)" />}>Sonda</Legend>
        {cdc && <span style={{ color: 'var(--ap-info)', fontWeight: 600 }}>CDC: {cdc.label}</span>}
        <button type="button" className="ap-btn ap-btn--ghost ap-btn--sm" style={{ marginLeft: 'auto' }} aria-expanded={showTable} onClick={() => setShowTable((s) => !s)}>
          {showTable ? 'Ocultar tabela' : 'Ver tabela de dados'}
        </button>
      </figcaption>

      {showTable && (
        <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
          <table className="ap-table ap-tabular">
            <caption className="ap-visually-hidden">{title} — dados por sessão</caption>
            <thead>
              <tr><th>Data</th><th>Fase</th><th>Canal</th><th>Oportunidades</th><th>% independente</th><th>% com dica</th></tr>
            </thead>
            <tbody>
              {points.map((p, i) => (
                <tr key={i}>
                  <td>{fmtDate(p.sessionAt)}{p.probe ? ' (sonda)' : ''}</td>
                  <td>{PHASE_LABEL[p.phase] ?? p.phase}</td>
                  <td>{CHANNEL_LABEL[p.channel] ?? p.channel}</td>
                  <td>{p.opportunities}</td>
                  <td>{p.pctIndependent?.toFixed(0) ?? '—'}</td>
                  <td>{p.pctPrompted?.toFixed(0) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}

function Legend({ swatch, children }: { swatch: ReactNode; children: ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">{swatch}</svg>
      {children}
    </span>
  );
}
