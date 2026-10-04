import { useState, useEffect } from 'react';
import { Button, Badge } from '@aprumo/ui';
import { speak, playTones } from '@aprumo/game-sdk';
import {
  EMOTION_ZONES,
  type EmotionZoneKey,
  type PresentationMode,
  type BreathingPhase,
  BREATHING_CYCLE,
} from './emotionTree';

export function EmotionTreeStudio() {
  const [mode, setMode] = useState<PresentationMode>('softclay');
  const [selectedZone, setSelectedZone] = useState<EmotionZoneKey>('green');
  const [activeTab, setActiveTab] = useState<'estrategias' | 'respiracao' | 'grounding'>('estrategias');

  // Estado da Respiração Guiada 4-2-4
  const [isBreathing, setIsBreathing] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  // Estado do Grounding 3-2-1
  const [groundingChecks, setGroundingChecks] = useState<Record<string, boolean>>({
    v1: false, v2: false, v3: false,
    t1: false, t2: false,
    s1: false,
  });

  const zone = EMOTION_ZONES[selectedZone];
  const isTeen = mode === 'graphic-novel';

  const handleSelectZone = (key: EmotionZoneKey) => {
    setSelectedZone(key);
    const z = EMOTION_ZONES[key];
    const phrase = isTeen ? z.voicePhraseTeen : z.voicePhraseChild;
    playTones([{ freq: key === 'green' ? 523.25 : key === 'yellow' ? 440 : 392, dur: 0.1, type: 'sine' }], 'normal');
    void speak(phrase, 'normal');
  };

  // Timer para o ciclo de respiração
  useEffect(() => {
    if (!isBreathing) return;

    const interval = window.setInterval(() => {
      setSecondsRemaining((sec) => {
        if (sec > 1) {
          return sec - 1;
        }

        // Transição de fase
        const nextPhaseIdx = (phaseIndex + 1) % BREATHING_CYCLE.length;
        setPhaseIndex(nextPhaseIdx);

        if (nextPhaseIdx === 0) {
          setCyclesCompleted((c) => {
            const nextC = c + 1;
            if (nextC >= 3) {
              setIsBreathing(false);
              playTones([
                { freq: 523.25, dur: 0.15, type: 'sine' },
                { freq: 659.25, dur: 0.15, delay: 0.12, type: 'sine' },
                { freq: 783.99, dur: 0.3, delay: 0.24, type: 'sine' },
              ], 'normal');
              void speak('Excelente! Você completou os 3 ciclos de respiração e seu corpo está mais calmo.', 'normal');
              return 3;
            }
            return nextC;
          });
        }

        const nextPhase = BREATHING_CYCLE[nextPhaseIdx]!;
        playTones([{ freq: nextPhase.name === 'Inspire' ? 440 : nextPhase.name === 'Segure' ? 523.25 : 392, dur: 0.08, type: 'sine' }], 'normal');
        return nextPhase.seconds;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isBreathing, phaseIndex]);

  const currentPhase: BreathingPhase = BREATHING_CYCLE[phaseIndex]!;

  const startBreathing = () => {
    setCyclesCompleted(0);
    setPhaseIndex(0);
    setSecondsRemaining(BREATHING_CYCLE[0]!.seconds);
    setIsBreathing(true);
    void speak('Vamos respirar juntos. Inspire pelo nariz devagar...', 'normal');
  };

  const stopBreathing = () => {
    setIsBreathing(false);
  };

  const toggleGrounding = (k: string) => {
    setGroundingChecks((prev) => ({ ...prev, [k]: !prev[k] }));
    playTones([{ freq: 587.33, dur: 0.08, type: 'sine' }], 'normal');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Barra de Modo (Soft Clay vs Graphic Novel) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="ap-xs ap-muted" style={{ fontWeight: 700 }}>PERFIL VISUAL:</span>
          <button
            type="button"
            className="rs-tab-pill"
            aria-pressed={mode === 'softclay'}
            onClick={() => setMode('softclay')}
          >
            🎨 Soft Clay (Infantil · 2–8 anos)
          </button>
          <button
            type="button"
            className="rs-tab-pill"
            aria-pressed={mode === 'graphic-novel'}
            onClick={() => setMode('graphic-novel')}
          >
            📐 Graphic Novel (Juvenil · 9+ anos)
          </button>
        </div>

        <Badge tone="info">Regulação Somática Baseada em Evidências</Badge>
      </div>

      {/* Árvore / Seletor das 5 Zonas Emocionais */}
      {!isTeen ? (
        /* Modo Soft Clay — Árvore com Folhas e Ramos Emocionais */
        <div
          style={{
            background: 'var(--ap-surface-sunken)',
            borderRadius: '24px',
            border: '2px solid var(--ap-border)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <span className="ap-xs ap-muted" style={{ fontWeight: 800, letterSpacing: '0.05em' }}>
            ÁRVORE DAS EMOÇÕES · TOQUE NO RAMO QUE REPRESENTA COMO SEU CORPO ESTÁ
          </span>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: '0.75rem',
              width: '100%',
              maxWidth: '640px',
            }}
          >
            {(Object.keys(EMOTION_ZONES) as EmotionZoneKey[]).map((k) => {
              const item = EMOTION_ZONES[k];
              const isSelected = selectedZone === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleSelectZone(k)}
                  aria-pressed={isSelected}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem 0.5rem',
                    borderRadius: '20px',
                    border: isSelected ? `3px solid ${item.color}` : '2px solid var(--ap-border)',
                    background: isSelected ? item.bgSoft : 'var(--ap-surface)',
                    cursor: 'pointer',
                    transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                    boxShadow: isSelected ? `0 6px 16px ${item.color}33` : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: item.color,
                      display: 'grid',
                      placeItems: 'center',
                      color: '#ffffff',
                      fontSize: '18px',
                      fontWeight: 800,
                    }}
                  >
                    🍃
                  </div>
                  <strong style={{ fontSize: '12px', color: isSelected ? item.textColor : 'var(--ap-text)', textAlign: 'center' }}>
                    {item.labelChild.split('·')[1]?.trim() || item.labelChild}
                  </strong>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Modo Graphic Novel — Espectro Contemporâneo para Jovens */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            background: 'var(--ap-surface-sunken)',
            padding: '1.25rem',
            borderRadius: '20px',
            border: '1px solid var(--ap-border-strong)',
          }}
        >
          <span className="ap-xs ap-muted" style={{ fontWeight: 800, letterSpacing: '0.05em' }}>
            ESPECTRO DE ATIVAÇÃO AUTONÔMICA E ESTADO EMOCIONAL
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem' }}>
            {(Object.keys(EMOTION_ZONES) as EmotionZoneKey[]).map((k) => {
              const item = EMOTION_ZONES[k];
              const isSelected = selectedZone === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleSelectZone(k)}
                  aria-pressed={isSelected}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem 0.85rem',
                    borderRadius: '12px',
                    border: isSelected ? `2px solid ${item.color}` : '1px solid var(--ap-border)',
                    background: isSelected ? item.bgSoft : 'var(--ap-surface)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <div style={{ width: '14px', height: '14px', borderRadius: '4px', background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', fontWeight: isSelected ? 700 : 500, color: isSelected ? item.textColor : 'var(--ap-text)' }}>
                    {item.labelTeen.split('·')[1]?.trim() || item.labelTeen}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Painel do Estado Emocional Selecionado */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          background: zone.bgSoft,
          borderRadius: '18px',
          border: `2px solid ${zone.color}`,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: zone.color }} />
            <strong style={{ fontSize: 'var(--ap-text-md)', color: zone.textColor }}>
              {isTeen ? zone.labelTeen : zone.labelChild}
            </strong>
          </div>
          <p style={{ margin: '0.35rem 0 0', fontSize: 'var(--ap-text-sm)', color: zone.textColor }}>
            {isTeen ? zone.somaticStateTeen : zone.somaticStateChild}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => void speak(isTeen ? zone.voicePhraseTeen : zone.voicePhraseChild, 'normal')}
          style={{ flexShrink: 0 }}
        >
          🔊 Ouvir
        </Button>
      </div>

      {/* Abas das Ferramentas de Regulação Somática */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--ap-border)', paddingBottom: '0.5rem' }}>
        {(
          [
            ['estrategias', '💡 Estratégias Imediatas'],
            ['respiracao', '🌬️ Respiração Guiada 4-2-4'],
            ['grounding', '🌿 Aterramento 3-2-1'],
          ] as const
        ).map(([tabKey, label]) => (
          <button
            key={tabKey}
            type="button"
            className="rs-tab-pill"
            aria-pressed={activeTab === tabKey}
            onClick={() => setActiveTab(tabKey)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Conteúdo da Aba 1: Estratégias Imediatas */}
      {activeTab === 'estrategias' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {zone.strategies.map((st) => (
            <div
              key={st.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                padding: '1.25rem',
                borderRadius: '16px',
                background: 'var(--ap-surface)',
                border: '1px solid var(--ap-border)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '24px' }}>{st.icon}</span>
                <strong style={{ fontSize: 'var(--ap-text-sm)' }}>{st.title}</strong>
              </div>
              <p className="ap-xs ap-muted" style={{ margin: 0, lineHeight: 1.5 }}>
                {st.instruction}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Conteúdo da Aba 2: Exercício de Respiração Guiada 4-2-4 */}
      {activeTab === 'respiracao' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            padding: '2rem 1.5rem',
            background: 'var(--ap-surface-sunken)',
            borderRadius: '24px',
            border: '2px solid var(--ap-border)',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Badge tone="info">Ciclo {Math.min(cyclesCompleted + 1, 3)} de 3</Badge>
            <span className="ap-xs ap-muted">Respiração Diafragmática Acolhedora</span>
          </div>

          {/* Círculo Animado de Respiração */}
          <div
            style={{
              position: 'relative',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'var(--ap-surface)',
              border: `4px solid ${zone.color}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transform: isBreathing && currentPhase.name === 'Inspire' ? 'scale(1.15)' : isBreathing && currentPhase.name === 'Expire' ? 'scale(0.88)' : 'scale(1)',
              transition: isBreathing ? 'transform 4s ease-in-out' : 'transform 0.4s ease',
              boxShadow: `0 0 24px ${zone.color}33`,
            }}
          >
            <span style={{ fontSize: '2rem', fontWeight: 800, color: zone.textColor }}>
              {isBreathing ? secondsRemaining : '4-2-4'}
            </span>
            <strong style={{ fontSize: '13px', color: 'var(--ap-text-muted)' }}>
              {isBreathing ? currentPhase.name : 'Pronto para começar'}
            </strong>
          </div>

          <p style={{ maxWidth: '420px', margin: 0, fontSize: 'var(--ap-text-sm)', color: 'var(--ap-text)' }}>
            {isBreathing
              ? currentPhase.instruction
              : 'Clique em iniciar para realizar 3 ciclos de respiração lenta. O círculo guia a expansão e o recolhimento.'}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {!isBreathing ? (
              <Button variant="primary" size="lg" onClick={startBreathing}>
                ▶️ Iniciar Respiração Guiada
              </Button>
            ) : (
              <Button variant="ghost" size="lg" onClick={stopBreathing}>
                ⏸️ Pausar Exercício
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo da Aba 3: Aterramento 3-2-1 (Grounding) */}
      {activeTab === 'grounding' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p className="ap-small ap-muted" style={{ margin: 0 }}>
            Técnica de reconexão somática. Notar os estímulos do presente traz a atenção de volta ao corpo:
          </p>

          {/* 3 Coisas que Vejo */}
          <div style={{ background: 'var(--ap-surface)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--ap-border)' }}>
            <strong style={{ fontSize: 'var(--ap-text-sm)', color: 'var(--ap-primary)' }}>👀 3 Coisas que consigo ver:</strong>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {(['v1', 'v2', 'v3'] as const).map((k, i) => (
                <button
                  key={k}
                  type="button"
                  className="rs-tab-pill"
                  aria-pressed={groundingChecks[k]}
                  onClick={() => toggleGrounding(k)}
                >
                  {groundingChecks[k] ? '✓' : '○'} Objeto {i + 1} identificado
                </button>
              ))}
            </div>
          </div>

          {/* 2 Coisas que Posso Tocar */}
          <div style={{ background: 'var(--ap-surface)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--ap-border)' }}>
            <strong style={{ fontSize: 'var(--ap-text-sm)', color: 'var(--ap-primary)' }}>✋ 2 Texturas que posso tocar (mesa, roupa):</strong>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {(['t1', 't2'] as const).map((k, i) => (
                <button
                  key={k}
                  type="button"
                  className="rs-tab-pill"
                  aria-pressed={groundingChecks[k]}
                  onClick={() => toggleGrounding(k)}
                >
                  {groundingChecks[k] ? '✓' : '○'} Toque {i + 1} sentido
                </button>
              ))}
            </div>
          </div>

          {/* 1 Som que Escuto */}
          <div style={{ background: 'var(--ap-surface)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--ap-border)' }}>
            <strong style={{ fontSize: 'var(--ap-text-sm)', color: 'var(--ap-primary)' }}>👂 1 Som ao redor que escuto:</strong>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="rs-tab-pill"
                aria-pressed={groundingChecks.s1}
                onClick={() => toggleGrounding('s1')}
              >
                {groundingChecks.s1 ? '✓ Som percebido e acolhido' : '○ Prestar atenção a um som'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
