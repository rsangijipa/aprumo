/**
 * Organize por Categoria — categorização funcional (RFFC: "onde guardamos?").
 * Fases fixas por número de caixas (2 → 3 → até o teto clínico), com posição do alvo contrabalanceada
 * dentro de cada fase. Os itens alternam entre o estímulo-alvo e seus distratores do plano (todos
 * conhecidos pela criança), mas a pontuação continua ligada ao alvo configurado.
 */
import { counterbalancedPositions, seededRandom, shuffle } from '@aprumo/game-sdk';
import type { SessionConfig, StimulusRef, TargetConfig } from '@aprumo/protocol';
import { STIMULUS_ART } from '@aprumo/stimuli';

export interface CategoryBox {
  id: string;
  label: string;
  /** Emoji legado (painéis antigos); a arte nova vem de `art`. */
  icon: string;
  /** Recipiente ilustrado (Boxes.tsx). */
  art: string;
  /** Frase do lugar: "na cesta das comidas". */
  place: string;
}

export const KNOWN_CATEGORIES: Record<string, CategoryBox> = {
  alimentos: { id: 'alimentos', label: 'Comidas', icon: '🍎', art: 'cesta', place: 'na cesta das comidas' },
  animais: { id: 'animais', label: 'Bichinhos', icon: '🐶', art: 'casinha', place: 'na casinha dos bichos' },
  veículos: { id: 'veículos', label: 'Veículos', icon: '🚗', art: 'garagem', place: 'na garagem' },
  roupas: { id: 'roupas', label: 'Roupas', icon: '👕', art: 'guarda-roupa', place: 'no guarda-roupa' },
  brinquedos: { id: 'brinquedos', label: 'Brinquedos', icon: '⚽', art: 'bau', place: 'no baú de brinquedos' },
  casa: { id: 'casa', label: 'Cozinha', icon: '🥄', art: 'armario', place: 'no armário da cozinha' },
  higiene: { id: 'higiene', label: 'Banheiro', icon: '🛁', art: 'banheira', place: 'no banheiro' },
  escola: { id: 'escola', label: 'Escola', icon: '🎒', art: 'mochila', place: 'na mochila da escola' },
  natureza: { id: 'natureza', label: 'Jardim', icon: '🌷', art: 'vaso', place: 'no jardim' },
};

export interface PlannedCategoryTrial {
  index: number;
  target: TargetConfig;
  item: StimulusRef;
  correctCategory: CategoryBox;
  boxes: CategoryBox[];
  options: StimulusRef[];
  positionOfTarget: number;
  instruction: string;
  /** Fase (0 = 2 caixas, 1 = 3 caixas, ...). */
  level: number;
}

export function getCategoryForItem(artKey: string): CategoryBox {
  const meta = STIMULUS_ART[artKey];
  const catKey = meta?.category ?? 'casa';
  return KNOWN_CATEGORIES[catKey] ?? KNOWN_CATEGORIES.casa!;
}

const hasBox = (s: StimulusRef) => !!KNOWN_CATEGORIES[STIMULUS_ART[s.art]?.category ?? ''];

/** Teto de caixas: o menor entre maxChoices e o fieldSize do alvo, entre 2 e 5. */
export function boxCap(config: Pick<SessionConfig, 'adaptation'>, target?: Pick<TargetConfig, 'fieldSize'>): number {
  const field = target?.fieldSize || config.adaptation.maxChoices;
  return Math.max(2, Math.min(5, config.adaptation.maxChoices, field));
}

/** Número de caixas por fase: 2, 3, ... até o teto. */
export function levelBoxes(level: number, cap: number): number {
  return Math.min(cap, 2 + level);
}

