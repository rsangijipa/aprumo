import { useState } from 'react';
import { Button, IconPrinter } from '@aprumo/ui';
import { speak, playTones } from '@aprumo/game-sdk';

export interface RegulationZone {
  id: 'blue' | 'green' | 'yellow' | 'red';
  name: string;
  energyLevel: string;
  color: string;
  bgLight: string;
  borderColor: string;
  emoji: string;
  feelings: string[];
  sensations: string[];
  strategies: string[];
}

export const REGULATION_ZONES: RegulationZone[] = [
  {
    id: 'blue',
    name: 'Zona Azul',
    energyLevel: 'Baixa Energia',
    color: '#0284c7',
    bgLight: '#f0f9ff',
    borderColor: '#38bdf8',
    emoji: '🌧️',
    feelings: ['Triste', 'Cansado', 'Com Sono', 'Desanimado', 'Doente'],
    sensations: ['Corpo pesado', 'Olhos pesados', 'Vontade de deitar', 'Movimentos lentos'],
    strategies: [
      'Beber um copo de água fresca',
      'Fazer um alongamento esticando os braços',
      'Caminhar e lavar o rosto',
      'Ouvir uma música rítmica e alegre',
    ],
  },
  {
    id: 'green',
    name: 'Zona Verde',
    energyLevel: 'Energia Ideal / Equilíbrio',
    color: '#16a34a',
    bgLight: '#f0fdf4',
    borderColor: '#4ade80',
    emoji: '🌱',
    feelings: ['Calmo', 'Feliz', 'Focado', 'Pronto para Aprender', 'Confortável'],
    sensations: ['Respiração suave', 'Músculos relaxados', 'Mente clara', 'Batimento estável'],
    strategies: [
      'Continuar a atividade com atenção',
      'Ajudar um colega ou terapeuta',
      'Aproveitar o bom momento de aprendizagem',
      'Comemorar a sensação agradável de bem-estar',
    ],
  },
  {
    id: 'yellow',
    name: 'Zona Amarela',
    energyLevel: 'Energia Aumentada / Alerta',
    color: '#d97706',
    bgLight: '#fffbeb',
    borderColor: '#fbbf24',
    emoji: '⚠️',
    feelings: ['Agitado', 'Ansioso', 'Frustrado', 'Nervoso', 'Sobrecarregado'],
    sensations: ['Coração batendo mais rápido', 'Inquietude nas mãos', 'Calor no rosto', 'Voz mais alta'],
    strategies: [
      'Fazer 3 respirações profundas 4-2-4',
      'Apertar a massinha anti-estresse',
      'Colocar os fones abafadores de ruído',
      'Pedir 2 minutos de pausa com o cartão',
    ],
  },
  {
    id: 'red',
    name: 'Zona Vermelha',
    energyLevel: 'Energia Excessiva / Fora de Controle',
    color: '#dc2626',
    bgLight: '#fef2f2',
    borderColor: '#f87171',
    emoji: '🛑',
    feelings: ['Explosivo', 'Com Muita Raiva', 'Em Pânico', 'Sem Controle'],
    sensations: ['Punhos cerrados', 'Mandíbula travada', 'Respiração ofegante', 'Grito ou choro'],
    strategies: [
      'Ir ao Cantinho Seguro de Calma',
      'Pressionar as mãos contra a parede ou almofada macia',
      'Reduzir todas as luzes e silenciar o ambiente',
      'Receber apoio suave sem demandas verbais',
    ],
  },
];

