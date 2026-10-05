import { describe, expect, it } from 'vitest';
import { DEFAULT_ADAPTATION, GameManifest, type TargetConfig } from '@aprumo/protocol';
import {
  ANIMALS, ANIMAL_SONG, ANIMAL_SOUNDS, BASE_BOOKS, CLOSED, DEFAULT_HIERARCHY, FALLBACK_TARGET, OPEN_AT, REST_AFTER_MS,
  RESPONSE_TYPES, VARIATIONS, boxesOverlap, episodeRecord, flapAngle, flapBox, flapReduce, nextVariation, resolveMotion,
  resolveSettings, soundDuration, springStep, swappedAnimal, targetForEpisode, validateBook, whereIs, type FlapAction, type FlapState,
} from './logic';
import { manifest } from './manifest';

const cfg = (params: Record<string, unknown> = {}, feedback: 'none' | 'subtle' | 'festive' = 'subtle') => ({
  adaptation: { ...DEFAULT_ADAPTATION, feedback },
  params,
});

const run = (actions: FlapAction[], s: FlapState = CLOSED) => {
  const effects: string[] = [];
  for (const a of actions) {
    const r = flapReduce(s, a);
    s = r.state;
    effects.push(...r.effects);
  }
  return { state: s, effects };
};

describe('manifesto', () => {
  it('é válido, somente Denver, 12–48 meses e com adulto', () => {
    expect(GameManifest.safeParse(manifest).success).toBe(true);
    expect(manifest.appId).toBe('fazendinha-sonora');
    expect(manifest.clinical.models).toEqual({ ABA: 'not-indicated', DENVER: 'joint-routine' });
    expect(manifest.clinical.ageRangeMonths).toEqual([12, 48]);
    expect(manifest.clinical.requiresAdult).toBe(true);
  });
});

describe('livros base', () => {
  it('2 livros (Fazenda, Beira do Rio) com 8–12 páginas e 1–3 abas', () => {
    expect(BASE_BOOKS.map((b) => b.title)).toEqual(['Fazenda', 'Beira do Rio']);
    for (const b of BASE_BOOKS) {
      expect(b.pages.length).toBeGreaterThanOrEqual(8);
      expect(b.pages.length).toBeLessThanOrEqual(12);
      for (const p of b.pages) {
        expect(p.flaps.length).toBeGreaterThanOrEqual(1);
        expect(p.flaps.length).toBeLessThanOrEqual(3);
      }
      expect(b.pages.some((p) => p.kind === 'todos')).toBe(true);
      expect(b.pages.some((p) => p.kind === 'filhote')).toBe(true);
    }
  });
  it('passam na validação JSON e as abas não se sobrepõem nem saem do livro', () => {
    for (const b of BASE_BOOKS) {
      const v = validateBook(JSON.parse(JSON.stringify(b)));
      expect(v.errors).toEqual([]);
      expect(v.book).toEqual(b);
      for (const p of b.pages) {
        for (const fl of p.flaps) {
          const box = flapBox(fl);
          expect(box.x - box.w / 2).toBeGreaterThanOrEqual(0);
          expect(box.x + box.w / 2).toBeLessThanOrEqual(100);
          expect(box.y - box.h / 2).toBeGreaterThanOrEqual(0);
          expect(box.y + box.h / 2).toBeLessThanOrEqual(100);
        }
        for (let i = 0; i < p.flaps.length; i++)
          for (let j = i + 1; j < p.flaps.length; j++) expect(boxesOverlap(p.flaps[i]!, p.flaps[j]!)).toBe(false);
      }
    }
  });
  it('cobre os 10 animais regionais do roteiro', () => {
    const used = new Set(BASE_BOOKS.flatMap((b) => b.pages.flatMap((p) => p.flaps.map((x) => x.animal))));
    for (const a of ['boi', 'cavalo', 'galinha', 'pato', 'cachorro', 'gato', 'porco', 'arara', 'capivara', 'sapo']) expect(used.has(a as never)).toBe(true);
  });
});