export function planCategoryTrials(config: SessionConfig): PlannedCategoryTrial[] {
  const rnd = seededRandom(config.clinical.seed);
  const { trialsPerTarget } = config.clinical;

  // 1) Sequência de itens por alvo: alterna o estímulo-alvo com distratores categorizáveis.
  const perTarget = config.clinical.targets.map((target) => {
    const extras = target.distractors.filter((d) => hasBox(d) && getCategoryForItem(d.art).id !== getCategoryForItem(target.stimulus.art).id);
    const extrasShuffled = shuffle(extras, rnd);
    return Array.from({ length: trialsPerTarget }, (_, i) => ({
      target,
      item: i % 2 === 0 || extrasShuffled.length === 0 ? target.stimulus : extrasShuffled[Math.floor(i / 2) % extrasShuffled.length]!,
    }));
  });
  let sequence: { target: TargetConfig; item: StimulusRef }[] = [];
  if (config.clinical.interleave) {
    for (let i = 0; i < trialsPerTarget; i++) for (const list of perTarget) if (list[i]) sequence.push(list[i]!);
  } else sequence = perTarget.flat();

  // 2) Fases: o total é dividido em terços (2 caixas → 3 caixas → teto).
  const total = sequence.length;
  const per = Math.max(1, Math.ceil(total / 3));
  const sessionCats = [...new Set(sequence.map((s) => getCategoryForItem(s.item.art).id))];

  const levelOf = (g: number) => Math.min(2, Math.floor(g / per));
  const positionsByLevel = new Map<number, number[]>();
  const trials: PlannedCategoryTrial[] = [];
  sequence.forEach(({ target, item }, g) => {
    const level = levelOf(g);
    const n = levelBoxes(level, boxCap(config, target));
    const key = level * 10 + n;
    if (!positionsByLevel.has(key)) {
      const count = sequence.filter((s, k) => levelOf(k) === level).length;
      positionsByLevel.set(key, counterbalancedPositions(count, n, rnd));
    }
    const pos = positionsByLevel.get(key)!.shift() ?? 0;
    const correct = getCategoryForItem(item.art);
    // Distratores preferem categorias que aparecem na sessão (caixas com sentido para a criança).
    const others = shuffle(Object.values(KNOWN_CATEGORIES).filter((c) => c.id !== correct.id), rnd).sort(
      (a, b) => Number(sessionCats.includes(b.id)) - Number(sessionCats.includes(a.id)),
    );
    const boxes = others.slice(0, n - 1);
    boxes.splice(Math.min(pos, boxes.length), 0, correct);
    const article = STIMULUS_ART[item.art]?.article === 'a' ? 'a' : 'o';
    trials.push({
      index: g,
      target,
      item,
      correctCategory: correct,
      boxes,
      options: boxes.map((b) => ({ stimulusId: b.id, label: b.label, art: b.art })),
      positionOfTarget: boxes.indexOf(correct),
      instruction: `Onde guardamos ${article} ${item.label}?`,
      level,
    });
  });
  return trials;
}

/* ------------------------------------------------------------ voo do item (projétil) */

export interface Flight {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Altura extra do arco (px, para cima). */
  apex: number;
  dur: number;
  t: number;
  spin: number;
  bounce: boolean;
}

/**
 * Posição no arco parabólico (t de 0 a 1). Com `bounce`, o item vai até 80% do caminho,
 * bate na tampa e volta quicando para o ponto de partida.
 */
export function flightPoint(f: Flight, t: number): { x: number; y: number; rot: number; scale: number } {
  const k = Math.min(1, Math.max(0, t));
  if (!f.bounce) {
    const x = f.x0 + (f.x1 - f.x0) * k;
    const y = f.y0 + (f.y1 - f.y0) * k - 4 * f.apex * k * (1 - k);
    return { x, y, rot: f.spin * k, scale: 1 - 0.45 * k * k };
  }
  // Ida (0–0,55) até 80% do alvo; volta (0,55–1) com quique amortecido.
  if (k < 0.55) {
    const u = k / 0.55;
    const tx = f.x0 + (f.x1 - f.x0) * 0.8;
    const ty = f.y0 + (f.y1 - f.y0) * 0.8;
    return { x: f.x0 + (tx - f.x0) * u, y: f.y0 + (ty - f.y0) * u - 4 * f.apex * u * (1 - u), rot: f.spin * u * 0.5, scale: 1 };
  }
  const u = (k - 0.55) / 0.45;
  const sx = f.x0 + (f.x1 - f.x0) * 0.8;
  const sy = f.y0 + (f.y1 - f.y0) * 0.8;
  const hop = Math.abs(Math.sin(u * Math.PI * 2)) * (1 - u) * f.apex * 0.35;
  return { x: sx + (f.x0 - sx) * u, y: sy + (f.y0 - sy) * u - hop, rot: f.spin * 0.5 * (1 - u), scale: 1 };
}
