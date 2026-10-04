/**
 * Lógica da Missão Instrução (resposta de ouvinte).
 *  - Nível 1 (modo simples, legado): "Toque na bola" com os alvos clínicos da sessão.
 *    O campo mínimo é 2 (campo de 1 não exige discriminação auditiva) e distratores de outras
 *    categorias têm prioridade, para reduzir confusão semântica no início do ensino.
 *  - Níveis 2–5: brinquedos próprios do jogo com atributos (cor, tamanho), relações espaciais
 *    (dentro, em cima, embaixo, ao lado da caixa) e instruções de 1, 2 ou 3 etapas.
 *  - Interação acessível (sem arrastar): toque no item; para "coloque", toque no item e depois no lugar.
 * Tudo aqui é puro e determinístico (semente da sessão).
 */
import { counterbalancedPositions, seededRandom, shuffle } from '@aprumo/game-sdk';
import type { SessionConfig, StimulusRef, TargetConfig } from '@aprumo/protocol';
import { STIMULUS_ART, instructionFor } from '@aprumo/stimuli';

/* ------------------------------------------------------------ nível 1 (legado) */

export interface ListenerTrial {
  index: number;
  target: TargetConfig;
  options: StimulusRef[];
  positionOfTarget: number;
  instruction: string;
}

const category = (s: StimulusRef) => STIMULUS_ART[s.art]?.category ?? 'outros';

export function fieldFor(target: TargetConfig, maxChoices: number): number {
  return Math.max(2, Math.min(target.fieldSize, maxChoices, target.distractors.length + 1));
}

export function planListenerTrials(config: SessionConfig): ListenerTrial[] {
  const rnd = seededRandom(config.clinical.seed ^ 0x5eed);
  const out: ListenerTrial[] = [];
  const groups = config.clinical.targets.map((target) => {
    const field = fieldFor(target, config.adaptation.maxChoices);
    const positions = counterbalancedPositions(config.clinical.trialsPerTarget, field, rnd);
    const targetCat = category(target.stimulus);
    const ordered = [
      ...shuffle(target.distractors.filter((d) => category(d) !== targetCat), rnd),
      ...shuffle(target.distractors.filter((d) => category(d) === targetCat), rnd),
    ];
    return positions.map((pos, k) => {
      // Rotaciona os distratores para que nenhum fique sempre ao lado do alvo.
      const rotated = [...ordered.slice(k % Math.max(1, ordered.length)), ...ordered.slice(0, k % Math.max(1, ordered.length))];
      const options = rotated.slice(0, field - 1);
      options.splice(pos, 0, target.stimulus);
      return { target, options, positionOfTarget: pos, instruction: instructionFor(target.stimulus.art, target.stimulus.label) };
    });
  });
  const queue = config.clinical.interleave ? shuffle(groups.flat(), rnd) : groups.flat();
  queue.forEach((t, index) => out.push({ ...t, index }));
  return out;
}

/* ------------------------------------------------------------ vocabulário */

export type Relation = 'dentro' | 'em-cima' | 'embaixo' | 'ao-lado';
export const RELATIONS: Relation[] = ['dentro', 'em-cima', 'embaixo', 'ao-lado'];
export const RELATION_PHRASE: Record<Relation, string> = {
  dentro: 'dentro da caixa', 'em-cima': 'em cima da caixa', embaixo: 'embaixo da caixa', 'ao-lado': 'ao lado da caixa',
};

export type ToyKind = 'bola' | 'cubo' | 'estrela' | 'peixe';
export type ToyColor = 'vermelho' | 'azul' | 'amarelo' | 'verde';
export type ToySize = 'grande' | 'pequeno';
export const TOY_KINDS: ToyKind[] = ['bola', 'cubo', 'estrela', 'peixe'];
export const TOY_COLORS: ToyColor[] = ['vermelho', 'azul', 'amarelo', 'verde'];
const ARTICLE: Record<ToyKind, 'o' | 'a'> = { bola: 'a', cubo: 'o', estrela: 'a', peixe: 'o' };
const COLOR_WORD: Record<ToyColor, { o: string; a: string }> = {
  vermelho: { o: 'vermelho', a: 'vermelha' }, azul: { o: 'azul', a: 'azul' },
  amarelo: { o: 'amarelo', a: 'amarela' }, verde: { o: 'verde', a: 'verde' },
};
const SIZE_WORD: Record<ToySize, { o: string; a: string }> = { grande: { o: 'grande', a: 'grande' }, pequeno: { o: 'pequeno', a: 'pequena' } };