describe('livro novo por JSON (supervisor)', () => {
  const novo = {
    id: 'livro-da-ana',
    title: 'Sítio da vovó',
    scene: 'rio',
    pages: [
      { id: 'p1', flaps: [{ id: 'a', hide: 'celeiro', animal: 'gato' }] },
      { id: 'p2', kind: 'filhote', flaps: [{ id: 'b', hide: 'lagoa', animal: 'pato', baby: true }, { id: 'c', hide: 'ipe', animal: 'arara' }] },
    ],
  };
  it('livro válido entra na escolha da abertura', () => {
    const v = validateBook(novo);
    expect(v.ok).toBe(true);
    expect(v.book!.pages[1]!.flaps[0]!.baby).toBe(true);
    const s = resolveSettings(cfg({ books: [novo] }));
    expect(s.books.map((b) => b.id)).toEqual(['fazenda', 'beira-do-rio', 'livro-da-ana']);
    expect(s.bookErrors).toEqual([]);
  });
  it('erros são descritos e o livro inválido é ignorado', () => {
    const v = validateBook({ id: 'X X', pages: [{ flaps: [] }, { flaps: [{ hide: 'nuvem', animal: 'dragao' }] }] });
    expect(v.ok).toBe(false);
    expect(v.errors.length).toBeGreaterThanOrEqual(4);
    const s = resolveSettings(cfg({ books: [{ id: 'ruim' }] }));
    expect(s.books).toHaveLength(2);
    expect(s.bookErrors.length).toBeGreaterThan(0);
  });
  it('abas sobrepostas são rejeitadas', () => {
    const v = validateBook({ id: 'sob', title: 'S', pages: [{ flaps: [{ id: 'a', hide: 'moita', animal: 'gato' }, { id: 'b', hide: 'moita', animal: 'pato' }] }] });
    expect(v.errors.some((e) => e.includes('sobrepostas'))).toBe(true);
  });
  it('bookIds restringe os livros oferecidos', () => {
    expect(resolveSettings(cfg({ bookIds: ['beira-do-rio'] })).books.map((b) => b.id)).toEqual(['beira-do-rio']);
    expect(resolveSettings(cfg({ bookIds: ['nao-existe'] })).books).toHaveLength(2);
  });
});

describe('regras invioláveis da aba', () => {
  it('toques da criança nunca tocam som nem abrem a aba (só tremem)', () => {
    const taps: FlapAction[] = Array.from({ length: 12 }, () => ({ type: 'child_tap', requestMode: false }));
    const r = run(taps);
    expect(r.state.open).toBe(false);
    expect(r.state.progress).toBe(0);
    expect(r.state.wiggle).toBe(12);
    expect(r.effects.every((e) => e === 'wiggle')).toBe(true);
  });
  it('com a aba aberta o toque da criança também não repete o som', () => {
    const r = run([{ type: 'liberar' }, { type: 'child_tap', requestMode: true }]);
    expect(r.effects.filter((e) => e === 'sound')).toHaveLength(1);
    expect(r.state.requestPending).toBe(false);
  });
  it('nível de pedido: o toque vira pedido, mas só abre após validação do adulto', () => {
    const r = run([{ type: 'child_tap', requestMode: true }, { type: 'child_tap', requestMode: true }]);
    expect(r.state.open).toBe(false);
    expect(r.state.requestPending).toBe(true);
    expect(r.effects).not.toContain('sound');
    const v = run([{ type: 'validate_request' }], r.state);
    expect(v.state.open).toBe(true);
    expect(v.state.revealMode).toBe('pedido');
    expect(v.effects).toEqual(['reveal', 'sound']);
  });
  it('validar sem pedido não faz nada', () => {
    expect(run([{ type: 'validate_request' }]).state).toEqual(CLOSED);
  });
});

