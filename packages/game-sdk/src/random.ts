/** Aleatoriedade reprodutível (mulberry32): a mesma semente gera a mesma sequência de tentativas. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(xs: readonly T[], rnd: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/**
 * Sequência de posições do alvo contrabalanceada: distribuição uniforme entre posições
 * e nunca a mesma posição mais de `maxRun` vezes seguidas (previne controle por posição).
 */
export function counterbalancedPositions(trials: number, fieldSize: number, rnd: () => number, maxRun = 2): number[] {
  if (fieldSize <= 1) return Array.from({ length: trials }, () => 0);
  const pool: number[] = [];
  while (pool.length < trials) pool.push(...shuffle([...Array(fieldSize).keys()], rnd));
  const out: number[] = [];
  const bag = pool.slice(0, trials);
  while (bag.length) {
    const lastRun = out.slice(-maxRun);
    const blocked = lastRun.length === maxRun && lastRun.every((p) => p === lastRun[0]) ? lastRun[0] : undefined;
    let idx = bag.findIndex((p) => p !== blocked);
    if (idx < 0) idx = 0;
    out.push(bag.splice(idx, 1)[0]!);
  }
  return out;
}
