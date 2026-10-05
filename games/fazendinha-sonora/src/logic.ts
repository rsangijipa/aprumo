import type { PromptLevelRef, SessionConfig, TargetConfig, TrialResponse } from '@aprumo/protocol';
import type { Tone } from '@aprumo/game-sdk';

/* ------------------------------------------------------------------ animais */

export type AnimalId =
  | 'vaca' | 'boi' | 'cavalo' | 'galinha' | 'pato' | 'cachorro' | 'gato' | 'porco' | 'arara' | 'capivara' | 'sapo';

export interface Animal {
  id: AnimalId;
  name: string;
  /** Artigo definido ("a vaca", "o pato"). */
  article: 'a' | 'o';
  /** Onomatopeia falada após o som (palavra fácil e funcional). */
  sound: string;
  /** Nome do filhote (página "cadê o filhote?"). */
  baby: string;
  /** Ação curta da fase de elaboração. */
  action: string;
}

export const ANIMALS: readonly Animal[] = [
  { id: 'vaca', name: 'vaca', article: 'a', sound: 'Muuu!', baby: 'bezerrinho', action: 'come capim' },
  { id: 'boi', name: 'boi', article: 'o', sound: 'Muuu!', baby: 'bezerro', action: 'balança o rabo' },
  { id: 'cavalo', name: 'cavalo', article: 'o', sound: 'Iiirrí!', baby: 'potrinho', action: 'corre' },
  { id: 'galinha', name: 'galinha', article: 'a', sound: 'Có có!', baby: 'pintinho', action: 'cisca o milho' },
  { id: 'pato', name: 'pato', article: 'o', sound: 'Quá quá!', baby: 'patinho', action: 'nada' },
  { id: 'cachorro', name: 'cachorro', article: 'o', sound: 'Au au!', baby: 'cachorrinho', action: 'abana o rabo' },
  { id: 'gato', name: 'gato', article: 'o', sound: 'Miau!', baby: 'gatinho', action: 'se espreguiça' },
  { id: 'porco', name: 'porco', article: 'o', sound: 'Óinc óinc!', baby: 'porquinho', action: 'rola na lama' },
  { id: 'arara', name: 'arara', article: 'a', sound: 'Rááá!', baby: 'ararinha', action: 'voa' },
  { id: 'capivara', name: 'capivara', article: 'a', sound: 'Fiu fiu!', baby: 'capivarinha', action: 'mergulha' },
  { id: 'sapo', name: 'sapo', article: 'o', sound: 'Croac!', baby: 'girino', action: 'pula' },
];

export const ANIMAL_IDS = ANIMALS.map((a) => a.id);
export const animalById = (id: string): Animal | undefined => ANIMALS.find((a) => a.id === id);

/**
 * Som sintetizado (Web Audio) de cada animal: aproximações gentis, sem ataques agudos.
 * Ganhos relativos ≤ 0,6 — o volume final ainda é limitado pelo perfil de som da adaptação.
 */