export interface Toy { kind: ToyKind; color: ToyColor; size: ToySize }
/** Item no tabuleiro: estímulo clínico (nível 1) ou brinquedo próprio (níveis 2+). */
export interface MissionItem { id: string; label: string; article: 'o' | 'a'; art?: string; toy?: Toy }
export type Attr = 'color' | 'size';

export function toyItem(toy: Toy): MissionItem {
  return { id: `${toy.kind}-${toy.color}-${toy.size}`, label: describeToy(toy, ['color', 'size']), article: ARTICLE[toy.kind], toy };
}

export function describeToy(toy: Toy, attrs: Attr[]): string {
  const g = ARTICLE[toy.kind];
  const words: string[] = [toy.kind];
  if (attrs.includes('size')) words.push(SIZE_WORD[toy.size][g]);
  if (attrs.includes('color')) words.push(COLOR_WORD[toy.color][g]);
  return words.join(' ');
}

const matches = (a: Toy, b: Toy, attrs: Attr[]) =>
  a.kind === b.kind && (!attrs.includes('color') || a.color === b.color) && (!attrs.includes('size') || a.size === b.size);

/** Menor conjunto de atributos que identifica o brinquedo sem ambiguidade no campo inteiro. */
export function minimalAttrs(toy: Toy, field: Toy[]): Attr[] {
  const options: Attr[][] = [[], ['color'], ['size'], ['color', 'size']];
  return options.find((attrs) => field.filter((t) => matches(t, toy, attrs)).length === 1) ?? ['color', 'size'];
}

/* ------------------------------------------------------------ níveis */

export interface LevelSpec { level: number; steps: 1 | 2 | 3; attributes: boolean; relations: boolean }
export const LEVELS: LevelSpec[] = [
  { level: 1, steps: 1, attributes: false, relations: false },
  { level: 2, steps: 1, attributes: true, relations: false },
  { level: 3, steps: 1, attributes: false, relations: true },
  { level: 4, steps: 2, attributes: true, relations: true },
  { level: 5, steps: 3, attributes: true, relations: true },
];

/** Lê `params.level` (1–5). Padrão: 1 (modo simples). */
export function levelFrom(params: Record<string, unknown>): LevelSpec {
  const n = Math.round(Number(params.level ?? 1));
  return LEVELS[Math.min(LEVELS.length, Math.max(1, Number.isFinite(n) ? n : 1)) - 1]!;
}

/* ------------------------------------------------------------ tentativas */

export type StepKind = 'touch' | 'place';
export interface MissionStep { kind: StepKind; item: number; relation: Relation | null; text: string }
export interface MissionTrial {
  index: number;
  target: TargetConfig;
  level: number;
  items: MissionItem[];
  steps: MissionStep[];
  /** Posição do item da 1ª etapa (para viés de posição). */
  positionOfTarget: number;
  /** A caixa (destino) aparece na tela? */
  hasDestination: boolean;
  attributes: Attr[];
  instruction: string;
}

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
export function joinSteps(parts: string[]): string {
  if (parts.length === 1) return parts[0]!;
  if (parts.length === 2) return `${parts[0]}, depois ${lowerFirst(parts[1]!)}`;
  return `${parts[0]}, depois ${lowerFirst(parts[1]!)} e por último ${lowerFirst(parts[2]!)}`;
}

export function stepText(kind: StepKind, item: MissionItem, desc: string, relation: Relation | null): string {
  if (kind === 'touch') return `Toque ${item.article === 'a' ? 'na' : 'no'} ${desc}`;
  return `Coloque ${item.article} ${desc} ${RELATION_PHRASE[relation!]}`;
}

export function missionField(spec: LevelSpec, maxChoices: number): number {
  return Math.min(4, Math.max(spec.steps + 1, Math.min(4, Math.max(spec.attributes ? 3 : 2, maxChoices))));
}

function pick<T>(xs: readonly T[], rnd: () => number): T {
  return xs[Math.floor(rnd() * xs.length)]!;
}

