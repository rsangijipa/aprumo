import React from 'react';
import type { TeachingEpisode } from '../types/book';
import { BarChart2, X, Download, ShieldCheck, Heart } from 'lucide-react';

interface TherapistDashboardProps {
  episodes: TeachingEpisode[];
  onClose: () => void;
}

export const TherapistDashboard: React.FC<TherapistDashboardProps> = ({
  episodes,
  onClose,
}) => {
  const total = episodes.length;

  const showCount = episodes.filter((e) => e.responseType === 'apontar-mostrar').length;
  const mandCount = episodes.filter((e) => e.responseType === 'apontar-pedir').length;
  const followCount = episodes.filter((e) => e.responseType === 'seguir-apontar').length;
  const onomatopoeiaCount = episodes.filter((e) => e.responseType === 'onomatopeia').length;
  const wordCount = episodes.filter((e) => e.responseType === 'palavra').length;

  const imitatedCount = episodes.filter((e) => e.echoOfAdult).length;
  const spontaneousCount = episodes.filter((e) => !e.echoOfAdult).length;

  const independentCount = episodes.filter((e) => e.promptLevel === 'independente').length;
  const independentPct = total > 0 ? Math.round((independentCount / total) * 100) : 0;

  const handleExportCSV = () => {
    const headers = 'EpisodeId,Timestamp,Page,Animal,ResponseType,PromptLevel,EchoOfAdult\n';
    const rows = episodes
      .map(
        (e) =>
          `"${e.episodeId}","${new Date(e.timestamp).toISOString()}","${e.page}","${e.animal}","${e.responseType}","${e.promptLevel}","${e.echoOfAdult}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `esdm_den05_fazendinha_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-window max-w-4xl">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-teal-600" />
            <h3 className="modal-title">Painel Clínico ESDM • Fazendinha Sonora</h3>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-body space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium block">Total de Episódios</span>
              <span className="text-2xl font-bold text-slate-800">{total}</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-700 font-medium block">Independência Geral</span>
              <span className="text-2xl font-bold text-emerald-800">{independentPct}%</span>
            </div>

            <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
              <span className="text-xs text-sky-700 font-medium block">Apontar (Mostrar/Pedir)</span>
              <span className="text-2xl font-bold text-sky-800">
                {showCount} <span className="text-sm font-normal text-slate-500">/ {mandCount}</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
              <span className="text-xs text-purple-700 font-medium block">Onomatopeias</span>
              <span className="text-2xl font-bold text-purple-800">{onomatopoeiaCount + wordCount}</span>
            </div>
          </div>

          {/* Clinical Joint Attention Analysis */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
            <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-indigo-600" />
              <span>Atenção Conjunta e Comunicação Social (Mundy & Kasari)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-indigo-950">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-100">
                <strong className="block text-indigo-700 mb-1">Protodeclarativo vs Protoimperativo</strong>
                <p>
                  Mostrar: <strong>{showCount}</strong> vs Pedir: <strong>{mandCount}</strong>.
                  O apontar para mostrar reflete engajamento afetivo e partilha do foco.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-100">
                <strong className="block text-indigo-700 mb-1">Seguir o Apontar</strong>
                <p>
                  Total de episódios: <strong>{followCount}</strong>.
                  Indica rastreamento do olhar e alinhamento atencional com o mediador.
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl shadow-sm border border-indigo-100">
                <strong className="block text-indigo-700 mb-1">Imitação Vocal vs Espontânea</strong>
                <p>
                  Imitado imediato: <strong>{imitatedCount}</strong> | Espontâneo: <strong>{spontaneousCount}</strong>.
                  Construção do repertório fônico inicial.
                </p>
              </div>
            </div>
          </div>

          {/* Episode Log Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Registro Contínuo de Episódios
              </h4>
              <button
                type="button"
                className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1.5 transition"
                onClick={handleExportCSV}
                disabled={episodes.length === 0}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 sticky top-0 text-slate-600 font-semibold border-b">
                  <tr>
                    <th className="p-2.5">Horário</th>
                    <th className="p-2.5">Pág</th>
                    <th className="p-2.5">Animal</th>
                    <th className="p-2.5">Comportamento</th>
                    <th className="p-2.5">Ajuda</th>
                    <th className="p-2.5">Eco Adulto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {episodes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400">
                        Nenhum episódio registrado ainda nesta sessão.
                      </td>
                    </tr>
                  ) : (
                    episodes.map((ep) => (
                      <tr key={ep.episodeId} className="hover:bg-slate-50">
                        <td className="p-2.5">{new Date(ep.timestamp).toLocaleTimeString()}</td>
                        <td className="p-2.5 font-medium">{ep.page}</td>
                        <td className="p-2.5 font-semibold text-slate-800">{ep.animal}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {ep.responseType}
                          </span>
                        </td>
                        <td className="p-2.5">{ep.promptLevel}</td>
                        <td className="p-2.5">
                          {ep.echoOfAdult ? (
                            <span className="text-emerald-600 font-semibold">Sim</span>
                          ) : (
                            <span className="text-slate-400">Não</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="modal-footer flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Conformidade com Diretrizes ESDM de Leitura Compartilhada</span>
          </div>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition"
            onClick={onClose}
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
