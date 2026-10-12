import type { PromptLevelRef, SessionConfig, TargetConfig, TrialResponse } from '@aprumo/protocol';

/* ------------------------------------------------------------------ catálogo */

export type CharacterId = 'urso' | 'boneca' | 'cachorro' | 'avo';
export type PlaceId = 'mesa' | 'cama' | 'banheira';
export type ZoneId = 'boca' | 'rosto' | 'corpo' | 'cabeca';
export type ActionId = 'comer' | 'beber' | 'limpar' | 'banho' | 'cobrir' | 'pentear';
export type Reaction = ActionId | 'ue';
export type ObjectId =
  | 'colher' | 'prato' | 'copo' | 'banana' | 'pao' | 'arroz-feijao' | 'acai' | 'melancia'
  | 'guardanapo' | 'cobertor' | 'escova' | 'esponja' | 'bloco';
export type NeedState = 'fome' | 'sede' | 'sono' | 'sujo';
export type CharState =
  | 'neutro' | NeedState | 'comendo' | 'bebendo' | 'limpando' | 'dormindo' | 'satisfeito' | 'surpresa' | 'ue' | 'esperando';
export type Phase = 'abertura' | 'tema' | 'elaboracao' | 'fechamento';
export type Location = 'tela' | 'brinquedo-real';

export const CHARACTERS: ReadonlyArray<{ id: CharacterId; label: string; article: 'o' | 'a' }> = [
  { id: 'urso', label: 'Urso', article: 'o' },
  { id: 'boneca', label: 'Boneca', article: 'a' },
  { id: 'cachorro', label: 'Cachorro', article: 'o' },
  { id: 'avo', label: 'Vovó', article: 'a' },
];
export const PLACES: ReadonlyArray<{ id: PlaceId; label: string }> = [
  { id: 'mesa', label: 'Mesa' },
  { id: 'cama', label: 'Cama' },
  { id: 'banheira', label: 'Banheira' },
];
export const ZONES: readonly ZoneId[] = ['boca', 'rosto', 'corpo', 'cabeca'];
export const ZONE_LABEL: Record<ZoneId, string> = { boca: 'Boca', rosto: 'Rosto', corpo: 'Corpo', cabeca: 'Cabeça' };

export const ACTIONS: ReadonlyArray<{ id: ActionId; label: string; verb: string }> = [
  { id: 'comer', label: 'Comer', verb: 'dar comida' },
  { id: 'beber', label: 'Beber', verb: 'dar água' },
  { id: 'limpar', label: 'Limpar a boca', verb: 'limpar a boca' },
  { id: 'banho', label: 'Banho', verb: 'dar banho' },
  { id: 'cobrir', label: 'Dormir', verb: 'pôr para dormir' },
  { id: 'pentear', label: 'Pentear', verb: 'pentear' },
];
export const ACTION_IDS = ACTIONS.map((a) => a.id);
export const isAction = (v: unknown): v is ActionId => ACTION_IDS.includes(v as ActionId);

export interface GameObject {
  id: ObjectId;
  label: string;
  kind: 'food' | 'utensil' | 'care' | 'neutral';
  /** Compatibilidade objeto → zona → ação (o que não está aqui gera a reação neutra "ué?"). */
  compat: Partial<Record<ZoneId, ActionId>>;
  /** Substituição simbólica: só vale com a variação "faz de conta" ativada pelo adulto. */
  pretend?: { zone: ZoneId; action: ActionId; as: ObjectId };
}

