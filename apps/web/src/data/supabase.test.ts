import { describe, expect, it } from 'vitest';
import { isPermanent } from './supabase';

describe('isPermanent', () => {
  it('erros de dado, integridade e regra do banco não se resolvem reenviando', () => {
    for (const c of ['22P02', '23505', 'P0001']) expect(isPermanent(c)).toBe(true);
  });
  it('rede, sessão expirada e permissão ficam na fila', () => {
    for (const c of [undefined, '', 'PGRST301', '42501', '08006']) expect(isPermanent(c)).toBe(false);
  });
});