export function RegulationZonesStudio() {
  const [selectedZoneId, setSelectedZoneId] = useState<RegulationZone['id']>('green');
  const activeZone = REGULATION_ZONES.find((z) => z.id === selectedZoneId)!;
  const [selectedSensations, setSelectedSensations] = useState<string[]>([]);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inspire' | 'hold' | 'expire'>('inspire');

  const selectZone = (id: RegulationZone['id']) => {
    setSelectedZoneId(id);
    setSelectedSensations([]);
    const zone = REGULATION_ZONES.find((z) => z.id === id)!;
    playTones([{ freq: id === 'green' ? 523.25 : id === 'blue' ? 392 : id === 'yellow' ? 659.25 : 329.63, dur: 0.15, type: 'sine' }], 'normal');
    void speak(`Você selecionou a ${zone.name}: ${zone.energyLevel}. Vamos ver como seu corpo se sente e escolher uma boa estratégia.`, 'normal');
  };

  const toggleSensation = (sens: string) => {
    setSelectedSensations((prev) =>
      prev.includes(sens) ? prev.filter((s) => s !== sens) : [...prev, sens]
    );
  };

  const startBreathing = () => {
    setBreathingActive(true);
    setBreathPhase('inspire');
    void speak('Puxe o ar pelo nariz bem devagar... 1, 2, 3, 4', 'normal');

    let count = 0;
    const interval = window.setInterval(() => {
      count++;
      if (count === 4) {
        setBreathPhase('hold');
        void speak('Segure o ar com calma...', 'normal');
      } else if (count === 6) {
        setBreathPhase('expire');
        void speak('Solte o ar pela boca suavemente...', 'normal');
      } else if (count >= 10) {
        window.clearInterval(interval);
        setBreathingActive(false);
        void speak('Muito bem! Perceba como seu corpo está mais tranquilo.', 'normal');
      }
    }, 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* 4 Zones Grid Selector */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}
        role="radiogroup"
        aria-label="Zonas de Regulação"
      >
        {REGULATION_ZONES.map((zone) => {
          const isSelected = zone.id === selectedZoneId;
          return (
            <button
              key={zone.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => selectZone(zone.id)}
              style={{
                background: isSelected ? zone.bgLight : 'var(--ap-surface)',
                border: `3px solid ${isSelected ? zone.color : 'var(--ap-border)'}`,
                borderRadius: '20px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                textAlign: 'center',
                transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                boxShadow: isSelected ? `0 8px 20px ${zone.color}30` : 'var(--ap-shadow-xs)',
                transition: 'all 0.25s ease',
              }}
            >
              <span style={{ fontSize: '2.5rem' }}>{zone.emoji}</span>
              <strong style={{ fontSize: '1.2rem', color: zone.color }}>{zone.name}</strong>
              <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 700, color: 'var(--ap-text-muted)' }}>
                {zone.energyLevel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Zone Detail Panel */}
      <div
        style={{
          background: activeZone.bgLight,
          border: `2px solid ${activeZone.borderColor}`,
          borderRadius: '24px',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 800, textTransform: 'uppercase', color: activeZone.color }}>
              ESTADO ATUAL SELECIONADO
            </span>
            <h3 style={{ margin: '0.2rem 0', fontSize: '1.5rem', color: activeZone.color }}>
              {activeZone.emoji} {activeZone.name} — {activeZone.energyLevel}
            </h3>
          </div>
          <Button variant="ghost" onClick={startBreathing} disabled={breathingActive}>
            {breathingActive ? `💨 ${breathPhase.toUpperCase()}...` : '🫁 Fazer Respiração 4-2-4'}
          </Button>
        </div>

        {/* Somatic Check-in */}
        <div>
          <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--ap-text)' }}>
            Sensações no meu corpo agora (toque para marcar):
          </strong>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {activeZone.sensations.map((sens) => {
              const active = selectedSensations.includes(sens);
              return (
                <button
                  key={sens}
                  type="button"
                  className="rs-tab-pill"
                  aria-pressed={active}
                  onClick={() => toggleSensation(sens)}
                  style={{
                    borderColor: active ? activeZone.color : undefined,
                    background: active ? activeZone.color : undefined,
                    color: active ? '#ffffff' : undefined,
                  }}
                >
                  {sens}
                </button>
              );
            })}
          </div>
        </div>

        {/* Strategies Section */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--ap-border)' }}>
          <strong style={{ display: 'block', marginBottom: '0.75rem', color: activeZone.color, fontSize: '1.1rem' }}>
            💡 Estratégias Recomendadas para Voltar ao Equilíbrio:
          </strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {activeZone.strategies.map((strat, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  background: 'var(--ap-surface-sunken)',
                  border: '1px solid var(--ap-border)',
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>✨</span>
                <span style={{ fontSize: 'var(--ap-text-sm)', fontWeight: 600 }}>{strat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="ghost" onClick={() => selectZone('green')}>
          Restaurar Zona Verde
        </Button>
        <Button variant="default" onClick={() => window.print()} icon={<IconPrinter />}>
          Imprimir Cartaz das Zonas de Regulação
        </Button>
      </div>
    </div>
  );
}