/** Banco de objetos e compatibilidades (dados puros, validados por `validateCatalog`). */
export const OBJECTS: readonly GameObject[] = [
  { id: 'colher', label: 'Colher', kind: 'utensil', compat: { boca: 'comer' } },
  { id: 'prato', label: 'Prato', kind: 'utensil', compat: { boca: 'comer' } },
  { id: 'copo', label: 'Copo', kind: 'utensil', compat: { boca: 'beber' } },
  { id: 'banana', label: 'Banana', kind: 'food', compat: { boca: 'comer' } },
  { id: 'pao', label: 'Pão', kind: 'food', compat: { boca: 'comer' } },
  { id: 'arroz-feijao', label: 'Arroz e feijão', kind: 'food', compat: { boca: 'comer' } },
  { id: 'acai', label: 'Açaí', kind: 'food', compat: { boca: 'comer' } },
  { id: 'melancia', label: 'Melancia', kind: 'food', compat: { boca: 'comer' } },
  { id: 'guardanapo', label: 'Guardanapo', kind: 'care', compat: { boca: 'limpar', rosto: 'limpar' } },
  { id: 'cobertor', label: 'Cobertor', kind: 'care', compat: { corpo: 'cobrir' } },
  { id: 'escova', label: 'Escova de cabelo', kind: 'care', compat: { cabeca: 'pentear' } },
  { id: 'esponja', label: 'Esponja', kind: 'care', compat: { corpo: 'banho', rosto: 'banho', cabeca: 'banho' } },
  { id: 'bloco', label: 'Bloco', kind: 'neutral', compat: {}, pretend: { zone: 'boca', action: 'comer', as: 'pao' } },
];
export const OBJECT_IDS = OBJECTS.map((o) => o.id);
export const objectById = (id: string) => OBJECTS.find((o) => o.id === id);

/** Erros de consistência do catálogo (vazio = válido). */
export function validateCatalog(objs: readonly GameObject[] = OBJECTS): string[] {
  const errs: string[] = [];
  const seen = new Set<string>();
  for (const o of objs) {
    if (seen.has(o.id)) errs.push(`id duplicado: ${o.id}`);
    seen.add(o.id);
    for (const [z, a] of Object.entries(o.compat)) {
      if (!ZONES.includes(z as ZoneId)) errs.push(`${o.id}: zona inválida ${z}`);
      if (!isAction(a)) errs.push(`${o.id}: ação inválida ${String(a)}`);
    }
    if (o.pretend) {
      if (!ZONES.includes(o.pretend.zone) || !isAction(o.pretend.action)) errs.push(`${o.id}: substituição inválida`);
      if (!objs.some((x) => x.id === o.pretend!.as)) errs.push(`${o.id}: substitui objeto inexistente`);
    }
  }
  return errs;
}

export interface ActionResult {
  reaction: Reaction;
  action: ActionId | null;
  /** Ação convencional (objeto compatível na zona compatível, inclusive por substituição). */
  conventional: boolean;
  substitution: boolean;
}

/** Toda combinação objeto–zona tem reação: a compatível, a substituição (com "faz de conta") ou "ué?". */
export function resolveAction(objectId: ObjectId, zone: ZoneId, pretend: boolean): ActionResult {
  const o = objectById(objectId);
  const direct = o?.compat[zone];
  if (direct) return { reaction: direct, action: direct, conventional: true, substitution: false };
  if (pretend && o?.pretend && o.pretend.zone === zone) {
    return { reaction: o.pretend.action, action: o.pretend.action, conventional: true, substitution: true };
  }
  return { reaction: 'ue', action: null, conventional: false, substitution: false };
}

/* ------------------------------------------------------------------ zonas (viewBox da cena 400×400) */

export interface Pt { x: number; y: number }
export const SCENE = 400;
/** Centro e raio de snap: boca 80 e corpo 100 (spec §7); rosto/cabeça menores. */
export const ZONE_GEOMETRY: Record<ZoneId, Pt & { r: number }> = {
  cabeca: { x: 200, y: 70, r: 62 },
  rosto: { x: 200, y: 128, r: 58 },
  boca: { x: 200, y: 168, r: 80 },
  corpo: { x: 200, y: 282, r: 100 },
};

/** Zona sob o ponto: a de centro mais próximo entre as que estão no raio de snap. */
export function zoneAt(p: Pt): ZoneId | null {
  let best: ZoneId | null = null;
  let bestD = Infinity;
  for (const z of ZONES) {
    const g = ZONE_GEOMETRY[z];
    const d = Math.hypot(p.x - g.x, p.y - g.y);
    if (d <= g.r && d < bestD) { best = z; bestD = d; }
  }
  return best;
}

/* ------------------------------------------------------------------ máquina de estados do personagem */

