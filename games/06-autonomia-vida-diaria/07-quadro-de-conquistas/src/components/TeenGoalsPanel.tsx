import React, { useState } from 'react';
import type { TeenGoal, PriceMenuItem } from '../types/tokens';
import { TokenService } from '../services/tokenService';
import { CheckCircle2, ShieldCheck, ShoppingBag, Award, BarChart3 } from 'lucide-react';

interface TeenGoalsPanelProps {
  goals: TeenGoal[];
  priceMenu: PriceMenuItem[];
  pointsBalance: number;
  onToggleSelfReport: (goalId: string) => void;
  onTherapistConfirm: (goalId: string, confirmed: boolean) => void;
  onPurchaseReward: (item: PriceMenuItem) => void;
  onAddNewGoal: (title: string, points: number, category: TeenGoal['category']) => void;
}

export const TeenGoalsPanel: React.FC<TeenGoalsPanelProps> = ({
  goals,
  priceMenu,
  pointsBalance,
  onToggleSelfReport,
  onTherapistConfirm,
  onPurchaseReward,
  onAddNewGoal,
}) => {
  const [activeTab, setActiveTab] = useState<'metas' | 'loja' | 'relatorio'>('metas');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalPoints, setNewGoalPoints] = useState(5);
  const [newGoalCat, setNewGoalCat] = useState<TeenGoal['category']>('tarefa');

  const concordance = TokenService.calculateConcordance(goals);

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalTitle.trim()) {
      onAddNewGoal(newGoalTitle.trim(), newGoalPoints, newGoalCat);
      setNewGoalTitle('');
      setNewGoalPoints(5);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxWidth: '920px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 12px 32px rgba(30, 37, 43, 0.08)',
        border: '2px solid var(--tinta-15)',
        fontFamily: "'Atkinson Hyperlegible', sans-serif",
      }}
      id="teen-goals-panel"
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid var(--tinta-15)',
          paddingBottom: '16px',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: 'var(--igarape)',
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
            }}
          >
            Autonomia & Autogestão Comportamental
          </div>
          <h2
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              color: 'var(--tinta)',
              margin: '2px 0 0 0',
            }}
          >
            Painel de Metas & Contrato
          </h2>
        </div>

        {/* Points Bank Balance Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'var(--fundo)',
            padding: '10px 20px',
            borderRadius: '16px',
            border: '2px solid var(--tinta-15)',
          }}
        >
          <Award size={26} color="var(--igarape)" />
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--tinta-60)' }}>
              Seus Pontos Acumulados
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--tinta)' }}>
              {pointsBalance} pts
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('metas')}
          className={`btn-tab ${activeTab === 'metas' ? 'active' : ''}`}
          style={{ borderRadius: '12px', padding: '8px 16px' }}
        >
          <CheckCircle2 size={16} /> Metas e Autorregistro
        </button>
        <button
          onClick={() => setActiveTab('loja')}
          className={`btn-tab ${activeTab === 'loja' ? 'active' : ''}`}
          style={{ borderRadius: '12px', padding: '8px 16px' }}
        >
          <ShoppingBag size={16} /> Cardápio de Recompensas
        </button>
        <button
          onClick={() => setActiveTab('relatorio')}
          className={`btn-tab ${activeTab === 'relatorio' ? 'active' : ''}`}
          style={{ borderRadius: '12px', padding: '8px 16px' }}
        >
          <BarChart3 size={16} /> Métricas & Concordância
        </button>
      </div>

      {/* Tab: Metas e Autorregistro */}
      {activeTab === 'metas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--tinta-60)' }}>
              Marque quando você concluir uma meta. O terapeuta validará em conjunto para calcular a precisão de automonitoramento.
            </p>
          </div>

          {/* Goal Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {goals.map((goal) => {
              const isConfirmed = goal.therapistConfirmed === true;
              const isRejected = goal.therapistConfirmed === false;

              return (
                <div
                  key={goal.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    backgroundColor: isConfirmed ? 'rgba(45, 106, 79, 0.05)' : '#FFFFFF',
                    border: isConfirmed
                      ? '2px solid var(--vitoria-regia)'
                      : isRejected
                      ? '2px solid rgba(230, 57, 70, 0.4)'
                      : '1.5px solid var(--tinta-15)',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                    {/* Self-report checkbox button */}
                    <button
                      onClick={() => onToggleSelfReport(goal.id)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: goal.selfReported ? 'none' : '2px solid var(--tinta-30)',
                        backgroundColor: goal.selfReported ? 'var(--igarape)' : 'transparent',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        marginTop: '2px',
                      }}
                      title="Autorregistro: clique para marcar se você cumpriu esta meta"
                    >
                      {goal.selfReported && <CheckCircle2 size={20} />}
                    </button>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--tinta)' }}>
                          {goal.title}
                        </h4>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: 'rgba(14, 131, 136, 0.12)',
                            color: 'var(--igarape)',
                          }}
                        >
                          +{goal.points} pts
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--tinta-60)' }}>
                        {goal.description}
                      </p>
                    </div>
                  </div>

                  {/* Therapist confirmation actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--tinta-60)', fontWeight: 600 }}>
                      Validação do Terapeuta:
                    </span>
                    <button
                      onClick={() => onTherapistConfirm(goal.id, true)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: isConfirmed ? 'var(--vitoria-regia)' : 'var(--tinta-15)',
                        color: isConfirmed ? '#FFFFFF' : 'var(--tinta)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => onTherapistConfirm(goal.id, false)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: isRejected ? '#E63946' : 'var(--tinta-15)',
                        color: isRejected ? '#FFFFFF' : 'var(--tinta)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      Ajustar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Goal Form */}
          <form
            onSubmit={handleAddGoalSubmit}
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '12px',
              padding: '16px',
              backgroundColor: 'var(--fundo)',
              borderRadius: '16px',
              border: '1.5px solid var(--tinta-15)',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <input
              type="text"
              placeholder="Adicionar nova meta pactuada com o jovem..."
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              style={{
                flex: 1,
                minWidth: '220px',
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1.5px solid var(--tinta-15)',
                fontSize: '0.9rem',
              }}
            />

            <select
              value={newGoalCat}
              onChange={(e) => setNewGoalCat(e.target.value as TeenGoal['category'])}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1.5px solid var(--tinta-15)',
                fontSize: '0.9rem',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="tarefa">Tarefa / Estudo</option>
              <option value="social">Habilidade Social</option>
              <option value="autonomia">Autonomia</option>
              <option value="comunicacao">Comunicação</option>
            </select>

            <input
              type="number"
              min={1}
              max={50}
              value={newGoalPoints}
              onChange={(e) => setNewGoalPoints(parseInt(e.target.value, 10) || 5)}
              style={{
                width: '70px',
                padding: '8px 8px',
                borderRadius: '10px',
                border: '1.5px solid var(--tinta-15)',
                fontSize: '0.9rem',
                textAlign: 'center',
              }}
            />

            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.9rem' }}
            >
              Adicionar Meta
            </button>
          </form>
        </div>
      )}

      {/* Tab: Cardápio de Recompensas */}
      {activeTab === 'loja' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {priceMenu.map((item) => {
            const canAfford = pointsBalance >= item.cost;

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '20px',
                  borderRadius: '18px',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid var(--tinta-15)',
                  gap: '14px',
                }}
              >
                <div>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{item.icon}</div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--tinta)' }}>
                    {item.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--tinta-60)', lineHeight: '1.3' }}>
                    {item.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-hud)',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: canAfford ? 'var(--vitoria-regia)' : 'var(--tinta-60)',
                    }}
                  >
                    {item.cost} pts
                  </span>

                  <button
                    onClick={() => onPurchaseReward(item)}
                    disabled={!canAfford}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: canAfford ? 'var(--vitoria-regia)' : 'var(--tinta-15)',
                      color: canAfford ? '#FFFFFF' : 'var(--tinta-60)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {canAfford ? 'Resgatar' : 'Pontos insuficientes'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Métricas & Concordância */}
      {activeTab === 'relatorio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div
              style={{
                backgroundColor: 'var(--fundo)',
                padding: '20px',
                borderRadius: '16px',
                border: '1.5px solid var(--tinta-15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--vitoria-regia)' }}>
                <ShieldCheck size={22} />
                <span style={{ fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase' }}>
                  Índice de Concordância
                </span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--tinta)', marginTop: '8px' }}>
                {concordance}%
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--tinta-60)' }}>
                Mede a precisão do automonitoramento (concordância entre autorregistro do jovem e conferência do terapeuta).
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'var(--fundo)',
                padding: '20px',
                borderRadius: '16px',
                border: '1.5px solid var(--tinta-15)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--igarape)' }}>
                <Award size={22} />
                <span style={{ fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase' }}>
                  Metas Cumpridas na Semana
                </span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--tinta)', marginTop: '8px' }}>
                {goals.filter((g) => g.therapistConfirmed).length} / {goals.length}
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--tinta-60)' }}>
                Metas confirmadas positivamente com pontuação atribuída ao banco.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
