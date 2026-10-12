import { describe, expect, it } from 'vitest';
import { GAMES } from './registry';
import { GAME_INTRODUCTIONS, isGameAgeAppropriate } from './narration';

describe('acolhimento narrado e elegibilidade', () => {
  it('tem roteiro narrável e apoio visual em todos os jogos registrados', () => {
    expect(Object.keys(GAME_INTRODUCTIONS).sort()).toEqual(Object.keys(GAMES).sort());
    for (const intro of Object.values(GAME_INTRODUCTIONS)) {
      expect(intro.mission.length).toBeGreaterThan(12);
      expect(intro.howToPlay.length).toBeGreaterThan(25);
      expect(intro.therapistTip.length).toBeGreaterThan(15);
    }
  });

  it('respeita os dois limites de cada faixa etária', () => {
    expect(isGameAgeAppropriate(48, [48, 144])).toBe(true);
    expect(isGameAgeAppropriate(144, [48, 144])).toBe(true);
    expect(isGameAgeAppropriate(47, [48, 144])).toBe(false);
    expect(isGameAgeAppropriate(145, [48, 144])).toBe(false);
  });
});