export const NEED_FOR: Record<ActionId, NeedState | null> = {
  comer: 'fome', beber: 'sede', limpar: 'sujo', banho: 'sujo', cobrir: 'sono', pentear: null,
};
const ACTIVE_FOR: Record<Reaction, CharState> = {
  comer: 'comendo', beber: 'bebendo', limpar: 'limpando', banho: 'limpando', cobrir: 'dormindo', pentear: 'satisfeito', ue: 'ue',
};

export interface CharModel { state: CharState; need: NeedState | null; covered: boolean }
export const INITIAL_CHAR: CharModel = { state: 'neutro', need: null, covered: false };

export interface Transition {
  /** Estado durante a reação (animação). */
  active: CharState;
  /** Estado em que o personagem repousa depois. */
  after: CharModel;
  satisfied: NeedState | null;
}

/** Reação previsível do personagem a uma ação; o "ué?" nunca remove a necessidade (sem punição). */
export function react(model: CharModel, reaction: Reaction): Transition {
  const active = ACTIVE_FOR[reaction];
  if (reaction === 'ue') {
    return { active, after: { ...model, state: model.covered ? 'dormindo' : model.need ?? 'neutro' }, satisfied: null };
  }
  const need = NEED_FOR[reaction];
  const satisfied = need && model.need === need ? need : null;
  const rest = satisfied ? null : model.need;
  if (reaction === 'cobrir') return { active, after: { state: 'dormindo', need: rest === 'sono' ? null : rest, covered: true }, satisfied };
  // Qualquer outra ação acorda e descobre o personagem.
  return { active, after: { state: rest ?? 'satisfeito', need: rest, covered: false }, satisfied };
}

/** O adulto dispara um estado (o personagem nunca pede sozinho). */
export function triggerNeed(model: CharModel, need: NeedState): CharModel {
  return { state: need, need, covered: need === 'sono' ? model.covered : false };
}

/** Repouso (20 s sem interação): reações passageiras terminam; necessidade disparada pelo adulto fica. */
export function settle(model: CharModel): CharModel {
  return { ...model, state: model.covered ? 'dormindo' : model.need ?? 'neutro' };
}

export const REST_AFTER_MS = 20000;

/* ------------------------------------------------------------------ sequência e fases */

export interface ChainStep { action: ActionId; at: number }

/** Sequência de ações convencionais diferentes em menos de 20 s entre si (repetir não alonga). */
export function extendChain(chain: readonly ChainStep[], action: ActionId, now: number, gapMs = REST_AFTER_MS): ChainStep[] {
  const last = chain[chain.length - 1];
  const fresh = last && now - last.at <= gapMs ? [...chain] : [];
  const prev = fresh[fresh.length - 1];
  if (prev && prev.action === action) { fresh[fresh.length - 1] = { action, at: now }; return fresh; }
  fresh.push({ action, at: now });
  return fresh;
}

/** Tema = lanche; qualquer outra ação ou variação leva à elaboração (uma variação por vez). */
export function nextPhase(phase: Phase, ev: { action?: ActionId | null; variation?: boolean }): Phase {
  if (phase !== 'tema') return phase;
  if (ev.variation) return 'elaboracao';
  if (ev.action && ev.action !== 'comer') return 'elaboracao';
  return phase;
}

/* ------------------------------------------------------------------ física mínima (copo derrubado) */

export interface Body1D { y: number; vy: number; resting: boolean }
/** Gravidade própria com quique amortecido até repousar no chão. */
export function stepFall(b: Body1D, dtMs: number, floor: number, g = 0.0022, bounce = 0.35): Body1D {
  if (b.resting) return b;
  const dt = Math.min(dtMs, 40);
  let vy = b.vy + g * dt;
  let y = b.y + vy * dt;
  if (y >= floor) {
    y = floor;
    vy = -vy * bounce;
    if (Math.abs(vy) < 0.05) return { y, vy: 0, resting: true };
  }
  return { y, vy, resting: false };
}

/* ------------------------------------------------------------------ registro do adulto */

export type Help = 'independent' | 'helped' | 'none';
export const HELPS: Array<{ id: Help; label: string }> = [
  { id: 'independent', label: 'Sozinha' },
  { id: 'helped', label: 'Com ajuda' },
  { id: 'none', label: 'Não fez' },
];

export const DEFAULT_HIERARCHY: PromptLevelRef[] = [
  { code: 'IND', label: 'Independente', intrusiveness: 0 },
  { code: 'MOD', label: 'Modelo', intrusiveness: 0.5 },
  { code: 'FP', label: 'Física total', intrusiveness: 1 },
];

