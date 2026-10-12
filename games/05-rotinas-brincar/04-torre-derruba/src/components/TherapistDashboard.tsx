import React from 'react';
import type { TowerSessionMetrics, TeachingEpisode } from '../types/tower';
import { X, Download, Activity, ArrowLeftRight, Layers, Sparkles } from 'lucide-react';

interface TherapistDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: TowerSessionMetrics;
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

  const durationMin = Math.max(0.1, durationSeconds / 60);
  const requestsCount = episodes.filter((e) => e.type === 'pedido-bloco').length;
  const requestsPerMin = (requestsCount / durationMin).toFixed(1);

  const imitationCount = episodes.filter((e) => e.type === 'imitacao').length;
  const countdownCount = episodes.filter((e) => e.type === 'contagem').length;

  const independentCount = episodes.filter((e) => e.promptLevel === 'independente').length;
  const indepPct = episodes.length > 0 ? ((independentCount / episodes.length) * 100).toFixed(0) : '0';

  const exportCSV = () => {
    const headers = ['episodeId', 'timestamp', 'type', 'promptLevel', 'details'];
    const rows = episodes.map((e) => [
      e.episodeId,
      new Date(e.timestamp).toISOString(),
      e.type,
      e.promptLevel,
      `"${e.details.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `esdm_den02_torre_${Date.now()}.csv`);
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
            <h3 className="modal-title">Painel Clínico ESDM: Torre de Blocos & Alternância de Turnos</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          {/* KPI Summary Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-label">Trocas de Turno</span>
              <span className="kpi-val text-blue-600">{metrics.turnSwitches}</span>
              <span className="kpi-sub">Adulto &harr; Criança</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Blocos da Criança</span>
              <span className="kpi-val text-emerald-600">{metrics.blocksPlacedChild}</span>
              <span className="kpi-sub">de {metrics.blocksPlacedChild + metrics.blocksPlacedAdult} na torre</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Altura Máxima</span>
              <span className="kpi-val text-amber-600">{metrics.maxHeight} blocos</span>
              <span className="kpi-sub">Assistência nível {metrics.stabilityAssistLevel}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Pedidos ("Mais") / min</span>
              <span className="kpi-val text-purple-600">{requestsPerMin}</span>
              <span className="kpi-sub">{requestsCount} pedidos totais</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Independência (+)</span>
              <span className="kpi-val text-teal-600">{indepPct}%</span>
              <span className="kpi-sub">{independentCount}/{episodes.length} sem ajuda</span>
            </div>
          </div>

          {/* ESDM Specific Behavioral Analysis */}
          <div className="modality-box">
            <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Objetivos de Aprendizagem ESDM (Rotina com Objeto):
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-xs font-bold text-slate-500 block mb-1">
                  <ArrowLeftRight className="w-3.5 h-3.5 inline mr-1 text-blue-600" />
                  Turn-Taking (Turnos)
                </span>
                <span className="text-lg font-bold text-slate-800">{metrics.turnSwitches} trocas</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-xs font-bold text-slate-500 block mb-1">
                  <Layers className="w-3.5 h-3.5 inline mr-1 text-indigo-600" />
                  Imitação de Ações
                </span>
                <span className="text-lg font-bold text-slate-800">{imitationCount} imitações</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-xs font-bold text-slate-500 block mb-1">
                  <Sparkles className="w-3.5 h-3.5 inline mr-1 text-rose-600" />
                  Antecipação Contagem
                </span>
                <span className="text-lg font-bold text-slate-800">{countdownCount} clímax</span>
              </div>
            </div>
          </div>

          {/* Episode Log Table */}
          <div className="trial-table-wrapper">
            <table className="trial-table">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Comportamento</th>
                  <th>Nível de Apoio</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {episodes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-slate-500 py-6">
                      Nenhum episódio registrado ainda nesta sessão.
                    </td>
                  </tr>
                ) : (
                  episodes.map((ep) => (
                    <tr key={ep.episodeId}>
                      <td>{new Date(ep.timestamp).toLocaleTimeString()}</td>
                      <td>
                        <span className="badge-module">{ep.type}</span>
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
                      <td className="text-slate-700">{ep.details}</td>
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
              Exportar CSV da Torre ESDM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