const soft = { attack: 0.04, decay: 0.08, sustain: 0.6, release: 0.18 };
export const ANIMAL_SOUNDS: Record<AnimalId, Tone[]> = {
  vaca: [
    { freq: 150, slideTo: 112, dur: 0.85, type: 'sawtooth', attack: 0.18, decay: 0.2, sustain: 0.7, release: 0.35, gain: 0.32 },
    { freq: 300, slideTo: 224, dur: 0.85, type: 'sine', attack: 0.18, decay: 0.2, sustain: 0.6, release: 0.35, gain: 0.2 },
  ],
  boi: [
    { freq: 120, slideTo: 92, dur: 0.95, type: 'sawtooth', attack: 0.2, decay: 0.2, sustain: 0.7, release: 0.4, gain: 0.34 },
    { freq: 240, slideTo: 184, dur: 0.95, type: 'sine', attack: 0.2, decay: 0.2, sustain: 0.6, release: 0.4, gain: 0.2 },
  ],
  cavalo: [
    { freq: 620, slideTo: 930, dur: 0.16, type: 'triangle', ...soft, gain: 0.4 },
    { freq: 900, slideTo: 700, dur: 0.12, delay: 0.18, type: 'triangle', ...soft, gain: 0.38 },
    { freq: 820, slideTo: 640, dur: 0.12, delay: 0.32, type: 'triangle', ...soft, gain: 0.34 },
    { freq: 760, slideTo: 460, dur: 0.3, delay: 0.46, type: 'triangle', ...soft, gain: 0.3 },
  ],
  galinha: [
    { freq: 540, slideTo: 430, dur: 0.08, type: 'triangle', ...soft, gain: 0.42 },
    { freq: 540, slideTo: 430, dur: 0.08, delay: 0.22, type: 'triangle', ...soft, gain: 0.42 },
    { freq: 560, slideTo: 720, dur: 0.22, delay: 0.48, type: 'triangle', ...soft, gain: 0.36 },
  ],
  pato: [
    { freq: 400, slideTo: 300, dur: 0.12, type: 'sawtooth', ...soft, gain: 0.22 },
    { freq: 400, slideTo: 300, dur: 0.12, delay: 0.26, type: 'sawtooth', ...soft, gain: 0.22 },
  ],
  cachorro: [
    { freq: 300, slideTo: 420, dur: 0.09, type: 'triangle', ...soft, gain: 0.45 },
    { freq: 300, slideTo: 420, dur: 0.09, delay: 0.3, type: 'triangle', ...soft, gain: 0.45 },
  ],
  gato: [
    { freq: 480, slideTo: 820, dur: 0.24, type: 'sine', ...soft, gain: 0.45 },
    { freq: 820, slideTo: 440, dur: 0.36, delay: 0.24, type: 'sine', ...soft, gain: 0.4 },
  ],
  porco: [
    { freq: 210, slideTo: 160, dur: 0.12, type: 'sawtooth', ...soft, gain: 0.26 },
    { freq: 220, slideTo: 165, dur: 0.12, delay: 0.24, type: 'sawtooth', ...soft, gain: 0.26 },
  ],
  arara: [{ freq: 880, slideTo: 640, dur: 0.36, type: 'sawtooth', attack: 0.06, decay: 0.1, sustain: 0.55, release: 0.2, gain: 0.16 }],
  capivara: [
    { freq: 1180, slideTo: 1320, dur: 0.07, type: 'sine', ...soft, gain: 0.32 },
    { freq: 1180, slideTo: 1320, dur: 0.07, delay: 0.16, type: 'sine', ...soft, gain: 0.32 },
    { freq: 1240, slideTo: 1100, dur: 0.12, delay: 0.32, type: 'sine', ...soft, gain: 0.28 },
  ],
  sapo: [
    { freq: 150, slideTo: 118, dur: 0.14, type: 'square', ...soft, gain: 0.18 },
    { freq: 160, slideTo: 120, dur: 0.18, delay: 0.26, type: 'square', ...soft, gain: 0.18 },
  ],
};

/** Duração total (s) de uma receita de som. */
export function soundDuration(tones: readonly Tone[]): number {
  return tones.reduce((m, t) => Math.max(m, (t.delay ?? 0) + t.dur + (t.release ?? 0)), 0);
}

/** "Música dos animais": melodia de cantiga de domínio público ("Seu Lobato tinha um sítio"), arranjo próprio. */
export const ANIMAL_SONG: Tone[] = (() => {
  const G4 = 392, D4 = 293.66, E4 = 329.63, B4 = 493.88, A4 = 440;
  const notes: Array<[number, number]> = [
    [G4, 1], [G4, 1], [G4, 1], [D4, 1], [E4, 1], [E4, 1], [D4, 2],
    [B4, 1], [B4, 1], [A4, 1], [A4, 1], [G4, 2],
  ];
  const beat = 0.3;
  let t = 0;
  return notes.map(([freq, len]) => {
    const tone: Tone = { freq, dur: beat * len * 0.7, delay: t, type: 'triangle', attack: 0.03, decay: 0.08, sustain: 0.5, release: 0.15, gain: 0.4 };
    t += beat * len;
    return tone;
  });
})();

/* ------------------------------------------------------------------ livros (JSON) */

export type HidingSpot = 'celeiro' | 'porteira' | 'moita' | 'lagoa' | 'pe-de-manga' | 'ipe' | 'curral';
export const HIDING_SPOTS: readonly HidingSpot[] = ['celeiro', 'porteira', 'moita', 'lagoa', 'pe-de-manga', 'ipe', 'curral'];
export const HIDING_LABEL: Record<HidingSpot, string> = {
  celeiro: 'Celeiro', porteira: 'Porteira', moita: 'Moita', lagoa: 'Lagoa', 'pe-de-manga': 'Pé de manga', ipe: 'Ipê', curral: 'Curral',
};

