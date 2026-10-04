/**
 * Limites padrão de tela por faixa etária (SBP, atualização 2024).
 * Valores conservadores (limite inferior da faixa); o responsável técnico pode ajustar com justificativa.
 */
export interface ScreenPolicy {
  /** Portal infantil disponível? Abaixo de 24 meses, não. */
  childPortalAllowed: boolean;
  dailyLimitMinutes: number;
  /** Duração máxima de um bloco de tela na sessão. */
  maxBlockMinutes: number;
  requiresAdult: boolean;
}

export function ageInMonths(birthDate: Date, at: Date = new Date()): number {
  let m = (at.getFullYear() - birthDate.getFullYear()) * 12 + (at.getMonth() - birthDate.getMonth());
  if (at.getDate() < birthDate.getDate()) m -= 1;
  return m;
}

export function screenPolicyFor(ageMonths: number): ScreenPolicy {
  if (ageMonths < 24) return { childPortalAllowed: false, dailyLimitMinutes: 0, maxBlockMinutes: 0, requiresAdult: true };
  if (ageMonths < 72) return { childPortalAllowed: true, dailyLimitMinutes: 60, maxBlockMinutes: 10, requiresAdult: true };
  if (ageMonths < 132) return { childPortalAllowed: true, dailyLimitMinutes: 60, maxBlockMinutes: 20, requiresAdult: true };
  return { childPortalAllowed: true, dailyLimitMinutes: 120, maxBlockMinutes: 30, requiresAdult: true };
}
