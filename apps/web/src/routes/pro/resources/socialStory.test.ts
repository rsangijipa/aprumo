import { describe, it, expect } from 'vitest';
import {
  getStoryById,
  validateAnswer,
  SOCIAL_STORIES,
} from './socialStory';

describe('socialStory logic', () => {
  it('contains the 4 core clinical social stories', () => {
    expect(SOCIAL_STORIES.length).toBe(4);
    const ids = SOCIAL_STORIES.map((s) => s.id);
    expect(ids).toContain('esperar-minha-vez');
    expect(ids).toContain('quando-planos-mudam');
    expect(ids).toContain('barulho-alto-sensibilidade');
    expect(ids).toContain('pedir-ajuda-com-calma');
  });

  it('each story has 4 structured slides with titles and texts', () => {
    for (const story of SOCIAL_STORIES) {
      expect(story.slides.length).toBe(4);
      for (const slide of story.slides) {
        expect(slide.title).toBeTruthy();
        expect(slide.text.length).toBeGreaterThan(20);
        expect(slide.emoji).toBeTruthy();
      }
    }
  });

  it('validates comprehension questions correctly', () => {
    // Esperar minha vez: correct answer is index 1
    expect(validateAnswer('esperar-minha-vez', 1)).toBe(true);
    expect(validateAnswer('esperar-minha-vez', 0)).toBe(false);

    // Quando planos mudam: correct answer is index 0
    expect(validateAnswer('quando-planos-mudam', 0)).toBe(true);
    expect(validateAnswer('quando-planos-mudam', 1)).toBe(false);

    // Non-existent story
    expect(validateAnswer('inexistente', 0)).toBe(false);
  });

  it('retrieves story by id', () => {
    const s = getStoryById('esperar-minha-vez');
    expect(s).toBeDefined();
    expect(s?.title).toBe('Esperar a Minha Vez');
  });
});