/** Caixa padrão de cada esconderijo (% do livro aberto: centro x/y, largura, altura). */
export const HIDING_BOX: Record<HidingSpot, { x: number; y: number; w: number; h: number }> = {
  celeiro: { x: 20, y: 40, w: 20, h: 40 },
  porteira: { x: 78, y: 60, w: 20, h: 26 },
  moita: { x: 50, y: 66, w: 16, h: 22 },
  lagoa: { x: 26, y: 80, w: 26, h: 22 },
  'pe-de-manga': { x: 80, y: 28, w: 18, h: 34 },
  ipe: { x: 56, y: 26, w: 16, h: 32 },
  curral: { x: 76, y: 60, w: 22, h: 26 },
};

export type Scene = 'fazenda' | 'rio';
export type PageKind = 'normal' | 'todos' | 'filhote';

export interface FlapDef {
  id: string;
  hide: HidingSpot;
  animal: AnimalId;
  /** Filhote escondido (página "cadê o filhote?"). */
  baby?: boolean;
  /** Posição opcional (centro em %), sobrescreve a do esconderijo. */
  x?: number;
  y?: number;
}
export interface PageDef { id: string; kind: PageKind; flaps: FlapDef[] }
export interface Book { id: string; title: string; scene: Scene; pages: PageDef[] }

const f = (id: string, hide: HidingSpot, animal: AnimalId, extra: Partial<FlapDef> = {}): FlapDef => ({ id, hide, animal, ...extra });

export const BASE_BOOKS: readonly Book[] = [
  {
    id: 'fazenda',
    title: 'Fazenda',
    scene: 'fazenda',
    pages: [
      { id: 'f1', kind: 'normal', flaps: [f('f1a', 'celeiro', 'vaca')] },
      { id: 'f2', kind: 'normal', flaps: [f('f2a', 'porteira', 'cavalo'), f('f2b', 'moita', 'cachorro')] },
      { id: 'f3', kind: 'normal', flaps: [f('f3a', 'curral', 'porco'), f('f3b', 'moita', 'galinha', { x: 34 })] },
      { id: 'f4', kind: 'normal', flaps: [f('f4a', 'lagoa', 'pato'), f('f4b', 'pe-de-manga', 'gato')] },
      { id: 'f5', kind: 'normal', flaps: [f('f5a', 'ipe', 'arara'), f('f5b', 'porteira', 'boi')] },
      {
        id: 'f6', kind: 'filhote',
        flaps: [f('f6a', 'celeiro', 'vaca', { baby: true }), f('f6b', 'moita', 'galinha', { baby: true }), f('f6c', 'porteira', 'cachorro', { baby: true })],
      },
      { id: 'f7', kind: 'todos', flaps: [f('f7a', 'celeiro', 'vaca'), f('f7b', 'curral', 'porco'), f('f7c', 'lagoa', 'pato', { x: 48 })] },
      { id: 'f8', kind: 'normal', flaps: [f('f8a', 'pe-de-manga', 'galinha'), f('f8b', 'moita', 'gato', { x: 30 })] },
    ],
  },
  {
    id: 'beira-do-rio',
    title: 'Beira do Rio',
    scene: 'rio',
    pages: [
      { id: 'r1', kind: 'normal', flaps: [f('r1a', 'lagoa', 'sapo')] },
      { id: 'r2', kind: 'normal', flaps: [f('r2a', 'moita', 'capivara'), f('r2b', 'ipe', 'arara')] },
      { id: 'r3', kind: 'normal', flaps: [f('r3a', 'lagoa', 'pato'), f('r3b', 'porteira', 'cavalo')] },
      { id: 'r4', kind: 'normal', flaps: [f('r4a', 'pe-de-manga', 'gato'), f('r4b', 'moita', 'cachorro')] },
      { id: 'r5', kind: 'normal', flaps: [f('r5a', 'porteira', 'boi')] },
      { id: 'r6', kind: 'filhote', flaps: [f('r6a', 'lagoa', 'capivara', { baby: true }), f('r6b', 'moita', 'pato', { baby: true, x: 64 })] },
      { id: 'r7', kind: 'todos', flaps: [f('r7a', 'lagoa', 'sapo'), f('r7b', 'moita', 'capivara', { x: 64 }), f('r7c', 'ipe', 'arara')] },
      { id: 'r8', kind: 'normal', flaps: [f('r8a', 'moita', 'galinha')] },
    ],
  },
];

