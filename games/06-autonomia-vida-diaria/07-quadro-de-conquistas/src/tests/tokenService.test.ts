import { describe, it, expect, beforeEach } from 'vitest';
import { TokenService } from '../services/tokenService';
import type { TeenGoal } from '../types/tokens';

describe('ABA-04: Token Service (tokenService.ts)', () => {
  let service: TokenService;

  beforeEach(() => {
    service = new TokenService('inicial');
  });

  describe('Fase de Pareamento (Pairing Phase)', () => {
    it('enforces N=1 in pairing phase and blocks N > 1', () => {
      const pairingService = new TokenService('pareamento');
      expect(pairingService.getState().targetSlots).toBe(1);

      const result = pairingService.setTargetSlots(3);
      expect(result.success).toBe(false);
      expect(pairingService.getState().targetSlots).toBe(1);
    });

    it('blocks advancing from pairing to higher phase before 5 successful exchanges', () => {
      const pairingService = new TokenService('pareamento');
      const advanceResult = pairingService.setPhase('inicial');
      expect(advanceResult.success).toBe(false);

      // Perform 5 successful exchanges
      for (let i = 0; i < 5; i++) {
        pairingService.award('foco', 'Completou resposta');
        pairingService.completeExchange();
      }

      expect(pairingService.getState().pairingSuccessCount).toBe(5);

      // Now advancing should succeed
      const allowedResult = pairingService.setPhase('inicial');
      expect(allowedResult.success).toBe(true);
      expect(pairingService.getState().phase).toBe('inicial');
    });
  });

  describe('Idempotência de Entrega de Fichas', () => {
    it('prevents duplicate token delivery when same idempotency key is provided', () => {
      const key = 'test-sync-12345';
      const first = service.award('contato-visual', 'Olhou nos olhos', 'jogo', 1, key);
      expect(first.success).toBe(true);
      expect(first.isDuplicate).toBe(false);
      expect(service.getState().currentTokens).toBe(1);

      // Second delivery with identical key (e.g. network retry from tablet)
      const second = service.award('contato-visual', 'Olhou nos olhos', 'jogo', 1, key);
      expect(second.success).toBe(true);
      expect(second.isDuplicate).toBe(true);
      // Tokens must NOT increase!
      expect(service.getState().currentTokens).toBe(1);
    });
  });

  describe('Custo de Resposta (Response Cost Safety Guards)', () => {
    it('blocks token deduction when response cost is disabled by default', () => {
      service.award('tarefa', 'Fez lição', 'jogo', 3);
      expect(service.getState().currentTokens).toBe(3);

      const res = service.applyResponseCost(1, 'Jogou o lápis no chão');
      expect(res.success).toBe(false);
      expect(service.getState().currentTokens).toBe(3); // Unchanged
    });

    it('blocks token deduction without clinical justification even if enabled', () => {
      service.setResponseCostConfig(true);
      service.award('tarefa', 'Fez lição', 'jogo', 3);

      const res = service.applyResponseCost(1, '');
      expect(res.success).toBe(false);
      expect(service.getState().currentTokens).toBe(3);
    });

    it('allows deduction only when enabled AND supervisor supplies valid justification', () => {
      service.setResponseCostConfig(true);
      service.award('tarefa', 'Fez lição', 'jogo', 3);

      const res = service.applyResponseCost(1, 'Protocolo aprovado pelo supervisor BCBA para agressão física.');
      expect(res.success).toBe(true);
      expect(service.getState().currentTokens).toBe(2);
    });
  });

  describe('Concordância de Automonitoramento (Adolescentes)', () => {
    it('calculates percentage of concordance accurately', () => {
      const goals: TeenGoal[] = [
        { id: '1', title: 'Guardou material', description: '', points: 5, selfReported: true, therapistConfirmed: true, category: 'autonomia' },
        { id: '2', title: 'Pediu intervalo com educação', description: '', points: 5, selfReported: true, therapistConfirmed: true, category: 'comunicacao' },
        { id: '3', title: 'Esperou a vez de falar', description: '', points: 5, selfReported: true, therapistConfirmed: false, category: 'social' }, // Disagreement
        { id: '4', title: 'Completou a folha', description: '', points: 10, selfReported: false, therapistConfirmed: false, category: 'tarefa' },
      ];

      // 3 concordant out of 4 = 75%
      const concordance = TokenService.calculateConcordance(goals);
      expect(concordance).toBe(75);
    });
  });
});
