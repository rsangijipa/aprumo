import { describe, it, expect } from 'vitest';
import {
  formatBRL,
  classifyPaymentStrategy,
  calculateChange,
  generatePaymentProblem,
} from '../utils/money';

describe('ABA-06: Money Engine (money.ts)', () => {
  describe('formatBRL', () => {
    it('formats integer cents into standard Brazilian currency format', () => {
      // Normalizes non-breaking spaces for reliable comparison
      const normalize = (s: string) => s.replace(/\u00a0/g, ' ');

      expect(normalize(formatBRL(0))).toBe('R$ 0,00');
      expect(normalize(formatBRL(50))).toBe('R$ 0,50');
      expect(normalize(formatBRL(350))).toBe('R$ 3,50');
      expect(normalize(formatBRL(1000))).toBe('R$ 10,00');
      expect(normalize(formatBRL(9990))).toBe('R$ 99,90');
    });
  });

  describe('classifyPaymentStrategy (Estratégia de Pagamento)', () => {
    it('classifies exact payment', () => {
      expect(classifyPaymentStrategy(350, 350)).toBe('exato');
      expect(classifyPaymentStrategy(1000, 1000)).toBe('exato');
    });

    it('classifies insufficient payment', () => {
      expect(classifyPaymentStrategy(350, 300)).toBe('insuficiente');
      expect(classifyPaymentStrategy(1000, 500)).toBe('insuficiente');
    });

    it('classifies "um-real-a-mais" (next dollar strategy)', () => {
      // Price R$ 3,50, paid R$ 4,00 (difference 50¢ < 100¢)
      expect(classifyPaymentStrategy(350, 400)).toBe('um-real-a-mais');

      // Price R$ 7,80, paid R$ 8,00 (difference 20¢ < 100¢)
      expect(classifyPaymentStrategy(780, 800)).toBe('um-real-a-mais');

      // Price R$ 3,50, paid with single R$ 5,00 note
      expect(classifyPaymentStrategy(350, 500, 500)).toBe('um-real-a-mais');
    });

    it('classifies excess payment beyond next-dollar rule', () => {
      // Price R$ 2,50, paid R$ 10,00 with multiple notes
      expect(classifyPaymentStrategy(250, 1000)).toBe('excesso');
    });
  });

  describe('calculateChange', () => {
    it('calculates integer cents change accurately without float errors', () => {
      expect(calculateChange(350, 400)).toBe(50);
      expect(calculateChange(780, 1000)).toBe(220);
      expect(calculateChange(500, 500)).toBe(0);
      expect(calculateChange(1000, 800)).toBe(0);
    });
  });

  describe('Monte Carlo Simulation: 10,000 combinations without float errors', () => {
    it('verifies integer cent arithmetic across 10,000 combinations', () => {
      for (let i = 0; i < 10000; i++) {
        // Random price between 5 cents and 100 reais
        const price = Math.floor(Math.random() * 9995) + 5;
        // Random payment
        const paid = Math.floor(Math.random() * 12000);

        const change = calculateChange(price, paid);
        expect(Number.isInteger(change)).toBe(true);
        expect(change).toBeGreaterThanOrEqual(0);

        const strategy = classifyPaymentStrategy(price, paid);
        expect(['exato', 'um-real-a-mais', 'excesso', 'insuficiente']).toContain(strategy);
      }
    });

    it('verifies generatePaymentProblem provides a valid payable wallet', () => {
      for (let lvl = 1; lvl <= 6; lvl++) {
        const problem = generatePaymentProblem(lvl);
        const totalWalletCents = problem.wallet.reduce((acc, c) => acc + c.cents, 0);
        expect(totalWalletCents).toBeGreaterThanOrEqual(problem.priceCents);
      }
    });
  });
});
