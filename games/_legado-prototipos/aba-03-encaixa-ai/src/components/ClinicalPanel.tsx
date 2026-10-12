import React, { useState } from 'react';
import type { ChainType, PromptLevel, AbaTrial } from '../types/puzzle';
import { Compass, Sliders, Upload, BarChart2, ShieldCheck } from 'lucide-react';

interface ClinicalPanelProps {
  chainType: ChainType;
  k: number;
  totalPieces: number;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  activePrompt: PromptLevel;
  isLeftHanded: boolean;
  trials: AbaTrial[];
  onSetChainType: (type: ChainType) => void;
  onSetK: (k: number) => void;
  onSetPrompt: (prompt: PromptLevel) => void;
  onToggleHandedness: () => void;
  onOpenPhysicalBridge: () => void;
  onImportCustomSvg: (svg: string, name: string) => void;
}

export const ClinicalPanel: React.FC<ClinicalPanelProps> = ({
  chainType,
  k,
  totalPieces,
  consecutiveSuccesses,
  consecutiveFailures,
  activePrompt,
  isLeftHanded,
  trials,
  onSetChainType,
  onSetK,
  onSetPrompt,
  onToggleHandedness,
  onOpenPhysicalBridge,
  onImportCustomSvg,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'settings' | 'import'>('metrics');
  const [svgInput, setSvgInput] = useState('');
  const [themeNameInput, setThemeNameInput] = useState('');

  const correctTrials = trials.filter((t) => t.success);
  const totalTrials = trials.length;
  const accuracy = totalTrials > 0 ? Math.round((correctTrials.length / totalTrials) * 100) : 100;

  const avgAngleError = trials.length > 0
    ? (trials.reduce((acc, t) => acc + t.angleErrorDeg, 0) / trials.length).toFixed(1)
    : '0';

  const avgSnapDistance = trials.length > 0
    ? (trials.reduce((acc, t) => acc + t.snapDistancePx, 0) / trials.length).toFixed(0)
    : '0';

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '20px',
        boxShadow: '0 12px 30px rgba(30, 37, 43, 0.08)',
        border: '2px solid var(--tinta-15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '1040px',
      }}
      id="clinical-panel"
    >
      {/* Tab Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid var(--tinta-15)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`btn-tab ${activeTab === 'metrics' ? 'active' : ''}`}
          >
            <BarChart2 size={16} />
            Métricas Clínicas ABA
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`btn-tab ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <Sliders size={16} />
            Parâmetros & Cadeia
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`btn-tab ${activeTab === 'import' ? 'active' : ''}`}
          >
            <Upload size={16} />
            Importar SVG (Sem Código)
          </button>
        </div>

        <button
          onClick={onOpenPhysicalBridge}
          style={{
            background: 'rgba(45, 106, 79, 0.12)',
            color: 'var(--vitoria-regia)',
            border: '1.5px solid var(--vitoria-regia)',
            borderRadius: '10px',
            padding: '6px 14px',
            fontFamily: 'var(--font-hud)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          id="btn-open-bridge"
        >
          <ShieldCheck size={16} />
          Seção 10: Ponte para o Físico
        </button>
      </div>

      {/* Tab Content: Metrics */}
      {activeTab === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{ background: 'var(--fundo)', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--tinta-15)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--tinta-60)', fontFamily: 'var(--font-hud)' }}>
                Passos na Cadeia (k)
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--vitoria-regia)' }}>
                {k} / {totalPieces}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--tinta-60)' }}>
                {consecutiveSuccesses}/3 acertos · {consecutiveFailures}/2 falhas
              </div>
            </div>

            <div style={{ background: 'var(--fundo)', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--tinta-15)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--tinta-60)', fontFamily: 'var(--font-hud)' }}>
                Acurácia no Encaixe
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--igarape)' }}>
                {accuracy}%
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--tinta-60)' }}>
                {correctTrials.length} acertos em {totalTrials} tentativas
              </div>
            </div>

            <div style={{ background: 'var(--fundo)', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--tinta-15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--tinta-60)', fontFamily: 'var(--font-hud)' }}>
                <Compass size={14} /> Erro Angular Médio
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--buriti)' }}>
                {avgAngleError}°
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--tinta-60)' }}>
                Indicador visoespacial
              </div>
            </div>

            <div style={{ background: 'var(--fundo)', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--tinta-15)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--tinta-60)', fontFamily: 'var(--font-hud)' }}>
                Distância Média de Snap
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--acai)' }}>
                {avgSnapDistance} px
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--tinta-60)' }}>
                Aproximação motora
              </div>
            </div>
          </div>

          {/* Trials Telemetry Table */}
          <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--tinta-15)', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead style={{ background: 'var(--fundo)', position: 'sticky', top: 0 }}>
                <tr>
                  <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--tinta-15)' }}>Hora</th>
                  <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--tinta-15)' }}>Peça</th>
                  <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--tinta-15)' }}>Cadeia</th>
                  <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--tinta-15)' }}>k</th>
                  <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--tinta-15)' }}>Distância</th>
                  <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--tinta-15)' }}>Erro Angular</th>
                  <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--tinta-15)' }}>Dica</th>
                  <th style={{ padding: '8px 10px', borderBottom: '1px solid var(--tinta-15)' }}>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {trials.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '14px', color: 'var(--tinta-60)' }}>
                      Nenhum registro ainda nesta sessão. Encaixe uma peça para registrar tentativas.
                    </td>
                  </tr>
                ) : (
                  [...trials].reverse().map((t) => (
                    <tr key={t.trialId} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '6px 10px' }}>{new Date(t.timestamp).toLocaleTimeString()}</td>
                      <td style={{ padding: '6px 10px', fontWeight: 600 }}>{t.pieceId}</td>
                      <td style={{ padding: '6px 10px' }}>{t.chainType}</td>
                      <td style={{ padding: '6px 10px' }}>{t.k}</td>
                      <td style={{ padding: '6px 10px' }}>{t.snapDistancePx.toFixed(0)} px</td>
                      <td style={{ padding: '6px 10px' }}>{t.angleErrorDeg.toFixed(0)}°</td>
                      <td style={{ padding: '6px 10px' }}>
                        <span className="badge" style={{ backgroundColor: 'var(--tinta-15)', color: 'var(--tinta)' }}>
                          {t.promptUsed}
                        </span>
                      </td>
                      <td style={{ padding: '6px 10px' }}>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: t.success ? 'rgba(45, 106, 79, 0.15)' : 'rgba(230, 57, 70, 0.15)',
                            color: t.success ? 'var(--vitoria-regia)' : '#E63946',
                          }}
                        >
                          {t.success ? 'Acerto' : 'Cavidade Errada'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Settings */}
      {activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          {/* Chaining parameters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
              Modelo de Encadeamento
            </h4>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => onSetChainType('reverso')}
                className={`btn-tab ${chainType === 'reverso' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Reverso (N-k)
              </button>
              <button
                onClick={() => onSetChainType('direto')}
                className={`btn-tab ${chainType === 'direto' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Direto
              </button>
              <button
                onClick={() => onSetChainType('tarefa_total')}
                className={`btn-tab ${chainType === 'tarefa_total' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Tarefa Total
              </button>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--tinta-60)', lineHeight: '1.4' }}>
              {chainType === 'reverso' && 'O quebra-cabeça começa com N-k peças já colocadas. A criança encaixa as últimas k peças para obter o reforço natural.'}
              {chainType === 'direto' && 'A criança encaixa as primeiras k peças; o sistema completa as restantes.'}
              {chainType === 'tarefa_total' && 'Todas as peças ficam na bandeja para encaixe sequencial com dicas graduadas.'}
            </div>

            <div style={{ marginTop: '8px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
                Ajustar k Manualmente (1 a {totalPieces})
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="range"
                  min={1}
                  max={totalPieces}
                  value={k}
                  onChange={(e) => onSetK(parseInt(e.target.value, 10))}
                  style={{ flex: 1, accentColor: 'var(--vitoria-regia)' }}
                />
                <span style={{ fontWeight: 800, fontSize: '1rem', width: '28px', textAlign: 'center' }}>{k}</span>
              </div>
            </div>
          </div>

          {/* Dicas & Acessibilidade */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
              Dicas Clínicas & Lateralidade
            </h4>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
                Hierarquia de Dica Digital Ativa
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(['NONE', 'VIS', 'GEST', 'POS', 'ROTATION'] as PromptLevel[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => onSetPrompt(p)}
                    className={`btn-tab ${activePrompt === p ? 'active' : ''}`}
                    style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '8px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--tinta-60)', marginBottom: '4px' }}>
                Posição da Bandeja (Mão Dominante)
              </label>
              <button
                onClick={onToggleHandedness}
                className="btn-tab"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isLeftHanded ? 'Esquerda (Destro)' : 'Direita (Canhoto)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: SVG Importer */}
      {activeTab === 'import' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 4px 0' }}>
              Importar SVG com Paths Nomeados (Critério Seção 12)
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--tinta-60)', margin: 0 }}>
              Cole o código SVG de qualquer quebra-cabeça. Cada elemento <code>&lt;path id="..." fill="..." d="..."&gt;</code>{' '}
              se transformará automaticamente em uma peça com pino e na sua cavidade com profundidade correspondente.
            </p>
          </div>

          <input
            type="text"
            placeholder="Nome do Tema (Ex: Animais do Pantanal)"
            value={themeNameInput}
            onChange={(e) => setThemeNameInput(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1.5px solid var(--tinta-15)',
              fontSize: '0.88rem',
            }}
          />

          <textarea
            rows={5}
            placeholder='<svg width="700" height="380"><path id="tartaruga" fill="#2A9D8F" d="M 20 20 L 80 20 L 80 80 Z" /><path id="peixe" fill="#E76F51" d="M 120 20 L 180 20 L 180 80 Z" /></svg>'
            value={svgInput}
            onChange={(e) => setSvgInput(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1.5px solid var(--tinta-15)',
              fontSize: '0.82rem',
              fontFamily: 'monospace',
              resize: 'vertical',
            }}
          />

          <button
            onClick={() => {
              if (svgInput.trim()) {
                onImportCustomSvg(svgInput, themeNameInput.trim() || 'Quebra-Cabeça Personalizado');
                setSvgInput('');
                setThemeNameInput('');
              }
            }}
            disabled={!svgInput.trim()}
            style={{
              alignSelf: 'flex-start',
              padding: '10px 20px',
              borderRadius: '12px',
              background: svgInput.trim() ? 'var(--vitoria-regia)' : 'var(--tinta-15)',
              color: svgInput.trim() ? '#FFFFFF' : 'var(--tinta-60)',
              border: 'none',
              fontFamily: 'var(--font-hud)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: svgInput.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Upload size={16} />
            Gerar Quebra-Cabeça Imediatamente
          </button>
        </div>
      )}
    </div>
  );
};
