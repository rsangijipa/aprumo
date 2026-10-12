import { describe, it, expect } from 'vitest';
import { groupMasteredSteps, getActiveStepTarget } from '../utils/chainAndGrouping';
import type { TaskAnalysisStep } from '../types/routine';

describe('ABA-05: Chaining & Mastered Step Grouping (chainAndGrouping.ts)', () => {
  const sampleSteps: TaskAnalysisStep[] = [
    {
      stepId: 's1',
      order: 1,
      title: 'Abrir torneira',
      shortInstruction: 'Abra a torneira',
      detailDescription: 'Gire o registro',
      iconEmoji: '🚰',
      color: '#0E8388',
      isMastered: true,
      groupWithNext: true,
    },
    {
      stepId: 's2',
      order: 2,
      title: 'Molhar as mãos',
      shortInstruction: 'Molhe as mãos',
      detailDescription: 'Coloque as mãos na água',
      iconEmoji: '💧',
      color: '#2A9D8F',
      isMastered: true,
      groupWithNext: false,
    },
    {
      stepId: 's3',
      order: 3,
      title: 'Passar sabão',
      shortInstruction: 'Passe sabonete',
      detailDescription: 'Faça espuma',
      iconEmoji: '🧼',
      color: '#F4A261',
      isMastered: false,
    },
    {
      stepId: 's4',
      order: 4,
      title: 'Secar as mãos',
      shortInstruction: 'Seque na toalha',
      detailDescription: 'Seque bem',
      iconEmoji: '🧺',
      color: '#2D6A4F',
      isMastered: false,
    },
  ];

  describe('groupMasteredSteps (Esvanecimento de Apoio Visual)', () => {
    it('groups adjacent mastered steps that have groupWithNext enabled', () => {
      const grouped = groupMasteredSteps(sampleSteps);
      // Originally 4 steps; s1 and s2 merged -> 3 steps total
      expect(grouped.length).toBe(3);
      expect(grouped[0].stepId).toBe('s1+s2');
      expect(grouped[0].title).toBe('Abrir torneira e Molhar as mãos');
      expect(grouped[0].order).toBe(1);
      expect(grouped[1].stepId).toBe('s3');
      expect(grouped[1].order).toBe(2);
      expect(grouped[2].stepId).toBe('s4');
      expect(grouped[2].order).toBe(3);
    });

    it('does not group non-mastered steps', () => {
      const allUnmastered = sampleSteps.map((s) => ({ ...s, isMastered: false }));
      const result = groupMasteredSteps(allUnmastered);
      expect(result.length).toBe(4);
    });
  });

  describe('getActiveStepTarget', () => {
    it('handles backward chaining (N=5, k=1)', () => {
      const target = getActiveStepTarget(5, 'reverso', 1);
      // N - k = 4 auto-completed by caregiver (indices 0, 1, 2, 3)
      expect(target.autoCompletedIndices).toEqual([0, 1, 2, 3]);
      // Last 1 step targeted for the learner (index 4)
      expect(target.targetIndices).toEqual([4]);
    });

    it('handles backward chaining with higher k (N=5, k=2)', () => {
      const target = getActiveStepTarget(5, 'reverso', 2);
      expect(target.autoCompletedIndices).toEqual([0, 1, 2]);
      expect(target.targetIndices).toEqual([3, 4]);
    });

    it('handles forward chaining (N=5, k=1)', () => {
      const target = getActiveStepTarget(5, 'direto', 1);
      expect(target.targetIndices).toEqual([0]);
      expect(target.autoCompletedIndices).toEqual([1, 2, 3, 4]);
    });

    it('handles total task (all steps targeted)', () => {
      const target = getActiveStepTarget(4, 'tarefa_total', 1);
      expect(target.targetIndices).toEqual([0, 1, 2, 3]);
      expect(target.autoCompletedIndices).toEqual([]);
    });
  });
});
