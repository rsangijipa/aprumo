import { describe, expect, it } from 'vitest';
import { actions, childSpaceOf, findChildByCode, getState, stickerSlots, totalStars } from './store';

describe('espaço da criança', () => {
  it('encontra a criança pelo código, sem diferenciar maiúsculas nem hífen', () => {
    expect(findChildByCode('teo4821')?.child.preferredName).toBe('Teo');
    expect(findChildByCode('TEO-4821')?.case.id).toBe('case-teo');
    expect(findChildByCode('XYZ-0000')).toBeNull();
  });

  it('estrelas são de esforço: 3 ao concluir, 1 se tentou ao menos 30 s, 0 se saiu logo', () => {
    const id = 'ch-davi';
    const before = totalStars(childSpaceOf(id));
    expect(actions.recordPractice(id, 'encontre-o-igual', 90, true)).toBe(3);
    expect(actions.recordPractice(id, 'encontre-o-igual', 40, false)).toBe(1);
    expect(actions.recordPractice(id, 'encontre-o-igual', 5, false)).toBe(0);
    expect(totalStars(childSpaceOf(id))).toBe(before + 4);
  });

  it('figurinha é escolhida e limitada a uma a cada 5 estrelas (sem sorteio)', () => {
    const id = 'ch-lia';
    expect(() => actions.unlockSticker(id, 'flor')).toThrow(/mais estrelas/);
    actions.recordPractice(id, 'minha-vez-sua-vez', 60, true);
    actions.recordPractice(id, 'minha-vez-sua-vez', 60, true);
    expect(stickerSlots(childSpaceOf(id))).toBe(1);
    actions.unlockSticker(id, 'flor');
    expect(childSpaceOf(id).stickers).toEqual(['flor']);
    expect(() => actions.unlockSticker(id, 'uva')).toThrow();
  });

  it('caso novo recebe código único e só libera prancha e calma com consentimento do ambiente infantil', () => {
    const base = { fullName: 'Criança Teste', preferredName: 'Lua', birthDate: '2021-01-01', model: 'ABA' as const, guardianName: 'Resp Teste', guardianRelationship: 'mãe', implementerIds: [], interests: [], restrictions: [] };
    const a = actions.createCase({ ...base, consents: { childPortal: true, media: false, school: false, research: false } });
    const b = actions.createCase({ ...base, consents: { childPortal: false, media: false, school: false, research: false } });
    const ca = getState().cases.find((c) => c.id === a)!;
    const cb = getState().cases.find((c) => c.id === b)!;
    const codeA = getState().children.find((c) => c.id === ca.childId)!.accessCode;
    const codeB = getState().children.find((c) => c.id === cb.childId)!.accessCode;
    expect(codeA).toMatch(/^LUA-\d{4}$/);
    expect(codeA).not.toBe(codeB);
    expect(ca.releasedApps).toEqual(['prancha', 'calma']);
    expect(cb.releasedApps).toEqual([]);
    expect(ca.planStatus).toBe('draft');
    expect(() => actions.startSession(a)).toThrow(/aprovado/);
  });
});