/** Monta o campo de brinquedos. Com atributos, o 1º brinquedo tem um "gêmeo" do mesmo tipo (exige o atributo). */
export function buildField(spec: LevelSpec, size: number, rnd: () => number): Toy[] {
  const kinds = shuffle([...TOY_KINDS], rnd);
  const field: Toy[] = [];
  const has = (t: Toy) => field.some((f) => f.kind === t.kind && f.color === t.color && f.size === t.size);
  if (spec.attributes) {
    const kind = kinds[0]!;
    const a: Toy = { kind, color: pick(TOY_COLORS, rnd), size: pick(['grande', 'pequeno'] as const, rnd) };
    const byColor = rnd() < 0.5;
    const b: Toy = byColor
      ? { kind, color: pick(TOY_COLORS.filter((c) => c !== a.color), rnd), size: a.size }
      : { kind, color: a.color, size: a.size === 'grande' ? 'pequeno' : 'grande' };
    field.push(a, b);
    let k = 1;
    while (field.length < size) {
      const t: Toy = { kind: kinds[k % kinds.length]!, color: pick(TOY_COLORS, rnd), size: pick(['grande', 'pequeno'] as const, rnd) };
      if (!has(t)) field.push(t);
      k += 1;
    }
  } else {
    for (let k = 0; k < size; k++) field.push({ kind: kinds[k]!, color: pick(TOY_COLORS, rnd), size: 'grande' });
  }
  return field;
}

export function planMission(config: SessionConfig): MissionTrial[] {
  const spec = levelFrom(config.params);
  const targets = config.clinical.targets;
  if (!targets.length) return [];

  if (spec.level === 1) {
    return planListenerTrials(config).map((t) => {
      const items: MissionItem[] = t.options.map((o) => ({ id: o.stimulusId, label: o.label, article: STIMULUS_ART[o.art]?.article ?? 'o', art: o.art }));
      return {
        index: t.index, target: t.target, level: 1, items, positionOfTarget: t.positionOfTarget, hasDestination: false, attributes: [],
        steps: [{ kind: 'touch' as const, item: t.positionOfTarget, relation: null, text: t.instruction }], instruction: t.instruction,
      };
    });
  }

  const rnd = seededRandom(config.clinical.seed ^ (0x6d15 + spec.level));
  const size = missionField(spec, config.adaptation.maxChoices);
  const total = config.clinical.trialsPerTarget * targets.length;
  const out: MissionTrial[] = [];
  let relationBag: Relation[] = [];
  for (let index = 0; index < total; index++) {
    const toys = shuffle(buildField(spec, size, rnd), rnd);
    const items = toys.map(toyItem);
    // A 1ª etapa usa o brinquedo com "gêmeo" quando há atributos (garante o atributo na instrução).
    const twinIdx = spec.attributes ? toys.findIndex((t) => minimalAttrs(t, toys).length > 0) : -1;
    const others = shuffle(toys.map((_, i) => i).filter((i) => i !== twinIdx), rnd);
    const order = twinIdx >= 0 ? [twinIdx, ...others] : others;
    // Com relações, pelo menos uma etapa é "coloque"; em 1 etapa, é sempre "coloque".
    const kinds: StepKind[] = Array.from({ length: spec.steps }, () => (spec.relations && rnd() < 0.6 ? 'place' : 'touch'));
    if (spec.relations && !kinds.includes('place')) kinds[Math.floor(rnd() * kinds.length)] = 'place';
    const attrsUsed = new Set<Attr>();
    const steps: MissionStep[] = kinds.map((kind, s) => {
      const itemIdx = order[s]!;
      const toy = toys[itemIdx]!;
      const attrs = spec.attributes ? minimalAttrs(toy, toys) : [];
      attrs.forEach((a) => attrsUsed.add(a));
      let relation: Relation | null = null;
      if (kind === 'place') {
        if (!relationBag.length) relationBag = shuffle([...RELATIONS], rnd);
        relation = relationBag.pop()!;
      }
      return { kind, item: itemIdx, relation, text: stepText(kind, items[itemIdx]!, describeToy(toy, attrs), relation) };
    });
    out.push({
      index, target: targets[index % targets.length]!, level: spec.level, items, steps, positionOfTarget: steps[0]!.item,
      hasDestination: spec.relations, attributes: [...attrsUsed], instruction: joinSteps(steps.map((s) => s.text)),
    });
  }
  return out;
}

/* ------------------------------------------------------------ progresso da tentativa */

export interface StepResult {
  step: number;
  kind: StepKind;
  expectedItem: string;
  chosenItem: string | null;
  expectedRelation: Relation | null;
  chosenRelation: Relation | null;
  correct: boolean;
  /** Do fim da etapa anterior (ou do início da tentativa) até completar esta etapa. */
  latencyMs: number;
}

