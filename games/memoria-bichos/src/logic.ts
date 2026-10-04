import { seededRandom, shuffle } from '@aprumo/game-sdk';
import type { SessionConfig } from '@aprumo/protocol';

export interface MemoryCard {
  id: string;
  pairKey: string;
  art: string;
  label: string;
}

export const ANIMAL_PAIRS: Array<{ key: string; label: string; art: string }> = [
  { key: 'cachorro', label: 'Cachorrinho', art: 'cachorro' },
  { key: 'gato', label: 'Gatinho', art: 'gato' },
  { key: 'peixe', label: 'Peixinho', art: 'peixe' },
];

export function planMemoryBoard(config: SessionConfig): MemoryCard[] {
  const rnd = seededRandom(config.clinical.seed);
  // Se maxChoices for <= 4, usamos 2 pares (4 cartas). Se > 4, usamos 3 pares (6 cartas).
  const numPairs = config.adaptation.maxChoices > 4 ? 3 : 2;
  const selectedPairs = ANIMAL_PAIRS.slice(0, numPairs);

  const cards: MemoryCard[] = [];
  selectedPairs.forEach((pair) => {
    cards.push({ id: `${pair.key}-1`, pairKey: pair.key, art: pair.art, label: pair.label });
    cards.push({ id: `${pair.key}-2`, pairKey: pair.key, art: pair.art, label: pair.label });
  });

  return shuffle(cards, rnd);
}

export function isMatch(card1: MemoryCard, card2: MemoryCard): boolean {
  return card1.pairKey === card2.pairKey && card1.id !== card2.id;
}
