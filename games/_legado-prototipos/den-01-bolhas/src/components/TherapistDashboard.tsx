import React from 'react';
import type { JointActivityRoutine } from '../types/bubble';
import { X, Download, TrendingUp, Activity } from 'lucide-react';

interface TherapistDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  routine: JointActivityRoutine;
}

export const TherapistDashboard: React.FC<TherapistDashboardProps> = ({
  isOpen,
  onClose,
  routine,
}) => {
  if (!isOpen) return null;

  const episodes = routine.episodes;
  const durationMin = Math.max(0.1, routine.durationSeconds / 60);
  const initiativesPerMin = (episodes.length / durationMin).toFixed(1);

  // Modality breakdown
  const counts = {
    olhar: episodes.filter((e) => e.modality === 'olhar').length,
    gesto: episodes.filter((e) => e.modality === 'gesto').length,
    apontar: episodes.filter((e) => e.modality === 'apontar').length,
    vocalizacao: episodes.filter((e) => e.modality === 'vocalizacao').length,
    palavra: episodes.filter((e) => e.modality === 'palavra').length,
  };

  const independentCount = episodes.filter((e) => e.promptLevel === 'independente').length;
  const indepPct = episodes.length > 0 ? ((independentCount / episodes.length) * 100).toFixed(0) : '0';

  const meanLatency =
    episodes.length > 0
      ? (episodes.reduce((acc, e) => acc + e.latencyMs, 0) / episodes.length / 1000).toFixed(1)
      : '0.0';

  const exportCSV = () => {
    const headers = [
      'episodeId',
      'timestamp',
      'routinePhase',
      'variation',
      'modality',
      'promptLevel',
      'latencyMs',
      'bubblesPoppedCount',
    ];
    const rows = episodes.map((e) => [
      e.episodeId,
      new Date(e.timestamp).toISOString(),
      e.routinePhase,
      e.variation,
      e.modality,
      e.promptLevel,
      e.latencyMs,
      e.bubblesPoppedCount,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `esdm_den01_bolhas_${Date.now()}.csv`);
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
            <h3 className="modal-title">Painel Clínico ESDM: Rotina Sensório-Social de Bolhas</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body">
          {/* KPI Summary Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-label">Iniciativas / min</span>
              <span className="kpi-val text-sky-600">{initiativesPerMin}</span>
              <span className="kpi-sub">Total: {episodes.length} episódios</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Independência (+)</span>
              <span className="kpi-val text-emerald-600">{indepPct}%</span>
              <span className="kpi-sub">{independentCount} sem ajuda</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Latência Média</span>
              <span className="kpi-val text-amber-600">{meanLatency} s</span>
              <span className="kpi-sub">Da pausa ao pedido</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Duração da Rotina</span>
              <span className="kpi-val text-indigo-600">{Math.floor(routine.durationSeconds / 60)}m {Math.floor(routine.durationSeconds % 60)}s</span>
              <span className="kpi-sub">Tempo compartilhado</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Bolhas Estouradas</span>
              <span className="kpi-val text-purple-600">{routine.totalBubblesPopped}</span>
              <span className="kpi-sub">de {routine.totalBubblesSpawned} sopradas</span>
            </div>
          </div>

          {/* Modality Progression */}
          <div className="modality-box">
            <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              Evolução da Comunicação Expressiva (ESDM):
            </h4>
            <div className="modality-bars">
              {(
                [
                  ['olhar', 'Olhar no Rosto', counts.olhar, '#38bdf8'],
                  ['gesto', 'Gesto Corporal', counts.gesto, '#818cf8'],
                  ['apontar', 'Apontar para Tela', counts.apontar, '#34d399'],
                  ['vocalizacao', 'Vocalização ("bo!")', counts.vocalizacao, '#fbbf24'],
                  ['palavra', 'Palavra ("mais", "bolha")', counts.palavra, '#f472b6'],
                ] as [string, string, number, string][]
              ).map(([key, label, val, color]) => {
                const pct = episodes.length > 0 ? (val / episodes.length) * 100 : 0;
                return (
                  <div key={key} className="modality-bar-item">
                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                      <span>{label}</span>
                      <span>{val} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Episode Log Table */}
          <div className="trial-table-wrapper">
            <table className="trial-table">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Fase</th>
                  <th>Variação</th>
                  <th>Iniciativa</th>
                  <th>Apoio</th>
                  <th>Latência</th>
                </tr>
              </thead>
              <tbody>
                {episodes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-slate-500 py-6">
                      Nenhum episódio registrado ainda. Faça uma pausa expectante e registre o pedido da criança!
                    </td>
                  </tr>
                ) : (
                  episodes.map((ep) => (
                    <tr key={ep.episodeId}>
                      <td>{new Date(ep.timestamp).toLocaleTimeString()}</td>
                      <td><span className="badge-module">{ep.routinePhase}</span></td>
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
                      <td>{(ep.latencyMs / 1000).toFixed(1)} s</td>
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
              Exportar CSV da Rotina ESDM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