export interface HelpRecord { response: TrialResponse; promptLevel: string; promptSource: 'none' | 'therapist' }
export function helpToRecord(help: Help, hierarchy: PromptLevelRef[] = DEFAULT_HIERARCHY): HelpRecord {
  const ind = hierarchy.find((h) => h.intrusiveness === 0)?.code ?? 'IND';
  if (help === 'independent') return { response: 'correct', promptLevel: ind, promptSource: 'none' };
  if (help === 'none') return { response: 'no_response', promptLevel: ind, promptSource: 'none' };
  const prompted = hierarchy.filter((h) => h.intrusiveness > 0).sort((a, b) => a.intrusiveness - b.intrusiveness);
  return { response: 'correct', promptLevel: prompted[0]?.code ?? 'MOD', promptSource: 'therapist' };
}

/* ------------------------------------------------------------------ parâmetros */

export type MotionLevel = 'static' | 'reduced' | 'normal';
export type Sensory = 'minimal' | 'normal' | 'rich';
export type Mode = 'free' | 'mission';

export interface Settings {
  mode: Mode;
  sensory: Sensory;
  motion: MotionLevel | null;
  /** Voz gravada/sintetizada do personagem; o adulto pode desligar e dar voz ele mesmo. */
  voice: boolean;
  character: CharacterId | null;
  place: PlaceId | null;
  items: ObjectId[];
  missions: ActionId[];
}

const oneOf = <T extends string>(v: unknown, xs: readonly T[]): T | undefined => (xs.includes(v as T) ? (v as T) : undefined);
const rec = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const strs = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

export const DEFAULT_ROUTINE: ActionId[] = ['comer', 'beber', 'limpar', 'cobrir'];

/**
 * Lê `config.params`:
 *   mode ('free'|'mission'), sensory, motion, voice (bool), character, place,
 *   items (ids de objetos), missions (ids de ações), targets: { [targetId]: { missions?: string[] } }.
 * A substituição simbólica NÃO é parâmetro: só o adulto a ativa durante a sessão.
 */
export function resolveSettings(config: SessionConfig): Settings {
  const prm = rec(config.params);
  const fb = config.adaptation.feedback;
  const items = strs(prm.items).filter((id): id is ObjectId => !!objectById(id));
  const missions = strs(prm.missions).filter(isAction);
  return {
    mode: oneOf(prm.mode, ['free', 'mission'] as const) ?? 'free',
    sensory: oneOf(prm.sensory, ['minimal', 'normal', 'rich'] as const) ?? (fb === 'none' ? 'minimal' : fb === 'festive' ? 'rich' : 'normal'),
    motion: oneOf(prm.motion, ['static', 'reduced', 'normal'] as const) ?? null,
    voice: prm.voice !== false,
    character: oneOf(prm.character, CHARACTERS.map((c) => c.id)) ?? null,
    place: oneOf(prm.place, PLACES.map((p) => p.id)) ?? null,
    items: items.length ? items : [...OBJECT_IDS],
    missions: missions.length ? missions : [...DEFAULT_ROUTINE],
  };
}

/** Sensorial mínimo é estático; prefers-reduced-motion nunca é ignorado. */
export function resolveMotion(s: Pick<Settings, 'sensory' | 'motion'>, sdk: 'full' | 'reduced' | 'static', systemReduced: boolean): MotionLevel {
  if (s.sensory === 'minimal') return 'static';
  const m: MotionLevel = s.motion ?? (sdk === 'full' ? 'normal' : sdk);
  return systemReduced && m === 'normal' ? 'reduced' : m;
}

/* ------------------------------------------------------------------ plano (modo missão) */

export const FALLBACK_TARGET: TargetConfig = {
  targetId: 'brincar-faz-de-conta',
  name: 'Brincar de faz de conta',
  phase: 'acquisition',
  repertoire: 'play',
  fieldSize: 1,
  stimulus: { stimulusId: 'hora-do-lanche', label: 'Hora do lanche', art: 'lanche-do-urso' },
  distractors: [],
  promptHierarchy: DEFAULT_HIERARCHY,
  scoring: 'auto',
};

