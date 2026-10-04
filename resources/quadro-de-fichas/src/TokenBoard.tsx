/**
 * Quadro de Fichas — economia de fichas.
 * Regras clínicas embutidas no componente:
 *  - o reforçador de troca é escolhido ANTES e fica sempre visível;
 *  - fichas nunca são retiradas (não existe ação de remover ficha);
 *  - quadro cheio → troca com cronômetro visual de acesso e aviso antes do fim.
 */
import { useEffect, useRef, useState } from 'react';
import { RewardIcon, TokenArt, type TokenTheme } from './tokens-art';
import './board.css';

export interface TokenBoardProps {
  theme: TokenTheme;
  required: number;
  earned: number;
  reward: { label: string; category: string };
  /** Duração do acesso ao reforçador na troca. */
  accessSec: number;
  motion: 'full' | 'reduced' | 'static';
  palette?: 'calm' | 'vivid' | 'high-contrast';
  /** Chamado quando o tempo de acesso termina; o host registra EXCHANGE_ENDED e zera o quadro. */
  onExchangeEnd: (endedBy: 'timer' | 'adult') => void;
  onExchangeStart?: () => void;
  layout?: 'rail' | 'full';
}

export function TokenBoard(p: TokenBoardProps) {
  const full = p.earned >= p.required;
  const [left, setLeft] = useState(p.accessSec);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!full) {
      startedRef.current = false;
      setLeft(p.accessSec);
      return;
    }
    if (!startedRef.current) {
      startedRef.current = true;
      p.onExchangeStart?.();
    }
    const id = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);

  useEffect(() => {
    if (full && left === 0) p.onExchangeEnd('timer');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, full]);

  const fraction = p.accessSec ? left / p.accessSec : 0;
  const warn = full && left <= Math.min(10, p.accessSec * 0.25);

  return (
    <section className="qf" data-layout={p.layout ?? 'rail'} data-motion={p.motion} data-palette={p.palette ?? 'calm'} data-full={full} aria-label={`Quadro de fichas: ${Math.min(p.earned, p.required)} de ${p.required}. Prêmio: ${p.reward.label}`}>
      <div className="qf-board">
        <div className="qf-slots">
          {Array.from({ length: p.required }, (_, k) => (
            <span key={k} className="qf-slot" data-filled={k < p.earned}>
              {k < p.earned && <span className="qf-token"><TokenArt theme={p.theme} /></span>}
            </span>
          ))}
        </div>
        <div className="qf-arrow" aria-hidden="true">
          <svg viewBox="0 0 40 24"><path d="M2 12h30M24 4l10 8-10 8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div className="qf-reward" title={p.reward.label}>
          <RewardIcon category={p.reward.category} />
          <span>{p.reward.label}</span>
        </div>
      </div>

      {full && (
        <div className="qf-exchange" role="status" aria-live="polite">
          <div className="qf-exchange__card" data-warn={warn}>
            <svg className="qf-timer" viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgb(0 0 0 / .08)" strokeWidth="12" />
              <circle
                cx="60" cy="60" r="52" fill="none" stroke="var(--qf-timer)" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 52} strokeDashoffset={2 * Math.PI * 52 * (1 - fraction)} transform="rotate(-90 60 60)"
              />
            </svg>
            <div className="qf-exchange__icon"><RewardIcon category={p.reward.category} /></div>
            <strong>{p.reward.label}</strong>
            <span className="qf-exchange__time">{warn ? 'Quase acabando' : `${left} s`}</span>
            <button className="qf-exchange__end" onClick={() => p.onExchangeEnd('adult')}>Encerrar troca</button>
          </div>
        </div>
      )}
    </section>
  );
}
