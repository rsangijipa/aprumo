import React from 'react';
import type { PretendSessionMetrics, TeachingEpisode } from '../types/pretend';
import { X, Download, Activity, Heart, Smartphone, Wand2 } from 'lucide-react';

interface TherapistDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: PretendSessionMetrics;
  episodes: TeachingEpisode[];
  durationSeconds: number;
}

export const TherapistDashboard: React.FC<TherapistDashboardProps> = ({
  isOpen,
  onClose,
  metrics,
  episodes,
  durationSeconds,
}) => {
  if (!isOpen) return null;

  const total = metrics.totalActions;
  const realToyPct = total > 0 ? ((metrics.realToyActionsCount / total) * 100).toFixed(0) : '0';
  const screenPct = total > 0 ? ((metrics.screenActionsCount / total) * 100).toFixed(0) : '0';

  const avgSequence =
    episodes.length > 0
      ? (episodes.reduce((acc, e) => acc + e.sequenceLength, 0) / episodes.length).toFixed(1)
      : '1.0';

  const exportCSV = () => {
    const headers = [
      'episodeId',
      'timestamp',
      'character',
      'action',
      'item',
      'zone',
      'isSubstitution',
      'location',
      'promptLevel',
      'sequenceLength',
    ];
    const rows = episodes.map((e) => [
      e.episodeId,
      new Date(e.timestamp).toISOString(),
      e.character,
      `"${e.action}"`,
      e.item,
      e.zone,
      e.isSubstitution ? '1' : '0',
      e.location,
      e.promptLevel,
      e.sequenceLength,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `esdm_den04_lanche_urso_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-window">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-amber-600" />
            <h3 className="modal-title">Painel Clínico ESDM: Brincar Simbólico & Formato Espelho</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          {/* KPI Summary Cards */}
          <div className="kpi-grid">
            <div className="kpi-card highlight-card">
              <span className="kpi-label">No Brinquedo Real</span>
              <span className="kpi-val text-rose-600">{realToyPct}%</span>
              <span className="kpi-sub">{metrics.realToyActionsCount} ações no urso físico</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Na Tela</span>
              <span className="kpi-val text-sky-600">{screenPct}%</span>
              <span className="kpi-sub">{metrics.screenActionsCount} ações digitais</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Sequência Média</span>
              <span className="kpi-val text-amber-600">{avgSequence} ações</span>
              <span className="kpi-sub">Comprimento de encadeamento</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Substituições Simbólicas</span>
              <span className="kpi-val text-purple-600">{metrics.substitutionsCount}</span>
              <span className="kpi-sub">Bloco como comida</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Duração da Rotina</span>
              <span className="kpi-val text-indigo-600">{Math.floor(durationSeconds / 60)}m {durationSeconds % 60}s</span>
              <span className="kpi-sub">Tempo compartilhado</span>
            </div>
          </div>

          {/* Transfer to Real Toy Metric Banner */}
          <div className="modality-box">
            <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              Transferência para o Mundo Real (Meta Central ESDM):
            </h4>
            <p className="text-xs text-slate-600 mb-3">
              Acompanhamento de transição: a criança deve migrar progressivamente da tela para o brinquedo de pelúcia físico.
            </p>
            <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex">
              <div
                className="bg-rose-500 h-full"
                style={{ width: `${realToyPct}%` }}
                title={`Brinquedo Real: ${metrics.realToyActionsCount}`}
              />
              <div
                className="bg-sky-400 h-full"
                style={{ width: `${screenPct}%` }}
                title={`Tela: ${metrics.screenActionsCount}`}
              />
            </div>
            <div className="flex justify-between text-xs font-bold mt-1">
              <span className="text-rose-700 flex items-center gap-1">
                <Heart className="w-3 h-3 inline" />
                Brinquedo Físico: {metrics.realToyActionsCount} ({realToyPct}%)
              </span>
              <span className="text-sky-700 flex items-center gap-1">
                <Smartphone className="w-3 h-3 inline" />
                Tela Digital: {metrics.screenActionsCount} ({screenPct}%)
              </span>
            </div>
          </div>

          {/* Episode Log Table */}
          <div className="trial-table-wrapper">
            <table className="trial-table">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Ação</th>
                  <th>Item</th>
                  <th>Local da Ação</th>
                  <th>Apoio</th>
                </tr>
              </thead>
              <tbody>
                {episodes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-500 py-6">
                      Nenhuma ação registrada nesta sessão. Dê comidinha ou água para o urso!
                    </td>
                  </tr>
                ) : (
                  episodes.map((ep) => (
                    <tr key={ep.episodeId}>
                      <td>{new Date(ep.timestamp).toLocaleTimeString()}</td>
                      <td>
                        <span className="badge-module">{ep.action}</span>
                        {ep.isSubstitution && (
                          <span className="ml-1 text-xs text-purple-700 font-bold">
                            <Wand2 className="w-3 h-3 inline" /> Simbólico
                          </span>
                        )}
                      </td>
                      <td>{ep.item}</td>
                      <td>
                        <strong className={ep.location === 'brinquedo-real' ? 'text-rose-600' : 'text-sky-700'}>
                          {ep.location === 'brinquedo-real' ? '🧸 Urso Físico' : '📱 Tela'}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={
                            ep.promptLevel === 'independente'
                              ? 'status-success'
                              : ep.promptLevel === 'parcial'
                              ? 'status-help'
                              : 'status-rehearsal'
                          }
                        >
                          {ep.promptLevel}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="export-btn"
              onClick={exportCSV}
              disabled={episodes.length === 0}
            >
              <Download className="w-4 h-4 inline mr-2" />
              Exportar CSV de Brincar Simbólico ESDM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