/** Caixa final da aba (% do livro aberto). */
export function flapBox(flap: FlapDef): { x: number; y: number; w: number; h: number } {
  const b = HIDING_BOX[flap.hide];
  return { ...b, x: flap.x ?? b.x, y: flap.y ?? b.y };
}

export function boxesOverlap(a: FlapDef, b: FlapDef): boolean {
  const p = flapBox(a), q = flapBox(b);
  return Math.abs(p.x - q.x) * 2 < p.w + q.w && Math.abs(p.y - q.y) * 2 < p.h + q.h;
}

const rec = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const SLUG = /^[a-z0-9-]{1,40}$/;

export interface BookValidation { ok: boolean; book: Book | null; errors: string[] }

/** Valida um livro em JSON (montado pelo supervisor, sem código). */
export function validateBook(raw: unknown): BookValidation {
  const errors: string[] = [];
  const o = rec(raw);
  const id = typeof o.id === 'string' && SLUG.test(o.id) ? o.id : null;
  if (!id) errors.push('id inválido (use letras minúsculas, números e hífen)');
  const title = typeof o.title === 'string' && o.title.trim() ? o.title.trim().slice(0, 40) : null;
  if (!title) errors.push('título ausente');
  const scene: Scene = o.scene === 'rio' ? 'rio' : 'fazenda';
  const pagesRaw = Array.isArray(o.pages) ? o.pages : [];
  if (pagesRaw.length < 1 || pagesRaw.length > 16) errors.push('o livro precisa de 1 a 16 páginas');
  const flapIds = new Set<string>();
  const pages: PageDef[] = pagesRaw.slice(0, 16).map((pr, pi) => {
    const p = rec(pr);
    const kind: PageKind = p.kind === 'todos' || p.kind === 'filhote' ? p.kind : 'normal';
    const flapsRaw = Array.isArray(p.flaps) ? p.flaps : [];
    if (flapsRaw.length < 1 || flapsRaw.length > 3) errors.push(`página ${pi + 1}: use de 1 a 3 abas`);
    const flaps: FlapDef[] = flapsRaw.slice(0, 3).map((fr, fi) => {
      const q = rec(fr);
      const fid = typeof q.id === 'string' && SLUG.test(q.id) ? q.id : `p${pi + 1}-a${fi + 1}`;
      if (flapIds.has(fid)) errors.push(`aba repetida: ${fid}`);
      flapIds.add(fid);
      const hide = HIDING_SPOTS.includes(q.hide as HidingSpot) ? (q.hide as HidingSpot) : null;
      if (!hide) errors.push(`página ${pi + 1}: esconderijo inválido`);
      const animal = animalById(String(q.animal ?? ''))?.id ?? null;
      if (!animal) errors.push(`página ${pi + 1}: animal inválido`);
      const out: FlapDef = { id: fid, hide: hide ?? 'moita', animal: animal ?? 'vaca' };
      if (q.baby === true) out.baby = true;
      for (const k of ['x', 'y'] as const) {
        const v = q[k];
        if (v === undefined) continue;
        if (typeof v === 'number' && v >= 5 && v <= 95) out[k] = v;
        else errors.push(`página ${pi + 1}: posição ${k} deve ficar entre 5 e 95`);
      }
      return out;
    });
    for (let i = 0; i < flaps.length; i++)
      for (let j = i + 1; j < flaps.length; j++)
        if (boxesOverlap(flaps[i]!, flaps[j]!)) errors.push(`página ${pi + 1}: abas sobrepostas`);
    return { id: typeof p.id === 'string' && SLUG.test(p.id) ? p.id : `p${pi + 1}`, kind, flaps };
  });
  if (errors.length || !id || !title) return { ok: false, book: null, errors };
  return { ok: true, book: { id, title, scene, pages }, errors: [] };
}

/* ------------------------------------------------------------------ aba: regras de interação */

