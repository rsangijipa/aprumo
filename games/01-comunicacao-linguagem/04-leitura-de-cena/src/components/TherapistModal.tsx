import React, { useState } from 'react';
import type { AbaSceneTrial, FeelingsThermometerState } from '../types/scene';
import { X, Download, ShieldCheck, Activity, Award, UserCheck, AlertCircle } from 'lucide-react';

interface TherapistModalProps {
  isOpen: boolean;
  onClose: () => void;
  trials: AbaSceneTrial[];
  selfReports: FeelingsThermometerState[];
}

export const TherapistModal: React.FC<TherapistModalProps> = ({
  isOpen,
  onClose,
  trials,
  selfReports,
}) => {
  const [activeTab, setActiveTab] = useState<'trials' | 'selfreport'>('trials');

  if (!isOpen) return null;

  // Compute accuracy per module
  const e1Trials = trials.filter((t) => t.module === 'E1');
  const e1Acc = e1Trials.length > 0 ? (e1Trials.filter((t) => t.isSuccess).length / e1Trials.length) * 100 : 0;

  const e2Trials = trials.filter((t) => t.module === 'E2');
  const e2Acc = e2Trials.length > 0 ? (e2Trials.filter((t) => t.isSuccess).length / e2Trials.length) * 100 : 0;

  const e3Trials = trials.filter((t) => t.module === 'E3');
  const e3Acc = e3Trials.length > 0 ? (e3Trials.filter((t) => t.isSuccess).length / e3Trials.length) * 100 : 0;

  const e4Trials = trials.filter((t) => t.module === 'E4');
  const e4Acc = e4Trials.length > 0 ? (e4Trials.filter((t) => t.isAcceptable).length / e4Trials.length) * 100 : 0;

  const rehearsalCount = trials.filter((t) => t.rehearsalResult === 'sem-ajuda').length;
  const totalRehearsals = trials.filter((t) => !!t.rehearsalResult).length;

  const exportCSV = () => {
    const headers = [
      'trialId',
      'timestamp',
      'module',
      'sceneId',
      'emotion',
      'intensity',
      'isSuccess',
      'isAcceptable',
      'rehearsalResult',
      'cuesCount',
    ];
    const rows = trials.map((t) => [
      t.trialId,
      new Date(t.timestamp).toISOString(),
      t.module,
      t.sceneId,
      t.emotion,
      t.intensity,
      t.isSuccess ? '1' : '0',
      t.isAcceptable !== undefined ? (t.isAcceptable ? '1' : '0') : '',
      t.rehearsalResult || '',
      t.cuesSelected.length,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aba_07_leitura_de_cena_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-window">
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            <h3 className="modal-title">Painel Clínico ABA: Leitura de Cena & Habilidades Sociais</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="tab-bar">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'trials' ? 'active' : ''}`}
            onClick={() => setActiveTab('trials')}
          >
            Tentativas Discretas ({trials.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'selfreport' ? 'active' : ''}`}
            onClick={() => setActiveTab('selfreport')}
          >
            Termômetro Privado E5 ({selfReports.length})
          </button>
        </div>

        {activeTab === 'trials' ? (
          <div className="modal-body">
            {/* KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <span className="kpi-label">E1: Emoções</span>
                <span className="kpi-val">{e1Acc.toFixed(0)}%</span>
                <span className="kpi-sub">({e1Trials.length} tentativas)</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">E2: Pistas</span>
                <span className="kpi-val">{e2Acc.toFixed(0)}%</span>
                <span className="kpi-sub">({e2Trials.length} tentativas)</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">E3: Causalidade</span>
                <span className="kpi-val">{e3Acc.toFixed(0)}%</span>
                <span className="kpi-sub">({e3Trials.length} tentativas)</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-label">E4: Resposta Aceitável</span>
                <span className="kpi-val">{e4Acc.toFixed(0)}%</span>
                <span className="kpi-sub">({e4Trials.length} tentativas)</span>
              </div>
              <div className="kpi-card highlight-card">
                <span className="kpi-label">E4: Ensaio Independente</span>
                <span className="kpi-val">
                  {totalRehearsals > 0 ? `${((rehearsalCount / totalRehearsals) * 100).toFixed(0)}%` : '0%'}
                </span>
                <span className="kpi-sub">({rehearsalCount}/{totalRehearsals} ensaios)</span>
              </div>
            </div>

            {/* Trial Log Table */}
            <div className="trial-table-wrapper">
              <table className="trial-table">
                <thead>
                  <tr>
                    <th>Horário</th>
                    <th>Módulo</th>
                    <th>Cena</th>
                    <th>Emoção</th>
                    <th>Resultado</th>
                    <th>Ensaio Role-Play</th>
                  </tr>
                </thead>
                <tbody>
                  {trials.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-slate-500 py-6">
                        Nenhuma tentativa registrada nesta sessão.
                      </td>
                    </tr>
                  ) : (
                    trials.map((t) => (
                      <tr key={t.trialId}>
                        <td>{new Date(t.timestamp).toLocaleTimeString()}</td>
                        <td><span className="badge-module">{t.module}</span></td>
                        <td>{t.sceneId}</td>
                        <td>{t.emotion}</td>
                        <td>
                          {t.isSuccess ? (
                            <span className="status-success"><Award className="w-4 h-4 inline mr-1" />Acerto</span>
                          ) : (
                            <span className="status-help"><AlertCircle className="w-4 h-4 inline mr-1" />Apoio</span>
                          )}
                        </td>
                        <td>
                          {t.rehearsalResult ? (
                            <span className="status-rehearsal">
                              <UserCheck className="w-4 h-4 inline mr-1" />
                              {t.rehearsalResult}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-actions">
              <button type="button" className="export-btn" onClick={exportCSV} disabled={trials.length === 0}>
                <Download className="w-4 h-4 inline mr-2" />
                Exportar CSV de Tentativas ABA
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-body">
            <div className="privacy-alert">
              <ShieldCheck className="w-6 h-6 text-emerald-600 inline mr-2" />
              <strong>Termômetro E5:</strong> Relato subjetivo de bem-estar emocional do aprendiz. Não é avaliado como performance.
            </div>

            <div className="selfreports-list">
              {selfReports.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Nenhum autorrelato registrado ainda.</p>
              ) : (
                selfReports.map((sr, idx) => (
                  <div key={idx} className="selfreport-entry">
                    <div className="entry-header">
                      <span className="entry-time">{new Date(sr.timestamp).toLocaleTimeString()}</span>
                      <span className="entry-level">Nível {sr.level}/5 - {sr.selectedEmotionWord}</span>
                    </div>
                    <div className="entry-strat">
                      <strong>Estratégia Escolhida:</strong> {sr.helpfulStrategy}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