export function missionsForTarget(target: TargetConfig, config: SessionConfig, fallback: ActionId[]): ActionId[] {
  const own = strs(rec(rec(rec(config.params).targets)[target.targetId]).missions).filter(isAction);
  if (own.length) return own;
  const hay = [target.stimulus.art, target.stimulus.stimulusId, target.targetId, target.name].join(' ').toLowerCase();
  const hit = ACTION_IDS.filter((id) => hay.includes(id));
  return hit.length ? hit : fallback;
}

export interface PlannedTrial { trialIndex: number; target: TargetConfig; request: ActionId }

/** Pedidos em ordem de rotina (comer → beber → limpar → dormir), ciclando por alvo. */
export function planMissions(config: SessionConfig, settings: Settings): PlannedTrial[] {
  const targets = config.clinical.targets.length ? config.clinical.targets : [FALLBACK_TARGET];
  const per = config.clinical.trialsPerTarget;
  const order: Array<{ t: TargetConfig; k: number }> = [];
  if (config.clinical.interleave) for (let k = 0; k < per; k++) for (const t of targets) order.push({ t, k });
  else for (const t of targets) for (let k = 0; k < per; k++) order.push({ t, k });
  const pools = new Map(targets.map((t) => [t.targetId, missionsForTarget(t, config, settings.missions)]));
  return order.map(({ t, k }, trialIndex) => {
    const pool = pools.get(t.targetId)!;
    return { trialIndex, target: t, request: pool[k % pool.length]! };
  });
}

/** Limpar a boca e dar banho atendem ao mesmo pedido de "sujo". */
export function satisfiesRequest(request: ActionId, action: ActionId | null): boolean {
  if (!action) return false;
  if (action === request) return true;
  const clean: ActionId[] = ['limpar', 'banho'];
  return clean.includes(request) && clean.includes(action);
}

/* ------------------------------------------------------------------ falas */

export const charName = (c: CharacterId) => CHARACTERS.find((x) => x.id === c)!;
export function subject(c: CharacterId): string {
  const x = charName(c);
  return `${x.article === 'a' ? 'A' : 'O'} ${x.label.toLowerCase()}`;
}
const NEED_LINE: Record<NeedState, string> = {
  fome: 'está com fome', sede: 'está com sede', sono: 'está com sono', sujo: 'está sujinho',
};
export const needLine = (c: CharacterId, n: NeedState) => `${subject(c)} ${NEED_LINE[n]}!`;
export function requestLine(c: CharacterId, a: ActionId): string {
  const n = NEED_FOR[a];
  return n ? needLine(c, n) : `${subject(c)} quer pentear o cabelo!`;
}
/** Fala do personagem (ou sons associados) para cada reação. */
export const REACTION_LINE: Record<Reaction, string> = {
  comer: 'Nham nham!', beber: 'Glu glu!', limpar: 'Limpinho!', banho: 'Esfrega, esfrega!', cobrir: 'Shhh… boa noite.', pentear: 'Que cabelo bonito!', ue: 'Ué?',
};

/* ------------------------------------------------------------------ resumo para o painel */

export interface Episode { action: ActionId | null; substitution: boolean; location: Location; sequenceLength: number; conventional: boolean }
export interface Summary { episodes: number; diversity: number; meanSequence: number; substitutions: number; realToyRatio: number }

export function summarize(eps: readonly Episode[]): Summary {
  const conv = eps.filter((e) => e.conventional && e.action);
  const diversity = new Set(conv.map((e) => e.action)).size;
  const meanSequence = conv.length ? Math.round((conv.reduce((s, e) => s + e.sequenceLength, 0) / conv.length) * 10) / 10 : 0;
  const real = eps.filter((e) => e.location === 'brinquedo-real').length;
  return {
    episodes: eps.length,
    diversity,
    meanSequence,
    substitutions: eps.filter((e) => e.substitution).length,
    realToyRatio: eps.length ? Math.round((real / eps.length) * 100) / 100 : 0,
  };
}

/** Canção de ninar de domínio público ("Brilha, brilha, estrelinha"), primeira frase, timbre suave. */
export const LULLABY_NOTES = [262, 262, 392, 392, 440, 440, 392] as const;