/** Progresso a partir do qual a aba é considerada aberta durante o arrasto do adulto. */
export const OPEN_AT = 0.92;
/** Ao soltar o controle acima deste ponto, a aba termina de abrir. */
export const SNAP_AT = 0.8;
/** Ângulo máximo da dobra (graus). */
export const MAX_ANGLE = 168;

export type RevealMode = 'gradual' | 'liberar' | 'pedido';
export interface FlapState {
  /** Alvo do progresso de abertura (0 = fechada, 1 = aberta), controlado só pelo adulto. */
  progress: number;
  open: boolean;
  /** Contador de tremidas (toques da criança notados). */
  wiggle: number;
  childTaps: number;
  /** Criança pediu (nível de pedido) e aguarda validação do adulto. */
  requestPending: boolean;
  revealMode: RevealMode | null;
}
export const CLOSED: FlapState = { progress: 0, open: false, wiggle: 0, childTaps: 0, requestPending: false, revealMode: null };

export type FlapAction =
  | { type: 'child_tap'; requestMode: boolean }
  | { type: 'adult_drag'; progress: number }
  | { type: 'adult_release' }
  | { type: 'liberar' }
  | { type: 'validate_request' }
  | { type: 'hide' };
/** Efeitos que o jogo executa: `sound`/`reveal` só nascem de ações do adulto. */
export type FlapEffect = 'wiggle' | 'request' | 'reveal' | 'sound';

const clamp01 = (x: number) => Math.min(1, Math.max(0, Number.isFinite(x) ? x : 0));

function openFully(s: FlapState, mode: RevealMode): { state: FlapState; effects: FlapEffect[] } {
  const effects: FlapEffect[] = s.open ? [] : ['reveal', 'sound'];
  return { state: { ...s, progress: 1, open: true, requestPending: false, revealMode: s.revealMode ?? mode }, effects };
}

/** Redutor puro da aba. Toque da criança nunca abre nem toca som (só treme e, no nível de pedido, sinaliza o pedido). */
export function flapReduce(s: FlapState, a: FlapAction): { state: FlapState; effects: FlapEffect[] } {
  switch (a.type) {
    case 'child_tap': {
      const request = a.requestMode && !s.open;
      return {
        state: { ...s, wiggle: s.wiggle + 1, childTaps: s.childTaps + 1, requestPending: s.requestPending || request },
        effects: request ? ['wiggle', 'request'] : ['wiggle'],
      };
    }
    case 'adult_drag': {
      const p = clamp01(a.progress);
      if (p >= OPEN_AT && !s.open) return { state: { ...s, progress: p, open: true, requestPending: false, revealMode: s.revealMode ?? 'gradual' }, effects: ['reveal', 'sound'] };
      return { state: { ...s, progress: p, open: s.open && p >= SNAP_AT }, effects: [] };
    }
    case 'adult_release':
      if (s.progress >= SNAP_AT) return openFully(s, 'gradual');
      return { state: s, effects: [] };
    case 'liberar':
      return openFully(s, 'liberar');
    case 'validate_request':
      return s.requestPending ? openFully(s, 'pedido') : { state: s, effects: [] };
    case 'hide':
      return { state: { ...s, progress: 0, open: false }, effects: [] };
  }
}

/** Mola da dobra (stiffness 180, damping 20, massa 1): semi-implícito, dt limitado para estabilidade. */
export function springStep(x: number, v: number, target: number, dtSec: number, stiffness = 180, damping = 20): [number, number] {
  const dt = Math.min(1 / 30, Math.max(0, dtSec));
  const nv = v + (-stiffness * (x - target) - damping * v) * dt;
  return [x + nv * dt, nv];
}

/** Ângulo da dobra para o progresso (com limite para a sobra da mola). */
export const flapAngle = (progress: number) => Math.min(MAX_ANGLE + 6, Math.max(0, progress * MAX_ANGLE));

/* ------------------------------------------------------------------ elaboração */

export type Variation = 'acao' | 'som-trocado' | 'esconde' | 'musica';
export const VARIATIONS: readonly Variation[] = ['acao', 'som-trocado', 'esconde', 'musica'];
export const VARIATION_LABEL: Record<Variation, string> = {
  acao: 'Animal age', 'som-trocado': 'Som trocado', esconde: 'Some e aparece', musica: 'Música',
};
export const nextVariation = (count: number): Variation => VARIATIONS[((count % VARIATIONS.length) + VARIATIONS.length) % VARIATIONS.length]!;

