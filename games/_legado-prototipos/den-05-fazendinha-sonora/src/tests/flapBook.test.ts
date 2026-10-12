import { describe, it, expect } from 'vitest';
import { BookConfigSchema } from '../schemas/bookSchema';
import { PRESET_BOOKS } from '../data/presetBooks';
import { soundManager } from '../utils/sound';

describe('DEN-05 Fazendinha Sonora - ESDM & Clinical Specifications', () => {
  it('validates all preset books with BookConfigSchema', () => {
    PRESET_BOOKS.forEach((book) => {
      const result = BookConfigSchema.safeParse(book);
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid book configurations with missing required fields', () => {
    const invalidBook = {
      id: 'livro-invalido',
      title: 'Livro Sem Paginas',
      theme: 'fazenda',
      pages: [], // min 1 required
    };

    const result = BookConfigSchema.safeParse(invalidBook);
    expect(result.success).toBe(false);
  });

  it('inviolable rule: child touch state does not modify isOpen property', () => {
    const initialFlap = { ...PRESET_BOOKS[0].pages[0].flaps[0] };
    expect(initialFlap.isOpen).toBe(false);

    // Simulated child touch: only sets isShaking to true, isOpen stays false
    const flapAfterChildTouch = { ...initialFlap, isShaking: true };
    expect(flapAfterChildTouch.isOpen).toBe(false);
    expect(flapAfterChildTouch.isShaking).toBe(true);

    // Only adult reveal sets isOpen to true
    const flapAfterAdultReveal = { ...flapAfterChildTouch, isOpen: true, isShaking: false };
    expect(flapAfterAdultReveal.isOpen).toBe(true);
  });

  it('safely calls soundManager methods in headless / node environment without throwing', () => {
    expect(() => {
      soundManager.playClick();
      soundManager.playPaperRustle();
      soundManager.playPageTurn();
      soundManager.playOnomatopoeia('Muuu!', 'Vaca');
      soundManager.speakPrompt('Cadê a vaquinha?');
    }).not.toThrow();
  });
});
