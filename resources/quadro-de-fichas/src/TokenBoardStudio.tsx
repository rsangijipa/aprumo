/**
 * Token Board interativo (Wave 4) — entrega de fichas controlada pelo terapeuta.
 *  - 1, 2, 3, 5, 8 ou 10 fichas; 8 temas em SVG próprio; variante sóbria para ≥10 anos;
 *  - slot do reforçador de troca sempre visível ("Estou trabalhando para…");
 *  - emite TOKEN_DELIVERED e BOARD_COMPLETED (payloads do @aprumo/protocol);
 *  - "Desfazer última" corrige toque acidental (não é custo de resposta);
 *  - celebração calma: sem animação com movimento estático ou sensorial mínimo.
 */
import { useState } from 'react';
import {
  celebrationLevel, deliverToken, initialBoard, normalizeTokenCount, resetBoard, resolveTheme, resolveVariant, undoToken,
  type BoardEvent, type BoardState, type Variant,
} from './logic';
import { RewardIcon, TokenArt } from './tokens-art';
import './studio.css';

export interface TokenBoardStudioProps {
  boardId: string;
  theme: string;
  /** Normalizado para 1, 2, 3, 5, 8 ou 10. */
  tokens: number;
  /** Reforçador de troca (backup). Sem ele, a entrega fica bloqueada. */
  reward: { id: string; label: string; category: string } | null;
  motion: 'full' | 'reduced' | 'static';
  sensory?: 'minimal' | 'normal' | 'rich';
  palette?: 'calm' | 'vivid' | 'high-contrast';
  ageYears?: number | null;
  variant?: Variant;
  /** Alvo/resposta que produziu a ficha (vai em TOKEN_DELIVERED.contingentOn). */
  contingentOn?: string | null;
  initialEarned?: number;
  onEvent: (e: BoardEvent) => void;
  onUndo?: (info: { tokenIndex: number; reopened: boolean }) => void;
  onReset?: () => void;
}

export function TokenBoardStudio(p: TokenBoardStudioProps) {
  const required = normalizeTokenCount(p.tokens);
  const theme = resolveTheme(p.theme);
  const variant = resolveVariant({ variant: p.variant, ageYears: p.ageYears });
  const celebrate = celebrationLevel(p.motion, p.sensory);
  const [s, setS] = useState<BoardState>(() => initialBoard(Math.min(p.initialEarned ?? 0, required)));
  const cfg = { boardId: p.boardId, required, backupReinforcerId: p.reward?.id ?? '' };

  const deliver = () => {
    if (!p.reward) return;
    const r = deliverToken(s, cfg, p.contingentOn ?? null);
    setS(r.state);
    r.events.forEach(p.onEvent);
  };
  const undo = () => {
    const r = undoToken(s);
    setS(r.state);
    if (r.undoneIndex !== null) p.onUndo?.({ tokenIndex: r.undoneIndex, reopened: r.reopened });
  };
  const reset = () => {
    setS(resetBoard());
    p.onReset?.();
  };

  return (
    <section
      className="qfs" data-variant={variant} data-motion={p.motion} data-sensory={p.sensory ?? 'normal'}
      data-palette={p.palette ?? 'calm'} data-count={required} data-complete={s.completed}
      aria-label={`Quadro de fichas: ${s.earned} de ${required}`}
    >
      <header className="qfs-goal">
        <span className="qfs-goal__kicker">Estou trabalhando para…</span>
        {p.reward ? (
          <span className="qfs-goal__reward"><RewardIcon category={p.reward.category} /><strong>{p.reward.label}</strong></span>
        ) : (
          <span className="qfs-goal__empty">Escolha o reforçador de troca antes de começar</span>
        )}
      </header>

      <ol className="qfs-slots" aria-hidden="true">
        {Array.from({ length: required }, (_, k) => (
          <li key={k} className="qfs-slot" data-filled={k < s.earned}>
            {k < s.earned ? (
              <span className="qfs-token"><TokenArt theme={theme} variant={variant} index={k} /></span>
            ) : (
              <span className="qfs-slot__n">{k + 1}</span>
            )}
          </li>
        ))}
      </ol>

      <p className="qfs-status" role="status" aria-live="polite">
        {s.completed && p.reward ? (
          <span className="qfs-done" data-level={celebrate}>Quadro completo! Hora de: <strong>{p.reward.label}</strong></span>
        ) : (
          `${s.earned} de ${required} fichas`
        )}
      </p>

      <div className="qfs-controls" role="group" aria-label="Controles do terapeuta">
        <button type="button" className="qfs-btn qfs-btn--primary" onClick={deliver} disabled={!p.reward || s.completed}>Entregar ficha</button>
        <button type="button" className="qfs-btn" onClick={undo} disabled={s.earned === 0}>Desfazer última</button>
        <button type="button" className="qfs-btn qfs-btn--ghost" onClick={reset} disabled={s.earned === 0}>Recomeçar</button>
      </div>
    </section>
  );
}
