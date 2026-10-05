import { useState } from 'react';
import { Button, IconPrinter } from '@aprumo/ui';
import { speak, playTones } from '@aprumo/game-sdk';

export interface ThermometerLevel {
  level: number;
  name: string;
  color: string;
  bgLight: string;
  emoji: string;
  looksLike: string;
  feelsLike: string;
  whatICanDo: string;
}

export const THERMOMETER_LEVELS: ThermometerLevel[] = [
  {
    level: 1,
    name: 'Muito Tranquilo & Em Paz',
    color: '#15803d',
    bgLight: '#f0fdf4',
    emoji: '😊',
    looksLike: 'Sorrindo, corpo leve e postura descontraída',
    feelsLike: 'Respiração suave, mente tranquila, coração calmo',
    whatICanDo: 'Aproveitar para aprender, brincar e compartilhar com os outros.',
  },
  {
    level: 2,
    name: 'Bem & Focado',
    color: '#65a30d',
    bgLight: '#f7fee7',
    emoji: '🙂',
    looksLike: 'Atento à atividade, ouvindo com facilidade',
    feelsLike: 'Pronto para colaborar e realizar tarefas',
    whatICanDo: 'Manter a concentração e pedir ajuda se surgir alguma dúvida.',
  },
  {
    level: 3,
    name: 'Incomodado ou Frustrado',
    color: '#ca8a04',
    bgLight: '#fefce8',
    emoji: '😐',
    looksLike: 'Suspiros, sobrancelhas franzidas, inquietude na cadeira',
    feelsLike: 'Calor no rosto, respiração um pouco mais rápida',
    whatICanDo: 'Avisar o terapeuta ou professor, beber um gole de água e respirar fundo 3 vezes.',
  },
  {
    level: 4,
    name: 'Muito Nervoso ou Ansioso',
    color: '#ea580c',
    bgLight: '#fff7ed',
    emoji: '😠',
    looksLike: 'Voz alterada, punhos cerrados, vontade de sair correndo',
    feelsLike: 'Coração acelerado, tensão muscular forte no pescoço e mãos',
    whatICanDo: 'Mostrar o cartão de PAUSA, colocar fone de ouvido ou apertar a massinha.',
  },
  {
    level: 5,
    name: 'Sem Controle / Explosão',
    color: '#dc2626',
    bgLight: '#fef2f2',
    emoji: '💥',
    looksLike: 'Gritos, choro forte, bloqueio total de comunicação',
    feelsLike: 'Sobrecarga sensorial extrema, perda do autocontrole',
    whatICanDo: 'Ir para o cantinho seguro, proteger a cabeça, ficar em silêncio até o corpo relaxar.',
  },
];

export function FeelingsThermometerStudio() {
  const [selectedLevelNum, setSelectedLevelNum] = useState<number>(2);
  const activeLevel = THERMOMETER_LEVELS.find((l) => l.level === selectedLevelNum)!;

  const selectLevel = (lvl: number) => {
    setSelectedLevelNum(lvl);
    const item = THERMOMETER_LEVELS.find((l) => l.level === lvl)!;
    playTones([
      { freq: 260 + lvl * 90, dur: 0.15, type: 'sine' },
    ], 'normal');
    void speak(`Nível ${item.level}: ${item.name}. O que posso fazer: ${item.whatICanDo}`, 'normal');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Visual Interactive Scale */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr',
          gap: '1.5rem',
          background: 'var(--ap-surface)',
          padding: '1.5rem',
          borderRadius: '24px',
          border: '1px solid var(--ap-border)',
        }}
      >
        {/* Thermometer Vertical Stack */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column-reverse',
            gap: '8px',
            alignItems: 'stretch',
            padding: '10px',
            background: 'var(--ap-surface-sunken)',
            borderRadius: '20px',
            border: '2px solid var(--ap-border-strong)',
          }}
          role="radiogroup"
          aria-label="Níveis do Termômetro Emocional"
        >
          {THERMOMETER_LEVELS.map((item) => {
            const isSelected = item.level === selectedLevelNum;
            return (
              <button
                key={item.level}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => selectLevel(item.level)}
                style={{
                  height: '52px',
                  background: item.color,
                  borderRadius: '12px',
                  color: '#ffffff',
                  border: isSelected ? '4px solid #ffffff' : 'none',
                  outline: isSelected ? `3px solid ${item.color}` : 'none',
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  cursor: 'pointer',
                  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: isSelected ? `0 4px 14px ${item.color}80` : 'none',
                  transition: 'all 0.2s ease',
                }}
                aria-label={`Nível ${item.level} - ${item.name}`}
              >
                <span>{item.level}</span>
                <span>{item.emoji}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Level Deep Dive */}
        <div
          style={{
            background: activeLevel.bgLight,
            border: `3px solid ${activeLevel.color}`,
            borderRadius: '20px',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1.25rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem' }}>{activeLevel.emoji}</span>
              <div>
                <span style={{ fontSize: 'var(--ap-text-xs)', fontWeight: 800, textTransform: 'uppercase', color: activeLevel.color }}>
                  NÍVEL {activeLevel.level} DA ESCALA DE 5 PONTOS
                </span>
                <h3 style={{ margin: 0, fontSize: '1.5rem', color: activeLevel.color }}>
                  {activeLevel.name}
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
              <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--ap-border)' }}>
                <strong style={{ color: 'var(--ap-text)', display: 'block', fontSize: 'var(--ap-text-xs)', textTransform: 'uppercase' }}>
                  👀 Como parece por fora:
                </strong>
                <span style={{ fontSize: 'var(--ap-text-sm)', fontWeight: 600 }}>{activeLevel.looksLike}</span>
              </div>

              <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--ap-border)' }}>
                <strong style={{ color: 'var(--ap-text)', display: 'block', fontSize: 'var(--ap-text-xs)', textTransform: 'uppercase' }}>
                  🫀 Como sinto no meu corpo:
                </strong>
                <span style={{ fontSize: 'var(--ap-text-sm)', fontWeight: 600 }}>{activeLevel.feelsLike}</span>
              </div>

              <div style={{ background: '#ffffff', padding: '0.85rem 1rem', borderRadius: '12px', border: `2px solid ${activeLevel.color}` }}>
                <strong style={{ color: activeLevel.color, display: 'block', fontSize: 'var(--ap-text-xs)', textTransform: 'uppercase' }}>
                  💡 O que posso fazer para me autorregular:
                </strong>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ap-text)' }}>{activeLevel.whatICanDo}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => void speak(`Nível ${activeLevel.level}: ${activeLevel.name}. ${activeLevel.whatICanDo}`, 'normal')}
            >
              🔊 Ouvir Orientações do Nível
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="ap-xs ap-muted">
          Baseado na Metodologia The Incredible 5-Point Scale (Buron & Curtis, 2003).
        </span>
        <Button variant="default" onClick={() => window.print()} icon={<IconPrinter />}>
          Imprimir Termômetro das 5 Cores
        </Button>
      </div>
    </div>
  );
}