/** Animal de som diferente para a troca brincalhona ("a vaca faz au au?"). */
export function swappedAnimal(id: AnimalId): Animal {
  const me = animalById(id)!;
  const i = ANIMAL_IDS.indexOf(id);
  for (let k = 1; k <= ANIMALS.length; k++) {
    const other = ANIMALS[(i + k * 3) % ANIMALS.length]!;
    if (other.sound !== me.sound) return other;
  }
  return ANIMALS[0]!;
}

export const whereIs = (a: Animal, baby = false) => (baby ? `Cadê o ${a.baby}?` : `Cadê ${a.article} ${a.name}?`);

/* ------------------------------------------------------------------ registro do episódio */

export type ResponseType = 'apontar-pedir' | 'apontar-mostrar' | 'seguir-apontar' | 'onomatopeia' | 'palavra' | 'nenhuma';
export const RESPONSE_TYPES: Array<{ id: ResponseType; label: string; hint: string }> = [
  { id: 'apontar-pedir', label: 'Apontou p/ pedir', hint: 'Protoimperativo' },
  { id: 'apontar-mostrar', label: 'Apontou p/ mostrar', hint: 'Protodeclarativo' },
  { id: 'seguir-apontar', label: 'Seguiu o apontar', hint: 'Olhou/tocou onde o adulto apontou' },
  { id: 'onomatopeia', label: 'Onomatopeia', hint: '"Muu", "au au"…' },
  { id: 'palavra', label: 'Palavra', hint: 'Nomeou, "abre", "de novo"' },
  { id: 'nenhuma', label: 'Sem resposta', hint: 'Seguimos a rotina' },
];

export const DEFAULT_HIERARCHY: PromptLevelRef[] = [
  { code: 'IND', label: 'Independente', intrusiveness: 0 },
  { code: 'GES', label: 'Gesto (mão apontando)', intrusiveness: 0.4 },
  { code: 'MOD', label: 'Modelo do adulto', intrusiveness: 0.7 },
];

export const FALLBACK_TARGET: TargetConfig = {
  targetId: 'leitura-compartilhada',
  name: 'Atenção conjunta na leitura compartilhada',
  phase: 'acquisition',
  repertoire: 'social',
  fieldSize: 1,
  stimulus: { stimulusId: 'livro-de-abas', label: 'Livro de abas', art: 'fazendinha-sonora' },
  distractors: [],
  promptHierarchy: DEFAULT_HIERARCHY,
  scoring: 'therapist',
};

const PREFERRED: Record<ResponseType, { echo: string[]; spont: string[] }> = {
  'apontar-pedir': { echo: ['mand', 'imitation', 'social'], spont: ['mand', 'social'] },
  'apontar-mostrar': { echo: ['social', 'imitation'], spont: ['social'] },
  'seguir-apontar': { echo: ['social', 'listener'], spont: ['social', 'listener'] },
  onomatopeia: { echo: ['echoic', 'imitation'], spont: ['tact', 'echoic'] },
  palavra: { echo: ['echoic'], spont: ['tact', 'mand'] },
  nenhuma: { echo: ['social'], spont: ['social'] },
};

/** Alvo clínico do episódio: o primeiro alvo cujo repertório combina com o tipo de resposta. */
export function targetForEpisode(targets: readonly TargetConfig[], type: ResponseType, echo: boolean): TargetConfig {
  if (!targets.length) return FALLBACK_TARGET;
  const pref = echo ? PREFERRED[type].echo : PREFERRED[type].spont;
  for (const r of pref) {
    const t = targets.find((x) => x.repertoire === r);
    if (t) return t;
  }
  return targets[0]!;
}

function nearest(h: PromptLevelRef[], want: number, fallback: string): string {
  const mids = h.filter((x) => x.intrusiveness > 0);
  if (!mids.length) return fallback;
  return mids.reduce((b, x) => (Math.abs(x.intrusiveness - want) < Math.abs(b.intrusiveness - want) ? x : b)).code;
}

export interface EpisodeInput {
  responseType: ResponseType;
  echoOfAdult: boolean;
  pointerHandUsed: boolean;
}
export interface EpisodeRecord { response: TrialResponse; promptLevel: string; promptSource: 'none' | 'therapist' }

