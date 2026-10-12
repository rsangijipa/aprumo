import React from 'react';
import type { TaskAnalysisRecord, Routine, AbaSequenceTrial } from '../types/routine';
import { TrendingUp, AlertTriangle, MapPin, CheckCircle } from 'lucide-react';

interface TaskAnalysisDashboardProps {
  records: TaskAnalysisRecord[];
  trials: AbaSequenceTrial[];
  routine: Routine;
}

export const TaskAnalysisDashboard: React.FC<TaskAnalysisDashboardProps> = ({
  records,
  trials,
  routine,
}) => {
  const routineTrials = trials.filter((t) => t.routineId === routine.id);
  const correctTrials = routineTrials.filter((t) => t.isCorrect).length;
  const sequenceAccuracy = routineTrials.length > 0 ? Math.round((correctTrials / routineTrials.length) * 100) : 100;
  const routineRecords = records.filter((r) => r.routineId === routine.id);
  const totalStepsRecorded = routineRecords.length;
  const independentSteps = routineRecords.filter((r) => r.promptLevel === 'IND').length;
  const independenceRate = totalStepsRecorded > 0 ? Math.round((independentSteps / totalStepsRecorded) * 100) : 100;

  // Identify bottleneck steps (highest level of assistance)
  const stepAssistCounts: Record<string, number> = {};
  routineRecords.forEach((r) => {
    if (r.promptLevel !== 'IND') {
      stepAssistCounts[r.stepId] = (stepAssistCounts[r.stepId] || 0) + 1;
    }
  });

  const bottleneckStepId = Object.entries(stepAssistCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const bottleneckStep = routine.steps.find((s) => s.stepId === bottleneckStepId);

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: '0 10px 30px rgba(30, 37, 43, 0.08)',
        border: '2px solid var(--tinta-15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        maxWidth: '920px',
      }}
      id="task-analysis-dashboard"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--igarape)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Dados de Análise de Tarefas (AFLS / ABA)
          </span>
          <h3 style={{ margin: '2px 0 0 0', fontFamily: 'var(--font-hud)', fontSize: '1.3rem', fontWeight: 800 }}>
            Métricas Clínicas da Rotina: {routine.name}
          </h3>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ backgroundColor: 'var(--fundo)', padding: '16px', borderRadius: '16px', border: '1px solid var(--tinta-15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--tinta-60)', fontWeight: 700 }}>
            <TrendingUp size={16} color="var(--vitoria-regia)" />
            Índice de Independência
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--vitoria-regia)', marginTop: '4px' }}>
            {independenceRate}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--tinta-60)' }}>
            {independentSteps} de {totalStepsRecorded} passos sem ajuda
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--fundo)', padding: '16px', borderRadius: '16px', border: '1px solid var(--tinta-15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--tinta-60)', fontWeight: 700 }}>
            <AlertTriangle size={16} color="var(--buriti)" />
            Passo-Gargalo Identificado
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--tinta)', marginTop: '6px' }}>
            {bottleneckStep ? bottleneckStep.title : 'Nenhum gargalo'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--tinta-60)' }}>
            {bottleneckStep ? 'Requer atenção prioritária do aplicador' : 'Todos os passos com bom domínio'}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--fundo)', padding: '16px', borderRadius: '16px', border: '1px solid var(--tinta-15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--tinta-60)', fontWeight: 700 }}>
            <CheckCircle size={16} color="var(--buriti)" />
            Acurácia no Jogo de Sequência
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--buriti)', marginTop: '4px' }}>
            {sequenceAccuracy}%
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--tinta-60)' }}>
            {correctTrials} acertos em {routineTrials.length} tentativas
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--fundo)', padding: '16px', borderRadius: '16px', border: '1px solid var(--tinta-15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--tinta-60)', fontWeight: 700 }}>
            <MapPin size={16} color="var(--igarape)" />
            Generalização em Ambientes
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--igarape)', marginTop: '6px' }}>
            Clínica & Casa
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--tinta-60)' }}>
            Registros cruzados para generalização
          </div>
        </div>
      </div>

      {/* Step Breakdown Table */}
      <div>
        <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 8px 0' }}>
          Histórico Recente de Passos Registrados
        </h4>
        <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--tinta-15)', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead style={{ background: 'var(--fundo)', position: 'sticky', top: 0 }}>
              <tr>
                <th style={{ padding: '8px 10px' }}>Hora</th>
                <th style={{ padding: '8px 10px' }}>Passo</th>
                <th style={{ padding: '8px 10px' }}>Nível de Ajuda</th>
                <th style={{ padding: '8px 10px' }}>Ambiente</th>
                <th style={{ padding: '8px 10px' }}>Duração</th>
              </tr>
            </thead>
            <tbody>
              {routineRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '14px', color: 'var(--tinta-60)' }}>
                    Nenhum registro ainda nesta rotina. Conclua passos no modo roteiro para registrar.
                  </td>
                </tr>
              ) : (
                [...routineRecords].reverse().map((r) => (
                  <tr key={r.recordId} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <td style={{ padding: '6px 10px' }}>{new Date(r.timestamp).toLocaleTimeString()}</td>
                    <td style={{ padding: '6px 10px', fontWeight: 600 }}>Passo {r.stepOrder}</td>
                    <td style={{ padding: '6px 10px' }}>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: r.promptLevel === 'IND' ? 'rgba(45, 106, 79, 0.15)' : 'rgba(244, 162, 97, 0.15)',
                          color: r.promptLevel === 'IND' ? 'var(--vitoria-regia)' : 'var(--buriti)',
                        }}
                      >
                        {r.promptLevel}
                      </span>
                    </td>
                    <td style={{ padding: '6px 10px', textTransform: 'capitalize' }}>{r.setting}</td>
                    <td style={{ padding: '6px 10px' }}>{(r.durationMs / 1000).toFixed(1)}s</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
