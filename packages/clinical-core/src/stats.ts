/** Estatística mínima e transparente usada pelas regras clínicas. Sem dependências externas. */

export function mean(xs: readonly number[]): number {
  if (xs.length === 0) return NaN;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function median(xs: readonly number[]): number {
  if (xs.length === 0) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

/** Desvio-padrão amostral (n − 1). */
export function sd(xs: readonly number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((acc, x) => acc + (x - m) ** 2, 0) / (xs.length - 1));
}

export interface Line {
  slope: number;
  intercept: number;
}

/** Mínimos quadrados sobre x = 0..n−1. */
export function linearTrend(ys: readonly number[]): Line {
  const n = ys.length;
  if (n === 0) return { slope: 0, intercept: NaN };
  if (n === 1) return { slope: 0, intercept: ys[0]! };
  const xm = (n - 1) / 2;
  const ym = mean(ys);
  let num = 0;
  let den = 0;
  ys.forEach((y, x) => {
    num += (x - xm) * (y - ym);
    den += (x - xm) ** 2;
  });
  const slope = num / den;
  return { slope, intercept: ym - slope * xm };
}

function logChoose(n: number, k: number): number {
  let r = 0;
  for (let i = 1; i <= k; i++) r += Math.log(n - k + i) - Math.log(i);
  return r;
}

/** P(X ≥ k) para X ~ Binomial(n, p). */
export function binomialUpperTail(n: number, k: number, p = 0.5): number {
  let total = 0;
  for (let i = k; i <= n; i++) {
    total += Math.exp(logChoose(n, i) + i * Math.log(p) + (n - i) * Math.log(1 - p));
  }
  return Math.min(1, total);
}

/** Menor k tal que P(X ≥ k) < alpha. Retorna n + 1 se nenhum k atinge. */
export function binomialCriticalCount(n: number, alpha = 0.05, p = 0.5): number {
  for (let k = 0; k <= n; k++) if (binomialUpperTail(n, k, p) < alpha) return k;
  return n + 1;
}
