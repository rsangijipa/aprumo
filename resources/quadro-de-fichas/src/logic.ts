/**
 * Lógica pura do Quadro de Fichas (sem React) — testável e determinística.
 * Entrega de fichas é sempre controlada pelo terapeuta (previsível); "desfazer" corrige um
 * toque acidental e NÃO é custo de resposta (fichas conquistadas não são retiradas como punição).
 */
import type { EventPayload } from '@aprumo/protocol';

export const TOKEN_COUNTS = [1, 2, 3, 5, 8, 10] as const;
export type TokenCount = (typeof TOKEN_COUNTS)[number];

export const BOARD_THEMES = ['planetas', 'dinossauros', 'trens', 'carros', 'animais', 'flores', 'formas', 'puzzle'] as const;
export type BoardTheme = (typeof BOARD_THEMES)[number];
/** Temas da versão 1 (ainda renderizados para casos já configurados). */
export const LEGACY_THEMES = ['estrela', 'trem', 'dinossauro', 'coracao', 'folha', 'bola'] as const;
export type LegacyTheme = (typeof LEGACY_THEMES)[number];

/** Tema neutro usado quando o tema é desconhecido. */
export const NEUTRAL_THEME: BoardTheme = 'formas';
/** A partir desta idade usa-se a variante sóbria (sem infantilizar adolescentes). */
export const SOBER_FROM_AGE = 10;

export type Variant = 'playful' | 'sober';

export function isTokenCount(n: unknown): n is TokenCount {
  return typeof n === 'number' && (TOKEN_COUNTS as readonly number[]).includes(n);
}

/** Converte qualquer número para a quantidade suportada mais próxima (empate → a menor). */
export function normalizeTokenCount(n: number): TokenCount {
  if (!Number.isFinite(n)) return 5;
  let best: TokenCount = TOKEN_COUNTS[0];
  for (const c of TOKEN_COUNTS) if (Math.abs(c - n) < Math.abs(best - n)) best = c;
  return best;
}

export function isBoardTheme(t: unknown): t is BoardTheme {
  return typeof t === 'string' && (BOARD_THEMES as readonly string[]).includes(t);
}
export function isLegacyTheme(t: unknown): t is LegacyTheme {
  return typeof t === 'string' && (LEGACY_THEMES as readonly string[]).includes(t);
}

/** Variante visual: explícita > idade (≥10 anos → sóbria) > lúdica. */
export function resolveVariant(opts: { variant?: Variant; ageYears?: number | null }): Variant {
  if (opts.variant) return opts.variant;
  return opts.ageYears != null && opts.ageYears >= SOBER_FROM_AGE ? 'sober' : 'playful';
}

/** Tema efetivo: temas antigos continuam válidos; desconhecido → neutro. */
export function resolveTheme(t: unknown): BoardTheme | LegacyTheme {
  if (isBoardTheme(t) || isLegacyTheme(t)) return t;
  return NEUTRAL_THEME;
}

export interface BoardConfig {
  boardId: string;
  required: number;
  backupReinforcerId: string;
}

export function validateBoardConfig(c: { required: unknown; theme?: unknown; backupReinforcerId?: unknown }): string[] {
  const errors: string[] = [];
  if (!isTokenCount(c.required)) errors.push(`Quantidade de fichas inválida: use ${TOKEN_COUNTS.join(', ')}.`);
  if (c.theme !== undefined && !isBoardTheme(c.theme) && !isLegacyTheme(c.theme)) errors.push('Tema desconhecido.');
  if (c.backupReinforcerId !== undefined && (typeof c.backupReinforcerId !== 'string' || !c.backupReinforcerId.trim()))
    errors.push('Escolha o reforçador de troca antes de começar.');
  return errors;
}

export interface BoardState {
  earned: number;
  completed: boolean;
}

export type BoardEvent =
  | { type: 'TOKEN_DELIVERED'; payload: EventPayload<'TOKEN_DELIVERED'> }
  | { type: 'BOARD_COMPLETED'; payload: EventPayload<'BOARD_COMPLETED'> };

export const initialBoard = (earned = 0): BoardState => ({ earned: Math.max(0, earned), completed: false });

/** Entrega uma ficha. Quadro cheio → nada acontece (sem eventos). */
export function deliverToken(
  s: BoardState,
  cfg: BoardConfig,
  contingentOn: string | null = null,
): { state: BoardState; events: BoardEvent[] } {
  const required = Math.max(1, Math.floor(cfg.required));
  if (s.completed || s.earned >= required) return { state: s, events: [] };
  const earned = s.earned + 1;
  const events: BoardEvent[] = [
    { type: 'TOKEN_DELIVERED', payload: { boardId: cfg.boardId, tokenIndex: s.earned, tokensRequired: required, contingentOn } },
  ];
  const completed = earned >= required;
  if (completed) events.push({ type: 'BOARD_COMPLETED', payload: { boardId: cfg.boardId, backupReinforcerId: cfg.backupReinforcerId } });
  return { state: { earned, completed }, events };
}

/** Desfaz a última ficha (correção de toque acidental). */
export function undoToken(s: BoardState): { state: BoardState; undoneIndex: number | null; reopened: boolean } {
  if (s.earned <= 0) return { state: s, undoneIndex: null, reopened: false };
  return { state: { earned: s.earned - 1, completed: false }, undoneIndex: s.earned - 1, reopened: s.completed };
}

export const resetBoard = (): BoardState => initialBoard();

/** Celebração: estática quando movimento estático ou sensorial mínimo; suave quando reduzido. */
export function celebrationLevel(motion: 'full' | 'reduced' | 'static', sensory: 'minimal' | 'normal' | 'rich' = 'normal'): 'none' | 'soft' | 'glow' {
  if (motion === 'static' || sensory === 'minimal') return 'none';
  if (motion === 'reduced') return 'soft';
  return 'glow';
}
