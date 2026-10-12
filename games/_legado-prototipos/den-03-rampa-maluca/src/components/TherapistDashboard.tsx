import React from 'react';
import type { RampSessionMetrics, TeachingEpisode } from '../types/ramp';
import { X, Download, Activity, Volume2 } from 'lucide-react';

interface TherapistDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: RampSessionMetrics;
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

  const vocalJaPct =
    metrics.totalLaunches > 0
      ? ((metrics.vocalJaCount / metrics.totalLaunches) * 100).toFixed(0)
      : '0';

  const exportCSV = () => {
    const headers = [
      'episodeId',
      'timestamp',
      'vehicle',
      'rampAngleDeg',
      'variation',
      'raceMode',
      'targetHit',
      'modality',
      'promptLevel',
    ];
    const rows = episodes.map((e) => [
      e.episodeId,
      new Date(e.timestamp).toISOString(),
      e.vehicle,
      e.rampAngleDeg,
      e.variation,
      e.raceMode ? '1' : '0',
      e.targetHit ? '1' : '0',
      e.modality,
      e.promptLevel,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `esdm_den03_rampa_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-window">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-sky-600" />
            <h3 className="modal-title">Painel Clínico ESDM: Rampa Maluca & Antecipação</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          {/* KPI Summary Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-label">Largadas Totais</span>
              <span className="kpi-val text-sky-600">{metrics.totalLaunches}</span>
              <span className="kpi-sub">{Math.floor(durationSeconds / 60)} min de sessão</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Proporção "JÁ!" Vocal</span>
              <span className="kpi-val text-emerald-600">{vocalJaPct}%</span>
              <span className="kpi-sub">{metrics.vocalJaCount} palavras expressivas</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Alvos Atingidos</span>
              <span className="kpi-val text-amber-600">{metrics.targetsHit}</span>
              <span className="kpi-sub">Pinos derrubados</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Sinais por Gesto</span>
              <span className="kpi-val text-indigo-600">{metrics.gestureCount}</span>
              <span className="kpi-sub">Apontar / Mão</span>
            </div>
          </div>

          <div className="modality-box">
            <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-600" />
              Comunicação Expressiva na Largada (ESDM):
            </h4>
            <p className="text-xs text-slate-600 mb-3">
              Objetivo: transição de pedidos por pistas motoras/olhar para a vocalização antecipada ("Já!").
            </p>
            <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${vocalJaPct}%` }}
                title={`Vocal: ${metrics.vocalJaCount}`}
              />
              <div
                className="bg-indigo-400 h-full"
                style={{ width: `${100 - Number(vocalJaPct)}%` }}
                title={`Gestos/Olhar: ${metrics.gestureCount}`}
              />
            </div>
            <div className="flex justify-between text-xs font-bold mt-1 text-slate-500">
              <span className="text-emerald-700">🗣️ Palavra Vocal: {metrics.vocalJaCount}</span>
              <span className="text-indigo-700">👉 Gestos/Olhar: {metrics.gestureCount}</span>
            </div>
          </div>

          {/* Episode Log Table */}
          <div className="trial-table-wrapper">
            <table className="trial-table">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Veículo</th>
                  <th>Ângulo</th>
                  <th>Variação</th>
                  <th>Iniciativa</th>
                  <th>Apoio</th>
                </tr>
              </thead>
              <tbody>
                {episodes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-slate-500 py-6">
                      Nenhuma descida registrada ainda. Inicie a contagem e libere o "JÁ!".
                    </td>
                  </tr>
                ) : (
                  episodes.map((ep) => (
                    <tr key={ep.episodeId}>
                      <td>{new Date(ep.timestamp).toLocaleTimeString()}</td>
                      <td><span className="badge-module">{ep.vehicle}</span></td>
                      <td>{ep.rampAngleDeg}°</td>
                      <td>{ep.variation}</td>
                      <td>
                        <strong className="text-slate-800">{ep.modality}</strong>
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
              Exportar CSV da Rampa ESDM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