/** Eco do adulto = modelo; mão desenhada = gesto; senão independente. "Sem resposta" nunca é erro. */
export function episodeRecord(e: EpisodeInput, hierarchy: PromptLevelRef[] = DEFAULT_HIERARCHY): EpisodeRecord {
  const ind = hierarchy.find((h) => h.intrusiveness === 0)?.code ?? 'IND';
  if (e.responseType === 'nenhuma') return { response: 'no_response', promptLevel: ind, promptSource: 'none' };
  if (e.echoOfAdult) return { response: 'correct', promptLevel: nearest(hierarchy, 0.7, 'MOD'), promptSource: 'therapist' };
  if (e.pointerHandUsed) return { response: 'correct', promptLevel: nearest(hierarchy, 0.4, 'GES'), promptSource: 'therapist' };
  return { response: 'correct', promptLevel: ind, promptSource: 'none' };
}

/* ------------------------------------------------------------------ parâmetros */

export type MotionLevel = 'static' | 'reduced' | 'normal';
export type Sensory = 'minimal' | 'normal' | 'rich';
/** Repouso (cena acalma) após 20 s sem interação; nenhuma página passa sozinha. */
export const REST_AFTER_MS = 20_000;

export interface Settings {
  sensory: Sensory;
  motion: MotionLevel | null;
  /** Onomatopeia falada após o som do animal. */
  voice: boolean;
  /** Nível de pedido: o toque da criança vira pedido que o adulto pode validar. */
  requestMode: boolean;
  books: Book[];
  bookErrors: string[];
}

const oneOf = <T extends string>(v: unknown, xs: readonly T[]): T | undefined => (xs.includes(v as T) ? (v as T) : undefined);

/**
 * Lê `config.params`:
 *   sensory ('minimal'|'normal'|'rich'), motion ('static'|'reduced'|'normal'), voice (bool),
 *   requestMode (bool), bookIds (ids dos livros oferecidos), books (livros JSON do supervisor).
 */
export function resolveSettings(config: Pick<SessionConfig, 'adaptation' | 'params'>): Settings {
  const prm = rec(config.params);
  const fb = config.adaptation.feedback;
  const custom: Book[] = [];
  const bookErrors: string[] = [];
  for (const raw of Array.isArray(prm.books) ? prm.books : []) {
    const v = validateBook(raw);
    if (v.book && !BASE_BOOKS.some((b) => b.id === v.book!.id) && !custom.some((b) => b.id === v.book!.id)) custom.push(v.book);
    else bookErrors.push(...(v.errors.length ? v.errors : ['id de livro repetido']));
  }
  const all = [...BASE_BOOKS, ...custom];
  const ids = Array.isArray(prm.bookIds) ? prm.bookIds.filter((x): x is string => typeof x === 'string') : [];
  const chosen = ids.length ? all.filter((b) => ids.includes(b.id)) : all;
  return {
    sensory: oneOf(prm.sensory, ['minimal', 'normal', 'rich'] as const) ?? (fb === 'none' ? 'minimal' : fb === 'festive' ? 'rich' : 'normal'),
    motion: oneOf(prm.motion, ['static', 'reduced', 'normal'] as const) ?? null,
    voice: prm.voice !== false,
    requestMode: prm.requestMode === true,
    books: chosen.length ? chosen : [...BASE_BOOKS],
    bookErrors,
  };
}

/** Movimento final: sensorial mínimo é estático; prefers-reduced-motion nunca é ignorado. */
export function resolveMotion(settings: Pick<Settings, 'sensory' | 'motion'>, sdk: 'full' | 'reduced' | 'static', systemReduced: boolean): MotionLevel {
  if (settings.sensory === 'minimal') return 'static';
  const m: MotionLevel = settings.motion ?? (sdk === 'full' ? 'normal' : sdk);
  return systemReduced && m === 'normal' ? 'reduced' : m;
}

/** Duração da virada de página por nível de movimento (0 = troca instantânea). */
export const TURN_MS: Record<MotionLevel, number> = { static: 0, reduced: 260, normal: 650 };
/** Amortecimento da mola por nível: reduzido = criticamente amortecido (sem sobra). */
export const SPRING_DAMPING: Record<MotionLevel, number> = { static: 0, reduced: 27, normal: 20 };
