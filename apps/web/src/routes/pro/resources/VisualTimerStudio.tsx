import { useState, useEffect, useRef } from 'react';
import { Button } from '@aprumo/ui';
import { speak, playTones } from '@aprumo/game-sdk';

export function VisualTimerStudio() {
  const [totalSeconds, setTotalSeconds] = useState(120);
  const [remaining, setRemaining] = useState(120);
  const [running, setRunning] = useState(false);
  const [chime, setChime] = useState(true);
  const [warningChime, setWarningChime] = useState(true);
  const [voicePrompt, setVoicePrompt] = useState(true);
  const [activityName, setActivityName] = useState('Atividade Atual');
  const warnedRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    warnedRef.current = false;

    const interval = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setRunning(false);

          if (chime) {
            playTones([
              { freq: 523.25, dur: 0.15, type: 'sine' },
              { freq: 659.25, dur: 0.15, delay: 0.15, type: 'sine' },
              { freq: 783.99, dur: 0.35, delay: 0.3, type: 'sine' },
              { freq: 1046.5, dur: 0.5, delay: 0.5, type: 'sine' },
            ], 'normal');
          }

          if (voicePrompt) {
            void speak(`Tempo da atividade ${activityName} finalizado! Muito bem!`, 'normal');
          }

          return 0;
        }

        // Warning at 10 seconds
        if (prev === 11 && !warnedRef.current) {
          warnedRef.current = true;
          if (warningChime) {
            playTones([
              { freq: 440, dur: 0.1, type: 'sine' },
              { freq: 440, dur: 0.1, delay: 0.15, type: 'sine' },
            ], 'normal');
          }
          if (voicePrompt) {
            void speak('Faltam 10 segundos!', 'normal');
          }
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [running, chime, warningChime, voicePrompt, activityName]);

  const selectPreset = (secs: number) => {
    setTotalSeconds(secs);
    setRemaining(secs);
    setRunning(false);
    warnedRef.current = false;
  };

  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Dynamic color shift
  const progressColor =
    progress > 0.5
      ? 'var(--ap-primary, #0d9488)'
      : progress > 0.2
      ? '#d97706' // amber
      : '#e11d48'; // rose

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
      {/* Activity Label & Edit */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', maxWidth: '420px' }}>
        <label className="ap-field" style={{ width: '100%' }}>
          <span className="ap-label">Nome da Atividade / Transição:</span>
          <input
            type="text"
            className="ap-input"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
            placeholder="Ex: Tempo de Mesa, Massinha, Intervalo"
            aria-label="Nome da atividade"
          />
        </label>
      </div>

      {/* Visual Circle Timer */}
      <div
        className="rs-timer-circle"
        style={{ position: 'relative', width: '240px', height: '240px', display: 'grid', placeItems: 'center' }}
        role="timer"
        aria-live="polite"
        aria-label={`Tempo restante: ${formatted} para ${activityName}`}
      >
        <svg viewBox="0 0 220 220" width="240" height="240">
          <circle cx="110" cy="110" r={radius} fill="none" stroke="var(--ap-border, #e2e8f0)" strokeWidth="18" />
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth="18"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 110 110)"
            style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
            {formatted}
          </span>
          <span className="ap-xs ap-muted" style={{ fontWeight: 600, maxWidth: '140px' }}>
            {remaining === 0 ? 'Tempo concluído! 🎉' : running ? 'Em andamento...' : 'Pausado'}
          </span>
        </div>
      </div>

      {/* Presets */}
      <div
        style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}
        role="group"
        aria-label="Durações pré-definidas"
      >
        {[
          [30, '30s'],
          [60, '1 min'],
          [120, '2 min'],
          [180, '3 min'],
          [300, '5 min'],
          [600, '10 min'],
          [900, '15 min'],
        ].map(([s, label]) => (
          <button
            key={s}
            type="button"
            className="rs-tab-pill"
            aria-pressed={totalSeconds === s}
            onClick={() => selectPreset(Number(s))}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          variant={running ? 'default' : 'primary'}
          size="lg"
          onClick={() => setRunning(!running)}
          aria-label={running ? 'Pausar temporizador' : 'Iniciar temporizador'}
        >
          {running ? '⏸ Pausar' : '▶ Iniciar Timer'}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setRemaining(totalSeconds);
            setRunning(false);
            warnedRef.current = false;
          }}
        >
          🔄 Reiniciar
        </Button>
        <Button variant="ghost" aria-pressed={chime} onClick={() => setChime(!chime)}>
          {chime ? '🔔 Sinal Ativo' : '🔕 Mudo'}
        </Button>
        <Button variant="ghost" aria-pressed={warningChime} onClick={() => setWarningChime(!warningChime)}>
          {warningChime ? '⚠️ Alerta 10s' : '🔕 Sem Alerta'}
        </Button>
        <Button variant="ghost" aria-pressed={voicePrompt} onClick={() => setVoicePrompt(!voicePrompt)}>
          {voicePrompt ? '🗣 Voz Ativa' : '🤐 Sem Voz'}
        </Button>
      </div>

      {/* Printable Transition Card Section */}
      <div
        className="rs-print-card"
        style={{
          marginTop: '1.5rem',
          padding: '1.25rem',
          border: '2px dashed var(--ap-border-strong, #cbd5e1)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '500px',
          textAlign: 'center',
          background: 'var(--ap-surface-sunken, #f8fafc)',
        }}
      >
        <span className="ap-xs ap-muted" style={{ fontWeight: 700, textTransform: 'uppercase' }}>
          Cartão Visual Imprimível de Transição
        </span>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.4rem', color: 'var(--ap-text)' }}>
          ⏳ {activityName}
        </div>
        <p className="ap-xs ap-muted" style={{ margin: '0.4rem 0 0.8rem' }}>
          Duração planejada: {Math.ceil(totalSeconds / 60)} min · Quando o timer tocar, encerramos esta etapa.
        </p>
        <Button variant="ghost" size="sm" onClick={() => window.print()}>
          🖨 Imprimir Cartão de Transição
        </Button>
      </div>
    </div>
  );
}