describe('revelação gradual do adulto', () => {
  it('acompanha o arrasto e abre com som só ao passar do limiar', () => {
    const r = run([0.2, 0.5, 0.8].map((p) => ({ type: 'adult_drag', progress: p })));
    expect(r.state.progress).toBe(0.8);
    expect(r.state.open).toBe(false);
    expect(r.effects).toEqual([]);
    const o = run([{ type: 'adult_drag', progress: OPEN_AT }, { type: 'adult_drag', progress: 1 }], r.state);
    expect(o.state.open).toBe(true);
    expect(o.state.revealMode).toBe('gradual');
    expect(o.effects).toEqual(['reveal', 'sound']);
  });
  it('soltar perto do fim completa a abertura; soltar cedo mantém o suspense', () => {
    expect(run([{ type: 'adult_drag', progress: 0.85 }, { type: 'adult_release' }]).state.open).toBe(true);
    const early = run([{ type: 'adult_drag', progress: 0.4 }, { type: 'adult_release' }]);
    expect(early.state.open).toBe(false);
    expect(early.state.progress).toBe(0.4);
  });
  it('esconder fecha e uma nova revelação toca o som de novo', () => {
    const r = run([{ type: 'liberar' }, { type: 'hide' }, { type: 'liberar' }]);
    expect(r.effects.filter((e) => e === 'sound')).toHaveLength(2);
    expect(r.state.revealMode).toBe('liberar');
  });
  it('valores inválidos são limitados a 0–1', () => {
    expect(run([{ type: 'adult_drag', progress: 7 }]).state.progress).toBe(1);
    expect(run([{ type: 'adult_drag', progress: Number.NaN }]).state.progress).toBe(0);
  });
  it('mola (180/20) converge rápido com pouca sobra; cada passo é barato (< 16 ms por quadro)', () => {
    let x = 0, v = 0, max = 0;
    const t0 = performance.now();
    for (let i = 0; i < 90; i++) {
      [x, v] = springStep(x, v, 1, 1 / 60);
      max = Math.max(max, x);
    }
    expect(performance.now() - t0).toBeLessThan(16);
    expect(Math.abs(x - 1)).toBeLessThan(0.01);
    expect(max).toBeLessThan(1.1);
    // criticamente amortecida (reduzido) não passa do alvo
    x = 0; v = 0; max = 0;
    for (let i = 0; i < 120; i++) { [x, v] = springStep(x, v, 1, 1 / 60, 180, 27); max = Math.max(max, x); }
    expect(max).toBeLessThanOrEqual(1.0001);
  });
  it('ângulo da dobra é limitado', () => {
    expect(flapAngle(0)).toBe(0);
    expect(flapAngle(1)).toBeGreaterThan(150);
    expect(flapAngle(3)).toBeLessThanOrEqual(175);
  });
});

describe('sons e elaboração', () => {
  it('todo animal tem som suave (ganho ≤ 0,6) e curto (< 1,5 s) e uma onomatopeia', () => {
    for (const a of ANIMALS) {
      const tones = ANIMAL_SOUNDS[a.id];
      expect(tones.length).toBeGreaterThan(0);
      expect(tones.every((t) => (t.gain ?? 1) <= 0.6)).toBe(true);
      expect(soundDuration(tones)).toBeLessThan(1.5);
      expect(a.sound).toMatch(/!$/);
    }
    expect(soundDuration(ANIMAL_SONG)).toBeLessThan(6);
  });
  it('som trocado escolhe um animal com som diferente', () => {
    for (const a of ANIMALS) expect(swappedAnimal(a.id).sound).not.toBe(a.sound);
  });
  it('variações em ciclo e pergunta "cadê?"', () => {
    expect(VARIATIONS.map((_, i) => nextVariation(i))).toEqual([...VARIATIONS]);
    expect(nextVariation(4)).toBe('acao');
    expect(whereIs(ANIMALS[0]!)).toBe('Cadê a vaca?');
    expect(whereIs(ANIMALS[0]!, true)).toBe('Cadê o bezerrinho?');
  });
});

