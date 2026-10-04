import { describe, expect, it } from 'vitest';
import {
  DEFAULT_MASTERY,
  binomialCriticalCount,
  conservativeDualCriterion,
  evaluateMastery,
  evaluateRules,
  linearTrend,
  screenPolicyFor,
  summarizeByTargetSession,
  summarizeTargetSession,
  type TrialFact,
} from './index';

const day = (d: number) => new Date(Date.UTC(2026, 8, d, 14)).toISOString();

function session(
  sessionId: string,
  d: number,
  pattern: ReadonlyArray<readonly [TrialFact['response'], number]>,
  extra: Partial<TrialFact> = {},
): TrialFact[] {
  return pattern.map(([response, promptIntrusiveness], i) => ({
    targetId: 't1',
    sessionId,
    sessionAt: day(d),
    phase: 'acquisition',
    response,
    promptIntrusiveness,
    promptCode: promptIntrusiveness === 0 ? 'IND' : 'GES',
    latencyMs: 1000 + i * 100,
    channel: 'table',
    setting: 'clinic',
    implementerId: 'ana',
    ...extra,
  }));
}

const rep = <T,>(x: T, n: number) => Array.from({ length: n }, () => x);

describe('summarizeTargetSession', () => {
  it('nunca conta acerto com dica como independente', () => {
    const s = summarizeTargetSession(session('s1', 1, rep(['correct', 1] as const, 10)));
    expect(s.pctIndependent).toBe(0);
    expect(s.pctPrompted).toBe(100);
  });

  it('recusa agregar alvos diferentes', () => {
    const a = session('s1', 1, [['correct', 0]]);
    const b = session('s1', 1, [['correct', 0]], { targetId: 't2' });
    expect(() => summarizeTargetSession([...a, ...b])).toThrow(/never aggregate/);
  });
});

describe('evaluateMastery', () => {
  it('exige sessões consecutivas no nível e com mínimo de oportunidades', () => {
    const facts = [
      ...session('s1', 1, [...rep(['correct', 0] as const, 9), ['incorrect', 0]]),
      ...session('s2', 2, rep(['correct', 0] as const, 10)),
    ];
    const r1 = evaluateMastery(summarizeByTargetSession(facts), DEFAULT_MASTERY);
    expect(r1.met).toBe(true);

    const few = session('s3', 3, rep(['correct', 0] as const, 5));
    const r2 = evaluateMastery(summarizeByTargetSession([...facts, ...few]), DEFAULT_MASTERY);
    expect(r2.met).toBe(false);
  });

  it('uma única sessão a 100% não demonstra domínio', () => {
    const r = evaluateMastery(summarizeByTargetSession(session('s1', 1, rep(['correct', 0] as const, 10))), DEFAULT_MASTERY);
    expect(r.met).toBe(false);
  });
});

describe('estatística', () => {
  it('tendência linear', () => {
    expect(linearTrend([1, 2, 3, 4]).slope).toBeCloseTo(1);
  });
  it('valor crítico binomial para n = 10 é 9', () => {
    expect(binomialCriticalCount(10)).toBe(9);
  });
});

describe('CDC', () => {
  it('não se aplica com menos de 5 pontos', () => {
    expect(conservativeDualCriterion([10, 20], [50, 60, 70, 80, 90]).applicable).toBe(false);
  });
  it('detecta mudança sistemática clara', () => {
    const r = conservativeDualCriterion([10, 12, 9, 11, 10], [60, 70, 75, 80, 85, 90]);
    expect(r.applicable && r.systematic).toBe(true);
  });
  it('não detecta mudança em série estável', () => {
    const r = conservativeDualCriterion([40, 42, 38, 41, 39], [40, 41, 39, 42, 38]);
    expect(r.applicable && r.systematic).toBe(false);
  });
});

describe('regras', () => {
  const now = new Date(day(20));
  const target = (facts: TrialFact[], phase: TrialFact['phase'] = 'acquisition') => ({
    targetId: 't1',
    name: 'Ouvinte — bola',
    phase,
    teachingChannel: 'table' as const,
    criteria: DEFAULT_MASTERY,
    summaries: summarizeByTargetSession(facts),
    recentTrials: facts,
  });

  it('R2 dispara com 6 sessões sem tendência ascendente', () => {
    const facts = [1, 2, 3, 4, 5, 6].flatMap((d) =>
      session(`s${d}`, d + 10, [...rep(['correct', 0] as const, 4), ...rep(['incorrect', 0] as const, 6)]),
    );
    const alerts = evaluateRules({ now, targets: [target(facts)] });
    expect(alerts.map((a) => a.ruleId)).toContain('R2');
  });

  it('R3 dispara com dependência de dica', () => {
    const facts = [1, 2, 3, 4].flatMap((d) => session(`s${d}`, d + 15, rep(['correct', 1] as const, 10)));
    expect(evaluateRules({ now, targets: [target(facts)] }).map((a) => a.ruleId)).toContain('R3');
  });

  it('R8 detecta viés de posição', () => {
    const facts = session('s1', 19, rep(['incorrect', 0] as const, 20)).map((t, i) => ({
      ...t,
      fieldSize: 3,
      positionOfTarget: i % 3,
      selectedPosition: 0,
    }));
    expect(evaluateRules({ now, targets: [target(facts)] }).map((a) => a.ruleId)).toContain('R8');
  });

  it('R13 respeita o limite de tela', () => {
    const alerts = evaluateRules({ now, screenTime: { minutesToday: 75, limitMinutes: 60 } });
    expect(alerts[0]?.ruleId).toBe('R13');
  });
});

describe('política de tela', () => {
  it('sem portal infantil abaixo de 24 meses', () => {
    expect(screenPolicyFor(18).childPortalAllowed).toBe(false);
    expect(screenPolicyFor(36).maxBlockMinutes).toBe(10);
  });
});
