/**
 * Memória dos Bichos — memória de trabalho visual e pareamento diferido.
 * Fases crescem em número de pares (2 → 3 → 4 → 6), sempre limitadas pela adaptação clínica
 * (maxChoices × 2 cartas). As primeiras fases começam com uma "espiada" (todas as cartas abertas por
 * alguns segundos) — ensino sem erro. Cada tentativa = virar duas cartas.
 */
import { seededRandom, shuffle } from '@aprumo/game-sdk';
import type { SessionConfig } from '@aprumo/protocol';
import { ANIMALS, ANIMAL_KEYS } from './Art';

export interface MemoryCard {
  id: string;
  pairKey: string;
  art: string;
  label: string;
}

export interface MemoryLevel {
  id: string;
  index: number;
  pairs: number;
  cols: number;
  /** Tempo da espiada inicial (ms); 0 = sem espiada. */
  previewMs: number;
  animals: string[];
}

/** Compatibilidade: pares clássicos (primeiros bichos do acervo). */
export const ANIMAL_PAIRS = ['cachorro', 'gato', 'peixe'].map((key) => ({ key, label: ANIMALS[key]!.label, art: key }));

const PAIR_LADDER = [2, 3, 4, 6];

/** Colunas que deixam o tabuleiro mais "quadrado" para cada total de cartas. */
export function gridCols(cards: number): number {
  if (cards <= 4) return 2;
  if (cards <= 6) return 3;
  if (cards <= 8) return 4;
  if (cards <= 10) return 5;
  return 4;
}

/**
 * Teto de pares: maxChoices + 1 (com 3 escolhas por tela, até 4 pares), entre 2 e 6.
 * `params.maxPairs` permite ao profissional fixar outro teto.
 */
export function maxPairsFor(config: Pick<SessionConfig, 'adaptation' | 'params'>): number {
  const fixed = config.params.maxPairs;
  const base = typeof fixed === 'number' && Number.isFinite(fixed) ? Math.floor(fixed) : config.adaptation.maxChoices + 1;
  return Math.max(2, Math.min(6, base));
}

export function planLevels(config: Pick<SessionConfig, 'adaptation' | 'clinical' | 'params'>): MemoryLevel[] {
  const rnd = seededRandom(config.clinical.seed);
  const maxPairs = maxPairsFor(config);
  let ladder = PAIR_LADDER.filter((p) => p <= maxPairs);
  if (ladder[ladder.length - 1] !== maxPairs) ladder = [...ladder, maxPairs];
  const wanted = typeof config.params.levels === 'number' ? Math.max(1, Math.min(ladder.length, Math.floor(config.params.levels))) : ladder.length;
  ladder = ladder.slice(0, wanted);
  const noPreview = config.params.preview === false;

  // Bichos dos alvos do plano entram primeiro (a criança já conhece), depois o acervo.
  const fromTargets = config.clinical.targets.map((t) => t.stimulus.art).filter((a) => ANIMALS[a]);
  const pool = [...new Set([...fromTargets, ...shuffle(ANIMAL_KEYS, rnd)])];

  return ladder.map((pairs, index) => {
    // Cada fase reaproveita alguns bichos da anterior (familiaridade) e traz novos.
    const offset = index * 2;
    const animals = Array.from({ length: pairs }, (_, k) => pool[(offset + k) % pool.length]!);
    return {
      id: `memoria-${pairs}-pares`,
      index,
      pairs,
      cols: gridCols(pairs * 2),
      previewMs: noPreview ? 0 : index === 0 ? 2400 : index === 1 ? 1600 : 0,
      animals,
    };
  });
}

export function buildBoard(level: Pick<MemoryLevel, 'animals'>, rnd: () => number): MemoryCard[] {
  const cards: MemoryCard[] = [];
  for (const art of level.animals) {
    const label = ANIMALS[art]?.label ?? art;
    cards.push({ id: `${art}-1`, pairKey: art, art, label }, { id: `${art}-2`, pairKey: art, art, label });
  }
  return shuffle(cards, rnd);
}

/** Compatibilidade com a API anterior (um único tabuleiro). */
export function planMemoryBoard(config: SessionConfig): MemoryCard[] {
  const rnd = seededRandom(config.clinical.seed);
  const numPairs = config.adaptation.maxChoices > 4 ? 3 : 2;
  return buildBoard({ animals: ANIMAL_PAIRS.slice(0, numPairs).map((p) => p.key) }, rnd);
}

export function isMatch(card1: MemoryCard, card2: MemoryCard): boolean {
  return card1.pairKey === card2.pairKey && card1.id !== card2.id;
}

export function partnerPos(board: MemoryCard[], pos: number): number {
  const c = board[pos];
  if (!c) return -1;
  return board.findIndex((x, i) => i !== pos && x.pairKey === c.pairKey);
}

export interface PairResult {
  match: boolean;
  /** Posição do par correto da primeira carta (alvo desta tentativa). */
  positionOfTarget: number;
  /** A criança já tinha visto o par certo e mesmo assim escolheu outra carta. */
  knownMiss: boolean;
  /** A segunda carta já tinha sido vista antes (busca guiada pela memória). */
  revisit: boolean;
}

/** Avalia uma tentativa (duas cartas) usando o histórico de cartas já vistas. */
export function evaluatePair(board: MemoryCard[], first: number, second: number, seen: ReadonlySet<number>): PairResult {
  const target = partnerPos(board, first);
  const match = target === second;
  return { match, positionOfTarget: target, knownMiss: !match && seen.has(target), revisit: seen.has(second) };
}

/**
 * Desfecho da fase: muitos erros (mais que 2 por par) repetem a fase uma vez, com espiada.
 * Nunca repete duas vezes seguidas (evita frustração).
 */
export function levelOutcome(mistakes: number, pairs: number, alreadyRepeated: boolean): 'advanced' | 'repeated' {
  return !alreadyRepeated && mistakes > pairs * 2 ? 'repeated' : 'advanced';
}

/** Pequeno motivo melódico por bicho (o "som" do bicho, sem gravação). */
export function animalMotif(art: string): number[] {
  const motifs: Record<string, number[]> = {
    cachorro: [392, 392],
    gato: [659.25, 587.33],
    peixe: [523.25, 659.25, 783.99],
    passaro: [1046.5, 1174.66, 1046.5],
    coelho: [783.99, 880],
    sapo: [196, 246.94],
    tartaruga: [293.66, 261.63],
    joaninha: [880, 987.77, 1046.5],
    vaca: [220, 196],
    porco: [329.63, 293.66, 329.63],
    pato: [587.33, 587.33, 523.25],
    leao: [174.61, 220],
  };
  return motifs[art] ?? [523.25];
}