describe('registro do episódio', () => {
  it('tipos de resposta do roteiro + "sem resposta"', () => {
    expect(RESPONSE_TYPES.map((r) => r.id)).toEqual(['apontar-pedir', 'apontar-mostrar', 'seguir-apontar', 'onomatopeia', 'palavra', 'nenhuma']);
  });
  it('espontâneo = IND; mão desenhada = gesto; eco do adulto = modelo; sem resposta nunca é erro', () => {
    expect(episodeRecord({ responseType: 'apontar-mostrar', echoOfAdult: false, pointerHandUsed: false })).toEqual({ response: 'correct', promptLevel: 'IND', promptSource: 'none' });
    expect(episodeRecord({ responseType: 'seguir-apontar', echoOfAdult: false, pointerHandUsed: true }).promptLevel).toBe('GES');
    expect(episodeRecord({ responseType: 'onomatopeia', echoOfAdult: true, pointerHandUsed: true }).promptLevel).toBe('MOD');
    expect(episodeRecord({ responseType: 'nenhuma', echoOfAdult: true, pointerHandUsed: true })).toEqual({ response: 'no_response', promptLevel: 'IND', promptSource: 'none' });
  });
  it('usa a hierarquia do alvo quando informada', () => {
    const h = [{ code: 'I', label: 'I', intrusiveness: 0 }, { code: 'V', label: 'V', intrusiveness: 0.6 }];
    expect(episodeRecord({ responseType: 'palavra', echoOfAdult: true, pointerHandUsed: false }, h).promptLevel).toBe('V');
    expect(episodeRecord({ responseType: 'palavra', echoOfAdult: false, pointerHandUsed: false }, h).promptLevel).toBe('I');
    expect(DEFAULT_HIERARCHY[0]!.intrusiveness).toBe(0);
  });
  it('alvo do episódio segue o repertório', () => {
    const mk = (id: string, repertoire: TargetConfig['repertoire']): TargetConfig => ({ ...FALLBACK_TARGET, targetId: id, repertoire });
    const ts = [mk('soc', 'social'), mk('eco', 'echoic'), mk('mand', 'mand')];
    expect(targetForEpisode(ts, 'onomatopeia', true).targetId).toBe('eco');
    expect(targetForEpisode(ts, 'apontar-pedir', false).targetId).toBe('mand');
    expect(targetForEpisode(ts, 'apontar-mostrar', false).targetId).toBe('soc');
    expect(targetForEpisode([], 'palavra', false).targetId).toBe('leitura-compartilhada');
  });
});

describe('parâmetros e movimento', () => {
  it('perfil sensorial pelo feedback e parâmetros explícitos', () => {
    expect(resolveSettings(cfg({}, 'none')).sensory).toBe('minimal');
    expect(resolveSettings(cfg({}, 'festive')).sensory).toBe('rich');
    const s = resolveSettings(cfg({ sensory: 'normal', motion: 'static', voice: false, requestMode: true }));
    expect(s).toMatchObject({ sensory: 'normal', motion: 'static', voice: false, requestMode: true });
  });
  it('mínimo é estático e prefers-reduced-motion é respeitado', () => {
    expect(resolveMotion({ sensory: 'minimal', motion: 'normal' }, 'full', false)).toBe('static');
    expect(resolveMotion({ sensory: 'normal', motion: null }, 'full', true)).toBe('reduced');
    expect(resolveMotion({ sensory: 'rich', motion: null }, 'full', false)).toBe('normal');
    expect(resolveMotion({ sensory: 'normal', motion: null }, 'static', false)).toBe('static');
  });
  it('repouso após 20 s', () => {
    expect(REST_AFTER_MS).toBe(20000);
  });
});