export interface Progress {
  step: number;
  /** Item escolhido aguardando o destino (etapa "coloque"). */
  selected: number | null;
  /** Itens colocados na caixa (saem da estante). */
  placed: { item: number; relation: Relation }[];
  touched: number[];
  results: StepResult[];
  lastAt: number;
  done: boolean;
}

export type Tap = { type: 'item'; index: number } | { type: 'zone'; relation: Relation };

export const initialProgress = (now: number): Progress => ({ step: 0, selected: null, placed: [], touched: [], results: [], lastAt: now, done: false });

/**
 * Aplica um toque. `errorless` (correção de erro): só aceita o toque esperado, sem pontuar.
 * Toques sem efeito (item já colocado, lugar sem item escolhido) são ignorados com calma.
 */
export function applyTap(trial: MissionTrial, p: Progress, tap: Tap, now: number, errorless = false): { progress: Progress; accepted: boolean } {
  const step = trial.steps[p.step];
  if (p.done || !step) return { progress: p, accepted: false };
  const isPlaced = (i: number) => p.placed.some((x) => x.item === i);
  const finishStep = (chosenItem: number | null, chosenRelation: Relation | null, extra: Partial<Progress>): Progress => {
    const correct = chosenItem === step.item && chosenRelation === step.relation;
    const result: StepResult = {
      step: p.step, kind: step.kind, expectedItem: trial.items[step.item]!.id, chosenItem: chosenItem == null ? null : trial.items[chosenItem]!.id,
      expectedRelation: step.relation, chosenRelation, correct, latencyMs: Math.max(0, Math.round(now - p.lastAt)),
    };
    const next = p.step + 1;
    return { ...p, ...extra, step: next, selected: null, results: [...p.results, result], lastAt: now, done: next >= trial.steps.length };
  };

  if (tap.type === 'item') {
    if (isPlaced(tap.index) || tap.index < 0 || tap.index >= trial.items.length) return { progress: p, accepted: false };
    if (errorless && tap.index !== step.item) return { progress: p, accepted: false };
    if (step.kind === 'touch') return { progress: finishStep(tap.index, null, { touched: [...p.touched, tap.index] }), accepted: true };
    return { progress: { ...p, selected: tap.index }, accepted: true };
  }
  // zona
  if (step.kind !== 'place' || p.selected == null) return { progress: p, accepted: false };
  if (errorless && tap.relation !== step.relation) return { progress: p, accepted: false };
  return { progress: finishStep(p.selected, tap.relation, { placed: [...p.placed, { item: p.selected, relation: tap.relation }] }), accepted: true };
}

/** O que a dica luminosa deve iluminar agora: o item da etapa ou, com o item escolhido, o lugar. */
export function hintFocus(trial: MissionTrial, p: Progress): { item: number | null; zone: Relation | null } {
  const step = trial.steps[p.step];
  if (!step || p.done) return { item: null, zone: null };
  if (step.kind === 'place' && p.selected === step.item) return { item: null, zone: step.relation };
  return { item: step.item, zone: null };
}

/** Pontuação da tentativa a partir das etapas: correta somente se todas as etapas estão corretas. */
export function scoreMission(trial: MissionTrial, results: StepResult[]) {
  const complete = results.length === trial.steps.length;
  const firstWrong = results.find((r) => !r.correct);
  const response: 'correct' | 'incorrect' = complete && !firstWrong ? 'correct' : 'incorrect';
  const chosen = (firstWrong ?? results[0])?.chosenItem ?? null;
  const selectedPosition = chosen == null ? null : trial.items.findIndex((i) => i.id === chosen);
  return { response, selected: chosen, selectedPosition, stepsCorrect: results.map((r) => r.correct) };
}

/** Detalhe próprio do jogo para TRIAL_COMPLETED (telemetria). */
export function missionDetail(trial: MissionTrial, results: StepResult[], instructionRepeats: number): Record<string, unknown> {
  const relations = trial.steps.map((s) => s.relation).filter((r): r is Relation => r != null);
  return {
    level: trial.level,
    steps: trial.steps.length,
    relation: relations[0] ?? null,
    relations,
    attributes: trial.attributes.map((a) => (a === 'color' ? 'cor' : 'tamanho')),
    instruction: trial.instruction,
    instructionRepeats,
    stepsCorrect: results.filter((r) => r.correct).length,
    stepResults: results,
  };
}
