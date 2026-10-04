import { describe, it, expect } from 'vitest';
import {
  buildSpokenSentence,
  filterVocabularyByCategory,
  getDirectChoicePresets,
  SENTENCE_STARTERS,
  AAC_VOCABULARY,
} from './aac';

describe('aac / CAA logic', () => {
  it('builds clear spoken sentences for TTS', () => {
    const starter = 'Eu quero';
    const items = [
      { id: 'agua', label: 'Água', category: 'alimentos', emoji: '💧', speechText: 'água' } as const,
      { id: 'biscoito', label: 'Biscoito', category: 'alimentos', emoji: '🍪', speechText: 'biscoito' } as const,
    ];

    expect(buildSpokenSentence(starter, [])).toBe('Eu quero');
    expect(buildSpokenSentence(starter, items)).toBe('Eu quero água, biscoito');
  });

  it('filters vocabulary accurately by category', () => {
    const all = filterVocabularyByCategory(AAC_VOCABULARY, 'todos');
    expect(all.length).toBe(AAC_VOCABULARY.length);

    const alimentos = filterVocabularyByCategory(AAC_VOCABULARY, 'alimentos');
    expect(alimentos.length).toBeGreaterThan(0);
    expect(alimentos.every((x) => x.category === 'alimentos')).toBe(true);

    const acoes = filterVocabularyByCategory(AAC_VOCABULARY, 'acoes');
    expect(acoes.length).toBeGreaterThan(0);
    expect(acoes.every((x) => x.category === 'acoes')).toBe(true);
  });

  it('provides direct choice presets with requested count (2, 3, 4)', () => {
    const c2 = getDirectChoicePresets('brinquedos', 2);
    expect(c2.length).toBe(2);

    const c3 = getDirectChoicePresets('alimentos', 3);
    expect(c3.length).toBe(3);

    const c4 = getDirectChoicePresets('pausas', 4);
    expect(c4.length).toBe(4);
  });

  it('has valid sentence starters with clear labels', () => {
    expect(SENTENCE_STARTERS.length).toBeGreaterThanOrEqual(4);
    for (const starter of SENTENCE_STARTERS) {
      expect(starter.prefix).toBeTruthy();
      expect(starter.emoji).toBeTruthy();
    }
  });
});
